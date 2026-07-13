import { useState, useEffect } from 'react';
import axios from 'axios';
import Footer from '../footer/footer.jsx';
import ModalEvento from './ModalEvento.jsx';
import ModalDetallePrueba from './ModalDetallePrueba.jsx';
import './calendario.css';

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

function getDiasDelMes(year, month) {
  const primerDia = new Date(year, month, 1).getDay();
  const offset = (primerDia === 0) ? 6 : primerDia - 1;
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

const obtenerColorPorTipo = (tipo) => {
  switch (tipo?.toUpperCase()) {
    case 'PRUEBA':
      return '#23e7f5';
    case 'ENTRENAMIENTO':
      return '#3b82f6';
    case 'ENTREVISTA':
      return '#f59e0b';
    case 'PERSONALIZADO':
    default:
      return '#8b5cf6';
  }
};

export default function Calendario(props) {
  const usuario = props.usuario || JSON.parse(localStorage.getItem('usuario') || 'null');

  useEffect(() => {
    if (!usuario) props.cambiarVista('login');
  }, [usuario, props]);

  const hoy = new Date();
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [dropdownMes, setDropdownMes] = useState(false);
  const [dropdownAnio, setDropdownAnio] = useState(false);

  // ── Eventos almacenados ──────────────────────────────────────
  const [eventos, setEventos] = useState({});
  const [cargandoEventos, setCargandoEventos] = useState(false);

  // ── Modales ──────────────────────────────────────────────────
  const [modalTipo, setModalTipo] = useState(null); // 'libre' | 'diaBloqueado'
  const [pruebaDetalle, setPruebaDetalle] = useState(null); // Objeto de prueba para modal detalle
  const [cargandoPruebaDetalle, setCargandoPruebaDetalle] = useState(false);

  const abrirModalLibre = () => setModalTipo('libre');
  const abrirModalDia   = () => setModalTipo('diaBloqueado');
  const cerrarModal     = () => setModalTipo(null);

  const fechaInicialDia = diaSeleccionado
    ? { anio: anioActual, mes: mesActual, dia: diaSeleccionado }
    : null;

  // ── Cargar eventos del backend ───────────────────────────────
  useEffect(() => {
    if (!usuario) return;

    const cargarEventosYDetalles = async () => {
      setCargandoEventos(true);
      try {
        const userId = usuario.idusuario || usuario.id;
        const res = await axios.get('http://localhost:3000/api/calendario', {
          headers: { 'X-User-Id': userId }
        });

        const eventosMapeados = {};

        for (const e of res.data) {
          let fechaStr = e.fecha;
          if (fechaStr && fechaStr.includes('T')) {
            fechaStr = fechaStr.split('T')[0];
          }

          const ev = {
            id: e.idEvento,
            tipo: e.tipo, // 'PRUEBA', 'ENTRENAMIENTO', 'ENTREVISTA', 'PERSONALIZADO'
            fecha: fechaStr,
            hora: e.horaInicio ? e.horaInicio.slice(0, 5) : '',
            idPrueba: e.idPrueba,
            idEntrenamiento: e.idEntrenamiento,
            idInscripcionEmpleo: e.idInscripcionEmpleo,
            nombre: '',
            descripcion: '',
            imagenPreview: null,
            datosPrueba: null
          };

          // Cargar información extra según el tipo
          if (e.tipo === 'PRUEBA' && e.idPrueba) {
            try {
              const resP = await axios.get(`http://localhost:3000/api/pruebas/${e.idPrueba}`);
              const prueba = resP.data;
              ev.nombre = `Prueba: ${prueba.deporte?.deporte || 'Deporte'} en ${prueba.club?.nombre || 'Club'}`;
              ev.descripcion = prueba.descripcion;
              ev.imagenPreview = prueba.imagen;
              ev.datosPrueba = prueba;
            } catch (err) {
              console.error('Error al cargar detalle de prueba:', err);
              ev.nombre = 'Prueba Deportiva';
            }
          } else if (e.tipo === 'ENTRENAMIENTO' && e.idEntrenamiento) {
            try {
              const resE = await axios.get(`http://localhost:3000/api/entrenamientos/${e.idEntrenamiento}`);
              const entrenamiento = resE.data;
              ev.nombre = entrenamiento.titulo || 'Entrenamiento';
              ev.descripcion = entrenamiento.descripcion;
              ev.imagenPreview = entrenamiento.imagen;
            } catch (err) {
              console.error('Error al cargar detalle de entrenamiento:', err);
              ev.nombre = 'Entrenamiento';
            }
          } else if (e.tipo === 'PERSONALIZADO') {
            const meta = JSON.parse(localStorage.getItem('evento_meta_' + e.idEvento) || 'null');
            if (meta) {
              ev.nombre = meta.nombre;
              ev.descripcion = meta.descripcion;
              ev.imagenPreview = meta.imagenPreview;
            } else {
              ev.nombre = 'Evento Personalizado';
            }
          } else {
            ev.nombre = e.tipo || 'Evento';
          }

          if (!eventosMapeados[fechaStr]) {
            eventosMapeados[fechaStr] = [];
          }
          eventosMapeados[fechaStr].push(ev);
        }

        setEventos(eventosMapeados);
      } catch (err) {
        console.error('Error al obtener eventos del backend:', err);
      } finally {
        setCargandoEventos(false);
      }
    };

    cargarEventosYDetalles();
  }, [usuario]);

  // ── Guardar evento personalizado en el backend ───────────────
  const guardarEvento = async (evento) => {
    try {
      const userId = usuario.idusuario || usuario.id;
      const res = await axios.post('http://localhost:3000/api/calendario', {
        idusuario: userId,
        tipo: 'PERSONALIZADO',
        fecha: evento.fecha,
        horainicio: evento.hora,
        horafin: null,
        idprueba: null,
        identrenamiento: null,
        idinscripcionempleo: null
      });

      const backendEv = res.data;
      const idEvento = backendEv.idEvento || backendEv.idevento;

      // Persistir metadatos en localStorage
      localStorage.setItem('evento_meta_' + idEvento, JSON.stringify({
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        imagenPreview: evento.imagenPreview
      }));

      const nuevoEv = {
        id: idEvento,
        tipo: 'PERSONALIZADO',
        fecha: evento.fecha,
        hora: evento.hora,
        nombre: evento.nombre,
        descripcion: evento.descripcion,
        imagenPreview: evento.imagenPreview
      };

      setEventos(prev => {
        const lista = prev[evento.fecha] ? [...prev[evento.fecha]] : [];
        return { ...prev, [evento.fecha]: [...lista, nuevoEv] };
      });

      cerrarModal();
    } catch (err) {
      console.error('Error al crear evento en el servidor:', err);
    }
  };

  if (!usuario) return null;

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

  const claveDelDia = (dia) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${anioActual}-${pad(mesActual + 1)}-${pad(dia)}`;
  };

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
                const clave = dia ? claveDelDia(dia) : null;
                const evsDia = clave ? (eventos[clave] || []) : [];
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
                        {/* Chips de eventos en la celda */}
                        {evsDia.length > 0 && (
                          <div className="cal-celda-eventos">
                            {evsDia.slice(0, 3).map(ev => (
                              <div key={ev.id} className="cal-celda-evento-chip">
                                <span
                                  className="cal-celda-evento-dot"
                                  style={{ background: obtenerColorPorTipo(ev.tipo) }}
                                />
                                <span className="cal-celda-evento-nombre">{ev.nombre}</span>
                              </div>
                            ))}
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
                  Cargando eventos...
                </div>
              ) : eventosDelDia.length === 0 ? (
                <div className="cal-panel-vacio">
                  <p>No hay eventos para este día.</p>
                </div>
              ) : (
                <div className="cal-panel-eventos">
                  {eventosDelDia.map(ev => (
                    <div key={ev.id} className="cal-panel-evento">
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
                        <div className="cal-panel-evento-titulo-row">
                          <span
                            className="cal-panel-evento-dot"
                            style={{ background: obtenerColorPorTipo(ev.tipo) }}
                          />
                          <h3 className="cal-panel-evento-nombre">{ev.nombre}</h3>
                        </div>
                        <div className="cal-panel-evento-meta">
                          <span className="cal-panel-evento-meta-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {(() => { const f = parsearFecha(ev.fecha); return `${f.dia} de ${MESES[f.mes]} de ${f.anio}`; })()}
                          </span>
                          <span className="cal-panel-evento-meta-item">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {formatHora(ev.hora)}
                          </span>
                        </div>
                        {ev.descripcion && (
                          <p className="cal-panel-evento-desc">{ev.descripcion}</p>
                        )}
                        {/* Botón de Más Información para Pruebas Deportivas */}
                        {ev.tipo?.toUpperCase() === 'PRUEBA' && ev.datosPrueba && (
                          <div style={{ marginTop: '12px' }}>
                            <button
                              className="cal-panel-evento-btn"
                              onClick={() => setPruebaDetalle(ev.datosPrueba)}
                            >
                              MÁS INFORMACIÓN
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Próximos eventos */}
          <section className="cal-proximos">
            <h2 className="cal-proximos-titulo">PRÓXIMOS EVENTOS</h2>
            {(() => {
              const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
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
                  {proximos.slice(0, 8).map(ev => {
                    const f = parsearFecha(ev.fecha);
                    return (
                      <div key={ev.id} className="cal-proximos-item">
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

      {/* ── Modales ── */}
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

      {/* Modal Detalle de Prueba */}
      {pruebaDetalle && (
        <ModalDetallePrueba
          prueba={pruebaDetalle}
          loading={cargandoPruebaDetalle}
          onCerrar={() => setPruebaDetalle(null)}
          usuario={usuario}
        />
      )}
    </div>
  );
}