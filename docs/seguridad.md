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
| L1 | Navegar el sitio | Recorrer campañas, "Ver donantes", formulario, gracias y cancelado | Solo campañas, avance, nombre + monto de donantes **con crédito pagados** y el formulario. Nunca correo, RFC ni anónimos. | 2026-11-10, sitio real, sin sesión: solo campañas, avance, metas y reconocimiento (nombre + monto de crédito pagado). Ningún correo ni RFC. | Capturas del sitio real (portada y campaña) |
| L2 | API REST de datos | `curl -i "$SITIO/services/data/v66.0/sobjects/Donacion__c/<Id>"` | 401 / `INVALID_SESSION_ID` o 404, sin datos | 2026-11-10, sitio real, sin sesión (DON-00006, pagada): **401** `INVALID_SESSION_ID`, sin datos | Salida del script `prueba_seguridad.py` (ver abajo) |
| L3 | API REST de consultas | `curl -i "$SITIO/services/data/v66.0/query?q=SELECT+Email__c+FROM+Donacion__c"` | 401 / error, sin datos | 2026-11-10, sitio real, sin sesión: **401** `INVALID_SESSION_ID` (consulta de Email y RFC) | Salida del script |
| L4 | Remoting con token ajeno o adivinado | En la consola del navegador, sobre el sitio: `Visualforce.remoting.Manager.invokeAction(PORTAL_CONFIG.acciones.getEstado, '0123456789abcdef0123456789abcdef', console.log)` | `null` | 2026-11-10, sitio real, sin sesión: `null` | Salida del script |
| L5 | Remoting con token real de otro donante | Igual que L4, con el token de la preparación | Solo estado, monto, campaña y folio: **sin nombre, correo ni RFC** | 2026-11-10, sitio real, sin sesión: solo `campana, estado, folio, monto`. Además `getCampanas` no contiene "@" ni "rfc"; los donantes públicos solo traen `nombre, monto` | Salida del script |
| L6 | Endpoint Aura del sitio | `curl -i -X POST "$SITIO/s/sfsites/aura"` (o `/aura`) con un payload `getRecord` de Donacion__c | Error o sin datos (el guest no tiene permiso de objeto) | 2026-11-10, sitio real, sin sesión: **404**, sin datos (Aura deshabilitado en el sitio: `enableAuraRequests=false`) | Salida del script |
| M1 | API REST (modificar) | `curl -i -X PATCH "$SITIO/services/data/v66.0/sobjects/Donacion__c/<Id>" -H "Content-Type: application/json" -d '{"Estado__c":"Pagada"}'` | 401 / error; la donación no cambia | 2026-11-10, sitio real, sin sesión: **401**; DON-00006 sigue **Pagada** | Salida del script + consulta en Salesforce |
| M2 | Remoting (modificar) | Llamar `crearDonacion` con JSON que incluya `"Estado__c":"Pagada"` o `"Id":"<Id ajeno>"` | Los campos extra se ignoran; solo se crea una **nueva** donación Pendiente | 2026-11-10, sitio real, sin sesión: **rechazado** (`ok=false`, sin token): el servidor no acepta campos que no estén en la lista blanca; no se creó ni modificó nada | Salida del script |
| M3 | Webhook falso | `curl -i -X POST "$SITIO/services/apexrest/stripe/webhook" -H "Stripe-Signature: t=1,v1=abc" -d '{"id":"evt_x","type":"checkout.session.completed"}'` | 400; la donación no cambia; aparece un Aviso **Rechazado** | 2026-11-10, sitio real, sin sesión: **400** `rechazado`; queda AV-00009 **Rechazado** ("Marca de tiempo fuera de tolerancia"); ninguna donación cambia | Salida del script + panel → Avisos |
| M4 | Cancelar donación ajena | `cancelar` con el token de una donación **Pagada** ajena | No cambia (solo cancela si está Pendiente) | 2026-11-10, sitio real, sin sesión: respuesta genérica, pero DON-00006 sigue **Pagada** | Consulta en Salesforce |

**Riesgo residual de M4.** Quien conoce el token de una donación *pendiente* puede cancelarla. El token tiene 128 bits aleatorios, solo viaja en la URL de regreso de Stripe del propio donante y no expone datos personales. Si después llega el pago, el webhook la marca Pagada de todos modos.

### Cómo repetir la prueba automáticamente
Script: `scripts/prueba_seguridad.py`. Usa solo la biblioteca estándar de Python y no envía cookies ni sesión.

```bash
python scripts/prueba_seguridad.py <Id de una donación pagada> <su Token público> <Id de su campaña>
```

Resultado del 2026-11-10 (donación ajena = DON-00006, pagada):

| Prueba | Resultado |
|---|---|
| L2 GET Donacion__c por REST | HTTP 401 INVALID_SESSION_ID |
| L3 query SOQL (Email, RFC) | HTTP 401 INVALID_SESSION_ID |
| L4 getEstado con token inventado | null |
| L5 getEstado con token real ajeno | solo campana, estado, folio, monto |
| L5b getCampanas | sin "@", sin "rfc"; donantes: nombre, monto |
| L6 endpoint Aura | HTTP 404 |
| M1 PATCH Donacion__c | HTTP 401 (la donación sigue Pagada) |
| M2 crearDonacion con Estado/Id | rechazado, no se crea nada |
| M3 aviso falso | HTTP 400 + Aviso Rechazado |
| M4 cancelar donación pagada ajena | sin cambio (sigue Pagada) |

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

## 2b. Portal de administración (coordinación y tesorería)

| Elemento | Quién accede | Cómo se protege |
|---|---|---|
| Página `PanelAdmin` | Usuarios internos con el permission set `Staff_Donaciones` | No está en el Site público. El guest recibe 401 y la página de error (probado con `curl` a `/apex/PanelAdmin` y `/PanelAdmin` en el dominio del sitio, sin sesión). |
| `AdminPortalController` | Staff | `with sharing` + `WITH USER_MODE` + DML `as user`: respeta los permisos del usuario. Staff no edita estado ni monto de donaciones. |
| `EquipoController` (alta de personas) | Solo quien tiene **Gestionar usuarios** (el dueño de la org) | El permiso se valida en el servidor. La contraseña se fija con `System.setPassword`; no se guarda en objetos, logs ni en el navegador después de mostrarse una vez. |
| Login | Cada persona con su correo y contraseña | Login nativo de Salesforce (bloqueo por intentos, expiración de sesión). Licencia Salesforce Platform: máximo 6 personas. |

### Roles del equipo (mínimo privilegio)
| Permission set | Quién | Puede | No puede |
|---|---|---|---|
| `Staff_Donaciones` (base) | Todo el equipo | Entrar al panel y ver campañas (lectura) | Ver datos de donantes |
| `Rol_Coordinacion` + custom permission `Gestionar_Campanas` | Coordinación (HU-08) | Crear y editar campañas y metas | Ver donaciones, correos, RFC ni avisos |
| `Rol_Tesoreria` + custom permission `Ver_Donaciones` | Tesorería (HU-07, HU-09, HU-15) | Ver donaciones (con correo y RFC), facturas y avisos, solo lectura | Editar campañas |
| `Dueno_Portal` | Solo quien administra la org | Ver la pestaña **Equipo** (`Miembro_Equipo__c`) en Salesforce | — |

- **Doble validación:** cada método de `AdminPortalController` valida la custom permission en el servidor (`FeatureManagement.checkPermission`), y además USER_MODE aplica CRUD y FLS.
- **Alta y roles:** dar de alta, cambiar roles y desactivar exige el permiso del sistema *Gestionar usuarios*, que solo tiene el dueño. Un test con usuarios reales de cada rol lo comprueba.

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
| Nombre (anónima) | Sí | **No**. Se descarta en Apex y lo impide una validation rule. | La modalidad anónima no lo requiere | Nadie. En el reconocimiento público aparece como "Donante anónimo" con su monto |
| Correo | Sí | Sí | Enviar el comprobante | Staff y el propio donante (correo). Nunca en público. |
| RFC (factura) | Sí (persona física) | Sí | Solicitud de factura | Solo staff |
| Monto y campaña | No por sí solos | Sí | Avance de la meta | Público (monto agregado y por donante con crédito) |
| Datos de tarjeta (número, CVC, vigencia) | Sí, sensibles | **No**. Se capturan en Stripe Checkout. | Salesforce nunca los recibe | Solo Stripe |
| Id de sesión y payment intent de Stripe | No | Sí | Conciliar el pago con la donación | Staff |
| Token público | No | Sí | Referencia del pago sin exponer el Id | El donante (en su URL) y staff |
| IP o dispositivo del visitante | Sí | No | No se necesita | — |

### Confirmación al regresar de Stripe (E2)
Al volver a `?gracias=<token>`, el sitio llama a `verificarPago(token)`. Salesforce consulta la sesión **directamente a Stripe** con la clave secreta (Named Credential). Solo marca Pagada (Confirmada por = Pasarela) si se cumplen dos condiciones:
1. Stripe responde `payment_status = paid`.
2. El `client_reference_id` de la sesión coincide con el token de la donación.

El navegador no puede falsificar el resultado: solo envía el token y nunca un estado. El webhook sigue igual como respaldo. Las dos rutas bloquean el registro (`FOR UPDATE`) antes de actualizarlo, así que nunca se envían dos comprobantes.

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
