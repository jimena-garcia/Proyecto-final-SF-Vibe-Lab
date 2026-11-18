// Ilustraciones editoriales empaquetadas (sin archivos públicos ni CDN).
// La campaña elige una con el campo Ilustracion__c; sin valor se usa "General".
// Paleta limitada a los tokens del sistema.

const P = {
  tinta: 'var(--navy)',
  papel: 'var(--papel-2)',
  achiote: 'var(--contribuir)',
  jade: 'var(--jade)',
  sol: 'var(--nube)',
  claro: 'var(--contribuir-suave)',
  nubeSuave: 'var(--nube-suave)',
  jadeSuave: 'var(--jade-suave)'
};

function General() {
  return (
    <>
      <rect width="400" height="250" fill={P.papel} />
      <path d="M-10 190 C 80 150, 120 230, 200 180 S 330 90, 410 120" stroke={P.tinta} strokeWidth="3" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
      <circle cx="62" cy="172" r="12" fill={P.jade} />
      <circle cx="62" cy="172" r="4" fill={P.papel} />
      <path d="M318 62c-17 0-30 13-30 29 0 22 30 49 30 49s30-27 30-49c0-16-13-29-30-29z" fill={P.achiote} />
      <circle cx="318" cy="91" r="10" fill={P.papel} />
      <circle cx="96" cy="64" r="26" fill={P.sol} />
    </>
  );
}

function Boletos() {
  return (
    <>
      <rect width="400" height="250" fill={P.claro} />
      <g transform="rotate(-8 200 125)">
        <rect x="70" y="70" width="260" height="110" rx="12" fill={P.tinta} />
        <circle cx="240" cy="70" r="12" fill={P.claro} />
        <circle cx="240" cy="180" r="12" fill={P.claro} />
        <path d="M240 88v74" stroke={P.claro} strokeWidth="3" strokeDasharray="4 7" />
        <rect x="96" y="96" width="110" height="12" rx="6" fill={P.sol} />
        <rect x="96" y="120" width="80" height="8" rx="4" fill={P.tinta} />
        <rect x="96" y="138" width="96" height="8" rx="4" fill={P.tinta} />
        <circle cx="285" cy="125" r="20" fill={P.achiote} />
      </g>
    </>
  );
}

function Transporte() {
  return (
    <>
      <rect width="400" height="250" fill={P.nubeSuave} />
      <path d="M30 200 Q 200 20 370 150" stroke={P.tinta} strokeWidth="3" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
      <circle cx="30" cy="200" r="9" fill={P.jade} />
      <circle cx="370" cy="150" r="9" fill={P.achiote} />
      <g transform="translate(205 78) rotate(18)">
        <path d="M-50 0 L40 -6 C52 -7 58 0 58 0 C58 0 52 7 40 6 L-50 0z" fill={P.tinta} />
        <path d="M-6 -3 L-28 -40 L-14 -40 L18 -4z" fill={P.tinta} />
        <path d="M-6 3 L-28 40 L-14 40 L18 4z" fill={P.tinta} />
        <path d="M-46 -1 L-58 -20 L-50 -20 L-36 -2z" fill={P.achiote} />
      </g>
      <circle cx="320" cy="56" r="22" fill={P.sol} />
    </>
  );
}

function Hospedaje() {
  return (
    <>
      <rect width="400" height="250" fill={P.jadeSuave} />
      <circle cx="300" cy="64" r="22" fill={P.sol} />
      <rect x="40" y="110" width="80" height="140" fill={P.tinta} />
      <rect x="120" y="70" width="110" height="180" fill={P.tinta} />
      <rect x="230" y="130" width="70" height="120" fill={P.tinta} />
      <rect x="300" y="160" width="70" height="90" fill={P.jade} />
      {[0, 1, 2, 3].map((f) =>
        [0, 1, 2].map((c) => (
          <rect key={`${f}-${c}`} x={136 + c * 30} y={90 + f * 34} width="16" height="20" rx="2" fill={f === 1 && c === 1 ? P.sol : P.tinta} />
        ))
      )}
      <rect x="160" y="220" width="30" height="30" fill={P.achiote} />
    </>
  );
}

/** Certificaciones: credencial con sello de aprobado. */
function Certificacion() {
  return (
    <>
      <rect width="400" height="250" fill={P.jadeSuave} />
      <rect x="92" y="48" width="200" height="150" rx="10" fill={P.papel} stroke={P.tinta} strokeWidth="3" />
      <rect x="114" y="74" width="120" height="12" rx="6" fill={P.tinta} />
      <rect x="114" y="98" width="150" height="8" rx="4" fill={P.nubeSuave} />
      <rect x="114" y="116" width="130" height="8" rx="4" fill={P.nubeSuave} />
      <rect x="114" y="160" width="70" height="8" rx="4" fill={P.tinta} />
      <path d="M286 170l-14 52 22-12 22 12-14-52z" fill={P.achiote} />
      <circle cx="294" cy="160" r="38" fill={P.jade} />
      <circle cx="294" cy="160" r="28" fill="none" stroke={P.papel} strokeWidth="3" strokeDasharray="3 6" />
      <path d="M280 160l10 10 20-22" stroke={P.papel} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="58" cy="210" r="18" fill={P.sol} />
    </>
  );
}

/** Comunidad: personas alrededor de una mesa con globos de conversación. */
function Comunidad() {
  const persona = (x, color) => (
    <g key={x}>
      <circle cx={x} cy="118" r="20" fill={color} />
      <path d={`M${x - 32} 196c0-26 14-46 32-46s32 20 32 46z`} fill={color} />
    </g>
  );
  return (
    <>
      <rect width="400" height="250" fill={P.claro} />
      {persona(110, P.tinta)}
      {persona(200, P.achiote)}
      {persona(290, P.jade)}
      <rect x="50" y="190" width="300" height="20" rx="6" fill={P.tinta} />
      <rect x="128" y="34" width="70" height="40" rx="12" fill={P.papel} stroke={P.tinta} strokeWidth="3" />
      <path d="M150 74l-6 14 18-14z" fill={P.tinta} />
      <circle cx="148" cy="54" r="4" fill={P.tinta} />
      <circle cx="163" cy="54" r="4" fill={P.tinta} />
      <circle cx="178" cy="54" r="4" fill={P.tinta} />
      <rect x="226" y="46" width="56" height="34" rx="12" fill={P.sol} />
      <path d="M262 80l8 12-20-12z" fill={P.sol} />
    </>
  );
}

/** Conectividad: laptop con señal de wifi. */
function Conectividad() {
  return (
    <>
      <rect width="400" height="250" fill={P.papel} />
      <rect x="110" y="96" width="180" height="112" rx="10" fill={P.tinta} />
      <rect x="122" y="108" width="156" height="88" rx="4" fill={P.jadeSuave} />
      <path d="M86 208h228l-14 18H100z" fill={P.tinta} />
      <rect x="140" y="126" width="80" height="10" rx="5" fill={P.jade} />
      <rect x="140" y="146" width="110" height="8" rx="4" fill={P.nubeSuave} />
      <rect x="140" y="162" width="96" height="8" rx="4" fill={P.nubeSuave} />
      <g fill="none" stroke={P.achiote} strokeWidth="9" strokeLinecap="round">
        <path d="M156 64a64 64 0 0 1 88 0" />
        <path d="M172 82a38 38 0 0 1 56 0" />
      </g>
      <circle cx="200" cy="98" r="8" fill={P.achiote} />
      <circle cx="334" cy="60" r="20" fill={P.sol} />
    </>
  );
}

const MAPA = { Boletos, Transporte, Hospedaje, General, Certificacion, Comunidad, Conectividad };

export default function Ilustracion({ tipo }) {
  const Dibujo = MAPA[tipo] || General;
  return (
    <svg className="ilustracion" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <Dibujo />
    </svg>
  );
}
