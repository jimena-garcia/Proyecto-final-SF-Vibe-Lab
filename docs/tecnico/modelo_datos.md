# Modelo de datos

```
Campana__c ─┬─< Hito__c            (master-detail: metas escalonadas)
            └─< Donacion__c ──< Aviso_Pasarela__c   (lookup: avisos de Stripe)

Miembro_Equipo__c ── User          (lookup: quién del equipo tiene acceso)
Stripe_Config__c                   (custom setting protegido, jerárquico)
```

**Regla central:** el avance de una campaña **solo suma donaciones Pagadas**. Las pendientes y canceladas no cuentan (roll-ups con filtro `Estado = Pagada`).

## Campana__c · Campaña
| Campo | Tipo | Para qué |
|---|---|---|
| Name | Texto | Nombre público |
| `Descripcion__c` | Texto largo | Historia de la campaña (el primer párrafo es el resumen) |
| `Meta__c` | Moneda (obligatorio) | Meta final |
| `Recaudado__c` | Roll-up SUM | Suma de donaciones **Pagadas** |
| `Donaciones_Pagadas__c` | Roll-up COUNT | Número de donaciones **Pagadas** |
| `Avance__c` | Fórmula % | `Recaudado / Meta` |
| `Activa__c` | Casilla | Visible en el sitio y acepta donaciones |
| `Destacada__c` | Casilla | Campaña principal de la portada (el panel deja solo una) |
| `Ilustracion__c` | Lista | Ilustración de la tarjeta (General, Boletos, Transporte, Hospedaje); se usa si no hay imagen |
| `Imagen_URL__c` | Texto largo | Enlace público de la imagen de la campaña. Lo escribe Apex al subirla desde el panel (desde el 12 nov) |
| `Imagen_Alt__c` | Texto | Descripción de la imagen para lectores de pantalla (desde el 12 nov) |
| `Montos_Sugeridos__c` | Texto | Botones rápidos del formulario (`200;500;1000`) |

**Validación:** `Meta_Positiva` (la meta debe ser mayor que cero).

## Hito__c · Meta escalonada (master-detail de Campaña)
| Campo | Tipo | Para qué |
|---|---|---|
| Name | Texto | Título de la meta (p. ej. "Transporte Mérida–CDMX") |
| `Monto__c` | Moneda (obligatorio) | Monto **acumulado** en el que se alcanza |
| `Descripcion__c` | Texto | Qué se consigue |

**Validación:** `Monto_Dentro_De_Meta` (no puede superar la meta final).

## Donacion__c · Donación (master-detail de Campaña)
| Campo | Tipo | Para qué | ¿Dato personal? |
|---|---|---|---|
| Name | Autonumérico (`DON-00001`) | Folio | No |
| `Monto__c` | Moneda | Monto exacto cobrado | No |
| `Estado__c` | Lista | Pendiente → Pagada / Cancelada | No |
| `Modalidad__c` | Lista (obligatorio) | Anónima / Con reconocimiento (Crédito) / Factura | No |
| `Nombre__c` | Texto | Nombre público (crédito) o razón social (factura) | **Sí** |
| `Email__c` | Correo | Envío del comprobante | **Sí** |
| `RFC__c` | Texto | Solo con factura | **Sí** |
| `Solicita_Factura__c` | Fórmula | `Modalidad = Factura` (filtro de Tesorería) | No |
| `Token_Publico__c` | Texto único | Token aleatorio de 128 bits para la página de gracias | No |
| `Stripe_Session_Id__c` | Texto único | Sesión de Checkout | No |
| `Stripe_Payment_Intent__c` | Texto | Pago en Stripe | No |
| `Confirmada_Por__c` | Lista | Pasarela / Manual | No |
| `Fecha_Pago__c` | Fecha y hora | Cuándo pasó a Pagada | No |
| `Comprobante_Enviado__c` | Casilla | Se envió el comprobante (evita duplicados) | No |
| `Motivo_Cancelacion__c` | Texto | Por qué se canceló | No |

**Validaciones:**
- `Anonima_Sin_Datos`: la anónima no guarda nombre ni RFC.
- `Credito_Requiere_Nombre`: la donación con reconocimiento exige nombre.
- `Factura_Requiere_Datos`: la de factura exige nombre y RFC.
- `RFC_Formato_SAT`: el RFC sigue el patrón del SAT.
- `Monto_Positivo`: el monto es mayor que cero.

**Vistas de lista:** Todas, Pendientes, Pagadas, Canceladas, Solicitan factura, Confirmadas por la pasarela, Pagos de hoy.

## Aviso_Pasarela__c · Aviso de Stripe (webhook)
| Campo | Tipo | Para qué |
|---|---|---|
| Name | Autonumérico (`AV-00001`) | Folio |
| `Event_Id__c` | Texto | Id del evento en Stripe |
| `Tipo__c` | Texto | Tipo de evento (`checkout.session.completed`, …) |
| `Resultado__c` | Lista | Aceptado / Rechazado / Duplicado / Ignorado |
| `Motivo__c` | Texto | Motivo del rechazo (firma inválida, fuera de tiempo, …) |
| `Clave_Unica__c` | Texto único | Solo en aceptados: impide procesar dos veces el mismo pago (idempotencia) |
| `Recibido__c` | Fecha y hora | Cuándo llegó |
| `Donacion__c` | Búsqueda | Donación a la que se refiere |

**Vistas de lista:** Todos, Rechazados.

## Miembro_Equipo__c · Integrante del equipo
| Campo | Tipo | Para qué |
|---|---|---|
| Name | Texto | Nombre |
| `Usuario__c` | Búsqueda (User) | Usuario de Salesforce |
| `Correo__c` | Correo | Correo del usuario |
| `Rol__c` | Lista | Coordinación / Tesorería / Ambos |
| `Activo__c` | Fórmula | `Usuario__r.IsActive` |
| `Alta__c` | Fecha y hora | Cuándo se dio de alta |

Lo escribe `EquipoController` en un proceso aparte (`@future`), porque Salesforce no permite guardar usuarios y registros normales en la misma transacción (MIXED_DML). **Vistas:** Todos, Activos, Coordinación, Tesorería.

## Stripe_Config__c · Configuración (custom setting protegido)
| Campo | Para qué |
|---|---|
| `Portal_URL__c` | URL pública del sitio (para `success_url` y `cancel_url`) |
| `Moneda__c` | Moneda ISO en minúsculas (`mxn`) |
| `Webhook_Secret__c` | Signing secret del webhook. **Se captura en Setup, nunca en el repo (M3)** |

## Quién ve qué
| Objeto | Visitante (guest) | Coordinación | Tesorería |
|---|---|---|---|
| Campaña / Hito | Solo vía controlador (campos públicos) | Lee y edita | Lee |
| Donación | Solo la suya, con token (estado, monto, folio) | Avance agregado, sin datos del donante | Lee todo, incluidos correo y RFC |
| Aviso de pasarela | Nada | Nada | Lee |
| Miembro del equipo | Nada | Nada | Nada (solo el dueño) |
