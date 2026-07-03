import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { colors, fonts } from '../styles/global'

const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function fechaKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function CollageMini({ prendas }) {
  const Slot = ({ prenda, height }) => (
    <div style={{ background: '#f0f2f8', borderRadius: 8, height, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
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
        <Slot prenda={prendas?.zapatos} height={42} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Slot prenda={prendas?.chaqueta} height={50} />
        <Slot prenda={prendas?.bolso} height={42} />
        <Slot prenda={prendas?.accesorio} height={42} />
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

  useEffect(() => { cargarDatos() }, [mes, anio])

  async function cargarDatos() {
    setCargando(true)
    const primerDia = fechaKey(anio, mes, 1)
    const ultimoDia = fechaKey(anio, mes, new Date(anio, mes + 1, 0).getDate())

    const { data: calData } = await supabase
      .from('calendario')
      .select(`*, outfit:outfit_id(*, top:top_id(*), chaqueta:chaqueta_id(*), pantalon:pantalon_id(*), bolso:bolso_id(*), zapatos:zapatos_id(*), accesorio:accesorio_id(*))`)
      .gte('fecha', primerDia).lte('fecha', ultimoDia)

    const { data: pintasData } = await supabase
      .from('outfits')
      .select(`*, top:top_id(*), chaqueta:chaqueta_id(*), pantalon:pantalon_id(*), bolso:bolso_id(*), zapatos:zapatos_id(*), accesorio:accesorio_id(*)`)
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

  const mesAnterior = () => { if (mes === 0) { setMes(11); setAnio(a => a - 1) } else setMes(m => m - 1); setDiaSeleccionado(1) }
  const mesSiguiente = () => { if (mes === 11) { setMes(0); setAnio(a => a + 1) } else setMes(m => m + 1); setDiaSeleccionado(1) }

  const esHoy = (d) => d === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
  const keySeleccionado = diaSeleccionado ? fechaKey(anio, mes, diaSeleccionado) : null
  const entradaSeleccionada = keySeleccionado ? outfitsCalendario[keySeleccionado] : null
  const outfitSeleccionado = entradaSeleccionada?.outfit

  const labelStyle = { fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: colors.textMuted, fontFamily: fonts.body, marginBottom: 4 }
  const btnStyle = { background: 'rgba(255,255,255,0.06)', border: `1px solid ${colors.border}`, color: colors.accent, width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: '0.9rem', fontFamily: fonts.body }

  return (
    <div style={{ padding: '52px 20px 100px', minHeight: '100vh' }}>

      <div style={{ marginBottom: 20 }}>
        <p style={labelStyle}>✦ tus pintas del mes</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: fonts.title, fontSize: '1.75rem', color: colors.textSoft, fontWeight: 600 }}>Calendario</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={mesAnterior} style={btnStyle}>‹</button>
            <span style={{ fontSize: '0.82rem', color: colors.accentLight, whiteSpace: 'nowrap', fontFamily: fonts.body }}>{MESES[mes].slice(0,3)} {anio}</span>
            <button onClick={mesSiguiente} style={btnStyle}>›</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: colors.textMuted, letterSpacing: '0.08em', padding: '4px 0', fontFamily: fonts.body }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 24 }}>
        {celdas.map((dia, i) => {
          if (!dia) return <div key={`e-${i}`} />
          const key = fechaKey(anio, mes, dia)
          const entrada = outfitsCalendario[key]
          const fotoTop = entrada?.outfit?.top?.foto_url
          const seleccionado = dia === diaSeleccionado
          const hoyDia = esHoy(dia)

          return (
            <div key={dia} onClick={() => setDiaSeleccionado(dia)} style={{ aspectRatio: '1', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: seleccionado ? 'rgba(80,128,255,0.2)' : 'transparent', border: hoyDia ? `1.5px solid ${colors.accent}` : seleccionado ? `1.5px solid rgba(80,128,255,0.4)` : '1.5px solid transparent', transition: 'all 0.15s', gap: 1 }}>
              {fotoTop ? (
                <>
                  <img src={fotoTop} alt="" style={{ width: '70%', height: '60%', objectFit: 'contain' }} />
                  <span style={{ fontSize: '0.5rem', color: colors.textMuted, fontFamily: fonts.body }}>{dia}</span>
                </>
              ) : (
                <span style={{ fontSize: '0.72rem', color: hoyDia ? colors.accentLight : colors.textDim, fontFamily: fonts.body }}>{dia}</span>
              )}
            </div>
          )
        })}
      </div>

      {diaSeleccionado && (
        <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: fonts.body }}>
              {diaSeleccionado} de {MESES[mes].toUpperCase()} {anio}
            </p>
            {esHoy(diaSeleccionado) && (
              <span style={{ fontSize: '0.65rem', background: '#eef2ff', color: '#3a5abf', padding: '3px 8px', borderRadius: 10, fontFamily: fonts.body }}>Hoy</span>
            )}
          </div>

          {outfitSeleccionado ? (
            <>
              <CollageMini prendas={outfitSeleccionado} />
              <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#333', margin: '10px 0 4px', fontFamily: fonts.body }}>{outfitSeleccionado.nombre}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setModalElegir(true)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#eef2ff', color: '#3a5abf', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: fonts.body }}>Cambiar pinta</button>
                <button onClick={quitarPinta} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #eef2ff', background: 'transparent', color: '#aaa', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: fonts.body }}>Quitar pinta</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: 14, fontFamily: fonts.body }}>Sin pinta asignada</p>
              <button onClick={() => setModalElegir(true)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: '#0a1540', color: colors.accentLight, fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', fontFamily: fonts.body }}>Elegir pinta</button>
            </div>
          )}
        </div>
      )}

      {modalElegir && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 80px 20px' }}>
          <div style={{ background: '#0d1530', borderRadius: 20, padding: '24px 20px', width: '100%', maxWidth: 430, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: fonts.title, color: colors.textSoft, fontSize: '1.1rem', fontWeight: 600 }}>Elegir pinta</h2>
              <button onClick={() => setModalElegir(false)} style={{ background: 'none', border: 'none', color: colors.textDim, fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>
            {pintas.length === 0 ? (
              <p style={{ color: colors.textMuted, fontSize: '0.85rem', textAlign: 'center', padding: '20px 0', fontFamily: fonts.body }}>No tienes pintas guardadas todavía</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {pintas.map(pinta => (
                  <div key={pinta.id} onClick={() => asignarPinta(pinta.id)} style={{ background: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 10, cursor: 'pointer' }}>
                    <div style={{ background: '#fff', borderRadius: 8, padding: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {[pinta.top, pinta.pantalon].map((p, i) => (
                          <div key={i} style={{ background: '#f0f2f8', borderRadius: 6, height: i === 0 ? 40 : 50, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {p?.foto_url ? <img src={p.foto_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '0.5rem', color: '#ccc' }}>—</span>}
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {[pinta.bolso, pinta.zapatos, pinta.accesorio].map((p, i) => (
                          <div key={i} style={{ background: '#f0f2f8', borderRadius: 6, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {p?.foto_url ? <img src={p.foto_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '0.5rem', color: '#ccc' }}>—</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: colors.textSoft, fontFamily: fonts.body }}>{pinta.nombre}</p>
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