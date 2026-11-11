import { useEffect, useState } from 'react';
import api from './api.js';
import CampanaCard from './components/CampanaCard.jsx';
import DonarForm from './components/DonarForm.jsx';
import Gracias from './components/Gracias.jsx';
import Cancelado from './components/Cancelado.jsx';

const parametros = new URLSearchParams(window.location.search);
const TOKEN = /^[0-9a-f]{32}$/;

export default function App() {
  const gracias = parametros.get('gracias');
  const cancelado = parametros.get('cancelado');

  return (
    <div className="pagina">
      <header className="encabezado">
        <div className="contenedor">
          <p className="etiqueta">SF Vibe Lab · UADY</p>
          <h1>Lleva alumnos a Mexico Dreamin 2026</h1>
          <p className="sub">
            Tu donación ayuda a pagar boleto, viaje y estancia en la Ciudad de México para el evento del 20 de noviembre.
          </p>
        </div>
      </header>
      <main className="contenedor">
        <div className="aviso-prueba" role="note">
          Sitio de práctica: los pagos usan Stripe en modo de prueba. Usa la tarjeta 4242 4242 4242 4242; no se cobra dinero real.
        </div>
        {gracias && TOKEN.test(gracias) ? (
          <Gracias token={gracias} />
        ) : cancelado && TOKEN.test(cancelado) ? (
          <Cancelado token={cancelado} />
        ) : (
          <Campanas />
        )}
      </main>
      <footer className="pie contenedor">Proyecto académico · datos ficticios · sin facturación fiscal real</footer>
    </div>
  );
}

function Campanas() {
  const [campanas, setCampanas] = useState(null);
  const [error, setError] = useState(null);
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    api.getCampanas().then(setCampanas).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error-general">{error}</p>;
  if (!campanas) return <p className="cargando">Cargando campañas…</p>;
  if (campanas.length === 0) return <p className="vacio">Por ahora no hay campañas activas.</p>;

  if (seleccionada) {
    return <DonarForm campana={seleccionada} onVolver={() => setSeleccionada(null)} />;
  }
  return (
    <section className="rejilla" aria-label="Campañas">
      {campanas.map((c) => (
        <CampanaCard key={c.id} campana={c} onDonar={() => setSeleccionada(c)} />
      ))}
    </section>
  );
}
