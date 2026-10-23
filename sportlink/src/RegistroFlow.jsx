import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import Registrar from './registrar/registrar.jsx'
import RegistroJugador from './registrar/registrarUser/RegistrojugadorPASO3.jsx'
import RegistroEntrenador from './registrar/registrarUser/Registroentrenador.jsx'
import RegistroClub from './registrar/registrarUser/Registroclub.jsx'
import fotoJugador from './assets/futbol-femenino.jpg'
import fotoEntrenador from './assets/entrenador-cancha.jpg'
import fotoClub from './assets/riestra.png'
import './pruebas/PruebasView.css'
import './log in/Auth.css'

// Registro en 3 pasos: 1) rol · 2) email y contraseña · 3) datos del rol.
// Las fotos y los textos de cada rol son los mismos del hero de la landing.
const ROLES = [
  { id: 'jugador', nombre: 'Jugador', desc: 'Mostrá tu juego y llegá a los clubes.', foto: fotoJugador, pos: '50% 42%', alt: 'Dos jugadoras disputan la pelota en un partido de fútbol femenino amateur' },
  { id: 'entrenador', nombre: 'Entrenador', desc: 'Llená tus grupos y sumate a un cuerpo técnico.', foto: fotoEntrenador, pos: '50% 55%', alt: 'Un entrenador da indicaciones a un equipo infantil en una cancha de césped sintético' },
  { id: 'club', nombre: 'Club', desc: 'Encontrá talento y armá tu staff técnico.', foto: fotoClub, pos: '52% 50%', alt: 'Cancha de césped y bancos de suplentes de la sede del Deportivo Riestra' },
]

const TITULOS = {
  1: { titulo: 'Sumate a la cancha.', lead: 'Primero contanos cómo vas a usar SportLink.' },
  2: { titulo: 'Creá tu cuenta.', lead: 'Con este email y contraseña vas a ingresar.' },
}

const Flecha = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
)

function RegistroFlow({ onRegistro }) {
  const navigate = useNavigate()
  const location = useLocation()
  // Si viene de "Registrarse como …" en la landing, el rol ya está elegido
  const rolInicial = ROLES.some((r) => r.id === location.state?.rol) ? location.state.rol : null
  const [paso, setPaso] = useState(rolInicial ? 2 : 1)
  const [rol, setRol] = useState(rolInicial)
  const [datosBase, setDatosBase] = useState(null)
  // Transiciones entre pasos: dirección del movimiento y salida de la foto (paso 2 → 3)
  const [dir, setDir] = useState('adelante')
  const [saliendo, setSaliendo] = useState(false)
  const timerSalida = useRef(null)
  useEffect(() => () => clearTimeout(timerSalida.current), [])

  const irA = (n) => {
    if (saliendo) return
    setDir(n > paso ? 'adelante' : 'atras')
    const sinMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (paso === 2 && n === 3 && !sinMovimiento) {
      // La foto se va con una cortina y el formulario se desvanece; después entra el paso 3
      setSaliendo(true)
      timerSalida.current = setTimeout(() => { setPaso(3); setSaliendo(false) }, 480)
      return
    }
    setPaso(n)
  }

  const rolData = ROLES.find((r) => r.id === rol) || ROLES[0]
  const alRegistrar = (user) => {
    if (onRegistro) onRegistro(user)
    navigate('/')
  }

  const titulo = paso === 3
    ? { titulo: `Tu perfil de ${rolData.nombre.toLowerCase()}.`, lead: 'Con estos datos te encuentran clubes, entrenadores y jugadores.' }
    : TITULOS[paso]

  return (
    <div className="pr au">
      <div className={`au-grid${paso === 3 ? ' au-grid--paso3' : ''}`}>
        <div className={`au-col${paso === 3 ? ' au-col--arriba au-paso3' : ''}${saliendo ? ' is-saliendo' : ''}`}>
          <div className="au-col-inner">
            <div className="au-pasos">
              <ol aria-hidden="true">
                {[1, 2, 3].map((n) => <li key={n} className={n < paso ? 'is-hecho' : n === paso ? 'is-actual' : ''} />)}
              </ol>
              <p>Paso <strong>{paso}</strong> de 3</p>
            </div>

            <div key={paso} className={`au-paso au-paso--${dir}`}>
            {paso > 1 && (
              <div className="au-volver">
                <button type="button" className="pr-link" onClick={() => irA(paso - 1)}>
                  ← {paso === 2 ? 'Cambiar de rol' : 'Volver a la cuenta'}
                </button>
              </div>
            )}

            <h1 className="pr-display au-titulo">{titulo.titulo}</h1>
            <p className="au-lead">{titulo.lead}</p>

            {paso === 1 && (
              <>
                <div className="au-roles" role="radiogroup" aria-label="Elegí tu rol">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      role="radio"
                      aria-checked={rol === r.id}
                      className={`au-rol${rol === r.id ? ' is-on' : ''}`}
                      onClick={() => setRol(r.id)}
                      onDoubleClick={() => { setRol(r.id); irA(2) }}
                    >
                      <span>
                        <strong>{r.nombre}</strong>
                        <span className="au-rol-desc">{r.desc}</span>
                      </span>
                      <Flecha />
                    </button>
                  ))}
                </div>
                <button type="button" className="pr-btn pr-btn--block" disabled={!rol} onClick={() => irA(2)}>
                  {rol ? `Seguir como ${rolData.nombre.toLowerCase()}` : 'Elegí un rol para seguir'}
                </button>
              </>
            )}

            {paso === 2 && (
              <Registrar
                datosIniciales={datosBase || {}}
                onSiguiente={(datos) => { setDatosBase(datos); irA(3) }}
              />
            )}

            {paso === 3 && rol === 'jugador' && <RegistroJugador datosBase={datosBase} onRegistro={alRegistrar} />}
            {paso === 3 && rol === 'entrenador' && <RegistroEntrenador datosBase={datosBase} onRegistro={alRegistrar} />}
            {paso === 3 && rol === 'club' && <RegistroClub datosBase={datosBase} />}

            {paso < 3 && (
              <p className="au-pie">¿Ya tenés cuenta? <Link className="pr-link" to="/login">Ingresá</Link></p>
            )}
            </div>
          </div>
        </div>

        {/* En el paso 3 la foto se saca: el formulario usa todo el ancho */}
        {(paso < 3 || saliendo) && (
        <figure className={`au-media${saliendo ? ' is-saliendo' : ''}${dir === 'atras' && paso === 2 ? ' is-volviendo' : ''}`}>
          <div className="au-media-frame">
            <img key={rolData.id} src={rolData.foto} alt={rolData.alt} style={{ objectPosition: rolData.pos }} />
          </div>
        </figure>
        )}
      </div>
    </div>
  )
}

export default RegistroFlow
