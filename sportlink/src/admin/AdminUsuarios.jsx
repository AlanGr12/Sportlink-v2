import React, { useState, useEffect } from 'react'
import api from '../axiosConfig.js'
import Avatar from '../components/Avatar.jsx'
import { useAdminToast } from './AdminLayout.jsx'

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [rol, setRol] = useState('')
  const [cargando, setCargando] = useState(true)
  const [accionandoId, setAccionandoId] = useState(null)
  const { mostrarToast } = useAdminToast()

  const cargarUsuarios = async (pagina = page, busqueda = search, filtroRol = rol) => {
    try {
      setCargando(true)
      const res = await api.get('/api/admin/usuarios', {
        params: {
          page: pagina,
          limit: 12,
          search: busqueda.trim(),
          rol: filtroRol
        }
      })
      setUsuarios(res.data.usuarios || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || 1)
      setTotalPages(res.data.totalPages || 1)
    } catch (err) {
      console.error('Error cargando usuarios:', err)
      mostrarToast('Error al cargar la lista de usuarios', 'error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarUsuarios(1, search, rol)
  }, [rol])

  const handleBuscar = (e) => {
    e.preventDefault()
    cargarUsuarios(1, search, rol)
  }

  const handleToggleAdmin = async (u) => {
    const nuevoValor = !u.es_admin
    setAccionandoId(u.idusuario)
    try {
      await api.patch(`/api/admin/usuarios/${u.idusuario}/admin`, { es_admin: nuevoValor })
      mostrarToast(`Permisos de administrador ${nuevoValor ? 'otorgados a' : 'revocados para'} ${u.nombre || u.email}`, 'success')
      setUsuarios(prev => prev.map(item => item.idusuario === u.idusuario ? { ...item, es_admin: nuevoValor } : item))
    } catch (err) {
      console.error('Error modificando admin:', err)
      mostrarToast(err.response?.data?.error || 'No se pudieron actualizar los permisos', 'error')
    } finally {
      setAccionandoId(null)
    }
  }

  const handleEliminarUsuario = async (u) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario ${u.nombre || u.email}? Esta acción no se puede deshacer.`)) {
      return
    }
    setAccionandoId(u.idusuario)
    try {
      await api.delete(`/api/admin/usuarios/${u.idusuario}`)
      mostrarToast(`Usuario ${u.nombre || u.email} eliminado del sistema`, 'success')
      setUsuarios(prev => prev.filter(item => item.idusuario !== u.idusuario))
      setTotal(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error eliminando usuario:', err)
      mostrarToast(err.response?.data?.error || 'No se pudo eliminar al usuario', 'error')
    } finally {
      setAccionandoId(null)
    }
  }

  const badgeRolClass = (r) => {
    const rolLower = (r || '').toLowerCase()
    if (rolLower === 'jugador') return 'rol-jugador'
    if (rolLower === 'entrenador') return 'rol-entrenador'
    if (rolLower === 'club') return 'rol-club'
    return 'neutral'
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>Supervisa las cuentas registradas, roles asignados y privilegios administrativos</p>
        </div>
      </div>

      {/* ── Barra de Filtros ─────────────────────────────────────── */}
      <div className="admin-card" style={{ marginBottom: '16px' }}>
        <div className="admin-card-body" style={{ padding: '16px 20px' }}>
          <form onSubmit={handleBuscar} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px' }}>
              <input
                type="text"
                className="admin-search-input"
                style={{ width: '100%', maxWidth: '380px' }}
                placeholder="Buscar por email o nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="admin-btn admin-btn-primary">
                Buscar
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--adm-text-secondary)', fontWeight: 600 }}>Filtrar Rol:</span>
              <button
                type="button"
                className={`admin-btn ${rol === '' ? 'admin-btn-primary' : 'admin-btn-outline'} admin-btn-sm`}
                onClick={() => setRol('')}
              >
                Todos ({total})
              </button>
              <button
                type="button"
                className={`admin-btn ${rol === 'jugador' ? 'admin-btn-primary' : 'admin-btn-outline'} admin-btn-sm`}
                onClick={() => setRol('jugador')}
              >
                Atletas
              </button>
              <button
                type="button"
                className={`admin-btn ${rol === 'entrenador' ? 'admin-btn-primary' : 'admin-btn-outline'} admin-btn-sm`}
                onClick={() => setRol('entrenador')}
              >
                Entrenadores
              </button>
              <button
                type="button"
                className={`admin-btn ${rol === 'club' ? 'admin-btn-primary' : 'admin-btn-outline'} admin-btn-sm`}
                onClick={() => setRol('club')}
              >
                Clubes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Tabla de Usuarios ────────────────────────────────────── */}
      <div className="admin-card">
        <div className="admin-card-body" style={{ padding: 0 }}>
          {cargando ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--adm-text-secondary)' }}>
              Cargando usuarios...
            </div>
          ) : usuarios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--adm-text-secondary)' }}>
              No se encontraron usuarios coincidentes.
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Privilegios</th>
                    <th>Registro</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.idusuario}>
                      <td>
                        <div className="admin-table-user-cell">
                          <Avatar src={u.fotoperfil} nombre={u.nombre || u.email} size={36} />
                          <div>
                            <span className="admin-table-user-name">{u.nombre || u.email}</span>
                            {u.estadoClub && (
                              <span className={`admin-badge ${u.estadoClub.toLowerCase()}`} style={{ fontSize: '9px', padding: '1px 5px', marginTop: '2px' }}>
                                Club: {u.estadoClub}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--adm-text-secondary)' }}>
                          {u.email}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${badgeRolClass(u.tipousuario)}`}>
                          {u.tipousuario?.toUpperCase() || 'USUARIO'}
                        </span>
                      </td>
                      <td>
                        {u.es_admin ? (
                          <span className="admin-badge admin-tag">
                            ★ Administrador
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                            Estándar
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--adm-text-secondary)' }}>
                          {u.createdat ? new Date(u.createdat).toLocaleDateString('es-AR') : '-'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            disabled={accionandoId === u.idusuario}
                            onClick={() => handleToggleAdmin(u)}
                            title={u.es_admin ? 'Revocar permisos de administrador' : 'Otorgar rol de administrador'}
                          >
                            {u.es_admin ? 'Quitar Admin' : 'Hacer Admin'}
                          </button>

                          <button
                            type="button"
                            className="admin-btn admin-btn-reject admin-btn-sm"
                            disabled={accionandoId === u.idusuario || u.es_admin}
                            onClick={() => handleEliminarUsuario(u)}
                            title={u.es_admin ? 'No se puede eliminar a un administrador' : 'Eliminar usuario del sistema'}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--adm-border)' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--adm-text-secondary)' }}>
                Página {page} de {totalPages} ({total} usuarios en total)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline admin-btn-sm"
                  disabled={page <= 1}
                  onClick={() => cargarUsuarios(page - 1, search, rol)}
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline admin-btn-sm"
                  disabled={page >= totalPages}
                  onClick={() => cargarUsuarios(page + 1, search, rol)}
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
