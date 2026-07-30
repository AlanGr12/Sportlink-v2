import React, { useState } from 'react'
import Avatar from '../components/Avatar.jsx'

// Búsqueda con ícono de lupa (SVG inline)
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

// Clase del badge de rol: colors distintivos según la ref de Figma
function rolBadgeClass(rol) {
  if (!rol) return 'mensajes-role-badge'
  const r = rol.toLowerCase()
  if (r === 'entrenador') return 'mensajes-role-badge entrenador'
  if (r === 'club')       return 'mensajes-role-badge club'
  if (r === 'jugador')    return 'mensajes-role-badge jugador'
  return 'mensajes-role-badge grupo'
}

// Formato de hora/día relativo para sidebar
function formatearFechaRelativa(fechaString) {
  if (!fechaString) return ''
  const date = new Date(fechaString)
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)

  const mismaFecha = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()

  if (mismaFecha(date, hoy)) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (mismaFecha(date, ayer)) return 'Yesterday'
  const dias = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return dias[date.getDay()]
}

export default function SidebarConversaciones({ conversaciones, conversacionActiva, setConversacionActiva, loading }) {
  const [busqueda, setBusqueda] = useState('')

  const conversacionesFiltradas = conversaciones.filter((c) => {
    const nombre = c.tipo === 'PRIVADA' ? c.otroParticipante?.nombre : c.nombre
    return (nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  })

  const getDetallesContacto = (c) => {
    if (c.tipo === 'PRIVADA') {
      return {
        nombre: c.otroParticipante?.nombre || 'Usuario Desconocido',
        foto: c.otroParticipante?.fotoperfil || null,
        rol: c.otroParticipante?.tipousuario || ''
      }
    }
    return { nombre: c.nombre || 'Grupo', foto: c.foto || null, rol: 'grupo' }
  }

  return (
    <aside className="mensajes-sidebar">
      {/* ── Header: título + buscador ── */}
      <div className="mensajes-sidebar-header">
        <h2>Mensajes</h2>
        <div className="mensajes-search-wrapper">
          <span className="mensajes-search-icon"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Search athletes, coaches..."
            className="mensajes-search-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* ── Lista de conversaciones ── */}
      <div className="mensajes-lista">
        {loading && (
          <div className="mensajes-lista-empty">Cargando conversaciones...</div>
        )}

        {!loading && conversacionesFiltradas.length === 0 && (
          <div className="mensajes-lista-empty">
            {busqueda ? 'Sin resultados para esa búsqueda.' : 'No tenés conversaciones todavía.'}
          </div>
        )}

        {conversacionesFiltradas.map((c) => {
          const isActive = conversacionActiva?.idconversacion === c.idconversacion
          const { nombre, foto, rol } = getDetallesContacto(c)
          const preview = c.ultimoMensaje?.contenido || 'No hay mensajes aún'
          const hora = formatearFechaRelativa(c.ultimoMensaje?.createdat)

          return (
            <div
              key={c.idconversacion}
              className={`mensajes-item${isActive ? ' activo' : ''}`}
              onClick={() => setConversacionActiva(c)}
            >
              {/* Avatar circular */}
              <Avatar src={foto} nombre={nombre} size={42} />

              {/* Info */}
              <div className="mensajes-item-info">
                {/* Fila 1: nombre + badge + hora */}
                <div className="mensajes-item-row1">
                  <div className="mensajes-item-name-group">
                    <span className="mensajes-item-name">{nombre}</span>
                    {rol && (
                      <span className={rolBadgeClass(rol)}>
                        {rol.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="mensajes-item-time">{hora}</span>
                </div>

                {/* Fila 2: preview del último mensaje */}
                <div className="mensajes-item-preview">{preview}</div>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
