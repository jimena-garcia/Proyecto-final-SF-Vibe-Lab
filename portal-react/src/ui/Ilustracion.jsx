// Ilustraciones editoriales empaquetadas (sin archivos públicos ni CDN).
// La campaña elige una con el campo Ilustracion__c; sin valor se usa "General".
// Paleta limitada a los tokens del sistema.

const P = { tinta: '#14213d', papel: '#f3eee5', achiote: '#c2410c', jade: '#0f766e', sol: '#f5b451', claro: '#fdebdd' };

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
        <rect x="96" y="120" width="80" height="8" rx="4" fill="#3b4a70" />
        <rect x="96" y="138" width="96" height="8" rx="4" fill="#3b4a70" />
        <circle cx="285" cy="125" r="20" fill={P.achiote} />
      </g>
    </>
  );
}

function Transporte() {
  return (
    <>
      <rect width="400" height="250" fill="#e3ece9" />
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
      <rect width="400" height="250" fill="#ebe7f0" />
      <circle cx="300" cy="64" r="22" fill={P.sol} />
      <rect x="40" y="110" width="80" height="140" fill="#3b4a70" />
      <rect x="120" y="70" width="110" height="180" fill={P.tinta} />
      <rect x="230" y="130" width="70" height="120" fill="#3b4a70" />
      <rect x="300" y="160" width="70" height="90" fill={P.jade} />
      {[0, 1, 2, 3].map((f) =>
        [0, 1, 2].map((c) => (
          <rect key={`${f}-${c}`} x={136 + c * 30} y={90 + f * 34} width="16" height="20" rx="2" fill={f === 1 && c === 1 ? P.sol : '#56648c'} />
        ))
      )}
      <rect x="160" y="220" width="30" height="30" fill={P.achiote} />
    </>
  );
}

const MAPA = { Boletos, Transporte, Hospedaje, General };

export default function Ilustracion({ tipo }) {
  const Dibujo = MAPA[tipo] || General;
  return (
    <svg className="ilustracion" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <Dibujo />
    </svg>
  );
}
