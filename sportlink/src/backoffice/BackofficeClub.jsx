import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import Avatar from '../components/Avatar.jsx'
import ModalContactoEntrenador from '../entrenamientos/ModalContactoEntrenador.jsx'
import ModalInvitarEvento from './ModalInvitarEvento.jsx'
import './backoffice.css'

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
]

const nombreCompleto = (p) => [p?.nombre, p?.apellido].filter(Boolean).join(' ').trim() || 'Sin asignar'
const formatoNumero = (n) => new Intl.NumberFormat('es-AR').format(n ?? 0)
const formatoDinero = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n ?? 0)
const formatoFecha = (f) => {
  if (!f) return '—'
  const [y, m, d] = String(f).substring(0, 10).split('-')
  return `${d}/${m}/${y}`
}

// ── Piezas visuales ─────────────────────────────────────────────────────────
const Icono = ({ children }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const Kpi = ({ icono, etiqueta, valor, detalle }) => (
  <div className="bo-kpi">
    <div className="bo-kpi-icono">{icono}</div>
    <div>
      <p className="bo-kpi-etiqueta">{etiqueta}</p>
      <p className="bo-kpi-valor">{valor}</p>
      {detalle && <p className="bo-kpi-detalle">{detalle}</p>}
    </div>
  </div>
)

// Barra de ocupación. null = la actividad no tiene cupo definido.
const claseBarra = (pct) => (pct < 40 ? 'bo-barra--baja' : pct >= 80 ? 'bo-barra--alta' : '')

const Barra = ({ pct }) => (
  <div className={`bo-barra ${claseBarra(pct ?? 0)}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct ?? 0}>
    <span style={{ width: `${pct ?? 0}%` }} />
  </div>
)

const MiniBarra = ({ pct }) => (
  <div className="bo-mini-barra">
    <Barra pct={pct} />
    <b>{pct === null ? '—' : `${pct}%`}</b>
  </div>
)

const Estrellas = ({ valor, total }) =>
  valor === null || valor === undefined
    ? <span style={{ color: 'var(--bo-muted)' }}>Sin reseñas</span>
    : <span className="bo-estrellas">★ {valor.toFixed(1)}<small>({total})</small></span>

const BadgeEstado = ({ estado }) => {
  const mapa = { ACTIVO: ['ok', 'Activo'], FINALIZADO: ['off', 'Finalizado'], INACTIVO: ['warn', 'Inactivo'] }
  const [clase, texto] = mapa[estado] || ['off', estado]
  return <span className={`bo-badge bo-badge--${clase}`}>{texto}</span>
}

const Persona = ({ p, size = 32 }) => (
  <div className="bo-celda-persona">
    <Avatar src={p?.fotoperfil} nombre={nombreCompleto(p)} size={size} />
    {p?.idusuario ? <Link to={`/perfil/${p.idusuario}`}>{nombreCompleto(p)}</Link> : <span>{nombreCompleto(p)}</span>}
  </div>
)

// Lista de participantes de una prueba o entrenamiento, mostrada en línea debajo
// de su fila en la tabla (sin navegar a otra vista). `tipo` es 'prueba' | 'entrenamiento'.
// Si se pasa `seleccionando`, se muestra una casilla a la izquierda de cada jugador
// (en vez de sus acciones individuales) para armar una selección múltiple.
function PanelParticipantes({ tipo, id, onInvitar, onMensaje, seleccionando = false, seleccionados, onToggleSeleccion }) {
  const [participantes, setParticipantes] = useState(null) // null = cargando
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    setParticipantes(null)
    setError('')
    const url = tipo === 'prueba' ? '/api/inscripcionesprueba' : '/api/inscripcionesentrenamientos'
    const params = tipo === 'prueba' ? { idprueba: id } : { identrenamiento: id }
    api.get(url, { params })
      .then((res) => { if (vigente) setParticipantes(res.data || []) })
      .catch(() => { if (vigente) setError('No se pudieron cargar los participantes.') })
    return () => { vigente = false }
  }, [tipo, id])

  if (error) return <div className="bo-panel-participantes"><p className="bo-vacio">{error}</p></div>
  if (participantes === null) return <div className="bo-panel-participantes"><p className="bo-vacio">Cargando participantes…</p></div>
  if (participantes.length === 0) return <div className="bo-panel-participantes"><p className="bo-vacio">Todavía no hay nadie anotado.</p></div>

  return (
    <div className="bo-panel-participantes">
      {participantes.map((i) => {
        const j = i.jugador || {}
        return (
          <div key={i.idinscripcionesprueba || i.idinscripcionesentr} className="bo-participante">
            <div className="bo-participante-info">
              {seleccionando && (
                <input
                  type="checkbox"
                  className="bo-checkbox"
                  checked={!!seleccionados?.has(j.idusuario)}
                  onChange={() => onToggleSeleccion(j)}
                  aria-label={`Seleccionar a ${nombreCompleto(j)}`}
                />
              )}
              <Persona p={j} size={32} />
            </div>
            <span className="bo-participante-deporte">{j.deportes?.deporte || ''}</span>
            {!seleccionando && (
              <div className="bo-acciones">
                <button type="button" className="bo-btn" onClick={() => onInvitar([j])}>Invitar a evento</button>
                <button type="button" className="bo-btn" onClick={() => onMensaje([j])}>Mensaje</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Secciones ───────────────────────────────────────────────────────────────
function SeccionEntrenamientos({ datos }) {
  const lista = datos.entrenamientos
  const [expandido, setExpandido] = useState(null)
  const [mensajeA, setMensajeA] = useState(null)
  const [invitarA, setInvitarA] = useState(null)
  if (lista.length === 0) {
    return <div className="bo-card"><p className="bo-vacio">No hay entrenamientos publicados por el club en este período.</p></div>
  }
  const r = datos.resumen.entrenamientos
  return (
    <>
      <div className="bo-grid-2">
        <div className="bo-card">
          <h3 className="bo-card-titulo">Ocupación por entrenamiento</h3>
          <div className="bo-barras">
            {lista.slice(0, 12).map((e) => (
              <div key={e.identrenamientos}>
                <div className="bo-barra-fila-top">
                  <span className="bo-barra-nombre" title={e.titulo}>{e.titulo}</span>
                  <span className="bo-barra-valor">{e.ocupacion === null ? 'Sin cupo' : `${e.inscriptos}/${e.cupo} · ${e.ocupacion}%`}</span>
                </div>
                <Barra pct={e.ocupacion} />
              </div>
            ))}
          </div>
          {lista.length > 12 && <p className="bo-nota">Mostrando los 12 más recientes. La tabla incluye todos.</p>}
        </div>

        <div className="bo-card">
          <h3 className="bo-card-titulo">Resumen</h3>
          <div className="bo-barras">
            <div>
              <div className="bo-barra-fila-top"><span className="bo-barra-nombre">Ocupación promedio</span><span className="bo-barra-valor">{r.ocupacionPromedio}%</span></div>
              <Barra pct={r.ocupacionPromedio} />
            </div>
            <div className="bo-barra-fila-top"><span>Entrenamientos</span><b>{formatoNumero(r.total)}</b></div>
            <div className="bo-barra-fila-top"><span>Inscriptos / cupos ofrecidos</span><b>{formatoNumero(r.inscriptos)} / {formatoNumero(r.cupoTotal)}</b></div>
            <div className="bo-barra-fila-top"><span>En lista de espera</span><b>{formatoNumero(r.listaEspera)}</b></div>
            <div className="bo-barra-fila-top"><span>Ingresos estimados</span><b>{formatoDinero(r.ingresosEstimados)}</b></div>
          </div>
          <p className="bo-nota">Los ingresos se estiman como precio × inscriptos; no reflejan pagos confirmados.</p>
        </div>
      </div>

      <div className="bo-card">
        <h3 className="bo-card-titulo">Detalle de entrenamientos</h3>
        <div className="bo-tabla-wrap">
          <table className="bo-tabla">
            <thead>
              <tr>
                <th>Título</th><th>Entrenador asignado</th><th>Fecha</th>
                <th className="num">Cupos</th><th className="num">Lista de espera</th><th>Ocupación</th><th>Estado</th><th />
              </tr>
            </thead>
            <tbody>
              {lista.map((e) => (
                <Fragment key={e.identrenamientos}>
                  <tr>
                    <td><Link to={`/entrenamientos/${e.identrenamientos}`} style={{ color: 'inherit', fontWeight: 600 }}>{e.titulo}</Link></td>
                    <td>{e.entrenador ? <Persona p={e.entrenador} size={26} /> : '—'}</td>
                    <td>{formatoFecha(e.fechaentr)}</td>
                    <td className="num">{e.cupo > 0 ? `${e.inscriptos} / ${e.cupo}` : e.inscriptos}</td>
                    <td className="num">{e.listaEspera}</td>
                    <td><MiniBarra pct={e.ocupacion} /></td>
                    <td><BadgeEstado estado={e.estado} /></td>
                    <td>
                      <button type="button" className="bo-btn" onClick={() => setExpandido(expandido === e.identrenamientos ? null : e.identrenamientos)}>
                        {expandido === e.identrenamientos ? 'Ocultar' : 'Ver participantes'}
                      </button>
                    </td>
                  </tr>
                  {expandido === e.identrenamientos && (
                    <tr>
                      <td colSpan={8} style={{ padding: 0, border: 'none' }}>
                        <PanelParticipantes tipo="entrenamiento" id={e.identrenamientos} onInvitar={setInvitarA} onMensaje={setMensajeA} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mensajeA && (
        <ModalContactoEntrenador entrenadores={mensajeA} onCerrar={() => setMensajeA(null)} />
      )}
      {invitarA && (
        <ModalInvitarEvento jugadores={invitarA} datos={datos} onCerrar={() => setInvitarA(null)} />
      )}
    </>
  )
}

function SeccionPruebas({ datos }) {
  const [agrupar, setAgrupar] = useState('porCategoria')
  const [expandido, setExpandido] = useState(null)
  const [mensajeA, setMensajeA] = useState(null)
  const [invitarA, setInvitarA] = useState(null)
  const [seleccionando, setSeleccionando] = useState(false)
  const [seleccionados, setSeleccionados] = useState(new Map())
  const [mostrarAcciones, setMostrarAcciones] = useState(false)
  const lista = datos.pruebas
  const r = datos.resumen.pruebas
  if (lista.length === 0) {
    return <div className="bo-card"><p className="bo-vacio">No hay pruebas de selección publicadas por el club en este período.</p></div>
  }
  const abiertas = r.activas
  const cerradas = r.total - r.activas
  const desglose = datos.desglosePruebas[agrupar] || []
  const maxInscriptos = Math.max(1, ...desglose.map((d) => d.inscriptos))

  const toggleSeleccionar = () => {
    setSeleccionando((v) => !v)
    setSeleccionados(new Map())
    setMostrarAcciones(false)
  }

  const toggleSeleccion = (j) => {
    setSeleccionados((prev) => {
      const next = new Map(prev)
      if (next.has(j.idusuario)) next.delete(j.idusuario)
      else next.set(j.idusuario, j)
      return next
    })
  }

  return (
    <>
      <div className="bo-grid-2">
        <div className="bo-card">
          <h3 className="bo-card-titulo">Convocatorias abiertas vs cerradas</h3>
          <div className="bo-apilada" role="img" aria-label={`${abiertas} abiertas y ${cerradas} cerradas`}>
            <span className="a" style={{ width: `${(abiertas / r.total) * 100}%` }} />
            <span className="b" style={{ width: `${(cerradas / r.total) * 100}%` }} />
          </div>
          <div className="bo-leyenda">
            <span><i style={{ background: 'var(--bo-ok)' }} />Abiertas: <b>{abiertas}</b></span>
            <span><i style={{ background: '#5b6b7a' }} />Cerradas o finalizadas: <b>{cerradas}</b></span>
          </div>
          <div className="bo-barras" style={{ marginTop: 20 }}>
            <div className="bo-barra-fila-top"><span>Postulantes / cupos ofrecidos</span><b>{formatoNumero(r.inscriptos)} / {formatoNumero(r.cupoTotal)}</b></div>
            <div className="bo-barra-fila-top"><span>En lista de espera</span><b>{formatoNumero(r.listaEspera)}</b></div>
            <div>
              <div className="bo-barra-fila-top"><span>Ocupación promedio</span><b>{r.ocupacionPromedio}%</b></div>
              <Barra pct={r.ocupacionPromedio} />
            </div>
          </div>
        </div>

        <div className="bo-card">
          <h3 className="bo-card-titulo">
            Postulantes por
            <span className="bo-segmentado">
              {[['porCategoria', 'Categoría'], ['porGenero', 'Género'], ['porDeporte', 'Disciplina']].map(([v, t]) => (
                <button key={v} type="button" aria-pressed={agrupar === v} onClick={() => setAgrupar(v)}>{t}</button>
              ))}
            </span>
          </h3>
          <div className="bo-barras">
            {desglose.map((d) => (
              <div key={d.clave}>
                <div className="bo-barra-fila-top">
                  <span className="bo-barra-nombre" title={d.clave}>{d.clave}</span>
                  <span className="bo-barra-valor">{d.inscriptos} postulantes · {d.pruebas} {d.pruebas === 1 ? 'prueba' : 'pruebas'}</span>
                </div>
                <Barra pct={Math.round((d.inscriptos / maxInscriptos) * 100)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bo-card bo-seleccion-card">
        <div className="bo-seleccion-barra">
          <button type="button" className="bo-btn" aria-pressed={seleccionando} onClick={toggleSeleccionar}>
            Seleccionar
          </button>
          <button type="button" className="bo-btn" aria-expanded={mostrarAcciones} onClick={() => setMostrarAcciones((v) => !v)}>
            Acciones{seleccionados.size > 0 ? ` (${seleccionados.size})` : ''}
          </button>
        </div>
        {mostrarAcciones && (
          <div className="bo-seleccion-acciones">
            {seleccionados.size === 0 ? (
              <p className="bo-nota" style={{ margin: 0 }}>Activá "Seleccionar" y marcá jugadores en los participantes de abajo para habilitar estas acciones.</p>
            ) : (
              <>
                <button type="button" className="bo-btn" onClick={() => setInvitarA(Array.from(seleccionados.values()))}>
                  Invitar a evento
                </button>
                <button type="button" className="bo-btn" onClick={() => setMensajeA(Array.from(seleccionados.values()))}>
                  Mensaje
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="bo-card">
        <h3 className="bo-card-titulo">Detalle de pruebas</h3>
        <div className="bo-tabla-wrap">
          <table className="bo-tabla">
            <thead>
              <tr>
                <th>Disciplina</th><th>Categoría</th><th>Género</th><th>Fecha</th>
                <th className="num">Postulantes</th><th className="num">Lista de espera</th><th>Ocupación</th><th>Estado</th><th />
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <Fragment key={p.idprueba}>
                  <tr>
                    <td>{p.deporte || '—'}</td>
                    <td>{p.categoria || '—'}</td>
                    <td>{p.genero || '—'}</td>
                    <td>{formatoFecha(p.fechaprueba)}</td>
                    <td className="num">{p.cupo > 0 ? `${p.inscriptos} / ${p.cupo}` : p.inscriptos}</td>
                    <td className="num">{p.listaEspera}</td>
                    <td><MiniBarra pct={p.ocupacion} /></td>
                    <td>
                      {p.finalizada
                        ? <span className="bo-badge bo-badge--off">Finalizada</span>
                        : p.abierta
                          ? <span className="bo-badge bo-badge--ok">Abierta</span>
                          : <span className="bo-badge bo-badge--warn">Cerrada</span>}
                    </td>
                    <td>
                      <button type="button" className="bo-btn" onClick={() => setExpandido(expandido === p.idprueba ? null : p.idprueba)}>
                        {expandido === p.idprueba ? 'Ocultar' : 'Ver participantes'}
                      </button>
                    </td>
                  </tr>
                  {expandido === p.idprueba && (
                    <tr>
                      <td colSpan={9} style={{ padding: 0, border: 'none' }}>
                        <PanelParticipantes
                          tipo="prueba"
                          id={p.idprueba}
                          onInvitar={setInvitarA}
                          onMensaje={setMensajeA}
                          seleccionando={seleccionando}
                          seleccionados={seleccionados}
                          onToggleSeleccion={toggleSeleccion}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mensajeA && (
        <ModalContactoEntrenador
          entrenadores={mensajeA}
          onCerrar={() => setMensajeA(null)}
          onEnviado={() => { setSeleccionados(new Map()); setSeleccionando(false); setMostrarAcciones(false) }}
        />
      )}
      {invitarA && (
        <ModalInvitarEvento
          jugadores={invitarA}
          datos={datos}
          onCerrar={() => setInvitarA(null)}
          onEnviado={() => { setSeleccionados(new Map()); setSeleccionando(false); setMostrarAcciones(false) }}
        />
      )}
    </>
  )
}

function SeccionEntrenadores({ datos, ocupado, onBaja, error }) {
  const lista = datos.entrenadores
  const [confirmando, setConfirmando] = useState(null) // idvinculacion pendiente de confirmar
  return (
    <div className="bo-card">
      <h3 className="bo-card-titulo">Staff técnico vinculado</h3>
      {error && <div className="bo-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}
      {lista.length === 0 ? (
        <p className="bo-vacio">Todavía no tenés entrenadores vinculados. Podés invitarlos desde tu perfil.</p>
      ) : (
        <div className="bo-tabla-wrap">
          <table className="bo-tabla">
            <thead>
              <tr>
                <th>Entrenador</th><th>Disciplinas</th>
                <th className="num">Entrenamientos</th><th className="num">Alumnos atendidos</th><th>Calificación</th><th />
              </tr>
            </thead>
            <tbody>
              {lista.map((e) => (
                <tr key={e.identrenador}>
                  <td><Persona p={e} size={36} /></td>
                  <td>{e.deportes.length ? e.deportes.join(', ') : '—'}</td>
                  <td className="num">{e.entrenamientos}</td>
                  <td className="num">{e.alumnos}</td>
                  <td><Estrellas valor={e.calificacion} total={e.totalResenias} /></td>
                  <td>
                    {confirmando === e.idvinculacion ? (
                      <div className="bo-acciones">
                        <button type="button" className="bo-btn bo-btn--danger" disabled={ocupado === e.idvinculacion}
                          onClick={async () => { await onBaja(e); setConfirmando(null) }}>
                          {ocupado === e.idvinculacion ? 'Procesando…' : 'Confirmar baja'}
                        </button>
                        <button type="button" className="bo-btn" disabled={ocupado === e.idvinculacion} onClick={() => setConfirmando(null)}>
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="bo-btn bo-btn--danger" onClick={() => setConfirmando(e.idvinculacion)}>
                        Dar de baja
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="bo-nota">Al dar de baja a un entrenador deja de formar parte de tu staff y no podrás asignarle nuevos entrenamientos; los ya publicados se mantienen. Entrenamientos y alumnos corresponden a los entrenamientos publicados bajo el club en el período elegido. La calificación es el promedio histórico de reseñas recibidas por el entrenador.</p>
    </div>
  )
}

function SeccionSolicitudes({ solicitudes, cargando, error, ocupado, onResponder, onCancelar }) {
  const { recibidas, enviadas } = solicitudes
  return (
    <>
      {error && <div className="bo-error" role="alert">{error}</div>}

      <div className="bo-card">
        <h3 className="bo-card-titulo">Entrenadores que solicitan unirse</h3>
        {cargando && recibidas.length === 0 ? (
          <p className="bo-vacio">Cargando solicitudes…</p>
        ) : recibidas.length === 0 ? (
          <p className="bo-vacio">No tenés solicitudes pendientes.</p>
        ) : (
          <div className="bo-tabla-wrap">
            <table className="bo-tabla">
              <thead>
                <tr><th>Entrenador</th><th>Título / experiencia</th><th>Solicitado</th><th /></tr>
              </thead>
              <tbody>
                {recibidas.map((s) => (
                  <tr key={s.id}>
                    <td><Persona p={s.entrenadores} size={36} /></td>
                    <td>{[s.entrenadores?.titulo, s.entrenadores?.experiencia].filter(Boolean).join(' · ') || '—'}</td>
                    <td>{formatoFecha(s.fecha_creacion)}</td>
                    <td>
                      <div className="bo-acciones">
                        <button type="button" className="bo-btn bo-btn--ok" disabled={ocupado === s.id} onClick={() => onResponder(s.id, 'ACEPTADO')}>
                          Aceptar
                        </button>
                        <button type="button" className="bo-btn bo-btn--danger" disabled={ocupado === s.id} onClick={() => onResponder(s.id, 'RECHAZADO')}>
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="bo-nota">Al aceptar, el entrenador pasa a formar parte de tu staff y podés asignarle entrenamientos. Si rechazás, podrá volver a solicitarlo más adelante.</p>
      </div>

      {enviadas.length > 0 && (
        <div className="bo-card">
          <h3 className="bo-card-titulo">Invitaciones enviadas</h3>
          <div className="bo-tabla-wrap">
            <table className="bo-tabla">
              <tbody>
                {enviadas.map((s) => (
                  <tr key={s.id}>
                    <td><Persona p={s.entrenadores} size={32} /></td>
                    <td><span className="bo-badge bo-badge--warn">Esperando respuesta</span></td>
                    <td>{formatoFecha(s.fecha_creacion)}</td>
                    <td>
                      <button type="button" className="bo-btn" disabled={ocupado === s.id} onClick={() => onCancelar(s.id)}>
                        Cancelar invitación
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

// ── Vista principal ─────────────────────────────────────────────────────────
export default function BackofficeClub({ usuario }) {
  const [rango, setRango] = useState('trimestre')
  const [tab, setTab] = useState('entrenamientos')
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exportando, setExportando] = useState(false)
  const pedido = useRef(0)

  // Solicitudes de vinculación (independientes del período elegido)
  const [solicitudes, setSolicitudes] = useState({ recibidas: [], enviadas: [] })
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false)
  const [errorSolicitudes, setErrorSolicitudes] = useState('')
  const [ocupado, setOcupado] = useState(null)
  const [aviso, setAviso] = useState('')

  const esClub = String(usuario?.tipousuario || '').toLowerCase() === 'club'
  const autorizado = esClub || usuario?.es_admin === true

  const cargar = useCallback(async () => {
    const id = ++pedido.current
    setCargando(true)
    setError('')
    try {
      const res = await api.get('/api/clubes/backoffice/estadisticas', { params: { rango } })
      if (id === pedido.current) setDatos(res.data)
    } catch (err) {
      if (id === pedido.current) setError(err.response?.data?.error || 'No se pudieron cargar las estadísticas.')
    } finally {
      if (id === pedido.current) setCargando(false)
    }
  }, [rango])

  useEffect(() => {
    if (autorizado) cargar()
  }, [autorizado, cargar])

  const cargarSolicitudes = useCallback(async () => {
    setCargandoSolicitudes(true)
    try {
      const res = await api.get('/api/vinculaciones/pendientes')
      setSolicitudes({ recibidas: res.data?.recibidas || [], enviadas: res.data?.enviadas || [] })
      setErrorSolicitudes('')
    } catch (err) {
      setErrorSolicitudes(err.response?.data?.error || 'No se pudieron cargar las solicitudes.')
    } finally {
      setCargandoSolicitudes(false)
    }
  }, [])

  useEffect(() => {
    if (esClub) cargarSolicitudes()
  }, [esClub, cargarSolicitudes])

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

  if (!usuario) return <Navigate to="/login" replace />
  if (!autorizado) return <Navigate to="/" replace />

  const r = datos?.resumen
  return (
    <div className="bo-root">
      <div className="bo-container">
        <div className="bo-header">
          <div>
            <h1 className="bo-titulo">Panel del club</h1>
            <p className="bo-subtitulo">
              {datos?.club?.nombre ? `${datos.club.nombre} · ` : ''}Métricas de entrenamientos, pruebas y staff técnico
            </p>
          </div>
          <div className="bo-controles">
            <div className="bo-segmentado" role="group" aria-label="Período">
              {RANGOS.map((o) => (
                <button key={o.valor} type="button" aria-pressed={rango === o.valor} onClick={() => setRango(o.valor)}>{o.etiqueta}</button>
              ))}
            </div>
            <button type="button" className="bo-btn" onClick={exportar} disabled={exportando || !datos}>
              {exportando ? 'Exportando…' : 'Exportar CSV'}
            </button>
          </div>
        </div>

        {error && <div className="bo-error" role="alert">{error}</div>}

        {!datos && cargando && (
          <>
            <div className="bo-kpis">{[0, 1, 2, 3].map((i) => <div key={i} className="bo-skeleton" style={{ height: 110 }} />)}</div>
            <div className="bo-skeleton" style={{ height: 320 }} />
          </>
        )}

        {datos && (
          <div style={{ opacity: cargando ? 0.6 : 1, transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="bo-kpis">
              <Kpi
                icono={<Icono><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icono>}
                etiqueta="Jugadores alcanzados"
                valor={formatoNumero(r.jugadoresUnicos)}
                detalle={`${formatoNumero(r.entrenamientos.inscriptos + r.pruebas.inscriptos)} inscripciones en total`}
              />
              <Kpi
                icono={<Icono><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icono>}
                etiqueta="Entrenamientos activos"
                valor={formatoNumero(r.entrenamientos.activos)}
                detalle={`${r.entrenamientos.ocupacionPromedio}% de ocupación promedio`}
              />
              <Kpi
                icono={<Icono><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></Icono>}
                etiqueta="Pruebas de selección"
                valor={formatoNumero(r.pruebas.activas)}
                detalle={`${formatoNumero(r.pruebas.inscriptos)} postulantes · ${r.pruebas.finalizadas} finalizadas`}
              />
              <Kpi
                icono={<Icono><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></Icono>}
                etiqueta="Staff técnico"
                valor={formatoNumero(r.entrenadoresVinculados)}
                detalle={solicitudes.recibidas.length > 0 ? `${solicitudes.recibidas.length} solicitud(es) pendiente(s)` : 'Entrenadores vinculados'}
              />
            </div>

            <div className="bo-tabs" role="tablist">
              {TABS.filter((t) => t.valor !== 'solicitudes' || esClub).map((t) => (
                <button key={t.valor} type="button" role="tab" className="bo-tab" aria-selected={tab === t.valor} onClick={() => { setTab(t.valor); setAviso(''); setErrorSolicitudes('') }}>
                  {t.etiqueta}
                  {t.valor === 'solicitudes' && solicitudes.recibidas.length > 0 && (
                    <span className="bo-contador">{solicitudes.recibidas.length}</span>
                  )}
                </button>
              ))}
            </div>

            {tab === 'entrenamientos' && <SeccionEntrenamientos datos={datos} />}
            {tab === 'pruebas' && <SeccionPruebas datos={datos} />}
            {tab === 'entrenadores' && (
              <>
                {aviso && <div className="bo-aviso" role="status">{aviso}</div>}
                <SeccionEntrenadores datos={datos} ocupado={ocupado} onBaja={darDeBaja} error={errorSolicitudes} />
              </>
            )}
            {tab === 'solicitudes' && esClub && (
              <>
                {aviso && <div className="bo-aviso" role="status">{aviso}</div>}
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
          </div>
        )}
      </div>
    </div>
  )
}
