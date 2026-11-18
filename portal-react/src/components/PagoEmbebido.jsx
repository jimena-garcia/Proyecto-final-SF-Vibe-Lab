import { useEffect, useRef, useState } from 'react';
import { cargarStripe } from '../lib/stripe.js';
import { Alerta, Boton, pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';

/**
 * Paso 4 del modal de contribución: Stripe Embedded Checkout.
 * El formulario de tarjeta de Stripe vive en un iframe; nunca vemos la tarjeta. Al confirmarse el
 * pago, Stripe llama a onComplete y DonarForm muestra la página de gracias sin redirección.
 * La página de gracias sigue siendo honesta: solo dice "confirmado" cuando Salesforce lo registra.
 */
export default function PagoEmbebido({ clientSecret, clavePublica, campana, monto, onVolver, onCompletado }) {
  const contenedor = useRef(null);
  const titulo = useRef(null);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [intento, setIntento] = useState(0);
  const completado = useRef(onCompletado);
  completado.current = onCompletado;

  useEffect(() => {
    titulo.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    let vivo = true;
    let checkout = null;
    setEstado('cargando');
    cargarStripe()
      .then((Stripe) => {
        const stripe = Stripe(clavePublica);
        const opciones = {
          fetchClientSecret: () => Promise.resolve(clientSecret),
          // Solo se llama con redirect_on_completion=if_required (así crea la sesión Apex).
          onComplete: () => {
            checkout?.destroy?.();
            checkout = null;
            completado.current?.();
          }
        };
        // createEmbeddedCheckoutPage es el nombre actual; initEmbeddedCheckout, el de versiones anteriores.
        return stripe.createEmbeddedCheckoutPage ? stripe.createEmbeddedCheckoutPage(opciones) : stripe.initEmbeddedCheckout(opciones);
      })
      .then((c) => {
        if (!vivo) {
          c.destroy?.(); // el componente ya se desmontó (o StrictMode en desarrollo)
          return;
        }
        checkout = c;
        c.mount(contenedor.current);
        setEstado('listo');
      })
      .catch(() => vivo && setEstado('error'));
    return () => {
      vivo = false;
      checkout?.destroy?.();
    };
  }, [clientSecret, clavePublica, intento]);

  return (
    <section className="pago-stripe" aria-labelledby="pago-titulo">
      <button type="button" className="pago-stripe__volver" onClick={onVolver}>
        <span className="pago-stripe__flecha" aria-hidden="true">
          <Icono nombre="flecha" tam={18} />
        </span>
        Volver a tus datos
      </button>

      <p className="eyebrow">Pago seguro con Stripe · modo de prueba</p>
      <h3 id="pago-titulo" className="pago-stripe__titulo" tabIndex={-1} ref={titulo}>
        Aporta {pesos(monto)} a {campana}
      </h3>
      <p className="nota-pago" style={{ marginTop: 0 }}>
        <Icono nombre="candado" tam={16} /> Stripe captura tu tarjeta en este recuadro; nosotros nunca la vemos.
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
      <div ref={contenedor} className="pago-stripe__marco" />
    </section>
  );
}
