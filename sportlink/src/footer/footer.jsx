import { Link } from 'react-router-dom';
import './footer.css';
import logoSportlink from '../assets/logoSportlink.png';

// Footer compartido: una franja "tinta" baja que usa el ancho de la página.
// Arriba: marca y navegación en una fila. Abajo: copyright y contacto.
const LINKS = [
  ['/pruebas', 'Pruebas'],
  ['/entrenamientos', 'Entrenamientos'],
  ['/clubes', 'Clubes'],
  ['/entrenadores', 'Entrenadores'],
  ['/calendario', 'Calendario'],
  ['/info', 'Qué es SportLink'],
];

const Footer = () => (
  <footer className="footer">
    <div className="footer-wrap">
      <div className="footer-fila">
        <div className="footer-marca">
          <Link to="/landing" aria-label="SportLink, ir al inicio">
            <img className="footer-logo" src={logoSportlink} alt="SportLink" />
          </Link>
          <p>La red profesional del deporte.</p>
        </div>

        <nav className="footer-nav" aria-label="Secciones">
          {LINKS.map(([ruta, texto]) => <Link key={ruta} to={ruta}>{texto}</Link>)}
        </nav>

      </div>

      <div className="footer-pie">
        <p className="footer-copy">© {new Date().getFullYear()} SportLink</p>
        <ul className="footer-contacto" aria-label="Contacto">
          <li><a href="mailto:sportlink.ar@gmail.com">sportlink.ar@gmail.com</a></li>
          <li><a href="https://instagram.com/sportlink.ar" target="_blank" rel="noopener noreferrer">Instagram</a></li>
        </ul>
      </div>
    </div>
  </footer>
);

export default Footer;
