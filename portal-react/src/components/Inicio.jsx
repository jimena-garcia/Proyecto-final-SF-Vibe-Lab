import { useEffect, useState } from 'react';
import { Boton, pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';
import { CampanaCard, CampanaCardEsqueleto, ImagenCampana } from './CampanaCard.jsx';
import { AQuienApoyas } from './Apoyo.jsx';
import ComoFunciona from './ComoFunciona.jsx';
import { EVENTO, construirParadas, diasPara, elegirDestacada, faltante, formatoPorcentaje, porcentaje } from '../lib/progreso.js';
import { alClicInterno, urlCampana } from '../lib/navegacion.js';
import { MARCA } from '../marca.js';

const normalizar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Portada de descubrimiento: titular, banner del programa y una sola campaña principal.
 */
export default function Inicio({ estado, reintentar, busqueda = '', limpiarBusqueda, setBusqueda, solicitudMas = 0 }) {
  const { campanas, error } = estado;
  const lista = campanas || [];
  const destacada = campanas ? elegirDestacada(lista) : null;
  const q = normalizar(busqueda.trim());
  const [masAbierto, setMasAbierto] = useState(false);
  const otras = destacada ? lista.filter((c) => c !== destacada) : [];

  useEffect(() => {
    if (solicitudMas > 0) {
      setMasAbierto(true);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      requestAnimationFrame(() => {
        document.getElementById('mas-campanas')?.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    }
  }, [solicitudMas]);

  useEffect(() => {
    if (masAbierto) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      requestAnimationFrame(() => {
        document.getElementById('mas-campanas')?.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    }
  }, [masAbierto]);

  useEffect(() => {
    if (window.location.hash === '#mas-campanas') setMasAbierto(true);
  }, []);

  const toggleMas = () => setMasAbierto((abierto) => !abierto);

  return (
    <>
      {destacada ? (
        <HeroCampana campana={destacada} />
      ) : (
        <section className="hero-campana hero-campana--vacio" aria-labelledby="hero-titulo">
          <div className="contenedor">
            <p className="hero-campana__lema">{MARCA.lema}</p>
            <h1 id="hero-titulo" className="hero-campana__titulo">
              Ayuda a que estudiantes lleguen a la comunidad que los impulsa
            </h1>
          </div>
        </section>
      )}

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

      {destacada && (
        <section className="seccion portada-apoyas" aria-label={`A quién apoyas con ${destacada.nombre}`}>
          <div className="contenedor">
            <AQuienApoyas
              campana={destacada}
              id="portada-apoyas"
              eyebrow="A quién apoyas"
              historia={(destacada.descripcion || '').split(/\n\s*\n/).filter(Boolean).slice(1, 2)}
              accion={
                <a
                  className="btn btn--contribuir btn--lg"
                  href={`${urlCampana(destacada.id)}#contribuir`}
                  onClick={alClicInterno(`${urlCampana(destacada.id)}#contribuir`)}
                >
                  <Icono nombre="corazon" tam={18} /> Quiero apoyar
                </a>
              }
            />
            {otras.length > 0 && (
              <button
                type="button"
                className="mas-campanas__toggle"
                aria-expanded={masAbierto}
                aria-controls="mas-campanas-panel"
                onClick={toggleMas}
              >
                {masAbierto ? 'Ocultar campañas' : 'Más campañas'}
                <Icono nombre="flecha-abajo" tam={18} className={masAbierto ? 'chevron chevron--abierto' : 'chevron'} />
              </button>
            )}
          </div>
        </section>
      )}

      {otras.length > 0 && (
        <section
          id="mas-campanas"
          className={`mas-campanas ${masAbierto ? 'mas-campanas--abierto' : ''}`}
          aria-labelledby="mas-campanas-titulo"
        >
          <div className="mas-campanas__overflow">
            <div
              id="mas-campanas-panel"
              className="mas-campanas__panel"
              role="region"
              aria-hidden={!masAbierto}
              inert={!masAbierto}
            >
              <div className="contenedor">
                <div className="mas-campanas__cab">
                  <h2 className="vitrina__titulo" id="mas-campanas-titulo">Más campañas</h2>
                  <label className="mas-campanas__buscar">
                    <span className="sr-only">Buscar campañas</span>
                    <Icono nombre="buscar" tam={18} />
                    <input
                      type="search"
                      value={busqueda}
                      onChange={(event) => setBusqueda?.(event.target.value)}
                      placeholder="Buscar campañas"
                    />
                  </label>
                  {q && (
                    <button type="button" className="btn btn--texto" onClick={limpiarBusqueda}>
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
                {otras.filter((c) => !q || normalizar(`${c.nombre} ${c.descripcion}`).includes(q)).length === 0 ? (
                  <p className="mas-campanas__vacio">No encontramos campañas con ese texto. Prueba otro nombre.</p>
                ) : (
                  <div className="rejilla rejilla--tres">
                    {otras
                      .filter((c) => !q || normalizar(`${c.nombre} ${c.descripcion}`).includes(q))
                      .map((c) => (
                        <CampanaCard key={c.id} campana={c} />
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <ComoFunciona />
    </>
  );
}

/** Hero de la portada: la campaña principal, con avance, a quién apoyas y dos llamados a la acción. */
function HeroCampana({ campana }) {
  const url = urlCampana(campana.id);
  const urlContribuir = `${url}#contribuir`;
  const urlHistoria = `${url}#a-quien-apoyas`;
  const resumen = (campana.descripcion || '').split(/\n\s*\n/)[0];
  const dias = diasPara(EVENTO.fecha);
  const pct = porcentaje(campana.recaudado, campana.meta);
  const siguiente = construirParadas(campana).find((p) => p.siguiente);
  const falta = faltante(campana.recaudado, campana.meta);
  const metaTexto =
    falta === 0
      ? 'Meta alcanzada: cada aporte sigue sumando'
      : siguiente && !siguiente.destino
        ? `Faltan ${pesos(faltante(campana.recaudado, siguiente.monto))} para ${siguiente.titulo}`
        : `Faltan ${pesos(falta)} para la meta`;
  return (
    <section className="hero-campana" aria-labelledby="hero-titulo">
      <div className="contenedor hero-campana__grid">
        <div className="hero-campana__texto">
          <p className="hero-campana__lema">
            <span className="hero-campana__chip">Campaña principal</span> {MARCA.lema}
          </p>
          <h1 id="hero-titulo" className="hero-campana__titulo">
            {campana.nombre}
          </h1>
          {resumen && <p className="hero-campana__resumen">{resumen}</p>}
          {campana.beneficiarios && (
            <p className="hero-campana__apoyas">
              <Icono nombre="usuarios" tam={20} />
              <span>
                Apoyas a <strong>{campana.beneficiarios}</strong>
              </span>
            </p>
          )}

          <div className="hero-campana__avance">
            <p className="hero-campana__monto cifra">
              <strong>{pesos(campana.recaudado)}</strong> de {pesos(campana.meta)}
            </p>
            <div
              className="hero-campana__barra"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(Math.min(100, pct))}
              aria-label={`Avance de ${campana.nombre}: ${formatoPorcentaje(pct)}`}
            >
              <div style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <p className="hero-campana__meta">
              <strong>{formatoPorcentaje(pct)} financiado</strong> · {metaTexto}
            </p>
          </div>

          <div className="hero-campana__acciones">
            <a className="btn btn--contribuir btn--lg" href={urlContribuir} onClick={alClicInterno(urlContribuir)}>
              <Icono nombre="corazon" tam={18} /> Contribuir ahora
            </a>
            <a className="btn btn--secundario btn--lg" href={urlHistoria} onClick={alClicInterno(urlHistoria)}>
              Conoce a quién apoyas
            </a>
          </div>

          <dl className="hero-campana__datos">
            <div>
              <dt>{campana.donacionesPagadas === 1 ? 'aporte confirmado' : 'aportes confirmados'}</dt>
              <dd className="cifra">{campana.donacionesPagadas ?? 0}</dd>
            </div>
            <div>
              <dt>{dias > 0 ? `${dias === 1 ? 'día' : 'días'} para ${EVENTO.nombre}` : EVENTO.nombre}</dt>
              <dd className="cifra">{dias > 0 ? dias : 'Concluido'}</dd>
            </div>
          </dl>
        </div>

        <a className="hero-campana__imagen" href={url} onClick={alClicInterno(url)} tabIndex={-1} aria-hidden="true">
          <ImagenCampana campana={campana} className="imagen-campana--grande" />
          {dias > 0 && (
            <span className="hero-campana__cuenta">
              <Icono nombre="reloj" tam={16} /> {dias === 1 ? 'Falta 1 día' : `Faltan ${dias} días`} para {EVENTO.nombre}
            </span>
          )}
        </a>
      </div>
    </section>
  );
}
