import type { Member, Quiz } from '../types'

export const mockMembers: Member[] = [
  { id: 'm1', name: '田中さん' },
  { id: 'm2', name: '佐藤さん' },
  { id: 'm3', name: '鈴木さん' },
  { id: 'm4', name: '山田さん' },
]

export const mockQuizzes: Quiz[] = [
  {
    quiz_id: 'q1',
    title: '田中さんクイズ',
    question: '田中さんの出身地はどこでしょう？',
    choices: { A: '青森', B: '北海道', C: '岩手', D: '宮城' },
    answer: 'B',
    reference: 'https://drive.google.com/example1',
    like_count: 28,
    bad_count: 4,
  },
  {
    quiz_id: 'q2',
    title: '佐藤さんクイズ',
    question: '佐藤さんの趣味は何でしょう？',
    choices: { A: '料理', B: '読書', C: '旅行', D: 'ゲーム' },
    answer: 'B',
    reference: 'https://drive.google.com/example2',
    like_count: 22,
    bad_count: 6,
  },
  {
    quiz_id: 'q3',
    title: '鈴木さんクイズ',
    question: '鈴木さんが週末に楽しんでいるスポーツは何でしょう？',
    choices: { A: '野球', B: 'テニス', C: 'バスケ', D: 'サッカー' },
    answer: 'D',
    reference: 'https://drive.google.com/example3',
    like_count: 15,
    bad_count: 4,
  },
  {
    quiz_id: 'q4',
    title: '山田さんクイズ',
    question: '山田さんはどこの出身でしょう？',
    choices: { A: '奈良', B: '大阪', C: '滋賀', D: '京都' },
    answer: 'D',
    reference: 'https://drive.google.com/example4',
    like_count: 38,
    bad_count: 3,
  },
]
