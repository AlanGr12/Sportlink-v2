import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InfoView.css';

/* ── SVG Icons ── */
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Role panel feature sets ── */
const ROLE_FEATURES = {
  athlete: [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Visibilidad directa',
      desc: 'Conectá con ojeadores verificados sin intermediarios ni comisiones.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Portfolio audiovisual',
      desc: 'Subí videos de rendimiento y destacá tus mejores jugadas.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Convocatorias oficiales',
      desc: 'Filtrá pruebas por disciplina, categoría y ubicación geográfica.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-9.33-5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 17v1a3 3 0 006 0v-1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Alertas en tiempo real',
      desc: 'Notificaciones instantáneas cuando un club abre una vacante para vos.'
    },
  ],
  coach: [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Captación de alumnos',
      desc: 'Publicá clínicas, entrenamientos y programas para atraer nuevos atletas.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Búsquedas laborales',
      desc: 'Accedé a vacantes técnicas publicadas por clubes e instituciones.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Agenda integrada',
      desc: 'Organizá horarios, turnos y cupos de tus sesiones directamente.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Seguimiento de atletas',
      desc: 'Registrá la evolución física y técnica de cada deportista a tu cargo.'
    },
  ],
  club: [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Publicación de pruebas',
      desc: 'Convocatorias segmentadas por edad, posición y nivel deportivo.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Scouting inteligente',
      desc: 'Filtros avanzados por métricas, ubicación geográfica y material audiovisual.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Fichaje de staff técnico',
      desc: 'Reclutá entrenadores certificados para tus equipos y cuerpo técnico.'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Gestión institucional',
      desc: 'Centralizá postulaciones, agendas y comunicaciones en un solo lugar.'
    },
  ],
};

/* ── Panel data ── */
const PANELS = [
  {
    id: 'athlete',
    num: '01 // ATLETA',
    badge: 'Talento Joven & Pro',
    pulse: true,
    title: 'JUGADOR',
    roleLabel: 'Regístrate como',
    desc: 'Subí tu ficha técnica, cargá videos de rendimiento y postulate a pruebas abiertas de clubes en tiempo real.',
    chips: ['Pruebas Oficiales', 'Sin Intermediarios'],
    ctaLabel: 'Crear perfil jugador',
    img: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1600&auto=format&fit=crop',
    imgAlt: 'Swimmer athlete',
  },
  {
    id: 'coach',
    num: '02 // COACH',
    badge: 'Staff Técnico & DTs',
    pulse: false,
    title: 'ENTRENADOR',
    roleLabel: 'Regístrate como',
    desc: 'Ofrecé entrenamientos personalizados, gestioná atletas y postulate a vacantes de cuerpos técnicos.',
    chips: ['Búsquedas Laborales', 'Gestión de Alumnos'],
    ctaLabel: 'Unirme como entrenador',
    img: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1600&auto=format&fit=crop',
    imgAlt: 'Coach on sideline',
  },
  {
    id: 'club',
    num: '03 // CLUB',
    badge: 'Instituciones & Academias',
    pulse: false,
    title: 'CLUB STAFF',
    roleLabel: 'Regístrate como',
    desc: 'Publicá convocatorias oficiales, filtrá prospectos por métricas y contratá directores técnicos certificados.',
    chips: ['Scouting Digital', 'Filtro Geográfico'],
    ctaLabel: 'Panel institucional',
    img: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1600&auto=format&fit=crop',
    imgAlt: 'Sports club complex',
  },
];

/* ── Component ── */
const InfoView = ({ usuario }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const getBannerText = () => {
    const map = { athlete: 'JUGADOR', coach: 'ENTRENADOR', club: 'CLUB STAFF' };
    return expanded
      ? `Vista detallada · ${map[expanded]}`
      : 'Seleccioná tu rol para comenzar';
  };

  const getPanelClass = (id) => {
    if (!expanded) return 'info-panel';
    if (id === expanded) return 'info-panel info-panel--expanded';
    return 'info-panel info-panel--collapsed';
  };

  return (
    <div className="info-root">

      {/* ── NAV ── */}
      <nav className="info-nav">
        <div className="info-nav-inner">
          <button className="info-logo" onClick={() => navigate('/')}>
            SPORT<span className="info-logo-accent">LINK</span>
            <span className="info-logo-dot" />
          </button>

          <div className="info-nav-links">
            <button className="info-nav-btn" onClick={() => scrollTo('roles')}>Explorar</button>
            <button className="info-nav-btn" onClick={() => scrollTo('about')}>¿Qué es?</button>
            <button className="info-nav-btn" onClick={() => scrollTo('pillars')}>Ecosistema</button>
            <button className="info-nav-btn" onClick={() => { setExpanded('coach'); scrollTo('roles'); }}>Entrenadores</button>
            <button className="info-nav-btn" onClick={() => { setExpanded('club'); scrollTo('roles'); }}>Clubes</button>
          </div>

          <div className="info-nav-actions">
            {!usuario ? (
              <>
                <button className="info-btn-ghost" onClick={() => navigate('/login')}>Iniciar sesión</button>
                <button className="info-btn-primary" onClick={() => navigate('/registro')}>
                  Registrarse <ArrowIcon />
                </button>
              </>
            ) : (
              <button className="info-btn-primary" onClick={() => navigate('/feed')}>
                Ir al feed <ArrowIcon />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="info-hero" id="roles">
        {/* Context banner */}
        <div className="info-hero-banner">
          <span className="info-hero-banner-text">{getBannerText()}</span>
          {expanded && (
            <button className="info-hero-reset-btn" onClick={() => setExpanded(null)}>
              <XIcon /> Ver los 3 roles
            </button>
          )}
        </div>

        {/* Panels */}
        <div className="info-panels">
          {PANELS.map((panel) => (
            <article
              key={panel.id}
              className={getPanelClass(panel.id)}
              onClick={() => {
                if (expanded !== panel.id) setExpanded(panel.id);
              }}
            >
              {/* Background image */}
              <img className="info-panel-img" src={panel.img} alt={panel.imgAlt} />

              {/* Overlays */}
              <div className="info-panel-overlay-base" />
              <div className="info-panel-overlay-side" />
              <div className="info-panel-border" />

              {/* Content */}
              <div className="info-panel-content">
                {/* Top */}
                <div className="info-panel-top">
                  <span className="info-panel-badge">
                    <span
                      className={`info-panel-badge-dot${panel.pulse ? ' info-panel-badge-dot--pulse' : ''}`}
                    />
                    {panel.badge}
                  </span>
                  <span className="info-panel-num">
                    {panel.num}
                    {expanded === panel.id && (
                      <button
                        className="info-panel-close"
                        onClick={(e) => { e.stopPropagation(); setExpanded(null); }}
                        title="Cerrar"
                      >
                        <XIcon />
                      </button>
                    )}
                  </span>
                </div>

                {/* Bottom */}
                <div className="info-panel-bottom">
                  {/* Left info */}
                  <div className="info-panel-left">
                    <span className="info-panel-role-label">{panel.roleLabel}</span>
                    <h2 className="info-panel-title">{panel.title}</h2>
                    <p className="info-panel-desc">{panel.desc}</p>
                    <div className="info-panel-chips">
                      {panel.chips.map((c) => (
                        <span key={c} className="info-panel-chip">{c}</span>
                      ))}
                    </div>
                    <button
                      className="info-panel-cta"
                      onClick={(e) => { e.stopPropagation(); navigate('/registro'); }}
                    >
                      {panel.ctaLabel}
                      <span className="info-panel-cta-icon"><ArrowIcon /></span>
                    </button>
                  </div>

                  {/* Right features grid (only when expanded) */}
                  {expanded === panel.id && (
                    <div className="info-panel-right">
                      <div className="info-features-grid">
                        {ROLE_FEATURES[panel.id].map((f) => (
                          <div className="info-feature-card" key={f.title}>
                            <div className="info-feature-icon">{f.icon}</div>
                            <div>
                              <div className="info-feature-title">{f.title}</div>
                              <p className="info-feature-desc">{f.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="info-about" id="about">
        <div className="info-about-inner">
          <span className="info-eyebrow">
            <span className="info-eyebrow-dot" />
            El futuro del scouting deportivo
          </span>

          <h2 className="info-section-title">
            ¿Qué es <span className="info-accent">SportLink</span>?
          </h2>

          <p className="info-about-body">
            SportLink es el ecosistema digital diseñado para conectar directamente a{' '}
            <strong>deportistas</strong>, <strong>clubes</strong> y{' '}
            <strong>entrenadores</strong> en un único espacio transparente, derribando
            barreras geográficas y eliminando intermediarios tradicionales.
          </p>

          <p className="info-about-body-secondary">
            Impulsamos el crecimiento deportivo facilitando que cada atleta tenga
            visibilidad real, cada preparador encuentre oportunidades en cuerpos técnicos,
            y cada club capte el mejor talento disponible para sus pruebas.
          </p>

          {/* Metrics */}
          <div className="info-metrics">
            {[
              { value: '100%', label: 'Acceso Directo', accent: true },
              { value: '+500', label: 'Clubes Conectados', accent: false },
              { value: '24/7', label: 'Pruebas Activas', accent: true },
              { value: '0', label: 'Intermediarios', accent: false },
            ].map((m) => (
              <div className="info-metric" key={m.label}>
                <span className={`info-metric-value ${m.accent ? 'info-metric-value--cyan' : 'info-metric-value--white'}`}>
                  {m.value}
                </span>
                <span className="info-metric-label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="info-divider" />

      {/* ── PILLARS ── */}
      <section className="info-pillars" id="pillars">
        <div className="info-pillars-inner">
          <div className="info-pillars-header">
            <h2 className="info-section-title" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Tres pilares, un ecosistema
            </h2>
            <p className="info-pillars-subtitle">
              Diseñado para las necesidades específicas de cada protagonista del deporte moderno.
            </p>
          </div>

          <div className="info-pillars-grid">
            {/* Pillar 1 */}
            <div className="info-pillar">
              <div className="info-pillar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
                </svg>
              </div>
              <h4 className="info-pillar-title">Para Deportistas</h4>
              <ul className="info-pillar-list">
                {[
                  'Perfil digital con estadísticas y material audiovisual.',
                  'Postulación directa a pruebas oficiales por disciplina.',
                  'Contacto con entrenadores especializados.'
                ].map((item) => (
                  <li key={item}>
                    <span className="info-pillar-check"><CheckIcon /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="info-pillar">
              <div className="info-pillar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
                </svg>
              </div>
              <h4 className="info-pillar-title">Para Entrenadores</h4>
              <ul className="info-pillar-list">
                {[
                  'Difusión de programas técnicos y servicios deportivos.',
                  'Captación constante de nuevos alumnos y atletas.',
                  'Postulación a búsquedas laborales institucionales.'
                ].map((item) => (
                  <li key={item}>
                    <span className="info-pillar-check"><CheckIcon /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="info-pillar">
              <div className="info-pillar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" />
                </svg>
              </div>
              <h4 className="info-pillar-title">Para Clubes & Staff</h4>
              <ul className="info-pillar-list">
                {[
                  'Convocatorias segmentadas por edad, posición y nivel.',
                  'Scouting con filtros geográficos y de rendimiento.',
                  'Contratación ágil de staff técnico capacitado.'
                ].map((item) => (
                  <li key={item}>
                    <span className="info-pillar-check"><CheckIcon /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="info-cta">
        <div className="info-cta-card">
          <div className="info-cta-inner">
            <h3 className="info-cta-title">¿Listo para dar el salto?</h3>
            <p className="info-cta-desc">
              Unite a la comunidad que está transformando la forma en que el talento
              deportivo es descubierto y potenciado en todo el continente.
            </p>
            <div className="info-cta-actions">
              <button className="info-cta-btn-main" onClick={() => navigate('/registro')}>
                Empezar ahora gratis
              </button>
              <button className="info-cta-btn-ghost" onClick={() => scrollTo('about')}>
                Saber más
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="info-footer">
        <div className="info-footer-inner">
          <div className="info-footer-brand">
            <div className="info-footer-logo">
              SPORT<span>LINK</span>
            </div>
            <span className="info-footer-copy">© 2026 SportLink Platform. Todos los derechos reservados.</span>
          </div>

          <div className="info-footer-links">
            {['Términos del Servicio', 'Política de Privacidad', 'Reglamento de Pruebas', 'Soporte y Contacto'].map((l) => (
              <button key={l} className="info-footer-link">{l}</button>
            ))}
          </div>

          <div className="info-footer-status">
            <span className="info-footer-dot" />
            Sistema activo
          </div>
        </div>
      </footer>

    </div>
  );
};

export default InfoView;
