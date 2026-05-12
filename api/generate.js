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
            "Do not explain the request itself.",
            "Do not produce the final answer content.",
            "Return only the prompt that another AI should receive."
          ].join(" ")
        : [
            "최종 출력은 반드시 자연스러운 한국어 프롬프트 본문이어야 합니다.",
            "절대로 사용자의 요청 내용을 해설하거나 요약하지 마세요.",
            "절대로 최종 결과물 자체를 직접 작성하지 마세요.",
            "반드시 다른 AI에게 입력할 용도의 최종 프롬프트만 작성하세요.",
            "머리말, 안내문, 설명, 주석, 코드블록, 따옴표 없이 프롬프트 본문만 반환하세요."
          ].join(" ");

    const formatInstructionMap = {
      explain:
        outputLanguage === "en"
          ? "The prompt must instruct the target AI to produce a clear explanatory answer."
          : "프롬프트는 대상 AI가 설명형 결과를 작성하도록 지시해야 합니다.",
      bullet:
        outputLanguage === "en"
          ? "The prompt must instruct the target AI to produce a bullet-point answer."
          : "프롬프트는 대상 AI가 불릿 요약 결과를 작성하도록 지시해야 합니다.",
      step:
        outputLanguage === "en"
          ? "The prompt must instruct the target AI to produce a step-by-step answer."
          : "프롬프트는 대상 AI가 단계별 가이드 결과를 작성하도록 지시해야 합니다.",
      table:
        outputLanguage === "en"
          ? "The prompt must instruct the target AI to produce a table-form answer."
          : "프롬프트는 대상 AI가 표 형식 결과를 작성하도록 지시해야 합니다."
    };

    const lengthInstructionMap = {
      short:
        outputLanguage === "en"
          ? "The prompt must request a short and concise result."
          : "프롬프트는 짧고 핵심적인 결과를 요청해야 합니다.",
      medium:
        outputLanguage === "en"
          ? "The prompt must request a balanced medium-length result."
          : "프롬프트는 적당한 길이의 균형 잡힌 결과를 요청해야 합니다.",
      long:
        outputLanguage === "en"
          ? "The prompt must request a detailed and sufficiently rich result."
          : "프롬프트는 충분히 자세하고 구체적인 결과를 요청해야 합니다."
    };

    const toneInstructionMap = {
      neutral:
        outputLanguage === "en"
          ? "The prompt must request a neutral and clear tone."
          : "프롬프트는 중립적이고 명확한 말투를 요청해야 합니다.",
      friendly:
        outputLanguage === "en"
          ? "The prompt must request a friendly and easy-to-understand tone."
          : "프롬프트는 친절하고 이해하기 쉬운 말투를 요청해야 합니다.",
      professional:
        outputLanguage === "en"
          ? "The prompt must request a professional and trustworthy tone."
          : "프롬프트는 전문적이고 신뢰감 있는 말투를 요청해야 합니다.",
      persuasive:
        outputLanguage === "en"
          ? "The prompt must request a persuasive and compelling tone."
          : "프롬프트는 설득력 있고 강조점이 살아 있는 말투를 요청해야 합니다."
    };

    const audienceInstructionMap = {
      general:
        outputLanguage === "en"
          ? "The target audience is the general public."
          : "대상 독자는 일반인입니다.",
      student:
        outputLanguage === "en"
          ? "The target audience is middle or high school students."
          : "대상 독자는 중고등학생입니다.",
      college:
        outputLanguage === "en"
          ? "The target audience is college students."
          : "대상 독자는 대학생입니다.",
      expert:
        outputLanguage === "en"
          ? "The target audience is experts."
          : "대상 독자는 전문가입니다."
    };

    const purposeInstructionMap = {
      learning:
        outputLanguage === "en"
          ? "The usage purpose is learning and understanding."
          : "사용 목적은 학습과 이해 향상입니다.",
      blog:
        outputLanguage === "en"
          ? "The usage purpose is blog or content drafting."
          : "사용 목적은 블로그 또는 콘텐츠 초안 작성입니다.",
      presentation:
        outputLanguage === "en"
          ? "The usage purpose is presentation material preparation."
          : "사용 목적은 발표 자료 정리입니다.",
      work:
        outputLanguage === "en"
          ? "The usage purpose is practical work or business documentation."
          : "사용 목적은 업무 문서 또는 실무 활용입니다.",
      sns:
        outputLanguage === "en"
          ? "The usage purpose is short and impactful SNS content."
          : "사용 목적은 짧고 임팩트 있는 SNS 활용입니다."
    };

    const userContextBlock =
      outputLanguage === "en"
        ? [
            "[Source material provided by the user]",
            `- Topic: ${normalizedTopic}`,
            `- Additional context: ${normalizedDetails || "(none)"}`,
            `- Must include: ${normalizedMustInclude || "(none)"}`,
            "",
            "[Requested output conditions]",
            `- Language: ${outputLanguage}`,
            `- Format: ${outputFormat}`,
            `- Length: ${outputLength}`,
            `- Tone: ${tone}`,
            `- Audience level: ${audienceLevel}`,
            `- Purpose: ${purpose}`
          ].join("\n")
        : [
            "[사용자가 제공한 원재료]",
            `- 주제: ${normalizedTopic}`,
            `- 추가 설명: ${normalizedDetails || "(없음)"}`,
            `- 반드시 포함할 요소: ${normalizedMustInclude || "(없음)"}`,
            "",
            "[사용자가 원하는 결과 조건]",
            `- 언어: ${outputLanguage}`,
            `- 형식: ${outputFormat}`,
            `- 길이: ${outputLength}`,
            `- 말투: ${tone}`,
            `- 대상 수준: ${audienceLevel}`,
            `- 목적: ${purpose}`
          ].join("\n");

    const systemPrompt =
      outputLanguage === "en"
        ? [
            "You are a specialist who writes prompts for other AI systems.",
            "Your only task is to produce a final prompt that can be pasted into another AI.",
            "You must NOT answer the user's topic directly.",
            "You must NOT explain, summarize, or analyze the topic for the user.",
            "You must transform the user's source material and selected options into one high-quality instruction prompt.",
            "The output must be only the final prompt text with no introduction, no explanation, no markdown code fences, and no quotation marks.",
            languageInstruction,
            formatInstructionMap[outputFormat] || formatInstructionMap.step,
            lengthInstructionMap[outputLength] || lengthInstructionMap.medium,
            toneInstructionMap[tone] || toneInstructionMap.friendly,
            audienceInstructionMap[audienceLevel] || audienceInstructionMap.general,
            purposeInstructionMap[purpose] || purposeInstructionMap.learning
          ].join(" ")
        : [
            "당신은 다른 AI에 넣을 입력 프롬프트를 작성하는 전문가입니다.",
            "당신의 유일한 임무는 사용자가 다른 AI에 그대로 붙여넣을 수 있는 최종 프롬프트를 작성하는 것입니다.",
            "사용자의 주제에 대한 설명문, 해설문, 요약문, 결과물 자체를 직접 작성하면 안 됩니다.",
            "반드시 사용자가 제공한 내용과 선택한 옵션을 바탕으로, 다른 AI가 원하는 형식의 결과를 생성하게 만드는 입력 프롬프트를 작성해야 합니다.",
            "출력은 오직 최종 프롬프트 본문만 허용됩니다.",
            "도입 문장, 안내 문구, 해설, 주석, 번호 제목, 코드블록, 따옴표를 붙이지 마세요.",
            languageInstruction,
            formatInstructionMap[outputFormat] || formatInstructionMap.step,
            lengthInstructionMap[outputLength] || lengthInstructionMap.medium,
            toneInstructionMap[tone] || toneInstructionMap.friendly,
            audienceInstructionMap[audienceLevel] || audienceInstructionMap.general,
            purposeInstructionMap[purpose] || purposeInstructionMap.learning
          ].join(" ");

    const userPrompt =
      outputLanguage === "en"
        ? [
            "Using the information below, write exactly one final prompt for another AI.",
            "Important:",
            "- Do not produce the final answer itself.",
            "- Do not explain the topic.",
            "- Do not describe what the user asked for.",
            "- Convert the source material into a prompt that instructs another AI to generate the desired result.",
            "- The final prompt should naturally include the goal, audience, structure, tone, length, and must-include elements.",
            "- Output only the final prompt body.",
            "",
            userContextBlock
          ].join("\n")
        : [
            "아래 정보를 바탕으로 다른 AI에 그대로 붙여넣을 최종 프롬프트를 정확히 하나만 작성하세요.",
            "중요:",
            "- 최종 결과물 자체를 직접 쓰지 마세요.",
            "- 주제 설명문을 작성하지 마세요.",
            "- 사용자의 요청을 해설하거나 분석하지 마세요.",
            "- 제공된 원재료와 선택된 옵션을 바탕으로, 다른 AI가 원하는 결과를 생성하도록 지시하는 입력 프롬프트를 작성하세요.",
            "- 목표, 대상 독자, 형식, 길이, 말투, 반드시 포함할 요소가 자연스럽게 포함되도록 구성하세요.",
            "- 출력은 최종 프롬프트 본문만 허용됩니다.",
            "",
            userContextBlock
          ].join("\n");

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
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