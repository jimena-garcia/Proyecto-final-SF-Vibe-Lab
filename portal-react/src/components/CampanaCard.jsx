import Ilustracion from '../ui/Ilustracion.jsx';
import { pesos } from '../ui/basicos.jsx';
import { alClicInterno, urlCampana } from '../lib/navegacion.js';
import { construirParadas, faltante, formatoPorcentaje, porcentaje } from '../lib/progreso.js';
import { MARCA } from '../marca.js';

/** Imagen de la campaña con la barra de avance pegada abajo (patrón de crowdfunding). */
export function ImagenCampana({ campana, className = '' }) {
  const pct = Math.min(100, porcentaje(campana.recaudado, campana.meta));
  return (
    <div className={`imagen-campana ${className}`}>
      <div className="imagen-campana__media">
        <Ilustracion tipo={campana.ilustracion} />
      </div>
      <div
        className="imagen-campana__barra"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={`Avance de ${campana.nombre}: ${formatoPorcentaje(porcentaje(campana.recaudado, campana.meta))}`}
      >
        <div style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Línea de datos: % financiado y lo que falta para la siguiente meta (o la final). */
export function DatosCampana({ campana }) {
  const pct = porcentaje(campana.recaudado, campana.meta);
  const siguiente = construirParadas(campana).find((p) => p.siguiente);
  const falta = faltante(campana.recaudado, campana.meta);
  let detalle;
  if (falta === 0) detalle = 'Meta alcanzada';
  else if (siguiente && !siguiente.destino) detalle = `Siguiente meta: ${siguiente.titulo}`;
  else detalle = `Faltan ${pesos(falta)}`;
  return (
    <p className="datos-campana cifra">
      <strong>{formatoPorcentaje(pct)} financiado</strong> · {pesos(campana.recaudado)} de {pesos(campana.meta)}
      <span className="datos-campana__detalle">{detalle}</span>
    </p>
  );
}

/** Tarjeta del listado: toda la tarjeta enlaza a la página de la campaña. */
export function CampanaCard({ campana }) {
  const url = urlCampana(campana.id);
  return (
    <article className="tarjeta">
      <ImagenCampana campana={campana} />
      <div className="tarjeta__cuerpo">
        <span className="tarjeta__avatar" aria-hidden="true">
          SV
        </span>
        <div>
          <h3>
            <a href={url} onClick={alClicInterno(url)}>
              {campana.nombre}
            </a>
          </h3>
          <p className="tarjeta__organizador">{MARCA.organizador}</p>
          <DatosCampana campana={campana} />
        </div>
      </div>
    </article>
  );
}

export function CampanaCardEsqueleto() {
  return (
    <div className="tarjeta" aria-hidden="true">
      <div className="esqueleto" style={{ aspectRatio: '16 / 10', borderRadius: 8 }} />
      <div className="esqueleto esqueleto--titulo" style={{ marginTop: 12 }} />
      <div className="esqueleto esqueleto--linea" style={{ width: '60%' }} />
    </div>
  );
}
