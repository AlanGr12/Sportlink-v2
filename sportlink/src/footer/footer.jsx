import { Link } from 'react-router-dom';
import './footer.css';
import logoSportlink from '../assets/logoSportlink.png';

// Footer compartido: sección "tinta" con la marca a la izquierda y los links
// agrupados en columnas con título (Explorar, Legales, Contacto). Abajo, el copyright.
const COLUMNAS = [
  {
    id: 'explorar',
    titulo: 'Explorar',
    links: [
      ['/pruebas', 'Pruebas'],
      ['/entrenamientos', 'Entrenamientos'],
      ['/clubes', 'Clubes'],
      ['/entrenadores', 'Entrenadores'],
      ['/calendario', 'Calendario'],
      ['/info', 'Qué es SportLink'],
    ],
  },
  {
    id: 'legales',
    titulo: 'Legales',
    links: [
      ['/legal/privacidad', 'Privacidad'],
      ['/legal/terminos', 'Términos'],
      ['/legal/cookies', 'Cookies'],
      ['/legal/reembolsos', 'Pagos y reembolsos'],
    ],
  },
];

const Footer = () => (
  <footer className="footer">
    <div className="footer-wrap">
      <div className="footer-grid">
        <div className="footer-marca">
          <Link to="/landing" className="footer-logo-link" aria-label="SportLink, ir al inicio">
            <img className="footer-logo" src={logoSportlink} alt="SportLink" />
          </Link>
          <p>La red profesional del deporte.</p>
        </div>

        {COLUMNAS.map((col) => (
          <nav key={col.id} className="footer-col" aria-labelledby={`footer-${col.id}`}>
            <p id={`footer-${col.id}`} className="footer-titulo">{col.titulo}</p>
            <ul>
              {col.links.map(([ruta, texto]) => (
                <li key={ruta}><Link to={ruta}>{texto}</Link></li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="footer-col">
          <p id="footer-contacto" className="footer-titulo">Contacto</p>
          <ul>
            <li><a href="mailto:sportlink.ar@gmail.com">sportlink.ar@gmail.com</a></li>
            <li><a href="https://instagram.com/sportlink.ar" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-pie">
        <p className="footer-copy">© {new Date().getFullYear()} SportLink</p>
      </div>
    </div>
  </footer>
);

export default Footer;
