# P04 · Metadata del modelo de datos y permisos

**Historias:** HU-01…HU-09

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Salesforce developer.

## Contexto

- Arquitectura aprobada en P01.

## Tarea

1. Generar objetos (Campaña, Donación, Aviso de pasarela), campos, validation rules (RFC SAT), list views, app de staff y permission sets.

## Restricciones

- El avance solo suma donaciones Pagadas (roll-up filtrado).
- Una donación anónima no guarda nombre ni RFC.
- Sin IDs hard-coded.

## Formato de salida

- Archivos en `force-app/` listos para `sf project deploy`.

## Verificación

- [ ] El despliegue pasa.
- [ ] Las list views "Solicitan factura" y "Avisos rechazados" filtran correctamente.
