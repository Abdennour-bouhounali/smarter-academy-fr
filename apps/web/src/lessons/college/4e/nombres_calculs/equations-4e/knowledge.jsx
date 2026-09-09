import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Équations du premier degré » (4e) —
 * SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md). Aucun module n'écrit son propre
 * résumé.
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     l'équilibre se conserve si on agit des DEUX côtés (M1)
 *          ↓
 *     équation, solution, vérification (M2)
 *          ↓
 *     x + b = c et ax = c — un seul geste (M3)
 *          ↓
 *     ax + b = c — deux gestes, dans cet ordre (M4)
 *          ↓
 *     traduire un problème (M5) → résoudre et interpréter (M6)
 *
 * Rien n'y est arbitraire : on ne peut pas résoudre ax + b = c (M4) sans
 * savoir défaire une addition ET une multiplication séparément (M3), et
 * traduire un problème (M5) n'a d'intérêt qu'une fois qu'on sait résoudre ce
 * qu'on écrit.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées au module
 * qui le déclare.
 *
 * Ce que cette carte NE contient PAS : réduire, développer, factoriser. Ce
 * sont les acquis de la partie 1 (« Calcul littéral »), listés dans
 * `priorKnowledge` et diagnostiqués au module 0.
 */

/** Une balance schématique, non interactive — réutilisée par les items. */
const MiniBalance = ({ gauche, droite, equilibre = true }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-center gap-3">
      <span className="rounded-lg border-2 border-slate-300 bg-slate-50 px-3 py-1.5 font-mono text-sm font-bold text-slate-700">
        {gauche}
      </span>
      <span className={`text-xl font-black ${equilibre ? 'text-emerald-600' : 'text-rose-500'}`}>
        {equilibre ? '=' : '≠'}
      </span>
      <span className="rounded-lg border-2 border-slate-300 bg-slate-50 px-3 py-1.5 font-mono text-sm font-bold text-slate-700">
        {droite}
      </span>
    </div>
    <svg viewBox="0 0 200 46" className="mx-auto h-10 w-40" aria-hidden="true">
      <line x1="20" y1="14" x2="180" y2="14" stroke={equilibre ? '#059669' : '#dc2626'} strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1="14" x2="100" y2="38" stroke="#64748b" strokeWidth="3" />
      <line x1="76" y1="40" x2="124" y2="40" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="14" r="4" fill="#475569" />
    </svg>
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — L'équilibre et ce qui le conserve. Aucun vocabulaire d'équation
       encore : seulement le constat sur la balance. */
    1: [
      {
        id: 'equilibre-conserve',
        type: 'regles',
        title: 'Ce qui conserve l’équilibre',
        summary: 'Une balance reste en équilibre si — et seulement si — on fait exactement la même chose des DEUX côtés.',
        visual: <MiniBalance gauche="x + 3" droite="8" />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Retirer 3 d’un seul plateau fait pencher la balance. Retirer 3 des{' '}
              <strong>deux</strong> plateaux ne change rien à l’équilibre — mais fait disparaître le
              3 du côté gauche.
            </p>
            <div className="space-y-1 rounded-xl border border-indigo-100 bg-white p-3 font-mono text-sm text-slate-700">
              <div>x + 3 = 8</div>
              <div className="text-emerald-600">− 3 des deux côtés</div>
              <div className="font-bold text-indigo-700">x = 5</div>
            </div>
            <p className="text-sm text-slate-600">
              Les gestes autorisés sont ceux qu’on peut faire des deux côtés :{' '}
              <strong>ajouter</strong>, <strong>retirer</strong>, <strong>multiplier</strong>,{' '}
              <strong>diviser</strong> (par un nombre non nul).
            </p>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : le fléau qui basculait dès que tu ne touchais qu’un seul plateau.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Le vocabulaire, et le test. */
    2: [
      {
        id: 'equation-solution',
        type: 'vocabulaire',
        title: 'Équation et solution',
        summary: 'Une équation est une égalité contenant une inconnue ; sa solution est la valeur qui la rend vraie.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              <MathText>{'$3x + 1 = 10$'}</MathText> est une <strong>équation</strong> : une égalité
              où figure une lettre inconnue. Ses deux côtés s’appellent les{' '}
              <strong>membres</strong>.
            </p>
            <p className="text-sm text-slate-700">
              <strong>Résoudre</strong> l’équation, c’est trouver toutes les valeurs de x qui la
              rendent vraie. Ici, une seule convient : <strong>x = 3</strong>, et c’est sa{' '}
              <strong>solution</strong>.
            </p>
            <div className="rounded-xl border-2 border-violet-200 bg-white p-3 text-sm text-slate-600">
              Une équation n’est ni vraie ni fausse en soi : elle est vraie{' '}
              <strong>pour certaines valeurs</strong>. C’est ce qui la distingue d’une égalité comme
              2(x + 3) = 2x + 6, vraie pour toutes.
            </div>
          </div>
        ),
      },
      {
        id: 'verifier-une-solution',
        type: 'methodes',
        title: 'Vérifier une solution',
        summary: 'On remplace l’inconnue par la valeur et on calcule les deux membres SÉPARÉMENT : ils doivent tomber égaux.',
        body: (
          <div className="space-y-3">
            <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-3 font-mono text-sm text-slate-700">
              <div className="text-slate-500">3x + 1 = 10, pour x = 3 :</div>
              <div>membre de gauche : 3 × 3 + 1 = 10</div>
              <div>membre de droite : 10</div>
              <div className="font-bold text-emerald-600">10 = 10 → x = 3 est bien solution</div>
            </div>
            <p className="text-sm text-slate-600">
              Cette vérification ne coûte rien et attrape presque toutes les erreurs de calcul. À
              faire systématiquement après avoir résolu.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — Les deux équations à un geste. */
    3: [
      {
        id: 'defaire-une-operation',
        type: 'methodes',
        title: 'Défaire une opération',
        summary: 'Pour isoler l’inconnue, on applique aux deux membres l’opération qui DÉFAIT celle qui la gêne.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1 rounded-xl border-2 border-sky-200 bg-white p-3 font-mono text-sm text-slate-700">
                <div>x + 7 = 12</div>
                <div className="text-emerald-600">− 7 des deux côtés</div>
                <div className="font-bold text-sky-700">x = 5</div>
              </div>
              <div className="space-y-1 rounded-xl border-2 border-sky-200 bg-white p-3 font-mono text-sm text-slate-700">
                <div>4x = 20</div>
                <div className="text-emerald-600">÷ 4 des deux côtés</div>
                <div className="font-bold text-sky-700">x = 5</div>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              L’addition se défait par une <strong>soustraction</strong>, la multiplication par une{' '}
              <strong>division</strong>. Le geste s’applique toujours aux <strong>deux</strong>
              {' '}membres.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-des-deux-cotes',
        type: 'memoriser',
        title: '⭐ Des deux côtés, toujours',
        summary: 'Tout ce qu’on fait à un membre, on le fait à l’autre.',
        body: (
          <div className="space-y-3">
            <div className="space-y-2 rounded-xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
              <div className="text-lg font-black text-rose-700 sm:text-xl">
                Un geste sur UN seul membre
              </div>
              <div className="text-lg font-black text-rose-700 sm:text-xl">
                = la balance bascule, l’équation est fausse
              </div>
            </div>
            <p className="text-center text-xs text-slate-500">
              C’est la seule règle. Le « changement de côté » n’en est que le résumé.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — Les deux gestes, et leur ordre. */
    4: [
      {
        id: 'resoudre-ax-plus-b',
        type: 'methodes',
        title: 'Résoudre ax + b = c',
        summary: 'On enlève d’abord la constante, on partage ensuite : l’ordre est imposé par la structure du calcul.',
        body: (
          <div className="space-y-3">
            <div className="space-y-1 rounded-xl border-2 border-emerald-200 bg-white p-3 font-mono text-sm text-slate-700">
              <div>5x − 4 = 11</div>
              <div className="text-emerald-600">+ 4 des deux côtés</div>
              <div>5x = 15</div>
              <div className="text-emerald-600">÷ 5 des deux côtés</div>
              <div className="font-bold text-emerald-700">x = 3</div>
            </div>
            <p className="text-sm text-slate-700">
              <strong>Pourquoi cet ordre ?</strong> Parce que le 5 multiplie le x SEUL, pas le
              « x − 4 ». Diviser d’abord par 5 obligerait à diviser aussi le 4, ce qui complique au
              lieu de simplifier.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <strong>Vérification :</strong> 5 × 3 − 4 = 15 − 4 = 11 ✓
            </div>
          </div>
        ),
      },
    ],

    /* M5 — La modélisation. */
    5: [
      {
        id: 'modeliser-par-une-equation',
        type: 'methodes',
        title: 'Traduire un problème',
        summary: 'On nomme l’inconnue, on traduit chaque phrase en calcul, on écrit l’égalité — et seulement ensuite on résout.',
        body: (
          <div className="space-y-3">
            <div className="space-y-1.5 rounded-xl border-2 border-amber-200 bg-white p-3 text-sm text-slate-700">
              <div className="text-slate-500 italic">
                « Un carnet coûte 3 € de plus qu’un stylo. Ensemble, ils coûtent 11 €. »
              </div>
              <div><strong>1.</strong> je nomme : x = le prix du stylo</div>
              <div><strong>2.</strong> je traduis : le carnet coûte x + 3</div>
              <div><strong>3.</strong> j’écris l’égalité : x + (x + 3) = 11</div>
              <div><strong>4.</strong> je réduis : 2x + 3 = 11</div>
              <div><strong>5.</strong> je résous : x = 4</div>
              <div className="font-semibold text-amber-700">
                <strong>6.</strong> j’interprète : le stylo coûte 4 €, le carnet 7 €
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Les deux étapes qu’on oublie le plus souvent sont la première (<strong>dire ce que x
              représente</strong>) et la dernière (<strong>répondre à la question posée</strong>,
              pas seulement donner x).
            </p>
          </div>
        ),
      },
      {
        id: 'controler-le-sens',
        type: 'regles',
        title: 'Contrôler le résultat',
        summary: 'Une solution doit avoir un sens dans la situation : un prix négatif ou un nombre de personnes décimal signale une erreur de traduction.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Le calcul peut être juste et la réponse absurde : si x représente un nombre d’élèves
              et qu’on trouve 7,5, c’est l’<strong>équation</strong> qu’il faut relire, pas la
              division.
            </p>
            <p className="text-slate-600">
              Deux contrôles, toujours : la solution vérifie-t-elle l’équation, et a-t-elle un sens
              dans le problème ?
            </p>
          </div>
        ),
      },
    ],
  },
};
