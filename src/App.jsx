import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CarruselLuisana from './components/CarruselLuisana'
import Hero from './components/Hero'
import SubirFotos from './components/SubirFotos'
import Galeria from './components/Galeria'
import Admin from './pages/Admin'

function Inicio() {
  return (
    <main className="min-h-screen bg-marfil text-verde-ingles">

      <Hero />
      <CarruselLuisana />
      <SubirFotos />
      <Galeria />

    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App