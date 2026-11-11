@IsTest
public class EquipoControllerTest {
    /** Usuario de staff real: licencia Salesforce Platform + permission set Staff_Donaciones. */
    public static User crearStaff(String alias) {
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
        System.runAs(new User(Id = UserInfo.getUserId())) {
            insert u;
            insert new PermissionSetAssignment(
                AssigneeId = u.Id,
                PermissionSetId = [SELECT Id FROM PermissionSet WHERE Name = 'Staff_Donaciones'].Id
            );
        }
        return u;
    }

    static String alta(String nombre, String correo, String password) {
        EquipoController.AltaInput e = new EquipoController.AltaInput();
        e.nombre = nombre;
        e.apellido = 'Ficticia';
        e.correo = correo;
        e.password = password;
        return JSON.serialize(e);
    }

    @IsTest
    static void administradorDaDeAltaYDesactiva() {
        String correo = 'coordinacion.' + Math.abs(Crypto.getRandomInteger()) + '@example.com';
        EquipoController.ResultadoAlta r = EquipoController.darDeAlta(alta('Coordinación', correo, 'Mexico2026x'));
        Assert.isTrue(r.ok, r.mensaje);
        Assert.isTrue(r.enlaceAcceso.endsWith('/apex/PanelAdmin'));
        User u = [SELECT Id, Profile.UserLicense.Name, IsActive FROM User WHERE Username = :r.usuario];
        Assert.areEqual('Salesforce Platform', u.Profile.UserLicense.Name);
        Assert.areEqual(
            1,
            [SELECT COUNT() FROM PermissionSetAssignment WHERE AssigneeId = :u.Id AND PermissionSet.Name = 'Staff_Donaciones']
        );

        EquipoController.Equipo eq = EquipoController.getEquipo();
        Assert.isTrue(eq.puedeGestionar);
        Assert.isNotNull(eq.licenciasLibres);

        Assert.isTrue(EquipoController.desactivar(u.Id).ok);
        Assert.isFalse([SELECT IsActive FROM User WHERE Id = :u.Id].IsActive);
        Assert.isFalse(EquipoController.desactivar(UserInfo.getUserId()).ok, 'No puede desactivarse a sí mismo');
    }

    @IsTest
    static void validaDatosAntesDeCrear() {
        Assert.isFalse(EquipoController.darDeAlta(alta('Ana', 'no-es-correo', 'Mexico2026x')).ok);
        Assert.isFalse(EquipoController.darDeAlta(alta('Ana', 'ana@example.com', 'corta1')).ok);
        Assert.isFalse(EquipoController.darDeAlta(alta('Ana', 'ana@example.com', 'sinnumeros')).ok);
        Assert.isFalse(EquipoController.darDeAlta(alta('Ana', 'ana@example.com', 'ana12345678')).ok, 'No debe contener el correo');
        Assert.isFalse(EquipoController.darDeAlta(alta('', 'ana@example.com', 'Mexico2026x')).ok);
        Assert.isFalse(EquipoController.darDeAlta('{roto').ok);
    }

    @IsTest
    static void staffSinPermisoDeUsuariosNoPuedeDarDeAlta() {
        User staff = crearStaff('staffeq');
        System.runAs(staff) {
            Assert.isFalse(EquipoController.getEquipo().puedeGestionar);
            Assert.isFalse(EquipoController.darDeAlta(alta('Intruso', 'intruso@example.com', 'Mexico2026x')).ok);
            Assert.isFalse(EquipoController.desactivar(UserInfo.getUserId()).ok);
        }
    }
}
