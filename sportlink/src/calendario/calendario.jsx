import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Footer from '../footer/footer.jsx';
import ModalEvento from './ModalEvento.jsx';
import ModalDetallePrueba from './ModalDetallePrueba.jsx';
import './calendario.css';

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
    nombre:          e.titulo     || '',
    descripcion:     e.descripcion || '',
    imagenPreview:   e.imagen     || null,
    datosPrueba:     e._datosPrueba || null, // viene enriquecido desde el service
    ubicacion:       null,
    creador:         null,
  };
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function Calendario(props) {
  const usuario = props.usuario || JSON.parse(localStorage.getItem('usuario') || 'null');

  /**
   * Extrae el idusuario numérico del objeto usuario guardado en sesión.
   * Cubre todas las formas posibles que puede tener el objeto:
   *   { idusuario: 5 }  |  { idUsuario: 5 }  |  { id: 5 }
   * Retorna un número > 0 o null.
   */
  const obtenerUserId = () => {
    if (!usuario) return null;
    const raw = usuario.idusuario ?? usuario.idUsuario ?? usuario.id ?? null;
    const num = Number(raw);
    return (!isNaN(num) && num > 0) ? num : null;
  };

  useEffect(() => {
    if (!usuario) props.cambiarVista('login');
  }, [usuario, props]);

  const hoy = new Date();
  const [mesActual,       setMesActual]       = useState(hoy.getMonth());
  const [anioActual,      setAnioActual]       = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [dropdownMes,     setDropdownMes]     = useState(false);
  const [dropdownAnio,    setDropdownAnio]    = useState(false);

  // ── Estado de eventos ────────────────────────────────────────────────────
  const [eventos,         setEventos]         = useState({});   // { 'YYYY-MM-DD': [ev, ...] }
  const [cargandoEventos, setCargandoEventos] = useState(false);

  // ── Estado de modales ────────────────────────────────────────────────────
  // 'libre' | 'diaBloqueado' | 'editar' | null
  const [modalTipo,             setModalTipo]             = useState(null);
  const [eventoEditando,        setEventoEditando]        = useState(null);
  const [pruebaDetalle,         setPruebaDetalle]         = useState(null);
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
    if (!usuario) return;
    const userId = obtenerUserId();
    if (!userId) {
      console.error('[Calendario] cargarEventos: no se pudo resolver el userId del usuario en sesión:', usuario);
      return;
    }
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
          }
        } else if (ev.tipo === 'ENTRENAMIENTO') {
          // Si no viene nombre del backend, intentar un fetch liviano
          if (!ev.nombre && ev.idEntrenamiento) {
            try {
              const resE = await axios.get(`${API}/entrenamientos/${ev.idEntrenamiento}`);
              const ent = resE.data;
              ev.nombre    = ent.titulo || 'Entrenamiento';
              ev.descripcion = ent.descripcion || ev.descripcion;
              ev.imagenPreview = ent.imagen || ev.imagenPreview;
              ev.ubicacion = ent.ubicacion || null;
            } catch { ev.nombre = 'Entrenamiento'; }
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
      const userId = obtenerUserId();
      if (!userId) {
        console.error('[Calendario] guardarEvento: userId no resuelto, usuario en sesión:', usuario);
        alert('Error de sesión: no se pudo identificar al usuario. Por favor, cerrá sesión y volvé a ingresar.');
        return;
      }

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
        const nuevoEv = {
          id:           backendEv.idEvento,
          tipo:         'PERSONALIZADO',
          fecha:        backendEv.fecha || payload.fecha,
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

        agregarEventoLocal(nuevoEv);
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

    const userId = obtenerUserId();
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
                            {evsDia.slice(0, 3).map((ev, idx) => {
                              const tipoKey = ev.tipo?.toUpperCase() || 'PERSONALIZADO';
                              return (
                                <div
                                  key={ev.id ?? `${clave}-${idx}`}
                                  className="cal-celda-evento-chip"
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
                                    {ev.nombre}
                                  </span>
                                </div>
                              );
                            })}
                            {evsDia.length > 3 && (
                              <div className="cal-celda-mas">+{evsDia.length - 3} más</div>
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

          {/* Panel día seleccionado */}
          {diaSeleccionado && (
            <div className="cal-panel-dia">
              <div className="cal-panel-header">
                <div>
                  <p className="cal-panel-fecha-label">
                    {nombreDiaSemana(diaSeleccionado)}, {diaSeleccionado} de {MESES[mesActual]} de {anioActual}
                  </p>
                  <h2 className="cal-panel-titulo">INFO DEL DÍA</h2>
                </div>
                <button className="cal-panel-agregar" onClick={abrirModalDia}>+</button>
              </div>

              {cargandoEventos ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                  Cargando eventos…
                </div>
              ) : eventosDelDia.length === 0 ? (
                <div className="cal-panel-vacio">
                  <p>No hay eventos para este día.</p>
                </div>
              ) : (
                <div className="cal-panel-eventos">
                  {eventosDelDia.map((ev, idx) => {
                    const esPersonalizado = ev.tipo?.toUpperCase() === 'PERSONALIZADO';
                    const esPrueba        = ev.tipo?.toUpperCase() === 'PRUEBA';
                    const eliminando      = eliminandoId === ev.id;

                    return (
                      <div key={ev.id ?? idx} className="cal-panel-evento">
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
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
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
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                </svg>
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
                                onClick={() => setPruebaDetalle(ev.datosPrueba)}
                              >
                                VER PRUEBA
                              </button>
                            )}

                            {/* Botones Editar / Eliminar — SOLO eventos personalizados */}
                            {esPersonalizado && ev.id && (
                              <>
                                <button
                                  className="cal-panel-evento-btn cal-panel-evento-btn--editar"
                                  onClick={() => abrirEdicion(ev)}
                                >
                                  EDITAR
                                </button>
                                <button
                                  className="cal-panel-evento-btn cal-panel-evento-btn--eliminar"
                                  onClick={() => eliminarEvento(ev)}
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
                  })}
                </div>
              )}
            </div>
          )}

          {/* Próximos eventos */}
          <section className="cal-proximos">
            <h2 className="cal-proximos-titulo">PRÓXIMOS EVENTOS</h2>
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
                <div className="cal-proximos-lista">
                  {proximos.slice(0, 8).map((ev, idx) => {
                    const f = parsearFecha(ev.fecha);
                    return (
                      <div key={ev.id ?? idx} className="cal-proximos-item">
                        <span
                          className="cal-proximos-dot"
                          style={{ background: obtenerColorPorTipo(ev.tipo) }}
                        />
                        <div className="cal-proximos-info">
                          <span className="cal-proximos-nombre">{ev.nombre}</span>
                          <span className="cal-proximos-fecha">
                            {f.dia} de {MESES[f.mes]} de {f.anio} — {formatHora(ev.hora)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </section>

        </main>
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
    </div>
  );
}