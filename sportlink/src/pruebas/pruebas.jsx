import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import MenuPruebas from "./menuPruebas";
import PruebasHeader from "./pruebasHeader";
import Footer from "../footer/footer";

// Iconos de assets
import iconoMedalla   from "../assets/medalla.png";
import iconoUbicacion from "../assets/ubicacion.png";
import iconoFecha     from "../assets/fecha.png";
import iconoModalidad from "../assets/modalidad.png";

import "../entrenamientos/entrenamientos.css";
import "./pruebas.css";

function Pruebas({ idJugador }) {
  const [pruebas, setPruebas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [deporte, setDeporte] = useState("");
  const [categoria, setCategoria] = useState("");
  const [zona, setZona] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // ── Modal de detalle ──────────────────────────────────────
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const abrirModal = (prueba) => {
    setPruebaSeleccionada(prueba);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPruebaSeleccionada(null);
  };

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    if (modalAbierto) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [modalAbierto]);

  // ── Usuario ───────────────────────────────────────────────
  const usuarioAlmacenado = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  })();

  const idJugadorReal =
    idJugador ||
    usuarioAlmacenado?.idjugador ||
    usuarioAlmacenado?.idJugador ||
    usuarioAlmacenado?.jugador?.idjugador ||
    usuarioAlmacenado?.jugador?.idJugador ||
    usuarioAlmacenado?.jugadorId ||
    usuarioAlmacenado?.jugador?.id ||
    null;

  // ── Carga de datos ────────────────────────────────────────
  useEffect(() => {
    obtenerPruebas(false);
  }, [idJugadorReal]);

  async function obtenerPruebas(forceGeneral = mostrarTodas) {
    try {
      const url = forceGeneral || !idJugadorReal
        ? "http://localhost:3000/api/pruebas"
        : "http://localhost:3000/api/pruebas/deporte";
      const config = !(forceGeneral || !idJugadorReal) ? { params: { idJugador: idJugadorReal } } : {};
      const response = await axios.get(url, config);
      setPruebas(response.data);
    } catch (error) {
      console.error("Pruebas: error al cargar pruebas", error);
    }
  }

  const aplicarFiltros = () => {
    obtenerPruebas(mostrarTodas);
  };

  const restablecerFiltros = () => {
    setDeporte("");
    setCategoria("");
    setZona("");
    setFechaDesde("");
    setFechaHasta("");
    setMostrarTodas(true);
    obtenerPruebas(true);
  };

  // ── Filtrado ──────────────────────────────────────────────
  const pruebasFiltradas = pruebas.filter((prueba) => {
    const coincideBusqueda =
      prueba.club?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      prueba.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideDeporte   = deporte   === "" || prueba.deporte?.deporte === deporte;
    const coincideCategoria = categoria === "" || prueba.categoria === categoria;
    // Zona: comparación exacta (sidebar usa select controlado)
    const coincideZona = zona === "" || prueba.zona === zona;

    const fechaPrueba = prueba.fechaprueba ? new Date(prueba.fechaprueba) : null;
    const coincideFechaDesde = !fechaDesde || (fechaPrueba && fechaPrueba >= new Date(fechaDesde));
    const coincideFechaHasta = !fechaHasta || (fechaPrueba && fechaPrueba <= new Date(fechaHasta));

    return coincideBusqueda && coincideDeporte && coincideCategoria && coincideZona && coincideFechaDesde && coincideFechaHasta;
  });

  // ── Formato de fecha ──────────────────────────────────────
  const formatearFecha = (fechaStr) => {
    try {
      return new Date(fechaStr).toLocaleDateString("es-AR", {
        day: "2-digit", month: "long", year: "numeric"
      });
    } catch {
      return "Fecha a confirmar";
    }
  };

  //FALTA CAMBIAR : LOS FILTRAR ZONA Y FILTRAR DEPORTE TIENEN QUE SER LOS MISMO QUE LOS ARRAYS DE REGISTRAR JUGADOR

  // ── Restricción de acceso para entrenadores ───────────────
  if (usuarioAlmacenado?.tipousuario === "entrenador") {
    return (
      <div className="contenedor-pruebas" style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "60px 24px", maxWidth: "480px", margin: "0 auto" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>🚫</p>
          <h2 style={{ color: "var(--primary)", fontFamily: "var(--font-family)", fontSize: "20px", marginBottom: "12px" }}>
            Acceso restringido
          </h2>
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-family)", fontSize: "14px", lineHeight: "1.6" }}>
            Esta sección es exclusiva para jugadores. Los entrenadores no pueden acceder a las pruebas deportivas.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <>
      <div className="contenedor-pruebas">
        <div className="pruebas-layout">
          <MenuPruebas
            deporte={deporte}       setDeporte={setDeporte}
            categoria={categoria}   setCategoria={setCategoria}
            zona={zona}             setZona={setZona}
            fechaDesde={fechaDesde} setFechaDesde={setFechaDesde}
            fechaHasta={fechaHasta} setFechaHasta={setFechaHasta}
            onAplicar={aplicarFiltros}
            onReset={restablecerFiltros}
          />

          <main className="contenido-pruebas">
            <PruebasHeader busqueda={busqueda} setBusqueda={setBusqueda} />

            <div className="grid-pruebas">
              {pruebasFiltradas.map((prueba) => (
                <div className="card-prueba" key={prueba.idprueba}>

                  {/* ── Imagen (mitad superior, altura fija 200px) ── */}
                  <div className="card-imagen-wrapper">
                    {prueba.imagen ? (
                      <img src={prueba.imagen} alt={prueba.club?.nombre || "prueba"} />
                    ) : (
                      <div className="sin-imagen">SIN FOTO</div>
                    )}
                    <div className="card-imagen-overlay" aria-hidden="true" />
                    <span className="tag-flotante">RECOMENDADO</span>
                  </div>

                  {/* ── Info (flex-grow:1 → queda dentro del fondo) ── */}
                  <div className="card-prueba-info">
                    <h2>
                      {prueba.club?.nombre
                        ? prueba.club.nombre.toUpperCase()
                        : "CLUB DESCONOCIDO"}
                    </h2>

                    <div className="card-prueba-detalles-lista">
                      <div className="card-prueba-detalle-item">
                        <img src={iconoMedalla} alt="Deporte" className="card-icon-asset" />
                        <p>{prueba.deporte?.deporte || "Deporte no especificado"}</p>
                      </div>

                      <div className="card-prueba-detalle-item">
                        <img src={iconoUbicacion} alt="Zona" className="card-icon-asset" />
                        <p>{prueba.zona || "Zona no especificada"}</p>
                      </div>

                      <div className="card-prueba-detalle-item">
                        <img src={iconoFecha} alt="Fecha" className="card-icon-asset" />
                        <p>{prueba.fechaprueba ? formatearFecha(prueba.fechaprueba) : "Fecha a confirmar"}</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Pie: botón siempre dentro de la card ── */}
                  <div className="card-prueba-pie">
                    <button
                      className="btn-mas-info"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirModal(prueba);
                      }}
                    >
                      MÁS INFORMACIÓN
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </main>
        </div>
      </div>

      <Footer />

      {/* ── MODAL DE DETALLE ────────────────────────────────
          Renderizado en document.body vía portal (igual que
          el modal de DetalleEntrenamiento)                  */}
      {modalAbierto && pruebaSeleccionada && createPortal(
        <div
          className="modal-prueba-overlay"
          onClick={cerrarModal}
        >
          <div
            className="modal-prueba-contenedor"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header sticky */}
            <div className="modal-prueba-header">
              <h3 className="modal-prueba-titulo">
                {pruebaSeleccionada.club?.nombre
                  ? pruebaSeleccionada.club.nombre.toUpperCase()
                  : "DETALLE DE PRUEBA"}
              </h3>
              <button className="modal-prueba-cerrar" onClick={cerrarModal}>×</button>
            </div>

            {/* Cuerpo scrollable */}
            <div className="modal-prueba-cuerpo">

              {/* Banner */}
              {pruebaSeleccionada.imagen ? (
                <img
                  src={pruebaSeleccionada.imagen}
                  alt={pruebaSeleccionada.club?.nombre || "prueba"}
                  className="modal-prueba-banner"
                />
              ) : (
                <div className="modal-prueba-banner-fallback">
                  Sin imagen disponible
                </div>
              )}

              {/* Nombre del club */}
              <h2 className="modal-prueba-club">
                {pruebaSeleccionada.club?.nombre || "Club Desconocido"}
              </h2>

              {/* Grilla de especificaciones */}
              <div className="modal-prueba-specs">

                <div className="modal-prueba-spec-item">
                  <span className="modal-prueba-spec-label">
                    <img src={iconoMedalla} alt="Deporte" />
                    Deporte
                  </span>
                  <span className="modal-prueba-spec-valor">
                    {pruebaSeleccionada.deporte?.deporte || "No especificado"}
                  </span>
                </div>

                <div className="modal-prueba-spec-item">
                  <span className="modal-prueba-spec-label">
                    <img src={iconoModalidad} alt="Categoría" />
                    Categoría
                  </span>
                  <span className="modal-prueba-spec-valor">
                    {pruebaSeleccionada.categoria || "No especificada"}
                  </span>
                </div>

                <div className="modal-prueba-spec-item">
                  <span className="modal-prueba-spec-label">
                    <img src={iconoUbicacion} alt="Zona" />
                    Zona
                  </span>
                  <span className="modal-prueba-spec-valor">
                    {pruebaSeleccionada.zona || "No especificada"}
                  </span>
                </div>

                <div className="modal-prueba-spec-item">
                  <span className="modal-prueba-spec-label">
                    <img src={iconoFecha} alt="Fecha" />
                    Fecha
                  </span>
                  <span className="modal-prueba-spec-valor">
                    {pruebaSeleccionada.fechaprueba
                      ? formatearFecha(pruebaSeleccionada.fechaprueba)
                      : "A confirmar"}
                  </span>
                </div>

              </div>

              {/* Descripción (si existe) */}
              {pruebaSeleccionada.descripcion && (
                <>
                  <p className="modal-prueba-descripcion-titulo">Descripción</p>
                  <p className="modal-prueba-descripcion-texto">
                    {pruebaSeleccionada.descripcion}
                  </p>
                </>
              )}

              {/* Pie con botón cerrar */}
              <div className="modal-prueba-acciones">
                <button className="btn-cancelar" onClick={cerrarModal}>
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default Pruebas;