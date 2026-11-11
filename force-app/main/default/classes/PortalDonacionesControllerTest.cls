@IsTest
private class PortalDonacionesControllerTest {
    @TestSetup
    static void datos() {
        TestDataFactory.configurarStripe();
        Campana__c activa = TestDataFactory.campana('Boletos Mexico Dreamin', 10000, true);
        TestDataFactory.campana('Campaña inactiva', 5000, false);
        TestDataFactory.donacion(activa.Id, 'Credito', 500, 'Pagada');
        TestDataFactory.donacion(activa.Id, 'Anonima', 300, 'Pagada');
        TestDataFactory.donacion(activa.Id, 'Factura', 700, 'Pagada');
        TestDataFactory.donacion(activa.Id, 'Credito', 900, 'Pendiente');
    }

    static Campana__c activa() {
        return [SELECT Id FROM Campana__c WHERE Activa__c = TRUE LIMIT 1];
    }

    static String entrada(String modalidad, String nombre, String rfc, Decimal monto) {
        PortalDonacionesController.DonacionInput e = new PortalDonacionesController.DonacionInput();
        e.campanaId = activa().Id;
        e.modalidad = modalidad;
        e.nombre = nombre;
        e.email = 'Donante.Ficticio@Example.com ';
        e.rfc = rfc;
        e.monto = monto;
        return JSON.serialize(e);
    }

    @IsTest
    static void campanasSoloActivasConAvanceYReconocimientoDeCredito() {
        List<PortalDonacionesController.CampanaDTO> cs = PortalDonacionesController.getCampanas();
        Assert.areEqual(1, cs.size(), 'Solo la campaña activa es pública');
        // Avance = solo pagadas (500 + 300 + 700); la pendiente de 900 no cuenta (HU-01 CA2)
        Assert.areEqual(1500, cs[0].recaudado);
        // Reconocimiento: solo crédito pagada (HU-05, HU-02 CP1, HU-06 CP3)
        // Todas las pagadas aparecen; solo la "con crédito" muestra el nombre (HU-05, HU-02 CP1, HU-06 CP3)
        Assert.areEqual(3, cs[0].donantes.size(), 'Las 3 pagadas; la pendiente no');
        Integer conNombre = 0;
        for (PortalDonacionesController.DonanteDTO d : cs[0].donantes) {
            if (d.anonimo) {
                Assert.isNull(d.nombre, 'Anónima y con factura nunca muestran nombre');
            } else {
                Assert.areEqual('Donante Ficticio', d.nombre);
                Assert.areEqual(500, d.monto);
                conNombre++;
            }
        }
        Assert.areEqual(1, conNombre);
        String publico = JSON.serialize(cs);
        Assert.isFalse(publico.contains('@'), 'Sin correos en el sitio público');
        Assert.isFalse(publico.contains('GODE561231GR8'), 'Sin RFC en el sitio público');
        // Montos inválidos escritos por staff se ignoran
        Assert.areEqual(new List<Decimal>{ 200, 500, 1000 }, cs[0].montosSugeridos);
        // Conteo de pagadas (todas las modalidades), sin datos personales
        Assert.areEqual(3, cs[0].donacionesPagadas);
        Assert.areEqual('General', cs[0].ilustracion, 'Sin ilustración elegida se usa General');
    }

    @IsTest
    static void hitosOrdenadosPorMonto() {
        Campana__c c = activa();
        insert new List<Hito__c>{
            new Hito__c(Campana__c = c.Id, Name = 'Todo el grupo', Monto__c = 10000),
            new Hito__c(Campana__c = c.Id, Name = 'Primeros boletos', Monto__c = 3000, Descripcion__c = 'Cuatro boletos')
        };
        PortalDonacionesController.CampanaDTO dto = PortalDonacionesController.getCampanas()[0];
        Assert.areEqual(2, dto.hitos.size());
        Assert.areEqual('Primeros boletos', dto.hitos[0].titulo);
        Assert.areEqual(3000, dto.hitos[0].monto);
        Assert.areEqual('Cuatro boletos', dto.hitos[0].descripcion);
    }

    @IsTest
    static void hitoNoPuedeSuperarLaMeta() {
        Database.SaveResult sr = Database.insert(new Hito__c(Campana__c = activa().Id, Name = 'Imposible', Monto__c = 999999), false);
        Assert.isFalse(sr.isSuccess());
    }

    @IsTest
    static void creaDonacionPendienteAntesDePagar() {
        PortalDonacionesController.Resultado r = PortalDonacionesController.crearDonacion(entrada('Factura', 'Empresa Ficticia', 'abc 010101 a12', 1234.5));
        Assert.isTrue(r.ok, String.valueOf(r.errores));
        Donacion__c d = [SELECT Estado__c, Monto__c, RFC__c, Email__c, Solicita_Factura__c FROM Donacion__c WHERE Token_Publico__c = :r.token];
        Assert.areEqual('Pendiente', d.Estado__c);
        Assert.areEqual(1234.50, d.Monto__c);
        Assert.areEqual('ABC010101A12', d.RFC__c, 'RFC normalizado a mayúsculas sin espacios');
        Assert.areEqual('donante.ficticio@example.com', d.Email__c);
        Assert.isTrue(d.Solicita_Factura__c);
    }

    @IsTest
    static void anonimaDescartaNombreYRfc() {
        PortalDonacionesController.Resultado r = PortalDonacionesController.crearDonacion(entrada('Anonima', 'No Debería Guardarse', 'GODE561231GR8', 100));
        Assert.isTrue(r.ok);
        Donacion__c d = [SELECT Nombre__c, RFC__c FROM Donacion__c WHERE Token_Publico__c = :r.token];
        Assert.isNull(d.Nombre__c);
        Assert.isNull(d.RFC__c);
    }

    @IsTest
    static void rechazaDatosInvalidosSinCrearNada() {
        Integer antes = [SELECT COUNT() FROM Donacion__c];
        // RFC con un carácter de más (HU-06 CP1)
        PortalDonacionesController.Resultado r1 = PortalDonacionesController.crearDonacion(entrada('Factura', 'Empresa', 'GODE561231GR8X', 100));
        // Factura sin nombre ni RFC (HU-06 CA1)
        PortalDonacionesController.Resultado r2 = PortalDonacionesController.crearDonacion(entrada('Factura', null, null, 100));
        // Crédito sin nombre, monto menor al mínimo
        PortalDonacionesController.Resultado r3 = PortalDonacionesController.crearDonacion(entrada('Credito', '', null, 1));
        // Modalidad inexistente, JSON roto
        PortalDonacionesController.Resultado r4 = PortalDonacionesController.crearDonacion(entrada('Otra', 'X', null, 100));
        PortalDonacionesController.Resultado r5 = PortalDonacionesController.crearDonacion('{no es json');
        for (PortalDonacionesController.Resultado r : new List<PortalDonacionesController.Resultado>{ r1, r2, r3, r4, r5 }) {
            Assert.isFalse(r.ok);
            Assert.isNotNull(r.mensaje);
        }
        Assert.areEqual(2, r2.errores.size());
        Assert.areEqual(antes, [SELECT COUNT() FROM Donacion__c], 'No se crea ninguna donación (HU-03 CP1)');
    }

    @IsTest
    static void campanaInactivaNoAceptaDonaciones() {
        PortalDonacionesController.DonacionInput e = new PortalDonacionesController.DonacionInput();
        e.campanaId = [SELECT Id FROM Campana__c WHERE Activa__c = FALSE LIMIT 1].Id;
        e.modalidad = 'Anonima';
        e.email = 'a@example.com';
        e.monto = 100;
        Assert.isFalse(PortalDonacionesController.crearDonacion(JSON.serialize(e)).ok);
    }

    @IsTest
    static void iniciarPagoCreaSesionConMontoExactoYReferencia() {
        PortalDonacionesController.Resultado r = PortalDonacionesController.crearDonacion(entrada('Credito', 'Ana Ficticia', null, 250.75));
        TestDataFactory.StripeMock mock = new TestDataFactory.StripeMock(200);
        Test.setMock(HttpCalloutMock.class, mock);
        Test.startTest();
        PortalDonacionesController.Resultado pago = PortalDonacionesController.iniciarPago(r.token);
        Test.stopTest();
        Assert.isTrue(pago.ok);
        Assert.areEqual('https://checkout.stripe.com/c/pay/cs_test_123', pago.urlPago);
        String body = EncodingUtil.urlDecode(mock.ultima.getBody(), 'UTF-8');
        Assert.isTrue(body.contains('unit_amount]=25075'), 'Cobra exactamente el monto capturado (HU-13)');
        Assert.isTrue(body.contains('client_reference_id=' + r.token), 'Referencia para encontrar la donación (HU-03 CA2)');
        Assert.isTrue(body.contains('success_url=https://portal.ejemplo.test/?gracias=' + r.token));
        Assert.isTrue(mock.ultima.getEndpoint().startsWith('callout:Stripe_API'), 'La clave la pone la Named Credential');
        Assert.areEqual('cs_test_123', [SELECT Stripe_Session_Id__c FROM Donacion__c WHERE Token_Publico__c = :r.token].Stripe_Session_Id__c);
    }

    @IsTest
    static void falloDeStripeCancelaConMensajeEntendible() {
        PortalDonacionesController.Resultado r = PortalDonacionesController.crearDonacion(entrada('Anonima', null, null, 100));
        Test.setMock(HttpCalloutMock.class, new TestDataFactory.StripeMock(401));
        Test.startTest();
        PortalDonacionesController.Resultado pago = PortalDonacionesController.iniciarPago(r.token);
        Test.stopTest();
        Assert.isFalse(pago.ok);
        Assert.isFalse(pago.mensaje.contains('API Key'), 'El visitante no ve detalles técnicos');
        Donacion__c d = [SELECT Estado__c, Motivo_Cancelacion__c FROM Donacion__c WHERE Token_Publico__c = :r.token];
        Assert.areEqual('Cancelada', d.Estado__c);
        Assert.isTrue(d.Motivo_Cancelacion__c.contains('401'));
    }

    @IsTest
    static void estadoYCancelacionPorToken() {
        PortalDonacionesController.Resultado r = PortalDonacionesController.crearDonacion(entrada('Credito', 'Ana Ficticia', null, 100));
        PortalDonacionesController.EstadoDTO e = PortalDonacionesController.getEstado(r.token);
        Assert.areEqual('Pendiente', e.estado);
        Assert.areEqual(100, e.monto);
        Assert.isTrue(PortalDonacionesController.cancelar(r.token).ok);
        Assert.areEqual('Cancelada', PortalDonacionesController.getEstado(r.token).estado);
        // Tokens inválidos o inexistentes no devuelven nada
        Assert.isNull(PortalDonacionesController.getEstado('x\' OR Name != \''));
        Assert.isNull(PortalDonacionesController.getEstado('0123456789abcdef0123456789abcdef'));
        Assert.isFalse(PortalDonacionesController.iniciarPago(null).ok);
    }

    /** Simula GET /v1/checkout/sessions/{id} con el estado y la referencia que se indiquen. */
    private class SesionStripeMock implements HttpCalloutMock {
        String referencia;
        String estadoPago;
        Integer codigo;
        SesionStripeMock(String referencia, String estadoPago, Integer codigo) {
            this.referencia = referencia;
            this.estadoPago = estadoPago;
            this.codigo = codigo;
        }
        public HttpResponse respond(HttpRequest req) {
            HttpResponse res = new HttpResponse();
            res.setStatusCode(codigo);
            res.setBody(JSON.serialize(new Map<String, Object>{
                'id' => 'cs_test_verif',
                'client_reference_id' => referencia,
                'payment_status' => estadoPago,
                'payment_intent' => 'pi_verif',
                'amount_total' => 25000
            }));
            return res;
        }
    }

    static String donacionConSesion() {
        PortalDonacionesController.Resultado r = PortalDonacionesController.crearDonacion(entrada('Credito', 'Ana Ficticia', null, 250));
        update new Donacion__c(Id = [SELECT Id FROM Donacion__c WHERE Token_Publico__c = :r.token].Id, Stripe_Session_Id__c = 'cs_test_verif');
        return r.token;
    }

    @IsTest
    static void verificarPagoConfirmaSiStripeDicePaid() {
        String token = donacionConSesion();
        Test.setMock(HttpCalloutMock.class, new SesionStripeMock(token, 'paid', 200));
        Test.startTest();
        PortalDonacionesController.EstadoDTO e = PortalDonacionesController.verificarPago(token);
        Test.stopTest();
        Assert.areEqual('Pagada', e.estado);
        Donacion__c d = [SELECT Confirmada_Por__c, Comprobante_Enviado__c, Fecha_Pago__c FROM Donacion__c WHERE Token_Publico__c = :token];
        Assert.areEqual('Pasarela', d.Confirmada_Por__c, 'Lo confirma Stripe, no el navegador');
        Assert.isTrue(d.Comprobante_Enviado__c);
        Assert.isNotNull(d.Fecha_Pago__c);
    }

    @IsTest
    static void verificarPagoNoConfirmaSinPagoNiConSesionAjena() {
        String token = donacionConSesion();
        Test.setMock(HttpCalloutMock.class, new SesionStripeMock(token, 'unpaid', 200));
        Assert.areEqual('Pendiente', PortalDonacionesController.verificarPago(token).estado);
        Test.setMock(HttpCalloutMock.class, new SesionStripeMock('0123456789abcdef0123456789abcdef', 'paid', 200));
        Assert.areEqual('Pendiente', PortalDonacionesController.verificarPago(token).estado, 'La sesión debe ser de esta donación');
    }

    @IsTest
    static void verificarPagoToleraFalloDeStripe() {
        String token = donacionConSesion();
        Test.setMock(HttpCalloutMock.class, new SesionStripeMock(token, 'paid', 500));
        Test.startTest();
        PortalDonacionesController.EstadoDTO e = PortalDonacionesController.verificarPago(token);
        Test.stopTest();
        Assert.areEqual('Pendiente', e.estado, 'Sin Stripe no cambia; el webhook confirmará después');
        Assert.isNull(PortalDonacionesController.verificarPago('ffffffffffffffffffffffffffffffff'));
    }
}
