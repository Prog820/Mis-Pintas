import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { colors, fonts } from '../styles/global'


const CATEGORIAS = ['top', 'pantalon', 'bolso', 'zapatos', 'accesorio']
const ETIQUETAS = { top: 'Top', pantalon: 'Pantalón', bolso: 'Bolso', zapatos: 'Zapatos', accesorio: 'Accesorio' }

function SlotPrenda({ prenda, etiqueta, onAnterior, onSiguiente, altura, cargando }) {
  const touchStart = useRef(null)

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX
  }

  const onTouchEnd = (e) => {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 30) {
      diff > 0 ? onSiguiente() : onAnterior()
    }
    touchStart.current = null
  }

  return (
    <div
      style={{ position: 'relative', height: altura, borderRadius: 14, overflow: 'hidden' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div style={{
        width: '100%', height: '100%',
        background: prenda?.foto_url ? '#fff' : '#f0f2f8',
        borderRadius: 14,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'background 0.3s', overflow: 'hidden',
      }}>
        {cargando ? (
          <span style={{ fontSize: '1rem', color: '#ccc' }}>...</span>
        ) : prenda?.foto_url ? (
          <img src={prenda.foto_url} alt={prenda.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <>
            <span style={{ fontSize: '1.3rem', color: '#ccc' }}>?</span>
            <span style={{ fontSize: '0.65rem', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: fonts.body }}>{etiqueta}</span>
          </>
        )}
      </div>

      <button onClick={onAnterior} className="flecha-slot" style={{ left: 4 }}>‹</button>
      <button onClick={onSiguiente} className="flecha-slot" style={{ right: 4 }}>›</button>
    </div>
  )
}

const Armario = () => {
  const [prendas, setPrendas] = useState({ top: [], pantalon: [], bolso: [], zapatos: [], accesorio: [] })
  const [indices, setIndices] = useState({ top: 0, pantalon: 0, bolso: 0, zapatos: 0, accesorio: 0 })
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [modalAgregar, setModalAgregar] = useState(false)
  const [categoriaModal, setCategoriaModal] = useState('top')
  const [nombreModal, setNombreModal] = useState('')
  const [archivoModal, setArchivoModal] = useState(null)
  const [previewModal, setPreviewModal] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => { cargarPrendas() }, [])

  async function cargarPrendas() {
    setCargando(true)
    const { data, error } = await supabase.from('prendas').select('*').order('created_at', { ascending: true })
    if (!error) {
      const agrupadas = { top: [], pantalon: [], bolso: [], zapatos: [], accesorio: [] }
      data.forEach(p => { if (agrupadas[p.categoria]) agrupadas[p.categoria].push(p) })
      setPrendas(agrupadas)
    }
    setCargando(false)
  }

  const cambiar = (cat, dir) => {
    const lista = prendas[cat]
    if (lista.length === 0) return
    setIndices(prev => ({ ...prev, [cat]: (prev[cat] + dir + lista.length) % lista.length }))
    setGuardado(false)
  }

  const get = (cat) => prendas[cat][indices[cat]] || null

  const abrirModal = () => {
    setModalAgregar(true)
    setNombreModal('')
    setArchivoModal(null)
    setPreviewModal(null)
    setCategoriaModal('top')
  }

  const seleccionarArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setArchivoModal(file)
    setPreviewModal(URL.createObjectURL(file))
    if (!nombreModal) setNombreModal(file.name.replace(/\.[^/.]+$/, ''))
  }

  async function subirPrenda() {
    if (!archivoModal || !nombreModal) return
    setSubiendo(true)
    try {
      const ext = archivoModal.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('prendas').upload(fileName, archivoModal)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('prendas').getPublicUrl(fileName)
      const { error: insertError } = await supabase.from('prendas').insert({ categoria: categoriaModal, nombre: nombreModal, foto_url: urlData.publicUrl })
      if (insertError) throw insertError
      await cargarPrendas()
      setModalAgregar(false)
    } catch (err) {
      console.error('Error subiendo prenda:', err)
      alert('Hubo un error subiendo la prenda. Intenta de nuevo.')
    }
    setSubiendo(false)
  }

  async function guardarPinta() {
    const { error } = await supabase.from('outfits').insert({
      nombre: 'Mi pinta',
      top_id: get('top')?.id || null,
      pantalon_id: get('pantalon')?.id || null,
      bolso_id: get('bolso')?.id || null,
      zapatos_id: get('zapatos')?.id || null,
      accesorio_id: get('accesorio')?.id || null,
    })
    if (!error) {
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    }
  }

  const labelStyle = { fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 4 }

  return (
    <div style={{ padding: '52px 20px 100px', minHeight: '100vh' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={labelStyle}>✦ tu armario</p>
          <h1 style={{ fontFamily: fonts.title, fontSize: '1.75rem', color: colors.textSoft, fontWeight: 600 }}>Armario</h1>
        </div>
        <button onClick={abrirModal} style={{ width: 38, height: 38, borderRadius: '50%', border: `1.5px solid ${colors.border}`, background: 'transparent', color: colors.accent, fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>

      <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 16, fontFamily: fonts.body }}>Toca las flechas para cambiar cada prenda</p>

      <div style={{ background: colors.white, borderRadius: 20, padding: 14, boxShadow: '0 0 50px rgba(50,100,255,0.12)', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SlotPrenda prenda={get('top')} etiqueta="Top" onAnterior={() => cambiar('top', -1)} onSiguiente={() => cambiar('top', 1)} altura={150} cargando={cargando} />
            <SlotPrenda prenda={get('pantalon')} etiqueta="Pantalón" onAnterior={() => cambiar('pantalon', -1)} onSiguiente={() => cambiar('pantalon', 1)} altura={190} cargando={cargando} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SlotPrenda prenda={get('bolso')} etiqueta="Bolso" onAnterior={() => cambiar('bolso', -1)} onSiguiente={() => cambiar('bolso', 1)} altura={100} cargando={cargando} />
            <SlotPrenda prenda={get('zapatos')} etiqueta="Zapatos" onAnterior={() => cambiar('zapatos', -1)} onSiguiente={() => cambiar('zapatos', 1)} altura={120} cargando={cargando} />
            <SlotPrenda prenda={get('accesorio')} etiqueta="Accesorio" onAnterior={() => cambiar('accesorio', -1)} onSiguiente={() => cambiar('accesorio', 1)} altura={120} cargando={cargando} />
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
          {CATEGORIAS.map(cat => {
            const p = get(cat)
            return <span key={cat} style={{ fontSize: '0.72rem', fontFamily: fonts.body, background: '#eef2ff', color: colors.accentDim, padding: '3px 10px', borderRadius: 20 }}>{p ? p.nombre : ETIQUETAS[cat] + ' —'}</span>
          })}
        </div>
      </div>

      <button onClick={guardarPinta} style={{ width: '100%', padding: '14px', borderRadius: 50, border: guardado ? 'none' : `1.5px solid ${colors.border}`, background: guardado ? 'linear-gradient(135deg, #2a4abf, #5080ff)' : 'transparent', color: guardado ? '#fff' : colors.accentLight, fontSize: '0.95rem', fontFamily: fonts.body, cursor: 'pointer', transition: 'all 0.25s', letterSpacing: '0.03em' }}>
        {guardado ? '✓ Pinta guardada' : '✨ Guardar pinta'}
      </button>

      {modalAgregar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 80px 20px' }}>
          <div style={{ background: '#0d1530', borderRadius: 20, padding: '28px 24px 32px', width: '100%', maxWidth: 430, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: fonts.title, color: colors.textSoft, fontSize: '1.2rem', fontWeight: 600 }}>Agregar prenda</h2>
              <button onClick={() => setModalAgregar(false)} style={{ background: 'none', border: 'none', color: colors.textDim, fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div onClick={() => inputRef.current?.click()} style={{ width: '100%', height: 160, borderRadius: 14, border: `1.5px dashed ${colors.border}`, background: previewModal ? 'transparent' : 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 16, overflow: 'hidden' }}>
              {previewModal
                ? <img src={previewModal} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.8rem', marginBottom: 6 }}>📷</p>
                    <p style={{ fontSize: '0.8rem', color: colors.textMuted, fontFamily: fonts.body }}>Toca para seleccionar foto</p>
                  </div>
              }
            </div>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={seleccionarArchivo} />

            <input type="text" placeholder="Nombre de la prenda" value={nombreModal} onChange={e => setNombreModal(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.04)', color: colors.text, fontFamily: fonts.body, fontSize: '0.9rem', marginBottom: 12, outline: 'none' }} />

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {CATEGORIAS.map(cat => (
                <button key={cat} onClick={() => setCategoriaModal(cat)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: '0.75rem', fontFamily: fonts.body, cursor: 'pointer', border: categoriaModal === cat ? 'none' : `1px solid ${colors.border}`, background: categoriaModal === cat ? colors.accent : 'transparent', color: categoriaModal === cat ? '#fff' : colors.textMuted, transition: 'all 0.2s' }}>{cat}</button>
              ))}
            </div>

            <button onClick={subirPrenda} disabled={subiendo || !archivoModal || !nombreModal} style={{ width: '100%', padding: '14px', borderRadius: 50, border: 'none', background: subiendo || !archivoModal || !nombreModal ? 'rgba(80,128,255,0.3)' : 'linear-gradient(135deg, #2a4abf, #5080ff)', color: '#fff', fontSize: '0.95rem', fontFamily: fonts.body, cursor: subiendo ? 'not-allowed' : 'pointer' }}>
              {subiendo ? 'Subiendo...' : 'Guardar prenda'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Armario