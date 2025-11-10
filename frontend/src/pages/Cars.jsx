import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api'

export default function Cars() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/cars?search=${query}`)
        setCars(res.data.cars)
      } catch (err) {
        setError('Failed to load cars')
      } finally {
        setLoading(false)
      }
    }
    fetchCars()
  }, [query])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (error) return <p className="text-red-600 text-center">{error}</p>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {query ? `Search: "${query}"` : 'All Cars'}
      </h1>

      {cars.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400 py-10">
          No cars found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <Link
              key={car._id}
              to={`/cars/${car._id}`}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={car.images[0] || '/placeholder.jpg'}
                alt={car.make}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg">{car.make} {car.model}</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ETB {car.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {car.year} • {car.mileage.toLocaleString()} km • {car.location}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}