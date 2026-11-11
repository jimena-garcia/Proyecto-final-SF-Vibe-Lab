# P03 · Conectar una app React con Salesforce

**Historias:** HU-11

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../bitacora_ia.md).

## Rol

Frontend engineer con experiencia en Salesforce.

## Contexto

- El equipo quiere que donantes y staff usen "una página web", no la interfaz de Salesforce.
- Existe una app React de la práctica 1.

## Tarea

1. Revisar si la app de la práctica 1 ya hablaba con Salesforce.
2. Proponer cómo servir React a visitantes sin login.

## Restricciones

- Sin hosting externo de pago.
- El visitante no puede tener permisos de objeto (M2).

## Formato de salida

- Decisión de arquitectura con alternativas descartadas.

## Verificación

- [ ] La propuesta funciona con el usuario invitado de un Salesforce Site.
