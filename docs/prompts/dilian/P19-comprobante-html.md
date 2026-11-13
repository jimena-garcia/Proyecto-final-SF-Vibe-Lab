# P19 · Comprobante de donación con diseño (correo HTML)

**Historias:** HU-02 (CA2), HU-14 (CA2), HU-06 (CA3)

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Diseñador de producto y desarrollador Apex con experiencia en correos transaccionales.

## Contexto

- El comprobante era solo texto plano: folio, campaña, monto, fecha, modalidad y referencia.
- La plataforma tiene identidad propia ("Impulso Vibe Lab", verde `#0B7A52`, Inter); ver `portal-react/src/marca.js`.

## Tarea

1. Diseñar un comprobante que se vea oficial y de la organización, en escritorio y en celular.
2. Mantener el texto plano como respaldo.
3. Respetar la privacidad por modalidad y el aviso de no-CFDI.

## Restricciones

- HTML de correo: tablas y estilos en línea, sin JavaScript ni recursos externos.
- Escapar todo dato capturado por el donante.
- Dejar claro que es modo de prueba, sin dinero real.

## Formato de salida

`ComprobanteService.html()`, un test y una vista previa con datos reales.

## Verificación

- Tests de privacidad y escape.
- Capturas a 800 y 390 px.
- Una donación real que llegue al buzón.
