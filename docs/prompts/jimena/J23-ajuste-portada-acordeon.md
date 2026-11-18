# J23 · Ajuste horizontal y acordeón de la portada

**Historias:** HU-01, HU-11

## Rol

Asistente frontend para ajustar solo presentación y navegación de la portada.

## Contexto

- React público en `portal-react/src`.
- La campaña principal usa `elegirDestacada`.
- Existe el sistema de tokens en `portal-react/src/styles/tokens.css`.

## Tarea

1. Cambiar el objetivo principal a un layout horizontal de 55/45 en escritorio y apilado en móvil.
2. Mostrar cifras alineadas y metas reales sin duplicar ni inventar datos.
3. Convertir Más campañas en acordeón dentro de la portada.
4. Hacer que el header abra el acordeón, también desde una página de campaña.
5. Eliminar la ruta separada anterior de Más campañas.

## Restricciones

- Sin cambios de Apex, metadata, DTO ni lógica de pago.
- Sin claves ni datos personales.
- Sin dependencias nuevas.

## Verificación

- `npm run build` sin errores.
- A 1280, 1440 y 1920 px no hay desborde horizontal.
- El acordeón abre, cierra, busca campañas y respeta movimiento reducido.
