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
      messages: [
        {
          role: "system",
          content: "너는 사용자의 아이디어를 바탕으로 더 명확하고 실용적인 프롬프트를 만들어주는 도우미다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 512
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
