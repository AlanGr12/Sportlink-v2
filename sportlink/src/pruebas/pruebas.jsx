import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import MenuPruebas from "./menuPruebas";
import PruebasHeader from "./pruebasHeader";
import FormularioPrueba from "./FormularioPrueba";
import Footer from "../footer/footer";

// Iconos de assets
import iconoMedalla   from "../assets/medalla.png";
import iconoUbicacion from "../assets/ubicacion.png";
import iconoFecha     from "../assets/fecha.png";
import iconoModalidad from "../assets/modalidad.png";

import "../entrenamientos/entrenamientos.css";
import "./pruebas.css";

function Pruebas({ idJugador, usuario }) {
  const [pruebas, setPruebas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [deporte, setDeporte] = useState("");
  const [categoria, setCategoria] = useState("");
  const [zona, setZona] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [deporteUsuario, setDeporteUsuario] = useState(null);

  // ── Modal de detalle ──────────────────────────────────────
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // ── Modal de creación (solo rol club) ─────────────────────
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  // ── Usuario ───────────────────────────────────────────────
  const usuarioAlmacenado = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  })();

  // El prop `usuario` tiene prioridad; si no llega, usamos localStorage
  const usuarioEfectivo = usuario || usuarioAlmacenado;

  const idJugadorReal =
    idJugador ||
    usuarioEfectivo?.idjugador ||
    usuarioEfectivo?.idJugador ||
    usuarioEfectivo?.jugador?.idjugador ||
    usuarioEfectivo?.jugador?.idJugador ||
    usuarioEfectivo?.jugadorId ||
    usuarioEfectivo?.jugador?.id ||
    usuarioAlmacenado?.idjugador ||
    usuarioAlmacenado?.idJugador ||
    usuarioAlmacenado?.jugador?.idjugador ||
    usuarioAlmacenado?.jugador?.idJugador ||
    usuarioAlmacenado?.jugadorId ||
    usuarioAlmacenado?.jugador?.id ||
    null;

  // idclub resuelto asíncronamente via /api/login/perfil/:idusuario
  const [idclubResuelto, setIdclubResuelto] = useState(null);
  const [idjugadorResuelto, setIdjugadorResuelto] = useState(() => {
    const id = Number(idJugadorReal);
    return !isNaN(id) && id > 0 ? id : null;
  });
  const [inscripcionLoading, setInscripcionLoading] = useState(false);
  const [verificandoInscripcion, setVerificandoInscripcion] = useState(false);
  const [inscripcionError, setInscripcionError] = useState("");
  const [isInscripto, setIsInscripto] = useState(false);

  const tipoUsuario = usuarioEfectivo?.tipousuario?.toString()?.toLowerCase();
  const esJugador = tipoUsuario === "jugador" || tipoUsuario === "player";
  const esClub = tipoUsuario === "club";
  const esEntrenador = tipoUsuario === "entrenador";

  // ── Postulantes ──────────────────────────────────────────
  const [postulantes, setPostulantes] = useState([]);
  const [postulantesLoading, setPostulantesLoading] = useState(false);
  const [postulantesError, setPostulantesError] = useState("");
  const [fotoJugador, setFotoJugador] = useState("");

  // ── Toast de notificación ──────────────────────────────────
  const [toast, setToast] = useState(null);
  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 4000);
  };

  const abrirModal = (prueba) => {
    const inscriptoLocal = estaInscripto(prueba);
    setIsInscripto(inscriptoLocal);
    setVerificandoInscripcion(!inscriptoLocal && !!idjugadorResuelto);
    setInscripcionError("");
    setInscripcionLoading(false);
    setPruebaSeleccionada(prueba);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPruebaSeleccionada(null);
    setIsInscripto(false);
    setInscripcionError("");
    setInscripcionLoading(false);
    setVerificandoInscripcion(false);
  };

  useEffect(() => {
    let cancelado = false;

    if (!modalAbierto) {
      setIsInscripto(false);
      setInscripcionError("");
      setVerificandoInscripcion(false);
      return;
    }

    if (!pruebaSeleccionada || !idjugadorResuelto) {
      setIsInscripto(false);
      setVerificandoInscripcion(false);
      return;
    }

    const validarInscripcion = async () => {
      const idPruebaNum = obtenerIdPrueba(pruebaSeleccionada);
      const inscriptoLocal = estaInscripto(pruebaSeleccionada);

      setIsInscripto(inscriptoLocal);
      setVerificandoInscripcion(!inscriptoLocal);

      if (inscriptoLocal || !idPruebaNum) {
        setVerificandoInscripcion(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/api/inscripcionesprueba", {
          params: { idjugador: idjugadorResuelto, idprueba: idPruebaNum }
        });

        if (cancelado) return;
        setIsInscripto(respuestaTieneInscripcion(response.data, idjugadorResuelto, idPruebaNum));
      } catch (error) {
        if (!cancelado) {
          console.error("[Pruebas] Error al verificar inscripción:", error);
          setIsInscripto(false);
        }
      } finally {
        if (!cancelado) {
          setVerificandoInscripcion(false);
        }
      }
    };

    validarInscripcion();

    return () => {
      cancelado = true;
    };
  }, [modalAbierto, pruebaSeleccionada, idjugadorResuelto]);

  useEffect(() => {
    let cancelado = false;

    if (!modalAbierto || !pruebaSeleccionada || !esClub) {
      setPostulantes([]);
      setPostulantesError("");
      setPostulantesLoading(false);
      return;
    }

    const obtenerPostulantes = async () => {
      const idPruebaNum = obtenerIdPrueba(pruebaSeleccionada);
      if (!idPruebaNum) return;

      setPostulantesLoading(true);
      setPostulantesError("");
      try {
        const response = await axios.get("http://localhost:3000/api/inscripcionesprueba", {
          params: { idprueba: idPruebaNum }
        });
        if (cancelado) return;
        setPostulantes(normalizarListaInscripciones(response.data));
      } catch (error) {
        if (!cancelado) {
          console.error("[Pruebas] Error al obtener postulantes:", error);
          setPostulantesError("Error al cargar la lista de postulantes.");
        }
      } finally {
        if (!cancelado) {
          setPostulantesLoading(false);
        }
      }
    };

    obtenerPostulantes();

    return () => {
      cancelado = true;
    };
  }, [modalAbierto, pruebaSeleccionada, esClub]);

  const obtenerIdPrueba = (prueba) => {
    const id = Number(prueba?.idprueba || prueba?.idPrueba || prueba?.id || 0);
    return !isNaN(id) && id > 0 ? id : null;
  };

  const normalizarListaInscripciones = (data) => {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];

    const posiblesListas = [
      data.inscripciones,
      data.inscripcionesprueba,
      data.inscripcionesPrueba,
      data.data,
      data.resultado,
      data.results,
      data.items
    ];

    for (const lista of posiblesListas) {
      if (Array.isArray(lista)) return lista;
    }

    return [data];
  };

  const respuestaTieneInscripcion = (data, idJugador, idPrueba) => {
    if (data === true || data?.inscripto === true || data?.inscrito === true || data?.yaInscripto === true) {
      return true;
    }

    const idJugadorNum = Number(idJugador);
    const idPruebaNum = Number(idPrueba);

    return normalizarListaInscripciones(data).some((item) => {
      const jugador = Number(
        item?.idjugador ??
        item?.idJugador ??
        item?.jugadorId ??
        item?.jugador?.idjugador ??
        item?.jugador?.idJugador ??
        item?.jugador?.id
      );
      const prueba = Number(
        item?.idprueba ??
        item?.idPrueba ??
        item?.pruebaId ??
        item?.prueba?.idprueba ??
        item?.prueba?.idPrueba ??
        item?.prueba?.id
      );

      return jugador === idJugadorNum && prueba === idPruebaNum;
    });
  };

  const estaInscripto = (prueba) => {
    if (!prueba || !idjugadorResuelto) {
      console.log("[Pruebas] estaInscripto: datos incompletos", { prueba: !!prueba, idjugadorResuelto });
      return false;
    }

    const idJugadorNum = Number(idjugadorResuelto);
    if (isNaN(idJugadorNum) || idJugadorNum <= 0) {
      console.log("[Pruebas] estaInscripto: idJugadorNum inválido", idJugadorNum);
      return false;
    }

    // Validar si hay una propiedad booleana directa indicando inscripción
    const estadoBooleano = prueba?.yaInscripto ?? prueba?.yainscripto ?? prueba?.estaInscripto ?? prueba?.inscripto ?? prueba?.inscrito;
    if (estadoBooleano === true || String(estadoBooleano).toLowerCase() === "true") {
      console.log("[Pruebas] estaInscripto: TRUE por propiedad booleana", { estadoBooleano });
      return true;
    }

    // Validar en arrays de inscripciones
    const listas = prueba?.inscripciones || prueba?.inscritos || prueba?.inscriptos || prueba?.inscripcion || prueba?.jugadores || prueba?.participantes;
    if (Array.isArray(listas) && listas.length > 0) {
      const encontrado = listas.some((item) => {
        const candidato = Number(
          item?.idjugador ??
          item?.idJugador ??
          item?.jugadorId ??
          item?.jugador?.idjugador ??
          item?.jugador?.idJugador ??
          item?.jugador?.id ??
          item?.id ??
          item
        );
        return !isNaN(candidato) && candidato > 0 && candidato === idJugadorNum;
      });
      if (encontrado) {
        console.log("[Pruebas] estaInscripto: TRUE encontrado en array", { listas: listas.length, idJugadorNum });
        return true;
      }
    }

    console.log("[Pruebas] estaInscripto: FALSE - no se encontró inscripción", { 
      idJugadorNum, 
      tieneEstadoBooleano: !!estadoBooleano,
      tieneArrays: !!listas 
    });
    return false;
  };

  const handleInscribirse = async () => {
    if (!pruebaSeleccionada) return;
    setInscripcionError("");

    const idJugadorNum = Number(idjugadorResuelto);
    const idPruebaNum = obtenerIdPrueba(pruebaSeleccionada);

    if (isNaN(idJugadorNum) || idJugadorNum <= 0) {
      setInscripcionError("No se pudo identificar tu jugador. Cerrá sesión e ingresá nuevamente.");
      return;
    }

    if (!idPruebaNum) {
      setInscripcionError("No se pudo identificar la prueba seleccionada.");
      return;
    }

    if (isInscripto || verificandoInscripcion || estaInscripto(pruebaSeleccionada)) {
      setInscripcionError("Ya estás inscrito en esta prueba.");
      return;
    }

    const body = { idjugador: idJugadorNum, idprueba: idPruebaNum };
    console.log("[Pruebas] Inscripción payload:", body);

    setInscripcionLoading(true);
    try {
      await axios.post(
        "http://localhost:3000/api/inscripcionesprueba",
        body,
        { headers: { "Content-Type": "application/json" } }
      );

      const nombreClub = pruebaSeleccionada?.club?.nombre || "Club";
      mostrarToast(`Te has inscrito correctamente a la prueba de ${nombreClub}`);
      setIsInscripto(true);
      setPruebas((prevPruebas) => prevPruebas.map((prueba) => {
        if (obtenerIdPrueba(prueba) !== idPruebaNum) return prueba;

        const inscripcionesActuales = Array.isArray(prueba.inscripciones) ? prueba.inscripciones : [];
        return {
          ...prueba,
          yaInscripto: true,
          inscripciones: [
            ...inscripcionesActuales,
            { idjugador: idJugadorNum, idprueba: idPruebaNum }
          ]
        };
      }));
    } catch (error) {
      const response = error?.response;
      const data = response?.data;
      const extractErrorMessage = (value) => {
        if (typeof value === "string") return value;
        if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join(", ");
        if (typeof value === "object" && value !== null) {
          if (typeof value.message === "string") return value.message;
          if (typeof value.error === "string") return value.error;
          if (typeof value.detail === "string") return value.detail;
          if (Array.isArray(value.errors)) return extractErrorMessage(value.errors);
          return JSON.stringify(value);
        }
        return "";
      };

      const mensaje =
        extractErrorMessage(data) ||
        extractErrorMessage(error) ||
        error?.message ||
        "Ocurrió un error al inscribirte.";

      setInscripcionError(mensaje);
      console.error("[Pruebas] Error al inscribirse:", error);
    } finally {
      setInscripcionLoading(false);
    }
  };

  // Bloquear scroll del body mientras cualquier modal está abierto
  useEffect(() => {
    if (modalAbierto || modalCrearAbierto) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [modalAbierto, modalCrearAbierto]);

  // ── Cuando el usuario es un club, obtener su idclub real desde la API ────
  // El login solo guarda idusuario — el idclub está en el perfil completo.
  useEffect(() => {
    const idusuario = usuarioEfectivo?.idusuario;
    if (!esClub || !idusuario) return;

    let montado = true;
    axios.get(`http://localhost:3000/api/login/perfil/${idusuario}`)
      .then((res) => {
        if (!montado) return;
        const perfil = res.data;
        const candidatos = [
          perfil?.idclub,
          perfil?.idClub,
          perfil?.id_club,
          perfil?.clubId,
          perfil?.club?.idclub,
          perfil?.club?.idClub,
          perfil?.club?.id,
          perfil?.data?.idclub,
          perfil?.data?.club?.idclub,
        ];
        for (const c of candidatos) {
          const n = Number(c);
          if (!isNaN(n) && n > 0) {
            setIdclubResuelto(n);
            return;
          }
        }
        console.warn("[Pruebas] No se encontró idclub en el perfil:", JSON.stringify(perfil, null, 2));
      })
      .catch((err) => {
        console.error("[Pruebas] Error al obtener perfil del club:", err);
      });

    return () => { montado = false; };
  }, [esClub, usuarioEfectivo?.idusuario]);

  // ── Cuando el usuario es un jugador, obtener su idjugador real desde la API ──
  useEffect(() => {
    const idusuario = usuarioEfectivo?.idusuario;
    if (!esJugador || !idusuario) return;

    let montado = true;
    axios.get(`http://localhost:3000/api/login/perfil/${idusuario}`)
      .then((res) => {
        if (!montado) return;
        const perfil = res.data;

        // Guardar la foto del jugador para el Toast
        const foto = perfil?.fotoperfil || perfil?.jugador?.fotoperfil || perfil?.data?.fotoperfil || perfil?.data?.jugador?.fotoperfil || "";
        setFotoJugador(foto);

        const candidatos = [
          perfil?.idjugador,
          perfil?.idJugador,
          perfil?.id_jugador,
          perfil?.jugador?.idjugador,
          perfil?.jugador?.idJugador,
          perfil?.jugadorId,
          perfil?.jugador?.id,
          perfil?.data?.idjugador,
          perfil?.data?.jugador?.idjugador,
          perfil?.data?.jugador?.id,
        ];
        for (const c of candidatos) {
          const n = Number(c);
          if (!isNaN(n) && n > 0) {
            setIdjugadorResuelto(n);
            return;
          }
        }
        console.warn("[Pruebas] No se encontró idjugador en el perfil:", JSON.stringify(perfil, null, 2));
      })
      .catch((err) => {
        console.error("[Pruebas] Error al obtener perfil del jugador:", err);
      });

    return () => { montado = false; };
  }, [esJugador, usuarioEfectivo?.idusuario]);

  // ── Carga de datos ────────────────────────────────────────
  useEffect(() => {
    obtenerPruebas(false);
  }, [idJugadorReal]);

  useEffect(() => {
    if (!mostrarTodas && !deporte && deporteUsuario) {
      setDeporte(deporteUsuario);
    }
  }, [deporteUsuario, mostrarTodas, deporte]);

  async function obtenerPruebas(forceGeneral = mostrarTodas) {
    try {
      const filtrarPorDeporte = !(forceGeneral || !idJugadorReal);
      const url = filtrarPorDeporte
        ? "http://localhost:3000/api/pruebas/deporte"
        : "http://localhost:3000/api/pruebas";
      const config = filtrarPorDeporte ? { params: { idJugador: idJugadorReal } } : {};
      const response = await axios.get(url, config);
      setPruebas(response.data);

      // Capturar el deporte del usuario a partir de la primera respuesta filtrada
      if (filtrarPorDeporte && Array.isArray(response.data) && response.data.length > 0) {
        const primerDeporte = response.data[0]?.deporte?.deporte || null;
        if (primerDeporte) {
          setDeporteUsuario(primerDeporte);
          if (!forceGeneral && !deporte) {
            setDeporte(primerDeporte);
          }
        }
      }
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
    // Filtro Estricto de Pruebas para Rol Club
    if (esClub) {
      if (!idclubResuelto) return false;
      const idClubPrueba = Number(
        prueba.idclub ??
        prueba.idClub ??
        prueba.club?.idclub ??
        prueba.club?.idClub ??
        prueba.clubId
      );
      if (idClubPrueba !== Number(idclubResuelto)) return false;
    }

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

  const modalDetalleValido = modalAbierto && pruebaSeleccionada && (
    pruebaSeleccionada?.idprueba != null ||
    pruebaSeleccionada?.idPrueba != null ||
    pruebaSeleccionada?.id != null ||
    pruebaSeleccionada?.club?.nombre
  );

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
  if (esEntrenador) {
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
      {/* Toast de notificación */}
      {toast && (
        <div className="toast-banner custom-toast">
          <div className="toast-cuerpo">
            {fotoJugador ? (
              <img src={fotoJugador} alt="Avatar" className="toast-avatar" />
            ) : (
              <div className="toast-avatar-fallback">
                👤
              </div>
            )}
            <div className="toast-texto">
              <h4 className="toast-titulo">Te has inscrito correctamente a la prueba.</h4>
              <p className="toast-descripcion">{toast.mensaje}</p>
            </div>
          </div>
          <div className="toast-acciones">
            <button className="btn-toast-entendido" onClick={() => setToast(null)}>
              ENTENDIDO
            </button>
          </div>
        </div>
      )}

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
            <PruebasHeader
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              esClub={esClub}
              idclubResuelto={idclubResuelto}
              onCrear={() => setModalCrearAbierto(true)}
            />

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
                    {deporteUsuario && prueba.deporte?.deporte === deporteUsuario && (
                      <span className="tag-flotante">RECOMENDADO</span>
                    )}
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

      {/* ── MODAL CREAR PRUEBA ──────────────────────────────────
          Renderizado en document.body vía portal                 */}
      {modalCrearAbierto && createPortal(
        <div
          className="modal-prueba-overlay"
          onClick={() => setModalCrearAbierto(false)}
        >
          <div
            className="modal-prueba-contenedor"
            style={{ maxWidth: "640px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header sticky */}
            <div className="modal-prueba-header">
              <h3 className="modal-prueba-titulo">Crear Nueva Prueba</h3>
              <button
                className="modal-prueba-cerrar"
                onClick={() => setModalCrearAbierto(false)}
              >
                ×
              </button>
            </div>

            {/* Cuerpo con el formulario */}
            <div className="modal-prueba-cuerpo">
              <FormularioPrueba
                idclub={idclubResuelto}
                onGuardado={() => {
                  setModalCrearAbierto(false);
                  mostrarToast("¡Prueba creada con éxito!");
                  obtenerPruebas(mostrarTodas);
                }}
                onCancelar={() => setModalCrearAbierto(false)}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── MODAL DE DETALLE ────────────────────────────────
          Renderizado en document.body vía portal (igual que
          el modal de DetalleEntrenamiento)                  */}
      {modalDetalleValido && createPortal(
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

              {/* Sección de Postulantes (solo para clubes) */}
              {esClub && (
                <div className="modal-prueba-postulantes-seccion">
                  <p className="modal-prueba-descripcion-titulo">Postulantes Inscriptos ({postulantes.length})</p>
                  {postulantesLoading ? (
                    <div className="postulantes-loading">Cargando postulantes...</div>
                  ) : postulantesError ? (
                    <div className="form-error-banner">{postulantesError}</div>
                  ) : postulantes.length === 0 ? (
                    <div className="postulantes-vacio">Aún no hay postulantes inscriptos en esta prueba.</div>
                  ) : (
                    <div className="postulantes-lista">
                      {postulantes.map((item, index) => {
                        const inscrito = item;
                        const jugador = item.jugador || item.jugadores || item;
                        
                        const nombreCompleto = (jugador?.nombre && jugador?.apellido)
                          ? `${jugador.nombre} ${jugador.apellido}`
                          : (jugador?.nombre || jugador?.apellido || 
                             inscrito?.nombre || inscrito?.usuario?.nombre || 
                             inscrito?.jugador?.nombre || "Jugador Sin Nombre");

                        const deporte = jugador?.deportes?.deporte || jugador?.deporte || inscrito?.deporte || "No especificado";
                        const ubicacion = jugador?.ubicacion || inscrito?.ubicacion || "No especificada";
                        const telefono = jugador?.telefono || inscrito?.telefono || "No especificado";
                        const genero = jugador?.genero || inscrito?.genero || "No especificado";
                        const foto = jugador?.fotoperfil || inscrito?.fotoperfil || "";

                        return (
                          <div key={jugador?.idjugador || inscrito?.idjugador || index} className="postulante-card">
                            {foto ? (
                              <img src={foto} alt={nombreCompleto} className="postulante-foto" />
                            ) : (
                              <div className="postulante-foto-fallback">
                                {nombreCompleto.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="postulante-info">
                              <h4 className="postulante-nombre">{nombreCompleto}</h4>
                              <div className="postulante-detalles">
                                <p><span>🏅 Deporte:</span> {deporte}</p>
                                <p><span>📍 Ubicación:</span> {ubicacion}</p>
                                <p><span>📞 Teléfono:</span> {telefono}</p>
                                <p><span>⚧ Género:</span> {genero}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje de error de inscripción */}
              {inscripcionError && (
                <div className="form-error-banner" style={{ marginBottom: "14px" }}>
                  {inscripcionError}
                </div>
              )}

              {/* Pie con botón cerrar */}
              <div className="modal-prueba-acciones">
                {esJugador && (
                  isInscripto || verificandoInscripcion ? (
                    <button
                      className="btn-guardar"
                      disabled
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#111111",
                        border: "1px solid #d1d5db",
                        cursor: "not-allowed",
                        opacity: 0.7
                      }}
                    >
                      {isInscripto ? "INSCRIPTO" : "VERIFICANDO..."}
                    </button>
                  ) : (
                    <button
                      className="btn-guardar"
                      onClick={handleInscribirse}
                      disabled={inscripcionLoading || !idjugadorResuelto}
                    >
                      {inscripcionLoading
                        ? "Inscribiendo..."
                        : idjugadorResuelto
                          ? "INSCRIBIRSE"
                          : "Cargando jugador..."}
                    </button>
                  )
                )}
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
