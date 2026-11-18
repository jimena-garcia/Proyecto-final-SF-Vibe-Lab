// DATOS DE DEMOSTRACIÓN — solo para `npm run dev` (sin Salesforce). Nunca llegan al sitio real.
// Escenarios por URL en desarrollo:
//   ?demo=vacio | ?demo=error | ?demo=lento | ?demo=una   (inicio)
//   ?gracias=<token>&demoEstado=Pagada|Pendiente|Cancelada|Desconocido
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const q = () => new URLSearchParams(window.location.search);

const campanas = [
  {
    id: 'a01DEMO00000000001',
    nombre: '[DEMO] Mexico Dreamin 2026',
    descripcion:
      'Queremos que alumnos del programa SF Vibe Lab (UADY) lleguen a Mexico Dreamin, el evento de la comunidad Salesforce del 20 de noviembre en la Ciudad de México.\n\nEl evento vale la pena por lo técnico y, sobre todo, por la red de contactos. El boleto, el viaje y la estancia no los puede pagar cualquiera: cada meta que alcancemos cubre un tramo más del viaje.',
    meta: 100000,
    recaudado: 41250,
    donacionesPagadas: 37,
    destacada: true,
    ilustracion: 'General',
    montosSugeridos: [200, 500, 1000],
    beneficiarios: 'Alumnos del programa SF Vibe Lab de la UADY que van a su primer evento de la comunidad Salesforce',
    impacto: [
      'Su boleto para Mexico Dreamin 2026',
      'El viaje redondo de Mérida a la Ciudad de México',
      'Hospedaje cerca de la sede del evento',
      'Conocer en persona a la comunidad Salesforce y a quienes contratan talento'
    ],
    mensajeGracias: 'Gracias por creer en nosotros. Cada aporte nos acerca a vivir Mexico Dreamin y a traer lo aprendido de vuelta a Mérida. — Alumnos de SF Vibe Lab',
    hitos: [
      { monto: 30000, titulo: 'Boletos para el grupo', descripcion: 'Cubre la entrada al evento para los alumnos participantes.' },
      { monto: 75000, titulo: 'Transporte Mérida–CDMX', descripcion: 'Suma el viaje redondo a la Ciudad de México.' },
      { monto: 100000, titulo: 'Hospedaje en CDMX', descripcion: 'Completa el viaje: estancia cerca de la sede del evento.' }
    ],
    donantes: [
      { nombre: 'Ana Ficticia', monto: 1000 },
      { nombre: 'Empresa Demo Mérida', monto: 5000 },
      { nombre: 'Familia Ejemplo', monto: 500 },
      { nombre: null, monto: 35000, anonimo: true },
      { nombre: null, monto: 2000, anonimo: true }
    ]
  },
  {
    id: 'a01DEMO00000000002',
    nombre: '[DEMO] Certificaciones Salesforce',
    descripcion: 'Ayuda a que alumnos de SF Vibe Lab presenten su primera certificación oficial de Salesforce.',
    meta: 20000,
    recaudado: 3500,
    donacionesPagadas: 6,
    ilustracion: 'Certificacion',
    montosSugeridos: [300, 800, 1500],
    donantes: []
  },
  {
    id: 'a01DEMO00000000003',
    nombre: '[DEMO] Comunidad Salesforce en Mérida',
    descripcion: 'Meetups y un hackathon de la comunidad Salesforce en Mérida, abiertos a estudiantes.',
    meta: 15000,
    recaudado: 9200,
    donacionesPagadas: 14,
    ilustracion: 'Comunidad',
    montosSugeridos: [150, 300, 600],
    donantes: []
  },
  {
    id: 'a01DEMO00000000004',
    nombre: '[DEMO] Becas de conectividad',
    descripcion: 'Internet en casa durante el semestre para alumnos que estudian desde lugares con mala conexión.',
    meta: 8000,
    recaudado: 800,
    donacionesPagadas: 3,
    ilustracion: 'Conectividad',
    montosSugeridos: [100, 250, 500],
    donantes: []
  }
];

export async function getCampanas() {
  const demo = q().get('demo');
  await esperar(demo === 'lento' ? 3000 : 400);
  if (demo === 'error') throw new Error('No pudimos comunicarnos con el servidor. Recarga la página e inténtalo de nuevo.');
  if (demo === 'vacio') return [];
  if (demo === 'una') return structuredClone(campanas.slice(0, 1));
  return structuredClone(campanas);
}

export async function crearDonacion(datos) {
  await esperar(500);
  if (!datos.email) return { ok: false, mensaje: 'Revisa los datos del formulario.', errores: ['Escribe un correo válido.'] };
  return { ok: true, token: '0123456789abcdef0123456789abcdef', errores: [] };
}

export async function iniciarPago(token) {
  await esperar(500);
  // ?demoEmbebido=1 prueba el paso 4 (deslizador con Stripe embebido). La clave es ficticia:
  // Stripe mostrará el error de carga, pero se ve el flujo y el botón "Volver a tus datos".
  if (q().get('demoEmbebido')) return { ok: true, token, clientSecret: 'cs_test_demo_secret_demo', clavePublica: 'pk_test_demo' };
  return { ok: true, token, urlPago: `${window.location.pathname}?gracias=${token}` };
}

export async function getEstado() {
  await esperar(400);
  const estado = q().get('demoEstado') || 'Pendiente';
  if (estado === 'Desconocido') return null;
  return { estado, monto: 500, campana: campanas[0].nombre, campanaId: campanas[0].id, folio: 'DON-DEMO' };
}

export const verificarPago = getEstado;

export async function cancelar() {
  await esperar(300);
  return { ok: true, mensaje: 'El pago no se completó y no se te cobró nada.' };
}
