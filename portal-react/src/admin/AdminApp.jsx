import { useEffect, useState } from 'react';
import Icono from '../ui/Icono.jsx';
import api from './api.js';
import { useCarga } from './comun.jsx';
import Resumen from './Resumen.jsx';
import Campanas from './Campanas.jsx';
import Donaciones from './Donaciones.jsx';
import Avisos from './Avisos.jsx';
import Equipo from './Equipo.jsx';

// Navegación por hash: #/resumen, #/campanas, #/campanas/nueva, #/campanas/<id>, #/donaciones/<filtro>, #/avisos, #/equipo
function leerRuta() {
  const partes = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { seccion: partes[0] || 'resumen', sub: partes[1] || null };
}

export default function AdminApp() {
  const [ruta, setRuta] = useState(leerRuta);
  const [equipo] = useCarga(() => api.getEquipo(), []);
  const [resumen] = useCarga(() => api.getResumen(), []);
  const puedeGestionar = equipo.datos?.puedeGestionar;

  useEffect(() => {
    const cambiar = () => {
      setRuta(leerRuta());
      document.getElementById('adm-contenido')?.focus();
    };
    window.addEventListener('hashchange', cambiar);
    return () => window.removeEventListener('hashchange', cambiar);
  }, []);

  const secciones = [
    { id: 'resumen', texto: 'Resumen' },
    { id: 'campanas', texto: 'Campañas' },
    { id: 'donaciones', texto: 'Donaciones' },
    { id: 'avisos', texto: 'Avisos de Stripe' },
    ...(puedeGestionar ? [{ id: 'equipo', texto: 'Equipo' }] : [])
  ];

  let contenido;
  switch (ruta.seccion) {
    case 'campanas':
      contenido = <Campanas sub={ruta.sub} />;
      break;
    case 'donaciones':
      contenido = <Donaciones filtro={ruta.sub || 'todas'} />;
      break;
    case 'avisos':
      contenido = <Avisos soloRechazados={ruta.sub === 'rechazados'} />;
      break;
    case 'equipo':
      contenido = puedeGestionar ? <Equipo /> : <Resumen />;
      break;
    default:
      contenido = <Resumen />;
  }

  return (
    <div className="adm">
      <aside className="adm-nav">
        <div className="adm-nav__marca">
          <Icono nombre="ruta" tam={26} />
          <span>
            Ruta a Mexico Dreamin
            <small>Panel de administración</small>
          </span>
        </div>
        <nav aria-label="Secciones del panel">
          <ul>
            {secciones.map((s) => (
              <li key={s.id}>
                <a href={`#/${s.id}`} aria-current={ruta.seccion === s.id ? 'page' : undefined}>
                  {s.texto}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="adm-nav__pie">
          {resumen.datos?.usuario && <p className="adm-nav__usuario">{resumen.datos.usuario}</p>}
          {resumen.datos?.portalUrl && (
            <a href={resumen.datos.portalUrl} target="_blank" rel="noreferrer">
              Ver sitio público ↗
            </a>
          )}
          <a href={api.salir} target="_top">
            Cerrar sesión
          </a>
        </div>
      </aside>
      <main className="adm-main" id="adm-contenido" tabIndex={-1}>
        {contenido}
      </main>
    </div>
  );
}
