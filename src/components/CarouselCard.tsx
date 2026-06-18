import type { Quiz } from '../types'

interface Props {
  quiz: Quiz
  onClick?: () => void
  dim?: boolean
}

export function CarouselCard({ quiz, onClick, dim = false }: Props) {
  return (
    <div
      onClick={onClick}
      className={[
        'rounded-2xl border bg-white overflow-hidden flex flex-col cursor-pointer h-full',
        dim
          ? 'opacity-30 shadow-md hover:opacity-45'
          : 'opacity-100 shadow-xl hover:shadow-2xl',
      ].join(' ')}
    >
      <div className="p-5 flex flex-col h-full">
        <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1">{quiz.title}</h3>
        <p className="text-gray-500 text-sm overflow-hidden line-clamp-2">{quiz.question}</p>
        <div className="mt-auto">
          <div className="flex flex-wrap gap-1 mb-2 overflow-hidden max-h-6">
            {quiz.tags?.map((tag) => (
              <span key={tag} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                {tag}
              </span>
            ))}
          </div>
          <div className="pt-2 border-t border-gray-100">
            <span className="text-green-600 font-medium text-sm">👍 {quiz.like_count}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
