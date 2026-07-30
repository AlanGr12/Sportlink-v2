import React, { useState } from 'react'

const ClipIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
  </svg>
)

// Ícono de send tipo "flecha derecha" (coincide con el botón cian de la ref)
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
)

export default function ChatInput({ onSend }) {
  const [texto, setTexto] = useState('')

  const handleSend = (e) => {
    e.preventDefault()
    if (texto.trim()) {
      onSend(texto.trim())
      setTexto('')
    }
  }

  const handleKeyDown = (e) => {
    // Enter sin Shift envía el mensaje
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (texto.trim()) {
        onSend(texto.trim())
        setTexto('')
      }
    }
  }

  return (
    <form className="mensajes-input-area" onSubmit={handleSend}>
      {/* Botón clip (adjuntar) — solo visual por ahora */}
      <button type="button" className="mensajes-input-btn" title="Adjuntar archivo">
        <ClipIcon />
      </button>

      {/* Campo de texto */}
      <input
        type="text"
        className="mensajes-input-field"
        placeholder="Type a message..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      {/* Botón circular de envío con ícono */}
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
