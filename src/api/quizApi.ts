import type { Quiz } from '../types'
import { getValidToken } from '../firebase'

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:8080'
  : (import.meta.env.VITE_API_BASE ?? '')

async function authHeaders(): Promise<Record<string, string>> {
  return {}
}

export async function fetchTopQuizzes(): Promise<Quiz[]> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const res = await fetch(`${API_BASE}/quizzes?sort=top_rated&limit=10&created_after=${oneWeekAgo}`, {
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error(`HTTPエラー: ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : data.items
}

export async function fetchLatestQuizzes(): Promise<Quiz[]> {
  const res = await fetch(`${API_BASE}/quizzes?sort=latest&limit=10`, {
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error(`HTTPエラー: ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : data.items
}

export async function fetchQuizById(id: string): Promise<Quiz | null> {
  const res = await fetch(`${API_BASE}/quizzes/${id}`, {
    headers: await authHeaders(),
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`HTTPエラー: ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data[0] ?? null : data
}

export async function generateQuiz(
  onProgress: (message: string) => void,
  targetName?: string
): Promise<Quiz> {
  const sessionId = crypto.randomUUID()
  const userId = 'user-001'

  const res = await fetch(`${API_BASE}/quiz/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...await authHeaders() },
    body: JSON.stringify({ session_id: sessionId, user_id: userId, target: targetName ?? null }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`HTTPエラー: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      let json = ''
      if (line.startsWith('data:')) {
        json = line.slice(5).trim()
      } else {
        json = line.trim()
      }
      if (!json) continue

      let event: { type: string; result?: unknown; message?: string }
      try {
        event = JSON.parse(json)
      } catch {
        continue
      }

      if (event.type === 'inprocess') {
        onProgress(event.message ?? '')
      } else if (event.type === 'done') {
        return event.result as Quiz
      } else if (event.type === 'error') {
        throw new Error(event.message ?? 'Unknown error')
      }
    }
  }

  throw new Error('クイズの生成に失敗しました')
}

export async function searchQuizzes(params: { keyword?: string; tags?: string; page?: number }): Promise<{ items: Quiz[]; has_next: boolean }> {
  const query = new URLSearchParams()
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.tags) query.set('tags', params.tags)
  if (params.page != null) query.set('page', String(params.page))
  const res = await fetch(`${API_BASE}/quizzes?${query.toString()}`, {
    headers: await authHeaders(),
  })
  if (!res.ok) throw new Error(`HTTPエラー: ${res.status}`)
  return res.json()
}

export async function updateQuizTags(quizId: string, tags: string[]): Promise<void> {
  await fetch(`${API_BASE}/quiz/${quizId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...await authHeaders() },
    body: JSON.stringify({ tags }),
  })
}

export async function rateQuiz(quizId: string, rating: 'good' | 'bad'): Promise<void> {
  const userId = 'user-001'
  await fetch(`${API_BASE}/quiz/${quizId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...await authHeaders() },
    body: JSON.stringify({ user_id: userId, rating }),
  })
}
