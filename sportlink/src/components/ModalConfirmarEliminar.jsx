import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * ModalConfirmarEliminar — popup genérico de confirmación para borrados destructivos
 * (usado en moderación de administrador y en eliminación de posts/pruebas/entrenamientos/cuentas).
 *
 * Props:
 *  - abierto:     boolean
 *  - titulo:      string
 *  - mensaje:     ReactNode
 *  - textoConfirmar: string (default 'ELIMINAR')
 *  - eliminando:  boolean — deshabilita botones mientras corre el request
 *  - error:       string | null — mensaje de error a mostrar dentro del modal
 *  - onConfirmar / onCerrar
 */
export default function ModalConfirmarEliminar({
  abierto,
  titulo = '¿Eliminar?',
  mensaje,
  textoConfirmar = 'ELIMINAR',
  eliminando = false,
  error = null,
  onConfirmar,
  onCerrar,
}) {
  useEffect(() => {
    if (!abierto) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape' && !eliminando) onCerrar() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [abierto, eliminando, onCerrar])

  if (!abierto) return null

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)',
      }}
      onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget && !eliminando) onCerrar() }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        style={{
          backgroundColor: '#121415', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px', padding: '32px 28px', textAlign: 'center', color: '#fff',
          maxWidth: '420px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 60, height: 60, backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.35)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
          }}
        >
          <svg width="28" height="28" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', fontFamily: 'Space Grotesk, sans-serif' }}>
          {titulo}
        </h3>
        <p style={{ fontSize: 14, color: '#8b949e', margin: '0 0 20px', lineHeight: 1.5, fontFamily: 'Manrope, sans-serif' }}>
          {mensaje}
        </p>

        {error && (
          <p style={{ fontSize: 13, color: '#ef4444', margin: '0 0 16px', fontFamily: 'Manrope, sans-serif' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            type="button"
            onClick={onCerrar}
            disabled={eliminando}
            style={{
              flex: 1, padding: 11, fontSize: 13, fontWeight: 600, borderRadius: 8,
              cursor: eliminando ? 'not-allowed' : 'pointer',
              border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#8b949e',
              fontFamily: 'Space Grotesk, sans-serif', opacity: eliminando ? 0.5 : 1,
            }}
          >
            CANCELAR
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={eliminando}
            style={{
              flex: 1, padding: 11, fontSize: 13, fontWeight: 700, borderRadius: 8,
              cursor: eliminando ? 'not-allowed' : 'pointer', border: 'none',
              backgroundColor: '#ef4444', color: '#fff', letterSpacing: '0.5px',
              fontFamily: 'Space Grotesk, sans-serif', opacity: eliminando ? 0.7 : 1,
            }}
          >
            {eliminando ? 'ELIMINANDO...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
