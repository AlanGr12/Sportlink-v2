import { useState } from 'react'
import axios from 'axios'
import './RegistroClub.css'

const deportesDisponibles = [
  { id: 1, nombre: 'Fútbol' },
  { id: 2, nombre: 'Basket' },
  { id: 3, nombre: 'Tenis' },
  { id: 4, nombre: 'Voley' },
  { id: 5, nombre: 'Pádel' },
  { id: 6, nombre: 'Rugby' },
  { id: 7, nombre: 'Hockey' },
  { id: 8, nombre: 'Natación' },
  { id: 9, nombre: 'Atletismo' },
  { id: 10, nombre: 'Ciclismo' },
  { id: 11, nombre: 'Boxeo' },
  { id: 12, nombre: 'Artes Marciales' },
  { id: 13, nombre: 'Handball' },
  { id: 14, nombre: 'Béisbol' },
  { id: 15, nombre: 'Golf' }
]

function RegistroClub({ onRegistro }) {
  const [form, setForm] = useState({
    email: '',
    contrasenia: '',
    nombre: '',
    ubicacion: '',
    deportes: []
  })
  const [fotoperfil, setFotoperfil] = useState(null)

  function cambiarForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function cambiarDeporte(idDeporte) {
    if (form.deportes.includes(idDeporte)) {
      setForm({ ...form, deportes: form.deportes.filter(id => id !== idDeporte) })
    } else {
      setForm({ ...form, deportes: [...form.deportes, idDeporte] })
    }
  }

  async function registro() {
    if (
      !form.email ||
      !form.contrasenia ||
      !form.nombre ||
      !form.ubicacion ||
      form.deportes.length === 0
    ) {
      alert('Completá todos los campos obligatorios')
      return
    }

    try {
      const formData = new FormData()
      formData.append('email', form.email)
      formData.append('contrasenia', form.contrasenia)
      formData.append('nombre', form.nombre)
      formData.append('ubicacion', form.ubicacion)
      formData.append('deportes', JSON.stringify(form.deportes))
      if (fotoperfil) {
        formData.append('fotoperfil', fotoperfil)
      }

      const response = await axios.post('http://localhost:3000/api/clubes/registro', formData)
      alert('Club registrado correctamente')
      if (onRegistro) onRegistro(response.data)
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.error || 'Error al registrar club')
    }
  }

  return (
    <div className="registro-bg">
      <div className="registro-container">

        <div className="registro-header">
          <div className="registro-logo">SPORT<span>LINK</span></div>
          <h1 className="registro-titulo">
            REGISTRATE COMO <span className="registro-titulo-color">CLUB</span>
          </h1>
          <p className="registro-subtitulo">
            Unite al ecosistema deportivo de rendimiento más avanzado del mundo.
          </p>
        </div>

        <div className="registro-card">

          <div className="registro-seccion">
            <p className="registro-seccion-titulo">INFORMACIÓN DEL CLUB</p>

            <label className="registro-label">NOMBRE DEL CLUB</label>
            <input
              className="registro-input"
              name="nombre"
              type="text"
              placeholder="Tu club"
              value={form.nombre}
              onChange={cambiarForm}
            />
            <span className="registro-error-hint">Este campo es obligatorio</span>

            <label className="registro-label">UBICACIÓN</label>
            <input
              className="registro-input"
              name="ubicacion"
              type="text"
              placeholder="Ciudad, Provincia"
              value={form.ubicacion}
              onChange={cambiarForm}
            />
            <span className="registro-error-hint">Este campo es obligatorio</span>

            <label className="registro-label">DEPORTES QUE OFRECE</label>
            <div className="registro-deportes-grid">
              {deportesDisponibles.map(deporte => (
                <button
                  key={deporte.id}
                  type="button"
                  className={`registro-deporte-btn ${form.deportes.includes(deporte.id) ? 'activo' : ''}`}
                  onClick={() => cambiarDeporte(deporte.id)}
                >
                  {deporte.nombre}
                </button>
              ))}
            </div>
            <span className="registro-error-hint">Seleccioná al menos un deporte</span>
          </div>

          <div className="registro-seccion">
            <p className="registro-seccion-titulo">CREDENCIALES Y PERFIL</p>

            <label className="registro-label">EMAIL</label>
            <input
              className="registro-input"
              name="email"
              type="email"
              placeholder="club@email.com"
              value={form.email}
              onChange={cambiarForm}
            />
            <span className="registro-error-hint">Este campo es obligatorio</span>

            <label className="registro-label">CONTRASEÑA</label>
            <input
              className="registro-input"
              name="contrasenia"
              type="password"
              placeholder="••••••••"
              value={form.contrasenia}
              onChange={cambiarForm}
            />
            <span className="registro-error-hint">Este campo es obligatorio</span>

            <label className="registro-label">FOTO DE PERFIL</label>
            <input
              className="registro-input-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFotoperfil(e.target.files[0])}
            />
            {fotoperfil && (
              <img
                className="registro-foto-preview"
                src={URL.createObjectURL(fotoperfil)}
                alt="Preview"
              />
            )}
          </div>

        </div>

        <button className="registro-btn-siguiente" onClick={registro}>
          REGISTRAR CLUB
        </button>

      </div>
    </div>
  )
}

export default RegistroClub