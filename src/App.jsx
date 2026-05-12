import { useEffect, useMemo, useRef, useState } from "react";

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

const inputFieldLabels = {
  topic: "주제",
  details: "추가 설명",
  mustInclude: "반드시 포함할 요소"
};

const optionFieldLabels = {
  outputLanguage: "출력 언어",
  outputFormat: "결과 형식",
  outputLength: "길이",
  tone: "말투",
  audienceLevel: "대상 수준",
  purpose: "출력 목적"
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

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");

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
  const [copyErrorMessage, setCopyErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const globalResetButtonRef = useRef(null);
  const modalCardRef = useRef(null);
  const cancelResetButtonRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isResetModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      cancelResetButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsResetModalOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const modalElement = modalCardRef.current;
      if (!modalElement) {
        return;
      }

      const focusableElements = Array.from(
        modalElement.querySelectorAll(focusableSelector)
      ).filter((element) => {
        return !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true";
      });

      if (focusableElements.length === 0) {
        event.preventDefault();
        modalElement.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === firstElement || activeElement === modalElement) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isResetModalOpen]);

  useEffect(() => {
    if (isResetModalOpen) {
      return;
    }

    globalResetButtonRef.current?.focus();
  }, [isResetModalOpen]);

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

  const hasGeneratedPrompt = generatedPrompt.trim().length > 0;
  const hasErrorMessage = errorMessage.trim().length > 0;
  const hasToastState = toastMessage.trim().length > 0;
  const hasCopyErrorMessage = copyErrorMessage.trim().length > 0;

  const buildPreviewText = (value) => {
    const normalizedValue = String(value ?? "")
      .replace(/\s+/g, " ")
      .trim();

    if (!normalizedValue) {
      return "(비어 있음)";
    }

    return normalizedValue;
  };

  const changedFieldPreviews = useMemo(() => {
    const items = [];

    if (topic !== defaultInputState.topic) {
      items.push({
        label: inputFieldLabels.topic,
        previous: buildPreviewText(defaultInputState.topic),
        current: buildPreviewText(topic)
      });
    }

    if (details !== defaultInputState.details) {
      items.push({
        label: inputFieldLabels.details,
        previous: buildPreviewText(defaultInputState.details),
        current: buildPreviewText(details)
      });
    }

    if (mustInclude !== defaultInputState.mustInclude) {
      items.push({
        label: inputFieldLabels.mustInclude,
        previous: buildPreviewText(defaultInputState.mustInclude),
        current: buildPreviewText(mustInclude)
      });
    }

    if (outputLanguage !== defaultOptionState.outputLanguage) {
      items.push({
        label: optionFieldLabels.outputLanguage,
        previous: languageLabelMap[defaultOptionState.outputLanguage],
        current: languageLabelMap[outputLanguage]
      });
    }

    if (outputFormat !== defaultOptionState.outputFormat) {
      items.push({
        label: optionFieldLabels.outputFormat,
        previous: formatLabelMap[defaultOptionState.outputFormat],
        current: formatLabelMap[outputFormat]
      });
    }

    if (outputLength !== defaultOptionState.outputLength) {
      items.push({
        label: optionFieldLabels.outputLength,
        previous: lengthLabelMap[defaultOptionState.outputLength],
        current: lengthLabelMap[outputLength]
      });
    }

    if (tone !== defaultOptionState.tone) {
      items.push({
        label: optionFieldLabels.tone,
        previous: toneLabelMap[defaultOptionState.tone],
        current: toneLabelMap[tone]
      });
    }

    if (audienceLevel !== defaultOptionState.audienceLevel) {
      items.push({
        label: optionFieldLabels.audienceLevel,
        previous: audienceLabelMap[defaultOptionState.audienceLevel],
        current: audienceLabelMap[audienceLevel]
      });
    }

    if (purpose !== defaultOptionState.purpose) {
      items.push({
        label: optionFieldLabels.purpose,
        previous: purposeLabelMap[defaultOptionState.purpose],
        current: purposeLabelMap[purpose]
      });
    }

    if (hasGeneratedPrompt) {
      items.push({
        label: "생성된 프롬프트",
        previous: "(없음)",
        current: buildPreviewText(generatedPrompt)
      });
    }

    if (hasErrorMessage) {
      items.push({
        label: "오류 메시지",
        previous: "(없음)",
        current: buildPreviewText(errorMessage)
      });
    }

    if (hasToastState) {
      items.push({
        label: "복사 성공 알림",
        previous: "(없음)",
        current: buildPreviewText(toastMessage)
      });
    }

    if (hasCopyErrorMessage) {
      items.push({
        label: "복사 오류",
        previous: "(없음)",
        current: buildPreviewText(copyErrorMessage)
      });
    }

    return items;
  }, [
    topic,
    details,
    mustInclude,
    outputLanguage,
    outputFormat,
    outputLength,
    tone,
    audienceLevel,
    purpose,
    generatedPrompt,
    errorMessage,
    toastMessage,
    copyErrorMessage,
    hasGeneratedPrompt,
    hasErrorMessage,
    hasToastState,
    hasCopyErrorMessage
  ]);

  const resetImpactSummary = useMemo(() => {
    if (changedFieldPreviews.length === 0) {
      return "현재 초기화할 항목이 없습니다.";
    }

    return `현재 초기화 대상 ${changedFieldPreviews.length}개 항목`;
  }, [changedFieldPreviews]);

  const isInitialAppState = useMemo(() => {
    return (
      isDefaultInputState &&
      isDefaultOptionState &&
      generatedPrompt === "" &&
      errorMessage === "" &&
      toastMessage === "" &&
      copyErrorMessage === ""
    );
  }, [
    isDefaultInputState,
    isDefaultOptionState,
    generatedPrompt,
    errorMessage,
    toastMessage,
    copyErrorMessage
  ]);

  const clearToast = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage("");
    setIsToastVisible(false);
  };

  const showToast = (message) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);
    setIsToastVisible(true);

    toastTimerRef.current = window.setTimeout(() => {
      setIsToastVisible(false);

      window.setTimeout(() => {
        setToastMessage("");
      }, 180);
    }, 1600);
  };

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

  const openResetModal = () => {
    if (isInitialAppState || isGenerating) {
      return;
    }

    setIsResetModalOpen(true);
  };

  const closeResetModal = () => {
    setIsResetModalOpen(false);
  };

  const openGuideModal = () => {
    setIsGuideModalOpen(true);
  };

  const closeGuideModal = () => {
    setIsGuideModalOpen(false);
  };

  const resetAll = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setTopic(defaultInputState.topic);
    setDetails(defaultInputState.details);
    setMustInclude(defaultInputState.mustInclude);

    setOutputLanguage(defaultOptionState.outputLanguage);
    setOutputFormat(defaultOptionState.outputFormat);
    setOutputLength(defaultOptionState.outputLength);
    setTone(defaultOptionState.tone);
    setAudienceLevel(defaultOptionState.audienceLevel);
    setPurpose(defaultOptionState.purpose);

    setGeneratedPrompt("");
    setErrorMessage("");
    setCopyErrorMessage("");
    setToastMessage("");
    setIsToastVisible(false);
    setIsResetModalOpen(false);
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
    setCopyErrorMessage("");
    clearToast();

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

      const responseText = await response.text();
      let data = null;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (parseError) {
        console.error("API 응답 JSON 파싱 실패:", responseText);
        throw new Error("서버 응답이 올바른 JSON 형식이 아닙니다.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "프롬프트 생성에 실패했습니다.");
      }

      setGeneratedPrompt(data?.result || "");
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

    setCopyErrorMessage("");

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      showToast("복사 완료");
    } catch (error) {
      console.error(error);
      clearToast();
      setCopyErrorMessage("복사에 실패했습니다. 브라우저 권한 상태를 확인한 뒤 다시 시도해 주세요.");
    }
  };

  const styles = getStyles(isMobile);

  return (
    <>
      <div
        style={styles.page}
        aria-hidden={isResetModalOpen || isGuideModalOpen ? "true" : "false"}
      >
        <div style={styles.container}>
          <header style={styles.header}>
            <div style={styles.headerTop}>
              <div style={styles.brandWrap}>
                <div style={styles.logoRow}>
                  <div style={styles.logoMark}>P</div>
                  <div>
                    <h1 style={styles.brandTitle}>Prompt Maker</h1>
                    <p style={styles.brandSubtitle}>
                      프롬프트를 더 빠르고 정확하게 만드는 생성 도구
                    </p>
                  </div>
                </div>

                <p style={styles.description}>
                  왼쪽에는 AI에게 전달할 원재료를 적고, 오른쪽에서는 다른 AI가 어떤 결과를 내야 하는지 옵션으로 설계하세요.
                </p>
              </div>

              <div style={styles.headerActionGroup}>
                <button
                  onClick={openGuideModal}
                  style={styles.guideButton}
                  title="사용방법과 제작 이유 보기"
                >
                  사용방법 / 왜 만들었나요?
                </button>

                <button
                  ref={globalResetButtonRef}
                  onClick={openResetModal}
                  disabled={isInitialAppState || isGenerating}
                  style={{
                    ...styles.globalResetButton,
                    opacity: isInitialAppState || isGenerating ? 0.45 : 1,
                    cursor:
                      isInitialAppState || isGenerating ? "not-allowed" : "pointer"
                  }}
                  title="입력, 옵션, 결과를 모두 처음 상태로 되돌리기"
                >
                  전체 초기화
                </button>
              </div>
            </div>
          </header>

          <main style={styles.mainGrid}>
            <section style={styles.card}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionHeaderTop}>
                  <div>
                    <h2 style={styles.sectionTitle}>내가 제공할 내용</h2>
                    <p style={styles.sectionHint}>
                      다른 AI가 참고해야 할 주제, 맥락, 반드시 포함할 요소를 입력합니다.
                    </p>
                  </div>

                  <button
                    onClick={resetInputContent}
                    disabled={isDefaultInputState || isGenerating}
                    style={{
                      ...styles.resetButton,
                      opacity: isDefaultInputState || isGenerating ? 0.45 : 1,
                      cursor:
                        isDefaultInputState || isGenerating ? "not-allowed" : "pointer"
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
                  생성된 문장을 다른 AI에 붙여넣었을 때, 어떤 결과 형식으로 나오게 할지 설정합니다.
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
                      disabled={isDefaultOptionState || isGenerating}
                      style={{
                        ...styles.resetButton,
                        opacity: isDefaultOptionState || isGenerating ? 0.45 : 1,
                        cursor:
                          isDefaultOptionState || isGenerating ? "not-allowed" : "pointer"
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
                  <select
                    value={outputLanguage}
                    onChange={(event) => setOutputLanguage(event.target.value)}
                    style={styles.selectBox}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>결과 형식</label>
                  <select
                    value={outputFormat}
                    onChange={(event) => setOutputFormat(event.target.value)}
                    style={styles.selectBox}
                  >
                    <option value="explain">설명형</option>
                    <option value="bullet">불릿 요약</option>
                    <option value="step">단계별 가이드</option>
                    <option value="table">표 형식</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>길이</label>
                  <select
                    value={outputLength}
                    onChange={(event) => setOutputLength(event.target.value)}
                    style={styles.selectBox}
                  >
                    <option value="short">짧게</option>
                    <option value="medium">보통</option>
                    <option value="long">자세히</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>말투</label>
                  <select
                    value={tone}
                    onChange={(event) => setTone(event.target.value)}
                    style={styles.selectBox}
                  >
                    <option value="neutral">중립적</option>
                    <option value="friendly">친절한</option>
                    <option value="professional">전문적</option>
                    <option value="persuasive">설득형</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>대상 수준</label>
                  <select
                    value={audienceLevel}
                    onChange={(event) => setAudienceLevel(event.target.value)}
                    style={styles.selectBox}
                  >
                    <option value="general">일반인</option>
                    <option value="student">중고등학생</option>
                    <option value="college">대학생</option>
                    <option value="expert">전문가</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>출력 목적</label>
                  <select
                    value={purpose}
                    onChange={(event) => setPurpose(event.target.value)}
                    style={styles.selectBox}
                  >
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
              </div>

              {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}
            </section>
          </main>

          <section style={{ ...styles.card, marginTop: "20px" }}>
            <div
              style={{
                ...styles.sectionHeader,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "12px"
              }}
            >
              <div>
                <h2 style={styles.sectionTitle}>생성된 프롬프트</h2>
                <p style={styles.sectionHint}>
                  아래 문장은 결과 설명문이 아니라, 다른 AI에 붙여넣기 위한 최종 입력 프롬프트입니다.
                </p>
              </div>

              <div style={styles.resultHeaderActionColumn}>
                <div style={styles.resultHeaderActionWrap}>
                  {toastMessage && (
                    <div
                      aria-live="polite"
                      role="status"
                      style={{
                        ...styles.toast,
                        ...(isToastVisible ? styles.toastVisible : styles.toastHidden)
                      }}
                    >
                      {toastMessage}
                    </div>
                  )}

                  <button
                    onClick={handleCopy}
                    disabled={!generatedPrompt}
                    aria-describedby={copyErrorMessage ? "copy-inline-error" : undefined}
                    style={{
                      ...styles.secondaryButton,
                      opacity: generatedPrompt ? 1 : 0.5,
                      cursor: generatedPrompt ? "pointer" : "not-allowed"
                    }}
                  >
                    복사하기
                  </button>
                </div>

                {copyErrorMessage && (
                  <p
                    id="copy-inline-error"
                    role="alert"
                    style={styles.inlineCopyErrorText}
                  >
                    {copyErrorMessage}
                  </p>
                )}
              </div>
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

      {isGuideModalOpen && (
        <div
          style={styles.modalOverlay}
          onClick={closeGuideModal}
          aria-hidden="true"
        >
          <div
            style={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-modal-title"
            aria-describedby="guide-modal-description"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <p style={styles.guideBadge}>안내</p>
              <h2 id="guide-modal-title" style={styles.modalTitle}>
                사용방법 및 제작 이유
              </h2>
              <p id="guide-modal-description" style={styles.modalDescription}>
                이 도구를 처음 쓰는 분도 바로 이해할 수 있도록 사용 흐름과 만든 이유를 정리했습니다.
              </p>

              <div style={styles.guideContentBox}>
                <div style={styles.guideSection}>
                  <h3 style={styles.guideSectionTitle}>사용방법</h3>
                  <ol style={styles.guideList}>
                    <li style={styles.guideListItem}>
                      <strong>주제, 추가 설명, 포함 요소</strong>를 입력해 다른 AI가 참고해야 할 원재료를 정리합니다.
                    </li>
                    <li style={styles.guideListItem}>
                      <strong>결과 옵션</strong>을 선택해 다른 AI가 어떤 형식과 톤으로 답해야 하는지 설계합니다.
                    </li>
                    <li style={styles.guideListItem}>
                      <strong>프롬프트 생성</strong>을 누른 뒤, 생성된 문장을 복사해서 원하는 AI에 그대로 붙여넣습니다.
                    </li>
                  </ol>
                </div>

                <div style={styles.guideSection}>
                  <h3 style={styles.guideSectionTitle}>왜 만들었나요?</h3>
                  <p style={styles.guideParagraph}>
                    좋은 AI 결과는 좋은 입력 프롬프트에서 시작되지만, 그 문장을 매번 직접 짜는 일은 번거롭습니다.
                  </p>
                  <p style={styles.guideParagraph}>
                    특히 결과 형식, 길이, 대상 수준, 목적까지 일일이 문장에 반영하려면 시간과 토큰이 더 많이 듭니다.
                  </p>
                  <p style={styles.guideParagraph}>
                    이 도구는 사용자가 원재료와 옵션만 고르면, 다른 AI에서 바로 활용 가능한 입력 프롬프트를 빠르게 만들기 위해 제작했습니다.
                  </p>
                </div>
              </div>
            </div>

            <div style={styles.modalButtonRow}>
              <button onClick={closeGuideModal} style={styles.modalCancelButton}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {isResetModalOpen && (
        <div
          style={styles.modalOverlay}
          onClick={closeResetModal}
          aria-hidden="true"
        >
          <div
            ref={modalCardRef}
            style={styles.modalCard}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
            aria-describedby="reset-modal-description"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <p style={styles.modalBadge}>주의</p>
              <h2 id="reset-modal-title" style={styles.modalTitle}>
                전체 초기화를 진행할까요?
              </h2>
              <p id="reset-modal-description" style={styles.modalDescription}>
                아래 항목이 기본값으로 되돌아갑니다.
              </p>

              <div style={styles.resetImpactBox}>
                <p style={styles.resetImpactLabel}>현재 지워질 항목</p>
                <p style={styles.resetImpactSummary}>{resetImpactSummary}</p>

                {changedFieldPreviews.length > 0 && (
                  <ul style={styles.resetImpactList}>
                    {changedFieldPreviews.map((item) => (
                      <li key={item.label} style={styles.resetImpactListItem}>
                        <span style={styles.resetImpactItemLabel}>{item.label}</span>

                        <div style={styles.resetImpactCompareRow}>
                          <div style={styles.resetImpactTextBlock}>
                            <span style={styles.resetImpactTextLabel}>이전</span>
                            <span style={styles.resetImpactTextClamp}>{item.previous}</span>
                          </div>

                          <span style={styles.resetImpactArrow}>→</span>

                          <div style={styles.resetImpactTextBlock}>
                            <span style={styles.resetImpactTextLabel}>현재</span>
                            <span style={styles.resetImpactTextClamp}>{item.current}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div style={styles.modalButtonRow}>
              <button
                ref={cancelResetButtonRef}
                onClick={closeResetModal}
                style={styles.modalCancelButton}
              >
                취소
              </button>

              <button onClick={resetAll} style={styles.modalDangerButton}>
                모두 초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const getStyles = (isMobile) => ({
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
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap"
  },
  headerActionGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  brandWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap"
  },
  logoMark: {
    width: isMobile ? "56px" : "72px",
    height: isMobile ? "56px" : "72px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isMobile ? "28px" : "36px",
    fontWeight: 900,
    letterSpacing: "-0.04em",
    boxShadow: "0 14px 30px rgba(37, 99, 235, 0.28)"
  },
  brandTitle: {
    margin: 0,
    fontSize: isMobile ? "40px" : "56px",
    lineHeight: 1,
    letterSpacing: "-0.05em",
    fontWeight: 900,
    color: "#0f172a"
  },
  brandSubtitle: {
    margin: 0,
    marginTop: "8px",
    fontSize: isMobile ? "14px" : "17px",
    fontWeight: 700,
    color: "#2563eb",
    lineHeight: 1.4
  },
  description: {
    margin: 0,
    maxWidth: "760px",
    color: "#4b5563",
    fontSize: isMobile ? "15px" : "16px",
    lineHeight: 1.7
  },
  guideButton: {
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap"
  },
  globalResetButton: {
    border: "1px solid #fecaca",
    borderRadius: "12px",
    background: "#fff1f2",
    color: "#b91c1c",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap"
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
  resultHeaderActionColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: isMobile ? "stretch" : "flex-end",
    gap: "8px",
    minWidth: isMobile ? "100%" : "auto"
  },
  resultHeaderActionWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: isMobile ? "flex-start" : "flex-end"
  },
  toast: {
    padding: "10px 12px",
    borderRadius: "999px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: 1,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.18)",
    transition: "opacity 0.18s ease, transform 0.18s ease"
  },
  toastVisible: {
    opacity: 1,
    transform: "translateY(0)"
  },
  toastHidden: {
    opacity: 0,
    transform: "translateY(-4px)",
    pointerEvents: "none"
  },
  inlineCopyErrorText: {
    margin: 0,
    fontSize: "13px",
    lineHeight: 1.5,
    color: "#dc2626",
    textAlign: isMobile ? "left" : "right",
    maxWidth: "320px"
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
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000
  },
  modalCard: {
    width: "100%",
    maxWidth: "620px",
    maxHeight: "80vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.28)",
    outline: "none"
  },
  modalHeader: {
    marginBottom: "18px"
  },
  modalBadge: {
    display: "inline-block",
    margin: 0,
    marginBottom: "10px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#fff1f2",
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: 700
  },
  guideBadge: {
    display: "inline-block",
    margin: 0,
    marginBottom: "10px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: 700
  },
  modalTitle: {
    margin: 0,
    marginBottom: "10px",
    fontSize: "24px",
    lineHeight: 1.3,
    color: "#111827"
  },
  modalDescription: {
    margin: 0,
    color: "#4b5563",
    fontSize: "14px",
    lineHeight: 1.6
  },
  guideContentBox: {
    marginTop: "14px",
    borderRadius: "14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },
  guideSection: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  guideSectionTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#0f172a"
  },
  guideList: {
    margin: 0,
    paddingLeft: "20px",
    color: "#334155",
    lineHeight: 1.7,
    fontSize: "14px"
  },
  guideListItem: {
    marginBottom: "8px"
  },
  guideParagraph: {
    margin: 0,
    color: "#334155",
    fontSize: "14px",
    lineHeight: 1.7
  },
  resetImpactBox: {
    marginTop: "14px",
    borderRadius: "14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "14px"
  },
  resetImpactLabel: {
    margin: 0,
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#475569"
  },
  resetImpactSummary: {
    margin: 0,
    color: "#0f172a",
    fontSize: "14px",
    lineHeight: 1.6,
    fontWeight: 600
  },
  resetImpactList: {
    margin: "10px 0 0 0",
    paddingLeft: 0,
    listStyle: "none",
    color: "#334155",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  resetImpactListItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "12px",
    borderRadius: "10px",
    background: "#ffffff",
    border: "1px solid #e5e7eb"
  },
  resetImpactItemLabel: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#0f172a"
  },
  resetImpactCompareRow: {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
    alignItems: "start",
    gap: "8px"
  },
  resetImpactTextBlock: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  resetImpactTextLabel: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748b"
  },
  resetImpactTextClamp: {
    fontSize: "13px",
    lineHeight: 1.5,
    color: "#334155",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    lineClamp: 2,
    wordBreak: "break-word"
  },
  resetImpactArrow: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#94a3b8",
    paddingTop: isMobile ? "0" : "20px",
    justifySelf: isMobile ? "start" : "center",
    transform: isMobile ? "rotate(90deg)" : "none"
  },
  modalButtonRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "18px"
  },
  modalCancelButton: {
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#111827",
    padding: "11px 16px",
    fontSize: "14px",
    fontWeight: 700
  },
  modalDangerButton: {
    border: "1px solid #dc2626",
    borderRadius: "12px",
    background: "#dc2626",
    color: "#ffffff",
    padding: "11px 16px",
    fontSize: "14px",
    fontWeight: 700
  }
});

export default App;