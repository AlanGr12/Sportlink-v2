import React, { useState, useEffect } from 'react'
import api from '../axiosConfig.js'
import Avatar from '../components/Avatar.jsx'
import { useAdminToast } from './AdminLayout.jsx'

export default function AdminClubesAprobacion() {
  const [pestaña, setPestaña] = useState('PENDIENTE')
  const [clubes, setClubes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [clubSeleccionado, setClubSeleccionado] = useState(null)
  const [accionandoId, setAccionandoId] = useState(null)
  const [conteoPendientes, setConteoPendientes] = useState(0)
  const { mostrarToast, actualizarPendientes } = useAdminToast()

  const cargarClubes = async (estado) => {
    try {
      setCargando(true)
      const res = await api.get('/api/admin/clubes', { params: { estado } })
      setClubes(res.data || [])
      if (estado === 'PENDIENTE') {
        const cant = (res.data || []).length
        setConteoPendientes(cant)
        actualizarPendientes(cant)
      }
    } catch (err) {
      console.error('Error cargando clubes:', err)
      mostrarToast('Error al cargar la lista de clubes', 'error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarClubes(pestaña)
  }, [pestaña])

  const handleCambiarEstado = async (idclub, nuevoEstado, nombre) => {
    setAccionandoId(idclub)
    try {
      await api.patch(`/api/admin/clubes/${idclub}/estado`, { estado: nuevoEstado })
      mostrarToast(`Club "${nombre}" marcado como ${nuevoEstado}`, 'success')
      // Actualizar la lista localmente
      setClubes(prev => prev.filter(c => c.idclub !== idclub))
      if (pestaña === 'PENDIENTE') {
        setConteoPendientes(prev => {
          const next = Math.max(0, prev - 1)
          actualizarPendientes(next)
          return next
        })
      }
      if (clubSeleccionado?.idclub === idclub) {
        setClubSeleccionado(null)
      }
    } catch (err) {
      console.error('Error actualizando estado del club:', err)
      mostrarToast('No se pudo actualizar el estado del club', 'error')
    } finally {
      setAccionandoId(null)
    }
  }

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '-'
    const d = new Date(fechaStr)
    return isNaN(d) ? '-' : d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Aprobación y Moderación de Clubes</h1>
          <p>Valida la documentación, ubicación y autenticidad de las instituciones registradas</p>
        </div>
      </div>

      {/* ── Pestañas de Estado ──────────────────────────────────── */}
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab-btn ${pestaña === 'PENDIENTE' ? 'activo' : ''}`}
          onClick={() => setPestaña('PENDIENTE')}
        >
          <span>Pendientes de Aprobación</span>
          <span className="admin-tab-count">{conteoPendientes}</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${pestaña === 'APROBADO' ? 'activo' : ''}`}
          onClick={() => setPestaña('APROBADO')}
        >
          <span>Clubes Aprobados</span>
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${pestaña === 'RECHAZADO' ? 'activo' : ''}`}
          onClick={() => setPestaña('RECHAZADO')}
        >
          <span>Rechazados / Inactivos</span>
        </button>
      </div>

      {/* ── Tabla de Moderación ─────────────────────────────────── */}
      <div className="admin-card">
        <div className="admin-card-body" style={{ padding: 0 }}>
          {cargando ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--adm-text-secondary)' }}>
              Cargando clubes...
            </div>
          ) : clubes.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--adm-text-secondary)' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
                No hay clubes en estado "{pestaña}"
              </div>
              <div style={{ fontSize: '13px' }}>
                {pestaña === 'PENDIENTE'
                  ? 'Todas las solicitudes institucionales han sido atendidas.'
                  : `No se encontraron registros de clubes con estado ${pestaña}.`}
              </div>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Club Institucional</th>
                    <th>Email del Responsable</th>
                    <th>Ubicación / Dirección</th>
                    <th>Fecha Registro</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clubes.map(club => (
                    <tr key={club.idclub}>
                      <td>
                        <div className="admin-table-user-cell">
                          <Avatar src={club.fotoperfil} nombre={club.nombre} size={40} />
                          <div>
                            <span className="admin-table-user-name">{club.nombre}</span>
                            {club.deportes && club.deportes.length > 0 && (
                              <span className="admin-table-user-sub">
                                {club.deportes.slice(0, 3).join(', ')}{club.deportes.length > 3 ? ` (+${club.deportes.length - 3})` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', color: 'var(--adm-text-secondary)', fontSize: '12.5px' }}>
                          {club.email || 'Sin correo asociado'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12.5px' }}>
                          {club.direccion || club.ubicacion || 'No especificada'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--adm-text-secondary)', fontSize: '12px' }}>
                          {formatearFecha(club.createdat)}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${club.estado?.toLowerCase() || 'pendiente'}`}>
                          {club.estado || 'PENDIENTE'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-outline admin-btn-sm"
                            onClick={() => setClubSeleccionado(club)}
                            title="Inspeccionar perfil y mapa"
                          >
                            👁️ Inspeccionar
                          </button>

                          {pestaña === 'PENDIENTE' && (
                            <>
                              <button
                                type="button"
                                className="admin-btn admin-btn-approve admin-btn-sm"
                                disabled={accionandoId === club.idclub}
                                onClick={() => handleCambiarEstado(club.idclub, 'APROBADO', club.nombre)}
                                title="Aprobar club"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn-reject admin-btn-sm"
                                disabled={accionandoId === club.idclub}
                                onClick={() => handleCambiarEstado(club.idclub, 'RECHAZADO', club.nombre)}
                                title="Rechazar club"
                              >
                                ✕
                              </button>
                            </>
                          )}

                          {pestaña === 'RECHAZADO' && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-approve admin-btn-sm"
                              disabled={accionandoId === club.idclub}
                              onClick={() => handleCambiarEstado(club.idclub, 'APROBADO', club.nombre)}
                              title="Reconsiderar y aprobar"
                            >
                              Aprobar
                            </button>
                          )}

                          {pestaña === 'APROBADO' && (
                            <button
                              type="button"
                              className="admin-btn admin-btn-reject admin-btn-sm"
                              disabled={accionandoId === club.idclub}
                              onClick={() => handleCambiarEstado(club.idclub, 'RECHAZADO', club.nombre)}
                              title="Revocar aprobación"
                            >
                              Suspender
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal / Drawer de Inspección de Club ─────────────────── */}
      {clubSeleccionado && (
        <div className="admin-modal-backdrop" onClick={() => setClubSeleccionado(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Avatar src={clubSeleccionado.fotoperfil} nombre={clubSeleccionado.nombre} size={48} />
                <div>
                  <h3 style={{ margin: 0 }}>{clubSeleccionado.nombre}</h3>
                  <span className={`admin-badge ${clubSeleccionado.estado?.toLowerCase() || 'pendiente'}`} style={{ marginTop: '4px' }}>
                    {clubSeleccionado.estado || 'PENDIENTE'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setClubSeleccionado(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: 'var(--adm-text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Email Institucional
                  </span>
                  <div style={{ fontSize: '14px', color: '#fff', marginTop: '3px', fontFamily: 'monospace' }}>
                    {clubSeleccionado.email || 'Sin correo asociado'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: 'var(--adm-text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Ubicación y Dirección
                  </span>
                  <div style={{ fontSize: '14px', color: '#fff', marginTop: '3px' }}>
                    {clubSeleccionado.direccion || clubSeleccionado.ubicacion || 'Sin dirección declarada'}
                  </div>
                  {clubSeleccionado.latitud && clubSeleccionado.longitud && (
                    <div style={{ fontSize: '12px', color: 'var(--adm-accent)', marginTop: '4px' }}>
                      📍 Coordenadas: {clubSeleccionado.latitud}, {clubSeleccionado.longitud}
                    </div>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: 'var(--adm-text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Deportes que gestiona
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {clubSeleccionado.deportes && clubSeleccionado.deportes.length > 0 ? (
                      clubSeleccionado.deportes.map(dep => (
                        <span key={dep} className="admin-badge admin-tag">
                          {dep}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--adm-text-secondary)' }}>Ninguno especificado</span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: 'var(--adm-text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Descripción Institucional
                  </span>
                  <p style={{ fontSize: '13.5px', color: 'var(--adm-text-secondary)', lineHeight: 1.6, margin: '6px 0 0', background: 'var(--adm-surface-alt)', padding: '12px', borderRadius: '8px' }}>
                    {clubSeleccionado.descripcion || 'El club no ha provisto una descripción adicional.'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: 'var(--adm-text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    Fecha de Registro
                  </span>
                  <div style={{ fontSize: '13px', color: 'var(--adm-text-secondary)', marginTop: '3px' }}>
                    {formatearFecha(clubSeleccionado.createdat)}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => setClubSeleccionado(null)}
              >
                Cerrar
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-reject"
                disabled={accionandoId === clubSeleccionado.idclub}
                onClick={() => handleCambiarEstado(clubSeleccionado.idclub, 'RECHAZADO', clubSeleccionado.nombre)}
              >
                ✕ Rechazar Solicitud
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-approve"
                disabled={accionandoId === clubSeleccionado.idclub}
                onClick={() => handleCambiarEstado(clubSeleccionado.idclub, 'APROBADO', clubSeleccionado.nombre)}
              >
                ✓ Aprobar Club
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
