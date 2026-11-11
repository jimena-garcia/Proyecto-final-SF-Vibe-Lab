trigger DonacionTrigger on Donacion__c (before insert, before update, after insert, after update) {
    if (Trigger.isBefore) {
        DonacionTriggerHandler.antesDeGuardar(Trigger.new, Trigger.oldMap);
    } else {
        DonacionTriggerHandler.despuesDeGuardar(Trigger.new);
    }
}
