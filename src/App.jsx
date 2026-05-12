import { useMemo, useState } from "react";
import "./App.css";

const OUTPUT_LANGUAGE_OPTIONS = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "영어" }
];

const OUTPUT_FORMAT_OPTIONS = [
  { value: "step", label: "단계형" },
  { value: "bullet", label: "불릿형" },
  { value: "explain", label: "설명형" },
  { value: "table", label: "표형" }
];

const OUTPUT_LENGTH_OPTIONS = [
  { value: "short", label: "짧게" },
  { value: "medium", label: "보통" },
  { value: "long", label: "길게" }
];

const TONE_OPTIONS = [
  { value: "friendly", label: "친절한 톤" },
  { value: "neutral", label: "중립적 톤" },
  { value: "professional", label: "전문적 톤" },
  { value: "persuasive", label: "설득형 톤" }
];

const AUDIENCE_LEVEL_OPTIONS = [
  { value: "general", label: "일반인" },
  { value: "student", label: "중고등학생" },
  { value: "college", label: "대학생" },
  { value: "expert", label: "전문가" }
];

const PURPOSE_OPTIONS = [
  { value: "learning", label: "학습/이해" },
  { value: "blog", label: "블로그 초안" },
  { value: "presentation", label: "발표 자료" },
  { value: "work", label: "업무 활용" },
  { value: "sns", label: "SNS용" }
];

const INITIAL_FORM = {
  topic: "",
  details: "",
  mustInclude: "",
  outputLanguage: "ko",
  outputFormat: "step",
  outputLength: "medium",
  tone: "friendly",
  audienceLevel: "general",
  purpose: "learning"
};

function App() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const canSubmit = useMemo(() => form.topic.trim().length > 0, [form.topic]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => ({
      ...previousForm,
      [name]: value
    }));
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setResult("");
    setErrorMessage("");
    setIsCopied(false);
  };

  const fallbackCopyText = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const wasCopied = document.execCommand("copy");
    document.body.removeChild(textArea);
    return wasCopied;
  };

  const handleCopyResult = async () => {
    if (!result) {
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(result);
      } else {
        const wasCopied = fallbackCopyText(result);

        if (!wasCopied) {
          throw new Error("복사에 실패했습니다.");
        }
      }

      setIsCopied(true);
      window.setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch (copyError) {
      setErrorMessage("결과 복사에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setResult("");
    setIsCopied(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const rawText = await response.text();

      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch (parseError) {
        throw new Error("서버 응답이 올바른 JSON 형식이 아닙니다.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "프롬프트 생성에 실패했습니다.");
      }

      const nextResult = String(data?.result || "").trim();

      if (!nextResult) {
        throw new Error("생성된 프롬프트가 비어 있습니다.");
      }

      setResult(nextResult);
    } catch (error) {
      setErrorMessage(error.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="app-card">
        <header className="hero">
          <p className="eyebrow">프롬프트 메이커</p>
          <h1>빠른 프롬프트 생성기</h1>
          <p className="hero-description">
            원하는 주제와 조건을 입력하면 다른 AI에 바로 붙여넣을 수 있는 프롬프트를 생성합니다.
          </p>
        </header>

        <form className="prompt-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="topic">주제</label>
            <input
              id="topic"
              name="topic"
              type="text"
              value={form.topic}
              onChange={handleChange}
              placeholder="예: 중학생도 이해하는 블랙홀 설명"
            />
          </div>

          <div className="field-group">
            <label htmlFor="details">추가 설명</label>
            <textarea
              id="details"
              name="details"
              value={form.details}
              onChange={handleChange}
              placeholder="예: 비유를 활용하고, 너무 어렵지 않게 설명"
              rows={4}
            />
          </div>

          <div className="field-group">
            <label htmlFor="mustInclude">반드시 포함할 요소</label>
            <textarea
              id="mustInclude"
              name="mustInclude"
              value={form.mustInclude}
              onChange={handleChange}
              placeholder="예: 핵심 개념 3개, 일상 비유 1개, 마무리 요약"
              rows={3}
            />
          </div>

          <div className="option-grid">
            <div className="field-group">
              <label htmlFor="outputLanguage">출력 언어</label>
              <select
                id="outputLanguage"
                name="outputLanguage"
                value={form.outputLanguage}
                onChange={handleChange}
              >
                {OUTPUT_LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="outputFormat">출력 형식</label>
              <select
                id="outputFormat"
                name="outputFormat"
                value={form.outputFormat}
                onChange={handleChange}
              >
                {OUTPUT_FORMAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="outputLength">분량</label>
              <select
                id="outputLength"
                name="outputLength"
                value={form.outputLength}
                onChange={handleChange}
              >
                {OUTPUT_LENGTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="tone">톤</label>
              <select id="tone" name="tone" value={form.tone} onChange={handleChange}>
                {TONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="audienceLevel">대상 수준</label>
              <select
                id="audienceLevel"
                name="audienceLevel"
                value={form.audienceLevel}
                onChange={handleChange}
              >
                {AUDIENCE_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="purpose">사용 목적</label>
              <select
                id="purpose"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
              >
                {PURPOSE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="action-row">
            <button type="submit" className="primary-button" disabled={!canSubmit || isLoading}>
              {isLoading ? "생성 중..." : "프롬프트 생성"}
            </button>

            <button type="button" className="secondary-button" onClick={handleReset}>
              초기화
            </button>
          </div>
        </form>

        {errorMessage ? <div className="error-box">{errorMessage}</div> : null}

        <section className="result-panel">
          <div className="result-header">
            <h2>생성 결과</h2>
            <button
              type="button"
              className="copy-button"
              onClick={handleCopyResult}
              disabled={!result}
            >
              {isCopied ? "복사됨" : "복사"}
            </button>
          </div>

          <div className="result-box">
            {result ? (
              <pre>{result}</pre>
            ) : (
              <p className="result-placeholder">
                생성된 프롬프트가 여기에 표시됩니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
