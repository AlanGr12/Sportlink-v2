import "./empleos.css";

function ListaEmpleos({ empleos, empleoSeleccionado, onSeleccionar, cargando }) {
  // ── Skeleton loader ────────────────────────────────────────
  if (cargando) {
    return (
      <div className="empleos-lista-container">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="empleo-skeleton" key={i}>
            <div className="skeleton-avatar" />
            <div className="skeleton-lines">
              <div className="skeleton-line media" />
              <div className="skeleton-line corta" />
              <div className="skeleton-line" style={{ width: "45%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Sin resultados ─────────────────────────────────────────
  if (!empleos || empleos.length === 0) {
    return (
      <div className="empleos-estado">
        <span className="empleos-estado-icono">📭</span>
        <h4 className="empleos-estado-titulo">Sin resultados</h4>
        <p className="empleos-estado-texto">
          No se encontraron empleos que coincidan con los filtros aplicados.
        </p>
      </div>
    );
  }

  // ── Lista de empleos ───────────────────────────────────────
  return (
    <div className="empleos-lista-container">
      {empleos.map((empleo) => {
        const isActivo = empleoSeleccionado?.idempleo === empleo.idempleo;

        return (
          <div
            key={empleo.idempleo}
            className={`empleo-item ${isActivo ? "activo" : ""}`}
            onClick={() => onSeleccionar(empleo)}
          >
            {/* Logo del club */}
            {empleo.club?.fotoperfil ? (
              <img
                src={empleo.club.fotoperfil}
                alt={empleo.club?.nombre || "Club"}
                className="empleo-item-logo"
              />
            ) : (
              <div className="empleo-item-logo-fallback">
                {(empleo.club?.nombre || "C").charAt(0).toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="empleo-item-info">
              <h4 className="empleo-item-titulo">{empleo.nombre || "Sin título"}</h4>
              <p className="empleo-item-club">{empleo.club?.nombre || "Club desconocido"}</p>

              <div className="empleo-item-meta">
                {/* Ubicación */}
                {empleo.club?.ubicacion && (
                  <span className="empleo-item-meta-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {empleo.club.ubicacion}
                  </span>
                )}

                {/* Horas */}
                {empleo.horasreq != null && (
                  <span className="empleo-item-meta-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {empleo.horasreq} hs/sem
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ListaEmpleos;
