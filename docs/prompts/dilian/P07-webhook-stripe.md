# P07 · Webhook de Stripe: autenticidad e idempotencia

**Historias:** HU-14…HU-17

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Ingeniero de integraciones / seguridad.

## Contexto

- Las donaciones se registran Pendientes; Stripe avisa cuando se paga.

## Tarea

1. Endpoint Apex REST público que verifique la firma, registre cada aviso y marque la donación como Pagada.
2. Enviar un solo comprobante por correo.

## Restricciones

- HMAC-SHA256 con tolerancia de 5 minutos y comparación en tiempo constante.
- Un aviso repetido no duplica nada.
- Bulkificado.

## Formato de salida

- Clases de servicio, endpoint, trigger handler y tests.

## Verificación

- [ ] Aviso falso → Rechazado sin cambios; aviso repetido → Duplicado; aviso válido → Pagada (Pasarela).
