# P14 · Confirmación más rápida del pago

**Historias:** HU-04, HU-14, HU-16

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../bitacora_ia.md).

## Rol

Ingeniero de integraciones de pago y de rendimiento percibido.

## Contexto

- El donante tarda "casi un minuto o más" en ver "Tu pago está confirmado" después de pagar.
- Hoy solo el webhook de Stripe confirma; la página de gracias consulta el estado con espera creciente.

## Tarea

1. Medir con datos de la org dónde se va el tiempo antes de proponer cambios.
2. Reducir la espera que depende de nosotros.
3. Proponer, y aplicar solo con aprobación, una confirmación inmediata al regresar de Stripe.

## Restricciones

- El navegador nunca decide el estado del pago; la fuente de verdad es Stripe.
- No duplicar donaciones pagadas ni comprobantes, aunque el webhook y la verificación ocurran a la vez.
- Callout antes de cualquier DML. Sin claves en el código.

## Formato de salida

- Diagnóstico con tiempos medidos, cambios en Apex y React, tests y documentación de seguridad.

## Verificación

- [ ] Tests: pagada → Pagada (Pasarela); no pagada o sesión ajena → sin cambios; Stripe caído → sin cambios.
- [ ] Una donación real muestra "confirmado" pocos segundos después de regresar de Stripe.
- [ ] Un solo comprobante por donación.
