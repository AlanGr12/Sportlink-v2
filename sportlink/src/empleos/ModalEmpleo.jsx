import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import api from "../axiosConfig.js";
import ModalConfirmacionInscripcion from "../components/ModalConfirmacionInscripcion.jsx";
import { AvatarSlk } from "../components/ImagenesSlk.jsx";
import { habilidadesDe, datosEmpleo } from "./empleoUtils.js";

import "../pruebas/PruebasView.css";
import "./EmpleosView.css";

const Flecha = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="square" />
  </svg>
);

/**
 * Detalle de una vacante en modal.
 * - Entrenador: se postula adjuntando su CV en PDF.
 * - Club dueño: ve los postulantes (preseleccionar, escribirles, ver perfil, descartar)
 *   y puede modificar o eliminar la vacante.
 */
function ModalEmpleo({ empleo, usuario, yaPostulado, inactivo = false, onPostulacionExitosa, onEditar, onEliminar, onCerrar }) {
  const navigate = useNavigate();
  const esClub = usuario?.tipousuario === "club";
  const esEntrenador = usuario?.tipousuario === "entrenador";
  const idEntrenadorSesion = usuario?.identrenador || usuario?.idEntrenador;

  // ── Postulación (entrenador) ──────────────────────────────
  const [postulando, setPostulando] = useState(false);
  const [archivoPDF, setArchivoPDF] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);
  const [exito, setExito] = useState(false);
  const inputCv = useRef(null);

  // ── Postulantes (club) ────────────────────────────────────
  const [postulantes, setPostulantes] = useState([]);
  const [cargandoPostulantes, setCargandoPostulantes] = useState(esClub);
  const [errorPostulantes, setErrorPostulantes] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [aDescartar, setADescartar] = useState(null);
  const [descartando, setDescartando] = useState(false);

  useEffect(() => {
    if (!esClub || !empleo?.idempleo) return;
    let montado = true;
    api.get("/api/inscripcionesempleo", { params: { idempleo: empleo.idempleo } })
      .then((res) => {
        if (!montado) return;
        setPostulantes(Array.isArray(res.data) ? res.data.filter((p) => p.estado === true) : []);
      })
      .catch((err) => {
        console.error("[ModalEmpleo] Error al buscar postulantes:", err);
        if (montado) setErrorPostulantes("No se pudieron cargar los postulantes.");
      })
      .finally(() => { if (montado) setCargandoPostulantes(false); });
    return () => { montado = false; };
  }, [empleo?.idempleo, esClub]);

  // Escape cierra primero lo de arriba (postulación / descarte) y después el detalle
  useEffect(() => {
    const alPresionar = (e) => {
      if (e.key !== "Escape" || inactivo || exito) return;
      if (aDescartar) { if (!descartando) setADescartar(null); }
      else if (postulando) { if (!enviando) setPostulando(false); }
      else onCerrar();
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [inactivo, exito, aDescartar, descartando, postulando, enviando, onCerrar]);

  const alternarPreseleccion = async (postulado) => {
    setErrorAccion("");
    try {
      const { data } = await api.put(`/api/inscripcionesempleo/${postulado.idinsripcion}/preseleccionar`, {
        preseleccionado: !postulado.preseleccionado,
      });
      setPostulantes((prev) => prev.map((p) =>
        p.idinsripcion === postulado.idinsripcion ? { ...p, preseleccionado: data.preseleccionado === true } : p
      ));
    } catch (err) {
      setErrorAccion(err.response?.data?.error || "No se pudo actualizar la preselección.");
    }
  };

  const contactarPostulante = async (entrenador) => {
    setErrorAccion("");
    if (!entrenador?.idusuario) {
      setErrorAccion("No se pudo identificar al usuario del postulante.");
      return;
    }
    try {
      const { data } = await api.post("/api/conversaciones/privada", { idusuarioReceptor: entrenador.idusuario });
      navigate("/mensajes", { state: { conversacionInicial: data } });
    } catch (err) {
      setErrorAccion(err.response?.data?.detail || err.response?.data?.error || "No se pudo abrir la conversación.");
    }
  };

  const confirmarDescarte = async () => {
    if (!aDescartar) return;
    setDescartando(true);
    try {
      await api.put(`/api/inscripcionesempleo/${aDescartar.idinsripcion}/estado`, { estado: false });
      setPostulantes((prev) => prev.filter((p) => p.idinsripcion !== aDescartar.idinsripcion));
      setADescartar(null);
    } catch (err) {
      setErrorAccion(err.response?.data?.error || "No se pudo descartar al postulante.");
      setADescartar(null);
    } finally {
      setDescartando(false);
    }
  };

  const elegirArchivo = (file) => {
    if (!file) return;
    if (file.type === "application/pdf") {
      setArchivoPDF(file);
      setErrorCarga(null);
    } else {
      setErrorCarga("Solo se permiten archivos PDF (.pdf).");
    }
  };

  const abrirPostulacion = () => {
    setArchivoPDF(null);
    setErrorCarga(null);
    setExito(false);
    setPostulando(true);
  };

  const enviarPostulacion = async (e) => {
    e.preventDefault();
    if (!archivoPDF) {
      setErrorCarga("Seleccioná o arrastrá tu currículum en formato PDF.");
      return;
    }
    if (!idEntrenadorSesion) {
      setErrorCarga("No pudimos identificar tu perfil de entrenador. Volvé a iniciar sesión.");
      return;
    }
    setEnviando(true);
    setErrorCarga(null);

    const formData = new FormData();
    formData.append("identrenador", idEntrenadorSesion);
    formData.append("idempleo", empleo.idempleo);
    formData.append("cv", archivoPDF);

    try {
      const response = await api.post("/api/inscripcionesempleo/postularse", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onPostulacionExitosa?.(response.data);
      setArchivoPDF(null);
      setExito(true);
    } catch (err) {
      console.error("[ModalEmpleo] Error al postularse:", err);
      setErrorCarga(err.response?.data?.error || "Ocurrió un error al enviar tu postulación. Probá de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const habilidades = habilidadesDe(empleo);
  const datos = datosEmpleo(empleo);
  const idClubUsuario = empleo.club?.idusuario;

  // Postulantes: los preseleccionados primero
  const ordenados = [...postulantes].sort((a, b) => Number(!!b.preseleccionado) - Number(!!a.preseleccionado));

  return (
    <>
      {!exito && createPortal(
        <div className="pr-overlay" onClick={onCerrar}>
          <div className="pr-modal" role="dialog" aria-modal="true" aria-labelledby="em-detalle-titulo" onClick={(e) => e.stopPropagation()}>
            <header className="pr-modal-head">
              <AvatarSlk foto={empleo.club?.fotoperfil} nombre={empleo.club?.nombre} grande />
              <div className="pr-card-id">
                <h2 id="em-detalle-titulo" className="pr-modal-title">{empleo.nombre || "Vacante"}</h2>
                <p>{empleo.club?.nombre || "Club"}</p>
              </div>
              {yaPostulado && <span className="pr-pill pr-pill--ok">Postulado</span>}
              <button className="pr-close" onClick={onCerrar} aria-label="Cerrar">×</button>
            </header>

            <div className="pr-modal-body">
              {datos.length > 0 && (
                <dl className="pr-facts">
                  {datos.map(([titulo, valor]) => (
                    <div key={titulo}><dt>{titulo}</dt><dd>{valor}</dd></div>
                  ))}
                </dl>
              )}

              {empleo.acercaempleo && (
                <div className="pr-block">
                  <h3>Acerca del empleo</h3>
                  <p className="pr-desc">{empleo.acercaempleo}</p>
                </div>
              )}

              {habilidades.length > 0 && (
                <div className="pr-block">
                  <h3>Habilidades requeridas</h3>
                  <div className="em-skills">
                    {habilidades.map((h, i) => <span key={`${h}-${i}`}>{h}</span>)}
                  </div>
                </div>
              )}

              {esClub && (
                <div className="pr-block">
                  <div className="pr-block-head">
                    <h3>Postulantes ({postulantes.length})</h3>
                  </div>
                  {cargandoPostulantes ? (
                    <p className="pr-muted">Cargando…</p>
                  ) : errorPostulantes ? (
                    <p className="pr-error">{errorPostulantes}</p>
                  ) : ordenados.length === 0 ? (
                    <p className="pr-muted">Todavía no hay entrenadores postulados.</p>
                  ) : (
                    <ul className="pr-people">
                      {ordenados.map((postulado, index) => {
                        const entrenador = postulado.entrenador || postulado.entrenadores || postulado;
                        const nombre = [entrenador?.nombre, entrenador?.apellido].filter(Boolean).join(" ") || "Entrenador";
                        const deportes = Array.isArray(entrenador?.entrenadoresxdeportes)
                          ? entrenador.entrenadoresxdeportes.map((d) => d.deportes?.deporte || d.deporte).filter(Boolean).join(", ")
                          : entrenador?.deporte;
                        const cvUrl = entrenador?.cv || postulado?.cv;
                        return (
                          <li key={postulado.idinsripcion || entrenador?.identrenador || index} className={`pr-person em-person${postulado.preseleccionado ? " is-pre" : ""}`}>
                            <AvatarSlk foto={entrenador?.fotoperfil} nombre={nombre} />
                            <div className="pr-person-info">
                              <p className="pr-person-name">
                                {nombre}
                                {postulado.preseleccionado && <span className="em-pre">Preseleccionado</span>}
                              </p>
                              <p className="pr-person-meta">
                                {deportes || "Deportes sin especificar"}
                                {" · "}
                                {cvUrl
                                  ? <a className="em-cv" href={cvUrl} target="_blank" rel="noopener noreferrer">Ver CV</a>
                                  : "Sin CV adjunto"}
                              </p>
                            </div>
                            <div className="pr-person-actions em-actions">
                              <button className="pr-link" onClick={() => alternarPreseleccion(postulado)}>
                                {postulado.preseleccionado ? "Quitar preselección" : "Preseleccionar"}
                              </button>
                              <button className="pr-link" onClick={() => contactarPostulante(entrenador)}>Escribirle</button>
                              {entrenador?.idusuario && (
                                <Link className="pr-link" to={`/perfil/${entrenador.idusuario}`}>Ver perfil</Link>
                              )}
                              <button className="pr-link pr-link--danger" onClick={() => setADescartar(postulado)}>Descartar</button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {errorAccion && <p className="pr-error em-error">{errorAccion}</p>}
                </div>
              )}

              {!esClub && !esEntrenador && (
                <p className="pr-notice">Solo los entrenadores pueden postularse a una vacante.</p>
              )}
            </div>

            <footer className="pr-modal-foot">
              {esClub ? (
                <>
                  <button className="pr-btn pr-btn--ghost" onClick={onCerrar}>Cerrar</button>
                  <button className="pr-btn pr-btn--danger" onClick={() => onEliminar?.(empleo)}>Eliminar vacante</button>
                  <button className="pr-btn pr-btn--ink" onClick={() => onEditar?.(empleo)}>Modificar vacante</button>
                </>
              ) : (
                <>
                  <button className="pr-btn pr-btn--ghost" onClick={onCerrar}>Cerrar</button>
                  {idClubUsuario && (
                    <Link className="pr-btn pr-btn--ghost" to={`/perfil/${idClubUsuario}`}>Ver club</Link>
                  )}
                  {esEntrenador && (
                    yaPostulado ? (
                      <button className="pr-btn" disabled>Ya te postulaste</button>
                    ) : (
                      <button className="pr-btn" onClick={abrirPostulacion}>Postularme <Flecha /></button>
                    )
                  )}
                </>
              )}
            </footer>
          </div>
        </div>,
        document.body
      )}

      {/* ── Postulación con CV ── */}
      {postulando && !exito && createPortal(
        <div className="pr-overlay" onClick={() => !enviando && setPostulando(false)}>
          <div className="pr-modal pr-modal--sm" role="dialog" aria-modal="true" aria-labelledby="em-cv-titulo" onClick={(e) => e.stopPropagation()}>
            <header className="pr-modal-head cl-modal-head--simple">
              <h2 id="em-cv-titulo" className="pr-modal-title">Postularme a {empleo.nombre}</h2>
              <button className="pr-close" onClick={() => setPostulando(false)} disabled={enviando} aria-label="Cerrar">×</button>
            </header>
            <form onSubmit={enviarPostulacion}>
              <div className="pr-modal-body">
                <p className="pr-desc">{empleo.club?.nombre || "El club"} va a recibir tu currículum junto con tu perfil.</p>
                <div
                  className={`em-drop${arrastrando ? " is-over" : ""}${archivoPDF ? " is-filled" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => inputCv.current?.click()}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputCv.current?.click(); } }}
                  onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                  onDragLeave={() => setArrastrando(false)}
                  onDrop={(e) => { e.preventDefault(); setArrastrando(false); elegirArchivo(e.dataTransfer.files[0]); }}
                >
                  <input
                    ref={inputCv}
                    type="file"
                    accept=".pdf,application/pdf"
                    hidden
                    onChange={(e) => elegirArchivo(e.target.files[0])}
                  />
                  <strong>{archivoPDF ? archivoPDF.name : "Elegí tu CV en PDF"}</strong>
                  <span>{archivoPDF ? "Tocá para cambiarlo" : "Hacé clic o arrastralo hasta acá"}</span>
                </div>
                {errorCarga && <p className="pr-error">{errorCarga}</p>}
              </div>
              <footer className="pr-modal-foot">
                <button type="button" className="pr-btn pr-btn--ghost" onClick={() => setPostulando(false)} disabled={enviando}>Cancelar</button>
                <button type="submit" className="pr-btn" disabled={enviando || !archivoPDF}>
                  {enviando ? "Enviando…" : "Enviar postulación"}
                </button>
              </footer>
            </form>
          </div>
        </div>,
        document.body
      )}

      {exito && (
        <ModalConfirmacionInscripcion
          tipoEvento="empleo"
          nombreEvento={empleo.nombre}
          onCerrar={() => { setExito(false); setPostulando(false); }}
        />
      )}

      {/* ── Confirmar descarte de un postulante ── */}
      {aDescartar && createPortal(
        <div className="pr-overlay" onClick={() => !descartando && setADescartar(null)}>
          <div className="pr-modal pr-modal--sm" role="alertdialog" aria-modal="true" aria-labelledby="em-descartar-titulo" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-body">
              <h2 id="em-descartar-titulo" className="pr-modal-title">¿Descartar postulante?</h2>
              <p className="pr-desc">Va a dejar de aparecer en esta vacante. Esta acción no se puede deshacer.</p>
            </div>
            <footer className="pr-modal-foot">
              <button className="pr-btn pr-btn--ghost" onClick={() => setADescartar(null)} disabled={descartando}>Volver</button>
              <button className="pr-btn pr-btn--danger" onClick={confirmarDescarte} disabled={descartando}>
                {descartando ? "Descartando…" : "Descartar"}
              </button>
            </footer>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default ModalEmpleo;
