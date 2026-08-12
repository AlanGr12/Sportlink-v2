import React, { useState, useEffect } from 'react';
import './FormularioEntrenamiento.css';
import CustomSelect from '../components/CustomSelect.jsx';

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
  const [fechaentr, setFechaentr] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [iddeporte, setIddeporte] = useState(deportesDisponibles[0].id);
  const [precio, setPrecio] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [genero, setGenero] = useState('Mixto');
  const [nivel, setNivel] = useState('Principiante');
  const [estado, setEstado] = useState(true);

  // Adjunto (imagen requerida por el backend)
  const [archivo, setArchivo] = useState(null);
  const [imagenUrlExistente, setImagenUrlExistente] = useState('');

  // Errores locales y del backend
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entrenamiento) {
      setTitulo(entrenamiento.titulo || '');
      setDescripcion(entrenamiento.descripcion || '');
      setFechaentr(entrenamiento.fechaentr ? entrenamiento.fechaentr.substring(0, 10) : '');
      setUbicacion(entrenamiento.ubicacion || '');
      setIddeporte(entrenamiento.iddeporte || entrenamiento.deporte?.iddeporte || deportesDisponibles[0].id);
      setPrecio(entrenamiento.precio ?? 0);
      setCantidad(entrenamiento.cantidad ?? 1);
      setGenero(entrenamiento.genero || 'Mixto');
      setNivel(entrenamiento.nivel || 'Principiante');
      setEstado(typeof entrenamiento.estado === 'boolean' ? entrenamiento.estado : true);
      setImagenUrlExistente(entrenamiento.imagen || '');
    } else {
      // Valores por defecto para creación
      setTitulo('');
      setDescripcion('');
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      const pad = (n) => String(n).padStart(2, '0');
      setFechaentr(`${manana.getFullYear()}-${pad(manana.getMonth() + 1)}-${pad(manana.getDate())}`);
      setUbicacion('Cancha 1');
      setIddeporte(deportesDisponibles[0].id);
      setPrecio(0);
      setCantidad(1);
      setGenero('Mixto');
      setNivel('Principiante');
      setEstado(true);
      setImagenUrlExistente('');
    }
    setArchivo(null);
  }, [entrenamiento]);

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!titulo || titulo.trim().length < 3) {
      nuevosErrores.titulo = 'El título debe tener al menos 3 caracteres';
    }
    if (!descripcion || descripcion.trim().length === 0) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }
    if (!fechaentr) {
      nuevosErrores.fechaentr = 'La fecha es requerida';
    }
    if (!ubicacion || ubicacion.trim().length === 0) {
      nuevosErrores.ubicacion = 'La ubicación es obligatoria';
    }
    if (precio === '' || Number(precio) < 0) {
      nuevosErrores.precio = 'El precio debe ser un número mayor o igual a 0';
    }
    if (!cantidad || Number(cantidad) <= 0) {
      nuevosErrores.cantidad = 'La cantidad debe ser un número mayor a 0';
    }
    if (!genero) {
      nuevosErrores.genero = 'El género es obligatorio';
    }
    if (!nivel) {
      nuevosErrores.nivel = 'El nivel es obligatorio';
    }
    // La imagen es obligatoria en el backend salvo que ya exista una (edición)
    if (!archivo && !imagenUrlExistente) {
      nuevosErrores.archivo = 'La imagen es obligatoria';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
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

    // FormData real, para que viaje junto con el archivo (multer lo espera así)
    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('fechaentr', fechaentr);
    formData.append('ubicacion', ubicacion);
    formData.append('iddeporte', iddeporte);
    formData.append('precio', precio);
    formData.append('cantidad', cantidad);
    formData.append('genero', genero);
    formData.append('nivel', nivel);
    formData.append('estado', estado);

    // identrenador: si el usuario logueado ya trae su id de entrenador, se manda.
    // Si no, el backend lo resuelve solo a partir del token (ver nota en la respuesta).
    if (usuarioActual?.identrenador) {
      formData.append('identrenador', usuarioActual.identrenador);
    }

    if (archivo) {
      formData.append('imagen', archivo);
    } else if (imagenUrlExistente) {
      formData.append('imagen', imagenUrlExistente);
    }

    try {
      await onGuardar(formData);
    } catch (err) {
      const mensajeBackend = err.response?.data?.error;
      if (mensajeBackend) {
        setErrores({ general: mensajeBackend });
      } else {
        setErrores({ general: 'Ocurrió un error al procesar el entrenamiento en el servidor.' });
      }
    } finally {
      setLoading(false);
    }
  };

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
        <label className="form-label">Descripción / Objetivos<span>*</span></label>
        <textarea
          className="form-textarea"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe la rutina, ejercicios y metas del entrenamiento"
          required
        />
        {errores.descripcion && <span className="error-feedback">{errores.descripcion}</span>}
      </div>

      {/* Fila doble: Fecha y Ubicación */}
      <div className="form-fila-doble">
        <div className="form-grupo">
          <label className="form-label">Fecha del Entrenamiento<span>*</span></label>
          <input
            type="date"
            className="form-input"
            value={fechaentr}
            onChange={(e) => setFechaentr(e.target.value)}
            required
          />
          {errores.fechaentr && <span className="error-feedback">{errores.fechaentr}</span>}
        </div>

        <div className="form-grupo">
          <label className="form-label">Ubicación / Cancha<span>*</span></label>
          <input
            type="text"
            className="form-input"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            placeholder="ej. Cancha Auxiliar N° 2"
            required
          />
          {errores.ubicacion && <span className="error-feedback">{errores.ubicacion}</span>}
        </div>
      </div>

      {/* Fila doble: Precio y Cantidad (cupo) */}
      <div className="form-fila-doble">
        <div className="form-grupo">
          <label className="form-label">Precio<span>*</span></label>
          <input
            type="number"
            className="form-input"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            min="0"
            required
          />
          {errores.precio && <span className="error-feedback">{errores.precio}</span>}
        </div>

        <div className="form-grupo">
          <label className="form-label">Cupo (cantidad de jugadores)<span>*</span></label>
          <input
            type="number"
            className="form-input"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            min="1"
            required
          />
          {errores.cantidad && <span className="error-feedback">{errores.cantidad}</span>}
        </div>
      </div>

      {/* Fila doble: Deporte y Nivel */}
      <div className="form-fila-doble">
        <div className="form-grupo">
          <label className="form-label">Deporte</label>
          <CustomSelect
            value={iddeporte}
            onChange={(e) => setIddeporte(Number(e.target.value))}
            options={deportesDisponibles.map(d => ({ value: d.id, label: d.nombre }))}
          />
        </div>

        <div className="form-grupo">
          <label className="form-label">Nivel<span>*</span></label>
          <CustomSelect
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            options={[
              { value: 'Principiante', label: 'Principiante' },
              { value: 'Intermedio', label: 'Intermedio' },
              { value: 'Avanzado', label: 'Avanzado' }
            ]}
          />
          {errores.nivel && <span className="error-feedback">{errores.nivel}</span>}
        </div>
      </div>

      {/* Género */}
      <div className="form-grupo">
        <label className="form-label">Género<span>*</span></label>
        <CustomSelect
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
          options={[
            { value: 'Mixto', label: 'Mixto' },
            { value: 'Masculino', label: 'Masculino' },
            { value: 'Femenino', label: 'Femenino' }
          ]}
        />
        {errores.genero && <span className="error-feedback">{errores.genero}</span>}
      </div>

      {/* Estado (activo/inactivo) */}
      <div className="form-grupo">
        <div className="checkbox-row">
          <input
            type="checkbox"
            id="estadoActivo"
            checked={estado}
            onChange={(e) => setEstado(e.target.checked)}
            className="checkbox-input"
          />
          <label htmlFor="estadoActivo" className="form-label checkbox-label">Entrenamiento activo</label>
        </div>
      </div>

      {/* Imagen (obligatoria) */}
      <div className="form-grupo">
        <label className="form-label">Imagen del Entrenamiento<span>*</span></label>

        {imagenUrlExistente && !archivo ? (
          <div className="adjunto-info">
            <span className="adjunto-nombre">📂 {imagenUrlExistente.split('/').pop()}</span>
            <button
              type="button"
              className="btn-eliminar-adjunto"
              onClick={() => setImagenUrlExistente('')}
            >
              Reemplazar
            </button>
          </div>
        ) : (
          <label className="file-upload-box">
            <input
              type="file"
              onChange={handleArchivoChange}
              accept=".png,.jpg,.jpeg,.webp"
            />
            <div className="file-upload-icon">📤</div>
            <div className="file-upload-text">
              {archivo ? `Archivo seleccionado: ${archivo.name}` : 'Haz clic para subir la imagen del entrenamiento'}
            </div>
          </label>
        )}
        {errores.archivo && <span className="error-feedback">{errores.archivo}</span>}
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