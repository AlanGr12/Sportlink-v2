import React, { useState, useEffect } from 'react'
import api from '../axiosConfig.js'
import Avatar from '../components/Avatar.jsx'
import { useAdminToast } from './AdminLayout.jsx'

export default function AdminEventos() {
  const [tipo, setTipo] = useState('PRUEBAS')
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const { mostrarToast } = useAdminToast()

  const cargarEventos = async (tipoEvento = tipo, pagina = 1) => {
    try {
      setCargando(true)
      const res = await api.get('/api/admin/eventos', {
        params: { tipo: tipoEvento, page: pagina, limit: 12 }
      })
      setEventos(res.data.eventos || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || 1)
      setTotalPages(res.data.totalPages || 1)
    } catch (err) {
      console.error('Error cargando eventos:', err)
      mostrarToast('Error al cargar eventos', 'error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarEventos(tipo, 1)
  }, [tipo])

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Auditoría de Actividades Deportivas</h1>
          <p>Supervisión de convocatorias de pruebas y entrenamientos publicados</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab-btn ${tipo === 'PRUEBAS' ? 'activo' : ''}`}
          onClick={() => setTipo('PRUEBAS')}
        >
          <span>Pruebas de Clubes</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${tipo === 'ENTRENAMIENTOS' ? 'activo' : ''}`}
          onClick={() => setTipo('ENTRENAMIENTOS')}
        >
          <span>Entrenamientos de Entrenadores</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-body" style={{ padding: 0 }}>
          {cargando ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--adm-text-secondary)' }}>
              Cargando actividades...
            </div>
          ) : eventos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--adm-text-secondary)' }}>
              No se encontraron actividades registradas.
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Actividad</th>
                    <th>Organizador</th>
                    <th>Deporte</th>
                    <th>Ubicación</th>
                    <th>Fecha</th>
                    <th>Cupo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map(ev => (
                    <tr key={`${ev.tipo}-${ev.id}`}>
                      <td>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>
                          {ev.titulo}
                        </span>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--adm-text-secondary)' }}>
                          ID: #{ev.id}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-user-cell">
                          <Avatar src={ev.organizadorFoto} nombre={ev.organizador || 'Club'} size={32} />
                          <span style={{ fontSize: '12.5px' }}>{ev.organizador || 'Anónimo'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge admin-tag">
                          {ev.deporte || 'General'}
                        </span>
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        <span style={{ fontSize: '12.5px', color: 'var(--adm-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                          {ev.ubicacion || 'Sin ubicación'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px' }}>
                          {ev.fecha ? new Date(ev.fecha).toLocaleDateString('es-AR') : '-'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12.5px' }}>{ev.cupo != null ? ev.cupo : 'Ilimitado'}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${ev.activo ? 'aprobado' : 'rechazado'}`}>
                          {ev.activo ? 'Activa' : 'Cerrada'}
                        </span>
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
                Página {page} de {totalPages} ({total} actividades)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline admin-btn-sm"
                  disabled={page <= 1}
                  onClick={() => cargarEventos(tipo, page - 1)}
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline admin-btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => cargarEventos(tipo, page + 1)}
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
