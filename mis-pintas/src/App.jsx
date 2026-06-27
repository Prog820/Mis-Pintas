import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StarsBackground from './components/StarsBackground'
import BottomNav from './components/BottomNav'
import Inicio from './pages/Inicio'
import Armario from './pages/Armario'
import MisPintas from './pages/MisPintas'
import Calendario from './pages/Calendario'
import AsistenteIA from './pages/AsistenteIA'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <StarsBackground />
        <main className="main-content">
          <Routes>
            <Route path="/"           element={<Inicio />} />
            <Route path="/armario"    element={<Armario />} />
            <Route path="/pintas"     element={<MisPintas />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/ia"         element={<AsistenteIA />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App
