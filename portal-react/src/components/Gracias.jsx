import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../api.js';
import { Boton, EstadoBadge, pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';
import { alClicInterno, urlInicio } from '../lib/navegacion.js';

// Sondeo con espera creciente: ~2 minutos en total. Stripe en modo de prueba puede
// tardar en redirigir y en avisar a Salesforce.
const ESPERAS = [2000, 3000, 4000, 5000, 8000, 10000, 15000, 20000, 30000, 30000];

/**
 * HU-04. Regla de honestidad: solo dice "confirmado" si Salesforce ya registra la
 * donación como Pagada (CA2). Solo muestra datos de ESTA donación, sin nombres (CA3).
 */
export default function Gracias({ token }) {
  const [estado, setEstado] = useState(null);
  const [intento, setIntento] = useState(0);
  const [consultando, setConsultando] = useState(false);
  const titulo = useRef(null);

  const consultar = useCallback(async () => {
    setConsultando(true);
    try {
      const e = await api.getEstado(token);
      setEstado(e ?? { estado: 'Desconocido' });
    } catch {
      setEstado((prev) => prev ?? { estado: 'Error' });
    } finally {
      setConsultando(false);
    }
  }, [token]);

  useEffect(() => {
    consultar();
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
        <h1 tabIndex={-1} ref={titulo}>¡Gracias! Tu pago está confirmado.</h1>
        <p className="estado__texto">Tu aporte ya cuenta en el avance de la campaña. Enviaremos el comprobante al correo que registraste.</p>
        {datos}
        <div className="estado__acciones">{volver}</div>
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
          <Boton variante="primario" onClick={() => setIntento((i) => (agotado ? 0 : i + 1))} cargando={consultando}>
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
    </main>
  );
}
