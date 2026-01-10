import { Fragment } from 'react'
import { HashRouter, Routes, Route } from 'react-router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { PrivateLayout } from '../layouts/PrivateLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { AuthProvider } from '../services/auth'
import { Header } from './layout/Header'

export const App = () => {
  return (
    <AuthProvider>
      <Fragment>
        <ToastContainer />
        <HashRouter>
          <Fragment>
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
          </Fragment>
        </HashRouter>
      </Fragment>
    </AuthProvider>
  )
}

export default App
