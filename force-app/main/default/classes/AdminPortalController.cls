/**
 * Portal de administración (coordinación y tesorería): HU-07, HU-08, HU-09, HU-15.
 *
 * SEGURIDAD: corre "with sharing", consulta WITH USER_MODE y escribe "as user", así que
 * respeta exactamente los permisos de quien entra (permission set Staff_Donaciones).
 * El usuario invitado del sitio público NO tiene acceso a esta clase ni a la página PanelAdmin.
 * Staff no puede cambiar el estado ni el monto de una donación (los define la pasarela).
 */
public with sharing class AdminPortalController {
    // ------------------------------------------------------------------ DTOs
    public class Resumen {
        public String usuario;
        public String portalUrl;
        public Decimal recaudadoActivas = 0;
        public Integer campanasActivas = 0;
        public Integer donacionesPagadas = 0;
        public Integer pendientes = 0;
        public Integer facturasPorAtender = 0;
        public Integer avisosRechazados7d = 0;
        public List<CampanaAdmin> campanas = new List<CampanaAdmin>();
    }

    public class HitoAdmin {
        public String titulo;
        public String descripcion;
        public Decimal monto;
    }

    public class CampanaAdmin {
        public String id;
        public String nombre;
        public String descripcion;
        public Decimal meta;
        public Decimal recaudado;
        public Boolean activa;
        public Boolean destacada;
        public String ilustracion;
        public String montosSugeridos;
        public Integer donacionesPagadas;
        public List<HitoAdmin> hitos = new List<HitoAdmin>();
    }

    public class DonacionAdmin {
        public String id;
        public String folio;
        public String campana;
        public Decimal monto;
        public String estado;
        public String modalidad;
        public String nombre;
        public String email;
        public String rfc;
        public String confirmadaPor;
        public Datetime fechaPago;
        public Datetime creada;
        public Boolean solicitaFactura;
        public Boolean comprobanteEnviado;
        public String motivoCancelacion;
    }

    public class AvisoAdmin {
        public String id;
        public String folio;
        public Datetime recibido;
        public String tipo;
        public String resultado;
        public String motivo;
        public String eventoId;
        public String donacion;
    }

    public class Resultado {
        public Boolean ok = false;
        public String mensaje;
        public String id;
    }

    // ------------------------------------------------------------------ Resumen
    @RemoteAction
    public static Resumen getResumen() {
        Resumen r = new Resumen();
        r.usuario = UserInfo.getName();
        Stripe_Config__c cfg = Stripe_Config__c.getOrgDefaults();
        r.portalUrl = cfg == null ? null : cfg.Portal_URL__c;
        r.campanas = getCampanas();
        for (CampanaAdmin c : r.campanas) {
            if (c.activa) {
                r.campanasActivas++;
                r.recaudadoActivas += c.recaudado;
                r.donacionesPagadas += c.donacionesPagadas;
            }
        }
        r.pendientes = [SELECT COUNT() FROM Donacion__c WHERE Estado__c = 'Pendiente' WITH USER_MODE];
        r.facturasPorAtender = [
            SELECT COUNT() FROM Donacion__c WHERE Solicita_Factura__c = TRUE AND Estado__c = 'Pagada' WITH USER_MODE
        ];
        r.avisosRechazados7d = [
            SELECT COUNT() FROM Aviso_Pasarela__c WHERE Resultado__c = 'Rechazado' AND Recibido__c = LAST_N_DAYS:7 WITH USER_MODE
        ];
        return r;
    }

    // ------------------------------------------------------------------ Campañas (HU-08)
    @RemoteAction
    public static List<CampanaAdmin> getCampanas() {
        List<CampanaAdmin> salida = new List<CampanaAdmin>();
        for (Campana__c c : [
            SELECT
                Id, Name, Descripcion__c, Meta__c, Recaudado__c, Activa__c, Destacada__c, Ilustracion__c,
                Montos_Sugeridos__c, Donaciones_Pagadas__c,
                (SELECT Name, Descripcion__c, Monto__c FROM Hitos__r ORDER BY Monto__c ASC)
            FROM Campana__c
            WITH USER_MODE
            ORDER BY Activa__c DESC, Destacada__c DESC, CreatedDate ASC
            LIMIT 100
        ]) {
            CampanaAdmin dto = new CampanaAdmin();
            dto.id = c.Id;
            dto.nombre = c.Name;
            dto.descripcion = c.Descripcion__c;
            dto.meta = c.Meta__c;
            dto.recaudado = c.Recaudado__c == null ? 0 : c.Recaudado__c;
            dto.activa = c.Activa__c;
            dto.destacada = c.Destacada__c;
            dto.ilustracion = String.isBlank(c.Ilustracion__c) ? 'General' : c.Ilustracion__c;
            dto.montosSugeridos = c.Montos_Sugeridos__c;
            dto.donacionesPagadas = c.Donaciones_Pagadas__c == null ? 0 : c.Donaciones_Pagadas__c.intValue();
            for (Hito__c h : c.Hitos__r) {
                HitoAdmin hito = new HitoAdmin();
                hito.titulo = h.Name;
                hito.descripcion = h.Descripcion__c;
                hito.monto = h.Monto__c;
                dto.hitos.add(hito);
            }
            salida.add(dto);
        }
        return salida;
    }

    /** Crea o edita una campaña y reemplaza sus metas, todo o nada. */
    @RemoteAction
    public static Resultado guardarCampana(String datosJson) {
        Resultado r = new Resultado();
        CampanaAdmin e;
        try {
            e = (CampanaAdmin) JSON.deserialize(datosJson, CampanaAdmin.class);
        } catch (Exception ex) {
            r.mensaje = 'No pudimos leer el formulario. Recarga la página e inténtalo de nuevo.';
            return r;
        }
        if (String.isBlank(e.nombre)) {
            r.mensaje = 'La campaña necesita un nombre.';
            return r;
        }
        if (e.meta == null || e.meta <= 0) {
            r.mensaje = 'La meta debe ser mayor a cero.';
            return r;
        }

        Savepoint sp = Database.setSavepoint();
        try {
            Campana__c c = new Campana__c(
                Name = e.nombre.trim().abbreviate(80),
                Descripcion__c = e.descripcion,
                Meta__c = e.meta,
                Activa__c = e.activa == true,
                Destacada__c = e.destacada == true,
                Ilustracion__c = String.isBlank(e.ilustracion) ? 'General' : e.ilustracion,
                Montos_Sugeridos__c = String.isBlank(e.montosSugeridos) ? null : e.montosSugeridos.deleteWhitespace()
            );
            if (String.isNotBlank(e.id)) {
                c.Id = Id.valueOf(e.id);
                update as user c;
                delete as user [SELECT Id FROM Hito__c WHERE Campana__c = :c.Id WITH USER_MODE];
            } else {
                insert as user c;
            }

            List<Hito__c> hitos = new List<Hito__c>();
            for (HitoAdmin h : e.hitos == null ? new List<HitoAdmin>() : e.hitos) {
                if (String.isBlank(h.titulo) && h.monto == null) {
                    continue;
                }
                hitos.add(new Hito__c(Campana__c = c.Id, Name = (h.titulo == null ? '' : h.titulo.trim()).abbreviate(80), Descripcion__c = h.descripcion, Monto__c = h.monto));
            }
            if (!hitos.isEmpty()) {
                insert as user hitos;
            }

            // Una sola campaña destacada (la portada del sitio).
            if (c.Destacada__c) {
                List<Campana__c> otras = [SELECT Id FROM Campana__c WHERE Destacada__c = TRUE AND Id != :c.Id WITH USER_MODE];
                for (Campana__c o : otras) {
                    o.Destacada__c = false;
                }
                update as user otras;
            }
            r.ok = true;
            r.id = c.Id;
            r.mensaje = 'Campaña guardada. Ya se refleja en el sitio público.';
        } catch (DmlException ex) {
            Database.rollback(sp);
            r.mensaje = ex.getDmlMessage(0);
        } catch (Exception ex) {
            Database.rollback(sp);
            r.mensaje = 'No tienes permiso para guardar esta campaña o ocurrió un error: ' + ex.getMessage();
        }
        return r;
    }

    // ------------------------------------------------------------------ Donaciones (HU-07, HU-09, HU-15)
    private static final Map<String, String> FILTROS = new Map<String, String>{
        'todas' => '',
        'pendientes' => ' AND Estado__c = \'Pendiente\'',
        'pagadas' => ' AND Estado__c = \'Pagada\'',
        'canceladas' => ' AND Estado__c = \'Cancelada\'',
        'factura' => ' AND Solicita_Factura__c = TRUE',
        'pasarela' => ' AND Confirmada_Por__c = \'Pasarela\''
    };

    @RemoteAction
    public static List<DonacionAdmin> getDonaciones(String filtro, String busqueda) {
        String condicion = FILTROS.containsKey(filtro) ? FILTROS.get(filtro) : '';
        Map<String, Object> binds = new Map<String, Object>();
        if (String.isNotBlank(busqueda)) {
            binds.put('texto', '%' + busqueda.trim() + '%');
            condicion += ' AND (Name LIKE :texto OR Nombre__c LIKE :texto OR Campana__r.Name LIKE :texto)';
        }
        String soql =
            'SELECT Id, Name, Campana__r.Name, Monto__c, Estado__c, Modalidad__c, Nombre__c, Email__c, RFC__c, ' +
            'Confirmada_Por__c, Fecha_Pago__c, CreatedDate, Solicita_Factura__c, Comprobante_Enviado__c, Motivo_Cancelacion__c ' +
            'FROM Donacion__c WHERE Id != NULL' + condicion + ' ORDER BY CreatedDate DESC LIMIT 200';

        List<DonacionAdmin> salida = new List<DonacionAdmin>();
        for (Donacion__c d : (List<Donacion__c>) Database.queryWithBinds(soql, binds, AccessLevel.USER_MODE)) {
            DonacionAdmin dto = new DonacionAdmin();
            dto.id = d.Id;
            dto.folio = d.Name;
            dto.campana = d.Campana__r.Name;
            dto.monto = d.Monto__c;
            dto.estado = d.Estado__c;
            dto.modalidad = d.Modalidad__c;
            dto.nombre = d.Modalidad__c == 'Anonima' ? null : d.Nombre__c;
            dto.email = d.Email__c;
            dto.rfc = d.Modalidad__c == 'Factura' ? d.RFC__c : null;
            dto.confirmadaPor = d.Confirmada_Por__c;
            dto.fechaPago = d.Fecha_Pago__c;
            dto.creada = d.CreatedDate;
            dto.solicitaFactura = d.Solicita_Factura__c;
            dto.comprobanteEnviado = d.Comprobante_Enviado__c;
            dto.motivoCancelacion = d.Motivo_Cancelacion__c;
            salida.add(dto);
        }
        return salida;
    }

    // ------------------------------------------------------------------ Avisos de la pasarela (HU-15, HU-17)
    @RemoteAction
    public static List<AvisoAdmin> getAvisos(Boolean soloRechazados) {
        List<Aviso_Pasarela__c> filas = soloRechazados == true
            ? [
                  SELECT Id, Name, Recibido__c, Tipo__c, Resultado__c, Motivo__c, Event_Id__c, Donacion__r.Name
                  FROM Aviso_Pasarela__c
                  WHERE Resultado__c = 'Rechazado'
                  WITH USER_MODE
                  ORDER BY Recibido__c DESC NULLS LAST
                  LIMIT 200
              ]
            : [
                  SELECT Id, Name, Recibido__c, Tipo__c, Resultado__c, Motivo__c, Event_Id__c, Donacion__r.Name
                  FROM Aviso_Pasarela__c
                  WITH USER_MODE
                  ORDER BY Recibido__c DESC NULLS LAST
                  LIMIT 200
              ];
        List<AvisoAdmin> salida = new List<AvisoAdmin>();
        for (Aviso_Pasarela__c a : filas) {
            AvisoAdmin dto = new AvisoAdmin();
            dto.id = a.Id;
            dto.folio = a.Name;
            dto.recibido = a.Recibido__c;
            dto.tipo = a.Tipo__c;
            dto.resultado = a.Resultado__c;
            dto.motivo = a.Motivo__c;
            dto.eventoId = a.Event_Id__c;
            dto.donacion = a.Donacion__r?.Name;
            salida.add(dto);
        }
        return salida;
    }
}
