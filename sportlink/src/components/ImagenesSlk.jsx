import { useState } from 'react';
import { normalizeAvatarUrl } from './Avatar.jsx';
import { iniciales } from '../utils/formato.js';

// URL usable de una imagen del backend (nombre de archivo, ruta de storage o URL);
// los placeholders genéricos ("Sin imagen") cuentan como sin imagen
const urlImagen = (src) => {
  const url = normalizeAvatarUrl(src);
  return url && !/placeholder/i.test(url) ? url : null;
};

// Avatar cuadrado del sistema (.pr-avatar): la foto si carga, si no las iniciales
export function AvatarSlk({ foto, nombre, grande = false }) {
  const url = urlImagen(foto);
  const [fallida, setFallida] = useState(null);
  return (
    <span className={`pr-avatar${grande ? ' pr-avatar--lg' : ''}`} aria-hidden="true">
      {url && fallida !== url
        ? <img src={url} alt="" loading="lazy" onError={() => setFallida(url)} />
        : iniciales(nombre)}
    </span>
  );
}

// Imagen del evento arriba de la tarjeta; sin foto, el deporte sobre tinta
export function MediaEvento({ imagen, deporte, alt = '' }) {
  const url = urlImagen(imagen);
  const [fallida, setFallida] = useState(null);
  return (
    <div className="pr-card-media">
      {url && fallida !== url
        ? <img src={url} alt={alt} loading="lazy" onError={() => setFallida(url)} />
        : <span className="pr-card-media-vacio" aria-hidden="true">{deporte || 'SportLink'}</span>}
    </div>
  );
}
