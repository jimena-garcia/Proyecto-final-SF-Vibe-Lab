# P02 · Evaluación de pasarelas de pago para México

**Historias:** HU-03, HU-13, HU-16, HU-17

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../bitacora_ia.md).

## Rol

Ingeniero de integraciones de pago.

## Contexto

- Necesitamos cobrar con tarjeta en modo de prueba y recibir avisos de pago en Salesforce.

## Tarea

1. Comparar Stripe, Mercado Pago y Openpay: sandbox, autenticidad de webhooks, monto libre y referencia a la donación.
2. Recomendar una y decir qué cuentas hay que crear.

## Restricciones

- Solo herramientas gratuitas.
- Citar las fuentes consultadas.

## Formato de salida

- Tabla comparativa y recomendación justificada.

## Verificación

- [ ] La recomendación coincide con lo que permite la guía (sección 6).
