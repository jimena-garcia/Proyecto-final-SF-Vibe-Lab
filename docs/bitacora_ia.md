# Bitácora de IA

Una entrada por uso relevante de IA, en orden cronológico. Cada entrada enlaza al prompt estructurado que la originó en [`docs/prompts/`](prompts/README.md). El contexto base de la IA está en [`CLAUDE.md`](../CLAUDE.md).

**Leyenda:** ⚠ = la IA se equivocó (cómo se detectó y cómo se corrigió en la misma entrada).

## Resumen

| # | Fecha | Autor | Herramienta | HU | Prompt | Errores de la IA | Aceleración estimada |
|---|---|---|---|---|---|---|---|
| 1 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | Todas | [P01](prompts/P01-analisis-y-plan.md) | ⚠ | ~4 h → 40 min |
| 2 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-03, 13, 16, 17 | [P02](prompts/P02-evaluacion-pasarelas.md) | — | ~2 h → 15 min |
| 3 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-11 | [P03](prompts/P03-react-y-salesforce.md) | (supuesto nuestro) | ~3 h → 30 min |
| 4 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-01…09 | [P04](prompts/P04-metadata-modelo.md) | ⚠ | ~5 h → 1 h |
| 5 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-03, 04, 13 | [P05](prompts/P05-apex-portal-stripe.md) | ⚠ | ~4 h → 1 h |
| 6 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-11 | [P06](prompts/P06-empaquetado-react.md) | ⚠ | ~1.5 h → 20 min |
| 7 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-14…17 | [P07](prompts/P07-webhook-stripe.md) | — | ~6 h → 1.5 h |
| 8 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | Todas | [P08](prompts/P08-despliegue-tests.md) | ⚠ | ~2 h → 15 min |
| 9 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-11, 12 | [P09](prompts/P09-sitio-publico.md) | ⚠ | ~1.5 h → 30 min |
| 10 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-03, 13 | [P10](prompts/P10-prueba-punta-a-punta.md) | ⚠ | ~3 h → 40 min |
| 11 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-14, 16 | [P11](prompts/P11-eventos-thin.md) | ⚠ | ~2 h → 20 min |
| 12 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-01, 04, 05, 11 | [P12](prompts/P12-rediseno-ux-ui.md) | ⚠ | ~16 h → 3 h |
| 13 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-01, 11 | [P13](prompts/P13-portada-descubrimiento.md) | ⚠ | ~4 h → 45 min |
| 14 | 2026-11-10 | Dilian | Claude Code (Claude Opus 5.5) | HU-04, HU-14, HU-16 | [P14](prompts/P14-confirmacion-rapida.md) | ⚠ | ~3 h → 30 min |

---

## Entradas

### 1 · Análisis del proyecto y plan — [P01](prompts/P01-analisis-y-plan.md)
- **Qué obtuvimos:** un plan con Salesforce Site + React embebido en Visualforce, Apex como única puerta del guest, Stripe Checkout y webhook firmado.
- **⚠ Error / límite de la IA:** no pudo abrir el Claude Doc de la guía. Lo dijo explícitamente y no inventó su contenido.
- **Qué verificamos y cómo:** pegamos el texto completo de la guía y revisamos que el plan cubriera de RF-D1 a RF-V3b y los mínimos M1–M3.
- **Qué corregimos:** ajustamos el plan a la guía (Stripe obligatorio, Developer Edition, Entrega 1 el 10 nov).

### 2 · Evaluación de pasarelas — [P02](prompts/P02-evaluacion-pasarelas.md)
- **Qué obtuvimos:** una tabla Stripe vs Mercado Pago vs Openpay. Stripe tiene firma HMAC verificable en Apex; Openpay no firma sus webhooks con HMAC.
- **Qué verificamos y cómo:** la documentación de webhooks de cada pasarela (búsqueda web) y la sección 6 de la guía ("Stripe en modo de prueba, únicamente").
- **Qué corregimos:** nada. La comparación queda como justificación técnica.

### 3 · Conectar React con Salesforce — [P03](prompts/P03-react-y-salesforce.md)
- **Qué obtuvimos:** la decisión de usar Visualforce Remoting desde React dentro de un Salesforce Site, sin hosting externo.
- **Supuesto incorrecto (nuestro, no de la IA):** creíamos que la app React de la práctica 1 ya se conectaba a Salesforce. La IA leyó el código y encontró que usaba `Account_Sample_Data.json` local.
- **Qué verificamos y cómo:** revisamos `practica1/react-account-explorer/src`; no hay llamadas a Salesforce.

### 4 · Metadata del modelo — [P04](prompts/P04-metadata-modelo.md)
- **Qué obtuvimos:** 3 objetos, 1 custom setting, 5 validation rules, las list views de factura y avisos rechazados, y 2 permission sets.
- **⚠ Error de la IA:** el primer generador con heredocs de bash falló (`unexpected EOF`) por las comillas en los mensajes.
- **Qué verificamos y cómo:** el script falló al ejecutarse; después, despliegue en la org (entrada 8).
- **Qué corregimos:** reescribimos el generador en Python, que escapa el XML.

### 5 · Apex del portal y Stripe — [P05](prompts/P05-apex-portal-stripe.md)
- **Qué obtuvimos:** `PortalDonacionesController` y `StripeService`. El flujo usa dos llamadas porque Apex no permite un callout después de un DML.
- **⚠ Error de la IA (detectado en su autorrevisión):** usó `instanceof Id` sobre un String, algo que no compila en Apex.
- **Qué verificamos y cómo:** revisamos el código antes de desplegar y luego corrimos los tests en la org.
- **Qué corregimos:** `Id.valueOf` dentro de try/catch.

### 6 · Empaquetado de React — [P06](prompts/P06-empaquetado-react.md)
- **Qué obtuvimos:** la configuración de Vite y el script `build:sf`.
- **⚠ Error de la IA:** Vite nombró el CSS `style.css`, pero la página lo buscaba como `index.css`.
- **Qué verificamos y cómo:** la salida del build y la lista de archivos del zip.
- **Qué corregimos:** fijamos `assetFileNames`.

### 7 · Webhook de Stripe — [P07](prompts/P07-webhook-stripe.md)
- **Qué obtuvimos:** `StripeWebhookService`, el trigger handler, el comprobante único y los tests.
- **Qué verificamos y cómo:** los tests en la org (entrada 8) y un aviso real reenviado desde Stripe (entrada 11).

### 8 · Despliegue y tests — [P08](prompts/P08-despliegue-tests.md)
- **Qué obtuvimos:** despliegue exitoso; 21/21 tests y 91% de cobertura.
- **⚠ Error de la IA:** el primer despliegue falló en 17 componentes por cuatro causas:
  - Iconos de pestaña inválidos.
  - `caseSensitive` en un campo que no era único.
  - `externalSharingModel` incompatible con master-detail.
  - Una descripción de más de 255 caracteres.
- **Qué verificamos y cómo:** la tabla de errores de `sf project deploy start`.
- **Qué corregimos:** las cuatro causas; el segundo despliegue pasó.

### 9 · Sitio público — [P09](prompts/P09-sitio-publico.md)
- **Qué obtuvimos:** el Site creado por metadata, el guest con `Portal_Guest` y la página de error `SitioError`.
- **⚠ Diagnóstico equivocado de la IA:** el sitio respondía "en mantenimiento" y la IA supuso que faltaba aceptar términos. Era propagación: a los minutos respondió 200.
- **Qué verificamos y cómo:** `curl` a varias rutas y revisión de Setup → Sites.
- **Lección:** esperar y volver a probar antes de cambiar configuración.

### 10 · Prueba de punta a punta como visitante — [P10](prompts/P10-prueba-punta-a-punta.md)
- **Qué obtuvimos:** DON-00003 Pendiente con su sesión de Stripe en MXN.
- **⚠ Error de la IA:** dio acceso al principal de Stripe por CLI y luego redesplegó el permission set, lo que borró ese acceso.
- **Qué verificamos y cómo:** el motivo quedó en `Motivo_Cancelacion__c` y la donación pasó a Cancelada con un mensaje entendible (C6 funcionó).
- **Qué corregimos:** agregamos al permission set la lectura de `UserExternalCredential` y `externalCredentialPrincipalAccesses` en la metadata.

### 11 · Eventos "thin" de Stripe — [P11](prompts/P11-eventos-thin.md)
- **Qué obtuvimos:** soporte de eventos thin. Con el id, Salesforce consulta la sesión a Stripe, que es la fuente de verdad; se agregaron 2 tests.
- **⚠ Error de la IA:** indicó elegir "Instantánea" en Stripe, pero el destino ya existía como "Resumen" y el código no soportaba ese formato.
- **Qué verificamos y cómo:** AV-00002 quedó Ignorado; tras el cambio reenviamos el evento: AV-00003 Aceptado, DON-00005 Pagada por Pasarela y la campaña en $500.

### 12 · Auditoría y rediseño UX/UI — [P12](prompts/P12-rediseno-ux-ui.md)
- **Qué obtuvimos:** un sistema de diseño propio (tokens, Fraunces + Inter empaquetadas, ilustraciones SVG), la página de proyecto, metas escalonadas (`Hito__c`), un formulario por pasos accesible y estados de pago honestos.
- **⚠ Errores de la IA:**
  1. La primera versión era un listado de campañas; el equipo quería una campaña principal con 3 metas, como Kickstarter.
  2. Un desborde a 320 px que no se veía en desktop.
  3. Saltos de línea reales dentro de un string JS.
- **Qué verificamos y cómo:** capturas con Chrome headless a 320, 375 y 1440 px (iframe con el ancho exacto) y del Site desplegado; `node --check`; 28 tests de Apex en verde.
- **Qué corregimos:** `Hito__c` sin rehacer el backend, `minmax(0,1fr)` en las rejillas y el string escapado.

### 13 · Portada de descubrimiento — [P13](prompts/P13-portada-descubrimiento.md)
- **Qué obtuvimos:** una portada tipo Kickstarter con banner de cifras, campaña destacada, recomendadas y explorar. Agregamos dos campañas secundarias ficticias (Viáticos en la CDMX y Seguro de viaje) con `scripts/apex/campanas_secundarias.apex`.
- **⚠ Error de la IA:** la primera captura del sitio real mostraba la versión anterior y parecía un despliegue fallido. Era caché: el bundle nuevo sí estaba publicado (verificado con `curl`).
- **Qué verificamos y cómo:** capturas en desarrollo a 375 y 1440 px y del sitio real con perfil de navegador limpio.
- **Qué corregimos:** nada en el código. Documentamos que el sitio guarda en caché la portada unos minutos (Ctrl+F5).

### 14 · Confirmación más rápida del pago — [P14](prompts/P14-confirmacion-rapida.md)
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
