import { useEffect, useState } from 'react';
import api from '../api.js';
import Icono from '../ui/Icono.jsx';
import { alClicInterno, urlInicio } from '../lib/navegacion.js';

// HU-04 CP1: el donante canceló en la pasarela. Se marca la donación como Cancelada
// (sin cambios si ya no estaba pendiente) y se ofrece una salida clara.
export default function Cancelado({ token }) {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    api.cancelar(token).finally(() => setListo(true));
  }, [token]);

  return (
    <main id="contenido" className="estado">
      <div className="contenedor">
        <div className="estado__tarjeta" aria-live="polite">
          <div className="estado__icono estado__icono--neutro">
            <Icono nombre="cruz" tam={28} />
          </div>
          <h1>El pago no se completó</h1>
          <p className="estado__texto">
            {listo ? 'No se realizó ningún cargo a tu tarjeta.' : 'Actualizando tu donación…'} Si fue un error o cambiaste de opinión,
            puedes intentarlo de nuevo cuando quieras.
          </p>
          <div className="estado__acciones">
            <a className="btn btn--primario" href={urlInicio()} onClick={alClicInterno(urlInicio(), 'campanas')}>
              Volver a las campañas <Icono nombre="flecha" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
