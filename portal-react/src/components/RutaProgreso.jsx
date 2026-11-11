import { pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';
import { construirParadas, faltante, formatoPorcentaje, porcentaje } from '../lib/progreso.js';

/**
 * Progreso de una campaña con metas escalonadas (acumulativas).
 * - por defecto / compacta: cifra + pista con las metas marcadas + siguiente meta.
 * - grande: versión del bloque de cifras de la página de proyecto.
 * - soloMetas: lista de metas con el avance del tramo en curso.
 * Las metas vienen de Salesforce (Hito__c). Sin metas configuradas, solo existe la meta final.
 */
export default function RutaProgreso({ campana, compacta = false, grande = false, soloMetas = false }) {
  const recaudado = Number(campana.recaudado) || 0;
  const pct = porcentaje(recaudado, campana.meta);
  const paradas = construirParadas(campana);

  if (soloMetas) return <ListaMetas paradas={paradas} recaudado={recaudado} />;

  const siguiente = paradas.find((p) => p.siguiente);
  const falta = faltante(recaudado, campana.meta);
  const metaAlcanzada = falta === 0 && Number(campana.meta) > 0;
  const varias = paradas.length > 1;

  let estado;
  if (metaAlcanzada) {
    estado = (
      <p className="ruta__estado ruta__estado--meta">
        <strong>Meta final alcanzada.</strong> Gracias a cada persona que aportó.
      </p>
    );
  } else if (varias && siguiente && !siguiente.destino) {
    estado = (
      <p className="ruta__estado">
        Siguiente meta: <strong>{siguiente.titulo}</strong> · faltan <strong className="cifra">{pesos(siguiente.monto - recaudado)}</strong>
      </p>
    );
  } else {
    estado = (
      <p className="ruta__estado">
        Faltan <strong className="cifra">{pesos(falta)}</strong> para la meta{varias ? ' final' : ''}
      </p>
    );
  }

  const clases = ['ruta', compacta && 'ruta--compacta', grande && 'ruta--grande'].filter(Boolean).join(' ');
  return (
    <div className={clases} style={{ '--avance': `${Math.min(100, pct)}%` }}>
      <div className="ruta__cifras">
        <span className="ruta__recaudado cifra">{pesos(recaudado)}</span>
        <span className="ruta__meta cifra">
          {grande ? `recaudados de ${pesos(campana.meta)} · ${formatoPorcentaje(pct)}` : `${formatoPorcentaje(pct)} de ${pesos(campana.meta)}`}
        </span>
      </div>
      <div
        className="ruta__pista"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.min(100, pct))}
        aria-valuetext={`${pesos(recaudado)} recaudados de ${pesos(campana.meta)}`}
        aria-label={`Avance de ${campana.nombre}`}
      >
        <div className="ruta__recorrido" />
        {paradas.map((p) => (
          <span
            key={`${p.monto}-${p.titulo}`}
            className={[
              'ruta__parada',
              p.alcanzada && 'ruta__parada--alcanzada',
              p.siguiente && 'ruta__parada--siguiente',
              p.destino && 'ruta__parada--destino'
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ left: `${p.posicion}%` }}
            title={`${p.titulo}: ${pesos(p.monto)}`}
            aria-hidden="true"
          />
        ))}
      </div>
      {estado}
    </div>
  );
}

function ListaMetas({ paradas, recaudado }) {
  return (
    <ol className="metas">
      {paradas.map((p, i) => {
        const desde = i === 0 ? 0 : paradas[i - 1].monto;
        const tramo = p.siguiente ? Math.max(0, Math.min(100, ((recaudado - desde) / (p.monto - desde)) * 100)) : null;
        const estado = p.alcanzada ? 'alcanzada' : p.siguiente ? 'siguiente' : 'pendiente';
        return (
          <li key={`${p.monto}-${p.titulo}`} className={`meta meta--${estado}`}>
            <span className="meta__marca" aria-hidden="true">
              {p.alcanzada ? <Icono nombre="check" tam={16} /> : i + 1}
            </span>
            <div className="meta__cuerpo">
              <div className="meta__cabecera">
                <p className="meta__numero">
                  {paradas.length > 1 ? `Meta ${i + 1}` : 'Meta'}
                  {p.destino && paradas.length > 1 ? ' · final' : ''}
                </p>
                <p className="meta__monto cifra">{pesos(p.monto)}</p>
              </div>
              <h3 className="meta__titulo">{p.titulo}</h3>
              {p.descripcion && <p className="meta__desc">{p.descripcion}</p>}
              {p.alcanzada && <p className="meta__estado meta__estado--ok">Alcanzada</p>}
              {p.siguiente && (
                <div className="meta__tramo">
                  <div className="meta__tramo-pista" aria-hidden="true">
                    <div style={{ width: `${tramo}%` }} />
                  </div>
                  <p className="meta__estado">
                    En curso · faltan <span className="cifra">{pesos(p.monto - recaudado)}</span>
                  </p>
                </div>
              )}
              {!p.alcanzada && !p.siguiente && <p className="meta__estado">Se desbloquea al llegar a {pesos(p.monto)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
