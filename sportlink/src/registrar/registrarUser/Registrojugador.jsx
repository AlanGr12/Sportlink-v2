import { useState } from 'react'
import axios from 'axios'

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
    genero: ''
  })

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
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

    try {

      const response = await axios.post(
        'http://localhost:3000/api/jugadores/registro',
        {
          email: form.email,
          contraseña: form.contraseña,
          nombre: form.nombre,
          apellido: form.apellido,
          iddeporte: parseInt(form.iddeporte),
          telefono: form.telefono,
          fechanacimiento: form.fechanacimiento || null,
          ubicacion: form.ubicacion,
          genero: form.genero,
          fotoperfil: null
        }
      )

      alert('Registro exitoso')

      if (onRegistro) {
        onRegistro(response.data)
      }

    } catch (error) {

      console.error(error)

      alert(
        'Error al registrar usuario'
      )
    }
  }

  return (
    <div>
      <h1>Registro Jugador</h1>

      <h3>Email:</h3>
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
      />

      <h3>Contraseña:</h3>
      <input
        name="contraseña"
        type="password"
        placeholder="Contraseña"
        value={form.contraseña}
        onChange={handleChange}
      />

      <h3>Nombre:</h3>
      <input
        name="nombre"
        type="text"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
      />

      <h3>Apellido:</h3>
      <input
        name="apellido"
        type="text"
        placeholder="Apellido"
        value={form.apellido}
        onChange={handleChange}
      />

      <h3>Deporte:</h3>
      <select
        name="iddeporte"
        value={form.iddeporte}
        onChange={handleChange}
      >
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

      <h3>Número de teléfono:</h3>
      <input
        name="telefono"
        type="text"
        placeholder="Telefono"
        value={form.telefono}
        onChange={handleChange}
      />

      <h3>Fecha de nacimiento:</h3>
      <input
        name="fechanacimiento"
        type="date"
        value={form.fechanacimiento}
        onChange={handleChange}
      />

      <h3>Ubicación:</h3>
      <input
        name="ubicacion"
        type="text"
        placeholder="Ubicacion"
        value={form.ubicacion}
        onChange={handleChange}
      />

      <h3>Género:</h3>
      <select
        name="genero"
        value={form.genero}
        onChange={handleChange}
      >
        <option value="">Seleccione un género</option>
        <option value="Masculino">Masculino</option>
        <option value="Femenino">Femenino</option>
      </select>

      <button onClick={handleRegistro}>
        Registrarse
      </button>
    </div>
  )
}

export default RegistroJugador