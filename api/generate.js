// api/generate.js
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Vercel Serverless Function
 * URL: /api/generate
 */
export default async function handler(req, res) {
  // CORS / JSON 기본 세팅
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method is allowed" });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt (string) is required" });
    }

    // Groq ChatCompletion 호출
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192", // 무료 티어에서 자주 쓰는 모델 예시[web:100]
      messages: [
        {
          role: "system",
          content: "너는 사용자의 아이디어를 바탕으로 프롬프트를 예쁘게 다듬어주는 도우미야.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 512,
    });

    const text =
      completion.choices?.[0]?.message?.content?.trim() ||
      "결과를 생성하지 못했습니다.";

    return res.status(200).json({ result: text });
  } catch (error) {
    console.error("Groq API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}