
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fotosLuisana } from '../data/fotosLuisana'

function CarruselLuisana() {
  const [fotoActual, setFotoActual] = useState(0)

  const siguienteFoto = () => {
    setFotoActual((actual) =>
      (actual + 1) % fotosLuisana.length
    )
  }

  const anteriorFoto = () => {
    setFotoActual((actual) =>
      (actual - 1 + fotosLuisana.length) % fotosLuisana.length
    )
  }

  if (fotosLuisana.length === 0) return null

  const foto = fotosLuisana[fotoActual]

  return (
    <section className="w-full px-5 py-10">

      {/* Encabezado */}
      <div className="text-center mb-6">
        <p className="text-salvia uppercase tracking-[0.25em] text-xs mb-2">
          Un poquito de su historia
        </p>

        <h2 className="text-verde-ingles text-3xl font-serif">
          Luisana
        </h2>
      </div>

      {/* Carrusel */}
      <div className="relative max-w-md mx-auto">

        <div className="overflow-hidden rounded-2xl border border-beige p-2 bg-white/40">

          <AnimatePresence mode="wait">

            <motion.img
              key={foto.id}
              src={foto.src}
              alt={foto.alt}
              className="w-full aspect-[4/5] object-cover rounded-xl"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />

          </AnimatePresence>

        </div>

        {/* Flecha anterior */}
        <button
          onClick={anteriorFoto}
          aria-label="Fotografía anterior"
          className="absolute left-4 top-1/2 -translate-y-1/2
          bg-verde-ingles/90 text-marfil p-2 rounded-full
          hover:bg-oliva transition-colors"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Flecha siguiente */}
        <button
          onClick={siguienteFoto}
          aria-label="Fotografía siguiente"
          className="absolute right-4 top-1/2 -translate-y-1/2
          bg-verde-ingles/90 text-marfil p-2 rounded-full
          hover:bg-oliva transition-colors"
        >
          <ChevronRight size={22} />
        </button>

      </div>

      {/* Indicadores */}
      <div className="flex justify-center gap-2 mt-5">

        {fotosLuisana.map((foto, index) => (

          <button
            key={foto.id}
            onClick={() => setFotoActual(index)}
            aria-label={`Ver fotografía ${index + 1}`}
            aria-current={fotoActual === index ? 'true' : undefined}
            className={`h-2 rounded-full transition-all duration-300 ${
              fotoActual === index
                ? 'bg-verde-ingles w-7'
                : 'bg-salvia/50 w-2'
            }`}
          />

        ))}

      </div>

    </section>
  )
}

export default CarruselLuisana
