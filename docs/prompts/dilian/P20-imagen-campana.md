# P20 · Imagen propia por campaña

**Historias:** HU-08 (administrar campañas), HU-01 y HU-11 (sitio público), HU-12 (el visitante no accede a datos)

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Desarrollador Salesforce full-stack (Apex, Files, React).

## Contexto

- Las campañas solo podían elegir una de 4 ilustraciones fijas.
- El equipo aportó una imagen para la campaña destacada (Mexico Dreamin). Las demás se quedan con su ilustración.
- El visitante del sitio no tiene sesión ni permisos de objeto.

## Tarea

1. Comprobar primero que un enlace público de Salesforce Files se pueda ver sin sesión desde el Site.
2. Permitir a Coordinación subir, cambiar y quitar la imagen desde el panel, con su texto alternativo.
3. Mostrar la imagen en el sitio público, con la ilustración como respaldo.
4. Subir la imagen de Mexico Dreamin a su campaña.

## Restricciones

- Solo el rol Coordinación (`Gestionar_Campanas`).
- Validar el tipo real del archivo y el tamaño en el servidor.
- El enlace público solo expone la imagen, nunca datos.
- Costo cero, sin IDs fijos.
- La imagen con personas reales no va al repositorio público.

## Formato de salida

Campos, Apex con tests, cambios en React, despliegue y capturas.

## Verificación

- Prueba sin sesión del enlace público.
- Tests de rol, tipo de archivo y reemplazo.
- Subida real desde el panel.
- Capturas del sitio en escritorio y celular.
