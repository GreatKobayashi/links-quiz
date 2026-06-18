import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Quiz } from '../types'
import { searchQuizzes } from '../api/quizApi'
import { CarouselCard } from './CarouselCard'

type Mode = 'keyword' | 'tag'

export function QuizSearch() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('keyword')
  const [input, setInput] = useState('')
  const [results, setResults] = useState<Quiz[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [moreLoading, setMoreLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [lastParams, setLastParams] = useState<{ keyword?: string; tags?: string } | null>(null)
  const [allLoaded, setAllLoaded] = useState(false)

  const runSearch = (params: { keyword?: string; tags?: string }, p: number, append: boolean) => {
    const setter = append ? setMoreLoading : setLoading
    setter(true)
    setError(null)
    searchQuizzes({ ...params, page: p })
      .then(({ items, has_next }) => {
        setResults((prev) => {
          const existingIds = new Set((prev ?? []).map((q) => q.quiz_id))
          const newItems = items.filter((q) => !existingIds.has(q.quiz_id))
          return append && prev ? [...prev, ...newItems] : newItems
        })
        setAllLoaded(!has_next)
        setLastParams(params)
        setPage(p)
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'エラーが発生しました'))
      .finally(() => setter(false))
  }

  const handleSearch = () => {
    const value = input.trim()
    if (!value) return
    const params = mode === 'keyword' ? { keyword: value } : { tags: value }
    runSearch(params, 0, false)
  }

  const handleMore = () => {
    if (!lastParams) return
    runSearch(lastParams, page + 1, true)
  }

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🔍</span>
        <h2 className="text-xl font-bold text-gray-900">クイズを探す</h2>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex gap-2 mb-3">
          {(['keyword', 'tag'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setInput(''); setResults(null); setLastParams(null); setAllLoaded(false) }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                mode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {m === 'keyword' ? 'キーワード' : 'タグ'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={mode === 'keyword' ? 'キーワードを入力' : 'タグを入力（例：スポーツ）'}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            検索
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <span className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && <p className="text-red-500 text-sm py-4 text-center">{error}</p>}
        {results !== null && !loading && (
          results.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">該当するクイズが見つかりませんでした</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {results.map((quiz) => (
                  <CarouselCard
                    key={quiz.quiz_id}
                    quiz={quiz}
                    onClick={() => navigate(`/quiz/${quiz.quiz_id}`, { state: { quiz } })}
                  />
                ))}
              </div>
              <div className="flex justify-center mt-5">
                {allLoaded ? (
                  <p className="text-gray-400 text-sm">全件検索しました</p>
                ) : (
                  <button
                    onClick={handleMore}
                    disabled={moreLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-blue-600 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    {moreLoading && <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                    もっと検索
                  </button>
                )}
              </div>
            </>
          )
        )}
      </div>
    </section>
  )
}
