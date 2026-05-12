export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "허용되지 않은 메서드입니다. POST 요청만 가능합니다."
    });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GROQ_API_KEY가 Vercel 환경 변수에 설정되지 않았습니다."
      });
    }

    const {
      topic = "",
      details = "",
      mustInclude = "",
      outputLanguage = "ko",
      outputFormat = "step",
      outputLength = "medium",
      tone = "friendly",
      audienceLevel = "general",
      purpose = "learning"
    } = req.body || {};

    const normalizedTopic = String(topic).trim();
    const normalizedDetails = String(details).trim();
    const normalizedMustInclude = String(mustInclude).trim();

    if (!normalizedTopic) {
      return res.status(400).json({
        error: "주제(topic)는 반드시 필요합니다."
      });
    }

    const languageInstruction =
      outputLanguage === "en"
        ? [
            "Write the final prompt in English only.",
            "Do not include Korean.",
            "Return only one final prompt body that can be pasted directly into another AI."
          ].join(" ")
        : [
            "최종 프롬프트는 반드시 자연스러운 현대 한국어로만 작성하세요.",
            "불필요한 영어 혼용, 깨진 문자, 한자, 메타 설명을 포함하지 마세요.",
            "영문 고유명사나 기술 용어가 꼭 필요할 때만 제한적으로 사용하세요.",
            "출력은 설명문이 아니라 다른 AI에 그대로 붙여넣을 최종 프롬프트 본문이어야 합니다."
          ].join(" ");

    const formatInstructionMap = {
      explain: "다른 AI가 설명형 결과를 내도록 유도하는 프롬프트로 설계하세요.",
      bullet: "다른 AI가 핵심을 불릿 요약 형식으로 정리하도록 유도하세요.",
      step: "다른 AI가 단계별 가이드 형식으로 구조화해서 답하도록 유도하세요.",
      table: "다른 AI가 비교 가능하고 읽기 쉬운 표 형식으로 정리하도록 유도하세요."
    };

    const lengthInstructionMap = {
      short: "결과는 짧고 밀도 높게 나오도록 요구하세요.",
      medium: "결과는 핵심과 설명의 균형이 맞도록 요구하세요.",
      long: "결과는 충분히 자세하고 구체적이며 실행 가능하게 나오도록 요구하세요."
    };

    const toneInstructionMap = {
      neutral: "결과 말투는 중립적이고 명확하게 유도하세요.",
      friendly: "결과 말투는 친절하고 이해하기 쉽게 유도하세요.",
      professional: "결과 말투는 전문적이고 신뢰감 있게 유도하세요.",
      persuasive: "결과 말투는 설득력 있고 강조점이 살아나도록 유도하세요."
    };

    const audienceInstructionMap = {
      general: "대상 독자는 일반인 수준으로 설정하세요.",
      student: "대상 독자는 중고등학생 수준으로 설정하세요.",
      college: "대상 독자는 대학생 수준으로 설정하세요.",
      expert: "대상 독자는 실무자 또는 전문가 수준으로 설정하세요."
    };

    const purposeInstructionMap = {
      learning: "사용 목적은 개념 이해와 학습 효율 향상입니다.",
      blog: "사용 목적은 블로그나 콘텐츠 초안 작성입니다.",
      presentation: "사용 목적은 발표 자료용 정리와 전달력 강화입니다.",
      work: "사용 목적은 실무 문서, 업무 정리, 의사결정 지원입니다.",
      sns: "사용 목적은 짧고 임팩트 있는 SNS용 결과 생성입니다."
    };

    const outputFormatGuideMap = {
      explain: "필요하면 정의, 배경, 핵심 포인트, 예시 순으로 자연스럽게 정리하도록 유도하세요.",
      bullet: "항목 간 중복을 줄이고, 한 줄 요약과 핵심 포인트 중심으로 정리하도록 유도하세요.",
      step: "단계 간 순서가 자연스럽고 실제 실행 흐름이 이어지도록 유도하세요.",
      table: "표의 열 제목이 명확하고 비교 기준이 한눈에 보이도록 유도하세요."
    };

    const qualityRules = [
      "모호한 표현 대신 구체적 요청으로 바꾸세요.",
      "사용자 입력 의도를 해치지 않는 범위에서 부족한 문맥을 자연스럽게 보완하세요.",
      "최종 프롬프트 안에는 목표, 대상 독자, 원하는 결과 형식, 분량, 말투, 반드시 포함할 요소가 유기적으로 녹아 있어야 합니다.",
      "필요하면 다른 AI가 더 좋은 답을 하도록 구체적인 평가 기준, 구성 기준, 포함 범위, 제외 범위를 넣으세요.",
      "과도하게 장황하지 않되, 실제 성능이 좋아지는 디테일은 남기세요.",
      "사용자가 입력한 표현을 단순 반복하지 말고, 더 정확하고 고품질의 지시문으로 재구성하세요.",
      "최종 프롬프트는 바로 복사해 다른 AI에 넣을 수 있을 정도로 완성도가 높아야 합니다."
    ];

    const bannedRules = [
      "절대로 '다음은 프롬프트입니다', '아래와 같이', '설명해드리겠습니다' 같은 메타 문구를 쓰지 마세요.",
      "절대로 사용자의 주제에 대해 직접 설명하지 마세요.",
      "절대로 요약문, 해설문, 안내문, 배경설명 형태로 쓰지 마세요.",
      "따옴표로 전체를 감싸지 마세요.",
      "코드블록을 사용하지 마세요.",
      "번호를 붙여 프롬프트 외 설명을 추가하지 마세요.",
      "결과물 바깥에서 해설하거나 자기평가하지 마세요."
    ];

    const inferredEnhancementRules = [
      "주제가 교육 또는 학습형이면 쉬운 설명, 예시, 오개념 방지 포인트, 단계적 이해 흐름을 우선 고려하세요.",
      "주제가 글쓰기 또는 콘텐츠형이면 독자 흥미, 구조, 가독성, 표현 밀도를 고려하세요.",
      "주제가 업무 또는 실무형이면 실행 가능성, 비교 기준, 의사결정 포인트, 리스크와 주의사항을 고려하세요.",
      "주제가 SNS 또는 마케팅형이면 후킹, 간결성, 전달력, 차별화 포인트를 고려하세요."
    ];

    const userRequestBlock = [
      "[사용자 입력]",
      `- 주제: ${normalizedTopic}`,
      `- 추가 설명: ${normalizedDetails || "(없음)"}`,
      `- 반드시 포함할 요소: ${normalizedMustInclude || "(없음)"}`,
      "",
      "[출력 옵션]",
      `- 출력 언어: ${outputLanguage}`,
      `- 결과 형식: ${outputFormat}`,
      `- 길이: ${outputLength}`,
      `- 말투: ${tone}`,
      `- 대상 수준: ${audienceLevel}`,
      `- 목적: ${purpose}`
    ].join("\n");

    const systemPrompt = [
      "당신은 사용자의 요구를 분석해 다른 생성형 AI의 성능을 최대한 끌어올리는 고급 프롬프트 엔지니어입니다.",
      "당신의 임무는 답변 자체를 작성하는 것이 아니라, 다른 AI가 작업을 수행하도록 지시하는 최종 입력 프롬프트를 설계하는 것입니다.",
      "당신이 출력해야 하는 것은 오직 다른 AI에게 내리는 작업 지시문입니다.",
      "절대로 사용자의 주제에 대해 직접 설명하지 마세요.",
      "절대로 요약문, 해설문, 안내문, 서론, 배경설명 형태로 쓰지 마세요.",
      "최종 결과는 반드시 명령형 또는 요청형 표현으로 작성하세요.",
      "예: '설명해줘', '정리해줘', '표로 작성해줘', '단계별로 안내해줘' 같은 형식만 허용됩니다.",
      "평서형 설명문이나 주제 자체를 풀이하는 문장은 허용되지 않습니다.",
      "좋은 최종 프롬프트는 목표, 대상 독자, 출력 형식, 길이, 말투, 포함 요소, 품질 기준이 자연스럽게 포함된 완성형 지시문이어야 합니다.",
      "사용자의 입력 의도와 옵션은 유지하되, 더 좋은 결과가 나오도록 문장을 정교하게 재구성하세요.",
      languageInstruction,
      formatInstructionMap[outputFormat] || formatInstructionMap.step,
      lengthInstructionMap[outputLength] || lengthInstructionMap.medium,
      toneInstructionMap[tone] || toneInstructionMap.friendly,
      audienceInstructionMap[audienceLevel] || audienceInstructionMap.general,
      purposeInstructionMap[purpose] || purposeInstructionMap.learning,
      outputFormatGuideMap[outputFormat] || outputFormatGuideMap.step,
      ...qualityRules,
      ...bannedRules,
      ...inferredEnhancementRules,
      "출력은 오직 최종 프롬프트 본문만 허용됩니다.",
      "출력 전에 스스로 검토하세요. 1) 설명문이 아닌가? 2) 다른 AI에게 지시하는 문장인가? 3) 바로 복사해서 붙여넣을 수 있는가?"
    ].join(" ");

    const userPrompt = [
      "아래 정보를 바탕으로, 다른 AI에 그대로 붙여넣어 사용할 수 있는 단일 최종 프롬프트를 작성하세요.",
      "중요: 주제에 대해 직접 설명하지 말고, 반드시 다른 AI에게 작업을 지시하는 문장으로만 작성하세요.",
      "결과는 해설문이 아니라 명령문이어야 합니다.",
      "반드시 다른 AI가 실제로 수행해야 할 작업을 요청하는 형태로 작성하세요.",
      "출력은 한 개의 완성된 최종 프롬프트 본문만 반환하세요.",
      "잘못된 예: '뉴턴의 운동법칙은 물체의 운동을 설명하는 법칙입니다.'",
      "올바른 예: '중학생이 이해할 수 있도록 뉴턴의 운동법칙을 쉬운 비유와 일상 예시 2개를 포함해 단계별로 설명해줘.'",
      "잘못된 예: 'React와 Vite의 차이에 대한 설명입니다.'",
      "올바른 예: '초보 개발자가 이해할 수 있도록 React와 Vite의 차이를 표와 예시를 포함해 설명해줘.'",
      "사용자 의도는 유지하되, 더 고품질 결과가 나오도록 구성 방식, 포함 관점, 설명 깊이, 형식 조건을 자연스럽게 보강하세요.",
      "단, 사용자 요청 범위를 넘는 과도한 추측은 하지 마세요.",
      "",
      userRequestBlock
    ].join("\n");

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.35,
        top_p: 0.9,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const groqText = await groqResponse.text();

    let groqData;
    try {
      groqData = groqText ? JSON.parse(groqText) : null;
    } catch (parseError) {
      console.error("Groq 응답 JSON 파싱 실패:", groqText);
      return res.status(502).json({
        error: "Groq 응답을 해석하지 못했습니다."
      });
    }

    if (!groqResponse.ok) {
      console.error("Groq API 오류:", groqData);
      return res.status(groqResponse.status).json({
        error: groqData?.error?.message || "Groq API 호출에 실패했습니다."
      });
    }

    let result = groqData?.choices?.[0]?.message?.content?.trim() || "";

    result = result
      .replace(/^```[\w-]*\n?/g, "")
      .replace(/```$/g, "")
      .replace(/^["']|["']$/g, "")
      .trim();

    if (outputLanguage === "ko") {
      result = result
        .replace(/\p{Script=Han}+/gu, "")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\s+\n/g, "\n")
        .replace(/\n\s+/g, "\n")
        .trim();
    }

    const looksLikeExplanationInKorean =
      outputLanguage === "ko" &&
      /^(이|해당|위|아래)?\s*주제는|^(이것은|이는|다음은)|설명입니다\.?$|의미합니다\.?$|에 대한 설명/.test(result);

    const looksLikeExplanationInEnglish =
      outputLanguage === "en" &&
      /^(This|It|The topic|Below is|Here is)\b/i.test(result);

    if (looksLikeExplanationInKorean || looksLikeExplanationInEnglish) {
      const rebuiltPrompt =
        outputLanguage === "en"
          ? `Please write about "${normalizedTopic}" according to the following conditions. Respond as an instruction prompt for another AI, not as an explanation.\n\n${result}`
          : `${audienceLevel === "student" ? "초보자도 이해할 수 있도록 " : ""}${normalizedTopic}에 대해 아래 조건을 반영해 작성해줘.\n${normalizedDetails ? `추가 맥락: ${normalizedDetails}\n` : ""}${normalizedMustInclude ? `반드시 포함할 요소: ${normalizedMustInclude}\n` : ""}결과는 설명문이 아니라, 구조화된 ${outputFormat === "table" ? "표 형식" : outputFormat === "bullet" ? "불릿 형식" : outputFormat === "step" ? "단계별 형식" : "설명형"}의 답변으로 제공해줘.`;

      result = rebuiltPrompt.trim();
    }

    if (!result) {
      return res.status(502).json({
        error: "프롬프트 생성 결과가 비어 있습니다."
      });
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.error("api/generate 서버 오류:", error);

    return res.status(500).json({
      error: error?.message || "서버에서 프롬프트 생성 중 오류가 발생했습니다."
    });
  }
}