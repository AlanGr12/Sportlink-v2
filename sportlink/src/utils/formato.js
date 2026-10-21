// Formatos de texto compartidos por las vistas del nuevo diseño (pruebas, entrenamientos…)
import { parsearFechaLocal } from './dateUtils.js';

const PALABRAS_GENERICAS = new Set(['club', 'atlético', 'atletico', 'deportivo', 'social', 'y', 'de', 'la', 'los', 'el', 'del']);

// "Club Atlético Villa Celeste" → "VC" · "Lucas Quintana" → "LQ"
export const iniciales = (nombre = '') => {
  const palabras = String(nombre).split(/\s+/).filter(Boolean);
  const propias = palabras.filter((p) => !PALABRAS_GENERICAS.has(p.toLowerCase()));
  const base = propias.length ? propias : palabras;
  return (base.slice(0, 2).map((p) => p[0]).join('') || '?').toUpperCase();
};

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// "09:30:00" → "9:30" · "18:00:00" → "18"
export const horaCorta = (hora) => {
  if (!hora) return '';
  const [h, m] = String(hora).split(':').map(Number);
  if (isNaN(h)) return '';
  return m ? `${h}:${String(m).padStart(2, '0')}` : `${h}`;
};

// "Sábado 14 de noviembre, 9 h" (con rango si hay hora de fin)
export const fechaLarga = (fecha, horaInicio, horaFin) => {
  const f = fecha ? parsearFechaLocal(fecha) : null;
  if (!f || isNaN(f)) return 'A confirmar';
  const dia = `${DIAS_SEMANA[f.getDay()]} ${f.getDate()} de ${MESES[f.getMonth()]}`;
  const ini = horaCorta(horaInicio);
  const fin = horaCorta(horaFin);
  if (!ini) return dia;
  return fin ? `${dia}, ${ini} a ${fin} h` : `${dia}, ${ini} h`;
};

// 8000 → "$ 8.000" · vacío → null
export const precio = (valor) => {
  const n = Number(valor);
  if (!valor || isNaN(n) || n <= 0) return null;
  return `$ ${n.toLocaleString('es-AR')}`;
};
