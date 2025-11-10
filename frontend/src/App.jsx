// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Cars from './pages/Cars'
import CarDetail from './pages/CarDetail'
import SellCar from './pages/SellCar'
import AdminDashboard from './pages/AdminDashboard'
import SellerListings from './pages/SellerListing'
import BuyerOrders from './pages/BuyerOrder'

function ProtectedRoute({ children, adminOnly }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated()) return <Navigate to="/login" replace />

  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />

  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:id" element={<CarDetail />} />

            <Route
              path="/my-listings"
              element={
                <ProtectedRoute>
                  <SellerListings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sell"
              element={
                <ProtectedRoute>
                  <SellCar />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <BuyerOrders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App