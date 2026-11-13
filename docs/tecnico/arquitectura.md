# Arquitectura

Plataforma de crowdfunding del programa SF Vibe Lab (UADY × Salesforce) **montada completa dentro de Salesforce**. El visitante ve un sitio web en React, dona con Stripe (modo de prueba) y Salesforce guarda todo y confirma el pago solo. El equipo administra desde un panel propio con roles.

## 1. Vista general

```
 VISITANTE (sin login)                    EQUIPO (con login de Salesforce)
        │                                        │
        ▼                                        ▼
 ┌──────────────────┐                 ┌──────────────────────┐
 │ Sitio público    │                 │ Panel de admin       │
 │ React (Portal)   │                 │ React (PanelAdmin)   │
 └────────┬─────────┘                 └──────────┬───────────┘
          │ Visualforce Remoting                 │ Visualforce Remoting
          ▼                                      ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                SALESFORCE (Developer Edition)                │
 │  Apex (lógica) · Objetos (datos) · Permission sets (acceso)  │
 └──────────┬───────────────────────────────────▲──────────────┘
            │ 1. crea la sesión de pago          │ 3. aviso firmado (webhook)
            ▼                                    │
 ┌──────────────────────────────────────────────┴──────┐
 │  STRIPE Checkout (modo de prueba) · 2. el donante paga │
 └──────────────────────────────────────────────────────┘
```

| Pieza | Tecnología | Dónde vive |
|---|---|---|
| Sitio público | React 19 + Vite 6 (entrada `index`) | `portal-react/` → static resource `PortalReact` → `pages/Portal.page` → Salesforce Site (usuario invitado) |
| Panel de administración | El mismo proyecto React (entrada `admin`) | `pages/PanelAdmin.page` (interna, exige login) |
| Lógica | Apex | `force-app/main/default/classes/` |
| Datos | Objetos personalizados | `force-app/main/default/objects/` (ver [`modelo_datos.md`](modelo_datos.md)) |
| Pagos | Stripe Checkout alojado + webhook | Named Credential `Stripe_API`, External Credential `Stripe_Credential` |

## 2. Decisión principal: React servido por Salesforce

| Alternativa | Ventajas | Desventajas | Decisión |
|---|---|---|---|
| **React empaquetado como static resource y servido por un Salesforce Site** | Sin hosting externo, sin CORS, sin OAuth propio; login y permisos nativos; costo cero | Bundle limitado a 5 MB; el login del staff es la pantalla de Salesforce | **Elegida** |
| React en hosting externo + API REST + OAuth | Dominio y login propios | Hosting (costo), CORS, manejo de tokens, más superficie de ataque (M2/M3) | Descartada |
| Solo LWC / páginas estándar de Salesforce | Nativo | Interfaz genérica, poco control del diseño | Descartada |

**Cómo se monta:**
1. `npm run build:sf` compila React con Vite y empaqueta `dist/` en un ZIP: `staticresources/PortalReact.resource`.
2. `Portal.page` (Visualforce) es solo un contenedor. Carga el JS y el CSS del ZIP y publica en `window.PORTAL_CONFIG` los nombres de las acciones remotas de Apex.
3. El Salesforce Site "Donaciones" publica `Portal.page` sin login.
4. React llama a Apex con **Visualforce Remoting**: una API interna sin configuración extra.
5. Navegación sin router externo, con parámetros en la URL: `?campana=<Id>`, `?gracias=<token>` y `?cancelado=<token>`.

## 3. Flujo de una donación

1. **Formulario:** React llama a `crearDonacion`.
   - Apex valida el monto y, si hay factura, el RFC con el patrón del SAT.
   - Inserta la `Donacion__c` en estado **Pendiente** con un **token aleatorio de 128 bits**.
2. **Pago:** `iniciarPago` crea una sesión de **Stripe Checkout** por el monto exacto.
   - `client_reference_id` y la metadata llevan el token.
   - Una Idempotency-Key evita sesiones dobles.
3. **El donante paga en Stripe:** la tarjeta nunca toca nuestro sitio.
4. **Regreso:** Stripe vuelve a `?gracias=<token>` (o `?cancelado=<token>`).
5. **Confirmación, por dos caminos:**
   - **Rápido:** la página de gracias llama a `verificarPago`. Apex consulta la sesión en Stripe y, si está `paid`, marca **Pagada**.
   - **Oficial (webhook):** Stripe envía el aviso a `/services/apexrest/stripe/webhook`. `StripeWebhookService`:
     - Verifica la **firma HMAC-SHA256** con tolerancia de tiempo. Un aviso falso queda como `Rechazado`.
     - Aplica **idempotencia** con `Clave_Unica__c`. Un aviso repetido queda como `Duplicado`.
     - Soporta eventos *snapshot* y *thin*; en los thin consulta la sesión a Stripe.
     - Registra un `Aviso_Pasarela__c` y marca la donación **Pagada**.
   - Ambos caminos usan `FOR UPDATE` para que una donación no se confirme dos veces.
6. **Trigger** (`DonacionTriggerHandler`): al pasar a Pagada fija `Fecha_Pago__c` y `Confirmada_Por__c` y envía **un solo** comprobante (`ComprobanteService`).
7. **Avance:** los roll-ups `Recaudado__c` y `Donaciones_Pagadas__c` de la campaña se recalculan solos. **Solo suman las Pagadas.**

## 4. Clases Apex

| Clase | Responsabilidad | Sharing |
|---|---|---|
| `PortalDonacionesController` | Todo lo que el **público** puede pedir: campañas, crear donación, iniciar pago, estado, verificar, cancelar. DTOs con campos en **lista blanca** | `without sharing` (el invitado no tiene permisos de objeto) |
| `StripeService` | Crear Checkout y consultar sesiones vía `callout:Stripe_API` | — |
| `StripeWebhookResource` / `StripeWebhookService` | Endpoint REST del webhook; firma, idempotencia y registro de avisos | `without sharing` |
| `DonacionTriggerHandler` | Reacciona al paso a Pagada (bulkificado) | — |
| `ComprobanteService` | Arma y envía el comprobante (sin nombre si es anónima; aclara que no es CFDI) | `without sharing` |
| `AdminPortalController` | Datos del **panel**. Valida la custom permission del rol en cada método | `with sharing` + `WITH USER_MODE` |
| `EquipoController` | Alta de personas, roles y desactivación. Solo quien tiene "Gestionar usuarios" | `with sharing` |
| `TestDataFactory` y `*Test` | Datos de prueba y **41 tests** (ver [`pruebas.md`](pruebas.md)) | — |

## 5. Seguridad (resumen; detalle en [`../seguridad.md`](../seguridad.md))

| Mínimo | Cómo se cumple |
|---|---|
| **M1 · Modo de prueba** | Stripe en test mode, tarjeta 4242, datos ficticios |
| **M2 · El visitante no ve datos de otros** | El usuario invitado **no tiene permisos de objeto**. Solo puede llamar a `PortalDonacionesController`, que devuelve campos en lista blanca. Ver su donación exige el token aleatorio. Nunca se devuelven correo, RFC ni el nombre de una donación anónima o con factura. Aura está deshabilitado en el sitio |
| **M3 · Cero secretos en el repo** | La secret key está en la External Credential y el signing secret en el custom setting protegido `Stripe_Config__c`. El hook `.githooks/pre-commit` bloquea `sk_`, `rk_` y `whsec_` |

**Roles del equipo (permission sets):**

| Permission set | Da acceso a |
|---|---|
| `Staff_Donaciones` | Base: entrar al panel |
| `Rol_Coordinacion` | Custom permission `Gestionar_Campanas`: campañas y metas (HU-08) |
| `Rol_Tesoreria` | Custom permission `Ver_Donaciones`: donaciones, facturas y avisos (HU-07, HU-09, HU-15) |
| `Dueno_Portal` | Además, la pestaña Equipo |
| `Portal_Guest` | Usuario invitado del Site: solo las clases y la página públicas |

## 6. Estructura del repositorio

```
Proyecto-final-SF-Vibe-Lab/
├── portal-react/            Frontend (React + Vite)
│   └── src/
│       ├── main.jsx · admin.jsx     dos entradas: sitio público y panel
│       ├── components/              pantallas públicas (Inicio, Proyecto, DonarForm, Gracias…)
│       ├── admin/                   pantallas del panel (Resumen, Campañas, Donaciones, Avisos, Equipo)
│       ├── lib/                     lógica pura (progreso, navegación)
│       ├── mock.js                  datos ficticios para `npm run dev`
│       └── styles/                  sistema de diseño (tokens.css, base.css, plataforma.css, admin.css)
├── force-app/main/default/  Backend en Salesforce
│   ├── classes/ triggers/ pages/ staticresources/
│   ├── objects/ permissionsets/ customPermissions/
│   └── namedCredentials/ externalCredentials/ layouts/ tabs/ applications/
├── manifest/package.xml     Respaldo de metadata con la CLI
├── scripts/                 Datos de demo (apex/), prueba de seguridad, tablero
├── docs/                    Documentación y entregables (ver docs/README.md)
└── .githooks/pre-commit     Bloquea commits con claves
```

## 7. Despliegue

```bash
cd portal-react && npm install && npm run build:sf    # React → static resource
cd ..
sf project deploy start -d force-app --test-level RunLocalTests
sf apex run test --test-level RunLocalTests --code-coverage --wait 15
sf project retrieve start -x manifest/package.xml     # respaldo de metadata
```
Pasos manuales de una sola vez (claves de Stripe en Setup, Site, webhook, correo): [`setup_org.md`](setup_org.md).
