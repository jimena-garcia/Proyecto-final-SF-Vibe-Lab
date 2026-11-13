/**
 * Comprobante de donación por correo (HU-14 CA2, HU-02 CA2).
 * - Donación anónima: el comprobante no incluye nombre.
 * - Con factura: aclara que NO es un comprobante fiscal (CFDI) (HU-06 CA3).
 * - Si el correo no sale, se desmarca Comprobante_Enviado__c para que staff lo vea y no
 *   quede un estado incoherente (C6). El pago NO se revierte por un fallo de correo.
 */
public without sharing class ComprobanteService {
    // Identidad de la plataforma (igual que portal-react/src/marca.js).
    @TestVisible static final String MARCA = 'Impulso Vibe Lab';
    static final String AZUL = '#1F62B1'; // marca y botón de la plataforma
    static final String EXITO = '#0B6B47'; // semántico: pagado / confirmado

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
                m.setSenderDisplayName(MARCA + ' (prueba)');
            }
            m.setSubject('Comprobante de donación ' + d.Name + ' · ' + MARCA);
            m.setPlainTextBody(cuerpo(d, campanas.get(d.Campana__c)));
            m.setHtmlBody(html(d, campanas.get(d.Campana__c)));
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

    /**
     * Versión HTML del comprobante: tablas y estilos en línea (compatibles con Gmail y Outlook).
     * Todo dato capturado por el donante se escapa. Anónima: sin nombre (HU-02 CA2).
     */
    public static String html(Donacion__c d, Campana__c c) {
        String nombre = d.Modalidad__c == 'Anonima' || String.isBlank(d.Nombre__c) ? '' : ', ' + esc(d.Nombre__c);
        String monto = '$' + (d.Monto__c == null ? 0 : d.Monto__c).setScale(2).format() + ' MXN';
        String fecha = d.Fecha_Pago__c == null ? '' : d.Fecha_Pago__c.format('dd/MM/yyyy, HH:mm', 'America/Merida') + ' (hora de Mérida)';
        String campana = c == null ? '' : esc(c.Name);
        Stripe_Config__c cfg = Stripe_Config__c.getOrgDefaults();
        String portal = cfg == null ? null : cfg.Portal_URL__c;
        String enlace = String.isBlank(portal) || c == null ? null : portal + (portal.contains('?') ? '&' : '?') + 'campana=' + c.Id;

        String filas = fila('Folio', '<strong>' + esc(d.Name) + '</strong>')
            + fila('Campaña', campana)
            + fila('Fecha de pago', esc(fecha))
            + fila('Modalidad', esc(etiquetaModalidad(d.Modalidad__c)))
            + fila('Método de pago', 'Tarjeta · Stripe (modo de prueba)')
            + fila('Referencia de pago', '<span style="font-family:Consolas,Menlo,monospace;font-size:12px;word-break:break-all;">' + esc(d.Token_Publico__c) + '</span>');

        String nota = '';
        if (d.Modalidad__c == 'Factura') {
            nota = aviso('#FFF7E6', '#8A5A00', '<strong>Solicitud de factura registrada.</strong> Este correo <strong>NO</strong> es un comprobante fiscal (CFDI).');
        } else if (d.Modalidad__c == 'Anonima') {
            nota = aviso('#F2F7F4', '#1A1A1A', 'Donaste de forma <strong>anónima</strong>: en el sitio aparece como "Donante anónimo", sin tu nombre.');
        }
        String boton = enlace == null ? '' :
            '<tr><td align="center" style="padding:8px 32px 28px;">'
            + '<a href="' + esc(enlace) + '" style="display:inline-block;background:' + AZUL + ';color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:8px;">Ver el avance de la campaña</a>'
            + '</td></tr>';

        return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Comprobante ' + esc(d.Name) + '</title></head>'
            + '<body style="margin:0;padding:0;background:#F4F4F1;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#1A1A1A;">'
            + '<div style="display:none;max-height:0;overflow:hidden;">Tu donación de ' + monto + ' a ' + campana + ' está confirmada.</div>'
            + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F1;"><tr><td align="center" style="padding:24px 12px;">'
            + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E6E6E3;border-radius:12px;">'
            // Encabezado
            + '<tr><td style="padding:20px 32px;border-bottom:1px solid #E6E6E3;">'
            + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
            + '<td style="font-size:18px;font-weight:800;color:' + AZUL + ';">' + MARCA + '<div style="font-size:12px;font-weight:400;color:#5C5C5C;margin-top:2px;">SF Vibe Lab · UADY × Salesforce</div></td>'
            + '<td align="right"><span style="display:inline-block;background:#FFF7E6;color:#8A5A00;font-size:11px;font-weight:700;letter-spacing:.5px;padding:4px 8px;border-radius:999px;">MODO DE PRUEBA</span></td>'
            + '</tr></table></td></tr>'
            // Título
            + '<tr><td style="padding:28px 32px 8px;">'
            + '<div style="width:44px;height:44px;line-height:44px;border-radius:50%;background:#E7F5EE;color:' + EXITO + ';font-size:24px;font-weight:700;text-align:center;">&#10003;</div>'
            + '<h1 style="margin:16px 0 4px;font-size:22px;line-height:1.3;">¡Gracias por tu donación' + nombre + '!</h1>'
            + '<p style="margin:0;font-size:15px;color:#5C5C5C;">Tu pago está confirmado y ya cuenta en el avance de <strong style="color:#1A1A1A;">' + campana + '</strong>.</p>'
            + '</td></tr>'
            // Monto
            + '<tr><td style="padding:20px 32px 4px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F5;border-radius:10px;"><tr>'
            + '<td style="padding:18px 20px;"><div style="font-size:13px;color:#5C5C5C;">Monto donado</div><div style="font-size:28px;font-weight:800;margin-top:2px;">' + monto + '</div></td>'
            + '<td align="right" style="padding:18px 20px;"><span style="display:inline-block;background:#E7F5EE;color:' + EXITO + ';font-size:13px;font-weight:700;padding:6px 12px;border-radius:999px;">Pagado</span></td>'
            + '</tr></table></td></tr>'
            // Detalle
            + '<tr><td style="padding:16px 32px 8px;"><div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#5C5C5C;margin-bottom:6px;">Comprobante de donación</div>'
            + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">' + filas + '</table></td></tr>'
            + nota + boton
            // Pie
            + '<tr><td style="padding:20px 32px;border-top:1px solid #E6E6E3;font-size:12px;line-height:1.5;color:#5C5C5C;">'
            + '<strong>Proyecto académico de SF Vibe Lab (UADY × Salesforce).</strong> Pago simulado en modo de prueba: no se cobró dinero real.<br>'
            + 'Este correo se envía automáticamente; por favor no lo respondas.<br>'
            + 'Las campañas son iniciativas de SF Vibe Lab; los eventos mencionados no las organizan ni las respaldan oficialmente.'
            + '</td></tr>'
            + '</table></td></tr></table></body></html>';
    }

    private static String fila(String etiqueta, String valorHtml) {
        return '<tr><td style="padding:10px 0;border-bottom:1px solid #EFEFEC;color:#5C5C5C;width:42%;vertical-align:top;">' + etiqueta + '</td>'
            + '<td style="padding:10px 0;border-bottom:1px solid #EFEFEC;text-align:right;vertical-align:top;">' + valorHtml + '</td></tr>';
    }

    private static String aviso(String fondo, String color, String texto) {
        return '<tr><td style="padding:12px 32px 4px;"><div style="background:' + fondo + ';color:' + color + ';font-size:14px;line-height:1.5;padding:12px 16px;border-radius:8px;">' + texto + '</div></td></tr>';
    }

    private static String esc(String s) {
        return s == null ? '' : s.escapeHtml4();
    }

    private static String etiquetaModalidad(String m) {
        return m == 'Anonima' ? 'Anónima' : m == 'Credito' ? 'Con crédito (tu nombre aparece en el sitio)' : 'Con factura';
    }
}
