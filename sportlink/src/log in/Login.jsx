import { supabase } from '../utils/supabase.js'
import { useState } from 'react'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')

  async function handleLogin() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('contraseña', contraseña)
      .single()

    if (error || !data) {
      alert('Email o contraseña incorrectos')
      return
    }

    onLogin(data)
  }

  return (
    <div>
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="Contraseña" 
        value={contraseña} 
        onChange={(e) => setContraseña(e.target.value)} 
      />
      <button onClick={handleLogin}>Ingresar</button>
    </div>
  )
}

export default Login