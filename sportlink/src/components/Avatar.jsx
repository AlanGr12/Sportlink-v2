import React, { useState, useEffect } from 'react';

/**
 * Normaliza cualquier variante de URL de imagen proveniente de la base de datos o Supabase Storage.
 * Maneja:
 * - null / undefined / cadenas vacías o 'null'
 * - URLs absolutas (https://..., http://..., blob:..., data:...)
 * - Rutas relativas de Supabase Storage (con o sin prefijo storage/v1/object/public)
 * - Rutas relativas de uploads del backend local
 */
export function normalizeAvatarUrl(url) {
  if (!url) return null;

  // Si viene como objeto (ej: { url: '...', secure_url: '...' })
  if (typeof url === 'object') {
    url = url.url || url.path || url.secure_url || url.fotoperfil || url.src || null;
    if (!url) return null;
  }

  if (typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed === '[object Object]'
  ) {
    return null;
  }

  // Si ya es una URL absoluta o un URI blob/data
  if (/^(https?:|\/\/|blob:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  const supabaseUrl = (import.meta.env?.VITE_SUPABASE_URL || 'https://cczzvdaraenyqyujbsup.supabase.co').replace(/\/+$/, '');
  const cleanPath = trimmed.replace(/^\/+/, '');

  // Si la ruta ya incluye el path completo de storage de Supabase
  if (cleanPath.startsWith('storage/v1/object/public/')) {
    return `${supabaseUrl}/${cleanPath}`;
  }

  // Si incluye 'storage/' pero sin 'v1/object/public'
  if (cleanPath.startsWith('storage/')) {
    return `${supabaseUrl}/${cleanPath}`;
  }

  // Si es una ruta de uploads locales del backend
  if (cleanPath.startsWith('uploads/')) {
    const apiBase = (import.meta.env?.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
    return `${apiBase}/${cleanPath}`;
  }

  // Caso general de Supabase Storage: bucket/archivo (ej: perfiles/foto.jpg)
  return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
}

export default function Avatar({ src, nombre = '', size = 40, className = '', style = {}, onClick }) {
  const [errorImagen, setErrorImagen] = useState(false);

  // Normalizar la URL de forma defensiva
  const urlNormalizada = normalizeAvatarUrl(src);

  // Resetea el estado de error cuando cambia la propiedad src
  useEffect(() => {
    setErrorImagen(false);
  }, [src]);

  // Generar iniciales limpias (1 o 2 letras según palabras del nombre)
  const getInitials = (str) => {
    if (!str || typeof str !== 'string') return '?';
    const words = str.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    if (words.length === 1 && words[0].length > 0) {
      return words[0][0].toUpperCase();
    }
    return '?';
  };

  const initials = getInitials(nombre);

  // Si no hay URL válida o la imagen falló en onError, mostrar fallback
  const mostrarInicial = !urlNormalizada || errorImagen;

  const fontSizeCalc = typeof size === 'number' 
    ? `${Math.max(12, Math.round(size * 0.38))}px` 
    : `calc(${size} * 0.38)`;

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: style?.borderRadius !== undefined ? style.borderRadius : '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16191b',
    color: '#2DEFF2',
    border: '1px solid rgba(45, 239, 242, 0.25)',
    fontWeight: '700',
    fontSize: fontSizeCalc,
    fontFamily: "'Space Grotesk', sans-serif",
    letterSpacing: '0.04em',
    flexShrink: 0,
    userSelect: 'none',
    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.4)',
    cursor: onClick ? 'pointer' : 'default',
    ...style
  };

  if (mostrarInicial) {
    return (
      <div 
        className={`avatar-fallback ${className}`} 
        style={containerStyle}
        onClick={onClick}
        title={nombre || 'Avatar'}
        aria-label={nombre || 'Avatar'}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={urlNormalizada}
      alt={nombre || 'Avatar'}
      className={`avatar-image ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: style?.borderRadius !== undefined ? style.borderRadius : '50%',
        objectFit: 'cover',
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: '#16191b',
        ...style
      }}
      onError={() => {
        setErrorImagen(true);
      }}
      onClick={onClick}
    />
  );
}
