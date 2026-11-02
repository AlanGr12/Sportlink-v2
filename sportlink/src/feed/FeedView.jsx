import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import useSeguidos from '../hooks/useSeguidos.js'
import { parsearFechaUTC } from '../utils/dateUtils.js'
import Publicacion from './Publicacion.jsx'
import { ColumnaYo, ColumnaSeguir } from './Laterales.jsx'
import { fechaDePost } from './feedUtils.js'
import Compositor from './Compositor.jsx'
import '../pruebas/PruebasView.css'
import './Feed.css'

const idDe = (p) => Number(p.idpublicacion || p.id) || 0
const tiempoDe = (p) => parsearFechaUTC(fechaDePost(p))?.getTime() || idDe(p)
const ordenar = (lista) => [...lista].sort((a, b) => tiempoDe(b) - tiempoDe(a))

export default function FeedView({ usuario }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('paraVos') // 'paraVos' | 'siguiendo'
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [hayMas, setHayMas] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMas, setLoadingMas] = useState(false)
  const [error, setError] = useState(false)
  const [nuevas, setNuevas] = useState([])
  const [aviso, setAviso] = useState(null)
  const sentinelRef = useRef(null)

  const seguidos = useSeguidos(usuario)

  const avisoTimer = useRef(null)
  const mostrarAviso = useCallback((texto) => {
    setAviso(texto)
    clearTimeout(avisoTimer.current)
    avisoTimer.current = setTimeout(() => setAviso(null), 2400)
  }, [])
  useEffect(() => () => clearTimeout(avisoTimer.current), [])

  // Quien llama marca loading / loadingMas antes (la primera carga ya arranca en loading)
  const cargarPosts = useCallback(async (pagina = 1, reemplazar = false) => {
    try {
      const { data } = await api.get('/api/publicaciones', { params: { page: pagina, limit: 20 } })
      const lista = data.publicaciones || []
      setPosts((prev) => (reemplazar ? lista : [...prev, ...lista]))
      setHayMas(pagina < (data.totalPaginas || 1))
      setError(false)
    } catch {
      if (pagina === 1) setError(true)
    } finally {
      setLoading(false)
      setLoadingMas(false)
    }
  }, [])

  // Primera página
  useEffect(() => {
    let vivo = true
    api.get('/api/publicaciones', { params: { page: 1, limit: 20 } })
      .then(({ data }) => {
        if (!vivo) return
        setPosts(data.publicaciones || [])
        setHayMas(1 < (data.totalPaginas || 1))
      })
      .catch(() => { if (vivo) setError(true) })
      .finally(() => { if (vivo) setLoading(false) })
    return () => { vivo = false }
  }, [])

  // Cada 15 s busca publicaciones realmente nuevas y ofrece mostrarlas
  useEffect(() => {
    if (posts.length === 0) return
    const existentes = new Set(posts.map(idDe))
    const maxId = Math.max(...posts.map(idDe))
    const maxTiempo = Math.max(0, ...posts.map((p) => parsearFechaUTC(fechaDePost(p))?.getTime() || 0))

    const revisar = async () => {
      try {
        const { data } = await api.get('/api/publicaciones', { params: { page: 1, limit: 20 } })
        setNuevas((data.publicaciones || []).filter((p) => {
          const id = idDe(p)
          if (!id || existentes.has(id)) return false
          const t = parsearFechaUTC(fechaDePost(p))?.getTime() || 0
          return id > maxId || (t > 0 && t > maxTiempo)
        }))
      } catch { /* consulta silenciosa */ }
    }
    const timer = setInterval(revisar, 15000)
    return () => clearInterval(timer)
  }, [posts])

  const mostrarNuevas = () => {
    setPosts((prev) => {
      const existentes = new Set(prev.map(idDe))
      return [...nuevas.filter((p) => !existentes.has(idDe(p))), ...prev]
    })
    setNuevas([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Scroll infinito
  useEffect(() => {
    if (!sentinelRef.current) return
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hayMas && !loadingMas && !loading) {
        const siguiente = page + 1
        setPage(siguiente)
        setLoadingMas(true)
        cargarPosts(siguiente)
      }
    }, { rootMargin: '400px 0px' })
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [hayMas, loadingMas, loading, page, cargarPosts])

  const alPublicar = (nuevo) => {
    setPosts((prev) => [nuevo, ...prev])
    setNuevas((prev) => prev.filter((p) => idDe(p) !== idDe(nuevo)))
  }
  const alEliminar = (id) => setPosts((prev) => prev.filter((p) => p.idpublicacion !== id))

  const ordenados = ordenar(posts)
  const visibles = tab === 'siguiendo'
    ? ordenados.filter((p) => seguidos.has(Number(p.autor?.idusuario || p.idusuario)))
    : ordenados

  return (
    <div className="pr fd">
      <div className="pr-wrap fd-layout">
        <ColumnaYo usuario={usuario} />

        {/* ── Centro: la línea de tiempo ── */}
        <main className="fd-centro">
          <h1 className="pr-sr">Inicio</h1>
          <div className="fd-tabs" role="tablist" aria-label="Qué mostrar">
            <button type="button" role="tab" aria-selected={tab === 'paraVos'} className={`fd-tab${tab === 'paraVos' ? ' is-on' : ''}`} onClick={() => setTab('paraVos')}>
              Para vos
            </button>
            <button type="button" role="tab" aria-selected={tab === 'siguiendo'} className={`fd-tab${tab === 'siguiendo' ? ' is-on' : ''}`} onClick={() => setTab('siguiendo')}>
              Siguiendo
            </button>
          </div>

          {usuario && <Compositor usuario={usuario} onPublicado={alPublicar} onAviso={mostrarAviso} />}

          {nuevas.length > 0 && (
            <div className="fd-nuevas">
              <button type="button" className="pr-btn pr-btn--ink pr-btn--sm" onClick={mostrarNuevas}>
                Ver {nuevas.length} {nuevas.length === 1 ? 'publicación nueva' : 'publicaciones nuevas'}
              </button>
            </div>
          )}

          {loading ? (
            <div aria-busy="true" aria-label="Cargando publicaciones">
              {[0, 1, 2].map((i) => <div key={i} className="fd-post fd-post--skeleton" />)}
            </div>
          ) : error ? (
            <div className="pr-empty fd-vacio">
              <h2 className="pr-display pr-empty-title">No pudimos cargar el feed</h2>
              <p>Revisá tu conexión y probá de nuevo.</p>
              <button type="button" className="pr-btn pr-btn--ink" onClick={() => { setLoading(true); setPage(1); cargarPosts(1, true) }}>Reintentar</button>
            </div>
          ) : visibles.length === 0 ? (
            tab === 'siguiendo' ? (
              <div className="pr-empty fd-vacio">
                <h2 className="pr-display pr-empty-title">Tu red todavía está callada</h2>
                <p>Seguí clubes y entrenadores para ver acá lo que publican.</p>
                <button type="button" className="pr-btn pr-btn--ink" onClick={() => navigate('/clubes')}>
                  Buscar clubes
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </button>
              </div>
            ) : (
              <div className="pr-empty fd-vacio">
                <h2 className="pr-display pr-empty-title">Todavía no hay publicaciones</h2>
                <p>Arrancá vos: contá en qué andás.</p>
              </div>
            )
          ) : (
            <>
              <div className="fd-lista">
                {visibles.map((post) => (
                  <Publicacion key={post.idpublicacion} post={post} usuario={usuario} onEliminar={alEliminar} onAviso={mostrarAviso} />
                ))}
              </div>
              <div ref={sentinelRef} />
              {loadingMas && <div className="fd-post fd-post--skeleton" aria-label="Cargando más" />}
              {!hayMas && <p className="fd-fin">Llegaste al final.</p>}
            </>
          )}
        </main>

        <ColumnaSeguir />
      </div>

      {aviso && (
        <div className="pr-toast fd-toast" role="status">
          <p className="pr-toast-titulo">{aviso}</p>
        </div>
      )}
    </div>
  )
}
