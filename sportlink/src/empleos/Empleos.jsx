import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import api from "../axiosConfig.js";

import ModalEmpleo from "./ModalEmpleo.jsx";
import { datosEmpleo, habilidadesDe } from "./empleoUtils.js";
import FormularioEmpleo from "./FormularioEmpleo";
import Footer from "../footer/footer";
import CarruselChips from "../components/CarruselChips.jsx";
import { AvatarSlk } from "../components/ImagenesSlk.jsx";

import "../pruebas/PruebasView.css";
import "./EmpleosView.css";

const DEPORTES = ["Fútbol", "Basket", "Tenis", "Voley", "Pádel", "Rugby", "Hockey", "Natación", "Atletismo", "Ciclismo", "Boxeo", "Artes Marciales", "Handball", "Béisbol", "Golf"];
const ZONAS = ["CABA", "Zona Norte", "Zona Sur", "Zona Oeste", "Conurbano", "Interior"];
const RANGOS_HORAS = [
  { valor: "0-10", label: "0 a 10 hs" },
  { valor: "10-20", label: "10 a 20 hs" },
  { valor: "20-30", label: "20 a 30 hs" },
  { valor: "30-40", label: "30 a 40 hs" },
  { valor: "40+", label: "Más de 40 hs" },
];

const Flecha = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="square" />
  </svg>
);

const enRangoDeHoras = (horasreq, rango) => {
  if (!rango || horasreq == null) return true;
  const horas = Number(horasreq);
  switch (rango) {
    case "0-10": return horas >= 0 && horas <= 10;
    case "10-20": return horas > 10 && horas <= 20;
    case "20-30": return horas > 20 && horas <= 30;
    case "30-40": return horas > 30 && horas <= 40;
    case "40+": return horas > 40;
    default: return true;
  }
};

function Empleos({ usuario }) {
  // ── Datos ──────────────────────────────────────────────────
  const [empleos, setEmpleos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // ── Selección y gestión ────────────────────────────────────
  const [empleoSeleccionado, setEmpleoSeleccionado] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);
  const [idclubResuelto, setIdclubResuelto] = useState(null);
  const [clubListo, setClubListo] = useState(false);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [empleoEditando, setEmpleoEditando] = useState(null);
  const [empleoPorEliminar, setEmpleoPorEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");
  const [toast, setToast] = useState(null);

  // ── Filtros ────────────────────────────────────────────────
  const [busqueda, setBusqueda] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [deporte, setDeporte] = useState("");
  const [horasSemanales, setHorasSemanales] = useState("");

  const esClub = usuario?.tipousuario === "club";
  const esEntrenador = usuario?.tipousuario === "entrenador";
  const resolviendoClub = esClub && !clubListo && !!(usuario?.idusuario || usuario?.idUsuario || usuario?.id);

  const mostrarToast = (titulo, mensaje) => {
    setToast({ titulo, mensaje });
    setTimeout(() => setToast(null), 5000);
  };

  const handleEmpleoCreado = (nuevo) => {
    setEmpleos((prev) => [nuevo, ...prev]);
    setModalCrearAbierto(false);
    mostrarToast("Vacante publicada", "Ya está disponible para que los entrenadores se postulen.");
  };

  const handleEmpleoActualizado = (actualizado) => {
    setEmpleos((prev) => prev.map((e) => (e.idempleo === actualizado.idempleo ? actualizado : e)));
    setEmpleoSeleccionado((sel) => (sel?.idempleo === actualizado.idempleo ? actualizado : sel));
    setEmpleoEditando(null);
    mostrarToast("Cambios guardados", "La vacante se actualizó.");
  };

  const confirmarEliminar = async () => {
    if (!empleoPorEliminar) return;
    setEliminando(true);
    setErrorEliminar("");
    try {
      await api.delete(`/api/empleo/${empleoPorEliminar.idempleo}`);
      setEmpleos((prev) => prev.filter((e) => e.idempleo !== empleoPorEliminar.idempleo));
      setEmpleoSeleccionado((sel) => (sel?.idempleo === empleoPorEliminar.idempleo ? null : sel));
      setEmpleoPorEliminar(null);
    } catch (err) {
      setErrorEliminar(err.response?.data?.error || "No se pudo eliminar la vacante.");
    } finally {
      setEliminando(false);
    }
  };

  // ── Club: resolver su idclub desde el perfil ───────────────
  useEffect(() => {
    const idusuario = usuario?.idusuario || usuario?.idUsuario || usuario?.id;
    if (usuario?.tipousuario !== "club" || !idusuario) return;

    let montado = true;
    api.get(`/api/login/perfil/${idusuario}`)
      .then((res) => {
        if (!montado) return;
        const perfil = res.data;
        const candidatos = [
          perfil?.idclub, perfil?.idClub, perfil?.id_club, perfil?.clubId,
          perfil?.club?.idclub, perfil?.club?.idClub, perfil?.club?.id,
          perfil?.data?.idclub, perfil?.data?.club?.idclub,
        ];
        for (const c of candidatos) {
          const n = Number(c);
          if (!isNaN(n) && n > 0) {
            setIdclubResuelto(n);
            return;
          }
        }
      })
      .catch((err) => console.error("[Empleos] Error al obtener perfil del club:", err))
      .finally(() => { if (montado) setClubListo(true); });

    return () => { montado = false; };
  }, [usuario]);

  // ── Entrenador: sus postulaciones activas ──────────────────
  useEffect(() => {
    let montado = true;
    const idEntrenador = usuario?.identrenador || usuario?.idEntrenador;
    if (!idEntrenador) return;
    api.get("/api/inscripcionesempleo")
      .then((response) => {
        if (!montado) return;
        setPostulaciones(
          Array.isArray(response.data)
            ? response.data.filter((i) => Number(i.identrenador) === Number(idEntrenador) && i.estado === true)
            : []
        );
      })
      .catch((err) => console.error("[Empleos] Error al cargar postulaciones del entrenador:", err));
    return () => { montado = false; };
  }, [usuario]);

  // ── Carga de vacantes ──────────────────────────────────────
  useEffect(() => {
    let cancelado = false;
    api.get("/api/empleo")
      .then((response) => {
        if (cancelado) return;
        setEmpleos(Array.isArray(response.data) ? response.data.filter((e) => e.estado !== false) : []);
      })
      .catch((err) => {
        if (cancelado) return;
        console.error("[Empleos] Error al cargar empleos:", err);
        setError("No se pudieron cargar las vacantes. Probá de nuevo.");
      })
      .finally(() => { if (!cancelado) setCargando(false); });
    return () => { cancelado = true; };
  }, []);

  // ── Deep link /empleos/:id (empleo compartido en el feed o el chat) ──
  const { id: idEmpleoUrl } = useParams();
  const deepLinkAbierto = useRef(null);
  useEffect(() => {
    if (!idEmpleoUrl || deepLinkAbierto.current === idEmpleoUrl || cargando) return;
    deepLinkAbierto.current = idEmpleoUrl;
    const encontrado = empleos.find((e) => Number(e.idempleo) === Number(idEmpleoUrl));
    if (encontrado) {
      setEmpleoSeleccionado(encontrado);
      return;
    }
    // No está en la lista (p. ej. cerrado): traerlo directo
    api.get(`/api/empleo/${idEmpleoUrl}`)
      .then((r) => setEmpleoSeleccionado(r.data))
      .catch((e) => console.error("[Empleos] No se pudo abrir el empleo del enlace:", e));
  }, [idEmpleoUrl, empleos, cargando]);

  // Bloquear el scroll de la página con un modal abierto
  const hayModal = !!(empleoSeleccionado || modalCrearAbierto || empleoEditando || empleoPorEliminar);
  useEffect(() => {
    if (!hayModal) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [hayModal]);

  // Escape: crear/editar/eliminar tienen prioridad sobre el detalle (que maneja el suyo)
  useEffect(() => {
    if (!modalCrearAbierto && !empleoEditando && !empleoPorEliminar) return;
    const alPresionar = (e) => {
      if (e.key !== "Escape") return;
      if (empleoPorEliminar) { if (!eliminando) setEmpleoPorEliminar(null); }
      else if (empleoEditando) setEmpleoEditando(null);
      else setModalCrearAbierto(false);
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [modalCrearAbierto, empleoEditando, empleoPorEliminar, eliminando]);

  // ── Filtrado local ─────────────────────────────────────────
  const propias = esClub
    ? empleos.filter((e) => idclubResuelto && Number(e.idclub) === Number(idclubResuelto))
    : empleos;

  const empleosFiltrados = propias.filter((empleo) => {
    const texto = busqueda.trim().toLowerCase();
    const coincideBusqueda = !texto ||
      empleo.nombre?.toLowerCase().includes(texto) ||
      empleo.club?.nombre?.toLowerCase().includes(texto) ||
      empleo.acercaempleo?.toLowerCase().includes(texto);
    const coincideUbicacion = !ubicacion || empleo.club?.ubicacion?.toLowerCase().includes(ubicacion.toLowerCase());
    const coincideDeporte = !deporte || empleo.deporte?.deporte === deporte;
    return coincideBusqueda && coincideUbicacion && coincideDeporte && enRangoDeHoras(empleo.horasreq, horasSemanales);
  });

  const hayFiltros = !!(busqueda || ubicacion || deporte || horasSemanales);
  const limpiarFiltros = () => {
    setBusqueda("");
    setUbicacion("");
    setDeporte("");
    setHorasSemanales("");
  };

  const deportesEnLista = [...new Set(propias.map((e) => e.deporte?.deporte).filter(Boolean))].sort();
  const estaCargando = cargando || (esClub && resolviendoClub);
  const yaPostulado = (empleo) => postulaciones.some((p) => p.idempleo === empleo?.idempleo);

  const textoBoton = (empleo) => {
    if (esClub) return "Ver postulantes";
    if (esEntrenador && !yaPostulado(empleo)) return "Ver y postularme";
    return "Ver vacante";
  };

  const abrirEditar = (empleo) => setEmpleoEditando(empleo);
  const pedirEliminar = (empleo) => {
    setErrorEliminar("");
    setEmpleoPorEliminar(empleo);
  };

  return (
    <div className="pr">
      {toast && (
        <div className="pr-toast" role="status">
          <div>
            <p className="pr-toast-titulo">{toast.titulo}</p>
            <p className="pr-toast-texto">{toast.mensaje}</p>
          </div>
          <button className="pr-btn pr-btn--ink" onClick={() => setToast(null)}>Entendido</button>
        </div>
      )}

      {/* ── Encabezado ── */}
      <section className="pr-head">
        <div className="pr-wrap pr-head-grid">
          <div>
            <h1 className="pr-display pr-title">{esClub ? "Tus vacantes" : "Empleos"}</h1>
            <p className="pr-lead">
              {esClub
                ? "Publicá vacantes, revisá a cada postulante y preseleccioná a quien te interese."
                : "Vacantes de clubes para entrenadores. Filtrá por deporte, zona y carga horaria, y postulate con tu CV."}
            </p>
          </div>
          <div className="pr-head-side">
            <label className="pr-search">
              <span className="pr-sr">Buscar vacantes</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="square" />
              </svg>
              <input
                type="search"
                placeholder="Buscar por puesto o club"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </label>
            {esClub && (
              <button id="btn-publicar-empleo" className="pr-btn" onClick={() => setModalCrearAbierto(true)} disabled={!idclubResuelto}>
                {idclubResuelto || !resolviendoClub ? "Publicar vacante" : "Cargando club…"} <Flecha />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Filtros ── */}
      <section className="pr-filters" aria-label="Filtros">
        <div className="pr-wrap">
          <CarruselChips ariaLabel="Deporte" deps={[propias.length]}>
            <button className={`pr-chip${deporte === "" ? " is-on" : ""}`} aria-pressed={deporte === ""} onClick={() => setDeporte("")}>
              Todos
            </button>
            {(deportesEnLista.length ? deportesEnLista : DEPORTES).map((d) => (
              <button key={d} className={`pr-chip${deporte === d ? " is-on" : ""}`} aria-pressed={deporte === d} onClick={() => setDeporte(d)}>
                {d}
              </button>
            ))}
          </CarruselChips>

          <div className="pr-fields">
            <label className="pr-field">
              <span>Zona</span>
              <select value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}>
                <option value="">Todas</option>
                {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </label>
            <label className="pr-field">
              <span>Horas por semana</span>
              <select value={horasSemanales} onChange={(e) => setHorasSemanales(e.target.value)}>
                <option value="">Cualquiera</option>
                {RANGOS_HORAS.map((r) => <option key={r.valor} value={r.valor}>{r.label}</option>)}
              </select>
            </label>
            {hayFiltros && (
              <button className="pr-link pr-clear" onClick={limpiarFiltros}>Limpiar filtros</button>
            )}
          </div>
        </div>
      </section>

      {/* ── Resultados ── */}
      <section className="pr-results">
        <div className="pr-wrap">
          {!estaCargando && !error && empleosFiltrados.length > 0 && (
            <p className="pr-count">
              {empleosFiltrados.length} {empleosFiltrados.length === 1 ? "vacante" : "vacantes"}
            </p>
          )}

          {estaCargando ? (
            <div className="pr-grid" aria-busy="true" aria-label="Cargando vacantes">
              {[0, 1, 2].map((i) => <div key={i} className="pr-card pr-card--skeleton em-skeleton" />)}
            </div>
          ) : error ? (
            <div className="pr-empty">
              <h2 className="pr-display pr-empty-title">No pudimos cargar las vacantes</h2>
              <p>{error}</p>
              <button className="pr-btn pr-btn--ink" onClick={() => window.location.reload()}>Reintentar</button>
            </div>
          ) : empleosFiltrados.length === 0 ? (
            <div className="pr-empty">
              <h2 className="pr-display pr-empty-title">
                {esClub && !hayFiltros ? "Todavía no publicaste vacantes" : "No hay vacantes con estos filtros"}
              </h2>
              <p>
                {esClub && !hayFiltros
                  ? "Publicá tu primera vacante y empezá a recibir postulantes."
                  : "Probá con otro deporte, otra zona o una carga horaria distinta."}
              </p>
              {esClub && !hayFiltros ? (
                <button className="pr-btn" onClick={() => setModalCrearAbierto(true)} disabled={!idclubResuelto}>
                  Publicar vacante <Flecha />
                </button>
              ) : (
                <button className="pr-btn pr-btn--ink" onClick={limpiarFiltros}>Limpiar filtros</button>
              )}
            </div>
          ) : (
            <ul className="pr-grid">
              {empleosFiltrados.map((empleo) => {
                const habilidades = habilidadesDe(empleo);
                return (
                  <li className="pr-card" key={empleo.idempleo}>
                    <div className="pr-card-head">
                      <AvatarSlk foto={empleo.club?.fotoperfil} nombre={empleo.club?.nombre} />
                      <div className="pr-card-id">
                        <h3>{empleo.nombre || "Vacante"}</h3>
                        <p>{empleo.club?.nombre || "Club"}</p>
                      </div>
                      {yaPostulado(empleo) && <span className="pr-pill pr-pill--ok">Postulado</span>}
                    </div>

                    {habilidades.length > 0 && (
                      <div className="pr-tags">
                        {habilidades.slice(0, 3).map((h, i) => <span key={`${h}-${i}`}>{h}</span>)}
                        {habilidades.length > 3 && <span>+{habilidades.length - 3}</span>}
                      </div>
                    )}

                    <dl className="pr-facts">
                      {datosEmpleo(empleo).map(([titulo, valor]) => (
                        <div key={titulo}><dt>{titulo}</dt><dd>{valor}</dd></div>
                      ))}
                    </dl>

                    <div className="pr-card-foot">
                      <button className="pr-btn pr-btn--ink pr-btn--block" onClick={() => setEmpleoSeleccionado(empleo)}>
                        {textoBoton(empleo)}
                      </button>
                      {esClub && (
                        <div className="em-owner">
                          <button className="pr-link" onClick={() => abrirEditar(empleo)}>Editar</button>
                          <button className="pr-link pr-link--danger" onClick={() => pedirEliminar(empleo)}>Eliminar</button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <Footer />

      {/* ── Detalle de la vacante ── */}
      {empleoSeleccionado && (
        <ModalEmpleo
          key={empleoSeleccionado.idempleo}
          empleo={empleoSeleccionado}
          usuario={usuario}
          yaPostulado={yaPostulado(empleoSeleccionado)}
          inactivo={!!(modalCrearAbierto || empleoEditando || empleoPorEliminar)}
          onPostulacionExitosa={(nueva) => setPostulaciones((prev) => [...prev, nueva])}
          onEditar={abrirEditar}
          onEliminar={pedirEliminar}
          onCerrar={() => setEmpleoSeleccionado(null)}
        />
      )}

      {/* ── Publicar / modificar ── */}
      {(modalCrearAbierto || empleoEditando) && createPortal(
        <div className="pr-overlay" onClick={() => (empleoEditando ? setEmpleoEditando(null) : setModalCrearAbierto(false))}>
          <div className="pr-modal pr-modal--form" role="dialog" aria-modal="true" aria-labelledby="em-form-titulo" onClick={(e) => e.stopPropagation()}>
            <header className="pr-modal-head">
              <h2 id="em-form-titulo" className="pr-modal-title">{empleoEditando ? "Modificar vacante" : "Nueva vacante"}</h2>
              <button className="pr-close" onClick={() => (empleoEditando ? setEmpleoEditando(null) : setModalCrearAbierto(false))} aria-label="Cerrar">×</button>
            </header>
            <div className="pr-modal-body">
              {empleoEditando ? (
                <FormularioEmpleo
                  key={empleoEditando.idempleo}
                  idclub={empleoEditando.idclub}
                  empleo={empleoEditando}
                  onGuardado={handleEmpleoActualizado}
                  onCancelar={() => setEmpleoEditando(null)}
                />
              ) : (
                <FormularioEmpleo
                  idclub={idclubResuelto}
                  onGuardado={handleEmpleoCreado}
                  onCancelar={() => setModalCrearAbierto(false)}
                />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Confirmar eliminación ── */}
      {empleoPorEliminar && createPortal(
        <div className="pr-overlay" onClick={() => !eliminando && setEmpleoPorEliminar(null)}>
          <div className="pr-modal pr-modal--sm" role="alertdialog" aria-modal="true" aria-labelledby="em-eliminar-titulo" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-body">
              <h2 id="em-eliminar-titulo" className="pr-modal-title">¿Eliminar vacante?</h2>
              <p className="pr-desc">
                Se elimina <strong>{empleoPorEliminar.nombre}</strong> junto con todas sus postulaciones y el chat grupal asociado. Esta acción no se puede deshacer.
              </p>
              {errorEliminar && <p className="pr-error">{errorEliminar}</p>}
            </div>
            <footer className="pr-modal-foot">
              <button className="pr-btn pr-btn--ghost" onClick={() => setEmpleoPorEliminar(null)} disabled={eliminando}>Volver</button>
              <button className="pr-btn pr-btn--danger" onClick={confirmarEliminar} disabled={eliminando}>
                {eliminando ? "Eliminando…" : "Eliminar"}
              </button>
            </footer>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Empleos;
