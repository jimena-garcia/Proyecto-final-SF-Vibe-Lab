/**
 * Comprobante de donación por correo (HU-14 CA2, HU-02 CA2).
 * - Donación anónima: el comprobante no incluye nombre.
 * - Con factura: aclara que NO es un comprobante fiscal (CFDI) (HU-06 CA3).
 * - Si el correo no sale, se desmarca Comprobante_Enviado__c para que staff lo vea y no
 *   quede un estado incoherente (C6). El pago NO se revierte por un fallo de correo.
 */
public without sharing class ComprobanteService {
    public static void enviar(List<Donacion__c> donaciones) {
        Set<Id> campanaIds = new Set<Id>();
        for (Donacion__c d : donaciones) {
            campanaIds.add(d.Campana__c);
        }
        Map<Id, Campana__c> campanas = new Map<Id, Campana__c>([SELECT Id, Name FROM Campana__c WHERE Id IN :campanaIds]);

        Id remitente = remitenteVerificado();
        List<Messaging.SingleEmailMessage> correos = new List<Messaging.SingleEmailMessage>();
        List<Id> orden = new List<Id>();
        for (Donacion__c d : donaciones) {
            Messaging.SingleEmailMessage m = new Messaging.SingleEmailMessage();
            m.setToAddresses(new List<String>{ d.Email__c });
            if (remitente != null) {
                // Remitente verificado de la org. Sin él, el correo sale a nombre del usuario
                // invitado del Site y Gmail lo descarta (R-01).
                m.setOrgWideEmailAddressId(remitente);
            } else {
                m.setSenderDisplayName('Portal de donaciones Mexico Dreamin (prueba)');
            }
            m.setSubject('Comprobante de tu donación ' + d.Name);
            m.setPlainTextBody(cuerpo(d, campanas.get(d.Campana__c)));
            m.setSaveAsActivity(false);
            correos.add(m);
            orden.add(d.Id);
        }

        List<Donacion__c> fallidas = new List<Donacion__c>();
        try {
            List<Messaging.SendEmailResult> res = Messaging.sendEmail(correos, false);
            for (Integer i = 0; i < res.size(); i++) {
                if (!res[i].isSuccess()) {
                    fallidas.add(new Donacion__c(Id = orden[i], Comprobante_Enviado__c = false));
                }
            }
        } catch (Exception e) {
            // Por ejemplo, Deliverability en "System email only" o límite diario alcanzado.
            for (Id i : orden) {
                fallidas.add(new Donacion__c(Id = i, Comprobante_Enviado__c = false));
            }
        }
        if (!fallidas.isEmpty()) {
            update fallidas;
        }
    }

    /** Dirección de toda la organización ya verificada y disponible para todos los perfiles (incluido el invitado). Sin IDs fijos. */
    @TestVisible
    private static Id remitenteVerificado() {
        List<OrgWideEmailAddress> dirs = [
            SELECT Id FROM OrgWideEmailAddress
            WHERE IsVerified = true AND IsAllowAllProfiles = true
            ORDER BY CreatedDate ASC LIMIT 1
        ];
        return dirs.isEmpty() ? null : dirs[0].Id;
    }

    @TestVisible
    private static String cuerpo(Donacion__c d, Campana__c c) {
        String saludo = d.Modalidad__c == 'Anonima' || String.isBlank(d.Nombre__c) ? 'Hola:' : 'Hola, ' + d.Nombre__c + ':';
        List<String> lineas = new List<String>{
            saludo,
            '',
            'Gracias por tu donación. Este es tu comprobante:',
            '',
            'Folio: ' + d.Name,
            'Campaña: ' + (c == null ? '' : c.Name),
            'Monto: $' + (d.Monto__c == null ? 0 : d.Monto__c).setScale(2).format() + ' MXN',
            'Fecha de pago: ' + (d.Fecha_Pago__c == null ? '' : d.Fecha_Pago__c.format('dd/MM/yyyy HH:mm', 'America/Merida')),
            'Modalidad: ' + etiquetaModalidad(d.Modalidad__c),
            'Referencia de pago: ' + d.Token_Publico__c
        };
        if (d.Modalidad__c == 'Factura') {
            lineas.add('');
            lineas.add('Tu solicitud de factura quedó registrada. Este correo NO es un comprobante fiscal (CFDI).');
        }
        lineas.add('');
        lineas.add('Proyecto académico SF Vibe Lab: pago simulado en modo de prueba, sin dinero real.');
        return String.join(lineas, '\n');
    }

    private static String etiquetaModalidad(String m) {
        return m == 'Anonima' ? 'Anónima' : m == 'Credito' ? 'Con crédito (tu nombre aparece en el sitio)' : 'Con factura';
    }
}
