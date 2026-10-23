import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import api from '../axiosConfig.js'
import { normalizeAvatarUrl } from '../components/Avatar.jsx'
import ModalContactoEntrenador from '../entrenamientos/ModalContactoEntrenador.jsx'
import ModalInvitarEvento from './ModalInvitarEvento.jsx'
import { iniciales, fechaLarga } from '../utils/formato.js'
import '../pruebas/PruebasView.css'
import '../components/panel/PanelGestion.css'
import './BackofficeClub.css'

const RANGOS = [
  { valor: 'mes', etiqueta: 'Último mes' },
  { valor: 'trimestre', etiqueta: 'Últimos 3 meses' },
  { valor: 'historico', etiqueta: 'Histórico' },
]

const TABS = [
  { valor: 'entrenamientos', etiqueta: 'Entrenamientos' },
  { valor: 'pruebas', etiqueta: 'Pruebas de selección' },
  { valor: 'entrenadores', etiqueta: 'Rendimiento de entrenadores' },
  { valor: 'solicitudes', etiqueta: 'Solicitudes' },
  { valor: 'recomendados', etiqueta: 'Recomendados' },
]

// Pestañas que solo tienen sentido para la cuenta del club (no para un admin mirando)
const TABS_SOLO_CLUB = ['solicitudes', 'recomendados']

const ESTADO_ENTRENAMIENTO = {
  ACTIVO: ['pr-pill--open', 'Activo'],
  FINALIZADO: ['pnl-pill--off', 'Finalizado'],
  INACTIVO: ['pr-pill--warn', 'Inactivo'],
}
const ESTADO_PRUEBA = { FINALIZADA: ['pnl-pill--off', 'Finalizada'], ABIERTA: ['pr-pill--open', 'Abierta'], CERRADA: ['pr-pill--warn', 'Cerrada'] }
const ESTADO_RECOMENDACION = {
  PENDIENTE: ['pr-pill--open', 'Pendiente'],
  CONTACTADO: ['pr-pill--ok', 'Contactado'],
  DESCARTADA: ['pnl-pill--off', 'Descartada'],
}

const nombreCompleto = (p) => [p?.nombre, p?.apellido].filter(Boolean).join(' ').trim() || 'Sin asignar'
const numero = (n) => new Intl.NumberFormat('es-AR').format(n ?? 0)
const dinero = (n) => `$ ${numero(n)}`
const plural = (n, uno, varios) => `${numero(n)} ${n === 1 ? uno : varios}`

const Flecha = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="square" />
  </svg>
)

const AvatarCuadrado = ({ persona, size }) => {
  const foto = normalizeAvatarUrl(persona?.fotoperfil)
  return (
    <span className="pr-avatar" style={size ? { width: size, height: size, fontSize: Math.round(size * 0.36) } : undefined} aria-hidden="true">
      {foto ? <img src={foto} alt="" /> : iniciales(nombreCompleto(persona))}
    </span>
  )
}

const Persona = ({ p }) => (
  <div className="pnl-person-id">
    <p className="pr-person-name">
      {p?.idusuario ? <Link to={`/perfil/${p.idusuario}`}>{nombreCompleto(p)}</Link> : <span>{nombreCompleto(p)}</span>}
    </p>
  </div>
)

const FilaPersona = ({ p, id, meta, seleccionado, onToggle, onMensaje, onInvitar }) => (
  <li className={`pnl-person${seleccionado ? ' is-selected' : ''}`}>
    <input
      type="checkbox"
      className="pnl-check"
      checked={seleccionado}
      onChange={() => onToggle(p, id)}
      aria-label={`Seleccionar a ${nombreCompleto(p)}`}
    />
    <AvatarCuadrado persona={p} />
    <div className="pnl-person-id">
      <p className="pr-person-name">{p?.idusuario ? <Link to={`/perfil/${p.idusuario}`}>{nombreCompleto(p)}</Link> : nombreCompleto(p)}</p>
      <p className="pr-person-meta">{meta}</p>
    </div>
    <div className="pr-person-actions pnl-person-actions">
      <button className="pr-link" onClick={() => onMensaje([p])}>Mensaje</button>
      <button className="pr-link" onClick={() => onInvitar([p])}>Invitar</button>
    </div>
  </li>
)

// Lista de participantes de una prueba o entrenamiento, mostrada en línea debajo
// de su fila en la tabla (sin navegar a otra vista). `tipo` es 'prueba' | 'entrenamiento'.
function PanelParticipantes({ tipo, id, onInvitar, onMensaje, seleccionados, onToggleSeleccion }) {
  const [participantes, setParticipantes] = useState(null) // null = cargando
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    const url = tipo === 'prueba' ? '/api/inscripcionesprueba' : '/api/inscripcionesentrenamientos'
    const params = tipo === 'prueba' ? { idprueba: id } : { identrenamiento: id }
    api.get(url, { params })
      .then((res) => { if (vigente) { setParticipantes(res.data || []); setError('') } })
      .catch(() => { if (vigente) setError('No se pudieron cargar los participantes.') })
    return () => { vigente = false; setParticipantes(null) }
  }, [tipo, id])

  if (error) return <p className="pr-muted">{error}</p>
  if (participantes === null) return <p className="pr-muted">Cargando participantes…</p>
  if (participantes.length === 0) return <p className="pr-muted">Todavía no hay nadie anotado.</p>

  return (
    <ul className="pnl-people">
      {participantes.map((i) => {
        const j = i.jugador || {}
        const clave = i.idinscripcionesprueba || i.idinscripcionesentr
        return (
          <FilaPersona
            key={clave}
            p={j}
            id={j.idusuario}
            meta={j.deportes?.deporte || ''}
            seleccionado={!!seleccionados?.has(j.idusuario)}
            onToggle={onToggleSeleccion}
            onMensaje={onMensaje}
            onInvitar={onInvitar}
          />
        )
      })}
    </ul>
  )
}

// ── Secciones ───────────────────────────────────────────────────────────────
function SeccionEntrenamientos({ datos, seleccion, accionesFila, expandido, setExpandido }) {
  const lista = datos.entrenamientos
  if (lista.length === 0) {
    return <div className="pnl-block"><p className="pr-muted">No hay entrenamientos publicados por el club en este período.</p></div>
  }
  const r = datos.resumen.entrenamientos
  return (
    <>
      <div className="pnl-split">
        <div className="pnl-block">
          <h2 className="pnl-block-title">Ocupación por entrenamiento</h2>
          <ul className="pnl-bars">
            {lista.slice(0, 8).map((e) => (
              <li key={e.identrenamientos} className="pr-cupos">
                <p className="pr-cupos-texto">
                  <span className="pnl-bar-name" title={e.titulo}>{e.titulo}</span>
                  <span>{e.ocupacion === null ? 'Sin cupo' : `${e.inscriptos}/${e.cupo} · ${e.ocupacion}%`}</span>
                </p>
                <div className="pr-cupos-barra"><i className={e.ocupacion >= 100 ? 'is-full' : ''} style={{ width: `${e.ocupacion ?? 0}%` }} /></div>
              </li>
            ))}
          </ul>
          {lista.length > 8 && <p className="pnl-note">Mostrando los 8 más recientes. La tabla incluye todos.</p>}
        </div>

        <div className="pnl-block">
          <h2 className="pnl-block-title">Resumen</h2>
          <dl className="pr-facts pnl-facts">
            <div><dt>Ocupación promedio</dt><dd>{r.ocupacionPromedio}%</dd></div>
            <div><dt>Entrenamientos</dt><dd>{numero(r.total)}</dd></div>
            <div><dt>Inscriptos / cupos ofrecidos</dt><dd>{numero(r.inscriptos)} / {numero(r.cupoTotal)}</dd></div>
            <div><dt>En lista de espera</dt><dd>{numero(r.listaEspera)}</dd></div>
            <div><dt>Ingresos estimados</dt><dd>{dinero(r.ingresosEstimados)}</dd></div>
          </dl>
          <p className="pnl-note">Los ingresos se estiman como precio × inscriptos; no reflejan pagos confirmados.</p>
        </div>
      </div>

      <div className="pnl-table-wrap">
        <table className="pnl-table">
          <thead>
            <tr>
              <th>Título</th><th>Entrenador asignado</th><th>Fecha</th>
              <th className="num">Cupos</th><th className="num">Espera</th><th>Ocupación</th><th>Estado</th><th />
            </tr>
          </thead>
          <tbody>
            {lista.map((e) => {
              const abierto = expandido === `e${e.identrenamientos}`
              const [clase, texto] = ESTADO_ENTRENAMIENTO[e.estado] || ESTADO_ENTRENAMIENTO.ACTIVO
              return (
                <Fragment key={e.identrenamientos}>
                  <tr className={abierto ? 'is-open' : ''}>
                    <td><Link className="pnl-table-title" to={`/entrenamientos/${e.identrenamientos}`}>{e.titulo}</Link></td>
                    <td>{e.entrenador ? <Persona p={e.entrenador} /> : '—'}</td>
                    <td className="pnl-date">{fechaLarga(e.fechaentr)}</td>
                    <td className="num">{e.cupo > 0 ? `${e.inscriptos} / ${e.cupo}` : e.inscriptos}</td>
                    <td className="num">{e.listaEspera}</td>
                    <td>
                      <div className="pnl-mini">
                        <div className="pr-cupos-barra"><i className={e.ocupacion >= 100 ? 'is-full' : ''} style={{ width: `${e.ocupacion ?? 0}%` }} /></div>
                        <b>{e.ocupacion === null ? '—' : `${e.ocupacion}%`}</b>
                      </div>
                    </td>
                    <td><span className={`pr-pill ${clase}`}>{texto}</span></td>
                    <td>
                      <button className="pr-link" onClick={() => setExpandido(abierto ? null : `e${e.identrenamientos}`)} aria-expanded={abierto}>
                        {abierto ? 'Ocultar' : 'Inscriptos'}
                      </button>
                    </td>
                  </tr>
                  {abierto && (
                    <tr className="pnl-row-detail">
                      <td colSpan={8}>
                        <PanelParticipantes tipo="entrenamiento" id={e.identrenamientos} seleccionados={seleccion} {...accionesFila} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

function SeccionPruebas({ datos, seleccion, accionesFila, expandido, setExpandido }) {
  const [agrupar, setAgrupar] = useState('porCategoria')
  const lista = datos.pruebas
  const r = datos.resumen.pruebas
  if (lista.length === 0) {
    return <div className="pnl-block"><p className="pr-muted">No hay pruebas de selección publicadas por el club en este período.</p></div>
  }
  const abiertas = r.activas
  const cerradas = r.total - r.activas
  const desglose = datos.desglosePruebas[agrupar] || []
  const maxInscriptos = Math.max(1, ...desglose.map((d) => d.inscriptos))

  return (
    <>
      <div className="pnl-split">
        <div className="pnl-block">
          <h2 className="pnl-block-title">Convocatorias abiertas vs. cerradas</h2>
          <div className="pnl-stacked" role="img" aria-label={`${abiertas} abiertas y ${cerradas} cerradas`}>
            <span className="a" style={{ width: `${(abiertas / r.total) * 100}%` }} />
            <span className="b" style={{ width: `${(cerradas / r.total) * 100}%` }} />
          </div>
          <div className="pnl-legend">
            <span><i style={{ background: 'var(--slk-accent)' }} />Abiertas: <b>{abiertas}</b></span>
            <span><i style={{ background: 'var(--slk-step-hover)' }} />Cerradas o finalizadas: <b>{cerradas}</b></span>
          </div>
          <dl className="pr-facts pnl-facts" style={{ marginTop: 0 }}>
            <div><dt>Postulantes / cupos ofrecidos</dt><dd>{numero(r.inscriptos)} / {numero(r.cupoTotal)}</dd></div>
            <div><dt>En lista de espera</dt><dd>{numero(r.listaEspera)}</dd></div>
            <div><dt>Ocupación promedio</dt><dd>{r.ocupacionPromedio}%</dd></div>
          </dl>
        </div>

        <div className="pnl-block">
          <div className="pnl-block-head">
            <h2 className="pnl-block-title">Postulantes</h2>
            <span className="pnl-segmented">
              {[['porCategoria', 'Categoría'], ['porGenero', 'Género'], ['porDeporte', 'Disciplina']].map(([v, t]) => (
                <button key={v} type="button" aria-pressed={agrupar === v} onClick={() => setAgrupar(v)}>{t}</button>
              ))}
            </span>
          </div>
          <ul className="pnl-bars">
            {desglose.map((d) => (
              <li key={d.clave} className="pr-cupos">
                <p className="pr-cupos-texto">
                  <span className="pnl-bar-name" title={d.clave}>{d.clave}</span>
                  <span>{d.inscriptos} postulantes · {plural(d.pruebas, 'prueba', 'pruebas')}</span>
                </p>
                <div className="pr-cupos-barra"><i style={{ width: `${Math.round((d.inscriptos / maxInscriptos) * 100)}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pnl-table-wrap">
        <table className="pnl-table">
          <thead>
            <tr>
              <th>Disciplina</th><th>Categoría</th><th>Género</th><th>Fecha</th>
              <th className="num">Postulantes</th><th className="num">Espera</th><th>Ocupación</th><th>Estado</th><th />
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => {
              const abierto = expandido === `p${p.idprueba}`
              const estadoClave = p.finalizada ? 'FINALIZADA' : p.abierta ? 'ABIERTA' : 'CERRADA'
              const [clase, texto] = ESTADO_PRUEBA[estadoClave]
              return (
                <Fragment key={p.idprueba}>
                  <tr className={abierto ? 'is-open' : ''}>
                    <td>{p.deporte || '—'}</td>
                    <td>{p.categoria || '—'}</td>
                    <td>{p.genero || '—'}</td>
                    <td className="pnl-date">{fechaLarga(p.fechaprueba)}</td>
                    <td className="num">{p.cupo > 0 ? `${p.inscriptos} / ${p.cupo}` : p.inscriptos}</td>
                    <td className="num">{p.listaEspera}</td>
                    <td>
                      <div className="pnl-mini">
                        <div className="pr-cupos-barra"><i className={p.ocupacion >= 100 ? 'is-full' : ''} style={{ width: `${p.ocupacion ?? 0}%` }} /></div>
                        <b>{p.ocupacion === null ? '—' : `${p.ocupacion}%`}</b>
                      </div>
                    </td>
                    <td><span className={`pr-pill ${clase}`}>{texto}</span></td>
                    <td>
                      <button className="pr-link" onClick={() => setExpandido(abierto ? null : `p${p.idprueba}`)} aria-expanded={abierto}>
                        {abierto ? 'Ocultar' : 'Postulantes'}
                      </button>
                    </td>
                  </tr>
                  {abierto && (
                    <tr className="pnl-row-detail">
                      <td colSpan={9}>
                        <PanelParticipantes tipo="prueba" id={p.idprueba} seleccionados={seleccion} {...accionesFila} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

function SeccionEntrenadores({ datos, ocupado, onBaja, error }) {
  const lista = datos.entrenadores
  const [confirmando, setConfirmando] = useState(null) // idvinculacion pendiente de confirmar
  return (
    <div className="pnl-table-wrap">
      {error && <p className="pr-error" role="alert" style={{ margin: 16 }}>{error}</p>}
      {lista.length === 0 ? (
        <p className="pr-muted" style={{ padding: 20 }}>Todavía no tenés entrenadores vinculados. Podés invitarlos desde tu perfil.</p>
      ) : (
        <table className="pnl-table">
          <thead>
            <tr>
              <th>Entrenador</th><th>Disciplinas</th>
              <th className="num">Entrenamientos</th><th className="num">Alumnos atendidos</th><th>Calificación</th><th />
            </tr>
          </thead>
          <tbody>
            {lista.map((e) => (
              <tr key={e.identrenador}>
                <td><Persona p={e} /></td>
                <td>{e.deportes.length ? e.deportes.join(', ') : '—'}</td>
                <td className="num">{e.entrenamientos}</td>
                <td className="num">{e.alumnos}</td>
                <td>{e.calificacion === null ? <span className="pr-muted">Sin reseñas</span> : `★ ${e.calificacion.toLocaleString('es-AR')} (${e.totalResenias})`}</td>
                <td>
                  {confirmando === e.idvinculacion ? (
                    <div className="pnl-confirm">
                      <button className="pr-link pr-link--danger" disabled={ocupado === e.idvinculacion}
                        onClick={async () => { await onBaja(e); setConfirmando(null) }}>
                        {ocupado === e.idvinculacion ? 'Procesando…' : 'Confirmar baja'}
                      </button>
                      <button className="pr-link" disabled={ocupado === e.idvinculacion} onClick={() => setConfirmando(null)}>Cancelar</button>
                    </div>
                  ) : (
                    <button className="pr-link pr-link--danger" onClick={() => setConfirmando(e.idvinculacion)}>Dar de baja</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="pnl-note" style={{ padding: '0 16px 16px' }}>Al dar de baja a un entrenador deja de formar parte de tu staff y no podrás asignarle nuevos entrenamientos; los ya publicados se mantienen. Entrenamientos y alumnos corresponden a los entrenamientos publicados bajo el club en el período elegido. La calificación es el promedio histórico de reseñas recibidas por el entrenador.</p>
    </div>
  )
}

function SeccionSolicitudes({ solicitudes, cargando, error, ocupado, onResponder, onCancelar }) {
  const { recibidas, enviadas } = solicitudes
  return (
    <>
      {error && <p className="pr-error" role="alert">{error}</p>}

      <div className="pnl-table-wrap">
        <h2 className="pnl-block-title" style={{ padding: '20px 16px 0' }}>Entrenadores que solicitan unirse</h2>
        {cargando && recibidas.length === 0 ? (
          <p className="pr-muted" style={{ padding: 20 }}>Cargando solicitudes…</p>
        ) : recibidas.length === 0 ? (
          <p className="pr-muted" style={{ padding: 20 }}>No tenés solicitudes pendientes.</p>
        ) : (
          <table className="pnl-table">
            <thead>
              <tr><th>Entrenador</th><th>Título / experiencia</th><th>Solicitado</th><th /></tr>
            </thead>
            <tbody>
              {recibidas.map((s) => (
                <tr key={s.id}>
                  <td><Persona p={s.entrenadores} /></td>
                  <td>{[s.entrenadores?.titulo, s.entrenadores?.experiencia].filter(Boolean).join(' · ') || '—'}</td>
                  <td className="pnl-date">{fechaLarga(s.fecha_creacion)}</td>
                  <td>
                    <div className="pnl-confirm">
                      <button className="pr-link" disabled={ocupado === s.id} onClick={() => onResponder(s.id, 'ACEPTADO')}>Aceptar</button>
                      <button className="pr-link pr-link--danger" disabled={ocupado === s.id} onClick={() => onResponder(s.id, 'RECHAZADO')}>Rechazar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="pnl-note" style={{ padding: '0 16px 16px' }}>Al aceptar, el entrenador pasa a formar parte de tu staff y podés asignarle entrenamientos. Si rechazás, podrá volver a solicitarlo más adelante.</p>
      </div>

      {enviadas.length > 0 && (
        <div className="pnl-table-wrap">
          <h2 className="pnl-block-title" style={{ padding: '20px 16px 0' }}>Invitaciones enviadas</h2>
          <table className="pnl-table">
            <tbody>
              {enviadas.map((s) => (
                <tr key={s.id}>
                  <td><Persona p={s.entrenadores} /></td>
                  <td><span className="pr-pill pr-pill--warn">Esperando respuesta</span></td>
                  <td className="pnl-date">{fechaLarga(s.fecha_creacion)}</td>
                  <td><button className="pr-link" disabled={ocupado === s.id} onClick={() => onCancelar(s.id)}>Cancelar invitación</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

// Jugadores que los entrenadores del staff le recomendaron al club
function SeccionRecomendados({ recomendaciones, cargando, error, ocupado, onEstado, onInvitar, onMensaje }) {
  const [confirmando, setConfirmando] = useState(null) // id pendiente de descartar

  if (cargando && recomendaciones.length === 0) {
    return <div className="pnl-skeleton" aria-busy="true" aria-label="Cargando recomendaciones" />
  }

  return (
    <>
      {error && <p className="pr-error" role="alert">{error}</p>}
      {recomendaciones.length === 0 ? (
        <div className="pr-empty">
          <h2 className="pr-display pr-empty-title">Todavía no te recomendaron jugadores</h2>
          <p>Los entrenadores vinculados a tu staff pueden recomendarte alumnos de sus entrenamientos.</p>
        </div>
      ) : (
        <>
          <ul className="pnl-people">
            {recomendaciones.map((rec) => {
              const j = rec.jugadores || {}
              const [clase, texto] = ESTADO_RECOMENDACION[rec.estado] || ESTADO_RECOMENDACION.PENDIENTE
              return (
                <li key={rec.id} className="pnl-person pnl-person--sin-check">
                  <AvatarCuadrado persona={j} />
                  <div className="pnl-person-id">
                    <p className="pr-person-name">{j.idusuario ? <Link to={`/perfil/${j.idusuario}`}>{nombreCompleto(j)}</Link> : nombreCompleto(j)}</p>
                    <p className="pr-person-meta">
                      {[j.deportes?.deporte, `recomendado por ${nombreCompleto(rec.entrenadores)}`, rec.entrenamientos?.titulo && `en "${rec.entrenamientos.titulo}"`, fechaLarga(rec.fecha_creacion)].filter(Boolean).join(' · ')}
                    </p>
                    {rec.nota && <p className="pnl-quote">“{rec.nota}”</p>}
                  </div>
                  <span className={`pr-pill ${clase}`}>{texto}</span>
                  <div className="pr-person-actions pnl-person-actions" style={{ gridColumn: '1 / -1', justifyContent: 'flex-start' }}>
                    <button className="pr-link" onClick={() => onInvitar([j])}>Invitar a prueba</button>
                    <button className="pr-link" onClick={() => onMensaje([j])}>Mensaje</button>
                    {rec.estado === 'PENDIENTE' && (
                      confirmando === rec.id ? (
                        <>
                          <button className="pr-link pr-link--danger" disabled={ocupado === rec.id}
                            onClick={async () => { await onEstado(rec, 'DESCARTADA'); setConfirmando(null) }}>
                            {ocupado === rec.id ? 'Procesando…' : 'Confirmar descarte'}
                          </button>
                          <button className="pr-link" disabled={ocupado === rec.id} onClick={() => setConfirmando(null)}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button className="pr-link" disabled={ocupado === rec.id} onClick={() => onEstado(rec, 'CONTACTADO')}>Marcar contactado</button>
                          <button className="pr-link pr-link--danger" disabled={ocupado === rec.id} onClick={() => setConfirmando(rec.id)}>Descartar</button>
                        </>
                      )
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="pnl-note">Al marcar a un jugador como contactado o descartarlo, el entrenador que lo recomendó recibe un aviso. Invitar a una prueba le manda la invitación al jugador.</p>
        </>
      )}
    </>
  )
}

// ── Vista principal ─────────────────────────────────────────────────────────
export default function BackofficeClub({ usuario }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [rango, setRango] = useState('trimestre')
  const [tab, setTab] = useState(() => (TABS.some((t) => t.valor === searchParams.get('tab')) ? searchParams.get('tab') : 'entrenamientos'))
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exportando, setExportando] = useState(false)
  const [recarga, setRecarga] = useState(0)
  const [expandido, setExpandido] = useState(null)

  // Selección múltiple de jugadores (dentro de Entrenamientos / Pruebas)
  const [seleccion, setSeleccion] = useState(() => new Map()) // idusuario → jugador
  const [mensajeA, setMensajeA] = useState(null)
  const [invitarA, setInvitarA] = useState(null)

  // Solicitudes de vinculación (independientes del período elegido)
  const [solicitudes, setSolicitudes] = useState({ recibidas: [], enviadas: [] })
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false)
  const [errorSolicitudes, setErrorSolicitudes] = useState('')
  const [ocupado, setOcupado] = useState(null)
  const [aviso, setAviso] = useState('')

  // Jugadores recomendados por el staff
  const [recomendaciones, setRecomendaciones] = useState([])
  const [cargandoRecomendaciones, setCargandoRecomendaciones] = useState(true)
  const [errorRecomendaciones, setErrorRecomendaciones] = useState('')

  const esClub = String(usuario?.tipousuario || '').toLowerCase() === 'club'
  const autorizado = esClub || usuario?.es_admin === true

  // Se vuelve a pedir al cambiar el período o al llamar a cargar(); descarta respuestas viejas
  useEffect(() => {
    if (!autorizado) return
    let vigente = true
    api.get('/api/clubes/backoffice/estadisticas', { params: { rango } })
      .then((res) => { if (vigente) { setDatos(res.data); setError('') } })
      .catch((err) => { if (vigente) setError(err.response?.data?.error || 'No se pudieron cargar las estadísticas.') })
      .finally(() => { if (vigente) setCargando(false) })
    return () => { vigente = false }
  }, [autorizado, rango, recarga])

  const cargar = () => {
    setCargando(true)
    setError('')
    setRecarga((n) => n + 1)
  }

  const cambiarRango = (valor) => {
    if (valor === rango) return
    setCargando(true)
    setError('')
    setRango(valor)
  }

  const pedirSolicitudes = useCallback(() =>
    api.get('/api/vinculaciones/pendientes')
      .then((res) => { setSolicitudes({ recibidas: res.data?.recibidas || [], enviadas: res.data?.enviadas || [] }); setErrorSolicitudes('') })
      .catch((err) => setErrorSolicitudes(err.response?.data?.error || 'No se pudieron cargar las solicitudes.'))
      .finally(() => setCargandoSolicitudes(false)), [])

  const cargarSolicitudes = () => {
    setCargandoSolicitudes(true)
    return pedirSolicitudes()
  }

  useEffect(() => {
    if (esClub) pedirSolicitudes()
  }, [esClub, pedirSolicitudes])

  const pedirRecomendaciones = useCallback(() =>
    api.get('/api/recomendaciones-club/recibidas')
      .then((res) => { setRecomendaciones(res.data || []); setErrorRecomendaciones('') })
      .catch((err) => setErrorRecomendaciones(err.response?.data?.error || 'No se pudieron cargar las recomendaciones.'))
      .finally(() => setCargandoRecomendaciones(false)), [])

  const cargarRecomendaciones = () => {
    setCargandoRecomendaciones(true)
    return pedirRecomendaciones()
  }

  useEffect(() => {
    if (esClub) pedirRecomendaciones()
  }, [esClub, pedirRecomendaciones])

  const cambiarEstadoRecomendacion = async (rec, estado) => {
    setOcupado(rec.id)
    setErrorRecomendaciones('')
    setAviso('')
    try {
      await api.patch(`/api/recomendaciones-club/${rec.id}`, { estado })
      const nombre = nombreCompleto(rec.jugadores)
      setAviso(estado === 'CONTACTADO' ? `${nombre} quedó como contactado.` : `Descartaste la recomendación de ${nombre}.`)
      await cargarRecomendaciones()
    } catch (err) {
      setErrorRecomendaciones(err.response?.data?.error || 'No se pudo actualizar la recomendación. Intentá de nuevo.')
    } finally {
      setOcupado(null)
    }
  }

  const recomendacionesPendientes = recomendaciones.filter((x) => x.estado === 'PENDIENTE').length

  const accionSolicitud = async (id, accion, mensaje) => {
    setOcupado(id)
    setErrorSolicitudes('')
    setAviso('')
    try {
      await accion()
      setAviso(mensaje)
      // Aceptar cambia el staff vinculado: se refrescan también las métricas
      await Promise.all([cargarSolicitudes(), cargar()])
    } catch (err) {
      setErrorSolicitudes(err.response?.data?.error || 'No se pudo completar la acción. Intentá de nuevo.')
    } finally {
      setOcupado(null)
    }
  }

  const responderSolicitud = (id, estado) =>
    accionSolicitud(
      id,
      () => api.patch(`/api/vinculaciones/${id}/responder`, { estado }),
      estado === 'ACEPTADO' ? 'Entrenador aceptado: ya forma parte de tu staff.' : 'Solicitud rechazada.'
    )

  const darDeBaja = (entrenador) =>
    accionSolicitud(
      entrenador.idvinculacion,
      () => api.delete(`/api/vinculaciones/${entrenador.idvinculacion}`),
      `${nombreCompleto(entrenador)} fue dado de baja de tu staff.`
    )

  const cancelarInvitacion = (id) =>
    accionSolicitud(id, () => api.delete(`/api/vinculaciones/${id}`), 'Invitación cancelada.')

  const exportar = async () => {
    setExportando(true)
    try {
      const res = await api.get('/api/clubes/backoffice/exportar', { params: { rango, tipo: tab }, responseType: 'blob' })
      const disp = res.headers['content-disposition'] || ''
      const nombre = /filename="?([^";]+)"?/.exec(disp)?.[1] || `${tab}-${rango}.csv`
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = nombre
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('No se pudo exportar el archivo. Intentá de nuevo.')
    } finally {
      setExportando(false)
    }
  }

  const cambiarTab = (valor) => {
    setTab(valor)
    setExpandido(null)
    setAviso('')
    setErrorSolicitudes('')
    setErrorRecomendaciones('')
    setSearchParams(valor === 'entrenamientos' ? {} : { tab: valor }, { replace: true })
  }

  const alternarSeleccion = (jugador, idusuario) => {
    setSeleccion((prev) => {
      const next = new Map(prev)
      if (next.has(idusuario)) next.delete(idusuario)
      else next.set(idusuario, jugador)
      return next
    })
  }
  const limpiarSeleccion = () => setSeleccion(new Map())
  const seleccionados = useMemo(() => [...seleccion.values()], [seleccion])

  const accionesFila = { onToggleSeleccion: alternarSeleccion, onMensaje: setMensajeA, onInvitar: setInvitarA }

  if (!usuario) return <Navigate to="/login" replace />
  if (!autorizado) return <Navigate to="/" replace />

  const r = datos?.resumen
  const mostrandoSeleccion = seleccionados.length > 0 && ['entrenamientos', 'pruebas'].includes(tab)

  return (
    <div className="pr pnl">
      <section className="pr-head">
        <div className="pr-wrap pr-head-grid pnl-head-grid">
          <div>
            <h1 className="pr-display pr-title">Panel del club</h1>
            <p className="pr-lead">
              {datos?.club?.nombre ? `${datos.club.nombre} · ` : ''}Métricas de entrenamientos, pruebas y staff técnico.
            </p>
          </div>
          <div className="pr-head-side pnl-head-side">
            <div className="pnl-range" role="group" aria-label="Período">
              {RANGOS.map((o) => (
                <button key={o.valor} className={`pr-chip${rango === o.valor ? ' is-on' : ''}`} aria-pressed={rango === o.valor} onClick={() => cambiarRango(o.valor)}>
                  {o.etiqueta}
                </button>
              ))}
            </div>
            <button className="pr-btn pr-btn--ghost pr-btn--sm" onClick={exportar} disabled={exportando || !datos || TABS_SOLO_CLUB.includes(tab)}>
              {exportando ? 'Exportando…' : 'Exportar CSV'}
            </button>
          </div>
        </div>
      </section>

      <section className="pnl-body">
        <div className="pr-wrap">
          {error && <p className="pr-error pnl-error" role="alert">{error}</p>}

          {!datos && cargando && (
            <div aria-busy="true" aria-label="Cargando estadísticas">
              <div className="pnl-stats">{[0, 1, 2, 3].map((i) => <div key={i} className="pnl-stat pnl-stat--skeleton" />)}</div>
              <div className="pnl-skeleton" />
            </div>
          )}

          {!datos && !cargando && error && (
            <div className="pr-empty">
              <h2 className="pr-display pr-empty-title">No pudimos cargar tu panel</h2>
              <p>Revisá tu conexión y probá de nuevo.</p>
              <button className="pr-btn pr-btn--ink" onClick={cargar}>Reintentar</button>
            </div>
          )}

          {datos && (
            <div className={`pnl-content${cargando ? ' is-loading' : ''}`}>
              <div className="pnl-stats">
                <div className="pnl-stat">
                  <p className="pnl-stat-num">{numero(r.jugadoresUnicos)}</p>
                  <p className="pnl-stat-label">Jugadores alcanzados · {numero(r.entrenamientos.inscriptos + r.pruebas.inscriptos)} inscripciones</p>
                </div>
                <div className="pnl-stat">
                  <p className="pnl-stat-num">{numero(r.entrenamientos.activos)}</p>
                  <p className="pnl-stat-label">Entrenamientos activos · {r.entrenamientos.ocupacionPromedio}% de ocupación</p>
                </div>
                <div className="pnl-stat">
                  <p className="pnl-stat-num">{numero(r.pruebas.activas)}</p>
                  <p className="pnl-stat-label">Pruebas abiertas · {numero(r.pruebas.inscriptos)} postulantes</p>
                </div>
                <div className="pnl-stat">
                  <p className="pnl-stat-num">{numero(r.entrenadoresVinculados)}</p>
                  <p className="pnl-stat-label">{solicitudes.recibidas.length > 0 ? `Staff técnico · ${plural(solicitudes.recibidas.length, 'solicitud pendiente', 'solicitudes pendientes')}` : 'Staff técnico vinculado'}</p>
                </div>
              </div>

              <div className="pnl-tabs" role="tablist">
                {TABS.filter((t) => !TABS_SOLO_CLUB.includes(t.valor) || esClub).map((t) => (
                  <button key={t.valor} role="tab" aria-selected={tab === t.valor} className={`pr-chip${tab === t.valor ? ' is-on' : ''}`} onClick={() => cambiarTab(t.valor)}>
                    {t.etiqueta}
                    {t.valor === 'solicitudes' && solicitudes.recibidas.length > 0 && <span className="pnl-count-badge">{solicitudes.recibidas.length}</span>}
                    {t.valor === 'recomendados' && recomendacionesPendientes > 0 && <span className="pnl-count-badge">{recomendacionesPendientes}</span>}
                  </button>
                ))}
              </div>

              <div role="tabpanel">
                {tab === 'entrenamientos' && (
                  <SeccionEntrenamientos datos={datos} seleccion={seleccion} accionesFila={accionesFila} expandido={expandido} setExpandido={setExpandido} />
                )}
                {tab === 'pruebas' && (
                  <SeccionPruebas datos={datos} seleccion={seleccion} accionesFila={accionesFila} expandido={expandido} setExpandido={setExpandido} />
                )}
                {tab === 'entrenadores' && (
                  <>
                    {aviso && <p className="pr-notice" role="status">{aviso}</p>}
                    <SeccionEntrenadores datos={datos} ocupado={ocupado} onBaja={darDeBaja} error={errorSolicitudes} />
                  </>
                )}
                {tab === 'solicitudes' && esClub && (
                  <>
                    {aviso && <p className="pr-notice" role="status">{aviso}</p>}
                    <SeccionSolicitudes
                      solicitudes={solicitudes}
                      cargando={cargandoSolicitudes}
                      error={errorSolicitudes}
                      ocupado={ocupado}
                      onResponder={responderSolicitud}
                      onCancelar={cancelarInvitacion}
                    />
                  </>
                )}
                {tab === 'recomendados' && esClub && (
                  <>
                    {aviso && <p className="pr-notice" role="status">{aviso}</p>}
                    <SeccionRecomendados
                      recomendaciones={recomendaciones}
                      cargando={cargandoRecomendaciones}
                      error={errorRecomendaciones}
                      ocupado={ocupado}
                      onEstado={cambiarEstadoRecomendacion}
                      onInvitar={setInvitarA}
                      onMensaje={setMensajeA}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {mostrandoSeleccion && createPortal(
        <div className="pnl-selbar" role="region" aria-label="Jugadores seleccionados">
          <p>{plural(seleccionados.length, 'jugador elegido', 'jugadores elegidos')}</p>
          <div className="pnl-selbar-actions">
            <button className="pr-link" onClick={limpiarSeleccion}>Quitar selección</button>
            <button className="pr-btn pr-btn--ghost pr-btn--sm" onClick={() => setMensajeA(seleccionados)}>Mensaje</button>
            <button className="pr-btn pr-btn--sm" onClick={() => setInvitarA(seleccionados)}>Invitar a evento <Flecha /></button>
          </div>
        </div>,
        document.body
      )}

      {mensajeA && (
        <ModalContactoEntrenador entrenadores={mensajeA} onCerrar={() => setMensajeA(null)} onEnviado={limpiarSeleccion} />
      )}
      {invitarA && (
        <ModalInvitarEvento jugadores={invitarA} datos={datos} onCerrar={() => setInvitarA(null)} onEnviado={limpiarSeleccion} />
      )}
    </div>
  )
}
