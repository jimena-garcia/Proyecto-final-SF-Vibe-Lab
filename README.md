# Proyecto-final-SF-Vibe-Lab
Portal de donaciones para Mexico Dreamin (SF Vibe Lab, UADY × Salesforce)

*Video Demo Entrega 1:* <[video_Entrega_1]https://canva.link/w2418fk6s50we1w>
> **¿Eres del equipo o usas un asistente de IA?** Empieza por [`docs/ESTADO.md`](docs/ESTADO.md) (qué funciona hoy y qué falta) y [`AGENTS.md`](AGENTS.md) (reglas, arquitectura, despliegue y registro de IA). Claude Code, Gemini, Codex, Cursor y Copilot los cargan solos.
## Backlog
Board: <[enlace al video](https://github.com/users/jimena-garcia/projects/1)>

## Avance

Una historia cuenta como **cumplida** solo si todos sus criterios se demuestran con evidencia (video, demo o captura) sin romper los mínimos M1–M3. RF-S3 (HU-10) fue retirada por el cliente en clase (ver `docs/requisitos/historias_de_usuario.md`), por lo que el cálculo principal es **sin RF-S3**; también se reporta con RF-S3.

| HU | RF | Entrega | Estado | Evidencia |
|---|---|---|---|---|
| HU-01 | RF-D1a | 1 | Cumplida | Sitio: 3 campañas activas con meta y avance; solo suman pagadas |
| HU-02 | RF-D2 | 1 | Cumplida (desde el 12 nov) | Donación anónima DON-00013: el comprobante llegó al buzón, sin nombre. En la Entrega 1 estaba No cumplida (CA2); se resolvió con un remitente verificado (R-01) |
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
| HU-14 | RF-D5 | 2 | Cumplida | Confirmación automática por el aviso de Stripe y comprobante recibido en el buzón (DON-00013) |
| HU-15 | RF-S4 | 2 | Cumplida | Panel: "Confirmada por Stripe" y Avisos rechazados con fecha y motivo |
| HU-16 | RF-V3a | 2 | Cumplida | Aviso real de Stripe → donación Pagada sin intervención |
| HU-17 | RF-V3b | 2 | Cumplida | Aviso falso → Rechazado; repetido → Duplicado; un solo comprobante (tests) |

### Cálculo
- **Entrega 1** (entregada el 10 nov; 11 historias sin RF-S3): **10 de 11 = 91%**. Con RF-S3: 10 de 12 = 83%. HU-02 no estaba cumplida por el correo del comprobante.
- **Avance actual hacia la Entrega 2** (16 historias sin RF-S3): **16 de 16 = 100%**. Con RF-S3: 16 de 17 = 94%. El 12 nov se resolvió el correo del comprobante (R-01), y con eso HU-02 y HU-14 pasaron a cumplidas.

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
| `docs/requisitos/historias_de_usuario.md` | Backlog con criterios de aceptación |
| `docs/tecnico/setup_org.md` | Puesta en marcha: org, Stripe, sitio y webhook |
| `docs/seguridad.md` | Prueba del visitante, permisos, secretos y datos personales |
| `docs/bitacora_ia.md` · `docs/contribucion.md` · `docs/preguntas_y_reportes.md` | Bitácoras |
| `docs/prompts/` | Prompts estructurados, una carpeta por integrante |
| `docs/equipo/` | Tareas y evidencia de cada integrante, y el prompt para su agente de IA |
| `docs/README.md` | Mapa de la documentación |
| `AGENTS.md` · `CLAUDE.md` · `GEMINI.md` | Contexto para los agentes de IA |

## Reglas del repo
- Ninguna clave de Stripe en el repo. Activen el hook una vez por clon: `git config core.hooksPath .githooks`.
- Respaldo de metadata semanal y antes de cada entrega: `sf project retrieve start -x manifest/package.xml`.
