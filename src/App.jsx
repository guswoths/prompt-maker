import { useEffect, useMemo, useState } from "react";

const exampleTopics = [
  "중학생 대상 과학 수업용으로 뉴턴 운동법칙 설명",
  "초보 개발자용 React와 Vite 차이 설명",
  "유튜브 쇼츠용 30초 대본 초안 만들기"
];

const defaultInputState = {
  topic: "",
  details: "",
  mustInclude: ""
};

const defaultOptionState = {
  outputLanguage: "ko",
  outputFormat: "step",
  outputLength: "medium",
  tone: "friendly",
  audienceLevel: "general",
  purpose: "learning"
};

const languageLabelMap = {
  ko: "한국어",
  en: "영어"
};

const formatLabelMap = {
  explain: "설명형",
  bullet: "불릿 요약",
  step: "단계별 가이드",
  table: "표 형식"
};

const lengthLabelMap = {
  short: "짧게",
  medium: "보통",
  long: "자세히"
};

const toneLabelMap = {
  neutral: "중립적",
  friendly: "친절한",
  professional: "전문적",
  persuasive: "설득형"
};

const audienceLabelMap = {
  general: "일반인",
  student: "중고등학생",
  college: "대학생",
  expert: "전문가"
};

const purposeLabelMap = {
  learning: "학습용",
  blog: "블로그용",
  presentation: "발표용",
  work: "업무용",
  sns: "SNS용"
};

const purposePresets = [
  {
    key: "learning",
    label: "학습용 프리셋",
    values: {
      outputLanguage: "ko",
      outputFormat: "step",
      outputLength: "long",
      tone: "friendly",
      audienceLevel: "student",
      purpose: "learning"
    }
  },
  {
    key: "blog",
    label: "블로그용 프리셋",
    values: {
      outputLanguage: "ko",
      outputFormat: "explain",
      outputLength: "long",
      tone: "professional",
      audienceLevel: "general",
      purpose: "blog"
    }
  },
  {
    key: "presentation",
    label: "발표용 프리셋",
    values: {
      outputLanguage: "ko",
      outputFormat: "bullet",
      outputLength: "medium",
      tone: "professional",
      audienceLevel: "general",
      purpose: "presentation"
    }
  },
  {
    key: "work",
    label: "업무용 프리셋",
    values: {
      outputLanguage: "ko",
      outputFormat: "table",
      outputLength: "medium",
      tone: "neutral",
      audienceLevel: "general",
      purpose: "work"
    }
  },
  {
    key: "sns",
    label: "SNS용 프리셋",
    values: {
      outputLanguage: "ko",
      outputFormat: "bullet",
      outputLength: "short",
      tone: "persuasive",
      audienceLevel: "general",
      purpose: "sns"
    }
  }
];

function App() {
  const [topic, setTopic] = useState(defaultInputState.topic);
  const [details, setDetails] = useState(defaultInputState.details);
  const [mustInclude, setMustInclude] = useState(defaultInputState.mustInclude);
  const [outputLanguage, setOutputLanguage] = useState(defaultOptionState.outputLanguage);
  const [outputFormat, setOutputFormat] = useState(defaultOptionState.outputFormat);
  const [outputLength, setOutputLength] = useState(defaultOptionState.outputLength);
  const [tone, setTone] = useState(defaultOptionState.tone);
  const [audienceLevel, setAudienceLevel] = useState(defaultOptionState.audienceLevel);
  const [purpose, setPurpose] = useState(defaultOptionState.purpose);

  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copyButtonText, setCopyButtonText] = useState("복사하기");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectedOptionSummary = useMemo(() => {
    return [
      languageLabelMap[outputLanguage],
      formatLabelMap[outputFormat],
      lengthLabelMap[outputLength],
      toneLabelMap[tone],
      audienceLabelMap[audienceLevel],
      purposeLabelMap[purpose]
    ].join(" / ");
  }, [outputLanguage, outputFormat, outputLength, tone, audienceLevel, purpose]);

  const activePreset = useMemo(() => {
    return (
      purposePresets.find((preset) => {
        return (
          preset.values.outputLanguage === outputLanguage &&
          preset.values.outputFormat === outputFormat &&
          preset.values.outputLength === outputLength &&
          preset.values.tone === tone &&
          preset.values.audienceLevel === audienceLevel &&
          preset.values.purpose === purpose
        );
      }) || null
    );
  }, [outputLanguage, outputFormat, outputLength, tone, audienceLevel, purpose]);

  const isCustomState = activePreset === null;

  const isDefaultOptionState = useMemo(() => {
    return (
      outputLanguage === defaultOptionState.outputLanguage &&
      outputFormat === defaultOptionState.outputFormat &&
      outputLength === defaultOptionState.outputLength &&
      tone === defaultOptionState.tone &&
      audienceLevel === defaultOptionState.audienceLevel &&
      purpose === defaultOptionState.purpose
    );
  }, [outputLanguage, outputFormat, outputLength, tone, audienceLevel, purpose]);

  const isDefaultInputState = useMemo(() => {
    return (
      topic === defaultInputState.topic &&
      details === defaultInputState.details &&
      mustInclude === defaultInputState.mustInclude
    );
  }, [topic, details, mustInclude]);

  const handleExampleClick = (exampleText) => {
    setTopic(exampleText);
    setErrorMessage("");
  };

  const applyPreset = (presetValues) => {
    setOutputLanguage(presetValues.outputLanguage);
    setOutputFormat(presetValues.outputFormat);
    setOutputLength(presetValues.outputLength);
    setTone(presetValues.tone);
    setAudienceLevel(presetValues.audienceLevel);
    setPurpose(presetValues.purpose);
  };

  const resetToDefaultOptions = () => {
    setOutputLanguage(defaultOptionState.outputLanguage);
    setOutputFormat(defaultOptionState.outputFormat);
    setOutputLength(defaultOptionState.outputLength);
    setTone(defaultOptionState.tone);
    setAudienceLevel(defaultOptionState.audienceLevel);
    setPurpose(defaultOptionState.purpose);
  };

  const resetInputContent = () => {
    setTopic(defaultInputState.topic);
    setDetails(defaultInputState.details);
    setMustInclude(defaultInputState.mustInclude);
    setErrorMessage("");
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMessage("주제는 반드시 입력해 주세요.");
      setGeneratedPrompt("");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setGeneratedPrompt("");
    setCopyButtonText("복사하기");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: topic.trim(),
          details: details.trim(),
          mustInclude: mustInclude.trim(),
          outputLanguage,
          outputFormat,
          outputLength,
          tone,
          audienceLevel,
          purpose
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "프롬프트 생성에 실패했습니다.");
      }

      setGeneratedPrompt(data.result || "");
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
      setCopyButtonText("복사 완료");
      setTimeout(() => {
        setCopyButtonText("복사하기");
      }, 1500);
    } catch (error) {
      console.error(error);
      setCopyButtonText("복사 실패");
      setTimeout(() => {
        setCopyButtonText("복사하기");
      }, 1500);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <p style={styles.badge}>Prompt Maker</p>
          <h1 style={styles.title}>입력 내용과 결과 옵션을 분리해서 프롬프트 생성</h1>
          <p style={styles.description}>
            왼쪽에는 내가 AI에게 전달할 내용을 적고, 오른쪽에는 결과가 어떤 방식으로 나오게 할지 선택하세요.
          </p>
        </header>

        <main style={styles.mainGrid}>
          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionHeaderTop}>
                <div>
                  <h2 style={styles.sectionTitle}>내가 제공할 내용</h2>
                  <p style={styles.sectionHint}>
                    AI가 이해해야 하는 주제, 맥락, 포함 요소를 적습니다.
                  </p>
                </div>

                <button
                  onClick={resetInputContent}
                  disabled={isDefaultInputState}
                  style={{
                    ...styles.resetButton,
                    opacity: isDefaultInputState ? 0.45 : 1,
                    cursor: isDefaultInputState ? "not-allowed" : "pointer"
                  }}
                  title="입력 내용을 초기 상태로 되돌리기"
                >
                  입력 초기화
                </button>
              </div>
            </div>

            <label style={styles.label}>주제</label>
            <textarea
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="예: 중학생 대상 과학 수업용으로 뉴턴 운동법칙을 쉽게 설명"
              style={styles.inputBox}
            />

            <label style={styles.label}>추가 설명 / 맥락</label>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="예: 쉬운 비유를 포함하고, 실생활 예시 2개를 넣고, 어려운 수식은 최소화"
              style={styles.inputBox}
            />

            <label style={styles.label}>반드시 포함할 요소</label>
            <textarea
              value={mustInclude}
              onChange={(event) => setMustInclude(event.target.value)}
              placeholder="예: 관성, 가속도, 힘의 관계 / 일상 예시 / 교사용 질문 2개"
              style={styles.inputBox}
            />

            <div style={styles.examplesWrap}>
              {exampleTopics.map((exampleText, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(exampleText)}
                  style={styles.exampleButton}
                  title={exampleText}
                >
                  {exampleText}
                </button>
              ))}
            </div>
          </section>

          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>결과 옵션</h2>
              <p style={styles.sectionHint}>
                생성된 프롬프트를 다른 AI에 붙여넣었을 때 어떤 결과가 나오게 할지 선택합니다.
              </p>
            </div>

            <div style={styles.presetSection}>
              <div style={styles.presetHeader}>
                <p style={styles.presetLabel}>빠른 프리셋</p>
                <div style={styles.presetMetaWrap}>
                  {isCustomState ? (
                    <span style={styles.customBadge}>사용자 정의 설정</span>
                  ) : (
                    <span style={styles.activePresetBadge}>
                      현재 프리셋: {activePreset.label}
                    </span>
                  )}

                  <button
                    onClick={resetToDefaultOptions}
                    disabled={isDefaultOptionState}
                    style={{
                      ...styles.resetButton,
                      opacity: isDefaultOptionState ? 0.45 : 1,
                      cursor: isDefaultOptionState ? "not-allowed" : "pointer"
                    }}
                    title="기본 추천 옵션으로 되돌리기"
                  >
                    기본값으로 초기화
                  </button>
                </div>
              </div>

              <div style={styles.presetWrap}>
                {purposePresets.map((preset) => {
                  const isActive = activePreset?.key === preset.key;

                  return (
                    <button
                      key={preset.key}
                      onClick={() => applyPreset(preset.values)}
                      style={{
                        ...styles.presetButton,
                        ...(isActive ? styles.presetButtonActive : {})
                      }}
                      title={`${preset.label} 적용`}
                      aria-pressed={isActive}
                    >
                      <span style={styles.presetButtonText}>
                        {isActive ? "✓ " : ""}
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.optionGrid}>
              <div>
                <label style={styles.label}>출력 언어</label>
                <select value={outputLanguage} onChange={(e) => setOutputLanguage(e.target.value)} style={styles.selectBox}>
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>결과 형식</label>
                <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} style={styles.selectBox}>
                  <option value="explain">설명형</option>
                  <option value="bullet">불릿 요약</option>
                  <option value="step">단계별 가이드</option>
                  <option value="table">표 형식</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>길이</label>
                <select value={outputLength} onChange={(e) => setOutputLength(e.target.value)} style={styles.selectBox}>
                  <option value="short">짧게</option>
                  <option value="medium">보통</option>
                  <option value="long">자세히</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>말투</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} style={styles.selectBox}>
                  <option value="neutral">중립적</option>
                  <option value="friendly">친절한</option>
                  <option value="professional">전문적</option>
                  <option value="persuasive">설득형</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>대상 수준</label>
                <select value={audienceLevel} onChange={(e) => setAudienceLevel(e.target.value)} style={styles.selectBox}>
                  <option value="general">일반인</option>
                  <option value="student">중고등학생</option>
                  <option value="college">대학생</option>
                  <option value="expert">전문가</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>출력 목적</label>
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={styles.selectBox}>
                  <option value="learning">학습용</option>
                  <option value="blog">블로그용</option>
                  <option value="presentation">발표용</option>
                  <option value="work">업무용</option>
                  <option value="sns">SNS용</option>
                </select>
              </div>
            </div>

            <div style={styles.summaryBox}>
              <p style={styles.summaryLabel}>현재 선택된 결과 옵션</p>
              <p style={styles.summaryText}>{selectedOptionSummary}</p>
            </div>

            <div
              style={{
                ...styles.actionRow,
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "stretch" : "center"
              }}
            >
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  ...styles.primaryButton,
                  width: isMobile ? "100%" : "auto",
                  opacity: isGenerating ? 0.7 : 1,
                  cursor: isGenerating ? "not-allowed" : "pointer"
                }}
              >
                {isGenerating ? "생성 중..." : "프롬프트 생성"}
              </button>

              <button
                onClick={handleCopy}
                disabled={!generatedPrompt}
                style={{
                  ...styles.secondaryButton,
                  width: isMobile ? "100%" : "auto",
                  opacity: generatedPrompt ? 1 : 0.5,
                  cursor: generatedPrompt ? "pointer" : "not-allowed"
                }}
              >
                {copyButtonText}
              </button>
            </div>

            {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}
          </section>
        </main>

        <section style={{ ...styles.card, marginTop: "20px" }}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>생성된 프롬프트</h2>
            <p style={styles.sectionHint}>
              아래 결과를 다른 AI에 그대로 붙여넣으면, 선택한 옵션 방향으로 답변이 나오도록 설계됩니다.
            </p>
          </div>

          <div style={styles.resultBox}>
            {generatedPrompt ? (
              <pre style={styles.resultText}>{generatedPrompt}</pre>
            ) : (
              <p style={styles.placeholderText}>
                아직 생성된 프롬프트가 없습니다. 입력 내용과 결과 옵션을 선택한 뒤 생성하세요.
              </p>
            )}
          </div>
        </section>
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
    maxWidth: "1200px",
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
    maxWidth: "760px",
    color: "#4b5563",
    fontSize: "16px",
    lineHeight: 1.6
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
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
  sectionHeaderTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap"
  },
  sectionTitle: {
    margin: 0,
    marginBottom: "6px",
    fontSize: "22px"
  },
  sectionHint: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5
  },
  label: {
    display: "block",
    marginTop: "14px",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#334155"
  },
  inputBox: {
    width: "100%",
    minHeight: "92px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    lineHeight: 1.6,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box"
  },
  selectBox: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    background: "#ffffff",
    boxSizing: "border-box"
  },
  presetSection: {
    marginBottom: "16px"
  },
  presetHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "10px"
  },
  presetMetaWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    alignItems: "center"
  },
  presetLabel: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: "#334155"
  },
  customBadge: {
    display: "inline-block",
    borderRadius: "999px",
    background: "#fff7ed",
    color: "#c2410c",
    border: "1px solid #fdba74",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 700
  },
  activePresetBadge: {
    display: "inline-block",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 700
  },
  resetButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#334155",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: 700
  },
  presetWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px"
  },
  presetButton: {
    border: "1px solid #bfdbfe",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "none",
    transition: "all 0.15s ease"
  },
  presetButtonActive: {
    background: "#2563eb",
    color: "#ffffff",
    border: "1px solid #2563eb",
    boxShadow: "0 6px 18px rgba(37, 99, 235, 0.25)"
  },
  presetButtonText: {
    display: "inline-block",
    lineHeight: 1.2
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px"
  },
  summaryBox: {
    marginTop: "18px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0"
  },
  summaryLabel: {
    margin: 0,
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#475569"
  },
  summaryText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#0f172a",
    fontWeight: 600
  },
  examplesWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "16px"
  },
  exampleButton: {
    textAlign: "left",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    background: "#f8fafc",
    color: "#334155",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: 1.5,
    cursor: "pointer"
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "20px",
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
    minHeight: "240px",
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
  }
};

export default App;
