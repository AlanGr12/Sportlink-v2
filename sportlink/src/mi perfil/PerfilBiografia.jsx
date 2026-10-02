import React, { useState, useEffect } from 'react';
import api from '../axiosConfig.js';
import './PerfilBiografia.css';

const IconoLapiz = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const PerfilBiografia = ({ biografia, esDuenio, onActualizar, onToast }) => {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [texto, setTexto] = useState(biografia || '');
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sincronizar estado cuando la prop biografia cambie
  useEffect(() => {
    setTexto(biografia || '');
  }, [biografia]);

  const handleIniciarEdicion = () => {
    setTexto(biografia || '');
    setErrorMsg(null);
    setModoEdicion(true);
  };

  const handleCancelar = () => {
    setTexto(biografia || '');
    setErrorMsg(null);
    setModoEdicion(false);
  };

  const handleGuardar = async (e) => {
    if (e) e.preventDefault();
    setGuardando(true);
    setErrorMsg(null);

    const textoLimpio = texto.trim();

    try {
      // Endpoint de actualización de biografía en backend
      const res = await api.put('/api/login/perfil/biografia', {
        biografia: textoLimpio
      });

      const biografiaActualizada = res.data?.biografia !== undefined ? res.data.biografia : textoLimpio;

      if (onActualizar) {
        onActualizar(biografiaActualizada);
      }

      if (onToast) {
        onToast('¡Biografía actualizada con éxito!');
      }

      setModoEdicion(false);
    } catch (err) {
      console.error('Error al actualizar la biografía:', err);
      const msg = err.response?.data?.error || err.message || 'No se pudo guardar la biografía.';
      setErrorMsg(msg);
    } finally {
      setGuardando(false);
    }
  };

  const tieneTexto = Boolean(biografia && biografia.trim().length > 0);

  return (
    <div className="perfil-biografia-card">
      <div className="perfil-biografia-header">
        <div className="perfil-biografia-title-wrap">
          <span className="perfil-biografia-title-indicator" />
          <h3 className="perfil-biografia-title">Biografía</h3>
        </div>

        {esDuenio && !modoEdicion && (
          <button
            type="button"
            className="perfil-biografia-btn-edit"
            onClick={handleIniciarEdicion}
            title="Editar biografía"
          >
            <IconoLapiz />
            <span>Editar</span>
          </button>
        )}
      </div>

      {!modoEdicion ? (
        tieneTexto ? (
          <p className="perfil-biografia-content">{biografia}</p>
        ) : (
          <p
            className={`perfil-biografia-placeholder ${esDuenio ? 'clickable' : ''}`}
            onClick={esDuenio ? handleIniciarEdicion : undefined}
          >
            {esDuenio
              ? 'Aún no has agregado una biografía. Haz clic en el lápiz para escribir sobre ti...'
              : 'Este usuario aún no ha agregado una biografía.'}
          </p>
        )
      ) : (
        <form onSubmit={handleGuardar} className="perfil-biografia-edit-form">
          <textarea
            className="perfil-biografia-textarea"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe sobre ti, tu trayectoria deportiva, logros y aspiraciones..."
            maxLength={1000}
            rows={4}
            disabled={guardando}
            autoFocus
          />

          {errorMsg && <div className="perfil-biografia-error">{errorMsg}</div>}

          <div className="perfil-biografia-edit-footer">
            <span className="perfil-biografia-char-count">
              {texto.length} / 1000 caracteres
            </span>

            <div className="perfil-biografia-actions">
              <button
                type="button"
                className="perfil-biografia-btn-cancel"
                onClick={handleCancelar}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="perfil-biografia-btn-save"
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default PerfilBiografia;
