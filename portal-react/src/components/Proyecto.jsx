import { useCallback, useEffect, useRef, useState } from 'react';
import Icono from '../ui/Icono.jsx';
import { pesos } from '../ui/basicos.jsx';
import RutaProgreso from './RutaProgreso.jsx';
import DonarForm from './DonarForm.jsx';
import { ImagenCampana } from './CampanaCard.jsx';
import { AQuienApoyas, QuienesApoyan } from './Apoyo.jsx';
import { EVENTO, construirParadas, diasPara, faltante } from '../lib/progreso.js';
import { MARCA } from '../marca.js';

const PREGUNTAS = [
  {
    p: '¿El aporte usa dinero real?',
    r: 'No. Es un sitio de práctica: los movimientos usan Stripe en modo de prueba con tarjetas de prueba.'
  },
  {
    p: '¿Cuándo cuenta mi aporte en el avance?',
    r: 'Cuando la pasarela confirma el movimiento. Los aportes pendientes o cancelados no suman al avance.'
  },
  {
    p: '¿Qué datos míos se publican?',
    r: 'Si eliges "Con reconocimiento": tu nombre y el monto. Si eliges anónima o con factura: solo el monto, como "Donante anónimo". Tu correo y tu RFC nunca se publican.'
  },
  {
    p: '¿Recibo comprobante?',
    r: 'Sí, al correo que registras, cuando el apoyo queda confirmado. No es un comprobante fiscal.'
  },
  {
    p: '¿Puedo pedir factura?',
    r: 'Puedes registrar tu solicitud con nombre y RFC; tesorería la ve marcada. En este sitio de práctica no se emiten CFDI.'
  },
  {
    p: '¿Qué pasa si cancelo en la pantalla de Stripe?',
    r: 'No se registra un movimiento efectivo y el apoyo queda cancelado. Puedes intentarlo de nuevo cuando quieras.'
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
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    document.title = `${campana.nombre} · ${MARCA.nombre}`;
  }, [campana.nombre]);

  // Llegada desde la portada: #contribuir abre el modal; #a-quien-apoyas baja a la historia.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#contribuir') {
      setModalAbierto(true);
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    } else if (hash === '#a-quien-apoyas') {
      requestAnimationFrame(() => irAHistoria());
    }
  }, []);

  const abrirContribucion = (e) => {
    e?.preventDefault();
    setModalAbierto(true);
  };

  function irAHistoria(e) {
    e?.preventDefault();
    const destino = document.getElementById('a-quien-apoyas');
    if (!destino) return;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    destino.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' });
    destino.focus({ preventScroll: true });
  }

  return (
    <article className="proyecto con-barra" aria-labelledby={tituloId}>
      <header className="proyecto__cabecera contenedor">
        <h1 id={tituloId}>{campana.nombre}</h1>
        {resumen && <p className="proyecto__resumen">{resumen}</p>}
        {campana.beneficiarios && (
          <p className="proyecto__apoyas">
            <Icono nombre="usuarios" tam={20} /> <span>Apoyas a <strong>{campana.beneficiarios}</strong></span>
          </p>
        )}
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
          <a className="btn btn--contribuir btn--lg btn--bloque btn--cuadrado" href="#contribuir" onClick={abrirContribucion}>
            Contribuir
          </a>
          <a className="btn btn--secundario btn--lg btn--bloque btn--cuadrado proyecto__conocer" href="#a-quien-apoyas" onClick={irAHistoria}>
            Conoce a quién apoyas <Icono nombre="flecha-abajo" tam={18} />
          </a>
          <p className="proyecto__nota">
            Solo cuentan los movimientos confirmados por la pasarela. Eliges si tu nombre aparece o no.
          </p>
        </div>
      </div>

      <section className="confianza" aria-label="Cómo protegemos tu donación">
        <div className="contenedor confianza__grid">
          <p>
            <Icono nombre="candado" tam={22} /> Contribuyes por Stripe; nunca vemos ni guardamos tu tarjeta.
          </p>
          <p>
            <Icono nombre="escudo" tam={22} /> El avance solo suma movimientos confirmados por la pasarela.
          </p>
          <p>
            <Icono nombre="usuarios" tam={22} /> Tú decides: anónima, con reconocimiento o con factura.
          </p>
        </div>
      </section>

      <nav className="pestanas" aria-label="Secciones de la campaña">
        <div className="contenedor pestanas__lista">
          <a href="#a-quien-apoyas">A quién apoyas</a>
          <a href="#metas">Metas</a>
          <a href="#apoyan">
            Quiénes apoyan <span className="pestanas__num cifra">{donantes.length}</span>
          </a>
          <a href="#preguntas">Preguntas frecuentes</a>
        </div>
      </nav>

      <div className="contenedor proyecto__cuerpo">
        <div className="proyecto__principal">
          <AQuienApoyas
            campana={campana}
            id="a-quien-apoyas"
            className="bloque bloque--primero"
            historia={historia.length ? historia : []}
            accion={
              <a className="btn btn--contribuir btn--lg" href="#contribuir" onClick={abrirContribucion}>
                <Icono nombre="corazon" tam={18} /> Quiero apoyar
              </a>
            }
          />

          <section className="bloque" id="metas" aria-labelledby="metas-titulo" tabIndex={-1}>
            <h2 id="metas-titulo">{(campana.hitos || []).length > 1 ? 'Metas de la campaña' : 'Meta de la campaña'}</h2>
            <p className="bloque__sub">
              {(campana.hitos || []).length > 1
                ? 'Son acumulativas: cada una se alcanza cuando el avance acumulado llega a su monto.'
                : 'Solo cuentan los pagos confirmados por la pasarela.'}
            </p>
            <div style={{ marginTop: 20 }}>
              <RutaProgreso campana={campana} soloMetas />
            </div>
          </section>

          <QuienesApoyan campana={campana} />

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
        </aside>
      </div>

      <div className="barra-donar">
        <p className="barra-donar__texto">
          <strong className="cifra">{pesos(campana.recaudado)}</strong>
          {falta === 0 ? 'Meta alcanzada' : siguiente && !siguiente.destino ? `Siguiente meta: ${siguiente.titulo}` : `Faltan ${pesos(falta)}`}
        </p>
        <a className="btn btn--contribuir" href="#contribuir" onClick={abrirContribucion}>
          Contribuir
        </a>
      </div>
      {modalAbierto && <ModalContribucion campana={campana} cerrar={() => setModalAbierto(false)} />}
    </article>
  );
}

function ModalContribucion({ campana, cerrar }) {
  const panelRef = useRef(null);
  const cerrarRef = useRef(null);
  // Durante el pago con Stripe, solo la X cierra el modal (y cancela la donación pendiente):
  // ni Esc ni un clic fuera, para no perder un pago a medias por accidente.
  const [pagando, setPagando] = useState(false);
  const pagandoRef = useRef(false);
  const alPagoActivo = useCallback((activo) => {
    pagandoRef.current = activo;
    setPagando(activo);
  }, []);

  useEffect(() => {
    const activo = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cerrarRef.current?.focus();

    const manejarTecla = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!pagandoRef.current) cerrar();
        return;
      }
      if (event.key !== 'Tab') return;
      const elementos = [
        ...(panelRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
        ) ?? [])
      ].filter((el) => !el.closest('[inert]')); // la vista oculta del deslizador no recibe foco
      if (!elementos.length) return;
      const primero = elementos[0];
      const ultimo = elementos[elementos.length - 1];
      if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', manejarTecla);
    return () => {
      document.removeEventListener('keydown', manejarTecla);
      document.body.style.overflow = overflow;
      activo?.focus();
    };
  }, [cerrar]);

  return (
    <div
      className="modal-contribuir"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && !pagandoRef.current && cerrar()}
    >
      <section
        ref={panelRef}
        className="modal-contribuir__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-apoyo-titulo"
      >
        <header className="modal-contribuir__cab">
          <div>
            <p className="eyebrow">Tu aporte</p>
            <h2 id="modal-apoyo-titulo">Estás apoyando: {campana.nombre}</h2>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            className={`modal-contribuir__cerrar${pagando ? ' modal-contribuir__cerrar--peligro' : ''}`}
            onClick={cerrar}
            aria-label={pagando ? 'Cancelar el pago y cerrar' : 'Cerrar'}
            title={pagando ? 'Cancelar el pago y cerrar' : undefined}
          >
            <Icono nombre="cruz" tam={20} />
          </button>
        </header>
        <div className="modal-contribuir__cuerpo">
          <DonarForm campana={campana} onPagoActivo={alPagoActivo} />
        </div>
      </section>
    </div>
  );
}
