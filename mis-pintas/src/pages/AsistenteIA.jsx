import { useState } from 'react'

const insposEjemplo = [
  { id: 1, emoji: '🖤', color: '#1a1a2e' },
  { id: 2, emoji: '🌿', color: '#1a2e1a' },
  { id: 3, emoji: '🤍', color: '#e8e8e8' },
  { id: 4, emoji: '🌸', color: '#2e1a1a' },
  { id: 5, emoji: '☀️', color: '#2e2a1a' },
]

const ocasiones = ['casual', 'universidad', 'salida nocturna', 'formal', 'deporte', 'cita']

const AsistenteIA = () => {
  const [inspoSeleccionada, setInspoSeleccionada] = useState(0)
  const [ocasionesSeleccionadas, setOcasionesSeleccionadas] = useState(['casual'])
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState(null)

  const toggleOcasion = (o) => {
    setOcasionesSeleccionadas(prev =>
      prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]
    )
    setResultado(null)
  }

  const crearPinta = () => {
    setCargando(true)
    setResultado(null)
    // Simulación — después conectará con Claude API
    setTimeout(() => {
      setCargando(false)
      setResultado({
        prendas: { top: '👗', pantalon: '🩱', bolso: '👛', zapatos: '👠', accesorio: '💍' },
        explicacion: 'Basándome en tu inspo y la ocasión seleccionada, elegí un vestido elegante combinado con accesorios dorados. El bolso pequeño y los tacones complementan el look sin sobrecargarlo.',
      })
    }, 2000)
  }

  return (
    <div style={{ padding: '52px 20px 100px', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b5fa0', marginBottom: 4 }}>
          ✦ crea tu pinta con inteligencia artificial
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#ede9ff', fontWeight: 400 }}>
          Asistente IA
        </h1>
      </div>

      {/* Sección inspo */}
      <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b5fa0', marginBottom: 12 }}>
        ✦ elige tu foto de inspo
      </p>

      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none', marginBottom: 24 }}>
        {/* Botón agregar inspo */}
        <div style={{
          flexShrink: 0, width: 80, height: 100, borderRadius: 14,
          border: '1.5px dashed rgba(150,120,255,0.35)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', gap: 4,
        }}>
          <span style={{ fontSize: '1.4rem', color: '#6b5fa0' }}>+</span>
          <span style={{ fontSize: '0.6rem', color: '#6b5fa0', textAlign: 'center', lineHeight: 1.3 }}>Agregar inspo</span>
        </div>

        {insposEjemplo.map((inspo, i) => (
          <div
            key={inspo.id}
            onClick={() => { setInspoSeleccionada(i); setResultado(null) }}
            style={{
              flexShrink: 0, width: 80, height: 100, borderRadius: 14,
              background: inspo.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', cursor: 'pointer',
              border: inspoSeleccionada === i ? '2.5px solid #9b7ff0' : '2.5px solid transparent',
              transition: 'border 0.2s',
              boxShadow: inspoSeleccionada === i ? '0 0 12px rgba(155,127,240,0.4)' : 'none',
            }}
          >
            {inspo.emoji}
          </div>
        ))}
      </div>

      {/* Sección ocasión */}
      <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b5fa0', marginBottom: 12 }}>
        ✦ ocasión
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
        {ocasiones.map(o => (
          <button
            key={o}
            onClick={() => toggleOcasion(o)}
            style={{
              padding: '7px 14px', borderRadius: 20,
              border: ocasionesSeleccionadas.includes(o) ? 'none' : '1px solid rgba(150,120,255,0.25)',
              background: ocasionesSeleccionadas.includes(o) ? '#9b7ff0' : 'transparent',
              color: ocasionesSeleccionadas.includes(o) ? '#fff' : '#8b7ec8',
              fontSize: '0.78rem', fontFamily: 'Inter, sans-serif',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {o}
          </button>
        ))}
      </div>

      {/* Botón crear */}
      <button
        onClick={crearPinta}
        disabled={cargando || ocasionesSeleccionadas.length === 0}
        style={{
          width: '100%', padding: '14px', borderRadius: 50,
          border: 'none',
          background: cargando ? 'rgba(155,127,240,0.4)' : 'linear-gradient(135deg, #6a5acd, #9b7ff0)',
          color: '#fff', fontSize: '0.95rem',
          fontFamily: 'Inter, sans-serif', cursor: cargando ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s', letterSpacing: '0.03em',
          marginBottom: 24,
        }}
      >
        {cargando ? '✨ Creando tu pinta...' : '✦ Crear pinta con IA'}
      </button>

      {/* Loading */}
      {cargando && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid rgba(155,127,240,0.2)',
            borderTop: '3px solid #9b7ff0',
            margin: '0 auto 12px',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: '#8b7ec8', fontSize: '0.85rem' }}>Analizando tu estilo...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: 18 }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', marginBottom: 14 }}>
            ✦ tu pinta sugerida
          </p>

          {/* Collage resultado */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14, border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ background: '#f5f5f7', borderRadius: 10, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{resultado.prendas.top}</div>
              <div style={{ background: '#f5f5f7', borderRadius: 10, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{resultado.prendas.pantalon}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ background: '#f5f5f7', borderRadius: 10, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{resultado.prendas.bolso}</div>
              <div style={{ background: '#f5f5f7', borderRadius: 10, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{resultado.prendas.zapatos}</div>
              <div style={{ background: '#f5f5f7', borderRadius: 10, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{resultado.prendas.accesorio}</div>
            </div>
          </div>

          {/* Explicación IA */}
          <p style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6, marginBottom: 14 }}>
            {resultado.explicacion}
          </p>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#1a0a3e', color: '#c4b0ff', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Guardar pinta
            </button>
            <button
              onClick={crearPinta}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e0d8f0', background: 'transparent', color: '#7c6bb0', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default AsistenteIA