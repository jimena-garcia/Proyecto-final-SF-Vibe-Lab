# Puesta en marcha: org, Stripe y sitio público

Esta guía deja funcionando el portal en una org nueva. Ningún paso pide pegar una clave en el repositorio, en un chat de IA ni en una captura (M3).

## 0. Requisitos locales

- Salesforce CLI (`sf --version`), Node 18 o superior, Git.
- Una sola vez por clon: `git config core.hooksPath .githooks`. Activa el hook que bloquea commits con claves `sk_`, `rk_` o `whsec_`.

## 1. Cuentas que hay que crear

| Cuenta | Dónde | Notas |
|---|---|---|
| Salesforce Developer Edition (una por equipo) | https://developer.salesforce.com/signup | Usar un correo que controle el equipo. Anotar la URL de My Domain. |
| Stripe (una por equipo) | https://dashboard.stripe.com/register | **No activar la cuenta**: no capturar datos bancarios. Trabajar siempre en modo de prueba ("Test mode"). |

## 2. Conectar la CLI y desplegar

```bash
sf org login web -a donacionesOrg -r https://login.salesforce.com
sf config set target-org donacionesOrg
cd portal-react && npm install && npm run build:sf && cd ..
sf project deploy start -d force-app
sf apex run test --test-level RunLocalTests --code-coverage --result-format human --wait 10
sf apex run -f scripts/apex/datos_demo.apex
```

## 3. Clave de Stripe en Salesforce (External Credential + Named Credential)

En Stripe, en modo de prueba, ve a Developers → API keys y copia la **Secret key** (`sk_test_…`). Pégala **solo** en Setup:

1. Setup → Named Credentials → pestaña **External Credentials** → New.
   - Label `Stripe Credential`, Name `Stripe_Credential`, Authentication Protocol **Custom**.
   - En **Principals** → New: Parameter Name `StripeKey`, Identity Type `Named Principal`, Sequence 1.
     - Authentication Parameters → Add: Name `apiKey`, Value = la secret key de prueba.
   - En **Custom Headers** → New: Name `Authorization`, Value `{!'Bearer ' & $Credential.Stripe_Credential.apiKey}`, Sequence 1.
2. Pestaña **Named Credentials** → New.
   - Label `Stripe API`, Name `Stripe_API`, URL `https://api.stripe.com`, External Credential `Stripe_Credential`.
   - Marca **Allow Formulas in HTTP Header**. Desmarca *Generate Authorization Header*.
3. No hay que hacer nada a mano en el permission set **Portal Guest**. Ya declara en su metadata el acceso al principal `Stripe_Credential-StripeKey` y la lectura de *User External Credential*, que Salesforce exige para el callout aunque el principal sea compartido. Si la External Credential se crea después del despliegue, vuelve a desplegar el permission set.

> Ojo: redesplegar un permission set **reemplaza** sus accesos. Un acceso que se dé a mano en Setup y no esté en la metadata se pierde en el siguiente despliegue.

## 4. Sitio público (Salesforce Site)

> En nuestra org el sitio se creó por metadata (`sf project deploy start --metadata-dir`) y el guest recibió el permission set por CLI. Recién activado, el sitio respondió "en mantenimiento" (503) durante unos minutos mientras se propagaba. Los pasos manuales de abajo son la alternativa.

1. Setup → **Sites** (User Interface → Sites and Domains → Sites). Si lo pide, acepta los términos del dominio de Sites.
2. New:
   - Site Label `Donaciones`, Site Name `Donaciones`, Default Web Address vacío (raíz).
   - Active Site Home Page `Portal`. Marca **Active**.
   - En **Guest Record Default Owner** elige un usuario del equipo.
3. En el detalle del sitio → **Public Access Settings** → View Users → abre el usuario `Donaciones Site Guest User` → Permission Set Assignments → asigna **Portal Guest (mínimo privilegio)**. No le des ningún otro permiso: los justificados están en `docs/seguridad.md`.
4. Copia la URL del sitio, por ejemplo `https://<mydomain>.my.salesforce-sites.com/`.
5. Setup → Custom Settings → **Stripe Config** → Manage → New (valores por defecto de la organización):
   - `URL pública del portal` = la URL del paso 4.
   - `Moneda` = `mxn`. Si Stripe rechaza MXN, usa `usd` y anótalo en la bitácora.

## 5. Correo y staff

- Setup → Deliverability → Access level **All email**. Sin esto no sale el comprobante.
- Asigna el permission set **Staff Donaciones** a cada integrante. Abre el App Launcher → **Donaciones Mexico Dreamin**.

## 6. (Entrega 2) Webhook de Stripe

1. Stripe (modo de prueba) → Developers → Webhooks → Add endpoint.
   - URL: `https://<sitio>/services/apexrest/stripe/webhook`.
   - Eventos: `checkout.session.completed` y `checkout.session.async_payment_succeeded`.
2. Copia el **Signing secret** (`whsec_…`) y pégalo en Setup → Custom Settings → Stripe Config → `Webhook Signing Secret`. No va en ningún otro lado.

## 7. Prueba rápida

- Abre la URL del sitio en ventana de incógnito y elige una campaña.
- Dona con `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.
- En la app de staff, la donación aparece **Pendiente** con `Stripe Checkout Session` lleno. En Stripe → Payments, el pago tiene `client_reference_id` igual al `Token público`.

## 7b. Portal de administración y alta del equipo

1. Asigna el permission set **Staff Donaciones** a tu usuario (`sf org assign permset -n Staff_Donaciones`).
2. En la app **Donaciones Mexico Dreamin**, abre la pestaña **Panel** y luego la sección **Equipo**.
3. Captura nombre, apellido, correo y una contraseña (8 o más caracteres, letras y números) y pulsa **Dar de alta**.
4. Comparte con esa persona:
   - El enlace `https://<mydomain>.my.salesforce.com/apex/PanelAdmin`.
   - El usuario que muestra la pantalla (normalmente su correo).
   - La contraseña que capturaste.

   Al abrir el enlace, Salesforce pide el login y después muestra el panel.
5. Para quitarle el acceso: Equipo → **Desactivar** (libera la licencia).

## 8. Respaldo semanal de metadata

```bash
sf project retrieve start -x manifest/package.xml
git add force-app && git commit -m "Respaldo semanal de metadata"
```
