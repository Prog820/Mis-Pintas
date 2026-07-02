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
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Slot prenda={prendas?.bolso} height={48} />
        <Slot prenda={prendas?.zapatos} height={48} />
        <Slot prenda={prendas?.accesorio} height={48} />
      </div>
    </div>
  )
}

const MisPintas = () => {
  const [filtroActivo, setFiltroActivo] = useState('todas')
  const [pintas, setPintas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargarPintas() }, [])

  async function cargarPintas() {
    setCargando(true)
    const { data, error } = await supabase
      .from('outfits')
      .select(`*, top:top_id(*), pantalon:pantalon_id(*), bolso:bolso_id(*), zapatos:zapatos_id(*), accesorio:accesorio_id(*)`)
      .order('created_at', { ascending: false })
    if (!error) setPintas(data)
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
    </div>
  )
}

export default MisPintas