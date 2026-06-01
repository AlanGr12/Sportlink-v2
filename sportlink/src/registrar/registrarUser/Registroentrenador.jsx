import { useState } from 'react'
import axios from 'axios'

function RegistroEntrenador({ onRegistro }) {

  const [form, setForm] = useState({
    email: '',
    contraseña: '',
    nombre: '',
    apellido: '',
    iddeporte: '',
    telefono: '',
    titulo: '',
    fechanacimiento: '',
    experiencia: '',
    tieneclub: false,
    genero: '',
    ubicacion: ''
  })

  function cambiarForm(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  async function registro() {

    if (
      !form.email ||
      !form.contraseña ||
      !form.nombre ||
      !form.apellido ||
      !form.iddeporte ||
      !form.telefono ||
      !form.titulo ||
      !form.fechanacimiento ||
      !form.experiencia ||
      !form.genero ||
      !form.ubicacion
    ) {
      alert('Completa los campos obligatorios')
      return
    }

    try {

      const response = await axios.post(
        'http://localhost:3000/api/entrenadores/registro',
        {
          email: form.email,
          contraseña: form.contraseña,
          nombre: form.nombre,
          apellido: form.apellido,
          iddeporte: parseInt(form.iddeporte),
          telefono: form.telefono,
          fechanacimiento: form.fechanacimiento,
          ubicacion: form.ubicacion,
          genero: form.genero,
          tieneclub: form.tieneclub === 'true',
          experiencia: form.experiencia,
          titulo: form.titulo,
          fotoperfil: null,
          cv: null
        }
      )

      alert('Registro exitoso')

      if (onRegistro) {
        onRegistro(response.data)
      }

    } catch (error) {

      console.error(error)

      alert(
        error.response?.data?.error ||
        'Error al registrar entrenador'
      )

    }
  }

  return (
    <div>
      <h1>Registro Entrenador</h1>

      <h3>Email:</h3>
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={cambiarForm}
      />

      <h3>Contraseña:</h3>
      <input
        name="contraseña"
        type="password"
        placeholder="Contraseña"
        value={form.contraseña}
        onChange={cambiarForm}
      />

      <h3>Nombre:</h3>
      <input
        name="nombre"
        type="text"
        placeholder="Nombre"
        value={form.nombre}
        onChange={cambiarForm}
      />

      <h3>Apellido:</h3>
      <input
        name="apellido"
        type="text"
        placeholder="Apellido"
        value={form.apellido}
        onChange={cambiarForm}
      />

      <h3>Título:</h3>
      <select
        name="titulo"
        value={form.titulo}
        onChange={cambiarForm}
      >
        <option value="">Seleccioná un título</option>
        <option value="Licenciado en Ed. Física">Licenciado en Ed. Física</option>
        <option value="Entrenador Nacional">Entrenador Nacional</option>
        <option value="Entrenador UEFA/CONMEBOL">Entrenador UEFA/CONMEBOL</option>
        <option value="Técnico Deportivo">Técnico Deportivo</option>
        <option value="Sin título formal">Sin título formal</option>
      </select>

      <h3>Deporte:</h3>
      <select
        name="iddeporte"
        value={form.iddeporte}
        onChange={cambiarForm}
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

      <h3>Experiencia:</h3>
      <select
        name="experiencia"
        value={form.experiencia}
        onChange={cambiarForm}
      >
        <option value="">Seleccioná experiencia</option>
        <option value="0-2 años">0-2 años</option>
        <option value="3-5 años">3-5 años</option>
        <option value="6-10 años">6-10 años</option>
        <option value="+10 años">+10 años</option>
      </select>

      <h3>Teléfono:</h3>
      <input
        name="telefono"
        type="text"
        placeholder="Telefono"
        value={form.telefono}
        onChange={cambiarForm}
      />

      <h3>Fecha de nacimiento:</h3>
      <input
        name="fechanacimiento"
        type="date"
        value={form.fechanacimiento}
        onChange={cambiarForm}
      />

      <h3>Ubicación:</h3>
      <input
        name="ubicacion"
        type="text"
        placeholder="Ubicacion"
        value={form.ubicacion}
        onChange={cambiarForm}
      />

      <h3>Género:</h3>
      <select
        name="genero"
        value={form.genero}
        onChange={cambiarForm}
      >
        <option value="">Seleccioná género</option>
        <option value="Masculino">Masculino</option>
        <option value="Femenino">Femenino</option>
        <option value="Otro">Otro</option>
      </select>

      <h3>¿Tenés club actualmente?</h3>
      <select
        name="tieneclub"
        value={form.tieneclub}
        onChange={cambiarForm}
      >
        <option value="false">No</option>
        <option value="true">Sí</option>
      </select>

      <button onClick={registro}>
        Registrarse
      </button>
    </div>
  )
}

export default RegistroEntrenador