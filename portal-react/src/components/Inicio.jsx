import { Boton, pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';
import Ilustracion from '../ui/Ilustracion.jsx';
import { CampanaCard, CampanaCardEsqueleto, DatosCampana, ImagenCampana } from './CampanaCard.jsx';
import ComoFunciona from './ComoFunciona.jsx';
import { EVENTO, diasPara, elegirDestacada, porcentaje } from '../lib/progreso.js';
import { alClicInterno, urlCampana } from '../lib/navegacion.js';
import { MARCA } from '../marca.js';

const normalizar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Portada de descubrimiento: titular, banner del programa, campaña destacada +
 * recomendadas, y todas las campañas (filtradas por el buscador del header).
 * "Recomendadas" no es personalizado (no hay login): se ordena por avance y se dice así.
 */
export default function Inicio({ estado, reintentar, busqueda = '', limpiarBusqueda }) {
  const { campanas, error } = estado;
  const lista = campanas || [];
  const destacada = campanas ? elegirDestacada(lista) : null;
  const otras = lista.filter((c) => c !== destacada);
  const recomendadas = [...otras].sort((a, b) => porcentaje(b.recaudado, b.meta) - porcentaje(a.recaudado, a.meta)).slice(0, 4);
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
            <div className="rejilla rejilla--recomendadas">
              <CampanaCardEsqueleto />
              <CampanaCardEsqueleto />
            </div>
          </div>
        </section>
      )}

      {campanas && lista.length === 0 && (
        <div className="contenedor vacio">
          <h2>Por ahora no hay campañas abiertas</h2>
          <p>Cuando la coordinación del programa publique una campaña, aparecerá aquí.</p>
        </div>
      )}

      {destacada && !q && (
        <section className="seccion seccion--vitrina" aria-label="Campaña destacada y recomendadas">
          <div className={`contenedor vitrina ${recomendadas.length ? '' : 'vitrina--sola'}`}>
            <div>
              <h2 className="vitrina__titulo">Campaña destacada</h2>
              <Destacada campana={destacada} />
            </div>
            {recomendadas.length > 0 && (
              <div>
                <div className="vitrina__cab">
                  <h2 className="vitrina__titulo">Recomendadas</h2>
                  <a className="vitrina__mas" href="#campanas" onClick={alClicInterno(window.location.pathname, 'campanas')}>
                    Ver todas
                  </a>
                </div>
                <p className="vitrina__sub">Las que van más avanzadas hacia su meta.</p>
                <div className="rejilla rejilla--recomendadas">
                  {recomendadas.map((c) => (
                    <CampanaCard key={c.id} campana={c} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {campanas && lista.length > 0 && (otras.length > 0 || q) && (
        <section className="seccion seccion--explorar" id="campanas" aria-labelledby="explorar-titulo" tabIndex={-1}>
          <div className="contenedor">
            <div className="vitrina__cab">
              <h2 className="vitrina__titulo" id="explorar-titulo">
                {q ? `Resultados para “${busqueda.trim()}”` : 'Todas las campañas abiertas'}
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
        </div>
      </div>
    </article>
  );
}
