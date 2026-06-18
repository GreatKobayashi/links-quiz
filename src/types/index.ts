export interface Member {
  id: string
  name: string
}

export interface Quiz {
  quiz_id: string
  title: string
  question: string
  choices: { A: string; B: string; C: string; D: string }
  answer: 'A' | 'B' | 'C' | 'D'
  reference?: string | null
  like_count: number
  bad_count: number
  tags?: string[]
}
