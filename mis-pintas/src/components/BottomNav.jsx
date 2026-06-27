import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const navItems = [
  { to: '/',            icon: '🏠', label: 'Inicio' },
  { to: '/armario',    icon: '🌀', label: 'Armario' },
  { to: '/pintas',     icon: '🗂',  label: 'Pintas' },
  { to: '/calendario', icon: '🗓',  label: 'Calendario' },
  { to: '/ia',         icon: '✨', label: 'IA' },
]

const BottomNav = () => {
  return (
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
          {<span className="nav-dot" />}
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
