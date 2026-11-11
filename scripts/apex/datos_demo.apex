// Campañas ficticias para la demo (montos inventados). Ejecutar:
//   sf apex run -f scripts/apex/datos_demo.apex
List<Campana__c> cs = new List<Campana__c>{
    new Campana__c(Name = 'Boletos para Mexico Dreamin 2026', Meta__c = 30000, Activa__c = true,
        Montos_Sugeridos__c = '200;500;1000',
        Descripcion__c = 'Cubre la entrada al evento del 20 de noviembre de 2026 en Salesforce México, CDMX.'),
    new Campana__c(Name = 'Transporte Mérida–CDMX', Meta__c = 45000, Activa__c = true,
        Montos_Sugeridos__c = '500;1000;2500',
        Descripcion__c = 'Vuelo redondo para alumnos del programa SF Vibe Lab.'),
    new Campana__c(Name = 'Hospedaje en CDMX', Meta__c = 25000, Activa__c = true,
        Montos_Sugeridos__c = '300;800;1500',
        Descripcion__c = 'Dos noches de hospedaje cerca de la sede del evento.')
};
insert cs;
System.debug('Campañas creadas: ' + cs.size());
