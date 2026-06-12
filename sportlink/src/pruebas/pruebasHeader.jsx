import "./pruebasHeader.css";

function PruebasHeader({ busqueda, setBusqueda }) {
  return (
    <div className="pruebas-header">
      <h1>
        PRUEBAS <span className="text-cyan">ACTIVAS</span>
      </h1>

      <p>
        Únete a los desafíos más intensos y compite con los mejores atletas de la región.
      </p>

      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
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