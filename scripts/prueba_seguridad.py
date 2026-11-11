"""Prueba de seguridad del visitante sin login (HU-12 / RF-V2). Sin sesión ni cookies de Salesforce.
Uso: python -I prueba_seguridad.py <IdDonacionAjena> <TokenDonacionPagadaAjena> <IdCampana>"""
import json, re, sys, urllib.request, urllib.error

SITE = 'https://orgfarm-0cda6e4c00-dev-ed.develop.my.salesforce-sites.com'
don_id, token_ajeno, camp_id = sys.argv[1:4]

def http(metodo, url, cuerpo=None, headers=None):
    req = urllib.request.Request(url, data=cuerpo, method=metodo, headers=headers or {})
    try:
        r = urllib.request.urlopen(req)
        return r.status, r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'replace')

def remoting(metodo, *args):
    import http.cookiejar
    cj = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    html = op.open(SITE + '/').read().decode('utf-8')
    cfg = json.loads(re.search(r'RemotingProviderImpl\((\{.*?\})\)\);', html, re.S).group(1))
    m = next(x for x in cfg['actions']['PortalDonacionesController']['ms'] if x['name'] == metodo)
    body = {'action': 'PortalDonacionesController', 'method': metodo, 'data': list(args) or None, 'type': 'rpc', 'tid': 2,
            'ctx': {'csrf': m['csrf'], 'vid': cfg['vf']['vid'], 'ns': '', 'ver': m['ver'], 'authorization': m['authorization']}}
    req = urllib.request.Request(SITE + '/apexremote', data=json.dumps(body).encode(), method='POST', headers={
        'Content-Type': 'application/json', 'Referer': SITE + '/', 'X-Requested-With': 'XMLHttpRequest', 'X-User-Agent': 'Visualforce-Remoting'})
    return json.loads(op.open(req).read().decode('utf-8'))[0].get('result')

def corto(s, n=110):
    return re.sub(r'\s+', ' ', s)[:n]

res = {}
c, b = http('GET', f'{SITE}/services/data/v66.0/sobjects/Donacion__c/{don_id}')
res['L2 GET registro Donacion__c por REST'] = f'HTTP {c} · {corto(b)}'
c, b = http('GET', f'{SITE}/services/data/v66.0/query?q=SELECT+Email__c,RFC__c+FROM+Donacion__c')
res['L3 query SOQL por REST'] = f'HTTP {c} · {corto(b)}'
r = remoting('getEstado', '0123456789abcdef0123456789abcdef')
res['L4 remoting getEstado con token inventado'] = f'resultado = {r}'
r = remoting('getEstado', token_ajeno)
res['L5 remoting getEstado con token real ajeno'] = f'campos devueltos = {sorted((r or {}).keys())}'
r = remoting('getCampanas')
texto = json.dumps(r, ensure_ascii=False)
res['L5b getCampanas no expone correo ni RFC'] = f"contiene '@': {'@' in texto} · contiene 'rfc': {'rfc' in texto.lower()} · campos de donantes: {sorted(set(k for c in r for d in c.get('donantes', []) for k in d))}"
c, b = http('POST', f'{SITE}/s/sfsites/aura', b'message=%7B%7D', {'Content-Type': 'application/x-www-form-urlencoded'})
res['L6 endpoint Aura del sitio'] = f'HTTP {c} · {corto(b, 90)}'
c, b = http('PATCH', f'{SITE}/services/data/v66.0/sobjects/Donacion__c/{don_id}', b'{"Estado__c":"Pagada"}', {'Content-Type': 'application/json'})
res['M1 PATCH Donacion__c por REST'] = f'HTTP {c} · {corto(b)}'
datos = json.dumps({'campanaId': camp_id, 'modalidad': 'Anonima', 'email': 'prueba.seguridad@example.com', 'monto': 50,
                    'Estado__c': 'Pagada', 'Id': don_id, 'estado': 'Pagada'})
r = remoting('crearDonacion', datos)
res['M2 crearDonacion con campos extra (Estado/Id)'] = f"ok={r.get('ok')} token_nuevo={'si' if r.get('token') else 'no'}"
res['_token_m2'] = r.get('token')
r = remoting('cancelar', token_ajeno)
res['M4 cancelar donación PAGADA ajena'] = f"respuesta ok={r.get('ok')} (se verifica el estado en Salesforce)"
c, b = http('POST', f'{SITE}/services/apexrest/stripe/webhook', b'{"id":"evt_prueba_seguridad","type":"checkout.session.completed"}',
            {'Content-Type': 'application/json', 'Stripe-Signature': 't=1,v1=abc'})
res['M3 aviso falso al webhook'] = f'HTTP {c} · {corto(b)}'
print(json.dumps(res, ensure_ascii=False, indent=1))
