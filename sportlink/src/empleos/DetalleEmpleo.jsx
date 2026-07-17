import { useState } from "react";
import axios from "axios";
import { IconoUbicacion } from "../iconos/IconoUbicacion.jsx";
import { IconoEmpleos } from "../iconos/IconoEmpleos.jsx";
import { IconoFecha } from "../iconos/IconoFecha.jsx";
import "./empleos.css";
import "../pruebas/pruebas.css";

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

function DetalleEmpleo({ empleo, usuario, yaPostulado, onPostulacionExitosa }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [archivoPDF, setArchivoPDF] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);
  const [toastMensaje, setToastMensaje] = useState(null);

  const esEntrenador = usuario?.tipousuario === "entrenador";
  const idEntrenadorSesion = usuario?.identrenador || usuario?.idEntrenador;

  const handlePostularseSubmit = async (e) => {
    e.preventDefault();
    if (!archivoPDF) {
      setErrorCarga("Por favor, selecciona o arrastra tu currículum en formato PDF.");
      return;
    }

    if (!idEntrenadorSesion) {
      setErrorCarga("No se pudo identificar tu perfil de entrenador. Intenta iniciar sesión de nuevo.");
      return;
    }

    setEnviando(true);
    setErrorCarga(null);

    const formData = new FormData();
    formData.append("identrenador", idEntrenadorSesion);
    formData.append("idempleo", empleo.idempleo);
    formData.append("cv", archivoPDF);

    try {
      const response = await axios.post("http://localhost:3000/api/inscripcionesempleo/postularse", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // Notificar al componente padre para que actualice la lista de postulaciones localmente
      if (onPostulacionExitosa) {
        onPostulacionExitosa(response.data);
      }

      setToastMensaje("¡Te has postulado con éxito!");
      setModalAbierto(false);
      setArchivoPDF(null);
      
      // Limpiar toast después de 4 segundos
      setTimeout(() => {
        setToastMensaje(null);
      }, 4000);

    } catch (err) {
      console.error("[Postularse] Error:", err);
      setErrorCarga(err.response?.data?.error || "Ocurrió un error al enviar tu postulación. Intentalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

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
        {yaPostulado ? (
          <button className="btn-empleo btn-empleo-postularse opacity-50 cursor-not-allowed" type="button" disabled>
            YA POSTULADO
          </button>
        ) : !esEntrenador ? (
          <button className="btn-empleo btn-empleo-postularse opacity-50 cursor-not-allowed" type="button" disabled title="Solo los entrenadores pueden postularse">
            POSTULARSE
          </button>
        ) : (
          <button 
            className="btn-empleo btn-empleo-postularse" 
            type="button"
            onClick={() => {
              setModalAbierto(true);
              setArchivoPDF(null);
              setErrorCarga(null);
            }}
          >
            POSTULARSE
          </button>
        )}
      </div>

      {/* ── TOAST NOTIFICACIÓN DE ÉXITO ─────────────────────── */}
      {toastMensaje && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#10b981] text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 border border-[#34d399] transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"></path>
          </svg>
          <span className="font-semibold text-sm">{toastMensaje}</span>
        </div>
      )}

      {/* ── POP-UP MODAL DE POSTULACIÓN ─────────────────────── */}
      {modalAbierto && (
        <div className="modal-prueba-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-prueba-contenedor" onClick={(e) => e.stopPropagation()}>
            
            {/* Header del modal */}
            <div className="modal-prueba-header">
              <h3 className="modal-prueba-titulo">
                {empleo.club?.nombre ? empleo.club.nombre.toUpperCase() : "DETALLE DE EMPLEO"}
              </h3>
              <button 
                className="modal-prueba-cerrar" 
                onClick={() => setModalAbierto(false)}
                disabled={enviando}
              >
                ×
              </button>
            </div>

            {/* Cuerpo del modal */}
            <div className="modal-prueba-cuerpo">
              
              {/* Fachada o Logo del Club */}
              {empleo.club?.fotoperfil ? (
                <img
                  src={empleo.club.fotoperfil}
                  alt={empleo.club?.nombre || "Club"}
                  className="modal-prueba-banner"
                  style={{ objectFit: "contain", backgroundColor: "#161819" }}
                />
              ) : (
                <div className="modal-prueba-banner-fallback">
                  Sin logo disponible
                </div>
              )}

              {/* Título de la vacante */}
              <h2 className="modal-prueba-club">
                {empleo.nombre || "Vacante sin título"}
              </h2>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider" style={{ marginTop: "-12px" }}>
                {empleo.club?.nombre || "Club Desconocido"}
              </p>

              {/* Grilla de especificaciones del empleo */}
              <div className="modal-prueba-specs">
                <div className="modal-prueba-spec-item">
                  <span className="modal-prueba-spec-label">
                    <IconoDeporte size={16} color="currentColor" />
                    Deporte
                  </span>
                  <span className="modal-prueba-spec-valor">
                    {empleo.deporte?.deporte || "No especificado"}
                  </span>
                </div>

                <div className="modal-prueba-spec-item">
                  <span className="modal-prueba-spec-label">
                    <IconoReloj size={16} color="currentColor" />
                    Jornada
                  </span>
                  <span className="modal-prueba-spec-valor">
                    {empleo.horasreq != null ? `${empleo.horasreq} hs/semana` : "No especificada"}
                  </span>
                </div>

                <div className="modal-prueba-spec-item">
                  <span className="modal-prueba-spec-label">
                    <IconoUbicacion size={16} color="currentColor" />
                    Ubicación
                  </span>
                  <span className="modal-prueba-spec-valor">
                    {empleo.club?.ubicacion || "No especificada"}
                  </span>
                </div>

                <div className="modal-prueba-spec-item">
                  <span className="modal-prueba-spec-label">
                    <IconoEstrellas size={16} color="currentColor" />
                    Habilidades
                  </span>
                  <span className="modal-prueba-spec-valor truncate" title={empleo.habilidadesreq || ""}>
                    {empleo.habilidadesreq || "No especificadas"}
                  </span>
                </div>
              </div>

              {/* Sección de Descripción */}
              {empleo.acercaempleo && (
                <>
                  <p className="modal-prueba-descripcion-titulo">Acerca del empleo</p>
                  <p className="modal-prueba-descripcion-texto">
                    {empleo.acercaempleo}
                  </p>
                </>
              )}

              {/* Sección de Carga de CV */}
              <form onSubmit={handlePostularseSubmit}>
                <p className="modal-prueba-descripcion-titulo">Adjuntar currículum (PDF)</p>
                
                {/* Zona de arrastre compacta */}
                <div 
                  className={`border border-dashed rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 mt-2 ${
                    arrastrando 
                      ? "border-[#00f3ff] bg-[#00f3ff]/5" 
                      : "border-zinc-700 bg-[#161819] hover:border-zinc-500"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setArrastrando(true);
                  }}
                  onDragLeave={() => setArrastrando(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setArrastrando(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      if (file.type === "application/pdf") {
                        setArchivoPDF(file);
                        setErrorCarga(null);
                      } else {
                        setErrorCarga("Solo se permiten archivos PDF (.pdf)");
                      }
                    }
                  }}
                  onClick={() => document.getElementById("modal-input-cv").click()}
                >
                  <input 
                    type="file" 
                    id="modal-input-cv" 
                    accept=".pdf" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.type === "application/pdf") {
                          setArchivoPDF(file);
                          setErrorCarga(null);
                        } else {
                          setErrorCarga("Solo se permiten archivos PDF (.pdf)");
                        }
                      }
                    }}
                  />

                  {/* Icono de nube reducido en escala para integrarse armoniosamente */}
                  <svg className="w-7 h-7 text-zinc-500 mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"></path>
                  </svg>

                  <p className="text-xs text-zinc-300 text-center font-medium">
                    {archivoPDF ? "CV Seleccionado" : "Hacé clic o arrastrá tu CV (PDF) acá"}
                  </p>
                  
                  {archivoPDF && (
                    <div className="mt-2 text-xs text-[#00f3ff] font-semibold truncate max-w-[280px] bg-[#00f3ff]/10 border border-[#00f3ff]/30 px-2.5 py-1 rounded">
                      {archivoPDF.name}
                    </div>
                  )}
                </div>

                {/* Mensaje de Error dentro del Modal */}
                {errorCarga && (
                  <div className="form-error-banner mt-3">
                    {errorCarga}
                  </div>
                )}

                {/* Botones de acción inferiores */}
                <div className="modal-prueba-acciones mt-4">
                  <button 
                    type="button" 
                    className="btn-cancelar" 
                    onClick={() => setModalAbierto(false)}
                    disabled={enviando}
                    style={{ marginRight: "12px" }}
                  >
                    Cerrar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-guardar" 
                    disabled={enviando || !archivoPDF}
                  >
                    {enviando ? "Enviando..." : "POSTULARSE"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalleEmpleo;
