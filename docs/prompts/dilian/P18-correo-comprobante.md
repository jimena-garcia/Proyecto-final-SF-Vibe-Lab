# P18 · Diagnosticar por qué no llega el correo del comprobante

**Historias:** HU-02 (CA2), HU-14 (CA2)

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Administrador de Salesforce con experiencia en entregabilidad de correo (SPF, DKIM, DMARC).

## Contexto

- `ComprobanteService` envía el comprobante con `Messaging.sendEmail` cuando una donación pasa a Pagada.
- Salesforce responde sin error, pero el correo no llega al buzón (R-01).
- La confirmación ocurre dentro del Site (webhook o página de gracias), es decir, como usuario invitado.
- La org es Developer Edition. Correo de prueba del equipo: el del dueño de la org.

## Tarea

1. Descartar el límite diario y la configuración de *Deliverability*, con evidencia.
2. Comparar un envío como administrador con uno del flujo real, para aislar la causa.
3. Proponer y aplicar la corrección mínima, sin IDs fijos y con los tests en verde.
4. Repetir una donación real de punta a punta y comprobar que el correo llega.

## Restricciones

- Costo cero. No agregar servicios externos sin aprobación del profesor.
- Stripe solo en modo de prueba (tarjeta 4242). Datos ficticios.
- Ninguna clave en código, capturas ni bitácora.

## Formato de salida

Diagnóstico con evidencia, cambio en Apex desplegado y actualización de R-01, el README y la bitácora.

## Verificación

- `sf org list limits` (SingleEmail).
- Donación antes y después del cambio, con el correo recibido o no recibido.
- `RunLocalTests` en verde.
