import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Quiz } from '../types'
import { CarouselCard } from './CarouselCard'

interface Props {
  quizzes: Quiz[]
}

const CARD_W = 280
const GAP = 24
const STEP = CARD_W + GAP
const INTERVAL = 4000
// 十分大きなオフセットから始めることでジャンプバック不要
const INIT_OFFSET = 10000

export function Carousel({ quizzes }: Props) {
  const total = quizzes.length
  const navigate = useNavigate()
  const [index, setIndex] = useState(INIT_OFFSET)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setIndex((i) => i + 1)
    }, INTERVAL)
  }, [])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  const goTo = (realTarget: number) => {
    setIndex((cur) => {
      const curReal = cur % total
      const diff = (realTarget - curReal + total) % total
      return cur + (diff === 0 ? total : diff)
    })
  }

  const realIndex = index % total
  const containerW = CARD_W * 3 + GAP * 2
  const centerOffset = (containerW - CARD_W) / 2

  // 画面に映る範囲のカードだけ描画（全件描画を避けつつ連続性を保つ）
  const visibleCards = [-2, -1, 0, 1, 2].map((d) => {
    const absIdx = index + d
    const quiz = quizzes[((absIdx % total) + total) % total]
    return { absIdx, quiz }
  })

  return (
    <div className="relative">
      <button
        onClick={() => { setIndex((i) => i - 1); resetTimer() }}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        style={{ marginTop: '-16px' }}
        aria-label="前へ"
      >
        ‹
      </button>
      <button
        onClick={() => { setIndex((i) => i + 1); resetTimer() }}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        style={{ marginTop: '-16px' }}
        aria-label="次へ"
      >
        ›
      </button>
      <div className="overflow-hidden" style={{ width: containerW, margin: '0 auto' }}>
        <div
          className="relative py-4"
          style={{ height: 260 }}
        >
          {visibleCards.map(({ absIdx, quiz }) => {
            const isCenter = absIdx === index
            const x = centerOffset + (absIdx - index) * STEP

            return (
              <div
                key={absIdx}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  position: 'absolute',
                  top: 16,
                  left: x,
                  width: CARD_W,
                  height: 220,
                  transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s',
                }}
              >
                <CarouselCard
                  quiz={quiz}
                  dim={!isCenter}
                  onClick={() => isCenter ? navigate(`/quiz/${quiz.quiz_id}`, { state: { quiz } }) : goTo(((absIdx % total) + total) % total)}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-1">
        {quizzes.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${i === realIndex ? 'w-6 h-2 bg-blue-600' : 'w-2 h-2 bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  )
}
