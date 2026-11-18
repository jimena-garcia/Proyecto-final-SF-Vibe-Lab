import { useEffect, useRef, useState } from 'react';
import { cargarStripe } from '../lib/stripe.js';
import { navegar } from '../lib/navegacion.js';
import { Alerta, Boton, pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';

/**
 * Stripe Embedded Checkout en un modal (<dialog> nativo: atrapa el foco y bloquea el fondo).
 * El formulario de tarjeta de Stripe vive en un iframe; nunca vemos la tarjeta. Al confirmarse
 * el pago, Stripe llama a onComplete y nosotros mostramos la página de gracias sin redirección.
 * La página de gracias sigue siendo honesta: solo dice "confirmado" cuando Salesforce lo registra.
 */
export default function PagoEmbebido({ token, clientSecret, clavePublica, campana, monto, onCancelar }) {
  const dialogo = useRef(null);
  const contenedor = useRef(null);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | error
  const [intento, setIntento] = useState(0);

  // Abre el modal y bloquea el scroll de la página mientras está abierto.
  useEffect(() => {
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
      if (d?.open) d.close();
    };
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
            dialogo.current?.close();
            navegar(`${window.location.pathname}?gracias=${token}`);
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
  }, [token, clientSecret, clavePublica, intento]);

  return (
    <dialog
      ref={dialogo}
      className="modal-pago"
      aria-labelledby="pago-titulo"
      // Solo la X cierra el modal. Ni Esc ni un clic fuera: un cierre accidental a medio pago
      // cancelaría la donación. (<dialog> nativo no se cierra al hacer clic en el fondo.)
      closedby="none"
      onCancel={(e) => e.preventDefault()}
    >
      <header className="modal-pago__cabecera">
        <div>
          <p className="eyebrow">Pago seguro con Stripe · modo de prueba</p>
          <h2 id="pago-titulo">
            {pesos(monto)} para {campana}
          </h2>
        </div>
        <button type="button" className="modal-pago__cerrar" onClick={onCancelar} aria-label="Cancelar el pago" title="Cancelar el pago">
          <Icono nombre="cruz" tam={20} />
        </button>
      </header>

      <div className="modal-pago__cuerpo">
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
        <div ref={contenedor} className="modal-pago__stripe" />
      </div>
    </dialog>
  );
}
