import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { generateQuiz } from '../api/quizApi'

const STEP_PCT = 15
const MAX_AUTO_PCT = 85

export function GeneratingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const targetName: string | null = (location.state as { targetName?: string | null })?.targetName ?? null
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('クイズを生成しています...')
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)
  const progressRef = useRef(0)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const eventCountRef = { current: 0 }

    const onProgress = (msg: string) => {
      eventCountRef.current += 1
      if (eventCountRef.current >= 2) {
        progressRef.current = Math.min(progressRef.current + STEP_PCT, MAX_AUTO_PCT)
        setProgress(progressRef.current)
      }
      setMessage(msg)
    }

    generateQuiz(onProgress, targetName ?? undefined)
      .then((quiz) => {
        setProgress(100)
        setMessage('完成！')
        setTimeout(() => {
          navigate(`/quiz/${quiz.quiz_id}`, { state: { quiz }, replace: true })
        }, 400)
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'エラーが発生しました'
        setError(msg)
      })
  }, [navigate, targetName])

  return (
    <div className="flex-1 bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-4xl">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">クイズの作成に失敗しました</h2>
            <p className="text-sm text-gray-500 mb-8">{error}</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="inline-block bg-blue-600 text-white text-sm px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              ホームに戻る
            </button>
          </>
        ) : (
          <>
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">AIがクイズを作成中</h2>
            <p className="text-sm text-gray-500 mb-8 min-h-[1.25rem]">{message}</p>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-blue-600 font-semibold text-lg">{progress}%</p>
          </>
        )}
      </div>
    </div>
  )
}
