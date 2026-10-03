import React, { useState, useEffect, useRef } from 'react';
import './InputDireccionOSM.css';

/**
 * Componente de Búsqueda y Autocompletado con Nominatim (OpenStreetMap)
 * para seleccionar direcciones exactas en Argentina sin claves de pago.
 */
const InputDireccionOSM = ({
  value = '',
  onSelectUbicacion,
  onChangeText,
  placeholder = 'ej. Buenos Aires, Cancha Central o Av. Corrientes 1234',
  className = '',
  required = false,
  disabled = false
}) => {
  const [query, setQuery] = useState(value || '');
  const [sugerencias, setSugerencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const contenedorRef = useRef(null);

  // Sincronizar si cambia el valor externo
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  // Debounce de 350ms para consultar Nominatim
  useEffect(() => {
    const texto = query.trim();
    if (texto.length < 3) {
      setSugerencias([]);
      setMostrarDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setCargando(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          texto
        )}&countrycodes=ar&limit=5&addressdetails=1`;
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'es',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setSugerencias(data || []);
          setMostrarDropdown(true);
        }
      } catch (err) {
        console.error('Error buscando dirección en Nominatim:', err);
      } finally {
        setCargando(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInputChange = (e) => {
    const nuevoTexto = e.target.value;
    setQuery(nuevoTexto);
    if (onChangeText) {
      onChangeText(nuevoTexto);
    }
  };

  const handleSelect = (item) => {
    const display = item.display_name;
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const zona =
      item.address?.city ||
      item.address?.town ||
      item.address?.suburb ||
      item.address?.municipality ||
      item.address?.state ||
      'CABA';

    setQuery(display);
    setMostrarDropdown(false);

    if (onSelectUbicacion) {
      onSelectUbicacion({
        direccion: display,
        latitud: lat,
        longitud: lon,
        zona: zona,
      });
    }
    if (onChangeText) {
      onChangeText(display);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSugerencias([]);
    setMostrarDropdown(false);
    if (onChangeText) onChangeText('');
    if (onSelectUbicacion) {
      onSelectUbicacion({
        direccion: '',
        latitud: null,
        longitud: null,
        zona: '',
      });
    }
  };

  // Extraer nombre principal y secundario para mejor lectura
  const formatearTextoItem = (item) => {
    const partes = item.display_name.split(',');
    const principal = partes[0]?.trim() || item.display_name;
    const secundario = partes.slice(1).join(',').trim();
    return { principal, secundario };
  };

  return (
    <div className={`input-direccion-osm-container ${className}`} ref={contenedorRef}>
      <div className="input-direccion-osm-wrapper">
        <input
          type="text"
          className="input-direccion-osm-input"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (sugerencias.length > 0) setMostrarDropdown(true);
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />

        {cargando ? (
          <div className="input-direccion-osm-spinner" />
        ) : query ? (
          <button
            type="button"
            className="input-direccion-osm-clear"
            onClick={handleClear}
            title="Limpiar dirección"
          >
            ×
          </button>
        ) : null}
      </div>

      {mostrarDropdown && (
        <ul className="input-direccion-osm-dropdown">
          {sugerencias.length === 0 && !cargando ? (
            <li className="input-direccion-osm-empty">
              No se encontraron resultados en Argentina
            </li>
          ) : (
            sugerencias.map((item, index) => {
              const { principal, secundario } = formatearTextoItem(item);
              return (
                <li
                  key={item.place_id || index}
                  className="input-direccion-osm-item"
                  onClick={() => handleSelect(item)}
                >
                  <svg
                    className="input-direccion-osm-icon"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div className="input-direccion-osm-text">
                    <span className="input-direccion-osm-primary">{principal}</span>
                    {secundario && (
                      <span className="input-direccion-osm-secondary">{secundario}</span>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default InputDireccionOSM;
