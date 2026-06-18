import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="YTT LINKS" className="h-10 w-auto" />
        </Link>
        <nav className="flex gap-4">
          <Link to="/" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">
            ホーム
          </Link>
        </nav>
      </div>
    </header>
  )
}
