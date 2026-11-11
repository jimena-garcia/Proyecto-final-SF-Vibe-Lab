# Proyecto-final-SF-Vibe-Lab
Portal de donaciones para Mexico Dreamin (SF Vibe Lab, UADY × Salesforce)
## Backlog
Board: <[link to the project](https://github.com/users/jimena-garcia/projects/1)>

## Avance

Una historia cuenta como **cumplida** solo si todos sus criterios se demuestran con evidencia (video, demo o captura) sin romper los mínimos M1–M3. RF-S3 (HU-10) fue retirada por el cliente en clase (ver `docs/historias_de_usuario.md`), por lo que el cálculo principal es **sin RF-S3**; también se reporta con RF-S3.

| HU | RF | Entrega | Estado | Evidencia |
|---|---|---|---|---|
| HU-01 | RF-D1a | 1 | Cumplida | Sitio: 3 campañas activas con meta y avance; solo suman pagadas |
| HU-02 | RF-D2 | 1 | **No cumplida (CA2)** | CA1, CA3 y CA4 sí. CA2: el comprobante se genera sin nombre (test `cuerpoDelComprobanteRespetaModalidad`), pero el correo **no llega** al buzón. Reportado como bloqueo de plataforma (sección 6 de la guía) |
| HU-03 | RF-D3 | 1 | Cumplida | Donación Pendiente antes de abrir Stripe; `client_reference_id` = token |
| HU-04 | RF-D4 | 1 | Cumplida | Página de gracias: pendiente / confirmado / cancelado |
| HU-05 | RF-C1 | 1 | Cumplida | Reconocimiento público solo con nombre y monto (pagadas) |
| HU-06 | RF-F1 | 1 | Cumplida | Validación del RFC con patrón SAT (sitio, Apex y validation rule); sin CFDI |
| HU-07 | RF-F2 | 1 | Cumplida | Panel → Donaciones → "Solicitan factura" (nombre y RFC) |
| HU-08 | RF-S1 | 1 | Cumplida | Panel → Campañas: crear y editar meta y metas; se refleja en el sitio |
| HU-09 | RF-S2 | 1 | Cumplida | Panel → Donaciones: estado, monto, modalidad y campaña |
| HU-10 | RF-S3 | 1 | Retirada por el cliente | — |
| HU-11 | RF-V1 | 1 | Cumplida | Sitio sin login |
| HU-12 | RF-V2 | 1 | Cumplida | `docs/seguridad.md` (10 pruebas de lectura y modificación + script repetible) |
| HU-13 | RF-D1b | 2 | Cumplida | Stripe cobra exactamente el monto capturado |
| HU-14 | RF-D5 | 2 | **No cumplida (CA2)** | CA1 sí (confirmación automática). CA2 depende del correo del comprobante |
| HU-15 | RF-S4 | 2 | Cumplida | Panel: "Confirmada por Stripe" y Avisos rechazados con fecha y motivo |
| HU-16 | RF-V3a | 2 | Cumplida | Aviso real de Stripe → donación Pagada sin intervención |
| HU-17 | RF-V3b | 2 | Cumplida | Aviso falso → Rechazado; repetido → Duplicado; un solo comprobante (tests) |

### Cálculo
- **Entrega 1** (11 historias sin RF-S3): **10 de 11 = 91%**. Con RF-S3: 10 de 12 = 83%.
- **Entrega 2** (16 historias sin RF-S3): **14 de 16 = 88%**. Con RF-S3: 14 de 17 = 82%.
- Si el profesor acepta la evidencia alternativa del comprobante (guía, sección 6), HU-02 y HU-14 pasan a cumplidas: 11 de 11 (100%) y 16 de 16 (100%).

## Sitio público
URL: https://orgfarm-0cda6e4c00-dev-ed.develop.my.salesforce-sites.com/ (Stripe en modo de prueba: tarjeta 4242 4242 4242 4242)

## Arquitectura
- **Sitio público sin login:** Salesforce Site → página Visualforce `Portal` → app React (`portal-react/`, empaquetada como static resource).
- **Backend:** Apex en Salesforce Developer Edition (`force-app/`). El visitante no tiene permisos de objeto; todo pasa por `PortalDonacionesController`.
- **Pagos:** Stripe Checkout en modo de prueba. Aviso de pago (webhook) firmado en `/services/apexrest/stripe/webhook`.
- **Staff:** portal de administración propio (mismo diseño), en `…my.salesforce.com/apex/PanelAdmin` o la pestaña **Panel** de la app de Salesforce. El dueño da de alta al equipo con correo y contraseña desde **Panel → Equipo**.

## Estructura
| Ruta | Contenido |
|---|---|
| `force-app/` | Metadata de Salesforce (objetos, Apex, página, permission sets) |
| `portal-react/` | Sitio público en React (`npm run dev` con datos ficticios, `npm run build:sf` para Salesforce) |
| `docs/historias_de_usuario.md` | Backlog con criterios de aceptación |
| `docs/setup_org.md` | Puesta en marcha: org, Stripe, sitio y webhook |
| `docs/seguridad.md` | Prueba del visitante, permisos, secretos y datos personales |
| `docs/bitacora_ia.md` · `docs/contribucion.md` · `docs/preguntas_y_reportes.md` | Bitácoras |
| `docs/prompts/` | Biblioteca de prompts estructurados (uno por entrada de la bitácora) |
| `CLAUDE.md` | Archivo de contexto para la IA |

## Reglas del repo
- Ninguna clave de Stripe en el repo. Activen el hook una vez por clon: `git config core.hooksPath .githooks`.
- Respaldo de metadata semanal y antes de cada entrega: `sf project retrieve start -x manifest/package.xml`.
