import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Quiz } from '../types'
import { fetchTopQuizzes, fetchLatestQuizzes } from '../api/quizApi'
import { Carousel } from '../components/Carousel'
import { QuizSearch } from '../components/QuizSearch'

export function HomePage() {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [latestQuizzes, setLatestQuizzes] = useState<Quiz[]>([])
  const [latestLoading, setLatestLoading] = useState(true)
  const [latestError, setLatestError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [targetName, setTargetName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchTopQuizzes()
      .then((data) => setQuizzes(data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'エラーが発生しました'))
      .finally(() => setLoading(false))
    fetchLatestQuizzes()
      .then((data) => setLatestQuizzes(data))
      .catch((e: unknown) => setLatestError(e instanceof Error ? e.message : 'エラーが発生しました'))
      .finally(() => setLatestLoading(false))
  }, [])

  const openModal = () => {
    setTargetName('')
    setShowModal(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }
  const closeModal = () => setShowModal(false)

  const handleGenerate = (name?: string) => {
    setShowModal(false)
    navigate('/quiz/generating', { state: { targetName: name?.trim() || null } })
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">LINKSクイズ</h1>
          <p className="text-gray-500 text-lg">YTT LINKSの仲間をどれだけ知っている？</p>
        </div>

        <div className="text-center pt-4 mb-10">
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <span className="text-xl">✨</span>
            クイズを作る
          </button>
        </div>

        <QuizSearch />

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-bold text-gray-900">評価の高いクイズ</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center text-red-500 py-8">{error}</p>
          ) : (
            <Carousel quizzes={quizzes} />
          )}
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🆕</span>
            <h2 className="text-xl font-bold text-gray-900">最新のクイズ</h2>
          </div>
          {latestLoading ? (
            <div className="flex justify-center py-16">
              <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : latestError ? (
            <p className="text-center text-red-500 py-8">{latestError}</p>
          ) : (
            <Carousel quizzes={latestQuizzes} />
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full z-10">
            <h2 className="text-lg font-bold text-gray-900 mb-1">だれのクイズを作りますか？</h2>
            <p className="text-sm text-gray-500 mb-5">空欄のままにするとランダムに決まります</p>

            <input
              ref={inputRef}
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate(targetName)}
              placeholder="名前と苗字の間には何も入れないでください"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
            />

            <button
              onClick={() => handleGenerate(targetName)}
              className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {targetName.trim() ? `「${targetName.trim()}」さんのクイズを作る` : 'ランダムで作る'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
