
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ModalImagen from './ModalImagen'

function Galeria() {
  const [fotos, setFotos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null)

  useEffect(() => {
  const obtenerFotos = async () => {
    const { data, error } = await supabase
      .from('fotos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setError('No pudimos cargar las fotografías.')
    } else {
      setFotos(data)
    }

    setCargando(false)
  }

  obtenerFotos()

  const canal = supabase
    .channel('cambios-galeria')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'fotos',
      },
      (payload) => {
        setFotos((actuales) => [
          payload.new,
          ...actuales,
        ])
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(canal)
  }
}, [])

  return (
    <section className="px-5 py-16 bg-white/40">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-10">
          <p className="text-salvia uppercase tracking-[0.25em] text-xs mb-3">
            Momentos compartidos
          </p>

          <h2 className="text-3xl font-serif text-verde-ingles">
            Nuestra galería
          </h2>

          <p className="text-marron/80 mt-3">
            Cada fotografía guarda un recuerdo especial.
          </p>
        </div>

        {cargando && (
          <p className="text-center text-verde-ingles">
            Cargando fotografías...
          </p>
        )}

        {error && (
          <p className="text-center text-red-700">
            {error}
          </p>
        )}

        {!cargando && !error && fotos.length === 0 && (
          <p className="text-center text-marron/70">
            Todavía no hay fotografías. ¡Sé el primero en compartir una!
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {fotos.map((foto) => (
            <article
              key={foto.id}
              onClick={() => setFotoSeleccionada(foto)}
              className="overflow-hidden rounded-xl bg-marfil shadow-sm"
            >
              <img
                src={foto.url}
                alt={`Fotografía compartida por ${foto.nombre}`}
                loading="lazy"
                className="w-full aspect-square object-cover"
              />

              <p className="text-sm text-verde-ingles px-3 py-2">
                {foto.nombre}
              </p>
            </article>
          ))}
        </div>

      </div>

        <ModalImagen
            foto={fotoSeleccionada}
            cerrar={() => setFotoSeleccionada(null)}
        />  

    </section>
  )
}

export default Galeria
