import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { formatearUbicacionCorta } from '../../utils/mapUtils.js';
import './MapaUbicacionDark.css';

/**
 * Componente interno para centrar el mapa dinámicamente cuando cambian las coordenadas
 */
function SetViewOnChange({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1] && !isNaN(coords[0]) && !isNaN(coords[1])) {
      map.setView(coords, map.getZoom() || 15);
    }
  }, [coords, map]);
  return null;
}

/**
 * Tarjeta de Ubicación Dark con Leaflet + CARTO Dark Matter (Imagen 2)
 */
const MapaUbicacionDark = ({
  latitud,
  longitud,
  direccion = '',
  zona = '',
  nombre = '',
  tipo = 'club',
  esEditable = false,
  onEditar,
  height = '190px',
  className = '',
  mostrarFooter = true,
}) => {
  const lat = Number(latitud);
  const lon = Number(longitud);

  // Si no hay coordenadas válidas, no renderizar mapa roto
  if (isNaN(lat) || isNaN(lon) || !lat || !lon) {
    return null;
  }

  const coords = [lat, lon];

  // Redirección directa a Google Maps
  const handleAbrirGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Formatear dirección concisa para la etiqueta flotante bajo el pin
  const direccionCorta = (() => {
    if (!direccion) return '';
    return formatearUbicacionCorta(direccion);
  })();

  const zonaTitulo = zona
    ? formatearUbicacionCorta(zona)
    : (direccion ? formatearUbicacionCorta(direccion) : 'CABA');

  const direccionLimpia = direccion ? formatearUbicacionCorta(direccion) : '';
  const mostrarDireccionSecundaria =
    direccionLimpia &&
    direccionLimpia.trim().toLowerCase() !== zonaTitulo.trim().toLowerCase();

  const tipoTexto = tipo ? String(tipo).toLowerCase() : 'club';
  const nombreTexto = nombre ? String(nombre).toLowerCase() : 'comunicaciones';

  // Marcador central con L.divIcon
  const customIcon = L.divIcon({
    className: 'mapa-custom-div-icon',
    html: `
      <div class="mapa-marker-container">
        <div class="mapa-marker-pill">
          <span class="mapa-marker-tipo">${tipoTexto}</span>
          <span class="mapa-marker-nombre">${nombreTexto}</span>
        </div>
        <div class="mapa-marker-pin">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="#2DEFF2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        ${direccionCorta ? `<div class="mapa-marker-direccion">${direccionCorta}</div>` : ''}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  return (
    <div className={`mapa-ubicacion-dark-card ${className}`}>
      {/* Contenedor del mapa interactivo */}
      <div
        className="mapa-ubicacion-canvas-wrapper"
        style={{ height }}
        onClick={handleAbrirGoogleMaps}
        title="Hacer clic para abrir en Google Maps"
      >
        <div className="mapa-ubicacion-hover-badge">
          Abrir en Google Maps ↗
        </div>

        <MapContainer
          center={coords}
          zoom={15}
          scrollWheelZoom={false}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          doubleClickZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Capa de mapa limpia sin marcas de agua de API KEY */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            subdomains={['a', 'b', 'c']}
            maxZoom={19}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <SetViewOnChange coords={coords} />
          <Marker position={coords} icon={customIcon} />
        </MapContainer>
      </div>

      {/* Pie de tarjeta con Zona, Lápiz de edición y Dirección concisa */}
      {mostrarFooter && (
        <div className="mapa-ubicacion-footer">
          <div className="mapa-ubicacion-header-row">
            <h3 className="mapa-ubicacion-zona-titulo">{zonaTitulo}</h3>
            {esEditable && (
              <button
                type="button"
                className="mapa-ubicacion-btn-editar"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEditar) onEditar();
                }}
                title="Editar ubicación"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
            )}
          </div>
          {mostrarDireccionSecundaria && (
            <p className="mapa-ubicacion-direccion-texto">{direccionLimpia}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MapaUbicacionDark;
