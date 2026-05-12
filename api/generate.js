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
            "Write the final output prompt in English only.",
            "Do not include Korean.",
            "Return only the final prompt text that will be pasted into another AI."
          ].join(" ")
        : [
            "최종 결과 프롬프트는 반드시 자연스러운 현대 한국어로만 작성하세요.",
            "한자, 일본식 한자어 표기, 중국어 문자, 깨진 문자, 특수 인코딩 흔적을 절대 포함하지 마세요.",
            "영문 고유명사나 불가피한 기술 용어를 제외하고는 한글 중심으로 작성하세요.",
            "출력물은 설명문이 아니라 다른 AI에 그대로 붙여넣을 최종 프롬프트여야 합니다.",
            "머리말, 해설, 주석, 따옴표, 코드블록 없이 최종 프롬프트 본문만 반환하세요."
          ].join(" ");

    const formatInstructionMap = {
      explain: "다른 AI가 설명형 결과를 내도록 유도하는 프롬프트로 작성하세요.",
      bullet: "다른 AI가 불릿 요약 형식으로 답하도록 유도하는 프롬프트로 작성하세요.",
      step: "다른 AI가 단계별 가이드 형식으로 답하도록 유도하는 프롬프트로 작성하세요.",
      table: "다른 AI가 표 형식으로 정리해서 답하도록 유도하는 프롬프트로 작성하세요."
    };

    const lengthInstructionMap = {
      short: "결과 분량 요구는 짧고 핵심 위주가 되도록 프롬프트에 반영하세요.",
      medium: "결과 분량 요구는 적당한 길이와 균형감이 있도록 프롬프트에 반영하세요.",
      long: "결과 분량 요구는 충분히 자세하고 구체적이도록 프롬프트에 반영하세요."
    };

    const toneInstructionMap = {
      neutral: "결과 말투 요구는 중립적이고 명확한 방향으로 프롬프트에 반영하세요.",
      friendly: "결과 말투 요구는 친절하고 이해하기 쉬운 방향으로 프롬프트에 반영하세요.",
      professional: "결과 말투 요구는 전문적이고 신뢰감 있는 방향으로 프롬프트에 반영하세요.",
      persuasive: "결과 말투 요구는 설득력 있고 강조점이 살아나는 방향으로 프롬프트에 반영하세요."
    };

    const audienceInstructionMap = {
      general: "대상 독자는 일반인으로 설정하세요.",
      student: "대상 독자는 중고등학생 수준으로 설정하세요.",
      college: "대상 독자는 대학생 수준으로 설정하세요.",
      expert: "대상 독자는 전문가 수준으로 설정하세요."
    };

    const purposeInstructionMap = {
      learning: "사용 목적은 학습과 이해 향상입니다.",
      blog: "사용 목적은 블로그/콘텐츠 초안 작성입니다.",
      presentation: "사용 목적은 발표 자료용 정리입니다.",
      work: "사용 목적은 업무 문서 또는 실무 활용입니다.",
      sns: "사용 목적은 SNS 업로드용 간결하고 임팩트 있는 결과입니다."
    };

    const userRequestBlock = [
      "[사용자 입력 정보]",
      `- 주제: ${normalizedTopic}`,
      `- 추가 설명: ${normalizedDetails || "(없음)"}`,
      `- 반드시 포함할 요소: ${normalizedMustInclude || "(없음)"}`,
      "",
      "[원하는 출력 조건]",
      `- 언어: ${outputLanguage}`,
      `- 형식: ${outputFormat}`,
      `- 길이: ${outputLength}`,
      `- 말투: ${tone}`,
      `- 대상 수준: ${audienceLevel}`,
      `- 목적: ${purpose}`
    ].join("\n");

    const systemPrompt = [
      "당신은 사용자의 요청을 바탕으로 '다른 AI에 그대로 붙여넣어 사용할 최종 프롬프트'를 작성하는 전문가입니다.",
      "당신의 임무는 답변을 직접 쓰는 것이 아니라, 다른 AI가 더 좋은 답변을 하도록 만드는 고품질 입력 프롬프트를 작성하는 것입니다.",
      "반드시 최종 프롬프트 본문만 출력하세요.",
      "절대로 설명, 해설, 서론, '다음은 프롬프트입니다' 같은 안내 문구를 붙이지 마세요.",
      "사용자의 입력 의도, 대상, 형식, 길이, 말투, 목적을 자연스럽게 통합한 하나의 완성된 프롬프트를 만드세요.",
      languageInstruction,
      formatInstructionMap[outputFormat] || formatInstructionMap.step,
      lengthInstructionMap[outputLength] || lengthInstructionMap.medium,
      toneInstructionMap[tone] || toneInstructionMap.friendly,
      audienceInstructionMap[audienceLevel] || audienceInstructionMap.general,
      purposeInstructionMap[purpose] || purposeInstructionMap.learning
    ].join(" ");

    const userPrompt = [
      "아래 조건을 모두 반영해서, 다른 생성형 AI에 그대로 붙여넣어 사용할 수 있는 단일 최종 프롬프트를 작성하세요.",
      "좋은 프롬프트가 되도록 목표, 대상 독자, 출력 형식, 포함 요소, 문체, 분량 조건을 유기적으로 통합하세요.",
      "출력은 오직 최종 프롬프트 본문만 허용됩니다.",
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
        temperature: 0.3,
        top_p: 0.9,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
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
        .replace(/[一-龥]/g, "")
        .replace(/\s{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
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
EOFcat > api/generate.js <<'EOF'
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
            "Write the final output prompt in English only.",
            "Do not include Korean.",
            "Return only the final prompt text that will be pasted into another AI."
          ].join(" ")
        : [
            "최종 결과 프롬프트는 반드시 자연스러운 현대 한국어로만 작성하세요.",
            "한자, 일본식 한자어 표기, 중국어 문자, 깨진 문자, 특수 인코딩 흔적을 절대 포함하지 마세요.",
            "영문 고유명사나 불가피한 기술 용어를 제외하고는 한글 중심으로 작성하세요.",
            "출력물은 설명문이 아니라 다른 AI에 그대로 붙여넣을 최종 프롬프트여야 합니다.",
            "머리말, 해설, 주석, 따옴표, 코드블록 없이 최종 프롬프트 본문만 반환하세요."
          ].join(" ");

    const formatInstructionMap = {
      explain: "다른 AI가 설명형 결과를 내도록 유도하는 프롬프트로 작성하세요.",
      bullet: "다른 AI가 불릿 요약 형식으로 답하도록 유도하는 프롬프트로 작성하세요.",
      step: "다른 AI가 단계별 가이드 형식으로 답하도록 유도하는 프롬프트로 작성하세요.",
      table: "다른 AI가 표 형식으로 정리해서 답하도록 유도하는 프롬프트로 작성하세요."
    };

    const lengthInstructionMap = {
      short: "결과 분량 요구는 짧고 핵심 위주가 되도록 프롬프트에 반영하세요.",
      medium: "결과 분량 요구는 적당한 길이와 균형감이 있도록 프롬프트에 반영하세요.",
      long: "결과 분량 요구는 충분히 자세하고 구체적이도록 프롬프트에 반영하세요."
    };

    const toneInstructionMap = {
      neutral: "결과 말투 요구는 중립적이고 명확한 방향으로 프롬프트에 반영하세요.",
      friendly: "결과 말투 요구는 친절하고 이해하기 쉬운 방향으로 프롬프트에 반영하세요.",
      professional: "결과 말투 요구는 전문적이고 신뢰감 있는 방향으로 프롬프트에 반영하세요.",
      persuasive: "결과 말투 요구는 설득력 있고 강조점이 살아나는 방향으로 프롬프트에 반영하세요."
    };

    const audienceInstructionMap = {
      general: "대상 독자는 일반인으로 설정하세요.",
      student: "대상 독자는 중고등학생 수준으로 설정하세요.",
      college: "대상 독자는 대학생 수준으로 설정하세요.",
      expert: "대상 독자는 전문가 수준으로 설정하세요."
    };

    const purposeInstructionMap = {
      learning: "사용 목적은 학습과 이해 향상입니다.",
      blog: "사용 목적은 블로그/콘텐츠 초안 작성입니다.",
      presentation: "사용 목적은 발표 자료용 정리입니다.",
      work: "사용 목적은 업무 문서 또는 실무 활용입니다.",
      sns: "사용 목적은 SNS 업로드용 간결하고 임팩트 있는 결과입니다."
    };

    const userRequestBlock = [
      "[사용자 입력 정보]",
      `- 주제: ${normalizedTopic}`,
      `- 추가 설명: ${normalizedDetails || "(없음)"}`,
      `- 반드시 포함할 요소: ${normalizedMustInclude || "(없음)"}`,
      "",
      "[원하는 출력 조건]",
      `- 언어: ${outputLanguage}`,
      `- 형식: ${outputFormat}`,
      `- 길이: ${outputLength}`,
      `- 말투: ${tone}`,
      `- 대상 수준: ${audienceLevel}`,
      `- 목적: ${purpose}`
    ].join("\n");

    const systemPrompt = [
      "당신은 사용자의 요청을 바탕으로 '다른 AI에 그대로 붙여넣어 사용할 최종 프롬프트'를 작성하는 전문가입니다.",
      "당신의 임무는 답변을 직접 쓰는 것이 아니라, 다른 AI가 더 좋은 답변을 하도록 만드는 고품질 입력 프롬프트를 작성하는 것입니다.",
      "반드시 최종 프롬프트 본문만 출력하세요.",
      "절대로 설명, 해설, 서론, '다음은 프롬프트입니다' 같은 안내 문구를 붙이지 마세요.",
      "사용자의 입력 의도, 대상, 형식, 길이, 말투, 목적을 자연스럽게 통합한 하나의 완성된 프롬프트를 만드세요.",
      languageInstruction,
      formatInstructionMap[outputFormat] || formatInstructionMap.step,
      lengthInstructionMap[outputLength] || lengthInstructionMap.medium,
      toneInstructionMap[tone] || toneInstructionMap.friendly,
      audienceInstructionMap[audienceLevel] || audienceInstructionMap.general,
      purposeInstructionMap[purpose] || purposeInstructionMap.learning
    ].join(" ");

    const userPrompt = [
      "아래 조건을 모두 반영해서, 다른 생성형 AI에 그대로 붙여넣어 사용할 수 있는 단일 최종 프롬프트를 작성하세요.",
      "좋은 프롬프트가 되도록 목표, 대상 독자, 출력 형식, 포함 요소, 문체, 분량 조건을 유기적으로 통합하세요.",
      "출력은 오직 최종 프롬프트 본문만 허용됩니다.",
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
        temperature: 0.3,
        top_p: 0.9,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
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
        .replace(/[一-龥]/g, "")
        .replace(/\s{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
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
