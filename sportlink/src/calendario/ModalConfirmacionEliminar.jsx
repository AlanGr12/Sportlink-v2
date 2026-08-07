import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * ModalConfirmacionEliminar — Popup estilizado para confirmar eliminación de un evento.
 */
export default function ModalConfirmacionEliminar({
  evento,
  onConfirmar,
  onCerrar,
  eliminando = false,
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !eliminando) onCerrar();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCerrar, eliminando]);

  if (!evento) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(5px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !eliminando) onCerrar();
      }}
    >
      <div
        style={{
          backgroundColor: '#121415',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '32px 28px',
          textAlign: 'center',
          color: '#ffffff',
          maxWidth: '420px',
          width: '90%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'inherit',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícono de advertencia / tacho */}
        <div
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
            flexShrink: 0,
          }}
        >
          <svg
            style={{ width: '28px', height: '28px', color: '#ef4444' }}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: '0 0 8px 0', fontFamily: 'Space Grotesk, sans-serif' }}>
          ¿Eliminar evento?
        </h3>

        <p style={{ fontSize: '14px', color: '#8b949e', margin: '0 0 24px 0', lineHeight: '1.5', fontFamily: 'Manrope, sans-serif' }}>
          ¿Estás seguro de que querés eliminar el evento <strong style={{ color: '#ffffff' }}>"{evento.nombre}"</strong>? Esta acción no se puede deshacer.
        </p>

        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '11px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: eliminando ? 'not-allowed' : 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'transparent',
              color: '#8b949e',
              fontFamily: 'Space Grotesk, sans-serif',
              transition: 'background 0.15s, color 0.15s',
              opacity: eliminando ? 0.5 : 1,
            }}
            onClick={onCerrar}
            disabled={eliminando}
          >
            CANCELAR
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '11px',
              fontSize: '13px',
              fontWeight: '700',
              borderRadius: '8px',
              cursor: eliminando ? 'not-allowed' : 'pointer',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.5px',
              transition: 'background 0.15s, transform 0.15s',
              opacity: eliminando ? 0.7 : 1,
            }}
            onClick={onConfirmar}
            disabled={eliminando}
          >
            {eliminando ? 'ELIMINANDO...' : 'ELIMINAR'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
