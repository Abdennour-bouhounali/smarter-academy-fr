import React from 'react';
import { puissance, produitEcrit, ecrirePuissance, confusionProduit } from './puissances';

/**
 * TowerLab — deux tours côte à côte, pour que 2⁵ et 5² cessent de se confondre.
 *
 * Chaque tour empile SES facteurs : la tour de gauche montre cinq briques de
 * valeur 2, celle de droite deux briques de valeur 5. La hauteur d'une tour
 * est donc l'exposant, et la valeur de ses briques la base. Il devient
 * impossible de les confondre : elles n'ont ni la même hauteur, ni les mêmes
 * briques, ni le même total.
 *
 * Expected observation : « l'exposant, c'est la HAUTEUR de la tour — le nombre
 * de facteurs — et la base, c'est ce qu'il y a dans chaque brique ».
 * Misconception targeted : lire aⁿ comme a × n, et intervertir base et exposant.
 *
 * Sécurité visuelle : les briques sont des <div> empilés en flex-col ; leur
 * hauteur est fixe et le conteneur grandit avec elles. Les libellés vivent
 * sous chaque tour, dans leur propre cellule. Rien ne peut se chevaucher.
 */
function Tour({ base, exposant, ton }) {
  const TONS = {
    indigo: { brique: 'bg-indigo-500 border-indigo-700', cadre: 'border-indigo-200 bg-indigo-50', texte: 'text-indigo-800' },
    rose: { brique: 'bg-rose-500 border-rose-700', cadre: 'border-rose-200 bg-rose-50', texte: 'text-rose-800' },
  };
  const t = TONS[ton] ?? TONS.indigo;

  return (
    <div className="flex flex-col items-center gap-2 min-w-0">
      <div className="font-mono text-xl font-black text-slate-800">
        {ecrirePuissance(base, exposant)}
      </div>
      {/* La pile de facteurs — la hauteur EST l'exposant. */}
      <div className="flex flex-col-reverse gap-1" role="img"
        aria-label={`${exposant} briques de valeur ${base}`}>
        {Array.from({ length: exposant }, (_, i) => (
          <div
            key={i}
            className={`w-14 h-8 rounded border-2 ${t.brique} flex items-center justify-center text-white font-mono font-bold text-sm`}
          >
            {base}
          </div>
        ))}
      </div>
      <div className={`rounded-lg border-2 px-2 py-1.5 text-center w-full ${t.cadre}`}>
        <div className="text-[10px] uppercase tracking-wide text-slate-500">
          {exposant} facteur{exposant > 1 ? 's' : ''}
        </div>
        <div className={`font-mono text-xs ${t.texte} break-all`}>{produitEcrit(base, exposant)}</div>
        <output className={`font-mono text-lg font-black ${t.texte}`} data-total={String(puissance(base, exposant))}>
          = {puissance(base, exposant)}
        </output>
      </div>
    </div>
  );
}

export default function TowerLab({ a, b, montrerProduit = false }) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:gap-6 justify-items-center">
        <Tour base={a.base} exposant={a.exposant} ton="indigo" />
        <Tour base={b.base} exposant={b.exposant} ton="rose" />
      </div>
      {montrerProduit && (
        <div className="rounded-xl border-2 border-orange-200 bg-orange-50 px-3 py-2.5 text-center text-sm text-orange-900">
          Et <strong className="font-mono">{a.base} × {a.exposant} = {confusionProduit(a.base, a.exposant)}</strong> — encore un
          troisième nombre, qui n’est ni l’un ni l’autre.
        </div>
      )}
    </div>
  );
}
