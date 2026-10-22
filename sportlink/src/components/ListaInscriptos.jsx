import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import api from '../axiosConfig.js';
import { AvatarSlk } from './ImagenesSlk.jsx';
import '../pruebas/PruebasView.css';
import '../mostrarClubes/ClubesView.css';

// Datos de cada inscripción, venga el jugador anidado o plano
const normalizar = (item, index) => {
  const jugador = item?.jugador || item?.jugadores || item || {};
  const nombre = [jugador.nombre, jugador.apellido].filter(Boolean).join(' ').trim() ||
    item?.nombre || item?.usuario?.nombre || 'Jugador sin nombre';
  const dato = (v) => (v && v !== 'No especificado' && v !== 'No especificada' ? v : null);
  const meta = [jugador.deportes?.deporte || jugador.deporte, jugador.ubicacion || item?.ubicacion, jugador.genero || item?.genero]
    .map(dato).filter(Boolean).join(' · ');
  return {
    key: jugador.idjugador || item?.idjugador || index,
    nombre,
    foto: jugador.fotoperfil || item?.fotoperfil || '',
    meta: meta || 'Sin datos de perfil',
    telefono: jugador.telefono || item?.telefono || '',
    idusuario: jugador.idusuario || item?.idusuario || null,
  };
};

/**
 * Lista de postulantes / inscriptos que ve el dueño de un evento (club en Pruebas,
 * entrenador en Entrenamientos), con mensaje a cada uno o a todos.
 * evento: { idprueba } o { identrenamiento }
 */
export default function ListaInscriptos({ inscripciones = [], cargando, error, titulo, vacio, evento = {}, nombreEvento }) {
  const navigate = useNavigate();
  const personas = inscripciones.map(normalizar);
  const contactables = personas.filter((p) => p.idusuario);

  // destino: { persona } para uno, { todos: true } para todos
  const [destino, setDestino] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 6000);
    return () => clearTimeout(t);
  }, [aviso]);

  const abrir = (d) => {
    setMensaje('');
    setErrorEnvio('');
    setAviso(null);
    setDestino(d);
  };

  const cerrar = () => { if (!enviando) setDestino(null); };

  const enviarPrivado = async (idusuarioReceptor, contenido) => {
    const { data: conversacion } = await api.post('/api/conversaciones/privada', { idusuarioReceptor });
    await api.post(`/api/conversaciones/${conversacion.idconversacion}/mensajes`, { contenido });
    return conversacion;
  };

  // A todos: por el grupo de chat del evento; si no aparece, uno por uno
  const enviarATodos = async (contenido) => {
    const { data } = await api.get('/api/conversaciones');
    const grupo = (Array.isArray(data) ? data : []).find((c) =>
      c.tipo === 'GRUPAL' && (
        (evento.idprueba && Number(c.idprueba) === Number(evento.idprueba)) ||
        (evento.identrenamiento && Number(c.identrenamiento) === Number(evento.identrenamiento))
      ));
    if (grupo) {
      await api.post(`/api/conversaciones/${grupo.idconversacion}/mensajes`, { contenido });
      return { titulo: `Mensaje enviado al grupo${nombreEvento ? ` de ${nombreEvento}` : ''}`, conversacion: grupo };
    }
    const resultados = await Promise.allSettled(contactables.map((p) => enviarPrivado(p.idusuario, contenido)));
    const enviados = resultados.filter((r) => r.status === 'fulfilled').length;
    if (!enviados) throw new Error('sin envíos');
    return {
      titulo: `Mensaje enviado a ${enviados} de ${contactables.length} ${contactables.length === 1 ? 'persona' : 'personas'}`,
      conversacion: null,
    };
  };

  const enviar = async () => {
    const contenido = mensaje.trim();
    if (!contenido || !destino || enviando) return;
    setEnviando(true);
    setErrorEnvio('');
    try {
      const resultado = destino.todos
        ? await enviarATodos(contenido)
        : { titulo: `Mensaje enviado a ${destino.persona.nombre}`, conversacion: await enviarPrivado(destino.persona.idusuario, contenido) };
      setDestino(null);
      setMensaje('');
      setAviso(resultado);
    } catch (err) {
      console.error('[ListaInscriptos] Error al enviar mensaje:', err);
      setErrorEnvio('No se pudo enviar el mensaje. Probá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const tituloModal = destino?.todos
    ? `Escribirles a ${contactables.length === 1 ? 'tu inscripto' : `los ${contactables.length}`}`
    : `Escribirle a ${destino?.persona.nombre}`;

  return (
    <div className="pr-block">
      <div className="pr-block-head">
        <h3>{titulo} ({personas.length})</h3>
        {!cargando && !error && contactables.length > 1 && (
          <button className="pr-btn pr-btn--sm" onClick={() => abrir({ todos: true })}>
            Escribirles a todos
          </button>
        )}
      </div>

      {cargando ? (
        <p className="pr-muted">Cargando…</p>
      ) : error ? (
        <p className="pr-error">{error}</p>
      ) : personas.length === 0 ? (
        <p className="pr-muted">{vacio}</p>
      ) : (
        <ul className="pr-people">
          {personas.map((p) => (
            <li key={p.key} className="pr-person">
              <AvatarSlk foto={p.foto} nombre={p.nombre} />
              <div className="pr-person-info">
                <p className="pr-person-name">{p.nombre}</p>
                <p className="pr-person-meta">{p.meta}</p>
                {p.telefono && <p className="pr-person-meta">Tel. {p.telefono}</p>}
              </div>
              {p.idusuario && (
                <div className="pr-person-actions">
                  <Link className="pr-link" to={`/perfil/${p.idusuario}`}>Ver perfil</Link>
                  <button className="pr-btn pr-btn--ink pr-btn--sm" onClick={() => abrir({ persona: p })}>Escribirle</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {destino && createPortal(
        <div
          className="pr-overlay cl-overlay-top"
          onClick={cerrar}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); cerrar(); } }}
        >
          <div className="pr-modal pr-modal--sm" role="dialog" aria-modal="true" aria-labelledby="pr-mensaje-titulo" onClick={(e) => e.stopPropagation()}>
            <header className="pr-modal-head cl-modal-head--simple">
              <h2 id="pr-mensaje-titulo" className="pr-modal-title">{tituloModal}</h2>
              <button className="pr-close" onClick={cerrar} aria-label="Cerrar">×</button>
            </header>
            <div className="pr-modal-body">
              <label className="cl-message">
                <span>
                  {destino.todos
                    ? 'Les llega a todos en sus mensajes.'
                    : 'Le llega directo a su bandeja de mensajes.'}
                </span>
                <textarea
                  placeholder={destino.todos ? 'Hola a todos, les cuento que…' : 'Hola, te escribo por…'}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  rows={5}
                  autoFocus
                  maxLength={500}
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) enviar(); }}
                />
                <small>{mensaje.length}/500 · Ctrl + Enter para enviar</small>
              </label>
              {errorEnvio && <p className="pr-error">{errorEnvio}</p>}
            </div>
            <footer className="pr-modal-foot">
              <button className="pr-btn pr-btn--ghost" onClick={cerrar} disabled={enviando}>Cancelar</button>
              <button className="pr-btn" onClick={enviar} disabled={!mensaje.trim() || enviando}>
                {enviando ? 'Enviando…' : 'Enviar mensaje'}
              </button>
            </footer>
          </div>
        </div>,
        document.body
      )}

      {aviso && createPortal(
        <div className="pr-toast pr-toast--top" role="status">
          <div>
            <p className="pr-toast-titulo">{aviso.titulo}</p>
            <p className="pr-toast-texto">Seguí la conversación desde tus mensajes.</p>
          </div>
          <button
            className="pr-btn"
            onClick={() => {
              const conversacion = aviso.conversacion;
              setAviso(null);
              navigate('/mensajes', conversacion ? { state: { conversacionInicial: conversacion } } : undefined);
            }}
          >
            Ir al chat
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
