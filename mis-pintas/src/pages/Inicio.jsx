import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Inicio.css'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const Inicio = ({ sesion }) => {
  const navigate = useNavigate()
  const [outfitHoy, setOutfitHoy] = useState(null)
  const [semana, setSemana] = useState([])
  const [cargando, setCargando] = useState(true)

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
      return d.toISOString().split('T')[0]
    })

    const { data } = await supabase
      .from('calendario')
      .select(`
        fecha,
        outfit:outfit_id(
          *,
          top:top_id(*),
          pantalon:pantalon_id(*),
          bolso:bolso_id(*),
          zapatos:zapatos_id(*),
          accesorio:accesorio_id(*)
        )
      `)
      .in('fecha', fechasSemana)

    const mapa = {}
    if (data) data.forEach(e => { mapa[e.fecha] = e.outfit })

    const fechaHoyKey = hoy.toISOString().split('T')[0]
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
          <p className="inicio-greeting-sub">✦ buenos días</p>
          <h1 className="inicio-greeting-name">{sesion?.user?.user_metadata?.nombre || sesion?.user?.email?.split('@')[0]}</h1>
        </div>
        <div className="inicio-avatar" onClick={() => navigate('/configuracion')} style={{ cursor: 'pointer' }}>
          {sesion?.user?.user_metadata?.nombre?.[0]?.toUpperCase()}
        </div>
      </div>

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
              { prenda: outfitHoy.top, label: 'camisa', cls: 'tall' },
              { prenda: outfitHoy.pantalon, label: 'pantalón', cls: 'tall' },
              { prenda: outfitHoy.zapatos, label: 'zapatos', cls: 'md' },
              { prenda: outfitHoy.accesorio, label: 'accesorio', cls: 'sm' },
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
          <button className="btn-usar">Usar esta pinta</button>
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
          <span className="quick-icon">🌀</span>
          <p className="quick-title">Armario</p>
          <p className="quick-sub">Combina prendas</p>
        </div>
        <div className="quick-card" onClick={() => navigate('/pintas')}>
          <span className="quick-icon">🗂</span>
          <p className="quick-title">Mis pintas</p>
          <p className="quick-sub">Outfits guardados</p>
        </div>
        <div className="quick-card" onClick={() => navigate('/calendario')}>
          <span className="quick-icon">🗓</span>
          <p className="quick-title">Calendario</p>
          <p className="quick-sub">Planea tu mes</p>
        </div>
        <div className="quick-card" onClick={() => navigate('/ia')}>
          <span className="quick-icon">📌</span>
          <p className="quick-title">Inspo</p>
          <p className="quick-sub">Tus referencias</p>
        </div>
      </div>

      {/* Banner IA */}
      <div className="ia-banner" onClick={() => navigate('/ia')}>
        <div className="ia-icon-wrap">✨</div>
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