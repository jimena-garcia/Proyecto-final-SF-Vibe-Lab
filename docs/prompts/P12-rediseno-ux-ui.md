# P12 · Auditoría y rediseño UX/UI tipo Kickstarter

**Historias:** HU-01, HU-04, HU-05, HU-11 (UX)

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../bitacora_ia.md).

## Rol

Equipo de producto: Product Designer, UX, UI, Design Systems y Frontend senior.

## Contexto

- El portal funciona pero parece un proyecto académico.
- Referencia funcional: Kickstarter y GoFundMe, sin copiar sus interfaces.

## Tarea

1. Fase 1: auditoría con problemas comprobados por pantalla.
2. Fase 2: dirección de producto y sistema de diseño.
3. Implementar por fases tras la aprobación.

## Restricciones

- No cambiar pagos, estados, cálculo del recaudado ni reglas de visibilidad.
- No exponer datos personales ni secretos.
- No inventar cifras: los datos de ejemplo se marcan como DEMO.
- WCAG 2.2 AA y móvil de primera clase.

## Formato de salida

- Plan aprobado y luego implementación con capturas de cada pantalla.

## Verificación

- [ ] Revisión visual a 320, 375 y 1440 px.
- [ ] Tests de Apex en verde.
- [ ] Contrato de URL (`?gracias`, `?cancelado`) intacto.
