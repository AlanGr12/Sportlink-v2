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
const ModalContactoEntrenador = ({ entrenador, entrenadores, entrenamiento, onCerrar, onEnviado }) => {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null); // { exitos, fallos } — solo en envío masivo

  const destinatarios = (entrenadores && entrenadores.length) ? entrenadores : (entrenador ? [entrenador] : []);
  const esMasivo = destinatarios.length > 1;
  const nombreCompleto = esMasivo
    ? `${destinatarios.length} personas`
    : ([destinatarios[0]?.nombre, destinatarios[0]?.apellido].filter(Boolean).join(' ') || 'el entrenador');
  const titulo = entrenamiento?.titulo;

  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previo; };
  }, []);

  const handleEnviar = async () => {
    if (!mensaje.trim() || enviando || destinatarios.length === 0) return;
    setEnviando(true);
    setError('');

    if (!esMasivo) {
      try {
        const { data: conversacion } = await api.post('/api/conversaciones/privada', {
          idusuarioReceptor: destinatarios[0].idusuario,
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
      return;
    }

    const resultados = await Promise.allSettled(destinatarios.map(async (d) => {
      const { data: conversacion } = await api.post('/api/conversaciones/privada', { idusuarioReceptor: d.idusuario });
      await api.post(`/api/conversaciones/${conversacion.idconversacion}/mensajes`, { contenido: mensaje.trim() });
    }));
    const exitos = resultados.filter((r) => r.status === 'fulfilled').length;
    const fallos = resultados.length - exitos;
    setResultado({ exitos, fallos });
    setEnviando(false);
    if (fallos === 0 && onEnviado) onEnviado();
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
              : esMasivo
                ? 'Escribí tu mensaje y se lo enviaremos a todos los seleccionados.'
                : 'Escribí tu mensaje inicial y lo recibirá directamente en su bandeja.'}
          </p>
        </div>

        {resultado ? (
          <p style={{ color: resultado.fallos === 0 ? '#6ee7b7' : '#fbbf24', fontSize: 13, textAlign: 'center', margin: '8px 0' }}>
            {resultado.fallos === 0
              ? `Mensaje enviado a ${resultado.exitos} ${resultado.exitos === 1 ? 'persona' : 'personas'}.`
              : `Se envió a ${resultado.exitos} de ${destinatarios.length}. ${resultado.fallos} fallaron.`}
          </p>
        ) : (
          <>
            <textarea
              className="contacto-ent-textarea"
              placeholder={`Hola ${esMasivo ? '' : (destinatarios[0]?.nombre || '')}, me interesa...`}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={4}
              autoFocus
              maxLength={500}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleEnviar(); }}
            />
            <div className="contacto-ent-contador">{mensaje.length}/500</div>
          </>
        )}

        {error && <div className="contacto-ent-error">{error}</div>}

        <div className="contacto-ent-acciones">
          <button type="button" className="contacto-ent-btn-cancelar" onClick={onCerrar} disabled={enviando}>
            {resultado ? 'Cerrar' : 'Cancelar'}
          </button>
          {!resultado && (
            <button
              type="button"
              className="contacto-ent-btn-enviar"
              onClick={handleEnviar}
              disabled={!mensaje.trim() || enviando}
            >
              {enviando ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalContactoEntrenador;
