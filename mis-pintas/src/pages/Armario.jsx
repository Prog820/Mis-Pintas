import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIAS = ['top', 'pantalon', 'bolso', 'zapatos', 'accesorio']
const ETIQUETAS = { top: 'Top', pantalon: 'Pantalón', bolso: 'Bolso', zapatos: 'Zapatos', accesorio: 'Accesorio' }

function SlotPrenda({ prenda, etiqueta, onAnterior, onSiguiente, altura, cargando }) {
  return (
    <div style={{ position: 'relative', height: altura, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{
        width: '100%', height: '100%',
        background: prenda?.foto_url ? '#fff' : '#f5f5f7',
        borderRadius: 14,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 6, transition: 'background 0.3s',
        overflow: 'hidden',
      }}>
        {cargando ? (
          <span style={{ fontSize: '1.2rem', color: '#ccc' }}>...</span>
        ) : prenda?.foto_url ? (
          <img
            src={prenda.foto_url}
            alt={prenda.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <>
            <span style={{ fontSize: '1.5rem', color: '#ccc' }}>?</span>
            <span style={{ fontSize: '0.6rem', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif' }}>
              {etiqueta}
            </span>
          </>
        )}
      </div>

      <button onClick={onAnterior} style={{
        position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)',
        width: 22, height: 22, borderRadius: '50%', border: 'none',
        background: 'rgba(255,255,255,0.85)', color: '#9b7ff0',
        fontSize: '1rem', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)', zIndex: 2,
        lineHeight: 1, padding: 0,
      }}>‹</button>

      <button onClick={onSiguiente} style={{
        position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
        width: 22, height: 22, borderRadius: '50%', border: 'none',
        background: 'rgba(255,255,255,0.85)', color: '#9b7ff0',
        fontSize: '1rem', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.12)', zIndex: 2,
        lineHeight: 1, padding: 0,
      }}>›</button>
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

  useEffect(() => {
    cargarPrendas()
  }, [])

  async function cargarPrendas() {
    setCargando(true)
    const { data, error } = await supabase
      .from('prendas')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error cargando prendas:', error)
    } else {
      const agrupadas = { top: [], pantalon: [], bolso: [], zapatos: [], accesorio: [] }
      data.forEach(p => {
        if (agrupadas[p.categoria]) agrupadas[p.categoria].push(p)
      })
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
      // 1. Subir foto a Supabase Storage
      const ext = archivoModal.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('prendas')
        .upload(fileName, archivoModal)

      if (uploadError) throw uploadError

      // 2. Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('prendas')
        .getPublicUrl(fileName)

      // 3. Guardar en tabla prendas
      const { error: insertError } = await supabase
        .from('prendas')
        .insert({
          categoria: categoriaModal,
          nombre: nombreModal,
          foto_url: urlData.publicUrl,
        })

      if (insertError) throw insertError

      // 4. Recargar prendas
      await cargarPrendas()
      setModalAgregar(false)

    } catch (err) {
      console.error('Error subiendo prenda:', err)
      alert('Hubo un error subiendo la prenda. Intenta de nuevo.')
    }

    setSubiendo(false)
  }

  async function guardarPinta() {
    const top = get('top')
    const pantalon = get('pantalon')
    const bolso = get('bolso')
    const zapatos = get('zapatos')
    const accesorio = get('accesorio')

    const { error } = await supabase.from('outfits').insert({
      nombre: 'Mi pinta',
      top_id: top?.id || null,
      pantalon_id: pantalon?.id || null,
      bolso_id: bolso?.id || null,
      zapatos_id: zapatos?.id || null,
      accesorio_id: accesorio?.id || null,
    })

    if (error) {
      console.error('Error guardando pinta:', error)
    } else {
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    }
  }

  return (
    <div style={{ padding: '52px 20px 100px', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b5fa0', marginBottom: 4 }}>✦ tu armario</p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#ede9ff', fontWeight: 400 }}>Armario</h1>
        </div>
        <button
          onClick={abrirModal}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            border: '1.5px solid rgba(150,120,255,0.4)',
            background: 'transparent', color: '#9b7ff0',
            fontSize: '1.3rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>+</button>
      </div>

      <p style={{ fontSize: 11, color: '#6b5fa0', marginBottom: 16, letterSpacing: '0.03em' }}>
        Toca las flechas para cambiar cada prenda
      </p>

      {/* Collage */}
      <div style={{ background: '#ffffff', borderRadius: 20, padding: 14, boxShadow: '0 0 50px rgba(155,127,240,0.15)', marginBottom: 16 }}>
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

        {/* Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
          {CATEGORIAS.map(cat => {
            const p = get(cat)
            return (
              <span key={cat} style={{ fontSize: '0.68rem', fontFamily: 'Inter, sans-serif', background: '#f7f4ff', color: '#7c6bb0', padding: '3px 10px', borderRadius: 20 }}>
                {p ? p.nombre : ETIQUETAS[cat] + ' —'}
              </span>
            )
          })}
        </div>
      </div>

      {/* Botón guardar */}
      <button
        onClick={guardarPinta}
        style={{
          width: '100%', padding: '14px', borderRadius: 50,
          border: guardado ? 'none' : '1.5px solid rgba(150,120,255,0.5)',
          background: guardado ? 'linear-gradient(135deg, #6a5acd, #9b7ff0)' : 'transparent',
          color: guardado ? '#fff' : '#c4b0ff',
          fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
          cursor: 'pointer', transition: 'all 0.25s', letterSpacing: '0.03em',
        }}
      >
        {guardado ? '✓ Pinta guardada' : '✨ Guardar pinta'}
      </button>

      {/* Modal agregar prenda */}
      {modalAgregar && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px 20px 80px 20px',
        }}>
          <div style={{
            background: '#13112a', borderRadius: 20,
            padding: '28px 24px 32px', width: '100%', maxWidth: 430,
            maxHeight: '85vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#ede9ff', fontSize: '1.2rem', fontWeight: 400 }}>
                Agregar prenda
              </h2>
              <button onClick={() => setModalAgregar(false)} style={{ background: 'none', border: 'none', color: '#6b5fa0', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Preview foto */}
            <div
              onClick={() => inputRef.current?.click()}
              style={{
                width: '100%', height: 160, borderRadius: 14,
                border: '1.5px dashed rgba(150,120,255,0.35)',
                background: previewModal ? 'transparent' : 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', marginBottom: 16, overflow: 'hidden',
              }}
            >
              {previewModal ? (
                <img src={previewModal} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', marginBottom: 6 }}>📷</p>
                  <p style={{ fontSize: '0.8rem', color: '#6b5fa0' }}>Toca para seleccionar foto</p>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={seleccionarArchivo} />

            {/* Nombre */}
            <input
              type="text"
              placeholder="Nombre de la prenda"
              value={nombreModal}
              onChange={e => setNombreModal(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid rgba(150,120,255,0.25)',
                background: 'rgba(255,255,255,0.04)', color: '#ede9ff',
                fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                marginBottom: 12, outline: 'none',
              }}
            />

            {/* Categoría */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              {CATEGORIAS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaModal(cat)}
                  style={{
                    padding: '6px 12px', borderRadius: 20, fontSize: '0.75rem',
                    fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                    border: categoriaModal === cat ? 'none' : '1px solid rgba(150,120,255,0.25)',
                    background: categoriaModal === cat ? '#9b7ff0' : 'transparent',
                    color: categoriaModal === cat ? '#fff' : '#8b7ec8',
                    transition: 'all 0.2s',
                  }}
                >{cat}</button>
              ))}
            </div>

            {/* Botón subir */}
            <button
              onClick={subirPrenda}
              disabled={subiendo || !archivoModal || !nombreModal}
              style={{
                width: '100%', padding: '14px', borderRadius: 50, border: 'none',
                background: subiendo || !archivoModal || !nombreModal
                  ? 'rgba(155,127,240,0.3)'
                  : 'linear-gradient(135deg, #6a5acd, #9b7ff0)',
                color: '#fff', fontSize: '0.95rem',
                fontFamily: 'Inter, sans-serif', cursor: subiendo ? 'not-allowed' : 'pointer',
              }}
            >
              {subiendo ? 'Subiendo...' : 'Guardar prenda'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Armario