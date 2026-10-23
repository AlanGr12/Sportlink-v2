import { useState } from 'react'
import AvatarCuadrado from '../components/AvatarCuadrado.jsx'
import { formatearFechaRelativa } from './utilsFecha.js'
import { ROLES, detallesContacto } from './utilsMensajes.js'

const FILTROS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Personas', value: 'personas' },
  { label: 'Grupos', value: 'grupos' },
]

export default function SidebarConversaciones({ usuario, onlineUsers, conversaciones, conversacionActiva, setConversacionActiva, loading }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const miId = usuario?.idusuario || usuario?.id
  const totalNoLeidos = conversaciones.reduce((acc, c) => acc + (c.noleidos || 0), 0)

  const filtradas = conversaciones.filter((c) => {
    const esPrivada = (c.tipo || 'PRIVADA').toUpperCase() === 'PRIVADA'
    const { nombre } = detallesContacto(c)
    if (!nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
    if (filtro === 'personas') return esPrivada
    if (filtro === 'grupos') return !esPrivada
    return true
  })

  const vacio = busqueda
    ? 'Sin resultados para esa búsqueda.'
    : filtro === 'personas'
      ? 'No tenés conversaciones individuales.'
      : filtro === 'grupos'
        ? 'No tenés conversaciones de grupos.'
        : 'Cuando contactes a un club o entrenador, la charla aparece acá.'

  return (
    <aside className="ms-lista" aria-label="Conversaciones">
      <div className="ms-lista-head">
        <h1 className="pr-display ms-titulo">
          Mensajes
          {totalNoLeidos > 0 && <span className="ms-badge ms-badge--titulo">{totalNoLeidos > 99 ? '99+' : totalNoLeidos}</span>}
        </h1>

        <label className="pr-search ms-search">
          <span className="pr-sr">Buscar conversaciones</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" placeholder="Buscar" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </label>

        <div className="ms-filtros" role="group" aria-label="Filtrar">
          {FILTROS.map((f) => (
            <button key={f.value} type="button" className={`pr-chip${filtro === f.value ? ' is-on' : ''}`} aria-pressed={filtro === f.value} onClick={() => setFiltro(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="ms-convs">
        {loading && [0, 1, 2, 3, 4].map((i) => <li key={i} className="ms-conv-skeleton" aria-hidden="true" />)}

        {!loading && filtradas.length === 0 && <li className="ms-lista-vacia">{vacio}</li>}

        {!loading && filtradas.map((c) => {
          const activa = conversacionActiva?.idconversacion === c.idconversacion
          const { nombre, foto, rol } = detallesContacto(c)
          const noLeidos = c.noleidos > 0
          const online = c.tipo === 'PRIVADA' && onlineUsers?.has(String(c.otroParticipante?.idusuario))

          let preview = c.ultimoMensaje?.contenido
            || (c.ultimoMensaje?.tipomensaje === 'EVENTO' ? 'Compartió un evento' : 'Todavía no hay mensajes')
          if (c.ultimoMensaje && Number(c.ultimoMensaje.idusuarioemisor) === Number(miId)) preview = `Vos: ${preview}`

          return (
            <li key={c.idconversacion}>
              <button
                type="button"
                className={`ms-conv${activa ? ' is-on' : ''}${noLeidos ? ' is-nueva' : ''}`}
                aria-current={activa ? 'true' : undefined}
                onClick={() => setConversacionActiva(c)}
              >
                <span className="ms-avatar">
                  <AvatarCuadrado src={foto} nombre={nombre} size={48} />
                  {online && <i className="ms-online" title="En línea" />}
                </span>
                <span className="ms-conv-txt">
                  <span className="ms-conv-fila">
                    <strong>{nombre}</strong>
                    <time>{formatearFechaRelativa(c.ultimoMensaje?.createdat)}</time>
                  </span>
                  <span className="ms-conv-fila">
                    <span className="ms-conv-preview">
                      {ROLES[rol?.toLowerCase()] && <em>{ROLES[rol.toLowerCase()]} · </em>}
                      {preview}
                    </span>
                    {noLeidos && <span className="ms-badge">{c.noleidos > 99 ? '99+' : c.noleidos}</span>}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
