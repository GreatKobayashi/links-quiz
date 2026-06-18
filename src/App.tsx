import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { QuizPage } from './pages/QuizPage'
import { GeneratingPage } from './pages/GeneratingPage'

function App() {
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
