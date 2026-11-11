# P13 · Portada de descubrimiento con destacada y recomendadas

**Historias:** HU-01 (RF-D1a), HU-11

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../bitacora_ia.md).

## Rol

Product Designer + Frontend senior.

## Contexto

- La página de proyecto de Mexico Dreamin gustó al equipo.
- Se quiere una portada como la de Kickstarter: banner, proyecto destacado, recomendaciones y explorar.

## Tarea

1. Convertir la portada en una página de descubrimiento; cada campaña abre su página de proyecto.
2. Crear campañas secundarias ficticias para poblarla.

## Restricciones

- Sin login no hay personalización: "Recomendadas" se ordena por avance y se dice así.
- Campañas secundarias dentro del alcance (el viaje).
- Montos ficticios.

## Formato de salida

- Componentes React, script Apex de datos y despliegue.

## Verificación

- [ ] Captura del sitio real con destacada, recomendadas y explorar.
