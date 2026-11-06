import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import { fechaLarga, iniciales } from '../utils/formato.js'
import './ChatbotButton.css'

/**
 * ChatbotButton — asistente de SportLink (IA del backend: POST /api/ia/chat).
 * Botón flotante cuadrado con un globo de diálogo y un panel de chat plano,
 * con la misma lógica de siempre: historial, envío con Enter y aviso de error.
 */

const MENSAJE_BIENVENIDA = {
  rol: 'assistant',
  texto: 'Hola, soy el asistente de SportLink. Te ayudo a encontrar pruebas, entrenamientos y búsquedas de clubes. ¿Qué estás buscando?',
}

// Atajos para arrancar la charla (se mandan como un mensaje más)
const SUGERENCIAS = [
  '¿Qué pruebas de fútbol hay abiertas?',
  'Busco entrenamientos cerca de mi zona',
  '¿Cómo me postulo a un empleo?',
]

const ETIQUETA_TIPO = { PRUEBA: 'Prueba', ENTRENAMIENTO: 'Entrenamiento', EMPLEO: 'Empleo' }

// El backend saca las marcas [[tipo:id]] del texto y devuelve los eventos aparte.
// Al mandar el historial se vuelven a agregar, así el modelo sabe a qué eventos se refería.
const contenidoParaHistorial = (m) => {
  const marcas = (m.eventos || []).map((ev) => `[[${ev.tipo.toLowerCase()}:${ev.id}]]`).join(' ')
  return marcas ? `${m.texto}\n${marcas}` : m.texto
}

// Fila de un evento recomendado: lleva a su detalle (/pruebas/:id, /entrenamientos/:id, /empleos/:id)
function FilaEvento({ evento }) {
  const navigate = useNavigate()
  const [sinFoto, setSinFoto] = useState(false)
  const datos = [
    ETIQUETA_TIPO[evento.tipo],
    evento.tipo !== 'EMPLEO' && evento.fecha ? fechaLarga(evento.fecha) : null,
    evento.activo === false ? 'Cerrado' : null,
  ].filter(Boolean).join(' · ')

  return (
    <button type="button" className="cb-evento" onClick={() => navigate(evento.ruta)}>
      <span className="cb-evento-avatar" aria-hidden="true">
        {evento.imagen && !sinFoto
          ? <img src={evento.imagen} alt="" loading="lazy" onError={() => setSinFoto(true)} />
          : iniciales(evento.titulo)}
      </span>
      <span className="cb-evento-txt">
        <strong>{evento.titulo}</strong>
        {evento.subtitulo && <span>{evento.subtitulo}</span>}
        <span>{datos}</span>
      </span>
      <span className="cb-evento-flecha" aria-hidden="true">→</span>
    </button>
  )
}

const IcoGlobo = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16v12H9l-5 4z" />
    <path d="M9 10h.01M12 10h.01M15 10h.01" strokeWidth="2.6" />
  </svg>
)
const IcoCerrar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)
const IcoEnviar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [mensajes, setMensajes] = useState([MENSAJE_BIENVENIDA])
  const [inputTexto, setInputTexto] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const mensajesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll al último mensaje cada vez que cambia la lista o se abre el chat
  useEffect(() => {
    if (isOpen) mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes, isLoading, isOpen])

  // Escape cierra el panel
  useEffect(() => {
    if (!isOpen) return
    const fn = (e) => { if (e.key === 'Escape') setIsOpen(false) }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [isOpen])

  // El campo crece con el texto hasta un tope
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [inputTexto, isOpen])

  const enviarMensaje = async (textoDirecto) => {
    const texto = (textoDirecto ?? inputTexto).trim()
    if (!texto || isLoading) return

    // 1. Agregar mensaje del usuario inmediatamente
    const nuevosMensajes = [...mensajes, { rol: 'user', texto }]
    setMensajes(nuevosMensajes)
    setInputTexto('')
    setIsLoading(true)

    try {
      // 2. Historial en el formato que espera el backend (sin el mensaje recién agregado)
      const historialBackend = nuevosMensajes.slice(0, -1).map((m) => ({ role: m.rol, content: contenidoParaHistorial(m) }))
      const res = await api.post('/api/ia/chat', { mensaje: texto, historial: historialBackend })
      setMensajes((prev) => [...prev, { rol: 'assistant', texto: res.data.respuesta, eventos: Array.isArray(res.data.eventos) ? res.data.eventos : [] }])
    } catch (error) {
      console.error('Error al contactar con el asistente:', error)
      setMensajes((prev) => [...prev, { rol: 'assistant', texto: 'No pude conectarme con el asistente. Probá de nuevo en un rato.', isError: true }])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  const soloBienvenida = mensajes.length === 1

  return (
    <>
      {isOpen && (
        <section className="cb-panel" role="dialog" aria-label="Asistente de SportLink">
          <header className="cb-head">
            <span className="cb-head-ico" aria-hidden="true"><IcoGlobo /></span>
            <div className="cb-head-txt">
              <h2>Asistente</h2>
              <p>Pruebas, entrenamientos y empleos</p>
            </div>
            <button type="button" className="cb-cerrar" onClick={() => setIsOpen(false)} aria-label="Cerrar asistente">
              <IcoCerrar />
            </button>
          </header>

          <div className="cb-mensajes" aria-live="polite">
            {mensajes.map((msg, i) => (
              <div key={i} className={`cb-msg ${msg.rol === 'user' ? 'is-user' : 'is-bot'}${msg.isError ? ' is-error' : ''}`}>
                <p>{msg.texto}</p>
                {msg.eventos?.length > 0 && (
                  <div className="cb-eventos">
                    {msg.eventos.map((ev) => <FilaEvento key={`${ev.tipo}-${ev.id}`} evento={ev} />)}
                  </div>
                )}
              </div>
            ))}

            {soloBienvenida && (
              <div className="cb-sugerencias">
                {SUGERENCIAS.map((s) => (
                  <button key={s} type="button" className="cb-sugerencia" onClick={() => enviarMensaje(s)} disabled={isLoading}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="cb-msg is-bot cb-escribiendo" aria-label="El asistente está escribiendo">
                <span /><span /><span />
              </div>
            )}

            <div ref={mensajesEndRef} />
          </div>

          <form className="cb-input" onSubmit={(e) => { e.preventDefault(); enviarMensaje() }}>
            <label className="cb-campo">
              <span className="cb-sr">Tu consulta</span>
              <textarea
                ref={inputRef}
                rows={1}
                placeholder="Escribí tu consulta"
                value={inputTexto}
                onChange={(e) => setInputTexto(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                autoFocus
              />
            </label>
            <button type="submit" className="cb-enviar" disabled={isLoading || !inputTexto.trim()} aria-label="Enviar">
              <IcoEnviar />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`cb-boton${isOpen ? ' is-on' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente de SportLink'}
        aria-expanded={isOpen}
        title="Asistente de SportLink"
      >
        <span className="cb-boton-ico cb-boton-ico--globo"><IcoGlobo /></span>
        <span className="cb-boton-ico cb-boton-ico--cerrar"><IcoCerrar /></span>
      </button>
    </>
  )
}
