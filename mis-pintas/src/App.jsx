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
      <div className="app-wrapper">
        <StarsBackground />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={!sesion ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!sesion ? <Register /> : <Navigate to="/" />} />
            <Route path="/onboarding" element={sesion && !tieneNombre ? <Onboarding /> : <Navigate to="/" />} />
            <Route path="/configuracion" element={sesion ? <Configuracion sesion={sesion} /> : <Navigate to="/login" />} />
            <Route path="/" element={
              !sesion ? <Navigate to="/login" /> :
              !tieneNombre ? <Navigate to="/onboarding" /> :
              <Inicio sesion={sesion} />
            } />
            <Route path="/armario" element={sesion ? <Armario /> : <Navigate to="/login" />} />
            <Route path="/pintas" element={sesion ? <MisPintas /> : <Navigate to="/login" />} />
            <Route path="/calendario" element={sesion ? <Calendario /> : <Navigate to="/login" />} />
            <Route path="/ia" element={sesion ? <AsistenteIA /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        {sesion && <BottomNav />}
      </div>
    </BrowserRouter>
  )
}

export default App