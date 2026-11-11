@IsTest
private class DonacionTriggerHandlerTest {
    @IsTest
    static void confirmacionManualSeDistingueYEnviaUnSoloComprobante() {
        Campana__c c = TestDataFactory.campana('Viaje', 1000, true);
        Donacion__c d = TestDataFactory.donacion(c.Id, 'Anonima', 100, 'Pendiente');
        Test.startTest();
        d.Estado__c = 'Pagada';
        update d;
        Integer correos = Limits.getEmailInvocations();
        update d; // segunda edición: no reenvía
        Assert.areEqual(correos, Limits.getEmailInvocations(), 'Un solo comprobante');
        Test.stopTest();
        d = [SELECT Confirmada_Por__c, Fecha_Pago__c, Comprobante_Enviado__c FROM Donacion__c WHERE Id = :d.Id];
        Assert.areEqual('Manual', d.Confirmada_Por__c);
        Assert.isNotNull(d.Fecha_Pago__c);
        Assert.isTrue(d.Comprobante_Enviado__c);
    }

    @IsTest
    static void bulkificado() {
        Campana__c c = TestDataFactory.campana('Boletos', 100000, true);
        List<Donacion__c> ds = new List<Donacion__c>();
        for (Integer i = 0; i < 200; i++) {
            ds.add(new Donacion__c(Campana__c = c.Id, Modalidad__c = 'Anonima', Monto__c = 10, Email__c = 'lote' + i + '@example.com'));
        }
        insert ds;
        for (Donacion__c d : ds) {
            d.Estado__c = 'Pagada';
        }
        Test.startTest();
        update ds;
        Test.stopTest();
        Assert.areEqual(2000, [SELECT Recaudado__c FROM Campana__c WHERE Id = :c.Id].Recaudado__c);
    }

    @IsTest
    static void cuerpoDelComprobanteRespetaModalidad() {
        Campana__c c = new Campana__c(Name = 'Boletos');
        Donacion__c anonima = new Donacion__c(Modalidad__c = 'Anonima', Monto__c = 100, Token_Publico__c = 'abc');
        Donacion__c factura = new Donacion__c(Modalidad__c = 'Factura', Nombre__c = 'Empresa Ficticia', Monto__c = 100);
        String a = ComprobanteService.cuerpo(anonima, c);
        String f = ComprobanteService.cuerpo(factura, c);
        Assert.isTrue(a.startsWith('Hola:'), 'El comprobante anónimo no lleva nombre (HU-02 CA2)');
        Assert.isTrue(f.contains('Empresa Ficticia'));
        Assert.isTrue(f.contains('NO es un comprobante fiscal'), 'Sin CFDI (HU-06 CA3)');
    }
}
