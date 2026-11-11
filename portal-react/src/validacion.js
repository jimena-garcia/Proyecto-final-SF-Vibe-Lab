// Mismas reglas que PortalDonacionesController.validar() y las validation rules de Donacion__c.
// La validación del navegador es solo ayuda al usuario: la que cuenta es la del servidor.
export const MONTO_MINIMO = 10;
export const MONTO_MAXIMO = 100000;
export const RFC_REGEX = /^[A-ZÑ&]{3,4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[A0-9]$/;
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const normalizarRfc = (rfc) => (rfc || '').replace(/\s+/g, '').toUpperCase();

export function validar({ modalidad, nombre, email, rfc, monto }) {
  const errores = {};
  if (!modalidad) errores.modalidad = 'Elige cómo quieres donar.';
  const m = Number(monto);
  if (!monto || Number.isNaN(m) || m < MONTO_MINIMO || m > MONTO_MAXIMO) {
    errores.monto = `El monto debe estar entre $${MONTO_MINIMO} y $${MONTO_MAXIMO.toLocaleString('es-MX')} MXN.`;
  }
  if (!email || !EMAIL_REGEX.test(email.trim())) errores.email = 'Escribe un correo válido para enviarte tu comprobante.';
  if ((modalidad === 'Credito' || modalidad === 'Factura') && !nombre?.trim()) errores.nombre = 'Escribe tu nombre.';
  if (modalidad === 'Factura') {
    const r = normalizarRfc(rfc);
    if (!r) errores.rfc = 'Escribe tu RFC para solicitar factura.';
    else if (!RFC_REGEX.test(r)) {
      errores.rfc =
        'RFC inválido: 3 letras (persona moral, 12 caracteres) o 4 letras (persona física, 13), fecha AAMMDD y homoclave de 3 caracteres. Ejemplo: GODE561231GR8.';
    }
  }
  return errores;
}

export const pesos = (n) =>
  Number(n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });
