import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pruebas/PruebasView.css';
import './ajustes.css';

const ROLES = { jugador: 'Jugador', entrenador: 'Entrenador', club: 'Club' };

// Secciones del menú. Las que todavía no tienen backend se muestran como "Próximamente",
// sin datos ni botones de mentira.
const SECCIONES = [
  { id: 'cuenta', label: 'Cuenta', desc: 'Tus datos de acceso y la sesión.' },
  { id: 'apariencia', label: 'Apariencia', desc: 'Modo claro u oscuro.' },
  { id: 'notificaciones', label: 'Notificaciones', desc: 'Todo lo que te llegó.' },
  { id: 'privacidad', label: 'Privacidad', desc: 'Quién ve tu información.' },
  { id: 'ayuda', label: 'Ayuda', desc: 'Soporte y preguntas frecuentes.' },
  { id: 'legal', label: 'Legal', desc: 'Términos y políticas.' },
];

const leerTema = () => {
  try { return localStorage.getItem('slk-tema') === 'oscuro' ? 'oscuro' : 'claro'; } catch { return 'claro'; }
};

function Fila({ titulo, desc, children, peligro }) {
  return (
    <div className={`aj-fila${peligro ? ' aj-fila--peligro' : ''}`}>
      <div className="aj-fila-txt">
        <strong>{titulo}</strong>
        {desc && <span>{desc}</span>}
      </div>
      <div className="aj-fila-accion">{children}</div>
    </div>
  );
}

const Pronto = () => <span className="aj-pronto">Próximamente</span>;

function SeccionCuenta({ usuario, onLogout }) {
  const navigate = useNavigate();
  const salir = () => {
    onLogout?.();
    navigate('/');
  };

  return (
    <>
      <div className="aj-grupo">
        <h3 className="aj-grupo-titulo">Datos de acceso</h3>
        <Fila titulo="Email" desc={usuario?.email || 'Sin email cargado'}>
          <Pronto />
        </Fila>
        <Fila titulo="Contraseña" desc="Para cambiarla, por ahora escribinos a soporte.">
          <Pronto />
        </Fila>
        <Fila titulo="Tipo de cuenta" desc={ROLES[usuario?.tipousuario] || 'Usuario'} />
      </div>

      <div className="aj-grupo">
        <h3 className="aj-grupo-titulo">Sesión</h3>
        <Fila titulo="Cerrar sesión" desc="Salís de SportLink en este dispositivo.">
          <button type="button" className="pr-btn pr-btn--ghost pr-btn--sm" onClick={salir}>Cerrar sesión</button>
        </Fila>
      </div>

      <div className="aj-grupo">
        <h3 className="aj-grupo-titulo">Zona de riesgo</h3>
        <Fila titulo="Eliminar cuenta" desc="Borra tu perfil, publicaciones e inscripciones. No se puede deshacer." peligro>
          <Pronto />
        </Fila>
      </div>
    </>
  );
}

function SeccionApariencia() {
  const [tema, setTema] = useState(leerTema);

  const elegir = (nuevo) => {
    setTema(nuevo);
    try { localStorage.setItem('slk-tema', nuevo); } catch { /* sin storage: solo esta sesión */ }
    // El header es el dueño del tema (lo publica en <html data-tema>): le avisamos que cambió
    window.dispatchEvent(new Event('slk-tema'));
  };

  return (
    <div className="aj-grupo">
      <h3 className="aj-grupo-titulo">Tema</h3>
      <div className="aj-temas" role="radiogroup" aria-label="Tema">
        {[
          { id: 'claro', label: 'Claro', desc: 'Fondo tiza, texto tinta.' },
          { id: 'oscuro', label: 'Oscuro', desc: 'Fondo tinta, ideal de noche.' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={tema === t.id}
            className={`aj-tema aj-tema--${t.id}${tema === t.id ? ' is-on' : ''}`}
            onClick={() => elegir(t.id)}
          >
            <span className="aj-tema-muestra" aria-hidden="true"><i /><i /><i /></span>
            <strong>{t.label}</strong>
            <span>{t.desc}</span>
          </button>
        ))}
      </div>
      <p className="pr-muted aj-nota">También podés cambiarlo con el botón sol/luna del header.</p>
    </div>
  );
}

function SeccionNotificaciones() {
  const navigate = useNavigate();
  return (
    <div className="aj-grupo">
      <h3 className="aj-grupo-titulo">Tus notificaciones</h3>
      <Fila titulo="Ver todas" desc="Inscripciones, mensajes, seguidores y recordatorios.">
        <button type="button" className="pr-btn pr-btn--ink pr-btn--sm" onClick={() => navigate('/notificaciones')}>Abrir</button>
      </Fila>
      <Fila titulo="Elegir qué te llega" desc="Vas a poder apagar cada tipo de aviso.">
        <Pronto />
      </Fila>
    </div>
  );
}

export default function Ajustes({ usuario, onLogout }) {
  const [activa, setActiva] = useState('cuenta');
  const seccion = SECCIONES.find((s) => s.id === activa);

  const contenido = () => {
    if (activa === 'cuenta') return <SeccionCuenta usuario={usuario} onLogout={onLogout} />;
    if (activa === 'apariencia') return <SeccionApariencia />;
    if (activa === 'notificaciones') return <SeccionNotificaciones />;
    return (
      <div className="pr-empty aj-vacio">
        <h3 className="pr-display pr-empty-title">Próximamente</h3>
        <p>Estamos armando esta sección. Mientras tanto, si necesitás algo escribinos desde el chat de ayuda.</p>
      </div>
    );
  };

  return (
    <div className="pr aj">
      <div className="pr-wrap aj-layout">
        <aside className="aj-lado">
          <h1 className="pr-display aj-titulo">Ajustes</h1>
          <nav className="aj-menu" aria-label="Secciones de ajustes">
            {SECCIONES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`aj-menu-item${activa === s.id ? ' is-on' : ''}`}
                aria-current={activa === s.id ? 'page' : undefined}
                onClick={() => setActiva(s.id)}
              >
                <strong>{s.label}</strong>
                <span>{s.desc}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="aj-main">
          <header className="aj-main-head">
            <h2 className="aj-seccion">{seccion.label}</h2>
            <p>{seccion.desc}</p>
          </header>
          {contenido()}
        </main>
      </div>
    </div>
  );
}
