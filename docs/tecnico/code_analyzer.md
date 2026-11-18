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

## Corrida de la Entrega 2 (2026-11-17)

Mismo comando, con Code Analyzer sobre `classes` y `triggers`. **Resultado:** 209 hallazgos (39 altos, 50 moderados, 120 bajos), **0 críticos**. El aumento respecto al 10 nov viene de las clases nuevas del panel (`AdminPortalController`, `EquipoController`) y sus tests. Sigue sin haber SOQL ni DML en ciclos en código de producción, ni IDs hard-coded.

| Regla | Sev. | Dónde | Decisión | Justificación |
|---|---|---|---|---|
| `ApexCRUDViolation` (39) | Alta | `PortalDonacionesController` (11), `StripeWebhookService` (5), `ComprobanteService` (3) | Justificado (igual que E1) | Corren como usuario invitado o como webhook, a propósito sin permisos de objeto (M2). |
| `ApexCRUDViolation` | Alta | `AdminPortalController` (7): subida y borrado de la imagen de campaña | Justificado | `ContentVersion`/`ContentDistribution` y `Imagen_URL__c` los escribe solo Apex, después de verificar el custom permission `Gestionar_Campanas`. El campo es de solo lectura para staff a propósito (que nadie pegue un enlace a mano). El resto del panel usa `WITH USER_MODE` / `as user`. |
| `ApexCRUDViolation` | Alta | `EquipoController` (13): `User`, `PermissionSetAssignment`, `Profile`, `UserLicense` | Justificado | Son objetos de configuración (alta de personas y roles). Cada acción exige antes el permiso "Gestionar usuarios" (solo el dueño de la org); los tests lo prueban con los tres roles. |
| `OperationWithLimitsInLoop` | Moderada | `EquipoControllerTest` línea 106 | Justificado | Es un test: recorre 3 usuarios con `System.runAs` para probar que ningún rol puede crear usuarios. No es código de producción. |
| `EmptyStatementBlock` | Moderada | `EquipoController` líneas 26 y 29 | Justificado | Constructores vacíos que Visualforce exige para usar la clase como extensión de `PanelAdmin`. |
| `AvoidFutureAnnotation` | Baja | `EquipoController` línea 252 | Aceptado | El `@future` separa el DML de `Miembro_Equipo__c` del de `User` (Salesforce no permite mezclar objetos de configuración y de negocio en la misma transacción). Un Queueable haría lo mismo con más código. |
| Complejidad, `ExcessiveParameterList`, `ApexDoc`, `ApexUnitTestClassShouldHaveRunAs`, etc. | Mod./Baja | Varias | Igual que en E1 | No afectan el comportamiento. `crearCheckout` ahora recibe 8 parámetros (se agregó `embebido`). |
