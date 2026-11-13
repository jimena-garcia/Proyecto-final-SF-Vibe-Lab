import { useEffect, useState } from 'react';
import api from './api.js';
import { Cabecera, EstadoCarga, ir, useCarga } from './comun.jsx';
import { Alerta, Boton, pesos } from '../ui/basicos.jsx';
import Icono from '../ui/Icono.jsx';
import Ilustracion from '../ui/Ilustracion.jsx';
import RutaProgreso from '../components/RutaProgreso.jsx';
import { formatoPorcentaje, porcentaje } from '../lib/progreso.js';

/** HU-08: crear y administrar campañas con su meta y sus metas escalonadas. */
export default function Campanas({ sub }) {
  const [estado, recargar] = useCarga(() => api.getCampanas(), []);
  if (sub) {
    return (
      <EstadoCarga estado={estado} reintentar={recargar}>
        {estado.datos && (
          <CampanaForm
            key={sub}
            campana={sub === 'nueva' ? null : estado.datos.find((c) => c.id === sub)}
            alGuardar={() => {
              recargar();
              ir('campanas');
            }}
          />
        )}
      </EstadoCarga>
    );
  }

  const lista = estado.datos || [];
  return (
    <>
      <Cabecera titulo="Campañas" descripcion="Lo que publiques aquí aparece en el sitio público al instante.">
        <a className="btn btn--primario" href="#/campanas/nueva">
          Nueva campaña
        </a>
      </Cabecera>
      <EstadoCarga estado={estado} reintentar={recargar} vacio={estado.datos && lista.length === 0 && 'Aún no hay campañas. Crea la primera.'}>
        <div className="adm-tabla-envoltura">
          <table className="adm-tabla">
            <thead>
              <tr>
                <th scope="col">Campaña</th>
                <th scope="col">Estado</th>
                <th scope="col" className="num">Meta</th>
                <th scope="col" className="num">Recaudado</th>
                <th scope="col">Avance</th>
                <th scope="col" className="num">Metas</th>
                <th scope="col">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => {
                const pct = porcentaje(c.recaudado, c.meta);
                return (
                  <tr key={c.id}>
                    <td data-titulo="Campaña">
                      <a className="adm-enlace-fuerte" href={`#/campanas/${c.id}`}>
                        {c.nombre}
                      </a>
                      {c.destacada && <span className="badge badge--destacada" style={{ marginLeft: 8 }}>Destacada</span>}
                    </td>
                    <td data-titulo="Estado">
                      <span className={`badge ${c.activa ? 'badge--pagada' : 'badge--cancelada'}`}>{c.activa ? 'Activa' : 'Inactiva'}</span>
                    </td>
                    <td data-titulo="Meta" className="num cifra">{pesos(c.meta)}</td>
                    <td data-titulo="Recaudado" className="num cifra">{pesos(c.recaudado)}</td>
                    <td data-titulo="Avance">
                      <div className="adm-mini-barra" aria-hidden="true">
                        <div style={{ width: `${Math.min(100, pct)}%` }} />
                      </div>
                      <span className="adm-texto-2 cifra">{formatoPorcentaje(pct)}</span>
                    </td>
                    <td data-titulo="Metas" className="num cifra">{c.hitos.length || '—'}</td>
                    <td className="acciones">
                      <a className="btn btn--texto" href={`#/campanas/${c.id}`}>
                        Editar
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </EstadoCarga>
    </>
  );
}

const ILUSTRACIONES = [
  { valor: 'General', texto: 'Ruta' },
  { valor: 'Boletos', texto: 'Boletos' },
  { valor: 'Transporte', texto: 'Transporte' },
  { valor: 'Hospedaje', texto: 'Hospedaje' }
];

function validar(c) {
  const e = {};
  if (!c.nombre.trim()) e.nombre = 'Escribe el nombre de la campaña.';
  const meta = Number(c.meta);
  if (!meta || meta <= 0) e.meta = 'La meta debe ser mayor a cero.';
  if (c.montosSugeridos && !/^\s*\d+(\s*;\s*\d+)*\s*$/.test(c.montosSugeridos)) e.montosSugeridos = 'Usa números separados por punto y coma, por ejemplo 200;500;1000.';
  c.hitos.forEach((h, i) => {
    const m = Number(h.monto);
    if (!h.titulo.trim()) e[`hito-${i}`] = 'Ponle un título a esta meta.';
    else if (!m || m <= 0) e[`hito-${i}`] = 'El monto debe ser mayor a cero.';
    else if (meta && m > meta) e[`hito-${i}`] = 'No puede superar la meta final de la campaña.';
  });
  return e;
}

function CampanaForm({ campana, alGuardar }) {
  const [c, setC] = useState(() => ({
    id: campana?.id,
    nombre: campana?.nombre || '',
    descripcion: campana?.descripcion || '',
    meta: campana?.meta ?? '',
    activa: campana?.activa ?? true,
    destacada: campana?.destacada ?? false,
    ilustracion: campana?.ilustracion || 'General',
    imagenUrl: campana?.imagenUrl || null,
    imagenAlt: campana?.imagenAlt || '',
    montosSugeridos: campana?.montosSugeridos || '',
    hitos: (campana?.hitos || []).map((h) => ({ ...h, descripcion: h.descripcion || '' }))
  }));
  const [enviado, setEnviado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [servidor, setServidor] = useState(null);
  const errores = validar(c);
  const ver = (k) => enviado && errores[k];

  useEffect(() => {
    document.querySelector('.adm-main')?.scrollTo?.(0, 0);
  }, []);

  const set = (k) => (e) => setC((v) => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setHito = (i, k) => (e) => setC((v) => ({ ...v, hitos: v.hitos.map((h, j) => (j === i ? { ...h, [k]: e.target.value } : h)) }));
  const agregarHito = () => setC((v) => ({ ...v, hitos: [...v.hitos, { titulo: '', descripcion: '', monto: '' }] }));
  const quitarHito = (i) => setC((v) => ({ ...v, hitos: v.hitos.filter((_, j) => j !== i) }));

  async function guardar(e) {
    e.preventDefault();
    setEnviado(true);
    setServidor(null);
    if (Object.keys(errores).length) return;
    setGuardando(true);
    try {
      const res = await api.guardarCampana({
        ...c,
        meta: Number(c.meta),
        hitos: [...c.hitos].map((h) => ({ ...h, monto: Number(h.monto) })).sort((a, b) => a.monto - b.monto)
      });
      if (res.ok) alGuardar();
      else setServidor(res.mensaje);
    } catch (err) {
      setServidor(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const vistaPrevia = {
    nombre: c.nombre || 'Campaña',
    meta: Number(c.meta) || 0,
    recaudado: campana?.recaudado || 0,
    hitos: c.hitos.filter((h) => Number(h.monto) > 0).map((h) => ({ ...h, monto: Number(h.monto) }))
  };

  return (
    <form onSubmit={guardar} noValidate>
      <a className="enlace-volver" href="#/campanas">
        <Icono nombre="volver" tam={18} /> Campañas
      </a>
      <Cabecera titulo={campana ? 'Editar campaña' : 'Nueva campaña'} descripcion={campana ? campana.nombre : 'Se publicará en el sitio si la marcas como activa.'} />

      <div className="adm-form">
        <div className="adm-form__campos">
          <fieldset className="adm-grupo">
            <legend>Qué se publica</legend>
            <div className="campo">
              <label htmlFor="c-nombre">Nombre</label>
              <input id="c-nombre" className="input" value={c.nombre} onChange={set('nombre')} maxLength={80} aria-invalid={ver('nombre') ? 'true' : undefined} />
              {ver('nombre') && <p className="campo__error">{errores.nombre}</p>}
            </div>
            <div className="campo">
              <label htmlFor="c-desc">Descripción</label>
              <textarea id="c-desc" className="input adm-textarea" rows={5} value={c.descripcion} onChange={set('descripcion')} maxLength={2000} />
              <p className="campo__ayuda">El primer párrafo se usa como resumen. Deja una línea en blanco para separar párrafos.</p>
            </div>
            <ImagenCampanaCampo
              campanaId={c.id}
              url={c.imagenUrl}
              alt={c.imagenAlt}
              setAlt={set('imagenAlt')}
              alCambiar={(url) => setC((v) => ({ ...v, imagenUrl: url }))}
            />
            <div className="campo">
              <span className="campo__label">Ilustración {c.imagenUrl ? '(se usa si la imagen no carga)' : '(se usa si no hay imagen)'}</span>
              <div className="adm-ilustraciones" role="radiogroup" aria-label="Ilustración">
                {ILUSTRACIONES.map((i) => (
                  <label key={i.valor} className={`adm-ilus ${c.ilustracion === i.valor ? 'adm-ilus--activa' : ''}`}>
                    <input type="radio" name="ilustracion" value={i.valor} checked={c.ilustracion === i.valor} onChange={set('ilustracion')} />
                    <span className="adm-ilus__img" aria-hidden="true">
                      <Ilustracion tipo={i.valor} />
                    </span>
                    {i.texto}
                  </label>
                ))}
              </div>
            </div>
            <div className="adm-checks">
              <label className="adm-check">
                <input type="checkbox" checked={c.activa} onChange={set('activa')} /> Activa (visible en el sitio)
              </label>
              <label className="adm-check">
                <input type="checkbox" checked={c.destacada} onChange={set('destacada')} /> Destacada (campaña principal de la portada)
              </label>
            </div>
          </fieldset>

          <fieldset className="adm-grupo">
            <legend>Meta y montos</legend>
            <div className="adm-dos">
              <div className="campo">
                <label htmlFor="c-meta">Meta final (MXN)</label>
                <input id="c-meta" className="input cifra" inputMode="decimal" value={c.meta} onChange={(e) => setC((v) => ({ ...v, meta: e.target.value.replace(/[^0-9.]/g, '') }))} aria-invalid={ver('meta') ? 'true' : undefined} />
                {ver('meta') && <p className="campo__error">{errores.meta}</p>}
              </div>
              <div className="campo">
                <label htmlFor="c-montos">Montos sugeridos</label>
                <input id="c-montos" className="input" placeholder="200;500;1000" value={c.montosSugeridos} onChange={set('montosSugeridos')} aria-invalid={ver('montosSugeridos') ? 'true' : undefined} />
                {ver('montosSugeridos') ? <p className="campo__error">{errores.montosSugeridos}</p> : <p className="campo__ayuda">Botones rápidos del formulario de donación.</p>}
              </div>
            </div>
          </fieldset>

          <fieldset className="adm-grupo">
            <legend>Metas escalonadas</legend>
            <p className="campo__ayuda" style={{ marginBottom: 12 }}>
              Son acumulativas: cada una se alcanza cuando el total recaudado llega a su monto. La última puede ser igual a la meta final.
            </p>
            {c.hitos.length === 0 && <p className="adm-texto-2">Sin metas intermedias: el sitio mostrará solo la meta final.</p>}
            <ol className="adm-hitos">
              {c.hitos.map((h, i) => (
                <li key={i} className="adm-hito">
                  <div className="adm-hito__campos">
                    <div className="campo">
                      <label htmlFor={`h-t-${i}`}>Título de la meta {i + 1}</label>
                      <input id={`h-t-${i}`} className="input" value={h.titulo} onChange={setHito(i, 'titulo')} maxLength={80} />
                    </div>
                    <div className="campo">
                      <label htmlFor={`h-m-${i}`}>Monto acumulado</label>
                      <input id={`h-m-${i}`} className="input cifra" inputMode="decimal" value={h.monto} onChange={setHito(i, 'monto')} />
                    </div>
                    <div className="campo adm-hito__desc">
                      <label htmlFor={`h-d-${i}`}>Qué se consigue</label>
                      <input id={`h-d-${i}`} className="input" value={h.descripcion} onChange={setHito(i, 'descripcion')} maxLength={255} />
                    </div>
                  </div>
                  <button type="button" className="adm-quitar" onClick={() => quitarHito(i)} aria-label={`Quitar meta ${i + 1}`}>
                    <Icono nombre="cruz" tam={18} />
                  </button>
                  {ver(`hito-${i}`) && <p className="campo__error adm-hito__error">{errores[`hito-${i}`]}</p>}
                </li>
              ))}
            </ol>
            <Boton type="button" variante="secundario" onClick={agregarHito} disabled={c.hitos.length >= 10}>
              Agregar meta
            </Boton>
          </fieldset>
        </div>

        <aside className="adm-form__lateral">
          <div className="panel">
            <p className="eyebrow">Vista previa en el sitio</p>
            <p className="adm-preview__titulo">{vistaPrevia.nombre}</p>
            {vistaPrevia.meta > 0 ? <RutaProgreso campana={vistaPrevia} compacta /> : <p className="adm-texto-2">Escribe la meta para ver el recorrido.</p>}
            {vistaPrevia.meta > 0 && vistaPrevia.hitos.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <RutaProgreso campana={vistaPrevia} soloMetas />
              </div>
            )}
            {servidor && <Alerta tipo="error" titulo="No se guardó">{servidor}</Alerta>}
            {enviado && Object.keys(errores).length > 0 && <Alerta tipo="error" titulo="Revisa los campos marcados" />}
            <Boton type="submit" bloque tam="lg" cargando={guardando} style={{ marginTop: 16 }}>
              {guardando ? 'Guardando…' : 'Guardar campaña'}
            </Boton>
            <a className="btn btn--texto" href="#/campanas" style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>
              Cancelar
            </a>
          </div>
        </aside>
      </div>
    </form>
  );
}

/** Reduce la imagen en el navegador (máx. 1600 px de ancho) para subir un archivo ligero. */
async function prepararImagen(archivo) {
  if (!/^image\/(png|jpeg|webp)$/.test(archivo.type)) throw new Error('Usa una imagen PNG, JPG o WebP.');
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let blob = await new Promise((ok) => canvas.toBlob(ok, 'image/webp', 0.85));
  if (!blob || blob.type !== 'image/webp') blob = await new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', 0.85));
  if (blob.size > 1.5 * 1024 * 1024) throw new Error('La imagen sigue pesando más de 1.5 MB. Usa una más pequeña.');
  const base64 = await new Promise((ok, mal) => {
    const lector = new FileReader();
    lector.onload = () => ok(String(lector.result).split(',')[1]);
    lector.onerror = () => mal(new Error('No pudimos leer la imagen.'));
    lector.readAsDataURL(blob);
  });
  return { base64, previa: URL.createObjectURL(blob) };
}

/** Imagen propia de la campaña: se sube al elegirla (no espera a "Guardar"). */
function ImagenCampanaCampo({ campanaId, url, alt, setAlt, alCambiar }) {
  const [trabajando, setTrabajando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  async function elegir(e) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    setTrabajando(true);
    setMensaje(null);
    try {
      const { base64, previa } = await prepararImagen(archivo);
      const res = await api.subirImagen(campanaId, archivo.name, base64);
      if (!res.ok) throw new Error(res.mensaje);
      alCambiar(previa); // copia local: se ve al instante (la pública ya quedó guardada)
      setMensaje({ tipo: 'exito', texto: res.mensaje });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setTrabajando(false);
    }
  }

  async function quitar() {
    setTrabajando(true);
    setMensaje(null);
    try {
      const res = await api.quitarImagen(campanaId);
      if (!res.ok) throw new Error(res.mensaje);
      alCambiar(null);
      setMensaje({ tipo: 'exito', texto: res.mensaje });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setTrabajando(false);
    }
  }

  return (
    <div className="campo adm-imagen">
      <span className="campo__label">Imagen de la campaña</span>
      {!campanaId ? (
        <p className="campo__ayuda">Guarda la campaña primero; después podrás subir su imagen.</p>
      ) : (
        <>
          <div className="adm-imagen__fila">
            <div className="adm-imagen__previa">
              {url ? <img src={url} alt="" /> : <span>Sin imagen</span>}
            </div>
            <div className="adm-imagen__acciones">
              <label className={`btn btn--secundario btn--sm ${trabajando ? 'is-disabled' : ''}`}>
                {trabajando ? 'Procesando…' : url ? 'Cambiar imagen' : 'Subir imagen'}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={elegir} disabled={trabajando} className="sr-only" />
              </label>
              {url && (
                <button type="button" className="btn btn--texto btn--sm" onClick={quitar} disabled={trabajando}>
                  Quitar imagen
                </button>
              )}
              <p className="campo__ayuda">PNG, JPG o WebP. Formato horizontal (16:10). Se reduce automáticamente y se publica al instante.</p>
            </div>
          </div>
          {mensaje && (
            <p className={mensaje.tipo === 'error' ? 'campo__error' : 'campo__ayuda'} role="status">
              {mensaje.texto}
            </p>
          )}
          <label htmlFor="c-alt" style={{ marginTop: 8 }}>
            Descripción de la imagen
          </label>
          <input id="c-alt" className="input" value={alt} onChange={setAlt} maxLength={255} placeholder="Ej.: Asistentes de Mexico Dreamin en charlas y convivencia" />
          <p className="campo__ayuda">Para lectores de pantalla. Se guarda con el botón "Guardar".</p>
        </>
      )}
    </div>
  );
}

