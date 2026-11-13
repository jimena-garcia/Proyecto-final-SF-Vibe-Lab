# Preguntas y reportes

Formato de cada entrada (guía, sección 12): autor · fecha · 1) qué intentábamos lograr (HU y criterio) · 2) qué hicimos · 3) qué esperábamos · 4) qué pasó (error textual, sin claves ni datos personales) · 5) qué consultamos con la IA o la documentación · **Después:** qué hicimos con la respuesta y si se resolvió.

---

## R-01 · El correo del comprobante no llega al buzón (bloqueo de plataforma)
**Autor:** Dilian · **Fecha:** 2026-11-10 · **Historias:** HU-02 CA2, HU-14 CA2 · **Tipo:** reporte al profesor (bloqueo de la sección 6)
1. **Qué intentábamos lograr:** que al pasar una donación a Pagada el donante reciba su comprobante por correo (sin nombre si es anónima).
2. **Qué hicimos:**
   - Configuramos *Deliverability* en "Todos los emails" y activamos "dirección de sustitución para dominios no verificados".
   - Hicimos donaciones de prueba (DON-00005 a DON-00010) a un correo que controla el equipo.
   - Reenviamos el comprobante de DON-00005 desde Apex.
3. **Qué esperábamos:** recibir el correo "Comprobante de tu donación DON-…".
4. **Qué pasó:**
   - Salesforce acepta el envío sin error (`Messaging.sendEmail` exitoso, `Comprobante_Enviado__c = true`), pero el correo no aparece en la bandeja, spam ni promociones.
   - El comprobante sí se genera; su contenido se verifica con el test `cuerpoDelComprobanteRespetaModalidad`.
5. **Qué consultamos:** con la IA (bitácora, entradas 11 y 14) revisamos la verificación de dominio del remitente y la dirección de sustitución. Pendiente: probar una dirección de toda la organización verificada.

**Después (2026-11-12): resuelto.**
- **Diagnóstico:**
  - Un correo enviado desde la org como administrador sí llegó (a spam).
  - El comprobante de una donación real (DON-00012) no llegó.
  - La diferencia está en quién envía. La confirmación llega por el Site, así que el correo salía a nombre del **usuario invitado del sitio** (`donaciones@…org.force.com`), y Gmail lo descartaba en silencio.
  - No era el límite diario: la Developer Edition permite 15 correos sueltos al día y quedaban todos.
- **Solución:**
  - Se registró una **dirección de correo de toda la organización**, verificada y permitida para todos los perfiles.
  - `ComprobanteService` la usa como remitente (`setOrgWideEmailAddressId`) y la busca por consulta, sin IDs fijos.
- **Evidencia:**
  - Donación anónima DON-00013 ($20, tarjeta 4242): el comprobante llegó al buzón en segundos, sin nombre.
  - 41 tests en verde.
- **Límite conocido:** 15 comprobantes al día (Developer Edition). Alcanza para pruebas y demos.
- **Alternativa descartada por ahora:** un servicio externo de correo (Brevo) agregaría un tercero que recibe datos personales. Requeriría la aprobación del profesor.

## R-02 · El sitio público respondía "en mantenimiento" (503)
**Autor:** Dilian · **Fecha:** 2026-11-10 · **Historias:** HU-11
1. **Qué intentábamos lograr:** publicar el sitio sin login.
2. **Qué hicimos:** creamos el Salesforce Site por metadata, le asignamos la página Portal y el permission set del visitante.
3. **Qué esperábamos:** HTTP 200 con el portal.
4. **Qué pasó:** todas las rutas respondían 503 "está apagado para mantenimiento", aunque el sitio aparecía Activo en Setup.
5. **Qué consultamos:** la IA sospechó que faltaba aceptar los términos de Sites; revisamos Setup → Sites y no era eso.

**Después:** a los pocos minutos respondió 200: era propagación. Agregamos una página de error propia. Lección: esperar y volver a probar antes de cambiar configuración.

## R-03 · El visitante no podía abrir el pago de Stripe
**Autor:** Dilian · **Fecha:** 2026-11-10 · **Historias:** HU-03, HU-13
1. **Qué intentábamos lograr:** que el visitante sin login abra el checkout de Stripe.
2. **Qué hicimos:** creamos la External Credential y la Named Credential con la clave de prueba (solo en Setup) y dimos acceso al principal.
3. **Qué esperábamos:** la URL del checkout.
4. **Qué pasó:**
   - Primero: `You don't have read permissions on the User External Credential object`.
   - Después: `We couldn't access the credential(s)`.
5. **Qué consultamos:** con la IA descubrimos que se necesita lectura de *User External Credential* y que redesplegar el permission set borró el acceso al principal dado por CLI.

**Después:** declaramos ambos permisos en la metadata del permission set. Resuelto: DON-00003 quedó Pendiente con su sesión de Stripe en MXN.

## R-04 · Un pago confirmado en Stripe no pasaba a Pagada
**Autor:** Dilian · **Fecha:** 2026-11-10 · **Historias:** HU-16, HU-14
1. **Qué intentábamos lograr:** que el aviso de Stripe marque la donación como Pagada.
2. **Qué hicimos:** creamos el destino del webhook en Stripe y guardamos el signing secret en Salesforce.
3. **Qué esperábamos:** la donación Pagada y Confirmada por Pasarela.
4. **Qué pasó:** el aviso llegó con firma válida, pero quedó **Ignorado** (tipo `v1.checkout.session.completed`): el destino se creó con estilo de carga "Resumen" (eventos thin), que no trae los datos del pago.
5. **Qué consultamos:** la IA identificó el formato en `Aviso_Pasarela__c` y propuso consultar la sesión directamente a Stripe.

**Después:** el código ahora acepta los eventos thin. Reenviamos el evento desde Stripe y DON-00005 quedó Pagada (AV-00003 Aceptado). Resuelto.

## R-05 · La redirección de Stripe a la página de gracias a veces tarda ~2 minutos
**Autor:** Dilian · **Fecha:** 2026-11-10 · **Historias:** HU-04
1. **Qué intentábamos lograr:** que el donante vea "confirmado" pocos segundos después de pagar.
2. **Qué hicimos:** medimos con los logs de Salesforce cuándo llega el aviso y cuándo el navegador pide la página de gracias.
3. **Qué esperábamos:** unos segundos.
4. **Qué pasó:** en DON-00009 el pago se confirmó a las 01:33:41 UTC y el navegador pidió la página a las 01:35:41 (120 s exactos). En DON-00010 fue instantáneo.
5. **Qué consultamos:** con la IA descartamos nuestro sitio (responde en menos de 0.1 s) y el webhook (0.6 s). Mejoramos el sondeo y agregamos la verificación con Stripe al regresar.

**Después:** _(pendiente: probar en un navegador sin extensiones; si persiste, evaluar Stripe Embedded Checkout)_

## R-06 · Decisión: mostrar las donaciones anónimas como "Donante anónimo"
**Autor:** Dilian · **Fecha:** 2026-11-10 · **Historias:** HU-02 CP1, HU-06 CP3, HU-05, HU-11 · **Tipo:** pregunta al cliente
1. **Qué intentábamos lograr:** que el reconocimiento público refleje todo el apoyo recibido. Con solo los donantes con crédito, la lista mostraba $500 de $74,000.
2. **Qué hicimos:** cambiamos el reconocimiento. Las donaciones anónimas y con factura pagadas aparecen como "Donante anónimo" con su monto. El nombre solo aparece en "con reconocimiento".
3. **Qué esperábamos:** más transparencia sin exponer identidad. Se mantiene el mínimo de RF-D2 CA1 ("mi nombre no aparece").
4. **Qué pasó:** funciona en el sitio real (6 donaciones visibles; 5 como "Donante anónimo"). Un test verifica que la respuesta pública no contiene correos ni RFC.
5. **Qué consultamos:** con la IA revisamos el choque con nuestro criterio propio HU-02 CP1 y con RF-V1 CA2, que menciona el "reconocimiento de donantes con crédito". Actualizamos HU-02 CP1 y HU-06 CP3.

**Pregunta al cliente:** ¿Le parece bien mostrar las donaciones anónimas y con factura como "Donante anónimo" con su monto? La guía deja abierta esta pregunta.

**Después:** _(registrar la respuesta del cliente)_

