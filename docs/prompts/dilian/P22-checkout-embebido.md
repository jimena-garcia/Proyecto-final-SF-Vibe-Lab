# P22 · Stripe Embedded Checkout (sin redirección)

**Historias:** HU-03, HU-04, HU-13

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Desarrollador Salesforce y React con experiencia en Stripe Checkout.

## Contexto

- R-05: el pago se confirma y el comprobante llega en segundos, pero la página hospedada de Stripe tarda hasta 2 minutos en regresar a `?gracias=`.
- El portal React vive en un Salesforce Site (VF + Remoting). La secret key está en la Named Credential `Stripe_API`.

## Tarea

1. Crear la sesión en modo `ui_mode=embedded` y devolver el `client_secret`.
2. Montar el formulario de Stripe dentro de la página y mostrar "gracias" nosotros mismos al completarse.
3. Mantener la redirección como respaldo si no hay clave publicable.

## Restricciones

- M1: solo claves `pk_test_`. M3: ninguna clave en el código; la publicable va en `Stripe_Config__c`.
- No cambiar los estados de la donación ni la regla de que "confirmado" lo dice Salesforce.
- Sin dependencias npm nuevas (Stripe.js se carga de `js.stripe.com`).

## Formato de salida

Cambios en Apex con tests, componente React, documentación de setup.

## Verificación

- Tests de Apex (46/46) y revisión de la CSP del sitio.
- Donación de prueba con la tarjeta 4242 en el sitio real.
