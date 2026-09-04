import { useState } from 'react'
import './ChatbotButton.css'

/**
 * ChatbotButton
 *
 * Icono SVG fijo en la esquina inferior derecha.
 * Paths extraídos del SVG tracezado de la imagen de referencia,
 * limpiados (solo subpaths válidos) y coloreados en cyan sobre
 * fondo oscuro.
 *
 * Coordinate pipeline:
 *   1. Paths viven en espacio ~0-1210 × ~0-1030
 *   2. <g transform="translate(0,103) scale(0.1,-0.1)"> los mapea a 121×103
 *   3. <g transform="translate(15,20) scale(0.58)">   los centra en el viewBox 100×100
 */
export default function ChatbotButton() {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`chatbot-wrapper${hovered ? ' chatbot-hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Chatbot SportLink"
      role="button"
      tabIndex={0}
      aria-label="Abrir chatbot"
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="chatbot-svg"
      >
        <defs>
          {/* Fondo oscuro radial */}
          <radialGradient id="cb-bg" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#0d1117" />
            <stop offset="100%" stopColor="#060610" />
          </radialGradient>

          {/* Glow del icono */}
          <filter id="cb-glow-icon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow del arco giratorio */}
          <filter id="cb-glow-arc" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow hover */}
          <filter id="cb-glow-hover" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Fondo oscuro ── */}
        <circle cx="50" cy="50" r="47" fill="url(#cb-bg)" />

        {/* ── Borde base gris oscuro ── */}
        <circle cx="50" cy="50" r="47" fill="none" stroke="#1e2030" strokeWidth="2.5" />

        {/* ── Borde hover celeste completo (oculto por defecto) ── */}
        <circle
          cx="50" cy="50" r="47"
          fill="none" stroke="#00f0ff" strokeWidth="2.8"
          className="chatbot-full-border"
          filter="url(#cb-glow-hover)"
        />

        {/* ── Arco giratorio lento ── */}
        <circle
          cx="50" cy="50" r="47"
          fill="none" stroke="#00f0ff" strokeWidth="3"
          strokeLinecap="round" strokeDasharray="28 268"
          className="chatbot-arc"
          filter="url(#cb-glow-arc)"
        />

        {/* ══════════════════════════════════════════════════════
            ICONO ROBOT
            Pipeline de transformaciones (derecha→izquierda):
              1. scale(0.1,-0.1) + translate(0,103) : coords a 121×103
              2. translate(15,20) scale(0.58)         : centra en 100×100
            ══════════════════════════════════════════════════════ */}
        <g transform="translate(15,20) scale(0.58)">
          <g transform="translate(0,103) scale(0.1,-0.1)">

            {/*
              ── SILUETA EXTERIOR (cyan) ──
              Subpath limpio extraído del path original M526.
              El subpath M618 1003 es la forma completa del robot
              (cabeza redondeada + cola de burbuja + antena).
              Los subpaths ruidosos del path original fueron eliminados.
            */}
            <path
              fill="#00f0ff"
              filter="url(#cb-glow-icon)"
              d="
                M618 1003
                c34 -30 37 -59 8 -88
                -14 -14 -26 -34 -26 -44
                0 -17 11 -19 133 -23
                156 -4 197 -18 280 -97
                63 -60 101 -132 118 -223
                31 -170 -73 -360 -231 -419
                -51 -19 -74 -20 -345 -19
                l-290 2
                -52 -26
                c-90 -44 -102 -36 -73 55
                l19 63
                -36 39
                c-63 70 -78 117 -78 242
                0 98 3 116 27 167
                35 76 107 151 177 185
                51 25 68 28 184 32
                117 3 127 5 127 22
                0 10 -9 28 -20 39
                -28 28 -25 64 6 89
                32 26 46 26 72 4
                z
              "
            />

            {/*
              ── RECORTE INTERIOR OSCURO (crea el borde/rim cyan) ──
              Primer subpath de M305: la cara interna del robot
              (rectángulo redondeado que forma la "pantalla" del chatbot).
            */}
            <path
              fill="#090d16"
              d="
                M305 681
                c-166 -77 -174 -337 -12 -424
                40 -21 52 -22 293 -22
                l251 0 49 30
                c30 19 60 49 78 79
                27 42 30 58 30 120
                0 79 -21 131 -71 178
                -56 54 -81 58 -340 58
                -210 0 -243 -3 -278 -19
                z
              "
            />

            {/*
              ── OJO IZQUIERDO (cyan) ──
              Segundo subpath de M381, convertido a absoluto:
              M(381+86, 543-15) = M467 528
            */}
            <path
              fill="#00f0ff"
              filter="url(#cb-glow-icon)"
              d="
                M467 528
                c32 -30 32 -102 1 -135
                -28 -30 -52 -29 -78 4
                -17 22 -20 36 -16 72
                6 46 29 81 54 81
                9 0 26 -10 39 -22
                z
              "
            />

            {/*
              ── OJO DERECHO (cyan) ──
              Segundo subpath de M692, convertido a absoluto:
              M(692+87, 558-34) = M779 524
            */}
            <path
              fill="#00f0ff"
              filter="url(#cb-glow-icon)"
              d="
                M779 524
                c38 -49 11 -154 -41 -154
                -56 0 -81 109 -36 157
                28 30 52 29 77 -3
                z
              "
            />

          </g>
        </g>
      </svg>
    </div>
  )
}
