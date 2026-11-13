# Pruebas

Tres niveles: **tests automáticos de Apex**, **prueba de seguridad sin sesión** contra el sitio real y **prueba de punta a punta** de una donación.

## 1. Tests automáticos de Apex (44 en verde; 41 en la Entrega 1)

Comando:
```bash
sf apex run test --test-level RunLocalTests --code-coverage --wait 15
```

| Clase de prueba | Test | Qué demuestra | HU |
|---|---|---|---|
| `PortalDonacionesControllerTest` | `campanasSoloActivasConAvanceYReconocimientoDeCredito` | El sitio solo ve campañas activas; el avance solo suma pagadas; el reconocimiento no expone datos | HU-01, HU-05 |
| | `hitosOrdenadosPorMonto`, `hitoNoPuedeSuperarLaMeta` | Metas escalonadas válidas | HU-01 |
| | `creaDonacionPendienteAntesDePagar` | La donación existe (Pendiente) antes de ir a Stripe | HU-03 |
| | `anonimaDescartaNombreYRfc` | La anónima no guarda nombre ni RFC | HU-02 |
| | `rechazaDatosInvalidosSinCrearNada` | Datos inválidos (RFC, monto, correo) no crean registros | HU-06 |
| | `campanaInactivaNoAceptaDonaciones` | No se dona a campañas inactivas | HU-01 |
| | `iniciarPagoCreaSesionConMontoExactoYReferencia` | Stripe cobra el monto exacto con la referencia de la donación | HU-13, HU-03 |
| | `falloDeStripeCancelaConMensajeEntendible` | Si Stripe falla, se cancela y se muestra un mensaje claro | HU-04 |
| | `estadoYCancelacionPorToken` | Estado y cancelación solo con el token | HU-04, HU-12 |
| | `verificarPagoConfirmaSiStripeDicePaid`, `verificarPagoNoConfirmaSinPagoNiConSesionAjena`, `verificarPagoToleraFalloDeStripe` | Confirmación al regresar, sin confirmar pagos ajenos ni no pagados | HU-04, HU-16 |
| `StripeWebhookServiceTest` | `avisoAutenticoMarcaPagadaAutomaticamente` | Aviso real → Pagada sin intervención | HU-16 |
| | `avisoRepetidoNoDuplica` | Aviso repetido → Duplicado, un solo comprobante | HU-17 |
| | `avisoFalsoSeRechazaYQuedaVisible`, `rechazaSinFirmaFirmaViejaYSinSecreto` | Aviso falso, sin firma o viejo → Rechazado y visible | HU-17, HU-15 |
| | `eventosNoDePagoSeIgnoranYReferenciaDesconocidaSeRegistra` | Eventos que no son de pago se ignoran | HU-16 |
| | `segundoEventoDistintoSobreDonacionYaPagadaNoReenvia` | No se reenvía el comprobante | HU-17 |
| | `montoDistintoRegistraLoCobrado` | Se registra lo que realmente cobró Stripe | HU-13 |
| | `eventoThinConsultaLaSesionAStripe`, `eventoThinSinSesionEnStripeSeRechazaYReintenta` | Eventos *thin* | HU-16 |
| | `endpointRest` | El endpoint REST responde | HU-16 |
| `DonacionTriggerHandlerTest` | `confirmacionManualSeDistingueYEnviaUnSoloComprobante` | Manual vs. pasarela; un solo comprobante | HU-15, HU-14 |
| | `bulkificado` | Funciona con muchas donaciones a la vez | Calidad |
| | `cuerpoDelComprobanteRespetaModalidad` | Comprobante sin nombre si es anónima; aviso de no-CFDI | HU-02, HU-06 |
| | `comprobanteHtmlRespetaPrivacidadYEscapa` (12 nov) | Comprobante HTML: anónima sin nombre, datos escapados, aviso de no-CFDI | HU-02, HU-06 |
| `AdminPortalControllerTest` | `permisosPorRol` | Cada rol ve solo sus secciones | HU-07…09 |
| | `tesoreriaVeElResumenCompleto`, `coordinacionVeAvancePeroNoDatosDeDonantes` | Coordinación no ve correo ni RFC | HU-09, HU-12 |
| | `coordinacionCreaYEditaCampanaConMetas`, `rechazaMetaMayorALaFinalSinGuardarNada` | Administración de campañas y metas | HU-08 |
| | `tesoreriaNoPuedeEditarCampanas` | Separación de roles | HU-08 |
| | `tesoreriaFiltraDonacionesYVeDatosDeFactura` | Filtro de factura con nombre y RFC | HU-07 |
| | `coordinacionSubeReemplazaYQuitaLaImagen` (12 nov) | Imagen de campaña: subir, reemplazar (queda una), quitar; el sitio recibe el enlace | HU-08 |
| | `rechazaArchivosQueNoSonImagenYRolesSinPermiso` (12 nov) | Solo PNG/JPG/WebP reales; Tesorería no puede cambiar imágenes | HU-08, HU-12 |
| `EquipoControllerTest` | `administradorDaDeAltaConRolYLoCambia`, `validaDatosAntesDeCrear` | Alta de integrantes con rol | Equipo |
| | `ningunRolPuedeCrearUsuariosNiCambiarRoles` | Solo el dueño gestiona el equipo | Seguridad |

Los tests de roles usan usuarios reales de cada rol con `System.runAs`. Los callouts a Stripe usan `HttpCalloutMock`: ningún test llama a Stripe de verdad.

## 2. Prueba de seguridad del visitante sin login (HU-12, M2)

10 pruebas de lectura y modificación contra el **sitio real**, sin sesión. Pasos, resultados esperados y obtenidos: [`../seguridad.md`](../seguridad.md), sección 1.
```bash
python scripts/prueba_seguridad.py <IdDonacionPagada> <TokenPublico> <IdCampana>
```

## 3. Prueba de punta a punta (manual)

| Paso | Acción | Resultado esperado |
|---|---|---|
| 1 | Abrir el sitio en incógnito, elegir una campaña | Campaña con meta, avance y metas |
| 2 | Donar $20, modalidad anónima, correo del equipo | Se abre Stripe Checkout por $20.00 MXN |
| 3 | Pagar con 4242 4242 4242 4242, fecha futura, cualquier CVC | Regresa a "¡Gracias! Tu pago está confirmado" con folio |
| 4 | Panel → Donaciones | La donación aparece **Pagada**, "Confirmada por la pasarela" |
| 5 | Panel → Avisos | Aviso **Aceptado** (`checkout.session.completed`) |
| 6 | Volver a la campaña | El avance subió $20; aparece "Donante anónimo" |
| 7 | Repetir el paso 2 y cancelar en Stripe | Página "Pago cancelado"; la donación queda **Cancelada** y no suma |
