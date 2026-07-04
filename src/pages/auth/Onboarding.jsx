import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { colors, fonts } from '../../styles/global'

const Onboarding = () => {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function guardarNombre() {
    if (!nombre.trim()) { setError('Escribe tu nombre'); return }
    setCargando(true)
    const { error } = await supabase.auth.updateUser({
      data: { nombre: nombre.trim() }
    })
    if (error) setError('Error guardando tu nombre. Intenta de nuevo.')
    else navigate('/', { state: { bienvenida: true, nombre: nombre.trim() } })
    setCargando(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>

        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 12 }}>✦ bienvenida</p>
        <h1 style={{ fontFamily: fonts.title, fontSize: '2rem', color: colors.textSoft, fontWeight: 700, marginBottom: 12 }}>Mis Pintas</h1>
        <p style={{ fontSize: '1rem', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 40, lineHeight: 1.5 }}>
          Antes de empezar,<br />¿cómo te llamamos?
        </p>

        <input
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && guardarNombre()}
          autoFocus
          style={{
            width: '100%', padding: '13px 16px', borderRadius: 12,
            border: `1px solid ${colors.border}`,
            background: 'rgba(255,255,255,0.04)', color: colors.text,
            fontFamily: fonts.body, fontSize: '1rem', outline: 'none',
            marginBottom: 12, textAlign: 'center',
          }}
        />

        {error && <p style={{ color: '#ff6b8a', fontSize: '0.8rem', fontFamily: fonts.body, marginBottom: 12 }}>{error}</p>}

        <button
          onClick={guardarNombre}
          disabled={cargando || !nombre.trim()}
          style={{
            width: '100%', padding: '14px', borderRadius: 50, border: 'none',
            background: cargando || !nombre.trim() ? 'rgba(80,128,255,0.4)' : 'linear-gradient(135deg, #2a4abf, #5080ff)',
            color: '#fff', fontSize: '0.95rem', fontFamily: fonts.body,
            cursor: cargando || !nombre.trim() ? 'not-allowed' : 'pointer',
            letterSpacing: '0.03em',
          }}
        >
          {cargando ? 'Guardando...' : 'Empezar ✦'}
        </button>

      </div>
    </div>
  )
}

export default Onboarding