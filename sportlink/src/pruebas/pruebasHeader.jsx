import "./pruebasHeader.css";
import iconBuscador from '../assets/buscador.png';

function PruebasHeader({ busqueda, setBusqueda, esClub, idclubResuelto, onCrear }) {
  return (
    <div className="pruebas-header">
      <h1>
        PRUEBAS <span className="text-cyan">ACTIVAS</span>
      </h1>

      <p>
        Únete a los desafíos más intensos y compite con los mejores atletas de la región.
      </p>

      {esClub && (
        <div className="acciones-entrenador-container" style={{ margin: "8px 0 4px 0", alignSelf: "flex-end" }}>
          <button
            className="btn-crear-entrenamiento"
            onClick={onCrear}
            disabled={!idclubResuelto}
          >
            <span>+</span> {idclubResuelto ? "Crear Prueba" : "Cargando club..."}
          </button>
        </div>
      )}

      <div className="search-input-wrapper">
        <img src={iconBuscador} alt="Buscar" className="icon-small buscador-img" />
        <input
          type="text"
          placeholder="Buscar pruebas..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
    </div>
  );
}

export default PruebasHeader;