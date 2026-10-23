import { useState } from 'react'
import api from '../../axiosConfig.js'
import { BARRIOS, DEPORTES, fechaISO } from '../datosRegistro.js'
import { CampoFecha, CampoFoto, CampoGenero, AvisoError } from '../CamposRegistro.jsx'

// Paso 3 del registro: datos del jugador. Email y contraseña vienen del paso 2 (datosBase).
const RegistroJugador = ({ datosBase = {}, onRegistro }) => {
  const [form, setForm] = useState({ nombre: '', apellido: '', iddeporte: null, telefono: '', ubicacion: '', genero: '', descripcion: '' })
  const [fecha, setFecha] = useState({ dia: '', mes: '', anio: '' })
  const [fotoperfil, setFotoperfil] = useState(null)
  const [errors, setErrors] = useState({})
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState('')

  const cambiar = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErrors((prev) => ({ ...prev, [campo]: '' }))
  }

  async function handleRegistro(e) {
    e?.preventDefault()
    if (cargando) return

    const fechanacimiento = fechaISO(fecha)
    const nuevos = {}
    if (!form.nombre) nuevos.nombre = 'Completá tu nombre'
    if (!form.apellido) nuevos.apellido = 'Completá tu apellido'
    if (!form.ubicacion) nuevos.ubicacion = 'Elegí tu barrio o zona'
    if (!form.telefono) nuevos.telefono = 'Completá tu teléfono'
    if (!fechanacimiento) nuevos.fechanacimiento = 'Completá día, mes y año'
    if (!form.genero) nuevos.genero = 'Elegí una opción'
    if (!form.iddeporte) nuevos.deportes = 'Elegí tu deporte'

    setErrors(nuevos)
    if (Object.keys(nuevos).length > 0) {
      setErrorGlobal('Revisá los campos marcados.')
      return
    }

    setCargando(true)
    setErrorGlobal('')
    try {
      const formData = new FormData()
      formData.append('email', datosBase.email)
      formData.append('contrasenia', datosBase.contraseña)
      formData.append('nombre', form.nombre)
      formData.append('apellido', form.apellido)
      formData.append('iddeporte', form.iddeporte)
      formData.append('telefono', form.telefono)
      formData.append('fechanacimiento', fechanacimiento)
      formData.append('ubicacion', form.ubicacion)
      formData.append('genero', form.genero)
      formData.append('descripcion', form.descripcion)
      if (fotoperfil) formData.append('fotoperfil', fotoperfil)

      const response = await api.post('/api/jugadores/registro', formData)
      if (onRegistro) onRegistro(response.data)
    } catch (error) {
      console.error(error)
      setErrorGlobal(error.response?.data?.error || 'No pudimos crear tu cuenta. Probá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <form className="au-form" onSubmit={handleRegistro} noValidate>
      <div className="au-doble">
        <label className="au-campo">
          <span>Nombre</span>
          <input type="text" autoComplete="given-name" value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} disabled={cargando} aria-invalid={!!errors.nombre} autoFocus />
          {errors.nombre && <small className="au-error">{errors.nombre}</small>}
        </label>
        <label className="au-campo">
          <span>Apellido</span>
          <input type="text" autoComplete="family-name" value={form.apellido} onChange={(e) => cambiar('apellido', e.target.value)} disabled={cargando} aria-invalid={!!errors.apellido} />
          {errors.apellido && <small className="au-error">{errors.apellido}</small>}
        </label>
      </div>

      <fieldset className="au-campo" style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="au-legend">Deporte principal</legend>
        <div className="au-chips" style={{ marginTop: 6 }}>
          {DEPORTES.map((d) => (
            <button key={d.id} type="button" className={`pr-chip${form.iddeporte === d.id ? ' is-on' : ''}`} aria-pressed={form.iddeporte === d.id}
              onClick={() => { cambiar('iddeporte', form.iddeporte === d.id ? null : d.id); setErrors((p) => ({ ...p, deportes: '' })) }} disabled={cargando}>
              {d.nombre}
            </button>
          ))}
        </div>
        {errors.deportes && <small className="au-error">{errors.deportes}</small>}
      </fieldset>

      <div className="au-doble">
        <label className="au-campo">
          <span>Barrio o zona</span>
          <select value={form.ubicacion} onChange={(e) => cambiar('ubicacion', e.target.value)} disabled={cargando} aria-invalid={!!errors.ubicacion}>
            <option value="">Elegí tu barrio</option>
            {BARRIOS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          {errors.ubicacion && <small className="au-error">{errors.ubicacion}</small>}
        </label>
        <label className="au-campo">
          <span>Teléfono</span>
          <div className="au-tel">
            <b>+54</b>
            <input type="tel" autoComplete="tel-national" placeholder="11 2345 6789" value={form.telefono} onChange={(e) => cambiar('telefono', e.target.value)} disabled={cargando} aria-invalid={!!errors.telefono} />
          </div>
          {errors.telefono && <small className="au-error">{errors.telefono}</small>}
        </label>
      </div>

      <CampoFecha valor={fecha} onCambiar={(v) => { setFecha(v); setErrors((p) => ({ ...p, fechanacimiento: '' })) }} error={errors.fechanacimiento} disabled={cargando} />
      <CampoGenero valor={form.genero} onCambiar={(g) => cambiar('genero', g)} error={errors.genero} disabled={cargando} />

      <label className="au-campo">
        <span>Sobre vos (opcional)</span>
        <textarea placeholder="Dónde jugaste, en qué posición, qué estás buscando." value={form.descripcion} onChange={(e) => cambiar('descripcion', e.target.value)} maxLength={500} disabled={cargando} />
        <small style={{ justifySelf: 'end' }}>{form.descripcion.length}/500</small>
      </label>

      <CampoFoto id="rg-foto-jugador" archivo={fotoperfil} onElegir={setFotoperfil} disabled={cargando} />

      <AvisoError texto={errorGlobal} />
      <button type="submit" className="pr-btn pr-btn--block au-enviar" disabled={cargando}>
        {cargando ? 'Creando tu cuenta…' : 'Crear mi cuenta'}
      </button>
    </form>
  )
}

export default RegistroJugador
