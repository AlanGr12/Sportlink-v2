/**
 * Utilidades para geolocalización, mapas y formateo de direcciones de Nominatim / OpenStreetMap
 */

/**
 * Parsea y sintetiza una dirección larga de Nominatim a un formato conciso y legible:
 * Ejemplos:
 * - "Club Comunicaciones, 5125, Avenida San Martín, Agronomía, Buenos Aires, Comuna 15, Ciudad Autónoma de Buenos Aires, C1417, Argentina"
 *   -> "Club Comunicaciones, Agronomía"
 * - "Avenida San Martín, 5125, Agronomía, Buenos Aires, Comuna 15, Argentina"
 *   -> "Av. San Martín 5125, Agronomía"
 * - "Agronomía, Buenos Aires"
 *   -> "Agronomía, Buenos Aires"
 */
export function formatearUbicacionCorta(direccion) {
  if (!direccion || typeof direccion !== 'string') return '';
  
  const partes = direccion.split(',').map((p) => p.trim()).filter(Boolean);
  if (partes.length <= 2) return direccion.trim();

  // Filtrar partes redundantes típicas de Nominatim en Argentina (país, códigos postales, comuna)
  const partesFiltradas = partes.filter((p) => {
    const pl = p.toLowerCase();
    if (pl === 'argentina') return false;
    if (/^[a-z]?\d{4}[a-z]?$/i.test(p)) return false; // Código postal tipo C1417 o 1417
    if (/^comuna\s+\d+/i.test(p)) return false; // Comuna 15
    return true;
  });

  if (partesFiltradas.length <= 2) {
    return partesFiltradas.join(', ');
  }

  // Caso Nominatim: [Nombre Lugar/Club, Altura numérico, Calle, Barrio, ...]
  if (/^\d+$/.test(partesFiltradas[1])) {
    const lugar = partesFiltradas[0];
    const altura = partesFiltradas[1];
    const calle = partesFiltradas[2] || '';
    const barrio = partesFiltradas[3] || partesFiltradas[4] || '';

    // Si el lugar no empieza con "calle", "avenida", etc., es un venue/club:
    if (!/^(calle|av|avenida|pasaje|bv|bulevar)/i.test(lugar)) {
      return barrio ? `${lugar}, ${barrio}` : `${lugar}, ${calle} ${altura}`.trim();
    } else {
      // Normalizar prefijo de calle/avenida
      const calleNormalizada = lugar.replace(/^Avenida\b/i, 'Av.');
      return barrio ? `${calleNormalizada} ${altura}, ${barrio}` : `${calleNormalizada} ${altura}`;
    }
  }

  // Si la primera parte empieza con calle/avenida y la segunda es altura:
  if (/^\d+$/.test(partesFiltradas[1]) || /^\d+$/.test(partesFiltradas[0].split(' ').pop())) {
    return `${partesFiltradas[0]}, ${partesFiltradas[1]}`;
  }

  // Por defecto: tomar los 2 primeros elementos significativos (ej: [Lugar/Calle, Barrio])
  return `${partesFiltradas[0]}, ${partesFiltradas[1]}`;
}
