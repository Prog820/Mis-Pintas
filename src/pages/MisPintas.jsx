import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { colors, fonts } from '../styles/global'

const filtros = ['todas', 'favoritas', 'casual', 'universidad', 'salida nocturna', 'formal', 'deporte', 'cita']
const categoriasOutfit = ['casual', 'universidad', 'salida nocturna', 'formal', 'deporte', 'cita']
const slotsPrenda = [
  { key: 'top', label: 'top' },
  { key: 'chaqueta', label: 'chaqueta' },
  { key: 'pantalon', label: 'pantalón' },
  { key: 'zapatos', label: 'zapatos' },
  { key: 'bolso', label: 'bolso' },
  { key: 'accesorio_manillas', label: 'manillas' },
  { key: 'accesorio_aretes', label: 'aretes' },
  { key: 'accesorio_cabeza', label: 'cabeza' },
  { key: 'accesorio_anillos', label: 'anillos' },
  { key: 'accesorio_relojes', label: 'relojes' },
  { key: 'accesorio_collares', label: 'collares' },
]

function CollageMini({ prendas }) {
  const Slot = ({ prenda, height }) => (
    <div style={{ background: '#f0f2f8', borderRadius: 8, height, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {prenda?.foto_url
        ? <img src={prenda.foto_url} alt={prenda.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        : <span style={{ fontSize: '0.6rem', color: '#ccc' }}>—</span>
      }
    </div>
  )
  const accesorios = [
    prendas?.accesorio_manillas, prendas?.accesorio_aretes, prendas?.accesorio_cabeza,
    prendas?.accesorio_anillos, prendas?.accesorio_relojes, prendas?.accesorio_collares,
  ].filter(a => a?.foto_url)
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 8, marginBottom: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Slot prenda={prendas?.top} height={64} />
          <Slot prenda={prendas?.pantalon} height={80} />
          <Slot prenda={prendas?.zapatos} height={42} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <Slot prenda={prendas?.chaqueta} height={48} />
          <Slot prenda={prendas?.bolso} height={42} />
        </div>
      </div>
      {accesorios.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
          {accesorios.map((a, i) => (
            <div key={i} style={{ flex: 1, background: '#f0f2f8', borderRadius: 6, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={a.foto_url} alt={a.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const MisPintas = () => {
  const [filtroActivo, setFiltroActivo] = useState('todas')
  const [pintas, setPintas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [pintaAEliminar, setPintaAEliminar] = useState(null)
  const [pintaEditando, setPintaEditando] = useState(null)
  const [prendasDisponibles, setPrendasDisponibles] = useState({})
  const [nombreEdit, setNombreEdit] = useState('')
  const [categoriaEdit, setCategoriaEdit] = useState('casual')
  const [seleccionEdit, setSeleccionEdit] = useState({})
  const [guardandoEdicion, setGuardandoEdicion] = useState(false)

  useEffect(() => { cargarPintas(); cargarPrendasDisponibles() }, [])

  async function cargarPrendasDisponibles() {
    const { data, error } = await supabase.from('prendas').select('*').order('created_at', { ascending: true })
    if (!error) {
      const agrupadas = { top: [], chaqueta: [], pantalon: [], bolso: [], zapatos: [], accesorio_manillas: [], accesorio_aretes: [], accesorio_cabeza: [], accesorio_anillos: [], accesorio_relojes: [], accesorio_collares: [] }
      data.forEach(p => { if (agrupadas[p.categoria]) agrupadas[p.categoria].push(p) })
      setPrendasDisponibles(agrupadas)
    }
  }

  async function cargarPintas() {
    setCargando(true)
    const { data, error } = await supabase
      .from('outfits')
      .select(`*, top:top_id(*), chaqueta:chaqueta_id(*), pantalon:pantalon_id(*), bolso:bolso_id(*), zapatos:zapatos_id(*),
        accesorio_manillas:accesorio_manillas_id(*), accesorio_aretes:accesorio_aretes_id(*), accesorio_cabeza:accesorio_cabeza_id(*),
        accesorio_anillos:accesorio_anillos_id(*), accesorio_relojes:accesorio_relojes_id(*), accesorio_collares:accesorio_collares_id(*)`)
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

  function abrirEditar(pinta) {
    setPintaEditando(pinta)
    setNombreEdit(pinta.nombre)
    setCategoriaEdit(pinta.categoria)
    setSeleccionEdit({
      top: pinta.top, chaqueta: pinta.chaqueta, pantalon: pinta.pantalon,
      zapatos: pinta.zapatos, bolso: pinta.bolso,
      accesorio_manillas: pinta.accesorio_manillas, accesorio_aretes: pinta.accesorio_aretes,
      accesorio_cabeza: pinta.accesorio_cabeza, accesorio_anillos: pinta.accesorio_anillos,
      accesorio_relojes: pinta.accesorio_relojes, accesorio_collares: pinta.accesorio_collares,
    })
  }

  async function guardarEdicion() {
    if (!nombreEdit.trim()) { alert('Ponle un nombre a tu pinta'); return }
    setGuardandoEdicion(true)
    try {
       const { error } = await supabase.from('outfits').update({
        nombre: nombreEdit.trim(),
        categoria: categoriaEdit,
        top_id: seleccionEdit.top?.id || null,
        chaqueta_id: seleccionEdit.chaqueta?.id || null,
        pantalon_id: seleccionEdit.pantalon?.id || null,
        zapatos_id: seleccionEdit.zapatos?.id || null,
        bolso_id: seleccionEdit.bolso?.id || null,
        accesorio_manillas_id: seleccionEdit.accesorio_manillas?.id || null,
        accesorio_aretes_id: seleccionEdit.accesorio_aretes?.id || null,
        accesorio_cabeza_id: seleccionEdit.accesorio_cabeza?.id || null,
        accesorio_anillos_id: seleccionEdit.accesorio_anillos?.id || null,
        accesorio_relojes_id: seleccionEdit.accesorio_relojes?.id || null,
        accesorio_collares_id: seleccionEdit.accesorio_collares?.id || null,
      }).eq('id', pintaEditando.id)
      if (error) throw error
      setPintaEditando(null)
      await cargarPintas()
    } catch (err) {
      console.error('Error editando pinta:', err)
      alert('Hubo un error guardando los cambios. Intenta de nuevo.')
    }
    setGuardandoEdicion(false)
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
            <div key={pinta.id} onClick={() => abrirEditar(pinta)} style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 12, cursor: 'pointer', position: 'relative' }}>
              <button onClick={(e) => { e.stopPropagation(); setPintaAEliminar(pinta) }} style={{ position: 'absolute', top: 10, left: 10, width: 22, height: 22, borderRadius: '50%', background: 'rgba(20,20,30,0.45)', border: 'none', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>✕</button>
              <button onClick={(e) => { e.stopPropagation(); toggleFavorita(pinta.id, pinta.es_favorita) }} style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: '50%', background: 'rgba(20,20,30,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, transition: 'all 0.2s' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill={pinta.es_favorita ? colors.accent : 'none'} stroke={pinta.es_favorita ? colors.accent : '#aaa'} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
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

      {pintaEditando && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 80px 20px' }}>
          <div style={{ background: '#0d1530', borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 430, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: fonts.title, color: colors.textSoft, fontSize: '1.1rem', fontWeight: 600 }}>Editar pinta</h2>
              <button onClick={() => setPintaEditando(null)} style={{ background: 'none', border: 'none', color: colors.textDim, fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <input
              value={nombreEdit}
              onChange={e => setNombreEdit(e.target.value)}
              placeholder="Nombre de la pinta"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.03)', color: colors.text, fontSize: '0.85rem', fontFamily: fonts.body, marginBottom: 14, boxSizing: 'border-box' }}
            />

            <p style={{ ...labelStyle, marginBottom: 8 }}>✦ categoría</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {categoriasOutfit.map(c => (
                <button key={c} onClick={() => setCategoriaEdit(c)} style={{ padding: '6px 12px', borderRadius: 20, border: categoriaEdit === c ? 'none' : `1px solid ${colors.border}`, background: categoriaEdit === c ? colors.accent : 'transparent', color: categoriaEdit === c ? '#fff' : colors.textMuted, fontSize: '0.72rem', fontFamily: fonts.body, cursor: 'pointer' }}>{c}</button>
              ))}
            </div>

            <p style={{ ...labelStyle, marginBottom: 8 }}>✦ prendas</p>
            {slotsPrenda.map(({ key, label }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <p style={{ fontSize: '0.7rem', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 6, textTransform: 'capitalize' }}>{label}</p>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                  {(key === 'chaqueta' || key.startsWith('accesorio_')) && (
                    <div onClick={() => setSeleccionEdit(prev => ({ ...prev, [key]: null }))} style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 10, border: !seleccionEdit[key] ? `2px solid ${colors.accent}` : `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <span style={{ fontSize: '0.62rem', color: colors.textMuted, fontFamily: fonts.body }}>ninguna</span>
                    </div>
                  )}
                  {(prendasDisponibles[key] || []).map(p => (
                    <div key={p.id} onClick={() => setSeleccionEdit(prev => ({ ...prev, [key]: p }))} style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 10, overflow: 'hidden', background: '#fff', border: seleccionEdit[key]?.id === p.id ? `2px solid ${colors.accent}` : '2px solid transparent', cursor: 'pointer' }}>
                      <img src={p.foto_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  ))}
                  {(prendasDisponibles[key] || []).length === 0 && (
                    <p style={{ fontSize: '0.72rem', color: colors.textDim, fontFamily: fonts.body, alignSelf: 'center' }}>No tienes prendas en esta categoría</p>
                  )}
                </div>
              </div>
            ))}

            <button onClick={guardarEdicion} disabled={guardandoEdicion} style={{ width: '100%', padding: '12px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg, #2a4abf, #5080ff)', color: '#fff', fontSize: '0.88rem', fontFamily: fonts.body, cursor: guardandoEdicion ? 'not-allowed' : 'pointer', marginTop: 6 }}>
              {guardandoEdicion ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MisPintas