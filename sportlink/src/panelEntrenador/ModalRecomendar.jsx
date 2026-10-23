import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../axiosConfig.js'

const nombreCompleto = (p) => [p?.nombre, p?.apellido].filter(Boolean).join(' ').trim() || 'Jugador'

/**
 * Popup "Recomendar al club": el entrenador le recomienda a su club vinculado
 * uno o varios alumnos, con una nota opcional. El club recibe una notificación
 * y los ve en la pestaña "Recomendados" de su panel.
 */
export default function ModalRecomendar({ jugadores, club, identrenamiento, onCerrar, onHecho }) {
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const lista = jugadores || []
  const varios = lista.length > 1

  // Bloquea el scroll de fondo y cierra con Escape
  useEffect(() => {
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const alPresionar = (e) => { if (e.key === 'Escape' && !enviando) onCerrar() }
    window.addEventListener('keydown', alPresionar)
    return () => {
      document.body.style.overflow = previo
      window.removeEventListener('keydown', alPresionar)
    }
  }, [enviando, onCerrar])

  const enviar = async () => {
    if (enviando || lista.length === 0) return
    setEnviando(true)
    setError('')
    try {
      const { data } = await api.post('/api/recomendaciones-club', {
        idjugadores: lista.map((j) => j.idjugador),
        identrenamiento: identrenamiento || null,
        nota: nota.trim() || null,
      })
      onHecho(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar la recomendación. Probá de nuevo.')
      setEnviando(false)
    }
  }

  return createPortal(
    <div className="pr-overlay pnl-overlay-top" onClick={() => !enviando && onCerrar()}>
      <div className="pr-modal pr-modal--sm" role="dialog" aria-modal="true" aria-labelledby="pe-recomendar-titulo" onClick={(e) => e.stopPropagation()}>
        <header className="pr-modal-head pnl-modal-head">
          <h2 id="pe-recomendar-titulo" className="pr-modal-title">
            {varios ? `Recomendar ${lista.length} jugadores` : `Recomendar a ${nombreCompleto(lista[0])}`}
          </h2>
          <button className="pr-close" onClick={onCerrar} disabled={enviando} aria-label="Cerrar">×</button>
        </header>

        <div className="pr-modal-body">
          <p className="pr-muted">
            Le llega a <strong className="pnl-strong">{club?.nombre}</strong> con tu nombre y lo ve en su panel.
          </p>

          {varios && (
            <ul className="pnl-selected" aria-label="Jugadores elegidos">
              {lista.map((j) => <li key={j.idjugador}>{nombreCompleto(j)}</li>)}
            </ul>
          )}

          <label className="pnl-message">
            <span>¿Por qué {varios ? 'los' : 'lo'} recomendás? (opcional)</span>
            <textarea
              placeholder="Ej.: muy buena lectura de juego, viene a todos los entrenamientos…"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={4}
              autoFocus
              maxLength={500}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) enviar() }}
            />
            <small>{nota.length}/500 · Ctrl + Enter para enviar</small>
          </label>

          {error && <p className="pr-error" role="alert">{error}</p>}
        </div>

        <footer className="pr-modal-foot">
          <button className="pr-btn pr-btn--ghost" onClick={onCerrar} disabled={enviando}>Cancelar</button>
          <button className="pr-btn" onClick={enviar} disabled={enviando || lista.length === 0}>
            {enviando ? 'Enviando…' : 'Recomendar'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}
