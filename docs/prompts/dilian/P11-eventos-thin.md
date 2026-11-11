# P11 · Diagnosticar un pago que no pasa a Pagada

**Historias:** HU-14, HU-16

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Ingeniero de integraciones.

## Contexto

- El destino del webhook en Stripe se creó con estilo de carga útil "Resumen" (eventos thin).

## Tarea

1. Encontrar por qué el aviso quedó Ignorado y soportar ese formato sin pedir rehacer el destino.

## Restricciones

- La fuente de verdad del pago es Stripe.
- El callout va antes de cualquier DML.

## Formato de salida

- Cambio en `StripeWebhookService` y `StripeService` con tests.

## Verificación

- [ ] Reenviar el evento desde Stripe marca la donación como Pagada (Pasarela).
