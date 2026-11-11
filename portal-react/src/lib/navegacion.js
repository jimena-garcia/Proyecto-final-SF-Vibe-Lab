// Navegación por parámetros de URL, sin router. Contrato que NO cambia:
//   ?gracias=<token>   → regreso exitoso de Stripe (success_url en Apex)
//   ?cancelado=<token> → regreso cancelado de Stripe (cancel_url en Apex)
// Parámetro nuevo y aditivo:
//   ?campana=<Id>      → detalle de una campaña
import { useEffect, useState } from 'react';

const TOKEN = /^[0-9a-f]{32}$/;
const ID_SF = /^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$/;

function leer() {
  const q = new URLSearchParams(window.location.search);
  const gracias = q.get('gracias');
  const cancelado = q.get('cancelado');
  const campana = q.get('campana');
  if (gracias && TOKEN.test(gracias)) return { vista: 'gracias', token: gracias };
  if (cancelado && TOKEN.test(cancelado)) return { vista: 'cancelado', token: cancelado };
  if (campana && ID_SF.test(campana)) return { vista: 'campana', id: campana };
  return { vista: 'inicio' };
}

export const urlCampana = (id) => `${window.location.pathname}?campana=${encodeURIComponent(id)}`;
export const urlInicio = () => window.location.pathname;

export function navegar(url, ancla) {
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
  requestAnimationFrame(() => {
    const destino = ancla && document.getElementById(ancla);
    if (destino) destino.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0 });
  });
}

/** Para <a href> internos: conserva clic medio / Ctrl+clic y navega sin recargar. */
export function alClicInterno(url, ancla) {
  return (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navegar(url, ancla);
  };
}

export function useRuta() {
  const [ruta, setRuta] = useState(leer);
  useEffect(() => {
    const actualizar = () => setRuta(leer());
    window.addEventListener('popstate', actualizar);
    return () => window.removeEventListener('popstate', actualizar);
  }, []);
  return ruta;
}
