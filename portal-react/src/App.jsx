import { useCallback, useEffect, useState } from 'react';
import api from './api.js';
import { useRuta, urlInicio } from './lib/navegacion.js';
import { Encabezado, Pie } from './components/Marco.jsx';
import Inicio from './components/Inicio.jsx';
import CampanaDetalle from './components/CampanaDetalle.jsx';
import Gracias from './components/Gracias.jsx';
import Cancelado from './components/Cancelado.jsx';

/** Campañas cargadas una vez y compartidas entre inicio y detalle. */
function useCampanas(activo) {
  const [estado, setEstado] = useState({ campanas: null, error: null });
  const cargar = useCallback(() => {
    setEstado({ campanas: null, error: null });
    api
      .getCampanas()
      .then((campanas) => setEstado({ campanas: campanas || [], error: null }))
      .catch((e) => setEstado({ campanas: null, error: e.message }));
  }, []);
  useEffect(() => {
    if (activo && !estado.campanas && !estado.error) cargar();
  }, [activo, estado.campanas, estado.error, cargar]);
  return [estado, cargar];
}

export default function App() {
  const ruta = useRuta();
  const necesitaCampanas = ruta.vista === 'inicio' || ruta.vista === 'campana';
  const [estado, recargar] = useCampanas(necesitaCampanas);
  const [busqueda, setBusqueda] = useState('');
  const [solicitudMas, setSolicitudMas] = useState(0);

  const abrirMasCampanas = () => {
    if (ruta.vista !== 'inicio') {
      window.history.pushState({}, '', urlInicio());
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.history.replaceState({}, '', `${urlInicio()}#mas-campanas`);
    setSolicitudMas((valor) => valor + 1);
  };

  if (ruta.vista === 'gracias' || ruta.vista === 'cancelado') {
    return (
      <>
        <Encabezado conBuscador={false} />
        {ruta.vista === 'gracias' ? <Gracias token={ruta.token} /> : <Cancelado token={ruta.token} />}
        <Pie />
      </>
    );
  }

  return (
    <>
      <Encabezado busqueda={busqueda} setBusqueda={setBusqueda} onMasCampanas={abrirMasCampanas} />
      <main id="contenido">
        {ruta.vista === 'campana' ? (
          <CampanaDetalle id={ruta.id} estado={estado} reintentar={recargar} />
        ) : (
          <Inicio
            estado={estado}
            reintentar={recargar}
            busqueda={busqueda}
            limpiarBusqueda={() => setBusqueda('')}
            setBusqueda={setBusqueda}
            solicitudMas={solicitudMas}
          />
        )}
      </main>
      <Pie />
    </>
  );
}
