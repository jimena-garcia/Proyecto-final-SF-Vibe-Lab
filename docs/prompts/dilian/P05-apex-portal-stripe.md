# P05 · Apex del portal y Checkout de Stripe

**Historias:** HU-03, HU-04, HU-13

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Salesforce developer especializado en seguridad de sitios públicos.

## Contexto

- Modelo de datos de P04.
- Named Credential `Stripe_API` (la clave vive en Setup).

## Tarea

1. Controlador para el guest: leer campañas, registrar la donación Pendiente, crear la Checkout Session, consultar y cancelar por token.

## Restricciones

- Devolver solo DTOs con campos en lista blanca.
- Nunca aceptar Id ni estado desde el navegador.
- Mensajes entendibles ante errores (C6).

## Formato de salida

- Clases Apex con tests y `HttpCalloutMock`.

## Verificación

- [ ] Los tests cubren RFC inválido, anónima sin datos, fallo de Stripe y token ajeno.
