import React, { useState, useRef, useEffect } from 'react'

const ClipIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
)

const EmojiIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
)

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
)

export default function ChatInput({ onSend, onTyping }) {
  const [texto, setTexto] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize del textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [texto])

  const enviar = () => {
    if (texto.trim()) {
      onSend(texto.trim())
      setTexto('')
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  const handleChange = (e) => {
    setTexto(e.target.value)
    if (onTyping) onTyping()
  }

  return (
    <form className="mensajes-input-area" onSubmit={(e) => { e.preventDefault(); enviar() }}>
      {/* Botón clip */}
      <button type="button" className="mensajes-input-btn" title="Adjuntar archivo">
        <ClipIcon />
      </button>

      {/* Botón emoji */}
      <button type="button" className="mensajes-input-btn" title="Emojis">
        <EmojiIcon />
      </button>

      {/* Campo de texto — textarea con auto-resize */}
      <textarea
        ref={textareaRef}
        rows={1}
        className="mensajes-input-field"
        placeholder="Escribí un mensaje..."
        value={texto}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      {/* Botón de envío */}
      <button
        type="submit"
        className="mensajes-input-btn primary"
        title="Enviar mensaje"
        disabled={!texto.trim()}
      >
        <SendIcon />
      </button>
    </form>
  )
}
