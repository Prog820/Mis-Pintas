import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function fechaKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function CollageMini({ prendas }) {
  const Slot = ({ prenda, height }) => (
    <div style={{
      background: '#f5f5f7', borderRadius: 8, height,
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      {prenda?.foto_url
        ? <img src={prenda.foto_url} alt={prenda.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        : <span style={{ fontSize: '0.6rem', color: '#ccc' }}>—</span>
      }
    </div>
  )

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Slot prenda={prendas?.top} height={70} />
        <Slot prenda={prendas?.pantalon} height={85} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Slot prenda={prendas?.bolso} height={50} />
        <Slot prenda={prendas?.zapatos} height={50} />
        <Slot prenda={prendas?.accesorio} height={50} />
      </div>
    </div>
  )
}

const Calendario = () => {
  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth())
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoy.getDate())
  const [outfitsCalendario, setOutfitsCalendario] = useState({})
  const [pintas, setPintas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalElegir, setModalElegir] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [mes, anio])

  async function cargarDatos() {
    setCargando(true)

    const primerDia = fechaKey(anio, mes, 1)
    const ultimoDia = fechaKey(anio, mes, new Date(anio, mes + 1, 0).getDate())

    const { data: calData } = await supabase
      .from('calendario')
      .select(`
        *,
        outfit:outfit_id(
          *,
          top:top_id(*),
          pantalon:pantalon_id(*),
          bolso:bolso_id(*),
          zapatos:zapatos_id(*),
          accesorio:accesorio_id(*)
        )
      `)
      .gte('fecha', primerDia)
      .lte('fecha', ultimoDia)

    const { data: pintasData } = await supabase
      .from('outfits')
      .select(`*, top:top_id(*), pantalon:pantalon_id(*), bolso:bolso_id(*), zapatos:zapatos_id(*), accesorio:accesorio_id(*)`)
      .order('created_at', { ascending: false })

    if (calData) {
      const mapa = {}
      calData.forEach(entry => { mapa[entry.fecha] = entry })
      setOutfitsCalendario(mapa)
    }

    if (pintasData) setPintas(pintasData)

    setCargando(false)
  }

  async function asignarPinta(outfitId) {
    const fecha = fechaKey(anio, mes, diaSeleccionado)
    const existente = outfitsCalendario[fecha]

    if (existente) {
      await supabase.from('calendario').update({ outfit_id: outfitId }).eq('id', existente.id)
    } else {
      await supabase.from('calendario').insert({ fecha, outfit_id: outfitId })
    }

    setModalElegir(false)
    await cargarDatos()
  }

  async function quitarPinta() {
    const fecha = fechaKey(anio, mes, diaSeleccionado)
    const existente = outfitsCalendario[fecha]
    if (existente) {
      await supabase.from('calendario').delete().eq('id', existente.id)
      await cargarDatos()
    }
  }

  const primerDiaSemana = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const celdas = []
  for (let i = 0; i < primerDiaSemana; i++) celdas.push(null)
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
  const entradaSeleccionada = keySeleccionado ? outfitsCalendario[keySeleccionado] : null
  const outfitSeleccionado = entradaSeleccionada?.outfit

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

      {/* Grid días */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 24 }}>
        {celdas.map((dia, i) => {
          if (!dia) return <div key={`e-${i}`} />
          const key = fechaKey(anio, mes, dia)
          const entrada = outfitsCalendario[key]
          const fotoTop = entrada?.outfit?.top?.foto_url
          const seleccionado = dia === diaSeleccionado
          const hoyDia = esHoy(dia)

          return (
            <div
              key={dia}
              onClick={() => setDiaSeleccionado(dia)}
              style={{
                aspectRatio: '1', borderRadius: 10,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', overflow: 'hidden',
                background: seleccionado ? 'rgba(155,127,240,0.25)' : 'transparent',
                border: hoyDia ? '1.5px solid rgba(155,127,240,0.6)' : seleccionado ? '1.5px solid rgba(155,127,240,0.4)' : '1.5px solid transparent',
                transition: 'all 0.15s', gap: 1,
              }}
            >
              {fotoTop ? (
                <>
                  <img src={fotoTop} alt="" style={{ width: '70%', height: '60%', objectFit: 'contain' }} />
                  <span style={{ fontSize: '0.5rem', color: '#8b7ec8' }}>{dia}</span>
                </>
              ) : (
                <span style={{ fontSize: '0.7rem', color: hoyDia ? '#c4b0ff' : '#6b5fa0' }}>{dia}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Panel día seleccionado */}
      {diaSeleccionado && (
        <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: 18 }}>
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
              <CollageMini prendas={outfitSeleccionado} />
              <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#333', margin: '10px 0 4px' }}>
                {outfitSeleccionado.nombre}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => setModalElegir(true)}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#f0ebff', color: '#6b4fcf', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Cambiar pinta
                </button>
                <button
                  onClick={quitarPinta}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #f0ebff', background: 'transparent', color: '#aaa', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Quitar pinta
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: 14 }}>Sin pinta asignada</p>
              <button
                onClick={() => setModalElegir(true)}
                style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: '#1a0a3e', color: '#c4b0ff', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Elegir pinta
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal elegir pinta */}
      {modalElegir && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px 20px 80px 20px',
        }}>
          <div style={{
            background: '#13112a', borderRadius: 20,
            padding: '24px 20px', width: '100%', maxWidth: 430,
            maxHeight: '85vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#ede9ff', fontSize: '1.1rem', fontWeight: 400 }}>
                Elegir pinta
              </h2>
              <button onClick={() => setModalElegir(false)} style={{ background: 'none', border: 'none', color: '#6b5fa0', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            {pintas.length === 0 ? (
              <p style={{ color: '#6b5fa0', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                No tienes pintas guardadas todavía
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {pintas.map(pinta => (
                  <div
                    key={pinta.id}
                    onClick={() => asignarPinta(pinta.id)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(150,120,255,0.15)',
                      borderRadius: 12, padding: 10, cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div style={{ background: '#fff', borderRadius: 8, padding: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {[pinta.top, pinta.pantalon].map((p, i) => (
                          <div key={i} style={{ background: '#f5f5f7', borderRadius: 6, height: i === 0 ? 40 : 50, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {p?.foto_url ? <img src={p.foto_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '0.5rem', color: '#ccc' }}>—</span>}
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {[pinta.bolso, pinta.zapatos, pinta.accesorio].map((p, i) => (
                          <div key={i} style={{ background: '#f5f5f7', borderRadius: 6, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {p?.foto_url ? <img src={p.foto_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '0.5rem', color: '#ccc' }}>—</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#d4cef5', fontFamily: 'Inter, sans-serif' }}>{pinta.nombre}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default Calendario