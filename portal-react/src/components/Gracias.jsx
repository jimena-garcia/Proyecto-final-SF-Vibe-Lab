import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api.js';
import { Boton, EstadoBadge, pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';
import { alClicInterno, urlCampana, urlInicio } from '../lib/navegacion.js';
import RutaProgreso from './RutaProgreso.jsx';
import { AQuienApoyas, QuienesApoyan } from './Apoyo.jsx';

// Sondeo: cada 2 s durante el primer minuto (cuando suele llegar el aviso de Stripe)
// y luego cada 5 s hasta completar ~3 minutos. Cada consulta es una lectura ligera por token.
const ESPERAS = [...Array(30).fill(2000), ...Array(24).fill(5000)];

/**
 * HU-04. Regla de honestidad: solo dice "confirmado" si Salesforce ya registra la
 * donación como Pagada (CA2). Solo muestra datos de ESTA donación, sin nombres (CA3).
 */
export default function Gracias({ token }) {
  const [estado, setEstado] = useState(null);
  const [intento, setIntento] = useState(0);
  const [consultando, setConsultando] = useState(false);
  const titulo = useRef(null);
  const [campana, setCampana] = useState(null);

  const consultar = useCallback(async (verificar = false) => {
    setConsultando(true);
    try {
      const e = await (verificar ? api.verificarPago(token) : api.getEstado(token));
      setEstado(e ?? { estado: 'Desconocido' });
    } catch {
      setEstado((prev) => prev ?? { estado: 'Error' });
    } finally {
      setConsultando(false);
    }
  }, [token]);

  // Al llegar (intento 0) y al pulsar "Actualizar estado" se pregunta a Stripe; en el sondeo, solo a Salesforce.
  const [verificarEnSiguiente, setVerificarEnSiguiente] = useState(true);
  useEffect(() => {
    consultar(verificarEnSiguiente);
    setVerificarEnSiguiente(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultar, intento]);

  useEffect(() => {
    if (estado?.estado === 'Pendiente' && intento < ESPERAS.length) {
      const t = setTimeout(() => setIntento((i) => i + 1), ESPERAS[intento]);
      return () => clearTimeout(t);
    }
  }, [estado, intento]);

  useEffect(() => {
    if (estado) titulo.current?.focus();
  }, [estado?.estado]);

  // Con el aporte confirmado, se carga la campaña (ya con este aporte sumado) para mostrar
  // a quién apoyó, cómo va y quiénes más se sumaron. Si falla, la tarjeta de gracias basta.
  const pagada = estado?.estado === 'Pagada';
  useEffect(() => {
    if (!pagada || !estado?.campanaId) return;
    let vivo = true;
    api
      .getCampanas()
      .then((lista) => vivo && setCampana((lista || []).find((c) => c.id === estado.campanaId) || null))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [pagada, estado?.campanaId]);

  const datos = estado && estado.folio && (
    <dl className="estado__datos">
      <dt>Campaña</dt>
      <dd>{estado.campana}</dd>
      <dt>Monto</dt>
      <dd className="cifra">{pesos(estado.monto)}</dd>
      <dt>Folio</dt>
      <dd>{estado.folio}</dd>
      <dt>Estado</dt>
      <dd>
        <EstadoBadge estado={estado.estado} />
      </dd>
    </dl>
  );

  const volver = (
    <a className="btn btn--secundario" href={urlInicio()} onClick={alClicInterno(urlInicio())}>
      Ver campañas
    </a>
  );

  let contenido;
  if (!estado) {
    contenido = (
      <>
        <div className="estado__icono estado__icono--neutro">
          <span className="giro" />
        </div>
        <h1 tabIndex={-1} ref={titulo}>Consultando tu donación…</h1>
      </>
    );
  } else if (estado.estado === 'Pagada') {
    contenido = (
      <>
        <div className="estado__icono estado__icono--exito">
          <Icono nombre="check" tam={28} />
        </div>
        <p className="eyebrow">Ya eres parte de esta campaña</p>
        <h1 tabIndex={-1} ref={titulo}>¡Gracias por sumarte!</h1>
        <p className="estado__texto">
          Tu apoyo de <strong>{pesos(estado.monto)}</strong> a <strong>{estado.campana}</strong> ya está confirmado y cuenta en el avance.
          Te enviamos el comprobante al correo que registraste.
        </p>
        {campana?.mensajeGracias && (
          <blockquote className="gracias__mensaje">
            <Icono nombre="corazon" tam={22} />
            <p>{campana.mensajeGracias}</p>
          </blockquote>
        )}
        {datos}
        <div className="estado__acciones">
          {campana && <Compartir campana={campana} />}
          {volver}
        </div>
      </>
    );
  } else if (estado.estado === 'Pendiente') {
    const agotado = intento >= ESPERAS.length;
    contenido = (
      <>
        <div className="estado__icono estado__icono--espera">
          <Icono nombre="reloj" tam={28} />
        </div>
        <h1 tabIndex={-1} ref={titulo}>Recibimos tu donación</h1>
        <p className="estado__texto">
          Estamos esperando que la pasarela confirme el pago. Suele tardar unos segundos, a veces unos minutos. Esta página se
          actualiza sola{agotado ? '' : ' mientras la tengas abierta'}.
        </p>
        {datos}
        <div className="estado__acciones">
          <Boton
            variante="primario"
            onClick={() => {
              setVerificarEnSiguiente(true);
              setIntento((i) => (agotado ? 0 : i + 1));
            }}
            cargando={consultando}
          >
            {!consultando && <Icono nombre="actualizar" />} Actualizar estado
          </Boton>
          {volver}
        </div>
        <p className="nota-pago" role="status">
          <Icono nombre="info" tam={16} />
          {agotado
            ? 'Aún no llega la confirmación. Si el pago se completó en Stripe, se reflejará en cuanto llegue; no hace falta pagar de nuevo.'
            : 'No hace falta pagar de nuevo ni recargar la página.'}
        </p>
      </>
    );
  } else if (estado.estado === 'Cancelada') {
    contenido = (
      <>
        <div className="estado__icono estado__icono--neutro">
          <Icono nombre="cruz" tam={28} />
        </div>
        <h1 tabIndex={-1} ref={titulo}>Esta donación aparece como cancelada</h1>
        <p className="estado__texto">No se registró ningún cargo para esta donación. Si quieres, puedes apoyar de nuevo.</p>
        {datos}
        <div className="estado__acciones">
          <a className="btn btn--primario" href={urlInicio()} onClick={alClicInterno(urlInicio())}>
            Volver a las campañas
          </a>
        </div>
      </>
    );
  } else {
    contenido = (
      <>
        <div className="estado__icono estado__icono--neutro">
          <Icono nombre="alerta" tam={28} />
        </div>
        <h1 tabIndex={-1} ref={titulo}>{estado.estado === 'Error' ? 'No pudimos consultar tu donación' : 'No encontramos esta donación'}</h1>
        <p className="estado__texto">
          {estado.estado === 'Error'
            ? 'Hubo un problema de conexión. Inténtalo de nuevo en un momento.'
            : 'El enlace puede estar incompleto. Si pagaste, revisa el correo que registraste.'}
        </p>
        <div className="estado__acciones">
          {estado.estado === 'Error' && (
            <Boton onClick={() => setIntento((i) => i + 1)} cargando={consultando}>
              Reintentar
            </Boton>
          )}
          {volver}
        </div>
      </>
    );
  }

  return (
    <main id="contenido" className="estado">
      <div className="contenedor">
        <div className="estado__tarjeta" aria-live="polite">
          {contenido}
        </div>
      </div>
      {pagada && campana && <TuApoyoEnLaCampana campana={campana} />}
    </main>
  );
}

/** Después de las gracias: a quién apoyaste, cómo va la campaña con tu aporte y quiénes más se sumaron. */
function TuApoyoEnLaCampana({ campana }) {
  const url = urlCampana(campana.id);
  return (
    <div className="contenedor gracias__campana">
      <section className="gracias__avance" aria-labelledby="gracias-avance-titulo">
        <p className="eyebrow">Así va {campana.nombre}</p>
        <h2 id="gracias-avance-titulo">Tu aporte ya está en el avance</h2>
        <RutaProgreso campana={campana} grande />
      </section>

      <AQuienApoyas
        campana={campana}
        id="gracias-apoyas"
        eyebrow="A quién apoyaste"
        historia={(campana.descripcion || '').split(/\n\s*\n/).filter(Boolean).slice(1, 2)}
        className="gracias__bloque"
        accion={
          <a className="btn btn--secundario" href={url} onClick={alClicInterno(url)}>
            Ver la campaña completa <Icono nombre="flecha" tam={18} />
          </a>
        }
      />

      <section className="gracias__bloque" aria-labelledby="gracias-metas-titulo">
        <h2 id="gracias-metas-titulo">{(campana.hitos || []).length > 1 ? 'Las metas que estás ayudando a cumplir' : 'La meta que estás ayudando a cumplir'}</h2>
        <div style={{ marginTop: 20 }}>
          <RutaProgreso campana={campana} soloMetas />
        </div>
      </section>

      <div className="gracias__bloque">
        <QuienesApoyan campana={campana} id="gracias-apoyan" titulo="Te sumaste a estas personas" />
      </div>

      <section className="gracias__cierre" aria-labelledby="gracias-cierre-titulo">
        <h2 id="gracias-cierre-titulo">¿Nos ayudas a llegar más lejos?</h2>
        <p>Comparte la campaña con alguien que también quiera impulsar a estos estudiantes.</p>
        <div className="estado__acciones">
          <Compartir campana={campana} principal />
        </div>
      </section>
    </div>
  );
}

/** Comparte el enlace de la campaña (menú nativo del celular o copia al portapapeles). */
function Compartir({ campana, principal = false }) {
  const [copiado, setCopiado] = useState(false);
  const enlace = `${window.location.origin}${urlCampana(campana.id)}`;
  async function compartir() {
    try {
      if (navigator.share) {
        await navigator.share({ title: campana.nombre, text: `Apoya a ${campana.beneficiarios || 'estudiantes de SF Vibe Lab'}`, url: enlace });
        return;
      }
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* el donante cerró el menú de compartir */
    }
  }
  return (
    <button type="button" className={`btn ${principal ? 'btn--contribuir' : 'btn--primario'}`} onClick={compartir}>
      <Icono nombre="compartir" tam={18} /> <span aria-live="polite">{copiado ? 'Enlace copiado' : 'Compartir la campaña'}</span>
    </button>
  );
}
