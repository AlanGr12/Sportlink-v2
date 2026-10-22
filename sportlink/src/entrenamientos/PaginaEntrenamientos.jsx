import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import api from '../axiosConfig.js';
import FormularioEntrenamiento from './FormularioEntrenamiento';
import DetalleEntrenamiento from './DetalleEntrenamiento';
import '../pruebas/PruebasView.css';
import './EntrenamientosView.css';
import Footer from '../footer/footer.jsx';
import ModalConfirmacionInscripcion from '../components/ModalConfirmacionInscripcion.jsx';
import CarruselChips from '../components/CarruselChips.jsx';
import ModalConfirmarEliminar from '../components/ModalConfirmarEliminar.jsx';
import useSeguidos from '../hooks/useSeguidos.js';
import { haPasadoFecha, obtenerFechaHoyLocal } from '../utils/dateUtils.js';
import { formatearUbicacionCorta } from '../utils/mapUtils.js';
import { fechaLarga, precio } from '../utils/formato.js';
import { AvatarSlk, MediaEvento } from '../components/ImagenesSlk.jsx';

const Flecha = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="square" />
  </svg>
);

const API_BASE = '/api/entrenamientos';

const deportesDisponibles = [
  { id: 1, nombre: 'Fútbol' },
  { id: 2, nombre: 'Basket' },
  { id: 3, nombre: 'Tenis' },
  { id: 4, nombre: 'Voley' },
  { id: 5, nombre: 'Pádel' },
  { id: 6, nombre: 'Rugby' },
  { id: 7, nombre: 'Hockey' },
  { id: 8, nombre: 'Natación' },
  { id: 9, nombre: 'Atletismo' },
  { id: 10, nombre: 'Ciclismo' },
  { id: 11, nombre: 'Boxeo' },
  { id: 12, nombre: 'Artes Marciales' },
  { id: 13, nombre: 'Handball' },
  { id: 14, nombre: 'Béisbol' },
  { id: 15, nombre: 'Golf' }
];

const PaginaEntrenamientos = ({ usuario }) => {
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Paginación
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Filtros de Sidebar
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');
  const [, setFiltroIntensidad] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarTodas, setMostrarTodas] = useState(false);

  // Usuario viene del prop (App.jsx maneja la fuente de verdad)
  const idJugadorReal =
    usuario?.idjugador ||
    usuario?.idJugador ||
    usuario?.jugador?.idjugador ||
    usuario?.jugador?.idJugador ||
    usuario?.jugadorId ||
    usuario?.jugador?.id ||
    null;

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false); // crear / editar
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false); // ver detalle
  const [entrenamientoSeleccionado, setEntrenamientoSeleccionado] = useState(null);

  // Toasts de Notificación
  const [toast, setToast] = useState(null);
  const [mostrarModalExitoEntrenamiento, setMostrarModalExitoEntrenamiento] = useState(false);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, type: tipo });
    setTimeout(() => setToast(null), 4000);
  };

  // Actualización optimista: incrementar/decrementar inscritos y marcar isInscripto
  const handleOptimisticChange = useCallback(({ identrenamiento, delta = 0, isInscripto }) => {
    setEntrenamientos(prev => prev.map(e => {
      const id = Number(e.id || e.identrenamientos || e.identrenamiento || e.ident);
      if (!id || Number(identrenamiento) !== id) return e;
      const nuevos = { ...e };
      const prevCount = Number(nuevos.inscritosCount ?? nuevos.inscritos ?? 0);
      nuevos.inscritosCount = Math.max(0, prevCount + Number(delta));
      if (typeof isInscripto !== 'undefined') nuevos.isInscripto = !!isInscripto;
      return nuevos;
    }));

    // Si el modal de detalle está abierto, actualizar la copia seleccionada también
    setEntrenamientoSeleccionado(prev => {
      if (!prev) return prev;
      const idPrev = Number(prev.id || prev.identrenamientos || prev.identrenamiento || prev.ident);
      if (!idPrev || Number(identrenamiento) !== idPrev) return prev;
      const nuevos = { ...prev };
      const prevCount = Number(nuevos.inscritosCount ?? nuevos.inscritos ?? 0);
      nuevos.inscritosCount = Math.max(0, prevCount + Number(delta));
      if (typeof isInscripto !== 'undefined') nuevos.isInscripto = !!isInscripto;
      return nuevos;
    });
  }, []);

  // Petición con reintento ante 5xx (backoff corto)
  const fetchConReintento = async (url, options = {}, reintentosRestantes = 1) => {
    try {
      // Para mantener consistencia con otros componentes (ej. mostrarJugadores),
      // cuando la petición es GET usamos `axios.get(url, { params, headers })`.
      const method = (options.method || 'GET').toString().toUpperCase();
      if (method === 'GET') {
        return await api.get(url, { params: options.params });
      }
      const config = { url, ...options };
      return await api.request(config);
    } catch (err) {
      const status = err.response ? err.response.status : null;
      if (status && status >= 500 && reintentosRestantes > 0) {
        console.warn(`Error 5xx en el servidor. Reintentando en 1 segundo...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await fetchConReintento(url, options, reintentosRestantes - 1);
      }
      throw err;
    }
  };

  const cargarEntrenamientos = useCallback(async (forceGeneral) => {
    // Si no se pasa argumento explícito, usar el estado actual de mostrarTodas
    const usarGeneral = forceGeneral !== undefined ? forceGeneral : mostrarTodas;

    setLoading(true);
    setError(null);

    // Parámetros de consulta
    const offset = (page - 1) * limit;
    const params = {
      limit,
      offset,
      from: filtroFechaDesde || undefined,
      to: filtroFechaHasta || undefined,
      tipo: filtroTipo || undefined,
      modalidad: filtroModalidad || undefined,
      entrenadorId: usuario?.tipousuario === 'entrenador' ? usuario.id : undefined,
    };

    // Decidir URL según el rol del usuario
    let url = API_BASE;
    if (usuario?.tipousuario === 'entrenador') {
      url = `${API_BASE}/mios`;
      params.identrenador = usuario.id || usuario.identrenador; // Asegurar el parámetro requerido
    } else {
      const filtrarPorDeporte = !usarGeneral && !!idJugadorReal;
      if (filtrarPorDeporte) {
        url = `${API_BASE}/deporte`;
        params.idJugador = idJugadorReal;
      }
    }

    // Headers — el Bearer token se inyecta automáticamente por el interceptor de axiosConfig
    const headers = {};
    if (usuario?.tipousuario) headers['X-User-Type'] = usuario.tipousuario;

    // Usaremos fetchConReintento con headers explícitos (axios.get/axios.request internamente)

    // Normalizador para unir variantes de campo de imagen del backend
    const normalize = (item) => ({
      ...item,
      imagen: item.imagen || item.foto || item.avatar || item.entrenadorFoto || (item.entrenador && item.entrenador.foto) || null
    });

    try {
      const res = await api.get(url, { params });
      if (res.data && res.data.items) {
        const items = res.data.items.map(normalize).filter(it => !haPasadoFecha(it.fechaentr, it.horafin));
        // Enriquecer cada entrenamiento con conteo de inscritos y estado de inscripción
        const itemsConExtras = await Promise.all(items.map(async (it) => {
          const idEntr = Number(it.id || it.identrenamientos || it.identrenamiento || it.ident || 0);
          let inscritosCount = 0;
          let isInscripto = false;

          if (idEntr) {
            try {
              const r = await api.get(`/api/inscripcionesentrenamientos?identrenamiento=${idEntr}`);
              const lista = Array.isArray(r.data) ? r.data : (r.data?.items || []);
              inscritosCount = lista.length;
            } catch (e) {
              // Silenciar error de conteo — no debe bloquear la carga principal
              inscritosCount = it.inscritosCount || 0;
            }

            // Si el usuario actual es jugador, verificar su inscripción específica
            if (idJugadorReal) {
              try {
                const resp = await api.get(`/api/inscripcionesentrenamientos?identrenamiento=${idEntr}`);
                const lista = Array.isArray(resp.data) ? resp.data : (resp.data?.items || []);
                isInscripto = lista.some(item => {
                  const idJug = Number(item.idjugador || item.idjugadorinscripto || item.jugador?.idjugador);
                  return idJug === Number(idJugadorReal);
                });
              } catch (e) {
                isInscripto = it.isInscripto || false;
              }
            }
          }

          return {
            ...it,
            inscritosCount,
            isInscripto
          };
        }));

        setEntrenamientos(itemsConExtras);
        setTotal(res.data.total || itemsConExtras.length);
      } else if (Array.isArray(res.data)) {
        const items = res.data.map(normalize).filter(it => !haPasadoFecha(it.fechaentr, it.horafin));
        const itemsConExtras = await Promise.all(items.map(async (it) => {
          const idEntr = Number(it.id || it.identrenamientos || it.identrenamiento || it.ident || 0);
          let inscritosCount = 0;
          let isInscripto = false;
          if (idEntr) {

            try {
              const r = await api.get(`/api/inscripcionesentrenamientos?identrenamiento=${idEntr}`);
              const lista = Array.isArray(r.data) ? r.data : (r.data?.items || []);
              inscritosCount = lista.length;
            } catch (e) {
              inscritosCount = it.inscritosCount || 0;
            }

            if (idJugadorReal) {
              try {
                const resp = await api.get(`/api/inscripcionesentrenamientos?identrenamiento=${idEntr}`);
                const lista = Array.isArray(resp.data) ? resp.data : (resp.data?.items || []);
                isInscripto = lista.some(item => {
                  const idJug = Number(item.idjugador || item.idjugadorinscripto || item.jugador?.idjugador);
                  return idJug === Number(idJugadorReal);
                });
              } catch (e) {
                isInscripto = it.isInscripto || false;
              }
            }
          }
          return { ...it, inscritosCount, isInscripto };
        }));

        setEntrenamientos(itemsConExtras);
        setTotal(itemsConExtras.length);
      } else {
        // Si la API retorna un formato inesperado, marcar error para revisión
        setEntrenamientos([]);
        setTotal(0);
        setError('Respuesta inesperada del servidor al solicitar entrenamientos.');
      }
    } catch (err) {
      console.error('Error cargando entrenamientos desde API:', err);
      setEntrenamientos([]);
      setTotal(0);
      if (err.response && err.response.status >= 500) {
        setError('Error en el servidor (500). Intenta nuevamente más tarde.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido al cargar entrenamientos.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, filtroFechaDesde, filtroFechaHasta, filtroTipo, filtroModalidad, usuario, mostrarTodas, idJugadorReal]);

  useEffect(() => {
    cargarEntrenamientos();
  }, [cargarEntrenamientos]);

  // ── Deep link: /entrenamientos/:id (ej. desde una notificación) abre el detalle ──
  const { id: idEntrenamientoUrl } = useParams();
  const deepLinkAbierto = useRef(null);
  useEffect(() => {
    if (!idEntrenamientoUrl || deepLinkAbierto.current === idEntrenamientoUrl || loading) return;
    const idNum = Number(idEntrenamientoUrl);
    const idDe = (e) => Number(e.id || e.identrenamientos || e.identrenamiento || e.ident);
    const abrir = (ent) => {
      setEntrenamientoSeleccionado(ent);
      setModalDetalleAbierto(true);
    };

    const encontrado = entrenamientos.find((e) => idDe(e) === idNum);
    if (encontrado) {
      deepLinkAbierto.current = idEntrenamientoUrl;
      abrir(encontrado);
      return;
    }
    if (entrenamientos.length === 0) return; // esperar a que cargue la lista

    deepLinkAbierto.current = idEntrenamientoUrl;
    api.get(`/api/entrenamientos/${idNum}`)
      .then(async (r) => {
        let inscritosCount = 0;
        let isInscripto = false;
        try {
          const ins = await api.get(`/api/inscripcionesentrenamientos?identrenamiento=${idNum}`);
          const lista = Array.isArray(ins.data) ? ins.data : (ins.data?.items || []);
          inscritosCount = lista.length;
          isInscripto = !!idJugadorReal && lista.some((i) => Number(i.idjugadorinscripto || i.idjugador) === Number(idJugadorReal));
        } catch { /* sin conteo */ }
        abrir({ ...r.data, id: idNum, inscritosCount, isInscripto });
      })
      .catch((e) => console.error('No se pudo abrir el entrenamiento del enlace:', e));
  }, [idEntrenamientoUrl, entrenamientos, loading]);

  // Manejo de Creación / Edición
  const handleGuardarEntrenamiento = async (formData) => {
  const headers = { 'Content-Type': 'multipart/form-data' };
  if (usuario?.tipousuario) headers['X-User-Type'] = usuario.tipousuario;

  try {
    let res;
    if (entrenamientoSeleccionado && entrenamientoSeleccionado.id && !entrenamientoSeleccionado.id.startsWith('entreno-')) {
      // Actualizar PUT
      res = await fetchConReintento(`${API_BASE}/${entrenamientoSeleccionado.id}`, { method: 'PUT', data: formData, headers });
      mostrarToast('¡Entrenamiento actualizado correctamente!');
    } else {
      // Crear POST
      res = await fetchConReintento(API_BASE, { method: 'POST', data: formData, headers });
      mostrarToast('¡Entrenamiento creado con éxito!', 'success');
    }

    setModalAbierto(false);
    setEntrenamientoSeleccionado(null);
    cargarEntrenamientos();
  } catch (err) {
    console.error('Error guardando entrenamiento en API:', err.response?.data || err.message);
    setError(err.response?.data?.error || err.message || 'Error guardando entrenamiento');
    mostrarToast('Error al guardar entrenamiento. Revisá la consola.', 'error');
    throw err; // re-lanzamos para que el form muestre el error.general también
  }
};

  // Entrenadores que sigo: sus entrenamientos aparecen primero (sort estable)
  const seguidosIds = useSeguidos(usuario);
  const entrenamientosOrdenados = [...entrenamientos].sort((a, b) => {
    const idA = Number(a.entrenadores?.idusuario ?? a.entrenador?.idusuario);
    const idB = Number(b.entrenadores?.idusuario ?? b.entrenador?.idusuario);
    return Number(seguidosIds.has(idB)) - Number(seguidosIds.has(idA));
  });

  const [idPorBorrar, setIdPorBorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);

  const handleBorrarEntrenamiento = async (id) => {
    setBorrando(true);

    // Bearer token se inyecta automáticamente por el interceptor de axiosConfig
    const headers = {};
    if (usuario?.tipousuario) headers['X-User-Type'] = usuario.tipousuario;

    try {
      if (!String(id).startsWith('entreno-')) {
        await fetchConReintento(`${API_BASE}/${id}`, { method: 'DELETE', headers });
      }
      mostrarToast('Entrenamiento eliminado correctamente.', 'info');
      setEntrenamientos(prev => prev.filter(e => (e.id ?? e.identrenamientos) !== id));
      setIdPorBorrar(null);
    } catch (err) {
      console.error('Error borrando entrenamiento:', err);
      setError(err.response?.data?.message || err.message || 'Error al eliminar entrenamiento');
      mostrarToast('Error al eliminar entrenamiento. Revisá la consola.', 'error');
      setIdPorBorrar(null);
    } finally {
      setBorrando(false);
    }
  };


  const restablecerFiltros = () => {
    setFiltroZona('');
    setFiltroTipo('');
    setFiltroModalidad('');
    setFiltroIntensidad('');
    setFiltroFechaDesde('');
    setFiltroFechaHasta('');
    setBusqueda('');
    setMostrarTodas(true);
    setPage(1);
    cargarEntrenamientos(true);
  };

  // Bloquea el scroll del fondo mientras hay un modal abierto,
  // para que el usuario navegue únicamente dentro del modal.
  useEffect(() => {
    if (modalAbierto || modalDetalleAbierto) {
      const overflowOriginal = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = overflowOriginal;
      };
    }
  }, [modalAbierto, modalDetalleAbierto]);

  // ── Datos para la vista ───────────────────────────────────
  const tipoUsuario = usuario?.tipousuario;
  const esJugador = tipoUsuario === 'jugador';
  const puedeCrear = tipoUsuario === 'entrenador' || tipoUsuario === 'club';
  const esAdmin = usuario?.es_admin === true;
  const listaDeSuDeporte = !mostrarTodas && !!idJugadorReal && tipoUsuario !== 'entrenador';

  const idDe = (e) => e.id ?? e.identrenamientos ?? e.identrenamiento ?? e.ident;

  // Solo el entrenador que lo creó puede editar; borrar también el admin
  const esPropietario = (e) => {
    const creadorId = e.identrenador ?? e.entrenadorId ?? e.trainerId ?? e.userId ?? e.creadorId ?? e.id_entrenador ?? null;
    return tipoUsuario === 'entrenador' && creadorId !== null &&
      String(creadorId) === String(usuario?.identrenador ?? usuario?.idEntrenador ?? usuario?.id);
  };

  const getCupos = (e) => {
    const capacidad = Number(e.cantidad || e.cantidadJugadores || e.capacidad || 0);
    const inscritos = Number(e.inscritosCount ?? e.inscritos ?? 0);
    const restantes = capacidad > 0 ? Math.max(0, capacidad - inscritos) : null;
    return { capacidad, inscritos, restantes, completo: capacidad > 0 && inscritos >= capacidad };
  };

  const estadoEntrenamiento = (e) => {
    const c = getCupos(e);
    if (e.isInscripto) return { texto: 'Inscripto', clase: 'ok' };
    if (c.completo) return { texto: 'Completo', clase: 'full' };
    if (c.restantes !== null && c.restantes <= 3) return { texto: 'Últimos cupos', clase: 'warn' };
    return { texto: 'Abierto', clase: 'open' };
  };

  const nombreEntrenador = (e) =>
    [e.entrenadores?.nombre, e.entrenadores?.apellido].filter(Boolean).join(' ');

  const textoBoton = (e) => {
    if (esPropietario(e)) return 'Ver inscriptos';
    if (e.isInscripto) return 'Ver mi inscripción';
    if (getCupos(e).completo) return esJugador ? 'Anotarme en lista de espera' : 'Ver entrenamiento';
    return esJugador ? 'Inscribirme' : 'Ver entrenamiento';
  };

  // Búsqueda y zona se filtran acá (el backend no recibe esos parámetros)
  const texto = busqueda.trim().toLowerCase();
  const zonaTexto = filtroZona.trim().toLowerCase();
  const entrenamientosVisibles = entrenamientosOrdenados.filter((e) => {
    const coincideTexto = !texto || [e.titulo, e.descripcion, nombreEntrenador(e), e.deportes?.deporte, e.clubes?.nombre]
      .some((v) => v && String(v).toLowerCase().includes(texto));
    const coincideZona = !zonaTexto || [e.ubicacion, e.direccion]
      .some((v) => v && String(v).toLowerCase().includes(zonaTexto));
    return coincideTexto && coincideZona;
  });

  const hayFiltros = !!(filtroTipo || filtroModalidad || filtroZona || filtroFechaDesde || filtroFechaHasta || busqueda);

  const elegirDeporte = (d) => {
    setFiltroTipo(d);
    setPage(1);
    if (listaDeSuDeporte) setMostrarTodas(true);
  };

  const abrirDetalle = (e) => {
    setEntrenamientoSeleccionado(e);
    setModalDetalleAbierto(true);
  };

  // Escape cierra el modal abierto
  useEffect(() => {
    if (!modalAbierto && !modalDetalleAbierto) return;
    const alPresionar = (ev) => {
      if (ev.key !== 'Escape') return;
      if (modalAbierto) setModalAbierto(false);
      else setModalDetalleAbierto(false);
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [modalAbierto, modalDetalleAbierto]);

  const totalPaginas = Math.ceil(total / limit);

  return (
    <div className="pr">
      {toast && (
        <div className="pr-toast" role="status">
          <div><p className="pr-toast-titulo">{toast.mensaje}</p></div>
          <button className="pr-btn" onClick={() => setToast(null)}>Entendido</button>
        </div>
      )}

      {/* ── Encabezado ── */}
      <section className="pr-head">
        <div className="pr-wrap pr-head-grid pr-head-grid--ancho">
          <h1 className="pr-display pr-title">Entrenamientos</h1>
          <p className="pr-lead">
            {tipoUsuario === 'entrenador'
              ? 'Publicá tus sesiones con cupos, horarios y precio, y seguí quién se inscribe.'
              : 'Clínicas y sesiones con entrenadores de cada disciplina. Elegí deporte, día y zona, e inscribite desde tu perfil.'}
          </p>
          <div className="pr-head-side">
            <label className="pr-search">
              <span className="pr-sr">Buscar entrenamientos</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="square" />
              </svg>
              <input
                type="search"
                placeholder="Buscar por título, entrenador o club"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </label>
            {puedeCrear && (
              <button className="pr-btn" onClick={() => { setEntrenamientoSeleccionado(null); setModalAbierto(true); }}>
                Crear entrenamiento <Flecha />
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
              Te mostramos entrenamientos de tu deporte.{' '}
              <button className="pr-link" onClick={() => elegirDeporte('')}>Ver todos los deportes</button>
            </p>
          )}

          <CarruselChips ariaLabel="Deporte" deps={[entrenamientos.length]}>
            <button className={`pr-chip${filtroTipo === '' ? ' is-on' : ''}`} aria-pressed={filtroTipo === ''} onClick={() => elegirDeporte('')}>
              Todos
            </button>
            {deportesDisponibles.map((d) => (
              <button key={d.id} className={`pr-chip${filtroTipo === d.nombre ? ' is-on' : ''}`} aria-pressed={filtroTipo === d.nombre} onClick={() => elegirDeporte(d.nombre)}>
                {d.nombre}
              </button>
            ))}
          </CarruselChips>

          <div className="pr-fields">
            <label className="pr-field">
              <span>Modalidad</span>
              <select value={filtroModalidad} onChange={(e) => { setFiltroModalidad(e.target.value); setPage(1); }}>
                <option value="">Todas</option>
                <option value="grupal">Grupal</option>
                <option value="individual">Individual</option>
              </select>
            </label>
            <label className="pr-field">
              <span>Zona</span>
              <input type="text" placeholder="Ej. Palermo" value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)} />
            </label>
            <label className="pr-field">
              <span>Desde</span>
              <input type="date" value={filtroFechaDesde} min={obtenerFechaHoyLocal()} onChange={(e) => { setFiltroFechaDesde(e.target.value); setPage(1); }} />
            </label>
            <label className="pr-field">
              <span>Hasta</span>
              <input type="date" value={filtroFechaHasta} min={filtroFechaDesde || obtenerFechaHoyLocal()} onChange={(e) => { setFiltroFechaHasta(e.target.value); setPage(1); }} />
            </label>
            {hayFiltros && (
              <button className="pr-link pr-clear" onClick={restablecerFiltros}>Limpiar filtros</button>
            )}
          </div>
        </div>
      </section>

      {/* ── Resultados ── */}
      <section className="pr-results">
        <div className="pr-wrap">
          {!loading && !error && entrenamientosVisibles.length > 0 && (
            <p className="pr-count">
              {entrenamientosVisibles.length} {entrenamientosVisibles.length === 1 ? 'entrenamiento' : 'entrenamientos'}
              {seguidosIds.size > 0 ? ' · los de entrenadores que seguís aparecen primero' : ''}
            </p>
          )}

          {loading ? (
            <div className="pr-grid" aria-busy="true" aria-label="Cargando entrenamientos">
              {[0, 1, 2].map((i) => <div key={i} className="pr-card pr-card--skeleton" />)}
            </div>
          ) : error ? (
            <div className="pr-empty">
              <h2 className="pr-display pr-empty-title">No pudimos cargar los entrenamientos</h2>
              <p>{error}</p>
              <button className="pr-btn pr-btn--ink" onClick={() => cargarEntrenamientos()}>Reintentar</button>
            </div>
          ) : entrenamientosVisibles.length === 0 ? (
            <div className="pr-empty">
              <h2 className="pr-display pr-empty-title">
                {tipoUsuario === 'entrenador' && !hayFiltros ? 'Todavía no publicaste entrenamientos' : 'No hay entrenamientos con estos filtros'}
              </h2>
              <p>
                {tipoUsuario === 'entrenador' && !hayFiltros
                  ? 'Creá tu primera sesión y empezá a sumar alumnos.'
                  : 'Probá con otro deporte, otra zona o un rango de fechas más amplio.'}
              </p>
              {tipoUsuario === 'entrenador' && !hayFiltros ? (
                <button className="pr-btn" onClick={() => { setEntrenamientoSeleccionado(null); setModalAbierto(true); }}>
                  Crear entrenamiento <Flecha />
                </button>
              ) : (
                <button className="pr-btn pr-btn--ink" onClick={restablecerFiltros}>Limpiar filtros</button>
              )}
            </div>
          ) : (
            <ul className="pr-grid">
              {entrenamientosVisibles.map((e) => {
                const estado = estadoEntrenamiento(e);
                const c = getCupos(e);
                const coach = nombreEntrenador(e);
                const esSeguido = seguidosIds.has(Number(e.entrenadores?.idusuario ?? e.entrenador?.idusuario));
                const pct = c.capacidad ? Math.min(100, Math.round((c.inscritos / c.capacidad) * 100)) : 0;
                return (
                  <li className="pr-card" key={idDe(e)}>
                    <MediaEvento imagen={e.imagen} deporte={e.deportes?.deporte || e.tipo} alt={e.titulo || 'Entrenamiento'} />
                    <div className="pr-card-head">
                      <AvatarSlk foto={e.entrenadores?.fotoperfil} nombre={coach || e.titulo} />
                      <div className="pr-card-id">
                        <h3>{e.titulo || `Entrenamiento de ${(e.deportes?.deporte || '').toLowerCase()}`}</h3>
                        <p>{coach ? `Con ${coach}` : 'Entrenador asociado'}</p>
                      </div>
                      <span className={`pr-pill pr-pill--${estado.clase}`}>{estado.texto}</span>
                    </div>

                    {(esSeguido || e.clubes?.nombre) && (
                      <div className="pr-tags">
                        {e.clubes?.nombre && <span>Respaldado por {e.clubes.nombre}</span>}
                        {esSeguido && <span>Entrenador que seguís</span>}
                      </div>
                    )}

                    <dl className="pr-facts">
                      <div><dt>Deporte</dt><dd>{e.deportes?.deporte || e.tipo || 'A confirmar'}</dd></div>
                      <div><dt>Precio</dt><dd>{precio(e.precio) || 'A consultar'}</dd></div>
                      <div><dt>Fecha</dt><dd>{fechaLarga(e.fechaentr, e.horainicio, e.horafin)}</dd></div>
                      <div>
                        <dt>Lugar</dt>
                        <dd title={e.ubicacion || ''}>{formatearUbicacionCorta(e.ubicacion || e.direccion) || 'A confirmar'}</dd>
                      </div>
                      {(e.nivel || e.genero) && (
                        <div><dt>Nivel</dt><dd>{[e.nivel, e.genero].filter(Boolean).join(' · ')}</dd></div>
                      )}
                    </dl>

                    {c.capacidad ? (
                      <div className="pr-cupos">
                        <div className="pr-cupos-texto">
                          <span>{c.inscritos} de {c.capacidad} lugares tomados</span>
                          <span>{c.completo ? 'Sin lugares' : `${c.restantes} ${c.restantes === 1 ? 'libre' : 'libres'}`}</span>
                        </div>
                        <div className="pr-cupos-barra" role="progressbar" aria-valuemin={0} aria-valuemax={c.capacidad} aria-valuenow={c.inscritos} aria-label="Lugares tomados">
                          <i style={{ width: `${pct}%` }} className={c.completo ? 'is-full' : ''} />
                        </div>
                      </div>
                    ) : (
                      <p className="pr-cupos-texto">Cupos a confirmar</p>
                    )}

                    <div className="pr-card-foot">
                      <button className="pr-btn pr-btn--ink pr-btn--block" onClick={() => abrirDetalle(e)}>
                        {textoBoton(e)}
                      </button>
                      {(esPropietario(e) || esAdmin) && (
                        <div className="pr-card-owner">
                          {esPropietario(e) && (
                            <button className="pr-link" onClick={() => { setEntrenamientoSeleccionado(e); setModalAbierto(true); }}>Editar</button>
                          )}
                          <button className="pr-link pr-link--danger" onClick={() => setIdPorBorrar(idDe(e))}>Eliminar</button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {totalPaginas > 1 && (
            <nav className="pr-pager" aria-label="Páginas">
              <button className="pr-btn pr-btn--ghost" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>Anterior</button>
              <span>Página {page} de {totalPaginas}</span>
              <button className="pr-btn pr-btn--ghost" onClick={() => setPage((p) => Math.min(p + 1, totalPaginas))} disabled={page >= totalPaginas}>Siguiente</button>
            </nav>
          )}
        </div>
      </section>

      <ModalConfirmarEliminar
        abierto={idPorBorrar !== null}
        titulo="¿Eliminar entrenamiento?"
        mensaje="Se eliminarán también las inscripciones y el chat asociados. Esta acción no se puede deshacer."
        eliminando={borrando}
        onConfirmar={() => handleBorrarEntrenamiento(idPorBorrar)}
        onCerrar={() => setIdPorBorrar(null)}
      />

      <Footer />

      {/* ── Crear / editar ── */}
      {modalAbierto && createPortal(
        <div className="pr-overlay" onClick={() => setModalAbierto(false)}>
          <div className="pr-modal pr-modal--form" role="dialog" aria-modal="true" aria-labelledby="en-form-titulo" onClick={(ev) => ev.stopPropagation()}>
            <header className="pr-modal-head">
              <h2 id="en-form-titulo" className="pr-modal-title">
                {entrenamientoSeleccionado ? 'Editar entrenamiento' : 'Nuevo entrenamiento'}
              </h2>
              <button className="pr-close" onClick={() => setModalAbierto(false)} aria-label="Cerrar">×</button>
            </header>
            <div className="pr-modal-body">
              <FormularioEntrenamiento
                entrenamiento={entrenamientoSeleccionado}
                usuarioActual={usuario}
                onGuardar={handleGuardarEntrenamiento}
                onCancelar={() => setModalAbierto(false)}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Detalle (componente compartido con el calendario) ── */}
      {modalDetalleAbierto && entrenamientoSeleccionado && !mostrarModalExitoEntrenamiento && createPortal(
        <div className="pr-overlay" onClick={() => setModalDetalleAbierto(false)}>
          <div className="pr-modal pr-modal--detalle" role="dialog" aria-modal="true" aria-label="Detalle del entrenamiento" onClick={(ev) => ev.stopPropagation()}>
            <button className="pr-close pr-close--float" onClick={() => setModalDetalleAbierto(false)} aria-label="Cerrar">×</button>
            <div className="pr-modal-body">
              <DetalleEntrenamiento
                entrenamiento={entrenamientoSeleccionado}
                usuario={usuario}
                idjugador={idJugadorReal}
                onCerrar={() => setModalDetalleAbierto(false)}
                onInscripcionExitosa={() => {
                  setMostrarModalExitoEntrenamiento(true);
                  setTimeout(() => cargarEntrenamientos(), 0);
                }}
                onDesuscripcionExitosa={() => {
                  setTimeout(() => cargarEntrenamientos(), 0);
                }}
                onOptimisticChange={handleOptimisticChange}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {mostrarModalExitoEntrenamiento && (
        <ModalConfirmacionInscripcion
          tipoEvento="entrenamiento"
          onCerrar={() => {
            setMostrarModalExitoEntrenamiento(false);
            setModalDetalleAbierto(false);
          }}
        />
      )}
    </div>
  );
};

export default PaginaEntrenamientos
