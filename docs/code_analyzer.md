# Code Analyzer: hallazgos y justificación (S14)

Corrida del 2026-11-10 con Code Analyzer 5.15.0 sobre `force-app/main/default/classes` y `triggers`:

```bash
sf code-analyzer run --target force-app/main/default/classes --target force-app/main/default/triggers --rule-selector Recommended
```

**Resultado:** 85 hallazgos (15 altos, 17 moderados, 53 bajos), **0 críticos**. No hay hallazgos de SOQL ni DML dentro de ciclos, ni de IDs hard-coded.

| Regla | Sev. | Dónde | Decisión | Justificación |
|---|---|---|---|---|
| `ApexCRUDViolation` (15) | Alta | `PortalDonacionesController`, `StripeWebhookService`, `ComprobanteService` | **Justificado: diseño intencional** | Quien ejecuta es el usuario invitado del sitio, que a propósito **no tiene permisos de objeto** (M2, least privilege). Si se aplicara modo usuario, el sitio no podría mostrar campañas ni registrar donaciones. En su lugar, cada clase limita lo que expone (ver `docs/seguridad.md` §2). |
| `CognitiveComplexity` / `CyclomaticComplexity` / `NcssCount` | Moderada | `PortalDonacionesController.validar`, `StripeWebhookService.procesar` y `verificarFirma` | Justificado por ahora | Cada rama es un criterio de aceptación o un caso de rechazo del webhook. Partirlas antes de la Entrega 1 aumenta el riesgo. Candidato a refactor en E2. |
| `ExcessiveParameterList` | Moderada | `StripeService.crearCheckout` (7), helpers de test | Justificado | Son los parámetros de la API de Stripe; un DTO no aporta claridad aquí. Los de test son fábricas de datos. |
| `AvoidLogicInTrigger` | Moderada | `DonacionTrigger` | Justificado | El trigger solo delega en `DonacionTriggerHandler`; el `if` elige before o after. |
| `AvoidBooleanMethodParameters` | Moderada | `TestDataFactory.campana` | Justificado | Es código de prueba. |
| `ApexDoc`, `ApexUnitTestClassShouldHaveRunAs` | Baja | Varias | Aceptado | No afectan el comportamiento. En E2 se agrega un test con `System.runAs` del usuario guest. |

Volver a correr el análisis antes de la Entrega 2 y actualizar esta tabla.
