import React, { useState, useEffect } from 'react'
import api from '../axiosConfig.js'
import { useAdminToast } from './AdminLayout.jsx'

export default function AdminPublicaciones() {
  const [publicaciones, setPublicaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [eliminandoId, setEliminandoId] = useState(null)
  const { mostrarToast } = useAdminToast()

  const cargarPublicaciones = async (pagina = page, busqueda = search) => {
    try {
      setCargando(true)
      const res = await api.get('/api/admin/publicaciones', {
        params: { page: pagina, limit: 12, search: busqueda.trim() }
      })
      setPublicaciones(res.data.publicaciones || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || 1)
      setTotalPages(res.data.totalPages || 1)
    } catch (err) {
      console.error('Error cargando publicaciones:', err)
      mostrarToast('Error al cargar publicaciones', 'error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPublicaciones(1, search)
  }, [])

  const handleEliminar = async (idpublicacion) => {
    if (!window.confirm(`¿Confirmas la moderación y eliminación de la publicación #${idpublicacion}?`)) return
    setEliminandoId(idpublicacion)
    try {
      await api.delete(`/api/admin/publicaciones/${idpublicacion}`)
      mostrarToast(`Publicación #${idpublicacion} eliminada correctamente`, 'success')
      setPublicaciones(prev => prev.filter(p => p.idpublicacion !== idpublicacion))
      setTotal(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error eliminando publicación:', err)
      mostrarToast('No se pudo eliminar la publicación', 'error')
    } finally {
      setEliminandoId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Moderación de Publicaciones</h1>
          <p>Audita el contenido generado en el feed y elimina publicaciones que violen las directrices</p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: '16px' }}>
        <div className="admin-card-body" style={{ padding: '16px 20px' }}>
          <form onSubmit={(e) => { e.preventDefault(); cargarPublicaciones(1, search) }} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="admin-search-input"
              style={{ width: '100%', maxWidth: '400px' }}
              placeholder="Buscar por contenido del post..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="admin-btn admin-btn-primary">
              Filtrar
            </button>
          </form>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-body" style={{ padding: 0 }}>
          {cargando ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--adm-text-secondary)' }}>
              Cargando publicaciones...
            </div>
          ) : publicaciones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--adm-text-secondary)' }}>
              No se encontraron publicaciones.
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Autor</th>
                    <th>Tipo</th>
                    <th>Contenido</th>
                    <th>Adjunto</th>
                    <th>Fecha</th>
                    <th style={{ textAlign: 'right' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {publicaciones.map(p => (
                    <tr key={p.idpublicacion}>
                      <td>
                        <span style={{ fontFamily: 'monospace', color: 'var(--adm-text-muted)' }}>
                          #{p.idpublicacion}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>
                          {p.usuarios?.email || `Usuario #${p.idusuario}`}
                        </span>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--adm-text-secondary)' }}>
                          {p.usuarios?.tipousuario || 'General'}
                        </span>
                      </td>
                      <td>
                        <span className="admin-badge admin-tag">
                          {p.tipopublicacion || 'NORMAL'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--adm-text)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.contenido || 'Sin texto'}
                        </span>
                      </td>
                      <td>
                        {p.imagen ? (
                          <a href={p.imagen} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--adm-accent)', textDecoration: 'none' }}>
                            🖼️ Ver imagen
                          </a>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>Ninguno</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--adm-text-secondary)' }}>
                          {p.createdat ? new Date(p.createdat).toLocaleDateString('es-AR') : '-'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn-reject admin-btn-sm"
                          disabled={eliminandoId === p.idpublicacion}
                          onClick={() => handleEliminar(p.idpublicacion)}
                          title="Eliminar publicación"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--adm-border)' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--adm-text-secondary)' }}>
                Página {page} de {totalPages} ({total} publicaciones)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline admin-btn-sm"
                  disabled={page <= 1}
                  onClick={() => cargarPublicaciones(page - 1, search)}
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline admin-btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => cargarPublicaciones(page + 1, search)}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
