// DATOS DE DEMOSTRACIÓN del portal de administración (solo `npm run dev`).
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const ahora = Date.now();
const hace = (min) => ahora - min * 60000;

let campanas = [
  {
    id: 'a01DEMO00000000001',
    nombre: '[DEMO] Mexico Dreamin 2026',
    descripcion: 'Queremos que alumnos del programa SF Vibe Lab lleguen a Mexico Dreamin.',
    meta: 100000,
    recaudado: 74000,
    activa: true,
    destacada: true,
    ilustracion: 'General',
    montosSugeridos: '200;500;1000',
    donacionesPagadas: 6,
    hitos: [
      { titulo: 'Boletos para el grupo', descripcion: 'Entrada al evento.', monto: 30000 },
      { titulo: 'Transporte Mérida–CDMX', descripcion: 'Viaje redondo.', monto: 75000 },
      { titulo: 'Hospedaje en CDMX', descripcion: 'Estancia.', monto: 100000 }
    ]
  },
  {
    id: 'a01DEMO00000000002',
    nombre: '[DEMO] Viáticos en la CDMX',
    descripcion: 'Comidas y transporte local.',
    meta: 15000,
    recaudado: 0,
    activa: true,
    destacada: false,
    ilustracion: 'Hospedaje',
    montosSugeridos: '150;300;600',
    donacionesPagadas: 0,
    hitos: []
  },
  {
    id: 'a01DEMO00000000003',
    nombre: '[DEMO] Campaña cerrada',
    descripcion: 'Ejemplo de campaña inactiva.',
    meta: 25000,
    recaudado: 0,
    activa: false,
    destacada: false,
    ilustracion: 'Transporte',
    montosSugeridos: '',
    donacionesPagadas: 0,
    hitos: []
  }
];

const donaciones = [
  { id: 'd1', folio: 'DON-DEMO-10', campana: campanas[0].nombre, monto: 2000, estado: 'Pagada', modalidad: 'Credito', nombre: 'Ana Ficticia', email: 'ana@example.com', confirmadaPor: 'Pasarela', fechaPago: hace(5), creada: hace(6), solicitaFactura: false, comprobanteEnviado: true },
  { id: 'd2', folio: 'DON-DEMO-09', campana: campanas[0].nombre, monto: 35000, estado: 'Pagada', modalidad: 'Anonima', nombre: null, email: 'anon@example.com', confirmadaPor: 'Pasarela', fechaPago: hace(9), creada: hace(10), solicitaFactura: false, comprobanteEnviado: true },
  { id: 'd3', folio: 'DON-DEMO-08', campana: campanas[0].nombre, monto: 1000, estado: 'Pagada', modalidad: 'Factura', nombre: 'Empresa Demo SA de CV', email: 'factura@example.com', rfc: 'EDE010101AB1', confirmadaPor: 'Pasarela', fechaPago: hace(30), creada: hace(31), solicitaFactura: true, comprobanteEnviado: true },
  { id: 'd4', folio: 'DON-DEMO-04', campana: campanas[0].nombre, monto: 200, estado: 'Pendiente', modalidad: 'Credito', nombre: 'Luis Ejemplo', email: 'luis@example.com', creada: hace(120), solicitaFactura: false, comprobanteEnviado: false },
  { id: 'd5', folio: 'DON-DEMO-02', campana: campanas[0].nombre, monto: 250, estado: 'Cancelada', modalidad: 'Anonima', nombre: null, email: 'x@example.com', creada: hace(200), solicitaFactura: false, comprobanteEnviado: false, motivoCancelacion: 'El donante canceló el pago en la pasarela.' }
];

const avisos = [
  { id: 'a1', folio: 'AV-DEMO-5', recibido: hace(5), tipo: 'checkout.session.completed', resultado: 'Aceptado', motivo: null, eventoId: 'evt_demo_5', donacion: 'DON-DEMO-10' },
  { id: 'a2', folio: 'AV-DEMO-4', recibido: hace(60), tipo: null, resultado: 'Rechazado', motivo: 'Firma inválida: el aviso no viene de Stripe', eventoId: '(no verificado) evt_falso', donacion: null },
  { id: 'a3', folio: 'AV-DEMO-3', recibido: hace(61), tipo: 'checkout.session.completed', resultado: 'Duplicado', motivo: 'El evento ya se había procesado; no se modificó nada', eventoId: 'evt_demo_3', donacion: 'DON-DEMO-09' }
];

let equipo = [
  { id: 'u0', nombre: 'Administración', usuario: 'admin@demo', email: 'admin@example.com', activo: true, ultimoAcceso: hace(1), esTu: true, rol: 'ambos' },
  { id: 'u1', nombre: 'Coordinación Demo', usuario: 'coordinacion@demo', email: 'coord@example.com', activo: true, ultimoAcceso: hace(90), esTu: false, rol: 'coordinacion' }
];

// Simula otro rol en desarrollo: ?rol=coordinacion | ?rol=tesoreria
const rolDemo = new URLSearchParams(window.location.search).get('rol');

export async function getPermisos() {
  await esperar(150);
  return {
    usuario: 'Administración (demo)',
    coordinacion: rolDemo !== 'tesoreria',
    tesoreria: rolDemo !== 'coordinacion',
    equipo: !rolDemo
  };
}

export async function getResumen() {
  await esperar(300);
  const activas = campanas.filter((c) => c.activa);
  return {
    usuario: 'Administración (demo)',
    portalUrl: '/',
    recaudadoActivas: activas.reduce((s, c) => s + c.recaudado, 0),
    campanasActivas: activas.length,
    donacionesPagadas: activas.reduce((s, c) => s + c.donacionesPagadas, 0),
    pendientes: donaciones.filter((d) => d.estado === 'Pendiente').length,
    facturasPorAtender: donaciones.filter((d) => d.solicitaFactura && d.estado === 'Pagada').length,
    avisosRechazados7d: avisos.filter((a) => a.resultado === 'Rechazado').length,
    verDonaciones: rolDemo !== 'coordinacion',
    campanas: structuredClone(campanas)
  };
}

export async function getCampanas() {
  await esperar(250);
  return structuredClone(campanas);
}

export async function guardarCampana(datos) {
  await esperar(500);
  if (datos.hitos.some((h) => Number(h.monto) > Number(datos.meta))) {
    return { ok: false, mensaje: 'El monto del hito debe ser mayor a cero y no puede superar la meta de la campaña.' };
  }
  if (datos.id) campanas = campanas.map((c) => (c.id === datos.id ? { ...c, ...datos } : c));
  else campanas = [...campanas, { ...datos, id: `a01DEMO${Date.now()}`, recaudado: 0, donacionesPagadas: 0 }];
  return { ok: true, mensaje: 'Campaña guardada. Ya se refleja en el sitio público.' };
}

export async function getDonaciones(filtro, busqueda) {
  await esperar(250);
  const f = {
    todas: () => true,
    pendientes: (d) => d.estado === 'Pendiente',
    pagadas: (d) => d.estado === 'Pagada',
    canceladas: (d) => d.estado === 'Cancelada',
    factura: (d) => d.solicitaFactura,
    pasarela: (d) => d.confirmadaPor === 'Pasarela'
  }[filtro] || (() => true);
  const q = (busqueda || '').toLowerCase();
  return donaciones.filter(f).filter((d) => !q || [d.folio, d.nombre, d.campana].some((v) => (v || '').toLowerCase().includes(q)));
}

export async function getAvisos(soloRechazados) {
  await esperar(250);
  return avisos.filter((a) => !soloRechazados || a.resultado === 'Rechazado');
}

export async function getEquipo() {
  await esperar(250);
  return { puedeGestionar: true, enlaceAcceso: 'https://tu-org.my.salesforce.com/apex/PanelAdmin', licenciasLibres: 6 - equipo.length + 1, personas: structuredClone(equipo) };
}

export async function darDeAlta(datos) {
  await esperar(600);
  const usuario = datos.correo.toLowerCase();
  equipo = [...equipo, { id: `u${Date.now()}`, nombre: `${datos.nombre} ${datos.apellido}`, usuario, email: usuario, activo: true, ultimoAcceso: null, esTu: false, rol: datos.rol }];
  return { ok: true, usuario, enlaceAcceso: 'https://tu-org.my.salesforce.com/apex/PanelAdmin', mensaje: `Listo. Comparte el enlace, el usuario y la contraseña con ${datos.nombre}.` };
}

export async function cambiarRol(id, rol) {
  await esperar(300);
  equipo = equipo.map((p) => (p.id === id ? { ...p, rol } : p));
  return { ok: true, mensaje: 'Rol actualizado.' };
}

export async function desactivar(id) {
  await esperar(300);
  equipo = equipo.map((p) => (p.id === id ? { ...p, activo: false } : p));
  return { ok: true, mensaje: 'Usuario desactivado.' };
}

export async function subirImagen(id, nombre, base64) {
  await esperar(500);
  const url = `data:image/jpeg;base64,${base64}`;
  const c = campanas.find((x) => x.id === id);
  if (c) c.imagenUrl = url;
  return { ok: true, url, mensaje: 'Imagen actualizada (demo).' };
}

export async function quitarImagen(id) {
  await esperar(300);
  const c = campanas.find((x) => x.id === id);
  if (c) c.imagenUrl = null;
  return { ok: true, mensaje: 'Imagen quitada (demo).' };
}
