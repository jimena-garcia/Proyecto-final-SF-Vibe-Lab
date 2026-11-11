# P06 · Empaquetar React como static resource

**Historias:** HU-11

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../bitacora_ia.md).

## Rol

Frontend build engineer.

## Contexto

- La página Visualforce `Portal` carga el bundle por nombre fijo.

## Tarea

1. Configurar Vite y un script `build:sf` que genere `PortalReact.resource`.

## Restricciones

- Nombres de archivo fijos (sin hash).
- Fuentes e imágenes empaquetadas (la CSP del Site puede bloquear CDNs).

## Formato de salida

- `vite.config.js` y `scripts/empaquetar.mjs`.

## Verificación

- [ ] El zip contiene `assets/index.js` y `assets/index.css`.
