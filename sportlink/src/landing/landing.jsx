import React from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';
import Footer from '../footer/footer.jsx';
import fotolanding from '../assets/fotolanding.png';
import entrenador1 from '../assets/entrenador1.png';
import entrenador2 from '../assets/entrenador2.png';
import entrenador3 from '../assets/entrenador3.png';
import riber from '../assets/riber.png';
import boca from '../assets/boca.png';
import instalaciones from '../assets/instalaciones.png';
import futbol from '../assets/futbol.png';
import basquet from '../assets/basquet.png';
import tenis from '../assets/tenis.png';
import atlanta from '../assets/atlanta.png';
import riestra from '../assets/riestra.png';
import estudiantes from '../assets/estudiantes.png';
import calendar from '../assets/calendar.png';

const Landing = ({ usuario }) => {
  const navigate = useNavigate();
  return (
    <>
      <main>

        {/* ── BANNER ── */}
        <section
          className="banner"
          style={{
            backgroundImage: `
              linear-gradient(
                160deg,
                rgba(0,0,0,0.80) 0%,
                rgba(0,0,0,0.40) 55%,
                rgba(0,0,0,0.85) 100%
              ),
              url(${fotolanding})
            `,
          }}
        >
          <div className="banner-orb" />

          <div className="banner-texto">

            {/* Eyebrow */}
            <div className="banner-eyebrow">
              <span className="banner-eyebrow-dot" />
              Plataforma deportiva profesional
            </div>

            <h1>
              ELEVA TU
              <span className="line-cyan">CAMINO AL DEPORTE</span>
            </h1>

            <p>
              Conectá con clubes, entrenadores, y accedé a entrenamientos de
              alto rendimiento. Convertí tu talento en oportunidades reales.
            </p>

            <div className="banner-ctas">
              {!usuario && (
                <button className="btn-banner" onClick={() => navigate('/login')}>
                  UNIRSE A SPORTLINK
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              <button className="btn-banner-ghost" onClick={() => navigate('/entrenadores')}>
                Explorar entrenadores
              </button>
            </div>

            <div className="banner-stats">
              <div className="stat-pill"><strong>+120</strong> clubes asociados</div>
              <div className="stat-pill"><strong>+800</strong> entrenadores</div>
              <div className="stat-pill"><strong>+5K</strong> jugadores activos</div>
            </div>
          </div>
        </section>

        {/* ── ENTRENADORES ── */}
        <section className="entrenadoresLanding">
          <div className="tituloLanding">
            <h2>DESCUBRÍ A LOS <span>ENTRENADORES</span> AFILIADOS</h2>
          </div>

          <div className="cardsEntrenadores">
            <article>
              <img src={entrenador1} alt="Entrenador Lucas Quintana" />
              <div className="card-info">
                <h3>Lucas Quintana</h3>
                <p className="deporte">Tenis</p>
                <div className="rating">
                  <span className="stars">★★★★★</span>
                  <span>4.9</span>
                </div>
              </div>
            </article>

            <article>
              <img src={entrenador2} alt="Entrenadora Sofia Hernández" />
              <div className="card-info">
                <h3>Sofia Hernández</h3>
                <p className="deporte">Fútbol</p>
                <div className="rating">
                  <span className="stars">★★★★★</span>
                  <span>4.8</span>
                </div>
              </div>
            </article>

            <article>
              <img src={entrenador3} alt="Entrenador Javier López" />
              <div className="card-info">
                <h3>Javier López</h3>
                <p className="deporte">Hockey</p>
                <div className="rating">
                  <span className="stars">★★★★☆</span>
                  <span>4.5</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <div className="sl-divider" />

        {/* ── CLUBES ── */}
        <section className="clubesLanding">
          <div className="izquierdaClubes">
            <h2>
              DESCUBRÍ LOS
              <br />MEJORES
              <br /><span>CLUBES</span>
            </h2>
            <p>
              Instituciones que definen el futuro del deporte.
            </p>

            <div className="listaClubes">
              <article>
                <img src={riber} alt="River Plate" />
                <div className="club-info">
                  <h3>River Plate</h3>
                  <p>Club asociado</p>
                </div>
              </article>
              <article>
                <img src={boca} alt="Boca Juniors" />
                <div className="club-info">
                  <h3>Boca Juniors</h3>
                  <p>Club asociado</p>
                </div>
              </article>
            </div>
          </div>

          <div className="derechaClubes">
            <div className="deportesClubes">
              <article>
                <img src={futbol} alt="Fútbol" />
                <p>FÚTBOL</p>
              </article>
              <article>
                <img src={basquet} alt="Básquet" />
                <p>BÁSQUET</p>
              </article>
              <article>
                <img src={tenis} alt="Tenis" />
                <p>TENIS</p>
              </article>
            </div>

            <div className="imagenClubes">
            <img src={instalaciones} alt="Club" />
            <div>
              <h3>Instalaciones de Alto Rendimiento</h3>
              <p>Más de 120 clubes asociados en toda Argentina.</p>
            </div>
          </div>

          </div>
        </section>

        <div className="sl-divider" />

        {/* ── PRUEBAS ── */}
        <section className="pruebasLanding">
          <div className="tituloPruebas">
            <div>
              <h2>PRUEBAS <span>RECOMENDADAS</span></h2>
              <p className="subtitulo">
                Las pruebas recomendadas se basan en los deportes,
                categoría y ubicación que elegiste
              </p>
            </div>
            <a href="">VER TODAS →</a>
          </div>

          <div className="cardsPruebas">
            <article>
              <span className="card-badge">Recomendado</span>
              <img src={atlanta} alt="Club Atlanta" />
              <div className="card-body">
                <h3>ATLANTA</h3>
                <p>⚽ Fútbol</p>
                <p>📍 CABA, Humboldt 540</p>
                <p>📅 15 de Octubre, 2026</p>
              </div>
              <button className="btn-prueba">MÁS INFORMACIÓN</button>
            </article>

            <article>
              <img src={riestra} alt="Deportivo Riestra" />
              <div className="card-body">
                <h3>DEPORTIVO RIESTRA</h3>
                <p>⚽ Fútbol</p>
                <p>📍 CABA, Ana María Janer 2101</p>
                <p>📅 22 de Octubre, 2026</p>
              </div>
              <button className="btn-prueba">MÁS INFORMACIÓN</button>
            </article>

            <article>
              <span className="card-badge">Nuevo</span>
              <img src={estudiantes} alt="Estudiantes de La Plata" />
              <div className="card-body">
                <h3>ESTUDIANTES DE LA PLATA</h3>
                <p>⚽ Fútbol</p>
                <p>📍 La Plata, Av. 110</p>
                <p>📅 05 de Noviembre, 2026</p>
              </div>
              <button className="btn-prueba">MÁS INFORMACIÓN</button>
            </article>
          </div>
        </section>

        {/* ── DASHBOARD / CALENDARIO ── */}
        <div className="dashboardLanding">
          <div className="textoDashboard">
            <h2>
              Organizáte mejor con
              <br />tu <span>CALENDARIO</span>
            </h2>
            <p>
              Gestioná tus eventos, seguí tus progresos y recibí
              invitaciones de scouting en tiempo real. Un panel diseñado
              para la precisión absoluta.
            </p>

            <div className="listaDashboard">
              <p>Calendario personalizable</p>
              <p>Tus actividades se agregan automáticamente</p>
              <p>Notificaciones a tu buzón</p>
            </div>

            <button className="btn-dashboard" onClick={() => navigate('/calendario')}>
              IR A MI CALENDARIO
            </button>
          </div>

          <div className="dashboard-img">
            <img src={calendar} alt="Calendario SportLink" />
          </div>
        </div>

      </main>

      <Footer />
    </>
  );
};

export default Landing;
