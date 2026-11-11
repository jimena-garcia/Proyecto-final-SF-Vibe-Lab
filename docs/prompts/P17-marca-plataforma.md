# P17 · Marca de la plataforma y diseño claro (Fase B)

**Historias:** HU-01, HU-04, HU-05, HU-11 (experiencia)

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../bitacora_ia.md).

## Rol

Senior Product Designer especializado en crowdfunding + Frontend engineer React.

## Contexto

- La plataforma es de SF Vibe Lab (UADY × Salesforce); Mexico Dreamin es solo una campaña con su propia identidad.
- El equipo aportó capturas de Kickstarter como referencia (home, proyecto, pestañas).
- El sistema de diseño ya existe en tokens CSS; los componentes React no deben reescribirse.

## Tarea

1. Analizar los patrones de las capturas y adaptarlos, sin copiar marca ni contenido.
2. Cambiar a una paleta clara con un solo acento, medir el contraste y aplicarla a todo el producto.
3. Rediseñar portada y página de campaña con los datos reales.

## Restricciones

- No inventar cifras ni beneficiarios; solo pagos confirmados cuentan.
- No usar logos de terceros sin archivo oficial; dejar espacios marcados.
- WCAG AA: contraste medido y navegación por teclado.

## Formato de salida

- Tokens, estilos, componentes React y capturas antes y después.

## Verificación

- [ ] Capturas a 375 y 1440 px.
- [ ] Sitio real con datos de Salesforce.
- [ ] Contraste ≥ 4.5:1 en texto y ≥ 3:1 en gráficos.
