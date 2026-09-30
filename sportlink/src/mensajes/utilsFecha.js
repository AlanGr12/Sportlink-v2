/**
 * utilsFecha.js
 * Utilidades para el manejo y formateo de fechas y horas en el módulo de chat / mensajes de SportLink.
 * 
 * Regla de negocio:
 * - Timestamps se almacenan y transmiten en UTC puro (ISO 8601 con 'Z').
 * - Al renderizar en pantalla, se interpretan siempre como UTC y se formatean
 *   específicamente en la zona horaria de Argentina (America/Argentina/Buenos_Aires).
 */

/**
 * Parsea una cadena de fecha garantizando que se interprete en UTC si carece de indicador de zona.
 * @param {string|Date|number} fechaString 
 * @returns {Date|null}
 */
export function parsearFechaUtc(fechaString) {
  if (!fechaString) return null

  if (fechaString instanceof Date) {
    return isNaN(fechaString.getTime()) ? null : fechaString
  }

  let fechaUtc = fechaString
  if (typeof fechaString === 'string') {
    const trimmed = fechaString.trim()
    // Si la cadena no trae indicador de zona horaria (sin 'Z' ni '+/-'), asumimos UTC puro
    if (!trimmed.endsWith('Z') && !trimmed.includes('+')) {
      fechaUtc = `${trimmed.replace(' ', 'T')}Z`
    } else {
      fechaUtc = trimmed.replace(' ', 'T')
    }
  }

  const fecha = new Date(fechaUtc)
  return isNaN(fecha.getTime()) ? null : fecha
}

/**
 * Formatea la hora de un mensaje forzando la zona horaria de Argentina (UTC-3).
 * Formato 24hs: 'HH:mm' (ej: '14:30', '09:05').
 * @param {string|Date} fechaString 
 * @returns {string}
 */
export function formatearHoraMensaje(fechaString) {
  if (!fechaString) return ''

  // Si la cadena no trae indicador de zona horaria (sin 'Z' ni '+/-'), asumimos UTC
  let fechaUtc = fechaString
  if (typeof fechaString === 'string') {
    const trimmed = fechaString.trim()
    if (!trimmed.endsWith('Z') && !trimmed.includes('+')) {
      fechaUtc = `${trimmed.replace(' ', 'T')}Z`
    } else {
      fechaUtc = trimmed.replace(' ', 'T')
    }
  }

  const fecha = new Date(fechaUtc)
  if (isNaN(fecha.getTime())) return ''

  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(fecha)
}

/**
 * Retorna la etiqueta para el separador de mensajes en el chat: 'HOY', 'AYER' o 'D DE MES [DE AÑO]'.
 * Considera la fecha calendario en la zona horaria de Argentina.
 * @param {string|Date} fechaString 
 * @returns {string}
 */
export function etiquetaFecha(fechaString) {
  const date = parsearFechaUtc(fechaString)
  if (!date) return ''

  const tz = 'America/Argentina/Buenos_Aires'
  const ahora = new Date()

  // Helper para extraer YYYY-MM-DD en zona horaria de Argentina
  const obtenerClaveDia = (d) => {
    const parts = new Intl.DateTimeFormat('es-AR', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(d)
    const y = parts.find(p => p.type === 'year')?.value
    const m = parts.find(p => p.type === 'month')?.value
    const dia = parts.find(p => p.type === 'day')?.value
    return `${y}-${m}-${dia}`
  }

  const claveMensaje = obtenerClaveDia(date)
  const claveHoy = obtenerClaveDia(ahora)

  const ayer = new Date(ahora.getTime() - 24 * 60 * 60 * 1000)
  const claveAyer = obtenerClaveDia(ayer)

  if (claveMensaje === claveHoy) return 'HOY'
  if (claveMensaje === claveAyer) return 'AYER'

  // Para otras fechas, mostrar 'D DE MES' o 'D DE MES DE YYYY'
  const partesMsg = new Intl.DateTimeFormat('es-AR', {
    timeZone: tz,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).formatToParts(date)

  const dia = partesMsg.find(p => p.type === 'day')?.value || ''
  const mes = partesMsg.find(p => p.type === 'month')?.value || ''
  const anio = partesMsg.find(p => p.type === 'year')?.value || ''

  const anioActual = new Intl.DateTimeFormat('es-AR', { timeZone: tz, year: 'numeric' }).format(ahora)

  if (anio === anioActual) {
    return `${dia} DE ${mes}`.toUpperCase()
  }
  return `${dia} DE ${mes} DE ${anio}`.toUpperCase()
}

/**
 * Formatea la fecha para el preview en la lista de conversaciones (Sidebar).
 * - Si es hoy: muestra la hora en formato 'HH:mm'.
 * - Si es ayer: muestra 'Ayer'.
 * - Si es de esta semana: muestra el día ('Lun', 'Mar', etc.).
 * - Si es más antiguo: muestra 'DD/MM/AAAA'.
 * @param {string|Date} fechaString 
 * @returns {string}
 */
export function formatearFechaRelativa(fechaString) {
  if (!fechaString) return ''
  const date = parsearFechaUtc(fechaString)
  if (!date) return ''

  const tz = 'America/Argentina/Buenos_Aires'
  const ahora = new Date()

  const obtenerClaveDia = (d) => {
    const parts = new Intl.DateTimeFormat('es-AR', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(d)
    const y = parts.find(p => p.type === 'year')?.value
    const m = parts.find(p => p.type === 'month')?.value
    const dia = parts.find(p => p.type === 'day')?.value
    return `${y}-${m}-${dia}`
  }

  const claveMensaje = obtenerClaveDia(date)
  const claveHoy = obtenerClaveDia(ahora)

  if (claveMensaje === claveHoy) {
    return formatearHoraMensaje(fechaString)
  }

  const ayer = new Date(ahora.getTime() - 24 * 60 * 60 * 1000)
  const claveAyer = obtenerClaveDia(ayer)
  if (claveMensaje === claveAyer) return 'Ayer'

  const diffMs = ahora.getTime() - date.getTime()
  const diffDias = diffMs / (1000 * 60 * 60 * 24)

  if (diffDias < 7) {
    const diaSemana = new Intl.DateTimeFormat('es-AR', {
      timeZone: tz,
      weekday: 'short'
    }).format(date)
    return diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1).replace('.', '')
  }

  return new Intl.DateTimeFormat('es-AR', {
    timeZone: tz,
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).format(date)
}
