import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../axiosConfig.js';
import ModalEvento from './ModalEvento.jsx';
import DetalleEmpleo from '../empleos/DetalleEmpleo.jsx';
import '../pruebas/PruebasView.css';
import './calendario.css';

const API = '/api';

// Referencias de color (el marcador de cada tipo está en calendario.css)
const CATEGORIAS = [
  { id: 'pruebas',        label: 'Pruebas',        tipo: 'prueba' },
  { id: 'entrenamientos', label: 'Entrenamientos', tipo: 'entrenamiento' },
  { id: 'entrevistas',    label: 'Entrevistas',    tipo: 'entrevista' },
  { id: 'personalizado',  label: 'Tuyos',          tipo: 'personalizado' },
];

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const DIAS_SEMANA = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

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

function padNum(n) {
  return String(n).padStart(2, '0');
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

  let color = e.color || null;
  let descripcionLimpia = e.descripcion || '';
  if (e.descripcion && e.descripcion.includes('[color:')) {
    const matchColor = e.descripcion.match(/\[color:(#[a-fA-F0-9]{6})\]/);
    if (matchColor) {
      color = matchColor[1];
      descripcionLimpia = e.descripcion.replace(/\[color:#[a-fA-F0-9]{6}\]/g, '').trim();
    }
  }

  return {
    id:              e.idEvento   || null,
    tipo:            (e.tipo || 'PERSONALIZADO').toUpperCase(),
    fecha:           fechaStr,
    hora:            e.horaInicio ? e.horaInicio.slice(0, 5) : '',
    idPrueba:        e.idPrueba        || null,
    idEntrenamiento: e.idEntrenamiento || null,
    idInscripcionEmpleo: e.idinscripcionempleo || null,
    nombre:          e.titulo     || '',
    descripcion:     descripcionLimpia,
    color:           color,
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

// Color del marcador: el que eligió el usuario (personalizados) o el del tipo.
// El blanco del selector viejo no se ve en modo claro: se usa la tinta del tema.
function colorMarcador(ev) {
  if (ev?.color && ev.color.toLowerCase() !== '#ffffff') return ev.color;
  return null;
}

const ETIQUETA_TIPO = { PRUEBA: 'Prueba', ENTRENAMIENTO: 'Entrenamiento', ENTREVISTA: 'Entrevista', EMPLEO: 'Empleo', PERSONALIZADO: 'Tuyo' };

// Eventos de un día ordenados por hora (los sin hora, al final)
const porHora = (lista = []) => [...lista].sort((a, b) => (a.hora || '99').localeCompare(b.hora || '99'));

function EventoCard({ ev, eliminando, onVerPrueba, onVerEntrenamiento, onVerEmpleo, onEditar, onEliminar }) {
  const tipo = ev.tipo?.toUpperCase() || 'PERSONALIZADO';
  const f = parsearFecha(ev.fecha);
  const color = colorMarcador(ev);

  return (
    <article className={`cal-evento cal-tipo--${tipo.toLowerCase()}${esEventoPasado(ev.fecha, ev.hora) ? ' is-pasado' : ''}`} style={color ? { '--cal-color': color } : undefined}>
      {ev.imagenPreview && <img src={ev.imagenPreview} alt="" className="cal-evento-img" loading="lazy" />}
      <div className="cal-evento-body">
        <span className="cal-evento-tipo">{ETIQUETA_TIPO[tipo] || 'Evento'}</span>
        <h3>{limpiarTitulo(ev.nombre)}</h3>
        <dl className="cal-evento-datos">
          <div><dt>Cuándo</dt><dd>{`${f.dia} de ${MESES[f.mes].toLowerCase()}`}{ev.hora ? `, ${ev.hora} h` : ''}</dd></div>
          {ev.creador && <div><dt>Organiza</dt><dd>{ev.creador}</dd></div>}
          {ev.ubicacion && <div><dt>Dónde</dt><dd>{ev.ubicacion}</dd></div>}
        </dl>
        {ev.descripcion && <p className="cal-evento-desc">{ev.descripcion}</p>}

        <div className="cal-evento-acciones">
          {tipo === 'PRUEBA' && (ev.datosPrueba || ev.idPrueba) && (
            <button type="button" className="pr-btn pr-btn--ink pr-btn--sm" onClick={() => onVerPrueba(ev)}>Ver prueba</button>
          )}
          {tipo === 'ENTRENAMIENTO' && (ev.datosEntrenamiento || ev.idEntrenamiento) && (
            <button type="button" className="pr-btn pr-btn--ink pr-btn--sm" onClick={() => onVerEntrenamiento(ev)}>Ver entrenamiento</button>
          )}
          {tipo === 'EMPLEO' && ev.datosEmpleo && (
            <button type="button" className="pr-btn pr-btn--ink pr-btn--sm" onClick={() => onVerEmpleo(ev.datosEmpleo)}>Ver empleo</button>
          )}
          {tipo === 'PERSONALIZADO' && ev.id && onEditar && onEliminar && (
            <>
              <button type="button" className="pr-link" onClick={() => onEditar(ev)}>Editar</button>
              <button type="button" className="pr-link pr-link--danger" onClick={() => onEliminar(ev)} disabled={eliminando}>
                {eliminando ? 'Eliminando…' : 'Eliminar'}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Calendario({ usuario }) {
  const navigate = useNavigate();


  useEffect(() => {
    if (!usuario) navigate('/login');
  }, [usuario]);

  const hoy = new Date();
  const [mesActual,       setMesActual]       = useState(hoy.getMonth());
  const [anioActual,      setAnioActual]       = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  // ── Estado de eventos ────────────────────────────────────────────────────
  const [eventos,         setEventos]         = useState({});   // { 'YYYY-MM-DD': [ev, ...] }
  const [cargandoEventos, setCargandoEventos] = useState(true);
  const [proximosVisibles, setProximosVisibles] = useState(8);
  const [infoVisibles, setInfoVisibles] = useState(3);
  // Hacia dónde se movió el mes (para que la grilla entre desde ese lado)
  const [mesDir, setMesDir] = useState('adelante');

  // La grilla ocupa el alto de la pantalla: en pantallas bajas entra un solo evento por celda
  const [chipsPorCelda, setChipsPorCelda] = useState(() => (window.innerHeight < 820 ? 1 : 2));
  useEffect(() => {
    const medir = () => setChipsPorCelda(window.innerHeight < 820 ? 1 : 2);
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  // ── Estado de modales ────────────────────────────────────────────────────
  // 'libre' | 'diaBloqueado' | 'editar' | null
  const [modalTipo,             setModalTipo]             = useState(null);
  const [eventoEditando,        setEventoEditando]        = useState(null);
  const [eventoAEliminar,       setEventoAEliminar]       = useState(null);
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
      const res = await api.get(`${API}/calendario`);

      // ── PASO 1: Mapear todos los eventos inmediatamente sin fetches adicionales ──
      // Esto permite que el calendario se renderice de forma instantánea.
      const eventosMapeados = {};
      const pendientesEnriquecer = []; // Eventos que necesitan fetch extra

      for (const e of res.data) {
        const ev = mapearEventoBackend(e);

        if (ev.tipo === 'PRUEBA') {
          if (!ev.nombre) ev.nombre = 'Prueba Deportiva';
          if (ev.datosPrueba) {
            ev.ubicacion = ev.datosPrueba.zona || ev.datosPrueba.club?.ubicacion || null;
            ev.creador   = ev.datosPrueba.club?.nombre || null;
          } else if (ev.idPrueba) {
            pendientesEnriquecer.push({ ev, tipo: 'PRUEBA' });
          }
        } else if (ev.tipo === 'ENTRENAMIENTO') {
          if (!ev.nombre) ev.nombre = 'Entrenamiento';
          if (ev.idEntrenamiento) {
            // Si el backend ya enriquece con _datosEntrenamiento, usarlo directamente
            if (ev.datosEntrenamiento) {
              ev.nombre        = ev.datosEntrenamiento.titulo || ev.nombre;
              ev.descripcion   = ev.datosEntrenamiento.descripcion || ev.descripcion;
              ev.imagenPreview = ev.datosEntrenamiento.imagen || ev.imagenPreview;
              ev.ubicacion     = ev.datosEntrenamiento.ubicacion || null;
            } else {
              pendientesEnriquecer.push({ ev, tipo: 'ENTRENAMIENTO' });
            }
          }
        } else if (ev.tipo === 'EMPLEO') {
          if (ev.idInscripcionEmpleo && !ev.datosEmpleo) {
            pendientesEnriquecer.push({ ev, tipo: 'EMPLEO' });
          }
        }

        if (!ev.fecha) continue;
        if (!eventosMapeados[ev.fecha]) eventosMapeados[ev.fecha] = [];
        eventosMapeados[ev.fecha].push(ev);
      }

      // ── PASO 2: Mostrar el calendario INMEDIATAMENTE con la info básica ──
      setEventos({ ...eventosMapeados });
      setCargandoEventos(false);

      // ── PASO 3: Enriquecer en paralelo en segundo plano ──
      if (pendientesEnriquecer.length > 0) {
        const enriquecer = pendientesEnriquecer.map(async ({ ev, tipo }) => {
          try {
            if (tipo === 'PRUEBA') {
              const resP = await api.get(`/api/pruebas/${ev.idPrueba}`);
              ev.datosPrueba = resP.data;
              ev.ubicacion   = ev.datosPrueba.zona || ev.datosPrueba.club?.ubicacion || null;
              ev.creador     = ev.datosPrueba.club?.nombre || null;
            } else if (tipo === 'ENTRENAMIENTO') {
              const resE = await api.get(`/api/entrenamientos/${ev.idEntrenamiento}`);
              const ent = resE.data;
              ev.nombre        = ent.titulo || ev.nombre;
              ev.descripcion   = ent.descripcion || ev.descripcion;
              ev.imagenPreview = ent.imagen || ev.imagenPreview;
              ev.ubicacion     = ent.ubicacion || null;
              ev.datosEntrenamiento = ent;
            } else if (tipo === 'EMPLEO') {
              const resE = await api.get(`/api/empleo/${ev.idInscripcionEmpleo}`);
              ev.datosEmpleo = resE.data;
            }
          } catch {
            // Enriquecimiento fallido: el evento ya se muestra con info básica, no pasa nada
          }
        });

        // Correr todos los fetches en paralelo y actualizar el estado una vez terminados
        await Promise.all(enriquecer);
        setEventos({ ...eventosMapeados });
      }

    } catch (err) {
      console.error('Error al obtener eventos del backend:', err);
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

      const descConColor = payload.color
        ? (payload.descripcion ? `${payload.descripcion} [color:${payload.color}]` : `[color:${payload.color}]`)
        : payload.descripcion;

      if (payload.id && modalTipo === 'editar') {
        // ── EDITAR ──
        const res = await api.put(`${API}/calendario/${payload.id}`, {
          fecha:       payload.fecha,
          horainicio:  payload.hora,
          titulo:      payload.nombre,
          descripcion: descConColor,
          imagen:      payload.imagenPreview,
        });

        const evActualizado = {
          ...eventoEditando,
          nombre:       payload.nombre,
          fecha:        payload.fecha,
          hora:         payload.hora,
          descripcion:  payload.descripcion,
          color:        payload.color || null,
          // Usar la URL pública del storage devuelta por el backend;
          // si no subió imagen nueva, mantener la anterior
          imagenPreview: res.data?.imagen ?? eventoEditando.imagenPreview,
        };

        // Si cambió la fecha, necesitamos mover el evento en el mapa
        reemplazarEventoLocal(evActualizado);
      } else {
        // ── CREAR ──
        const res = await api.post(`${API}/calendario`, {
          idusuario:   userId,
          tipo:        'PERSONALIZADO',
          fecha:       payload.fecha,
          horainicio:  payload.hora,
          horafin:     null,
          titulo:      payload.nombre,
          descripcion: descConColor,
          imagen:      payload.imagenPreview,
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
          color:        payload.color || null,
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
  const abrirConfirmacionEliminar = (ev) => {
    if (!ev?.id) return;
    setEventoAEliminar(ev);
  };

  const confirmarEliminacion = async () => {
    if (!eventoAEliminar?.id) return;

    const userId = resolverUserId(usuario);
    if (!userId) {
      alert('Error de sesión: no se pudo identificar al usuario.');
      return;
    }

    setEliminandoId(eventoAEliminar.id);
    try {
      await api.delete(`${API}/calendario/${eventoAEliminar.id}`);
      eliminarEventoLocal(eventoAEliminar.id, eventoAEliminar.fecha);
      setEventoAEliminar(null);
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
    setMesDir(nuevoMes < mesActual ? 'atras' : 'adelante');
    setMesActual(nuevoMes);
    setDiaSeleccionado(null);
  };

  const cambiarAnio = (nuevoAnio) => {
    setMesDir(nuevoAnio < anioActual ? 'atras' : 'adelante');
    setAnioActual(nuevoAnio);
    setDiaSeleccionado(null);
  };

  const irMesAnterior = () => {
    setMesDir('atras');
    setDiaSeleccionado(null);
    if (mesActual === 0) { setMesActual(11); setAnioActual(a => a - 1); }
    else setMesActual(m => m - 1);
  };

  const irMesSiguiente = () => {
    setMesDir('adelante');
    setDiaSeleccionado(null);
    if (mesActual === 11) { setMesActual(0); setAnioActual(a => a + 1); }
    else setMesActual(m => m + 1);
  };

  const handleDiaClick = (dia) => {
    setDiaSeleccionado(dia);
    setInfoVisibles(3);
  };

  const irAHoy = () => {
    const today = new Date();
    setMesDir(today.getFullYear() * 12 + today.getMonth() < anioActual * 12 + mesActual ? 'atras' : 'adelante');
    setMesActual(today.getMonth());
    setAnioActual(today.getFullYear());
    setDiaSeleccionado(today.getDate());
    setInfoVisibles(3);
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

  const eventosDelDia = diaSeleccionado ? porHora(eventos[claveDelDia(diaSeleccionado)]) : [];


  // ── Render ────────────────────────────────────────────────────────────────

  const hoyStr = `${hoy.getFullYear()}-${padNum(hoy.getMonth() + 1)}-${padNum(hoy.getDate())}`;
  const proximos = Object.entries(eventos)
    .filter(([fecha]) => fecha >= hoyStr)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([, evs]) => porHora(evs));

  // Ver prueba / entrenamiento: abren su detalle en las vistas nuevas (deep link)
  const verPrueba = (ev) => navigate(`/pruebas/${ev.idPrueba || ev.datosPrueba?.idprueba}`);
  const verEntrenamiento = (ev) => navigate(`/entrenamientos/${ev.idEntrenamiento || ev.datosEntrenamiento?.identrenamiento}`);

  const accionesCard = {
    onVerPrueba: verPrueba,
    onVerEntrenamiento: verEntrenamiento,
    onVerEmpleo: setEmpleoDetalle,
    onEditar: abrirEdicion,
    onEliminar: abrirConfirmacionEliminar,
  };

  const listaPaginada = (lista, visibles, setVisibles, inicial = 3) => (
    <>
      <div className="cal-lista">
        {lista.slice(0, visibles).map((ev, idx) => (
          <EventoCard key={ev.id ?? `${ev.fecha}-${idx}`} ev={ev} eliminando={eliminandoId === ev.id} {...accionesCard} />
        ))}
      </div>
      {(lista.length > visibles || visibles > inicial) && (
        <div className="cal-paginar">
          {lista.length > visibles && <button type="button" className="pr-link" onClick={() => setVisibles(v => v + 5)}>Ver más</button>}
          {visibles > inicial && <button type="button" className="pr-link" onClick={() => setVisibles(inicial)}>Mostrar menos</button>}
        </div>
      )}
    </>
  );

  return (
    <div className="pr cal">
      <h1 className="pr-sr">Calendario</h1>
      <section className="pr-wrap cal-layout">
        <div className="cal-main">
          <div className="cal-toolbar">
            <h2 key={`t-${anioActual}-${mesActual}`} className={`pr-display cal-mes cal-mes--${mesDir}`}>{MESES[mesActual]} <span>{anioActual}</span></h2>

            <div className="cal-toolbar-ctrl">
              <label className="pr-field cal-select">
                <span className="pr-sr">Mes</span>
                <select value={mesActual} onChange={(e) => cambiarMes(Number(e.target.value))}>
                  {MESES.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              </label>
              <label className="pr-field cal-select">
                <span className="pr-sr">Año</span>
                <select value={anioActual} onChange={(e) => cambiarAnio(Number(e.target.value))}>
                  {ANIOS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>
              <button type="button" className="pr-btn pr-btn--ghost pr-btn--sm" onClick={irAHoy}>Hoy</button>
              <button type="button" className="pr-arrow cal-arrow" onClick={irMesAnterior} aria-label="Mes anterior">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button type="button" className="pr-arrow cal-arrow" onClick={irMesSiguiente} aria-label="Mes siguiente">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>

          <ul className="cal-leyenda" aria-label="Referencias">
            {CATEGORIAS.map((cat) => <li key={cat.id} className={`cal-tipo--${cat.tipo}`}>{cat.label}</li>)}
          </ul>

          <div key={`g-${anioActual}-${mesActual}`} className={`cal-grid cal-grid--${mesDir}`} role="grid" aria-label={`${MESES[mesActual]} ${anioActual}`} aria-busy={cargandoEventos}>
            {DIAS_SEMANA.map((d) => <div key={d} className="cal-dia-semana" role="columnheader">{d}</div>)}
            {celdas.map((dia, i) => {
              if (!dia) return <div key={i} className="cal-celda cal-celda--vacia" aria-hidden="true" />;
              const clave = claveDelDia(dia);
              const evsDia = porHora(eventos[clave]);
              const seleccionada = diaSeleccionado === dia;
              return (
                <button
                  key={i}
                  type="button"
                  role="gridcell"
                  aria-selected={seleccionada}
                  aria-label={`${nombreDiaSemana(dia)} ${dia}${evsDia.length ? `, ${evsDia.length} ${evsDia.length === 1 ? 'evento' : 'eventos'}` : ''}`}
                  className={`cal-celda${seleccionada ? ' is-sel' : ''}${esHoy(dia) ? ' is-hoy' : ''}`}
                  onClick={() => handleDiaClick(dia)}
                >
                  <span className="cal-num">{dia}</span>
                  {cargandoEventos ? (
                    <span className="cal-chip cal-chip--skeleton" />
                  ) : evsDia.length > 0 && (
                    <span className="cal-chips">
                      {evsDia.slice(0, chipsPorCelda).map((ev, idx) => {
                        const color = colorMarcador(ev);
                        return (
                          <span
                            key={ev.id ?? `${clave}-${idx}`}
                            className={`cal-chip cal-tipo--${(ev.tipo || 'PERSONALIZADO').toLowerCase()}${esEventoPasado(ev.fecha, ev.hora) ? ' is-pasado' : ''}`}
                            style={color ? { '--cal-color': color } : undefined}
                          >
                            {ev.hora && <b>{ev.hora}</b>}
                            {limpiarTitulo(ev.nombre)}
                          </span>
                        );
                      })}
                      {evsDia.length > chipsPorCelda && <span className="cal-mas">+{evsDia.length - chipsPorCelda} más</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="cal-lado">
          <button type="button" className="pr-btn pr-btn--block cal-agregar" onClick={abrirModalLibre}>
            Agregar evento
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          </button>

          {/* Única zona con scroll de la vista: el día elegido y los próximos */}
          <div className="cal-lado-scroll">
          <section className="cal-bloque" aria-live="polite">
            <div className="cal-bloque-head">
              <h2 className="cal-bloque-titulo">
                {diaSeleccionado ? `${nombreDiaSemana(diaSeleccionado)} ${diaSeleccionado}` : 'Elegí un día'}
              </h2>
              {diaSeleccionado && (
                <button type="button" className="pr-link" onClick={abrirModalDia}>Agregar a este día</button>
              )}
            </div>
            <div key={diaSeleccionado ?? 'ninguno'} className="cal-dia-contenido">
            {!diaSeleccionado ? (
              <p className="pr-muted">Tocá un día del calendario para ver lo que tenés.</p>
            ) : cargandoEventos ? (
              <div className="cal-evento cal-evento--skeleton" />
            ) : eventosDelDia.length === 0 ? (
              <p className="pr-muted">No tenés nada agendado este día.</p>
            ) : listaPaginada(eventosDelDia, infoVisibles, setInfoVisibles)}
            </div>
          </section>

          <section className="cal-bloque">
            <div className="cal-bloque-head">
              <h2 className="cal-bloque-titulo">Próximos</h2>
            </div>
            {cargandoEventos ? (
              <><div className="cal-evento cal-evento--skeleton" /><div className="cal-evento cal-evento--skeleton" /></>
            ) : proximos.length === 0 ? (
              <p className="pr-muted">No tenés eventos próximos. Inscribite a una prueba o agendá algo propio.</p>
            ) : listaPaginada(proximos, proximosVisibles, setProximosVisibles, 8)}
          </section>
          </div>
        </aside>
      </section>

      {/* ── Crear / editar evento propio ── */}
      {modalTipo === 'libre' && (
        <ModalEvento onGuardar={guardarEvento} onCerrar={cerrarModal} fechaBloqueada={false} />
      )}
      {modalTipo === 'diaBloqueado' && (
        <ModalEvento onGuardar={guardarEvento} onCerrar={cerrarModal} fechaInicial={fechaInicialDia} fechaBloqueada={true} />
      )}
      {modalTipo === 'editar' && eventoEditando && (
        <ModalEvento onGuardar={guardarEvento} onCerrar={cerrarModal} eventoEditar={eventoEditando} fechaBloqueada={false} />
      )}

      {/* ── Detalle de empleo (la vista de empleos todavía no está migrada) ── */}
      {empleoDetalle && createPortal(
        <div className="pr-overlay" onClick={() => setEmpleoDetalle(null)}>
          <div className="pr-modal pr-modal--form" role="dialog" aria-modal="true" aria-labelledby="cal-empleo-titulo" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-head">
              <h2 id="cal-empleo-titulo" className="pr-modal-title">Oferta laboral</h2>
              <button type="button" className="pr-close" onClick={() => setEmpleoDetalle(null)} aria-label="Cerrar">×</button>
            </div>
            <div className="pr-modal-body cal-empleo">
              <DetalleEmpleo empleo={empleoDetalle} usuario={usuario} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Confirmar eliminación ── */}
      {eventoAEliminar && createPortal(
        <div className="pr-overlay" onClick={() => { if (!eliminandoId) setEventoAEliminar(null); }}>
          <div className="pr-modal pr-modal--sm" role="dialog" aria-modal="true" aria-labelledby="cal-borrar-titulo" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-head cal-modal-head">
              <h2 id="cal-borrar-titulo" className="pr-modal-title">¿Eliminar «{limpiarTitulo(eventoAEliminar.nombre)}»?</h2>
              <button type="button" className="pr-close" onClick={() => setEventoAEliminar(null)} aria-label="Cerrar" disabled={!!eliminandoId}>×</button>
            </div>
            <div className="pr-modal-body"><p className="pr-muted">Se borra de tu calendario. No se puede deshacer.</p></div>
            <div className="pr-modal-foot">
              <button type="button" className="pr-btn pr-btn--ghost" onClick={() => setEventoAEliminar(null)} disabled={!!eliminandoId}>Cancelar</button>
              <button type="button" className="pr-btn pr-btn--danger" onClick={confirmarEliminacion} disabled={!!eliminandoId}>
                {eliminandoId ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
