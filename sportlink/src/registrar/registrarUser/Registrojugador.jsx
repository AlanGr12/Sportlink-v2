import { useState } from 'react'
import { supabase } from '../../utils/supabase.js'

function RegistroJugador({ onRegistro }) {

  const [form, setForm] = useState({
    email: '',
    contraseña: '',
    nombre: '',
    apellido: '',
    iddeporte: '',
    telefono: '',
    fechanacimiento: '',
    ubicacion: '',
    genero: '',
    fotoperfil: null
  })

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  function handleFileChange(e) {
    setForm({
      ...form,
      fotoperfil: e.target.files[0]
    })
  }

  async function handleRegistro() {

    if (
      !form.email ||
      !form.contraseña ||
      !form.nombre ||
      !form.apellido ||
      !form.iddeporte
    ) {
      alert('Completa los campos obligatorios')
      return
    }

    // INSERT USUARIO
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .insert({
        email: form.email,
        contraseña: form.contraseña,
        tipousuario: 'jugador'
      })
      .select()
      .single()

    if (errorUsuario) {
      console.log(errorUsuario)
      alert('Error usuario: ' + errorUsuario.message)
      return
    }

    // SUBIR FOTO
    let fotoUrl = null

    if (form.fotoperfil) {

      // SACAR EXTENSION
      const extension = form.fotoperfil.name.split('.').pop()

      // NOMBRE SIMPLE SIN ESPACIOS
      const nombreArchivo = `${Date.now()}.${extension}`

      // SUBIR A STORAGE
      const { error: errorUpload } = await supabase.storage
        .from('fotoperfiles')
        .upload(nombreArchivo, form.fotoperfil, {
          cacheControl: '3600',
          upsert: false
        })

      if (errorUpload) {
        console.log(errorUpload)
        alert('Error al subir foto: ' + errorUpload.message)
        return
      }

      // OBTENER URL PUBLICA
      const { data } = supabase.storage
        .from('fotoperfiles')
        .getPublicUrl(nombreArchivo)

      fotoUrl = data.publicUrl
    }

    // INSERT JUGADOR
    const { error: errorJugador } = await supabase
      .from('jugadores')
      .insert({
        idusuario: usuario.idusuario,
        nombre: form.nombre,
        apellido: form.apellido,
        iddeporte: parseInt(form.iddeporte),
        telefono: form.telefono,
        fechanacimiento: form.fechanacimiento || null,
        ubicacion: form.ubicacion,
        genero: form.genero,
        fotoperfil: fotoUrl
      })

    if (errorJugador) {
      console.log(errorJugador)
      alert('Error jugador: ' + errorJugador.message)
      return
    }

    alert('Registro exitoso')

    onRegistro(usuario)
  }

  return (
    <div>

      <h2>Registro Jugador</h2>

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <input
        name="contraseña"
        type="password"
        placeholder="Contraseña"
        value={form.contraseña}
        onChange={handleChange}
      />

      <input
        name="nombre"
        type="text"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
      />

      <input
        name="apellido"
        type="text"
        placeholder="Apellido"
        value={form.apellido}
        onChange={handleChange}
      />

      <input
        name="iddeporte"
        type="number"
        placeholder="ID deporte"
        value={form.iddeporte}
        onChange={handleChange}
      />

      <input
        name="telefono"
        type="text"
        placeholder="Telefono"
        value={form.telefono}
        onChange={handleChange}
      />

      <input
        name="fechanacimiento"
        type="date"
        value={form.fechanacimiento}
        onChange={handleChange}
      />

      <input
        name="ubicacion"
        type="text"
        placeholder="Ubicacion"
        value={form.ubicacion}
        onChange={handleChange}
      />

      <input
        name="genero"
        type="text"
        placeholder="Genero"
        value={form.genero}
        onChange={handleChange}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />

      <button onClick={handleRegistro}>
        Registrarse
      </button>

    </div>
  )
}

export default RegistroJugador