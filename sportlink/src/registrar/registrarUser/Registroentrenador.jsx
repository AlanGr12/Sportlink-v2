import { useState } from 'react'
import api from '../../axiosConfig.js'
import { BARRIOS, DEPORTES, fechaISO } from '../datosRegistro.js'
import { CampoFecha, CampoFoto, CampoGenero, AvisoError } from '../CamposRegistro.jsx'

const TITULOS = ['Licenciado en Ed. Física', 'Entrenador Nacional', 'Entrenador UEFA/CONMEBOL', 'Técnico Deportivo', 'Sin título formal']
const EXPERIENCIAS = ['0-2 años', '3-5 años', '6-10 años', '+10 años']

// Paso 3 del registro: datos del entrenador. Email y contraseña vienen del paso 2 (datosBase).
function RegistroEntrenador({ datosBase = {}, onRegistro }) {
  const [form, setForm] = useState({
    nombre: '', apellido: '', iddeporte: '', telefono: '', titulo: '', experiencia: '',
    tieneclub: false, genero: '', ubicacion: '', descripcion: '',
  })
  const [fecha, setFecha] = useState({ dia: '', mes: '', anio: '' })
  const [fotoperfil, setFotoperfil] = useState(null)
  const [errors, setErrors] = useState({})
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState('')

  const cambiar = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErrors((prev) => ({ ...prev, [campo]: '' }))
  }

  async function registro(e) {
    e?.preventDefault()
    if (cargando) return

    const fechanacimiento = fechaISO(fecha)
    const nuevos = {}
    if (!form.nombre) nuevos.nombre = 'Completá tu nombre'
    if (!form.apellido) nuevos.apellido = 'Completá tu apellido'
    if (!form.telefono) nuevos.telefono = 'Completá tu teléfono'
    if (!form.titulo) nuevos.titulo = 'Elegí tu título'
    if (!form.iddeporte) nuevos.iddeporte = 'Elegí tu especialidad'
    if (!form.experiencia) nuevos.experiencia = 'Elegí tu experiencia'
    if (!form.genero) nuevos.genero = 'Elegí una opción'
    if (!form.ubicacion) nuevos.ubicacion = 'Elegí tu barrio o zona'
    if (!fechanacimiento) nuevos.fechanacimiento = 'Completá día, mes y año'

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
      formData.append('titulo', form.titulo)
      formData.append('fechanacimiento', fechanacimiento)
      formData.append('experiencia', form.experiencia)
      formData.append('tieneclub', form.tieneclub)
      formData.append('genero', form.genero)
      formData.append('ubicacion', form.ubicacion)
      formData.append('descripcion', form.descripcion)
      if (fotoperfil) formData.append('fotoperfil', fotoperfil)

      const response = await api.post('/api/entrenadores/registro', formData)
      if (onRegistro) onRegistro(response.data)
    } catch (error) {
      console.error(error)
      setErrorGlobal(error.response?.data?.error || 'No pudimos crear tu cuenta. Probá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const select = (campo, etiqueta, opciones, placeholder) => (
    <label className="au-campo">
      <span>{etiqueta}</span>
      <select value={form[campo]} onChange={(e) => cambiar(campo, e.target.value)} disabled={cargando} aria-invalid={!!errors[campo]}>
        <option value="">{placeholder}</option>
        {opciones.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
      {errors[campo] && <small className="au-error">{errors[campo]}</small>}
    </label>
  )

  return (
    <form className="au-form" onSubmit={registro} noValidate>
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

      <div className="au-doble">
        {select('iddeporte', 'Especialidad', DEPORTES.map((d) => ({ value: String(d.id), label: d.nombre })), 'Elegí un deporte')}
        {select('titulo', 'Título', TITULOS, 'Elegí tu título')}
      </div>

      <div className="au-doble">
        {select('experiencia', 'Experiencia', EXPERIENCIAS, 'Elegí los años')}
        <label className="au-campo">
          <span>¿Trabajás en un club?</span>
          <select value={String(form.tieneclub)} onChange={(e) => cambiar('tieneclub', e.target.value === 'true')} disabled={cargando}>
            <option value="false">No, soy independiente</option>
            <option value="true">Sí, estoy en un club</option>
          </select>
        </label>
      </div>

      <div className="au-doble">
        {select('ubicacion', 'Barrio o zona', BARRIOS, 'Elegí tu barrio')}
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
        <textarea placeholder="Tu metodología, con qué categorías trabajás, logros." value={form.descripcion} onChange={(e) => cambiar('descripcion', e.target.value)} maxLength={500} disabled={cargando} />
        <small style={{ justifySelf: 'end' }}>{form.descripcion.length}/500</small>
      </label>

      <CampoFoto id="rg-foto-entrenador" archivo={fotoperfil} onElegir={setFotoperfil} disabled={cargando} />

      <AvisoError texto={errorGlobal} />
      <button type="submit" className="pr-btn pr-btn--block au-enviar" disabled={cargando}>
        {cargando ? 'Creando tu cuenta…' : 'Crear mi cuenta'}
      </button>
    </form>
  )
}

export default RegistroEntrenador
