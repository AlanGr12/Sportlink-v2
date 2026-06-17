import { useState, useEffect } from 'react'; // Importamos useEffect
import Footer from '../footer/footer.jsx';
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

export default function Calendario(props) {
  // Detectar si está el usuario en props o en localStorage
  const usuario = props.usuario || JSON.parse(localStorage.getItem('usuario') || 'null');

  // Redirigir al login si no ha iniciado sesión
  useEffect(() => {
    if (!usuario) {
      props.cambiarVista('login');
    }
  }, [usuario, props]);

  const hoy = new Date();
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [dropdownMes, setDropdownMes] = useState(false);
  const [dropdownAnio, setDropdownAnio] = useState(false);

  // Si no hay usuario, retornamos null para que no renderice nada mientras redirige
  if (!usuario) return null;

  const { offset, totalDias } = getDiasDelMes(anioActual, mesActual);

  const esHoy = (dia) =>
    dia === hoy.getDate() &&
    mesActual === hoy.getMonth() &&
    anioActual === hoy.getFullYear();

  const cambiarMes = (nuevoMes) => {
    setMesActual(nuevoMes);
    setDiaSeleccionado(null); // fix 2
    setDropdownMes(false);
  };

  const cambiarAnio = (nuevoAnio) => {
    setAnioActual(nuevoAnio);
    setDiaSeleccionado(null); // fix 2
    setDropdownAnio(false);
  };

  const irMesAnterior = () => {
    setDiaSeleccionado(null); // fix 2
    if (mesActual === 0) { setMesActual(11); setAnioActual(a => a - 1); }
    else setMesActual(m => m - 1);
  };

  const irMesSiguiente = () => {
    setDiaSeleccionado(null); // fix 2
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

  // fix 1: seleccionado siempre gana sobre hoy
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
          <button className="cal-agregar-btn">
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
                {/* fix 5: dropdowns de mes y año */}
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
              {celdas.map((dia, i) => (
                <div
                  key={i}
                  className={clasesCelda(dia)}
                  onClick={() => dia && handleDiaClick(dia)}
                >
                  {dia && (
                    <span className={clasesNum(dia)}>
                      {String(dia).padStart(2, '0')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Panel día seleccionado - fix 4: sin botón de cerrar, + en su lugar */}
          {diaSeleccionado && (
            <div className="cal-panel-dia">
              <div className="cal-panel-header">
                <div>
                  <p className="cal-panel-fecha-label">
                    {nombreDiaSemana(diaSeleccionado)}, {diaSeleccionado} de {MESES[mesActual]} de {anioActual}
                  </p>
                  <h2 className="cal-panel-titulo">INFO DEL DÍA</h2>
                </div>
                <button className="cal-panel-agregar">+</button>
              </div>
              <div className="cal-panel-vacio">
                <p>No hay eventos para este día.</p>
              </div>
            </div>
          )}

          {/* Próximos eventos */}
          <section className="cal-proximos">
            <h2 className="cal-proximos-titulo">PRÓXIMOS EVENTOS</h2>
            <div className="cal-proximos-vacio">
              <p>No hay próximos eventos programados actualmente.</p>
            </div>
          </section>

        </main>
      </div>

      <Footer />
    </div>
  );
}