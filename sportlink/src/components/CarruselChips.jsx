import { useEffect, useRef, useState } from 'react';

/**
 * Fila de chips con flechas a los costados en lugar de barra de scroll.
 * Las flechas avanzan/retroceden ~80% del ancho visible y solo aparecen
 * cuando los chips no entran. Estilos: .pr-chips-nav / .pr-chips / .pr-arrow
 * (src/pruebas/PruebasView.css).
 */
const CarruselChips = ({ ariaLabel, children, deps = [] }) => {
  const ref = useRef(null);
  const [flechas, setFlechas] = useState({ izq: false, der: false });

  const actualizar = () => {
    const el = ref.current;
    if (!el) return;
    setFlechas({
      izq: el.scrollLeft > 2,
      der: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
  };

  const mover = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  useEffect(() => {
    actualizar();
    window.addEventListener('resize', actualizar);
    return () => window.removeEventListener('resize', actualizar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return (
    <div className={`pr-chips-nav${flechas.izq || flechas.der ? ' has-arrows' : ''}`}>
      <button type="button" className="pr-arrow" onClick={() => mover(-1)} disabled={!flechas.izq} aria-label="Ver opciones anteriores">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M15 5l-7 7 7 7" strokeLinecap="square" /></svg>
      </button>
      <div className="pr-chips" role="group" aria-label={ariaLabel} ref={ref} onScroll={actualizar}>
        {children}
      </div>
      <button type="button" className="pr-arrow" onClick={() => mover(1)} disabled={!flechas.der} aria-label="Ver más opciones">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M9 5l7 7-7 7" strokeLinecap="square" /></svg>
      </button>
    </div>
  );
};

export default CarruselChips;
