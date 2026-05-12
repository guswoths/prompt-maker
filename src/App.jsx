import { useState } from "react";

function App() {
  const [userInput, setUserInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const handleGenerate = async () => {
    const trimmedInput = userInput.trim();

    if (!trimmedInput) {
      setErrorMessage("아이디어 또는 요청사항을 먼저 입력해 주세요.");
      setGeneratedPrompt("");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setCopyMessage("");
    setGeneratedPrompt("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: trimmedInput })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "프롬프트 생성에 실패했습니다.");
      }

      setGeneratedPrompt(data.result || "생성 결과가 비어 있습니다.");
    } catch (error) {
      console.error(error);
      setErrorMessage("프롬프트 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedPrompt.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopyMessage("복사 완료");
      setTimeout(() => {
        setCopyMessage("");
      }, 1500);
    } catch (error) {
      console.error(error);
      setCopyMessage("복사 실패");
      setTimeout(() => {
        setCopyMessage("");
      }, 1500);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <p style={styles.badge}>Prompt Maker</p>
          <h1 style={styles.title}>입력하면 바로 쓰는 프롬프트로 정리</h1>
          <p style={styles.description}>
            짧게 적어도 됩니다. 아이디어, 목적, 대상, 말투를 적으면 더 좋은 결과가 나옵니다.
          </p>
        </header>

        <main style={styles.mainGrid}>
          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>1. 입력</h2>
              <p style={styles.sectionHint}>원하는 작업을 자연스럽게 적어보세요.</p>
            </div>

            <textarea
              value={userInput}
              onChange={(event) => setUserInput(event.target.value)}
              placeholder="예: 중학생 대상 과학 수업용으로, 뉴턴 운동법칙을 쉬운 비유와 예시 중심으로 설명하는 프롬프트를 만들어줘"
              style={styles.textarea}
            />

            <div style={styles.actionRow}>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  ...styles.primaryButton,
                  opacity: isGenerating ? 0.7 : 1,
                  cursor: isGenerating ? "not-allowed" : "pointer"
                }}
              >
                {isGenerating ? "생성 중..." : "2. 생성하기"}
              </button>
            </div>

            {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}
          </section>

          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>3. 결과</h2>
              <p style={styles.sectionHint}>생성된 프롬프트를 확인하고 바로 복사하세요.</p>
            </div>

            <div style={styles.resultBox}>
              {generatedPrompt ? (
                <pre style={styles.resultText}>{generatedPrompt}</pre>
              ) : (
                <p style={styles.placeholderText}>
                  아직 생성된 프롬프트가 없습니다. 왼쪽에서 입력 후 생성해 주세요.
                </p>
              )}
            </div>

            <div style={styles.actionRow}>
              <button
                onClick={handleCopy}
                disabled={!generatedPrompt}
                style={{
                  ...styles.secondaryButton,
                  opacity: generatedPrompt ? 1 : 0.5,
                  cursor: generatedPrompt ? "pointer" : "not-allowed"
                }}
              >
                복사하기
              </button>

              {copyMessage && <span style={styles.copyMessage}>{copyMessage}</span>}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    color: "#1f2937",
    padding: "24px"
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto"
  },
  header: {
    marginBottom: "24px"
  },
  badge: {
    display: "inline-block",
    margin: 0,
    marginBottom: "12px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#e0e7ff",
    color: "#3730a3",
    fontSize: "12px",
    fontWeight: 700
  },
  title: {
    margin: 0,
    fontSize: "36px",
    lineHeight: 1.2,
    marginBottom: "12px"
  },
  description: {
    margin: 0,
    maxWidth: "720px",
    color: "#4b5563",
    fontSize: "16px",
    lineHeight: 1.6
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px"
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)"
  },
  sectionHeader: {
    marginBottom: "16px"
  },
  sectionTitle: {
    margin: 0,
    marginBottom: "6px",
    fontSize: "22px"
  },
  sectionHint: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px"
  },
  textarea: {
    width: "100%",
    minHeight: "220px",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    lineHeight: 1.6,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box"
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "16px",
    flexWrap: "wrap"
  },
  primaryButton: {
    border: "none",
    borderRadius: "12px",
    background: "#2563eb",
    color: "#ffffff",
    padding: "12px 18px",
    fontSize: "15px",
    fontWeight: 700
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#111827",
    padding: "12px 18px",
    fontSize: "15px",
    fontWeight: 700
  },
  resultBox: {
    minHeight: "220px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    padding: "16px"
  },
  resultText: {
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: "15px",
    lineHeight: 1.7,
    fontFamily: "inherit"
  },
  placeholderText: {
    margin: 0,
    color: "#6b7280",
    fontSize: "15px",
    lineHeight: 1.6
  },
  errorText: {
    marginTop: "12px",
    marginBottom: 0,
    color: "#dc2626",
    fontSize: "14px"
  },
  copyMessage: {
    fontSize: "14px",
    color: "#059669",
    fontWeight: 600
  }
};

export default App;
