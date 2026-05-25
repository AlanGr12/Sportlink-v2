import { supabase } from '../utils/supabase.js'
import { useState } from 'react'
import './login.css'
import logoSportlink from '../assets/logoSportlink.png'
import Header from '../header/header.jsx'
import Footer from '../footer/footer.jsx'

function Login({ onLogin, onRegistro }) {
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

    <>
    <Header />
    <div className="pagina">
    <img src={logoSportlink} alt="Sportlink" className="logo" />
      <div className="tarjeta">
       
        <h1 className="titulo">¡Bienvenido de vuelta!</h1>
        <p className="subtitulo">Inicio de sesión.</p>


        <label className="etiqueta">EMAIL</label>
        <input
          className="campo"
          type="email"
          placeholder="user@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />


        <label className="etiqueta">CONTRASEÑA</label>
        <input
          className="campo"
          type="password"
          placeholder="••••••••"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
        />


        <button className="boton" onClick={handleLogin}>
          INICIAR SESIÓN
        </button>


        <p className="pie">
          No tenés cuenta?{' '}
      <a className="enlace" onClick={onRegistro} style={{ cursor: 'pointer' }}>
    Registrate
  </a>
        </p>
        <a className="enlace-secundario" href="/recuperar">
          TE OLVIDASTE LA CONTRASEÑA?
        </a>
      </div>
    </div>
    <Footer />
    </>
  )
}



export default Login