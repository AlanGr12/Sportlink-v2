import { Fragment, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../axiosConfig.js'
import Footer from '../footer/footer.jsx'
import { normalizeAvatarUrl } from '../components/Avatar.jsx'
import ModalContactoEntrenador from '../entrenamientos/ModalContactoEntrenador.jsx'
import ModalInvitarEvento from '../backoffice/ModalInvitarEvento.jsx'
import ModalRecomendar from './ModalRecomendar.jsx'
import { iniciales, fechaLarga } from '../utils/formato.js'
import '../pruebas/PruebasView.css'
import '../components/panel/PanelGestion.css'

const RANGOS = [
  { valor: 'mes', etiqueta: 'Último mes' },
  { valor: 'trimestre', etiqueta: 'Últimos 3 meses' },
  { valor: 'historico', etiqueta: 'Histórico' },
]

const TABS = [
  { valor: 'entrenamientos', etiqueta: 'Entrenamientos' },
  { valor: 'alumnos', etiqueta: 'Alumnos' },
  { valor: 'recomendaciones', etiqueta: 'Recomendaciones' },
]

const ESTADO_ENTRENAMIENTO = {
  ACTIVO: ['pr-pill--open', 'Activo'],
  FINALIZADO: ['pnl-pill--off', 'Finalizado'],
  INACTIVO: ['pr-pill--warn', 'Inactivo'],
}

const ESTADO_RECOMENDACION = {
  PENDIENTE: ['pr-pill--open', 'Pendiente'],
  CONTACTADO: ['pr-pill--ok', 'Contactado'],
  DESCARTADA: ['pnl-pill--off', 'Descartada'],
}

const nombreCompleto = (p) => [p?.nombre, p?.apellido].filter(Boolean).join(' ').trim() || 'Sin nombre'
const numero = (n) => new Intl.NumberFormat('es-AR').format(n ?? 0)
const dinero = (n) => `$ ${numero(n)}`
const plural = (n, uno, varios) => `${numero(n)} ${n === 1 ? uno : varios}`

const Flecha = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="square" />
  </svg>
)

const AvatarCuadrado = ({ persona }) => {
  const foto = normalizeAvatarUrl(persona?.fotoperfil)
  return (
    <span className="pr-avatar" aria-hidden="true">
      {foto ? <img src={foto} alt="" /> : iniciales(nombreCompleto(persona))}
    </span>
  )
}

// `relativa`: la barra compara contra el máximo (no es un cupo), así que nunca se marca como llena
const BarraOcupacion = ({ pct, relativa = false }) => (
  <div className="pr-cupos-barra" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct ?? 0}>
    <i className={!relativa && pct >= 100 ? 'is-full' : ''} style={{ width: `${pct ?? 0}%` }} />
  </div>
)

// Fila de un alumno: casilla para la selección múltiple + acciones individuales
function FilaAlumno({ alumno, meta, seleccionado, onToggle, onMensaje, onInvitar, onRecomendar, puedeRecomendar }) {
  return (
    <li className={`pnl-person${seleccionado ? ' is-selected' : ''}`}>
      <input
        type="checkbox"
        className="pnl-check"
        checked={seleccionado}
        onChange={() => onToggle(alumno)}
        aria-label={`Seleccionar a ${nombreCompleto(alumno)}`}
      />
      <AvatarCuadrado persona={alumno} />
      <div className="pnl-person-id">
        <p className="pr-person-name">
          {alumno.idusuario ? <Link to={`/perfil/${alumno.idusuario}`}>{nombreCompleto(alumno)}</Link> : nombreCompleto(alumno)}
        </p>
        <p className="pr-person-meta">{meta}</p>
      </div>
      <div className="pr-person-actions pnl-person-actions">
        <button className="pr-link" onClick={() => onMensaje([alumno])}>Mensaje</button>
        <button className="pr-link" onClick={() => onInvitar([alumno])}>Invitar</button>
        {alumno.recomendado ? (
          <span className="pnl-done">Recomendado</span>
        ) : (
          <button className="pr-link" onClick={() => onRecomendar([alumno])} disabled={!puedeRecomendar}
            title={puedeRecomendar ? undefined : 'Necesitás estar vinculado a un club'}>
            Recomendar
          </button>
        )}
      </div>
    </li>
  )
}

export default function PanelEntrenador({ usuario }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabInicial = TABS.some((t) => t.valor === searchParams.get('tab')) ? searchParams.get('tab') : 'entrenamientos'

  const [rango, setRango] = useState('trimestre')
  const [tab, setTab] = useState(tabInicial)
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [exportando, setExportando] = useState(false)
  const [recarga, setRecarga] = useState(0)

  const [expandido, setExpandido] = useState(null)
  const [seleccion, setSeleccion] = useState(() => new Map()) // idjugador → alumno
  const [mensajeA, setMensajeA] = useState(null)
  const [invitarA, setInvitarA] = useState(null)
  const [recomendarA, setRecomendarA] = useState(null) // { jugadores, identrenamiento }
  const [toast, setToast] = useState(null)

  const [enviadas, setEnviadas] = useState(null) // null = sin cargar
  const [errorEnviadas, setErrorEnviadas] = useState('')

  const esEntrenador = String(usuario?.tipousuario || '').toLowerCase() === 'entrenador'
  const autorizado = esEntrenador || usuario?.es_admin === true

  // Se vuelve a pedir al cambiar el período o al llamar a cargar(); descarta respuestas viejas
  useEffect(() => {
    if (!autorizado) return
    let vigente = true
    api.get('/api/entrenadores/panel/estadisticas', { params: { rango } })
      .then((res) => { if (vigente) { setDatos(res.data); setError('') } })
      .catch((err) => { if (vigente) setError(err.response?.data?.error || 'No se pudieron cargar tus estadísticas.') })
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

  // Las recomendaciones enviadas se piden recién al abrir su pestaña (null = sin cargar)
  useEffect(() => {
    if (!esEntrenador || tab !== 'recomendaciones' || enviadas !== null) return
    let vigente = true
    api.get('/api/recomendaciones-club/enviadas')
      .then((res) => { if (vigente) { setEnviadas(res.data || []); setErrorEnviadas('') } })
      .catch((err) => {
        if (!vigente) return
        setEnviadas([])
        setErrorEnviadas(err.response?.data?.error || 'No se pudieron cargar tus recomendaciones.')
      })
    return () => { vigente = false }
  }, [esEntrenador, tab, enviadas])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(t)
  }, [toast])

  const alumnosPorId = useMemo(() => new Map((datos?.alumnos || []).map((a) => [a.idjugador, a])), [datos])

  const cambiarTab = (valor) => {
    setTab(valor)
    setSearchParams(valor === 'entrenamientos' ? {} : { tab: valor }, { replace: true })
  }

  const alternarSeleccion = (alumno) => {
    setSeleccion((prev) => {
      const next = new Map(prev)
      if (next.has(alumno.idjugador)) next.delete(alumno.idjugador)
      else next.set(alumno.idjugador, alumno)
      return next
    })
  }

  const limpiarSeleccion = () => setSeleccion(new Map())

  const exportar = async () => {
    setExportando(true)
    const tipo = tab === 'alumnos' ? 'alumnos' : 'entrenamientos'
    try {
      const res = await api.get('/api/entrenadores/panel/exportar', { params: { rango, tipo }, responseType: 'blob' })
      const disp = res.headers['content-disposition'] || ''
      const nombre = /filename="?([^";]+)"?/.exec(disp)?.[1] || `${tipo}-${rango}.csv`
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = nombre
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('No se pudo exportar el archivo. Probá de nuevo.')
    } finally {
      setExportando(false)
    }
  }

  const alRecomendar = (resultado) => {
    const n = resultado?.creadas || 0
    const omitidas = resultado?.omitidas || 0
    setRecomendarA(null)
    limpiarSeleccion()
    setToast({
      titulo: n > 0 ? `Recomendaste ${plural(n, 'jugador', 'jugadores')} a ${resultado.club?.nombre || 'tu club'}` : 'No hubo recomendaciones nuevas',
      texto: omitidas > 0
        ? `${plural(omitidas, 'ya estaba recomendado o no pasó', 'ya estaban recomendados o no pasaron')} por tus entrenamientos.`
        : 'Te avisamos cuando el club los revise.',
    })
    setEnviadas(null) // se recarga al abrir la pestaña
    cargar()
  }

  if (!usuario) return <Navigate to="/login" replace />
  if (!autorizado) return <Navigate to="/" replace />

  const r = datos?.resumen
  const club = datos?.club
  const puedeRecomendar = esEntrenador && !!club
  const seleccionados = [...seleccion.values()]
  const datosInvitar = { pruebas: [], entrenamientos: datos?.entrenamientos || [] }

  const accionesFila = {
    onToggle: alternarSeleccion,
    onMensaje: setMensajeA,
    onInvitar: setInvitarA,
    onRecomendar: (jugadores) => setRecomendarA({ jugadores, identrenamiento: null }),
    puedeRecomendar,
  }

  // ── Pestaña Entrenamientos ────────────────────────────────────────────────
  const renderEntrenamientos = () => {
    const lista = datos.entrenamientos
    if (lista.length === 0) {
      return (
        <div className="pr-empty">
          <h2 className="pr-display pr-empty-title">Todavía no hay entrenamientos</h2>
          <p>{rango === 'historico' ? 'Cuando publiques tu primer entrenamiento vas a ver acá cómo se llena.' : 'No publicaste entrenamientos en este período. Probá con el histórico.'}</p>
          {rango === 'historico'
            ? <button className="pr-btn" onClick={() => navigate('/entrenamientos')}>Crear entrenamiento <Flecha /></button>
            : <button className="pr-btn pr-btn--ink" onClick={() => cambiarRango('historico')}>Ver histórico</button>}
        </div>
      )
    }
    const maxDeporte = Math.max(1, ...datos.porDeporte.map((d) => d.inscriptos))
    return (
      <>
        <div className="pnl-split">
          <div className="pnl-block">
            <h2 className="pnl-block-title">Ocupación por entrenamiento</h2>
            <ul className="pnl-bars">
              {lista.slice(0, 8).map((e) => (
                <li key={e.identrenamientos} className="pr-cupos">
                  <p className="pr-cupos-texto">
                    <span className="pnl-bar-name">{e.titulo}</span>
                    <span>{e.ocupacion === null ? `${e.inscriptos} anotados · sin cupo` : `${e.inscriptos} de ${e.cupo} · ${e.ocupacion}%`}</span>
                  </p>
                  <BarraOcupacion pct={e.ocupacion} />
                </li>
              ))}
            </ul>
            {lista.length > 8 && <p className="pnl-note">Mostramos los 8 más recientes. La tabla de abajo tiene todos.</p>}
          </div>

          <div className="pnl-block">
            <h2 className="pnl-block-title">Por deporte</h2>
            <ul className="pnl-bars">
              {datos.porDeporte.map((d) => (
                <li key={d.clave} className="pr-cupos">
                  <p className="pr-cupos-texto">
                    <span className="pnl-bar-name">{d.clave}</span>
                    <span>{plural(d.inscriptos, 'inscripto', 'inscriptos')} · {plural(d.entrenamientos, 'entrenamiento', 'entrenamientos')}</span>
                  </p>
                  <BarraOcupacion pct={Math.round((d.inscriptos / maxDeporte) * 100)} relativa />
                </li>
              ))}
            </ul>
            <dl className="pr-facts pnl-facts">
              <div><dt>Inscriptos / cupos</dt><dd>{numero(r.inscriptos)} / {numero(r.cupoTotal)}</dd></div>
              <div><dt>En lista de espera</dt><dd>{numero(r.listaEspera)}</dd></div>
              <div><dt>Finalizados</dt><dd>{numero(r.finalizados)}</dd></div>
              <div><dt>Alumnos que repiten</dt><dd>{numero(r.alumnosQueRepiten)}</dd></div>
            </dl>
          </div>
        </div>

        <div className="pnl-table-wrap">
          <table className="pnl-table">
            <thead>
              <tr>
                <th>Entrenamiento</th><th>Fecha</th><th className="num">Inscriptos</th>
                <th className="num">Espera</th><th>Ocupación</th><th className="num">Ingresos est.</th><th>Estado</th><th />
              </tr>
            </thead>
            <tbody>
              {lista.map((e) => {
                const abierto = expandido === e.identrenamientos
                const [clase, texto] = ESTADO_ENTRENAMIENTO[e.estado] || ESTADO_ENTRENAMIENTO.ACTIVO
                const inscriptos = e.idsAlumnos.map((id) => alumnosPorId.get(id)).filter(Boolean)
                return (
                  <Fragment key={e.identrenamientos}>
                    <tr className={abierto ? 'is-open' : ''}>
                      <td>
                        <Link className="pnl-table-title" to={`/entrenamientos/${e.identrenamientos}`}>{e.titulo}</Link>
                        <span className="pnl-table-sub">{[e.deporte, e.club?.nombre].filter(Boolean).join(' · ')}</span>
                      </td>
                      <td className="pnl-date">{fechaLarga(e.fechaentr, e.horainicio, e.horafin)}</td>
                      <td className="num">{e.cupo > 0 ? `${e.inscriptos} / ${e.cupo}` : e.inscriptos}</td>
                      <td className="num">{e.listaEspera}</td>
                      <td>
                        <div className="pnl-mini">
                          <BarraOcupacion pct={e.ocupacion} />
                          <b>{e.ocupacion === null ? '—' : `${e.ocupacion}%`}</b>
                        </div>
                      </td>
                      <td className="num">{dinero(e.ingresosEstimados)}</td>
                      <td><span className={`pr-pill ${clase}`}>{texto}</span></td>
                      <td>
                        <button className="pr-link" onClick={() => setExpandido(abierto ? null : e.identrenamientos)} aria-expanded={abierto}>
                          {abierto ? 'Ocultar' : 'Inscriptos'}
                        </button>
                      </td>
                    </tr>
                    {abierto && (
                      <tr className="pnl-row-detail">
                        <td colSpan={8}>
                          {inscriptos.length === 0 ? (
                            <p className="pr-muted">Todavía no se anotó nadie.</p>
                          ) : (
                            <>
                              <div className="pnl-detail-head">
                                <p className="pr-muted">{plural(inscriptos.length, 'inscripto', 'inscriptos')}</p>
                                {puedeRecomendar && (
                                  <button className="pr-link" onClick={() => setRecomendarA({ jugadores: inscriptos.filter((a) => !a.recomendado), identrenamiento: e.identrenamientos })}
                                    disabled={inscriptos.every((a) => a.recomendado)}>
                                    Recomendar a todos al club
                                  </button>
                                )}
                              </div>
                              <ul className="pnl-people">
                                {inscriptos.map((a) => (
                                  <FilaAlumno
                                    key={a.idjugador}
                                    alumno={a}
                                    meta={[a.deporte, plural(a.entrenamientos, 'entrenamiento con vos', 'entrenamientos con vos')].filter(Boolean).join(' · ')}
                                    seleccionado={seleccion.has(a.idjugador)}
                                    {...accionesFila}
                                    onRecomendar={(jugadores) => setRecomendarA({ jugadores, identrenamiento: e.identrenamientos })}
                                  />
                                ))}
                              </ul>
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="pnl-note">Los ingresos se estiman como precio × inscriptos; no reflejan pagos confirmados.</p>
      </>
    )
  }

  // ── Pestaña Alumnos ───────────────────────────────────────────────────────
  const renderAlumnos = () => {
    const lista = datos.alumnos
    if (lista.length === 0) {
      return (
        <div className="pr-empty">
          <h2 className="pr-display pr-empty-title">Todavía no tenés alumnos</h2>
          <p>Cuando alguien se anote a tus entrenamientos, lo vas a ver acá con cuántas veces vino.</p>
        </div>
      )
    }
    return (
      <>
        <p className="pr-count">
          {plural(lista.length, 'alumno', 'alumnos')} · {plural(r.alumnosQueRepiten, 'repite', 'repiten')}. Los que más vienen aparecen primero.
        </p>
        <ul className="pnl-people">
          {lista.map((a) => (
            <FilaAlumno
              key={a.idjugador}
              alumno={a}
              meta={[
                a.deporte,
                plural(a.entrenamientos, 'entrenamiento', 'entrenamientos'),
                a.ultimoEntrenamiento ? `último: ${fechaLarga(a.ultimoEntrenamiento).toLowerCase()}` : null,
              ].filter(Boolean).join(' · ')}
              seleccionado={seleccion.has(a.idjugador)}
              {...accionesFila}
            />
          ))}
        </ul>
      </>
    )
  }

  // ── Pestaña Recomendaciones ───────────────────────────────────────────────
  const renderRecomendaciones = () => {
    if (enviadas === null) {
      return <div className="pnl-skeleton" aria-busy="true" aria-label="Cargando recomendaciones" />
    }
    return (
      <>
        {errorEnviadas && <p className="pr-error" role="alert">{errorEnviadas}</p>}
        {enviadas.length === 0 ? (
          <div className="pr-empty">
            <h2 className="pr-display pr-empty-title">Todavía no recomendaste a nadie</h2>
            <p>
              {puedeRecomendar
                ? `Elegí alumnos en la pestaña Alumnos o desde los inscriptos de un entrenamiento y recomendalos a ${club.nombre}.`
                : 'Para recomendar jugadores primero tenés que estar vinculado a un club.'}
            </p>
            {puedeRecomendar
              ? <button className="pr-btn pr-btn--ink" onClick={() => cambiarTab('alumnos')}>Ver mis alumnos</button>
              : <button className="pr-btn pr-btn--ink" onClick={() => navigate('/clubes')}>Ver clubes</button>}
          </div>
        ) : (
          <>
            <p className="pr-count">
              {plural(enviadas.length, 'recomendación', 'recomendaciones')} · {plural(enviadas.filter((x) => x.estado === 'CONTACTADO').length, 'contactado por el club', 'contactados por el club')}
            </p>
            <ul className="pnl-people">
              {enviadas.map((rec) => {
                const [clase, texto] = ESTADO_RECOMENDACION[rec.estado] || ESTADO_RECOMENDACION.PENDIENTE
                const j = rec.jugadores
                return (
                  <li key={rec.id} className="pnl-person pnl-person--sin-check">
                    <AvatarCuadrado persona={j} />
                    <div className="pnl-person-id">
                      <p className="pr-person-name">
                        {j?.idusuario ? <Link to={`/perfil/${j.idusuario}`}>{nombreCompleto(j)}</Link> : nombreCompleto(j)}
                      </p>
                      <p className="pr-person-meta">
                        {[rec.clubes?.nombre, rec.entrenamientos?.titulo, fechaLarga(rec.fecha_creacion)].filter(Boolean).join(' · ')}
                      </p>
                      {rec.nota && <p className="pnl-quote">“{rec.nota}”</p>}
                    </div>
                    <span className={`pr-pill ${clase}`}>{texto}</span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </>
    )
  }

  return (
    <div className="pr pnl">
      {/* ── Encabezado ── */}
      <section className="pr-head">
        <div className="pr-wrap pr-head-grid pnl-head-grid">
          <div>
            <h1 className="pr-display pr-title">Tu panel</h1>
            <p className="pr-lead">Cómo vienen tus entrenamientos y quiénes son tus alumnos.</p>
          </div>
          <div className="pr-head-side pnl-head-side">
            <div className="pnl-range" role="group" aria-label="Período">
              {RANGOS.map((o) => (
                <button key={o.valor} className={`pr-chip${rango === o.valor ? ' is-on' : ''}`} aria-pressed={rango === o.valor} onClick={() => cambiarRango(o.valor)}>
                  {o.etiqueta}
                </button>
              ))}
            </div>
            <button className="pr-btn pr-btn--ghost pr-btn--sm" onClick={exportar} disabled={exportando || !datos || tab === 'recomendaciones'}>
              {exportando ? 'Exportando…' : `Exportar ${tab === 'alumnos' ? 'alumnos' : 'entrenamientos'} (CSV)`}
            </button>
          </div>
        </div>
      </section>

      <section className="pnl-body">
        <div className="pr-wrap">
          {error && <p className="pr-error pnl-error" role="alert">{error}</p>}

          {!datos && cargando && (
            <div aria-busy="true" aria-label="Cargando estadísticas">
              <div className="pnl-stats">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="pnl-stat pnl-stat--skeleton" />)}</div>
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
                  <p className="pnl-stat-num">{numero(r.alumnosUnicos)}</p>
                  <p className="pnl-stat-label">Alumnos · {numero(r.inscriptos)} inscripciones</p>
                </div>
                <div className="pnl-stat">
                  <p className="pnl-stat-num">{numero(r.activos)}</p>
                  <p className="pnl-stat-label">Entrenamientos activos de {numero(r.total)}</p>
                </div>
                <div className="pnl-stat">
                  <p className="pnl-stat-num">{r.ocupacionPromedio}%</p>
                  <p className="pnl-stat-label">Ocupación promedio</p>
                </div>
                <div className="pnl-stat">
                  <p className="pnl-stat-num">{dinero(r.ingresosEstimados)}</p>
                  <p className="pnl-stat-label">Ingresos estimados</p>
                </div>
                <div className="pnl-stat">
                  <p className="pnl-stat-num">{r.calificacion === null ? '—' : `★ ${r.calificacion.toLocaleString('es-AR')}`}</p>
                  <p className="pnl-stat-label">{r.totalResenias > 0 ? plural(r.totalResenias, 'reseña', 'reseñas') : 'Sin reseñas todavía'}</p>
                </div>
              </div>

              {esEntrenador && (
                <p className="pr-notice">
                  {club ? (
                    <>Recomendás jugadores a <strong className="pnl-strong">{club.nombre}</strong>, el club con el que trabajás.</>
                  ) : (
                    <>Vinculate con un club para poder recomendarle tus alumnos. · <Link className="pr-link" to="/clubes">Ver clubes</Link></>
                  )}
                </p>
              )}

              <div className="pnl-tabs" role="tablist" aria-label="Secciones del panel">
                {TABS.map((t) => (
                  <button key={t.valor} role="tab" aria-selected={tab === t.valor} className={`pr-chip${tab === t.valor ? ' is-on' : ''}`} onClick={() => cambiarTab(t.valor)}>
                    {t.etiqueta}
                    {t.valor === 'alumnos' && ` · ${numero(datos.alumnos.length)}`}
                  </button>
                ))}
              </div>

              <div role="tabpanel">
                {tab === 'entrenamientos' && renderEntrenamientos()}
                {tab === 'alumnos' && renderAlumnos()}
                {tab === 'recomendaciones' && renderRecomendaciones()}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* ── Barra de selección ── */}
      {seleccionados.length > 0 && tab !== 'recomendaciones' && createPortal(
        <div className="pnl-selbar" role="region" aria-label="Alumnos seleccionados">
          <p>{plural(seleccionados.length, 'alumno elegido', 'alumnos elegidos')}</p>
          <div className="pnl-selbar-actions">
            <button className="pr-link" onClick={limpiarSeleccion}>Quitar selección</button>
            <button className="pr-btn pr-btn--ghost pr-btn--sm" onClick={() => setMensajeA(seleccionados)}>Mensaje</button>
            <button className="pr-btn pr-btn--ghost pr-btn--sm" onClick={() => setInvitarA(seleccionados)}>Invitar</button>
            {puedeRecomendar && (
              <button className="pr-btn pr-btn--sm" onClick={() => setRecomendarA({ jugadores: seleccionados.filter((a) => !a.recomendado), identrenamiento: null })}
                disabled={seleccionados.every((a) => a.recomendado)}>
                Recomendar al club <Flecha />
              </button>
            )}
          </div>
        </div>,
        document.body
      )}

      {mensajeA && (
        <ModalContactoEntrenador entrenadores={mensajeA} onCerrar={() => setMensajeA(null)} onEnviado={limpiarSeleccion} />
      )}
      {invitarA && (
        <ModalInvitarEvento jugadores={invitarA} datos={datosInvitar} onCerrar={() => setInvitarA(null)} onEnviado={limpiarSeleccion} />
      )}
      {recomendarA && (
        <ModalRecomendar
          jugadores={recomendarA.jugadores}
          club={club}
          identrenamiento={recomendarA.identrenamiento}
          onCerrar={() => setRecomendarA(null)}
          onHecho={alRecomendar}
        />
      )}

      {toast && createPortal(
        <div className="pr-toast" role="status">
          <div>
            <p className="pr-toast-titulo">{toast.titulo}</p>
            <p className="pr-toast-texto">{toast.texto}</p>
          </div>
          <button className="pr-btn pr-btn--sm" onClick={() => { setToast(null); cambiarTab('recomendaciones') }}>Ver</button>
        </div>,
        document.body
      )}
    </div>
  )
}
