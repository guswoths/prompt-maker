import React from 'react'

const STEPS = [
  {
    icon: '🌐',
    title: '브라우저에서 접속',
    desc: '별도 설치 없이 이 웹사이트에 접속하기만 하면 됩니다.',
  },
  {
    icon: '⬇️',
    title: '최초 1회 모델 다운로드',
    desc: '첫 접속 시 AI 모델(약 2GB)이 브라우저 캐시에 자동 저장됩니다. 완료되면 알림으로 알려드립니다.',
  },
  {
    icon: '✍️',
    title: '목적 입력 후 생성',
    desc: '목적, 톤, 길이, 포함/금지 요소를 입력하고 생성 버튼을 누르세요.',
  },
  {
    icon: '📋',
    title: '복사 후 바로 사용',
    desc: '생성된 프롬프트를 복사해 ChatGPT, Claude 등 다른 AI에 붙여넣어 사용하세요.',
  },
]

const FAQS = [
  {
    q: '데이터가 외부로 전송되나요?',
    a: '아니요. AI 모델이 브라우저 안에서 실행되므로 입력한 내용이 외부 서버로 전송되지 않습니다.',
  },
  {
    q: '재접속할 때마다 2GB를 다시 받나요?',
    a: '아니요. 최초 1회만 다운로드되며 이후에는 브라우저 캐시에서 즉시 로드됩니다.',
  },
  {
    q: '어떤 브라우저를 써야 하나요?',
    a: 'Chrome 또는 Edge 최신 버전을 권장합니다. WebGPU를 지원하는 환경에서 더 빠르게 동작합니다.',
  },
  {
    q: '권장 사양이 있나요?',
    a: 'RAM 8GB 이상, 최신 CPU 환경을 권장합니다. GPU(NVIDIA/AMD)가 있으면 생성 속도가 훨씬 빨라집니다.',
  },
  {
    q: '생성 속도가 느려요.',
    a: '다른 탭과 앱을 최대한 닫아 메모리를 확보해 주세요. GPU가 없는 환경에서는 CPU만으로 실행되어 속도가 느릴 수 있습니다.',
  },
]

function LlmGuide() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">

      {/* 소개 */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-1">📖 사용 안내</h2>
        <p className="text-sm text-gray-400">설치 없이 브라우저에서 바로 AI 프롬프트를 생성할 수 있습니다.</p>
      </div>

      {/* 사용 방법 단계 */}
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-700">🚀 사용 방법</p>
        {STEPS.map((step, i) => (
          <div key={i} className="flex gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
            <div className="text-2xl shrink-0">{step.icon}</div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {i + 1}. {step.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 개인정보 보호 강조 */}
      <section className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">🔒 개인정보 보호</p>
        <p>이 서비스는 AI 모델이 <strong>브라우저 안에서만</strong> 실행됩니다.</p>
        <p className="mt-1">입력한 내용은 외부 서버로 전송되지 않으며, 인터넷 연결 없이도 모델 로드 후 사용 가능합니다.</p>
      </section>

      {/* FAQ */}
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-700">❓ 자주 묻는 질문</p>
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
            <p className="text-sm font-medium text-gray-700">Q. {faq.q}</p>
            <p className="text-xs text-gray-500 mt-1">A. {faq.a}</p>
          </div>
        ))}
      </section>

    </div>
  )
}

export default LlmGuide