// Campaña principal tipo Kickstarter: "Mexico Dreamin 2026" con 3 metas escalonadas
// (acumulativas). Montos FICTICIOS, como pide la guía; staff puede cambiarlos en Salesforce.
// Reutiliza la campaña de boletos (conserva su historial de donaciones) y desactiva las demás.
// Ejecutar: sf apex run -f scripts/apex/campana_principal.apex
List<Campana__c> existentes = [SELECT Id, Name FROM Campana__c WHERE Name LIKE 'Boletos%' OR Name = 'Mexico Dreamin 2026' LIMIT 1];
Campana__c c = existentes.isEmpty() ? new Campana__c() : existentes[0];
c.Name = 'Mexico Dreamin 2026';
c.Meta__c = 100000;
c.Activa__c = true;
c.Destacada__c = true;
c.Ilustracion__c = 'General';
c.Montos_Sugeridos__c = '200;500;1000';
c.Descripcion__c = 'Queremos que alumnos del programa SF Vibe Lab (UADY) lleguen a Mexico Dreamin, el evento de la comunidad Salesforce del 20 de noviembre en la Ciudad de México.\n\nEl evento vale la pena por lo técnico y, sobre todo, por la red de contactos. El boleto, el viaje y la estancia no los puede pagar cualquiera: cada meta que alcancemos cubre un tramo más del viaje.';
upsert c;

delete [SELECT Id FROM Hito__c WHERE Campana__c = :c.Id];
insert new List<Hito__c>{
    new Hito__c(Campana__c = c.Id, Name = 'Boletos para el grupo', Monto__c = 30000,
        Descripcion__c = 'Cubre la entrada al evento para los alumnos participantes.'),
    new Hito__c(Campana__c = c.Id, Name = 'Transporte Mérida–CDMX', Monto__c = 75000,
        Descripcion__c = 'Suma el viaje redondo a la Ciudad de México.'),
    new Hito__c(Campana__c = c.Id, Name = 'Hospedaje en CDMX', Monto__c = 100000,
        Descripcion__c = 'Completa el viaje: estancia cerca de la sede del evento.')
};

List<Campana__c> otras = [SELECT Id FROM Campana__c WHERE Id != :c.Id AND Activa__c = TRUE];
for (Campana__c o : otras) { o.Activa__c = false; o.Destacada__c = false; }
update otras;
System.debug('PRINCIPAL ' + c.Id + ' | otras desactivadas: ' + otras.size());
