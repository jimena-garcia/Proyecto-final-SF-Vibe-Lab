# P23 · "A quién apoyas": empatía en portada, campaña y gracias

**Historias:** HU-01, HU-04, HU-08, HU-11

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Diseñador de producto y desarrollador React/Salesforce para una plataforma de crowdfunding estudiantil.

## Contexto

- Donar no es una compra: la persona debe sentir que apoya y saber a quién apoya.
- La página de gracias solo confirmaba el pago; la página de campaña tenía poca historia; el hero de la portada competía con la sección de la campaña principal y no tenía llamado a la acción.

## Tarea

1. Gracias: mostrar la campaña (metas, quiénes apoyan, a quién apoyaste) después de un aporte confirmado.
2. Campaña: un botón junto a "Contribuir" que lleve a conocer a quién se apoya y lo que hace posible el aporte.
3. Portada: que la campaña principal sea el hero, con llamados a la acción claros.
4. Que Coordinación pueda editar estos textos desde el panel.

## Restricciones

- M2: solo campos de la campaña en lista blanca; nada de datos de donantes.
- No inventar datos: si no hay "Lo que hace posible", se muestran las metas reales.
- Accesible (foco, `prefers-reduced-motion`) y usable a 390 px.

## Formato de salida

Campos y permisos en Salesforce con tests, componentes React reutilizables, documentación.

## Verificación

- Tests de Apex en verde.
- Capturas a 1280 y 390 px y prueba automatizada de los llamados a la acción.
