import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { colors, fonts } from '../styles/global'

const Configuracion = ({ sesion }) => {
  const navigate = useNavigate()
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const [cargando, setCargando] = useState(false)

  async function cerrarSesion() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function eliminarCuenta() {
  setCargando(true)
  try {
    const userId = sesion.user.id

    const { error } = await supabase.rpc('eliminar_usuario', { user_id: userId })

    if (error) throw error

    await supabase.auth.signOut()
    navigate('/login')
  } catch (err) {
    console.error('Error eliminando cuenta:', err)
    alert('Hubo un error eliminando tu cuenta. Intenta de nuevo.')
  }
  setCargando(false)
}

  const nombre = sesion?.user?.user_metadata?.nombre
  const email = sesion?.user?.email

  return (
    <div style={{ padding: '52px 20px 100px', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: '1.4rem', cursor: 'pointer', padding: 0 }}
        >‹</button>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 4 }}>✦ ajustes</p>
          <h1 style={{ fontFamily: fonts.title, fontSize: '1.75rem', color: colors.textSoft, fontWeight: 600 }}>Configuración</h1>
        </div>
      </div>

      {/* Info usuario */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.border}`, borderRadius: 16, padding: '20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #1a2d6e, #0a1540)', border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: colors.accentLight, fontFamily: fonts.body, fontWeight: 500 }}>
            {nombre?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '0.95rem', fontWeight: 500, color: colors.textSoft, fontFamily: fonts.body, marginBottom: 3 }}>{nombre}</p>
            <p style={{ fontSize: '0.78rem', color: colors.textMuted, fontFamily: fonts.body }}>{email}</p>
          </div>
        </div>
      </div>

      {/* Cerrar sesión */}
      <button
        onClick={cerrarSesion}
        style={{ width: '100%', padding: '14px', borderRadius: 12, border: `1.5px solid ${colors.border}`, background: 'transparent', color: colors.textSoft, fontSize: '0.9rem', fontFamily: fonts.body, cursor: 'pointer', marginBottom: 12, textAlign: 'left', paddingLeft: 20 }}
      >
        🚪 Cerrar sesión
      </button>

      {/* Eliminar cuenta */}
      {!confirmarEliminar ? (
        <button
          onClick={() => setConfirmarEliminar(true)}
          style={{ width: '100%', padding: '14px', borderRadius: 12, border: '1.5px solid rgba(255,80,80,0.25)', background: 'transparent', color: '#ff6b8a', fontSize: '0.9rem', fontFamily: fonts.body, cursor: 'pointer', textAlign: 'left', paddingLeft: 20 }}
        >
          🗑 Eliminar mi cuenta
        </button>
      ) : (
        <div style={{ background: 'rgba(255,80,80,0.06)', border: '1.5px solid rgba(255,80,80,0.25)', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: '0.88rem', color: '#ff6b8a', fontFamily: fonts.body, marginBottom: 6, fontWeight: 500 }}>¿Estás segura?</p>
          <p style={{ fontSize: '0.8rem', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 16, lineHeight: 1.5 }}>
            Se borrarán todas tus prendas, pintas, calendario e inspos. Esta acción no se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setConfirmarEliminar(false)}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textMuted, fontSize: '0.82rem', fontFamily: fonts.body, cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              onClick={eliminarCuenta}
              disabled={cargando}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'rgba(255,80,80,0.7)', color: '#fff', fontSize: '0.82rem', fontFamily: fonts.body, cursor: cargando ? 'not-allowed' : 'pointer' }}
            >
              {cargando ? 'Eliminando...' : 'Sí, eliminar todo'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Configuracion