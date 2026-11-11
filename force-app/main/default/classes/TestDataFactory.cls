@IsTest
public class TestDataFactory {
    // Valor ficticio solo para pruebas unitarias; no es un secreto real de Stripe.
    public static final String SECRETO_PRUEBA = 'secreto-de-prueba-unitaria';

    public static Campana__c campana(String nombre, Decimal meta, Boolean activa) {
        Campana__c c = new Campana__c(Name = nombre, Meta__c = meta, Activa__c = activa, Montos_Sugeridos__c = '200;500;abc;1000');
        insert c;
        return c;
    }

    public static Donacion__c donacion(Id campanaId, String modalidad, Decimal monto, String estado) {
        Donacion__c d = new Donacion__c(
            Campana__c = campanaId,
            Modalidad__c = modalidad,
            Monto__c = monto,
            Estado__c = estado == 'Pagada' ? 'Pendiente' : estado,
            Email__c = 'donante.ficticio@example.com',
            Nombre__c = modalidad == 'Anonima' ? null : 'Donante Ficticio',
            RFC__c = modalidad == 'Factura' ? 'GODE561231GR8' : null,
            Token_Publico__c = EncodingUtil.convertToHex(Crypto.generateAesKey(128))
        );
        insert d;
        if (estado == 'Pagada') {
            d.Estado__c = 'Pagada';
            update d;
        }
        return d;
    }

    public static void configurarStripe() {
        insert new Stripe_Config__c(
            SetupOwnerId = UserInfo.getOrganizationId(),
            Webhook_Secret__c = SECRETO_PRUEBA,
            Portal_URL__c = 'https://portal.ejemplo.test',
            Moneda__c = 'mxn'
        );
    }

    public static String firmar(String payload, Long t) {
        String firma = EncodingUtil.convertToHex(
            Crypto.generateMac('hmacSHA256', Blob.valueOf(t + '.' + payload), Blob.valueOf(SECRETO_PRUEBA))
        );
        return 't=' + t + ',v1=' + firma;
    }

    public static String eventoPago(String eventoId, String sesionId, String token, Integer centavos) {
        return JSON.serialize(new Map<String, Object>{
            'id' => eventoId,
            'type' => 'checkout.session.completed',
            'data' => new Map<String, Object>{
                'object' => new Map<String, Object>{
                    'id' => sesionId,
                    'client_reference_id' => token,
                    'payment_status' => 'paid',
                    'payment_intent' => 'pi_prueba',
                    'amount_total' => centavos
                }
            }
        });
    }

    /** Evento "thin" (estilo de carga útil "Resumen"): solo el id de la sesión. */
    public static String eventoThin(String eventoId, String sesionId) {
        return JSON.serialize(new Map<String, Object>{
            'id' => eventoId,
            'object' => 'v2.core.event',
            'type' => 'v1.checkout.session.completed',
            'related_object' => new Map<String, Object>{ 'id' => sesionId, 'type' => 'checkout_session' }
        });
    }

    /** Simula GET /v1/checkout/sessions/{id}. */
    public class SesionMock implements HttpCalloutMock {
        String token;
        Integer codigo;
        public SesionMock(String token, Integer codigo) {
            this.token = token;
            this.codigo = codigo;
        }
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(codigo);
            res.setBody(
                codigo == 200
                    ? JSON.serialize(new Map<String, Object>{
                          'id' => 'cs_test_abc',
                          'client_reference_id' => token,
                          'payment_status' => 'paid',
                          'payment_intent' => 'pi_prueba',
                          'amount_total' => 50000
                      })
                    : '{"error":{"message":"No such checkout session"}}'
            );
            return res;
        }
    }

    /** Simula la API de Stripe. */
    public class StripeMock implements HttpCalloutMock {
        Integer codigo;
        public HttpRequest ultima;
        public StripeMock(Integer codigo) {
            this.codigo = codigo;
        }
        public HttpResponse respond(HttpRequest req) {
            ultima = req;
            HttpResponse res = new HttpResponse();
            res.setStatusCode(codigo);
            res.setBody(
                codigo == 200
                    ? '{"id":"cs_test_123","url":"https://checkout.stripe.com/c/pay/cs_test_123"}'
                    : '{"error":{"message":"Invalid API Key provided"}}'
            );
            return res;
        }
    }
}
