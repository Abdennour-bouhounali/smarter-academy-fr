import React from 'react';
import { fr, TICKET, writeExpr } from './components/operations';

/**
 * Connaissances de la leçon « Opérations » (5e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés. Deux présentations
 * consomment ces données : le tiroir « Ma carte » et l'« À retenir » de fin de
 * module ; la synthèse du test final affiche la carte complète. Aucun module
 * n'écrit son propre résumé (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE, dans l'ordre où la carte se construit :
 *
 *     structure d'un calcul  (M1)
 *              ↓
 *     priorités opératoires  (M2) ←── parenthèses (M1)
 *              ↓
 *     enchaînement           (M3)
 *              ↓                ↘
 *     découper un calcul (M4)     diviser par un décimal (M5)
 *              ↓                ↙
 *     ordre de grandeur / contrôle (M7)
 *
 *     multiples & diviseurs (M6) — branche autonome, greffée sur la division.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. Les priorités n'apparaissent qu'au module 2,
 * multiples et diviseurs au 3, l'enchaînement au 4, le découpage au 5, la
 * division décimale au 6.
 */

/** Le ruban d'un calcul, non interactif — réutilisé par les items. */
const Ruban = ({ expr, paren = null, valeur, ton = 'slate' }) => {
  const TON = {
    slate: 'border-slate-200 bg-slate-50 text-slate-800',
    amber: 'border-amber-300 bg-amber-50 text-amber-900',
    indigo: 'border-indigo-300 bg-indigo-50 text-indigo-900',
  };
  return (
    <div className={`rounded-xl border-2 px-3 py-2.5 text-center ${TON[ton]}`}>
      <span className="font-mono text-lg sm:text-xl font-black tabular-nums">
        {writeExpr(expr, paren)} = {fr(valeur)}
      </span>
    </div>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Un calcul a une structure ; la parenthèse la désigne. Ni convention
       de priorité (M2), ni enchaînement (M3), ni décimaux (M5). */
    1: [
      {
        id: 'structure-calcul',
        type: 'concepts',
        title: 'Un calcul a une structure',
        summary: 'Les mêmes nombres, dans le même ordre, peuvent donner deux résultats : ce qui compte, c’est ce qu’on calcule d’abord.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Le ticket <strong className="font-mono">2 + 3 × 4</strong> se lit de deux façons —
              et elles ne donnent pas la même chose :
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 text-center">D’abord la somme</div>
                <Ruban expr={TICKET} paren={{ from: 0, to: 1 }} valeur={20} ton="amber" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-500 text-center">D’abord le produit</div>
                <Ruban expr={TICKET} paren={{ from: 1, to: 2 }} valeur={14} ton="indigo" />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-indigo-100 p-3 text-sm text-slate-700">
              Un calcul n’est donc pas une phrase qu’on lit de gauche à droite. Il a une{' '}
              <strong>structure</strong> : des morceaux qui se calculent avant les autres.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux caisses qui n’affichaient pas le même total.</div>
          </div>
        ),
      },
      {
        id: 'parentheses',
        type: 'vocabulaire',
        title: 'Les parenthèses',
        summary: 'Une paire de parenthèses désigne le morceau à calculer en premier.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Écrire <strong className="font-mono">(2 + 3) × 4</strong>, c’est dire :{' '}
              <em>fais d’abord 2 + 3, puis multiplie par 4</em>. Les nombres n’ont pas changé —
              seule la structure a été rendue explicite.
            </p>
            <p className="text-slate-500">
              Les parenthèses ne calculent rien par elles-mêmes : elles indiquent l’ordre.
            </p>
          </div>
        ),
      },
    ],

    /* M2 — La convention. Elle vient de ce que le calcul RACONTE. */
    2: [
      {
        id: 'priorites',
        type: 'regles',
        title: 'Les priorités opératoires',
        summary: 'Sans parenthèses, on effectue d’abord les × et les ÷, puis les + et les −.',
        visual: <Ruban expr={TICKET} valeur={14} ton="indigo" />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-violet-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                <strong className="font-mono">2 + 3 × 4 = 2 + 12 = 14</strong>
              </div>
              <div className="text-xs text-slate-500">
                Le produit <strong className="font-mono">3 × 4</strong> forme un bloc : trois
                paquets de quatre. On compte d’abord ce bloc, puis on lui ajoute 2.
              </div>
            </div>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• D’abord ce qui est entre <strong>parenthèses</strong> ;</li>
              <li>• puis les <strong>× et les ÷</strong> ;</li>
              <li>• enfin les <strong>+ et les −</strong>.</li>
            </ul>
            <p className="text-sm text-slate-600">
              À priorité égale, on va de <strong>gauche à droite</strong>.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-priorites',
        type: 'memoriser',
        title: '⭐ Parenthèses, puis × ÷, puis + −',
        summary: 'L’ordre est toujours le même, quel que soit le calcul.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                ( ) &nbsp;→&nbsp; × ÷ &nbsp;→&nbsp; + −
              </div>
              <div className="text-sm text-slate-600 font-semibold font-mono">
                2 + 3 × 4 = 14 &nbsp;&nbsp;·&nbsp;&nbsp; (2 + 3) × 4 = 20
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              En cas de doute : entoure mentalement le produit, et regarde ce qui reste.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — Multiples et diviseurs : quand la division tombe juste. */
    3: [
      {
        id: 'multiple-diviseur',
        type: 'vocabulaire',
        title: 'Multiple et diviseur',
        summary: 'Si la division tombe juste, le diviseur « divise » le nombre, et le nombre est un « multiple » du diviseur.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-amber-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono">24 = 4 × 6</div>
              <div className="text-xs text-slate-500">
                Une seule égalité, deux façons de la dire : <strong>4 est un diviseur de 24</strong>{' '}
                (le rectangle de largeur 4 est plein), et <strong>24 est un multiple de 4</strong>{' '}
                (24 est dans la table de 4). 6 aussi est un diviseur de 24.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Un nombre a toujours <strong>1</strong> et <strong>lui-même</strong> comme diviseurs.
            </p>
          </div>
        ),
      },
      {
        id: 'criteres-divisibilite',
        type: 'regles',
        title: 'Reconnaître un multiple sans poser la division',
        summary: 'Le dernier chiffre, ou la somme des chiffres, suffit à répondre.',
        body: (
          <div className="space-y-2">
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>• <strong>par 2</strong> : le chiffre des unités est 0, 2, 4, 6 ou 8 ;</li>
              <li>• <strong>par 5</strong> : le chiffre des unités est 0 ou 5 ;</li>
              <li>• <strong>par 10</strong> : le chiffre des unités est 0 ;</li>
              <li>• <strong>par 3</strong> : la somme des chiffres est un multiple de 3 ;</li>
              <li>• <strong>par 9</strong> : la somme des chiffres est un multiple de 9.</li>
            </ul>
            <div className="bg-white rounded-xl border border-amber-100 p-3 text-sm text-slate-600">
              <span className="font-mono">738</span> : 7 + 3 + 8 = 18, qui est dans la table de 9.
              Donc 738 est un multiple de 9 — sans poser la division.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Enchaîner : lire la structure AVANT de calculer. */
    4: [
      {
        id: 'enchainement',
        type: 'methodes',
        title: 'Enchaîner plusieurs opérations',
        summary: 'On repère d’abord la structure du calcul, puis on effectue une opération à la fois.',
        visual: <Ruban expr={{ nums: [20, 4, 3, 6], ops: ['−', '×', '+'] }} valeur={14} />,
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Devant <strong className="font-mono">20 − 4 × 3 + 6</strong>, on ne se demande pas
              « par quoi je commence ? » au hasard. On lit la structure :{' '}
              <em>une différence, un produit, une somme</em> — et le produit est prioritaire.
            </p>
            <ol className="space-y-1 list-decimal list-inside text-slate-700">
              <li><span className="font-mono">4 × 3 = 12</span> — le seul produit ;</li>
              <li><span className="font-mono">20 − 12 = 8</span> — puis de gauche à droite ;</li>
              <li><span className="font-mono">8 + 6 = 14</span>.</li>
            </ol>
            <p className="text-slate-500">
              À chaque étape, on réécrit le calcul en entier : il devient plus court, jamais plus
              compliqué.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — Découper pour calculer de tête. Propriété NUMÉRIQUE, pas littérale. */
    5: [
      {
        id: 'decouper-calcul',
        type: 'methodes',
        title: 'Découper un calcul pour le faire de tête',
        summary: 'Un produit difficile se coupe en deux produits faciles, et on ajoute les morceaux.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono">
                17 × 6 = 17 × 5 + 17 × 1 = 85 + 17 = 102
              </div>
              <div className="text-xs text-slate-500">
                Six paquets de 17, c’est cinq paquets de 17 plus un paquet de 17. On n’a rien
                ajouté ni enlevé : on a seulement rangé autrement.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Le même geste marche dans l’autre sens, en <strong>regroupant</strong> :{' '}
              <span className="font-mono">4 × 37 × 25 = (4 × 25) × 37 = 100 × 37 = 3 700</span>.
            </p>
            <p className="text-sm text-slate-500">
              Découper ou regrouper ne change jamais le résultat — c’est ce qui rend le calcul
              mental sûr, et pas seulement rapide.
            </p>
          </div>
        ),
      },
    ],

    /* M6 — Diviser par un décimal : l'invariant du quotient. */
    6: [
      {
        id: 'quotient-invariant',
        type: 'regles',
        title: 'Le quotient ne change pas',
        summary: 'Si on multiplie le dividende ET le diviseur par le même nombre, le quotient reste le même.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-purple-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono">
                7,2 ÷ 0,4 = 72 ÷ 4 = 18
              </div>
              <div className="text-xs text-slate-500">
                On a multiplié les <strong>deux</strong> nombres par 10. Le partage est le même :
                deux fois plus de gâteau pour deux fois plus de personnes, chacun a toujours la
                même part.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              C’est ce qui permet de <strong>faire disparaître la virgule du diviseur</strong> :
              on se ramène à une division déjà connue.
            </p>
          </div>
        ),
      },
      {
        id: 'diviser-decimal',
        type: 'methodes',
        title: 'Diviser par un nombre décimal',
        summary: 'On décale la virgule des deux nombres du même nombre de rangs, jusqu’à ce que le diviseur soit entier.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="space-y-1 list-decimal list-inside">
              <li>Compter les chiffres après la virgule du <strong>diviseur</strong> ;</li>
              <li>multiplier <strong>les deux</strong> nombres par 10, 100… autant de fois ;</li>
              <li>effectuer la division, maintenant à diviseur entier.</li>
            </ol>
            <div className="bg-white rounded-xl border border-purple-100 p-3">
              <span className="font-mono">6 ÷ 0,25 = 600 ÷ 25 = 24</span>
            </div>
            <p className="text-slate-500">
              Attention : diviser par un nombre <strong>plus petit que 1</strong> donne un
              résultat <strong>plus grand</strong> que le dividende. Ce n’est pas une erreur.
            </p>
          </div>
        ),
      },
    ],


    /* M7 — Le contrôle. Il s'appuie sur tout ce qui précède. */
    7: [
      {
        id: 'ordre-de-grandeur',
        type: 'methodes',
        title: 'Contrôler par l’ordre de grandeur',
        summary: 'Avant de croire un résultat, on l’estime avec des nombres ronds.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Pour <span className="font-mono">12 × 2,5 + 8 × 3,2</span>, on estime :
              12 × 2,5 est proche de <strong>30</strong>, 8 × 3,2 est proche de{' '}
              <strong>24</strong>. Le total doit tourner autour de <strong>55</strong>.
            </p>
            <div className="bg-white rounded-xl border border-rose-100 p-3">
              Un résultat annoncé à <span className="font-mono">556</span> ou{' '}
              <span className="font-mono">5,56</span> est donc faux : c’est presque toujours une{' '}
              <strong>virgule mal placée</strong>.
            </div>
            <p className="text-slate-500">
              L’estimation ne remplace pas le calcul : elle dit si le calcul mérite d’être cru.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-controler',
        type: 'memoriser',
        title: '⭐ Estimer avant, vérifier après',
        summary: 'Un ordre de grandeur en tête, et une virgule mal placée se voit tout de suite.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                J’estime, je calcule, je compare
              </div>
              <div className="text-sm text-slate-600 font-semibold">
                Si l’écart est énorme, c’est la virgule.
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
};
