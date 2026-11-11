"""Agrega el campo Responsable al tablero y tarjetas de TAREAS (T-xx) con responsable propuesto.
Las historias HU-xx quedan con Responsable según quién hizo qué de verdad."""
import json, subprocess

GH = r'C:\Program Files\GitHub CLI\gh.exe'
OWNER, NUM = 'jimena-garcia', '1'

def gh(*a):
    r = subprocess.run([GH, *a], capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        raise SystemExit(r.stderr)
    return r.stdout

PID = json.loads(gh('project', 'view', NUM, '--owner', OWNER, '--format', 'json'))['id']
def campos():
    return {f['name']: f for f in json.loads(gh('project', 'field-list', NUM, '--owner', OWNER, '--format', 'json'))['fields']}
f = campos()
if 'Responsable' not in f:
    gh('project', 'field-create', NUM, '--owner', OWNER, '--name', 'Responsable', '--data-type', 'SINGLE_SELECT',
       '--single-select-options', 'Dilian,Jimena,Ambos')
    f = campos()
opt = lambda c, n: next(o['id'] for o in f[c]['options'] if o['name'] == n)

def editar(item, campo, texto=None, opcion=None):
    a = ['project', 'item-edit', '--id', item, '--project-id', PID, '--field-id', f[campo]['id']]
    a += ['--text', texto] if texto is not None else ['--single-select-option-id', opcion]
    gh(*a)

items = json.loads(gh('project', 'item-list', NUM, '--owner', OWNER, '--format', 'json', '--limit', '200'))['items']
por_titulo = {(i.get('title') or '').split(' · ')[0]: i for i in items}

# Historias: definición (Jimena) + implementación (Dilian) -> Ambos
for hid, i in por_titulo.items():
    if hid.startswith('HU-'):
        editar(i['id'], 'Responsable', opcion=opt('Responsable', 'Ambos'))

# (id, título, hito, responsable, estado o None, descripción)
TAREAS = [
    ('T-01', 'Historias de usuario y criterios de aceptación', 'Entrega 1', 'Jimena', 'Met',
     'Redacción de HU-01..HU-17 (docs/requisitos/historias_de_usuario.md).'),
    ('T-02', 'Repositorio, tablero de backlog y README de avance', 'Entrega 1', 'Jimena', 'Met',
     'Repo público, estructura inicial de docs y tablero de GitHub Projects.'),
    ('T-03', 'Video demo de 5 minutos (Entrega 1)', 'Entrega 1', 'Jimena', 'In Progress',
     'Muestra funcionando las historias cumplidas; enlace en el README.'),
    ('T-04', 'Implementación: sitio, Stripe, panel y seguridad', 'Entrega 1', 'Dilian', 'Met',
     'Ver docs/equipo/dilian.md y bitácora 1-17.'),
    ('T-05', 'Mensaje al profesor: correo del comprobante (R-01) y "Donante anónimo" (R-06)', 'Entrega 1', 'Dilian', 'In Progress',
     'Registrar la respuesta en docs/preguntas_y_reportes.md.'),
    ('T-06', 'Video demo Entrega 2: confirmación automática, aviso falso y aviso repetido', 'Entrega 2', 'Jimena', None,
     'RF-V3a y RF-V3b, según la guía.'),
    ('T-07', 'Pruebas de aceptación por historia con usuarios de cada rol', 'Entrega 2', 'Jimena', None,
     'Recorrer los criterios CA/CP de cada HU en el sitio real y registrar evidencia (capturas).'),
    ('T-08', 'Actualizar docs/seguridad.md para el aviso de la pasarela (E2)', 'Entrega 2', 'Jimena', None,
     'Sección 6 de la guía.'),
    ('T-09', 'Resolver o documentar el correo del comprobante (R-01)', 'Entrega 2', 'Dilian', None,
     'HU-02 CA2, HU-14 CA2.'),
    ('T-10', 'Identidad por campaña: imagen y logo (Fase C)', 'Entrega 2', 'Dilian', None, ''),
    ('T-11', 'Actualizaciones de campaña y estado finalizada (Fase D)', 'Entrega 2', 'Dilian', None, ''),
    ('T-12', 'Preparar la defensa oral (demo en vivo y preguntas)', 'Entrega 2', 'Ambos', None, '18 nov, presencial.'),
]
for tid, titulo, hito, resp, estado, desc in TAREAS:
    if tid in por_titulo:
        print('ya existe', tid)
        continue
    item = json.loads(gh('project', 'item-create', NUM, '--owner', OWNER, '--title', f'{tid} · {titulo}',
                         '--body', desc or titulo, '--format', 'json'))['id']
    editar(item, 'ID', texto=tid)
    editar(item, 'Hito', opcion=opt('Hito', hito))
    editar(item, 'Responsable', opcion=opt('Responsable', resp))
    if estado:
        editar(item, 'Status', opcion=opt('Status', estado))
    print('creada', tid, resp)
print('listo')
