// Datos del portal de administración.
// - En Salesforce (página PanelAdmin): Visualforce Remoting con las acciones de window.ADMIN_CONFIG.
//   Corre con la sesión del usuario interno; Apex aplica sus permisos (with sharing + USER_MODE).
// - En `npm run dev`: datos de demostración de ./mock.js.
import * as mock from './mock.js';

const enSalesforce = typeof window !== 'undefined' && window.Visualforce && window.ADMIN_CONFIG;

function invocar(accion, ...args) {
  return new Promise((resolve, reject) => {
    window.Visualforce.remoting.Manager.invokeAction(
      window.ADMIN_CONFIG.acciones[accion],
      ...args,
      (resultado, evento) => {
        if (evento.status) resolve(resultado);
        else reject(new Error(evento.message || 'No pudimos comunicarnos con Salesforce. Recarga la página.'));
      },
      { escape: false, buffer: false, timeout: 60000 }
    );
  });
}

const api = enSalesforce
  ? {
      getPermisos: () => invocar('getPermisos'),
      getResumen: () => invocar('getResumen'),
      getCampanas: () => invocar('getCampanas'),
      guardarCampana: (datos) => invocar('guardarCampana', JSON.stringify(datos)),
      subirImagen: (id, nombre, base64) => invocar('subirImagen', id, nombre, base64),
      quitarImagen: (id) => invocar('quitarImagen', id),
      getDonaciones: (filtro, busqueda) => invocar('getDonaciones', filtro, busqueda || ''),
      getAvisos: (soloRechazados) => invocar('getAvisos', Boolean(soloRechazados)),
      getEquipo: () => invocar('getEquipo'),
      darDeAlta: (datos) => invocar('darDeAlta', JSON.stringify(datos)),
      desactivar: (id) => invocar('desactivar', id),
      cambiarRol: (id, rol) => invocar('cambiarRol', id, rol),
      salir: window.ADMIN_CONFIG.salir
    }
  : { ...mock, salir: '#' };

export default api;
