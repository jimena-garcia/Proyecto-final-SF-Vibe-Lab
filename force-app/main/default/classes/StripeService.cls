/**
 * Llamadas salientes a la API de Stripe (modo de prueba).
 * La clave secreta NUNCA está en el código: la inyecta la Named Credential "Stripe_API"
 * (External Credential "Stripe_Credential") como header Authorization. Ver docs/setup_org.md.
 */
public with sharing class StripeService {
    public static final String NAMED_CREDENTIAL = 'callout:Stripe_API';

    public class StripeException extends Exception {
    }

    public class SesionCheckout {
        public String id;
        public String url;
    }

    /**
     * Crea una Checkout Session por el monto exacto capturado en el sitio (HU-13).
     * client_reference_id = token público de la donación: es la referencia que permite
     * a staff encontrar la donación a partir del pago de prueba (HU-03 CA2).
     * Idempotency-Key = token: si el donante reintenta, Stripe devuelve la misma sesión (HU-03 CP2).
     */
    public static SesionCheckout crearCheckout(
        String token,
        Decimal monto,
        String concepto,
        String email,
        String urlExito,
        String urlCancelacion,
        String moneda
    ) {
        Long centavos = (monto * 100).setScale(0, RoundingMode.HALF_UP).longValue();

        List<String> params = new List<String>();
        agregar(params, 'mode', 'payment');
        agregar(params, 'client_reference_id', token);
        agregar(params, 'metadata[token_donacion]', token);
        agregar(params, 'payment_intent_data[metadata][token_donacion]', token);
        agregar(params, 'line_items[0][quantity]', '1');
        agregar(params, 'line_items[0][price_data][currency]', moneda);
        agregar(params, 'line_items[0][price_data][unit_amount]', String.valueOf(centavos));
        agregar(params, 'line_items[0][price_data][product_data][name]', concepto);
        agregar(params, 'success_url', urlExito);
        agregar(params, 'cancel_url', urlCancelacion);
        if (String.isNotBlank(email)) {
            agregar(params, 'customer_email', email);
        }

        HttpRequest req = new HttpRequest();
        req.setEndpoint(NAMED_CREDENTIAL + '/v1/checkout/sessions');
        req.setMethod('POST');
        req.setTimeout(20000);
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.setHeader('Idempotency-Key', 'checkout-' + token);
        req.setBody(String.join(params, '&'));

        HttpResponse res = new Http().send(req);
        if (res.getStatusCode() != 200) {
            throw new StripeException('Stripe respondió ' + res.getStatusCode() + ': ' + extraerError(res.getBody()));
        }
        Map<String, Object> cuerpo = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        SesionCheckout sesion = new SesionCheckout();
        sesion.id = (String) cuerpo.get('id');
        sesion.url = (String) cuerpo.get('url');
        if (String.isBlank(sesion.id) || String.isBlank(sesion.url)) {
            throw new StripeException('Stripe no devolvió la sesión de pago.');
        }
        return sesion;
    }

    /**
     * Consulta una Checkout Session directamente a Stripe. Se usa con los eventos "thin"
     * (estilo de carga útil "Resumen"), que solo traen el id: la fuente de verdad es Stripe.
     */
    public static Map<String, Object> obtenerSesion(String sesionId) {
        if (String.isBlank(sesionId) || !Pattern.matches('^cs_[A-Za-z0-9_]+$', sesionId)) {
            throw new StripeException('Id de sesión inválido');
        }
        HttpRequest req = new HttpRequest();
        req.setEndpoint(NAMED_CREDENTIAL + '/v1/checkout/sessions/' + sesionId);
        req.setMethod('GET');
        req.setTimeout(20000);
        HttpResponse res = new Http().send(req);
        if (res.getStatusCode() != 200) {
            throw new StripeException('Stripe respondió ' + res.getStatusCode() + ': ' + extraerError(res.getBody()));
        }
        return (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
    }

    private static void agregar(List<String> params, String llave, String valor) {
        params.add(EncodingUtil.urlEncode(llave, 'UTF-8') + '=' + EncodingUtil.urlEncode(valor, 'UTF-8'));
    }

    private static String extraerError(String body) {
        try {
            Map<String, Object> m = (Map<String, Object>) JSON.deserializeUntyped(body);
            Map<String, Object> e = (Map<String, Object>) m.get('error');
            return e == null ? 'sin detalle' : String.valueOf(e.get('message'));
        } catch (Exception ex) {
            return 'respuesta no legible';
        }
    }
}
