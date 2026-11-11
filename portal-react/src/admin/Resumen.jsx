import api from './api.js';
import { Cabecera, EstadoCarga, useCarga } from './comun.jsx';
import { pesos } from '../ui/basicos.jsx';
import RutaProgreso from '../components/RutaProgreso.jsx';

/** Vista general: lo que coordinación y tesorería necesitan ver primero. */
export default function Resumen() {
  const [estado, recargar] = useCarga(() => api.getResumen(), []);
  const r = estado.datos;

  const indicadores = r && [
    { valor: pesos(r.recaudadoActivas), etiqueta: 'Recaudado en campañas activas', nota: 'Solo pagos confirmados', destino: '#/donaciones/pagadas', principal: true },
    { valor: r.donacionesPagadas, etiqueta: 'Donaciones confirmadas', destino: '#/donaciones/pagadas' },
    { valor: r.pendientes, etiqueta: 'Pendientes de pago', destino: '#/donaciones/pendientes' },
    { valor: r.facturasPorAtender, etiqueta: 'Facturas por atender', nota: 'Pagadas que solicitan factura', destino: '#/donaciones/factura', alerta: r.facturasPorAtender > 0 },
    { valor: r.avisosRechazados7d, etiqueta: 'Avisos rechazados (7 días)', destino: '#/avisos/rechazados', alerta: r.avisosRechazados7d > 0 }
  ];

  return (
    <>
      <Cabecera titulo="Resumen" descripcion="Cómo va la recaudación y qué necesita tu atención." />
      <EstadoCarga estado={estado} reintentar={recargar}>
        {r && (
          <>
            <div className="adm-kpis">
              {indicadores.map((i) => (
                <a key={i.etiqueta} href={i.destino} className={`adm-kpi ${i.principal ? 'adm-kpi--principal' : ''} ${i.alerta ? 'adm-kpi--alerta' : ''}`}>
                  <span className="adm-kpi__valor cifra">{i.valor}</span>
                  <span className="adm-kpi__etiqueta">{i.etiqueta}</span>
                  {i.nota && <span className="adm-kpi__nota">{i.nota}</span>}
                </a>
              ))}
            </div>

            <section className="adm-seccion" aria-labelledby="res-campanas">
              <div className="adm-seccion__cab">
                <h2 id="res-campanas">Campañas</h2>
                <a className="btn btn--secundario" href="#/campanas/nueva">
                  Nueva campaña
                </a>
              </div>
              <ul className="adm-lista">
                {r.campanas.map((c) => (
                  <li key={c.id} className="adm-fila-campana">
                    <div className="adm-fila-campana__cab">
                      <a href={`#/campanas/${c.id}`} className="adm-enlace-fuerte">
                        {c.nombre}
                      </a>
                      <span className="adm-etiquetas">
                        {c.destacada && <span className="badge badge--destacada">Destacada</span>}
                        <span className={`badge ${c.activa ? 'badge--pagada' : 'badge--cancelada'}`}>{c.activa ? 'Activa' : 'Inactiva'}</span>
                      </span>
                    </div>
                    <RutaProgreso campana={c} compacta />
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </EstadoCarga>
    </>
  );
}
