import { HashRouter, Routes, Route } from 'react-router'
import { ToastContainer } from 'react-toastify'

import { ApiProvider } from './contexts/ApiContext'
import { AuthProvider } from './contexts/AuthContext'
import { Header } from './layouts/Header'
import { PrivateLayout } from './layouts/PrivateLayout'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

const App = () => {
  return (
    <ApiProvider>
      <AuthProvider>
        <ToastContainer />
        <HashRouter>
          <Header />
          <div className="container mx-auto px-4 bg-[#F7FFF7] min-h-screen">
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
