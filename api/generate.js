function buildPurposePromptTemplate({
  purpose,
  topic,
  details,
  mustInclude,
  outputFormat,
  outputLength,
  tone,
  audienceLevel,
  outputLanguage
}) {
  const formatLabelMap = {
    explain: outputLanguage === "en" ? "explanatory format" : "설명형 형식",
    bullet: outputLanguage === "en" ? "bullet-point format" : "불릿 형식",
    step: outputLanguage === "en" ? "step-by-step format" : "단계별 형식",
    table: outputLanguage === "en" ? "table format" : "표 형식"
  };

  const lengthLabelMap = {
    short: outputLanguage === "en" ? "concise but sharp" : "짧지만 밀도 높게",
    medium: outputLanguage === "en" ? "balanced in depth and brevity" : "핵심과 설명의 균형이 맞게",
    long: outputLanguage === "en" ? "detailed, specific, and practically useful" : "충분히 자세하고 구체적이며 실용적으로"
  };

  const toneLabelMap = {
    neutral: outputLanguage === "en" ? "neutral and clear" : "중립적이고 명확한 말투로",
    friendly: outputLanguage === "en" ? "friendly and easy to understand" : "친절하고 이해하기 쉽게",
    professional: outputLanguage === "en" ? "professional and trustworthy" : "전문적이고 신뢰감 있게",
    persuasive: outputLanguage === "en" ? "persuasive and high-impact" : "설득력 있고 임팩트 있게"
  };

  const audienceLabelMap = {
    general: outputLanguage === "en" ? "general audience" : "일반 독자 수준으로",
    student: outputLanguage === "en" ? "student audience" : "학생 수준으로",
    college: outputLanguage === "en" ? "college-level audience" : "대학생 수준으로",
    expert: outputLanguage === "en" ? "expert audience" : "실무자 또는 전문가 수준으로"
  };

  const formatText = formatLabelMap[outputFormat] || formatLabelMap.step;
  const lengthText = lengthLabelMap[outputLength] || lengthLabelMap.medium;
  const toneText = toneLabelMap[tone] || toneLabelMap.friendly;
  const audienceText = audienceLabelMap[audienceLevel] || audienceLabelMap.general;

  const detailLine = details
    ? outputLanguage === "en"
      ? `Reflect this context naturally: ${details}`
      : `이 추가 맥락을 자연스럽게 반영해줘: ${details}`
    : "";

  const mustIncludeLine = mustInclude
    ? outputLanguage === "en"
      ? `Be sure to include: ${mustInclude}`
      : `반드시 포함할 요소: ${mustInclude}`
    : "";

  const templates = {
    learning:
      outputLanguage === "en"
        ? [
            `Explain "${topic}" so that a ${audienceText} can understand it clearly.`,
            `Use a ${formatText}, keep the response ${lengthText}, and maintain a ${toneText} tone.`,
            "Prioritize conceptual clarity over jargon, and build understanding progressively from basic ideas to more specific points.",
            "Include intuitive explanations, at least one simple example, and common misconceptions or confusing points for beginners.",
            "Where helpful, distinguish core principles, practical interpretation, and real-world application.",
            detailLine,
            mustIncludeLine
          ]
        : [
            `${audienceText} ${topic}를 명확하게 이해할 수 있도록 설명해줘.`,
            `결과는 ${formatText}으로 작성하고, 분량은 ${lengthText}, 말투는 ${toneText} 유지해줘.`,
            "어려운 용어 나열보다 개념 이해를 우선하고, 기초 개념에서 핵심 포인트로 자연스럽게 이어지도록 구성해줘.",
            "직관적인 설명, 쉬운 예시 최소 1개, 초보자가 헷갈리기 쉬운 포인트나 오개념 방지 포인트를 포함해줘.",
            "필요하면 핵심 원리, 실제 해석, 활용 맥락을 구분해 이해가 더 잘되게 정리해줘.",
            detailLine,
            mustIncludeLine
          ],

    blog:
      outputLanguage === "en"
        ? [
            `Write a blog-ready draft about "${topic}".`,
            `Use a ${formatText}, keep it ${lengthText}, and maintain a ${toneText} tone for a ${audienceText}.`,
            "Make the writing engaging and readable, with a strong opening, natural section flow, and clear takeaways.",
            "Avoid robotic repetition and generic phrasing, and make the wording natural enough to serve as a publishable first draft.",
            "Use examples, contrasts, or small insights where they improve readability and retention.",
            detailLine,
            mustIncludeLine
          ]
        : [
            `${topic}에 대해 블로그 초안으로 바로 활용할 수 있게 작성해줘.`,
            `결과는 ${formatText}으로 작성하고, 분량은 ${lengthText}, 말투는 ${toneText}, 독자 수준은 ${audienceText} 맞춰줘.`,
            "도입부에서 흥미를 끌고, 소제목 흐름이 자연스럽고, 읽고 나서 핵심이 남도록 구성해줘.",
            "기계적인 반복 표현과 뻔한 문장을 피하고, 실제 게시 가능한 초안처럼 자연스럽고 매끄럽게 써줘.",
            "가독성과 기억에 도움이 된다면 예시, 비교, 작은 인사이트를 적절히 넣어줘.",
            detailLine,
            mustIncludeLine
          ],

    presentation:
      outputLanguage === "en"
        ? [
            `Organize "${topic}" for presentation use.`,
            `Use a ${formatText}, keep the response ${lengthText}, and write in a ${toneText} tone for a ${audienceText}.`,
            "Prioritize scanability, strong takeaway points, and clear message hierarchy.",
            "Structure the content so it can be quickly adapted into slide titles, key bullets, and speaker notes.",
            "Emphasize what the audience should remember, not just what should be listed.",
            detailLine,
            mustIncludeLine
          ]
        : [
            `${topic}를 발표 자료용으로 정리해줘.`,
            `결과는 ${formatText}으로 작성하고, 분량은 ${lengthText}, 말투는 ${toneText}, 대상은 ${audienceText} 맞춰줘.`,
            "한눈에 핵심이 보이도록 메시지 우선순위를 분명히 하고, 전달력이 높은 표현으로 정리해줘.",
            "슬라이드 제목, 핵심 불릿, 발표자 설명 포인트로 쉽게 전환할 수 있도록 구조화해줘.",
            "무엇을 나열할지보다 청중이 무엇을 기억해야 하는지를 중심으로 구성해줘.",
            detailLine,
            mustIncludeLine
          ],

    work:
      outputLanguage === "en"
        ? [
            `Prepare a work-oriented response about "${topic}".`,
            `Use a ${formatText}, keep it ${lengthText}, and use a ${toneText} tone suitable for a ${audienceText}.`,
            "Emphasize practical usefulness, decision-making value, clear criteria, trade-offs, risks, caveats, and action points where relevant.",
            "Write so the result can directly support reporting, planning, review, coordination, or internal communication.",
            "If relevant, distinguish what is essential, what is optional, and what requires caution.",
            detailLine,
            mustIncludeLine
          ]
        : [
            `${topic}에 대해 실무에 바로 활용할 수 있게 작성해줘.`,
            `결과는 ${formatText}으로 작성하고, 분량은 ${lengthText}, 말투는 ${toneText}, 독자 수준은 ${audienceText} 맞춰줘.`,
            "실행 가능성, 판단 기준, 트레이드오프, 리스크, 주의사항, 후속 액션 포인트가 필요한 경우 드러나도록 정리해줘.",
            "보고, 기획, 검토, 협업, 공유, 의사결정 지원에 바로 쓸 수 있는 밀도로 작성해줘.",
            "가능하면 무엇이 핵심이고, 무엇이 선택 사항이며, 무엇을 조심해야 하는지도 구분해줘.",
            detailLine,
            mustIncludeLine
          ],

    sns:
      outputLanguage === "en"
        ? [
            `Create SNS-ready content about "${topic}".`,
            `Use a ${formatText}, keep it ${lengthText}, and write in a ${toneText} tone for a ${audienceText}.`,
            "Prioritize a strong hook, fast readability, memorable phrasing, and shareability.",
            "Keep the core message sharp and compressed, but do not let it become vague or empty.",
            "If useful, include a punchy opening line, concise supporting points, and a closing line with impact.",
            detailLine,
            mustIncludeLine
          ]
        : [
            `${topic}에 대해 SNS용으로 임팩트 있게 작성해줘.`,
            `결과는 ${formatText}으로 작성하고, 분량은 ${lengthText}, 말투는 ${toneText}, 독자 수준은 ${audienceText} 맞춰줘.`,
            "첫 문장에서 시선을 끌고, 빠르게 읽히며, 기억에 남는 표현과 공유하기 쉬운 전달력을 우선해줘.",
            "짧게 압축하되 내용이 빈약해지지 않게 핵심 메시지는 선명하게 유지해줘.",
            "필요하면 강한 첫 문장, 짧은 핵심 포인트, 여운 있는 마무리를 포함해줘.",
            detailLine,
            mustIncludeLine
          ]
  };

  return (templates[purpose] || templates.learning).filter(Boolean).join("\n");
}

function buildQualityUpgradeRules({ outputLanguage, outputFormat, outputLength, purpose }) {
  const isEnglish = outputLanguage === "en";

  const commonRules = isEnglish
    ? [
        "Do not produce a shallow or generic prompt.",
        "Make the final prompt specific enough that another AI can generate a high-quality answer without guessing the missing structure.",
        "Ensure the prompt naturally includes scope, structure, quality criteria, inclusion priorities, and response expectations.",
        "Prefer concrete constraints over vague adjectives.",
        "Strengthen the prompt so the resulting answer is more useful, more structured, and more polished than a simple request."
      ]
    : [
        "피상적이거나 너무 일반적인 프롬프트를 만들지 마세요.",
        "다른 AI가 구조를 추측하지 않아도 고품질 결과를 낼 수 있을 정도로 구체적인 프롬프트를 만드세요.",
        "최종 프롬프트에는 범위, 구조, 품질 기준, 포함 우선순위, 기대 결과가 자연스럽게 녹아 있어야 합니다.",
        "막연한 형용사보다 구체적인 제약과 기준을 우선하세요.",
        "단순 요청문보다 더 유용하고, 더 구조적이며, 더 완성도 높은 결과가 나오도록 강화하세요."
      ];

  const formatRulesMap = {
    explain: isEnglish
      ? [
          "If explanation format is selected, encourage logical flow, conceptual clarity, and examples instead of flat definition dumping."
        ]
      : [
          "설명형 형식이면 정의만 나열하지 말고, 논리 흐름과 개념 연결, 예시를 포함하도록 유도하세요."
        ],
    bullet: isEnglish
      ? [
          "If bullet format is selected, avoid one-word bullets and make each point informative enough to stand alone."
        ]
      : [
          "불릿 형식이면 한 단어짜리 항목 나열을 피하고, 각 항목이 단독으로도 의미 있게 보이도록 유도하세요."
        ],
    step: isEnglish
      ? [
          "If step format is selected, make each step logically connected and practically actionable."
        ]
      : [
          "단계별 형식이면 각 단계가 논리적으로 이어지고 실제로 실행 가능하게 보이도록 유도하세요."
        ],
    table: isEnglish
      ? [
          "If table format is selected, make comparison axes explicit and ensure the table is useful, not decorative."
        ]
      : [
          "표 형식이면 비교 기준이 분명하고, 장식용 표가 아니라 실제로 판단에 도움이 되게 유도하세요."
        ]
  };

  const lengthRulesMap = {
    short: isEnglish
      ? [
          "Even when short length is selected, preserve clarity, usefulness, and key constraints."
        ]
      : [
          "짧은 분량이어도 핵심 제약과 유용성이 빠지지 않게 하세요."
        ],
    medium: isEnglish
      ? [
          "For medium length, balance readability with enough specificity to improve output quality."
        ]
      : [
          "중간 분량이면 읽기 쉬움과 구체성의 균형을 맞추세요."
        ],
    long: isEnglish
      ? [
          "For long length, increase depth meaningfully rather than padding with repetitive wording."
        ]
      : [
          "긴 분량이면 반복으로 길이만 늘리지 말고 실제 깊이와 세부 기준을 늘리세요."
        ]
  };

  const purposeQualityMap = {
    learning: isEnglish
      ? [
          "For learning use, prefer understanding, intuition, sequencing, examples, and misconception prevention."
        ]
      : [
          "학습 목적이면 이해, 직관, 순서, 예시, 오개념 방지를 우선하세요."
        ],
    blog: isEnglish
      ? [
          "For blog use, improve readability, engagement, section rhythm, and originality of phrasing."
        ]
      : [
          "블로그 목적이면 가독성, 흥미, 문단 리듬, 표현의 자연스러움을 강화하세요."
        ],
    presentation: isEnglish
      ? [
          "For presentation use, improve scanability, message hierarchy, and audience recall."
        ]
      : [
          "발표 목적이면 훑어보기 쉬움, 메시지 위계, 청중 기억성을 강화하세요."
        ],
    work: isEnglish
      ? [
          "For work use, strengthen criteria, actionability, decision support, and practical caveats."
        ]
      : [
          "실무 목적이면 판단 기준, 실행 가능성, 의사결정 지원, 실무상 주의점을 강화하세요."
        ],
    sns: isEnglish
      ? [
          "For SNS use, strengthen hook, compression, memorability, and shareable wording."
        ]
      : [
          "SNS 목적이면 후킹, 압축도, 기억성, 공유하기 쉬운 표현을 강화하세요."
        ]
  };

  return [
    ...commonRules,
    ...(formatRulesMap[outputFormat] || []),
    ...(lengthRulesMap[outputLength] || []),
    ...(purposeQualityMap[purpose] || [])
  ].join(" ");
}

function sanitizePromptResult(result, outputLanguage) {
  let cleaned = String(result || "")
    .replace(/^```[\w-]*\n?/g, "")
    .replace(/```$/g, "")
    .replace(/^["']|["']$/g, "")
    .trim();

  if (outputLanguage === "ko") {
    cleaned = cleaned
      .replace(/\p{Script=Han}+/gu, "")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\s+\n/g, "\n")
      .replace(/\n\s+/g, "\n")
      .trim();
  }

  return cleaned;
}

function looksLikeExplanation(result, outputLanguage) {
  if (outputLanguage === "en") {
    return /^(This|It|The topic|Below is|Here is)\b/i.test(result);
  }

  return /^(이|해당|위|아래)?\s*주제는|^(이것은|이는|다음은)|설명입니다\.?$|의미합니다\.?$|에 대한 설명/.test(result);
}

function rebuildAsInstructionPrompt({
  outputLanguage,
  normalizedTopic,
  normalizedDetails,
  normalizedMustInclude,
  outputFormat,
  outputLength,
  tone,
  audienceLevel,
  purpose
}) {
  const formatMapKo = {
    explain: "설명형",
    bullet: "불릿 형식",
    step: "단계별 형식",
    table: "표 형식"
  };

  const purposeExtraKo = {
    learning: "이해가 단계적으로 쌓이도록 설명해줘.",
    blog: "실제 블로그 초안처럼 자연스럽고 읽기 좋게 작성해줘.",
    presentation: "발표 자료나 발표 노트로 옮기기 쉽도록 정리해줘.",
    work: "실무에서 판단과 실행에 바로 도움이 되게 정리해줘.",
    sns: "짧고 강하게 전달되도록 임팩트를 살려줘."
  };

  if (outputLanguage === "en") {
    return [
      `Write about "${normalizedTopic}" as an instruction prompt for another AI, not as an explanation.`,
      `Use a ${outputFormat} format, ${outputLength} length, ${tone} tone, and target a ${audienceLevel} audience.`,
      `Purpose: ${purpose}.`,
      normalizedDetails ? `Additional context: ${normalizedDetails}` : "",
      normalizedMustInclude ? `Must include: ${normalizedMustInclude}` : "",
      "Return a structured, high-quality response request with clear scope, useful detail, and strong output guidance."
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `${normalizedTopic}에 대해 다른 AI가 고품질 결과를 만들 수 있도록 지시하는 프롬프트로 작성해줘.`,
    `결과는 ${formatMapKo[outputFormat] || "단계별 형식"}으로, 분량은 ${outputLength}, 말투는 ${tone}, 대상은 ${audienceLevel} 수준에 맞춰줘.`,
    `목적은 ${purpose}이야.`,
    normalizedDetails ? `추가 맥락: ${normalizedDetails}` : "",
    normalizedMustInclude ? `반드시 포함할 요소: ${normalizedMustInclude}` : "",
    purposeExtraKo[purpose] || "구체적이고 완성도 높게 작성해줘."
  ]
    .filter(Boolean)
    .join("\n");
}

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
            "Write the final prompt in English only.",
            "Do not include Korean.",
            "Return only one final prompt body that can be pasted directly into another AI."
          ].join(" ")
        : [
            "최종 프롬프트는 반드시 자연스러운 현대 한국어로만 작성하세요.",
            "불필요한 영어 혼용, 깨진 문자, 한자, 메타 설명을 포함하지 마세요.",
            "영문 고유명사나 기술 용어가 꼭 필요할 때만 제한적으로 사용하세요.",
            "출력은 설명문이 아니라 다른 AI에 그대로 붙여넣을 최종 프롬프트 본문이어야 합니다."
          ].join(" ");

    const formatInstructionMap = {
      explain: "다른 AI가 설명형 결과를 내도록 유도하되, 개념 흐름과 이해 보조 요소가 살아 있도록 설계하세요.",
      bullet: "다른 AI가 핵심을 불릿 형식으로 정리하되, 각 항목이 정보 밀도를 갖도록 설계하세요.",
      step: "다른 AI가 단계별 가이드 형식으로 답하되, 단계 간 흐름이 자연스럽도록 설계하세요.",
      table: "다른 AI가 표 형식으로 답하되, 비교 축과 판단 기준이 분명하도록 설계하세요."
    };

    const lengthInstructionMap = {
      short: "짧은 결과라도 핵심 제약과 품질 기준이 살아 있도록 설계하세요.",
      medium: "핵심과 설명의 균형이 좋도록 설계하세요.",
      long: "실질적인 깊이와 세부 기준이 충분히 드러나도록 설계하세요."
    };

    const toneInstructionMap = {
      neutral: "결과 말투는 중립적이고 명확하게 유도하세요.",
      friendly: "결과 말투는 친절하고 이해하기 쉽게 유도하세요.",
      professional: "결과 말투는 전문적이고 신뢰감 있게 유도하세요.",
      persuasive: "결과 말투는 설득력 있고 강조점이 살아나도록 유도하세요."
    };

    const audienceInstructionMap = {
      general: "대상 독자는 일반인 수준으로 설정하세요.",
      student: "대상 독자는 중고등학생 수준으로 설정하세요.",
      college: "대상 독자는 대학생 수준으로 설정하세요.",
      expert: "대상 독자는 실무자 또는 전문가 수준으로 설정하세요."
    };

    const outputFormatGuideMap = {
      explain: "정의만 나열하지 말고, 이해가 이어지도록 흐름과 예시를 고려하게 하세요.",
      bullet: "각 항목이 짧아도 의미가 분명하고 중복이 적도록 하세요.",
      step: "각 단계가 서로 이어지고 실제 실행이나 이해 순서에 맞도록 하세요.",
      table: "표의 열 제목, 비교 기준, 해석 포인트가 분명하도록 하세요."
    };

    const qualityRules = [
      "모호한 표현 대신 구체적 요청으로 바꾸세요.",
      "사용자 입력 의도를 해치지 않는 범위에서 부족한 문맥을 자연스럽게 보완하세요.",
      "최종 프롬프트 안에는 목표, 대상 독자, 원하는 결과 형식, 분량, 말투, 반드시 포함할 요소가 유기적으로 녹아 있어야 합니다.",
      "필요하면 다른 AI가 더 좋은 답을 하도록 구체적인 평가 기준, 구성 기준, 포함 범위, 제외 범위를 넣으세요.",
      "단순한 한 줄 요청문에서 끝내지 말고, 결과 품질이 실제로 올라가도록 구조와 제약을 보강하세요.",
      "사용자가 입력한 표현을 단순 반복하지 말고, 더 정확하고 고품질의 지시문으로 재구성하세요.",
      "최종 프롬프트는 바로 복사해 다른 AI에 넣을 수 있을 정도로 완성도가 높아야 합니다."
    ];

    const bannedRules = [
      "절대로 '다음은 프롬프트입니다', '아래와 같이', '설명해드리겠습니다' 같은 메타 문구를 쓰지 마세요.",
      "절대로 사용자의 주제에 대해 직접 설명하지 마세요.",
      "절대로 요약문, 해설문, 안내문, 서론, 배경설명 형태로 쓰지 마세요.",
      "따옴표로 전체를 감싸지 마세요.",
      "코드블록을 사용하지 마세요.",
      "번호를 붙여 프롬프트 외 설명을 추가하지 마세요.",
      "결과물 바깥에서 해설하거나 자기평가하지 마세요."
    ];

    const inferredEnhancementRules = [
      "주제가 교육 또는 학습형이면 쉬운 설명, 예시, 오개념 방지 포인트, 단계적 이해 흐름을 우선 고려하세요.",
      "주제가 글쓰기 또는 콘텐츠형이면 독자 흥미, 구조, 가독성, 표현 밀도를 고려하세요.",
      "주제가 업무 또는 실무형이면 실행 가능성, 비교 기준, 의사결정 포인트, 리스크와 주의사항을 고려하세요.",
      "주제가 SNS 또는 마케팅형이면 후킹, 간결성, 전달력, 차별화 포인트를 고려하세요."
    ];

    const userRequestBlock = [
      "[사용자 입력]",
      `- 주제: ${normalizedTopic}`,
      `- 추가 설명: ${normalizedDetails || "(없음)"}`,
      `- 반드시 포함할 요소: ${normalizedMustInclude || "(없음)"}`,
      "",
      "[출력 옵션]",
      `- 출력 언어: ${outputLanguage}`,
      `- 결과 형식: ${outputFormat}`,
      `- 길이: ${outputLength}`,
      `- 말투: ${tone}`,
      `- 대상 수준: ${audienceLevel}`,
      `- 목적: ${purpose}`
    ].join("\n");

    const purposePromptTemplate = buildPurposePromptTemplate({
      purpose,
      topic: normalizedTopic,
      details: normalizedDetails,
      mustInclude: normalizedMustInclude,
      outputFormat,
      outputLength,
      tone,
      audienceLevel,
      outputLanguage
    });

    const qualityUpgradeRules = buildQualityUpgradeRules({
      outputLanguage,
      outputFormat,
      outputLength,
      purpose
    });

    const systemPrompt = [
      "당신은 사용자의 요구를 분석해 다른 생성형 AI의 성능을 최대한 끌어올리는 고급 프롬프트 엔지니어입니다.",
      "당신의 임무는 답변 자체를 작성하는 것이 아니라, 다른 AI가 작업을 수행하도록 지시하는 최종 입력 프롬프트를 설계하는 것입니다.",
      "당신이 출력해야 하는 것은 오직 다른 AI에게 내리는 작업 지시문입니다.",
      "절대로 사용자의 주제에 대해 직접 설명하지 마세요.",
      "절대로 요약문, 해설문, 안내문, 서론, 배경설명 형태로 쓰지 마세요.",
      "최종 결과는 반드시 명령형 또는 요청형 표현으로 작성하세요.",
      "평서형 설명문이나 주제 자체를 풀이하는 문장은 허용되지 않습니다.",
      "결과가 너무 단순하거나 짧은 요청문에 그치지 않도록, 실제 출력 품질이 올라가게 구체성과 구조를 강화하세요.",
      languageInstruction,
      formatInstructionMap[outputFormat] || formatInstructionMap.step,
      lengthInstructionMap[outputLength] || lengthInstructionMap.medium,
      toneInstructionMap[tone] || toneInstructionMap.friendly,
      audienceInstructionMap[audienceLevel] || audienceInstructionMap.general,
      outputFormatGuideMap[outputFormat] || outputFormatGuideMap.step,
      qualityUpgradeRules,
      ...qualityRules,
      ...bannedRules,
      ...inferredEnhancementRules,
      "출력은 오직 최종 프롬프트 본문만 허용됩니다.",
      "출력 전에 스스로 검토하세요. 1) 설명문이 아닌가? 2) 다른 AI에게 지시하는 문장인가? 3) 품질 기준이 충분한가? 4) 바로 복사해서 붙여넣을 수 있는가?"
    ].join(" ");

    const userPrompt = [
      "아래 정보를 바탕으로, 다른 AI에 그대로 붙여넣어 사용할 수 있는 단일 최종 프롬프트를 작성하세요.",
      "중요: 주제에 대해 직접 설명하지 말고, 반드시 다른 AI에게 작업을 지시하는 문장으로만 작성하세요.",
      "결과는 해설문이 아니라 명령문이어야 합니다.",
      "반드시 다른 AI가 실제로 수행해야 할 작업을 요청하는 형태로 작성하세요.",
      "한 줄짜리 단순 요청으로 끝내지 말고, 더 좋은 답변이 나오도록 구조와 품질 기준을 보강하세요.",
      "출력은 한 개의 완성된 최종 프롬프트 본문만 반환하세요.",
      "잘못된 예: '뉴턴의 운동법칙은 물체의 운동을 설명하는 법칙입니다.'",
      "올바른 예: '중학생이 이해할 수 있도록 뉴턴의 운동법칙을 쉬운 비유와 일상 예시 2개를 포함해 단계별로 설명해줘.'",
      "잘못된 예: 'React와 Vite의 차이에 대한 설명입니다.'",
      "올바른 예: '초보 개발자가 이해할 수 있도록 React와 Vite의 차이를 표와 예시를 포함해 설명해줘.'",
      "아래 purpose 전용 작성 방향을 최우선으로 반영하세요.",
      "",
      "[purpose 전용 템플릿]",
      purposePromptTemplate,
      "",
      userRequestBlock
    ].join("\n");

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.45,
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
    result = sanitizePromptResult(result, outputLanguage);

    if (looksLikeExplanation(result, outputLanguage)) {
      result = rebuildAsInstructionPrompt({
        outputLanguage,
        normalizedTopic,
        normalizedDetails,
        normalizedMustInclude,
        outputFormat,
        outputLength,
        tone,
        audienceLevel,
        purpose
      });

      result = sanitizePromptResult(result, outputLanguage);
    }

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