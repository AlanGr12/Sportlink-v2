/**
 * Utilidades para parsear y formatear fechas asegurando la zona horaria local y UTC.
 * Esto evita el problema donde strings 'YYYY-MM-DD' o 'YYYY-MM-DDT00:00:00.000'
 * se parsean con desfasaje UTC o local erróneo.
 */

/**
 * Convierte un string de fecha a un objeto Date en la zona horaria local.
 * @param {string} fechaStr Ej: "2026-09-04" o "2026-09-04T00:00:00.000Z"
 * @returns {Date | null} Objeto Date forzado a zona horaria local
 */
export function parsearFechaLocal(fechaStr) {
  if (!fechaStr) return null;
  const datePart = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formatea un string de fecha a un texto local sin sufrir desfase UTC.
 * @param {string} fechaStr Ej: "2026-09-04"
 * @param {object} opciones Opciones para toLocaleDateString
 * @returns {string} Fecha formateada
 */
export function formatearFechaLocal(fechaStr, opciones = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!fechaStr) return '';
  const date = parsearFechaLocal(fechaStr);
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-AR', opciones);
}

/**
 * Retorna la fecha actual local en formato 'YYYY-MM-DD'.
 * @returns {string}
 */
export function obtenerFechaHoyLocal() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Determina si una fecha (y opcionalmente hora de fin) ya pasó respecto al momento actual.
 */
export function haPasadoFecha(fechaStr, horaFinStr = null) {
  if (!fechaStr) return false;
  const hoyStr = obtenerFechaHoyLocal();
  const fechaLimpia = String(fechaStr).includes('T') ? fechaStr.split('T')[0] : String(fechaStr).substring(0, 10);

  if (fechaLimpia < hoyStr) return true;
  if (fechaLimpia > hoyStr) return false;

  if (horaFinStr) {
    const d = new Date();
    const horaActual = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const horaFin = String(horaFinStr).substring(0, 5);
    if (horaFin && horaFin < horaActual) {
      return true;
    }
  }

  return false;
}

/**
 * Convierte cualquier timestamp de DB/backend (ISO, SQL timestamp sin Z, etc)
 * asegurando la interpretación UTC correcta.
 */
export function parsearFechaUTC(fechaInput) {
  if (!fechaInput) return null;
  if (fechaInput instanceof Date) return isNaN(fechaInput.getTime()) ? null : fechaInput;
  if (typeof fechaInput === 'number') return new Date(fechaInput);

  let str = String(fechaInput).trim();
  if (!str) return null;

  // Si tiene formato SQL "YYYY-MM-DD HH:MM:SS", reemplazar espacio por T
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(str)) {
    str = str.replace(' ', 'T');
  }

  // Si no especifica zona horaria (sin 'Z' y sin offset '+00:00' o '-03:00'), asumimos UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str) && !str.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(str)) {
    str += 'Z';
  }

  const d = new Date(str);
  if (isNaN(d.getTime())) {
    const fallback = new Date(fechaInput);
    return isNaN(fallback.getTime()) ? null : fallback;
  }
  return d;
}

/**
 * Retorna el tiempo relativo formateado (ej: "ahora", "hace 5m", "hace 2h", "hace 3d").
 */
export function tiempoRelativo(fechaInput) {
  const d = parsearFechaUTC(fechaInput);
  if (!d) return '';

  const ahora = Date.now();
  const timestamp = d.getTime();
  let diff = (ahora - timestamp) / 1000; // diferencia en segundos

  // Si diff es negativo (desfasaje de reloj servidor/cliente o segundos)
  if (diff < 0) {
    if (diff > -180) { // Tolerancia de 3 minutos por desfasaje
      diff = 0;
    } else {
      return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    }
  }

  if (diff < 60) return 'ahora';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

/**
 * Formatea la fecha y hora completa en español (ej: "14:35 · 9 oct 2026").
 */
export function fechaCompleta(fechaInput) {
  const d = parsearFechaUTC(fechaInput);
  if (!d) return '';
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const fecha = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${hora} · ${fecha}`;
}
