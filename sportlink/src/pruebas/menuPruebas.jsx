import "./menuPruebas.css";

function MenuPruebas({
  deporte,
  setDeporte,
  categoria,
  setCategoria,
  zona,
  setZona,
}) {
  return (
    <div className="menu-pruebas">
      <div className="menu-titulo-seccion">
        <h3>FILTROS</h3>
        <p>REFINÁ TU BÚSQUEDA</p>
      </div>

      <div className="select-wrapper">
        <select value={deporte} onChange={(e) => setDeporte(e.target.value)}>
          <option value="">Deporte</option>
          <option value="Fútbol">Fútbol</option>
          <option value="Hockey">Hockey</option>
          <option value="Padel">Padel</option>
          <option value="Basket">Basket</option>
        </select>
      </div>

      <div className="select-wrapper">
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Categoría</option>
          <option value="Primera">Primera</option>
          <option value="Reserva">Reserva</option>
          <option value="Juveniles">Juveniles</option>
        </select>
      </div>

      <div className="select-wrapper">
        <select value={zona} onChange={(e) => setZona(e.target.value)}>
          <option value="">Zona</option>
          <option value="CABA">CABA</option>
          <option value="Zona Norte">Zona Norte</option>
          <option value="Zona Sur">Zona Sur</option>
          <option value="Zona Oeste">Zona Oeste</option>
        </select>
      </div>

      <button className="btn-aplicar-filtros">APLICAR FILTROS</button>
    </div>
  );
}

export default MenuPruebas;