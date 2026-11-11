"""Llena el tablero de GitHub Projects (users/jimena-garcia/projects/1) con las historias del backlog.
Campos: ID, RF, Story, Evidence (texto), Status (Met / In Progress / Not met) y los que pide la guía:
Hito (Entrega 1 / Entrega 2) y Acceptance criteria (texto). Idempotente: no duplica tarjetas por ID."""
import json, re, subprocess, sys

GH = r'C:\Program Files\GitHub CLI\gh.exe'
OWNER, NUM = 'jimena-garcia', '1'
HU_MD = sys.argv[1]

def gh(*args):
    r = subprocess.run([GH, *args], capture_output=True, text=True, encoding='utf-8')
    if r.returncode != 0:
        raise SystemExit(f'gh {" ".join(args[:3])}… falló: {r.stderr.strip()}')
    return r.stdout

proj = json.loads(gh('project', 'view', NUM, '--owner', OWNER, '--format', 'json'))
PID = proj['id']

def campos():
    return {f['name']: f for f in json.loads(gh('project', 'field-list', NUM, '--owner', OWNER, '--format', 'json'))['fields']}

f = campos()
if 'Hito' not in f:
    gh('project', 'field-create', NUM, '--owner', OWNER, '--name', 'Hito', '--data-type', 'SINGLE_SELECT', '--single-select-options', 'Entrega 1,Entrega 2')
if 'Acceptance criteria' not in f:
    gh('project', 'field-create', NUM, '--owner', OWNER, '--name', 'Acceptance criteria', '--data-type', 'TEXT')
f = campos()
opt = lambda campo, nombre: next(o['id'] for o in f[campo]['options'] if o['name'] == nombre)

# ---- Historias desde docs/historias_de_usuario.md ----
texto = open(HU_MD, encoding='utf-8').read()
bloques = re.split(r'\n### ', texto)[1:]
historias = []
for b in bloques:
    cab = b.split('\n', 1)[0]
    m = re.match(r'(HU-\d+) · (RF-[A-Z0-9a-z]+) · (.+)', cab)
    if not m:
        continue
    hid, rf, titulo = m.groups()
    hist = re.search(r'\*\*Historia(?: original[^*]*)?:\*\*\s*(.+)', b)
    hist = hist.group(1).strip() if hist else ''
    if not hist:
        h2 = re.search(r'Historia original \(se conserva por trazabilidad\):\*\*\s*(.+?)(?:\n|$)', b)
        hist = h2.group(1).strip() if h2 else titulo
    criterios = [re.sub(r'\s+', ' ', c).strip().replace('\\', '') for c in re.findall(r'^- ((?:CA|CP)\d.+?)$', b, re.M)]
    historias.append((hid, rf, titulo.replace('\\', ''), hist.replace('\\', ''), criterios))

ESTADO = {  # igual que la tabla del README
    'HU-02': ('Not met', 'CA1, CA3 y CA4 cumplen. CA2: el comprobante se genera sin nombre (test), pero el correo no llega al buzón; reportado al profesor (R-01).'),
    'HU-10': ('Not met', 'Retirada por el cliente en clase (sesión de discovery). Fuera de alcance; se conserva por trazabilidad.'),
    'HU-14': ('Not met', 'CA1 cumple (confirmación automática). CA2 depende del correo del comprobante (R-01).'),
}
EVIDENCIA = {
    'HU-01': 'Sitio público: 3 campañas activas con meta y avance; solo suman pagadas.',
    'HU-03': 'Donación Pendiente antes de abrir Stripe; client_reference_id = token público.',
    'HU-04': 'Página de gracias: pendiente / confirmado / cancelado.',
    'HU-05': 'Reconocimiento: nombre y monto solo en "con crédito" pagadas.',
    'HU-06': 'Validación RFC patrón SAT (sitio, Apex, validation rule); sin CFDI.',
    'HU-07': 'Panel → Donaciones → filtro "Solicitan factura" (nombre y RFC).',
    'HU-08': 'Panel → Campañas: crear/editar meta y metas; se refleja en el sitio.',
    'HU-09': 'Panel → Donaciones: estado, monto, modalidad y campaña.',
    'HU-11': 'Sitio sin login.',
    'HU-12': 'docs/seguridad.md: 10 pruebas de lectura y modificación + scripts/prueba_seguridad.py.',
    'HU-13': 'Stripe cobra exactamente el monto capturado.',
    'HU-15': 'Panel: "Confirmada por Stripe" y Avisos rechazados con fecha y motivo.',
    'HU-16': 'Aviso real de Stripe → donación Pagada sin intervención.',
    'HU-17': 'Aviso falso → Rechazado; repetido → Duplicado; un solo comprobante (tests).',
}
ENTREGA2 = {'HU-13', 'HU-14', 'HU-15', 'HU-16', 'HU-17'}

existentes = json.loads(gh('project', 'item-list', NUM, '--owner', OWNER, '--format', 'json', '--limit', '200'))['items']
por_id = {i.get('iD') or i.get('id_') or '': i for i in existentes}
ya = {(i.get('title') or '').split(' · ')[0] for i in existentes}

if len(sys.argv) > 2 and sys.argv[2] == '--vista-previa':
    for hid, rf, titulo, hist, crit in historias:
        st = ESTADO.get(hid, ('Met', ''))[0]
        print(f"{hid} | {rf} | {'Entrega 2' if hid in ENTREGA2 else 'Entrega 1'} | {st} | {titulo} | {len(crit)} criterios")
    sys.exit()

def editar(item, campo, **valor):
    args = ['project', 'item-edit', '--id', item, '--project-id', PID, '--field-id', f[campo]['id']]
    if 'texto' in valor:
        args += ['--text', valor['texto'][:1000]]
    else:
        args += ['--single-select-option-id', valor['opcion']]
    gh(*args)

for hid, rf, titulo, hist, crit in historias:
    if hid in ya:
        print('ya existe', hid)
        continue
    estado, nota = ESTADO.get(hid, ('Met', ''))
    evid = nota or EVIDENCIA.get(hid, '')
    cuerpo = f"**Historia:** {hist}\n\n**Acceptance criteria**\n" + '\n'.join(f'- {c}' for c in crit) + f"\n\n**Evidencia:** {evid}"
    item = json.loads(gh('project', 'item-create', NUM, '--owner', OWNER, '--title', f'{hid} · {titulo}', '--body', cuerpo, '--format', 'json'))['id']
    editar(item, 'ID', texto=hid)
    editar(item, 'RF', texto=rf)
    editar(item, 'Story', texto=hist)
    editar(item, 'Acceptance criteria', texto=' | '.join(crit))
    editar(item, 'Evidence', texto=evid)
    editar(item, 'Hito', opcion=opt('Hito', 'Entrega 2' if hid in ENTREGA2 else 'Entrega 1'))
    editar(item, 'Status', opcion=opt('Status', estado))
    print('creada', hid, estado)
print('listo')
