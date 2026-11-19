import React, { useState, useEffect } from 'react'
import imgNormal from '../assets/mascota/normal.png'
import imgPensando1 from '../assets/mascota/pensando-1.png'
import imgPensando2 from '../assets/mascota/pensando-2.png'
import imgPensando3 from '../assets/mascota/pensando-3.png'
import './MascotaSportlink.css'

const EXPRESIONES = {
  normal: imgNormal,
  'pensando-1': imgPensando1,
  'pensando-2': imgPensando2,
  'pensando-3': imgPensando3,
}

// Aliases amigables
const MAPA_ALIASES = {
  default: 'normal',
  habitual: 'normal',
  '1-punto': 'pensando-1',
  un_punto: 'pensando-1',
  'un-punto': 'pensando-1',
  '2-puntos': 'pensando-2',
  dos_puntos: 'pensando-2',
  'dos-puntos': 'pensando-2',
  '3-puntos': 'pensando-3',
  tres_puntos: 'pensando-3',
  'tres-puntos': 'pensando-3',
  pensando: 'pensando-3',
  loading: 'pensando-3',
}

/**
 * Componente MascotaSportlink
 *
 * Muestra la mascota oficial de SportLink con soporte para diferentes expresiones:
 * - 'normal': expresión habitual
 * - 'pensando-1' / 'un-punto': 1 punto suspensivo y signo de pregunta
 * - 'pensando-2' / 'dos-puntos': 2 puntos suspensivos y signo de pregunta
 * - 'pensando-3' / 'tres-puntos' / 'pensando': 3 puntos suspensivos y signo de pregunta
 *
 * Opcionalmente admite la prop `animarPensando` para ciclar automáticamente
 * 1 -> 2 -> 3 puntos suspensivos mientras el chatbot procesa o carga.
 */
export default function MascotaSportlink({
  expression = 'normal',
  animarPensando = false,
  size,
  className = '',
  style = {},
  alt = 'Mascota SportLink',
  ...rest
}) {
  const [pasoAnimado, setPasoAnimado] = useState(1)

  useEffect(() => {
    if (!animarPensando) return
    const intervalo = setInterval(() => {
      setPasoAnimado((prev) => (prev % 3) + 1)
    }, 500)
    return () => clearInterval(intervalo)
  }, [animarPensando])

  // Resolver la clave de expresión activa
  let expresionActiva = 'normal'
  if (animarPensando) {
    expresionActiva = `pensando-${pasoAnimado}`
  } else {
    const normalizada = String(expression).toLowerCase().trim()
    expresionActiva = MAPA_ALIASES[normalizada] || (EXPRESIONES[normalizada] ? normalizada : 'normal')
  }

  // Dimensiones si se especifica size
  const estiloContenedor = {
    ...style,
    ...(size ? { width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size } : {}),
  }

  return (
    <div
      className={`mascota-sportlink ${className}`.trim()}
      style={estiloContenedor}
      {...rest}
    >
      {Object.entries(EXPRESIONES).map(([clave, src]) => {
        const isActive = clave === expresionActiva
        return (
          <img
            key={clave}
            src={src}
            alt={isActive ? alt : ''}
            aria-hidden={!isActive}
            className={`mascota-sportlink__layer${isActive ? ' is-active' : ''}`}
            loading="eager"
            draggable={false}
          />
        )
      })}
    </div>
  )
}
