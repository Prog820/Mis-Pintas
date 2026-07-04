import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { colors, fonts } from '../../styles/global'

const Register = () => {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function registrar() {
    if (!nombre || !email || !password) { setError('Completa todos los campos'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setCargando(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nombre } }
    })
    if (error) {
      setError('Error al registrarse. Intenta de nuevo.')
    } else {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) navigate('/')
      else {
        // Esperar a que la sesión se establezca
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            subscription.unsubscribe()
            navigate('/')
          }
        })
      }
    }
    setCargando(false)
  }

  async function loginGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: 'rgba(255,255,255,0.04)', color: colors.text,
    fontFamily: fonts.body, fontSize: '0.9rem', outline: 'none',
    marginBottom: 12,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 8 }}>✦ crea tu cuenta</p>
          <h1 style={{ fontFamily: fonts.title, fontSize: '2.2rem', color: colors.textSoft, fontWeight: 700 }}>Mis Pintas</h1>
        </div>

        <input type="text" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />
        <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />

        {error && <p style={{ color: '#ff6b8a', fontSize: '0.8rem', fontFamily: fonts.body, marginBottom: 12, textAlign: 'center' }}>{error}</p>}

        <button onClick={registrar} disabled={cargando} style={{ width: '100%', padding: '14px', borderRadius: 50, border: 'none', background: cargando ? 'rgba(80,128,255,0.4)' : 'linear-gradient(135deg, #2a4abf, #5080ff)', color: '#fff', fontSize: '0.95rem', fontFamily: fonts.body, cursor: cargando ? 'not-allowed' : 'pointer', marginBottom: 16, letterSpacing: '0.03em' }}>
          {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
          <span style={{ fontSize: '0.75rem', color: colors.textDim, fontFamily: fonts.body }}>o</span>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
        </div>

        <button onClick={loginGoogle} style={{ width: '100%', padding: '13px', borderRadius: 50, border: `1.5px solid ${colors.border}`, background: 'transparent', color: colors.textSoft, fontSize: '0.9rem', fontFamily: fonts.body, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
          <span style={{ fontSize: '1.1rem' }}>🇬</span> Continuar con Google
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: colors.textMuted, fontFamily: fonts.body }}>
          ¿Ya tienes cuenta?{' '}
          <span onClick={() => navigate('/login')} style={{ color: colors.accentLight, cursor: 'pointer' }}>Inicia sesión</span>
        </p>

      </div>
    </div>
  )
}

export default Register