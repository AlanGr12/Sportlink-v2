import { useEffect, useMemo } from 'react'
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

export function CampoFoto({ archivo, onElegir, disabled, id }) {
  const preview = useMemo(() => (archivo ? URL.createObjectURL(archivo) : null), [archivo])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  return (
    <div className="au-campo">
      <span>Foto de perfil (opcional)</span>
      <div className="au-foto">
        <span className="au-foto-prev">
          {preview ? <img src={preview} alt="Vista previa" /> : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
          )}
        </span>
        <div>
          <label htmlFor={id} className="pr-link" style={{ cursor: disabled ? 'default' : 'pointer' }}>{archivo ? 'Cambiar foto' : 'Elegir foto'}</label>
          <span>JPG, PNG o WEBP</span>
        </div>
        <input id={id} type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={disabled} onChange={(e) => onElegir(e.target.files[0] || null)} />
      </div>
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
