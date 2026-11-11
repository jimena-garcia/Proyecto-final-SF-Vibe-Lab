# Instrucciones para GitHub Copilot

Antes de sugerir o cambiar código, lee **`AGENTS.md`** (raíz del repo) y **`docs/ESTADO.md`**. Son la fuente única de reglas, arquitectura, estado y despliegue.

Resumen de lo que nunca se rompe:
- **M1:** Stripe solo en modo de prueba; datos ficticios.
- **M2:** el visitante del Site no tiene permisos de objeto; todo pasa por `PortalDonacionesController` con DTOs en lista blanca. Nunca exponer correo, RFC ni el nombre de donaciones anónimas o con factura.
- **M3:** ninguna clave (`sk_`, `rk_`, `whsec_`) en código, metadata, capturas, bitácora ni prompts.
- Sin IDs hard-coded, sin SOQL/DML en ciclos, Apex con tests.
- Cada uso relevante de IA se registra en `docs/bitacora_ia.md` con el **nombre de la persona** que la usó, y su prompt en `docs/prompts/`.
