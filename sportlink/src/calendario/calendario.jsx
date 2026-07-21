import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModalEvento from './ModalEvento.jsx';
import ModalDetallePrueba from './ModalDetallePrueba.jsx';
import DetalleEntrenamiento from '../entrenamientos/DetalleEntrenamiento.jsx';
import DetalleEmpleo from '../empleos/DetalleEmpleo.jsx';
import '../entrenamientos/PaginaEntrenamientos.css';
import { IconoFecha } from '../iconos/IconoFecha.jsx';
import { IconoUbicacion } from '../iconos/IconoUbicacion.jsx';
import { IconoMedalla } from '../iconos/IconoMedalla.jsx';
import { IconoEntrenamientos } from '../iconos/IconoEntrenamientos.jsx';
import { IconoMensajes } from '../iconos/IconoMensajes.jsx';
import './calendario.css';
import Footer from '../footer/footer.jsx';

const API = 'http://localhost:3000/api';

const CATEGORIAS = [
  { id: 'pruebas',        label: 'PRUEBAS DEPORTIVAS', color: '#23e7f5' },
  { id: 'entrenamientos', label: 'ENTRENAMIENTOS',     color: '#3b82f6' },
  { id: 'entrevistas',    label: 'ENTREVISTAS',        color: '#f59e0b' },
  { id: 'personalizado',  label: 'PERSONALIZADO',      color: '#8b5cf6' },
];

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const DIAS_SEMANA = ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];

const ANIOS = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

// ── Helpers puros ────────────────────────────────────────────────────────────

function getDiasDelMes(year, month) {
  const primerDia = new Date(year, month, 1).getDay();
  const offset    = (primerDia === 0) ? 6 : primerDia - 1;
  const totalDias = new Date(year, month + 1, 0).getDate();
  return { offset, totalDias };
}

function parsearFecha(fechaStr) {
  if (!fechaStr) return { anio: 2026, mes: 0, dia: 1 };
  const [a, m, d] = fechaStr.split('-').map(Number);
  return { anio: a, mes: m - 1, dia: d };
}

function formatHora(hora) {
  return hora ? `${hora} hs` : '';
}

function padNum(n) {
  return String(n).padStart(2, '0');
}

const COLOR_POR_TIPO = {
  PRUEBA:        '#23e7f5',
  ENTRENAMIENTO: '#3b82f6',
  ENTREVISTA:    '#f59e0b',
  PERSONALIZADO: '#8b5cf6',
};

const CHIP_BG_POR_TIPO = {
  PRUEBA:        'rgba(35,231,245,0.10)',
  ENTRENAMIENTO: 'rgba(59,130,246,0.10)',
  ENTREVISTA:    'rgba(245,158,11,0.10)',
  PERSONALIZADO: 'rgba(139,92,246,0.12)',
};

const CHIP_BORDER_POR_TIPO = {
  PRUEBA:        'rgba(35,231,245,0.25)',
  ENTRENAMIENTO: 'rgba(59,130,246,0.25)',
  ENTREVISTA:    'rgba(245,158,11,0.25)',
  PERSONALIZADO: 'rgba(139,92,246,0.25)',
};

function obtenerColorPorTipo(tipo) {
  return COLOR_POR_TIPO[tipo?.toUpperCase()] || '#8b5cf6';
}

function esEventoPasado(fechaStr, horaStr) {
  if (!fechaStr) return false;
  const ahora = new Date();
  
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const hoyStr = `${anio}-${mes}-${dia}`;
  
  if (fechaStr < hoyStr) return true;
  if (fechaStr > hoyStr) return false;
  
  // Si es hoy, comparar hora
  if (!horaStr) return false;
  const [hEvent, mEvent] = horaStr.split(':').map(Number);
  const hNow = ahora.getHours();
  const mNow = ahora.getMinutes();
  
  if (hEvent < hNow) return true;
  if (hEvent === hNow && mEvent < mNow) return true;
  
  return false;
}

// ── Mapeo de evento del backend → objeto normalizado para el frontend ─────────
function mapearEventoBackend(e) {
  let fechaStr = e.fecha;
  if (fechaStr && fechaStr.includes('T')) fechaStr = fechaStr.split('T')[0];

  return {
    id:              e.idEvento   || null,
    tipo:            (e.tipo || 'PERSONALIZADO').toUpperCase(),
    fecha:           fechaStr,
    hora:            e.horaInicio ? e.horaInicio.slice(0, 5) : '',
    idPrueba:        e.idPrueba        || null,
    idEntrenamiento: e.idEntrenamiento || null,
    idInscripcionEmpleo: e.idinscripcionempleo || null,
    nombre:          e.titulo     || '',
    descripcion:     e.descripcion || '',
    imagenPreview:   e.imagen     || null,
    datosPrueba:     e._datosPrueba || null, // viene enriquecido desde el service
    datosEntrenamiento: e._datosEntrenamiento || null,
    datosEmpleo:     e._datosEmpleo || null,
    ubicacion:       null,
    creador:         null,
  };
}

function limpiarTitulo(titulo) {
  if (!titulo) return '';
  return titulo.replace(/^(prueba|entrenamiento|entrevista|personalizado):\s*/i, '');
}

// ── Componente principal ─────────────────────────────────────────────────────

// ── Función pura: extrae el idusuario numérico de cualquier objeto de sesión ──
// Recibe el objeto explícitamente para evitar cierres (closures) stale.
// Si el objeto no tiene el campo resuelve, intenta leer del localStorage.
function resolverUserId(usuarioObj) {
  const intentar = (obj) => {
    if (!obj || typeof obj !== 'object') return null;
    const raw = obj.idusuario ?? obj.idUsuario ?? obj.id ?? null;
    const num = Number(raw);
    return (!isNaN(num) && num > 0) ? num : null;
  };

  // 1er intento: objeto pasado como argumento
  const fromArg = intentar(usuarioObj);
  if (fromArg) return fromArg;

  // 2do intento (fallback): leer directamente del localStorage
  try {
    const stored = JSON.parse(localStorage.getItem('usuario') || 'null');
    return intentar(stored);
  } catch {
    return null;
  }
}

function EventoCard({ ev, eliminando, onVerPrueba, onVerEntrenamiento, onVerEmpleo, onEditar, onEliminar }) {
  const esPersonalizado = ev.tipo?.toUpperCase() === 'PERSONALIZADO';
  const esPrueba        = ev.tipo?.toUpperCase() === 'PRUEBA';
  const esEntrenamiento = ev.tipo?.toUpperCase() === 'ENTRENAMIENTO';
  const esEmpleo        = ev.tipo?.toUpperCase() === 'EMPLEO';

  return (
    <div className="cal-panel-evento">
      {/* Imagen si tiene */}
      {ev.imagenPreview && (
        <div className="cal-panel-evento-img-wrap">
          <img
            src={ev.imagenPreview}
            alt={ev.nombre}
            className="cal-panel-evento-img"
          />
        </div>
      )}
      <div className="cal-panel-evento-body">
        {/* Nombre + dot */}
        <div className="cal-panel-evento-titulo-row">
          <span
            className="cal-panel-evento-dot"
            style={{
              background: obtenerColorPorTipo(ev.tipo),
              boxShadow:  `0 0 8px ${obtenerColorPorTipo(ev.tipo)}66`,
            }}
          />
          <h3 className="cal-panel-evento-nombre">{ev.nombre}</h3>
        </div>

        {/* Meta: fecha + hora */}
        <div className="cal-panel-evento-meta">
          <span className="cal-panel-evento-meta-item">
            <IconoFecha size={12} />
            {(() => { const f = parsearFecha(ev.fecha); return `${f.dia} de ${MESES[f.mes]} de ${f.anio}`; })()}
          </span>
          {ev.hora && (
            <span className="cal-panel-evento-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {formatHora(ev.hora)}
            </span>
          )}
          {/* Creador / Club */}
          {ev.creador && (
            <span className="cal-panel-evento-meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              {ev.creador}
            </span>
          )}
          {/* Ubicación */}
          {ev.ubicacion && (
            <span className="cal-panel-evento-meta-item">
              <IconoUbicacion size={12} />
              {ev.ubicacion}
            </span>
          )}
        </div>

        {/* Descripción */}
        {ev.descripcion && (
          <p className="cal-panel-evento-desc">{ev.descripcion}</p>
        )}

        {/* Acciones según tipo */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          {/* Botón "Ver prueba" — solo eventos de tipo PRUEBA */}
          {esPrueba && ev.datosPrueba && (
            <button
              className="cal-panel-evento-btn"
              onClick={() => onVerPrueba && onVerPrueba(ev.datosPrueba)}
            >
              VER PRUEBA
            </button>
          )}

          {/* Botón "Ver entrenamiento" */}
          {esEntrenamiento && ev.datosEntrenamiento && (
            <button
              className="cal-panel-evento-btn"
              onClick={() => onVerEntrenamiento && onVerEntrenamiento(ev.datosEntrenamiento)}
            >
              VER ENTRENAMIENTO
            </button>
          )}

          {/* Botón "Ver empleo" */}
          {esEmpleo && ev.datosEmpleo && (
            <button
              className="cal-panel-evento-btn"
              onClick={() => onVerEmpleo && onVerEmpleo(ev.datosEmpleo)}
            >
              VER EMPLEO
            </button>
          )}

          {/* Botones Editar / Eliminar — SOLO eventos personalizados */}
          {esPersonalizado && ev.id && onEditar && onEliminar && (
            <>
              <button
                className="cal-panel-evento-btn cal-panel-evento-btn--editar"
                onClick={() => onEditar(ev)}
              >
                EDITAR
              </button>
              <button
                className="cal-panel-evento-btn cal-panel-evento-btn--eliminar"
                onClick={() => onEliminar(ev)}
                disabled={eliminando}
              >
                {eliminando ? 'ELIMINANDO…' : 'ELIMINAR'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Calendario({ usuario }) {
  const navigate = useNavigate();

  /** Wrapper que usa la función pura con el usuario actual del componente */
  const obtenerUserId = () => resolverUserId(usuario);

  useEffect(() => {
    if (!usuario) navigate('/login');
  }, [usuario]);

  const hoy = new Date();
  const [mesActual,       setMesActual]       = useState(hoy.getMonth());
  const [anioActual,      setAnioActual]       = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [dropdownMes,     setDropdownMes]     = useState(false);
  const [dropdownAnio,    setDropdownAnio]    = useState(false);

  // ── Estado de eventos ────────────────────────────────────────────────────
  const [eventos,         setEventos]         = useState({});   // { 'YYYY-MM-DD': [ev, ...] }
  const [cargandoEventos, setCargandoEventos] = useState(false);
  const [proximosVisibles, setProximosVisibles] = useState(3);
  const [infoVisibles, setInfoVisibles] = useState(3);
  const [infoAbierto, setInfoAbierto] = useState(true);
  const [proximosAbierto, setProximosAbierto] = useState(true);

  // ── Estado de modales ────────────────────────────────────────────────────
  // 'libre' | 'diaBloqueado' | 'editar' | null
  const [modalTipo,             setModalTipo]             = useState(null);
  const [eventoEditando,        setEventoEditando]        = useState(null);
  const [pruebaDetalle,         setPruebaDetalle]         = useState(null);
  const [entrenamientoDetalle,  setEntrenamientoDetalle]  = useState(null);
  const [empleoDetalle,         setEmpleoDetalle]         = useState(null);
  const [eliminandoId,          setEliminandoId]          = useState(null);

  const abrirModalLibre = () => { setEventoEditando(null); setModalTipo('libre'); };
  const abrirModalDia   = () => { setEventoEditando(null); setModalTipo('diaBloqueado'); };
  const cerrarModal     = () => { setModalTipo(null); setEventoEditando(null); };

  const fechaInicialDia = diaSeleccionado
    ? { anio: anioActual, mes: mesActual, dia: diaSeleccionado }
    : null;

  // ── Helpers de estado ────────────────────────────────────────────────────

  /** Añade un evento al mapa de eventos localmente */
  const agregarEventoLocal = (ev) => {
    setEventos(prev => {
      const lista = prev[ev.fecha] ? [...prev[ev.fecha]] : [];
      // Evitar duplicados por id
      const sinDuplicado = lista.filter(e => e.id !== ev.id);
      return { ...prev, [ev.fecha]: [...sinDuplicado, ev] };
    });
  };

  /** Elimina un evento del mapa por id */
  const eliminarEventoLocal = (id, fecha) => {
    setEventos(prev => {
      const lista = (prev[fecha] || []).filter(e => e.id !== id);
      const nuevo = { ...prev };
      if (lista.length === 0) {
        delete nuevo[fecha];
      } else {
        nuevo[fecha] = lista;
      }
      return nuevo;
    });
  };

  /** Reemplaza un evento en el mapa (para edición) */
  const reemplazarEventoLocal = (evActualizado) => {
    setEventos(prev => {
      const nuevo = {};
      for (const [fecha, lista] of Object.entries(prev)) {
        nuevo[fecha] = lista.filter(e => e.id !== evActualizado.id);
        if (nuevo[fecha].length === 0) delete nuevo[fecha];
      }
      const lista = nuevo[evActualizado.fecha] || [];
      nuevo[evActualizado.fecha] = [...lista, evActualizado];
      return nuevo;
    });
  };

  // ── Cargar eventos del backend ────────────────────────────────────────────
  const cargarEventos = useCallback(async () => {
    // Usa la función pura que hace fallback al localStorage automáticamente
    const userId = resolverUserId(usuario);
    if (!userId) {
      console.error('[Calendario] cargarEventos: no se pudo resolver el userId. Objeto usuario:', usuario);
      return;
    }
    console.log('[Calendario] cargarEventos: userId resuelto =', userId);
    setCargandoEventos(true);
    try {
      const res = await axios.get(`${API}/calendario`, {
        headers: { 'X-User-Id': String(userId) }
      });

      const eventosMapeados = {};

      for (const e of res.data) {
        const ev = mapearEventoBackend(e);

        // Si el backend ya devuelve _datosPrueba en el objeto (prueba automática),
        // no hace falta un fetch adicional.
        if (ev.tipo === 'PRUEBA') {
          if (!ev.nombre) {
            ev.nombre = 'Prueba Deportiva';
          }
          // Extraer ubicacion y creador de datosPrueba si existen
          if (ev.datosPrueba) {
            ev.ubicacion = ev.datosPrueba.zona || ev.datosPrueba.club?.ubicacion || null;
            ev.creador   = ev.datosPrueba.club?.nombre || null;
          } else if (ev.idPrueba) {
            // Fetch adicional (ej. para Clubes)
            try {
              const resP = await axios.get(`${API}/pruebas/${ev.idPrueba}`);
              ev.datosPrueba = resP.data;
              ev.ubicacion = ev.datosPrueba.zona || ev.datosPrueba.club?.ubicacion || null;
              ev.creador   = ev.datosPrueba.club?.nombre || null;
            } catch {}
          }
        } else if (ev.tipo === 'ENTRENAMIENTO') {
          // Si no viene nombre del backend, intentar un fetch liviano
          if (ev.idEntrenamiento) {
            try {
              const resE = await axios.get(`${API}/entrenamientos/${ev.idEntrenamiento}`);
              const ent = resE.data;
              if (!ev.nombre) ev.nombre = ent.titulo || 'Entrenamiento';
              ev.descripcion = ent.descripcion || ev.descripcion;
              ev.imagenPreview = ent.imagen || ev.imagenPreview;
              ev.ubicacion = ent.ubicacion || null;
              ev.datosEntrenamiento = ent;
            } catch { if (!ev.nombre) ev.nombre = 'Entrenamiento'; }
          }
        } else if (ev.tipo === 'EMPLEO') {
          if (ev.idInscripcionEmpleo) {
            try {
              const resE = await axios.get(`${API}/empleo/${ev.idInscripcionEmpleo}`);
              ev.datosEmpleo = resE.data;
            } catch {}
          }
        }
        // PERSONALIZADO: nombre y descripcion ya vienen desde el backend (campo titulo)

        if (!ev.fecha) continue;
        if (!eventosMapeados[ev.fecha]) eventosMapeados[ev.fecha] = [];
        eventosMapeados[ev.fecha].push(ev);
      }

      setEventos(eventosMapeados);
    } catch (err) {
      console.error('Error al obtener eventos del backend:', err);
    } finally {
      setCargandoEventos(false);
    }
  }, [usuario]);   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  // ── Guardar evento (crear o editar) ──────────────────────────────────────
  const guardarEvento = async (payload) => {
    try {
      const userId = resolverUserId(usuario);
      if (!userId) {
        console.error('[Calendario] guardarEvento: userId no resuelto. Objeto usuario:', usuario);
        alert('Error de sesión: no se pudo identificar al usuario. Por favor, cerrá sesión y volvé a ingresar.');
        return;
      }
      console.log('[Calendario] guardarEvento: userId resuelto =', userId);

      if (payload.id && modalTipo === 'editar') {
        // ── EDITAR ──
        const res = await axios.put(`${API}/calendario/${payload.id}`, {
          fecha:       payload.fecha,
          horainicio:  payload.hora,
          titulo:      payload.nombre,
          descripcion: payload.descripcion,
          imagen:      payload.imagenPreview,
        }, {
          headers: { 'X-User-Id': String(userId) }
        });

        const evActualizado = {
          ...eventoEditando,
          nombre:       payload.nombre,
          fecha:        payload.fecha,
          hora:         payload.hora,
          descripcion:  payload.descripcion,
          // Usar la URL pública del storage devuelta por el backend;
          // si no subió imagen nueva, mantener la anterior
          imagenPreview: res.data?.imagen ?? eventoEditando.imagenPreview,
        };

        // Si cambió la fecha, necesitamos mover el evento en el mapa
        reemplazarEventoLocal(evActualizado);
      } else {
        // ── CREAR ──
        const res = await axios.post(`${API}/calendario`, {
          idusuario:   userId,
          tipo:        'PERSONALIZADO',
          fecha:       payload.fecha,
          horainicio:  payload.hora,
          horafin:     null,
          titulo:      payload.nombre,
          descripcion: payload.descripcion,
          imagen:      payload.imagenPreview,
        }, {
          headers: { 'X-User-Id': String(userId) }
        });

        const backendEv = res.data;

        // Normalizar la fecha: el backend puede devolver "YYYY-MM-DDTHH:mm:ss"
        // pero la clave del mapa debe ser siempre "YYYY-MM-DD"
        const fechaNormalizada = (backendEv.fecha || payload.fecha).split('T')[0];

        const nuevoEv = {
          id:           backendEv.idEvento,
          tipo:         'PERSONALIZADO',
          fecha:        fechaNormalizada,
          hora:         backendEv.horaInicio
                          ? backendEv.horaInicio.slice(0, 5)
                          : payload.hora,
          nombre:       payload.nombre,
          descripcion:  payload.descripcion,
          // Usar la URL pública del storage devuelta por el backend,
          // nunca el base64 local (que puede ser muy pesado)
          imagenPreview: backendEv.imagen || null,
          datosPrueba:  null,
          ubicacion:    null,
          creador:      null,
        };

        // 1. Actualización optimista inmediata — el evento aparece al instante
        agregarEventoLocal(nuevoEv);

        // 2. Re-fetch silencioso — sincroniza con el servidor en segundo plano
        //    sin bloquear el cierre del modal
        cargarEventos();
      }

      cerrarModal();
    } catch (err) {
      console.error('Error al guardar evento:', err);
      alert('No se pudo guardar el evento. Revisá la consola para más detalles.');
    }
  };

  // ── Eliminar evento personalizado ─────────────────────────────────────────
  const eliminarEvento = async (ev) => {
    if (!ev.id) return;
    if (!window.confirm(`¿Eliminar el evento "${ev.nombre}"?`)) return;

    const userId = resolverUserId(usuario);
    if (!userId) {
      alert('Error de sesión: no se pudo identificar al usuario.');
      return;
    }

    setEliminandoId(ev.id);
    try {
      await axios.delete(`${API}/calendario/${ev.id}`, {
        headers: { 'X-User-Id': String(userId) }
      });
      eliminarEventoLocal(ev.id, ev.fecha);
    } catch (err) {
      console.error('Error al eliminar evento:', err);
      alert('No se pudo eliminar el evento.');
    } finally {
      setEliminandoId(null);
    }
  };

  // ── Abrir modal de edición ────────────────────────────────────────────────
  const abrirEdicion = (ev) => {
    setEventoEditando(ev);
    setModalTipo('editar');
  };

  if (!usuario) return null;

  // ── Cálculos del calendario ───────────────────────────────────────────────
  const { offset, totalDias } = getDiasDelMes(anioActual, mesActual);

  const esHoy = (dia) =>
    dia === hoy.getDate() &&
    mesActual === hoy.getMonth() &&
    anioActual === hoy.getFullYear();

  const cambiarMes = (nuevoMes) => {
    setMesActual(nuevoMes);
    setDiaSeleccionado(null);
    setDropdownMes(false);
  };

  const cambiarAnio = (nuevoAnio) => {
    setAnioActual(nuevoAnio);
    setDiaSeleccionado(null);
    setDropdownAnio(false);
  };

  const irMesAnterior = () => {
    setDiaSeleccionado(null);
    if (mesActual === 0) { setMesActual(11); setAnioActual(a => a - 1); }
    else setMesActual(m => m - 1);
  };

  const irMesSiguiente = () => {
    setDiaSeleccionado(null);
    if (mesActual === 11) { setMesActual(0); setAnioActual(a => a + 1); }
    else setMesActual(m => m + 1);
  };

  const handleDiaClick = (dia) => {
    setDiaSeleccionado(dia);
    setInfoVisibles(3);
    setInfoAbierto(true);
    if (dropdownMes) setDropdownMes(false);
    if (dropdownAnio) setDropdownAnio(false);
  };

  const irAHoy = () => {
    const today = new Date();
    setMesActual(today.getMonth());
    setAnioActual(today.getFullYear());
    setDiaSeleccionado(today.getDate());
    setInfoVisibles(3);
    setInfoAbierto(true);
    if (dropdownMes) setDropdownMes(false);
    if (dropdownAnio) setDropdownAnio(false);
  };


  const totalCeldas = Math.ceil((offset + totalDias) / 7) * 7;
  const celdas = Array.from({ length: totalCeldas }, (_, i) => {
    const dia = i - offset + 1;
    return (dia >= 1 && dia <= totalDias) ? dia : null;
  });

  const nombreDiaSemana = (dia) => {
    const d = new Date(anioActual, mesActual, dia);
    return ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][d.getDay()];
  };

  const claveDelDia = (dia) =>
    `${anioActual}-${padNum(mesActual + 1)}-${padNum(dia)}`;

  const eventosDelDia = diaSeleccionado ? (eventos[claveDelDia(diaSeleccionado)] || []) : [];

  const clasesCelda = (dia) => [
    'cal-celda',
    dia === null ? 'cal-celda--vacia' : '',
    dia && diaSeleccionado === dia ? 'cal-celda--seleccionada' : '',
    dia && esHoy(dia) && diaSeleccionado !== dia ? 'cal-celda--hoy' : '',
  ].filter(Boolean).join(' ');

  const clasesNum = (dia) => [
    'cal-celda-num',
    diaSeleccionado === dia ? 'cal-celda-num--seleccionada' : '',
    esHoy(dia) && diaSeleccionado !== dia ? 'cal-celda-num--hoy' : '',
  ].filter(Boolean).join(' ');

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="cal-root" onClick={() => { setDropdownMes(false); setDropdownAnio(false); }}>
      <div className="cal-layout">
        <div className="cal-left-block">
          {/* ── SIDEBAR ── */}
          <aside className="cal-sidebar">
          <p className="cal-sidebar-label">CATEGORÍAS</p>
          {CATEGORIAS.map(cat => (
            <div key={cat.id} className="cal-cat-item">
              <span className="cal-cat-dot" style={{ background: cat.color }} />
              <span className="cal-cat-text">{cat.label}</span>
            </div>
          ))}
          <div className="cal-sidebar-divider" />
          <button className="cal-agregar-btn" onClick={abrirModalLibre}>
            <span className="cal-agregar-plus">+</span>
            AGREGAR EVENTO
          </button>
        </aside>

        {/* ── MAIN ── */}
        <main className="cal-main">

          {/* Cabecera mes */}
          <div className="cal-header-mes">
            <div>
              <p className="cal-programacion-label">PROGRAMACIÓN ACTUAL</p>
              <h1 className="cal-mes-titulo">
                <span className="cal-dropdown-wrap" onClick={e => e.stopPropagation()}>
                  <button
                    className="cal-mes-btn"
                    onClick={() => { setDropdownMes(v => !v); setDropdownAnio(false); }}
                  >
                    <span className="cal-mes-nombre">{MESES[mesActual].toUpperCase()}</span>
                    <svg className={`cal-dropdown-arrow ${dropdownMes ? 'open' : ''}`} viewBox="0 0 10 6" fill="none">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                  {dropdownMes && (
                    <div className="cal-dropdown-menu cal-dropdown-menu--mes">
                      {MESES.map((m, i) => (
                        <button
                          key={i}
                          className={`cal-dropdown-item ${i === mesActual ? 'cal-dropdown-item--activo' : ''}`}
                          onClick={() => cambiarMes(i)}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                </span>

                {' '}

                <span className="cal-dropdown-wrap" onClick={e => e.stopPropagation()}>
                  <button
                    className="cal-mes-btn"
                    onClick={() => { setDropdownAnio(v => !v); setDropdownMes(false); }}
                  >
                    <span className="cal-mes-anio">{anioActual}</span>
                    <svg className={`cal-dropdown-arrow ${dropdownAnio ? 'open' : ''}`} viewBox="0 0 10 6" fill="none">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                  {dropdownAnio && (
                    <div className="cal-dropdown-menu cal-dropdown-menu--anio">
                      {ANIOS.map(a => (
                        <button
                          key={a}
                          className={`cal-dropdown-item ${a === anioActual ? 'cal-dropdown-item--activo' : ''}`}
                          onClick={() => cambiarAnio(a)}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </span>
              </h1>
            </div>

            <div className="cal-nav-btns">
              <button className="cal-nav-btn cal-nav-btn-hoy" onClick={irAHoy} type="button">HOY</button>
              <button className="cal-nav-btn" onClick={irMesAnterior}>‹</button>
              <button className="cal-nav-btn" onClick={irMesSiguiente}>›</button>
            </div>
          </div>

          {/* Grilla */}
          <div className="cal-grid-wrapper">
            <div className="cal-grid-header">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="cal-dia-semana">{d}</div>
              ))}
            </div>
            <div className="cal-grid">
              {celdas.map((dia, i) => {
                const clave   = dia ? claveDelDia(dia) : null;
                const evsDia  = clave ? (eventos[clave] || []) : [];
                return (
                  <div
                    key={i}
                    className={clasesCelda(dia)}
                    onClick={() => dia && handleDiaClick(dia)}
                  >
                    {dia && (
                      <>
                        <span className={clasesNum(dia)}>
                          {String(dia).padStart(2, '0')}
                        </span>
                        {/* Chips de eventos — color dinámico según tipo */}
                        {evsDia.length > 0 && (
                          <div className="cal-celda-eventos">
                            {evsDia.slice(0, 2).map((ev, idx) => {
                              const tipoKey = ev.tipo?.toUpperCase() || 'PERSONALIZADO';
                              const esPasado = esEventoPasado(ev.fecha, ev.hora);
                              return (
                                <div key={ev.id ?? `${clave}-${idx}`} className="cal-celda-evento-wrapper">
                                  <div
                                    className={`cal-celda-evento-chip ${esPasado ? 'cal-celda-evento-chip--pasado' : ''}`}
                                    style={{
                                      background:   CHIP_BG_POR_TIPO[tipoKey]     || CHIP_BG_POR_TIPO.PERSONALIZADO,
                                      borderColor:  CHIP_BORDER_POR_TIPO[tipoKey] || CHIP_BORDER_POR_TIPO.PERSONALIZADO,
                                    }}
                                  >
                                    <span
                                      className="cal-celda-evento-dot"
                                      style={{ background: obtenerColorPorTipo(ev.tipo) }}
                                    />
                                    <span
                                      className="cal-celda-evento-nombre"
                                      style={{ color: obtenerColorPorTipo(ev.tipo) }}
                                    >
                                      {limpiarTitulo(ev.nombre)}
                                    </span>
                                  </div>
                                  {ev.hora && (
                                    <span className="cal-celda-evento-hora">
                                      {ev.hora}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            {evsDia.length > 2 && (
                              <div className="cal-celda-mas">+{evsDia.length - 2} más</div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* ── SIDEBAR DERECHA ── */}
      <aside className="cal-sidebar-right">
        {/* Panel día seleccionado */}
        <div className={`cal-panel-dia ${infoAbierto ? 'cal-panel--open' : 'cal-panel--closed'}`}>
          <div className="cal-panel-header">
            <div 
              className="cal-panel-header-clickable" 
              onClick={() => diaSeleccionado && setInfoAbierto(!infoAbierto)}
              style={{ cursor: diaSeleccionado ? 'pointer' : 'default' }}
            >
              <p className="cal-panel-fecha-label">
                {diaSeleccionado 
                  ? `${nombreDiaSemana(diaSeleccionado)}, ${diaSeleccionado} de ${MESES[mesActual]} de ${anioActual}`
                  : "Selecciona un día"}
              </p>
              <h2 className="cal-panel-titulo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                INFO DEL DÍA
                {diaSeleccionado && (
                  <svg className={`cal-section-arrow ${infoAbierto ? 'open' : ''}`} viewBox="0 0 10 6" fill="none">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </h2>
            </div>
            <button 
              className="cal-panel-agregar" 
              onClick={abrirModalDia}
              disabled={!diaSeleccionado}
              style={{ opacity: !diaSeleccionado ? 0.5 : 1, cursor: !diaSeleccionado ? 'not-allowed' : 'pointer' }}
            >
              +
            </button>
          </div>

          <div className={`cal-collapsible-wrapper ${infoAbierto ? 'open' : ''}`}>
            <div className="cal-collapsible-content">
              {!diaSeleccionado ? (
                <div className="cal-panel-vacio">
                  <p>Selecciona un día en el calendario para ver sus detalles.</p>
                </div>
              ) : cargandoEventos ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                  Cargando eventos…
                </div>
              ) : eventosDelDia.length === 0 ? (
                <div className="cal-panel-vacio">
                  <p>No hay eventos para este día.</p>
                </div>
              ) : (
                <div className="cal-panel-eventos">
                  {eventosDelDia.slice(0, infoVisibles).map((ev, idx) => (
                    <EventoCard
                      key={ev.id ?? idx}
                      ev={ev}
                      eliminando={eliminandoId === ev.id}
                      onVerPrueba={setPruebaDetalle}
                      onVerEntrenamiento={setEntrenamientoDetalle}
                      onVerEmpleo={setEmpleoDetalle}
                      onEditar={abrirEdicion}
                      onEliminar={eliminarEvento}
                    />
                  ))}
                  {(eventosDelDia.length > 3 || infoVisibles > 3) && (
                    <div className="cal-pagination-container">
                      {eventosDelDia.length > infoVisibles && (
                        <button 
                          className="cal-btn-ver-mas"
                          onClick={() => setInfoVisibles(v => v + 5)}
                        >
                          Ver más
                        </button>
                      )}
                      {infoVisibles > 3 && (
                        <button 
                          className="cal-btn-ver-menos"
                          onClick={() => setInfoVisibles(3)}
                        >
                          Mostrar menos
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Próximos eventos */}
        <section className={`cal-proximos ${proximosAbierto ? 'cal-panel--open' : 'cal-panel--closed'}`}>
          <div className="cal-proximos-header" onClick={() => setProximosAbierto(!proximosAbierto)}>
            <h2 className="cal-proximos-titulo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              PRÓXIMOS EVENTOS
              <svg className={`cal-section-arrow ${proximosAbierto ? 'open' : ''}`} viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </h2>
          </div>
          
          <div className={`cal-collapsible-wrapper ${proximosAbierto ? 'open' : ''}`}>
            <div className="cal-collapsible-content">
              {(() => {
                const hoyStr = `${hoy.getFullYear()}-${padNum(hoy.getMonth()+1)}-${padNum(hoy.getDate())}`;
                const proximos = Object.entries(eventos)
                  .filter(([fecha]) => fecha >= hoyStr)
                  .sort(([a],[b]) => a.localeCompare(b))
                  .flatMap(([, evs]) => evs);

                return proximos.length === 0 ? (
                  <div className="cal-proximos-vacio">
                    <p>No hay próximos eventos programados actualmente.</p>
                  </div>
                ) : (
                  <div className="cal-proximos-lista" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {proximos.slice(0, proximosVisibles).map((ev, idx) => (
                      <EventoCard
                        key={ev.id ?? idx}
                        ev={ev}
                        eliminando={eliminandoId === ev.id}
                        onVerPrueba={setPruebaDetalle}
                        onVerEntrenamiento={setEntrenamientoDetalle}
                        onVerEmpleo={setEmpleoDetalle}
                        onEditar={abrirEdicion}
                        onEliminar={eliminarEvento}
                      />
                    ))}
                    {(proximos.length > 3 || proximosVisibles > 3) && (
                      <div className="cal-pagination-container">
                        {proximos.length > proximosVisibles && (
                          <button 
                            className="cal-btn-ver-mas"
                            onClick={() => setProximosVisibles(v => v + 5)}
                          >
                            Ver más
                          </button>
                        )}
                        {proximosVisibles > 3 && (
                          <button 
                            className="cal-btn-ver-menos"
                            onClick={() => setProximosVisibles(3)}
                          >
                            Mostrar menos
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      </aside>
      </div>

            <Footer />

      {/* ── Modales de creación / edición ── */}
      {modalTipo === 'libre' && (
        <ModalEvento
          onGuardar={guardarEvento}
          onCerrar={cerrarModal}
          fechaBloqueada={false}
        />
      )}
      {modalTipo === 'diaBloqueado' && (
        <ModalEvento
          onGuardar={guardarEvento}
          onCerrar={cerrarModal}
          fechaInicial={fechaInicialDia}
          fechaBloqueada={true}
        />
      )}
      {modalTipo === 'editar' && eventoEditando && (
        <ModalEvento
          onGuardar={guardarEvento}
          onCerrar={cerrarModal}
          eventoEditar={eventoEditando}
          fechaBloqueada={false}
        />
      )}

      {/* Modal Detalle de Prueba */}
      {pruebaDetalle && (
        <ModalDetallePrueba
          prueba={pruebaDetalle}
          loading={false}
          onCerrar={() => setPruebaDetalle(null)}
          usuario={usuario}
        />
      )}

      {/* Modal Detalle de Entrenamiento */}
      {entrenamientoDetalle && (
        <div className="modal-overlay" onClick={() => setEntrenamientoDetalle(null)}>
          <div className="modal-contenedor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-titulo">Detalles del Entrenamiento</h3>
              <button className="btn-cerrar-modal" onClick={() => setEntrenamientoDetalle(null)}>×</button>
            </div>
            <div className="modal-cuerpo">
              <DetalleEntrenamiento
                entrenamiento={entrenamientoDetalle}
                usuario={usuario}
                idjugador={obtenerUserId()}
                onCerrar={() => setEntrenamientoDetalle(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle de Empleo */}
      {empleoDetalle && (
        <div className="modal-overlay" onClick={() => setEmpleoDetalle(null)}>
          <div className="modal-contenedor" onClick={(e) => e.stopPropagation()} style={{ padding: 0 }}>
            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
              <h3 className="modal-titulo">Detalles de la Oferta Laboral</h3>
              <button className="btn-cerrar-modal" onClick={() => setEmpleoDetalle(null)}>×</button>
            </div>
            <div className="modal-cuerpo" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <DetalleEmpleo
                empleo={empleoDetalle}
                usuario={usuario}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}