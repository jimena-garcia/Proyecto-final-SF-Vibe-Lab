// Transparencia: qué pasa con la donación y qué datos se hacen públicos en cada modalidad.
// El contenido refleja las reglas reales del sistema (ver docs/seguridad.md).
export const MODALIDADES = [
  {
    valor: 'Anonima',
    titulo: 'Anónima',
    publico: 'Solo el monto, como "Donante anónimo". Nadie verá tu nombre.',
    privado: 'Tu correo, solo para enviarte el comprobante.',
    factura: 'No incluye factura.'
  },
  {
    valor: 'Credito',
    titulo: 'Con reconocimiento',
    publico: 'Tu nombre y el monto, en la lista de donantes de la campaña.',
    privado: 'Tu correo, que nunca se muestra.',
    factura: 'No incluye factura.'
  },
  {
    valor: 'Factura',
    titulo: 'Con factura',
    publico: 'Solo el monto, como "Donante anónimo". Tu nombre y RFC no se publican.',
    privado: 'Tu nombre o razón social, RFC y correo, solo para tesorería.',
    factura: 'Queda registrada tu solicitud (sitio de práctica: no se emite CFDI).'
  }
];

export default function ComoFunciona() {
  return (
    <section className="seccion como" id="como-funciona" aria-labelledby="como-titulo" tabIndex={-1}>
      <div className="contenedor">
        <p className="eyebrow">Transparencia</p>
        <h2 className="titulo-seccion" id="como-titulo">
          Cómo funciona tu donación
        </h2>
        <ol className="pasos">
          <li>
            <h3>Eliges campaña y monto</h3>
            <p>Cada campaña cubre un tramo del viaje. Puedes elegir un monto sugerido o escribir el tuyo.</p>
          </li>
          <li>
            <h3>Pagas de forma segura en Stripe</h3>
            <p>Registramos tu donación y te llevamos a Stripe. Nunca vemos ni guardamos los datos de tu tarjeta.</p>
          </li>
          <li>
            <h3>Se confirma y te avisamos</h3>
            <p>Cuando Stripe confirma el pago, tu aporte suma al avance de la campaña y enviamos tu comprobante.</p>
          </li>
        </ol>

        <div className="privacidad">
          {MODALIDADES.map((m) => (
            <div className="privacidad__item" key={m.valor}>
              <h3>{m.titulo}</h3>
              <dl>
                <div>
                  <dt>Qué es público</dt>
                  <dd>{m.publico}</dd>
                </div>
                <div>
                  <dt>Qué queda privado</dt>
                  <dd>{m.privado}</dd>
                </div>
                <div>
                  <dt>Factura</dt>
                  <dd>{m.factura}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
