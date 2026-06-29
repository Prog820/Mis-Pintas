import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { colors, fonts } from '../styles/global'

const ocasiones = ['casual', 'universidad', 'salida nocturna', 'formal', 'deporte', 'cita']

const AsistenteIA = () => {
  const [inspos, setInspos] = useState([])
  const [inspoSeleccionada, setInspoSeleccionada] = useState(null)
  const [ocasionesSeleccionadas, setOcasionesSeleccionadas] = useState(['casual'])
  const [cargando, setCargando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [resultado, setResultado] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => { cargarInspos() }, [])

  async function cargarInspos() {
    const { data, error } = await supabase.from('inspos').select('*').order('created_at', { ascending: false })
    if (!error) setInspos(data)
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
      console.error('Error subiendo inspo:', err)
      alert('Error subiendo la foto. Intenta de nuevo.')
    }
    setSubiendo(false)
  }

  const toggleOcasion = (o) => {
    setOcasionesSeleccionadas(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o])
    setResultado(null)
  }

  const crearPinta = () => {
    if (!inspoSeleccionada) { alert('Selecciona una foto de inspo primero'); return }
    setCargando(true)
    setResultado(null)
    setTimeout(() => {
      setCargando(false)
      setResultado({
        prendas: { top: '👗', pantalon: '🩱', bolso: '👛', zapatos: '👠', accesorio: '💍' },
        explicacion: 'Basándome en tu inspo y la ocasión seleccionada, elegí un vestido elegante combinado con accesorios dorados. El bolso pequeño y los tacones complementan el look sin sobrecargarlo.',
      })
    }, 2000)
  }

  const labelStyle = { fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 12 }

  return (
    <div style={{ padding: '52px 20px 100px', minHeight: '100vh' }}>

      <div style={{ marginBottom: 24 }}>
        <p style={{ ...labelStyle, marginBottom: 4 }}>✦ crea tu pinta con inteligencia artificial</p>
        <h1 style={{ fontFamily: fonts.title, fontSize: '1.75rem', color: colors.textSoft, fontWeight: 600 }}>Asistente IA</h1>
      </div>

      <p style={labelStyle}>✦ elige tu foto de inspo</p>

      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none', marginBottom: 24 }}>
        <div onClick={() => !subiendo && inputRef.current?.click()} style={{ flexShrink: 0, width: 80, height: 100, borderRadius: 14, border: `1.5px dashed ${colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: subiendo ? 'not-allowed' : 'pointer', gap: 4, opacity: subiendo ? 0.5 : 1 }}>
          <span style={{ fontSize: '1.4rem', color: colors.textDim }}>{subiendo ? '...' : '+'}</span>
          <span style={{ fontSize: '0.65rem', color: colors.textMuted, textAlign: 'center', lineHeight: 1.3, fontFamily: fonts.body }}>{subiendo ? 'Subiendo...' : 'Agregar inspo'}</span>
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={subirInspo} />

        {inspos.map(inspo => (
          <div key={inspo.id} onClick={() => { setInspoSeleccionada(inspo); setResultado(null) }} style={{ flexShrink: 0, width: 80, height: 100, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', border: inspoSeleccionada?.id === inspo.id ? `2.5px solid ${colors.accent}` : '2.5px solid transparent', boxShadow: inspoSeleccionada?.id === inspo.id ? '0 0 12px rgba(80,128,255,0.4)' : 'none', transition: 'all 0.2s' }}>
            <img src={inspo.foto_url} alt="inspo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}

        {inspos.length === 0 && !subiendo && (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
            <p style={{ fontSize: '0.82rem', color: colors.textMuted, fontFamily: fonts.body }}>Sube tu primera foto de inspiración</p>
          </div>
        )}
      </div>

      <p style={labelStyle}>✦ ocasión</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {ocasiones.map(o => (
          <button key={o} onClick={() => toggleOcasion(o)} style={{ padding: '7px 14px', borderRadius: 20, border: ocasionesSeleccionadas.includes(o) ? 'none' : `1px solid ${colors.border}`, background: ocasionesSeleccionadas.includes(o) ? colors.accent : 'transparent', color: ocasionesSeleccionadas.includes(o) ? '#fff' : colors.textMuted, fontSize: '0.78rem', fontFamily: fonts.body, cursor: 'pointer', transition: 'all 0.2s' }}>{o}</button>
        ))}
      </div>

      <button onClick={crearPinta} disabled={cargando || ocasionesSeleccionadas.length === 0} style={{ width: '100%', padding: '14px', borderRadius: 50, border: 'none', background: cargando ? `rgba(80,128,255,0.4)` : 'linear-gradient(135deg, #2a4abf, #5080ff)', color: '#fff', fontSize: '0.95rem', fontFamily: fonts.body, cursor: cargando ? 'not-allowed' : 'pointer', transition: 'all 0.25s', letterSpacing: '0.03em', marginBottom: 24 }}>
        {cargando ? '✨ Creando tu pinta...' : '✦ Crear pinta con IA'}
      </button>

      {cargando && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid rgba(80,128,255,0.2)`, borderTop: `3px solid ${colors.accent}`, margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: colors.textMuted, fontSize: '0.85rem', fontFamily: fonts.body }}>Analizando tu estilo...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {resultado && (
        <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: 18 }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', marginBottom: 14, fontFamily: fonts.body }}>✦ tu pinta sugerida</p>
          <div style={{ background: '#fff', borderRadius: 12, padding: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14, border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ background: '#f0f2f8', borderRadius: 10, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{resultado.prendas.top}</div>
              <div style={{ background: '#f0f2f8', borderRadius: 10, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{resultado.prendas.pantalon}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ background: '#f0f2f8', borderRadius: 10, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{resultado.prendas.bolso}</div>
              <div style={{ background: '#f0f2f8', borderRadius: 10, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{resultado.prendas.zapatos}</div>
              <div style={{ background: '#f0f2f8', borderRadius: 10, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{resultado.prendas.accesorio}</div>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.6, marginBottom: 14, fontFamily: fonts.body }}>{resultado.explicacion}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#0a1540', color: colors.accentLight, fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: fonts.body }}>Guardar pinta</button>
            <button onClick={crearPinta} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #eef2ff', background: 'transparent', color: '#3a5abf', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: fonts.body }}>Intentar de nuevo</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AsistenteIA