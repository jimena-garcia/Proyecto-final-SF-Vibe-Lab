import { useEffect, useRef, useState } from 'react';
import { cargarStripe } from '../lib/stripe.js';
import { navegar } from '../lib/navegacion.js';
import { Alerta, Boton, pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';

/**
 * Stripe Embedded Checkout: el formulario de tarjeta de Stripe vive en un iframe dentro de
 * nuestra página. Nunca vemos la tarjeta. Al confirmarse el pago, Stripe llama a onComplete y
 * nosotros mismos mostramos la página de gracias (sin esperar la redirección de Stripe).
 * La página de gracias sigue siendo honesta: solo dice "confirmado" cuando Salesforce lo registra.
 */
export default function PagoEmbebido({ token, clientSecret, clavePublica, campana, monto }) {
  const contenedor = useRef(null);
  const titulo = useRef(null);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    titulo.current?.focus();
    titulo.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    let vivo = true;
    let checkout = null;
    setEstado('cargando');
    cargarStripe()
      .then((Stripe) =>
        Stripe(clavePublica).initEmbeddedCheckout({
          fetchClientSecret: () => Promise.resolve(clientSecret),
          onComplete: () => {
            checkout?.destroy();
            checkout = null;
            navegar(`${window.location.pathname}?gracias=${token}`);
          }
        })
      )
      .then((c) => {
        if (!vivo) {
          c.destroy(); // el componente ya se desmontó (o StrictMode en desarrollo)
          return;
        }
        checkout = c;
        c.mount(contenedor.current);
        setEstado('listo');
      })
      .catch(() => vivo && setEstado('error'));
    return () => {
      vivo = false;
      checkout?.destroy();
    };
  }, [token, clientSecret, clavePublica, intento]);

  const cancelar = () => navegar(`${window.location.pathname}?cancelado=${token}`);

  return (
    <section className="form-donar" aria-labelledby="pago-titulo">
      <p className="eyebrow">Pago seguro con Stripe (modo de prueba)</p>
      <h2 id="pago-titulo" tabIndex={-1} ref={titulo} style={{ marginTop: 4 }}>
        {pesos(monto)} para {campana}
      </h2>
      <p className="nota-pago">
        <Icono nombre="candado" tam={16} /> Tu tarjeta la captura Stripe en este recuadro; nosotros nunca la vemos.
      </p>

      {estado === 'cargando' && (
        <p className="nota-pago" aria-live="polite">
          <Icono nombre="reloj" tam={16} /> Cargando el formulario de pago…
        </p>
      )}
      {estado === 'error' && (
        <Alerta tipo="error" titulo="No pudimos cargar el formulario de pago." role="alert">
          Revisa tu conexión o desactiva un bloqueador de anuncios para este sitio. No se te cobró nada.
          <div style={{ marginTop: 12 }}>
            <Boton type="button" onClick={() => setIntento((i) => i + 1)}>
              Intentar de nuevo
            </Boton>
          </div>
        </Alerta>
      )}
      <div ref={contenedor} className="pago-embebido" style={{ marginTop: 16, minHeight: estado === 'listo' ? 400 : 0 }} />

      <button type="button" className="btn btn--secundario" style={{ marginTop: 16 }} onClick={cancelar}>
        Cancelar y no donar
      </button>
    </section>
  );
}
