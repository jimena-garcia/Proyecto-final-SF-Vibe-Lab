import { Boton, pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';
import Ilustracion from '../ui/Ilustracion.jsx';
import { CampanaCard, CampanaCardEsqueleto, DatosCampana, ImagenCampana } from './CampanaCard.jsx';
import ComoFunciona from './ComoFunciona.jsx';
import { EVENTO, diasPara, elegirDestacada } from '../lib/progreso.js';
import { alClicInterno, urlCampana, urlMasCampanas } from '../lib/navegacion.js';
import { MARCA } from '../marca.js';

const normalizar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Portada de descubrimiento: titular, banner del programa y una sola campaña principal.
 */
export default function Inicio({ estado, reintentar, busqueda = '', limpiarBusqueda, masCampanas = false }) {
  const { campanas, error } = estado;
  const lista = campanas || [];
  const destacada = campanas ? elegirDestacada(lista) : null;
  const total = lista.reduce((s, c) => s + (Number(c.recaudado) || 0), 0);
  const donaciones = lista.reduce((s, c) => s + (Number(c.donacionesPagadas) || 0), 0);
  const dias = diasPara(EVENTO.fecha);
  const q = normalizar(busqueda.trim());
  const filtradas = q ? lista.filter((c) => normalizar(`${c.nombre} ${c.descripcion}`).includes(q)) : lista;

  return (
    <>
      <section className="portada" aria-labelledby="portada-titulo">
        <div className="contenedor">
          <h1 id="portada-titulo" className="portada__titulo">
            Ayuda a que estudiantes lleguen a la comunidad que los impulsa
          </h1>
          <div className="banner">
            <div className="banner__texto">
              <p className="banner__eyebrow">{MARCA.lema}</p>
              <p className="banner__titular">
                Cada aporte acerca a un alumno de Mérida a los eventos de la comunidad Salesforce.
              </p>
              <dl className="banner__datos">
                <div>
                  <dt>Recaudado en campañas abiertas</dt>
                  <dd className="cifra">{campanas ? pesos(total) : '—'}</dd>
                </div>
                <div>
                  <dt>Donaciones confirmadas</dt>
                  <dd className="cifra">{campanas ? donaciones : '—'}</dd>
                </div>
                <div>
                  <dt>{dias > 0 ? `Días para ${EVENTO.nombre}` : `${EVENTO.nombre}`}</dt>
                  <dd className="cifra">{dias > 0 ? dias : 'Concluido'}</dd>
                </div>
              </dl>
            </div>
            <div className="banner__arte" aria-hidden="true">
              {destacada?.imagenUrl ? (
                <img className="banner__foto" src={destacada.imagenUrl} alt="" decoding="async" />
              ) : (
                <Ilustracion tipo="General" />
              )}
            </div>
          </div>
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
          </div>
        </section>
      )}

      {campanas && lista.length === 0 && (
        <div className="contenedor vacio">
          <h2>Por ahora no hay campañas abiertas</h2>
          <p>Cuando la coordinación del programa publique una campaña, aparecerá aquí.</p>
        </div>
      )}

      {destacada && !q && !masCampanas && (
        <section className="seccion seccion--vitrina" aria-label="Campaña principal">
          <div className="contenedor vitrina vitrina--principal">
            <h2 className="vitrina__titulo">Objetivo principal</h2>
            <Destacada campana={destacada} />
            <a className="vitrina__mas" href={urlMasCampanas()} onClick={alClicInterno(urlMasCampanas())}>
              Más campañas
            </a>
          </div>
        </section>
      )}

      {campanas && lista.length > 0 && (masCampanas || q) && (
        <section className="seccion seccion--explorar" id="campanas" aria-labelledby="explorar-titulo" tabIndex={-1}>
          <div className="contenedor">
            <div className="vitrina__cab">
              <h2 className="vitrina__titulo" id="explorar-titulo">
                {q ? `Resultados para “${busqueda.trim()}”` : 'Más campañas'}
              </h2>
              {q && (
                <button type="button" className="btn btn--texto" onClick={limpiarBusqueda}>
                  Limpiar búsqueda
                </button>
              )}
            </div>
            {filtradas.length === 0 ? (
              <p className="vacio">No encontramos campañas con ese texto.</p>
            ) : (
              <div className="rejilla rejilla--tres">
                {filtradas.map((c) => (
                  <CampanaCard key={c.id} campana={c} />
                ))}
              </div>
            )}
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
  const dias = diasPara(EVENTO.fecha);
  const donaciones = campana.donacionesPagadas ?? 0;
  return (
    <article className="destacada" aria-labelledby={`dest-${campana.id}`}>
      <a href={url} onClick={alClicInterno(url)} tabIndex={-1} aria-hidden="true" className="destacada__enlace-imagen">
        <ImagenCampana campana={campana} className="imagen-campana--grande" />
      </a>
      <div className="tarjeta__cuerpo">
        <span className="tarjeta__avatar" aria-hidden="true">
          SV
        </span>
        <div>
          <h3 id={`dest-${campana.id}`} className="destacada__titulo">
            <a href={url} onClick={alClicInterno(url)}>
              {campana.nombre}
            </a>
          </h3>
          <p className="tarjeta__organizador">{MARCA.organizador}</p>
          {resumen && <p className="destacada__desc">{resumen}</p>}
          <DatosCampana campana={campana} />
          <dl className="destacada__franja">
            <div><dt>Recaudado</dt><dd className="cifra">{pesos(campana.recaudado)}</dd></div>
            <div><dt>Aportes confirmados</dt><dd className="cifra">{donaciones}</dd></div>
            <div><dt>Días para {EVENTO.nombre}</dt><dd className="cifra">{dias > 0 ? dias : 'Concluido'}</dd></div>
          </dl>
          <a className="btn btn--contribuir btn--lg btn--bloque destacada__accion" href={url} onClick={alClicInterno(url)}>
            Ver campaña y contribuir
          </a>
        </div>
      </div>
    </article>
  );
}
