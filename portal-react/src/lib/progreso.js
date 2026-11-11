// Cálculos de presentación del progreso. No alteran datos: el "recaudado" viene de
// Salesforce (roll-up de donaciones Pagadas) y aquí solo se interpreta para mostrarlo.

export const EVENTO = { nombre: 'Mexico Dreamin 2026', fecha: new Date('2026-11-20T09:00:00-06:00'), lugar: 'Salesforce México, CDMX' };

export function porcentaje(recaudado, meta) {
  const r = Number(recaudado) || 0;
  const m = Number(meta) || 0;
  return m > 0 ? (r / m) * 100 : 0;
}

/** 0.3 → "0.3%", 1.7 → "1.7%", 42.4 → "42%", 0 → "0%", >0 y <0.1 → "<0.1%" */
export function formatoPorcentaje(pct) {
  if (pct <= 0) return '0%';
  if (pct < 0.1) return '<0.1%';
  if (pct < 10) return `${pct.toFixed(1).replace(/\.0$/, '')}%`;
  return `${Math.floor(pct)}%`;
}

export const faltante = (recaudado, meta) => Math.max(0, (Number(meta) || 0) - (Number(recaudado) || 0));

/**
 * Construye las paradas de la ruta. Si la campaña no tiene hitos configurados en
 * Salesforce, la ruta solo tiene el destino (la meta): nunca se inventan hitos.
 */
export function construirParadas(campana) {
  const meta = Number(campana.meta) || 0;
  const recaudado = Number(campana.recaudado) || 0;
  const hitos = (campana.hitos || [])
    .filter((h) => Number(h.monto) > 0 && Number(h.monto) <= meta)
    .sort((a, b) => a.monto - b.monto)
    .map((h) => ({ monto: Number(h.monto), titulo: h.titulo, descripcion: h.descripcion, destino: false }));

  if (!hitos.length || hitos[hitos.length - 1].monto < meta) {
    hitos.push({ monto: meta, titulo: 'Meta de la campaña', descripcion: null, destino: true });
  } else {
    hitos[hitos.length - 1].destino = true;
  }

  let siguienteMarcada = false;
  return hitos.map((h) => {
    const alcanzada = recaudado >= h.monto;
    const siguiente = !alcanzada && !siguienteMarcada;
    if (siguiente) siguienteMarcada = true;
    return { ...h, alcanzada, siguiente, posicion: meta > 0 ? Math.min(100, (h.monto / meta) * 100) : 100 };
  });
}

/** Regla documentada mientras no exista el campo Destacada__c: la marcada, o la de mayor avance. */
export function elegirDestacada(campanas) {
  if (!campanas.length) return null;
  const marcada = campanas.find((c) => c.destacada);
  if (marcada) return marcada;
  return [...campanas].sort((a, b) => porcentaje(b.recaudado, b.meta) - porcentaje(a.recaudado, a.meta))[0];
}

export function diasPara(fecha, hoy = new Date()) {
  return Math.ceil((fecha.getTime() - hoy.getTime()) / 86400000);
}

export function iniciales(nombre) {
  return (nombre || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
