import { useRef, useState } from 'react';
import api from '../api.js';
import { validar, normalizarRfc, MONTO_MINIMO, MONTO_MAXIMO } from '../validacion.js';
import { Alerta, Boton, pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';
import { MODALIDADES } from './ComoFunciona.jsx';

// Orden en que se enfoca el primer error.
const ORDEN = ['monto', 'modalidad', 'nombre', 'rfc', 'email'];
const ID_CAMPO = { monto: 'donar-monto', modalidad: 'donar-modalidad-0', nombre: 'donar-nombre', rfc: 'donar-rfc', email: 'donar-email' };

export default function DonarForm({ campana }) {
  const [datos, setDatos] = useState({ modalidad: '', nombre: '', email: '', rfc: '', monto: '' });
  const [tocados, setTocados] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [servidor, setServidor] = useState(null);
  const [fase, setFase] = useState('captura'); // captura | registrando | redirigiendo
  const formRef = useRef(null);

  const sugeridos = campana.montosSugeridos || [];
  const errores = validar(datos);
  const visible = (campo) => (enviado || tocados[campo]) && errores[campo];
  const pideNombre = datos.modalidad === 'Credito' || datos.modalidad === 'Factura';
  const modalidad = MODALIDADES.find((m) => m.valor === datos.modalidad);
  const montoValido = !errores.monto && datos.monto !== '';

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }));

  function enfocarPrimerError(errs) {
    const primero = ORDEN.find((c) => errs[c]);
    if (primero) document.getElementById(ID_CAMPO[primero])?.focus();
  }

  async function enviar(e) {
    e.preventDefault();
    if (fase !== 'captura') return; // evita doble envío (HU-03 CP2)
    setEnviado(true);
    setServidor(null);
    if (Object.keys(errores).length) {
      enfocarPrimerError(errores);
      return;
    }
    setFase('registrando');
    try {
      const registro = await api.crearDonacion({
        campanaId: campana.id,
        modalidad: datos.modalidad,
        email: datos.email.trim(),
        monto: Number(datos.monto),
        nombre: datos.modalidad === 'Anonima' ? null : datos.nombre.trim(),
        rfc: datos.modalidad === 'Factura' ? normalizarRfc(datos.rfc) : null
      });
      if (!registro.ok) {
        setServidor({ texto: registro.mensaje, lista: registro.errores });
        setFase('captura');
        return;
      }
      const pago = await api.iniciarPago(registro.token);
      if (!pago.ok) {
        setServidor({ texto: pago.mensaje });
        setFase('captura');
        return;
      }
      setFase('redirigiendo');
      window.location.assign(pago.urlPago);
    } catch (err) {
      setServidor({ texto: err.message });
      setFase('captura');
    }
  }

  const describe = (campo, ayuda) => [ayuda && `${ID_CAMPO[campo]}-ayuda`, visible(campo) && `${ID_CAMPO[campo]}-error`].filter(Boolean).join(' ') || undefined;
  const MensajeError = ({ campo }) =>
    visible(campo) ? (
      <p className="campo__error" id={`${ID_CAMPO[campo]}-error`}>
        <Icono nombre="alerta" tam={16} /> {errores[campo]}
      </p>
    ) : null;

  return (
    <form ref={formRef} className="form-donar" onSubmit={enviar} noValidate aria-labelledby="donar-titulo">
      <p className="eyebrow">Donar a</p>
      <h2 id="donar-titulo" style={{ marginTop: 4 }}>
        {campana.nombre}
      </h2>

      {/* 1. Monto */}
      <fieldset className="paso">
        <legend className="paso__titulo">
          <span className="paso__num" aria-hidden="true">1</span> ¿Cuánto quieres aportar?
        </legend>
        {sugeridos.length > 0 && (
          <div className="montos" role="group" aria-label="Montos sugeridos">
            {sugeridos.map((m) => (
              <button
                type="button"
                key={m}
                className="chip"
                aria-pressed={Number(datos.monto) === Number(m)}
                onClick={() => {
                  setDatos((d) => ({ ...d, monto: String(m) }));
                  setTocados((t) => ({ ...t, monto: true }));
                }}
              >
                {pesos(m)}
              </button>
            ))}
          </div>
        )}
        <div className="campo" style={{ marginTop: sugeridos.length ? 12 : 0 }}>
          <label htmlFor="donar-monto">{sugeridos.length ? 'U otro monto' : 'Monto'}</label>
          <div className="campo-monto">
            <span className="campo-monto__prefijo" aria-hidden="true">$</span>
            <input
              id="donar-monto"
              className="input cifra"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={datos.monto}
              onChange={(e) => setDatos((d) => ({ ...d, monto: e.target.value.replace(/[^0-9.]/g, '') }))}
              onBlur={tocar('monto')}
              aria-invalid={visible('monto') ? 'true' : undefined}
              aria-describedby={describe('monto', true)}
            />
            <span className="campo-monto__sufijo" aria-hidden="true">MXN</span>
          </div>
          <p className="campo__ayuda" id="donar-monto-ayuda">
            De {pesos(MONTO_MINIMO)} a {pesos(MONTO_MAXIMO)}.
          </p>
          <MensajeError campo="monto" />
        </div>
      </fieldset>

      {/* 2. Modalidad */}
      <fieldset className="paso" aria-describedby={visible('modalidad') ? 'donar-modalidad-0-error' : undefined}>
        <legend className="paso__titulo">
          <span className="paso__num" aria-hidden="true">2</span> ¿Cómo quieres aparecer?
        </legend>
        <div className="opciones">
          {MODALIDADES.map((m, i) => (
            <label key={m.valor} className={`opcion ${datos.modalidad === m.valor ? 'opcion--activa' : ''}`}>
              <input
                id={`donar-modalidad-${i}`}
                type="radio"
                name="modalidad"
                value={m.valor}
                checked={datos.modalidad === m.valor}
                onChange={cambiar('modalidad')}
                aria-describedby={`donar-mod-${m.valor}`}
              />
              <span className="opcion__radio" aria-hidden="true" />
              <span className="opcion__titulo">{m.titulo}</span>
              <span className="opcion__publico" id={`donar-mod-${m.valor}`}>
                {m.publico}
              </span>
            </label>
          ))}
        </div>
        <MensajeError campo="modalidad" />
      </fieldset>

      {/* 3. Datos: solo los que pide la modalidad */}
      <fieldset className="paso">
        <legend className="paso__titulo">
          <span className="paso__num" aria-hidden="true">3</span> Tus datos
        </legend>
        {pideNombre && (
          <div className="campo">
            <label htmlFor="donar-nombre">{datos.modalidad === 'Factura' ? 'Nombre o razón social' : 'Nombre como quieres aparecer'}</label>
            <input
              id="donar-nombre"
              className="input"
              type="text"
              maxLength={120}
              autoComplete={datos.modalidad === 'Factura' ? 'organization' : 'name'}
              value={datos.nombre}
              onChange={cambiar('nombre')}
              onBlur={tocar('nombre')}
              aria-invalid={visible('nombre') ? 'true' : undefined}
              aria-describedby={describe('nombre', datos.modalidad === 'Credito')}
            />
            {datos.modalidad === 'Credito' && (
              <p className="campo__ayuda" id="donar-nombre-ayuda">
                Aparecerá en la lista pública de esta campaña, junto al monto.
              </p>
            )}
            <MensajeError campo="nombre" />
          </div>
        )}
        {datos.modalidad === 'Factura' && (
          <div className="campo">
            <label htmlFor="donar-rfc">RFC</label>
            <input
              id="donar-rfc"
              className="input"
              type="text"
              maxLength={13}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={datos.rfc}
              onChange={(e) => setDatos((d) => ({ ...d, rfc: e.target.value.toUpperCase() }))}
              onBlur={tocar('rfc')}
              aria-invalid={visible('rfc') ? 'true' : undefined}
              aria-describedby={describe('rfc', true)}
            />
            <p className="campo__ayuda" id="donar-rfc-ayuda">
              12 caracteres (persona moral) o 13 (persona física). Solo lo ve tesorería.
            </p>
            <MensajeError campo="rfc" />
          </div>
        )}
        <div className="campo">
          <label htmlFor="donar-email">Correo para tu comprobante</label>
          <input
            id="donar-email"
            className="input"
            type="email"
            maxLength={80}
            autoComplete="email"
            value={datos.email}
            onChange={cambiar('email')}
            onBlur={tocar('email')}
            aria-invalid={visible('email') ? 'true' : undefined}
            aria-describedby={describe('email', true)}
          />
          <p className="campo__ayuda" id="donar-email-ayuda">
            Nunca se muestra en el sitio.
          </p>
          <MensajeError campo="email" />
        </div>
      </fieldset>

      {/* Resumen: el donante ve exactamente qué va a pasar */}
      <div className="resumen" aria-live="polite">
        <dl>
          <dt>Campaña</dt>
          <dd>{campana.nombre}</dd>
          <dt>Modalidad</dt>
          <dd>{modalidad ? modalidad.titulo : 'Sin elegir'}</dd>
          <dt>Público</dt>
          <dd style={{ fontWeight: 500 }}>
            {!modalidad
              ? '—'
              : datos.modalidad === 'Credito'
                ? `${datos.nombre.trim() || 'Tu nombre'} · ${montoValido ? pesos(datos.monto) : 'monto'}`
                : 'Nada'}
          </dd>
          <div className="resumen__total">
            <dt>Total</dt>
            <dd className="cifra">{montoValido ? pesos(datos.monto) : '—'}</dd>
          </div>
        </dl>
      </div>

      {servidor && (
        <Alerta tipo="error" titulo={servidor.texto} role="alert">
          {servidor.lista?.length > 0 && (
            <ul>
              {servidor.lista.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
        </Alerta>
      )}
      {enviado && Object.keys(errores).length > 0 && fase === 'captura' && !servidor && (
        <p className="error-texto" role="alert" style={{ marginTop: 16 }}>
          <Icono nombre="alerta" tam={16} /> Revisa {Object.keys(errores).length === 1 ? 'el campo marcado' : 'los campos marcados'}.
        </p>
      )}

      <Boton type="submit" tam="lg" bloque cargando={fase !== 'captura'} style={{ marginTop: 20 }}>
        {fase === 'captura' && (
          <>
            <Icono nombre="candado" /> Continuar al pago seguro
          </>
        )}
        {fase === 'registrando' && 'Registrando tu donación…'}
        {fase === 'redirigiendo' && 'Abriendo Stripe…'}
      </Boton>
      <p className="nota-pago" aria-live="polite">
        <Icono nombre="info" tam={16} />
        {fase === 'redirigiendo'
          ? 'Te estamos llevando a Stripe. Puede tardar unos segundos; no cierres esta pestaña.'
          : 'Te llevaremos a Stripe (modo de prueba) para pagar con tarjeta. Al terminar regresarás aquí. Nunca vemos tu tarjeta.'}
      </p>
    </form>
  );
}
