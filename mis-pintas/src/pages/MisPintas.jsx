import { useState } from 'react'

const filtros = ['todas', 'favoritas', 'casual', 'universidad', 'salida nocturna', 'formal', 'deporte', 'cita']

const pintasEjemplo = [
  {
    id: 1, nombre: 'Dark casual', categoria: 'casual', favorita: false,
    hace: 'hace 2 días',
    prendas: { top: '👕', pantalon: '👖', bolso: '👜', zapatos: '👟', accesorio: '🕶️' },
  },
  {
    id: 2, nombre: 'Vestido floral', categoria: 'salida nocturna', favorita: true,
    hace: 'hace 5 días',
    prendas: { top: '👗', pantalon: '🩱', bolso: '👛', zapatos: '👠', accesorio: '📿' },
  },
  {
    id: 3, nombre: 'Uni look', categoria: 'universidad', favorita: false,
    hace: 'ayer',
    prendas: { top: '👕', pantalon: '👖', bolso: '🎒', zapatos: '👟', accesorio: '💍' },
  },
  {
    id: 4, nombre: 'Elegante total', categoria: 'formal', favorita: true,
    hace: 'hace 1 sem',
    prendas: { top: '🧥', pantalon: '🩱', bolso: '👜', zapatos: '👠', accesorio: '📿' },
  },
  {
    id: 5, nombre: 'Domingo chill', categoria: 'casual', favorita: false,
    hace: 'hace 1 sem',
    prendas: { top: '👗', pantalon: '🩳', bolso: '🎒', zapatos: '🥿', accesorio: '🕶️' },
  },
  {
    id: 6, nombre: 'Date night', categoria: 'cita', favorita: true,
    hace: 'hace 2 sem',
    prendas: { top: '👗', pantalon: '🩱', bolso: '👛', zapatos: '👠', accesorio: '💍' },
  },
]

function CollageMini({ prendas }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 8,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 5,
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ background: '#f5f5f7', borderRadius: 8, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>{prendas.top}</div>
        <div style={{ background: '#f5f5f7', borderRadius: 8, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}>{prendas.pantalon}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ background: '#f5f5f7', borderRadius: 8, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{prendas.bolso}</div>
        <div style={{ background: '#f5f5f7', borderRadius: 8, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{prendas.zapatos}</div>
        <div style={{ background: '#f5f5f7', borderRadius: 8, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{prendas.accesorio}</div>
      </div>
    </div>
  )
}

const MisPintas = () => {
  const [filtroActivo, setFiltroActivo] = useState('todas')
  const [pintas, setPintas] = useState(pintasEjemplo)

  const toggleFavorita = (id) => {
    setPintas(prev => prev.map(p => p.id === id ? { ...p, favorita: !p.favorita } : p))
  }

  const pintasFiltradas = pintas.filter(p => {
    if (filtroActivo === 'todas') return true
    if (filtroActivo === 'favoritas') return p.favorita
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
              flexShrink: 0,
              padding: '6px 14px',
              borderRadius: 20,
              border: filtroActivo === f ? 'none' : '1px solid rgba(150,120,255,0.25)',
              background: filtroActivo === f ? '#9b7ff0' : 'transparent',
              color: filtroActivo === f ? '#fff' : '#8b7ec8',
              fontSize: '0.75rem',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid de pintas */}
      {pintasFiltradas.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6b5fa0', marginTop: 60, fontSize: '0.9rem' }}>
          No hay pintas en esta categoría todavía
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {pintasFiltradas.map(pinta => (
            <div
              key={pinta.id}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(150,120,255,0.12)',
                borderRadius: 16,
                padding: 12,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {/* Corazón */}
              <button
                onClick={() => toggleFavorita(pinta.id)}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'none', border: 'none',
                  fontSize: '1rem', cursor: 'pointer',
                  opacity: pinta.favorita ? 1 : 0.35,
                  transition: 'opacity 0.2s',
                }}
              >
                {pinta.favorita ? '❤️' : '🤍'}
              </button>

              <CollageMini prendas={pinta.prendas} />

              <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#d4cef5', marginBottom: 3 }}>
                {pinta.nombre}
              </p>
              <p style={{ fontSize: '0.68rem', color: '#6b5fa0' }}>
                {pinta.categoria} · {pinta.hace}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default MisPintas
