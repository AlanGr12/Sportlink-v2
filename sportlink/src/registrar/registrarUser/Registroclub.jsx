import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../axiosConfig.js'
import InputDireccionOSM from '../../components/maps/InputDireccionOSM.jsx'
import MapaUbicacionDark from '../../components/maps/MapaUbicacionDark.jsx'
import { DEPORTES } from '../datosRegistro.js'
import { CampoFoto, AvisoError } from '../CamposRegistro.jsx'

// Paso 3 del registro: datos del club. Email y contraseña vienen del paso 2 (datosBase).
// El club queda pendiente de aprobación: no se inicia sesión hasta que el backoffice lo apruebe.
function RegistroClub({ datosBase = {} }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', ubicacion: '', direccion: '', latitud: null, longitud: null, deportes: [], descripcion: '' })
  const [fotoperfil, setFotoperfil] = useState(null)
  const [errors, setErrors] = useState({})
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState('')

  const cambiarDeporte = (id) => {
    if (cargando) return
    setForm((prev) => ({ ...prev, deportes: prev.deportes.includes(id) ? prev.deportes.filter((d) => d !== id) : [...prev.deportes, id] }))
    setErrors((prev) => ({ ...prev, deportes: '' }))
  }

  async function registro(e) {
    e?.preventDefault()
    if (cargando) return

    if (!datosBase.email || !datosBase.contraseña) {
      setErrorGlobal('Faltan el email y la contraseña del paso anterior. Volvé un paso atrás.')
      return
    }
    const nuevos = {}
    if (!form.nombre) nuevos.nombre = 'Completá el nombre del club'
    if (form.latitud == null || form.longitud == null) nuevos.ubicacion = 'Buscá la dirección de la sede y elegila de la lista'
    if (form.deportes.length === 0) nuevos.deportes = 'Elegí al menos un deporte'

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
      formData.append('ubicacion', form.ubicacion)
      formData.append('direccion', form.direccion)
      formData.append('latitud', form.latitud)
      formData.append('longitud', form.longitud)
      formData.append('deportes', JSON.stringify(form.deportes))
      formData.append('descripcion', form.descripcion)
      if (fotoperfil) formData.append('fotoperfil', fotoperfil)

      await api.post('/api/clubes/registro', formData)
      navigate('/login', { state: { clubRegistrado: true } })
    } catch (error) {
      console.error(error)
      setErrorGlobal(error.response?.data?.error || 'No pudimos registrar el club. Probá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <form className="au-form" onSubmit={registro} noValidate>
      <label className="au-campo">
        <span>Nombre del club</span>
        <input type="text" autoComplete="organization" value={form.nombre}
          onChange={(e) => { setForm((p) => ({ ...p, nombre: e.target.value })); setErrors((p) => ({ ...p, nombre: '' })) }}
          disabled={cargando} aria-invalid={!!errors.nombre} autoFocus />
        {errors.nombre && <small className="au-error">{errors.nombre}</small>}
      </label>

      <div className="au-campo">
        <span>Dirección de la sede</span>
        <InputDireccionOSM
          value={form.direccion}
          onChangeText={(txt) => setForm((prev) => (
            // Si edita el texto a mano, la ubicación elegida deja de valer
            txt === prev.direccion ? prev : { ...prev, direccion: txt, latitud: null, longitud: null }
          ))}
          onSelectUbicacion={(loc) => {
            setErrors((prev) => ({ ...prev, ubicacion: '' }))
            setForm((prev) => ({ ...prev, direccion: loc.direccion, ubicacion: loc.zona || loc.direccion, latitud: loc.latitud, longitud: loc.longitud }))
          }}
          placeholder="Buscá la dirección o el nombre del club"
          disabled={cargando}
        />
        {errors.ubicacion && <small className="au-error">{errors.ubicacion}</small>}
        {form.latitud != null && form.longitud != null && (
          <div className="au-mapa">
            <MapaUbicacionDark latitud={form.latitud} longitud={form.longitud} direccion={form.direccion} zona={form.ubicacion} nombre={form.nombre} tipo="club" height="180px" mostrarFooter={false} />
          </div>
        )}
      </div>

      <fieldset className="au-campo" style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="au-legend">Deportes que ofrece</legend>
        <div className="au-chips" style={{ marginTop: 6 }}>
          {DEPORTES.map((d) => (
            <button key={d.id} type="button" className={`pr-chip${form.deportes.includes(d.id) ? ' is-on' : ''}`} aria-pressed={form.deportes.includes(d.id)} onClick={() => cambiarDeporte(d.id)} disabled={cargando}>
              {d.nombre}
            </button>
          ))}
        </div>
        {errors.deportes && <small className="au-error">{errors.deportes}</small>}
      </fieldset>

      <label className="au-campo">
        <span>Sobre el club (opcional)</span>
        <textarea placeholder="Instalaciones, categorías, propuesta." value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} maxLength={500} disabled={cargando} />
        <small style={{ justifySelf: 'end' }}>{form.descripcion.length}/500</small>
      </label>

      <CampoFoto id="rg-foto-club" archivo={fotoperfil} onElegir={setFotoperfil} disabled={cargando} />

      <div className="au-aviso">
        <strong>Antes de entrar, revisamos el club</strong>
        Cuando lo registres, el equipo de SportLink lo valida y te avisamos para que puedas ingresar.
      </div>

      <AvisoError texto={errorGlobal} />
      <button type="submit" className="pr-btn pr-btn--block au-enviar" disabled={cargando}>
        {cargando ? 'Registrando el club…' : 'Registrar club'}
      </button>
    </form>
  )
}

export default RegistroClub
