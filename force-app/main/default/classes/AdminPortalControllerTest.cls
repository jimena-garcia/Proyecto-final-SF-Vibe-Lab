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

    static User coordinacion() {
        return EquipoControllerTest.crearStaff('coord', new List<String>{ 'Rol_Coordinacion' });
    }

    static User tesoreria() {
        return EquipoControllerTest.crearStaff('tesor', new List<String>{ 'Rol_Tesoreria' });
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
    static void permisosPorRol() {
        System.runAs(coordinacion()) {
            AdminPortalController.Permisos p = AdminPortalController.getPermisos();
            Assert.isTrue(p.coordinacion);
            Assert.isFalse(p.tesoreria);
            Assert.isFalse(p.equipo);
        }
        System.runAs(tesoreria()) {
            AdminPortalController.Permisos p = AdminPortalController.getPermisos();
            Assert.isFalse(p.coordinacion);
            Assert.isTrue(p.tesoreria);
        }
    }

    @IsTest
    static void tesoreriaVeElResumenCompleto() {
        System.runAs(tesoreria()) {
            AdminPortalController.Resumen r = AdminPortalController.getResumen();
            Assert.isTrue(r.verDonaciones);
            Assert.areEqual(1, r.campanasActivas);
            Assert.areEqual(300, r.recaudadoActivas);
            Assert.areEqual(1, r.pendientes);
            Assert.areEqual(1, r.facturasPorAtender);
            Assert.areEqual(1, r.avisosRechazados7d);
            Assert.areEqual('https://portal.ejemplo.test', r.portalUrl);
        }
    }

    @IsTest
    static void coordinacionVeAvancePeroNoDatosDeDonantes() {
        System.runAs(coordinacion()) {
            AdminPortalController.Resumen r = AdminPortalController.getResumen();
            Assert.isFalse(r.verDonaciones);
            Assert.areEqual(300, r.recaudadoActivas, 'El avance viene del roll-up de la campaña');
            Assert.areEqual(0, r.pendientes, 'Sin datos de tesorería');
            try {
                AdminPortalController.getDonaciones('todas', null);
                Assert.fail('Coordinación no debe ver donaciones');
            } catch (AdminPortalController.SinPermisoException e) {
                Assert.isTrue(e.getMessage().contains('permiso'));
            }
            try {
                AdminPortalController.getAvisos(false);
                Assert.fail('Coordinación no debe ver avisos');
            } catch (AdminPortalController.SinPermisoException e) {
                Assert.isNotNull(e.getMessage());
            }
        }
    }

    @IsTest
    static void coordinacionCreaYEditaCampanaConMetas() {
        System.runAs(coordinacion()) {
            AdminPortalController.Resultado r = AdminPortalController.guardarCampana(campanaJson(null, 'Viáticos', 15000, new List<Decimal>{ 5000, 15000 }));
            Assert.isTrue(r.ok, r.mensaje);
            Campana__c c = [SELECT Destacada__c, Montos_Sugeridos__c, (SELECT Monto__c FROM Hitos__r) FROM Campana__c WHERE Id = :r.id];
            Assert.areEqual(2, c.Hitos__r.size());
            Assert.areEqual('100;200', c.Montos_Sugeridos__c);
            Assert.areEqual(1, [SELECT COUNT() FROM Campana__c WHERE Destacada__c = TRUE], 'Solo una destacada');

            AdminPortalController.Resultado r2 = AdminPortalController.guardarCampana(campanaJson(r.id, 'Viáticos CDMX', 20000, new List<Decimal>{ 20000 }));
            Assert.isTrue(r2.ok, r2.mensaje);
            Assert.areEqual(1, [SELECT COUNT() FROM Hito__c WHERE Campana__c = :r.id]);
        }
    }

    @IsTest
    static void tesoreriaNoPuedeEditarCampanas() {
        Integer antes = [SELECT COUNT() FROM Campana__c];
        System.runAs(tesoreria()) {
            AdminPortalController.Resultado r = AdminPortalController.guardarCampana(campanaJson(null, 'No permitida', 1000, new List<Decimal>()));
            Assert.isFalse(r.ok);
            Assert.isTrue(r.mensaje.contains('rol'), r.mensaje);
        }
        Assert.areEqual(antes, [SELECT COUNT() FROM Campana__c]);
    }

    @IsTest
    static void rechazaMetaMayorALaFinalSinGuardarNada() {
        Integer antes = [SELECT COUNT() FROM Campana__c];
        System.runAs(coordinacion()) {
            AdminPortalController.Resultado r = AdminPortalController.guardarCampana(campanaJson(null, 'Mala', 1000, new List<Decimal>{ 5000 }));
            Assert.isFalse(r.ok);
            Assert.isTrue(r.mensaje.contains('meta'), r.mensaje);
            Assert.isFalse(AdminPortalController.guardarCampana(campanaJson(null, '', 1000, new List<Decimal>())).ok);
            Assert.isFalse(AdminPortalController.guardarCampana(campanaJson(null, 'Sin meta', 0, new List<Decimal>())).ok);
            Assert.isFalse(AdminPortalController.guardarCampana('{roto').ok);
        }
        Assert.areEqual(antes, [SELECT COUNT() FROM Campana__c], 'Todo o nada');
    }

    @IsTest
    static void tesoreriaFiltraDonacionesYVeDatosDeFactura() {
        System.runAs(tesoreria()) {
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
            Assert.areEqual(1, AdminPortalController.getAvisos(true).size());
            Assert.areEqual(1, AdminPortalController.getAvisos(false).size());
        }
    }

    // PNG de 1x1 px (válido) y un texto que no es imagen.
    static final String PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    static final String NO_IMAGEN = EncodingUtil.base64Encode(Blob.valueOf('<script>alert(1)</script> no es imagen'));

    static Integer imagenesDe(Id campanaId) {
        return [SELECT COUNT() FROM ContentDocumentLink WHERE LinkedEntityId = :campanaId AND ContentDocument.Title = :AdminPortalController.TITULO_IMAGEN];
    }

    @IsTest
    static void coordinacionSubeReemplazaYQuitaLaImagen() {
        Campana__c c = [SELECT Id FROM Campana__c LIMIT 1];
        System.runAs(coordinacion()) {
            AdminPortalController.Resultado r1 = AdminPortalController.subirImagen(c.Id, 'portada.png', PNG);
            Assert.isTrue(r1.ok, r1.mensaje);
            Assert.isTrue(r1.url.startsWith('https://'), r1.url);
            AdminPortalController.Resultado r2 = AdminPortalController.subirImagen(c.Id, 'otra.png', PNG);
            Assert.isTrue(r2.ok, r2.mensaje);
        }
        Assert.areEqual(1, imagenesDe(c.Id), 'Al reemplazar se borra la imagen anterior');
        Assert.isNotNull([SELECT Imagen_URL__c FROM Campana__c WHERE Id = :c.Id].Imagen_URL__c);

        // El sitio público recibe el enlace de la imagen.
        PortalDonacionesController.CampanaDTO dto = PortalDonacionesController.getCampanas()[0];
        Assert.isTrue(dto.imagenUrl.startsWith('https://'));

        System.runAs(coordinacion()) {
            Assert.isTrue(AdminPortalController.quitarImagen(c.Id).ok);
        }
        Assert.areEqual(0, imagenesDe(c.Id));
        Assert.isNull([SELECT Imagen_URL__c FROM Campana__c WHERE Id = :c.Id].Imagen_URL__c);
    }

    @IsTest
    static void rechazaArchivosQueNoSonImagenYRolesSinPermiso() {
        Campana__c c = [SELECT Id FROM Campana__c LIMIT 1];
        System.runAs(coordinacion()) {
            AdminPortalController.Resultado r = AdminPortalController.subirImagen(c.Id, 'truco.png', NO_IMAGEN);
            Assert.isFalse(r.ok);
            Assert.isTrue(r.mensaje.contains('PNG, JPG o WebP'), r.mensaje);
            Assert.isFalse(AdminPortalController.subirImagen(null, 'x.png', PNG).ok, 'Sin campaña guardada no se sube');
        }
        System.runAs(tesoreria()) {
            AdminPortalController.Resultado r = AdminPortalController.subirImagen(c.Id, 'x.png', PNG);
            Assert.isFalse(r.ok);
            Assert.isTrue(r.mensaje.contains('rol'), r.mensaje);
            Assert.isFalse(AdminPortalController.quitarImagen(c.Id).ok);
        }
        Assert.areEqual(0, imagenesDe(c.Id));
        Assert.areEqual('jpg', AdminPortalController.tipoImagen('/9j/4AAQSkZJRgABAQAAAQABAAD'));
        Assert.areEqual('webp', AdminPortalController.tipoImagen(EncodingUtil.base64Encode(Blob.valueOf('RIFF1234WEBPVP8 '))));
    }
}
