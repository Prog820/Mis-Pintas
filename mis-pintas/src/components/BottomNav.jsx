import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './BottomNav.css'

const navItems = [
  { to: '/',            icon: '🏠', label: 'Inicio' },
  { to: '/armario',    icon: '🌀', label: 'Armario' },
  { to: '/pintas',     icon: '🗂',  label: 'Pintas' },
  { to: '/calendario', icon: '🗓',  label: 'Calendario' },
  { to: '/ia',         icon: '✨', label: 'IA' },
]

const BottomNav = ({ sesion }) => {
  const navigate = useNavigate()

  async function cerrarSesion() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile / Tablet bottom nav */}
      <nav className="bottom-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            <span className="nav-dot" />
          </NavLink>
        ))}
      </nav>

      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <p className="sidebar-logo-sub">✦ mis pintas</p>
          <h1 className="sidebar-logo-title">Mis Pintas</h1>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {sesion?.user?.user_metadata?.nombre?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="sidebar-name">{sesion?.user?.user_metadata?.nombre}</p>
              <p className="sidebar-email">{sesion?.user?.email}</p>
            </div>
          </div>
          <button onClick={cerrarSesion} className="sidebar-signout">Cerrar sesión</button>
        </div>
      </aside>
    </>
  )
}

export default BottomNav