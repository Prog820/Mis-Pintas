import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { colors, fonts } from '../styles/global'

const filtros = ['todas', 'favoritas', 'casual', 'universidad', 'salida nocturna', 'formal', 'deporte', 'cita']

function CollageMini({ prendas }) {
  const Slot = ({ prenda, height }) => (
    <div style={{ background: '#f0f2f8', borderRadius: 8, height, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {prenda?.foto_url
        ? <img src={prenda.foto_url} alt={prenda.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        : <span style={{ fontSize: '0.6rem', color: '#ccc' }}>—</span>
      }
    </div>
  )
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Slot prenda={prendas?.top} height={64} />
        <Slot prenda={prendas?.pantalon} height={80} />
        <Slot prenda={prendas?.zapatos} height={42} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Slot prenda={prendas?.chaqueta} height={48} />
        <Slot prenda={prendas?.bolso} height={42} />
        <Slot prenda={prendas?.accesorio} height={42} />
      </div>
    </div>
  )
}

const MisPintas = () => {
  const [filtroActivo, setFiltroActivo] = useState('todas')
  const [pintas, setPintas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [pintaAEliminar, setPintaAEliminar] = useState(null)

  useEffect(() => { cargarPintas() }, [])

  async function cargarPintas() {
    setCargando(true)
    const { data, error } = await supabase
      .from('outfits')
      .select(`*, top:top_id(*), chaqueta:chaqueta_id(*), pantalon:pantalon_id(*), bolso:bolso_id(*), zapatos:zapatos_id(*), accesorio:accesorio_id(*)`)
      .order('created_at', { ascending: false })
    if (!error) setPintas(data)
    setCargando(false)
  }

  async function toggleFavorita(id, actual) {
    await supabase.from('outfits').update({ es_favorita: !actual }).eq('id', id)
    setPintas(prev => prev.map(p => p.id === id ? { ...p, es_favorita: !actual } : p))
  }

  async function eliminarPinta() {
    if (!pintaAEliminar) return
    await supabase.from('outfits').delete().eq('id', pintaAEliminar.id)
    setPintas(prev => prev.filter(p => p.id !== pintaAEliminar.id))
    setPintaAEliminar(null)
  }

  const pintasFiltradas = pintas.filter(p => {
    if (filtroActivo === 'todas') return true
    if (filtroActivo === 'favoritas') return p.es_favorita
    return p.categoria === filtroActivo
  })

  const labelStyle = { fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 4 }

  return (
    <div style={{ padding: '52px 20px 100px', minHeight: '100vh' }}>

      <div style={{ marginBottom: 24 }}>
        <p style={labelStyle}>✦ tu colección guardada</p>
        <h1 style={{ fontFamily: fonts.title, fontSize: '1.75rem', color: colors.textSoft, fontWeight: 600 }}>Mis Pintas</h1>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
        {filtros.map(f => (
          <button key={f} onClick={() => setFiltroActivo(f)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, border: filtroActivo === f ? 'none' : `1px solid ${colors.border}`, background: filtroActivo === f ? colors.accent : 'transparent', color: filtroActivo === f ? '#fff' : colors.textMuted, fontSize: '0.75rem', fontFamily: fonts.body, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>{f}</button>
        ))}
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', color: colors.textMuted, marginTop: 60, fontSize: '0.9rem', fontFamily: fonts.body }}>Cargando pintas...</div>
      ) : pintasFiltradas.length === 0 ? (
        <div style={{ textAlign: 'center', color: colors.textMuted, marginTop: 60, fontSize: '0.9rem', fontFamily: fonts.body }}>
          {filtroActivo === 'todas' ? '¡Arma tu primera pinta en el Armario!' : 'No hay pintas en esta categoría todavía'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {pintasFiltradas.map(pinta => (
            <div key={pinta.id} style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 12, cursor: 'pointer', position: 'relative' }}>
              <button onClick={(e) => { e.stopPropagation(); setPintaAEliminar(pinta) }} style={{ position: 'absolute', top: 10, left: 10, width: 22, height: 22, borderRadius: '50%', background: 'rgba(20,20,30,0.45)', border: 'none', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>✕</button>
              <button onClick={() => toggleFavorita(pinta.id, pinta.es_favorita)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', opacity: pinta.es_favorita ? 1 : 0.35, transition: 'opacity 0.2s' }}>
                {pinta.es_favorita ? '❤️' : '🤍'}
              </button>
              <CollageMini prendas={pinta} />
              <p style={{ fontSize: '0.8rem', fontWeight: 500, color: colors.textSoft, marginBottom: 3, fontFamily: fonts.body }}>{pinta.nombre}</p>
              <p style={{ fontSize: '0.72rem', color: colors.textMuted, fontFamily: fonts.body }}>{pinta.categoria} · {new Date(pinta.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</p>
            </div>
          ))}
        </div>

        
     )}

      {pintaAEliminar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#0d1530', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: colors.textSoft, fontFamily: fonts.body, marginBottom: 6, fontWeight: 500 }}>¿Eliminar "{pintaAEliminar.nombre}"?</p>
            <p style={{ fontSize: '0.78rem', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 20 }}>Se borrará de Mis Pintas y del calendario. No se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPintaAEliminar(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textMuted, fontSize: '0.82rem', fontFamily: fonts.body, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={eliminarPinta} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'rgba(255,80,80,0.7)', color: '#fff', fontSize: '0.82rem', fontFamily: fonts.body, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MisPintas