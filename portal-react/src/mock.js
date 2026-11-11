// Datos ficticios para desarrollar la interfaz sin Salesforce (npm run dev).
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const campanas = [
  {
    id: 'a00MOCK0000001',
    nombre: 'Boletos para Mexico Dreamin 2026',
    descripcion: 'Cubre la entrada al evento del 20 de noviembre en Salesforce México, CDMX.',
    meta: 30000,
    recaudado: 12500,
    montosSugeridos: [200, 500, 1000],
    donantes: [
      { nombre: 'Ana Ficticia', monto: 1000 },
      { nombre: 'Empresa Demo Mérida', monto: 5000 }
    ]
  },
  {
    id: 'a00MOCK0000002',
    nombre: 'Transporte y hospedaje en CDMX',
    descripcion: 'Vuelo Mérida–CDMX y dos noches de hospedaje para alumnos del programa.',
    meta: 60000,
    recaudado: 0,
    montosSugeridos: [500, 1000, 2500],
    donantes: []
  }
];

export async function getCampanas() {
  await esperar(300);
  return structuredClone(campanas);
}

export async function crearDonacion(datos) {
  await esperar(300);
  if (!datos.email) return { ok: false, mensaje: 'Revisa los datos del formulario.', errores: ['Escribe un correo válido.'] };
  return { ok: true, token: '0123456789abcdef0123456789abcdef', errores: [] };
}

export async function iniciarPago(token) {
  await esperar(300);
  // En local no hay Stripe: simulamos el regreso exitoso.
  return { ok: true, token, urlPago: `${window.location.pathname}?gracias=${token}` };
}

export async function getEstado() {
  await esperar(300);
  return { estado: 'Pendiente', monto: 500, campana: campanas[0].nombre, folio: 'DON-00042' };
}

export async function cancelar() {
  await esperar(200);
  return { ok: true, mensaje: 'El pago no se completó y no se te cobró nada.' };
}
