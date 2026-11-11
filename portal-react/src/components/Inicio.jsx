import { Boton, pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';
import Ilustracion from '../ui/Ilustracion.jsx';
import { CampanaCard, CampanaCardEsqueleto } from './CampanaCard.jsx';
import ComoFunciona from './ComoFunciona.jsx';
import RutaProgreso from './RutaProgreso.jsx';
import { EVENTO, diasPara, elegirDestacada, faltante, formatoPorcentaje, porcentaje } from '../lib/progreso.js';
import { alClicInterno, urlCampana, urlInicio } from '../lib/navegacion.js';

/**
 * Portada de descubrimiento (inspirada funcionalmente en Kickstarter):
 * banner con cifras del programa → campaña destacada + recomendadas → explorar todas.
 * Cada campaña abre su página de proyecto (?campana=<Id>).
 * "Recomendadas" no es personalizado (no hay login): se ordena por avance, y se dice así.
 */
export default function Inicio({ estado, reintentar }) {
  const { campanas, error } = estado;
  const lista = campanas || [];
  const destacada = campanas ? elegirDestacada(lista) : null;
  const otras = lista.filter((c) => c !== destacada);
  const recomendadas = [...otras].sort((a, b) => porcentaje(b.recaudado, b.meta) - porcentaje(a.recaudado, a.meta)).slice(0, 3);
  const total = lista.reduce((s, c) => s + (Number(c.recaudado) || 0), 0);
  const donaciones = lista.reduce((s, c) => s + (Number(c.donacionesPagadas) || 0), 0);
  const dias = diasPara(EVENTO.fecha);

  return (
    <>
      <section className="hero" aria-labelledby="hero-titulo">
        <div className="contenedor hero__grid">
          <div>
            <p className="eyebrow hero__eyebrow">SF Vibe Lab · UADY × Salesforce · Mérida</p>
            <h1 id="hero-titulo">
              Del aula en Mérida a <em>Mexico Dreamin</em>.
            </h1>
            <p className="hero__lead">
              Alumnos del programa quieren llegar al evento de la comunidad Salesforce del 20 de noviembre en la Ciudad de México.
              Elige una campaña y acorta la distancia.
            </p>
            <div className="hero__acciones">
              {destacada && (
                <a className="btn btn--claro btn--lg" href={urlCampana(destacada.id)} onClick={alClicInterno(urlCampana(destacada.id))}>
                  Apoyar la campaña principal <Icono nombre="flecha" />
                </a>
              )}
              <a className="btn btn--fantasma-claro btn--lg" href={`${urlInicio()}#campanas`} onClick={alClicInterno(urlInicio(), 'campanas')}>
                Explorar
              </a>
            </div>
          </div>
          <dl className="hero__datos">
            <div className="dato--ancho">
              <dt className="dato__etiqueta">Recaudado en campañas abiertas</dt>
              <dd className="dato__valor cifra">{campanas ? pesos(total) : '—'}</dd>
            </div>
            <div>
              <dt className="dato__etiqueta">Donaciones confirmadas</dt>
              <dd className="dato__valor cifra">{campanas ? donaciones : '—'}</dd>
            </div>
            <div>
              <dt className="dato__etiqueta">{dias > 0 ? 'Días para el evento' : 'El evento ya ocurrió'}</dt>
              <dd className="dato__valor cifra">{dias > 0 ? dias : '—'}</dd>
            </div>
          </dl>
        </div>
      </section>

      {error && (
        <div className="contenedor">
          <div className="vacio" role="alert">
            <h2>No pudimos cargar las campañas</h2>
            <p>{error}</p>
            <Boton variante="secundario" onClick={reintentar}>
              <Icono nombre="actualizar" /> Intentar de nuevo
            </Boton>
          </div>
        </div>
      )}

      {!error && !campanas && (
        <section className="seccion contenedor" aria-busy="true" aria-label="Cargando campañas">
          <div className="vitrina">
            <CampanaCardEsqueleto />
            <div>
              <div className="esqueleto esqueleto--titulo" />
              <div className="esqueleto" style={{ height: 80, marginTop: 16 }} />
              <div className="esqueleto" style={{ height: 80, marginTop: 12 }} />
            </div>
          </div>
        </section>
      )}

      {campanas && lista.length === 0 && (
        <div className="contenedor vacio">
          <div className="marco-ilustracion" style={{ maxWidth: 320, margin: '0 auto' }}>
            <Ilustracion />
          </div>
          <h2>Por ahora no hay campañas abiertas</h2>
          <p>Cuando la coordinación del programa publique una campaña, aparecerá aquí.</p>
        </div>
      )}

      {destacada && (
        <section className="seccion" aria-label="Campaña destacada y recomendadas">
          <div className={`contenedor vitrina ${recomendadas.length ? '' : 'vitrina--sola'}`}>
            <Destacada campana={destacada} />
            {recomendadas.length > 0 && (
              <aside className="recomendadas" aria-labelledby="recomendadas-titulo">
                <p className="eyebrow">Recomendadas</p>
                <h2 id="recomendadas-titulo" className="sr-only">
                  Campañas recomendadas
                </h2>
                <p className="recomendadas__sub">Las que van más avanzadas hacia su meta.</p>
                <ul>
                  {recomendadas.map((c) => (
                    <Recomendada key={c.id} campana={c} />
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </section>
      )}

      {otras.length > 0 && (
        <section className="seccion seccion--explorar" id="campanas" aria-labelledby="explorar-titulo" tabIndex={-1}>
          <div className="contenedor">
            <p className="eyebrow">Explorar</p>
            <h2 className="titulo-seccion" id="explorar-titulo">
              Todas las campañas abiertas
            </h2>
            <div className="rejilla rejilla--tres">
              {[destacada, ...otras].map((c) => (
                <CampanaCard key={c.id} campana={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ComoFunciona />
    </>
  );
}

function Destacada({ campana }) {
  const url = urlCampana(campana.id);
  const resumen = (campana.descripcion || '').split(/\n\s*\n/)[0];
  return (
    <article className="destacada" aria-labelledby={`dest-${campana.id}`}>
      <a className="marco-ilustracion destacada__imagen" href={url} onClick={alClicInterno(url)} tabIndex={-1} aria-hidden="true">
        <Ilustracion tipo={campana.ilustracion} />
      </a>
      <p className="eyebrow destacada__eyebrow">Campaña destacada</p>
      <h2 id={`dest-${campana.id}`} className="destacada__titulo">
        <a href={url} onClick={alClicInterno(url)}>
          {campana.nombre}
        </a>
      </h2>
      {resumen && <p className="destacada__desc">{resumen}</p>}
      <RutaProgreso campana={campana} />
      <div>
        <a className="btn btn--primario" href={url} onClick={alClicInterno(url)}>
          Ver campaña y donar <Icono nombre="flecha" />
        </a>
      </div>
    </article>
  );
}

function Recomendada({ campana }) {
  const url = urlCampana(campana.id);
  const pct = porcentaje(campana.recaudado, campana.meta);
  const falta = faltante(campana.recaudado, campana.meta);
  return (
    <li className="recomendada">
      <div className="marco-ilustracion recomendada__img" aria-hidden="true">
        <Ilustracion tipo={campana.ilustracion} />
      </div>
      <div className="recomendada__cuerpo">
        <h3>
          <a href={url} onClick={alClicInterno(url)}>
            {campana.nombre}
          </a>
        </h3>
        <div className="recomendada__pista" aria-hidden="true">
          <div style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
        <p className="recomendada__datos cifra">
          {formatoPorcentaje(pct)} · {falta > 0 ? `faltan ${pesos(falta)}` : 'meta alcanzada'}
        </p>
      </div>
    </li>
  );
}
