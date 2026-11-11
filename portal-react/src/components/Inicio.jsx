import { Boton } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';
import Ilustracion from '../ui/Ilustracion.jsx';
import { CampanaCard } from './CampanaCard.jsx';
import ComoFunciona from './ComoFunciona.jsx';
import Proyecto from './Proyecto.jsx';
import { ProyectoEsqueleto } from './CampanaDetalle.jsx';
import { elegirDestacada } from '../lib/progreso.js';

/**
 * Portada = página de la campaña principal (la marcada como Destacada en Salesforce;
 * si ninguna lo está, la de mayor avance). Si hay más campañas activas, se listan debajo.
 */
export default function Inicio({ estado, reintentar }) {
  const { campanas, error } = estado;

  if (error) {
    return (
      <div className="contenedor">
        <div className="vacio" role="alert">
          <h2>No pudimos cargar la campaña</h2>
          <p>{error}</p>
          <Boton variante="secundario" onClick={reintentar}>
            <Icono nombre="actualizar" /> Intentar de nuevo
          </Boton>
        </div>
      </div>
    );
  }

  if (!campanas) return <ProyectoEsqueleto />;

  if (campanas.length === 0) {
    return (
      <>
        <div className="contenedor vacio">
          <div className="marco-ilustracion" style={{ maxWidth: 320, margin: '0 auto' }}>
            <Ilustracion />
          </div>
          <h2>Por ahora no hay campañas abiertas</h2>
          <p>Cuando la coordinación del programa publique una campaña, aparecerá aquí.</p>
        </div>
        <ComoFunciona />
      </>
    );
  }

  const principal = elegirDestacada(campanas);
  const otras = campanas.filter((c) => c !== principal);

  return (
    <>
      <Proyecto campana={principal} principal />

      {otras.length > 0 && (
        <section className="seccion otras" id="campanas" aria-labelledby="otras-titulo" tabIndex={-1}>
          <div className="contenedor">
            <p className="eyebrow">También puedes apoyar</p>
            <h2 className="titulo-seccion" id="otras-titulo">
              Otras campañas
            </h2>
            <div className={`rejilla ${otras.length > 2 ? 'rejilla--tres' : ''}`}>
              {otras.map((c) => (
                <CampanaCard key={c.id} campana={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ComoFunciona />
    </>
  );
}
