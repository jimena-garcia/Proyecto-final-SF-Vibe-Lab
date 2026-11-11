// Migración a roles: quien ya tenía acceso al panel (Staff_Donaciones) y no tiene rol
// recibe "Ambos" para no perder funciones, y se registra en Miembro_Equipo__c.
// El dueño puede cambiar el rol después en Panel → Equipo. Ejecutar:
//   sf apex run -f scripts/apex/backfill_equipo.apex
Id duenoId = UserInfo.getUserId();
Map<String, Id> ps = new Map<String, Id>();
for (PermissionSet p : [SELECT Id, Name FROM PermissionSet WHERE Name IN ('Rol_Coordinacion', 'Rol_Tesoreria')]) {
    ps.put(p.Name, p.Id);
}
Set<Id> conRol = new Set<Id>();
for (PermissionSetAssignment a : [SELECT AssigneeId FROM PermissionSetAssignment WHERE PermissionSet.Name IN ('Rol_Coordinacion', 'Rol_Tesoreria')]) {
    conRol.add(a.AssigneeId);
}
List<PermissionSetAssignment> nuevas = new List<PermissionSetAssignment>();
List<User> migrados = new List<User>();
for (User u : [SELECT Id, Name, Email FROM User WHERE Id IN (SELECT AssigneeId FROM PermissionSetAssignment WHERE PermissionSet.Name = 'Staff_Donaciones') AND Id != :duenoId]) {
    if (!conRol.contains(u.Id)) {
        nuevas.add(new PermissionSetAssignment(AssigneeId = u.Id, PermissionSetId = ps.get('Rol_Coordinacion')));
        nuevas.add(new PermissionSetAssignment(AssigneeId = u.Id, PermissionSetId = ps.get('Rol_Tesoreria')));
    }
    migrados.add(u);
}
insert nuevas;
// Rol real de cada persona (los recién migrados quedan en "Ambos").
Map<Id, Set<String>> roles = new Map<Id, Set<String>>();
for (PermissionSetAssignment a : [SELECT AssigneeId, PermissionSet.Name FROM PermissionSetAssignment WHERE PermissionSet.Name IN ('Rol_Coordinacion', 'Rol_Tesoreria')]) {
    if (!roles.containsKey(a.AssigneeId)) roles.put(a.AssigneeId, new Set<String>());
    roles.get(a.AssigneeId).add(a.PermissionSet.Name);
}
for (User u : migrados) {
    Set<String> r = roles.containsKey(u.Id) ? roles.get(u.Id) : new Set<String>();
    String rol = r.size() == 2 ? 'Ambos' : r.contains('Rol_Coordinacion') ? 'Coordinacion' : 'Tesoreria';
    EquipoController.sincronizarMiembro(u.Id, u.Name, u.Email, rol);
}
System.debug('BACKFILL personas=' + migrados.size() + ' asignaciones=' + nuevas.size());
