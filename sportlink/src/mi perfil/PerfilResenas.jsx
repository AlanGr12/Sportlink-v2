import React, { useState, useEffect } from 'react';
import AvatarCuadrado from '../components/AvatarCuadrado.jsx';
import ModalCalificar from './ModalCalificar.jsx';

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
      <section className="pf-bloque" aria-labelledby="pf-resenas-titulo">
        <div className="pf-bloque-head">
          <h2 id="pf-resenas-titulo" className="pf-seccion-titulo">
            Reseñas{totalOpiniones > 0 && <span className="pf-cuenta">{totalOpiniones}</span>}
          </h2>
          {mostrarAccionResenar && (
            yaCalificoLocal
              ? <span className="pf-ya-calificado">Ya la calificaste</span>
              : <button type="button" className="pr-link" onClick={() => setModalAbierto(true)}>Dejar reseña</button>
          )}
        </div>

        {cargando ? (
          <div className="pf-resena pf-resena--skeleton" aria-label="Cargando reseñas" />
        ) : opiniones.length === 0 ? (
          <p className="pr-muted">Todavía no tiene reseñas.</p>
        ) : (
          <ul className="pf-resenas">
            {opiniones.map((item, idx) => {
              const estrellas = Math.max(1, Math.min(5, Math.round(Number(
                item.estrellitas ?? item.calificacion ?? item.estrellas ?? item.rating ?? item.puntuacion ?? 5
              ) || 5)));
              const opinion = item.textoopinion || item.opinion || item.texto || item.comentario || item.descripcion || '';
              const autorInfo = item.jugador || item.entrenador || item.usuario || item;
              const nombreAutor = autorInfo
                ? `${autorInfo.nombre || ''} ${autorInfo.apellido || ''}`.trim() || item.autor || 'Usuario'
                : (item.autor || 'Usuario');
              const fotoAutor = autorInfo?.fotoperfil || item.fotoperfil || autorInfo?.foto_perfil || null;
              const rolAutorRaw =
                item.rolAutor || item.rol_autor || item.rol || autorInfo?.tipousuario || item.tipousuario ||
                (item.identrenador_autor || (item.identrenador && item.idclub) ? 'ENTRENADOR' : 'JUGADOR');
              const esEntrenadorAutor = typeof rolAutorRaw === 'string' && rolAutorRaw.toUpperCase().includes('ENTRENADOR');

              return (
                <li key={item.idresenia || item.id || idx} className="pf-resena">
                  <p className="pf-estrellas" aria-label={`${estrellas} de 5 estrellas`}>
                    <span aria-hidden="true">{'★'.repeat(estrellas)}<i>{'★'.repeat(5 - estrellas)}</i></span>
                  </p>
                  {opinion && <p className="pf-resena-texto">{opinion}</p>}
                  <div className="pf-resena-autor">
                    <AvatarCuadrado src={fotoAutor} nombre={nombreAutor} size={32} />
                    <span><strong>{nombreAutor}</strong> · {esEntrenadorAutor ? 'Entrenador' : 'Jugador'}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

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
