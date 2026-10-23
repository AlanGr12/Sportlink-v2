import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../axiosConfig.js';
import MapaUbicacionDark from '../components/maps/MapaUbicacionDark.jsx';
import InputDireccionOSM from '../components/maps/InputDireccionOSM.jsx';
import { formatearUbicacionCorta } from '../utils/mapUtils.js';

/*
  Tarjeta lateral "PERFIL":
  - Ubicada en la columna lateral derecha de la pantalla de perfil.
  - Para Clubes y Entrenadores, muestra el valor dinámico RATING (ej: 4.9 ★)
    calculado a partir del promedio devuelto por el backend (GET /api/resenias/:tipo/:id).
  - Para Jugadores, muestra los campos deportivos específicos sin incluir el rating de reseñas.
  - Para Clubes o Entrenadores con latitud y longitud, renderiza MapaUbicacionDark.
  - Si es perfil propio, permite editar la ubicación en el mapa.
*/
const calcularEdad = (fecha) => {
  if (!fecha) return null;
  const nac = new Date(String(fecha).slice(0, 10) + 'T00:00:00');
  if (isNaN(nac)) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad >= 0 ? edad : null;
};

const PerfilSidebar = ({
  perfil,
  ratingPromedio,
  totalResenas,
  esPerfilPropio = false,
  onUbicacionActualizada,
}) => {
  const [modalUbicacionAbierto, setModalUbicacionAbierto] = useState(false);
  const [nuevaUbicacion, setNuevaUbicacion] = useState(null);
  const [guardandoUbicacion, setGuardandoUbicacion] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState('');

  if (!perfil) return null;

  const lat = perfil?.latitud;
  const lon = perfil?.longitud;
  const tieneCoordenadas =
    lat !== null &&
    lat !== undefined &&
    lat !== '' &&
    !isNaN(Number(lat)) &&
    lon !== null &&
    lon !== undefined &&
    lon !== '' &&
    !isNaN(Number(lon)) &&
    (Number(lat) !== 0 || Number(lon) !== 0);

  const rol = perfil?.tipousuario?.toLowerCase();
  const esClub = rol === 'club';
  const esClubOEntrenador = rol === 'entrenador' || esClub;

  const abrirModalUbicacion = () => {
    setNuevaUbicacion(null);
    setErrorUbicacion('');
    setModalUbicacionAbierto(true);
  };

  const cerrarModalUbicacion = () => {
    if (guardandoUbicacion) return;
    setModalUbicacionAbierto(false);
    setNuevaUbicacion(null);
    setErrorUbicacion('');
  };

  const handleGuardarUbicacion = async () => {
    if (!nuevaUbicacion || !nuevaUbicacion.latitud || !nuevaUbicacion.longitud) {
      setErrorUbicacion('Por favor seleccioná una dirección de la lista desplegable.');
      return;
    }

    setGuardandoUbicacion(true);
    setErrorUbicacion('');

    try {
      const idEntidad =
        perfil?.idclub ||
        perfil?.idClub ||
        perfil?.id_club ||
        perfil?.identrenador ||
        perfil?.idEntrenador ||
        perfil?.idusuario ||
        perfil?.idUsuario;

      const payload = {
        direccion: nuevaUbicacion.direccion,
        latitud: Number(nuevaUbicacion.latitud),
        longitud: Number(nuevaUbicacion.longitud),
        ubicacion:
          nuevaUbicacion.zona ||
          nuevaUbicacion.direccion.split(',')[1]?.trim() ||
          perfil.ubicacion ||
          'CABA',
      };

      // Si es club o tiene idclub, actualizar mediante PUT /api/clubes/perfil/:id
      await api.put(`/api/clubes/perfil/${idEntidad}`, payload);

      if (onUbicacionActualizada) {
        onUbicacionActualizada(payload);
      }

      setModalUbicacionAbierto(false);
      setNuevaUbicacion(null);
    } catch (err) {
      console.error('Error al actualizar ubicación en perfil:', err);
      setErrorUbicacion(
        err?.response?.data?.error ||
          err?.message ||
          'Error al actualizar la ubicación.'
      );
    } finally {
      setGuardandoUbicacion(false);
    }
  };


  // Extraer deporte legible
  const deporteStr = perfil.deporte?.deporte || 
    (Array.isArray(perfil.deportes) ? perfil.deportes.map(d => d.deporte || d).join(', ') : perfil.deporte) || null;

  // Rating formateado dinámicamente
  const tieneRatingCalculado = ratingPromedio !== undefined && ratingPromedio !== null;
  const ratingValor = tieneRatingCalculado && Number(ratingPromedio) > 0
    ? `★ ${Number(ratingPromedio).toFixed(1).replace('.', ',')}${totalResenas > 0 ? ` · ${totalResenas} ${totalResenas === 1 ? 'reseña' : 'reseñas'}` : ''}`
    : 'Sin reseñas todavía';

  // Configuración de campos dinámicos
  const items = [];

  // Métrica RATING en tarjeta PERFIL (SOLO para Clubes y Entrenadores)
  if (esClubOEntrenador) {
    items.push({
      key: 'rating',
      label: 'Calificación',
      value: ratingValor,
    });
  }

  if (deporteStr) {
    items.push({ key: 'deporte', label: 'Deporte', value: deporteStr });
  }

  if (esClubOEntrenador) {
    // Si no tiene coordenadas cargadas pero tiene texto o es dueño, mostrar fila con opción de editar
    if (!tieneCoordenadas && (perfil.ubicacion || perfil.direccion || esPerfilPropio)) {
      items.push({
        key: 'ubicacion',
        label: 'Ubicación',
        value: (
          <span className="pf-dato-ubic">
            <span>{formatearUbicacionCorta(perfil.ubicacion || perfil.direccion) || 'Sin cargar'}</span>
            {esPerfilPropio && (
              <button type="button" className="pr-link" onClick={abrirModalUbicacion}>Ubicar en el mapa</button>
            )}
          </span>
        ),
      });
    }
  } else if (perfil.ubicacion) {
    items.push({ key: 'ubicacion', label: 'Ubicación', value: formatearUbicacionCorta(perfil.ubicacion) });
  }

  if (perfil.titulo) {
    items.push({ key: 'titulo', label: 'Título', value: perfil.titulo });
  }

  if (perfil.experiencia) {
    items.push({ key: 'experiencia', label: 'Experiencia', value: perfil.experiencia });
  }

  if (perfil.categoria) {
    items.push({ key: 'categoria', label: 'Categoría', value: perfil.categoria });
  }

  // La edad se calcula desde la fecha de nacimiento (solo jugadores y entrenadores)
  if (!esClub) {
    const edad = calcularEdad(perfil.fechanacimiento);
    if (edad !== null) items.push({ key: 'edad', label: 'Edad', value: `${edad} años` });
  }

  if (perfil.genero) {
    items.push({ key: 'genero', label: 'Género', value: perfil.genero });
  }

  if (items.length === 0 && !(esClubOEntrenador && tieneCoordenadas)) return null;

  return (
    <>
      {items.length > 0 && (
        <section className="pf-bloque" aria-labelledby="pf-datos-titulo">
          <h2 id="pf-datos-titulo" className="pf-seccion-titulo">Datos</h2>
          <dl className="pf-datos">
            {items.map((item) => (
              <div key={item.key}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {esClubOEntrenador && tieneCoordenadas && (
        <section className="pf-bloque pf-mapa" aria-label="Ubicación en el mapa">
          <MapaUbicacionDark
            latitud={lat}
            longitud={lon}
            direccion={perfil.direccion || perfil.ubicacion || ''}
            zona={formatearUbicacionCorta(perfil.ubicacion || perfil.direccion || 'CABA')}
            nombre={perfil.nombre || perfil.club?.nombre || ''}
            tipo={perfil.tipousuario || 'club'}
            esEditable={esPerfilPropio}
            onEditar={abrirModalUbicacion}
            height="200px"
          />
        </section>
      )}

      {modalUbicacionAbierto && createPortal(
        <div className="pr-overlay" onClick={cerrarModalUbicacion}>
          <div className="pr-modal pr-modal--form" role="dialog" aria-modal="true" aria-labelledby="pf-ubic-titulo" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-head pf-modal-head">
              <h2 id="pf-ubic-titulo" className="pr-modal-title">Ubicación en el mapa</h2>
              <button type="button" className="pr-close" onClick={cerrarModalUbicacion} disabled={guardandoUbicacion} aria-label="Cerrar">×</button>
            </div>
            <div className="pr-modal-body">
              <p className="pr-muted">Buscá la dirección exacta y elegila de la lista, así los deportistas saben cómo llegar.</p>
              <div className="pf-campo">
                <span>Dirección</span>
                <InputDireccionOSM
                  placeholder="Ej.: Av. San Martín 5125, Agronomía"
                  value={nuevaUbicacion ? nuevaUbicacion.direccion : (perfil.direccion || perfil.ubicacion || '')}
                  onSelectUbicacion={(loc) => { setNuevaUbicacion(loc); setErrorUbicacion(''); }}
                />
              </div>
              {nuevaUbicacion && <p className="pr-notice">Elegiste: <strong>{nuevaUbicacion.direccion}</strong></p>}
              {errorUbicacion && <p className="pr-error">{errorUbicacion}</p>}
            </div>
            <div className="pr-modal-foot">
              <button type="button" className="pr-btn pr-btn--ghost" onClick={cerrarModalUbicacion} disabled={guardandoUbicacion}>Cancelar</button>
              <button type="button" className="pr-btn" onClick={handleGuardarUbicacion} disabled={!nuevaUbicacion || guardandoUbicacion}>
                {guardandoUbicacion ? 'Guardando…' : 'Guardar ubicación'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default PerfilSidebar;
