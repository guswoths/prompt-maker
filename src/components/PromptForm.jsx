import React from 'react'

const TONE_OPTIONS = ['정중', '캐주얼', '단호', '친근', '전문적']
const LENGTH_OPTIONS = ['짧게', '보통', '길게']

function PromptForm({ onGenerate, isLoading, engineReady }) {
  const [form, setForm] = React.useState({
    purpose: '',
    tone: '정중',
    length: '보통',
    include: '',
    exclude: '',
  })

  const canGenerate = form.purpose.trim().length > 0 && engineReady

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!canGenerate || isLoading) return
    onGenerate(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="purpose" className="block text-sm font-semibold text-gray-700 mb-1">
          목적 <span className="text-red-500">*</span>
        </label>
        <input
          id="purpose"
          name="purpose"
          type="text"
          placeholder="예: 이메일 작성, 요약, 번역, 아이디어 생성"
          value={form.purpose}
          onChange={e => handleChange('purpose', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">톤 / 말투</label>
        <div className="flex gap-2 flex-wrap">
          {TONE_OPTIONS.map(tone => (
            <button
              key={tone}
              type="button"
              onClick={() => handleChange('tone', tone)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors
                ${form.tone === tone
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">길이</label>
        <div className="flex gap-2">
          {LENGTH_OPTIONS.map(len => (
            <button
              key={len}
              type="button"
              onClick={() => handleChange('length', len)}
              className={`px-4 py-1 rounded-full text-sm border transition-colors
                ${form.length === len
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
            >
              {len}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="include" className="block text-sm font-semibold text-gray-700 mb-1">포함 요소</label>
        <input
          id="include"
          name="include"
          type="text"
          placeholder="예: 인사말, 구체적 수치, 마무리 문장"
          value={form.include}
          onChange={e => handleChange('include', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <label htmlFor="exclude" className="block text-sm font-semibold text-gray-700 mb-1">금지 요소</label>
        <input
          id="exclude"
          name="exclude"
          type="text"
          placeholder="예: 개인정보, 특정 표현, 영어 단어"
          value={form.exclude}
          onChange={e => handleChange('exclude', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <button
        type="submit"
        disabled={!canGenerate || isLoading}
        className={`w-full py-2 rounded-lg font-semibold text-white transition-colors
          ${canGenerate && !isLoading
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-300 cursor-not-allowed'}`}
      >
        {isLoading ? '생성 중...' : !engineReady ? 'AI 모델 로딩 중...' : '프롬프트 생성'}
      </button>
    </form>
  )
}

export default PromptForm