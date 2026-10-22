import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import api from "../axiosConfig.js";
import FormularioPrueba from "./FormularioPrueba";
import Footer from "../footer/footer.jsx";
import ModalConfirmacionInscripcion from '../components/ModalConfirmacionInscripcion.jsx';
import ModalConfirmacionEliminar from '../calendario/ModalConfirmacionEliminar.jsx';
import ModalConfirmarEliminar from '../components/ModalConfirmarEliminar.jsx';
import useSeguidos from '../hooks/useSeguidos.js';
import CarruselChips from '../components/CarruselChips.jsx';
import { fechaLarga } from '../utils/formato.js';
import { AvatarSlk, MediaEvento } from '../components/ImagenesSlk.jsx';
import ListaInscriptos from '../components/ListaInscriptos.jsx';
import MapaUbicacionDark from '../components/maps/MapaUbicacionDark.jsx';
import { formatearUbicacionCorta } from '../utils/mapUtils.js';
import { parsearFechaLocal, haPasadoFecha } from '../utils/dateUtils.js';

// Iconos hechos con codigo

import "./PruebasView.css";

// Opciones de filtro (mismas listas que el registro y el formulario de pruebas)
const DEPORTES = ["Fútbol", "Basket", "Tenis", "Voley", "Pádel", "Rugby", "Hockey", "Natación", "Atletismo", "Ciclismo", "Boxeo", "Artes Marciales", "Handball", "Béisbol", "Golf"];
const ZONAS = ["CABA", "Zona Norte", "Zona Sur", "Zona Oeste", "Conurbano", "Interior"];
const CATEGORIAS = ["Primera", "Reserva", "Juveniles"];

const Flecha = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="square" />
  </svg>
);

function Pruebas({ idJugador, usuario }) {
  const [pruebas, setPruebas] = useState([]);
  const [cargandoPruebas, setCargandoPruebas] = useState(true);
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
  const [mostrarExitoModal, setMostrarExitoModal] = useState(false);

  // ── Modal de creación (solo rol club) ─────────────────────
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  // ── Usuario ───────────────────────────────────────────────
  // Usuario viene del prop (App.jsx es la fuente de verdad de sesión)
  const usuarioEfectivo = usuario;

  const idJugadorReal =
    idJugador ||
    usuarioEfectivo?.idjugador ||
    usuarioEfectivo?.idJugador ||
    usuarioEfectivo?.jugador?.idjugador ||
    usuarioEfectivo?.jugador?.idJugador ||
    usuarioEfectivo?.jugadorId ||
    usuarioEfectivo?.jugador?.id ||
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
  // ── Lista de espera ──────────────────────────────────────
  const [listaEspera, setListaEspera] = useState({ enLista: false, posicion: null, total: 0 });
  const [listaEsperaLoading, setListaEsperaLoading] = useState(false);
  const [desuscripcionLoading, setDesuscripcionLoading] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarExitoDesuscripcion, setMostrarExitoDesuscripcion] = useState(false);

  const tipoUsuario = usuarioEfectivo?.tipousuario?.toString()?.toLowerCase();
  const esJugador = tipoUsuario === "jugador" || tipoUsuario === "player";
  const esClub = tipoUsuario === "club";
  const esEntrenador = tipoUsuario === "entrenador";

  // ── Postulantes ──────────────────────────────────────────
  const [postulantes, setPostulantes] = useState([]);
  const [postulantesLoading, setPostulantesLoading] = useState(false);
  const [postulantesError, setPostulantesError] = useState("");
  const [, setFotoJugador] = useState("");

  // ── Clubes que sigo: sus pruebas aparecen primero ─────────────
  const seguidosIds = useSeguidos(usuarioEfectivo);

  // ── Eliminación de pruebas (club dueño o administrador) ──────
  const esAdmin = usuarioEfectivo?.es_admin === true;
  const [pruebaPorEliminar, setPruebaPorEliminar] = useState(null);
  const [eliminandoPrueba, setEliminandoPrueba] = useState(false);
  const [errorEliminarPrueba, setErrorEliminarPrueba] = useState(null);

  const puedeEliminarPrueba = (prueba) =>
    esAdmin ||
    (esClub && idclubResuelto != null && Number(prueba.club?.idclub) === Number(idclubResuelto));

  const confirmarEliminarPrueba = async () => {
    if (!pruebaPorEliminar) return;
    setEliminandoPrueba(true);
    setErrorEliminarPrueba(null);
    try {
      await api.delete(`/api/pruebas/${pruebaPorEliminar.idprueba}`);
      setPruebas((prev) => prev.filter((p) => Number(p.idprueba) !== Number(pruebaPorEliminar.idprueba)));
      setPruebaPorEliminar(null);
    } catch (err) {
      setErrorEliminarPrueba(err.response?.data?.error || 'No se pudo eliminar la prueba.');
    } finally {
      setEliminandoPrueba(false);
    }
  };

  // ── Toast de notificación ──────────────────────────────────
  const [toast, setToast] = useState(null);
const mostrarToast = (titulo, mensaje, tipo = "success") => {
  setToast({ titulo, mensaje, tipo });
  //setTimeout(() => setToast(null), 4000);
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
    setMostrarExitoModal(false);
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
        const response = await api.get("/api/inscripcionesprueba", {
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
        const response = await api.get("/api/inscripcionesprueba", {
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

  // ── Deep link: /pruebas/:id (ej. desde una notificación) abre el detalle de esa prueba ──
  const { id: idPruebaUrl } = useParams();
  const deepLinkAbierto = useRef(null);
  useEffect(() => {
    if (!idPruebaUrl || deepLinkAbierto.current === idPruebaUrl || pruebas.length === 0) return;
    const encontrada = pruebas.find((p) => Number(p.idprueba) === Number(idPruebaUrl));
    if (encontrada) {
      deepLinkAbierto.current = idPruebaUrl;
      abrirModal(encontrada);
      return;
    }
    // No está en la lista cargada (p. ej. filtrada por deporte): traerla directo
    deepLinkAbierto.current = idPruebaUrl;
    api.get(`/api/pruebas/${idPruebaUrl}`)
      .then(async (r) => {
        let inscritosCount = 0;
        let inscripciones = [];
        try {
          const ins = await api.get("/api/inscripcionesprueba", { params: { idprueba: idPruebaUrl } });
          inscripciones = Array.isArray(ins.data) ? ins.data : [];
          inscritosCount = inscripciones.length;
        } catch { /* sin conteo */ }
        const prueba = { ...r.data, inscritosCount, inscripciones };
        setPruebas((prev) => (prev.some((p) => Number(p.idprueba) === Number(prueba.idprueba)) ? prev : [...prev, prueba]));
        abrirModal(prueba);
      })
      .catch((e) => console.error("[Pruebas] No se pudo abrir la prueba del enlace:", e));
  }, [idPruebaUrl, pruebas]);

  // Prueba del modal con datos frescos (contador de inscriptos actualizado)
  const pruebaModalActual = () =>
    pruebas.find((p) => obtenerIdPrueba(p) === obtenerIdPrueba(pruebaSeleccionada)) || pruebaSeleccionada;

  // Consultar posición en lista de espera cuando la prueba está completa
  const pruebaModalCompleta = (() => {
    if (!modalAbierto || !pruebaSeleccionada) return false;
    const p = pruebaModalActual();
    const cap = Number(p?.cupo || 0);
    return cap > 0 && Number(p?.inscritosCount ?? 0) >= cap;
  })();
  useEffect(() => {
    let cancelado = false;
    setListaEspera({ enLista: false, posicion: null, total: 0 });
    if (!pruebaModalCompleta || !esJugador || isInscripto || verificandoInscripcion) return;

    const idPrueba = obtenerIdPrueba(pruebaSeleccionada);
    if (!idPrueba) return;
    api.get(`/api/pruebas/${idPrueba}/lista-espera/posicion`)
      .then((r) => { if (!cancelado) setListaEspera(r.data); })
      .catch((e) => console.error("[Pruebas] Error al obtener posición en lista de espera:", e));
    return () => { cancelado = true; };
  }, [pruebaModalCompleta, esJugador, isInscripto, verificandoInscripcion, pruebaSeleccionada]);

  const handleAnotarseListaEspera = async () => {
    const idPrueba = obtenerIdPrueba(pruebaSeleccionada);
    if (!idPrueba) return;
    setInscripcionError("");
    setListaEsperaLoading(true);
    try {
      const r = await api.post(`/api/pruebas/${idPrueba}/lista-espera`);
      setListaEspera(r.data);
    } catch (error) {
      setInscripcionError(error?.response?.data?.error || error?.response?.data?.message || "No se pudo anotar en la lista de espera.");
    } finally {
      setListaEsperaLoading(false);
    }
  };

  const handleSalirListaEspera = async () => {
    const idPrueba = obtenerIdPrueba(pruebaSeleccionada);
    if (!idPrueba) return;
    setInscripcionError("");
    setListaEsperaLoading(true);
    try {
      const r = await api.delete(`/api/pruebas/${idPrueba}/lista-espera`);
      setListaEspera(r.data);
    } catch (error) {
      setInscripcionError(error?.response?.data?.error || error?.response?.data?.message || "No se pudo salir de la lista de espera.");
    } finally {
      setListaEsperaLoading(false);
    }
  };

  // Cupos de una prueba: { capacidad, inscritos, restantes, completo }
  const getCupos = (prueba) => {
    const capacidad = Number(prueba?.cupo || 0);
    const inscritos = Number(prueba?.inscritosCount ?? 0);
    const restantes = capacidad > 0 ? Math.max(0, capacidad - inscritos) : null;
    return { capacidad, inscritos, restantes, completo: capacidad > 0 && inscritos >= capacidad };
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

    const pruebaActual = pruebas.find((p) => obtenerIdPrueba(p) === idPruebaNum) || pruebaSeleccionada;
    if (getCupos(pruebaActual).completo) {
      setInscripcionError("No hay cupos disponibles.");
      return;
    }

    const body = { idjugador: idJugadorNum, idprueba: idPruebaNum };
    console.log("[Pruebas] Inscripción payload:", body);

    setInscripcionLoading(true);
    try {
      await api.post(
        "/api/inscripcionesprueba",
        body,
        { headers: { "Content-Type": "application/json" } }
      );

      const nombreClub = pruebaSeleccionada?.club?.nombre || "Club";
      mostrarToast(
  "Inscripción realizada",
  "Te has inscripto correctamente a la prueba."
);
      setIsInscripto(true);
      setMostrarExitoModal(true);
      
      setPruebas((prevPruebas) => prevPruebas.map((prueba) => {
        if (obtenerIdPrueba(prueba) !== idPruebaNum) return prueba;

        const inscripcionesActuales = Array.isArray(prueba.inscripciones) ? prueba.inscripciones : [];
        return {
          ...prueba,
          inscritosCount: Number(prueba.inscritosCount ?? 0) + 1,
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

  const handleDesuscribirse = () => {
    setMostrarConfirmacion(true);
  };

  const confirmarDesuscripcion = async () => {
    setInscripcionError("");
    setDesuscripcionLoading(true);
    const idPruebaNum = obtenerIdPrueba(pruebaSeleccionada);

    try {
      await api.delete(`/api/inscripcionesprueba/${idPruebaNum}`);
      
      setIsInscripto(false);
      setMostrarConfirmacion(false);
      setMostrarExitoDesuscripcion(true);
      // El backend promueve al primero de la lista de espera: resincronizar contadores
      obtenerPruebas(mostrarTodas);

      setPruebas((prevPruebas) => prevPruebas.map((prueba) => {
        if (obtenerIdPrueba(prueba) !== idPruebaNum) return prueba;
        const inscripcionesActuales = Array.isArray(prueba.inscripciones) ? prueba.inscripciones : [];
        return {
          ...prueba,
          inscritosCount: Math.max(0, Number(prueba.inscritosCount ?? 0) - 1),
          yaInscripto: false,
          inscripciones: inscripcionesActuales.filter(i => 
             Number(i.idjugador || i.idJugador || i.jugadorId) !== Number(idjugadorResuelto)
          )
        };
      }));
    } catch (error) {
      setInscripcionError(error?.response?.data?.message || error?.response?.data?.error || "Ocurrió un error al cancelar la inscripción.");
      setMostrarConfirmacion(false);
    } finally {
      setDesuscripcionLoading(false);
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
    api.get(`/api/login/perfil/${idusuario}`)
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
    api.get(`/api/login/perfil/${idusuario}`)
      .then((res) => {
        if (!montado) return;
        const perfil = res.data;

        // Guardar la foto del jugador para el Toast
        console.log("PERFIL:", perfil);
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
    setCargandoPruebas(true);
    try {
      const filtrarPorDeporte = !(forceGeneral || !idJugadorReal);
      const url = filtrarPorDeporte
        ? "/api/pruebas/deporte"
        : "/api/pruebas";
      const config = filtrarPorDeporte ? { params: { idJugador: idJugadorReal } } : {};
      const response = await api.get(url, config);
      // Enriquecer cada prueba con la cantidad de inscriptos (para mostrar cupos)
      const lista = Array.isArray(response.data) ? response.data : [];
      const conInscritos = await Promise.all(lista.map(async (p) => {
        const idP = Number(p.idprueba);
        if (!idP) return p;
        try {
          const r = await api.get("/api/inscripcionesprueba", { params: { idprueba: idP } });
          const ins = Array.isArray(r.data) ? r.data : (r.data?.items || []);
          return { ...p, inscritosCount: ins.length, inscripciones: ins };
        } catch {
          return { ...p, inscritosCount: Number(p.inscritosCount ?? 0) };
        }
      }));
      setPruebas(Array.isArray(response.data) ? conInscritos : response.data);

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
    } finally {
      setCargandoPruebas(false);
    }
  }

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
  const pruebasFiltradasBase = pruebas.filter((prueba) => {
    // No mostrar pruebas viejas cuya fecha ya haya pasado
    if (haPasadoFecha(prueba.fechaprueba, prueba.horafin)) return false;

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

    const fechaPrueba = prueba.fechaprueba ? parsearFechaLocal(prueba.fechaprueba) : null;
    const coincideFechaDesde = !fechaDesde || (fechaPrueba && fechaPrueba >= parsearFechaLocal(fechaDesde));
    const coincideFechaHasta = !fechaHasta || (fechaPrueba && fechaPrueba <= parsearFechaLocal(fechaHasta));

    return coincideBusqueda && coincideDeporte && coincideCategoria && coincideZona && coincideFechaDesde && coincideFechaHasta;
  });

  // Sort estable: las pruebas de clubes seguidos van primero, el resto conserva su orden
  const pruebasFiltradas = [...pruebasFiltradasBase].sort(
    (a, b) => Number(seguidosIds.has(Number(b.club?.idusuario))) - Number(seguidosIds.has(Number(a.club?.idusuario)))
  );

  const modalDetalleValido = modalAbierto && pruebaSeleccionada && (
    pruebaSeleccionada?.idprueba != null ||
    pruebaSeleccionada?.idPrueba != null ||
    pruebaSeleccionada?.id != null ||
    pruebaSeleccionada?.club?.nombre
  );

  // ── Datos para la vista ───────────────────────────────────
  // Inscripción según la lista ya cargada (sin logs, se usa por tarjeta)
  const inscriptoEnLista = (prueba) =>
    !esClub && !!idjugadorResuelto && Array.isArray(prueba.inscripciones) &&
    prueba.inscripciones.some((i) => Number(i.idjugador ?? i.idJugador ?? i.jugadorId) === Number(idjugadorResuelto));

  const estadoPrueba = (prueba) => {
    const c = getCupos(prueba);
    if (inscriptoEnLista(prueba)) return { texto: "Inscripto", clase: "ok" };
    if (c.completo) return { texto: "Completa", clase: "full" };
    if (c.restantes !== null && c.restantes <= 3) return { texto: "Últimos cupos", clase: "warn" };
    return { texto: "Abierta", clase: "open" };
  };

  const deportesEnLista = [...new Set(pruebas.map((p) => p.deporte?.deporte).filter(Boolean))].sort();
  const zonasDisponibles = [...new Set([...ZONAS, ...pruebas.map((p) => p.zona).filter(Boolean)])];
  const categoriasDisponibles = [...new Set([...CATEGORIAS, ...pruebas.map((p) => p.categoria).filter(Boolean)])];
  const hayFiltros = !!(deporte || categoria || zona || fechaDesde || fechaHasta || busqueda);
  // La lista vino filtrada por el deporte del jugador (endpoint /deporte)
  const listaDeSuDeporte = !mostrarTodas && !!deporteUsuario;

  // Elegir deporte: si la lista vino filtrada por el deporte del jugador, se pide la general
  const elegirDeporte = (d) => {
    setDeporte(d);
    if (listaDeSuDeporte) {
      setMostrarTodas(true);
      obtenerPruebas(true);
    }
  };

  const verTodosLosDeportes = () => {
    setDeporte("");
    setMostrarTodas(true);
    obtenerPruebas(true);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    restablecerFiltros();
  };

  const textoBoton = (prueba) => {
    if (esClub) return "Ver postulantes";
    if (inscriptoEnLista(prueba)) return "Ver mi inscripción";
    if (getCupos(prueba).completo) return esJugador ? "Anotarme en lista de espera" : "Ver prueba";
    return esJugador ? "Postularme" : "Ver prueba";
  };

  // Datos de la tarjeta y del detalle (misma estructura en los dos lugares)
  const renderDatos = (prueba, completo = false) => (
    <dl className="pr-facts">
      <div><dt>Deporte</dt><dd>{prueba.deporte?.deporte || "A confirmar"}</dd></div>
      <div>
        <dt>Categoría</dt>
        <dd>{[prueba.categoria, prueba.genero].filter(Boolean).join(" · ") || "A confirmar"}</dd>
      </div>
      <div><dt>Fecha</dt><dd>{fechaLarga(prueba.fechaprueba, prueba.horainicio, completo ? prueba.horafin : null)}</dd></div>
      <div>
        <dt>Lugar</dt>
        <dd title={prueba.direccion || prueba.zona || ""}>
          {formatearUbicacionCorta(prueba.direccion || prueba.zona) || "A confirmar"}
        </dd>
      </div>
      {completo && prueba.fechacierre && (
        <div><dt>Cierre de inscripción</dt><dd>{fechaLarga(prueba.fechacierre)}</dd></div>
      )}
    </dl>
  );

  const renderCupos = (prueba) => {
    const c = getCupos(prueba);
    if (!c.capacidad) return <p className="pr-cupos-texto">Cupos a confirmar</p>;
    const pct = Math.min(100, Math.round((c.inscritos / c.capacidad) * 100));
    return (
      <div className="pr-cupos">
        <div className="pr-cupos-texto">
          <span>{c.inscritos} de {c.capacidad} cupos tomados</span>
          <span>{c.completo ? "Sin cupos" : `${c.restantes} ${c.restantes === 1 ? "libre" : "libres"}`}</span>
        </div>
        <div className="pr-cupos-barra" role="progressbar" aria-valuemin={0} aria-valuemax={c.capacidad} aria-valuenow={c.inscritos} aria-label="Cupos tomados">
          <i style={{ width: `${pct}%` }} className={c.completo ? "is-full" : ""} />
        </div>
      </div>
    );
  };

  const renderAvatar = (club, grande = false) => (
    <AvatarSlk foto={club?.fotoperfil} nombre={club?.nombre} grande={grande} />
  );

  const pruebaDetalle = modalDetalleValido
    ? (pruebas.find((p) => obtenerIdPrueba(p) === obtenerIdPrueba(pruebaSeleccionada)) || pruebaSeleccionada)
    : null;

  // Escape cierra el modal abierto
  useEffect(() => {
    if (!modalAbierto && !modalCrearAbierto) return;
    const alPresionar = (e) => {
      if (e.key !== 'Escape') return;
      if (modalCrearAbierto) setModalCrearAbierto(false);
      else cerrarModal();
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [modalAbierto, modalCrearAbierto]);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="pr">
      {/* Aviso tras publicar una prueba */}
      {toast && (
        <div className="pr-toast" role="status">
          <div>
            <p className="pr-toast-titulo">{toast.titulo}</p>
            <p className="pr-toast-texto">{toast.mensaje}</p>
          </div>
          <button className="pr-btn pr-btn--ink" onClick={() => setToast(null)}>Entendido</button>
        </div>
      )}

      <ModalConfirmarEliminar
        abierto={!!pruebaPorEliminar}
        titulo="¿Eliminar prueba?"
        mensaje="Se eliminarán también las inscripciones, la lista de espera y el chat asociados. Esta acción no se puede deshacer."
        eliminando={eliminandoPrueba}
        error={errorEliminarPrueba}
        onConfirmar={confirmarEliminarPrueba}
        onCerrar={() => setPruebaPorEliminar(null)}
      />

      {/* ── Encabezado ── */}
      <section className="pr-head">
        <div className="pr-wrap pr-head-grid">
          <div>
            <h1 className="pr-display pr-title">{esClub ? "Tus pruebas" : "Pruebas"}</h1>
            <p className="pr-lead">
              {esClub
                ? "Publicá convocatorias, seguí los cupos y revisá a cada postulante con su perfil completo."
                : "Convocatorias abiertas de clubes. Filtrá por deporte, categoría y zona, y postulate desde tu perfil."}
            </p>
          </div>
          <div className="pr-head-side">
            <label className="pr-search">
              <span className="pr-sr">Buscar pruebas</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="square" />
              </svg>
              <input
                type="search"
                placeholder="Buscar por club o descripción"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </label>
            {esClub && (
              <button className="pr-btn" onClick={() => setModalCrearAbierto(true)} disabled={!idclubResuelto}>
                {idclubResuelto ? "Crear prueba" : "Cargando club…"} <Flecha />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Filtros ── */}
      <section className="pr-filters" aria-label="Filtros">
        <div className="pr-wrap">
          {listaDeSuDeporte && (
            <p className="pr-notice">
              Te mostramos pruebas de <strong>{deporteUsuario}</strong>, tu deporte.{" "}
              <button className="pr-link" onClick={verTodosLosDeportes}>Ver todos los deportes</button>
            </p>
          )}

          <CarruselChips ariaLabel="Deporte" deps={[pruebas, mostrarTodas]}>
            <button className={`pr-chip${deporte === "" ? " is-on" : ""}`} aria-pressed={deporte === ""} onClick={() => elegirDeporte("")}>
              Todos
            </button>
            {(deportesEnLista.length ? deportesEnLista : DEPORTES).map((d) => (
              <button key={d} className={`pr-chip${deporte === d ? " is-on" : ""}`} aria-pressed={deporte === d} onClick={() => elegirDeporte(d)}>
                {d}
              </button>
            ))}
          </CarruselChips>

          <div className="pr-fields">
            <label className="pr-field">
              <span>Zona</span>
              <select value={zona} onChange={(e) => setZona(e.target.value)}>
                <option value="">Todas</option>
                {zonasDisponibles.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </label>
            <label className="pr-field">
              <span>Categoría</span>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="">Todas</option>
                {categoriasDisponibles.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="pr-field">
              <span>Desde</span>
              <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
            </label>
            <label className="pr-field">
              <span>Hasta</span>
              <input type="date" value={fechaHasta} min={fechaDesde || undefined} onChange={(e) => setFechaHasta(e.target.value)} />
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
          {!cargandoPruebas && pruebasFiltradas.length > 0 && (
            <p className="pr-count">
              {pruebasFiltradas.length} {pruebasFiltradas.length === 1 ? "prueba" : "pruebas"}
              {seguidosIds.size > 0 && !esClub ? " · las de clubes que seguís aparecen primero" : ""}
            </p>
          )}

          {cargandoPruebas ? (
            <div className="pr-grid" aria-busy="true" aria-label="Cargando pruebas">
              {[0, 1, 2].map((i) => <div key={i} className="pr-card pr-card--skeleton" />)}
            </div>
          ) : pruebasFiltradas.length === 0 ? (
            <div className="pr-empty">
              <h2 className="pr-display pr-empty-title">
                {esClub && !hayFiltros ? "Todavía no publicaste pruebas" : "No hay pruebas con estos filtros"}
              </h2>
              <p>
                {esClub && !hayFiltros
                  ? "Creá tu primera convocatoria y empezá a recibir postulantes."
                  : "Probá con otro deporte, otra zona o un rango de fechas más amplio."}
              </p>
              {esClub && !hayFiltros ? (
                <button className="pr-btn" onClick={() => setModalCrearAbierto(true)} disabled={!idclubResuelto}>
                  Crear prueba <Flecha />
                </button>
              ) : (
                <button className="pr-btn pr-btn--ink" onClick={limpiarFiltros}>Limpiar filtros</button>
              )}
            </div>
          ) : (
            <ul className="pr-grid">
              {pruebasFiltradas.map((prueba) => {
                const estado = estadoPrueba(prueba);
                const esSeguido = seguidosIds.has(Number(prueba.club?.idusuario));
                const esTuDeporte = deporteUsuario && prueba.deporte?.deporte === deporteUsuario;
                return (
                  <li className="pr-card" key={prueba.idprueba}>
                    <MediaEvento
                      imagen={prueba.imagen}
                      deporte={prueba.deporte?.deporte}
                      alt={`Prueba de ${prueba.club?.nombre || "el club"}`}
                    />
                    <div className="pr-card-head">
                      {renderAvatar(prueba.club)}
                      <div className="pr-card-id">
                        <h3>{prueba.club?.nombre || "Club"}</h3>
                        <p>Prueba de {(prueba.deporte?.deporte || "jugadores").toLowerCase()}</p>
                      </div>
                      <span className={`pr-pill pr-pill--${estado.clase}`}>{estado.texto}</span>
                    </div>

                    {(esSeguido || esTuDeporte) && (
                      <div className="pr-tags">
                        {esTuDeporte && <span>Tu deporte</span>}
                        {esSeguido && <span>Club que seguís</span>}
                      </div>
                    )}

                    {renderDatos(prueba)}
                    {renderCupos(prueba)}

                    <div className="pr-card-foot">
                      <button className="pr-btn pr-btn--ink pr-btn--block" onClick={() => abrirModal(prueba)}>
                        {textoBoton(prueba)}
                      </button>
                      {puedeEliminarPrueba(prueba) && (
                        <button
                          className="pr-link pr-link--danger"
                          onClick={() => { setErrorEliminarPrueba(null); setPruebaPorEliminar(prueba); }}
                        >
                          Eliminar prueba
                        </button>
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

      {/* ── Crear prueba ── */}
      {modalCrearAbierto && createPortal(
        <div className="pr-overlay" onClick={() => setModalCrearAbierto(false)}>
          <div className="pr-modal pr-modal--form" role="dialog" aria-modal="true" aria-labelledby="pr-crear-titulo" onClick={(e) => e.stopPropagation()}>
            <header className="pr-modal-head">
              <h2 id="pr-crear-titulo" className="pr-modal-title">Nueva prueba</h2>
              <button className="pr-close" onClick={() => setModalCrearAbierto(false)} aria-label="Cerrar">×</button>
            </header>
            <div className="pr-modal-body">
              <FormularioPrueba
                idclub={idclubResuelto}
                onGuardado={() => {
                  setModalCrearAbierto(false);
                  mostrarToast(
                    "Prueba publicada",
                    "Tu prueba ya está disponible para que los jugadores la vean y se postulen."
                  );
                  obtenerPruebas(mostrarTodas);
                }}
                onCancelar={() => setModalCrearAbierto(false)}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Detalle de la prueba ── */}
      {modalDetalleValido && !mostrarExitoModal && createPortal(
        <div className="pr-overlay" onClick={cerrarModal}>
          <div className="pr-modal" role="dialog" aria-modal="true" aria-labelledby="pr-detalle-titulo" onClick={(e) => e.stopPropagation()}>
            <header className="pr-modal-head">
              {renderAvatar(pruebaDetalle.club, true)}
              <div className="pr-card-id">
                <h2 id="pr-detalle-titulo" className="pr-modal-title">{pruebaDetalle.club?.nombre || "Prueba"}</h2>
                <p>Prueba de {(pruebaDetalle.deporte?.deporte || "jugadores").toLowerCase()}</p>
              </div>
              <span className={`pr-pill pr-pill--${isInscripto ? "ok" : estadoPrueba(pruebaDetalle).clase}`}>
                {isInscripto ? "Inscripto" : estadoPrueba(pruebaDetalle).texto}
              </span>
              <button className="pr-close" onClick={cerrarModal} aria-label="Cerrar">×</button>
            </header>

            <div className="pr-modal-body">
              {pruebaDetalle.imagen && (
                <img src={pruebaDetalle.imagen} alt={`Imagen de la prueba de ${pruebaDetalle.club?.nombre || "el club"}`} className="pr-modal-banner" />
              )}

              {renderDatos(pruebaDetalle, true)}
              {renderCupos(pruebaDetalle)}

              {pruebaDetalle.descripcion && (
                <div className="pr-block">
                  <h3>Descripción</h3>
                  <p className="pr-desc">{pruebaDetalle.descripcion}</p>
                </div>
              )}

              {(() => {
                const lat = pruebaDetalle.latitud ?? pruebaDetalle.club?.latitud;
                const lon = pruebaDetalle.longitud ?? pruebaDetalle.club?.longitud;
                const tieneCoords =
                  lat !== null && lat !== undefined && lat !== '' && !isNaN(Number(lat)) &&
                  lon !== null && lon !== undefined && lon !== '' && !isNaN(Number(lon)) &&
                  (Number(lat) !== 0 || Number(lon) !== 0);
                if (!tieneCoords) return null;
                return (
                  <div className="pr-block">
                    <h3>Ubicación</h3>
                    <MapaUbicacionDark
                      latitud={Number(lat)}
                      longitud={Number(lon)}
                      direccion={pruebaDetalle.direccion || pruebaDetalle.zona || pruebaDetalle.club?.direccion || ''}
                      zona={formatearUbicacionCorta(pruebaDetalle.zona || pruebaDetalle.direccion || '')}
                      nombre={pruebaDetalle.club?.nombre || 'Prueba'}
                      tipo="prueba"
                      esEditable={false}
                      height="200px"
                    />
                    <a
                      className="pr-link pr-maps"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${Number(lat)},${Number(lon)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cómo llegar en Google Maps <Flecha />
                    </a>
                  </div>
                );
              })()}

              {esClub && (
                <ListaInscriptos
                  titulo="Postulantes"
                  vacio="Todavía no hay postulantes en esta prueba."
                  inscripciones={postulantes}
                  cargando={postulantesLoading}
                  error={postulantesError}
                  evento={{ idprueba: obtenerIdPrueba(pruebaDetalle) }}
                  nombreEvento={`la prueba de ${(pruebaDetalle.deporte?.deporte || "jugadores").toLowerCase()}`}
                />
              )}

              {inscripcionError && <p className="pr-error">{inscripcionError}</p>}
              {esJugador && pruebaModalCompleta && listaEspera.enLista && !isInscripto && (
                <p className="pr-notice">Estás en el puesto {listaEspera.posicion} de la lista de espera.</p>
              )}
            </div>

            <footer className="pr-modal-foot">
              <button className="pr-btn pr-btn--ghost" onClick={cerrarModal}>Cerrar</button>
              {esJugador && (
                isInscripto || verificandoInscripcion ? (
                  isInscripto ? (
                    <button className="pr-btn pr-btn--danger" onClick={handleDesuscribirse} disabled={desuscripcionLoading}>
                      {desuscripcionLoading ? "Cancelando…" : "Cancelar inscripción"}
                    </button>
                  ) : (
                    <button className="pr-btn" disabled>Verificando…</button>
                  )
                ) : pruebaModalCompleta ? (
                  listaEspera.enLista ? (
                    <button className="pr-btn pr-btn--ink" onClick={handleSalirListaEspera} disabled={listaEsperaLoading}>
                      {listaEsperaLoading ? "Saliendo…" : "Salir de la lista de espera"}
                    </button>
                  ) : (
                    <button className="pr-btn" onClick={handleAnotarseListaEspera} disabled={listaEsperaLoading || !idjugadorResuelto}>
                      {listaEsperaLoading ? "Anotando…" : "Anotarme en lista de espera"}
                    </button>
                  )
                ) : (
                  <button className="pr-btn" onClick={handleInscribirse} disabled={inscripcionLoading || !idjugadorResuelto}>
                    {inscripcionLoading ? "Postulando…" : idjugadorResuelto ? "Postularme" : "Cargando jugador…"}
                  </button>
                )
              )}
            </footer>
          </div>
        </div>,
        document.body
      )}

      {mostrarExitoModal && (
        <ModalConfirmacionInscripcion
          tipoEvento="prueba"
          onCerrar={() => {
            setMostrarExitoModal(false);
            cerrarModal();
          }}
        />
      )}

      {/* ── Confirmar cancelación de inscripción ── */}
      {mostrarConfirmacion && createPortal(
        <div className="pr-overlay" onClick={() => !desuscripcionLoading && setMostrarConfirmacion(false)}>
          <div className="pr-modal pr-modal--sm" role="alertdialog" aria-modal="true" aria-labelledby="pr-baja-titulo" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-body">
              <h2 id="pr-baja-titulo" className="pr-modal-title">¿Cancelar tu inscripción?</h2>
              <p className="pr-desc">Vas a perder tu lugar en la prueba y salir del grupo de chat.</p>
            </div>
            <footer className="pr-modal-foot">
              <button className="pr-btn pr-btn--ghost" onClick={() => setMostrarConfirmacion(false)} disabled={desuscripcionLoading}>Volver</button>
              <button className="pr-btn pr-btn--danger" onClick={confirmarDesuscripcion} disabled={desuscripcionLoading}>
                {desuscripcionLoading ? "Cancelando…" : "Sí, cancelar"}
              </button>
            </footer>
          </div>
        </div>,
        document.body
      )}

      {mostrarExitoDesuscripcion && createPortal(
        <div className="pr-overlay" onClick={() => setMostrarExitoDesuscripcion(false)}>
          <div className="pr-modal pr-modal--sm" role="dialog" aria-modal="true" aria-labelledby="pr-baja-ok" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-body">
              <h2 id="pr-baja-ok" className="pr-modal-title">Inscripción cancelada</h2>
              <p className="pr-desc">Ya no figurás como postulante en esta prueba.</p>
            </div>
            <footer className="pr-modal-foot">
              <button className="pr-btn" onClick={() => setMostrarExitoDesuscripcion(false)}>Entendido</button>
            </footer>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default Pruebas;
