import { useState } from "react";
import "../entrenamientos/entrenamientos.css";
import "./menuPruebas.css";

// Mismos iconos que PaginaEntrenamientos.jsx
import { IconoFecha } from "../iconos/IconoFecha.jsx";
import { IconoUbicacion } from "../iconos/IconoUbicacion.jsx";
import { IconoModalidad } from "../iconos/IconoModalidad.jsx";
import { IconoFutbol } from "../iconos/IconoFutbol.jsx";

// Misma lista completa de deportes que PaginaEntrenamientos.jsx
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

function MenuPruebas({
  deporte,      setDeporte,
  categoria,    setCategoria,
  zona,         setZona,
  fechaDesde,   setFechaDesde,
  fechaHasta,   setFechaHasta,
  onAplicar,
  onReset,
}) {
  // Mismo estado de acordeón que PaginaEntrenamientos
  const [expandido, setExpandido] = useState({
    zona:      true,
    categoria: true,
    deporte:   true,
    horario:   false,
  });

  const toggle = (seccion) =>
    setExpandido((prev) => ({ ...prev, [seccion]: !prev[seccion] }));

  // SVG chevron reutilizable (igual que entrenamientos)
  const Chevron = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  return (
    <aside className="filtros-sidebar">

      {/* Título del sidebar — idéntico a entrenamientos */}
      <div>
        <h2 className="filtros-titulo">Filtros</h2>
        <p className="filtros-subtitulo">Refiná tu búsqueda</p>
      </div>

      {/* ── ZONA ─────────────────────────────────────── */}
      <div className="filtro-grupo">
        <div
          className={`filtro-header ${expandido.zona ? "abierto" : ""}`}
          onClick={() => toggle("zona")}
        >
          <span>
            <IconoUbicacion size={16} color="currentColor" className="icon-small" />
            Zona
          </span>
          <Chevron />
        </div>
        <div className={`filtro-contenido-wrapper ${expandido.zona ? "open" : ""}`}>
          <div className="filtro-contenido">
            <select
              className="filtro-select"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
            >
              <option value="">Todas las zonas</option>
              <option value="CABA">CABA</option>
              <option value="Zona Norte">Zona Norte</option>
              <option value="Zona Sur">Zona Sur</option>
              <option value="Zona Oeste">Zona Oeste</option>
              <option value="Conurbano">Conurbano</option>
              <option value="Interior">Interior</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── CATEGORÍA (en lugar de Modalidad) ────────── */}
      <div className="filtro-grupo">
        <div
          className={`filtro-header ${expandido.categoria ? "abierto" : ""}`}
          onClick={() => toggle("categoria")}
        >
          <span>
            <IconoModalidad size={16} color="currentColor" className="icon-small" />
            Categoría
          </span>
          <Chevron />
        </div>
        <div className={`filtro-contenido-wrapper ${expandido.categoria ? "open" : ""}`}>
          <div className="filtro-contenido">
            <select
              className="filtro-select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="Primera">Primera</option>
              <option value="Reserva">Reserva</option>
              <option value="Juveniles">Juveniles</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── DEPORTE (lista completa de 15) ───────────── */}
      <div className="filtro-grupo">
        <div
          className={`filtro-header ${expandido.deporte ? "abierto" : ""}`}
          onClick={() => toggle("deporte")}
        >
          <span>
            <IconoFutbol size={16} color="currentColor" className="icon-small" />
            Deporte
          </span>
          <Chevron />
        </div>
        <div className={`filtro-contenido-wrapper ${expandido.deporte ? "open" : ""}`}>
          <div className="filtro-contenido">
            <select
              className="filtro-select"
              value={deporte}
              onChange={(e) => setDeporte(e.target.value)}
            >
              <option value="">Todos los deportes</option>
              {deportesDisponibles.map((d) => (
                <option key={d.id} value={d.nombre}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── FECHAS ───────────────────────────────────── */}
      <div className="filtro-grupo">
        <div
          className={`filtro-header ${expandido.horario ? "abierto" : ""}`}
          onClick={() => toggle("horario")}
        >
          <span>
            <IconoFecha size={16} color="currentColor" className="icon-small" />
            Fechas
          </span>
          <Chevron />
        </div>
        <div className={`filtro-contenido-wrapper ${expandido.horario ? "open" : ""}`}>
          <div className="filtro-contenido">
            <input
              type="date"
              className="filtro-input"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
            <input
              type="date"
              className="filtro-input"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button className="btn-aplicar-filtros" onClick={onAplicar}>
        Aplicar Filtros
      </button>
      <button type="button" className="btn-reset-filtros" onClick={onReset}>
        Restablecer filtros
      </button>

    </aside>
  );
}

export default MenuPruebas;