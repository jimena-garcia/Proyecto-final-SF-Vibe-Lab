# Seguridad y datos personales

> Estado: **borrador técnico**. Las columnas "Resultado obtenido" y "Evidencia" se llenan al ejecutar la prueba en la org (ver la sección 1). Cualquier integrante debe poder repetirla siguiendo estos pasos (HU-12 CA3).

## 1. Prueba del visitante sin login (HU-12, M2)

**Preparación:**
- Existen al menos 3 donaciones ficticias de otras personas: una por modalidad, al menos una Pagada.
- Desde la app de staff, anota el Id de una donación (`a01…`) y su `Token público`.
- `SITIO` es la URL pública del Salesforce Site.
- Todas las pruebas se hacen **sin sesión**: ventana de incógnito o `curl` sin cookies.

| # | Vía | Acción | Resultado esperado | Resultado obtenido | Evidencia |
|---|---|---|---|---|---|
| L1 | Navegar el sitio | Recorrer campañas, "Ver donantes", formulario, gracias y cancelado | Solo campañas, avance, nombre + monto de donantes **con crédito pagados** y el formulario. Nunca correo, RFC ni anónimos. | | |
| L2 | API REST de datos | `curl -i "$SITIO/services/data/v66.0/sobjects/Donacion__c/<Id>"` | 401 / `INVALID_SESSION_ID` o 404, sin datos | 2026-11-10 (probado sobre Campana__c): 401 `INVALID_SESSION_ID` | salida de curl (pendiente captura) |
| L3 | API REST de consultas | `curl -i "$SITIO/services/data/v66.0/query?q=SELECT+Email__c+FROM+Donacion__c"` | 401 / error, sin datos | 2026-11-10: 401 `INVALID_SESSION_ID` | salida de curl (pendiente captura) |
| L4 | Remoting con token ajeno o adivinado | En la consola del navegador, sobre el sitio: `Visualforce.remoting.Manager.invokeAction(PORTAL_CONFIG.acciones.getEstado, '0123456789abcdef0123456789abcdef', console.log)` | `null` | | |
| L5 | Remoting con token real de otro donante | Igual que L4, con el token de la preparación | Solo estado, monto, campaña y folio: **sin nombre, correo ni RFC** | | |
| L6 | Endpoint Aura del sitio | `curl -i -X POST "$SITIO/s/sfsites/aura"` (o `/aura`) con un payload `getRecord` de Donacion__c | Error o sin datos (el guest no tiene permiso de objeto) | | |
| M1 | API REST (modificar) | `curl -i -X PATCH "$SITIO/services/data/v66.0/sobjects/Donacion__c/<Id>" -H "Content-Type: application/json" -d '{"Estado__c":"Pagada"}'` | 401 / error; la donación no cambia | | |
| M2 | Remoting (modificar) | Llamar `crearDonacion` con JSON que incluya `"Estado__c":"Pagada"` o `"Id":"<Id ajeno>"` | Los campos extra se ignoran; solo se crea una **nueva** donación Pendiente | | |
| M3 | Webhook falso | `curl -i -X POST "$SITIO/services/apexrest/stripe/webhook" -H "Stripe-Signature: t=1,v1=abc" -d '{"id":"evt_x","type":"checkout.session.completed"}'` | 400; la donación no cambia; aparece un Aviso **Rechazado** | | |
| M4 | Cancelar donación ajena | `cancelar` con el token de una donación **Pagada** ajena | No cambia (solo cancela si está Pendiente) | | |

**Riesgo residual de M4.** Quien conoce el token de una donación *pendiente* puede cancelarla. El token tiene 128 bits aleatorios, solo viaja en la URL de regreso de Stripe del propio donante y no expone datos personales. Si después llega el pago, el webhook la marca Pagada de todos modos.

## 2. Permisos del visitante (usuario invitado del sitio)

Permission set `Portal_Guest`. El perfil guest no tiene permisos adicionales.

| Permiso | Por qué es necesario |
|---|---|
| Página Visualforce `Portal` | Es la página del sitio que carga la app React. |
| Clase Apex `PortalDonacionesController` | Única puerta para leer campañas y registrar donaciones. Devuelve DTOs con campos en lista blanca. |
| Clase Apex `StripeWebhookResource` | Stripe llama al endpoint sin sesión. La autenticidad se valida con la firma HMAC, no con el usuario. |
| Principal `Stripe_Credential - StripeKey` | Permite que Apex haga el callout a Stripe con la clave guardada en Setup. El navegador nunca recibe la clave. |
| Lectura de *User External Credential* | Salesforce la exige para usar una Named Credential, aun con principal compartido. Sin ella, el callout falla con "You don't have read permissions on the User External Credential object". Solo lectura; el guest no tiene acceso a la API para consultarlo. |
| Página `SitioError` | Página de error amigable del sitio (sin detalles técnicos). |
| **Ningún permiso sobre objetos de negocio** (Campaña, Donación, Aviso) | La lectura y escritura pasan solo por Apex (`without sharing`, justificado en el código). Por eso fallan las vías L2, L3, L6 y M1. |

`without sharing` es necesario porque el guest no tiene acceso a registros. Las clases compensan así:
1. Nunca devuelven SObjects.
2. Nunca aceptan Id ni estado desde el navegador.
3. Exigen un token aleatorio para consultar una donación.

## 3. Claves de la pasarela (M3)

| Secreto | Dónde vive | Dónde NO está |
|---|---|---|
| Secret key de prueba `sk_test_…` | External Credential `Stripe_Credential` (Setup) | Código, metadata versionada, sitio, navegador, bitácora, prompts de IA |
| Signing secret del webhook `whsec_…` | Custom Setting protegido `Stripe_Config__c`. Sus datos no son metadata y `retrieve` no los baja. | Igual que arriba |

**Cómo se comprobó:**
- Hook `.githooks/pre-commit` que rechaza patrones `sk_`, `rk_` y `whsec_`.
- Revisión del historial completo: `git log -p --all | grep -E "(sk|rk)_(test|live)_|whsec_"` sin resultados (pegar la salida como evidencia).
- Inspección del código fuente del sitio y de `PortalReact.resource`: `grep -E "sk_|whsec_"` sin resultados.
- Si una clave se filtra: se rota en Stripe el mismo día y se avisa al profesor (guía, sección 5).

## 4. Clasificación de datos personales (OA6)

| Dato | ¿Personal? | ¿Se guarda? | Por qué | Quién lo ve |
|---|---|---|---|---|
| Nombre (crédito / factura) | Sí | Sí | Reconocimiento público (crédito) o factura | Staff; en público solo el de crédito pagado |
| Nombre (anónima) | Sí | **No**. Se descarta en Apex y lo impide una validation rule. | La modalidad anónima no lo requiere | Nadie |
| Correo | Sí | Sí | Enviar el comprobante | Staff y el propio donante (correo). Nunca en público. |
| RFC (factura) | Sí (persona física) | Sí | Solicitud de factura | Solo staff |
| Monto y campaña | No por sí solos | Sí | Avance de la meta | Público (monto agregado y por donante con crédito) |
| Datos de tarjeta (número, CVC, vigencia) | Sí, sensibles | **No**. Se capturan en Stripe Checkout. | Salesforce nunca los recibe | Solo Stripe |
| Id de sesión y payment intent de Stripe | No | Sí | Conciliar el pago con la donación | Staff |
| Token público | No | Sí | Referencia del pago sin exponer el Id | El donante (en su URL) y staff |
| IP o dispositivo del visitante | Sí | No | No se necesita | — |

### Datos públicos agregados en el rediseño (E2)
`getCampanas` ahora también devuelve: metas (`Hito__c`: título, monto, descripción), ilustración, la marca de destacada y el **número** de donaciones pagadas (roll-up COUNT). Ninguno es dato personal; el reconocimiento sigue limitado a nombre y monto de donaciones **con crédito y pagadas**. El guest sigue sin permisos de objeto, incluido `Hito__c`.

## 5. Riesgos conocidos

- **Spam en el formulario público.** Cualquiera puede crear donaciones Pendientes falsas. No se califica (guía, sección 3). Mitigaciones posibles: CAPTCHA, límite por IP o limpieza de pendientes viejas.
- Las donaciones Pendientes que nunca se pagan se quedan Pendientes. Pregunta abierta al cliente sobre su caducidad.
- Las Developer Edition se desactivan por inactividad. Mitigación: entrar cada semana y respaldar con `retrieve`.
- Si Deliverability no está en "All email", el comprobante no sale. El sistema desmarca `Comprobante_Enviado__c` para que staff lo note.

## 6. Entrega 2: aviso de la pasarela

- Endpoint público `/services/apexrest/stripe/webhook`. Cada aviso se autentica con HMAC-SHA256 sobre `t.payload`, con tolerancia de 5 minutos y comparación en tiempo constante.
- Los avisos falsos quedan como `Aviso_Pasarela__c` **Rechazado**, con fecha y motivo (HU-15 CA2, HU-17 CA1).
- Los repetidos quedan como **Duplicado** gracias a `Clave_Unica__c` única. Un solo comprobante, gracias a `Comprobante_Enviado__c` (HU-17 CA2).
- El aviso rechazado guarda el id que dice traer marcado como "(no verificado)". No guarda el payload, para no almacenar datos personales de un tercero.
