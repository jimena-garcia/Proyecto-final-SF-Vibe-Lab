import Icono from '../ui/Icono.jsx';
import { alClicInterno, urlInicio } from '../lib/navegacion.js';

export function Encabezado({ conNav = true }) {
  return (
    <>
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <div className="banda-prueba" role="note">
        <div className="contenedor">
          <strong>Sitio de práctica.</strong> Los pagos usan Stripe en modo de prueba (tarjeta 4242 4242 4242 4242). No se cobra dinero real.
        </div>
      </div>
      <header className="header">
        <div className="contenedor header__barra">
          <a className="marca" href={urlInicio()} onClick={alClicInterno(urlInicio())}>
            <Icono nombre="ruta" tam={28} />
            <span className="marca__texto">
              Ruta a Mexico Dreamin
              <small>SF Vibe Lab · UADY</small>
            </span>
          </a>
          {conNav && (
            <nav className="header__nav" aria-label="Secciones">
              <a href={`${urlInicio()}#metas`} onClick={alClicInterno(urlInicio(), 'metas')}>
                Metas
              </a>
              <a href={`${urlInicio()}#como-funciona`} onClick={alClicInterno(urlInicio(), 'como-funciona')}>
                Cómo funciona
              </a>
              <a className="header__donar" href={`${urlInicio()}#donar`} onClick={alClicInterno(urlInicio(), 'donar')}>
                Donar
              </a>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}

export function Pie() {
  return (
    <footer className="footer">
      <div className="contenedor footer__grid">
        <p>Proyecto académico de SF Vibe Lab (UADY × Salesforce). Datos ficticios; no se emiten comprobantes fiscales (CFDI).</p>
        <p>Pagos procesados por Stripe en modo de prueba.</p>
      </div>
    </footer>
  );
}
