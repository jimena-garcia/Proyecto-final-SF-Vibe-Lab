import { useEffect } from 'react';
import Ilustracion from '../ui/Ilustracion.jsx';
import Icono from '../ui/Icono.jsx';
import { pesos } from '../ui/basicos.jsx';
import RutaProgreso from './RutaProgreso.jsx';
import DonarForm from './DonarForm.jsx';
import { EVENTO, construirParadas, diasPara, faltante, iniciales } from '../lib/progreso.js';

/**
 * Página de proyecto (inspirada funcionalmente en Kickstarter): cabecera con el propósito,
 * bloque de cifras con una sola acción, y debajo la historia, las metas escalonadas, los
 * donantes y el panel de donación. Se usa para la campaña principal (portada) y para el
 * detalle de cualquier otra campaña.
 */
export default function Proyecto({ campana, principal = false }) {
  const parrafos = (campana.descripcion || '').split(/\n\s*\n/).filter(Boolean);
  const [resumen, ...historia] = parrafos;
  const falta = faltante(campana.recaudado, campana.meta);
  const dias = diasPara(EVENTO.fecha);
  const siguiente = construirParadas(campana).find((p) => p.siguiente);
  const donantes = campana.donantes || [];
  const tituloId = `proyecto-${campana.id}`;

  useEffect(() => {
    if (!principal) document.title = `${campana.nombre} · Ruta a Mexico Dreamin`;
  }, [campana.nombre, principal]);

  const irADonar = (e) => {
    e.preventDefault();
    const panel = document.getElementById('donar');
    panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    panel?.focus({ preventScroll: true });
  };

  return (
    <article className="proyecto con-barra" aria-labelledby={tituloId}>
      <header className="proyecto__cabecera contenedor">
        <p className="eyebrow">
          {principal ? 'Campaña del programa SF Vibe Lab · UADY' : 'Campaña'} · {EVENTO.nombre}, 20 de noviembre, CDMX
        </p>
        <h1 id={tituloId}>{campana.nombre}</h1>
        {resumen && <p className="proyecto__resumen">{resumen}</p>}
      </header>

      <div className="contenedor proyecto__top">
        <div className="marco-ilustracion proyecto__imagen">
          <Ilustracion tipo={campana.ilustracion} />
        </div>

        <div className="proyecto__cifras">
          <RutaProgreso campana={campana} grande />
          <dl className="proyecto__datos">
            <div>
              <dt className="sr-only">Donaciones confirmadas</dt>
              <dd className="cifra">{campana.donacionesPagadas ?? 0}</dd>
              <p>{campana.donacionesPagadas === 1 ? 'donación confirmada' : 'donaciones confirmadas'}</p>
            </div>
            <div>
              <dt className="sr-only">Días para el evento</dt>
              <dd className="cifra">{dias > 0 ? dias : '—'}</dd>
              <p>{dias === 1 ? 'día para el evento' : dias > 0 ? 'días para el evento' : 'el evento ya ocurrió'}</p>
            </div>
          </dl>
          <a className="btn btn--primario btn--lg btn--bloque" href="#donar" onClick={irADonar}>
            Donar a esta campaña
          </a>
          <p className="proyecto__confianza">
            <Icono nombre="candado" tam={16} /> Pago seguro con Stripe (modo de prueba). Eliges si tu nombre aparece o no.
          </p>
        </div>
      </div>

      <div className="contenedor proyecto__cuerpo">
        <div className="proyecto__principal">
          {historia.length > 0 && (
            <section className="bloque bloque--primero" aria-labelledby="historia-titulo">
              <h2 id="historia-titulo">La historia</h2>
              {historia.map((p, i) => (
                <p key={i} className="detalle__historia" style={{ marginTop: 12 }}>
                  {p}
                </p>
              ))}
            </section>
          )}

          <section className={`bloque ${historia.length ? '' : 'bloque--primero'}`} id="metas" aria-labelledby="metas-titulo" tabIndex={-1}>
            <h2 id="metas-titulo">{(campana.hitos || []).length > 1 ? 'Metas de la campaña' : 'Meta de la campaña'}</h2>
            <p className="bloque__sub">
              {(campana.hitos || []).length > 1
                ? 'Las metas son acumulativas: cada una se alcanza cuando el total recaudado llega a su monto. Solo cuentan los pagos confirmados.'
                : 'Solo cuentan los pagos confirmados por la pasarela.'}
            </p>
            <div style={{ marginTop: 20 }}>
              <RutaProgreso campana={campana} soloMetas />
            </div>
          </section>

          <section className="bloque" aria-labelledby="donantes-titulo">
            <h2 id="donantes-titulo">Quiénes apoyan</h2>
            <p className="bloque__sub">
              Personas que eligieron aparecer con su nombre. Las donaciones anónimas y con factura también suman, pero no se listan.
            </p>
            {donantes.length === 0 ? (
              <p className="proyecto__vacio">Aún no hay donantes con reconocimiento público. Puedes ser la primera persona.</p>
            ) : (
              <ul className="donantes">
                {donantes.map((d, i) => (
                  <li key={`${d.nombre}-${d.monto}-${i}`}>
                    <span className="avatar" aria-hidden="true">
                      {iniciales(d.nombre)}
                    </span>
                    <span className="donantes__nombre">{d.nombre}</span>
                    <span className="cifra">{pesos(d.monto)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="detalle__lateral" aria-label="Donar a esta campaña">
          <div className="panel" id="donar" tabIndex={-1}>
            <DonarForm campana={campana} />
          </div>
        </aside>
      </div>

      <div className="barra-donar">
        <p className="barra-donar__texto">
          <strong className="cifra">{pesos(campana.recaudado)}</strong>
          {falta === 0 ? 'Meta alcanzada' : siguiente && !siguiente.destino ? `Siguiente meta: ${siguiente.titulo}` : `Faltan ${pesos(falta)}`}
        </p>
        <a className="btn btn--primario" href="#donar" onClick={irADonar}>
          Donar
        </a>
      </div>
    </article>
  );
}
