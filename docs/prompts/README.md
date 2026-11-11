# Prompts del proyecto

Biblioteca de prompts usados con IA, en formato de prompt engineering. Cada archivo corresponde a una entrada de la [bitácora de IA](../bitacora_ia.md). El contexto base que recibe la IA en cada sesión está en [`CLAUDE.md`](../../CLAUDE.md).

## Estructura de cada prompt

| Sección | Para qué sirve |
|---|---|
| Rol | Qué experiencia debe asumir la IA. |
| Contexto | Lo que ya existe y la IA debe conocer. |
| Tarea | Qué debe producir, en pasos verificables. |
| Restricciones | Reglas que no se pueden romper (M1–M3, alcance, costo cero). |
| Formato de salida | Cómo se entrega el resultado. |
| Verificación | Cómo comprobamos que el resultado es correcto antes de aceptarlo. |

## Índice

| # | Prompt | Historias |
|---|---|---|
| P01 | [Análisis del proyecto y plan de implementación](dilian/P01-analisis-y-plan.md) | Todas |
| P02 | [Evaluación de pasarelas de pago para México](dilian/P02-evaluacion-pasarelas.md) | HU-03, HU-13, HU-16, HU-17 |
| P03 | [Conectar una app React con Salesforce](dilian/P03-react-y-salesforce.md) | HU-11 |
| P04 | [Metadata del modelo de datos y permisos](dilian/P04-metadata-modelo.md) | HU-01…HU-09 |
| P05 | [Apex del portal y Checkout de Stripe](dilian/P05-apex-portal-stripe.md) | HU-03, HU-04, HU-13 |
| P06 | [Empaquetar React como static resource](dilian/P06-empaquetado-react.md) | HU-11 |
| P07 | [Webhook de Stripe: autenticidad e idempotencia](dilian/P07-webhook-stripe.md) | HU-14…HU-17 |
| P08 | [Desplegar a la Developer Edition y correr los tests](dilian/P08-despliegue-tests.md) | Todas |
| P09 | [Publicar el Salesforce Site con mínimo privilegio](dilian/P09-sitio-publico.md) | HU-11, HU-12 |
| P10 | [Prueba de punta a punta como visitante anónimo](dilian/P10-prueba-punta-a-punta.md) | HU-03, HU-13 |
| P11 | [Diagnosticar un pago que no pasa a Pagada](dilian/P11-eventos-thin.md) | HU-14, HU-16 |
| P12 | [Auditoría y rediseño UX/UI tipo Kickstarter](dilian/P12-rediseno-ux-ui.md) | HU-01, HU-04, HU-05, HU-11 (UX) |
| P13 | [Portada de descubrimiento con destacada y recomendadas](dilian/P13-portada-descubrimiento.md) | HU-01 (RF-D1a), HU-11 |
| P14 | [Confirmación más rápida del pago](dilian/P14-confirmacion-rapida.md) | HU-04, HU-14, HU-16 |
| P15 | [Portal de administración y alta del equipo](dilian/P15-portal-admin.md) | HU-07, HU-08, HU-09, HU-15 |
| P16 | [Roles del equipo y registro en Salesforce](dilian/P16-roles-equipo.md) | HU-07, HU-08, HU-09, HU-15 |
| P17 | [Marca de la plataforma y diseño claro](dilian/P17-marca-plataforma.md) | HU-01, HU-04, HU-05, HU-11 |
| J01 | [Guion del video de la Entrega 1](jimena/J01-guion-video-entrega1.md) | HU-01, HU-03, HU-04, HU-05, HU-06, HU-07, HU-08, HU-09, HU-11, HU-12, HU-15 |
| J02 | [Documentar la contribución de Jimena](jimena/J02-documentar-contribucion-entrega1.md) | HU-01 a HU-17 |

## Plantilla para un prompt nuevo

```markdown
# Pxx · Título

**Historias:** HU-xx

## Rol

## Contexto
- 

## Tarea
1. 

## Restricciones
- Nunca pegar claves, tokens ni datos personales.
- 

## Formato de salida
- 

## Verificación
- [ ] 
```
