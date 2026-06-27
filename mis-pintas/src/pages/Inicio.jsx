import { useNavigate } from 'react-router-dom'
import './Inicio.css'

const semana = [
  { dia: 'Lun', outfit: '👗' },
  { dia: 'Mar', outfit: '👕' },
  { dia: 'Mié', outfit: '🧥' },
  { dia: 'Jue', outfit: null },
  { dia: 'Vie', outfit: null },
  { dia: 'Sáb', outfit: null },
  { dia: 'Dom', outfit: null },
]

const hoy = new Date()
const fechaHoy = hoy.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
const diaHoyIndex = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1

const Inicio = () => {
  const navigate = useNavigate()

  return (
    <div className="inicio-page">

      <div className="inicio-topbar">
        <div>
          <p className="inicio-greeting-sub">✦ buenos días</p>
          <h1 className="inicio-greeting-name">Mariana</h1>
        </div>
        <div className="inicio-avatar">M</div>
      </div>

      <div className="inicio-today-card">
        <div className="today-card-header">
          <span className="today-label">✦ pinta de hoy</span>
          <span className="today-date">{fechaHoy}</span>
        </div>
        <div className="today-outfit">
          <div className="outfit-slot">
            <div className="outfit-img sm">👜</div>
            <span className="outfit-label">bolso</span>
          </div>
          <div className="outfit-slot">
            <div className="outfit-img tall">👚</div>
            <span className="outfit-label">camisa</span>
          </div>
          <div className="outfit-slot">
            <div className="outfit-img tall">👖</div>
            <span className="outfit-label">pantalón</span>
          </div>
          <div className="outfit-slot">
            <div className="outfit-img md">👟</div>
            <span className="outfit-label">zapatos</span>
          </div>
          <div className="outfit-slot">
            <div className="outfit-img sm">💍</div>
            <span className="outfit-label">accesorio</span>
          </div>
        </div>
        <div className="today-actions">
          <button className="btn-usar">Usar esta pinta</button>
          <button className="btn-cambiar" onClick={() => navigate('/armario')}>Cambiar</button>
        </div>
      </div>

      <p className="section-label">✦ esta semana</p>
      <div className="semana-row">
        {semana.map((item, i) => (
          <div key={i} className="dia-chip">
            <span className="dia-name">{item.dia}</span>
            <div className={`dia-dot ${i === diaHoyIndex ? 'today' : ''} ${!item.outfit ? 'vacio' : ''}`}>
              {item.outfit ?? '+'}
            </div>
          </div>
        ))}
      </div>

      <p className="section-label">✦ explorar</p>
      <div className="quick-grid">
        <div className="quick-card" onClick={() => navigate('/armario')}>
          <span className="quick-icon">🌀</span>
          <p className="quick-title">Armario</p>
          <p className="quick-sub">Combina prendas</p>
        </div>
        <div className="quick-card" onClick={() => navigate('/pintas')}>
          <span className="quick-icon">🗂</span>
          <p className="quick-title">Mis pintas</p>
          <p className="quick-sub">Outfits guardados</p>
        </div>
        <div className="quick-card" onClick={() => navigate('/calendario')}>
          <span className="quick-icon">🗓</span>
          <p className="quick-title">Calendario</p>
          <p className="quick-sub">Planea tu mes</p>
        </div>
        <div className="quick-card" onClick={() => navigate('/ia')}>
          <span className="quick-icon">📌</span>
          <p className="quick-title">Inspo</p>
          <p className="quick-sub">Tus referencias</p>
        </div>
      </div>

      <div className="ia-banner" onClick={() => navigate('/ia')}>
        <div className="ia-icon-wrap">✨</div>
        <div className="ia-text">
          <p className="ia-title">Crear pinta con IA</p>
          <p className="ia-sub">Sube una inspo y te armo el outfit con tu ropa</p>
        </div>
        <span className="ia-arrow">›</span>
      </div>

    </div>
  )
}

export default Inicio
