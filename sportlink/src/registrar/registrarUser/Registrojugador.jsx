import { useState, useEffect } from 'react'
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

    let fotoUrl = null

    if (form.fotoperfil) {
      const extension = form.fotoperfil.name.split('.').pop()
      const nombreArchivo = `${Date.now()}.${extension}`

      const { error: errorUpload } = await supabase.storage
        .from('fotoPerfiles')
        .upload(nombreArchivo, form.fotoperfil, {
          cacheControl: '3600',
          upsert: false
        })

      if (errorUpload) {
        console.log(errorUpload)
        alert('Error al subir foto: ' + errorUpload.message)
        return
      }

      const { data } = supabase.storage
        .from('fotoPerfiles')
        .getPublicUrl(nombreArchivo)

      fotoUrl = data.publicUrl
    }

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
      <h1>Registro Jugador</h1>

      <h3>Email:</h3>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <h3>Contraseña:</h3>
      <input name="contraseña" type="password" placeholder="Contraseña" value={form.contraseña} onChange={handleChange} />
      <h3>Nombre:</h3>
      <input name="nombre" type="text" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
      <h3>Apellido:</h3>
      <input name="apellido" type="text" placeholder="Apellido" value={form.apellido} onChange={handleChange} />

      <h3>Deporte:</h3>
<select name="iddeporte" value={form.iddeporte} onChange={handleChange}>
  <option value="">Seleccioná un deporte</option>
  <option value="1">Fútbol</option>
  <option value="2">Basket</option>
  <option value="3">Tenis</option>
  <option value="4">Voley</option>
  <option value="5">Pádel</option>
  <option value="6">Rugby</option>
  <option value="7">Hockey</option>
  <option value="8">Natación</option>
  <option value="9">Atletismo</option>
  <option value="10">Ciclismo</option>
  <option value="11">Boxeo</option>
  <option value="12">Artes Marciales</option>
  <option value="13">Handball</option>
  <option value="14">Béisbol</option>
  <option value="15">Golf</option>
</select>

      <h3>Numero de telefono:</h3>
      <input name="telefono" type="text" placeholder="Telefono" value={form.telefono} onChange={handleChange} />
      <h3>Fecha de nacimiento:</h3>
      <input name="fechanacimiento" type="date" value={form.fechanacimiento} onChange={handleChange} />
      <h3>Ubicacion:</h3>
      <input name="ubicacion" type="text" placeholder="Ubicacion" value={form.ubicacion} onChange={handleChange} />

      <h3>Genero:</h3>
      <select name="genero" value={form.genero} onChange={handleChange}>
        <option value="">Seleccione un genero</option>
        <option value="Masculino">Masculino</option>
        <option value="Femenino">Femenino</option>
      </select>
      
      <h3>Foto de perfil</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      <button onClick={handleRegistro}>Registrarse</button>
    </div>
  )
}

export default RegistroJugador