/**
 * Utilidades para parsear y formatear fechas asegurando la zona horaria local.
 * Esto evita el problema donde strings 'YYYY-MM-DD' o 'YYYY-MM-DDT00:00:00.000Z'
 * se parsean como UTC y al mostrarse en zonas horarias negativas retroceden un día.
 */

/**
 * Convierte un string de fecha a un objeto Date en la zona horaria local.
 * @param {string} fechaStr Ej: "2026-09-04" o "2026-09-04T00:00:00.000Z"
 * @returns {Date | null} Objeto Date forzado a zona horaria local
 */
export function parsearFechaLocal(fechaStr) {
  if (!fechaStr) return null;
  // Extraemos únicamente la porción YYYY-MM-DD
  const datePart = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
  const [year, month, day] = datePart.split('-').map(Number);
  
  // new Date(year, monthIndex, day) fuerza la zona horaria local del navegador
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
