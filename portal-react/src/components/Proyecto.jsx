import { useEffect } from 'react';
import Icono from '../ui/Icono.jsx';
import { pesos } from '../ui/basicos.jsx';
import RutaProgreso from './RutaProgreso.jsx';
import DonarForm from './DonarForm.jsx';
import { ImagenCampana } from './CampanaCard.jsx';
import { EVENTO, construirParadas, diasPara, faltante, iniciales } from '../lib/progreso.js';
import { MARCA } from '../marca.js';

const PREGUNTAS = [
  {
    p: '¿Se cobra dinero real?',
    r: 'No. Es un sitio de práctica del programa: los pagos usan Stripe en modo de prueba con tarjetas de prueba.'
  },
  {
    p: '¿Cuándo cuenta mi donación en el avance?',
    r: 'Cuando la pasarela confirma el pago. Las donaciones pendientes o canceladas no suman al avance.'
  },
  {
    p: '¿Qué datos míos se publican?',
    r: 'Solo si eliges "Con reconocimiento": tu nombre y el monto. Las donaciones anónimas y con factura nunca muestran datos. Tu correo y RFC nunca se publican.'
  },
  {
    p: '¿Recibo comprobante?',
    r: 'Sí, al correo que registras, cuando el pago queda confirmado. No es un comprobante fiscal.'
  },
  {
    p: '¿Puedo pedir factura?',
    r: 'Puedes registrar tu solicitud con nombre y RFC; tesorería la ve marcada. En este sitio de práctica no se emiten CFDI.'
  },
  {
    p: '¿Qué pasa si cancelo en la pantalla de pago?',
    r: 'No se te cobra nada y la donación queda cancelada. Puedes intentarlo de nuevo cuando quieras.'
  }
];

/**
 * Página de campaña (patrón de proyecto de crowdfunding): título, imagen + cifras con una sola
 * acción, franja de confianza, pestañas de contenido y panel de donación con el organizador.
 */
export default function Proyecto({ campana }) {
  const parrafos = (campana.descripcion || '').split(/\n\s*\n/).filter(Boolean);
  const [resumen, ...historia] = parrafos;
  const falta = faltante(campana.recaudado, campana.meta);
  const dias = diasPara(EVENTO.fecha);
  const siguiente = construirParadas(campana).find((p) => p.siguiente);
  const donantes = campana.donantes || [];
  const tituloId = `proyecto-${campana.id}`;

  useEffect(() => {
    document.title = `${campana.nombre} · ${MARCA.nombre}`;
  }, [campana.nombre]);

  const irADonar = (e) => {
    e.preventDefault();
    const panel = document.getElementById('donar');
    panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    panel?.focus({ preventScroll: true });
  };

  return (
    <article className="proyecto con-barra" aria-labelledby={tituloId}>
      <header className="proyecto__cabecera contenedor">
        <h1 id={tituloId}>{campana.nombre}</h1>
        {resumen && <p className="proyecto__resumen">{resumen}</p>}
      </header>

      <div className="contenedor proyecto__top">
        <ImagenCampana campana={campana} className="imagen-campana--grande proyecto__imagen" />

        <div className="proyecto__cifras">
          <RutaProgreso campana={campana} grande />
          <dl className="proyecto__datos">
            <div>
              <dd className="cifra">{campana.donacionesPagadas ?? 0}</dd>
              <dt>{campana.donacionesPagadas === 1 ? 'donación confirmada' : 'donaciones confirmadas'}</dt>
            </div>
            <div>
              <dd className="cifra">{dias > 0 ? dias : '—'}</dd>
              <dt>{dias === 1 ? `día para ${EVENTO.nombre}` : dias > 0 ? `días para ${EVENTO.nombre}` : 'el evento ya ocurrió'}</dt>
            </div>
          </dl>
          <a className="btn btn--primario btn--lg btn--bloque btn--cuadrado" href="#donar" onClick={irADonar}>
            Donar a esta campaña
          </a>
          <p className="proyecto__nota">
            Solo cuentan los pagos confirmados por la pasarela. Eliges si tu nombre aparece o no.
          </p>
        </div>
      </div>

      <section className="confianza" aria-label="Cómo protegemos tu donación">
        <div className="contenedor confianza__grid">
          <p>
            <Icono nombre="candado" tam={22} /> Pagas en Stripe; nunca vemos ni guardamos tu tarjeta.
          </p>
          <p>
            <Icono nombre="escudo" tam={22} /> El avance solo suma pagos confirmados por la pasarela.
          </p>
          <p>
            <Icono nombre="usuarios" tam={22} /> Tú decides: anónima, con reconocimiento o con factura.
          </p>
        </div>
      </section>

      <nav className="pestanas" aria-label="Secciones de la campaña">
        <div className="contenedor pestanas__lista">
          <a href="#historia">Campaña</a>
          <a href="#metas">Metas</a>
          <a href="#apoyan">
            Quiénes apoyan <span className="pestanas__num cifra">{donantes.length}</span>
          </a>
          <a href="#preguntas">Preguntas frecuentes</a>
        </div>
      </nav>

      <div className="contenedor proyecto__cuerpo">
        <div className="proyecto__principal">
          <section className="bloque bloque--primero" id="historia" aria-labelledby="historia-titulo">
            <h2 id="historia-titulo">La historia</h2>
            {(historia.length ? historia : [resumen]).filter(Boolean).map((p, i) => (
              <p key={i} className="detalle__historia">
                {p}
              </p>
            ))}
          </section>

          <section className="bloque" id="metas" aria-labelledby="metas-titulo" tabIndex={-1}>
            <h2 id="metas-titulo">{(campana.hitos || []).length > 1 ? 'Metas de la campaña' : 'Meta de la campaña'}</h2>
            <p className="bloque__sub">
              {(campana.hitos || []).length > 1
                ? 'Son acumulativas: cada una se alcanza cuando el total recaudado llega a su monto.'
                : 'Solo cuentan los pagos confirmados por la pasarela.'}
            </p>
            <div style={{ marginTop: 20 }}>
              <RutaProgreso campana={campana} soloMetas />
            </div>
          </section>

          <section className="bloque" id="apoyan" aria-labelledby="donantes-titulo">
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

          <section className="bloque" id="preguntas" aria-labelledby="preguntas-titulo">
            <h2 id="preguntas-titulo">Preguntas frecuentes</h2>
            <div className="preguntas">
              {PREGUNTAS.map((q) => (
                <details key={q.p}>
                  <summary>{q.p}</summary>
                  <p>{q.r}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="detalle__lateral" aria-label="Organizador y donación">
          <div className="organizador">
            <span className="organizador__avatar" aria-hidden="true">
              SV
            </span>
            <div>
              <p className="organizador__nombre">{MARCA.organizador}</p>
              <p className="organizador__sub">
                {MARCA.aliados} · {MARCA.ciudad}
              </p>
            </div>
            <p className="organizador__desc">{MARCA.descripcionOrganizador}</p>
          </div>
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
