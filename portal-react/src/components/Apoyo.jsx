import { useState } from 'react';
import Icono from '../ui/Icono.jsx';
import { pesos } from '../ui/basicos.jsx';

/**
 * Bloques que cuentan a quién se apoya. Los textos vienen de la campaña y Coordinación los edita
 * en el panel (A quién apoyas, Lo que hace posible tu aporte, Mensaje de agradecimiento).
 * Si la campaña aún no tiene "Lo que hace posible", se muestran sus metas reales: nunca se inventa.
 */
export function ideasDeImpacto(campana) {
  if (campana.impacto?.length) return campana.impacto.map((texto) => ({ texto }));
  return (campana.hitos || [])
    .filter((h) => h.titulo)
    .map((h) => ({ texto: h.titulo, detalle: h.descripcion }));
}

export function AQuienApoyas({ campana, id, eyebrow = 'A quién apoyas', titulo, historia = [], accion, className = '' }) {
  const ideas = ideasDeImpacto(campana);
  const tituloId = `${id || 'apoyas'}-titulo`;
  return (
    <section className={`apoyas ${className}`} id={id} aria-labelledby={tituloId} tabIndex={-1}>
      <div className="apoyas__quien">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={tituloId} className="apoyas__titulo">
          {titulo || campana.beneficiarios || 'Estudiantes que quieren llegar a la comunidad que los impulsa'}
        </h2>
        {historia.map((p, i) => (
          <p key={i} className="apoyas__historia">
            {p}
          </p>
        ))}
      </div>
      {ideas.length > 0 && (
        <div className="apoyas__impacto">
          <h3 className="apoyas__subtitulo">
            <Icono nombre="corazon" tam={20} /> Lo que hace posible tu aporte
          </h3>
          <ul className="apoyas__lista">
            {ideas.map((idea) => (
              <li key={idea.texto}>
                <span className="apoyas__check" aria-hidden="true">
                  <Icono nombre="check" tam={16} />
                </span>
                <span>
                  {idea.texto}
                  {idea.detalle && <span className="apoyas__detalle">{idea.detalle}</span>}
                </span>
              </li>
            ))}
          </ul>
          {accion && <div className="apoyas__accion">{accion}</div>}
        </div>
      )}
      {ideas.length === 0 && accion && <div className="apoyas__accion">{accion}</div>}
    </section>
  );
}

/** Quiénes apoyan: cuántas personas anónimas y el carrusel de nombres públicos (sin montos). */
export function QuienesApoyan({ campana, id = 'apoyan', titulo = 'Quiénes apoyan', sub }) {
  const [pausado, setPausado] = useState(false);
  const donantes = campana.donantes || [];
  const anonimos = donantes.filter((d) => d.anonimo).length;
  const total = Math.max(Number(campana.donacionesPagadas) || 0, donantes.length);
  const publicos = donantes.filter((d) => !d.anonimo && d.nombre);
  const estatica = publicos.length <= 3;
  const tituloId = `${id}-titulo`;
  return (
    <section className="bloque" id={id} aria-labelledby={tituloId}>
      <h2 id={tituloId}>{titulo}</h2>
      {sub && <p className="bloque__sub">{sub}</p>}
      {donantes.length === 0 ? (
        <p className="proyecto__vacio">Aún no hay apoyos confirmados. Puedes ser la primera persona en sumarte.</p>
      ) : (
        <>
          <div className="apoyan-total">
            <strong className="cifra">{total}</strong>
            <span>
              {total === 1 ? 'aporte confirmado' : 'aportes confirmados'}
              {anonimos > 0 && ` · ${anonimos} de forma anónima`}
            </span>
          </div>
          {publicos.length > 0 && (
            <div className="apoyan-carrusel">
              {!estatica && (
                <button type="button" className="carrusel-pausa" onClick={() => setPausado((v) => !v)} aria-pressed={pausado}>
                  {pausado ? 'Reanudar nombres' : 'Pausar nombres'}
                </button>
              )}
              <div
                className={`carrusel-apoyo ${estatica ? 'carrusel-apoyo--estatico' : ''} ${pausado ? 'carrusel-apoyo--pausado' : ''}`}
                tabIndex={0}
                aria-label="Nombres públicos de apoyo"
              >
                <ul className="carrusel-apoyo__lista">
                  {[...publicos, ...(estatica ? [] : publicos)].map((d, i) => (
                    <li key={`${d.nombre}-${i}`}>
                      <span>{d.nombre}</span>
                      <strong className="cifra">{pesos(d.monto)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
