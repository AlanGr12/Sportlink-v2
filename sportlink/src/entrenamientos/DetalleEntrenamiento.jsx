import React, { useState, useEffect } from 'react';
import axios from 'axios';
import fallbackFutbol from '../assets/entrenador1.png';
import fallbackBasket from '../assets/entrenador2.png';
import fallbackDefault from '../assets/entrenador3.png';
import iconPrecio from '../assets/precio.png';
import iconFutbol from '../assets/futbol.png';
import iconModalidad from '../assets/modalidad.png';
import iconFecha from '../assets/fecha.png';
import iconUbicacion from '../assets/ubicacion.png';
import './DetalleEntrenamiento.css';

const DetalleEntrenamiento = ({ entrenamiento, usuario, idjugador, onCerrar }) => {
  const [postulantes, setPostulantes] = useState([]);
  const [postulantesLoading, setPostulantesLoading] = useState(false);
  const [postulantesError, setPostulantesError] = useState("");
  
  const [isInscripto, setIsInscripto] = useState(false);
  const [inscripcionLoading, setInscripcionLoading] = useState(false);
  const [inscripcionError, setInscripcionError] = useState("");
  const [verificandoInscripcion, setVerificandoInscripcion] = useState(false);
  const [mostrarToastExito, setMostrarToastExito] = useState(false);
  
  const tipoUsuario = usuario?.tipousuario?.toString()?.toLowerCase();
  const esJugador = tipoUsuario === 'jugador' || tipoUsuario === 'player';
  const esEntrenador = tipoUsuario === 'entrenador';

  const [idjugadorResuelto, setIdjugadorResuelto] = useState(() => {
      const id = Number(idjugador || usuario?.idjugador || usuario?.idJugador || usuario?.jugador?.idjugador || usuario?.jugadorId || usuario?.id);
      return !isNaN(id) && id > 0 ? id : null;
  });

  const identrenamiento = entrenamiento?.identrenamientos || entrenamiento?.identrenamiento || entrenamiento?.id;

  // 1. Obtener postulantes si es Entrenador
  useEffect(() => {
    if (!esEntrenador || !identrenamiento) return;
    let cancelado = false;
    const fetchPostulantes = async () => {
      setPostulantesLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/api/inscripcionesentrenamientos?identrenamiento=${identrenamiento}`);
        if (!cancelado) {
           setPostulantes(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (!cancelado) setPostulantesError("Error al cargar la lista de postulantes.");
      } finally {
        if (!cancelado) setPostulantesLoading(false);
      }
    };
    fetchPostulantes();
    return () => { cancelado = true; };
  }, [esEntrenador, identrenamiento]);

  // 2. Verificar inscripción si es Jugador
  useEffect(() => {
      if (!esJugador || !idjugadorResuelto || !identrenamiento) return;
      let cancelado = false;
      const verificar = async () => {
          setVerificandoInscripcion(true);
          try {
              const res = await axios.get(`http://localhost:3000/api/inscripcionesentrenamientos?identrenamiento=${identrenamiento}`);
              if (cancelado) return;
              const lista = Array.isArray(res.data) ? res.data : [];
              const yaInscrito = lista.some(item => {
                 const idJug = Number(item.idjugador || item.idjugadorinscripto || item.jugador?.idjugador);
                 return idJug === idjugadorResuelto;
              });
              setIsInscripto(yaInscrito);
          } catch (err) {
              console.error(err);
          } finally {
              if (!cancelado) setVerificandoInscripcion(false);
          }
      }
      verificar();
      return () => { cancelado = true; };
  }, [esJugador, idjugadorResuelto, identrenamiento]);

  const handleInscribirse = async () => {
      if (!identrenamiento || !idjugadorResuelto) {
          setInscripcionError("Datos de inscripción incompletos.");
          return;
      }
      setInscripcionError("");
      setInscripcionLoading(true);
      try {
          await axios.post("http://localhost:3000/api/inscripcionesentrenamientos", {
              identrenamiento,
              idjugador: idjugadorResuelto
          });
          setIsInscripto(true);
          setMostrarToastExito(true);
      } catch (err) {
          setInscripcionError(err?.response?.data?.message || err?.response?.data?.error || "Ocurrió un error al inscribirse.");
      } finally {
          setInscripcionLoading(false);
      }
  };
  const getDeporteImagen = () => {
    // Priorizar imagen enviada por backend (puede ser `imagen` o `entrenadorFoto`)
    if (entrenamiento.imagen) return entrenamiento.imagen;
    if (entrenamiento.entrenadorFoto) return entrenamiento.entrenadorFoto;
    const t = (entrenamiento.tipo || '').toLowerCase();
    if (t.includes('futbol') || t.includes('fútbol') || t.includes('fuerza')) {
      return fallbackFutbol;
    } else if (t.includes('basket') || t.includes('basquet') || t.includes('basketball')) {
      return fallbackBasket;
    }
    return fallbackDefault;
  };
console.log(entrenamiento)

  const formatearFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' hs';
    } catch {
      return fechaStr;
    }
  };

  const diasSemana = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo'
  };

  const deportesDisponibles = [
  { id: 1, nombre: 'Fútbol' },
  { id: 2, nombre: 'Basket' },
  { id: 3, nombre: 'Tenis' },
  { id: 4, nombre: 'Voley' },
  { id: 5, nombre: 'Pádel' },
  { id: 6, nombre: 'Rugby' },
  { id: 7, nombre: 'Hockey' },
  { id: 8, nombre: 'Natación' },
  { id: 9, nombre: 'Atletismo' },
  { id: 10, nombre: 'Ciclismo' },
  { id: 11, nombre: 'Boxeo' },
  { id: 12, nombre: 'Artes Marciales' },
  { id: 13, nombre: 'Handball' },
  { id: 14, nombre: 'Béisbol' },
  { id: 15, nombre: 'Golf' }
];

  return (
    <>
      {mostrarToastExito && (
        <div className="modal-exito-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
           <div className="modal-exito-caja" style={{
               backgroundColor: '#111', padding: '30px', borderRadius: '12px',
               textAlign: 'center', color: '#fff', border: '1px solid #00f0ff',
               maxWidth: '400px', width: '90%'
           }}>
              <div style={{ fontSize: '48px', color: '#00f0ff', marginBottom: '15px' }}>✓</div>
              <h2 style={{ margin: '0 0 10px', fontSize: '24px' }}>¡Inscripción Exitosa!</h2>
              <p style={{ color: '#ccc', marginBottom: '20px' }}>Te has inscripto correctamente a este entrenamiento.</p>
              <button onClick={() => setMostrarToastExito(false)} style={{
                  backgroundColor: '#00f0ff', color: '#000', padding: '10px 20px',
                  border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%'
              }}>
                  Entendido
              </button>
           </div>
        </div>
      )}
    <div className="detalle-grid">
      {entrenamiento.imagen ? (
       <img
  src={`https://cczzvdaraenyqyujbsup.supabase.co/storage/v1/object/public/fotoEntrenamientos/${entrenamiento.imagen}`}
  alt={entrenamiento.titulo}
/>
      ) : (
        <div className="detalle-banner-fallback">SIN FOTO</div>
      )}

      <div className="detalle-info-header">
        <span className="detalle-tipo">{entrenamiento.deportes?.deporte || 'ENTRENAMIENTO'}</span>
        <h2 className="detalle-titulo">{entrenamiento.titulo}</h2>
        <p className="detalle-autor">Entrenador/a: {entrenamiento.entrenadores?.nombre || 'Entrenador Asociado'}</p>
      </div>

      <div className="detalle-seccion">
        <h4 className="detalle-seccion-titulo">Descripción y Objetivos</h4>
        <p className="detalle-descripcion">
          {entrenamiento.descripcion || 'Sin descripción detallada. Este entrenamiento está diseñado para mejorar el rendimiento físico general, la agilidad y las habilidades técnicas del deportista.'}
        </p>
      </div>

      <div className="detalle-seccion">
        <h4 className="detalle-seccion-titulo">Especificaciones Técnicas</h4>
        <div className="detalle-items-grid">
          <div className="detalle-item-caja">
            <span className="detalle-item-label"><img src={iconPrecio} alt="Precio" className="icon-small" /> Precio</span>
            <span className="detalle-item-valor">{entrenamiento.precio ? `$${entrenamiento.precio}` : 'A consultar'}</span>
          </div>

          <div className="detalle-item-caja">
            <span className="detalle-item-label"><img src={iconFutbol} alt="Deporte" className="icon-small" /> Deporte</span>
          <span className="detalle-item-valor">{entrenamiento.deportes?.deporte || 'ENTRENAMIENTO'}</span>
          </div>

          <div className="detalle-item-caja">
            <span className="detalle-item-label"><img src={iconModalidad} alt="Cantidad" className="icon-small" /> Cantidad</span>
            <span className="detalle-item-valor">{entrenamiento.cantidad || entrenamiento.cantidadJugadores || entrenamiento.capacidad
              ? `${entrenamiento.cantidad || entrenamiento.cantidadJugadores || entrenamiento.capacidad} cupos`
              : 'A confirmar'}</span>
          </div>

          <div className="detalle-item-caja">
            <span className="detalle-item-label"><img src={iconUbicacion} alt="Ubicación" className="icon-small" /> Ubicación</span>
            <span className="detalle-item-valor">{entrenamiento.ubicacion || 'Predio Deportivo'}</span>
          </div>

          <div className="detalle-item-caja">
            <span className="detalle-item-label"><img src={iconFecha} alt="Horario" className="icon-small" /> Horario</span>
            <span className="detalle-item-valor small">{formatearFecha(entrenamiento.fechaentr)}</span>
          </div>
        </div>
      </div>

      {entrenamiento.recurrente && entrenamiento.recurrente.frecuencia && (
        <div className="detalle-seccion">
          <h4 className="detalle-seccion-titulo">Recurrencia Planificada</h4>
          <p className="detalle-recurrente-text">Este entrenamiento se dicta con frecuencia <strong className="accent">{entrenamiento.recurrente.frecuencia}</strong> los siguientes días:</p>
          <div className="detalle-recurrente-list">
            {entrenamiento.recurrente.dias && entrenamiento.recurrente.dias.map((d) => (
              <span key={d} className="recurrente-pill">{diasSemana[d]}</span>
            ))}
          </div>
        </div>
      )}

      {entrenamiento.adjunto && (
        <div className="detalle-seccion">
          <h4 className="detalle-seccion-titulo">Material táctico adjunto</h4>
          <div className="adjunto-box">
            <span className="adjunto-nombre">📂 {entrenamiento.adjunto.split('/').pop()}</span>
            <a href={entrenamiento.adjunto} target="_blank" rel="noopener noreferrer" className="adjunto-descargar">Descargar</a>
          </div>
        </div>
      )}

      {esEntrenador && (
        <div className="detalle-seccion">
          <h4 className="detalle-seccion-titulo">Jugadores Inscriptos ({postulantes.length})</h4>
          {postulantesLoading ? (
            <div style={{color: '#aaa', padding: '10px 0'}}>Cargando jugadores...</div>
          ) : postulantesError ? (
            <div style={{color: '#ff4444', padding: '10px 0'}}>{postulantesError}</div>
          ) : postulantes.length === 0 ? (
            <div style={{color: '#aaa', padding: '10px 0'}}>Aún no hay jugadores inscriptos en este entrenamiento.</div>
          ) : (
            <div className="postulantes-lista" style={{display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px'}}>
              {postulantes.map((item, index) => {
                const jugador = item.jugador || item;
                const nombreCompleto = `${jugador?.nombre || ''} ${jugador?.apellido || ''}`.trim() || 'Jugador Sin Nombre';
                const deporte = jugador?.deportes?.deporte || jugador?.deporte || "No especificado";
                const ubicacion = jugador?.ubicacion || "No especificada";
                const foto = jugador?.fotoperfil || "";

                return (
                  <div key={index} style={{
                      display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#1a1a1a', 
                      padding: '12px', borderRadius: '8px', border: '1px solid #333'
                  }}>
                    {foto ? (
                      <img src={foto} alt={nombreCompleto} style={{width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover'}} />
                    ) : (
                      <div style={{
                          width:'40px', height:'40px', borderRadius:'50%', backgroundColor:'#333', 
                          display:'flex', alignItems:'center', justifyContent:'center', color:'#00f0ff', fontWeight:'bold'
                      }}>
                        {nombreCompleto.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 style={{margin:'0 0 5px', color:'#fff', fontSize:'15px'}}>{nombreCompleto}</h4>
                      <p style={{margin:0, color:'#aaa', fontSize:'13px'}}>🏅 {deporte} &nbsp;|&nbsp; 📍 {ubicacion}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {inscripcionError && (
          <div style={{color: '#ff4444', marginBottom: '15px', textAlign: 'center'}}>
              {inscripcionError}
          </div>
      )}
      <div className="detalle-actions">
        {esJugador && (
            isInscripto || verificandoInscripcion ? (
                <button
                  className="btn-guardar"
                  disabled
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#111111",
                    border: "1px solid #d1d5db",
                    cursor: "not-allowed",
                    opacity: 0.7,
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  {isInscripto ? "INSCRIPTO" : "VERIFICANDO..."}
                </button>
            ) : (
                <button
                  className="btn-guardar"
                  onClick={handleInscribirse}
                  disabled={inscripcionLoading || !idjugadorResuelto}
                  style={{
                    backgroundColor: "#00f0ff",
                    color: "#000",
                    border: "none",
                    cursor: "pointer",
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  {inscripcionLoading
                    ? "Inscribiendo..."
                    : idjugadorResuelto
                      ? "INSCRIBIRSE"
                      : "Cargando jugador..."}
                </button>
            )
        )}
        <button className="btn-cancelar" onClick={onCerrar}>Cerrar</button>
      </div>
    </div>
    </>
  );
};

export default DetalleEntrenamiento;
