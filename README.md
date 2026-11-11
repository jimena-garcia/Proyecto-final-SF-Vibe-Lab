# Proyecto-final-SF-Vibe-Lab
Portal de donaciones para Mexico Dreamin (SF Vibe Lab, UADY × Salesforce)
## Backlog
Board: <[link to the project](https://github.com/users/jimena-garcia/projects/1)>

## Progress
- Delivery 1: X of 11 stories met = Y% (without RF-S3, withdrawn by the client).
  With RF-S3 included: X of 12 = Z%.
- Delivery 2: X of 16 stories (X of 17 with RF-S3) = Y%.

A story counts as met only if all its criteria are shown with evidence.

## Sitio público
URL: https://orgfarm-0cda6e4c00-dev-ed.develop.my.salesforce-sites.com/ (Stripe en modo de prueba: tarjeta 4242 4242 4242 4242)

## Arquitectura
- **Sitio público sin login:** Salesforce Site → página Visualforce `Portal` → app React (`portal-react/`, empaquetada como static resource).
- **Backend:** Apex en Salesforce Developer Edition (`force-app/`). El visitante no tiene permisos de objeto; todo pasa por `PortalDonacionesController`.
- **Pagos:** Stripe Checkout en modo de prueba. Aviso de pago (webhook) firmado en `/services/apexrest/stripe/webhook`.
- **Staff:** Lightning App "Donaciones Mexico Dreamin".

## Estructura
| Ruta | Contenido |
|---|---|
| `force-app/` | Metadata de Salesforce (objetos, Apex, página, permission sets) |
| `portal-react/` | Sitio público en React (`npm run dev` con datos ficticios, `npm run build:sf` para Salesforce) |
| `docs/historias_de_usuario.md` | Backlog con criterios de aceptación |
| `docs/setup_org.md` | Puesta en marcha: org, Stripe, sitio y webhook |
| `docs/seguridad.md` | Prueba del visitante, permisos, secretos y datos personales |
| `docs/bitacora_ia.md` · `docs/contribucion.md` · `docs/preguntas_y_reportes.md` | Bitácoras |
| `CLAUDE.md` | Archivo de contexto para la IA |

## Reglas del repo
- Ninguna clave de Stripe en el repo. Activen el hook una vez por clon: `git config core.hooksPath .githooks`.
- Respaldo de metadata semanal y antes de cada entrega: `sf project retrieve start -x manifest/package.xml`.
