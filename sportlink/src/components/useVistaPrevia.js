import { useEffect, useState } from 'react'

// Devuelve una URL (data:) para mostrar un File elegido. No usa createObjectURL:
// su revocación en el cleanup de un efecto rompe la imagen con React StrictMode.
export default function useVistaPrevia(archivo) {
  const [lectura, setLectura] = useState({ archivo: null, url: null })
  useEffect(() => {
    if (!archivo) return undefined
    let activo = true
    const lector = new FileReader()
    lector.onload = () => { if (activo) setLectura({ archivo, url: lector.result }) }
    lector.readAsDataURL(archivo)
    return () => { activo = false }
  }, [archivo])
  return archivo && lectura.archivo === archivo ? lectura.url : null
}
