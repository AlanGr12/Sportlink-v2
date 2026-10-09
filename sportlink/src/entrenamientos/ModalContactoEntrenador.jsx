import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../axiosConfig.js';
import './ModalContactoEntrenador.css';

/**
 * Popup "Contactar entrenador" (mismo flujo que la vista Entrenadores):
 * crea/recupera la conversación privada, envía el mensaje inicial y
 * redirige al chat con esa conversación abierta.
 */
const ModalContactoEntrenador = ({ entrenador, entrenamiento, onCerrar, onEnviado }) => {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const nombreCompleto = [entrenador?.nombre, entrenador?.apellido].filter(Boolean).join(' ') || 'el entrenador';
  const titulo = entrenamiento?.titulo;

  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previo; };
  }, []);

  const handleEnviar = async () => {
    if (!mensaje.trim() || enviando) return;
    setEnviando(true);
    setError('');
    try {
      const { data: conversacion } = await api.post('/api/conversaciones/privada', {
        idusuarioReceptor: entrenador.idusuario,
      });
      await api.post(`/api/conversaciones/${conversacion.idconversacion}/mensajes`, {
        contenido: mensaje.trim(),
      });
      if (onEnviado) onEnviado();
      navigate('/mensajes', { state: { conversacionInicial: conversacion } });
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      setError('No se pudo enviar el mensaje. Intentá de nuevo.');
      setEnviando(false);
    }
  };

  return createPortal(
    <div
      className="contacto-ent-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget && !enviando) onCerrar(); }}
    >
      <div className="contacto-ent-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="contacto-ent-cerrar" aria-label="Cerrar" onClick={onCerrar} disabled={enviando}>✕</button>

        <div className="contacto-ent-cabecera">
          <svg viewBox="0 0 24 24" width="34" height="34" stroke="#2DEFF2" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <h2>Contactar a {nombreCompleto}</h2>
          <p>
            {titulo
              ? `Consultale por "${titulo}". Lo recibirá directamente en su bandeja.`
              : 'Escribí tu mensaje inicial y lo recibirá directamente en su bandeja.'}
          </p>
        </div>

        <textarea
          className="contacto-ent-textarea"
          placeholder={`Hola ${entrenador?.nombre || ''}, me interesa...`}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={4}
          autoFocus
          maxLength={500}
          onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleEnviar(); }}
        />
        <div className="contacto-ent-contador">{mensaje.length}/500</div>

        {error && <div className="contacto-ent-error">{error}</div>}

        <div className="contacto-ent-acciones">
          <button type="button" className="contacto-ent-btn-cancelar" onClick={onCerrar} disabled={enviando}>
            Cancelar
          </button>
          <button
            type="button"
            className="contacto-ent-btn-enviar"
            onClick={handleEnviar}
            disabled={!mensaje.trim() || enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalContactoEntrenador;
