// 역할: 생성된 프롬프트 결과 출력 + 복사 / 재생성 버튼
// 상태: 로딩 중 / 성공 / 실패 / 초기(결과 없음) 4가지 처리
import React from 'react'
function PromptResult({ result, isLoading, error, onRegenerate }) {

  const [copyStatus, setCopyStatus] = React.useState('idle') // idle | success | fail

  // 클립보드 복사 — 실패 시 수동 복사 안내
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result)
      setCopyStatus('success')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch {
      setCopyStatus('fail')
      setTimeout(() => setCopyStatus('idle'), 3000)
    }
  }

  // 로딩 중 상태
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">프롬프트 생성 중...</p>
      </div>
    )
  }

  // 오류 상태
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
        <p className="font-semibold mb-1">⚠️ 생성 실패</p>
        <p>{error}</p>
        <p className="mt-2 text-gray-500">로컬 LLM이 실행 중인지 확인 후 다시 시도해 주세요.</p>
      </div>
    )
  }

  // 초기 상태 (결과 없음)
  if (!result) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-300 text-sm">
        목적을 입력하고 생성 버튼을 눌러보세요 ✨
      </div>
    )
  }

  // 결과 출력 상태
  return (
    <div className="flex flex-col gap-3">

      {/* 결과 텍스트 영역 */}
      <textarea
        readOnly
        value={result}
        rows={10}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 resize-none focus:outline-none"
      />

      {/* 복사 / 재생성 버튼 */}
      <div className="flex gap-2">

        <button
          onClick={handleCopy}
          className="flex-1 py-2 rounded-lg text-sm font-semibold border border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors"
        >
          {copyStatus === 'idle' && '📋 복사하기'}
          {copyStatus === 'success' && '✅ 복사 완료!'}
          {copyStatus === 'fail' && '❌ 복사 실패 — 직접 선택해 복사하세요'}
        </button>

        <button
          onClick={onRegenerate}
          className="flex-1 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          🔄 재생성
        </button>

      </div>
    </div>
  )
}

export default PromptResult