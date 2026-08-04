import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const ModalConfirmacionInscripcion = ({ tipoEvento, nombreEvento, onCerrar }) => {
  let titulo = "";
  let descripcion = null;
  let textoBoton = "ENTENDIDO";

  if (tipoEvento === "empleo") {
    titulo = "¡Postulación Enviada!";
    descripcion = (
      <>Te postulaste con éxito a la vacante <strong>{nombreEvento}</strong>. El club recibirá tu currículum.</>
    );
    textoBoton = "ACEPTAR";
  } else if (tipoEvento === "prueba") {
    titulo = "¡Te has inscripto correctamente a la prueba!";
    descripcion = "Revisá los mensajes ya que se te ha agregado al grupo de chat de la prueba, y verificá en tu calendario que el evento se haya agendado. ¡Éxitos!";
  } else if (tipoEvento === "entrenamiento") {
    titulo = "¡Te has inscripto correctamente al entrenamiento!";
    descripcion = "Revisá los mensajes ya que se te ha agregado al grupo de chat del entrenamiento, y verificá en tu calendario que el evento se haya agendado. ¡Éxitos!";
  }

  // Bloquear scroll del body al mostrar modal
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div 
        style={{ 
          backgroundColor: '#1a1d1e', 
          padding: '32px', 
          borderRadius: '12px', 
          textAlign: 'center', 
          color: '#ffffff', 
          border: '1px solid #2d3032', 
          maxWidth: '420px', 
          width: '90%', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'inherit'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', flexShrink: 0 }}>
          <svg style={{ width: '32px', height: '32px', color: '#34d399', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"></path>
          </svg>
        </div>
        
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', margin: '0 0 8px 0' }}>
          {titulo}
        </h3>
        
        <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '0 0 24px 0', lineHeight: '1.5' }}>
          {descripcion}
        </p>
        
        <button 
          type="button" 
          style={{ padding: '10px 24px', fontSize: '13px', fontWeight: '700', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: 'var(--primary, #2DEFF2)', color: '#000' }}
          onClick={onCerrar}
        >
          {textoBoton}
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ModalConfirmacionInscripcion;
