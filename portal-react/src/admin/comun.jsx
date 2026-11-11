import { useCallback, useEffect, useState } from 'react';
import Icono from '../ui/Icono.jsx';
import { Boton } from '../ui/basicos.jsx';

/** Carga de datos con estados de carga y error, y una función para recargar. */
export function useCarga(fn, deps = []) {
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: true });
  const cargar = useCallback(() => {
    setEstado((e) => ({ ...e, cargando: true, error: null }));
    fn()
      .then((datos) => setEstado({ datos, error: null, cargando: false }))
      .catch((err) => setEstado({ datos: null, error: err.message, cargando: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    cargar();
  }, [cargar]);
  return [estado, cargar];
}

export const ir = (ruta) => {
  window.location.hash = `#/${ruta}`;
};

export const fecha = (v) =>
  v ? new Date(v).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export function Cabecera({ titulo, descripcion, children }) {
  return (
    <header className="adm-cabecera">
      <div>
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {children && <div className="adm-cabecera__acciones">{children}</div>}
    </header>
  );
}

export function EstadoCarga({ estado, reintentar, vacio, children }) {
  if (estado.error) {
    return (
      <div className="adm-vacio" role="alert">
        <p>{estado.error}</p>
        <Boton variante="secundario" onClick={reintentar}>
          <Icono nombre="actualizar" /> Reintentar
        </Boton>
      </div>
    );
  }
  if (estado.cargando && !estado.datos) {
    return (
      <div aria-busy="true" aria-label="Cargando">
        <div className="esqueleto" style={{ height: 64 }} />
        <div className="esqueleto" style={{ height: 64, marginTop: 8 }} />
        <div className="esqueleto" style={{ height: 64, marginTop: 8 }} />
      </div>
    );
  }
  if (vacio) return <div className="adm-vacio">{vacio}</div>;
  return children;
}

const MODALIDAD = { Anonima: 'Anónima', Credito: 'Con reconocimiento', Factura: 'Con factura' };
export const modalidad = (m) => MODALIDAD[m] || m;

const RESULTADO = {
  Aceptado: { clase: 'pagada', texto: 'Aceptado', ayuda: 'Aviso auténtico de Stripe: la donación quedó pagada.' },
  Rechazado: { clase: 'error', texto: 'Rechazado', ayuda: 'No se aceptó; la donación no cambió.' },
  Duplicado: { clase: 'cancelada', texto: 'Duplicado', ayuda: 'Stripe lo reenvió; no se modificó nada.' },
  Ignorado: { clase: 'cancelada', texto: 'Ignorado', ayuda: 'Evento que no confirma un pago.' }
};
export const resultadoAviso = (r) => RESULTADO[r] || { clase: 'cancelada', texto: r || '—', ayuda: '' };
