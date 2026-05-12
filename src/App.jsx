import { useState } from "react";

function App() {
  const [rawIdea, setRawIdea] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGeneratePrompt = async () => {
    if (!rawIdea.trim()) {
      setErrorMessage("아이디어나 상황을 먼저 입력해 주세요.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: rawIdea }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "API 호출 실패");
      }

      const data = await response.json();
      setPrompt(data.result || "");
    } catch (error) {
      console.error(error);
      setErrorMessage("프롬프트 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>프롬프트 메이커 (Groq 무료 티어)</h1>

      <textarea
        style={{ width: "100%", height: 120 }}
        placeholder="무엇을 만들고 싶은지, 어떤 상황인지 편하게 적어보기..."
        value={rawIdea}
        onChange={(e) => setRawIdea(e.target.value)}
      />

      <button onClick={handleGeneratePrompt} disabled={loading}>
        {loading ? "생성 중..." : "프롬프트 만들기"}
      </button>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {prompt && (
        <div style={{ marginTop: 24 }}>
          <h2>생성된 프롬프트</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
            }}
          >
            {prompt}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;