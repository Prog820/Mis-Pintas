import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import StarsBackground from './components/StarsBackground'
import BottomNav from './components/BottomNav'
import Inicio from './pages/Inicio'
import Armario from './pages/Armario'
import MisPintas from './pages/MisPintas'
import Calendario from './pages/Calendario'
import AsistenteIA from './pages/AsistenteIA'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Onboarding from './pages/auth/Onboarding'
import Configuracion from './pages/Configuracion'
import './App.css'

const App = () => {
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session)
      setCargando(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060b1a' }}>
      <p style={{ color: '#7a9ad0', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem' }}>Cargando...</p>
    </div>
  )

  const tieneNombre = sesion?.user?.user_metadata?.nombre

  return (
    <BrowserRouter>
      <StarsBackground />
      {sesion ? (
        <div className="app-layout">
          <main className="app-main">
            <div className="app-content">
              <Routes>
                <Route path="/" element={!tieneNombre ? <Navigate to="/onboarding" /> : <Inicio sesion={sesion} />} />
                <Route path="/armario" element={<Armario />} />
                <Route path="/pintas" element={<MisPintas />} />
                <Route path="/calendario" element={<Calendario />} />
                <Route path="/ia" element={<AsistenteIA />} />
                <Route path="/configuracion" element={<Configuracion sesion={sesion} />} />
                <Route path="/onboarding" element={!tieneNombre ? <Onboarding /> : <Navigate to="/" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </main>
          <BottomNav sesion={sesion} />
        </div>
      ) : (
        <div className="app-auth">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      )}
    </BrowserRouter>
  )
}

export default App