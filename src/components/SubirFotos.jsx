
import { useState } from 'react'
import { Camera, ImagePlus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

function SubirFotos() {
  const [nombre, setNombre] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const seleccionarArchivo = (e) => {
    const imagen = e.target.files[0]

    setMensaje('')
    setError('')

    if (!imagen) return

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!tiposPermitidos.includes(imagen.type)) {
      setError('Seleccioná una imagen JPG, PNG o WEBP.')
      setArchivo(null)
      return
    }

    if (imagen.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5 MB.')
      setArchivo(null)
      return
    }

    setArchivo(imagen)
  }

  const enviarFoto = async (e) => {
    e.preventDefault()

    if (!nombre.trim() || !archivo) return

    setSubiendo(true)
    setMensaje('')
    setError('')

    try {
      const extension = archivo.name.split('.').pop().toLowerCase()
      const ruta = `${crypto.randomUUID()}.${extension}`

      // 1. Subir imagen a Storage
      const { error: errorStorage } = await supabase
        .storage
        .from('fotos-xv-luisana')
        .upload(ruta, archivo)

      if (errorStorage) throw errorStorage

      // 2. Obtener URL pública
      const { data } = supabase
        .storage
        .from('fotos-xv-luisana')
        .getPublicUrl(ruta)

      const urlPublica = data.publicUrl

      // 3. Guardar información en la tabla
      const { error: errorBaseDatos } = await supabase
        .from('fotos')
        .insert({
          nombre: nombre.trim(),
          url: urlPublica,
          storage_path: ruta,
        })

      if (errorBaseDatos) throw errorBaseDatos

      setMensaje('¡Tu fotografía se compartió correctamente!')
      setNombre('')
      setArchivo(null)

      e.target.reset()

    } catch (error) {
      console.error('Error al subir fotografía:', error)
      setError('No pudimos subir tu fotografía. Intentá nuevamente.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <section
      id="subir-fotos"
      className="px-5 py-16 bg-marfil"
    >
      <div className="max-w-md mx-auto text-center">

        <p className="text-salvia uppercase tracking-[0.25em] text-xs mb-3">
          Tus recuerdos también cuentan
        </p>

        <h2 className="text-3xl font-serif text-verde-ingles mb-4">
          Compartí tus fotos
        </h2>

        <p className="text-marron/80 mb-8">
          Subí esos momentos especiales que viviste
          junto a Luisana.
        </p>

        <form onSubmit={enviarFoto} className="space-y-5">

          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full rounded-xl border border-beige
              bg-white px-4 py-3 outline-none
              focus:border-verde-ingles"
          />

          <label className="flex flex-col items-center justify-center
            gap-3 border-2 border-dashed border-salvia
            rounded-2xl p-8 cursor-pointer
            hover:bg-white/50 transition-colors">

            <ImagePlus size={35} className="text-verde-ingles" />

            <span className="text-verde-ingles font-medium">
              {archivo ? archivo.name : 'Seleccioná una fotografía'}
            </span>

            <span className="text-xs text-marron/70">
              JPG, PNG o WEBP · Máximo 5 MB
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={seleccionarArchivo}
              className="hidden"
              required
            />
          </label>

          <button
            type="submit"
            disabled={subiendo || !archivo}
            className="w-full flex items-center justify-center gap-2
              bg-verde-ingles text-marfil
              rounded-full py-3 px-6
              hover:bg-oliva transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera size={19} />
            {subiendo ? 'Subiendo fotografía...' : 'Compartir fotografía'}
          </button>

          {mensaje && (
            <p className="text-verde-ingles text-sm">
              {mensaje}
            </p>
          )}

          {error && (
            <p className="text-red-700 text-sm">
              {error}
            </p>
          )}

        </form>
      </div>
    </section>
  )
}

export default SubirFotos
