import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../axiosConfig.js';
import { haPasadoFecha } from '../utils/dateUtils.js';
import { fechaLarga, precio } from '../utils/formato.js';

/*
  "Actividad abierta" del perfil: lo que la cuenta ofrece ahora mismo y cualquiera puede ver.
  - Club: pruebas abiertas y búsquedas de empleo.
  - Entrenador: entrenamientos con fecha por delante.
  - Jugador: no tiene nada público de este tipo, no se muestra.
  Cada fila lleva a su detalle. Si todo falla o está vacío, el bloque no aparece.
*/
const Fila = ({ to, titulo, detalle, extra }) => (
  <li>
    <Link className="pf-act-fila" to={to}>
      <span className="pf-act-txt">
        <strong>{titulo}</strong>
        <span>{detalle}</span>
      </span>
      {extra && <span className="pf-act-extra">{extra}</span>}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
    </Link>
  </li>
);

const Grupo = ({ titulo, cantidad, children }) => (
  <div className="pf-act-grupo">
    <h3 className="pf-act-titulo">{titulo} <span>{cantidad}</span></h3>
    <ul className="pf-act-lista">{children}</ul>
  </div>
);

export default function PerfilActividad({ rol, idclub, identrenador }) {
  const [pruebas, setPruebas] = useState([]);
  const [empleos, setEmpleos] = useState([]);
  const [entrenamientos, setEntrenamientos] = useState([]);

  useEffect(() => {
    let vivo = true;
    if (rol === 'club' && idclub) {
      api.get('/api/pruebas')
        .then((res) => {
          if (!vivo) return;
          const lista = (Array.isArray(res.data) ? res.data : [])
            .filter((p) => Number(p.club?.idclub ?? p.idclub) === Number(idclub) && !haPasadoFecha(p.fechaprueba, p.horafin));
          setPruebas(lista);
        })
        .catch(() => {});
      api.get(`/api/empleo/club/${idclub}`)
        .then((res) => { if (vivo) setEmpleos(Array.isArray(res.data) ? res.data : []); })
        .catch(() => {});
    }
    if (rol === 'entrenador' && identrenador) {
      api.get('/api/entrenamientos', { params: { limit: 200 } })
        .then((res) => {
          if (!vivo) return;
          const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
          setEntrenamientos(items.filter((e) => Number(e.identrenador) === Number(identrenador) && !haPasadoFecha(e.fechaentr, e.horafin)));
        })
        .catch(() => {});
    }
    return () => { vivo = false; };
  }, [rol, idclub, identrenador]);

  if (!pruebas.length && !empleos.length && !entrenamientos.length) return null;

  return (
    <section className="pf-bloque pf-act" aria-labelledby="pf-act-titulo">
      <h2 id="pf-act-titulo" className="pf-seccion-titulo">Abierto ahora</h2>

      {pruebas.length > 0 && (
        <Grupo titulo="Pruebas" cantidad={pruebas.length}>
          {pruebas.map((p) => (
            <Fila
              key={p.idprueba}
              to={`/pruebas/${p.idprueba}`}
              titulo={`Prueba de ${p.deporte?.deporte?.toLowerCase() || 'deporte'}${p.categoria ? ` · ${p.categoria}` : ''}`}
              detalle={fechaLarga(p.fechaprueba, p.horainicio, p.horafin)}
            />
          ))}
        </Grupo>
      )}

      {empleos.length > 0 && (
        <Grupo titulo="Búsquedas de personal" cantidad={empleos.length}>
          {empleos.map((e) => (
            <Fila
              key={e.idempleo}
              to={`/empleos/${e.idempleo}`}
              titulo={e.nombre || 'Búsqueda abierta'}
              detalle={[e.deporte?.deporte, e.horasreq ? `${e.horasreq} h semanales` : null].filter(Boolean).join(' · ') || 'Ver detalle'}
            />
          ))}
        </Grupo>
      )}

      {entrenamientos.length > 0 && (
        <Grupo titulo="Entrenamientos" cantidad={entrenamientos.length}>
          {entrenamientos.map((e) => {
            const id = e.identrenamientos ?? e.identrenamiento ?? e.id;
            return (
              <Fila
                key={id}
                to={`/entrenamientos/${id}`}
                titulo={e.titulo || 'Entrenamiento'}
                detalle={fechaLarga(e.fechaentr, e.horainicio, e.horafin)}
                extra={precio(e.precio)}
              />
            );
          })}
        </Grupo>
      )}
    </section>
  );
}
