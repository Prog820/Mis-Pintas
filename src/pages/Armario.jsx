import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { colors, fonts } from '../styles/global'
import { quitarFondo } from '../lib/removebg'
import { describirPrenda } from '../lib/gemini'
import heic2any from 'heic2any'

const CATEGORIAS_ACCESORIO = ['accesorio_manillas', 'accesorio_aretes', 'accesorio_cabeza', 'accesorio_anillos', 'accesorio_relojes', 'accesorio_collares']
const CATEGORIAS = ['top', 'chaqueta', 'pantalon', 'bolso', 'zapatos', ...CATEGORIAS_ACCESORIO]
const ETIQUETAS = {
  top: 'Top', chaqueta: 'Chaqueta', pantalon: 'Pantalón', bolso: 'Bolso', zapatos: 'Zapatos',
  accesorio_manillas: 'Manillas', accesorio_aretes: 'Aretes', accesorio_cabeza: 'Cabeza',
  accesorio_anillos: 'Anillos', accesorio_relojes: 'Relojes', accesorio_collares: 'Collares',
}

async function convertirAJpg(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d').drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url)
        if (!blob) return reject(new Error('No se pudo convertir la imagen'))
        resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.9)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Formato no soportado'))
    }
    img.src = url
  })
}

function SlotPrenda({ prenda, etiqueta, onAnterior, onSiguiente, altura, cargando, onEliminar }) {
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

        {prenda && onEliminar && (
          <button onClick={onEliminar} style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(20,20,30,0.45)', color: '#fff', fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>✕</button>
        )}
      </div>

      <button onClick={onAnterior} className="flecha-slot" style={{ left: 4 }}>‹</button>
      <button onClick={onSiguiente} className="flecha-slot" style={{ right: 4 }}>›</button>
    </div>
  )
}

function InsposTab() {
  const [inspos, setInspos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)
  const inputRef = useRef(null)
  const [cols, setCols] = useState(window.innerWidth >= 768 ? 3 : 2)

  useEffect(() => {
    const handleResize = () => setCols(window.innerWidth >= 768 ? 3 : 2)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { cargarInspos() }, [])

  async function cargarInspos() {
    setCargando(true)
    const { data, error } = await supabase.from('inspos').select('*').order('created_at', { ascending: false })
    if (!error) setInspos(data)
    setCargando(false)
  }

  async function subirInspo(e) {
    const file = e.target.files[0]
    if (!file) return
    setSubiendo(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `inspo_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('prendas').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('prendas').getPublicUrl(fileName)
      const { error: insertError } = await supabase.from('inspos').insert({ foto_url: urlData.publicUrl })
      if (insertError) throw insertError
      await cargarInspos()
    } catch (err) {
      alert('Error subiendo la foto. Intenta de nuevo.')
    }
    setSubiendo(false)
  }

  async function eliminarInspo(inspo) {
    const fileName = inspo.foto_url.split('/').pop()
    await supabase.storage.from('prendas').remove([fileName])
    await supabase.from('inspos').delete().eq('id', inspo.id)
    setConfirmarEliminar(null)
    await cargarInspos()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={() => inputRef.current?.click()} disabled={subiendo} style={{ width: 38, height: 38, borderRadius: '50%', border: `1.5px solid ${colors.border}`, background: 'transparent', color: colors.accent, fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {subiendo ? '...' : '+'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={subirInspo} />
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', color: colors.textMuted, marginTop: 40, fontFamily: fonts.body, fontSize: '0.9rem' }}>Cargando...</div>
      ) : inspos.length === 0 ? (
        <div style={{ textAlign: 'center', color: colors.textMuted, marginTop: 40, fontFamily: fonts.body, fontSize: '0.9rem' }}>
          <p style={{ marginBottom: 16 }}>Aún no tienes fotos de inspiración</p>
          <button onClick={() => inputRef.current?.click()} style={{ padding: '10px 24px', borderRadius: 50, border: `1.5px solid ${colors.border}`, background: 'transparent', color: colors.accentLight, fontFamily: fonts.body, fontSize: '0.85rem', cursor: 'pointer' }}>Agregar primera inspo</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
          {inspos.map(inspo => (
            <div key={inspo.id} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '3/4' }}>
              <img src={inspo.foto_url} alt="inspo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => setConfirmarEliminar(inspo)} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {confirmarEliminar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#0d1530', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
            <img src={confirmarEliminar.foto_url} alt="inspo" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 12, marginBottom: 20 }} />
            <p style={{ fontSize: '0.9rem', color: colors.textSoft, fontFamily: fonts.body, marginBottom: 6, fontWeight: 500 }}>¿Eliminar esta inspo?</p>
            <p style={{ fontSize: '0.78rem', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 20 }}>No se puede deshacer</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmarEliminar(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textMuted, fontSize: '0.82rem', fontFamily: fonts.body, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => eliminarInspo(confirmarEliminar)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'rgba(255,80,80,0.7)', color: '#fff', fontSize: '0.82rem', fontFamily: fonts.body, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MiniSlotAccesorio({ prenda, etiqueta, activo, onToggle, onAnterior, onSiguiente }) {
  return (
    <div style={{ background: activo ? '#f5f7fc' : '#f0f0f0', borderRadius: 10, padding: 6, opacity: activo ? 1 : 0.45, transition: 'opacity 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: '0.6rem', color: '#888', fontFamily: fonts.body }}>{etiqueta}</span>
        <button onClick={onToggle} style={{ width: 26, height: 15, borderRadius: 999, border: 'none', cursor: 'pointer', background: activo ? colors.accent : '#ccc', position: 'relative', padding: 0, flexShrink: 0 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: activo ? 13 : 2, transition: '0.2s' }} />
        </button>
      </div>
      {activo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button onClick={onAnterior} style={{ background: 'none', border: 'none', color: '#bbb', fontSize: '0.8rem', cursor: 'pointer', padding: '0 2px' }}>‹</button>
          <div style={{ flex: 1, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {prenda?.foto_url
              ? <img src={prenda.foto_url} alt={etiqueta} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <span style={{ fontSize: '0.6rem', color: '#ccc' }}>—</span>
            }
          </div>
          <button onClick={onSiguiente} style={{ background: 'none', border: 'none', color: '#bbb', fontSize: '0.8rem', cursor: 'pointer', padding: '0 2px' }}>›</button>
        </div>
      )}
    </div>
  )
}

const Armario = () => {
  const vacioPorCategoria = () => Object.fromEntries(CATEGORIAS.map(cat => [cat, cat.startsWith('accesorio_') ? [] : []]))
  const [prendas, setPrendas] = useState(vacioPorCategoria())
  const [indices, setIndices] = useState(Object.fromEntries(CATEGORIAS.map(cat => [cat, 0])))
  const [accesoriosActivos, setAccesoriosActivos] = useState(Object.fromEntries(CATEGORIAS_ACCESORIO.map(cat => [cat, false])))
  const [cargando, setCargando] = useState(true)
  const [subiendo, setSubiendo] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [pestana, setPestana] = useState('prendas')
  const [modalAgregar, setModalAgregar] = useState(false)
  const [categoriaModal, setCategoriaModal] = useState('top')
  const [nombreModal, setNombreModal] = useState('')
  const [archivoModal, setArchivoModal] = useState(null)
  const [previewModal, setPreviewModal] = useState(null)
  const inputRef = useRef(null)
  const [descripcionModal, setDescripcionModal] = useState('')
  const [mostrarAvisoDescripcion, setMostrarAvisoDescripcion] = useState(false)
  const [generandoDesc, setGenerandoDesc] = useState(false)
  const [quitarFondoAuto, setQuitarFondoAuto] = useState(true)
  const [conChaqueta, setConChaqueta] = useState(false)
  const [prendaAEliminar, setPrendaAEliminar] = useState(null)


  useEffect(() => { cargarPrendas() }, [])

  async function cargarPrendas() {
    setCargando(true)
    const { data, error } = await supabase.from('prendas').select('*').order('created_at', { ascending: true })
    if (!error) {
      const agrupadas = vacioPorCategoria()
      data.forEach(p => { if (agrupadas[p.categoria]) agrupadas[p.categoria].push(p) })
      setPrendas(agrupadas)
    }
    setCargando(false)
  }

  async function eliminarPrenda() {
    if (!prendaAEliminar) return
    const fileName = prendaAEliminar.foto_url.split('/').pop()
    await supabase.storage.from('prendas').remove([fileName])
    await supabase.from('prendas').delete().eq('id', prendaAEliminar.id)
    setPrendaAEliminar(null)
    await cargarPrendas()
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
    setQuitarFondoAuto(true)
  }

  const seleccionarArchivo = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  let archivoFinal = file

  // Convertir HEIC/HEIF a JPG
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    try {
      const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
      archivoFinal = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
    } catch (err) {
      console.error('Error convirtiendo HEIC:', err)
    }
  }

  // Si el formato no es uno de los seguros para navegador, convertir a JPG
  const formatosSeguro = ['image/jpeg', 'image/png', 'image/webp']
  if (!formatosSeguro.includes(archivoFinal.type)) {
    try {
      archivoFinal = await convertirAJpg(archivoFinal)
    } catch (err) {
      console.error('Formato de imagen no soportado:', err)
      alert('Esta foto tiene un formato que tu navegador no puede abrir. Intenta con otra foto o toma una captura de pantalla de ella y sube eso.')
      return
    }
  }

  setArchivoModal(archivoFinal)
  setPreviewModal(URL.createObjectURL(archivoFinal))
  if (!nombreModal) setNombreModal(file.name.replace(/\.[^/.]+$/, ''))

  setGenerandoDesc(true)
  try {
    const desc = await describirPrenda(archivoFinal)
    setDescripcionModal(desc)
  } catch (err) {
    console.error('Error generando descripción:', err)
    setDescripcionModal('')
  }
  setGenerandoDesc(false)
}

  function subirPrenda() {
    if (!archivoModal || !nombreModal) return
    if (!descripcionModal.trim()) {
      setMostrarAvisoDescripcion(true)
      return
    }
    guardarPrendaFinal()
  }

  async function guardarPrendaFinal() {
    setMostrarAvisoDescripcion(false)
    setSubiendo(true)
  try {
    let archivoFinal = archivoModal

      if (quitarFondoAuto) {
        try {
          archivoFinal = await quitarFondo(archivoModal)
        } catch (err) {
          console.warn('No fue posible quitar el fondo. Se subirá la imagen original.')
        }
      }
    const tipoFinal = archivoFinal.type || 'image/jpeg'
    const extension = tipoFinal === 'image/png' ? 'png' : tipoFinal === 'image/webp' ? 'webp' : 'jpg'
    const fileName = `${Date.now()}.${extension}`
    const { error: uploadError } = await supabase.storage.from('prendas').upload(fileName, archivoFinal, { contentType: tipoFinal })
    if (uploadError) throw uploadError
    const { data: urlData } = supabase.storage.from('prendas').getPublicUrl(fileName)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: insertError } = await supabase.from('prendas').insert({
      categoria: categoriaModal,
      nombre: nombreModal,
      foto_url: urlData.publicUrl,
      descripcion_ia: descripcionModal,
      user_id: user.id,
    })
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
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('outfits').insert({
      user_id: user.id,
      nombre: 'Mi pinta',
      top_id: get('top')?.id || null,
      chaqueta_id: conChaqueta ? get('chaqueta')?.id || null : null,
      pantalon_id: get('pantalon')?.id || null,
      bolso_id: get('bolso')?.id || null,
      zapatos_id: get('zapatos')?.id || null,
      accesorio_manillas_id: accesoriosActivos.accesorio_manillas ? get('accesorio_manillas')?.id || null : null,
      accesorio_aretes_id: accesoriosActivos.accesorio_aretes ? get('accesorio_aretes')?.id || null : null,
      accesorio_cabeza_id: accesoriosActivos.accesorio_cabeza ? get('accesorio_cabeza')?.id || null : null,
      accesorio_anillos_id: accesoriosActivos.accesorio_anillos ? get('accesorio_anillos')?.id || null : null,
      accesorio_relojes_id: accesoriosActivos.accesorio_relojes ? get('accesorio_relojes')?.id || null : null,
      accesorio_collares_id: accesoriosActivos.accesorio_collares ? get('accesorio_collares')?.id || null : null,
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

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['prendas', 'inspos'].map(p => (
          <button
            key={p}
            onClick={() => setPestana(p)}
            style={{
              padding: '8px 20px', borderRadius: 20,
              border: pestana === p ? 'none' : `1px solid ${colors.border}`,
              background: pestana === p ? colors.accent : 'transparent',
              color: pestana === p ? '#fff' : colors.textMuted,
              fontSize: '0.82rem', fontFamily: fonts.body,
              cursor: 'pointer', textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >{p}</button>
        ))}
      </div>

      {pestana === 'prendas' && (
        <button
          onClick={() => setConChaqueta(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            marginBottom: 16, padding: 0,
          }}
        >
          <div style={{
            width: 36, height: 20, borderRadius: 999,
            background: conChaqueta ? colors.accent : '#2a3147',
            position: 'relative', transition: '0.25s', flexShrink: 0,
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 2,
              left: conChaqueta ? 18 : 2, transition: '0.25s',
            }} />
          </div>
          <span style={{ fontSize: '0.8rem', color: colors.textMuted, fontFamily: fonts.body }}>
            Agregar chaqueta
          </span>
        </button>
      )}
        
        {pestana === 'prendas' && (
  <>
    <div style={{ background: colors.white, borderRadius: 20, padding: 14, boxShadow: '0 0 50px rgba(50,100,255,0.12)', marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SlotPrenda
            prenda={get('top')}
            etiqueta="Top"
            onAnterior={() => cambiar('top', -1)}
            onSiguiente={() => cambiar('top', 1)}
            altura={150}
            cargando={cargando}
            onEliminar={() => setPrendaAEliminar(get('top'))}
          />

          <SlotPrenda
            prenda={get('pantalon')}
            etiqueta="Pantalón"
            onAnterior={() => cambiar('pantalon', -1)}
            onSiguiente={() => cambiar('pantalon', 1)}
            altura={190}
            cargando={cargando}
            onEliminar={() => setPrendaAEliminar(get('pantalon'))}
          />

          <SlotPrenda
            prenda={get('zapatos')}
            etiqueta="Zapatos"
            onAnterior={() => cambiar('zapatos', -1)}
            onSiguiente={() => cambiar('zapatos', 1)}
            altura={110}
            cargando={cargando}
            onEliminar={() => setPrendaAEliminar(get('zapatos'))}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {conChaqueta && (
            <SlotPrenda
              prenda={get('chaqueta')}
              etiqueta="Chaqueta"
              onAnterior={() => cambiar('chaqueta', -1)}
              onSiguiente={() => cambiar('chaqueta', 1)}
              altura={190}
              cargando={cargando}
              onEliminar={() => setPrendaAEliminar(get('chaqueta'))}
            />
          )}

          <SlotPrenda
            prenda={get('bolso')}
            etiqueta="Bolso"
            onAnterior={() => cambiar('bolso', -1)}
            onSiguiente={() => cambiar('bolso', 1)}
            altura={90}
            cargando={cargando}
            onEliminar={() => setPrendaAEliminar(get('bolso'))}
          />
        </div>
      </div>

      <p style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', fontFamily: fonts.body, margin: '14px 0 8px' }}>Accesorios</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {CATEGORIAS_ACCESORIO.map(cat => (
          <MiniSlotAccesorio
            key={cat}
            prenda={get(cat)}
            etiqueta={ETIQUETAS[cat]}
            activo={accesoriosActivos[cat]}
            onToggle={() => setAccesoriosActivos(prev => ({ ...prev, [cat]: !prev[cat] }))}
            onAnterior={() => cambiar(cat, -1)}
            onSiguiente={() => cambiar(cat, 1)}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
        {CATEGORIAS.filter(cat => !cat.startsWith('accesorio_') || accesoriosActivos[cat]).map(cat => {
          const p = get(cat)
          return <span key={cat} style={{ fontSize: '0.72rem', fontFamily: fonts.body, background: '#eef2ff', color: colors.accentDim, padding: '3px 10px', borderRadius: 20 }}>{p ? p.nombre : ETIQUETAS[cat] + ' —'}</span>
        })}
      </div>
    </div>

    <button onClick={guardarPinta} style={{ width: '100%', padding: '14px', borderRadius: 50, border: guardado ? 'none' : `1.5px solid ${colors.border}`, background: guardado ? 'linear-gradient(135deg, #2a4abf, #5080ff)' : 'transparent', color: guardado ? '#fff' : colors.accentLight, fontSize: '0.95rem', fontFamily: fonts.body, cursor: 'pointer', transition: 'all 0.25s', letterSpacing: '0.03em' }}>
      {guardado ? '✓ Pinta guardada' : '✨ Guardar pinta'}
    </button>
  </>
)}
{pestana === 'inspos' && <InsposTab />}

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

                        <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
                padding: '12px 14px',
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    color: colors.textSoft,
                    fontFamily: fonts.body,
                    fontSize: '0.84rem',
                    fontWeight: 500,
                  }}
                >
                  Fondo transparente.
                </p>

                <p
                  style={{
                    margin: '3px 0 0',
                    color: colors.textMuted,
                    fontFamily: fonts.body,
                    fontSize: '0.72rem',
                  }}
                >
                  Mejora el resultado usando un crédito.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setQuitarFondoAuto(!quitarFondoAuto)}
                style={{
                  width: 48,
                  height: 28,
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background: quitarFondoAuto ? colors.accent : '#2a3147',
                  position: 'relative',
                  transition: '0.25s',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: 3,
                    left: quitarFondoAuto ? 23 : 3,
                    transition: '0.25s',
                  }}
                />
              </button>
            </div>

            <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: '0.72rem', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 6, letterSpacing: '0.05em' }}>
              {generandoDesc ? '✦ Generando descripción...' : '✦ Descripción de la prenda (editable)'}
            </p>
            <textarea
              value={descripcionModal}
              onChange={e => setDescripcionModal(e.target.value)}
              placeholder={generandoDesc ? 'La IA está analizando tu prenda...' : 'La descripción aparecerá aquí. Puedes editarla.'}
              rows={4}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: `1px solid ${colors.border}`,
                background: 'rgba(255,255,255,0.04)', color: colors.text,
                fontFamily: fonts.body, fontSize: '0.85rem',
                outline: 'none', resize: 'vertical',
                lineHeight: 1.5,
                opacity: generandoDesc ? 0.5 : 1,
              }}
            />
          </div>

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

      {mostrarAvisoDescripcion && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#0d1530', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: colors.textSoft, fontFamily: fonts.body, marginBottom: 6, fontWeight: 500 }}>Sin descripción</p>
            <p style={{ fontSize: '0.78rem', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 20 }}>La IA no tendrá en cuenta esta prenda para sugerir outfits. ¿Quieres continuar sin descripción o volver a agregar una?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setMostrarAvisoDescripcion(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textMuted, fontSize: '0.82rem', fontFamily: fonts.body, cursor: 'pointer' }}>Volver</button>
              <button onClick={guardarPrendaFinal} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: colors.accent, color: '#fff', fontSize: '0.82rem', fontFamily: fonts.body, cursor: 'pointer' }}>Continuar</button>
            </div>
          </div>
        </div>
      )}

      {prendaAEliminar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#0d1530', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
            <img src={prendaAEliminar.foto_url} alt="prenda" style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 12, marginBottom: 16 }} />
            <p style={{ fontSize: '0.9rem', color: colors.textSoft, fontFamily: fonts.body, marginBottom: 6, fontWeight: 500 }}>¿Eliminar {prendaAEliminar.nombre}?</p>
            <p style={{ fontSize: '0.78rem', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 20 }}>Se borrará de tu armario. No se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPrendaAEliminar(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.textMuted, fontSize: '0.82rem', fontFamily: fonts.body, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={eliminarPrenda} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'rgba(255,80,80,0.7)', color: '#fff', fontSize: '0.82rem', fontFamily: fonts.body, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Armario
