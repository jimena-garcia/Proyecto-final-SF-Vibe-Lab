/**
 * Reglas al guardar una Donación (bulkificado, sin SOQL/DML dentro de ciclos):
 *  - Al pasar a Pagada: Fecha_Pago, Confirmada_Por = Manual si nadie lo indicó (HU-15 CA1),
 *    y se marca Comprobante_Enviado__c ANTES de enviar, para que un aviso repetido o una
 *    segunda edición nunca envíen un segundo comprobante (HU-17 CA2).
 *  - Después de actualizar: envía los comprobantes marcados en esta transacción.
 * Las donaciones siempre nacen Pendientes (sitio público); solo un UPDATE las vuelve Pagadas.
 */
public without sharing class DonacionTriggerHandler {
    private static Set<Id> porEnviar = new Set<Id>();

    public static void antesDeGuardar(List<Donacion__c> nuevas, Map<Id, Donacion__c> anteriores) {
        for (Donacion__c d : nuevas) {
            Donacion__c ant = anteriores == null ? null : anteriores.get(d.Id);
            Boolean pasaAPagada = d.Estado__c == 'Pagada' && (ant == null || ant.Estado__c != 'Pagada');
            if (!pasaAPagada) {
                continue;
            }
            if (d.Fecha_Pago__c == null) {
                d.Fecha_Pago__c = Datetime.now();
            }
            if (String.isBlank(d.Confirmada_Por__c)) {
                d.Confirmada_Por__c = 'Manual';
            }
            if (ant != null && !d.Comprobante_Enviado__c && String.isNotBlank(d.Email__c)) {
                d.Comprobante_Enviado__c = true;
                porEnviar.add(d.Id);
            }
        }
    }

    public static void despuesDeGuardar(List<Donacion__c> nuevas) {
        List<Donacion__c> enviar = new List<Donacion__c>();
        for (Donacion__c d : nuevas) {
            if (porEnviar.remove(d.Id)) {
                enviar.add(d);
            }
        }
        if (!enviar.isEmpty()) {
            ComprobanteService.enviar(enviar);
        }
    }
}
