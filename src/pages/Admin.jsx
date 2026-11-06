
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Trash2, LogOut, ImageIcon, Download } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

function Admin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)
  const [fotos, setFotos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(null)
  const [error, setError] = useState('')
  const [descargando, setDescargando] = useState(false)
  const [esAdministrador, setEsAdministrador] = useState(false)
  const [verificandoAdmin, setVerificandoAdmin] = useState(true)

  // Comprobar si hay una sesión iniciada
  useEffect(() => {
    const obtenerSesion = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setCargando(false)
    }

    obtenerSesion()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nuevaSesion) => {
        setSession(nuevaSesion)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
        if (!session) {
            setEsAdministrador(false)
            setVerificandoAdmin(false)
            return
        }

        let activo = true

        const verificarAdmin = async () => {
            setVerificandoAdmin(true)

            const { data, error } = await supabase.rpc('es_admin')

            if (!activo) return

            if (error) {
            console.error('Error al verificar administrador:', error)
            setEsAdministrador(false)
            } else {
            setEsAdministrador(data === true)
            }

            setVerificandoAdmin(false)
        }

        verificarAdmin()

        return () => {
            activo = false
        }
}, [session])


  // Obtener fotografías cuando el administrador inicia sesión
  useEffect(() => {
    if (!session) {
      setFotos([])
      return
    }

    const obtenerFotos = async () => {
      setError('')

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
    }

    obtenerFotos()
  }, [session])

  // Iniciar sesión
  const iniciarSesion = async (e) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('El correo o la contraseña son incorrectos.')
    }
  }

  // Cerrar sesión
  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    setEmail('')
    setPassword('')
  }

  // Eliminar fotografía
  const eliminarFoto = async (foto) => {
    const confirmar = window.confirm(
      '¿Estás segura de que querés eliminar esta fotografía?'
    )

    if (!confirmar) return

    setEliminando(foto.id)
    setError('')

    try {
      // Primero eliminamos el archivo de Storage
      const { error: errorStorage } = await supabase
        .storage
        .from('fotos-xv-luisana')
        .remove([foto.storage_path])

      if (errorStorage) throw errorStorage

      // Después eliminamos su registro de la tabla
      const { error: errorTabla } = await supabase
        .from('fotos')
        .delete()
        .eq('id', foto.id)

      if (errorTabla) {
        throw new Error(
          'El archivo se eliminó, pero no pudimos eliminar su registro. ' +
          errorTabla.message
        )
      }

      setFotos((actuales) =>
        actuales.filter((item) => item.id !== foto.id)
      )

    } catch (error) {
      console.error('Error al eliminar:', error)
      setError(error.message || 'No pudimos eliminar la fotografía.')
    } finally {
      setEliminando(null)
    }
  }

  if (cargando) {
    return (
      <main className="min-h-screen bg-marfil flex items-center justify-center">
        <p className="text-verde-ingles">Cargando...</p>
      </main>
    )
  }

  const descargarTodas = async () => {
  if (fotos.length === 0) return

  setDescargando(true)
  setError('')

  try {
    const zip = new JSZip()

    for (let i = 0; i < fotos.length; i++) {
      const foto = fotos[i]

      const respuesta = await fetch(foto.url)

      if (!respuesta.ok) {
        throw new Error(`No se pudo descargar la foto ${i + 1}`)
      }

      const blob = await respuesta.blob()

      const extension = foto.storage_path.split('.').pop()

      zip.file(
        `foto-${i + 1}-${foto.nombre}.${extension}`,
        blob
      )
    }

    const archivoZip = await zip.generateAsync({
      type: 'blob',
    })

    saveAs(archivoZip, 'fotos-xv-luisana.zip')

  } catch (error) {
    console.error('Error al crear ZIP:', error)
    setError('No pudimos descargar todas las fotografías.')
  } finally {
    setDescargando(false)
  }
}

  return (
    <main className="min-h-screen bg-marfil text-verde-ingles px-5 py-10">

      {!session ? (
        <div className="max-w-md mx-auto bg-white/70 rounded-2xl
          border border-beige p-8 shadow-sm">

          <div className="text-center mb-8">
            <p className="text-salvia uppercase tracking-[0.25em] text-xs mb-3">
              Los XV de Luisana
            </p>

            <h1 className="text-3xl font-serif">
              Administración
            </h1>

            <p className="text-marron/70 mt-3 text-sm">
              Ingresá con tu cuenta de administrador.
            </p>
          </div>

          <form onSubmit={iniciarSesion} className="space-y-5">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-beige
                bg-white px-4 py-3 outline-none
                focus:border-verde-ingles"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-beige
                bg-white px-4 py-3 outline-none
                focus:border-verde-ingles"
            />

            {error && (
              <p className="text-red-700 text-sm text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-verde-ingles text-marfil
                rounded-full py-3 hover:bg-oliva transition-colors"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      ) : verificandoAdmin ? (
        <div className="text-center py-20">
          <p>Verificando permisos...</p>
        </div>
      ) : !esAdministrador ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-serif">
            Acceso restringido
          </h1>

          <p className="text-center">
            Esta cuenta no tiene permisos de administrador.
          </p>

          <button
            onClick={cerrarSesion}
            className="rounded-full bg-verde-ingles text-marfil px-6 py-3"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">

          <header className="flex flex-wrap justify-between
            items-center gap-4 mb-10">

            <div>
              <p className="text-salvia uppercase tracking-[0.2em] text-xs mb-2">
                Los XV de Luisana
              </p>

              <h1 className="text-3xl font-serif">
                Panel de administración
              </h1>

              <p className="text-marron/70 text-sm mt-2">
                Sesión iniciada como {session.user.email}
              </p>
            </div>

            <button
              onClick={cerrarSesion}
              className="flex items-center gap-2 border border-verde-ingles
                rounded-full px-5 py-2 hover:bg-verde-ingles
                hover:text-marfil transition-colors"
            >
              <LogOut size={17} />
              Cerrar sesión
            </button>
          </header>

          <div className="mb-6">
            <h2 className="text-2xl font-serif">
              Fotografías compartidas
            </h2>

            <button
                onClick={descargarTodas}
                disabled={descargando || fotos.length === 0}
                className="flex items-center justify-center gap-2
                    bg-verde-ingles text-marfil rounded-full
                    px-6 py-3 mt-5 hover:bg-oliva transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <Download size={18} />

                {descargando
                    ? 'Preparando descarga...'
                    : 'Descargar todas las fotos'}
            </button>

            <p className="text-marron/70 text-sm mt-1">
              {fotos.length} fotografías en total
            </p>
          </div>

          {error && (
            <p className="text-red-700 text-sm mb-5">
              {error}
            </p>
          )}

          {fotos.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon
                size={40}
                className="mx-auto text-salvia mb-4"
              />

              <p className="text-marron/70">
                Todavía no hay fotografías.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3
              lg:grid-cols-4 gap-4">

              {fotos.map((foto) => (
                <article
                  key={foto.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                >
                  <img
                    src={foto.url}
                    alt={`Foto compartida por ${foto.nombre}`}
                    className="w-full aspect-square object-cover"
                  />

                  <div className="p-3">
                    <p className="text-sm font-medium truncate">
                      {foto.nombre}
                    </p>

                    <button
                      onClick={() => eliminarFoto(foto)}
                      disabled={eliminando === foto.id}
                      className="mt-3 w-full flex items-center
                        justify-center gap-2 rounded-full
                        bg-red-50 text-red-700 py-2 text-sm
                        hover:bg-red-100 transition-colors
                        disabled:opacity-50"
                    >
                      <Trash2 size={16} />

                      {eliminando === foto.id
                        ? 'Eliminando...'
                        : 'Eliminar foto'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      
    </main>
  )
}

export default Admin
