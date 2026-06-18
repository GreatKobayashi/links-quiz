import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { QuizPage } from './pages/QuizPage'
import { GeneratingPage } from './pages/GeneratingPage'
import { onAuthChanged, signInWithGoogle } from './firebase'
import type { User } from 'firebase/auth'

function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [signing, setSigning] = useState(false)

  useEffect(() => {
    return onAuthChanged(setUser)
  }, [])

  if (user === undefined) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">読み込み中...</div>
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-6">
        <h1 className="text-2xl font-bold text-gray-800">社員クイズ</h1>
        <p className="text-gray-500">yttlinks.co.jp のアカウントでログインしてください</p>
        <button
          onClick={async () => { setSigning(true); await signInWithGoogle().catch(() => setSigning(false)) }}
          disabled={signing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {signing ? 'ログイン中...' : 'Google でログイン'}
        </button>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz/generating" element={<GeneratingPage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
