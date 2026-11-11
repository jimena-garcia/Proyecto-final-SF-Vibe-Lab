import { useState } from 'react';
import api from '../api.js';
import { validar, normalizarRfc, pesos, MONTO_MINIMO } from '../validacion.js';

const MODALIDADES = [
  { valor: 'Anonima', titulo: 'Anónima', texto: 'Tu nombre no aparece en ningún lugar público. No incluye factura.' },
  { valor: 'Credito', titulo: 'Con crédito', texto: 'Tu nombre y el monto aparecen en la lista de donantes de la campaña.' },
  { valor: 'Factura', titulo: 'Con factura', texto: 'Capturas nombre y RFC para solicitar factura. No apareces en la lista pública.' }
];

export default function DonarForm({ campana, onVolver }) {
  const [datos, setDatos] = useState({ modalidad: '', nombre: '', email: '', rfc: '', monto: '' });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const sugeridos = campana.montosSugeridos || [];

  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    if (enviando) return; // evita doble envío (HU-03 CP2)
    const errs = validar(datos);
    setErrores(errs);
    setMensaje(null);
    if (Object.keys(errs).length) return;

    setEnviando(true);
    try {
      const payload = {
        campanaId: campana.id,
        modalidad: datos.modalidad,
        email: datos.email.trim(),
        monto: Number(datos.monto),
        nombre: datos.modalidad === 'Anonima' ? null : datos.nombre.trim(),
        rfc: datos.modalidad === 'Factura' ? normalizarRfc(datos.rfc) : null
      };
      const registro = await api.crearDonacion(payload);
      if (!registro.ok) {
        setMensaje({ tipo: 'error', texto: registro.mensaje, lista: registro.errores });
        setEnviando(false);
        return;
      }
      const pago = await api.iniciarPago(registro.token);
      if (!pago.ok) {
        setMensaje({ tipo: 'error', texto: pago.mensaje });
        setEnviando(false);
        return;
      }
      window.location.assign(pago.urlPago);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
      setEnviando(false);
    }
  }

  return (
    <section className="formulario">
      <button className="enlace" onClick={onVolver}>
        ← Ver todas las campañas
      </button>
      <h2>Donar a: {campana.nombre}</h2>

      <form onSubmit={enviar} noValidate>
        <fieldset>
          <legend>¿Cómo quieres donar?</legend>
          <div className="modalidades">
            {MODALIDADES.map((m) => (
              <label key={m.valor} className={`opcion ${datos.modalidad === m.valor ? 'activa' : ''}`}>
                <input
                  type="radio"
                  name="modalidad"
                  value={m.valor}
                  checked={datos.modalidad === m.valor}
                  onChange={cambiar('modalidad')}
                />
                <strong>{m.titulo}</strong>
                <span>{m.texto}</span>
              </label>
            ))}
          </div>
          {errores.modalidad && <p className="error">{errores.modalidad}</p>}
        </fieldset>

        <fieldset>
          <legend>Monto (MXN)</legend>
          <div className="montos">
            {sugeridos.map((m) => (
              <button
                type="button"
                key={m}
                className={`chip ${Number(datos.monto) === Number(m) ? 'activa' : ''}`}
                onClick={() => setDatos({ ...datos, monto: String(m) })}
              >
                {pesos(m)}
              </button>
            ))}
          </div>
          <label className="campo">
            Otro monto
            <input
              type="number"
              inputMode="decimal"
              min={MONTO_MINIMO}
              step="0.01"
              value={datos.monto}
              onChange={cambiar('monto')}
              placeholder="Escribe el monto que quieras"
            />
          </label>
          {errores.monto && <p className="error">{errores.monto}</p>}
        </fieldset>

        <fieldset>
          <legend>Tus datos</legend>
          {(datos.modalidad === 'Credito' || datos.modalidad === 'Factura') && (
            <label className="campo">
              {datos.modalidad === 'Factura' ? 'Nombre o razón social' : 'Nombre como quieres aparecer'}
              <input type="text" maxLength={120} value={datos.nombre} onChange={cambiar('nombre')} autoComplete="name" />
              {errores.nombre && <span className="error">{errores.nombre}</span>}
            </label>
          )}
          {datos.modalidad === 'Factura' && (
            <label className="campo">
              RFC
              <input
                type="text"
                maxLength={13}
                value={datos.rfc}
                onChange={cambiar('rfc')}
                placeholder="GODE561231GR8"
                style={{ textTransform: 'uppercase' }}
              />
              {errores.rfc && <span className="error">{errores.rfc}</span>}
            </label>
          )}
          <label className="campo">
            Correo para tu comprobante
            <input type="email" maxLength={80} value={datos.email} onChange={cambiar('email')} autoComplete="email" />
            <small>Solo lo usamos para enviarte el comprobante; nunca se muestra en el sitio.</small>
            {errores.email && <span className="error">{errores.email}</span>}
          </label>
        </fieldset>

        {mensaje && (
          <div className={`mensaje ${mensaje.tipo}`} role="alert">
            <p>{mensaje.texto}</p>
            {mensaje.lista?.length > 0 && (
              <ul>
                {mensaje.lista.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <button className="boton primario grande" type="submit" disabled={enviando}>
          {enviando ? 'Registrando tu donación…' : 'Continuar al pago seguro'}
        </button>
        <p className="nota">Te llevaremos a Stripe (modo de prueba) para capturar tu tarjeta. Nosotros no vemos ni guardamos los datos de tu tarjeta.</p>
      </form>
    </section>
  );
}
