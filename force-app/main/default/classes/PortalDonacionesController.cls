/**
 * Controlador del sitio público (usuario invitado, sin login).
 *
 * SEGURIDAD (M2 / HU-12): el usuario invitado NO tiene permisos sobre ningún objeto.
 * Esta clase corre "without sharing" a propósito y es la ÚNICA puerta de entrada:
 *  - Solo devuelve DTOs con campos en lista blanca (nunca SObjects completos).
 *  - Jamás devuelve correo, RFC ni nombre de donantes anónimos o con factura.
 *  - Solo crea donaciones en estado Pendiente; nunca permite marcarlas como pagadas.
 *  - Para consultar o cancelar una donación exige su token aleatorio de 128 bits.
 * Ver docs/seguridad.md para la justificación completa.
 */
public without sharing class PortalDonacionesController {
    public static final Decimal MONTO_MINIMO = 10;
    public static final Decimal MONTO_MAXIMO = 100000;
    public static final String RFC_REGEX = '^[A-ZÑ&]{3,4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[A0-9]$';
    private static final String EMAIL_REGEX = '^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$';
    private static final Set<String> MODALIDADES = new Set<String>{ 'Anonima', 'Credito', 'Factura' };

    // ---------------------------------------------------------------- DTOs
    /**
     * Reconocimiento público. Solo las donaciones "con crédito" muestran el nombre; las anónimas
     * y con factura aparecen como "Donante anónimo" (nombre = null, anonimo = true).
     * Nunca se envían correo, RFC ni el nombre de quien no eligió reconocimiento.
     */
    public class DonanteDTO {
        public String nombre;
        public Decimal monto;
        public Boolean anonimo;
    }

    /** Hito de financiación configurado por staff. Datos públicos por diseño. */
    public class HitoDTO {
        public String titulo;
        public String descripcion;
        public Decimal monto;
    }

    public class CampanaDTO {
        public String id;
        public String nombre;
        public String descripcion;
        public Decimal meta;
        public Decimal recaudado;
        public List<Decimal> montosSugeridos = new List<Decimal>();
        public List<DonanteDTO> donantes = new List<DonanteDTO>();
        public List<HitoDTO> hitos = new List<HitoDTO>();
        public String ilustracion;
        public String imagenUrl; // enlace público de la imagen (null = usar la ilustración)
        public String imagenAlt;
        public Boolean destacada;
        public Integer donacionesPagadas;
    }

    public class DonacionInput {
        public String campanaId;
        public String modalidad;
        public String nombre;
        public String email;
        public String rfc;
        public Decimal monto;
    }

    public class Resultado {
        public Boolean ok = false;
        public String mensaje;
        public List<String> errores = new List<String>();
        public String token;
        public String urlPago;
    }

    public class EstadoDTO {
        public String estado;
        public Decimal monto;
        public String campana;
        public String folio;
    }

    // ---------------------------------------------------------------- Lectura pública

    /** HU-01, HU-05, HU-11: campañas activas con meta, avance y reconocimiento (solo crédito + pagada). */
    @RemoteAction
    public static List<CampanaDTO> getCampanas() {
        List<CampanaDTO> salida = new List<CampanaDTO>();
        for (Campana__c c : [
            SELECT
                Id,
                Name,
                Descripcion__c,
                Meta__c,
                Recaudado__c,
                Montos_Sugeridos__c,
                Ilustracion__c,
                Imagen_URL__c,
                Imagen_Alt__c,
                Destacada__c,
                Donaciones_Pagadas__c,
                (SELECT Name, Descripcion__c, Monto__c FROM Hitos__r ORDER BY Monto__c ASC LIMIT 10),
                (
                    SELECT Nombre__c, Monto__c, Modalidad__c
                    FROM Donaciones__r
                    WHERE Estado__c = 'Pagada'
                    ORDER BY Fecha_Pago__c DESC NULLS LAST
                    LIMIT 100
                )
            FROM Campana__c
            WHERE Activa__c = TRUE
            ORDER BY CreatedDate ASC
            LIMIT 50
        ]) {
            CampanaDTO dto = new CampanaDTO();
            dto.id = c.Id;
            dto.nombre = c.Name;
            dto.descripcion = c.Descripcion__c;
            dto.meta = c.Meta__c;
            dto.recaudado = c.Recaudado__c == null ? 0 : c.Recaudado__c;
            dto.montosSugeridos = parsearMontos(c.Montos_Sugeridos__c);
            dto.ilustracion = String.isBlank(c.Ilustracion__c) ? 'General' : c.Ilustracion__c;
            dto.imagenUrl = c.Imagen_URL__c != null && c.Imagen_URL__c.startsWith('https://') ? c.Imagen_URL__c : null;
            dto.imagenAlt = c.Imagen_Alt__c;
            dto.destacada = c.Destacada__c;
            dto.donacionesPagadas = c.Donaciones_Pagadas__c == null ? 0 : c.Donaciones_Pagadas__c.intValue();
            for (Hito__c h : c.Hitos__r) {
                HitoDTO hito = new HitoDTO();
                hito.titulo = h.Name;
                hito.descripcion = h.Descripcion__c;
                hito.monto = h.Monto__c;
                dto.hitos.add(hito);
            }
            for (Donacion__c d : c.Donaciones__r) {
                DonanteDTO donante = new DonanteDTO();
                donante.anonimo = d.Modalidad__c != 'Credito';
                donante.nombre = donante.anonimo ? null : d.Nombre__c;
                donante.monto = d.Monto__c;
                dto.donantes.add(donante);
            }
            salida.add(dto);
        }
        return salida;
    }

    // ---------------------------------------------------------------- Registro antes de pagar

    /**
     * HU-03: registra la donación como Pendiente ANTES de abrir la pasarela.
     * Recibe JSON (no SObject) para controlar exactamente qué campos acepta.
     */
    @RemoteAction
    public static Resultado crearDonacion(String datosJson) {
        Resultado r = new Resultado();
        DonacionInput entrada;
        try {
            entrada = (DonacionInput) JSON.deserialize(datosJson, DonacionInput.class);
        } catch (Exception e) {
            r.mensaje = 'No pudimos leer el formulario. Recarga la página e inténtalo de nuevo.';
            return r;
        }
        normalizar(entrada);
        r.errores = validar(entrada);
        if (!r.errores.isEmpty()) {
            r.mensaje = 'Revisa los datos del formulario.';
            return r;
        }

        Donacion__c d = new Donacion__c(
            Campana__c = entrada.campanaId,
            Modalidad__c = entrada.modalidad,
            Monto__c = entrada.monto.setScale(2, RoundingMode.HALF_UP),
            Email__c = entrada.email,
            Nombre__c = entrada.modalidad == 'Anonima' ? null : entrada.nombre,
            RFC__c = entrada.modalidad == 'Factura' ? entrada.rfc : null,
            Estado__c = 'Pendiente',
            Token_Publico__c = generarToken()
        );
        try {
            insert d;
        } catch (DmlException e) {
            r.mensaje = 'No pudimos registrar tu donación: ' + e.getDmlMessage(0);
            return r;
        }
        r.ok = true;
        r.token = d.Token_Publico__c;
        r.mensaje = 'Donación registrada. Te llevamos a la pasarela de pago.';
        return r;
    }

    /**
     * Crea la Checkout Session en Stripe para una donación ya registrada.
     * Va separada de crearDonacion porque Apex no permite un callout después de un DML
     * en la misma transacción, y así la donación existe antes de abrir la pasarela.
     */
    @RemoteAction
    public static Resultado iniciarPago(String token) {
        Resultado r = new Resultado();
        Donacion__c d = buscarPorToken(token);
        if (d == null || d.Estado__c != 'Pendiente') {
            r.mensaje = 'No encontramos una donación pendiente para pagar. Vuelve a llenar el formulario.';
            return r;
        }
        String base = urlBase();
        try {
            StripeService.SesionCheckout sesion = StripeService.crearCheckout(
                d.Token_Publico__c,
                d.Monto__c,
                'Donación: ' + d.Campana__r.Name,
                d.Email__c,
                base + '?gracias=' + d.Token_Publico__c,
                base + '?cancelado=' + d.Token_Publico__c,
                moneda()
            );
            d.Stripe_Session_Id__c = sesion.id;
            update d;
            r.ok = true;
            r.token = d.Token_Publico__c;
            r.urlPago = sesion.url;
        } catch (Exception e) {
            // C6 / S11: la donación no queda en un estado incoherente y el donante ve un mensaje entendible.
            d.Estado__c = 'Cancelada';
            d.Motivo_Cancelacion__c = ('No se pudo abrir la pasarela: ' + e.getMessage()).abbreviate(255);
            update d;
            r.mensaje = 'La pasarela de pago no está disponible en este momento. No se te cobró nada; inténtalo más tarde.';
        }
        return r;
    }

    // ---------------------------------------------------------------- Regreso de la pasarela

    /** HU-04: la página de gracias solo muestra estado, monto y campaña de ESTA donación (sin nombres). */
    @RemoteAction
    public static EstadoDTO getEstado(String token) {
        Donacion__c d = buscarPorToken(token);
        if (d == null) {
            return null;
        }
        EstadoDTO e = new EstadoDTO();
        e.estado = d.Estado__c;
        e.monto = d.Monto__c;
        e.campana = d.Campana__r.Name;
        e.folio = d.Name;
        return e;
    }

    /**
     * Confirmación al regresar de Stripe (patrón recomendado por Stripe, complementa al webhook).
     * El navegador solo manda el token; Salesforce consulta la sesión directamente a Stripe con la
     * clave secreta (Named Credential), así que el resultado no se puede falsificar desde el cliente.
     * Si Stripe dice "paid", la donación pasa a Pagada con Confirmada_Por = Pasarela. Idempotente:
     * si el webhook ya la confirmó (o llega después), no cambia nada ni duplica el comprobante.
     */
    @RemoteAction
    public static EstadoDTO verificarPago(String token) {
        Donacion__c d = buscarPorToken(token);
        if (d == null) {
            return null;
        }
        if (d.Estado__c == 'Pendiente' && String.isNotBlank(d.Stripe_Session_Id__c)) {
            try {
                Map<String, Object> sesion = StripeService.obtenerSesion(d.Stripe_Session_Id__c); // callout antes de cualquier DML
                Boolean esDeEstaDonacion = String.valueOf(sesion.get('client_reference_id')) == d.Token_Publico__c;
                if (esDeEstaDonacion && String.valueOf(sesion.get('payment_status')) == 'paid') {
                    // Bloquea el registro: si el webhook está confirmando al mismo tiempo, uno espera al otro.
                    Donacion__c actual = [SELECT Id, Estado__c FROM Donacion__c WHERE Id = :d.Id FOR UPDATE];
                    if (actual.Estado__c != 'Pagada') {
                        Object total = sesion.get('amount_total');
                        update new Donacion__c(
                            Id = d.Id,
                            Estado__c = 'Pagada',
                            Confirmada_Por__c = 'Pasarela',
                            Fecha_Pago__c = Datetime.now(),
                            Monto__c = total == null ? d.Monto__c : Decimal.valueOf(String.valueOf(total)) / 100,
                            Stripe_Payment_Intent__c = (String) sesion.get('payment_intent')
                        );
                    }
                }
            } catch (Exception e) {
                // Sin conexión con Stripe: no pasa nada; el webhook confirmará cuando llegue.
                System.debug(LoggingLevel.WARN, 'verificarPago: ' + e.getMessage());
            }
        }
        return getEstado(token);
    }

    /** HU-04 CP1 / HU-01 CP2: el donante canceló en la pasarela; la donación pendiente pasa a Cancelada. */
    @RemoteAction
    public static Resultado cancelar(String token) {
        Resultado r = new Resultado();
        Donacion__c d = buscarPorToken(token);
        if (d != null && d.Estado__c == 'Pendiente') {
            d.Estado__c = 'Cancelada';
            d.Motivo_Cancelacion__c = 'El donante canceló el pago en la pasarela.';
            update d;
        }
        r.ok = true;
        r.mensaje = 'El pago no se completó y no se te cobró nada.';
        return r;
    }

    // ---------------------------------------------------------------- Utilidades

    @TestVisible
    private static void normalizar(DonacionInput e) {
        e.modalidad = e.modalidad == null ? null : e.modalidad.trim();
        e.nombre = String.isBlank(e.nombre) ? null : e.nombre.normalizeSpace();
        e.email = String.isBlank(e.email) ? null : e.email.trim().toLowerCase();
        e.rfc = String.isBlank(e.rfc) ? null : e.rfc.deleteWhitespace().toUpperCase();
    }

    @TestVisible
    private static List<String> validar(DonacionInput e) {
        List<String> errores = new List<String>();
        Boolean campanaValida = false;
        Id campanaId = aId(e.campanaId);
        if (campanaId != null && campanaId.getSobjectType() == Campana__c.SObjectType) {
            campanaValida = ![SELECT Id FROM Campana__c WHERE Id = :campanaId AND Activa__c = TRUE LIMIT 1].isEmpty();
        }
        if (!campanaValida) {
            errores.add('Elige una campaña activa.');
        }
        if (!MODALIDADES.contains(e.modalidad)) {
            errores.add('Elige una modalidad: anónima, con crédito o con factura.');
        }
        if (e.monto == null || e.monto < MONTO_MINIMO || e.monto > MONTO_MAXIMO) {
            errores.add('El monto debe estar entre $' + MONTO_MINIMO + ' y $' + MONTO_MAXIMO.format() + ' MXN.');
        }
        if (String.isBlank(e.email) || !Pattern.matches(EMAIL_REGEX, e.email) || e.email.length() > 80) {
            errores.add('Escribe un correo válido para enviarte tu comprobante.');
        }
        if ((e.modalidad == 'Credito' || e.modalidad == 'Factura') && String.isBlank(e.nombre)) {
            errores.add('Escribe tu nombre.');
        }
        if (e.nombre != null && e.nombre.length() > 120) {
            errores.add('El nombre no puede pasar de 120 caracteres.');
        }
        if (e.modalidad == 'Factura') {
            if (String.isBlank(e.rfc)) {
                errores.add('Escribe tu RFC para solicitar factura.');
            } else if (!Pattern.matches(RFC_REGEX, e.rfc)) {
                errores.add(
                    'RFC inválido: deben ser 3 letras (persona moral, 12 caracteres) o 4 letras (persona física, 13), ' +
                    'fecha AAMMDD y homoclave de 3 caracteres. Ejemplo: GODE561231GR8.'
                );
            }
        }
        return errores;
    }

    @TestVisible
    private static List<Decimal> parsearMontos(String texto) {
        List<Decimal> montos = new List<Decimal>();
        if (String.isBlank(texto)) {
            return montos;
        }
        for (String parte : texto.split(';')) {
            try {
                Decimal m = Decimal.valueOf(parte.trim());
                if (m >= MONTO_MINIMO && m <= MONTO_MAXIMO) {
                    montos.add(m);
                }
            } catch (TypeException ex) {
                continue; // un monto mal escrito por staff no rompe el sitio público
            }
        }
        return montos;
    }

    private static Id aId(String valor) {
        if (String.isBlank(valor)) {
            return null;
        }
        try {
            return Id.valueOf(valor);
        } catch (StringException ex) {
            return null;
        }
    }

    private static Donacion__c buscarPorToken(String token) {
        if (String.isBlank(token) || !Pattern.matches('^[0-9a-f]{32}$', token)) {
            return null;
        }
        List<Donacion__c> filas = [
            SELECT Id, Name, Estado__c, Monto__c, Email__c, Token_Publico__c, Stripe_Session_Id__c, Campana__r.Name
            FROM Donacion__c
            WHERE Token_Publico__c = :token
            LIMIT 1
        ];
        return filas.isEmpty() ? null : filas[0];
    }

    @TestVisible
    private static String generarToken() {
        return EncodingUtil.convertToHex(Crypto.generateAesKey(128));
    }

    private static String urlBase() {
        Stripe_Config__c cfg = Stripe_Config__c.getOrgDefaults();
        if (cfg != null && String.isNotBlank(cfg.Portal_URL__c)) {
            return cfg.Portal_URL__c.removeEnd('/') + '/';
        }
        String sitio = Site.getBaseSecureUrl();
        return String.isBlank(sitio) ? URL.getOrgDomainUrl().toExternalForm() + '/' : sitio.removeEnd('/') + '/';
    }

    private static String moneda() {
        Stripe_Config__c cfg = Stripe_Config__c.getOrgDefaults();
        return (cfg != null && String.isNotBlank(cfg.Moneda__c)) ? cfg.Moneda__c.toLowerCase() : 'mxn';
    }
}
