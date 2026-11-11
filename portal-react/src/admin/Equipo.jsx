import { useState } from 'react';
import api from './api.js';
import { Cabecera, EstadoCarga, fecha, useCarga } from './comun.jsx';
import { Alerta, Boton } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';

export const ROLES = [
  { valor: 'coordinacion', titulo: 'Coordinación', puede: 'Crea y edita campañas y sus metas (HU-08). Ve el avance, no los datos de donantes.' },
  { valor: 'tesoreria', titulo: 'Tesorería', puede: 'Ve todas las donaciones con correo y RFC, facturas por atender y avisos de Stripe (HU-07, HU-09, HU-15). Campañas solo lectura.' },
  { valor: 'ambos', titulo: 'Coordinación y tesorería', puede: 'Todo lo anterior.' }
];
const tituloRol = (r) => ROLES.find((x) => x.valor === r)?.titulo || 'Sin rol';

/**
 * Alta de personas del equipo (solo para quien administra la org).
 * Cada persona entra con su correo y la contraseña que se capture aquí.
 */
export default function Equipo() {
  const [estado, recargar] = useCarga(() => api.getEquipo(), []);
  const [datos, setDatos] = useState({ nombre: '', apellido: '', correo: '', password: '', rol: '' });
  const [verPass, setVerPass] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const eq = estado.datos;

  const reglas = [
    { ok: datos.password.length >= 8, texto: 'Al menos 8 caracteres' },
    { ok: /[A-Za-z]/.test(datos.password) && /\d/.test(datos.password), texto: 'Letras y números' },
    { ok: datos.password && !datos.password.toLowerCase().includes(datos.correo.split('@')[0].toLowerCase() || '\u0000'), texto: 'Que no contenga el correo' }
  ];
  const listo = datos.nombre.trim() && datos.apellido.trim() && datos.rol && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(datos.correo) && reglas.every((r) => r.ok);
  const set = (k) => (e) => setDatos((d) => ({ ...d, [k]: e.target.value }));

  async function alta(e) {
    e.preventDefault();
    if (!listo) return;
    setEnviando(true);
    setResultado(null);
    try {
      const r = await api.darDeAlta(datos);
      setResultado({ ...r, password: r.ok ? datos.password : null, nombre: datos.nombre });
      if (r.ok) {
        setDatos({ nombre: '', apellido: '', correo: '', password: '', rol: '' });
        recargar();
      }
    } catch (err) {
      setResultado({ ok: false, mensaje: err.message });
    } finally {
      setEnviando(false);
    }
  }

  async function cambiarRol(p, rol) {
    if (rol === p.rol) return;
    const r = await api.cambiarRol(p.id, rol);
    if (!r.ok) window.alert(r.mensaje);
    recargar();
  }

  async function desactivar(p) {
    if (!window.confirm(`¿Desactivar a ${p.nombre}? Ya no podrá entrar al panel.`)) return;
    const r = await api.desactivar(p.id);
    if (!r.ok) window.alert(r.mensaje);
    recargar();
  }

  return (
    <>
      <Cabecera titulo="Equipo" descripcion="Da de alta a coordinación y tesorería, asigna su rol y compárteles su acceso. Cada persona entra con su correo y su contraseña." />
      <EstadoCarga estado={estado} reintentar={recargar}>
        {eq && (
          <div className="adm-form">
            <div className="adm-form__campos">
              <form className="adm-grupo" onSubmit={alta} noValidate>
                <h2 className="adm-grupo__titulo">Nueva persona</h2>
                <div className="adm-dos">
                  <div className="campo">
                    <label htmlFor="e-nombre">Nombre</label>
                    <input id="e-nombre" className="input" value={datos.nombre} onChange={set('nombre')} autoComplete="off" />
                  </div>
                  <div className="campo">
                    <label htmlFor="e-apellido">Apellido</label>
                    <input id="e-apellido" className="input" value={datos.apellido} onChange={set('apellido')} autoComplete="off" />
                  </div>
                </div>
                <div className="campo">
                  <label htmlFor="e-correo">Correo (con él entrará)</label>
                  <input id="e-correo" className="input" type="email" value={datos.correo} onChange={set('correo')} autoComplete="off" />
                </div>
                <div className="campo">
                  <label htmlFor="e-pass">Contraseña</label>
                  <div className="adm-pass">
                    <input id="e-pass" className="input" type={verPass ? 'text' : 'password'} value={datos.password} onChange={set('password')} autoComplete="new-password" aria-describedby="e-pass-reglas" />
                    <button type="button" className="btn btn--texto" onClick={() => setVerPass(!verPass)}>
                      {verPass ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  <ul className="adm-reglas" id="e-pass-reglas">
                    {reglas.map((r) => (
                      <li key={r.texto} className={r.ok ? 'ok' : ''}>
                        <Icono nombre={r.ok ? 'check' : 'info'} tam={14} /> {r.texto}
                      </li>
                    ))}
                  </ul>
                </div>
                <fieldset className="paso" style={{ marginTop: 16 }}>
                  <legend className="campo__label">Rol</legend>
                  <div className="opciones" style={{ marginTop: 8 }}>
                    {ROLES.map((r) => (
                      <label key={r.valor} className={`opcion ${datos.rol === r.valor ? 'opcion--activa' : ''}`}>
                        <input type="radio" name="rol" value={r.valor} checked={datos.rol === r.valor} onChange={set('rol')} />
                        <span className="opcion__radio" aria-hidden="true" />
                        <span className="opcion__titulo">{r.titulo}</span>
                        <span className="opcion__publico">{r.puede}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <p className="campo__ayuda" style={{ marginTop: 12 }}>
                  Licencias disponibles: {eq.licenciasLibres}. Cada persona usa una. Solo tú puedes dar de alta personas y cambiar roles.
                </p>
                <Boton type="submit" cargando={enviando} disabled={!listo || eq.licenciasLibres <= 0} style={{ marginTop: 16 }}>
                  Dar de alta
                </Boton>

                {resultado && !resultado.ok && (
                  <Alerta tipo="error" titulo="No se pudo dar de alta">
                    {resultado.mensaje}
                  </Alerta>
                )}
                {resultado?.ok && <Credenciales r={resultado} />}
              </form>
            </div>

            <aside className="adm-form__lateral">
              <div className="panel">
                <h2 className="adm-grupo__titulo">Personas con acceso</h2>
                <ul className="adm-equipo">
                  {eq.personas.map((p) => (
                    <li key={p.id}>
                      <div>
                        <p className="adm-enlace-fuerte">
                          {p.nombre} {p.esTu && <span className="adm-texto-2">(tú)</span>}
                        </p>
                        <p className="adm-texto-2">{p.usuario}</p>
                        <p className="adm-texto-2">{p.activo ? `Último acceso: ${fecha(p.ultimoAcceso)}` : 'Desactivado'}</p>
                        {p.esTu ? (
                          <p className="adm-texto-2">Administración (todo, incluido el equipo)</p>
                        ) : (
                          p.activo && (
                            <label className="adm-rol">
                              <span className="sr-only">Rol de {p.nombre}</span>
                              <select className="input adm-rol__select" value={p.rol === 'sin-rol' ? '' : p.rol} onChange={(e) => cambiarRol(p, e.target.value)}>
                                {p.rol === 'sin-rol' && <option value="">Sin rol</option>}
                                {ROLES.map((r) => (
                                  <option key={r.valor} value={r.valor}>
                                    {r.titulo}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )
                        )}
                      </div>
                      {p.activo && !p.esTu && (
                        <button type="button" className="btn btn--texto" onClick={() => desactivar(p)}>
                          Desactivar
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="campo__ayuda" style={{ marginTop: 12 }}>
                  Enlace de acceso para el equipo:
                </p>
                <Copiable valor={eq.enlaceAcceso} />
              </div>
            </aside>
          </div>
        )}
      </EstadoCarga>
    </>
  );
}

function Copiable({ valor }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="adm-copiable">
      <code>{valor}</code>
      <button
        type="button"
        className="btn btn--texto"
        onClick={() => {
          navigator.clipboard?.writeText(valor).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
          });
        }}
      >
        {copiado ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

function Credenciales({ r }) {
  return (
    <div className="adm-credenciales" role="status">
      <p className="adm-credenciales__titulo">
        <Icono nombre="check" /> {r.mensaje}
      </p>
      <dl>
        <dt>Enlace</dt>
        <dd>
          <Copiable valor={r.enlaceAcceso} />
        </dd>
        <dt>Usuario</dt>
        <dd>
          <Copiable valor={r.usuario} />
        </dd>
        <dt>Contraseña</dt>
        <dd>La que acabas de capturar (no se guarda ni se vuelve a mostrar).</dd>
      </dl>
    </div>
  );
}
