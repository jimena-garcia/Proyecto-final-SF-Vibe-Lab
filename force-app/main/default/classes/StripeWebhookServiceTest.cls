@IsTest
private class StripeWebhookServiceTest {
    static final Long AHORA = 1800000000L;

    @TestSetup
    static void datos() {
        TestDataFactory.configurarStripe();
        Campana__c c = TestDataFactory.campana('Hospedaje CDMX', 20000, true);
        Donacion__c d = TestDataFactory.donacion(c.Id, 'Credito', 500, 'Pendiente');
        d.Stripe_Session_Id__c = 'cs_test_abc';
        update d;
    }

    static Donacion__c donacion() {
        return [
            SELECT Id, Token_Publico__c, Estado__c, Confirmada_Por__c, Comprobante_Enviado__c, Fecha_Pago__c
            FROM Donacion__c
            LIMIT 1
        ];
    }

    static StripeWebhookService.Respuesta enviar(String payload, String firma) {
        return StripeWebhookService.procesar(payload, firma, TestDataFactory.SECRETO_PRUEBA, AHORA);
    }

    @IsTest
    static void avisoAutenticoMarcaPagadaAutomaticamente() {
        String p = TestDataFactory.eventoPago('evt_1', 'cs_test_abc', donacion().Token_Publico__c, 50000);
        StripeWebhookService.Respuesta r = enviar(p, TestDataFactory.firmar(p, AHORA));
        Assert.areEqual(200, r.codigoHttp);
        Assert.areEqual('aceptado', r.resultado);
        Donacion__c d = donacion();
        Assert.areEqual('Pagada', d.Estado__c);
        Assert.areEqual('Pasarela', d.Confirmada_Por__c, 'Se distingue de la confirmación manual (HU-15 CA1)');
        Assert.isTrue(d.Comprobante_Enviado__c);
        Assert.areEqual(500, [SELECT Recaudado__c FROM Campana__c LIMIT 1].Recaudado__c);
    }

    @IsTest
    static void avisoRepetidoNoDuplica() {
        String p = TestDataFactory.eventoPago('evt_2', 'cs_test_abc', donacion().Token_Publico__c, 50000);
        enviar(p, TestDataFactory.firmar(p, AHORA));
        StripeWebhookService.Respuesta r = enviar(p, TestDataFactory.firmar(p, AHORA));
        Assert.areEqual('duplicado', r.resultado);
        Assert.areEqual(1, [SELECT COUNT() FROM Aviso_Pasarela__c WHERE Resultado__c = 'Aceptado']);
        Assert.areEqual(1, [SELECT COUNT() FROM Aviso_Pasarela__c WHERE Resultado__c = 'Duplicado']);
        Assert.areEqual(500, [SELECT Recaudado__c FROM Campana__c LIMIT 1].Recaudado__c, 'Una sola donación pagada');
    }

    @IsTest
    static void avisoFalsoSeRechazaYQuedaVisible() {
        String p = TestDataFactory.eventoPago('evt_falso', 'cs_test_abc', donacion().Token_Publico__c, 50000);
        StripeWebhookService.Respuesta r = enviar(p, 't=' + AHORA + ',v1=' + '0'.repeat(64));
        Assert.areEqual(400, r.codigoHttp);
        Assert.areEqual('Pendiente', donacion().Estado__c, 'La donación no cambia (HU-17 CA1)');
        Aviso_Pasarela__c a = [SELECT Resultado__c, Motivo__c, Recibido__c, Event_Id__c FROM Aviso_Pasarela__c];
        Assert.areEqual('Rechazado', a.Resultado__c);
        Assert.isNotNull(a.Recibido__c, 'Staff ve cuándo llegó (HU-15 CA2)');
        Assert.isTrue(a.Motivo__c.contains('Firma inválida'));
        Assert.isTrue(a.Event_Id__c.startsWith('(no verificado)'));
    }

    @IsTest
    static void rechazaSinFirmaFirmaViejaYSinSecreto() {
        String p = TestDataFactory.eventoPago('evt_3', 'cs_test_abc', donacion().Token_Publico__c, 50000);
        Assert.areEqual(400, enviar(p, null).codigoHttp);
        Assert.areEqual(400, enviar(p, 'basura').codigoHttp);
        Assert.areEqual(400, enviar(p, TestDataFactory.firmar(p, AHORA - 3600)).codigoHttp, 'Replay de hace una hora');
        Assert.areEqual(400, StripeWebhookService.procesar(p, TestDataFactory.firmar(p, AHORA), null, AHORA).codigoHttp);
        Assert.areEqual(4, [SELECT COUNT() FROM Aviso_Pasarela__c WHERE Resultado__c = 'Rechazado']);
        Assert.areEqual('Pendiente', donacion().Estado__c);
    }

    @IsTest
    static void eventosNoDePagoSeIgnoranYReferenciaDesconocidaSeRegistra() {
        String otro = '{"id":"evt_4","type":"customer.created","data":{"object":{"id":"cus_1"}}}';
        Assert.areEqual('ignorado', enviar(otro, TestDataFactory.firmar(otro, AHORA)).resultado);
        String sinDonacion = TestDataFactory.eventoPago('evt_5', 'cs_otra', '0123456789abcdef0123456789abcdef', 100);
        Assert.areEqual('sin-donacion', enviar(sinDonacion, TestDataFactory.firmar(sinDonacion, AHORA)).resultado);
        Assert.areEqual('Pendiente', donacion().Estado__c);
    }

    @IsTest
    static void segundoEventoDistintoSobreDonacionYaPagadaNoReenvia() {
        String token = donacion().Token_Publico__c;
        String p1 = TestDataFactory.eventoPago('evt_6', 'cs_test_abc', token, 50000);
        String p2 = TestDataFactory.eventoPago('evt_7', 'cs_test_abc', token, 50000);
        enviar(p1, TestDataFactory.firmar(p1, AHORA));
        Assert.areEqual('ya-pagada', enviar(p2, TestDataFactory.firmar(p2, AHORA)).resultado);
    }

    @IsTest
    static void montoDistintoRegistraLoCobrado() {
        String p = TestDataFactory.eventoPago('evt_8', 'cs_test_abc', donacion().Token_Publico__c, 60000);
        enviar(p, TestDataFactory.firmar(p, AHORA));
        Assert.areEqual(600, [SELECT Monto__c FROM Donacion__c LIMIT 1].Monto__c);
        Assert.isTrue([SELECT Motivo__c FROM Aviso_Pasarela__c LIMIT 1].Motivo__c.contains('distinto'));
    }

    @IsTest
    static void eventoThinConsultaLaSesionAStripe() {
        Test.setMock(HttpCalloutMock.class, new TestDataFactory.SesionMock(donacion().Token_Publico__c, 200));
        String p = TestDataFactory.eventoThin('evt_thin_1', 'cs_test_abc');
        Test.startTest();
        StripeWebhookService.Respuesta r = enviar(p, TestDataFactory.firmar(p, AHORA));
        Test.stopTest();
        Assert.areEqual('aceptado', r.resultado);
        Donacion__c d = donacion();
        Assert.areEqual('Pagada', d.Estado__c);
        Assert.areEqual('Pasarela', d.Confirmada_Por__c);
        Assert.areEqual('checkout.session.completed', [SELECT Tipo__c FROM Aviso_Pasarela__c LIMIT 1].Tipo__c);
    }

    @IsTest
    static void eventoThinSinSesionEnStripeSeRechazaYReintenta() {
        Test.setMock(HttpCalloutMock.class, new TestDataFactory.SesionMock(null, 404));
        String p = TestDataFactory.eventoThin('evt_thin_2', 'cs_test_noexiste');
        Test.startTest();
        StripeWebhookService.Respuesta r = enviar(p, TestDataFactory.firmar(p, AHORA));
        Test.stopTest();
        Assert.areEqual(500, r.codigoHttp, 'Stripe reintentará');
        Assert.areEqual('Pendiente', donacion().Estado__c);
        Assert.areEqual('Rechazado', [SELECT Resultado__c FROM Aviso_Pasarela__c LIMIT 1].Resultado__c);
    }

    @IsTest
    static void endpointRest() {
        String p = TestDataFactory.eventoPago('evt_9', 'cs_test_abc', donacion().Token_Publico__c, 50000);
        RestRequest req = new RestRequest();
        req.requestURI = '/services/apexrest/stripe/webhook';
        req.httpMethod = 'POST';
        req.requestBody = Blob.valueOf(p);
        req.addHeader('stripe-signature', 't=1,v1=abc');
        RestContext.request = req;
        RestContext.response = new RestResponse();
        StripeWebhookResource.recibir();
        Assert.areEqual(400, RestContext.response.statusCode, 'Firma de hace décadas: fuera de tolerancia');
    }
}
