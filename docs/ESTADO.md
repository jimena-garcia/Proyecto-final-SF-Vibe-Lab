# Estado actual del proyecto

> **Actualizado:** 2026-11-10 (Entrega 1). **Quien cambie algo importante actualiza este archivo en el mismo commit.**

## En una frase
Plataforma de crowdfunding del programa **SF Vibe Lab (UADY × Salesforce)** para que alumnos asistan a **Mexico Dreamin 2026** (20 nov, CDMX). Sitio público en React servido desde un Salesforce Site; pagos con Stripe en **modo de prueba**; panel de administración propio con roles.

## Dónde está todo
| Qué | Dónde |
|---|---|
| Sitio público (sin login) | https://orgfarm-0cda6e4c00-dev-ed.develop.my.salesforce-sites.com/ |
| Panel de administración | https://orgfarm-0cda6e4c00-dev-ed.develop.my.salesforce.com/apex/PanelAdmin (login de Salesforce) |
| Org | Salesforce **Developer Edition** (no es sandbox). Alias local recomendado: `donacionesOrg` |
| App de Salesforce | App Launcher → "Donaciones Mexico Dreamin" (pestañas Panel, Campañas, Donaciones, Avisos de pasarela, Equipo) |
| Backlog (tablero) | https://github.com/users/jimena-garcia/projects/1 (se actualiza con `scripts/actualizar_tablero.py`) |
| Historias de usuario | `docs/requisitos/historias_de_usuario.md` |
| Avance por historia | Tabla en `README.md` |
| Stripe | Cuenta del equipo en **modo de prueba**. Webhook → `/services/apexrest/stripe/webhook` |

## Qué funciona (verificado en la org real)
- **Donante:**
  - Portada de descubrimiento: destacada, recomendadas y buscador.
  - Página de campaña con metas escalonadas.
  - Donación anónima, con reconocimiento o con factura (RFC con patrón del SAT).
  - Stripe Checkout por el monto exacto.
  - Página de gracias (pendiente, confirmado o cancelado).
  - Lista "Quiénes apoyan": las anónimas y con factura aparecen como "Donante anónimo".
- **Pagos:**
  - Webhook firmado (HMAC), idempotente, que soporta eventos snapshot y thin.
  - Verificación con Stripe al regresar a la página de gracias.
  - `FOR UPDATE` para no duplicar el comprobante.
- **Staff:**
  - Panel React con Resumen, Campañas y metas, Donaciones (filtros) y Avisos.
  - Equipo: solo el dueño de la org da de alta personas con correo, contraseña y **rol** (Coordinación, Tesorería o Ambos).
- **Seguridad:**
  - El visitante no tiene permisos de objeto.
  - 10 pruebas sin sesión pasan; ver `docs/seguridad.md` y `scripts/prueba_seguridad.py`.
- **Tests:** 41 tests de Apex en verde (`sf apex run test --test-level RunLocalTests`).
- **Demo Entrega 1:** guion de video en `docs/video/guion_entrega1.md`, con recorrido público y panel de máximo cinco minutos.

## Problemas abiertos (no cerrar sin evidencia)
| # | Problema | Afecta | Estado |
|---|---|---|---|
| R-01 | El correo del comprobante no llega al buzón (Salesforce lo acepta sin error) | HU-02 CA2, HU-14 CA2 | Reportado al profesor; esperando si acepta evidencia alternativa |
| R-05 | La redirección de Stripe a "gracias" a veces tarda ~2 min | HU-04 (experiencia) | Intermitente, ajeno al sitio; probar sin extensiones |
| R-06 | Decisión "Donante anónimo" en el reconocimiento público | HU-02 CP1, HU-06 CP3 | Pendiente de confirmar con el cliente |
| — | Nombre de la plataforma ("Impulso Vibe Lab") provisional | Marca | Pendiente; se cambia en `portal-react/src/marca.js` |
| — | Logos oficiales UADY / Salesforce / Mexico Dreamin | Footer y campaña | Pendientes de los archivos del equipo |

## Fechas
- **Entrega 1:** 10 nov 2026, 23:59 (hora de Mérida), etiqueta `entrega-1`.
- **Entrega 2:** 17 nov 2026, etiqueta `entrega-2`.
- **Defensa oral:** 18 nov 2026, presencial.

## Próximos pasos (Entrega 2)
1. Resolver o documentar R-01 (correo).
2. Fase C del plan de diseño: imagen y logo por campaña (tema por campaña).
3. Fase D: actualizaciones de campaña y estado "finalizada".
4. Fase E: filtros por campaña y fecha en Donaciones; actividad reciente en Resumen.
5. Que **cada integrante** registre sus entradas en la bitácora de IA, en reportes y en contribución.
