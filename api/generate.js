export default async function handler(req, res) {
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
        ? "Write the final prompt in English."
        : "최종 프롬프트는 한국어로 작성하세요.";

    const formatInstructionMap = {
      explain: "결과가 설명형으로 나오도록 지시하세요.",
      bullet: "결과가 불릿 요약 형식으로 나오도록 지시하세요.",
      step: "결과가 단계별 가이드 형식으로 나오도록 지시하세요.",
      table: "결과가 표 형식으로 정리되도록 지시하세요."
    };

    const lengthInstructionMap = {
      short: "결과 분량은 짧고 핵심만 담도록 지시하세요.",
      medium: "결과 분량은 보통 길이로 균형 있게 작성되도록 지시하세요.",
      long: "결과 분량은 충분히 자세하고 구체적으로 작성되도록 지시하세요."
    };

    const toneInstructionMap = {
      neutral: "말투는 중립적이고 명확하게 지시하세요.",
      friendly: "말투는 친절하고 이해하기 쉽게 지시하세요.",
      professional: "말투는 전문적이고 신뢰감 있게 지시하세요.",
      persuasive: "말투는 설득력 있고 강조점이 살아나도록 지시하세요."
    };

    const audienceInstructionMap = {
      general: "대상은 일반인 기준으로 이해 가능하게 설정하세요.",
      student: "대상은 중고등학생 수준으로 쉽게 이해 가능하게 설정하세요.",
      college: "대상은 대학생 수준으로 적절한 깊이를 반영하세요.",
      expert: "대상은 전문가 수준으로 전문 용어와 깊이를 허용하세요."
    };

    const purposeInstructionMap = {
      learning: "출력 목적은 학습과 이해 향상입니다.",
      blog: "출력 목적은 블로그/콘텐츠 초안 작성입니다.",
      presentation: "출력 목적은 발표 자료용 정리입니다.",
      work: "출력 목적은 업무 문서 또는 실무 활용입니다.",
      sns: "출력 목적은 SNS 업로드용 짧고 임팩트 있는 구성입니다."
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
      "당신은 사용자의 입력을 바탕으로, 다른 AI에게 그대로 붙여넣어 사용할 수 있는 '고품질 최종 프롬프트'를 작성하는 전문가입니다.",
      "설명하지 말고 최종 프롬프트만 반환하세요.",
      "불필요한 머리말, 따옴표, 코드블록 없이 결과 프롬프트 본문만 출력하세요.",
      languageInstruction,
      formatInstructionMap[outputFormat] || formatInstructionMap.step,
      lengthInstructionMap[outputLength] || lengthInstructionMap.medium,
      toneInstructionMap[tone] || toneInstructionMap.friendly,
      audienceInstructionMap[audienceLevel] || audienceInstructionMap.general,
      purposeInstructionMap[purpose] || purposeInstructionMap.learning
    ].join(" ");

    const userPrompt = [
      "아래 사용자 입력과 옵션을 반영해서, 다른 생성형 AI에 바로 붙여넣어 사용할 수 있는 단일 프롬프트를 작성하세요.",
      "좋은 프롬프트가 되도록 목표, 대상, 출력 형식, 포함 요소, 문체, 분량 조건을 자연스럽게 통합하세요.",
      "",
      userRequestBlock
    ].join("\n");

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
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

    const result =
      groqData?.choices?.[0]?.message?.content?.trim() || "";

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
