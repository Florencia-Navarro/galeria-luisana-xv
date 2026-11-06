
import { motion } from 'framer-motion'
import { Camera, Sparkles } from 'lucide-react'

function Hero() {
  const irAGaleria = () => {
    document.getElementById('subir-fotos')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  return (
    <section className="relative min-h-[75vh] bg-verde-ingles
      text-marfil flex flex-col items-center justify-center
      text-center px-6 py-16 overflow-hidden">

      {/* Detalle decorativo */}
      <div className="absolute top-8 left-8 opacity-40">
        <Sparkles size={28} />
      </div>

      <div className="absolute bottom-8 right-8 opacity-40">
        <Sparkles size={28} />
      </div>

      {/* Contenido */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="max-w-xl"
      >
        <p className="uppercase tracking-[0.35em] text-sm
          text-beige mb-5">
          Una noche para recordar
        </p>

        <h1 className="font-serif text-5xl sm:text-6xl
          leading-tight mb-4">
          Los XV de
          <span className="block italic text-beige">
            Luisana
          </span>
        </h1>

        <div className="w-16 h-px bg-beige mx-auto my-6" />

        <p className="text-lg font-light mb-2">
          7 de noviembre de 2026
        </p>

        <p className="text-sm tracking-widest text-beige mb-10">
          20:30 HS
        </p>

        <p className="text-base leading-relaxed mb-8">
          Cada momento merece ser recordado.
          Compartí tus fotos y sé parte de esta colección
          de recuerdos especiales.
        </p>

        <button
          onClick={irAGaleria}
          className="inline-flex items-center gap-3
            bg-marfil text-verde-ingles
            px-7 py-3 rounded-full
            hover:bg-beige transition-colors
            duration-300"
        >
          <Camera size={19} />
          Compartí tus recuerdos
        </button>
      </motion.div>
    </section>
  )
}

export default Hero
