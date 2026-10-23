// Datos compartidos por los formularios del registro (paso 3)

export const BARRIOS = [
  'Agronomía', 'Almagro', 'Balvanera', 'Barracas', 'Belgrano', 'Boedo',
  'Caballito', 'Chacarita', 'Coghlan', 'Colegiales', 'Constitución',
  'Flores', 'Floresta', 'La Boca', 'La Paternal', 'Liniers',
  'Mataderos', 'Monte Castro', 'Monserrat', 'Nueva Pompeya', 'Núñez',
  'Palermo', 'Parque Avellaneda', 'Parque Chacabuco', 'Parque Chas',
  'Parque Patricios', 'Puerto Madero', 'Recoleta', 'Retiro',
  'Saavedra', 'San Cristóbal', 'San Telmo', 'Vélez Sarsfield',
  'Versalles', 'Villa Crespo', 'Villa del Parque', 'Villa Devoto',
  'Villa Luro', 'Villa Urquiza', 'Zonas Norte GBA', 'Zona Sur GBA', 'Zona Oeste GBA',
]

// Los id coinciden con la tabla de deportes del backend
export const DEPORTES = [
  { id: 1, nombre: 'Fútbol' },
  { id: 2, nombre: 'Basket' },
  { id: 3, nombre: 'Tenis' },
  { id: 4, nombre: 'Voley' },
  { id: 5, nombre: 'Pádel' },
  { id: 6, nombre: 'Rugby' },
  { id: 7, nombre: 'Hockey' },
  { id: 8, nombre: 'Natación' },
  { id: 9, nombre: 'Atletismo' },
  { id: 10, nombre: 'Ciclismo' },
  { id: 11, nombre: 'Boxeo' },
  { id: 12, nombre: 'Artes Marciales' },
  { id: 13, nombre: 'Handball' },
  { id: 14, nombre: 'Béisbol' },
  { id: 15, nombre: 'Golf' },
]

export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
export const DIAS = Array.from({ length: 31 }, (_, i) => i + 1)
export const ANIOS = Array.from({ length: new Date().getFullYear() - 1940 + 1 }, (_, i) => new Date().getFullYear() - i)

// { dia, mes (nombre), anio } → 'YYYY-MM-DD' (o '' si falta algo)
export const fechaISO = ({ dia, mes, anio }) => {
  if (!dia || !mes || !anio) return ''
  return `${anio}-${String(MESES.indexOf(mes) + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}
