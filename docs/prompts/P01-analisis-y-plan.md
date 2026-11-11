# P01 · Análisis del proyecto y plan de implementación

**Historias:** Todas

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../bitacora_ia.md).

## Rol

Senior Salesforce architect y consultor técnico.

## Contexto

- Proyecto final SF Vibe Lab: portal público de donaciones para que alumnos asistan a Mexico Dreamin 2026.
- Insumos: guía del profesor (pegada como texto), `docs/historias_de_usuario.md` (HU-01 a HU-17) y las prácticas previas del equipo.
- Entrega 1: 10 nov 2026. Entrega 2: 17 nov 2026.

## Tarea

1. Leer la guía, el backlog y las prácticas previas.
2. Proponer arquitectura y orden de trabajo que maximice las historias de Entrega 1.

## Restricciones

- Developer Edition, Stripe solo en modo de prueba, costo cero.
- Mínimos M1 (modo de prueba), M2 (guest sin acceso a donaciones) y M3 (ningún secreto en el repo).
- No inventar el contenido de documentos que no se puedan abrir.

## Formato de salida

- Plan en Markdown: contexto, arquitectura, modelo de datos, Apex, secretos, seguridad del guest, orden de ejecución y verificación.

## Verificación

- [ ] Cada RF de la guía está cubierto por algún paso.
- [ ] Ningún paso exige guardar claves en el repositorio.
