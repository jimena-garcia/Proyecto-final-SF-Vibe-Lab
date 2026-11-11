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
  const [permisos] = useCarga(() => api.getPermisos(), []);
  const [resumen] = useCarga(() => api.getResumen(), []);
  const p = permisos.datos || {};
  const puedeGestionar = p.equipo;

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
    ...(p.coordinacion ? [{ id: 'campanas', texto: 'Campañas' }] : []),
    ...(p.tesoreria ? [{ id: 'donaciones', texto: 'Donaciones' }, { id: 'avisos', texto: 'Avisos de Stripe' }] : []),
    ...(puedeGestionar ? [{ id: 'equipo', texto: 'Equipo' }] : [])
  ];

  // La sección solo se muestra si el rol la permite; el servidor vuelve a validarlo.
  let contenido;
  if (!permisos.datos) {
    contenido = <div className="esqueleto" style={{ height: 120 }} aria-busy="true" />;
  } else if (ruta.seccion === 'campanas' && p.coordinacion) {
    contenido = <Campanas sub={ruta.sub} />;
  } else if (ruta.seccion === 'donaciones' && p.tesoreria) {
    contenido = <Donaciones filtro={ruta.sub || 'todas'} />;
  } else if (ruta.seccion === 'avisos' && p.tesoreria) {
    contenido = <Avisos soloRechazados={ruta.sub === 'rechazados'} />;
  } else if (ruta.seccion === 'equipo' && puedeGestionar) {
    contenido = <Equipo />;
  } else {
    contenido = <Resumen permisos={p} />;
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
          {p.usuario && (
            <p className="adm-nav__usuario">
              {p.usuario}
              <small>{puedeGestionar ? 'Administración' : p.coordinacion && p.tesoreria ? 'Coordinación y tesorería' : p.coordinacion ? 'Coordinación' : p.tesoreria ? 'Tesorería' : 'Sin rol asignado'}</small>
            </p>
          )}
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
