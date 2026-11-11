import { useEffect, useState } from 'react';
import api from '../api.js';

// HU-04 CP1: el donante canceló en la pasarela. No se muestra agradecimiento.
export default function Cancelado({ token }) {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    api.cancelar(token).finally(() => setListo(true));
  }, [token]);

  return (
    <section className="resultado alerta">
      <h2>El pago no se completó</h2>
      <p>{listo ? 'Cancelaste el pago en la pasarela y no se te cobró nada.' : 'Actualizando tu donación…'}</p>
      <p>Si quieres, puedes intentarlo de nuevo.</p>
      <a className="boton primario" href={window.location.pathname}>
        Volver a las campañas
      </a>
    </section>
  );
}
