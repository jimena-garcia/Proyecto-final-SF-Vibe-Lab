# Contexto del proyecto para asistentes de IA

Portal de donaciones para que alumnos de SF Vibe Lab (UADY × Salesforce) asistan a Mexico Dreamin 2026 (20 nov 2026, CDMX). Es un proyecto académico: **dinero simulado, Stripe en modo de prueba y datos ficticios**.

## Reglas que no se negocian

- **M1:** solo Stripe en modo de prueba. Nunca sugerir activar la cuenta ni usar claves live.
- **M2:** el usuario invitado (visitante sin login) no tiene permisos de objeto. Todo acceso público pasa por `PortalDonacionesController` (DTOs con campos en lista blanca y token aleatorio).
- **M3:** ninguna clave (`sk_…`, `rk_…`, `whsec_…`) en código, metadata, capturas, bitácora ni prompts. La secret key vive en la External Credential `Stripe_Credential`; el signing secret, en el custom setting protegido `Stripe_Config__c`.
- Org: Salesforce Developer Edition. Costo cero: no proponer paquetes ni servicios de pago.
- Sin IDs hard-coded. Sin SOQL ni DML dentro de ciclos. Cada clase Apex nueva lleva tests.
- Las historias de usuario (`docs/historias_de_usuario.md`) dicen *qué* y *por qué*; el *cómo* vive en el código. RF-S3 (confirmación manual) fue retirada por el cliente.

## Arquitectura

- `portal-react/`: app Vite + React. `npm run build:sf` genera el static resource `PortalReact`.
- `force-app/main/default/pages/Portal.page`: carga el bundle y publica las acciones remotas en `window.PORTAL_CONFIG`.
- Salesforce Site "Donaciones": página de inicio `Portal`, usuario guest con el permission set `Portal_Guest`.
- Flujo de pago:
  1. `crearDonacion`: inserta la donación Pendiente.
  2. `iniciarPago`: callout a Stripe Checkout por `callout:Stripe_API` y devuelve la URL de pago.
  3. Stripe regresa a `?gracias=<token>` o `?cancelado=<token>`.
- Webhook: `StripeWebhookResource` → `StripeWebhookService`. Verifica la firma HMAC, registra `Aviso_Pasarela__c` (Aceptado / Rechazado / Duplicado / Ignorado) y pone la donación en Pagada.
- `DonacionTriggerHandler`: al pasar a Pagada fija `Confirmada_Por__c` y `Fecha_Pago__c` y envía un solo comprobante (`ComprobanteService`).
- Staff: Lightning App "Donaciones Mexico Dreamin" con el permission set `Staff_Donaciones`.

## Modelo de datos

- `Campana__c`: Meta (meta final), Activa, Destacada (la portada), Ilustracion (picklist), Montos_Sugeridos (`200;500;1000`), Recaudado (roll-up de las Pagadas), Donaciones_Pagadas (roll-up COUNT de las Pagadas), Avance.
- `Hito__c` (master-detail de Campaña): metas escalonadas y **acumulativas** (Name = título, Monto, Descripción). Mexico Dreamin es el **evento**; el cliente es la coordinación de SF Vibe Lab (no hay empresa). La portada es de descubrimiento, tipo Kickstarter: banner con cifras, campaña Destacada ("Mexico Dreamin 2026", 3 metas acumulativas), Recomendadas (ordenadas por avance, sin personalización) y Explorar. Cada campaña abre su página de proyecto (`?campana=<Id>`). RF-D1a exige soportar ≥ 2 campañas.
- `Donacion__c` (master-detail de `Campana__c`):
  - Datos del donante y del pago: Monto, Estado (Pendiente/Pagada/Cancelada), Modalidad (Anonima/Credito/Factura), Nombre, Email, RFC, Solicita_Factura (fórmula).
  - Referencias de Stripe y token: Token_Publico, Stripe_Session_Id, Stripe_Payment_Intent.
  - Confirmación y comprobante: Confirmada_Por, Fecha_Pago, Comprobante_Enviado.
- `Aviso_Pasarela__c`: Event_Id, Clave_Unica (única, solo en aceptados), Tipo, Resultado, Motivo, Recibido, Donacion.

## Comandos

```bash
sf project deploy start -d force-app
sf apex run test --test-level RunLocalTests --code-coverage --wait 10
sf code-analyzer run --target force-app
cd portal-react && npm run dev        # interfaz con datos ficticios (mock.js)
cd portal-react && npm run build:sf   # reconstruye el static resource
```

## Cómo trabajar con la IA en este repo

- Toda salida de la IA se verifica contra la documentación oficial o contra la org antes de subirla.
- Cada uso relevante se registra en `docs/bitacora_ia.md` en el momento, con todos los campos y marcando los errores de la IA.
- Cada pedido a la IA se guarda como prompt estructurado (rol, contexto, tarea, restricciones, salida, verificación) en `docs/prompts/Pxx-*.md`, usando la plantilla de `docs/prompts/README.md`.
- Ante una duda de negocio, preguntar al cliente y registrarlo en `docs/preguntas_y_reportes.md`. No inventar requisitos.
