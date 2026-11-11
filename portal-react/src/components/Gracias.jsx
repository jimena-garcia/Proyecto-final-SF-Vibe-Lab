import { useEffect, useState } from 'react';
import api from '../api.js';
import { pesos } from '../validacion.js';

const INTENTOS = 6;
const ESPERA_MS = 3000;

// HU-04: solo dice "confirmado" si Salesforce ya tiene la donación como Pagada (CA2)
// y solo muestra datos de ESTA donación, sin nombres de nadie (CA3).
export default function Gracias({ token }) {
  const [estado, setEstado] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    api.getEstado(token).then((e) => vigente && setEstado(e ?? { estado: 'Desconocido' })).catch(() => {});
    return () => {
      vigente = false;
    };
  }, [token, intento]);

  useEffect(() => {
    if (estado?.estado === 'Pendiente' && intento < INTENTOS) {
      const t = setTimeout(() => setIntento((i) => i + 1), ESPERA_MS);
      return () => clearTimeout(t);
    }
  }, [estado, intento]);

  const volver = window.location.pathname;

  return (
    <section className="resultado exito">
      <h2>¡Gracias por tu donación!</h2>
      {!estado && <p>Consultando tu donación…</p>}
      {estado?.estado === 'Pagada' && (
        <p>
          Tu pago de <strong>{pesos(estado.monto)}</strong> a <strong>{estado.campana}</strong> está confirmado. Folio{' '}
          {estado.folio}. Te enviamos el comprobante a tu correo.
        </p>
      )}
      {estado?.estado === 'Pendiente' && (
        <p>
          Recibimos tu donación de <strong>{pesos(estado.monto)}</strong> a <strong>{estado.campana}</strong> (folio{' '}
          {estado.folio}). Estamos esperando la confirmación de la pasarela; cuando llegue te enviaremos tu comprobante
          por correo.
        </p>
      )}
      {estado?.estado === 'Cancelada' && <p>Esta donación aparece como cancelada. Si crees que es un error, contáctanos.</p>}
      {estado?.estado === 'Desconocido' && <p>No encontramos esta donación.</p>}
      <a className="boton" href={volver}>
        Volver a las campañas
      </a>
    </section>
  );
}
