import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import { FdAvatar } from './Publicacion.jsx'
import { ROLES } from './feedUtils.js'

// Columnas laterales compartidas por el feed y el detalle de una publicación
// (estilos en Feed.css: .fd-lado, .fd-yo, .fd-bloque…)

// Izquierda: quién sos, tu red y atajos
export function ColumnaYo({ usuario }) {
  const navigate = useNavigate()
  const [red, setRed] = useState(null)
  const miId = usuario?.idusuario || usuario?.id

  useEffect(() => {
    if (!miId) return
    let vivo = true
    api.get(`/api/seguidores/${miId}`)
      .then((r) => { if (vivo) setRed(r.data) })
      .catch(() => {})
    return () => { vivo = false }
  }, [miId])

  return (
    <aside className="fd-lado fd-lado--izq" aria-label="Tu perfil">
      <div className="fd-sticky">
        {usuario ? (
          <section className="fd-yo">
            <FdAvatar persona={usuario} size={64} />
            <h2 className="fd-yo-nombre">{usuario.nombre || usuario.email || 'Tu perfil'}</h2>
            {ROLES[usuario.tipousuario] && <p className="fd-yo-rol">{ROLES[usuario.tipousuario]}</p>}
            {red && (
              <dl className="fd-yo-red">
                <div><dt>Seguidores</dt><dd>{red.seguidores ?? 0}</dd></div>
                <div><dt>Siguiendo</dt><dd>{red.seguidos ?? 0}</dd></div>
              </dl>
            )}
            <button type="button" className="pr-btn pr-btn--ink pr-btn--block" onClick={() => navigate('/perfil')}>
              Ver mi perfil
            </button>
          </section>
        ) : (
          <section className="fd-yo">
            <h2 className="fd-yo-nombre">Sumate a SportLink</h2>
            <p className="fd-yo-rol">La red de jugadores, entrenadores y clubes.</p>
            <button type="button" className="pr-btn pr-btn--block" onClick={() => navigate('/registro')}>Registrarme</button>
          </section>
        )}

        <nav className="fd-atajos" aria-label="Explorar">
          <Link to="/pruebas">Pruebas</Link>
          <Link to="/entrenamientos">Entrenamientos</Link>
          <Link to="/empleos">Empleos</Link>
          <Link to="/clubes">Clubes</Link>
          <Link to="/entrenadores">Entrenadores</Link>
        </nav>
      </div>
    </aside>
  )
}

// Derecha: perfiles que comparten tu deporte
export function ColumnaSeguir() {
  const navigate = useNavigate()
  const [recomendaciones, setRecomendaciones] = useState(null)

  useEffect(() => {
    let vivo = true
    api.get('/api/recomendaciones', { params: { limite: 3 } })
      .then((r) => { if (vivo) setRecomendaciones(Array.isArray(r.data) ? r.data : []) })
      .catch(() => { if (vivo) setRecomendaciones([]) })
    return () => { vivo = false }
  }, [])

  return (
    <aside className="fd-lado fd-lado--der" aria-label="Sugerencias">
      <div className="fd-sticky">
        <section className="fd-bloque">
          <h2 className="fd-bloque-titulo">A quién seguir</h2>
          {recomendaciones === null ? (
            <p className="pr-muted">Cargando…</p>
          ) : recomendaciones.length === 0 ? (
            <p className="pr-muted">Cuando cargues tus deportes en el perfil, te sugerimos clubes y entrenadores.</p>
          ) : (
            <ul className="fd-recos">
              {recomendaciones.map((r) => (
                <li key={r.idusuario}>
                  <button type="button" className="fd-reco" onClick={() => navigate(`/perfil/${r.idusuario}`)}>
                    <FdAvatar persona={r} size={44} />
                    <span className="fd-reco-txt">
                      <strong>{r.nombre}</strong>
                      <span>{r.tipousuario === 'club' ? 'Club' : 'Entrenador'}{r.deporte ? ` · ${r.deporte}` : ''}</span>
                    </span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="fd-legal">
          <Link to="/landing">Qué es SportLink</Link>
          <span>SportLink © 2026</span>
        </div>
      </div>
    </aside>
  )
}
