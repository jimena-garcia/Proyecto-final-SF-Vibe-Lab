// Campañas secundarias FICTICIAS (montos inventados, como pide la guía) para que la portada
// muestre "Recomendadas" y "Explorar". Todas dentro del alcance: el viaje a Mexico Dreamin.
// Staff puede editarlas o desactivarlas en Salesforce. Ejecutar:
//   sf apex run -f scripts/apex/campanas_secundarias.apex
Set<String> nombres = new Set<String>{ 'Viáticos en la CDMX', 'Seguro de viaje' };
Map<String, Campana__c> existentes = new Map<String, Campana__c>();
for (Campana__c c : [SELECT Id, Name FROM Campana__c WHERE Name IN :nombres]) {
    existentes.put(c.Name, c);
}
Campana__c viaticos = existentes.containsKey('Viáticos en la CDMX') ? existentes.get('Viáticos en la CDMX') : new Campana__c(Name = 'Viáticos en la CDMX');
viaticos.Meta__c = 15000;
viaticos.Activa__c = true;
viaticos.Ilustracion__c = 'Hospedaje';
viaticos.Montos_Sugeridos__c = '150;300;600';
viaticos.Descripcion__c = 'Comidas y transporte local para los alumnos durante los días del evento en la Ciudad de México.';

Campana__c seguro = existentes.containsKey('Seguro de viaje') ? existentes.get('Seguro de viaje') : new Campana__c(Name = 'Seguro de viaje');
seguro.Meta__c = 8000;
seguro.Activa__c = true;
seguro.Ilustracion__c = 'Boletos';
seguro.Montos_Sugeridos__c = '100;250;500';
seguro.Descripcion__c = 'Seguro de gastos médicos para cada alumno durante el viaje a Mexico Dreamin.';

upsert new List<Campana__c>{ viaticos, seguro };
System.debug('SECUNDARIAS listas');
