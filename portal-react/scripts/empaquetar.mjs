// Empaqueta dist/ como el static resource PortalReact (zip) dentro de force-app.
import AdmZip from 'adm-zip';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(raiz, 'dist');
const destino = path.join(raiz, '..', 'force-app', 'main', 'default', 'staticresources', 'PortalReact.resource');

if (!existsSync(path.join(dist, 'assets', 'index.js'))) {
  console.error('No existe dist/assets/index.js. Corre primero "vite build".');
  process.exit(1);
}
const zip = new AdmZip();
zip.addLocalFolder(path.join(dist, 'assets'), 'assets');
zip.writeZip(destino);
console.log('Static resource listo:', destino);
