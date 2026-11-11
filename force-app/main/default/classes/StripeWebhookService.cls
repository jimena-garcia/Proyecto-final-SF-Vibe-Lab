/**
 * Procesa avisos de Stripe (HU-14, HU-15, HU-16, HU-17).
 *  1. Verifica la firma Stripe-Signature (HMAC-SHA256 de "t.payload" con el signing secret)
 *     y una tolerancia de 5 minutos contra repeticiones viejas (replay).
 *  2. Registra cada aviso en Aviso_Pasarela__c: Aceptado / Rechazado / Duplicado / Ignorado.
 *  3. Idempotencia: Clave_Unica__c (único) = id del evento; un evento repetido no cambia nada.
 *  4. checkout.session.completed + payment_status=paid  =>  Donación Pagada, Confirmada_Por = Pasarela.
 *     El comprobante lo envía DonacionTriggerHandler una sola vez (Comprobante_Enviado__c).
 */
public without sharing class StripeWebhookService {
    public static final Long TOLERANCIA_SEGUNDOS = 300;
    private static final Set<String> EVENTOS_PAGO = new Set<String>{
        'checkout.session.completed',
        'checkout.session.async_payment_succeeded'
    };

    public class Respuesta {
        public Integer codigoHttp;
        public String resultado;
        Respuesta(Integer codigo, String resultado) {
            this.codigoHttp = codigo;
            this.resultado = resultado;
        }
    }

    public static String secreto() {
        Stripe_Config__c cfg = Stripe_Config__c.getOrgDefaults();
        return cfg == null ? null : cfg.Webhook_Secret__c;
    }

    public static Respuesta procesar(String payload, String encabezadoFirma, String secreto, Long ahoraSegundos) {
        Datetime recibido = Datetime.now();

        // ---------- 1. Autenticidad ----------
        String motivoRechazo = verificarFirma(payload, encabezadoFirma, secreto, ahoraSegundos);
        if (motivoRechazo != null) {
            // No se confía en el contenido: solo se guarda el id que dice traer, marcado como no verificado.
            registrar(new Aviso_Pasarela__c(
                Event_Id__c = idDeclarado(payload),
                Resultado__c = 'Rechazado',
                Motivo__c = motivoRechazo,
                Recibido__c = recibido
            ));
            return new Respuesta(400, 'rechazado');
        }

        // ---------- 2. Contenido ----------
        Map<String, Object> evento;
        try {
            evento = (Map<String, Object>) JSON.deserializeUntyped(payload);
        } catch (Exception e) {
            registrar(new Aviso_Pasarela__c(Resultado__c = 'Rechazado', Motivo__c = 'JSON inválido', Recibido__c = recibido));
            return new Respuesta(400, 'rechazado');
        }
        String eventoId = (String) evento.get('id');
        String tipo = (String) evento.get('type');
        Map<String, Object> sesion;
        if (tipo != null && tipo.startsWith('v1.')) {
            // Evento "thin" (estilo "Resumen"): solo trae el id; se consulta la sesión a Stripe.
            // El callout va antes de cualquier DML de esta transacción.
            tipo = tipo.removeStart('v1.');
            Map<String, Object> relacionado = (Map<String, Object>) evento.get('related_object');
            String idRelacionado = relacionado == null ? null : (String) relacionado.get('id');
            if (EVENTOS_PAGO.contains(tipo)) {
                try {
                    sesion = StripeService.obtenerSesion(idRelacionado);
                } catch (Exception e) {
                    registrar(new Aviso_Pasarela__c(
                        Event_Id__c = eventoId,
                        Tipo__c = tipo,
                        Resultado__c = 'Rechazado',
                        Motivo__c = ('No se pudo consultar la sesión en Stripe: ' + e.getMessage()).abbreviate(255),
                        Recibido__c = recibido
                    ));
                    return new Respuesta(500, 'error'); // Stripe reintentará
                }
            }
        } else {
            Map<String, Object> data = (Map<String, Object>) evento.get('data');
            sesion = data == null ? null : (Map<String, Object>) data.get('object');
        }

        if (!EVENTOS_PAGO.contains(tipo) || sesion == null || String.valueOf(sesion.get('payment_status')) != 'paid') {
            registrar(new Aviso_Pasarela__c(
                Event_Id__c = eventoId,
                Tipo__c = tipo,
                Resultado__c = 'Ignorado',
                Motivo__c = 'Evento que no confirma un pago',
                Recibido__c = recibido
            ));
            return new Respuesta(200, 'ignorado');
        }

        String sesionId = (String) sesion.get('id');
        String token = (String) sesion.get('client_reference_id');
        List<Donacion__c> donaciones = [
            SELECT Id, Estado__c, Monto__c
            FROM Donacion__c
            WHERE (Stripe_Session_Id__c = :sesionId AND Stripe_Session_Id__c != NULL)
               OR (Token_Publico__c = :token AND Token_Publico__c != NULL)
            LIMIT 1
        ];
        if (donaciones.isEmpty()) {
            registrar(new Aviso_Pasarela__c(
                Event_Id__c = eventoId,
                Tipo__c = tipo,
                Resultado__c = 'Rechazado',
                Motivo__c = 'No existe una donación con esa referencia',
                Recibido__c = recibido
            ));
            return new Respuesta(200, 'sin-donacion');
        }
        Donacion__c d = donaciones[0];

        // ---------- 3. Idempotencia + 4. Actualización (todo o nada) ----------
        Savepoint sp = Database.setSavepoint();
        Aviso_Pasarela__c aviso = new Aviso_Pasarela__c(
            Event_Id__c = eventoId,
            Clave_Unica__c = eventoId,
            Tipo__c = tipo,
            Resultado__c = 'Aceptado',
            Recibido__c = recibido,
            Donacion__c = d.Id
        );
        Database.SaveResult sr = Database.insert(aviso, false);
        if (!sr.isSuccess()) {
            if (esDuplicado(sr)) {
                registrar(new Aviso_Pasarela__c(
                    Event_Id__c = eventoId,
                    Tipo__c = tipo,
                    Resultado__c = 'Duplicado',
                    Motivo__c = 'El evento ya se había procesado; no se modificó nada',
                    Recibido__c = recibido,
                    Donacion__c = d.Id
                ));
                return new Respuesta(200, 'duplicado');
            }
            return new Respuesta(500, 'error'); // Stripe reintentará
        }

        try {
            if (d.Estado__c == 'Pagada') {
                aviso.Motivo__c = 'La donación ya estaba pagada; sin cambios';
                update aviso;
                return new Respuesta(200, 'ya-pagada');
            }
            Decimal cobrado = sesion.get('amount_total') == null
                ? d.Monto__c
                : Decimal.valueOf(String.valueOf(sesion.get('amount_total'))) / 100;
            if (d.Monto__c != null && cobrado != d.Monto__c) {
                aviso.Motivo__c = ('Monto registrado ' + d.Monto__c + ' distinto al cobrado ' + cobrado + '; se registra lo cobrado').abbreviate(255);
                update aviso;
            }
            d.Monto__c = cobrado;
            d.Estado__c = 'Pagada';
            d.Confirmada_Por__c = 'Pasarela';
            d.Fecha_Pago__c = recibido;
            d.Stripe_Payment_Intent__c = (String) sesion.get('payment_intent');
            if (String.isNotBlank(sesionId)) {
                d.Stripe_Session_Id__c = sesionId;
            }
            update d;
            return new Respuesta(200, 'aceptado');
        } catch (Exception e) {
            Database.rollback(sp);
            registrar(new Aviso_Pasarela__c(
                Event_Id__c = eventoId,
                Tipo__c = tipo,
                Resultado__c = 'Rechazado',
                Motivo__c = ('Error al actualizar la donación: ' + e.getMessage()).abbreviate(255),
                Recibido__c = recibido,
                Donacion__c = d.Id
            ));
            return new Respuesta(500, 'error'); // Stripe reintentará; el reintento ya no será duplicado
        }
    }

    /** Devuelve null si la firma es válida; si no, el motivo del rechazo. */
    @TestVisible
    private static String verificarFirma(String payload, String encabezado, String secreto, Long ahora) {
        if (String.isBlank(secreto)) {
            return 'Secreto del webhook no configurado en la org';
        }
        if (String.isBlank(encabezado)) {
            return 'Falta el encabezado Stripe-Signature';
        }
        String t;
        List<String> firmas = new List<String>();
        for (String parte : encabezado.split(',')) {
            List<String> kv = parte.trim().split('=', 2);
            if (kv.size() != 2) {
                continue;
            }
            if (kv[0] == 't') {
                t = kv[1];
            } else if (kv[0] == 'v1') {
                firmas.add(kv[1]);
            }
        }
        if (t == null || firmas.isEmpty() || !t.isNumeric()) {
            return 'Encabezado Stripe-Signature mal formado';
        }
        Long marca = Long.valueOf(t);
        if (Math.abs(ahora - marca) > TOLERANCIA_SEGUNDOS) {
            return 'Marca de tiempo fuera de tolerancia (posible repetición)';
        }
        String esperada = EncodingUtil.convertToHex(
            Crypto.generateMac('hmacSHA256', Blob.valueOf(t + '.' + payload), Blob.valueOf(secreto))
        );
        for (String f : firmas) {
            if (igualesTiempoConstante(esperada, f)) {
                return null;
            }
        }
        return 'Firma inválida: el aviso no viene de Stripe';
    }

    private static Boolean igualesTiempoConstante(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) {
            return false;
        }
        Integer diff = 0;
        for (Integer i = 0; i < a.length(); i++) {
            diff |= a.charAt(i) ^ b.charAt(i);
        }
        return diff == 0;
    }

    private static Boolean esDuplicado(Database.SaveResult sr) {
        for (Database.Error e : sr.getErrors()) {
            if (e.getStatusCode() == StatusCode.DUPLICATE_VALUE) {
                return true;
            }
        }
        return false;
    }

    private static String idDeclarado(String payload) {
        try {
            Object id = ((Map<String, Object>) JSON.deserializeUntyped(payload)).get('id');
            return id == null ? null : ('(no verificado) ' + String.valueOf(id)).abbreviate(255);
        } catch (Exception e) {
            return null;
        }
    }

    private static void registrar(Aviso_Pasarela__c aviso) {
        Database.insert(aviso, false);
    }
}
