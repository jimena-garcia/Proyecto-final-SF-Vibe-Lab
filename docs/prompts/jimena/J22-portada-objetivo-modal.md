# J22 · Portada de un objetivo y contribución en modal

**Historias:** HU-01, HU-02, HU-05, HU-11

## Rol

Asistente de desarrollo frontend para completar P22 sin tocar Salesforce ni el modelo de datos.

## Contexto

- App React pública en `portal-react/src`.
- Navegación por parámetros de URL.
- Campaña y donantes vienen de `campana.donantes`; cada donante incluye `nombre` y `anonimo`.
- Reglas M1, M2 y M3 del repositorio.

## Tarea

1. Mostrar solo la campaña destacada en la portada y mover las demás a una ruta `?mas=1`.
2. Convertir los botones de contribución en una apertura modal accesible.
3. Agregar aviso de privacidad con casilla obligatoria y 4 pasos visibles.
4. Mostrar el total de apoyos anónimos y un carrusel de nombres públicos.
5. Usar datos reales para el texto motivador y mantener Stripe solo en modo de prueba.

## Restricciones

- Sin dependencias nuevas.
- Sin claves, secretos ni datos personales reales.
- Sin cambios en Apex, metadata ni forma de datos.
- Contraste AA y navegación por teclado.

## Formato de salida

- Cambios precisos en `portal-react/src`.
- Actualizaciones de estado y bitácora.
- Commits separados por cambio.

## Verificación

- `npm run build` sin errores.
- `mock.js` conserva 3 nombres públicos y 2 apoyos anónimos en la campaña principal.
- La campaña secundaria sin donantes no debe inventar nombres ni totales.
