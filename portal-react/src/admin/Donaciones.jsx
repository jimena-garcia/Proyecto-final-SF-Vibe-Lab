import { useEffect, useState } from 'react';
import api from './api.js';
import { Cabecera, EstadoCarga, fecha, modalidad, useCarga } from './comun.jsx';
import { EstadoBadge, pesos } from '../ui/basicos.jsx';

const FILTROS = [
  { id: 'todas', texto: 'Todas' },
  { id: 'pendientes', texto: 'Pendientes' },
  { id: 'pagadas', texto: 'Pagadas' },
  { id: 'canceladas', texto: 'Canceladas' },
  { id: 'factura', texto: 'Solicitan factura' },
  { id: 'pasarela', texto: 'Confirmadas por Stripe' }
];

/** HU-09 (todas con su información clave), HU-07 (facturas) y HU-15 (confirmación automática vs manual). */
export default function Donaciones({ filtro }) {
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [abierta, setAbierta] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setBusqueda(texto), 350);
    return () => clearTimeout(t);
  }, [texto]);

  const [estado, recargar] = useCarga(() => api.getDonaciones(filtro, busqueda), [filtro, busqueda]);
  const lista = estado.datos || [];
  const total = lista.filter((d) => d.estado === 'Pagada').reduce((s, d) => s + (Number(d.monto) || 0), 0);

  return (
    <>
      <Cabecera titulo="Donaciones" descripcion="Pagos registrados en el sitio. El estado lo define Stripe; aquí solo se consulta." />

      <div className="adm-filtros" role="tablist" aria-label="Filtrar donaciones">
        {FILTROS.map((f) => (
          <a key={f.id} role="tab" aria-selected={filtro === f.id} className="adm-filtro" href={`#/donaciones/${f.id}`}>
            {f.texto}
          </a>
        ))}
      </div>

      <div className="adm-barra">
        <label className="sr-only" htmlFor="buscar">
          Buscar
        </label>
        <input id="buscar" className="input adm-buscar" type="search" placeholder="Buscar por folio, donante o campaña" value={texto} onChange={(e) => setTexto(e.target.value)} />
        <p className="adm-texto-2 cifra" aria-live="polite">
          {estado.datos ? `${lista.length} resultado${lista.length === 1 ? '' : 's'} · ${pesos(total)} pagados` : ''}
        </p>
      </div>

      <EstadoCarga estado={estado} reintentar={recargar} vacio={estado.datos && lista.length === 0 && 'No hay donaciones con este filtro.'}>
        <div className="adm-tabla-envoltura">
          <table className="adm-tabla">
            <thead>
              <tr>
                <th scope="col">Folio</th>
                <th scope="col">Fecha</th>
                <th scope="col">Donante</th>
                <th scope="col">Modalidad</th>
                <th scope="col">Campaña</th>
                <th scope="col" className="num">Monto</th>
                <th scope="col">Estado</th>
                <th scope="col">
                  <span className="sr-only">Detalle</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.map((d) => (
                <FilaDonacion key={d.id} d={d} abierta={abierta === d.id} alternar={() => setAbierta(abierta === d.id ? null : d.id)} />
              ))}
            </tbody>
          </table>
        </div>
      </EstadoCarga>
    </>
  );
}

function FilaDonacion({ d, abierta, alternar }) {
  return (
    <>
      <tr className={abierta ? 'adm-fila--abierta' : ''}>
        <td data-titulo="Folio" className="cifra nowrap">{d.folio}</td>
        <td data-titulo="Fecha" className="nowrap">{fecha(d.fechaPago || d.creada)}</td>
        <td data-titulo="Donante">{d.modalidad === 'Anonima' ? <span className="adm-texto-2">Anónimo</span> : d.nombre}</td>
        <td data-titulo="Modalidad">
          {modalidad(d.modalidad)}
          {d.solicitaFactura && <span className="badge badge--destacada" style={{ marginLeft: 6 }}>Factura</span>}
        </td>
        <td data-titulo="Campaña">{d.campana}</td>
        <td data-titulo="Monto" className="num cifra">{pesos(d.monto)}</td>
        <td data-titulo="Estado">
          <EstadoBadge estado={d.estado} />
          {d.confirmadaPor && <span className="adm-texto-2 adm-sub">{d.confirmadaPor === 'Pasarela' ? 'Por Stripe' : 'Manual'}</span>}
        </td>
        <td className="acciones">
          <button type="button" className="btn btn--texto" aria-expanded={abierta} onClick={alternar}>
            {abierta ? 'Ocultar' : 'Detalle'}
          </button>
        </td>
      </tr>
      {abierta && (
        <tr className="adm-detalle">
          <td colSpan={8}>
            <dl>
              <div>
                <dt>Correo</dt>
                <dd>{d.email || '—'}</dd>
              </div>
              {d.modalidad === 'Factura' && (
                <>
                  <div>
                    <dt>Nombre o razón social</dt>
                    <dd>{d.nombre}</dd>
                  </div>
                  <div>
                    <dt>RFC</dt>
                    <dd className="cifra">{d.rfc}</dd>
                  </div>
                </>
              )}
              <div>
                <dt>Registrada</dt>
                <dd>{fecha(d.creada)}</dd>
              </div>
              <div>
                <dt>Pagada</dt>
                <dd>{fecha(d.fechaPago)}</dd>
              </div>
              <div>
                <dt>Confirmada por</dt>
                <dd>{d.confirmadaPor === 'Pasarela' ? 'Stripe (automática)' : d.confirmadaPor === 'Manual' ? 'Manual (staff)' : '—'}</dd>
              </div>
              <div>
                <dt>Comprobante</dt>
                <dd>{d.comprobanteEnviado ? 'Enviado' : 'No enviado'}</dd>
              </div>
              {d.motivoCancelacion && (
                <div>
                  <dt>Motivo de cancelación</dt>
                  <dd>{d.motivoCancelacion}</dd>
                </div>
              )}
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}
