import React, { useState, useEffect } from 'react'
import api from '../axiosConfig.js'
import Avatar from '../components/Avatar.jsx'
import MapaUbicacionDark from '../components/maps/MapaUbicacionDark.jsx'
import { useAdminToast } from './AdminLayout.jsx'

export default function AdminClubesAprobacion() {
  const [pestaña, setPestaña] = useState('PENDIENTE')
  const [clubes, setClubes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [clubSeleccionado, setClubSeleccionado] = useState(null)
  const [accionandoId, setAccionandoId] = useState(null)
  const [cargandoFicha, setCargandoFicha] = useState(false)
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

  // Abre la ficha con los datos de la lista y la completa con el detalle (imágenes, etc.)
  const abrirFicha = async (club) => {
    setClubSeleccionado(club)
    setCargandoFicha(true)
    try {
      const res = await api.get(`/api/admin/clubes/${club.idclub}`)
      setClubSeleccionado(prev => (prev?.idclub === club.idclub ? { ...prev, ...res.data } : prev))
    } catch (err) {
      console.error('Error cargando ficha del club:', err)
      mostrarToast('No se pudo cargar el detalle completo del club', 'error')
    } finally {
      setCargandoFicha(false)
    }
  }

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
                            onClick={() => abrirFicha(club)}
                            title="Inspeccionar perfil y mapa"
                          >
                            Ver datos
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
              <div className="admin-ficha">
                <div className="admin-ficha-grid">
                  <div>
                    <span className="admin-ficha-label">Email de registro</span>
                    <div className="admin-ficha-value" style={{ fontFamily: 'monospace' }}>
                      {clubSeleccionado.email || 'Sin correo asociado'}
                    </div>
                  </div>
                  <div>
                    <span className="admin-ficha-label">Fecha de solicitud</span>
                    <div className="admin-ficha-value">{formatearFecha(clubSeleccionado.createdat)}</div>
                  </div>
                  <div>
                    <span className="admin-ficha-label">Estado actual</span>
                    <span className={`admin-badge ${clubSeleccionado.estado?.toLowerCase() || 'pendiente'}`}>
                      {clubSeleccionado.estado || 'PENDIENTE'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="admin-ficha-label">Deportes que ofrece</span>
                  <div className="admin-ficha-tags">
                    {clubSeleccionado.deportes && clubSeleccionado.deportes.length > 0 ? (
                      clubSeleccionado.deportes.map(dep => (
                        <span key={dep} className="admin-badge admin-tag">{dep}</span>
                      ))
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--adm-text-secondary)' }}>Ninguno especificado</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="admin-ficha-label">Zona y dirección</span>
                  <div className="admin-ficha-value">
                    {[clubSeleccionado.ubicacion, clubSeleccionado.direccion].filter(Boolean).join(' · ') || 'Sin dirección declarada'}
                  </div>
                  {clubSeleccionado.latitud && clubSeleccionado.longitud ? (
                    <div className="admin-ficha-mapa">
                      <MapaUbicacionDark
                        latitud={clubSeleccionado.latitud}
                        longitud={clubSeleccionado.longitud}
                        direccion={clubSeleccionado.direccion || ''}
                        zona={clubSeleccionado.ubicacion || ''}
                        nombre={clubSeleccionado.nombre}
                        tipo="club"
                        height="220px"
                        mostrarFooter={false}
                      />
                    </div>
                  ) : (
                    <div style={{ fontSize: '12.5px', color: 'var(--adm-text-muted)', marginTop: '6px' }}>
                      El club no cargó coordenadas: no se puede validar la sede en el mapa.
                    </div>
                  )}
                </div>

                <div>
                  <span className="admin-ficha-label">Descripción institucional</span>
                  <p className="admin-ficha-desc">
                    {clubSeleccionado.descripcion || 'El club no ha provisto una descripción adicional.'}
                  </p>
                </div>

                <div>
                  <span className="admin-ficha-label">Imágenes de las instalaciones</span>
                  {cargandoFicha && !clubSeleccionado.imagenes ? (
                    <div style={{ fontSize: '13px', color: 'var(--adm-text-secondary)', marginTop: '6px' }}>Cargando imágenes...</div>
                  ) : clubSeleccionado.imagenes && clubSeleccionado.imagenes.length > 0 ? (
                    <div className="admin-ficha-galeria">
                      {clubSeleccionado.imagenes.map((url, i) => (
                        <a key={url + i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={`Instalación ${i + 1} de ${clubSeleccionado.nombre}`} loading="lazy" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--adm-text-secondary)', marginTop: '6px' }}>
                      El club no cargó imágenes de sus instalaciones.
                    </div>
                  )}
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
                className="admin-btn admin-btn-reject-solid"
                disabled={accionandoId === clubSeleccionado.idclub || clubSeleccionado.estado === 'RECHAZADO'}
                onClick={() => handleCambiarEstado(clubSeleccionado.idclub, 'RECHAZADO', clubSeleccionado.nombre)}
              >
                ✕ Rechazar
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-approve"
                disabled={accionandoId === clubSeleccionado.idclub || clubSeleccionado.estado === 'APROBADO'}
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
