import { useState } from "react";
import "../entrenamientos/entrenamientos.css";

import { IconoUbicacion } from "../iconos/IconoUbicacion.jsx";
import { IconoFutbol } from "../iconos/IconoFutbol.jsx";
import { IconoFecha } from "../iconos/IconoFecha.jsx";

// Misma lista completa de deportes que el resto de la app
const deportesDisponibles = [
  { id: 1,  nombre: "Fútbol" },
  { id: 2,  nombre: "Basket" },
  { id: 3,  nombre: "Tenis" },
  { id: 4,  nombre: "Voley" },
  { id: 5,  nombre: "Pádel" },
  { id: 6,  nombre: "Rugby" },
  { id: 7,  nombre: "Hockey" },
  { id: 8,  nombre: "Natación" },
  { id: 9,  nombre: "Atletismo" },
  { id: 10, nombre: "Ciclismo" },
  { id: 11, nombre: "Boxeo" },
  { id: 12, nombre: "Artes Marciales" },
  { id: 13, nombre: "Handball" },
  { id: 14, nombre: "Béisbol" },
  { id: 15, nombre: "Golf" },
];

const rangosHoras = [
  { valor: "",      label: "Todas las horas" },
  { valor: "0-10",  label: "0 – 10 hs" },
  { valor: "10-20", label: "10 – 20 hs" },
  { valor: "20-30", label: "20 – 30 hs" },
  { valor: "30-40", label: "30 – 40 hs" },
  { valor: "40+",   label: "40+ hs" },
];

function MenuEmpleos({
  ubicacion,     setUbicacion,
  deporte,       setDeporte,
  horasSemanales, setHorasSemanales,
}) {
  return (
    <div className="empleos-filtros-fila">
      {/* Ubicación */}
      <select
        className="empleos-filtro-select"
        value={ubicacion}
        onChange={(e) => setUbicacion(e.target.value)}
        aria-label="Filtrar por ubicación"
      >
        <option value="">Ubicación</option>
        <option value="CABA">CABA</option>
        <option value="Zona Norte">Zona Norte</option>
        <option value="Zona Sur">Zona Sur</option>
        <option value="Zona Oeste">Zona Oeste</option>
        <option value="Conurbano">Conurbano</option>
        <option value="Interior">Interior</option>
      </select>

      {/* Deporte */}
      <select
        className="empleos-filtro-select"
        value={deporte}
        onChange={(e) => setDeporte(e.target.value)}
        aria-label="Filtrar por deporte"
      >
        <option value="">Deporte</option>
        {deportesDisponibles.map((d) => (
          <option key={d.id} value={d.nombre}>
            {d.nombre}
          </option>
        ))}
      </select>

      {/* Horas semanales */}
      <select
        className="empleos-filtro-select"
        value={horasSemanales}
        onChange={(e) => setHorasSemanales(e.target.value)}
        aria-label="Filtrar por horas semanales"
      >
        {rangosHoras.map((r) => (
          <option key={r.valor} value={r.valor}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default MenuEmpleos;
