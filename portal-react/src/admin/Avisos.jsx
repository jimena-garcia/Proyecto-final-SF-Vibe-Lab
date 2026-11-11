import api from './api.js';
import { Cabecera, EstadoCarga, fecha, resultadoAviso, useCarga } from './comun.jsx';

/** HU-15 y HU-17: qué avisos de Stripe llegaron, cuáles se aceptaron y por qué se rechazaron otros. */
export default function Avisos({ soloRechazados }) {
  const [estado, recargar] = useCarga(() => api.getAvisos(soloRechazados), [soloRechazados]);
  const lista = estado.datos || [];

  return (
    <>
      <Cabecera
        titulo="Avisos de Stripe"
        descripcion="Cada vez que Stripe avisa de un pago queda registrado aquí. Un aviso falso o repetido nunca cambia una donación."
      />
      <div className="adm-filtros" role="tablist" aria-label="Filtrar avisos">
        <a role="tab" aria-selected={!soloRechazados} className="adm-filtro" href="#/avisos">
          Todos
        </a>
        <a role="tab" aria-selected={soloRechazados} className="adm-filtro" href="#/avisos/rechazados">
          Rechazados
        </a>
      </div>

      <EstadoCarga estado={estado} reintentar={recargar} vacio={estado.datos && lista.length === 0 && (soloRechazados ? 'No hay avisos rechazados.' : 'Aún no llegan avisos de Stripe.')}>
        <ul className="adm-avisos">
          {lista.map((a) => {
            const r = resultadoAviso(a.resultado);
            return (
              <li key={a.id} className="adm-aviso">
                <div className="adm-aviso__cab">
                  <span className={`badge badge--${r.clase}`}>{r.texto}</span>
                  <span className="adm-texto-2">{fecha(a.recibido)}</span>
                  {a.donacion && <span className="adm-texto-2">· {a.donacion}</span>}
                </div>
                <p className="adm-aviso__texto">{a.motivo || r.ayuda}</p>
                <details className="adm-aviso__tecnico">
                  <summary>Detalle técnico</summary>
                  <dl>
                    <dt>Folio</dt>
                    <dd>{a.folio}</dd>
                    <dt>Evento</dt>
                    <dd className="cifra">{a.eventoId || '—'}</dd>
                    <dt>Tipo</dt>
                    <dd>{a.tipo || '—'}</dd>
                  </dl>
                </details>
              </li>
            );
          })}
        </ul>
      </EstadoCarga>
    </>
  );
}
