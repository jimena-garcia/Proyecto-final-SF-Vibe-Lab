# Historias de usuario – Portal de donaciones (SF Vibe Lab)

CA \= criterios de aceptación de la guía. CP \= criterios propios del equipo. Todas las historias empiezan como **no cumplida**.

---

## ENTREGA 1

### HU-01 · RF-D1a · Elegir campaña y ver su avance

**Historia:** Como donante (visitante sin login), quiero elegir una campaña y ver cuánto lleva de su meta, para decidir a cuál donar.

- CA1. Dado que hay al menos dos campañas activas con meta, cuando entro al sitio sin login, entonces veo cada campaña con su meta y su avance.  
- CA2. Dado que una donación de una campaña pasa a pagada, cuando vuelvo a cargar el sitio, entonces el avance de esa campaña incluye ese monto. Las donaciones pendientes no cuentan para el avance.  
- CA3. Dado que elegí una campaña, cuando continúo a donar, entonces puedo indicar el monto, ya sea eligiendo de una lista de montos sugeridos o capturándolo en la pasarela.  
- CP1. Dado que una campaña no tiene donaciones pagadas, cuando la veo, entonces su avance es \$0 y no aparece vacío ni con error.  
- CP2. Dado que una donación está pendiente o su pago se canceló, cuando recargo el sitio, entonces el avance no cambia.

### HU-02 · RF-D2 · Donar de forma anónima

**Historia:** Como donante anónimo, quiero que mi nombre no aparezca en ningún lugar público, para apoyar sin exponerme.

- CA1. Dado que marqué mi donación como anónima, cuando reviso el sitio público (campañas, reconocimiento de donantes y página de agradecimiento), entonces mi nombre no aparece.  
- CA2. Dado que mi donación anónima está pagada, cuando recibo el comprobante, entonces el comprobante no muestra mi nombre.  
- CA3. Dado que marqué mi donación como anónima, cuando intento solicitar factura, entonces no puedo hacerlo.  
- CA4. Dado que existe una donación anónima, cuando staff la consulta, entonces la ve identificada como anónima.  
- CP1. Dado que mi donación anónima está pagada, cuando cualquier visitante abre la campaña, entonces mi donación no aparece en el reconocimiento de donantes.

### HU-03 · RF-D3 · Registro antes de pagar

**Historia:** Como donante, quiero que mi donación quede registrada antes de pagar, para que el programa pueda reconocer mi pago cuando llegue.

- CA1. Dado que llené mis datos y elegí campaña, cuando envío el formulario, entonces existe en Salesforce una donación en estado pendiente con su campaña, su modalidad y su monto (si ya se conoce) antes de que se abra la pasarela.  
- CA2. Dado que envié el formulario, cuando se abre la pasarela de prueba, entonces el pago lleva una referencia que permite a staff encontrar la donación correspondiente en Salesforce a partir del pago de prueba.  
- CP1. Dado que falta la campaña, la modalidad o un dato obligatorio, cuando envío el formulario, entonces no se crea ninguna donación y veo qué falta.  
- CP2. Dado que envío el formulario dos veces seguidas, cuando reviso Salesforce, entonces no quedan dos donaciones pendientes idénticas por un solo intento de pago (a confirmar con el cliente).

### HU-04 · RF-D4 · Página de agradecimiento

**Historia:** Como donante, quiero ver una página de agradecimiento al terminar de pagar, para saber que mi donación se recibió.

- CA1. Dado que completé el pago con una tarjeta de prueba, cuando la pasarela me regresa al sitio, entonces veo una página de agradecimiento.  
- CA2. Dado que el pago aún no está confirmado en Salesforce, cuando veo la página de agradecimiento, entonces la página no dice que mi pago está confirmado.  
- CA3. Dado que estoy en la página de agradecimiento, cuando la reviso, entonces no muestra datos de otros donantes.  
- CP1. Dado que cancelé el pago en la pasarela, cuando regreso al sitio, entonces veo un mensaje entendible de que el pago no se completó y no veo el agradecimiento.

### HU-05 · RF-C1 · Aparecer como donante

**Historia:** Como donante con crédito, quiero que mi nombre aparezca como donante de la campaña, para que se reconozca mi apoyo.

- CA1. Dado que pedí crédito y mi donación está pagada, cuando cualquier visitante abre la campaña, entonces ve mi nombre y el monto de mi donación en el reconocimiento de donantes de esa campaña (lista por campaña, solo donaciones pagadas).  
- CA2. Dado que pedí crédito, cuando reviso el reconocimiento público, entonces solo aparecen mi nombre y el monto: no aparece mi correo ni ningún otro dato.  
- CP1. Dado que pedí crédito y mi donación sigue pendiente, cuando un visitante abre la campaña, entonces mi nombre no aparece.

### HU-06 · RF-F1 · Capturar datos para factura

**Historia:** Como donante con factura, quiero capturar mi nombre y mi RFC, para que el programa pueda emitir mi factura.

- CA1. Dado que elegí solicitar factura, cuando intento enviar el formulario sin nombre o sin RFC, entonces no puedo enviarlo y veo qué falta.  
- CA2. Dado que capturé un RFC, cuando lo envío, entonces el sistema lo revisa contra el patrón completo del SAT (letras iniciales, fecha y homoclave; 12 caracteres persona moral, 13 persona física) y rechaza el que no lo cumpla. No lo consulta ante el SAT.  
- CA3. Dado que el donante con factura completó su donación, cuando se revisa el sistema, entonces no se emite ningún comprobante fiscal (CFDI).  
- CP1. Dado que capturé un RFC con un solo carácter de más o de menos, cuando lo envío, entonces se rechaza y veo un mensaje que explica el formato esperado.  
- CP2. Dado que elegí crédito o anónima, cuando uso el formulario, entonces no se me pide RFC.  
- CP3. Dado que elegí factura y mi donación está pagada, cuando cualquier visitante abre la campaña, entonces mi nombre y mi RFC no aparecen en ninguna página pública.

### HU-07 · RF-F2 · Marcar la solicitud de factura

**Historia:** Como tesorería, quiero que las donaciones con factura queden marcadas, para atenderlas.

- CA1. Dado que existe una donación con factura, cuando staff la consulta, entonces la ve marcada como "solicita factura", con el nombre y el RFC capturados.  
- CA2. Dado que hay donaciones de varias modalidades, cuando staff busca las que solicitan factura, entonces puede ver solo esas.  
- CP1. Dado que una donación es anónima o con crédito sin factura, cuando staff la consulta, entonces no aparece marcada como "solicita factura".

### HU-08 · RF-S1 · Administrar campañas

**Historia:** Como coordinación del programa, quiero crear y administrar campañas con su meta, para organizar la recaudación.

- CA1. Dado que soy staff, cuando creo una campaña con nombre y meta, entonces aparece en el sitio público.  
- CA2. Dado que existe una campaña, cuando staff cambia su meta, entonces el sitio público muestra la meta nueva.  
- CP1. Dado que intento crear una campaña sin nombre o con meta menor o igual a cero, cuando guardo, entonces no se crea y veo el motivo.  
- CP2. Dado que soy visitante sin login, cuando intento crear o cambiar una campaña, entonces el intento falla.

### HU-09 · RF-S2 · Ver todas las donaciones

**Historia:** Como tesorería, quiero ver todas las donaciones con su información clave, para llevar el control.

- CA1. Dado que existen donaciones de las tres modalidades y en distintos estados, cuando staff consulta las donaciones, entonces ve de cada una su estado, monto, modalidad y campaña.  
- CP1. Dado que soy visitante sin login, cuando intento abrir la vista de donaciones, entonces no obtengo ningún dato.

### HU-10 · RF-S3 · Confirmar un pago a mano — FUERA DE ALCANCE (retirada por el cliente en clase)

**Motivo:** en la sesión de discovery el profesor (como cliente) dijo que esta historia fue una "alucinación" del documento y que no se desarrolla (\~00:36:30 y \~00:46:33). La razón: el estado del pago es responsabilidad de la pasarela, no de una persona de staff. **Estado:** fuera de alcance. El porcentaje de avance se calcula sin esta historia y también se muestra con ella (ver decisión D2). **Historia original (se conserva por trazabilidad):** Como tesorería, quiero confirmar manualmente el pago de una donación pendiente, para que el donante reciba su comprobante aunque la confirmación automática no exista o falle.

- CA1. Dado que una donación está pendiente, cuando staff confirma su pago, entonces la donación pasa a pagada.  
- CA2. Dado que staff confirmó el pago, cuando el donante revisa el correo que capturó, entonces recibe su comprobante.

### HU-11 · RF-V1 · Sitio público acotado

**Historia:** Como visitante, quiero entrar al sitio sin crear cuenta, para donar sin fricción.

- CA1. Dado que no tengo sesión iniciada, cuando abro la dirección del sitio, entonces veo las campañas sin que se me pida login.  
- CA2. Dado que navego el sitio como visitante, cuando recorro todas sus páginas, entonces solo encuentro campañas, avances, reconocimiento de donantes con crédito (nombre y monto) y el formulario de donación.  
- CP1. Dado que recorro el sitio como visitante, cuando reviso cualquier página, entonces no aparece ningún correo ni RFC de ningún donante.

### HU-12 · RF-V2 · Prueba de seguridad del visitante

**Historia:** Como coordinación del programa, quiero evidencia de que un visitante sin login no puede leer ni modificar donaciones de otros, para proteger a los donantes.

- CA1. Dado que existen donaciones de otras personas, cuando un visitante sin login intenta leerlas por el sitio y por cualquier otra vía que el equipo haya identificado, entonces no obtiene ningún dato de esas donaciones.  
- CA2. Dado que existen donaciones de otras personas, cuando un visitante sin login intenta modificarlas, entonces el intento falla.  
- CA3. Dado el documento de seguridad, cuando otra persona sigue sus pasos, entonces puede repetir la prueba y obtiene el mismo resultado.  
- CP1. Dado que el documento de seguridad lista las vías probadas, cuando se revisa, entonces incluye al menos dos vías además de navegar el sitio, con resultado esperado, resultado obtenido y evidencia para lectura y para modificación.  
- CP2. Dado que el visitante tiene permisos, cuando se revisa el documento, entonces cada permiso aparece justificado.

---

## ENTREGA 2 (criterios mínimos de la guía; refinar después de la Entrega 1\)

### HU-13 · RF-D1b · Donar cualquier monto

**Historia:** Como donante, quiero donar el monto que yo decida, para aportar lo que puedo y no solo los montos sugeridos.

- CA1. Dado que elegí una campaña, cuando capturo un monto mayor a cero en el sitio, entonces la pasarela de prueba me cobra exactamente ese monto y la donación en Salesforce registra ese mismo monto.

### HU-14 · RF-D5 · Confirmación y comprobante automáticos

**Historia:** Como donante, quiero que mi donación se confirme y recibir mi comprobante sin que nadie tenga que revisarla a mano, para tener la constancia en cuanto pago.

- CA1. Dado que pagué con una tarjeta de prueba, cuando la pasarela confirma el pago, entonces la donación pasa a pagada sin que nadie de staff la modifique.  
- CA2. Dado que la donación pasó a pagada de esa forma, cuando reviso el correo que capturé, entonces recibo un comprobante que me permite identificar mi donación (contenido a definir por el equipo).

### HU-15 · RF-S4 · Ver confirmaciones automáticas y avisos rechazados

**Historia:** Como tesorería, quiero ver qué donaciones confirmó la pasarela y qué avisos se rechazaron, para confiar en los datos sin revisarlos uno por uno.

- CA1. Dado que una donación se confirmó por aviso de la pasarela, cuando staff la consulta, entonces puede distinguir que se confirmó de forma automática y no a mano.  
- CA2. Dado que se rechazó un aviso, cuando staff revisa los avisos rechazados, entonces ve cuándo llegó y por qué se rechazó.

### HU-16 · RF-V3a · Recibir el aviso de pago (nivel mínimo)

**Historia:** Como tesorería, quiero que el aviso de pago de la pasarela llegue a Salesforce, para que las donaciones se actualicen solas.

- CA1. Dado que un donante pagó con tarjeta de prueba, cuando la pasarela envía su aviso de pago, entonces el aviso llega a Salesforce y la donación correspondiente pasa a pagada.

### HU-17 · RF-V3b · Solo avisos auténticos y sin duplicados (segundo nivel)

**Historia:** Como tesorería, quiero que solo se acepten avisos auténticos y que un aviso repetido no duplique nada, para que nadie pueda marcar donaciones como pagadas sin pagar.

- CA1. Dado que alguien que no es la pasarela envía un aviso falso, cuando llega a Salesforce, entonces se rechaza, la donación no cambia y el rechazo queda visible para staff.  
- CA2. Dado que la pasarela envía dos veces el mismo aviso, cuando ambos llegan, entonces hay una sola donación pagada y un solo comprobante enviado.