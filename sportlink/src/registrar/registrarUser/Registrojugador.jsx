import { useState } from 'react'
import { supabase } from '../../utils/supabase.js'

function RegistroJugador({ onRegistro }) {
  const [form, setForm] = useState({
    email: '',
    contraseña: '',
    nombre: '',
    apellido: '',
    iddeporte: ''
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleRegistro() {
    // 1. Insert en usuarios
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .insert({ 
        email: form.email, 
        contraseña: form.contraseña, 
        tipousuario: 'jugador' 
      })
      .select()
      .single()

    if (errorUsuario) {
      alert('Error al crear usuario: ' + errorUsuario.message)
      return
    }

    // 2. Insert en jugadores
    const { error: errorJugador } = await supabase
      .from('jugadores')
      .insert({ 
        idusuario: usuario.idusuario, 
        nombre: form.nombre, 
        apellido: form.apellido, 
        iddeporte: parseInt(form.iddeporte)
      })

    if (errorJugador) {
      alert('Error al crear jugador: ' + errorJugador.message)
      return
    }

    onRegistro(usuario)
  }

  return (
    <div>
      <h2>Registro Jugador</h2>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <input name="contraseña" type="password" placeholder="Contraseña" value={form.contraseña} onChange={handleChange} />
      <input name="nombre" type="text" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
      <input name="apellido" type="text" placeholder="Apellido" value={form.apellido} onChange={handleChange} />
      <input name="iddeporte" type="number" placeholder="ID Deporte" value={form.iddeporte} onChange={handleChange} />
      <button onClick={handleRegistro}>Registrarse</button>
    </div>
  )
}

export default RegistroJugador