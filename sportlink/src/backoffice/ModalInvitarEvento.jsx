import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../axiosConfig.js'
import '../entrenamientos/ModalContactoEntrenador.css'

const nombreCompleto = (p) => [p?.nombre, p?.apellido].filter(Boolean).join(' ').trim()

/**
 * Popup "Invitar a evento": el club elige una de sus pruebas o entrenamientos
 * abiertos y le manda una invitación puntual a uno o varios deportistas
 * (notificación con enlace al evento, sin inscribirlos automáticamente).
 */
export default function ModalInvitarEvento({ jugadores, datos, onCerrar, onEnviado }) {
  const destinatarios = jugadores || []
  const esMasivo = destinatarios.length > 1

  const opciones = useMemo(() => {
    const pruebas = (datos?.pruebas || [])
      .filter((p) => !p.finalizada)
      .map((p) => ({ tipo: 'prueba', id: p.idprueba, etiqueta: `Prueba · ${p.deporte || 'Deporte'} (${p.categoria || 'sin categoría'})` }))
    const entrenamientos = (datos?.entrenamientos || [])
      .filter((e) => e.estado !== 'FINALIZADO')
      .map((e) => ({ tipo: 'entrenamiento', id: e.identrenamientos, etiqueta: `Entrenamiento · ${e.titulo}` }))
    return [...pruebas, ...entrenamientos]
  }, [datos])

  const [valor, setValor] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState(null) // { exitos, fallos }

  useEffect(() => {
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previo }
  }, [])

  const handleInvitar = async () => {
    if (!valor || enviando || destinatarios.length === 0) return
    const [tipo, id] = valor.split(':')
    setEnviando(true)
    setError('')
    const ruta = tipo === 'prueba' ? 'pruebas' : 'entrenamientos'
    const resultados = await Promise.allSettled(
      destinatarios.map((j) => api.post(`/api/${ruta}/${id}/invitar`, { idusuario: j.idusuario }))
    )
    const exitos = resultados.filter((r) => r.status === 'fulfilled').length
    const fallos = resultados.length - exitos
    setResultado({ exitos, fallos })
    setEnviando(false)
    if (fallos === 0 && onEnviado) onEnviado()
  }

  const titulo = esMasivo
    ? `Invitar a ${destinatarios.length} deportistas`
    : `Invitar a ${nombreCompleto(destinatarios[0]) || 'este deportista'}`

  return createPortal(
    <div
      className="contacto-ent-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget && !enviando) onCerrar() }}
    >
      <div className="contacto-ent-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="contacto-ent-cerrar" aria-label="Cerrar" onClick={onCerrar} disabled={enviando}>✕</button>

        <div className="contacto-ent-cabecera">
          <svg viewBox="0 0 24 24" width="34" height="34" stroke="#2DEFF2" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" />
          </svg>
          <h2>{titulo}</h2>
          <p>Elegí a qué prueba o entrenamiento {esMasivo ? 'los' : 'lo'} invitás. {esMasivo ? 'Van a recibir' : 'Va a recibir'} una notificación con el enlace.</p>
        </div>

        {resultado ? (
          <p style={{ color: resultado.fallos === 0 ? '#6ee7b7' : '#fbbf24', fontSize: 13, textAlign: 'center', margin: '8px 0' }}>
            {resultado.fallos === 0
              ? `Invitación enviada correctamente${esMasivo ? ` a ${resultado.exitos} deportistas` : ''}.`
              : `Se invitó a ${resultado.exitos} de ${destinatarios.length}. ${resultado.fallos} fallaron.`}
          </p>
        ) : opciones.length === 0 ? (
          <p style={{ color: '#8b949e', fontSize: 13, textAlign: 'center', margin: '8px 0' }}>
            No tenés pruebas ni entrenamientos abiertos en el período elegido para invitar{esMasivo ? 'los' : 'lo'}. Probá cambiar el período arriba.
          </p>
        ) : (
          <select
            className="contacto-ent-textarea"
            style={{ minHeight: 'auto', padding: '12px 14px', cursor: 'pointer' }}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            autoFocus
          >
            <option value="">Seleccioná un evento…</option>
            {opciones.map((o) => (
              <option key={`${o.tipo}:${o.id}`} value={`${o.tipo}:${o.id}`}>{o.etiqueta}</option>
            ))}
          </select>
        )}

        {error && <div className="contacto-ent-error">{error}</div>}

        <div className="contacto-ent-acciones" style={{ marginTop: 16 }}>
          <button type="button" className="contacto-ent-btn-cancelar" onClick={onCerrar} disabled={enviando}>
            {resultado ? 'Cerrar' : 'Cancelar'}
          </button>
          {!resultado && (
            <button
              type="button"
              className="contacto-ent-btn-enviar"
              onClick={handleInvitar}
              disabled={!valor || enviando || opciones.length === 0}
            >
              {enviando ? 'Enviando...' : 'Invitar'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
