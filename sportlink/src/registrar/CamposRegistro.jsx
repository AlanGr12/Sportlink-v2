import { useState } from 'react'
import useVistaPrevia from '../components/useVistaPrevia.js'
import RecortadorImagen from '../components/RecortadorImagen.jsx'
import { ASPECTOS } from '../components/aspectosImagen.js'
import { DIAS, MESES, ANIOS } from './datosRegistro.js'

// Piezas de formulario compartidas por los registros de jugador, entrenador y club

export function CampoFecha({ valor, onCambiar, error, disabled }) {
  return (
    <fieldset className="au-campo" style={{ border: 0, margin: 0, padding: 0 }}>
      <legend className="au-legend">Fecha de nacimiento</legend>
      <div className="au-triple" style={{ marginTop: 6 }}>
        <select aria-label="Día" value={valor.dia} onChange={(e) => onCambiar({ ...valor, dia: e.target.value })} disabled={disabled} aria-invalid={!!error}>
          <option value="">Día</option>
          {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select aria-label="Mes" value={valor.mes} onChange={(e) => onCambiar({ ...valor, mes: e.target.value })} disabled={disabled} aria-invalid={!!error}>
          <option value="">Mes</option>
          {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select aria-label="Año" value={valor.anio} onChange={(e) => onCambiar({ ...valor, anio: e.target.value })} disabled={disabled} aria-invalid={!!error}>
          <option value="">Año</option>
          {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      {error && <small className="au-error">{error}</small>}
    </fieldset>
  )
}

export function CampoFoto({ archivo, onElegir, disabled, id, etiqueta = 'Foto de perfil (opcional)', ayuda = 'JPG, PNG o WEBP', aspecto = ASPECTOS.cuadrado, error }) {
  // La foto elegida se acomoda en el recortador antes de confirmarla
  const [pendiente, setPendiente] = useState(null)
  const preview = useVistaPrevia(archivo)

  return (
    <div className="au-campo">
      <span>{etiqueta}</span>
      <div className="au-foto">
        <span className="au-foto-prev" style={aspecto !== 1 ? { width: 96, aspectRatio: aspecto } : undefined}>
          {preview ? <img src={preview} alt="Vista previa" /> : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
          )}
        </span>
        <div>
          <label htmlFor={id} className="pr-link" style={{ cursor: disabled ? 'default' : 'pointer' }}>{archivo ? 'Cambiar foto' : 'Elegir foto'}</label>
          <span>{ayuda}</span>
        </div>
        <input id={id} type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={disabled} onChange={(e) => { setPendiente(e.target.files[0] || null); e.target.value = '' }} />
      </div>
      {error && <small className="au-error">{error}</small>}
      {pendiente && (
        <RecortadorImagen
          archivo={pendiente}
          aspecto={aspecto}
          titulo={etiqueta.replace(/ \(opcional\)/, '')}
          onCancelar={() => setPendiente(null)}
          onConfirmar={(f) => { onElegir(f); setPendiente(null) }}
        />
      )}
    </div>
  )
}

export function CampoGenero({ valor, onCambiar, error, disabled }) {
  return (
    <fieldset className="au-campo" style={{ border: 0, margin: 0, padding: 0 }}>
      <legend className="au-legend">Género</legend>
      <div className="au-chips au-genero" style={{ marginTop: 6 }}>
        {['Masculino', 'Femenino'].map((g) => (
          <button key={g} type="button" className={`pr-chip${valor === g ? ' is-on' : ''}`} aria-pressed={valor === g} onClick={() => onCambiar(g)} disabled={disabled}>
            {g}
          </button>
        ))}
      </div>
      {error && <small className="au-error">{error}</small>}
    </fieldset>
  )
}

export function AvisoError({ texto }) {
  if (!texto) return null
  return <p className="pr-error" role="alert">{texto}</p>
}
