
import { X, Download } from 'lucide-react'

function ModalImagen({ foto, cerrar }) {
  if (!foto) return null

  const descargarFoto = async () => {
    try {
      const respuesta = await fetch(foto.url)
      const blob = await respuesta.blob()

      const url = URL.createObjectURL(blob)
      const enlace = document.createElement('a')

      enlace.href = url
      enlace.download = `foto-luisana-${foto.id}.jpg`

      document.body.appendChild(enlace)
      enlace.click()
      enlace.remove()

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al descargar:', error)
      window.open(foto.url, '_blank')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90
        flex items-center justify-center p-4"
      onClick={cerrar}
    >
      <button
        onClick={cerrar}
        aria-label="Cerrar imagen"
        className="absolute top-5 right-5 text-white"
      >
        <X size={30} />
      </button>

      <div
        className="max-w-3xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={foto.url}
          alt={`Foto compartida por ${foto.nombre}`}
          className="w-full max-h-[75vh] object-contain rounded-lg"
        />

        <div className="flex items-center justify-between mt-4 text-white">
          <p className="text-sm">
            Compartida por {foto.nombre}
          </p>

          <button
            onClick={descargarFoto}
            className="flex items-center gap-2
              bg-marfil text-verde-ingles
              px-4 py-2 rounded-full text-sm"
          >
            <Download size={17} />
            Descargar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalImagen
