# P09 · Publicar el Salesforce Site con mínimo privilegio

**Historias:** HU-11, HU-12

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Salesforce admin con foco en seguridad de guest users.

## Contexto

- Página `Portal` desplegada.

## Tarea

1. Crear el Site, asignar al guest solo el permission set `Portal_Guest` y verificar la URL pública.

## Restricciones

- Ningún permiso extra al guest.
- Diagnosticar antes de cambiar configuración.

## Formato de salida

- URL pública funcionando y página de error amigable.

## Verificación

- [ ] La URL responde 200 sin sesión; las APIs de datos responden 401.
