import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

import Login from './log in/Login.jsx'
import RegistroFlow from './RegistroFlow.jsx'
import Landing from './landing/landing.jsx'
import MiPerfil from './mi perfil/miperfil.jsx'
import EntrenadoresView from './mostrarEntrenadores/entrenadores.jsx'
import JugadoresView from './mostrarJugadores/jugadores.jsx'
import Header from './header/header.jsx'
import Calendario from './calendario/calendario.jsx'
import Pruebas from './pruebas/pruebas.jsx'
import PaginaEntrenamientos from './entrenamientos/PaginaEntrenamientos.jsx'
import Empleos from './empleos/Empleos.jsx'

// ── Página 404 ───────────────────────────────────────────────────────────────
function NotFound404() {
  const navigate = useNavigate()
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      color: '#fff',
    }}>
      <div style={{
        fontSize: '8rem',
        fontWeight: '900',
        background: 'linear-gradient(135deg, #00f0ff, #0080ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1,
        marginBottom: '1rem',
      }}>
        404
      </div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
        Página no encontrada
      </h1>
      <p style={{ color: '#aaa', marginBottom: '2rem', maxWidth: '400px' }}>
        La ruta que buscás no existe en SportLink. Puede que haya sido movida o eliminada.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'linear-gradient(135deg, #00f0ff, #0080ff)',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 28px',
          fontWeight: '700',
          fontSize: '1rem',
          cursor: 'pointer',
          letterSpacing: '0.05em',
        }}
      >
        VOLVER AL INICIO
      </button>
    </div>
  )
}

// ── Ruta protegida: redirige a /login si no hay sesión ───────────────────────
function ProtectedRoute({ usuario, children }) {
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

// ── Ruta pública: redirige al inicio si ya hay sesión (login/registro) ───────
function PublicOnlyRoute({ usuario, children }) {
  if (usuario) return <Navigate to="/" replace />
  return children
}

// ── Componente principal ─────────────────────────────────────────────────────
function App() {
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || 'null')
    } catch {
      return null
    }
  })

  const actualizarUsuario = (user) => {
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user))
    } else {
      localStorage.removeItem('usuario')
    }
    setUsuario(user)
  }

  // Enriquecer el objeto usuario con idjugador / identrenador si no los tiene
  useEffect(() => {
    const fetchIdJugador = async () => {
      if (!usuario) return
      if (usuario.idjugador || usuario.idJugador) return
      if (usuario.tipousuario !== 'jugador') return
      const idusuario = usuario.idusuario || usuario.idUsuario || usuario.id || null
      if (!idusuario) return
      try {
        const response = await axios.get('http://localhost:3000/api/jugadores')
        const jugador = Array.isArray(response.data)
          ? response.data.find((j) => j.idusuario === idusuario)
          : null
        if (jugador?.idjugador) {
          actualizarUsuario({ ...usuario, idjugador: jugador.idjugador })
        }
      } catch (err) {
        console.error('No se pudo obtener idjugador:', err)
      }
    }

    const fetchIdEntrenador = async () => {
      if (!usuario) return
      if (usuario.identrenador || usuario.idEntrenador) return
      if (usuario.tipousuario !== 'entrenador') return
      const idusuario = usuario.idusuario || usuario.idUsuario || usuario.id || null
      if (!idusuario) return
      try {
        const response = await axios.get('http://localhost:3000/api/entrenadores')
        const entrenador = Array.isArray(response.data)
          ? response.data.find((e) => e.idusuario === idusuario)
          : null
        if (entrenador?.identrenador) {
          actualizarUsuario({ ...usuario, identrenador: entrenador.identrenador })
        }
      } catch (err) {
        console.error('No se pudo obtener identrenador:', err)
      }
    }

    fetchIdJugador()
    fetchIdEntrenador()
  }, [usuario])

  // idjugador resuelto para pasar a Pruebas
  const idJugador =
    usuario?.idjugador ||
    usuario?.idJugador ||
    usuario?.jugador?.idjugador ||
    usuario?.jugador?.idJugador ||
    usuario?.jugadorId ||
    usuario?.jugador?.id ||
    null

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header usuario={usuario} onLogout={() => actualizarUsuario(null)} />
      <main className="content-body" style={{ flex: 1 }}>
        <Routes>
          {/* ── Públicas ── */}
          <Route path="/" element={<Landing usuario={usuario} />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute usuario={usuario}>
                <Login
                  onLogin={(user) => actualizarUsuario(user)}
                  onRegistro={null}
                />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/registro"
            element={
              <PublicOnlyRoute usuario={usuario}>
                <RegistroFlow
                  onRegistro={(user) => actualizarUsuario(user)}
                  onLogin={null}
                />
              </PublicOnlyRoute>
            }
          />

          <Route path="/pruebas" element={<Pruebas idJugador={idJugador} usuario={usuario} />} />
          <Route path="/entrenamientos" element={<PaginaEntrenamientos usuario={usuario} />} />
          <Route path="/entrenadores" element={<EntrenadoresView usuario={usuario} />} />
          <Route path="/clubes" element={<JugadoresView usuario={usuario} />} />
          <Route path="/empleos" element={<Empleos usuario={usuario} />} />

          {/* ── Protegidas ── */}
          <Route
            path="/calendario"
            element={
              <ProtectedRoute usuario={usuario}>
                <Calendario usuario={usuario} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute usuario={usuario}>
                <MiPerfil usuario={usuario} />
              </ProtectedRoute>
            }
          />

          {/* ── 404 ── */}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
