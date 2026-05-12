import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method is allowed" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt (string) is required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content: [
            "당신은 한국어 전용 프롬프트 메이커입니다.",
            "모든 답변은 반드시 자연스러운 한국어로만 작성하세요.",
            "영어, 포르투갈어, 일본어, 중국어 등 다른 언어를 절대 사용하지 마세요.",
            "사용자의 입력이 어떤 언어이든 결과는 반드시 한국어로 출력하세요.",
            "당신의 역할은 사용자의 짧은 아이디어를 더 구체적이고 실행 가능한 고품질 프롬프트로 바꾸는 것입니다.",
            "설명문을 길게 붙이지 말고, 바로 사용할 수 있는 결과 중심으로 답하세요.",
            "출력 형식은 아래를 반드시 따르세요.",
            "",
            "[개선된 프롬프트]",
            "여기에 완성된 프롬프트",
            "",
            "[활용 팁]",
            "- 필요하면 한두 줄의 짧은 팁만 작성"
          ].join("\n")
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const result =
      completion.choices?.[0]?.message?.content?.trim() ||
      "결과를 생성하지 못했습니다.";

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Groq API error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      detail: error?.message || "Unknown error"
    });
  }
}
