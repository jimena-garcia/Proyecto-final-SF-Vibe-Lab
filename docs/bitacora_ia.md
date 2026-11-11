# Bitácora de IA

Una entrada por uso relevante de IA, en orden cronológico. Cada entrada enlaza al prompt estructurado que la originó en [`docs/prompts/`](prompts/README.md). El contexto base de la IA está en [`CLAUDE.md`](../CLAUDE.md).

**Leyenda:** ⚠ = la IA se equivocó (cómo se detectó y cómo se corrigió en la misma entrada).

## Resumen

| # | Fecha | Autor | Herramienta | HU | Prompt | Errores de la IA | Aceleración estimada |
|---|---|---|---|---|---|---|---|
| 1 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | Todas | [P01](prompts/dilian/P01-analisis-y-plan.md) | ⚠ | ~4 h → 40 min |
| 2 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-03, 13, 16, 17 | [P02](prompts/dilian/P02-evaluacion-pasarelas.md) | — | ~2 h → 15 min |
| 3 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-11 | [P03](prompts/dilian/P03-react-y-salesforce.md) | (supuesto nuestro) | ~3 h → 30 min |
| 4 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-01…09 | [P04](prompts/dilian/P04-metadata-modelo.md) | ⚠ | ~5 h → 1 h |
| 5 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-03, 04, 13 | [P05](prompts/dilian/P05-apex-portal-stripe.md) | ⚠ | ~4 h → 1 h |
| 6 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-11 | [P06](prompts/dilian/P06-empaquetado-react.md) | ⚠ | ~1.5 h → 20 min |
| 7 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-14…17 | [P07](prompts/dilian/P07-webhook-stripe.md) | — | ~6 h → 1.5 h |
| 8 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | Todas | [P08](prompts/dilian/P08-despliegue-tests.md) | ⚠ | ~2 h → 15 min |
| 9 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-11, 12 | [P09](prompts/dilian/P09-sitio-publico.md) | ⚠ | ~1.5 h → 30 min |
| 10 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-03, 13 | [P10](prompts/dilian/P10-prueba-punta-a-punta.md) | ⚠ | ~3 h → 40 min |
| 11 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-14, 16 | [P11](prompts/dilian/P11-eventos-thin.md) | ⚠ | ~2 h → 20 min |
| 12 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-01, 04, 05, 11 | [P12](prompts/dilian/P12-rediseno-ux-ui.md) | ⚠ | ~16 h → 3 h |
| 13 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-01, 11 | [P13](prompts/dilian/P13-portada-descubrimiento.md) | ⚠ | ~4 h → 45 min |
| 14 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-04, HU-14, HU-16 | [P14](prompts/dilian/P14-confirmacion-rapida.md) | ⚠ | ~3 h → 30 min |
| 15 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-07, HU-08, HU-09, HU-15 | [P15](prompts/dilian/P15-portal-admin.md) | ⚠ | ~12 h → 2 h |
| 16 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-07, HU-08, HU-09, HU-15 | [P16](prompts/dilian/P16-roles-equipo.md) | ⚠ | ~6 h → 1 h |
| 17 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-01, HU-04, HU-05, HU-11 (UX) | [P17](prompts/dilian/P17-marca-plataforma.md) | ⚠ | ~8 h → 1.5 h |
| 18 | 2026-11-10 | Jimena | GitHub Copilot | HU-01, HU-03, HU-04, HU-05, HU-06, HU-07, HU-08, HU-09, HU-11, HU-12, HU-15 | [P01](prompts/jimena/J01-guion-video-entrega1.md) | — | ~45 min → 10 min |

---

## Entradas

### 1 · Análisis del proyecto y plan — [P01](prompts/dilian/P01-analisis-y-plan.md)
- **Qué obtuvimos:** un plan con Salesforce Site + React embebido en Visualforce, Apex como única puerta del guest, Stripe Checkout y webhook firmado.
- **⚠ Error / límite de la IA:** no pudo abrir el Claude Doc de la guía. Lo dijo explícitamente y no inventó su contenido.
- **Qué verificamos y cómo:** pegamos el texto completo de la guía y revisamos que el plan cubriera de RF-D1 a RF-V3b y los mínimos M1–M3.
- **Qué corregimos:** ajustamos el plan a la guía (Stripe obligatorio, Developer Edition, Entrega 1 el 10 nov).

### 2 · Evaluación de pasarelas — [P02](prompts/dilian/P02-evaluacion-pasarelas.md)
- **Qué obtuvimos:** una tabla Stripe vs Mercado Pago vs Openpay. Stripe tiene firma HMAC verificable en Apex; Openpay no firma sus webhooks con HMAC.
- **Qué verificamos y cómo:** la documentación de webhooks de cada pasarela (búsqueda web) y la sección 6 de la guía ("Stripe en modo de prueba, únicamente").
- **Qué corregimos:** nada. La comparación queda como justificación técnica.

### 3 · Conectar React con Salesforce — [P03](prompts/dilian/P03-react-y-salesforce.md)
- **Qué obtuvimos:** la decisión de usar Visualforce Remoting desde React dentro de un Salesforce Site, sin hosting externo.
- **Supuesto incorrecto (nuestro, no de la IA):** creíamos que la app React de la práctica 1 ya se conectaba a Salesforce. La IA leyó el código y encontró que usaba `Account_Sample_Data.json` local.
- **Qué verificamos y cómo:** revisamos `practica1/react-account-explorer/src`; no hay llamadas a Salesforce.

### 4 · Metadata del modelo — [P04](prompts/dilian/P04-metadata-modelo.md)
- **Qué obtuvimos:** 3 objetos, 1 custom setting, 5 validation rules, las list views de factura y avisos rechazados, y 2 permission sets.
- **⚠ Error de la IA:** el primer generador con heredocs de bash falló (`unexpected EOF`) por las comillas en los mensajes.
- **Qué verificamos y cómo:** el script falló al ejecutarse; después, despliegue en la org (entrada 8).
- **Qué corregimos:** reescribimos el generador en Python, que escapa el XML.

### 5 · Apex del portal y Stripe — [P05](prompts/dilian/P05-apex-portal-stripe.md)
- **Qué obtuvimos:** `PortalDonacionesController` y `StripeService`. El flujo usa dos llamadas porque Apex no permite un callout después de un DML.
- **⚠ Error de la IA (detectado en su autorrevisión):** usó `instanceof Id` sobre un String, algo que no compila en Apex.
- **Qué verificamos y cómo:** revisamos el código antes de desplegar y luego corrimos los tests en la org.
- **Qué corregimos:** `Id.valueOf` dentro de try/catch.

### 6 · Empaquetado de React — [P06](prompts/dilian/P06-empaquetado-react.md)
- **Qué obtuvimos:** la configuración de Vite y el script `build:sf`.
- **⚠ Error de la IA:** Vite nombró el CSS `style.css`, pero la página lo buscaba como `index.css`.
- **Qué verificamos y cómo:** la salida del build y la lista de archivos del zip.
- **Qué corregimos:** fijamos `assetFileNames`.

### 7 · Webhook de Stripe — [P07](prompts/dilian/P07-webhook-stripe.md)
- **Qué obtuvimos:** `StripeWebhookService`, el trigger handler, el comprobante único y los tests.
- **Qué verificamos y cómo:** los tests en la org (entrada 8) y un aviso real reenviado desde Stripe (entrada 11).

### 8 · Despliegue y tests — [P08](prompts/dilian/P08-despliegue-tests.md)
- **Qué obtuvimos:** despliegue exitoso; 21/21 tests y 91% de cobertura.
- **⚠ Error de la IA:** el primer despliegue falló en 17 componentes por cuatro causas:
  - Iconos de pestaña inválidos.
  - `caseSensitive` en un campo que no era único.
  - `externalSharingModel` incompatible con master-detail.
  - Una descripción de más de 255 caracteres.
- **Qué verificamos y cómo:** la tabla de errores de `sf project deploy start`.
- **Qué corregimos:** las cuatro causas; el segundo despliegue pasó.

### 9 · Sitio público — [P09](prompts/dilian/P09-sitio-publico.md)
- **Qué obtuvimos:** el Site creado por metadata, el guest con `Portal_Guest` y la página de error `SitioError`.
- **⚠ Diagnóstico equivocado de la IA:** el sitio respondía "en mantenimiento" y la IA supuso que faltaba aceptar términos. Era propagación: a los minutos respondió 200.
- **Qué verificamos y cómo:** `curl` a varias rutas y revisión de Setup → Sites.
- **Lección:** esperar y volver a probar antes de cambiar configuración.

### 10 · Prueba de punta a punta como visitante — [P10](prompts/dilian/P10-prueba-punta-a-punta.md)
- **Qué obtuvimos:** DON-00003 Pendiente con su sesión de Stripe en MXN.
- **⚠ Error de la IA:** dio acceso al principal de Stripe por CLI y luego redesplegó el permission set, lo que borró ese acceso.
- **Qué verificamos y cómo:** el motivo quedó en `Motivo_Cancelacion__c` y la donación pasó a Cancelada con un mensaje entendible (C6 funcionó).
- **Qué corregimos:** agregamos al permission set la lectura de `UserExternalCredential` y `externalCredentialPrincipalAccesses` en la metadata.

### 11 · Eventos "thin" de Stripe — [P11](prompts/dilian/P11-eventos-thin.md)
- **Qué obtuvimos:** soporte de eventos thin. Con el id, Salesforce consulta la sesión a Stripe, que es la fuente de verdad; se agregaron 2 tests.
- **⚠ Error de la IA:** indicó elegir "Instantánea" en Stripe, pero el destino ya existía como "Resumen" y el código no soportaba ese formato.
- **Qué verificamos y cómo:** AV-00002 quedó Ignorado; tras el cambio reenviamos el evento: AV-00003 Aceptado, DON-00005 Pagada por Pasarela y la campaña en $500.

### 12 · Auditoría y rediseño UX/UI — [P12](prompts/dilian/P12-rediseno-ux-ui.md)
- **Qué obtuvimos:** un sistema de diseño propio (tokens, Fraunces + Inter empaquetadas, ilustraciones SVG), la página de proyecto, metas escalonadas (`Hito__c`), un formulario por pasos accesible y estados de pago honestos.
- **⚠ Errores de la IA:**
  1. La primera versión era un listado de campañas; el equipo quería una campaña principal con 3 metas, como Kickstarter.
  2. Un desborde a 320 px que no se veía en desktop.
  3. Saltos de línea reales dentro de un string JS.
- **Qué verificamos y cómo:** capturas con Chrome headless a 320, 375 y 1440 px (iframe con el ancho exacto) y del Site desplegado; `node --check`; 28 tests de Apex en verde.
- **Qué corregimos:** `Hito__c` sin rehacer el backend, `minmax(0,1fr)` en las rejillas y el string escapado.

### 13 · Portada de descubrimiento — [P13](prompts/dilian/P13-portada-descubrimiento.md)
- **Qué obtuvimos:** una portada tipo Kickstarter con banner de cifras, campaña destacada, recomendadas y explorar. Agregamos dos campañas secundarias ficticias (Viáticos en la CDMX y Seguro de viaje) con `scripts/apex/campanas_secundarias.apex`.
- **⚠ Error de la IA:** la primera captura del sitio real mostraba la versión anterior y parecía un despliegue fallido. Era caché: el bundle nuevo sí estaba publicado (verificado con `curl`).
- **Qué verificamos y cómo:** capturas en desarrollo a 375 y 1440 px y del sitio real con perfil de navegador limpio.
- **Qué corregimos:** nada en el código. Documentamos que el sitio guarda en caché la portada unos minutos (Ctrl+F5).

### 14 · Confirmación más rápida del pago — [P14](prompts/dilian/P14-confirmacion-rapida.md)
- **Qué obtuvimos:**
  - Medición de tiempos: DON-00006 tardó 81 s entre el registro y el aviso de Stripe.
  - Sondeo de la página de gracias cada 2 s (antes con espera creciente).
  - `verificarPago(token)`: al regresar, Salesforce consulta la sesión a Stripe y confirma al instante.
- **⚠ Error de la IA:** el sondeo con espera creciente (2 → 3 → 5 → 8 → 10 → 15 s…) que la propia IA diseñó en el rediseño agregaba hasta 15 s de espera. Lo detectó el usuario por la lentitud percibida.
- **Qué verificamos y cómo:**
  - Consulta de `CreatedDate`, `Fecha_Pago__c` y `Recibido__c` de los avisos.
  - 3 tests nuevos: pagada, no pagada o sesión ajena, y Stripe caído. 31/31 en verde.
- **Qué corregimos:**
  - Sondeo fijo de 2 s durante el primer minuto.
  - `FOR UPDATE` en el webhook y en la verificación para no duplicar el comprobante.
- **Decisión del equipo:** se cambió el proceso de confirmación (antes intocable) con aprobación explícita. Queda documentado en `docs/seguridad.md`.
- **Hallazgo posterior (medido con los logs de Salesforce del usuario invitado):** el tiempo restante no depende de nosotros, sino de la **redirección de Stripe Checkout**, que es intermitente.

  | Donación | Monto | Del pago confirmado a la página de gracias |
  |---|---|---|
  | DON-00008 | $1,000 | < 2 s |
  | DON-00009 | $35,000 | 120 s exactos |
  | DON-00010 | $2,000 | < 1 s |

  - Salesforce confirmó cada pago en menos de 1 s y respondió la página en menos de 0.1 s.
  - El monto no influye.
  - La hipótesis es un tiempo de espera de la página de Stripe o del navegador (por ejemplo, una extensión que bloquea peticiones de Stripe).
  - **Pendiente:** confirmarla en un navegador sin extensiones. Si persiste, evaluar Stripe Embedded Checkout.

### 15 · Portal de administración y alta del equipo — [P15](prompts/dilian/P15-portal-admin.md)
- **Qué obtuvimos:**
  - Un portal React con el mismo diseño del sitio, con las secciones Resumen, Campañas y metas, Donaciones (6 filtros y búsqueda), Avisos y Equipo.
  - Página `PanelAdmin` y pestaña **Panel** en la app de Salesforce.
  - `AdminPortalController`, `with sharing` y USER_MODE.
  - `EquipoController`: alta de personas con correo y contraseña (licencia Platform y permiso Staff), que exige Gestionar usuarios.
- **⚠ Errores de la IA:**
  1. El heredoc de bash cortó un archivo de test a la mitad; se reescribió con la herramienta de archivos.
  2. El enlace de acceso usaba `/?startURL=…` y la prueba con `sf org open -p` mostró "Invalid Page Redirection". Se cambió al flujo nativo `/apex/PanelAdmin`, donde Salesforce manda al login y regresa solo (verificado con `curl`).
- **Qué verificamos y cómo:**
  - 40 tests en verde, incluido un usuario de staff real (`System.runAs`) que **no** puede dar de alta personas.
  - Capturas del panel a 1440 y 375 px.
  - `curl` sin sesión a `/apex/PanelAdmin` en el sitio público: 401.
  - Métodos ejecutados con los datos reales de la org.
- **Pendiente:** prueba del usuario con una persona real (alta y login en incógnito). La CLI no puede abrir sesión de navegador en Visualforce.

### 16 · Roles del equipo y registro en Salesforce — [P16](prompts/dilian/P16-roles-equipo.md)
- **Qué obtuvimos:**
  - Roles **Coordinación**, **Tesorería** y **Ambos** con permission sets y custom permissions.
  - Selector de rol al dar de alta y cambio de rol en el panel.
  - Navegación del panel según el rol.
  - Objeto `Miembro_Equipo__c` con la pestaña **Equipo** en la app de Salesforce, con vistas Activos, Coordinación y Tesorería.
  - Vista "Pagos de hoy" en Donaciones.
  - Script de migración para quien ya tenía acceso.
- **⚠ Errores de la IA:**
  1. El permission set de Tesorería no tenía lectura de Campaña. Salesforce lo exige por la relación master-detail con Donación, y el despliegue falló.
  2. Una condición redundante al asignar el acceso base (`(a || !b) && !b`) se detectó en la revisión y se simplificó.
- **Qué verificamos y cómo:**
  - 41 tests en verde, con usuarios reales de cada rol (`System.runAs`):
    - Coordinación no ve donaciones ni avisos.
    - Tesorería no edita campañas.
    - Ningún rol crea usuarios ni cambia roles.
  - Capturas del alta con rol y de la vista de Coordinación.
  - Consulta de `Miembro_Equipo__c` tras la migración.
- **Detalle técnico:** el registro en `Miembro_Equipo__c` se guarda con `@future`, porque Salesforce no permite guardar usuarios o permisos y registros normales en la misma transacción (MIXED_DML).

### 17 · Marca de la plataforma y diseño claro (Fase B) — [P17](prompts/dilian/P17-marca-plataforma.md)
- **Qué obtuvimos:**
  - Marca propia de la plataforma ("Impulso Vibe Lab", provisional, en `src/marca.js`) separada de la de las campañas.
  - Paleta clara con un solo verde, con contraste AA medido.
  - Header blanco con buscador de campañas y "Acceso del equipo".
  - Portada: titular, banner del programa, destacada y recomendadas con barra de avance bajo la imagen.
  - Página de campaña: cifras, franja de confianza, pestañas, tarjeta del organizador y preguntas frecuentes.
  - Footer con espacios para los logos de UADY y Salesforce.
- **Insumo del usuario:** capturas de Kickstarter (`proyectofinal/ejemplos/`), usadas como referencia funcional. No se copiaron marca, logos ni contenido.
- **⚠ Errores de la IA:**
  1. En la página de campaña, las cifras salían con la etiqueta encima del número (`column-reverse` sobre un orden ya invertido); se vio en la captura.
  2. El sitio oficial de Mexico Dreamin bloquea bots; la IA no esquivó la protección y pidió al equipo el logo y capturas.
  3. Un `cd` repetido hizo que los ajustes del panel no se aplicaran en el primer intento; se detectó porque `grep` no encontró el cambio.
- **Qué verificamos y cómo:**
  - Contraste calculado: acción 5.36:1, progreso 3.49:1, texto secundario 6.69:1.
  - Capturas a 1440 y 375 px y del sitio real ($74,000, 6 donaciones, 74%).
- **Pendiente:** confirmar el nombre de la plataforma y recibir los logos oficiales.

### 18 · Guion de video demo de Entrega 1 — [J01](prompts/jimena/J01-guion-video-entrega1.md)
- **Qué obtuvimos:** un guion de máximo cinco minutos con pantallas, acciones y narración para el sitio público y el panel.
- **Qué verificamos y cómo:** comprobación con PowerShell de los requisitos explícitos, la duración final, 11 escenas y ausencia de patrones de claves `sk_`, `rk_` y `whsec_`.
- **Qué corregimos:** se ajustó la validación para leer el Markdown como UTF-8 y reconocer correctamente acentos y el separador de tiempo.
