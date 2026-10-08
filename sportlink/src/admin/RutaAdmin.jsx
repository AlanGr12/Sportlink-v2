import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * RutaAdmin
 * Protege el acceso al Backoffice.
 * - Sin sesión -> Redirige a /login
 * - Sesión activa pero es_admin !== true -> Redirige a / con alerta
 */
export default function RutaAdmin({ usuario, children }) {
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (usuario.es_admin !== true) {
    alert('Acceso no autorizado. Se requieren permisos de administrador para ingresar al Backoffice.')
    return <Navigate to="/" replace />
  }

  return children
}
