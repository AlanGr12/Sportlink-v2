import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './ChatbotButton.css'

/**
 * ChatbotButton — Redesign 2.0 (paleta Sportlink)
 *
 * Paleta oficial: celeste #2DEFF2 / negro
 * - Fondo: degradado radial oscuro con toque celeste
 * - Highlight especular (efecto burbuja/vidrio)
 * - Arcos dobles giratorios (horario + antihorario)
 * - Ojos con parpadeo animado
 * - Shimmer suave en hover
 * - Ventana de chat funcional conectada al backend IA
 */

const MENSAJE_BIENVENIDA = {
  rol: 'assistant',
  texto: '¡Hola! Soy el asistente inteligente de SportLink. Puedo ayudarte a buscar pruebas de jugadores, ofertas de empleo en clubes y entrenamientos. ¿En qué te puedo consultar hoy?',
}

export default function ChatbotButton() {
  const [hovered, setHovered] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [mensajes, setMensajes] = useState([MENSAJE_BIENVENIDA])
  const [inputTexto, setInputTexto] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const mensajesEndRef = useRef(null)

  // Auto-scroll al último mensaje cada vez que cambia la lista o se abre el chat
  useEffect(() => {
    if (isOpen) {
      mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mensajes, isLoading, isOpen])

  const enviarMensaje = async () => {
    const texto = inputTexto.trim()
    if (!texto || isLoading) return

    // 1. Agregar mensaje del usuario inmediatamente
    const nuevosMensajes = [...mensajes, { rol: 'user', texto }]
    setMensajes(nuevosMensajes)
    setInputTexto('')
    setIsLoading(true)

    try {
      // 2. Construir historial en el formato esperado por el backend
      const historialBackend = nuevosMensajes
        .slice(0, -1)
        .map((m) => ({ role: m.rol, content: m.texto }))

      // 3. Llamar al backend
      const res = await axios.post('http://localhost:3000/api/ia/chat', {
        mensaje: texto,
        historial: historialBackend,
      })

      // 4. Agregar respuesta del bot
      setMensajes((prev) => [
        ...prev,
        { rol: 'assistant', texto: res.data.respuesta },
      ])
    } catch (error) {
      console.error('Error al contactar con el asistente:', error)
      setMensajes((prev) => [
        ...prev,
        {
          rol: 'assistant',
          texto: '⚠️ Ocurrió un error al conectar con el asistente. Por favor, intentá de nuevo.',
          isError: true,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  return (
    <>
      {/* ══════════════════════════════════════
          VENTANA DE CHAT FLOTANTE
          ══════════════════════════════════════ */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-header-dot" />
              <span className="chatbot-header-title">Asistente SportLink</span>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          {/* Área de mensajes con scroll */}
          <div className="chatbot-messages">
            {mensajes.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-msg-wrapper ${msg.rol === 'user' ? 'msg-user' : 'msg-bot'}`}
              >
                <div
                  className={`chatbot-bubble ${msg.rol === 'user' ? 'bubble-user' : 'bubble-bot'}${msg.isError ? ' bubble-error' : ''}`}
                >
                  {msg.texto}
                </div>
              </div>
            ))}

            {/* Indicador animado "Escribiendo..." */}
            {isLoading && (
              <div className="chatbot-msg-wrapper msg-bot">
                <div className="chatbot-bubble bubble-bot chatbot-typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            {/* Ancla de auto-scroll */}
            <div ref={mensajesEndRef} />
          </div>

          {/* Área de input */}
          <div className="chatbot-input-area">
            <input
              type="text"
              className="chatbot-input"
              placeholder={isLoading ? 'Escribiendo...' : 'Escribí tu consulta...'}
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
            />
            <button
              className="chatbot-send-btn"
              onClick={enviarMensaje}
              disabled={isLoading || !inputTexto.trim()}
              aria-label="Enviar mensaje"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          BOTÓN FLOTANTE SVG ANIMADO (original)
          ══════════════════════════════════════ */}
      <div
        className={`chatbot-wrapper${hovered ? ' chatbot-hovered' : ''}${isOpen ? ' chatbot-active' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Chatbot SportLink"
        role="button"
        tabIndex={0}
        aria-label={isOpen ? 'Cerrar chatbot' : 'Abrir chatbot'}
        onKeyDown={(e) => e.key === 'Enter' && setIsOpen((prev) => !prev)}
      >

      {/* Anillos de pulso externos */}
      <span className="chatbot-pulse-ring" aria-hidden="true" />
      <span className="chatbot-pulse-ring" aria-hidden="true" />
      <span className="chatbot-pulse-ring" aria-hidden="true" />

      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="chatbot-svg"
        aria-hidden="true"
      >
        <defs>
          {/* ── Fondo principal: negro profundo con toque celeste ── */}
          <radialGradient id="cb-bg-radial" cx="38%" cy="32%" r="72%">
            <stop offset="0%"   stopColor="#0a1a1e" />
            <stop offset="40%"  stopColor="#071015" />
            <stop offset="80%"  stopColor="#040c10" />
            <stop offset="100%" stopColor="#020608" />
          </radialGradient>

          {/* ── Overlay celeste sutil (desde esquina opuesta) ── */}
          <radialGradient id="cb-overlay" cx="72%" cy="75%" r="55%">
            <stop offset="0%"   stopColor="#2DEFF2" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#2DEFF2" stopOpacity="0" />
          </radialGradient>

          {/* ── Highlight especular (efecto burbuja) ── */}
          <radialGradient id="cb-glass" cx="30%" cy="20%" r="42%">
            <stop offset="0%"   stopColor="#ffffff"  stopOpacity="0.22" />
            <stop offset="55%"  stopColor="#2DEFF2"  stopOpacity="0.06" />
            <stop offset="100%" stopColor="#ffffff"  stopOpacity="0" />
          </radialGradient>

          {/* ── Shimmer hover (diagonal celeste→blanco) ── */}
          <linearGradient id="cb-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#ffffff"  stopOpacity="0" />
            <stop offset="42%"  stopColor="#2DEFF2"  stopOpacity="0.45" />
            <stop offset="52%"  stopColor="#ffffff"  stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff"  stopOpacity="0" />
          </linearGradient>

          {/* ── Degradado arco horario ── */}
          <linearGradient id="cb-arc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#2DEFF2" />
            <stop offset="100%" stopColor="#2DEFF2" stopOpacity="0.25" />
          </linearGradient>

          {/* ── Degradado arco antihorario ── */}
          <linearGradient id="cb-arc-grad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#2DEFF2" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#2DEFF2" stopOpacity="0.1" />
          </linearGradient>

          {/* ── Degradado robot (silueta) ── */}
          <linearGradient id="cb-robot-fill" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%"   stopColor="#7ffcff" />
            <stop offset="45%"  stopColor="#2DEFF2" />
            <stop offset="100%" stopColor="#0abcc0" />
          </linearGradient>

          {/* ── Degradado ojos ── */}
          <radialGradient id="cb-eye-fill" cx="38%" cy="32%" r="68%">
            <stop offset="0%"   stopColor="#e0fffe" />
            <stop offset="55%"  stopColor="#2DEFF2" />
            <stop offset="100%" stopColor="#0c9ea0" />
          </radialGradient>

          {/* ── Glow suave para iconografía ── */}
          <filter id="cb-glow-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* ── Glow arcos ── */}
          <filter id="cb-glow-arc" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip de burbuja */}
          <clipPath id="cb-circle-clip">
            <circle cx="50" cy="50" r="46" />
          </clipPath>
        </defs>

        {/* ════════════════════════════════════════
            CAPA 1: Fondo burbuja oscuro
            ════════════════════════════════════════ */}
        <circle cx="50" cy="50" r="46" fill="url(#cb-bg-radial)" />

        {/* CAPA 2: Overlay celeste sutil */}
        <circle cx="50" cy="50" r="46" fill="url(#cb-overlay)" />

        {/* CAPA 3: Borde celeste semitransparente */}
        <circle
          cx="50" cy="50" r="46"
          fill="none"
          stroke="#2DEFF2"
          strokeWidth="1.2"
          strokeOpacity="0.3"
        />

        {/* ════════════════════════════════════════
            ARCOS GIRATORIOS DOBLES
            ════════════════════════════════════════ */}

        {/* Arco 1: horario principal */}
        <circle
          cx="50" cy="50" r="47.5"
          fill="none"
          stroke="url(#cb-arc-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="24 274"
          className="chatbot-arc"
          filter="url(#cb-glow-arc)"
        />

        {/* Arco 1 sombra difusa */}
        <circle
          cx="50" cy="50" r="47.5"
          fill="none"
          stroke="#2DEFF2"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeDasharray="24 274"
          className="chatbot-arc"
          opacity="0.12"
        />

        {/* Arco 2: antihorario sutil */}
        <circle
          cx="50" cy="50" r="47.5"
          fill="none"
          stroke="url(#cb-arc-grad2)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="10 288"
          className="chatbot-arc-reverse"
          filter="url(#cb-glow-arc)"
        />

        {/* ════════════════════════════════════════
            ICONO ROBOT
            ════════════════════════════════════════ */}
        <g transform="translate(15,20) scale(0.58)">
          <g transform="translate(0,103) scale(0.1,-0.1)">

            {/* Silueta exterior con degradado celeste */}
            <path
              fill="url(#cb-robot-fill)"
              filter="url(#cb-glow-soft)"
              d="
                M618 1003
                c34 -30 37 -59 8 -88
                -14 -14 -26 -34 -26 -44
                0 -17 11 -19 133 -23
                156 -4 197 -18 280 -97
                63 -60 101 -132 118 -223
                31 -170 -73 -360 -231 -419
                -51 -19 -74 -20 -345 -19
                l-290 2
                -52 -26
                c-90 -44 -102 -36 -73 55
                l19 63
                -36 39
                c-63 70 -78 117 -78 242
                0 98 3 116 27 167
                35 76 107 151 177 185
                51 25 68 28 184 32
                117 3 127 5 127 22
                0 10 -9 28 -20 39
                -28 28 -25 64 6 89
                32 26 46 26 72 4
                z
              "
            />

            {/* Recorte interior oscuro (pantalla del robot) */}
            <path
              fill="#030a0c"
              d="
                M305 681
                c-166 -77 -174 -337 -12 -424
                40 -21 52 -22 293 -22
                l251 0 49 30
                c30 19 60 49 78 79
                27 42 30 58 30 120
                0 79 -21 131 -71 178
                -56 54 -81 58 -340 58
                -210 0 -243 -3 -278 -19
                z
              "
            />

            {/* Reflejo interior sutil celeste */}
            <path
              fill="#2DEFF2"
              fillOpacity="0.06"
              d="
                M305 681
                c-166 -77 -174 -337 -12 -424
                40 -21 52 -22 293 -22
                l251 0 49 30
                c30 19 60 49 78 79
                27 42 30 58 30 120
                0 79 -21 131 -71 178
                -56 54 -81 58 -340 58
                -210 0 -243 -3 -278 -19
                z
              "
            />

            {/* OJO IZQUIERDO */}
            <g style={{ transformOrigin: '450px 490px' }} className="chatbot-eye">
              <path
                fill="url(#cb-eye-fill)"
                filter="url(#cb-glow-soft)"
                d="
                  M467 528
                  c32 -30 32 -102 1 -135
                  -28 -30 -52 -29 -78 4
                  -17 22 -20 36 -16 72
                  6 46 29 81 54 81
                  9 0 26 -10 39 -22
                  z
                "
              />
              <ellipse cx="442" cy="475" rx="17" ry="21" fill="#020c0d" />
              <ellipse cx="435" cy="463" rx="7" ry="7" fill="#e0fffe" fillOpacity="0.9" />
            </g>

            {/* OJO DERECHO */}
            <g style={{ transformOrigin: '760px 490px' }} className="chatbot-eye-r">
              <path
                fill="url(#cb-eye-fill)"
                filter="url(#cb-glow-soft)"
                d="
                  M779 524
                  c38 -49 11 -154 -41 -154
                  -56 0 -81 109 -36 157
                  28 30 52 29 77 -3
                  z
                "
              />
              <ellipse cx="752" cy="470" rx="17" ry="21" fill="#020c0d" />
              <ellipse cx="744" cy="458" rx="7" ry="7" fill="#e0fffe" fillOpacity="0.9" />
            </g>

          </g>
        </g>

        {/* ════════════════════════════════════════
            HIGHLIGHT ESPECULAR — efecto burbuja
            ════════════════════════════════════════ */}
        <ellipse
          cx="37" cy="25"
          rx="21" ry="13"
          fill="url(#cb-glass)"
          clipPath="url(#cb-circle-clip)"
        />

        {/* Reflejo inferior sutil */}
        <ellipse
          cx="63" cy="77"
          rx="12" ry="6"
          fill="#2DEFF2"
          fillOpacity="0.06"
          clipPath="url(#cb-circle-clip)"
        />

        {/* ════════════════════════════════════════
            SHIMMER hover (destello diagonal)
            ════════════════════════════════════════ */}
        <rect
          x="-10" y="-10"
          width="120" height="120"
          fill="url(#cb-shimmer)"
          className="chatbot-shimmer"
          clipPath="url(#cb-circle-clip)"
        />

      </svg>
    </div>
    </>
  )
}
