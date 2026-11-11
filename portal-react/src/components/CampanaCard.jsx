import Ilustracion from '../ui/Ilustracion.jsx';
import RutaProgreso from './RutaProgreso.jsx';
import { alClicInterno, urlCampana } from '../lib/navegacion.js';

/** Tarjeta del listado: toda la tarjeta enlaza al detalle de la campaña. */
export function CampanaCard({ campana }) {
  const url = urlCampana(campana.id);
  return (
    <article className="tarjeta">
      <div className="marco-ilustracion">
        <Ilustracion tipo={campana.ilustracion} />
      </div>
      <h3>
        <a href={url} onClick={alClicInterno(url)}>
          {campana.nombre}
        </a>
      </h3>
      {campana.descripcion && <p className="tarjeta__desc">{campana.descripcion}</p>}
      <RutaProgreso campana={campana} compacta />
    </article>
  );
}

export function CampanaCardEsqueleto() {
  return (
    <div className="tarjeta" aria-hidden="true">
      <div className="marco-ilustracion esqueleto" />
      <div className="esqueleto esqueleto--titulo" />
      <div className="esqueleto esqueleto--linea" />
      <div className="esqueleto esqueleto--linea" style={{ width: '80%' }} />
      <div className="esqueleto" style={{ height: 8, marginTop: 16, borderRadius: 999 }} />
    </div>
  );
}
