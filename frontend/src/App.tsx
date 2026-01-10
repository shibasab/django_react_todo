import { HashRouter, Routes, Route } from 'react-router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Header } from './components/layout/Header'
import { ApiProvider } from './contexts/ApiContext'
import { AuthProvider } from './contexts/AuthContext'
import { PrivateLayout } from './layouts/PrivateLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

export const App = () => {
  return (
    <ApiProvider>
      <AuthProvider>
        <ToastContainer />
        <HashRouter>
          <Header />
          <div className="container" style={{ background: '#F7FFF7' }}>
            <Routes>
              <Route
                path="/"
                element={
                  <PrivateLayout>
                    <DashboardPage />
                  </PrivateLayout>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicLayout>
                    <LoginPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicLayout>
                    <RegisterPage />
                  </PublicLayout>
                }
              />
            </Routes>
          </div>
        </HashRouter>
      </AuthProvider>
    </ApiProvider>
  )
}

export default App
