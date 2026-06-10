import { useState, useEffect } from 'react';
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

function getDiasDelMes(year, month) {
  // month: 0-indexed
  const primerDia = new Date(year, month, 1).getDay(); // 0=dom
  // convertir a lunes=0
  const offset = (primerDia === 0) ? 6 : primerDia - 1;
  const totalDias = new Date(year, month + 1, 0).getDate();
  return { offset, totalDias };
}

export default function Calendario(props) {
  const hoy = new Date();
  const [mesActual, setMesActual] = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const { offset, totalDias } = getDiasDelMes(anioActual, mesActual);

  const esHoy = (dia) =>
    dia === hoy.getDate() &&
    mesActual === hoy.getMonth() &&
    anioActual === hoy.getFullYear();

  const irMesAnterior = () => {
    if (mesActual === 0) { setMesActual(11); setAnioActual(a => a - 1); }
    else setMesActual(m => m - 1);
  };

  const irMesSiguiente = () => {
    if (mesActual === 11) { setMesActual(0); setAnioActual(a => a + 1); }
    else setMesActual(m => m + 1);
  };

  const handleDiaClick = (dia) => {
    setDiaSeleccionado(dia);
    setPanelAbierto(true);
  };

  const cerrarPanel = () => setPanelAbierto(false);

  // Construir celdas: vacias al inicio + dias del mes
  const totalCeldas = Math.ceil((offset + totalDias) / 7) * 7;
  const celdas = Array.from({ length: totalCeldas }, (_, i) => {
    const dia = i - offset + 1;
    return (dia >= 1 && dia <= totalDias) ? dia : null;
  });

  const nombreDiaSemana = (dia) => {
    const d = new Date(anioActual, mesActual, dia);
    return ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][d.getDay()];
  };

  return (
    <div className="cal-root">
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
                <span className="cal-mes-nombre">{MESES[mesActual].toUpperCase()}</span>{' '}
                <span className="cal-mes-anio">{anioActual}</span>
              </h1>
            </div>
            <div className="cal-nav-btns">
              <button className="cal-nav-btn" onClick={irMesAnterior}>‹</button>
              <button className="cal-nav-btn" onClick={irMesSiguiente}>›</button>
            </div>
          </div>

          {/* Grilla */}
          <div className="cal-grid-wrapper">
            {/* Cabecera días semana */}
            <div className="cal-grid-header">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="cal-dia-semana">{d}</div>
              ))}
            </div>

            {/* Celdas */}
            <div className="cal-grid">
              {celdas.map((dia, i) => (
                <div
                  key={i}
                  className={[
                    'cal-celda',
                    dia === null ? 'cal-celda--vacia' : '',
                    dia && esHoy(dia) ? 'cal-celda--hoy' : '',
                    dia && diaSeleccionado === dia ? 'cal-celda--seleccionada' : '',
                  ].join(' ')}
                  onClick={() => dia && handleDiaClick(dia)}
                >
                  {dia && (
                    <span className={`cal-celda-num ${esHoy(dia) ? 'cal-celda-num--hoy' : ''}`}>
                      {String(dia).padStart(2, '0')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Panel día seleccionado */}
          {panelAbierto && diaSeleccionado && (
            <div className="cal-panel-dia">
              <div className="cal-panel-header">
                <div>
                  <p className="cal-panel-fecha-label">
                    {nombreDiaSemana(diaSeleccionado)}, {diaSeleccionado} de {MESES[mesActual]} de {anioActual}
                  </p>
                  <h2 className="cal-panel-titulo">INFO DEL DÍA</h2>
                </div>
                <button className="cal-panel-cerrar" onClick={cerrarPanel}>✕</button>
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
