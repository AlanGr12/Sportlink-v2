import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../axiosConfig.js';
import Footer from '../footer/footer.jsx';
import fotoAtlanta from '../assets/atlanta.png';
import fotoFemenino from '../assets/futbol-femenino.jpg';
import fotoEntrenadorCancha from '../assets/entrenador-cancha.jpg';
import fotoRiestra from '../assets/riestra.png';
import fotoCalendario from '../assets/calendar.png';
import entrenador1 from '../assets/entrenador1.png';
import entrenador2 from '../assets/entrenador2.png';
import entrenador3 from '../assets/entrenador3.png';
import './InfoView.css';

const Flecha = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="square" />
  </svg>
);

/* Se muestran solo si la API no responde (p. ej. backend apagado) */
const PRUEBAS_EJEMPLO = [
  { id: 'e1', club: 'Club Atlético Atlanta', deporte: 'Fútbol', categoria: 'Sub-17 masculino', fecha: '2026-10-31', hora: '09:00', zona: 'Villa Crespo, CABA' },
  { id: 'e2', club: 'Estudiantes de La Plata', deporte: 'Fútbol', categoria: 'Sub-15 masculino', fecha: '2026-11-05', hora: '10:00', zona: 'City Bell, La Plata' },
  { id: 'e3', club: 'Deportivo Riestra', deporte: 'Fútbol', categoria: 'Sub-19 masculino', fecha: '2026-11-08', hora: '08:30', zona: 'Bajo Flores, CABA' },
  { id: 'e4', club: 'Club Atlético Atlanta', deporte: 'Básquet', categoria: 'U17 mixto', fecha: '2026-11-03', hora: '18:00', zona: 'Villa Crespo, CABA' },
  { id: 'e5', club: 'Estudiantes de La Plata', deporte: 'Hockey', categoria: 'Sub-16 femenino', fecha: '2026-11-09', hora: '11:00', zona: 'City Bell, La Plata' },
  { id: 'e6', club: 'Deportivo Riestra', deporte: 'Vóley', categoria: 'Sub-18 femenino', fecha: '2026-11-12', hora: '19:00', zona: 'Bajo Flores, CABA' },
];

/* Hero: un lugar para cada rol. Solo fotos con resolución nativa
   suficiente para el marco (~530×610 px) a densidad 2x. */
const HERO_ROLES = [
  {
    id: 'jugador',
    nombre: 'Jugador',
    desc: 'Mostrá tu juego y llegá a los clubes.',
    foto: fotoFemenino,
    alt: 'Dos jugadoras disputan la pelota en un partido de fútbol femenino amateur',
    pos: '50% 42%',
    caption: 'Fútbol femenino amateur. Foto: Laura Rincón, Pexels.',
  },
  {
    id: 'entrenador',
    nombre: 'Entrenador',
    desc: 'Llená tus grupos y sumate a un cuerpo técnico.',
    foto: fotoEntrenadorCancha,
    alt: 'Un entrenador da indicaciones a un equipo infantil en una cancha de césped sintético',
    pos: '50% 55%',
    caption: 'Charla técnica antes de empezar. Foto: Unsplash.',
  },
  {
    id: 'club',
    nombre: 'Club',
    desc: 'Encontrá talento y armá tu staff técnico.',
    foto: fotoRiestra,
    alt: 'Cancha de césped y bancos de suplentes de la sede del Deportivo Riestra',
    pos: '52% 50%',
    caption: 'Deportivo Riestra, Bajo Flores.',
  },
];

const HERO_INTERVALO = 6000;

/* Lo que aparece sobre la foto del hero para el rol activo */
const ROLES = {
  jugador: {
    desc: 'Subí tu ficha técnica, cargá videos y postulate a pruebas de clubes en tiempo real.',
    features: [
      { t: 'Visibilidad directa', d: 'Clubes y ojeadores te encuentran sin intermediarios.' },
      { t: 'Portfolio en video', d: 'Tus mejores jugadas en tu perfil.' },
      { t: 'Pruebas abiertas', d: 'Filtradas por deporte, categoría y zona.' },
      { t: 'Alertas', d: 'Te avisamos cuando abren una prueba para vos.' },
    ],
  },
  entrenador: {
    desc: 'Ofrecé entrenamientos, gestioná a tus alumnos y postulate a búsquedas de clubes.',
    features: [
      { t: 'Entrenamientos', d: 'Cupos, horarios y lista de espera.' },
      { t: 'Búsquedas laborales', d: 'Vacantes de cuerpos técnicos.' },
      { t: 'Agenda integrada', d: 'Turnos y sesiones en tu calendario.' },
      { t: 'Reseñas', d: 'Tus alumnos califican tu trabajo.' },
    ],
  },
  club: {
    desc: 'Publicá convocatorias, revisá postulantes con su perfil completo y contratá staff.',
    features: [
      { t: 'Pruebas', d: 'Convocatorias por edad, posición y nivel.' },
      { t: 'Scouting', d: 'Postulantes filtrados por deporte y zona.' },
      { t: 'Staff técnico', d: 'Publicá empleos y entrevistá entrenadores.' },
      { t: 'Panel del club', d: 'Postulaciones y agenda en un lugar.' },
    ],
  },
};

const ENTRENADORES = [
  { foto: entrenador1, nombre: 'Lucas Quintana', deporte: 'Tenis', foco: 'Alto rendimiento', nota: '4,9' },
  { foto: entrenador2, nombre: 'Sofía Hernández', deporte: 'Fútbol', foco: 'Formativas femeninas', nota: '4,8' },
  { foto: entrenador3, nombre: 'Javier López', deporte: 'Hockey', foco: 'Preparación física', nota: '4,5' },
];

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

const formatearFecha = (iso) => {
  const [y, m, d] = (iso || '').slice(0, 10).split('-').map(Number);
  if (!y) return '—';
  const f = new Date(y, m - 1, d);
  return `${DIAS[f.getDay()]} ${d} ${MESES[m - 1]}`;
};

// Normaliza la respuesta de GET /api/pruebas al formato del tablero
const normalizarPrueba = (p) => ({
  id: p.idprueba ?? p.id,
  club: p.club?.nombre || p.clubes?.nombre || 'Club',
  deporte: p.deporte?.deporte || p.deportes?.deporte || 'Deporte',
  categoria: [p.categoria, p.genero].filter(Boolean).join(' '),
  fecha: p.fechaprueba,
  hora: (p.horainicio || '').slice(0, 5),
  zona: p.zona || p.club?.ubicacion || p.clubes?.ubicacion || p.direccion || '',
  real: true,
});

/* Revela [data-reveal] al entrar en pantalla; sin JS el contenido queda visible */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.classList.add('lp--js');
    const els = root.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

const InfoView = ({ usuario }) => {
  const navigate = useNavigate();
  const rootRef = useReveal();
  const [pruebas, setPruebas] = useState(null);
  const [esEjemplo, setEsEjemplo] = useState(false);
  const [deporte, setDeporte] = useState('Todos');
  const heroRef = useRef(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroPrev, setHeroPrev] = useState(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const [sinMovimiento] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  const irAHero = (i) => {
    if (i === heroIdx) return;
    setHeroPrev(heroIdx);
    setHeroIdx(i);
  };

  // El cuadro rota solo mientras el hero está en pantalla; un clic reinicia el tiempo
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!heroVisible || sinMovimiento) return;
    const t = setTimeout(() => {
      setHeroPrev(heroIdx);
      setHeroIdx((heroIdx + 1) % HERO_ROLES.length);
    }, HERO_INTERVALO);
    return () => clearTimeout(t);
  }, [heroIdx, heroVisible, sinMovimiento]);

  const heroRol = HERO_ROLES[heroIdx];
  const heroInfo = ROLES[heroRol.id];

  // Tablero en vivo: pruebas reales si la API responde, ejemplos si no
  useEffect(() => {
    let vivo = true;
    axios.get(`${BASE_URL}/api/pruebas`, { timeout: 4000 })
      .then((res) => {
        if (!vivo) return;
        const lista = Array.isArray(res.data) ? res.data.map(normalizarPrueba) : [];
        setPruebas(lista);
      })
      .catch(() => {
        if (!vivo) return;
        setPruebas(PRUEBAS_EJEMPLO);
        setEsEjemplo(true);
      });
    return () => { vivo = false; };
  }, []);

  const deportes = useMemo(
    () => ['Todos', ...new Set((pruebas || []).map((p) => p.deporte))],
    [pruebas]
  );
  const visibles = (pruebas || [])
    .filter((p) => deporte === 'Todos' || p.deporte === deporte)
    .slice(0, 8);

  const cta = usuario
    ? { label: 'Ir a mi feed', ruta: '/feed' }
    : { label: 'Crear mi perfil', ruta: '/registro' };

  return (
    <div className="lp" ref={rootRef}>

      {/* ── Hero: bienvenida y un lugar para cada rol ── */}
      <section
        className="lp-hero"
        aria-labelledby="lp-title"
        ref={heroRef}
      >
        <div className="lp-hero-grid">
          <div className="lp-hero-copy">
            <h1 id="lp-title" className="lp-display lp-hero-title" data-reveal>
              Bienvenidos <br />a la cancha.
            </h1>
            <p className="lp-hero-lead" data-reveal style={{ '--d': '80ms' }}>
              SportLink es la red profesional del deporte. Hay un lugar para cada uno:
            </p>

            <div className="lp-hero-roles" role="tablist" aria-label="Elegí tu rol" data-reveal style={{ '--d': '140ms' }}>
              {HERO_ROLES.map((r, i) => (
                <button
                  key={r.id}
                  role="tab"
                  id={`hero-tab-${r.id}`}
                  aria-selected={heroIdx === i}
                  aria-controls="lp-hero-frame"
                  className={`lp-hero-role${heroIdx === i ? ' is-on' : ''}`}
                  onClick={() => irAHero(i)}
                >
                  <span className="lp-hero-role-name">{r.nombre}</span>
                  <span className="lp-hero-role-desc">{r.desc}</span>
                  {heroIdx === i && (
                    <span
                      className={`lp-hero-role-bar${sinMovimiento ? ' is-paused' : ''}`}
                      style={{ '--t': `${HERO_INTERVALO}ms` }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="lp-actions" data-reveal style={{ '--d': '200ms' }}>
              <button className="lp-btn" onClick={() => navigate(cta.ruta)}>
                {usuario ? cta.label : 'Registrarse'} <Flecha />
              </button>
              {!usuario && (
                <button className="lp-link" onClick={() => navigate('/login')}>Ya tengo cuenta</button>
              )}
            </div>
          </div>

          <figure className="lp-hero-media">
            <div className="lp-hero-frame" id="lp-hero-frame" role="tabpanel" aria-labelledby={`hero-tab-${heroRol.id}`}>
              {HERO_ROLES.map((r, i) => (
                <img
                  key={r.id}
                  src={r.foto}
                  alt={i === heroIdx ? r.alt : ''}
                  aria-hidden={i !== heroIdx}
                  style={{ objectPosition: r.pos }}
                  className={i === heroIdx ? 'is-on' : i === heroPrev ? 'is-prev' : ''}
                  decoding="async"
                />
              ))}

              {/* Arriba: qué hace este rol. Abajo: sus funciones y el registro */}
              <div className="lp-hero-top" key={`top-${heroRol.id}`}>
                <p className="lp-hero-info-desc">{heroInfo.desc}</p>
                <p className="lp-hero-credit" aria-live="polite">{heroRol.caption}</p>
              </div>

              <div className="lp-hero-info" key={heroRol.id}>
                <ul className="lp-hero-feats">
                  {heroInfo.features.map((f) => (
                    <li key={f.t}>
                      <strong>{f.t}</strong>
                      <span>{f.d}</span>
                    </li>
                  ))}
                </ul>
                {!usuario && (
                  <button className="lp-btn lp-hero-info-cta" onClick={() => navigate('/registro', { state: { rol: heroRol.id } })}>
                    Registrarse como {heroRol.nombre.toLowerCase()} <Flecha />
                  </button>
                )}
              </div>
            </div>
          </figure>
        </div>
      </section>

      {/* ── Tablero de pruebas (lo vivo de la página) ── */}
      <section className="lp-board" id="pruebas" aria-labelledby="lp-board-title">
        <div className="lp-wrap">
          <div className="lp-board-head">
            <h2 id="lp-board-title" className="lp-display lp-h2" data-reveal>Pruebas abiertas</h2>
            <p className="lp-board-lead" data-reveal style={{ '--d': '80ms' }}>
              Clubes que están buscando jugadores ahora. Elegí tu deporte y postulate desde tu perfil.
            </p>
          </div>

          <div className="lp-filter" role="group" aria-label="Filtrar por deporte" data-reveal style={{ '--d': '140ms' }}>
            {deportes.map((d) => (
              <button
                key={d}
                className={`lp-chip${deporte === d ? ' is-on' : ''}`}
                aria-pressed={deporte === d}
                onClick={() => setDeporte(d)}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="lp-table-wrap" data-reveal style={{ '--d': '200ms' }}>
            {pruebas === null ? (
              <p className="lp-board-empty">Cargando pruebas…</p>
            ) : visibles.length === 0 ? (
              <div className="lp-board-empty">
                <p>No hay pruebas abiertas de {deporte === 'Todos' ? 'ningún deporte' : deporte.toLowerCase()} esta semana.</p>
                <button className="lp-link" onClick={() => navigate('/registro')}>Avisame cuando haya</button>
              </div>
            ) : (
              <table className="lp-table">
                <caption className="lp-sr">Pruebas abiertas{esEjemplo ? ' (ejemplos)' : ''}</caption>
                <thead>
                  <tr>
                    <th scope="col">Club</th>
                    <th scope="col">Deporte</th>
                    <th scope="col">Categoría</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Zona</th>
                    <th scope="col"><span className="lp-sr">Acción</span></th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((p) => (
                    <tr key={p.id}>
                      <th scope="row">{p.club}</th>
                      <td data-k="Deporte">{p.deporte}</td>
                      <td data-k="Categoría">{p.categoria || '—'}</td>
                      <td data-k="Fecha">{formatearFecha(p.fecha)}{p.hora ? `, ${p.hora} h` : ''}</td>
                      <td data-k="Zona">{p.zona || '—'}</td>
                      <td>
                        <button
                          className="lp-row-go"
                          onClick={() => navigate(p.real ? `/pruebas/${p.id}` : '/pruebas')}
                          aria-label={`Ver la prueba de ${p.club}`}
                        >
                          Ver prueba <Flecha />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="lp-board-foot">
            {esEjemplo && <p>No pudimos cargar las pruebas ahora: estas son convocatorias de ejemplo.</p>}
            <button className="lp-btn lp-btn--ink" onClick={() => navigate('/pruebas')}>
              Ver todas las pruebas <Flecha />
            </button>
          </div>
        </div>
      </section>

      {/* ── Entrenadores ── */}
      <section className="lp-section lp-coaches" aria-labelledby="lp-coaches-title">
        <div className="lp-wrap">
          <div className="lp-coaches-head">
            <h2 id="lp-coaches-title" className="lp-display lp-h2" data-reveal>Entrenadores destacados</h2>
            <div className="lp-coaches-side" data-reveal style={{ '--d': '80ms' }}>
              <p>
                Profesionales de cada disciplina con perfil verificado, entrenamientos publicados
                y la calificación que les dejan sus alumnos.
              </p>
              <button className="lp-btn lp-btn--ink" onClick={() => navigate('/entrenadores')}>
                Ver todos los entrenadores <Flecha />
              </button>
            </div>
          </div>
          <ul className="lp-coaches-list">
            {ENTRENADORES.map((e, i) => (
              <li key={e.nombre} data-reveal style={{ '--d': `${120 + i * 90}ms` }}>
                <button className="lp-coach" onClick={() => navigate('/entrenadores')}>
                  <span className="lp-coach-photo">
                    <img src={e.foto} alt={`Retrato de ${e.nombre}`} />
                    <span className="lp-coach-rate">★ {e.nota}</span>
                  </span>
                  <span className="lp-coach-name">{e.nombre}</span>
                  <span className="lp-coach-meta">{e.deporte} · {e.foco}</span>
                </button>
              </li>
            ))}
            <li className="lp-coach-join" data-reveal style={{ '--d': '390ms' }}>
              <p className="lp-coach-join-title">¿Sos entrenador?</p>
              <p>Publicá tus entrenamientos, llená tus grupos y sumá reseñas de tus alumnos.</p>
              <button className="lp-btn" onClick={() => navigate(usuario ? '/entrenamientos' : '/registro')}>
                {usuario ? 'Publicar entrenamiento' : 'Registrarse'} <Flecha />
              </button>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Calendario — plano tinta, como la propia app ── */}
      <section className="lp-section lp-agenda" aria-labelledby="lp-agenda-title">
        <div className="lp-wrap lp-agenda-grid">
          <div className="lp-agenda-copy">
            <h2 id="lp-agenda-title" className="lp-display lp-h2" data-reveal>Tu agenda deportiva</h2>
            <p data-reveal style={{ '--d': '80ms' }}>
              Las pruebas a las que te anotás, tus entrenamientos y tus entrevistas se suman solos
              a tu calendario, y te avisamos antes de cada uno.
            </p>
            <ul className="lp-legend" data-reveal style={{ '--d': '140ms' }}>
              <li style={{ '--c': '#1de9b6' }}><strong>Pruebas</strong><span>Fecha, horario y sede de cada convocatoria.</span></li>
              <li style={{ '--c': '#2deff2' }}><strong>Entrenamientos</strong><span>Tus sesiones y las de tus alumnos.</span></li>
              <li style={{ '--c': '#ffe100' }}><strong>Entrevistas</strong><span>Las búsquedas laborales en curso.</span></li>
              <li style={{ '--c': '#d9d9d9' }}><strong>Eventos propios</strong><span>Lo que quieras agendar vos.</span></li>
            </ul>
            <button className="lp-btn" onClick={() => navigate('/calendario')} data-reveal style={{ '--d': '200ms' }}>
              Ir a mi calendario <Flecha />
            </button>
          </div>
          <div className="lp-agenda-media" data-reveal style={{ '--d': '120ms' }}>
            <img src={fotoCalendario} alt="Calendario de SportLink con pruebas, entrenamientos y entrevistas marcados en el mes" />
          </div>
        </div>
      </section>

      {/* ── Cierre: la pared de la sede ── */}
      <section className="lp-close" aria-labelledby="lp-close-title">
        <figure className="lp-wrap lp-close-media" data-reveal>
          <img src={fotoAtlanta} alt="Bancos de suplentes y sede del Club Atlético Atlanta, pintada de azul y amarillo" />
          <figcaption>Club Atlético Atlanta, Villa Crespo.</figcaption>
        </figure>
        <div className="lp-wrap lp-close-inner">
          <h2 id="lp-close-title" className="lp-display lp-close-title" data-reveal>Armá tu perfil.</h2>
          <div className="lp-close-side" data-reveal style={{ '--d': '100ms' }}>
            <p>Es gratis. Elegí si sos jugador, entrenador o club, y empezá a moverte.</p>
            <button className="lp-btn lp-btn--ink" onClick={() => navigate(cta.ruta)}>
              {cta.label} <Flecha />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InfoView;
