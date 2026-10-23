import { useState, useRef, useEffect, useCallback } from 'react'
import { SelectorEventos, TarjetaEvento } from '../components/EventoAdjunto.jsx'

const Ico = ({ children }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
const EmojiIcon = () => <Ico><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></Ico>
const EventIcon = () => <Ico><rect x="3" y="4" width="18" height="18" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></Ico>
const SendIcon = () => <Ico><path d="M5 12h14M13 5l7 7-7 7" /></Ico>

const EMOJI_LIST = [
  '😊', '😂', '🤣', '😍', '😎', '🥳', '😉', '😜', '🤩', '😇',
  '👍', '👎', '👏', '🙌', '🙏', '💪', '🔥', '❤️', '⭐', '✨',
  '⚽', '🏀', '🏆', '🥇', '🎯', '⚡', '👟', '🏃‍♂️', '💬', '🎉'
]

// puedeAdjuntarEvento: clubes (pruebas, empleos) y entrenadores (entrenamientos)
export default function ChatInput({ onSend, onTyping, puedeAdjuntarEvento = false }) {
  const [texto, setTexto] = useState('')
  const [evento, setEvento] = useState(null)
  const [selectorAbierto, setSelectorAbierto] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const cerrarSelector = useCallback(() => setSelectorAbierto(false), [])
  const puedeEnviar = Boolean(texto.trim() || evento)

  const textareaRef = useRef(null)
  const containerRef = useRef(null)

  // Cerrar el popover de emojis al hacer click afuera
  useEffect(() => {
    const fuera = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setShowEmoji(false)
    }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [])

  // El textarea crece con el texto hasta un tope
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }, [texto])

  const enviar = () => {
    if (!puedeEnviar) return
    onSend(texto.trim(), evento)
    setTexto('')
    setEvento(null)
    setShowEmoji(false)
  }

  const elegirEmoji = (emoji) => {
    setTexto((prev) => prev + emoji)
    textareaRef.current?.focus()
  }

  return (
    <div className="ms-input" ref={containerRef}>
      {showEmoji && (
        <div className="ms-pop" role="dialog" aria-label="Emojis">
          {EMOJI_LIST.map((emoji) => (
            <button key={emoji} type="button" className="ms-emoji" onClick={() => elegirEmoji(emoji)} aria-label={`Agregar ${emoji}`}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      {evento && (
        <div className="ms-input-evento">
          <TarjetaEvento evento={evento} onQuitar={() => setEvento(null)} />
        </div>
      )}

      <SelectorEventos abierto={selectorAbierto} onCerrar={cerrarSelector} onElegir={setEvento} />

      <form className="ms-input-fila" onSubmit={(e) => { e.preventDefault(); enviar() }}>
        {puedeAdjuntarEvento && (
          <button type="button" className="ms-icono" title="Adjuntar prueba, entrenamiento o empleo" aria-label="Adjuntar evento" onClick={() => { setSelectorAbierto(true); setShowEmoji(false) }}>
            <EventIcon />
          </button>
        )}
        <button
          type="button"
          className={`ms-icono${showEmoji ? ' is-on' : ''}`}
          aria-label="Emojis"
          aria-expanded={showEmoji}
          onClick={() => setShowEmoji((v) => !v)}
        >
          <EmojiIcon />
        </button>

        <label className="ms-input-campo">
          <span className="pr-sr">Mensaje</span>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Escribí un mensaje"
            value={texto}
            onChange={(e) => { setTexto(e.target.value); onTyping?.() }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
          />
        </label>

        <button type="submit" className="pr-btn ms-enviar" aria-label="Enviar mensaje" disabled={!puedeEnviar}>
          <SendIcon />
        </button>
      </form>
    </div>
  )
}
