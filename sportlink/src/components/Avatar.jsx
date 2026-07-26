import React, { useState } from 'react';

export default function Avatar({ src, nombre = '', size = 40, className = '', style = {}, onClick }) {
  const [errorImagen, setErrorImagen] = useState(false);

  // Obtener la primera letra del nombre
  const initial = (nombre && typeof nombre === 'string') 
    ? nombre.trim().charAt(0).toUpperCase() 
    : '?';

  // Si no hay src o hubo un error al cargar, mostrar inicial
  const mostrarInicial = !src || errorImagen;

  const fontSizeCalc = typeof size === 'number' ? size * 0.4 : 'calc(' + size + ' * 0.4)';

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    color: '#00f0ff',
    fontWeight: 'bold',
    fontSize: fontSizeCalc,
    flexShrink: 0,
    cursor: onClick ? 'pointer' : 'default',
    ...style
  };

  if (mostrarInicial) {
    return (
      <div 
        className={`avatar-fallback ${className}`} 
        style={containerStyle}
        onClick={onClick}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={nombre || 'Avatar'}
      className={`avatar-image ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      onError={() => setErrorImagen(true)}
      onClick={onClick}
    />
  );
}
