import React, { useState, useEffect } from 'react';
import './FormularioEntrenamiento.css';

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



const FormularioEntrenamiento = ({ 
  entrenamiento, 
  usuarioActual, 
  onGuardar, 
  onCancelar 
}) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState(60);
  const [ubicacion, setUbicacion] = useState('');
  const [tipo, setTipo] = useState(deportesDisponibles[0].id);
  const [intensidad, setIntensidad] = useState('media');
  const [modalidad, setModalidad] = useState('grupal');
  
  // Recurrente
  const [esRecurrente, setEsRecurrente] = useState(false);
  const [frecuencia, setFrecuencia] = useState('semanal');
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);

  // Adjunto opcional
  const [archivo, setArchivo] = useState(null);
  const [archivoCargando, setArchivoCargando] = useState(false);
  const [archivoUrl, setArchivoUrl] = useState('');

  // Errores locales y del backend
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entrenamiento) {
      setTitulo(entrenamiento.titulo || '');
      setDescripcion(entrenamiento.descripcion || '');
      // Formatear fecha para el input datetime-local
      if (entrenamiento.fechaHora) {
        const d = new Date(entrenamiento.fechaHora);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setFechaHora(formatted);
      } else {
        setFechaHora('');
      }
      setDuracionMinutos(entrenamiento.duracionMinutos || 60);
      setUbicacion(entrenamiento.ubicacion || '');
      // intentar cargar por id o por nombre
      if (entrenamiento.tipoId) {
        setTipo(Number(entrenamiento.tipoId));
      } else if (entrenamiento.tipo) {
        const encontrado = deportesDisponibles.find(d => d.nombre.toLowerCase() === String(entrenamiento.tipo).toLowerCase());
        setTipo(encontrado ? encontrado.id : deportesDisponibles[0].id);
      } else {
        setTipo(deportesDisponibles[0].id);
      }
      setIntensidad(entrenamiento.intensidad || 'media');
      setModalidad(entrenamiento.modalidad || 'grupal');
      
      if (entrenamiento.recurrente && entrenamiento.recurrente.frecuencia) {
        setEsRecurrente(true);
        setFrecuencia(entrenamiento.recurrente.frecuencia);
        setDiasSeleccionados(entrenamiento.recurrente.dias || []);
      } else {
        setEsRecurrente(false);
        setFrecuencia('semanal');
        setDiasSeleccionados([]);
      }
      if (entrenamiento.adjunto) {
        setArchivoUrl(entrenamiento.adjunto);
      }
    } else {
      // Valores por defecto
      setTitulo('');
      setDescripcion('');
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      manana.setHours(10, 0, 0, 0);
      const pad = (n) => String(n).padStart(2, '0');
      const formatted = `${manana.getFullYear()}-${pad(manana.getMonth() + 1)}-${pad(manana.getDate())}T${pad(manana.getHours())}:${pad(manana.getMinutes())}`;
      setFechaHora(formatted);
      setDuracionMinutos(90);
      setUbicacion('Cancha 1');
      setTipo(deportesDisponibles[0].id);
      setIntensidad('media');
      setModalidad('grupal');
      setEsRecurrente(false);
      setFrecuencia('semanal');
      setDiasSeleccionados([]);
      setArchivoUrl('');
    }
  }, [entrenamiento]);

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!titulo || titulo.trim().length < 3) {
      nuevosErrores.titulo = 'El título debe tener al menos 3 caracteres';
    }

    if (!fechaHora) {
      nuevosErrores.fechaHora = 'La fecha y hora es requerida';
    } else {
      const fechaSel = new Date(fechaHora);
      if (fechaSel < new Date() && !entrenamiento) {
        nuevosErrores.fechaHora = 'La fecha y hora debe ser posterior al momento actual';
      }
    }

    if (!duracionMinutos || Number(duracionMinutos) <= 0) {
      nuevosErrores.duracionMinutos = 'La duración debe ser un número mayor a 0';
    }

    if (esRecurrente && diasSeleccionados.length === 0) {
      nuevosErrores.recurrente = 'Debe seleccionar al menos un día para la recurrencia';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const toggleDia = (diaNum) => {
    if (diasSeleccionados.includes(diaNum)) {
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== diaNum));
    } else {
      setDiasSeleccionados([...diasSeleccionados, diaNum]);
    }
  };

  const handleArchivoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setLoading(true);
    const tipoObj = deportesDisponibles.find(d => Number(d.id) === Number(tipo));
    const data = {
      titulo,
      descripcion,
      fechaHora: new Date(fechaHora).toISOString(),
      duracionMinutos: Number(duracionMinutos),
      entrenadorId: usuarioActual?.id || 'ent-123',
      clubId: usuarioActual?.clubId || 'club-1',
      tipoId: Number(tipo),
      tipo: tipoObj ? tipoObj.nombre : '',
      intensidad,
      modalidad,
      ubicacion,
      jugadores: entrenamiento?.jugadores || [],
    };

    if (esRecurrente) {
      data.recurrente = {
        frecuencia,
        dias: diasSeleccionados
      };
    } else {
      data.recurrente = null;
    }

    if (archivoUrl) {
      data.adjunto = archivoUrl;
    }

    try {
      await onGuardar(data, archivo);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        // Mapear respuestas 400 del backend a campos
        const backendErrores = {};
        err.response.data.errors.forEach(e => {
          backendErrores[e.campo] = e.mensaje;
        });
        setErrores(backendErrores);
      } else {
        setErrores({ general: 'Ocurrió un error al procesar el entrenamiento en el servidor.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const diasSemana = [
    { num: 1, label: 'L' },
    { num: 2, label: 'Ma' },
    { num: 3, label: 'Mi' },
    { num: 4, label: 'J' },
    { num: 5, label: 'V' },
    { num: 6, label: 'S' },
    { num: 7, label: 'D' }
  ];

  return (
    <form className="formulario-entrenamiento" onSubmit={handleSubmit}>
      {errores.general && (
        <div className="form-error-banner">{errores.general}</div>
      )}

      {/* Título */}
      <div className="form-grupo">
        <label className="form-label">Título del Entrenamiento<span>*</span></label>
        <input 
          type="text" 
          className="form-input" 
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="ej. Circuito de fuerza y potencia táctica"
          required
        />
        {errores.titulo && <span className="error-feedback">{errores.titulo}</span>}
      </div>

      {/* Descripción */}
      <div className="form-grupo">
        <label className="form-label">Descripción / Objetivos</label>
        <textarea 
          className="form-textarea" 
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe la rutina, ejercicios y metas del entrenamiento"
        />
      </div>

      {/* Fila doble: FechaHora y Duración */}
      <div className="form-fila-doble">
        <div className="form-grupo">
          <label className="form-label">Fecha y Hora<span>*</span></label>
          <input 
            type="datetime-local" 
            className="form-input" 
            value={fechaHora}
            onChange={(e) => setFechaHora(e.target.value)}
            required
          />
          {errores.fechaHora && <span className="error-feedback">{errores.fechaHora}</span>}
        </div>

        <div className="form-grupo">
          <label className="form-label">Duración (minutos)<span>*</span></label>
          <input 
            type="number" 
            className="form-input" 
            value={duracionMinutos}
            onChange={(e) => setDuracionMinutos(Number(e.target.value))}
            min="1"
            required
          />
          {errores.duracionMinutos && <span className="error-feedback">{errores.duracionMinutos}</span>}
        </div>
      </div>

      {/* Fila doble: Tipo de Deporte e Intensidad */}
      <div className="form-fila-doble">
        <div className="form-grupo">
          <label className="form-label">Deporte / Categoría</label>
          <select 
            className="form-select" 
            value={tipo}
            onChange={(e) => setTipo(Number(e.target.value))}
          >
              {deportesDisponibles.map(d => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
          </select>
        </div>

        <div className="form-grupo">
          <label className="form-label">Intensidad</label>
          <select 
            className="form-select" 
            value={intensidad}
            onChange={(e) => setIntensidad(e.target.value)}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>

      {/* Modalidad (Grupal / Individual) */}
      <div className="form-grupo">
        <label className="form-label">Modalidad</label>
        <select
          className="form-select"
          value={modalidad}
          onChange={(e) => setModalidad(e.target.value)}
        >
          <option value="grupal">Grupal</option>
          <option value="individual">Individual</option>
        </select>
      </div>

      {/* Ubicación */}
      <div className="form-grupo">
        <label className="form-label">Ubicación / Cancha</label>
        <input 
          type="text" 
          className="form-input" 
          value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          placeholder="ej. Cancha Auxiliar N° 2, Av. del Libertador 4200"
        />
      </div>

      {/* Recurrencia */}
      <div className="form-grupo">
        <div className="checkbox-row">
          <input 
            type="checkbox" 
            id="esRecurrente" 
            checked={esRecurrente}
            onChange={(e) => setEsRecurrente(e.target.checked)}
            className="checkbox-input"
          />
          <label htmlFor="esRecurrente" className="form-label checkbox-label">Es un entrenamiento recurrente</label>
        </div>

        {esRecurrente && (
          <div className="recurrente-opciones">
            <div className="form-grupo">
              <label className="form-label">Frecuencia</label>
              <select 
                className="form-select" 
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value)}
              >
                <option value="diaria">Diaria</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>

            <div className="form-grupo">
              <label className="form-label">Días de la Semana</label>
              <div className="dias-semana-selector">
                {diasSemana.map(d => (
                  <button
                    key={d.num}
                    type="button"
                    className={`dia-btn ${diasSeleccionados.includes(d.num) ? 'seleccionado' : ''}`}
                    onClick={() => toggleDia(d.num)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              {errores.recurrente && <span className="error-feedback">{errores.recurrente}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Subida de Adjunto */}
      <div className="form-grupo">
        <label className="form-label">Documento o Adjunto (Opcional)</label>
        
        {archivoUrl ? (
          <div className="adjunto-info">
            <span className="adjunto-nombre">📂 {archivoUrl.split('/').pop()}</span>
            <button 
              type="button" 
              className="btn-eliminar-adjunto"
              onClick={() => setArchivoUrl('')}
            >
              Eliminar
            </button>
          </div>
        ) : (
          <label className="file-upload-box">
            <input 
              type="file" 
              onChange={handleArchivoChange} 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            />
            <div className="file-upload-icon">📤</div>
            <div className="file-upload-text">
              {archivo ? `Archivo seleccionado: ${archivo.name}` : 'Haz clic para adjuntar material táctico o rutina (PDF, Doc, Imagen)'}
            </div>
          </label>
        )}
      </div>

      {/* Acciones */}
      <div className="form-acciones">
        <button 
          type="button" 
          className="btn-cancelar" 
          onClick={onCancelar}
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-guardar"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar Entrenamiento'}
        </button>
      </div>
    </form>
  );
};

export default FormularioEntrenamiento;
