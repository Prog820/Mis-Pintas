import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './Inicio.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { colors, fonts } from '../styles/global'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function formatearFecha(fecha) {
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const Inicio = ({ sesion }) => {
  const navigate = useNavigate()
  const [outfitHoy, setOutfitHoy] = useState(null)
  const [semana, setSemana] = useState([])
  const [cargando, setCargando] = useState(true)

  const location = useLocation()
  const [mostrarBienvenida, setMostrarBienvenida] = useState(location.state?.bienvenida || false)
  const nombreBienvenida = location.state?.nombre || ''

  useEffect(() => {
    if (mostrarBienvenida) {
      const t = setTimeout(() => setMostrarBienvenida(false), 3500)
      return () => clearTimeout(t)
    }
  }, [mostrarBienvenida])

  const hoy = new Date()
  const fechaHoy = hoy.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
  const diaHoyIndex = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)

    // Fechas de la semana actual (lun a dom)
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - diaHoyIndex)

    const fechasSemana = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes)
      d.setDate(lunes.getDate() + i)
      return formatearFecha(d)
    })

    const { data } = await supabase
      .from('calendario')
      .select(`
        fecha,
        outfit:outfit_id(
          *,
          top:top_id(*),
          chaqueta:chaqueta_id(*),
          pantalon:pantalon_id(*),
          bolso:bolso_id(*),
          zapatos:zapatos_id(*),
          accesorio_manillas:accesorio_manillas_id(*),
          accesorio_aretes:accesorio_aretes_id(*),
          accesorio_cabeza:accesorio_cabeza_id(*),
          accesorio_anillos:accesorio_anillos_id(*),
          accesorio_relojes:accesorio_relojes_id(*),
          accesorio_collares:accesorio_collares_id(*)
        )
      `)
      .in('fecha', fechasSemana)

    const mapa = {}
    if (data) data.forEach(e => { mapa[e.fecha] = e.outfit })

    const fechaHoyKey = formatearFecha(hoy)
    setOutfitHoy(mapa[fechaHoyKey] || null)

    setSemana(fechasSemana.map((fecha, i) => ({
      dia: DIAS[i],
      outfit: mapa[fecha] || null,
      fecha,
    })))

    setCargando(false)
  }

  return (
    <div className="inicio-page">

      {/* Topbar */}
      <div className="inicio-topbar">
        <div>
          <p className="inicio-greeting-sub">✦ ¡Hola!</p>
          <h1 className="inicio-greeting-name">{sesion?.user?.user_metadata?.nombre || sesion?.user?.email?.split('@')[0]}</h1>
        </div>
        <div className="inicio-avatar" onClick={() => navigate('/configuracion')} style={{ cursor: 'pointer' }}>
          {sesion?.user?.user_metadata?.nombre?.[0]?.toUpperCase()}
        </div>
      </div>

      {mostrarBienvenida && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(6,8,16,0.92)', backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          animation: 'fadeOut 3.5s forwards',
        }}>
          <p style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 12 }}>✦ bienvenida</p>
          <h1 style={{ fontFamily: fonts.title, fontSize: '2.5rem', color: colors.textSoft, fontWeight: 700, marginBottom: 8 }}>{nombreBienvenida}</h1>
          <p style={{ fontSize: '0.9rem', color: colors.textMuted, fontFamily: fonts.body }}>Tu armario virtual te espera</p>
          <style>{`
            @keyframes fadeOut {
              0% { opacity: 1 }
              70% { opacity: 1 }
              100% { opacity: 0; pointer-events: none }
            }
          `}</style>
        </div>
      )}

      {/* Card pinta de hoy */}
      <div className="inicio-today-card">
        <div className="today-card-header">
          <span className="today-label">✦ pinta de hoy</span>
          <span className="today-date">{fechaHoy}</span>
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#bbb', fontSize: '0.85rem' }}>
            Cargando...
          </div>
        ) : outfitHoy ? (
          <div className="today-outfit">
           {[
              { prenda: outfitHoy.bolso, label: 'bolso', cls: 'sm' },
              ...(outfitHoy.chaqueta ? [{ prenda: outfitHoy.chaqueta, label: 'chaqueta', cls: 'md' }] : []),
              { prenda: outfitHoy.top, label: 'camisa', cls: 'tall' },
              { prenda: outfitHoy.pantalon, label: 'pantalón', cls: 'tall' },
              { prenda: outfitHoy.zapatos, label: 'zapatos', cls: 'md' },
              ...[
                { prenda: outfitHoy.accesorio_manillas, label: 'manillas' },
                { prenda: outfitHoy.accesorio_aretes, label: 'aretes' },
                { prenda: outfitHoy.accesorio_cabeza, label: 'cabeza' },
                { prenda: outfitHoy.accesorio_anillos, label: 'anillos' },
                { prenda: outfitHoy.accesorio_relojes, label: 'relojes' },
                { prenda: outfitHoy.accesorio_collares, label: 'collares' },
              ].filter(a => a.prenda).map(a => ({ ...a, cls: 'sm' })),
            ].map(({ prenda, label, cls }) => (
              <div key={label} className="outfit-slot">
                <div className={`outfit-img ${cls}`}>
                  {prenda?.foto_url
                    ? <img src={prenda.foto_url} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : '?'
                  }
                </div>
                <span className="outfit-label">{label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: '#bbb', fontSize: '0.85rem', marginBottom: 12 }}>No hay pinta para hoy</p>
            <button
              onClick={() => navigate('/calendario')}
              style={{ padding: '8px 18px', borderRadius: 20, border: '1px solid #e0d8f0', background: 'transparent', color: '#7c6bb0', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Asignar pinta
            </button>
          </div>
        )}

        <div className="today-actions">
          <button className="btn-cambiar" onClick={() => navigate('/armario')}>Cambiar</button>
        </div>
      </div>

      {/* Semana */}
      <p className="section-label">✦ esta semana</p>
      <div className="semana-row">
        {semana.map((item, i) => (
          <div key={i} className="dia-chip">
            <span className="dia-name">{item.dia}</span>
            <div className={`dia-dot ${i === diaHoyIndex ? 'today' : ''} ${!item.outfit ? 'vacio' : ''}`}>
              {item.outfit?.top?.foto_url ? (
                <img src={item.outfit.top.foto_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
              ) : (
                '+'
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Explorar */}
      <p className="section-label">✦ explorar</p>
      <div className="quick-grid">
        <div className="quick-card" onClick={() => navigate('/armario')}>
          <span className="quick-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M12 3v18M2 9h20"/></svg></span>
          <p className="quick-title">Armario</p>
          <p className="quick-sub">Combina prendas</p>
        </div>
        <div className="quick-card" onClick={() => navigate('/pintas')}>
          <span className="quick-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>
          <p className="quick-title">Mis pintas</p>
          <p className="quick-sub">Outfits guardados</p>
        </div>
        <div className="quick-card" onClick={() => navigate('/calendario')}>
          <span className="quick-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span>
          <p className="quick-title">Calendario</p>
          <p className="quick-sub">Planea tu mes</p>
        </div>
        <div className="quick-card" onClick={() => navigate('/ia')}>
          <span className="quick-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg></span>
          <p className="quick-title">Inspo</p>
          <p className="quick-sub">Tus referencias</p>
        </div>
      </div>

      {/* Banner IA */}
      <div className="ia-banner" onClick={() => navigate('/ia')}>
        <div className="ia-icon-wrap"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg></div>
        <div className="ia-text">
          <p className="ia-title">Crear pinta con IA</p>
          <p className="ia-sub">Sube una inspo y te armo el outfit con tu ropa</p>
        </div>
        <span className="ia-arrow">›</span>
      </div>

    </div>
  )
}

export default Inicio