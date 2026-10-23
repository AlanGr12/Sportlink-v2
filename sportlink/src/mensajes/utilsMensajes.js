// Datos compartidos por la lista y el panel de mensajes

export const ROLES = { jugador: 'Jugador', entrenador: 'Entrenador', club: 'Club', grupo: 'Grupo' }

export const detallesContacto = (c) => (
  (c.tipo || 'PRIVADA').toUpperCase() === 'PRIVADA'
    ? { nombre: c.otroParticipante?.nombre || 'Usuario desconocido', foto: c.otroParticipante?.fotoperfil || null, rol: c.otroParticipante?.tipousuario || '' }
    : { nombre: c.nombre || 'Grupo', foto: c.foto || null, rol: 'grupo' }
)
