// Datos compartidos por los componentes del feed nuevo

export const ROLES = { jugador: 'Jugador', entrenador: 'Entrenador', club: 'Club' }

export const fechaDePost = (p) => p.createdat || p.created_at || p.createdAt || p.fecha_creacion || p.fechacreacion
