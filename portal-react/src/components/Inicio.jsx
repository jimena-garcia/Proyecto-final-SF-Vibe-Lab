import { useEffect, useState } from 'react';
import { Boton, pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';
import Ilustracion from '../ui/Ilustracion.jsx';
import { CampanaCard, CampanaCardEsqueleto, DatosCampana, ImagenCampana } from './CampanaCard.jsx';
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
  const total = lista.reduce((s, c) => s + (Number(c.recaudado) || 0), 0);
  const donaciones = lista.reduce((s, c) => s + (Number(c.donacionesPagadas) || 0), 0);
  const dias = diasPara(EVENTO.fecha);
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

      {destacada && (
        <section className="seccion seccion--vitrina" aria-label="Campaña principal">
          <div className="contenedor vitrina vitrina--principal">
            <h2 className="vitrina__titulo">Objetivo principal</h2>
            <Destacada campana={destacada} />
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
              inert={masAbierto ? undefined : ''}
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

function Destacada({ campana }) {
  const url = urlCampana(campana.id);
  const resumen = (campana.descripcion || '').split(/\n\s*\n/)[0];
  const dias = diasPara(EVENTO.fecha);
  const donaciones = campana.donacionesPagadas ?? 0;
  const avance = Math.min(100, porcentaje(campana.recaudado, campana.meta));
  const siguiente = construirParadas(campana).find((p) => p.siguiente);
  const metaTexto = siguiente
    ? `Siguiente meta: ${siguiente.titulo}`
    : `Faltan ${pesos(faltante(campana.recaudado, campana.meta))}`;
  return (
    <article className="destacada" aria-labelledby={`dest-${campana.id}`}>
      <a href={url} onClick={alClicInterno(url)} tabIndex={-1} aria-hidden="true" className="destacada__enlace-imagen">
        <ImagenCampana campana={campana} className="imagen-campana--grande" />
      </a>
      <div className="tarjeta__cuerpo">
        <div className="destacada__marca">
          <span className="tarjeta__avatar" aria-hidden="true">SV</span>
          <div>
            <p className="tarjeta__organizador">{MARCA.organizador}</p>
            <p className="destacada__programa">SF Vibe Lab · UADY</p>
          </div>
        </div>
        <h3 id={`dest-${campana.id}`} className="destacada__titulo">
          <a href={url} onClick={alClicInterno(url)}>
            {campana.nombre}
          </a>
        </h3>
        <div className="destacada__contenido">
          {resumen && <p className="destacada__desc">{resumen}</p>}
          <DatosCampana campana={campana} />
          <div
            className="destacada__barra"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(avance)}
            aria-label={`Avance de ${campana.nombre}: ${formatoPorcentaje(porcentaje(campana.recaudado, campana.meta))}`}
          >
            <div style={{ width: `${avance}%` }} />
          </div>
          <p className="destacada__siguiente">{metaTexto}</p>
          <dl className="destacada__franja">
            <div><dt>Recaudado</dt><dd className="cifra">{pesos(campana.recaudado)}</dd></div>
            <div><dt>Aportes</dt><dd className="cifra">{donaciones}</dd></div>
            <div><dt>Días para el evento</dt><dd className="cifra">{dias > 0 ? dias : 'Concluido'}</dd></div>
          </dl>
          <a className="btn btn--contribuir btn--lg btn--bloque destacada__accion" href={url} onClick={alClicInterno(url)}>
            Ver campaña y contribuir
          </a>
        </div>
      </div>
    </article>
  );
}
