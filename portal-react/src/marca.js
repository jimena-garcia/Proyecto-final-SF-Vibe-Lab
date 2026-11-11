// Identidad de la PLATAFORMA (no de una campaña). Cambiar el nombre aquí lo cambia en todo el sitio.
// Las campañas (p. ej. Mexico Dreamin) tienen su propia identidad dentro de su página.
export const MARCA = {
  nombre: 'Impulso Vibe Lab', // nombre provisional: pendiente de confirmar por el equipo
  lema: 'Crowdfunding del programa SF Vibe Lab',
  organizador: 'SF Vibe Lab',
  aliados: 'UADY × Salesforce',
  ciudad: 'Mérida, Yucatán',
  descripcionOrganizador:
    'Programa de formación en Salesforce de la Universidad Autónoma de Yucatán. Organiza las campañas para que sus alumnos asistan a eventos de la comunidad.',
  avisoNoAfiliacion:
    'Las campañas son iniciativas de SF Vibe Lab. Los eventos que se mencionan (como Mexico Dreamin) no las organizan ni las respaldan oficialmente.'
};

/**
 * Enlace al panel de administración. El panel vive en el dominio interno de la org
 * (…my.salesforce.com); el sitio público en …my.salesforce-sites.com. En otros entornos
 * (desarrollo local) no se muestra.
 */
export function urlAccesoEquipo() {
  const { hostname, protocol } = window.location;
  if (!hostname.endsWith('.my.salesforce-sites.com')) return null;
  return `${protocol}//${hostname.replace('.my.salesforce-sites.com', '.my.salesforce.com')}/apex/PanelAdmin`;
}
