import { useState } from 'react'

const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

// Outfits de ejemplo asignados a días específicos
const outfitsCalendario = {
  '2026-06-01': { emoji: '👗', nombre: 'Vestido floral', prendas: { top: '👗', pantalon: '🩱', bolso: '👛', zapatos: '👠', accesorio: '📿' } },
  '2026-06-03': { emoji: '🧥', nombre: 'Dark casual', prendas: { top: '🧥', pantalon: '👖', bolso: '👜', zapatos: '👟', accesorio: '🕶️' } },
  '2026-06-08': { emoji: '👕', nombre: 'Uni look', prendas: { top: '👕', pantalon: '👖', bolso: '🎒', zapatos: '👟', accesorio: '💍' } },
  '2026-06-10': { emoji: '👗', nombre: 'Date night', prendas: { top: '👗', pantalon: '🩱', bolso: '👛', zapatos: '👠', accesorio: '💍' } },
  '2026-06-15': { emoji: '👚', nombre: 'Domingo chill', prendas: { top: '👚', pantalon: '🩳', bolso: '🎒', zapatos: '🥿', accesorio: '🕶️' } },
  '2026-06-17': { emoji: '🧥', nombre: 'Elegante total', prendas: { top: '🧥', pantalon: '🩱', bolso: '👜', zapatos: '👠', accesorio: '📿' } },
  '2026-06-22': { emoji: '👕', nombre: 'Casual viernes', prendas: { top: '👕', pantalon: '👖', bolso: '👜', zapatos: '👟', accesorio: '📿' } },
  '2026-06-25': { emoji: '👗', nombre: 'Vestido azul', prendas: { top: '👗', pantalon: '🩱', bolso: '👛', zapatos: '👠', accesorio: '💍' } },
}

function fechaKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function CollageMini({ prendas }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ background: '#f5f5f7', borderRadius: 8, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem' }}>{prendas.top}</div>
        <div style={{ background: '#f5f5f7', borderRadius: 8, height: 85, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem' }}>{prendas.pantalon}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ background: '#f5f5f7', borderRadius: 8, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{prendas.bolso}</div>
        <div style={{ background: '#f5f5f7', borderRadius: 8, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{prendas.zapatos}</div>
        <div style={{ background: '#f5f5f7', borderRadius: 8, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{prendas.accesorio}</div>
      </div>
    </div>
  )
}

const Calendario = () => {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth())
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoy.getDate())

  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  const celdas = []
  for (let i = 0; i < primerDia; i++) celdas.push(null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d)

  const mesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio(a => a - 1) }
    else setMes(m => m - 1)
    setDiaSeleccionado(1)
  }

  const mesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio(a => a + 1) }
    else setMes(m => m + 1)
    setDiaSeleccionado(1)
  }

  const esHoy = (d) => d === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
  const keySeleccionado = diaSeleccionado ? fechaKey(anio, mes, diaSeleccionado) : null
  const outfitSeleccionado = keySeleccionado ? outfitsCalendario[keySeleccionado] : null

  return (
    <div style={{ padding: '52px 20px 100px', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b5fa0', marginBottom: 4 }}>
          ✦ tus pintas del mes
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#ede9ff', fontWeight: 400 }}>
            Calendario
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={mesAnterior} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(150,120,255,0.2)', color: '#9b7ff0', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem' }}>‹</button>
            <span style={{ fontSize: '0.8rem', color: '#c4b0ff', whiteSpace: 'nowrap' }}>{MESES[mes].slice(0,3)} {anio}</span>
            <button onClick={mesSiguiente} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(150,120,255,0.2)', color: '#9b7ff0', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem' }}>›</button>
          </div>
        </div>
      </div>

      {/* Días de la semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', color: '#6b5fa0', letterSpacing: '0.08em', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Grid de días */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 24 }}>
        {celdas.map((dia, i) => {
          if (!dia) return <div key={`e-${i}`} />
          const key = fechaKey(anio, mes, dia)
          const outfit = outfitsCalendario[key]
          const seleccionado = dia === diaSeleccionado
          const hoyDia = esHoy(dia)

          return (
            <div
              key={dia}
              onClick={() => setDiaSeleccionado(dia)}
              style={{
                aspectRatio: '1',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: seleccionado ? 'rgba(155,127,240,0.25)' : 'transparent',
                border: hoyDia ? '1.5px solid rgba(155,127,240,0.6)' : seleccionado ? '1.5px solid rgba(155,127,240,0.4)' : '1.5px solid transparent',
                transition: 'all 0.15s',
                gap: 2,
              }}
            >
              <span style={{ fontSize: outfit ? '1.1rem' : '0.7rem', lineHeight: 1 }}>
                {outfit ? outfit.emoji : dia}
              </span>
              {outfit && (
                <span style={{ fontSize: '0.55rem', color: '#8b7ec8' }}>{dia}</span>
              )}
              {!outfit && (
                <span style={{ display: 'none' }}></span>
              )}
            </div>
          )
        })}
      </div>

      {/* Panel del día seleccionado */}
      {diaSeleccionado && (
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 20,
          padding: 18,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {diaSeleccionado} de {MESES[mes].toUpperCase()} {anio}
            </p>
            {esHoy(diaSeleccionado) && (
              <span style={{ fontSize: '0.65rem', background: '#f0ebff', color: '#7c6bb0', padding: '3px 8px', borderRadius: 10 }}>Hoy</span>
            )}
          </div>

          {outfitSeleccionado ? (
            <>
              <CollageMini prendas={outfitSeleccionado.prendas} />
              <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#333', margin: '10px 0 4px' }}>{outfitSeleccionado.nombre}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#f0ebff', color: '#6b4fcf', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Cambiar pinta
                </button>
                <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#1a0a3e', color: '#c4b0ff', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  ✨ Sugerir con IA
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: 14 }}>Sin pinta asignada</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e0d8f0', background: 'transparent', color: '#7c6bb0', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Elegir pinta
                </button>
                <button style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#1a0a3e', color: '#c4b0ff', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  ✨ Sugerir con IA
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default Calendario
