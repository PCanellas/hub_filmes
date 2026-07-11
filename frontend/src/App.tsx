import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { AuthProvider } from './contexts/AuthContext'
import { RatingsProvider } from './contexts/RatingsContext'
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'
import { RatedMoviesPage } from './pages/RatedMoviesPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RatingsProvider>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/avaliados" element={<RatedMoviesPage />} />
            <Route path="/login" element={<AuthPage />} />
          </Routes>
        </RatingsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
