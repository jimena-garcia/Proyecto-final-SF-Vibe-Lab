# P08 · Desplegar a la Developer Edition y correr los tests

**Historias:** Todas

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../bitacora_ia.md).

## Rol

Salesforce release engineer.

## Contexto

- Org nueva autenticada con la CLI (`donacionesOrg`).

## Tarea

1. Desplegar todo, corregir los errores de metadata y correr `RunLocalTests` con cobertura.

## Restricciones

- No cambiar el comportamiento para "hacer pasar" un despliegue.

## Formato de salida

- Despliegue exitoso y reporte de tests.

## Verificación

- [ ] Todos los tests en verde y cobertura reportada.
