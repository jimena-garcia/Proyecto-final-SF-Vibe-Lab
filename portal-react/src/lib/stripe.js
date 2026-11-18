// Carga Stripe.js desde js.stripe.com (Stripe exige cargarlo de su dominio, no empaquetarlo).
// La versión ("endive") debe coincidir con StripeService.VERSION_API en Apex.
// Solo se descarga cuando el donante llega al pago, no en cada visita.
let promesa = null;

export function cargarStripe() {
  if (window.Stripe) return Promise.resolve(window.Stripe);
  if (!promesa) {
    promesa = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://js.stripe.com/endive/stripe.js';
      s.async = true;
      s.onload = () => (window.Stripe ? resolve(window.Stripe) : reject(new Error('Stripe.js no disponible')));
      s.onerror = () => {
        promesa = null; // permite reintentar
        s.remove();
        reject(new Error('No se pudo cargar Stripe.js'));
      };
      document.head.appendChild(s);
    });
  }
  return promesa;
}
