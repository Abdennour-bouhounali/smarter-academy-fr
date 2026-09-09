import React from 'react';

/**
 * VueMystere — les trois vues des deux emballages de l'atelier.
 *
 * Le déclencheur de la leçon repose sur un fait qui doit être VRAI, et pas
 * seulement affirmé : la boîte de chocolats (prisme droit) et la boîte de thé
 * (cylindre) donnent la MÊME vue de face — un rectangle — et ne se
 * distinguent que par la vue de dessus (triangle contre disque).
 *
 * Les silhouettes sont donc tracées ici à partir des mêmes largeur et hauteur
 * pour la vue de face des deux solides : le dessin ne peut pas contredire le
 * propos du module (§28bis). La vue de dessus, elle, est franchement
 * différente — c'est elle qui tranche, et c'est ce que l'élève doit découvrir.
 *
 * Composant purement illustratif : aucune interaction, aucun état.
 */

const S = 108;
const PAD = 16;

function Cadre({ label, actif, children, aria }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-600 text-center">{label}</p>
      <svg
        viewBox={`0 0 ${S} ${S}`}
        className={`w-full max-w-[130px] mx-auto rounded-lg border-2 bg-white ${
          actif ? 'border-violet-400' : 'border-slate-200'
        }`}
        role="img"
        aria-label={aria}
      >
        {children}
      </svg>
    </div>
  );
}

/** Le rectangle de la vue de face — identique pour les deux solides. */
function VueFace() {
  const w = S - PAD * 2 - 16;
  const h = S - PAD * 2;
  return (
    <rect x={(S - w) / 2} y={(S - h) / 2} width={w} height={h}
      fill="#f8fafc" stroke="#0f172a" strokeWidth="1.8" />
  );
}

/** Vue de dessus du prisme : un triangle. */
function VueDessusPrisme() {
  const r = (S - PAD * 2) / 2;
  const c = S / 2;
  const pts = [0, 1, 2]
    .map((i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
      return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`;
    })
    .join(' ');
  return <polygon points={pts} fill="#f8fafc" stroke="#0f172a" strokeWidth="1.8" />;
}

/** Vue de dessus du cylindre : un disque. */
function VueDessusCylindre() {
  return (
    <circle cx={S / 2} cy={S / 2} r={(S - PAD * 2) / 2}
      fill="#f8fafc" stroke="#0f172a" strokeWidth="1.8" />
  );
}

/**
 * Les vues d'un des deux emballages.
 * `solide` : 'prisme' | 'cylindre'
 * `vues`   : sous-ensemble de ['face', 'dessus', 'cote']
 */
export default function VueMystere({ solide, vues = ['face', 'dessus', 'cote'], highlight = null }) {
  const estPrisme = solide === 'prisme';
  const LABELS = { face: 'de face', dessus: 'de dessus', cote: 'de côté' };

  const contenu = {
    face: <VueFace />,
    // De côté, les deux montrent encore un rectangle : seule la vue de
    // dessus sépare vraiment les deux solides.
    cote: <VueFace />,
    dessus: estPrisme ? <VueDessusPrisme /> : <VueDessusCylindre />,
  };

  const aria = {
    face: 'Vue de face : un rectangle',
    cote: 'Vue de côté : un rectangle',
    dessus: estPrisme ? 'Vue de dessus : un triangle' : 'Vue de dessus : un disque',
  };

  return (
    <div className={`grid gap-2 ${vues.length === 1 ? 'grid-cols-1 max-w-[150px] mx-auto' : vues.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {vues.map((v) => (
        <Cadre key={v} label={LABELS[v]} actif={highlight === v} aria={aria[v]}>
          {contenu[v]}
        </Cadre>
      ))}
    </div>
  );
}
