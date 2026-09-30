import React, { useState, useEffect } from 'react';
import Avatar from '../components/Avatar.jsx';
import ModalCalificar from './ModalCalificar.jsx';
import './PerfilResenas.css';

// Componente para renderizar estrellas fijas (1 a 5)
const EstrellasRating = ({ cantidad = 5 }) => {
  const estrellasVal = Math.max(1, Math.min(5, Math.round(Number(cantidad) || 5)));
  return (
    <div className="resena-estrellas-row" aria-label={`${estrellasVal} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((num) => (
        <svg
          key={num}
          className={`resena-estrella-icon ${num <= estrellasVal ? 'llena' : 'vacia'}`}
          viewBox="0 0 24 24"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="resena-puntuacion-num">{estrellasVal}.0</span>
    </div>
  );
};

export default function PerfilResenas({
  perfil,
  usuarioEnSesion,
  reseniasData = { promedio: 0, total: 0, opiniones: [] },
  cargando = false,
  verificacion = { puedeCalificar: false, yaCalifico: false, eventosPasados: [] },
  onResenaCreada,
  tipoEntidad = 'entrenador',
  idEntidad,
  idJugadorSesion,
  idEntrenadorSesion,
  esPerfilPropio = false,
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [yaCalificoLocal, setYaCalificoLocal] = useState(false);

  // Sincronizar estado yaCalifico desde props de verificación
  useEffect(() => {
    if (verificacion?.yaCalifico !== undefined) {
      setYaCalificoLocal(Boolean(verificacion.yaCalifico));
    }
  }, [verificacion?.yaCalifico]);

  const opiniones = Array.isArray(reseniasData?.opiniones)
    ? reseniasData.opiniones
    : Array.isArray(reseniasData?.resenias)
      ? reseniasData.resenias
      : [];

  const totalOpiniones = Number(reseniasData?.total ?? opiniones.length);

  // Verificaciones de usuario y rol
  const idPerfilUsuario = perfil?.idusuario || perfil?.idUsuario || perfil?.id;
  const idSesion = usuarioEnSesion?.idusuario || usuarioEnSesion?.idUsuario || usuarioEnSesion?.id;
  const esDuenio = esPerfilPropio || (
    Boolean(idPerfilUsuario && idSesion && Number(idPerfilUsuario) === Number(idSesion))
  );

  const rolSesion = usuarioEnSesion?.tipousuario?.toLowerCase() || '';
  const esJugadorLogueado = rolSesion === 'jugador';
  const esEntrenadorLogueado = rolSesion === 'entrenador';

  // Regla de habilitación:
  // - Si el destino es Club: pueden calificar Jugadores o Entrenadores
  // - Si el destino es Entrenador: pueden calificar Jugadores
  const tieneRolValidoParaCalificar =
    esJugadorLogueado || (tipoEntidad === 'club' && esEntrenadorLogueado);

  const usuarioAutenticado = Boolean(usuarioEnSesion && idSesion);

  // Mostrar acción siempre que esté autenticado, no sea dueño y tenga rol válido
  const mostrarAccionResenar = usuarioAutenticado && !esDuenio && tieneRolValidoParaCalificar;
  const eventosPasados = verificacion?.eventosPasados || verificacion?.eventos || [];

  // Nombre de la entidad a calificar
  const nombreEntidad = tipoEntidad === 'club'
    ? (perfil?.nombreClub || perfil?.nombre || 'Club')
    : `${perfil?.nombre || ''} ${perfil?.apellido || ''}`.trim() || 'Entrenador';

  const handleExitoResena = (datosRespuesta) => {
    setYaCalificoLocal(true);
    if (typeof onResenaCreada === 'function') {
      onResenaCreada(datosRespuesta);
    }
  };

  return (
    <>
      <section className="perfil-resenas-card">
        {/* Cabecera de la sección RESEÑAS */}
        <div className="resenas-header resenas-card-header">
          <div className="resenas-title-group resenas-card-header-left">
            <svg className="resenas-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <h3>RESEÑAS</h3>
            {totalOpiniones > 0 && (
              <span className="resenas-badge resenas-count-badge">{totalOpiniones}</span>
            )}
          </div>

          {/* Botón / Badge condicional según reglas de rol flexibilizadas */}
          {mostrarAccionResenar && (
            <div className="resenas-card-header-actions">
              {yaCalificoLocal ? (
                <span className="resena-ya-calificado-badge" title="Ya has calificado a este perfil">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Ya calificado
                </span>
              ) : (
                <button
                  type="button"
                  className="btn-agregar-resena btn-dejar-resena-sutil"
                  onClick={() => setModalAbierto(true)}
                  title="Agregar una reseña a este perfil"
                >
                  + AGREGAR RESEÑA
                </button>
              )}
            </div>
          )}
        </div>

        {/* Contenido de la tarjeta */}
        {cargando ? (
          <div className="resenas-loading-indicator">
            <div className="resenas-mini-spinner"></div>
            <span>Cargando reseñas...</span>
          </div>
        ) : opiniones.length === 0 ? (
          <div className="resenas-empty-sobrio">
            <svg className="resenas-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="resenas-empty-text">Aún no hay reseñas registradas.</p>
          </div>
        ) : (
          <div className="resenas-scroll-container">
            {opiniones.map((item, idx) => {
              const estrellas = Number(
                item.estrellitas ?? item.calificacion ?? item.estrellas ?? item.rating ?? item.puntuacion ?? 5
              );
              const opinion =
                item.textoopinion || item.opinion || item.texto || item.comentario || item.descripcion || '';

              // Datos del autor que opinó (sea jugador o entrenador)
              const autorInfo = item.jugador || item.entrenador || item.usuario || item;
              const nombreAutor = autorInfo
                ? `${autorInfo.nombre || ''} ${autorInfo.apellido || ''}`.trim() || item.autor || 'Usuario'
                : (item.autor || 'Usuario');
              const fotoAutor = autorInfo?.fotoperfil || item.fotoperfil || autorInfo?.foto_perfil || null;

              // Rol dinámico del autor: "JUGADOR" o "ENTRENADOR"
              const rolAutorRaw =
                item.rolAutor ||
                item.rol_autor ||
                item.rol ||
                autorInfo?.tipousuario ||
                item.tipousuario ||
                (item.identrenador_autor || (item.identrenador && item.idclub) ? 'ENTRENADOR' : 'JUGADOR');

              const esEntrenadorAutor =
                typeof rolAutorRaw === 'string' && rolAutorRaw.toUpperCase().includes('ENTRENADOR');

              const rolBadgeTexto = esEntrenadorAutor ? 'Entrenador' : 'Jugador';
              const rolBadgeClase = esEntrenadorAutor ? 'badge-entrenador' : 'badge-jugador';

              return (
                <article key={item.idresenia || item.id || idx} className="resena-card-dark resena-card">
                  {/* Estrellas (1 a 5) */}
                  <EstrellasRating cantidad={estrellas} />

                  {/* Texto de la opinión entre comillas */}
                  <p className="resena-opinion-texto">"{opinion}"</p>

                  {/* Avatar circular pequeño, iniciales y nombre del autor con badge dinámico */}
                  <div className="resena-autor-row">
                    <Avatar
                      src={fotoAutor}
                      nombre={nombreAutor}
                      size={28}
                      className="resena-avatar-mini"
                    />
                    <div className="resena-autor-info">
                      <span className="resena-autor-nombre">{nombreAutor}</span>
                      <span className={`resena-autor-rol-badge ${rolBadgeClase}`}>
                        {rolBadgeTexto}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── MODAL CENTRADO PARA CALIFICAR ── */}
      <ModalCalificar
        abierto={modalAbierto}
        onClose={() => setModalAbierto(false)}
        nombreEntidad={nombreEntidad}
        tipoEntidad={tipoEntidad}
        idEntidad={idEntidad}
        idJugadorSesion={idJugadorSesion}
        idEntrenadorSesion={idEntrenadorSesion}
        usuarioEnSesion={usuarioEnSesion}
        eventosPasados={eventosPasados}
        onExito={handleExitoResena}
      />
    </>
  );
}
