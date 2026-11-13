# P21 · Paleta azul y morado de Mexico Dreamin

**Historias:** HU-01, HU-11 (experiencia visual)

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Diseñador de interfaces con criterio de accesibilidad (WCAG AA).

## Contexto

- El sitio usaba un verde propio.
- El equipo pidió usar el azul y el morado de Mexico Dreamin, tomados de la foto del evento (el sitio oficial bloquea bots).
- Los colores viven en tokens CSS compartidos por el sitio y el panel.

## Tarea

1. Extraer los colores del logo en la foto.
2. Asignarlos a acción (azul) y progreso (morado).
3. Mantener el verde solo como color de éxito.
4. Aplicarlos también al comprobante por correo.

## Restricciones

- Contraste AA medido.
- No reescribir componentes; cambiar tokens.

## Formato de salida

Tokens y estilos actualizados, desplegados, con capturas.

## Verificación

- Contraste calculado.
- Capturas del sitio real.
- Tests del comprobante.
