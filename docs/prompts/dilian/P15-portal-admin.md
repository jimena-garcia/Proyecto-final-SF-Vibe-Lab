# P15 · Portal de administración y alta del equipo

**Historias:** HU-07, HU-08, HU-09, HU-15

> **Versión estructurada.** El pedido original se hizo en conversación con Claude Code. Aquí se reescribe con estructura de prompt engineering (rol, contexto, tarea, restricciones, salida, verificación) para que sea reutilizable. El contenido refleja lo que realmente se pidió; el resultado y los errores están en [`../bitacora_ia.md`](../../bitacora_ia.md).

## Rol

Product Designer y Salesforce developer senior con foco en seguridad.

## Contexto

- El cliente (coordinación de SF Vibe Lab) necesita su propio portal, no la interfaz estándar de Salesforce.
- El dueño de la org quiere dar de alta personas con correo y contraseña desde la app donde ya ve Campañas y Donaciones.
- El portal de donantes ya existe en React dentro de Salesforce, con un sistema de diseño propio.

## Tarea

1. Proponer el acceso: usuarios de la org con licencia Platform y login de Salesforce, sin un sistema de contraseñas propio.
2. Construir el portal admin reutilizando el sistema de diseño: Resumen, Campañas y metas, Donaciones, Avisos y Equipo.
3. Implementar el alta de personas: crear el usuario, asignar el permiso de staff y fijar la contraseña.

## Restricciones

- Mínimo privilegio: el guest no puede acceder; staff no cambia estado ni monto de las donaciones.
- La alta de personas solo para quien tenga Gestionar usuarios, validado en el servidor.
- La contraseña nunca se guarda ni se registra en logs.
- Mostrar el plan y esperar aprobación antes de implementar.

## Formato de salida

- Página Visualforce, controladores con tests, app React con segunda entrada y documentación de seguridad y setup.

## Verificación

- [ ] Tests en verde, incluido un usuario de staff real sin permiso de dar de alta.
- [ ] `curl` sin sesión al panel desde el sitio público → sin datos.
- [ ] Alta real de una persona y login en incógnito que cae en el panel sin la sección Equipo.
