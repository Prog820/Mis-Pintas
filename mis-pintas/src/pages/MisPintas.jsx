import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const filtros = ['todas', 'favoritas', 'casual', 'universidad', 'salida nocturna', 'formal', 'deporte', 'cita']

function CollageMini({ prendas }) {
  const top = prendas?.top
  const pantalon = prendas?.pantalon
  const bolso = prendas?.bolso
  const zapatos = prendas?.zapatos
  const accesorio = prendas?.accesorio

  const Slot = ({ prenda, height }) => (
    <div style={{
      background: '#f5f5f7', borderRadius: 8, height,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {prenda?.foto_url
        ? <img src={prenda.foto_url} alt={prenda.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        : <span style={{ fontSize: '0.6rem', color: '#ccc' }}>—</span>
      }
    </div>
  )

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Slot prenda={top} height={64} />
        <Slot prenda={pantalon} height={80} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Slot prenda={bolso} height={48} />
        <Slot prenda={zapatos} height={48} />
        <Slot prenda={accesorio} height={48} />
      </div>
    </div>
  )
}

const MisPintas = () => {
  const [filtroActivo, setFiltroActivo] = useState('todas')
  const [pintas, setPintas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarPintas()
  }, [])

  async function cargarPintas() {
    setCargando(true)
    const { data, error } = await supabase
      .from('outfits')
      .select(`
        *,
        top:top_id(*),
        pantalon:pantalon_id(*),
        bolso:bolso_id(*),
        zapatos:zapatos_id(*),
        accesorio:accesorio_id(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error cargando pintas:', error)
    } else {
      setPintas(data)
    }
    setCargando(false)
  }

  async function toggleFavorita(id, actual) {
    await supabase.from('outfits').update({ es_favorita: !actual }).eq('id', id)
    setPintas(prev => prev.map(p => p.id === id ? { ...p, es_favorita: !actual } : p))
  }

  const pintasFiltradas = pintas.filter(p => {
    if (filtroActivo === 'todas') return true
    if (filtroActivo === 'favoritas') return p.es_favorita
    return p.categoria === filtroActivo
  })

  return (
    <div style={{ padding: '52px 20px 100px', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b5fa0', marginBottom: 4 }}>
          ✦ tu colección guardada
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#ede9ff', fontWeight: 400 }}>
          Mis Pintas
        </h1>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
        {filtros.map(f => (
          <button
            key={f}
            onClick={() => setFiltroActivo(f)}
            style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20,
              border: filtroActivo === f ? 'none' : '1px solid rgba(150,120,255,0.25)',
              background: filtroActivo === f ? '#9b7ff0' : 'transparent',
              color: filtroActivo === f ? '#fff' : '#8b7ec8',
              fontSize: '0.75rem', fontFamily: 'Inter, sans-serif',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
            }}
          >{f}</button>
        ))}
      </div>

      {/* Contenido */}
      {cargando ? (
        <div style={{ textAlign: 'center', color: '#6b5fa0', marginTop: 60, fontSize: '0.9rem' }}>
          Cargando pintas...
        </div>
      ) : pintasFiltradas.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6b5fa0', marginTop: 60, fontSize: '0.9rem' }}>
          {filtroActivo === 'todas'
            ? 'Aún no tienes pintas guardadas. ¡Arma una en el Armario!'
            : 'No hay pintas en esta categoría todavía'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {pintasFiltradas.map(pinta => (
            <div
              key={pinta.id}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(150,120,255,0.12)',
                borderRadius: 16, padding: 12, cursor: 'pointer', position: 'relative',
              }}
            >
              <button
                onClick={() => toggleFavorita(pinta.id, pinta.es_favorita)}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'none', border: 'none', fontSize: '1rem',
                  cursor: 'pointer', opacity: pinta.es_favorita ? 1 : 0.35,
                  transition: 'opacity 0.2s',
                }}
              >
                {pinta.es_favorita ? '❤️' : '🤍'}
              </button>

              <CollageMini prendas={pinta} />

              <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#d4cef5', marginBottom: 3 }}>
                {pinta.nombre}
              </p>
              <p style={{ fontSize: '0.68rem', color: '#6b5fa0' }}>
                {pinta.categoria} · {new Date(pinta.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default MisPintas