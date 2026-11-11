/**
 * Alta de personas del equipo (coordinación / tesorería) con correo y contraseña.
 * Cada persona es un usuario de la org con licencia Salesforce Platform y el permission set
 * Staff_Donaciones. Solo quien tenga el permiso "Gestionar usuarios" (el dueño de la org) puede
 * usar esta clase: se valida en el servidor, no basta con ocultar el botón.
 * La contraseña nunca se guarda en objetos ni se escribe en logs.
 */
public with sharing class EquipoController {
    public static final String PERMISO_STAFF = 'Staff_Donaciones';
    public static final String SUFIJO = '.mxdreamin';
    private static final String EMAIL_REGEX = '^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$';

    // Permite usar la clase como extensión de la página PanelAdmin.
    public EquipoController(AdminPortalController controlador) {
    }

    public EquipoController() {
    }

    public class Persona {
        public String id;
        public String nombre;
        public String usuario;
        public String email;
        public Boolean activo;
        public Datetime ultimoAcceso;
        public Boolean esTu;
    }

    public class Equipo {
        public Boolean puedeGestionar = false;
        public String enlaceAcceso;
        public Integer licenciasLibres;
        public List<Persona> personas = new List<Persona>();
    }

    public class AltaInput {
        public String nombre;
        public String apellido;
        public String correo;
        public String password;
    }

    public class ResultadoAlta {
        public Boolean ok = false;
        public String mensaje;
        public String usuario;
        public String enlaceAcceso;
    }

    @TestVisible
    private static Boolean puedeGestionar() {
        return [
                SELECT COUNT()
                FROM PermissionSetAssignment
                WHERE AssigneeId = :UserInfo.getUserId() AND PermissionSet.PermissionsManageUsers = TRUE
            ] > 0;
    }

    public static String enlaceAcceso() {
        // Sin sesión, Salesforce manda a su login y al entrar regresa aquí (flujo nativo).
        return URL.getOrgDomainUrl().toExternalForm() + '/apex/PanelAdmin';
    }

    @RemoteAction
    public static Equipo getEquipo() {
        Equipo e = new Equipo();
        e.puedeGestionar = puedeGestionar();
        if (!e.puedeGestionar) {
            return e; // el resto del portal funciona; la sección Equipo no se muestra
        }
        e.enlaceAcceso = enlaceAcceso();
        List<UserLicense> lic = [SELECT TotalLicenses, UsedLicenses FROM UserLicense WHERE Name = 'Salesforce Platform' LIMIT 1];
        e.licenciasLibres = lic.isEmpty() ? 0 : lic[0].TotalLicenses - lic[0].UsedLicenses;
        for (User u : [
            SELECT Id, Name, Username, Email, IsActive, LastLoginDate
            FROM User
            WHERE Id IN (SELECT AssigneeId FROM PermissionSetAssignment WHERE PermissionSet.Name = :PERMISO_STAFF)
            ORDER BY IsActive DESC, Name ASC
            LIMIT 50
        ]) {
            Persona p = new Persona();
            p.id = u.Id;
            p.nombre = u.Name;
            p.usuario = u.Username;
            p.email = u.Email;
            p.activo = u.IsActive;
            p.ultimoAcceso = u.LastLoginDate;
            p.esTu = u.Id == UserInfo.getUserId();
            e.personas.add(p);
        }
        return e;
    }

    @RemoteAction
    public static ResultadoAlta darDeAlta(String datosJson) {
        ResultadoAlta r = new ResultadoAlta();
        if (!puedeGestionar()) {
            r.mensaje = 'Solo el administrador de la org puede dar de alta personas.';
            return r;
        }
        AltaInput e;
        try {
            e = (AltaInput) JSON.deserialize(datosJson, AltaInput.class);
        } catch (Exception ex) {
            r.mensaje = 'No pudimos leer el formulario.';
            return r;
        }
        String correo = e.correo == null ? '' : e.correo.trim().toLowerCase();
        String errorValidacion = validar(e, correo);
        if (errorValidacion != null) {
            r.mensaje = errorValidacion;
            return r;
        }
        List<Profile> perfiles = [SELECT Id FROM Profile WHERE UserLicense.Name = 'Salesforce Platform' LIMIT 1];
        if (perfiles.isEmpty()) {
            r.mensaje = 'La org no tiene el perfil de la licencia Salesforce Platform.';
            return r;
        }

        Savepoint sp = Database.setSavepoint();
        try {
            User u = construirUsuario(e, correo, perfiles[0].Id, correo);
            Database.DMLOptions dmo = new Database.DMLOptions();
            dmo.EmailHeader.triggerUserEmail = false; // la contraseña la comunica el administrador
            Database.SaveResult sr = Database.insert(u, dmo);
            if (!sr.isSuccess() && esUsuarioDuplicado(sr)) {
                // El correo ya es usuario en otra org de Salesforce: se agrega un sufijo.
                u = construirUsuario(e, correo, perfiles[0].Id, correo + SUFIJO);
                sr = Database.insert(u, dmo);
            }
            if (!sr.isSuccess()) {
                Database.rollback(sp);
                r.mensaje = traducirError(sr.getErrors()[0]);
                return r;
            }
            PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = :PERMISO_STAFF LIMIT 1];
            insert new PermissionSetAssignment(AssigneeId = u.Id, PermissionSetId = ps.Id);
            fijarPassword(u.Id, e.password);

            r.ok = true;
            r.usuario = u.Username;
            r.enlaceAcceso = enlaceAcceso();
            r.mensaje = 'Listo. Comparte el enlace, el usuario y la contraseña con ' + e.nombre.trim() + '.';
        } catch (Exception ex) {
            Database.rollback(sp);
            String m = ex.getMessage();
            r.mensaje = m != null && m.containsIgnoreCase('password')
                ? 'Salesforce rechazó la contraseña: usa al menos 8 caracteres con letras y números, y que no contenga tu nombre ni el correo.'
                : 'No se pudo dar de alta: ' + m;
        }
        return r;
    }

    @RemoteAction
    public static ResultadoAlta desactivar(String userId) {
        ResultadoAlta r = new ResultadoAlta();
        if (!puedeGestionar()) {
            r.mensaje = 'Solo el administrador de la org puede desactivar personas.';
            return r;
        }
        if (userId == UserInfo.getUserId()) {
            r.mensaje = 'No puedes desactivar tu propio usuario.';
            return r;
        }
        try {
            update new User(Id = Id.valueOf(userId), IsActive = false);
            r.ok = true;
            r.mensaje = 'Usuario desactivado. Ya no puede entrar y su licencia queda libre.';
        } catch (Exception ex) {
            r.mensaje = 'No se pudo desactivar: ' + ex.getMessage();
        }
        return r;
    }

    // ------------------------------------------------------------------ utilidades
    @TestVisible
    private static String validar(AltaInput e, String correo) {
        if (String.isBlank(e.nombre) || String.isBlank(e.apellido)) {
            return 'Escribe nombre y apellido.';
        }
        if (!Pattern.matches(EMAIL_REGEX, correo) || correo.length() > 70) {
            return 'Escribe un correo válido.';
        }
        String p = e.password == null ? '' : e.password;
        if (p.length() < 8 || !Pattern.matches('.*[A-Za-z].*', p) || !Pattern.matches('.*[0-9].*', p)) {
            return 'La contraseña debe tener al menos 8 caracteres e incluir letras y números.';
        }
        if (p.containsIgnoreCase(correo.substringBefore('@'))) {
            return 'La contraseña no debe contener el correo.';
        }
        return null;
    }

    private static User construirUsuario(AltaInput e, String correo, Id perfilId, String usuario) {
        String nombre = e.nombre.trim();
        String apellido = e.apellido.trim();
        String alias = (nombre.left(1) + apellido.replaceAll('[^A-Za-z]', '')).left(8).toLowerCase();
        return new User(
            FirstName = nombre.abbreviate(40),
            LastName = apellido.abbreviate(80),
            Email = correo,
            Username = usuario,
            Alias = String.isBlank(alias) ? 'staff' : alias,
            CommunityNickname = (correo.substringBefore('@') + '.' + String.valueOf(Crypto.getRandomInteger()).right(5)).left(40),
            ProfileId = perfilId,
            TimeZoneSidKey = 'America/Merida',
            LocaleSidKey = 'es_MX',
            LanguageLocaleKey = 'es',
            EmailEncodingKey = 'UTF-8'
        );
    }

    private static Boolean esUsuarioDuplicado(Database.SaveResult sr) {
        for (Database.Error err : sr.getErrors()) {
            if (err.getStatusCode() == StatusCode.DUPLICATE_USERNAME) {
                return true;
            }
        }
        return false;
    }

    private static String traducirError(Database.Error err) {
        if (err.getStatusCode() == StatusCode.LICENSE_LIMIT_EXCEEDED) {
            return 'Ya no hay licencias Salesforce Platform libres. Desactiva a alguien del equipo para liberar una.';
        }
        if (err.getStatusCode() == StatusCode.DUPLICATE_USERNAME) {
            return 'Ese correo ya está registrado como usuario. Usa otro correo.';
        }
        return err.getMessage();
    }

    // System.setPassword no está disponible en tests; se aísla para poder probar el resto.
    @TestVisible
    private static Boolean omitirPasswordEnTest = Test.isRunningTest();

    private static void fijarPassword(Id userId, String password) {
        if (!omitirPasswordEnTest) {
            System.setPassword(userId, password);
        }
    }
}
