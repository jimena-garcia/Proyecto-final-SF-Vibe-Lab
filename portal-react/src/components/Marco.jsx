import Icono from '../ui/Icono.jsx';
import { alClicInterno, navegar, urlInicio } from '../lib/navegacion.js';
import { MARCA, urlAccesoEquipo } from '../marca.js';

/** Header claro: marca de la plataforma, buscador de campañas y acceso del equipo. */
export function Encabezado({ busqueda = '', setBusqueda, conBuscador = true }) {
  const acceso = urlAccesoEquipo();
  return (
    <>
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <div className="banda-prueba" role="note">
        <div className="contenedor">
          <strong>Sitio de práctica.</strong> Pagos con Stripe en modo de prueba (tarjeta 4242 4242 4242 4242). No se cobra dinero real.
        </div>
      </div>
      <header className="header">
        <div className="contenedor header__barra">
          <a className="marca" href={urlInicio()} onClick={alClicInterno(urlInicio())}>
            <span className="marca__simbolo" aria-hidden="true">
              <Icono nombre="ruta" tam={22} />
            </span>
            <span className="marca__texto">
              {MARCA.nombre}
              <small>
                {MARCA.organizador} · {MARCA.aliados}
              </small>
            </span>
          </a>

          {conBuscador && setBusqueda && (
            <form
              className="buscador"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                navegar(urlInicio(), 'campanas');
              }}
            >
              <label htmlFor="buscar-campanas" className="sr-only">
                Buscar campañas
              </label>
              <Icono nombre="buscar" tam={18} />
              <input
                id="buscar-campanas"
                type="search"
                placeholder="Buscar campañas"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                autoComplete="off"
              />
            </form>
          )}

          <nav className="header__nav" aria-label="Secciones">
            <a href={`${urlInicio()}#como-funciona`} onClick={alClicInterno(urlInicio(), 'como-funciona')}>
              Cómo funciona
            </a>
            {acceso && (
              <a className="btn btn--secundario btn--sm" href={acceso}>
                Acceso del equipo
              </a>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}

export function Pie() {
  return (
    <footer className="footer">
      <div className="contenedor footer__grid">
        <div>
          <p className="footer__marca">{MARCA.nombre}</p>
          <p>{MARCA.lema}.</p>
        </div>
        <div>
          <p className="footer__titulo">Un proyecto de</p>
          {/* Espacios para los logos oficiales de UADY y Salesforce: se agregan cuando el equipo aporte los archivos. */}
          <ul className="footer__aliados" aria-label="Organizadores">
            <li className="footer__aliado">SF Vibe Lab</li>
            <li className="footer__aliado">UADY</li>
            <li className="footer__aliado">Salesforce</li>
          </ul>
        </div>
        <div className="footer__avisos">
          <p>Proyecto académico con datos ficticios. Pagos con Stripe en modo de prueba; no se emiten comprobantes fiscales (CFDI).</p>
          <p>{MARCA.avisoNoAfiliacion}</p>
        </div>
      </div>
    </footer>
  );
}
