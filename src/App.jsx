import { useState } from "react";

function App() {
  const [rawIdea, setRawIdea] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGeneratePrompt = async () => {
    if (!rawIdea.trim()) {
      setErrorMessage("아이디어를 먼저 입력해 주세요.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setGeneratedPrompt("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: rawIdea })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "API 호출 실패");
      }

      setGeneratedPrompt(data.result || "");
    } catch (error) {
      console.error(error);
      setErrorMessage("프롬프트 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", padding: 24 }}>
      <h1>프롬프트 메이커</h1>

      <textarea
        style={{ width: "100%", minHeight: 160, marginTop: 16, padding: 12 }}
        placeholder="예: 중학생도 이해할 수 있게 뉴턴 운동법칙을 설명하는 수업용 프롬프트를 만들어줘"
        value={rawIdea}
        onChange={(event) => setRawIdea(event.target.value)}
      />

      <button
        onClick={handleGeneratePrompt}
        disabled={loading}
        style={{ marginTop: 12, padding: "12px 16px" }}
      >
        {loading ? "생성 중..." : "프롬프트 만들기"}
      </button>

      {errorMessage && (
        <p style={{ color: "crimson", marginTop: 12 }}>{errorMessage}</p>
      )}

      {generatedPrompt && (
        <div style={{ marginTop: 24 }}>
          <h2>생성된 프롬프트</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8
            }}
          >
            {generatedPrompt}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
