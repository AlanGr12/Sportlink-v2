import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../axiosConfig.js'
import Avatar from '../components/Avatar.jsx'
import { useAdminToast } from './AdminLayout.jsx'

export default function AdminDashboard() {
  const [kpis, setKpis] = useState(null)
  const [clubesPendientes, setClubesPendientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [accionandoId, setAccionandoId] = useState(null)
  const { mostrarToast, actualizarPendientes } = useAdminToast()

  const cargarDatos = async () => {
    try {
      setCargando(true)
      const [resKpis, resClubes] = await Promise.all([
        api.get('/api/admin/kpis'),
        api.get('/api/admin/clubes', { params: { estado: 'PENDIENTE' } })
      ])
      setKpis(resKpis.data)
      setClubesPendientes(resClubes.data || [])
      actualizarPendientes((resClubes.data || []).length)
    } catch (err) {
      console.error('Error cargando dashboard admin:', err)
      mostrarToast('Error al cargar métricas del sistema', 'error')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleResolverClub = async (idclub, nuevoEstado, nombre) => {
    setAccionandoId(idclub)
    try {
      await api.patch(`/api/admin/clubes/${idclub}/estado`, { estado: nuevoEstado })
      mostrarToast(`Club "${nombre}" ${nuevoEstado.toLowerCase()} con éxito`, 'success')
      setClubesPendientes(prev => prev.filter(c => c.idclub !== idclub))
      actualizarPendientes(prev => Math.max(0, prev - 1))
      if (kpis) {
        setKpis(prev => ({
          ...prev,
          clubes: {
            ...prev.clubes,
            pendientes: Math.max(0, prev.clubes.pendientes - 1),
            aprobados: nuevoEstado === 'APROBADO' ? prev.clubes.aprobados + 1 : prev.clubes.aprobados,
            rechazados: nuevoEstado === 'RECHAZADO' ? prev.clubes.rechazados + 1 : prev.clubes.rechazados,
          }
        }))
      }
    } catch (err) {
      console.error('Error actualizando club:', err)
      mostrarToast('No se pudo actualizar el estado del club', 'error')
    } finally {
      setAccionandoId(null)
    }
  }

  if (cargando && !kpis) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--adm-text-secondary)' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Cargando métricas del sistema...</div>
      </div>
    )
  }

  const u = kpis?.usuarios || {}
  const des = u.desglose || { jugadores: 0, entrenadores: 0, clubes: 0 }
  const totalRol = (des.jugadores + des.entrenadores + des.clubes) || 1
  const pctJugadores = Math.round((des.jugadores / totalRol) * 100)
  const pctEntrenadores = Math.round((des.entrenadores / totalRol) * 100)
  const pctClubes = Math.round((des.clubes / totalRol) * 100)

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Métricas del Sistema</h1>
          <p>Supervisión en tiempo real del ecosistema deportivo de SportLink</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-outline"
          onClick={cargarDatos}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Actualizar Datos
        </button>
      </div>

      {/* ── KPI Grid ────────────────────────────────────────────── */}
      <div className="admin-kpi-grid">
        {/* KPI 1: Usuarios */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Total Usuarios</span>
            <div className="admin-kpi-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="admin-kpi-value">{u.total ?? 0}</div>
          <div className="admin-kpi-bottom">
            <span>{des.jugadores} Atletas · {des.entrenadores} Entrenadores · {des.clubes} Clubes</span>
            <span className="admin-trend-badge up">+{u.nuevosUltimos30Dias || 0} en 30d</span>
          </div>
        </div>

        {/* KPI 2: Publicaciones */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Publicaciones</span>
            <div className="admin-kpi-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
          </div>
          <div className="admin-kpi-value">{kpis?.publicaciones?.total ?? 0}</div>
          <div className="admin-kpi-bottom">
            <span>Interacciones y contenido del feed</span>
            <span className="admin-trend-badge neutral">Activo</span>
          </div>
        </div>

        {/* KPI 3: Pruebas */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Pruebas Deportivas</span>
            <div className="admin-kpi-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
          </div>
          <div className="admin-kpi-value">{kpis?.pruebas?.total ?? 0}</div>
          <div className="admin-kpi-bottom">
            <span>{kpis?.pruebas?.activas ?? 0} activas · {kpis?.pruebas?.inscripciones ?? 0} inscripciones</span>
            <span className="admin-trend-badge up">Convocatorias</span>
          </div>
        </div>

        {/* KPI 4: Entrenamientos */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Entrenamientos</span>
            <div className="admin-kpi-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
          </div>
          <div className="admin-kpi-value">{kpis?.entrenamientos?.total ?? 0}</div>
          <div className="admin-kpi-bottom">
            <span>{kpis?.entrenamientos?.activos ?? 0} activos · {kpis?.entrenamientos?.inscripciones ?? 0} inscritos</span>
            <span className="admin-trend-badge up">Sesiones</span>
          </div>
        </div>
      </div>

      {/* ── Sección Central: Distribución + Acciones Pendientes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' }}>
        {/* Distribución de Usuarios */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Distribución por Rol</h3>
          </div>
          <div className="admin-card-body">
            {/* Barras de distribución proporcionales */}
            <div style={{ display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden', marginBottom: '24px', background: 'var(--adm-surface-alt)' }}>
              <div style={{ width: `${pctJugadores}%`, background: '#2DEFF2' }} title={`Atletas: ${pctJugadores}%`} />
              <div style={{ width: `${pctEntrenadores}%`, background: '#38BDF8' }} title={`Entrenadores: ${pctEntrenadores}%`} />
              <div style={{ width: `${pctClubes}%`, background: '#34D399' }} title={`Clubes: ${pctClubes}%`} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#2DEFF2' }} />
                  <span style={{ fontSize: '13.5px', color: '#fff' }}>Atletas / Jugadores</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{des.jugadores}</span>
                  <span style={{ fontSize: '12px', color: 'var(--adm-text-secondary)', minWidth: '40px', textAlign: 'right' }}>{pctJugadores}%</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#38BDF8' }} />
                  <span style={{ fontSize: '13.5px', color: '#fff' }}>Entrenadores Élite</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{des.entrenadores}</span>
                  <span style={{ fontSize: '12px', color: 'var(--adm-text-secondary)', minWidth: '40px', textAlign: 'right' }}>{pctEntrenadores}%</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#34D399' }} />
                  <span style={{ fontSize: '13.5px', color: '#fff' }}>Clubes Deportivos</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{des.clubes}</span>
                  <span style={{ fontSize: '12px', color: 'var(--adm-text-secondary)', minWidth: '40px', textAlign: 'right' }}>{pctClubes}%</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid var(--adm-border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--adm-text-secondary)' }}>Nuevos registros en los últimos 30 días</span>
              <strong style={{ color: 'var(--adm-accent)' }}>+{u.nuevosUltimos30Dias || 0} usuarios</strong>
            </div>
          </div>
        </div>

        {/* Acciones Pendientes de Aprobación */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <span>Clubes esperando aprobación</span>
              {clubesPendientes.length > 0 && (
                <span className="admin-badge pendiente">{clubesPendientes.length} PENDIENTES</span>
              )}
            </h3>
            <Link to="/admin/clubes" className="admin-btn admin-btn-outline admin-btn-sm">
              Ver todos →
            </Link>
          </div>
          <div className="admin-card-body" style={{ padding: 0 }}>
            {clubesPendientes.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--adm-text-secondary)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="1.8" style={{ marginBottom: '10px' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>¡Todo al día!</div>
                <div style={{ fontSize: '12.5px', marginTop: '4px' }}>No hay solicitudes de clubes pendientes de moderación en este momento.</div>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Club</th>
                      <th>Ubicación</th>
                      <th style={{ textAlign: 'right' }}>Acción Inmediata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubesPendientes.slice(0, 5).map(club => (
                      <tr key={club.idclub}>
                        <td>
                          <div className="admin-table-user-cell">
                            <Avatar src={club.fotoperfil} nombre={club.nombre} size={36} />
                            <div>
                              <span className="admin-table-user-name">{club.nombre}</span>
                              <span className="admin-table-user-sub">{club.email || 'Sin email'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '12.5px', color: 'var(--adm-text-secondary)' }}>
                            {club.ubicacion || club.direccion || 'No especificada'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="admin-btn admin-btn-approve admin-btn-sm"
                              disabled={accionandoId === club.idclub}
                              onClick={() => handleResolverClub(club.idclub, 'APROBADO', club.nombre)}
                              title="Aprobar inmediatamente"
                            >
                              ✓ Aprobar
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn-reject admin-btn-sm"
                              disabled={accionandoId === club.idclub}
                              onClick={() => handleResolverClub(club.idclub, 'RECHAZADO', club.nombre)}
                              title="Rechazar solicitud"
                            >
                              ✕ Rechazar
                            </button>
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
      </div>
    </div>
  )
}
