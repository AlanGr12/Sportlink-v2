import React, { useState } from 'react'
import Avatar from '../components/Avatar.jsx'

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const ChatEmptyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

function rolBadgeClass(rol) {
  if (!rol) return 'mensajes-role-badge'
  const r = rol.toLowerCase()
  if (r === 'entrenador') return 'mensajes-role-badge entrenador'
  if (r === 'club')       return 'mensajes-role-badge club'
  if (r === 'jugador')    return 'mensajes-role-badge jugador'
  return 'mensajes-role-badge grupo'
}

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
  if (mismaFecha(date, ayer)) return 'Ayer'
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return dias[date.getDay()]
}

const FILTROS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Jugadores', value: 'jugador' },
  { label: 'Entrenadores', value: 'entrenador' },
  { label: 'Clubes', value: 'club' },
]

function SkeletonItem() {
  return (
    <div className="mensajes-skeleton-item">
      <div className="mensajes-skeleton-avatar" />
      <div className="mensajes-skeleton-info">
        <div className="mensajes-skeleton-line larga" />
        <div className="mensajes-skeleton-line corta" />
      </div>
    </div>
  )
}

export default function SidebarConversaciones({ usuario, onlineUsers, conversaciones, conversacionActiva, setConversacionActiva, loading }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState('todos')

  const conversacionesFiltradas = conversaciones.filter((c) => {
    const nombre = c.tipo === 'PRIVADA' ? c.otroParticipante?.nombre : c.nombre
    const matchBusqueda = (nombre || '').toLowerCase().includes(busqueda.toLowerCase())

    if (!matchBusqueda) return false
    if (filtroActivo === 'todos') return true

    const rol = (c.otroParticipante?.tipousuario || '').toLowerCase()
    return rol === filtroActivo
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

  const totalNoLeidos = conversaciones.reduce((acc, c) => acc + (c.noleidos || 0), 0)

  return (
    <aside className="mensajes-sidebar">
      {/* ── Header ── */}
      <div className="mensajes-sidebar-header">
        <div className="mensajes-sidebar-title-row">
          <h2>
            Mensajes
            {totalNoLeidos > 0 && (
              <span className="mensajes-unread-badge" style={{ marginLeft: '8px', fontSize: '0.6rem' }}>
                {totalNoLeidos}
              </span>
            )}
          </h2>
          <button className="mensajes-new-chat-btn" title="Nueva conversación">
            <EditIcon />
          </button>
        </div>

        <div className="mensajes-search-wrapper">
          <span className="mensajes-search-icon"><SearchIcon /></span>
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            className="mensajes-search-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* ── Chips de filtro ── */}
      <div className="mensajes-filtros">
        {FILTROS.map(f => (
          <button
            key={f.value}
            className={`mensajes-filtro-chip${filtroActivo === f.value ? ' activo' : ''}`}
            onClick={() => setFiltroActivo(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Lista de conversaciones ── */}
      <div className="mensajes-lista">
        {loading && (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        )}

        {!loading && conversacionesFiltradas.length === 0 && (
          <div className="mensajes-lista-empty">
            <div className="mensajes-lista-empty-icon">
              <ChatEmptyIcon />
            </div>
            <span>
              {busqueda
                ? 'Sin resultados para esa búsqueda.'
                : filtroActivo !== 'todos'
                  ? `No tenés conversaciones con ${filtroActivo}s.`
                  : 'No tenés conversaciones todavía.'}
            </span>
          </div>
        )}

        {conversacionesFiltradas.map((c) => {
          const isActive = conversacionActiva?.idconversacion === c.idconversacion
          const { nombre, foto, rol } = getDetallesContacto(c)
          const hora = formatearFechaRelativa(c.ultimoMensaje?.createdat)

          const miIdUsuario = usuario?.idusuario || usuario?.id
          let preview = c.ultimoMensaje?.contenido || 'No hay mensajes aún'
          if (c.ultimoMensaje && Number(c.ultimoMensaje.idusuarioemisor) === Number(miIdUsuario)) {
            preview = 'Tú: ' + preview
          }

          const hasUnread = c.noleidos > 0
          const isOnline = c.tipo === 'PRIVADA' && onlineUsers && onlineUsers.has(String(c.otroParticipante?.idusuario))

          return (
            <div
              key={c.idconversacion}
              className={`mensajes-item${isActive ? ' activo' : ''}`}
              onClick={() => setConversacionActiva(c)}
            >
              {/* Avatar con indicador online */}
              <div className="mensajes-item-avatar-wrapper">
                <Avatar src={foto} nombre={nombre} size={44} />
                {isOnline && <div className="online-indicator" />}
              </div>

              {/* Info */}
              <div className="mensajes-item-info">
                {/* Fila 1: nombre + badge rol + hora */}
                <div className="mensajes-item-row1">
                  <div className="mensajes-item-name-group">
                    <span className={`mensajes-item-name${hasUnread ? ' unread' : ''}`}>{nombre}</span>
                    {rol && (
                      <span className={rolBadgeClass(rol)}>
                        {rol.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="mensajes-item-time">{hora}</span>
                </div>

                {/* Fila 2: preview + badge no leídos */}
                <div className="mensajes-item-row2">
                  <div className={`mensajes-item-preview${hasUnread ? ' unread' : ''}`}>{preview}</div>
                  {hasUnread && <div className="mensajes-unread-badge">{c.noleidos > 99 ? '99+' : c.noleidos}</div>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
