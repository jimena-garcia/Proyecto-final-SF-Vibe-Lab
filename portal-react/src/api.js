// Capa de acceso a Salesforce.
// - Dentro del Salesforce Site: usa Visualforce Remoting (window.Visualforce) con las
//   acciones que Portal.page publica en window.PORTAL_CONFIG.
// - En `npm run dev` (sin Salesforce): usa datos ficticios de mock.js.
// Nunca hay claves aquí: el navegador no habla con Stripe salvo por la redirección al Checkout.
import * as mock from './mock.js';

const enSalesforce = typeof window !== 'undefined' && window.Visualforce && window.PORTAL_CONFIG;

function invocar(accion, ...args) {
  return new Promise((resolve, reject) => {
    window.Visualforce.remoting.Manager.invokeAction(
      window.PORTAL_CONFIG.acciones[accion],
      ...args,
      (resultado, evento) => {
        if (evento.status) resolve(resultado);
        else reject(new Error('No pudimos comunicarnos con el servidor. Recarga la página e inténtalo de nuevo.'));
      },
      { escape: false, buffer: false, timeout: 30000 }
    );
  });
}

const api = enSalesforce
  ? {
      getCampanas: () => invocar('getCampanas'),
      crearDonacion: (datos) => invocar('crearDonacion', JSON.stringify(datos)),
      iniciarPago: (token) => invocar('iniciarPago', token),
      getEstado: (token) => invocar('getEstado', token),
      verificarPago: (token) => invocar('verificarPago', token),
      cancelar: (token) => invocar('cancelar', token)
    }
  : mock;

export default api;
