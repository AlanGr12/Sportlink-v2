import { formatearFechaLocal } from "../utils/dateUtils.js";

export const habilidadesDe = (empleo) =>
  (empleo?.habilidadesreq || "").split(",").map((h) => h.trim()).filter(Boolean);

export const datosEmpleo = (empleo) => {
  const publicado = formatearFechaLocal(empleo.fechapublicacion, { day: "numeric", month: "short", year: "numeric" });
  return [
    ["Deporte", empleo.deporte?.deporte],
    ["Jornada", empleo.horasreq != null ? `${empleo.horasreq} hs por semana` : null],
    ["Ubicación", empleo.club?.ubicacion],
    ["Publicada", publicado],
  ].filter(([, valor]) => valor);
};
