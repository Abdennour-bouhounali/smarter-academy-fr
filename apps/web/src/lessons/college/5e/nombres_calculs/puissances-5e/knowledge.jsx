import React from 'react';
import TowerLab from './components/TowerLab';
import SquareCubeLab from './components/SquareCubeLab';
import { ecrirePuissance, produitEcrit, CARRES_PARFAITS } from './components/puissances';

/**
 * Connaissances de la leçon « Puissances » (5e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés. Deux présentations
 * consomment ces données : le tiroir « Ma carte » et l'« À retenir » de fin de
 * module ; la synthèse du test final affiche la carte complète. Aucun module
 * n'écrit son propre résumé (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE, dans l'ordre où la carte se construit :
 *
 *     produit de facteurs identiques (acquis 6e)
 *              ↓
 *     l'écriture puissance  (M1)  ── le raccourci
 *              ↓
 *     l'exposant compte les facteurs  (M2)  ── son sens exact
 *              ↓                ↘
 *     carré et cube (M3)          puissances de 10 (M5)
 *              ↓
 *     carrés parfaits (M4)
 *              ↓                ↙
 *     priorité de la puissance dans un calcul (M6)
 *
 * Rien n'est arbitraire : on ne peut pas comprendre « au carré » (M3) sans
 * savoir ce que compte l'exposant (M2), ni reconnaître un carré parfait (M4)
 * sans le carré (M3). Les puissances de 10 (M5) sont une branche parallèle,
 * greffée sur M2 et sur le décalage de la virgule de 6e.
 *
 * NOTE LEXIQUE. Les ids `puissance` et `exposant` sont ceux du lexique
 * d'audit (scripts/audit/lexicon.json), où ils portent respectivement les
 * niveaux 4e et 3e. Ce sont pourtant les mots exacts du programme de 5e : les
 * briques ci-dessous les ÉTABLISSENT, ce qui est précisément le mécanisme
 * prévu par KNOWLEDGE_DEPENDENCY.md pour qu'une leçon puisse enseigner un
 * terme que le lexique situe plus haut.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare.
 */

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — L'écriture courte. Ni carré, ni cube, ni priorité : seulement le
       raccourci, né du débordement de la ligne. */
    1: [
      {
        id: 'puissance',
        type: 'vocabulaire',
        title: 'L’écriture puissance',
        summary: 'Quand un même facteur se répète, on écrit ce facteur une seule fois, avec en haut le nombre de fois qu’il apparaît.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Sur l’échiquier, le calcul de la case 9 s’écrivait en entier{' '}
              <span className="font-mono text-xs">{produitEcrit(2, 8)}</span> — et il restait des
              cases. La même chose, en court :
            </p>
            <div className="bg-white rounded-xl border-2 border-amber-200 p-4 text-center space-y-1">
              <div className="font-mono text-2xl font-black text-amber-700">
                {ecrirePuissance(2, 8)}
              </div>
              <div className="text-xs text-slate-500">
                le <strong>2</strong> dit quel facteur se répète ; le <strong>8</strong>, écrit en
                haut, dit <strong>combien de fois</strong>.
              </div>
            </div>
            <div className="bg-white rounded-xl border border-amber-100 p-3 text-sm text-slate-700">
              Cette écriture ne change pas le nombre : elle change seulement la{' '}
              <strong>place qu’il prend</strong>. Huit facteurs tiennent en deux caractères.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la ligne noire qui débordait de l’écran.</div>
          </div>
        ),
      },
    ],

    /* M2 — Ce que compte l'exposant. Le piège 2⁵ / 5² / 2×5, traité ici. */
    2: [
      {
        id: 'exposant',
        type: 'concepts',
        title: 'L’exposant compte les facteurs',
        summary: 'Le nombre écrit en haut dit COMBIEN DE FOIS le facteur apparaît. Il ne multiplie rien.',
        visual: <TowerLab a={{ base: 2, exposant: 5 }} b={{ base: 5, exposant: 2 }} />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Les deux tours n’ont ni la même hauteur, ni les mêmes briques — et pas du tout le
              même total :
            </p>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>• <strong className="font-mono">{ecrirePuissance(2, 5)}</strong> = cinq briques de 2 = <strong>32</strong> ;</li>
              <li>• <strong className="font-mono">{ecrirePuissance(5, 2)}</strong> = deux briques de 5 = <strong>25</strong> ;</li>
              <li>• et <strong className="font-mono">2 × 5</strong> = <strong>10</strong>, qui n’est ni l’un ni l’autre.</li>
            </ul>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm text-slate-700">
              <strong className="text-orange-800">L’erreur à ne plus faire :</strong> lire{' '}
              <span className="font-mono">{ecrirePuissance(2, 5)}</span> comme « 2 × 5 ». L’exposant
              n’est pas un facteur de plus — c’est un <strong>compteur</strong>.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-exposant',
        type: 'memoriser',
        title: '⭐ En haut, c’est combien de fois',
        summary: 'La base dit QUOI, l’exposant dit COMBIEN DE FOIS.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                En bas : quel facteur. En haut : combien de fois.
              </div>
              <div className="text-sm text-slate-600 font-semibold font-mono">
                {ecrirePuissance(2, 5)} = 32 &nbsp;·&nbsp; {ecrirePuissance(5, 2)} = 25 &nbsp;·&nbsp; 2 × 5 = 10
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              En cas de doute : écris les facteurs en ligne, et compte-les.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — Le carré et le cube, lus sur la figure. */
    3: [
      {
        id: 'carre-cube',
        type: 'vocabulaire',
        title: 'Le carré et le cube',
        summary: 'Ces deux mots ne sont pas des conventions : ils nomment la figure qu’on obtient en répétant le facteur deux ou trois fois.',
        visual: <SquareCubeLab cote={4} onCote={() => {}} maxCote={4} montrer="les-deux" />,
        body: (
          <div className="space-y-3">
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>
                • <strong className="font-mono">{ecrirePuissance(4, 2)}</strong> se lit{' '}
                <strong>« 4 au carré »</strong> : c’est le nombre de cases d’un{' '}
                <strong>carré</strong> de côté 4, soit 16.
              </li>
              <li>
                • <strong className="font-mono">{ecrirePuissance(4, 3)}</strong> se lit{' '}
                <strong>« 4 au cube »</strong> : c’est le nombre de petits cubes d’un{' '}
                <strong>cube</strong> d’arête 4, soit 64.
              </li>
            </ul>
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-sm text-slate-600">
              L’aire d’un carré de côté c vaut donc <strong className="font-mono">c²</strong>, et le
              volume d’un cube d’arête c vaut <strong className="font-mono">c³</strong>. La
              notation puissance et la géométrie disent la même chose.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Les carrés parfaits : treize résultats à reconnaître. */
    4: [
      {
        id: 'carres-parfaits',
        type: 'memoriser',
        title: 'Les carrés parfaits de 0 à 12',
        summary: 'Treize nombres qu’il faut reconnaître au premier coup d’œil.',
        body: (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <div className="grid gap-1.5 w-max mx-auto" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                {CARRES_PARFAITS.map(({ n, carre }) => (
                  <div key={n} className="rounded-lg border-2 border-sky-200 bg-sky-50 px-2 py-1.5 text-center">
                    <div className="font-mono text-[11px] text-sky-600">{ecrirePuissance(n, 2)}</div>
                    <div className="font-mono text-sm font-black text-sky-900">{carre}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Un <strong>carré parfait</strong> est un nombre qui est le carré d’un entier —
              autrement dit, un nombre de cases qui forme exactement un carré, sans trou ni reste.
            </p>
            <p className="text-sm text-slate-500">
              49 en est un (c’est 7 × 7) ; 50 n’en est pas un.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — Les puissances de 10, greffées sur le décalage de la virgule (6e). */
    5: [
      {
        id: 'puissance-de-dix',
        type: 'regles',
        title: 'Les puissances de 10',
        summary: '10 exposant n s’écrit 1 suivi de n zéros. Compter les zéros, c’est compter les facteurs.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 space-y-1.5">
              <div className="font-mono text-sm text-slate-700 space-y-0.5">
                <div>{ecrirePuissance(10, 2)} = 10 × 10 = <strong>100</strong> — deux zéros</div>
                <div>{ecrirePuissance(10, 3)} = 10 × 10 × 10 = <strong>1 000</strong> — trois zéros</div>
                <div>{ecrirePuissance(10, 6)} = <strong>1 000 000</strong> — six zéros</div>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Ce n’est pas une coïncidence : chaque facteur 10 ajoute un rang, donc un zéro.
              L’exposant compte les facteurs — et donc les zéros.
            </p>
            <p className="text-sm text-slate-500">
              C’est la même chose que le décalage de la virgule connu depuis la 6e : multiplier par{' '}
              <span className="font-mono">{ecrirePuissance(10, 3)}</span>, c’est décaler de trois rangs.
            </p>
          </div>
        ),
      },
    ],

    /* M6 — La priorité, déduite du sens. */
    6: [
      {
        id: 'priorite-puissance',
        type: 'regles',
        title: 'La puissance passe avant tout',
        summary: 'Dans un calcul, on effectue les puissances d’abord, puis les × et ÷, puis les + et −.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-rose-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono">
                3 × {ecrirePuissance(2, 3)} = 3 × 8 = <strong>24</strong>
              </div>
              <div className="text-xs text-slate-500">
                et non (3 × 2)³ = 216. La puissance ne concerne que le nombre juste en dessous
                d’elle — ici le 2, pas le produit entier.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              L’ordre complet devient donc : <strong>parenthèses</strong>, puis{' '}
              <strong>puissances</strong>, puis <strong>× et ÷</strong>, puis{' '}
              <strong>+ et −</strong>.
            </p>
            <p className="text-sm text-slate-500">
              C’est logique : <span className="font-mono">{ecrirePuissance(2, 3)}</span> n’est
              qu’une façon courte d’écrire 8. Ce raccourci doit être déplié avant qu’on puisse s’en
              servir dans le reste du calcul.
            </p>
          </div>
        ),
      },
    ],
  },
};
