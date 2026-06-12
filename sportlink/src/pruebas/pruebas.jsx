import { useEffect, useState } from "react";
import axios from "axios";

import MenuPruebas from "./menuPruebas";
import PruebasHeader from "./pruebasHeader";

// Importamos los iconos reales desde tu carpeta assets
import iconoMedalla from "../assets/medalla.png";
import iconoUbicacion from "../assets/ubicacion.png";
import iconoFecha from "../assets/fecha.png";

import "./pruebas.css";

function Pruebas() {
  const [pruebas, setPruebas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [deporte, setDeporte] = useState("");
  const [categoria, setCategoria] = useState("");
  const [zona, setZona] = useState("");

  useEffect(() => {
    obtenerPruebas();
  }, []);

  async function obtenerPruebas() {
    try {
      const response = await axios.get("http://localhost:3000/api/pruebas");
      setPruebas(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  const pruebasFiltradas = pruebas.filter((prueba) => {
    const coincideBusqueda =
      prueba.club?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      prueba.descripcion?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideDeporte = deporte === "" || prueba.deporte?.deporte === deporte;
    const coincideCategoria = categoria === "" || prueba.categoria === categoria;
    const coincideZona = zona === "" || prueba.zona === zona;

    return coincideBusqueda && coincideDeporte && coincideCategoria && coincideZona;
  });


  //FALTA CAMBIAR : LOS FILTRAR ZONA Y FILTRAR DEPORTE TIENEN QUE SER LOS MISMO QUE LOS ARRAYS DE REGISTRAR JUGADOR 
  return (
    <div className="contenedor-pruebas">
      <MenuPruebas
        deporte={deporte}
        setDeporte={setDeporte}
        categoria={categoria}
        setCategoria={setCategoria}
        zona={zona}
        setZona={setZona}
      />

      <div className="contenido-pruebas">
        <PruebasHeader busqueda={busqueda} setBusqueda={setBusqueda} />

        <div className="grid-pruebas">
          {pruebasFiltradas.map((prueba) => (
            <div className="card-prueba" key={prueba.idprueba}>
              
              {/* Contenedor de la Imagen principal de la prueba */}
              <div className="card-imagen-wrapper">
                {prueba.imagen ? (
                  <img src={prueba.imagen} alt={prueba.club?.nombre || "prueba"} />
                ) : (
                  <div className="sin-imagen">SIN FOTO</div>
                )}
                <span className="tag-flotante">RECOMENDADO</span>
              </div>

              {/* Contenedor de Textos e Iconos Nuevos */}
              <div className="card-info">
                <h2>{prueba.club?.nombre ? prueba.club.nombre.toUpperCase() : "CLUB DESCONOCIDO"}</h2>
                
                {/* Item 1: Medalla para Deporte */}
                <div className="card-detalle-item">
                  <img src={iconoMedalla} alt="Deporte" className="card-icon-asset" />
                  <p>{prueba.deporte?.deporte || "Deporte"}</p>
                </div>
                
                {/* Item 2: Ubicación */}
                <div className="card-detalle-item">
                  <img src={iconoUbicacion} alt="Ubicación" className="card-icon-asset" />
                  <p>{prueba.zona || "Zona no especificada"}</p>
                </div>
                
                {/* Item 3: Fecha */}
                <div className="card-detalle-item">
                  <img src={iconoFecha} alt="Fecha" className="card-icon-asset" />
                  <p>
                    {prueba.fechaprueba 
                      ? new Date(prueba.fechaprueba).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
                      : "Fecha a confirmar"
                    }
                  </p>
                </div>
              </div>

              {/* Botón de acción */}
              <button className="btn-mas-info">MÁS INFORMACIÓN</button>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pruebas;