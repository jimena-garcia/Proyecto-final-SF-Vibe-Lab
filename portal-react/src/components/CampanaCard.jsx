import { useState } from 'react';
import { pesos } from '../validacion.js';

export default function CampanaCard({ campana, onDonar }) {
  const [verDonantes, setVerDonantes] = useState(false);
  const recaudado = Number(campana.recaudado || 0);
  const meta = Number(campana.meta || 0);
  const pct = meta > 0 ? Math.min(100, (recaudado / meta) * 100) : 0;
  const donantes = campana.donantes || [];

  return (
    <article className="tarjeta">
      <h2>{campana.nombre}</h2>
      {campana.descripcion && <p className="descripcion">{campana.descripcion}</p>}

      <div className="avance">
        <div
          className="barra"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-label={`Avance de ${campana.nombre}`}
        >
          <div className="relleno" style={{ width: `${pct}%` }} />
        </div>
        <p className="cifras">
          <strong>{pesos(recaudado)}</strong> de {pesos(meta)} · {pct.toFixed(0)}%
        </p>
      </div>

      <button className="boton primario" onClick={onDonar}>
        Donar a esta campaña
      </button>

      <div className="donantes">
        <button className="enlace" onClick={() => setVerDonantes(!verDonantes)} aria-expanded={verDonantes}>
          {verDonantes ? 'Ocultar donantes' : `Ver donantes (${donantes.length})`}
        </button>
        {verDonantes &&
          (donantes.length === 0 ? (
            <p className="vacio">Aún no hay donantes con reconocimiento público.</p>
          ) : (
            <ul>
              {donantes.map((d, i) => (
                <li key={i}>
                  <span>{d.nombre}</span>
                  <span>{pesos(d.monto)}</span>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </article>
  );
}
