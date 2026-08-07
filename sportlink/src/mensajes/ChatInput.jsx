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

const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
)

const EMOJI_LIST = [
  '😊', '😂', '🤣', '😍', '😎', '🥳', '😉', '😜', '🤩', '😇',
  '👍', '👎', '👏', '🙌', '🙏', '💪', '🔥', '❤️', '⭐', '✨',
  '⚽', '🏀', '🏆', '🥇', '🎯', '⚡', '👟', '🏃‍♂️', '💬', '🎉'
]

export default function ChatInput({ onSend, onTyping }) {
  const [texto, setTexto] = useState('')
  const [showAdjuntar, setShowAdjuntar] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  const textareaRef = useRef(null)
  const containerRef = useRef(null)

  // Cerrar popovers al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowAdjuntar(false)
        setShowEmoji(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      setShowAdjuntar(false)
      setShowEmoji(false)
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

  const handleSelectEmoji = (emoji) => {
    setTexto((prev) => prev + emoji)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  return (
    <div className="mensajes-input-container" ref={containerRef}>
      {/* Popover de Adjuntar */}
      {showAdjuntar && (
        <div className="mensajes-popover mensajes-adjuntar-popover">
          <button
            type="button"
            className="mensajes-adjuntar-opcion"
            onClick={() => setShowAdjuntar(false)}
          >
            <ImageIcon />
            <span>Imagen</span>
          </button>
          <button
            type="button"
            className="mensajes-adjuntar-opcion"
            onClick={() => setShowAdjuntar(false)}
          >
            <VideoIcon />
            <span>Video</span>
          </button>
        </div>
      )}

      {/* Popover de Emojis */}
      {showEmoji && (
        <div className="mensajes-popover mensajes-emoji-popover">
          <div className="mensajes-emoji-header">Emojis</div>
          <div className="mensajes-emoji-grid">
            {EMOJI_LIST.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                className="mensajes-emoji-btn"
                onClick={() => handleSelectEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="mensajes-input-area" onSubmit={(e) => { e.preventDefault(); enviar() }}>
        {/* Botón clip */}
        <button
          type="button"
          className={`mensajes-input-btn ${showAdjuntar ? 'activo' : ''}`}
          title="Adjuntar archivo"
          onClick={() => {
            setShowAdjuntar((prev) => !prev)
            setShowEmoji(false)
          }}
        >
          <ClipIcon />
        </button>

        {/* Botón emoji */}
        <button
          type="button"
          className={`mensajes-input-btn ${showEmoji ? 'activo' : ''}`}
          title="Emojis"
          onClick={() => {
            setShowEmoji((prev) => !prev)
            setShowAdjuntar(false)
          }}
        >
          <EmojiIcon />
        </button>

        {/* Campo de texto */}
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
    </div>
  )
}
