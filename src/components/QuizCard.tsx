import { Link } from 'react-router-dom'
import type { Quiz } from '../types'

interface Props {
  quiz: Quiz
}

export function QuizCard({ quiz }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col h-full border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="p-5 flex flex-col flex-1 min-h-0">
        <h3 className="font-bold text-gray-900 text-base mb-2">{quiz.title}</h3>
        <p className="text-gray-500 text-sm mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{quiz.question}</p>
        <div className="flex items-center gap-4 mt-auto mb-4 text-sm">
          <span className="text-green-600 font-medium">👍 {quiz.like_count}</span>
          <span className="text-red-400 font-medium">👎 {quiz.bad_count}</span>
        </div>
        <Link
          to={`/quiz/${quiz.quiz_id}`}
          state={{ quiz }}
          className="block text-center bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          挑戦する
        </Link>
      </div>
    </div>
  )
}
