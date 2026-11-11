/**
 * Endpoint público que recibe los avisos (webhooks) de Stripe:
 *   https://<sitio>.my.salesforce-sites.com/services/apexrest/stripe/webhook
 * Toda la lógica vive en StripeWebhookService (testeable sin RestContext).
 * La autenticidad NO depende de quién llama: se verifica la firma HMAC de cada aviso.
 */
@RestResource(urlMapping='/stripe/webhook')
global without sharing class StripeWebhookResource {
    @HttpPost
    global static void recibir() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        String payload = req.requestBody == null ? '' : req.requestBody.toString();

        String firma;
        for (String llave : req.headers.keySet()) {
            if (llave.equalsIgnoreCase('Stripe-Signature')) {
                firma = req.headers.get(llave);
            }
        }

        StripeWebhookService.Respuesta r = StripeWebhookService.procesar(
            payload,
            firma,
            StripeWebhookService.secreto(),
            Datetime.now().getTime() / 1000
        );
        res.statusCode = r.codigoHttp;
        res.addHeader('Content-Type', 'application/json');
        res.responseBody = Blob.valueOf(JSON.serialize(new Map<String, String>{ 'resultado' => r.resultado }));
    }
}
