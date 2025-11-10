import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ThemeToggle from '../common/ThemeToggle'
import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/cars?q=${search}`)
      setSearch('')
      setMobileOpen(false)
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          CarMarket
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder="Search cars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
          <button className="bg-blue-600 text-white px-6 py-2 rounded-r-lg hover:bg-blue-700">
            Search
          </button>
        </form>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/cars" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
            Cars
          </Link>

          {user?.role === 'seller' && (
            <>
              <Link to="/my-listings" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                My Listings
              </Link>
              <Link to="/sell" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                Sell
              </Link>
            </>
          )}

          {user?.role === 'buyer' && (
            <Link to="/my-orders" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Orders
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
              Admin
            </Link>
          )}

          {user ? (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Hi, {user.name.split(' ')[0]}
              </span>
              <button onClick={logout} className="text-red-600 hover:text-red-700 font-medium">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Register
              </Link>
            </>
          )}

          <ThemeToggle />
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
              />
            </form>

            <nav className="space-y-3 pb-4">
              <Link to="/cars" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 dark:text-gray-300">
                All Cars
              </Link>

              {user?.role === 'seller' && (
                <>
                  <Link to="/my-listings" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 dark:text-gray-300">
                    My Listings
                  </Link>
                  <Link to="/sell" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 dark:text-gray-300">
                    Sell Car
                  </Link>
                </>
              )}

              {user?.role === 'buyer' && (
                <Link to="/my-orders" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 dark:text-gray-300">
                  My Orders
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 dark:text-gray-300">
                  Admin Panel
                </Link>
              )}

              {user ? (
                <>
                  <div className="text-sm text-gray-600 dark:text-gray-400 py-2">
                    Hi, {user.name.split(' ')[0]}
                  </div>
                  <button onClick={logout} className="block w-full text-left py-2 text-red-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 dark:text-gray-300">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-2 text-blue-600 font-medium">
                    Register
                  </Link>
                </>
              )}

              <div className="pt-4 border-t dark:border-gray-700">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}