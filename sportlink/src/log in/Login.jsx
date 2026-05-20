import { useState } from "react";

const SportlinkLogo = ({ size = "md" }) => {
  const fontSize = size === "lg" ? "2.2rem" : size === "sm" ? "1.1rem" : "1.6rem";
  return (
    <span style={{ fontFamily: "'Barlow Condensed', 'Oswald', sans-serif", fontWeight: 900, fontSize, letterSpacing: "0.04em", color: "#fff" }}>
      SPORT<span style={{ color: "#2deff2" }}>LINK</span>
    </span>
  );
};

export default function SportlinkLogin() {
  const [email, setEmail] = useState("tomasgonzalez@gmail.com");
  const [password, setPassword] = useState("········");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) {
      setError("Por favor completá todos los campos.");
      return;
    }
    setLoading(true);
    // Simulación de login — conectar al backend real aquí
    setTimeout(() => {
      setLoading(false);
      setError("Credenciales incorrectas. Intentá de nuevo.");
    }, 1200);
  };

  return (
    <div style={styles.page}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #0d1117; }

        .nav-link {
          color: #ccc;
          text-decoration: none;
          font-size: 0.88rem;
          font-family: 'Barlow', sans-serif;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #fff; }

        .form-input {
          width: 100%;
          background: #1e2535;
          border: 1px solid #2a3147;
          border-radius: 6px;
          padding: 12px 14px;
          color: #fff;
          font-family: 'Barlow', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus { border-color: #2deff2; }
        .form-input::placeholder { color: #5a6380; }

        .btn-login {
          width: 100%;
          background: #2deff2;
          border: none;
          border-radius: 6px;
          padding: 13px;
          color: #0d1117;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 1rem;
          letter-spacing: 0.12em;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }
        .btn-login:hover { background: #00cfea; }
        .btn-login:active { transform: scale(0.98); }
        .btn-login:disabled { background: #00a0b0; cursor: not-allowed; }

        .footer-link {
          color: #ccc;
          text-decoration: none;
          font-family: 'Barlow', sans-serif;
          font-size: 0.75rem;
          transition: color 0.2s;
        }
        .footer-link:hover { color: #fff; }

        .footer-section-link {
          color: #aaa;
          text-decoration: none;
          font-family: 'Barlow', sans-serif;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
        }
        .footer-section-link:hover { color: #2deff2; }

        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #2a3147;
          border: 2px solid #3a4260;
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <SportlinkLogo size="md" />
        <div style={styles.navLinks}>
          <a href="#" className="nav-link">Entrenadores</a>
          <a href="#" className="nav-link">Clubes</a>
          <a href="#" className="nav-link">Pruebas</a>
          <a href="#" className="nav-link">Mensajes</a>
          <a href="#" className="nav-link">Dashboard</a>
        </div>
        <div className="avatar-circle" />
      </nav>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        {/* Logo central */}
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <SportlinkLogo size="lg" />
        </div>

        {/* Card login */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>¡Bienvenido de vuelta!</h2>
          <p style={styles.cardSubtitle}>Inicio de sesión.</p>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label style={styles.label}>EMAIL</label>
              <input
                className="form-input"
                type="email"
                placeholder="tomasgonzalez@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label style={styles.label}>CONTRASEÑA</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {/* Error */}
            {error && (
              <p style={{ color: "#ff4d6d", fontSize: "0.82rem", fontFamily: "'Barlow', sans-serif" }}>
                {error}
              </p>
            )}

            {/* Botón */}
            <button
              className="btn-login"
              onClick={handleSubmit}
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? "INGRESANDO..." : "INICIAR SESIÓN"}
            </button>

            {/* Links */}
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <p style={styles.switchText}>
                No tenés cuenta?{" "}
                <a href="#" style={{ color: "#2deff2", textDecoration: "none", fontWeight: 600 }}>
                  Registrate
                </a>
              </p>
              <a
                href="#"
                style={{ color: "#aaa", fontSize: "0.78rem", fontFamily: "'Barlow', sans-serif", textDecoration: "none", display: "block", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}
              >
                Te olvidaste la contraseña?
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          {/* Columna izquierda */}
          <div style={{ maxWidth: 220 }}>
            <SportlinkLogo size="sm" />
            <p style={styles.footerDesc}>
              Plataforma de alto rendimiento conectando entrenadores, atletas de élite con clubes profesionales a través de análisis de datos.
            </p>
          </div>

          {/* Columna Descubrí */}
          <div>
            <p style={styles.footerHeading}>DESCUBRÍ</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
              {["Entrenadores", "Clubes", "Pruebas", "Dashboard"].map(item => (
                <a key={item} href="#" className="footer-section-link">
                  <span style={{ color: "#2deff2", fontSize: "0.7rem" }}>›</span> {item}
                </a>
              ))}
            </div>
          </div>

          {/* Columna Contacto */}
          <div>
            <p style={styles.footerHeading}>CONTACTO</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              <a href="mailto:sportlink.ar@gmail.com" className="footer-section-link">
                <span style={{ color: "#2deff2" }}>@</span> sportlink.ar@gmail.com
              </a>
              <a href="#" className="footer-section-link">
                <span style={{ color: "#2deff2" }}>◎</span> sportlink.ar
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={styles.footerBottom}>
          <span style={{ color: "#555", fontSize: "0.75rem", fontFamily: "'Barlow', sans-serif" }}>
            © 2020 SPORTLINK. Todos los derechos reservados
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Términos y condiciones", "Política de privacidad", "Cookies"].map(t => (
              <a key={t} href="#" className="footer-link" style={{ fontSize: "0.72rem" }}>{t}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "radial-gradient(ellipse at 50% 0%, #0a1f2e 0%, #0d1117 55%)",
    fontFamily: "'Barlow', sans-serif",
  },
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 40px",
    borderBottom: "1px solid #1a2235",
    background: "rgba(13,17,23,0.95)",
    backdropFilter: "blur(8px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navLinks: {
    display: "flex",
    gap: 32,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
  },
  card: {
    background: "#131926",
    border: "1px solid #1e2a3d",
    borderRadius: 12,
    padding: "36px 40px",
    width: "100%",
    maxWidth: 420,
  },
  cardTitle: {
    color: "#fff",
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 700,
    fontSize: "1.5rem",
    letterSpacing: "-0.01em",
  },
  cardSubtitle: {
    color: "#7a88aa",
    fontFamily: "'Barlow', sans-serif",
    fontSize: "0.88rem",
    marginTop: 4,
  },
  label: {
    display: "block",
    color: "#8a96b0",
    fontSize: "0.72rem",
    letterSpacing: "0.1em",
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 600,
    marginBottom: 7,
  },
  switchText: {
    color: "#8a96b0",
    fontSize: "0.85rem",
    fontFamily: "'Barlow', sans-serif",
  },
  footer: {
    background: "#0a0e17",
    borderTop: "1px solid #1a2235",
    padding: "40px 40px 0",
  },
  footerInner: {
    display: "flex",
    justifyContent: "space-between",
    gap: 40,
    flexWrap: "wrap",
    paddingBottom: 32,
  },
  footerHeading: {
    color: "#2deff2",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.14em",
    fontFamily: "'Barlow Condensed', sans-serif",
  },
  footerDesc: {
    color: "#5a6880",
    fontSize: "0.78rem",
    lineHeight: 1.6,
    marginTop: 10,
    fontFamily: "'Barlow', sans-serif",
  },
  footerBottom: {
    borderTop: "1px solid #1a2235",
    padding: "14px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
};
