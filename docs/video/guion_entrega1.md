# Guion de video demo — Entrega 1

**Duración objetivo:** 4:45 minutos máximo  
**Fecha:** 10 de noviembre de 2026  
**Alcance:** demostrar las historias que aparecen como cumplidas en la tabla de avance del `README.md`. La demostración usa únicamente datos ficticios y Stripe en modo de prueba.

## Preparación antes de grabar

- Abrir una ventana de incógnito para el sitio público, sin iniciar sesión.
- Tener lista la URL pública del Salesforce Site.
- Tener listo el acceso interno al panel, sin mostrar usuario ni contraseña en el video.
- Usar campañas y donaciones ficticias ya cargadas.
- Para el pago, usar la tarjeta de prueba `4242 4242 4242 4242`, una fecha futura y un CVC de prueba. No mostrar claves de Stripe, contraseñas, correos reales, RFC reales ni identificadores sensibles.
- En el panel, tener disponible al menos una donación que solicite factura y un aviso de pasarela visible.

## Guion

| Tiempo | Pantalla y acción | Qué decir |
|---|---|---|
| 00:00–00:20 | **Introducción.** Mostrar la portada del sitio público en la ventana de incógnito. | “Esta es la Entrega 1 del portal de donaciones de SF Vibe Lab para Mexico Dreamin 2026. Comenzamos como visitante, sin iniciar sesión. Todo lo que veremos usa datos ficticios y pagos de Stripe en modo de prueba.” |
| 00:20–00:50 | **Portada pública.** Desplazarse por la portada y mostrar la campaña destacada, las campañas recomendadas y sus barras de avance. | “El sitio público permite descubrir varias campañas activas, ver su meta y consultar su avance sin crear una cuenta. El visitante solo ve la información pública necesaria para elegir dónde apoyar.” |
| 00:50–01:20 | **Página de una campaña.** Abrir una campaña, por ejemplo “Mexico Dreamin 2026”, y desplazarse hasta la sección de metas. Mostrar las tres metas acumulativas, sus montos y descripciones. | “Al elegir una campaña se abre su página de proyecto. Aquí se muestran sus metas escalonadas y acumulativas, el avance de la campaña y la opción para iniciar una donación.” |
| 01:20–02:10 | **Formulario de donación.** Pulsar “Donar”, seleccionar la modalidad **Anónima**, elegir un monto sugerido y capturar únicamente datos ficticios solicitados por el formulario. Continuar hasta Stripe Checkout. | “Ahora registro una donación antes de pagar. Selecciono la modalidad anónima para que mi nombre no se publique y elijo un monto sugerido. Al continuar, la donación queda registrada como pendiente y Stripe recibe una referencia que permite relacionar el pago con ella.” |
| 02:10–02:45 | **Stripe Checkout.** Mostrar que se está en la pasarela de prueba. Capturar `4242 4242 4242 4242`, una fecha futura y un CVC de prueba; confirmar el pago. | “Este es Stripe Checkout en modo de prueba. Uso la tarjeta de prueba 4242 4242 4242 4242. Salesforce no recibe ni almacena el número de tarjeta, la fecha ni el CVC.” |
| 02:45–03:15 | **Página de gracias.** Esperar el regreso al sitio y mostrar la página de gracias con el estado que corresponda. No abrir correos ni mostrar datos de otros donantes. | “Después del pago, Stripe me devuelve al portal y aparece la página de gracias. El sitio consulta el estado de la sesión y muestra un mensaje acorde: la donación no se presenta como confirmada hasta que la pasarela la confirma. Esta pantalla no expone información de otros donantes.” |
| 03:15–03:35 | **Reconocimiento público.** Volver a la página de la campaña o recargarla y abrir “Quiénes apoyan”. Mostrar el registro como **“Donante anónimo”** con su monto, sin nombre, correo ni RFC. | “En el reconocimiento público, una donación anónima aparece como ‘Donante anónimo’ junto con su monto. No se publica ningún dato personal. Esta evidencia demuestra el comportamiento de visibilidad pública; el correo del comprobante queda como pendiente y por eso HU-02 no se presenta como completamente cumplida.” |
| 03:35–04:00 | **Panel: Campañas y metas.** Abrir el enlace interno `/apex/PanelAdmin`, iniciar sesión fuera de cámara y entrar a **Campañas**. Abrir una campaña para mostrar su meta y sus hitos. | “Pasamos al panel interno, protegido por el login de Salesforce. En Campañas, coordinación puede consultar las campañas y administrar su meta y sus metas. Estos cambios se reflejan en el sitio público.” |
| 04:00–04:25 | **Panel: Donaciones.** Entrar a **Donaciones**, mostrar estado, monto, modalidad y campaña. Activar el filtro **Solicitan factura**. | “Tesorería puede consultar las donaciones con su estado, monto, modalidad y campaña. Al activar ‘Solicitan factura’ quedan solo las solicitudes de factura, con sus datos fiscales visibles únicamente para el personal autorizado. En esta grabación se usan registros ficticios.” |
| 04:25–04:45 | **Panel: Avisos de la pasarela.** Abrir **Avisos** o **Avisos de pasarela** y mostrar el resultado, fecha y motivo de un aviso. | “Finalmente, Avisos de pasarela permite revisar los eventos recibidos y distinguir su resultado, fecha y motivo. Así el equipo puede auditar las confirmaciones y los avisos rechazados sin modificar manualmente el estado del pago.” |
| 04:45–05:00 | **Cierre.** Volver a una vista limpia del panel o del sitio, sin datos personales. | “La demo se realizó exclusivamente con Stripe en modo de prueba y datos ficticios. Para cerrar, queda pendiente R-01: el correo del comprobante no llega al buzón, aunque el sistema acepta la generación del comprobante sin nombre. Ese pendiente se documentará y se revisará para la siguiente entrega.” |

## Checklist de evidencia visible

- [x] Sitio público abierto sin login.
- [x] Campaña con metas escalonadas y avance.
- [x] Donación registrada antes de abrir la pasarela.
- [x] Checkout con la tarjeta de prueba `4242 4242 4242 4242`.
- [x] Regreso a la página de gracias.
- [x] Reconocimiento público como “Donante anónimo”, solo con monto.
- [x] Panel de Campañas y metas.
- [x] Panel de Donaciones con filtro “Solicitan factura”.
- [x] Panel de Avisos de pasarela.
- [x] Cierre con modo de prueba y R-01.

## Límites de la grabación

No mostrar contraseñas, claves de Stripe, tokens, correos reales, RFC reales, números de tarjeta distintos a la tarjeta de prueba, payloads del webhook ni datos personales de donantes. No presentar el correo del comprobante como una funcionalidad verificada: R-01 sigue abierto.
