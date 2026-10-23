import React, { useState, useEffect } from 'react';
import api from '../axiosConfig.js';

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
    <section className="pf-bloque" aria-labelledby="pf-bio-titulo">
      <div className="pf-bloque-head">
        <h2 id="pf-bio-titulo" className="pf-seccion-titulo">Biografía</h2>
        {esDuenio && !modoEdicion && (
          <button type="button" className="pr-link" onClick={handleIniciarEdicion}>{tieneTexto ? 'Editar' : 'Escribir'}</button>
        )}
      </div>

      {!modoEdicion ? (
        tieneTexto ? (
          <p className="pf-bio">{biografia}</p>
        ) : (
          <p className="pr-muted">
            {esDuenio
              ? 'Todavía no escribiste tu biografía. Contá tu trayectoria, tus logros y qué estás buscando.'
              : 'Todavía no escribió su biografía.'}
          </p>
        )
      ) : (
        <form onSubmit={handleGuardar} className="pf-bio-form">
          <label className="pf-campo">
            <span className="pr-sr">Biografía</span>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Tu trayectoria, logros y lo que estás buscando."
              maxLength={1000}
              rows={5}
              disabled={guardando}
              autoFocus
            />
            <small>{texto.length}/1000</small>
          </label>
          {errorMsg && <p className="pr-error">{errorMsg}</p>}
          <div className="pf-bio-acciones">
            <button type="button" className="pr-link" onClick={handleCancelar} disabled={guardando}>Cancelar</button>
            <button type="submit" className="pr-btn pr-btn--sm" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      )}
    </section>
  );
};

export default PerfilBiografia;
