@IsTest
private class AdminPortalControllerTest {
    @TestSetup
    static void datos() {
        TestDataFactory.configurarStripe();
        Campana__c c = TestDataFactory.campana('Mexico Dreamin', 100000, true);
        TestDataFactory.donacion(c.Id, 'Factura', 300, 'Pagada');
        TestDataFactory.donacion(c.Id, 'Anonima', 100, 'Pendiente');
        TestDataFactory.donacion(c.Id, 'Credito', 200, 'Cancelada');
        insert new Aviso_Pasarela__c(Resultado__c = 'Rechazado', Motivo__c = 'Firma inválida', Recibido__c = Datetime.now());
    }

    static String campanaJson(String id, String nombre, Decimal meta, List<Decimal> metas) {
        AdminPortalController.CampanaAdmin e = new AdminPortalController.CampanaAdmin();
        e.id = id;
        e.nombre = nombre;
        e.meta = meta;
        e.activa = true;
        e.destacada = true;
        e.ilustracion = 'Boletos';
        e.montosSugeridos = '100; 200';
        for (Decimal m : metas) {
            AdminPortalController.HitoAdmin h = new AdminPortalController.HitoAdmin();
            h.titulo = 'Meta ' + m;
            h.monto = m;
            e.hitos.add(h);
        }
        return JSON.serialize(e);
    }

    @IsTest
    static void resumenCuentaPorEstado() {
        AdminPortalController.Resumen r = AdminPortalController.getResumen();
        Assert.areEqual(1, r.campanasActivas);
        Assert.areEqual(300, r.recaudadoActivas);
        Assert.areEqual(1, r.pendientes);
        Assert.areEqual(1, r.facturasPorAtender);
        Assert.areEqual(1, r.avisosRechazados7d);
        Assert.areEqual('https://portal.ejemplo.test', r.portalUrl);
    }

    @IsTest
    static void creaYEditaCampanaConMetas() {
        AdminPortalController.Resultado r = AdminPortalController.guardarCampana(campanaJson(null, 'Viáticos', 15000, new List<Decimal>{ 5000, 15000 }));
        Assert.isTrue(r.ok, r.mensaje);
        Campana__c c = [SELECT Destacada__c, Montos_Sugeridos__c, (SELECT Monto__c FROM Hitos__r) FROM Campana__c WHERE Id = :r.id];
        Assert.areEqual(2, c.Hitos__r.size());
        Assert.areEqual('100;200', c.Montos_Sugeridos__c);
        Assert.areEqual(1, [SELECT COUNT() FROM Campana__c WHERE Destacada__c = TRUE], 'Solo una destacada');

        // Editar reemplaza las metas
        AdminPortalController.Resultado r2 = AdminPortalController.guardarCampana(campanaJson(r.id, 'Viáticos CDMX', 20000, new List<Decimal>{ 20000 }));
        Assert.isTrue(r2.ok, r2.mensaje);
        Assert.areEqual(1, [SELECT COUNT() FROM Hito__c WHERE Campana__c = :r.id]);
    }

    @IsTest
    static void rechazaMetaMayorALaFinalSinGuardarNada() {
        Integer antes = [SELECT COUNT() FROM Campana__c];
        AdminPortalController.Resultado r = AdminPortalController.guardarCampana(campanaJson(null, 'Mala', 1000, new List<Decimal>{ 5000 }));
        Assert.isFalse(r.ok);
        Assert.isTrue(r.mensaje.contains('meta'), r.mensaje);
        Assert.areEqual(antes, [SELECT COUNT() FROM Campana__c], 'Todo o nada');
        Assert.isFalse(AdminPortalController.guardarCampana(campanaJson(null, '', 1000, new List<Decimal>())).ok);
        Assert.isFalse(AdminPortalController.guardarCampana(campanaJson(null, 'Sin meta', 0, new List<Decimal>())).ok);
        Assert.isFalse(AdminPortalController.guardarCampana('{roto').ok);
    }

    @IsTest
    static void filtrosDeDonacionesYPrivacidad() {
        Assert.areEqual(3, AdminPortalController.getDonaciones('todas', null).size());
        Assert.areEqual(1, AdminPortalController.getDonaciones('pendientes', null).size());
        Assert.areEqual(1, AdminPortalController.getDonaciones('pagadas', null).size());
        Assert.areEqual(1, AdminPortalController.getDonaciones('canceladas', null).size());
        List<AdminPortalController.DonacionAdmin> facturas = AdminPortalController.getDonaciones('factura', null);
        Assert.areEqual(1, facturas.size());
        Assert.areEqual('GODE561231GR8', facturas[0].rfc);
        Assert.areEqual(0, AdminPortalController.getDonaciones('pasarela', null).size());
        Assert.isNull(AdminPortalController.getDonaciones('pendientes', null)[0].nombre, 'Anónima sin nombre');
        Assert.areEqual(3, AdminPortalController.getDonaciones('todas', 'Mexico').size(), 'Busca por campaña');
        Assert.areEqual(3, AdminPortalController.getDonaciones('inexistente', null).size());
    }

    @IsTest
    static void avisos() {
        Assert.areEqual(1, AdminPortalController.getAvisos(true).size());
        Assert.areEqual(1, AdminPortalController.getAvisos(false).size());
    }

    @IsTest
    static void staffConPermisoUsaElPortal() {
        User staff = EquipoControllerTest.crearStaff('staffpo');
        System.runAs(staff) {
            Assert.areEqual(1, AdminPortalController.getResumen().campanasActivas);
            Assert.isTrue(AdminPortalController.guardarCampana(campanaJson(null, 'Desde staff', 5000, new List<Decimal>{ 5000 })).ok);
            Assert.areEqual(3, AdminPortalController.getDonaciones('todas', null).size());
        }
    }
}
