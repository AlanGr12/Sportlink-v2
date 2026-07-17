import { IconoUbicacion } from "../iconos/IconoUbicacion.jsx";
import { IconoEmpleos } from "../iconos/IconoEmpleos.jsx";
import { IconoFecha } from "../iconos/IconoFecha.jsx";
import "./empleos.css";

// ── Íconos inline (SVG) ──────────────────────────────────────
const IconoReloj = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconoDeporte = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m4.93 4.93 4.24 4.24" />
    <path d="m14.83 9.17 4.24-4.24" />
    <path d="m14.83 14.83 4.24 4.24" />
    <path d="m9.17 14.83-4.24 4.24" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const IconoEstrellas = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

const IconoGuardar = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const IconoCV = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

const IconoOjo = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ── Formato de fecha ─────────────────────────────────────────
const formatearFecha = (fechaStr) => {
  try {
    return new Date(fechaStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Sin fecha";
  }
};

function DetalleEmpleo({ empleo }) {
  // ── Estado vacío ─────────────────────────────────────────
  if (!empleo) {
    return (
      <div className="empleos-detalle-vacio">
        <div className="empleos-detalle-vacio-icono">
          <IconoEmpleos size={32} />
        </div>
        <h3>Selecciona un empleo</h3>
        <p>Hacé clic en un empleo de la lista para ver todos los detalles aquí.</p>
      </div>
    );
  }

  // ── Parsear habilidades (string separado por comas) ───────
  const habilidades = empleo.habilidadesreq
    ? empleo.habilidadesreq
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="detalle-empleo" key={empleo.idempleo}>
      {/* ── HEADER: logo + nombre + club ──────────────────── */}
      <div className="detalle-empleo-header">
        {empleo.club?.fotoperfil ? (
          <img
            src={empleo.club.fotoperfil}
            alt={empleo.club?.nombre || "Club"}
            className="detalle-empleo-logo"
          />
        ) : (
          <div className="detalle-empleo-logo-fallback">
            {(empleo.club?.nombre || "C").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="detalle-empleo-header-info">
          <h2 className="detalle-empleo-nombre">{empleo.nombre || "Sin título"}</h2>
          <p className="detalle-empleo-club">{empleo.club?.nombre || "Club desconocido"}</p>
        </div>
      </div>

      {/* ── BADGES ─────────────────────────────────────────── */}
      <div className="detalle-empleo-badges">
        {/* Jornada (horas requeridas) */}
        {empleo.horasreq != null && (
          <div className="detalle-empleo-badge">
            <IconoReloj size={16} />
            <div>
              <span className="detalle-empleo-badge-label">Jornada</span>
              <span className="detalle-empleo-badge-valor">{empleo.horasreq} hs/semana</span>
            </div>
          </div>
        )}

        {/* Ubicación */}
        {empleo.club?.ubicacion && (
          <div className="detalle-empleo-badge">
            <IconoUbicacion size={16} />
            <div>
              <span className="detalle-empleo-badge-label">Ubicación</span>
              <span className="detalle-empleo-badge-valor">{empleo.club.ubicacion}</span>
            </div>
          </div>
        )}

        {/* Deporte */}
        {empleo.deporte?.deporte && (
          <div className="detalle-empleo-badge">
            <IconoDeporte size={16} />
            <div>
              <span className="detalle-empleo-badge-label">Deporte</span>
              <span className="detalle-empleo-badge-valor">{empleo.deporte.deporte}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── FECHA DE PUBLICACIÓN ───────────────────────────── */}
      {empleo.fechapublicacion && (
        <div className="detalle-empleo-fecha">
          <IconoFecha size={14} />
          Publicado el {formatearFecha(empleo.fechapublicacion)}
        </div>
      )}

      {/* ── ACERCA DEL EMPLEO ──────────────────────────────── */}
      {empleo.acercaempleo && (
        <div className="detalle-empleo-seccion">
          <h3 className="detalle-empleo-seccion-titulo">
            <IconoEmpleos size={16} />
            Acerca del empleo
          </h3>
          <p className="detalle-empleo-descripcion">{empleo.acercaempleo}</p>
        </div>
      )}

      {/* ── HABILIDADES REQUERIDAS ─────────────────────────── */}
      {habilidades.length > 0 && (
        <div className="detalle-empleo-seccion">
          <h3 className="detalle-empleo-seccion-titulo">
            <IconoEstrellas size={16} />
            Habilidades requeridas
          </h3>
          <div className="detalle-empleo-habilidades">
            {habilidades.map((hab, idx) => (
              <span key={idx} className="detalle-empleo-chip">
                {hab}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER CON BOTONES ─────────────────────────────── */}
      <div className="detalle-empleo-footer">
        <button className="btn-empleo" type="button">
          <IconoGuardar size={14} />
          {" "}GUARDAR
        </button>
        <button className="btn-empleo" type="button">
          <IconoOjo size={14} />
          {" "}VER CLUB
        </button>
        <button className="btn-empleo" type="button">
          <IconoCV size={14} />
          {" "}CV ADJUNTADO
        </button>
        <button className="btn-empleo btn-empleo-postularse" type="button">
          POSTULARSE
        </button>
      </div>
    </div>
  );
}

export default DetalleEmpleo;
