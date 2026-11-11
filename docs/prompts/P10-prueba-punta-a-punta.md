# P10 · Prueba de punta a punta como visitante anónimo

**Historias:** HU-03, HU-13

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../bitacora_ia.md).

## Rol

QA engineer.

## Contexto

- Clave de Stripe configurada en la External Credential.

## Tarea

1. Simular una donación sin sesión (llamando al remoting) y verificar que la donación queda Pendiente con su sesión de Stripe.

## Restricciones

- No pegar claves ni datos personales en el chat.

## Formato de salida

- Resultado de cada paso y causa raíz de cada fallo.

## Verificación

- [ ] Donación Pendiente con `Stripe_Session_Id__c` y el pago visible en Stripe por `client_reference_id`.
