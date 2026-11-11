import { Boton } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';
import Proyecto from './Proyecto.jsx';
import { alClicInterno, urlInicio } from '../lib/navegacion.js';

/** Detalle de una campaña por ?campana=<Id>: misma página de proyecto que la portada. */
export default function CampanaDetalle({ id, estado, reintentar }) {
  const { campanas, error } = estado;
  const campana = campanas?.find((c) => c.id === id || c.id.slice(0, 15) === id.slice(0, 15));

  const volver = (
    <div className="contenedor" style={{ paddingTop: 20 }}>
      <a className="enlace-volver" href={urlInicio()} onClick={alClicInterno(urlInicio())}>
        <Icono nombre="volver" tam={18} /> Inicio
      </a>
    </div>
  );

  if (error) {
    return (
      <>
        {volver}
        <div className="contenedor vacio" role="alert">
          <h2>No pudimos cargar la campaña</h2>
          <p>{error}</p>
          <Boton variante="secundario" onClick={reintentar}>
            <Icono nombre="actualizar" /> Intentar de nuevo
          </Boton>
        </div>
      </>
    );
  }

  if (!campanas) return <ProyectoEsqueleto />;

  if (!campana) {
    return (
      <>
        {volver}
        <div className="contenedor vacio">
          <h2>Esta campaña ya no está disponible</h2>
          <p>Puede que haya cerrado o que el enlace esté incompleto.</p>
          <a className="btn btn--primario" href={urlInicio()} onClick={alClicInterno(urlInicio())}>
            Ir al inicio
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      {volver}
      <Proyecto campana={campana} />
    </>
  );
}

export function ProyectoEsqueleto() {
  return (
    <div className="contenedor" aria-busy="true" aria-label="Cargando campaña" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <div className="esqueleto" style={{ height: 12, width: 260, margin: '0 auto' }} />
      <div className="esqueleto esqueleto--titulo" style={{ height: 44, width: '55%', margin: '16px auto 0' }} />
      <div className="esqueleto esqueleto--linea" style={{ width: '45%', margin: '16px auto 0' }} />
      <div className="proyecto__top" style={{ padding: 0, marginTop: 40 }}>
        <div className="marco-ilustracion esqueleto" />
        <div>
          <div className="esqueleto" style={{ height: 40, width: '50%' }} />
          <div className="esqueleto" style={{ height: 10, marginTop: 20, borderRadius: 999 }} />
          <div className="esqueleto" style={{ height: 52, marginTop: 40, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}
