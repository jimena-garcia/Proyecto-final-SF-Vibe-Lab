// Campañas secundarias FICTICIAS (datos inventados, como pide la guía): causas estudiantiles
// DISTINTAS de Mexico Dreamin, para que el donante no vea varias campañas del mismo viaje.
// Decisión del equipo (17 nov 2026, R-07). Viáticos y seguro de viaje ahora son parte de la
// meta final de Mexico Dreamin (ver campana_principal.apex).
// Reutiliza las campañas viejas del viaje si existen (no tenían donaciones). Idempotente.
// Ejecutar después de campana_principal.apex:
//   sf apex run -f scripts/apex/campanas_secundarias.apex
Map<String, String> anterior = new Map<String, String>{
    'Certificaciones Salesforce' => 'Viáticos en la CDMX',
    'Comunidad Salesforce en Mérida' => 'Seguro de viaje',
    'Becas de conectividad' => 'Transporte Mérida–CDMX'
};
Map<String, Campana__c> porNombre = new Map<String, Campana__c>();
Set<String> buscar = new Set<String>(anterior.keySet());
buscar.addAll(anterior.values());
for (Campana__c c : [SELECT Id, Name FROM Campana__c WHERE Name IN :buscar]) {
    porNombre.put(c.Name, c);
}
Map<String, Campana__c> datos = new Map<String, Campana__c>{
    'Certificaciones Salesforce' => new Campana__c(
            Name = 'Certificaciones Salesforce',
            Descripcion__c = 'Ayuda a que alumnos de SF Vibe Lab presenten su primera certificación oficial de Salesforce.\n\nYa terminaron su ruta en Trailhead y practicaron en organizaciones de prueba, pero el examen cuesta cerca de 200 dólares. Una certificación es lo primero que revisan quienes contratan talento Salesforce: con tu aporte, el esfuerzo de un semestre se convierte en una credencial que abre puertas.',
            Meta__c = 36000, Activa__c = true, Destacada__c = false,
            Ilustracion__c = 'Certificacion', Imagen_URL__c = null, Imagen_Alt__c = null,
            Montos_Sugeridos__c = '300;600;1200',
            Beneficiarios__c = 'Alumnos de SF Vibe Lab que ya completaron su ruta de Trailhead y están listos para certificarse',
            Impacto__c = 'El pago del examen oficial de certificación\nUn simulador de práctica antes del examen\nUna credencial verificable para su currículum',
            Mensaje_Gracias__c = 'Gracias por apostar por nuestra preparación. Esta certificación es el primer paso de nuestra carrera en el ecosistema Salesforce. — Alumnos de SF Vibe Lab'
    ),
    'Comunidad Salesforce en Mérida' => new Campana__c(
            Name = 'Comunidad Salesforce en Mérida',
            Descripcion__c = 'Queremos que la comunidad Salesforce también se viva en Mérida, no solo en los grandes eventos.\n\nOrganizamos meetups y un hackathon abiertos a estudiantes de la UADY y de otras escuelas, con mentores de la industria. Hace falta un espacio, comida para una jornada larga y premios que motiven a los equipos. Tu aporte hace que aprender en comunidad no dependa de viajar.',
            Meta__c = 20000, Activa__c = true, Destacada__c = false,
            Ilustracion__c = 'Comunidad', Imagen_URL__c = null, Imagen_Alt__c = null,
            Montos_Sugeridos__c = '150;400;800',
            Beneficiarios__c = 'Estudiantes de Mérida que quieren aprender Salesforce en comunidad, sin tener que viajar',
            Impacto__c = 'Un espacio para los meetups mensuales\nComida y café para el hackathon de un día\nPremios y mentorías para los equipos ganadores',
            Mensaje_Gracias__c = 'Gracias por ayudarnos a construir comunidad aquí, en Mérida. Nos vemos en el próximo meetup. — Comunidad SF Vibe Lab'
    ),
    'Becas de conectividad' => new Campana__c(
            Name = 'Becas de conectividad',
            Descripcion__c = 'Algunos alumnos del programa estudian desde comunidades del interior de Yucatán con internet lento o compartido.\n\nPracticar en Trailhead, entrar a las sesiones en vivo y entregar proyectos necesita una conexión estable. Con esta beca cubrimos su internet en casa durante el semestre para que la distancia no decida quién termina el programa.',
            Meta__c = 18000, Activa__c = true, Destacada__c = false,
            Ilustracion__c = 'Conectividad', Imagen_URL__c = null, Imagen_Alt__c = null,
            Montos_Sugeridos__c = '100;300;600',
            Beneficiarios__c = 'Alumnos del programa que estudian desde lugares con mala conexión a internet',
            Impacto__c = 'Internet estable en casa durante el semestre\nEntrar sin cortes a las sesiones en vivo\nPracticar y entregar sus proyectos a tiempo',
            Mensaje_Gracias__c = 'Gracias por conectarnos. Ahora podemos estudiar desde casa sin perder ninguna clase. — Alumnos de SF Vibe Lab'
    )
};
for (String nombre : datos.keySet()) {
    Campana__c existente = porNombre.containsKey(nombre) ? porNombre.get(nombre) : porNombre.get(anterior.get(nombre));
    Campana__c c = datos.get(nombre);
    c.Name = nombre;
    if (existente != null) {
        c.Id = existente.Id;
    }
}
upsert datos.values();

Map<String, Id> idPorNombre = new Map<String, Id>();
for (Campana__c c : datos.values()) {
    idPorNombre.put(c.Name, c.Id);
}
delete [SELECT Id FROM Hito__c WHERE Campana__c IN :idPorNombre.values()];
insert new List<Hito__c>{
    new Hito__c(Campana__c = idPorNombre.get('Certificaciones Salesforce'), Name = 'Primeras 4 certificaciones', Monto__c = 14400, Descripcion__c = 'Cubre el examen de los cuatro alumnos más avanzados.'),
    new Hito__c(Campana__c = idPorNombre.get('Certificaciones Salesforce'), Name = '7 certificaciones', Monto__c = 25200, Descripcion__c = 'Suma a tres alumnos más y su simulador de práctica.'),
    new Hito__c(Campana__c = idPorNombre.get('Certificaciones Salesforce'), Name = '10 certificaciones', Monto__c = 36000, Descripcion__c = 'Todo el grupo listo para certificarse.'),
    new Hito__c(Campana__c = idPorNombre.get('Comunidad Salesforce en Mérida'), Name = 'Meetups del semestre', Monto__c = 6000, Descripcion__c = 'Espacio y café para los meetups mensuales.'),
    new Hito__c(Campana__c = idPorNombre.get('Comunidad Salesforce en Mérida'), Name = 'Hackathon de un día', Monto__c = 14000, Descripcion__c = 'Sede, comida y conexión para una jornada completa.'),
    new Hito__c(Campana__c = idPorNombre.get('Comunidad Salesforce en Mérida'), Name = 'Premios y mentorías', Monto__c = 20000, Descripcion__c = 'Premios para los equipos y sesiones con mentores de la industria.'),
    new Hito__c(Campana__c = idPorNombre.get('Becas de conectividad'), Name = '3 alumnos conectados', Monto__c = 9000, Descripcion__c = 'Internet en casa durante el semestre para tres alumnos.'),
    new Hito__c(Campana__c = idPorNombre.get('Becas de conectividad'), Name = '6 alumnos conectados', Monto__c = 18000, Descripcion__c = 'Todos los alumnos que lo necesitan, conectados.')
};
System.debug('SECUNDARIAS listas: ' + datos.size());
