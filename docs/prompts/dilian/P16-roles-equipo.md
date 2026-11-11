# P16 · Roles del equipo y registro en Salesforce

**Historias:** HU-07, HU-08, HU-09, HU-15

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Salesforce Solution Architect con foco en seguridad y mínimo privilegio.

## Contexto

- Ya existe el alta de personas con correo y contraseña, pero sin roles: todo el staff podía hacer todo.
- Las historias separan Coordinación (HU-08) de Tesorería (HU-07, HU-09, HU-15).
- El dueño quiere ver al equipo en Salesforce como ve Donaciones y Avisos.

## Tarea

1. Modelar los roles con permission sets y custom permissions; validar en el servidor cada sección.
2. Pedir el rol en el alta y permitir cambiarlo; solo el dueño puede hacerlo.
3. Registrar a cada persona en un objeto visible como pestaña de Salesforce.
4. Migrar sin romper a quien ya tenía acceso.

## Restricciones

- Ningún rol puede crear usuarios ni cambiar roles.
- Coordinación no ve datos de donantes; Tesorería no edita campañas.
- Sin MIXED_DML: el registro del equipo va en otra transacción.

## Formato de salida

- Metadata (custom permissions, permission sets, objeto, pestaña, vistas), Apex con tests y cambios en el panel React.

## Verificación

- [ ] Tests con usuarios reales de cada rol.
- [ ] Alta real con rol y login en incógnito: solo aparecen las secciones del rol.
- [ ] La pestaña Equipo en Salesforce muestra a cada persona con su rol.
