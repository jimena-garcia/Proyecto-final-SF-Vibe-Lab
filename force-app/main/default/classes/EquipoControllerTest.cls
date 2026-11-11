@IsTest
public class EquipoControllerTest {
    /** Usuario de staff real: licencia Salesforce Platform + acceso base + los roles indicados. */
    public static User crearStaff(String alias, List<String> roles) {
        Profile p = [SELECT Id FROM Profile WHERE UserLicense.Name = 'Salesforce Platform' LIMIT 1];
        User u = new User(
            FirstName = 'Staff',
            LastName = 'Prueba',
            Alias = alias.left(8),
            Email = alias + '@example.com',
            Username = alias + '.' + Math.abs(Crypto.getRandomInteger()) + '@example.com.test',
            ProfileId = p.Id,
            TimeZoneSidKey = 'America/Merida',
            LocaleSidKey = 'es_MX',
            LanguageLocaleKey = 'es',
            EmailEncodingKey = 'UTF-8'
        );
        List<String> nombres = new List<String>{ 'Staff_Donaciones' };
        nombres.addAll(roles);
        System.runAs(new User(Id = UserInfo.getUserId())) {
            insert u;
            List<PermissionSetAssignment> psa = new List<PermissionSetAssignment>();
            for (PermissionSet ps : [SELECT Id FROM PermissionSet WHERE Name IN :nombres]) {
                psa.add(new PermissionSetAssignment(AssigneeId = u.Id, PermissionSetId = ps.Id));
            }
            insert psa;
        }
        return u;
    }

    static String alta(String nombre, String correo, String password, String rol) {
        EquipoController.AltaInput e = new EquipoController.AltaInput();
        e.nombre = nombre;
        e.apellido = 'Ficticia';
        e.correo = correo;
        e.password = password;
        e.rol = rol;
        return JSON.serialize(e);
    }

    static Set<String> permisosDe(Id userId) {
        Set<String> s = new Set<String>();
        for (PermissionSetAssignment a : [SELECT PermissionSet.Name FROM PermissionSetAssignment WHERE AssigneeId = :userId AND PermissionSet.IsOwnedByProfile = FALSE]) {
            s.add(a.PermissionSet.Name);
        }
        return s;
    }

    @IsTest
    static void administradorDaDeAltaConRolYLoCambia() {
        String correo = 'coordinacion.' + Math.abs(Crypto.getRandomInteger()) + '@example.com';
        Test.startTest();
        EquipoController.ResultadoAlta r = EquipoController.darDeAlta(alta('Coordinación', correo, 'Mexico2026x', 'coordinacion'));
        Test.stopTest(); // ejecuta el registro @future en Miembro_Equipo__c
        Assert.isTrue(r.ok, r.mensaje);
        Assert.isTrue(r.enlaceAcceso.endsWith('/apex/PanelAdmin'));
        User u = [SELECT Id, Profile.UserLicense.Name FROM User WHERE Username = :r.usuario];
        Assert.areEqual('Salesforce Platform', u.Profile.UserLicense.Name);
        Assert.areEqual(new Set<String>{ 'Staff_Donaciones', 'Rol_Coordinacion' }, permisosDe(u.Id));

        Miembro_Equipo__c m = [SELECT Rol__c, Correo__c, Activo__c FROM Miembro_Equipo__c WHERE Usuario__c = :u.Id];
        Assert.areEqual('Coordinacion', m.Rol__c);
        Assert.areEqual(correo, m.Correo__c);

        EquipoController.Equipo eq = EquipoController.getEquipo();
        Assert.isTrue(eq.puedeGestionar);
        Boolean encontrado = false;
        for (EquipoController.Persona p : eq.personas) {
            if (p.id == u.Id) {
                Assert.areEqual('coordinacion', p.rol);
                encontrado = true;
            }
        }
        Assert.isTrue(encontrado);

        Assert.isTrue(EquipoController.cambiarRol(u.Id, 'ambos').ok);
        Assert.areEqual(new Set<String>{ 'Staff_Donaciones', 'Rol_Coordinacion', 'Rol_Tesoreria' }, permisosDe(u.Id));
        Assert.isTrue(EquipoController.cambiarRol(u.Id, 'tesoreria').ok);
        Assert.areEqual(new Set<String>{ 'Staff_Donaciones', 'Rol_Tesoreria' }, permisosDe(u.Id));
        Assert.isFalse(EquipoController.cambiarRol(u.Id, 'superadmin').ok, 'Rol inválido');

        Assert.isTrue(EquipoController.desactivar(u.Id).ok);
        Assert.isFalse([SELECT IsActive FROM User WHERE Id = :u.Id].IsActive);
        Assert.isFalse(EquipoController.desactivar(UserInfo.getUserId()).ok, 'No puede desactivarse a sí mismo');
    }

    @IsTest
    static void validaDatosAntesDeCrear() {
        Assert.isFalse(EquipoController.darDeAlta(alta('Ana', 'no-es-correo', 'Mexico2026x', 'ambos')).ok);
        Assert.isFalse(EquipoController.darDeAlta(alta('Ana', 'ana@example.com', 'corta1', 'ambos')).ok);
        Assert.isFalse(EquipoController.darDeAlta(alta('Ana', 'ana@example.com', 'sinnumeros', 'ambos')).ok);
        Assert.isFalse(EquipoController.darDeAlta(alta('Ana', 'ana@example.com', 'ana12345678', 'ambos')).ok, 'No debe contener el correo');
        Assert.isFalse(EquipoController.darDeAlta(alta('', 'ana@example.com', 'Mexico2026x', 'ambos')).ok);
        Assert.isFalse(EquipoController.darDeAlta(alta('Ana', 'ana@example.com', 'Mexico2026x', null)).ok, 'Rol obligatorio');
        Assert.isFalse(EquipoController.darDeAlta(alta('Ana', 'ana@example.com', 'Mexico2026x', 'admin')).ok, 'Rol inválido');
        Assert.isFalse(EquipoController.darDeAlta('{roto').ok);
    }

    @IsTest
    static void ningunRolPuedeCrearUsuariosNiCambiarRoles() {
        for (User staff : new List<User>{
            crearStaff('coordx', new List<String>{ 'Rol_Coordinacion' }),
            crearStaff('tesorx', new List<String>{ 'Rol_Tesoreria' }),
            crearStaff('ambosx', new List<String>{ 'Rol_Coordinacion', 'Rol_Tesoreria' })
        }) {
            System.runAs(staff) {
                Assert.isFalse(EquipoController.getEquipo().puedeGestionar);
                Assert.isFalse(EquipoController.darDeAlta(alta('Intruso', 'intruso@example.com', 'Mexico2026x', 'ambos')).ok);
                Assert.isFalse(EquipoController.cambiarRol(UserInfo.getUserId(), 'ambos').ok);
                Assert.isFalse(EquipoController.desactivar(UserInfo.getUserId()).ok);
                Assert.isFalse(AdminPortalController.getPermisos().equipo);
            }
        }
    }
}
