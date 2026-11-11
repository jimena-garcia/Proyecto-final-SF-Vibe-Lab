# Instrucciones para agentes de IA (léelo completo antes de actuar)

Este archivo lo leen Claude Code, Codex, Cursor, Gemini/Antigravity, Copilot y otros asistentes. Es la **fuente única** de contexto. `CLAUDE.md`, `GEMINI.md` y `.github/copilot-instructions.md` apuntan aquí.

## 0. Lectura obligatoria, en este orden
Antes de proponer o cambiar **cualquier** cosa, lee:
1. `docs/ESTADO.md`: qué funciona hoy, URLs, problemas abiertos y próximos pasos.
2. `docs/requisitos/historias_de_usuario.md`: el backlog (HU-01 a HU-17) con sus criterios. Ahí está qué se pide.
3. `README.md`: avance por historia y cómo se calcula.
4. `docs/tecnico/setup_org.md`: cómo desplegar y configurar la org.
5. `docs/seguridad.md`: reglas de seguridad y prueba del visitante.
6. `docs/bitacora_ia.md` (últimas entradas) y `docs/prompts/README.md`: qué se ha hecho con IA y el formato de los prompts.

Si tu respuesta contradice alguno de estos archivos, el archivo gana. Si crees que el archivo está mal, dilo y pregunta; no lo cambies en silencio.

## 1. Reglas que no se negocian (la guía las califica)
- **M1:** Stripe **solo en modo de prueba**, tarjetas de prueba (4242 4242 4242 4242) y datos ficticios. Nunca sugerir activar la cuenta.
- **M2:** el visitante sin login (guest del Site) **no tiene permisos de objeto**. Todo acceso público pasa por `PortalDonacionesController`, con DTOs en lista blanca. Nunca devolver correo, RFC ni el nombre de una donación anónima o con factura.
- **M3:** **ninguna clave** (`sk_…`, `rk_…`, `whsec_…`) en código, metadata, capturas, bitácora, prompts ni chats.
  - La secret key vive en la External Credential `Stripe_Credential`; el signing secret, en el custom setting `Stripe_Config__c`.
  - El hook `.githooks/pre-commit` bloquea commits con claves. Actívalo con `git config core.hooksPath .githooks`.
- **Costo cero:** Developer Edition, sin paquetes ni servicios de pago. Una dependencia nueva se confirma con el profesor.
- **Calidad:** sin IDs hard-coded, sin SOQL ni DML en ciclos, Apex con tests. Los errores se muestran con mensaje entendible.
- **No cambiar sin aprobación del equipo:** el proceso de pago, los estados de la donación, el cálculo del recaudado (solo cuentan las Pagadas) y las reglas de visibilidad.

## 2. Arquitectura (resumen)
- **Sitio público:**
  - `portal-react/` (React 19 + Vite, entrada `index`), servido por `force-app/main/default/pages/Portal.page` como static resource `PortalReact`.
  - Datos por Visualforce Remoting → `PortalDonacionesController`.
- **Panel:**
  - Mismo proyecto React (entrada `admin`) → `pages/PanelAdmin.page` (interna).
  - Controladores: `AdminPortalController` (with sharing, USER_MODE, custom permissions) y `EquipoController` (alta de usuarios y roles; exige Gestionar usuarios).
- **Roles (permission sets):**
  - `Staff_Donaciones`: acceso base.
  - `Rol_Coordinacion`: custom permission `Gestionar_Campanas`.
  - `Rol_Tesoreria`: custom permission `Ver_Donaciones`.
  - `Dueno_Portal`: pestaña Equipo.
- **Stripe:**
  - `StripeService` (Checkout y consulta de sesión vía Named Credential `Stripe_API`).
  - `StripeWebhookService` (firma, idempotencia, eventos thin).
  - `DonacionTriggerHandler` y `ComprobanteService` (comprobante único).
- **Datos:**
  - `Campana__c`, `Hito__c` (metas acumulativas), `Donacion__c`, `Aviso_Pasarela__c`, `Miembro_Equipo__c`.
  - Custom setting `Stripe_Config__c`.
- **Marca de la plataforma:** `portal-react/src/marca.js`. Sistema de diseño: `portal-react/src/styles/` (`tokens.css`, `base.css`, `plataforma.css`, `admin.css`).

## 3. Cómo trabajar (comandos)
```bash
# Conectarse a la org (cada persona con SU usuario)
sf org login web -a donacionesOrg -r https://login.salesforce.com
sf config set target-org donacionesOrg

# Frontend
cd portal-react && npm install
npm run dev          # interfaz con datos DEMO (src/mock.js, src/admin/mock.js)
npm run build:sf     # genera el static resource PortalReact
cd ..

# Desplegar y probar
sf project deploy start -d force-app --test-level RunLocalTests
sf apex run test --test-level RunLocalTests --code-coverage --wait 15
python scripts/prueba_seguridad.py <IdDonacionPagada> <TokenPublico> <IdCampana>

# Respaldo de metadata (semanal y antes de cada entrega)
sf project retrieve start -x manifest/package.xml
```
Pasos manuales de la org (Stripe, Site, correo): `docs/tecnico/setup_org.md`.

## 4. Registro obligatorio de cada uso de IA (cuenta para la calificación C3)
Cada vez que la IA ayude en algo relevante:
1. Agrega una fila a la tabla de `docs/bitacora_ia.md` y una entrada abajo con:
   - Fecha.
   - **Autor: la persona del equipo que usa la IA** (no la IA).
   - Herramienta.
   - HU.
   - Qué se obtuvo.
   - **Qué se verificó y cómo** (comando, captura o test).
   - Qué se corrigió.
   - Aceleración estimada.
2. Si la IA se equivocó, márcalo con **⚠** y explica cómo se detectó.
3. Crea el prompt estructurado en `docs/prompts/<tu-nombre>/Pxx-*.md` con la plantilla de `docs/prompts/README.md`.
4. Si hubo un problema o una pregunta al profesor, registra una entrada en `docs/preguntas_y_reportes.md` con sus 5 partes.
5. Actualiza el archivo de la persona en `docs/equipo/<nombre>.md` y su fila en `docs/contribucion.md`. Los 4 archivos de la raíz de `docs/` tienen la ruta fija de la guía; no se mueven (ver `docs/README.md`). Para documentar el trabajo de un integrante, usa `docs/equipo/PROMPT_PARA_AGENTE.md`.
6. Al terminar, actualiza `docs/ESTADO.md` y, si cambia el estado de una historia, la tabla del `README.md` y el tablero.

## 5. Commits
- Cada persona hace commit con **su propia cuenta**: la contribución individual se evalúa contra el historial del repo (C9).
- Mensajes en español, describiendo qué historias se tocaron.
- Antes de subir, revisa que no haya claves (el hook lo hace) ni datos personales reales.
