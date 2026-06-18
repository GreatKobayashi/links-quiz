import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import type { Quiz } from '../types'
import { fetchQuizById, rateQuiz, updateQuizTags } from '../api/quizApi'

const CHOICE_KEYS = ['A', 'B', 'C', 'D'] as const

export function QuizPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState<Quiz | null>(location.state?.quiz ?? null)
  const [loading, setLoading] = useState(!quiz)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [voted, setVoted] = useState(false)
  const [tags, setTags] = useState<string[]>(location.state?.quiz?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [editingTags, setEditingTags] = useState(false)

  useEffect(() => {
    if (!quiz && id) {
      fetchQuizById(id)
        .then((data) => {
          if (data) { setQuiz(data); setTags(data.tags ?? []) }
          else navigate('/', { replace: true })
        })
        .catch((e: unknown) => setError(e instanceof Error ? e.message : 'エラーが発生しました'))
        .finally(() => setLoading(false))
    }
  }, [id, quiz, navigate])

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }
  if (!quiz) return null

  const answered = selected !== null
  const correct = selected === quiz.answer

  const handleSelect = (key: string) => {
    if (answered) return
    setSelected(key)
  }

  const handleAddTag = () => {
    const t = tagInput.trim()
    if (!t || tags.includes(t)) { setTagInput(''); return }
    const next = [...tags, t]
    setTags(next)
    setTagInput('')
    updateQuizTags(quiz!.quiz_id, next)
  }

  const handleRemoveTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag)
    setTags(next)
    updateQuizTags(quiz!.quiz_id, next)
  }

  const handleVote = async (vote: 'up' | 'down') => {
    if (voted) return
    setVoted(true)
    await rateQuiz(quiz.quiz_id, vote === 'up' ? 'good' : 'bad')
  }

  return (
    <div className="flex-1 bg-gray-50 px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">LINKSクイズ</h1>
        <p className="text-gray-500 text-lg">YTT LINKSの仲間をどれだけ知っている？</p>
      </div>
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-lg w-full mx-auto">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">{quiz.title}</p>
        <h2 className="text-lg font-bold text-gray-900 mb-4">{quiz.question}</h2>

        {tags.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-1.5">このクイズにつけられたタグ</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {CHOICE_KEYS.map((key) => {
            let cls = 'border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
            if (answered) {
              if (key === quiz.answer) cls = 'border-2 border-green-500 bg-green-50 text-green-700'
              else if (key === selected) cls = 'border-2 border-red-400 bg-red-50 text-red-600'
              else cls = 'border-2 border-gray-100 text-gray-400'
            }
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full text-left px-5 py-3.5 rounded-xl font-medium transition-all ${cls}`}
              >
                <span className="font-bold mr-3">{key}.</span>{quiz.choices[key]}
              </button>
            )
          })}
        </div>

        {answered && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="font-bold text-gray-900 mb-1">{correct ? '正解！' : '不正解...'}</p>
            <p className="text-gray-500 text-sm mb-1">
              正解は「{quiz.answer}. {quiz.choices[quiz.answer]}」でした
            </p>
            {quiz.reference && (
              <a
                href={quiz.reference}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-xs hover:underline"
              >
                パーソナルマップを確認する
              </a>
            )}

            <div className="mt-4">
              {!voted ? (
                <>
                  <p className="text-sm text-gray-500 mb-2">このクイズはどうでしたか？</p>
                  <div className="flex justify-between">
                    <button onClick={() => handleVote('up')} className="text-2xl hover:scale-110 transition-transform">👍</button>
                    <button onClick={() => handleVote('down')} className="text-2xl hover:scale-110 transition-transform">👎</button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-green-600">フィードバックありがとうございます！</p>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">このクイズにつけられたタグ</p>
                <button
                  onClick={() => setEditingTags((v) => !v)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {editingTags ? '完了' : '編集'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {tag}
                    {editingTags && (
                      <button onClick={() => handleRemoveTag(tag)} className="text-blue-400 hover:text-red-500 leading-none">×</button>
                    )}
                  </span>
                ))}
                {tags.length === 0 && !editingTags && (
                  <span className="text-xs text-gray-400">タグなし</span>
                )}
              </div>
              {editingTags && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="タグを追加"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                  >
                    追加
                  </button>
                </div>
              )}
            </div>

            <Link
              to="/"
              className="block text-center mt-4 border-2 border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              ホームに戻る
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
