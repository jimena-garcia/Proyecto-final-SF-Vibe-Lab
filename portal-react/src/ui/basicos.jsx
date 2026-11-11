import Icono from './Icono.jsx';

export function Boton({ variante = 'primario', tam, bloque, cargando, children, className = '', ...props }) {
  const clases = ['btn', `btn--${variante}`, tam && `btn--${tam}`, bloque && 'btn--bloque', className].filter(Boolean).join(' ');
  return (
    <button className={clases} aria-busy={cargando ? 'true' : undefined} disabled={cargando || props.disabled} {...props}>
      {cargando && <span className="giro" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Alerta({ tipo = 'info', titulo, children, ...props }) {
  const icono = tipo === 'error' ? 'alerta' : tipo === 'atencion' ? 'reloj' : 'info';
  return (
    <div className={`alerta alerta--${tipo}`} {...props}>
      <Icono nombre={icono} />
      <div>
        {titulo && <p style={{ fontWeight: 600 }}>{titulo}</p>}
        {children}
      </div>
    </div>
  );
}

const ESTADOS = {
  Pagada: { clase: 'pagada', texto: 'Pagada' },
  Pendiente: { clase: 'pendiente', texto: 'Pendiente de confirmación' },
  Cancelada: { clase: 'cancelada', texto: 'Cancelada' }
};

export function EstadoBadge({ estado }) {
  const e = ESTADOS[estado];
  if (!e) return null;
  return <span className={`badge badge--${e.clase}`}>{e.texto}</span>;
}

export const pesos = (n) =>
  Number(n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function Dinero({ valor, className = '' }) {
  return <span className={`cifra ${className}`}>{pesos(valor)}</span>;
}
