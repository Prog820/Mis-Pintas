import { useState } from 'react'

const prendasEjemplo = {
  top: [
    { id: 1, emoji: '👗', nombre: 'Vestido azul', color: '#e8f0fe' },
    { id: 2, emoji: '👕', nombre: 'Camiseta blanca', color: '#f5f5f5' },
    { id: 3, emoji: '🧥', nombre: 'Cardigan beige', color: '#fdf3e7' },
  ],
  pantalon: [
    { id: 1, emoji: '👖', nombre: 'Jeans azul', color: '#e3edf8' },
    { id: 2, emoji: '🩱', nombre: 'Falda negra', color: '#eeeeee' },
    { id: 3, emoji: '🩳', nombre: 'Shorts beige', color: '#fdf3e7' },
  ],
  bolso: [
    { id: 1, emoji: '👜', nombre: 'Tote café', color: '#f5ede3' },
    { id: 2, emoji: '👛', nombre: 'Clutch negro', color: '#eeeeee' },
    { id: 3, emoji: '🎒', nombre: 'Mochila lila', color: '#f0ebfa' },
  ],
  zapatos: [
    { id: 1, emoji: '👟', nombre: 'Tenis blancos', color: '#f5f5f5' },
    { id: 2, emoji: '👠', nombre: 'Tacones nude', color: '#fdf0e8' },
    { id: 3, emoji: '🥿', nombre: 'Flats negros', color: '#eeeeee' },
  ],
  accesorio: [
    { id: 1, emoji: '💍', nombre: 'Anillo plata', color: '#f5f5f5' },
    { id: 2, emoji: '📿', nombre: 'Collar dorado', color: '#fefce8' },
    { id: 3, emoji: '🕶️', nombre: 'Lentes café', color: '#fdf3e7' },
  ],
}

function SlotPrenda({ prenda, etiqueta, onAnterior, onSiguiente, altura }) {
  return (
    <div style={{ position: 'relative', height: altura, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: prenda.color,
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'background 0.3s',
      }}>
        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{prenda.emoji}</span>
        <span style={{
          fontSize: '0.6rem',
          color: '#aaa',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontFamily: 'Inter, sans-serif',
        }}>{etiqueta}</span>
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
  const [indices, setIndices] = useState({ top: 0, pantalon: 0, bolso: 0, zapatos: 0, accesorio: 0 })
  const [guardado, setGuardado] = useState(false)

  const cambiar = (cat, dir) => {
    const lista = prendasEjemplo[cat]
    setIndices(prev => ({ ...prev, [cat]: (prev[cat] + dir + lista.length) % lista.length }))
    setGuardado(false)
  }

  const get = (cat) => prendasEjemplo[cat][indices[cat]]

  const guardar = () => {
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  return (
    <div style={{ padding: '52px 20px 100px', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b5fa0', marginBottom: 4 }}>
            ✦ tu armario
          </p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#ede9ff', fontWeight: 400 }}>
            Armario
          </h1>
        </div>
        <button style={{
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

      {/* Collage blanco */}
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        padding: 14,
        boxShadow: '0 0 50px rgba(155,127,240,0.15)',
        marginBottom: 16,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>

          {/* Columna izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SlotPrenda
              prenda={get('top')} etiqueta="Top"
              onAnterior={() => cambiar('top', -1)} onSiguiente={() => cambiar('top', 1)}
              altura={150}
            />
            <SlotPrenda
              prenda={get('pantalon')} etiqueta="Pantalón"
              onAnterior={() => cambiar('pantalon', -1)} onSiguiente={() => cambiar('pantalon', 1)}
              altura={190}
            />
          </div>

          {/* Columna derecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SlotPrenda
              prenda={get('bolso')} etiqueta="Bolso"
              onAnterior={() => cambiar('bolso', -1)} onSiguiente={() => cambiar('bolso', 1)}
              altura={100}
            />
            <SlotPrenda
              prenda={get('zapatos')} etiqueta="Zapatos"
              onAnterior={() => cambiar('zapatos', -1)} onSiguiente={() => cambiar('zapatos', 1)}
              altura={120}
            />
            <SlotPrenda
              prenda={get('accesorio')} etiqueta="Accesorio"
              onAnterior={() => cambiar('accesorio', -1)} onSiguiente={() => cambiar('accesorio', 1)}
              altura={120}
            />
          </div>

        </div>

        {/* Chips de prendas seleccionadas */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
          {['top', 'pantalon', 'bolso', 'zapatos', 'accesorio'].map(cat => (
            <span key={cat} style={{
              fontSize: '0.68rem', fontFamily: 'Inter, sans-serif',
              background: '#f7f4ff', color: '#7c6bb0',
              padding: '3px 10px', borderRadius: 20,
            }}>
              {get(cat).emoji} {get(cat).nombre}
            </span>
          ))}
        </div>
      </div>

      {/* Botón guardar */}
      <button
        onClick={guardar}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 50,
          border: guardado ? 'none' : '1.5px solid rgba(150,120,255,0.5)',
          background: guardado ? 'linear-gradient(135deg, #6a5acd, #9b7ff0)' : 'transparent',
          color: guardado ? '#fff' : '#c4b0ff',
          fontSize: '0.95rem',
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
          transition: 'all 0.25s',
          letterSpacing: '0.03em',
        }}
      >
        {guardado ? '✓ Pinta guardada' : '✨ Guardar pinta'}
      </button>

    </div>
  )
}

export default Armario
