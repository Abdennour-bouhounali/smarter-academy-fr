import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Nombres réels » — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte des connaissances ; la
 * carte que voit l'élève est la réduction cumulative des modules validés
 * (components/knowledgeState.js). Deux présentations consomment ces données :
 * le tiroir « Ma carte » (components/KnowledgeMap.jsx) et l'« À retenir » de
 * fin de module (components/KnowledgeSnapshot.jsx) ; la synthèse du test
 * final affiche la carte complète. Aucun module n'écrit son propre résumé.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. Les noms des familles arrivent au module 2, le
 * critère par les restes au module 3, arrondi / troncature au module 4.
 *
 * Numérotation : le module « À retenir » (ex-05) a été supprimé ;
 * « Encadrer et comparer » est devenu le module 5 et le test final le 6.
 */
export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le zoom infini : la droite, l'encadrement décimal, et les trois
       comportements observés (sans les nommer : c'est le module 2). */
    1: [
      {
        id: 'droite-reelle',
        type: 'concepts',
        title: 'La droite des nombres',
        summary: 'Tout nombre est un point de la droite graduée, et chaque zoom ×10 en donne un chiffre de plus.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Zoomer ×10 sur un nombre, c’est lire un chiffre supplémentaire de son écriture décimale et resserrer
              son encadrement.
            </p>
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-0.5 font-mono text-sm text-slate-800">
              <div>1 &lt; √2 &lt; 2</div>
              <div>1,4 &lt; √2 &lt; 1,5</div>
              <div>1,41 &lt; √2 &lt; 1,42</div>
              <div>1,414 &lt; √2 &lt; 1,415</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le mètre-ruban du carreleur, zoomé encore et encore.</div>
          </div>
        ),
      },
      {
        id: 'trois-comportements',
        type: 'concepts',
        title: 'Trois comportements au zoom',
        summary: 'Une écriture décimale s’arrête, se répète, ou ne fait ni l’un ni l’autre.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2">
              <div className="rounded-xl bg-white border border-blue-200 p-3">
                <div className="font-mono font-bold text-slate-800">2/8 = 0,25</div>
                <div className="text-xs text-slate-500">l’écriture <strong>s’arrête</strong> : le point tombe sur une graduation</div>
              </div>
              <div className="rounded-xl bg-white border border-blue-200 p-3">
                <div className="font-mono font-bold text-slate-800">1/3 = 0,333…</div>
                <div className="text-xs text-slate-500">l’écriture <strong>se répète</strong></div>
              </div>
              <div className="rounded-xl bg-white border border-blue-200 p-3">
                <div className="font-mono font-bold text-slate-800">√2 = 1,4142… &nbsp;·&nbsp; π</div>
                <div className="text-xs text-slate-500"><strong>ni l’un ni l’autre</strong> : aucun motif ne revient</div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Ces trois comportements donneront les familles de nombres du module suivant.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-encadrer-decimales',
        type: 'methodes',
        title: 'Lire un encadrement décimal',
        summary: 'À n décimales, le nombre est pris entre deux graduations distantes de 10⁻ⁿ.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">1,41 &lt; √2 &lt; 1,42</div>
              <div className="text-xs text-slate-500">un encadrement à deux décimales, d’amplitude 0,01.</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Le nombre de décimales des bornes indique la précision : 1,4 &lt; √2 &lt; 1,5 est correct, mais dix fois
              moins précis.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Les familles de nombres : ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ. */
    2: [
      {
        id: 'familles-emboitees',
        type: 'regles',
        title: 'Les familles de nombres sont emboîtées',
        summary: 'ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ : chaque famille est contenue dans la suivante.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 text-center">
              <div className="font-mono text-base font-black text-slate-800">ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ</div>
            </div>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li><strong>ℕ</strong> — entiers naturels : 0, 1, 2, 3…</li>
              <li><strong>ℤ</strong> — entiers relatifs : …, −2, −1, 0, 1, 2…</li>
              <li><strong>𝔻</strong> — décimaux : écriture décimale finie</li>
              <li><strong>ℚ</strong> — rationnels : quotients d’entiers</li>
              <li><strong>ℝ</strong> — réels : tous les points de la droite</li>
            </ul>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              L’inclusion ne marche que dans un sens : tout décimal est rationnel, mais 1/3 ∈ ℚ et 1/3 ∉ 𝔻.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les cinq boîtes emboîtées, et chaque nombre rangé dans la plus petite.</div>
          </div>
        ),
      },
      {
        id: 'decimal',
        type: 'vocabulaire',
        title: 'Nombre décimal',
        summary: 'Un nombre dont l’écriture décimale s’arrête : 0,75 ; −2,5 ; 12.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>3/4 = 0,75</div>
              <div>12 = 12,0</div>
            </div>
            <p className="text-sm text-slate-600">
              Tout entier est décimal (son écriture s’arrête tout de suite). L’inverse est faux : 0,5 n’est pas entier.
            </p>
          </div>
        ),
      },
      {
        id: 'rationnel',
        type: 'vocabulaire',
        title: 'Nombre rationnel',
        summary: 'Un nombre qui s’écrit comme une fraction d’entiers.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>1/3 · 2/7 · 5/6 · 0,75 = 75/100</div>
            </div>
            <p className="text-sm text-slate-600">
              1/3 est rationnel sans être décimal : son écriture 0,333… ne s’arrête jamais.
            </p>
          </div>
        ),
      },
      {
        id: 'irrationnel',
        type: 'vocabulaire',
        title: 'Nombre irrationnel',
        summary: 'Un réel qui n’est aucune fraction d’entiers : √2, π.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3">
              <MathText>{'$\\sqrt{2}\\quad \\pi \\quad \\sqrt{10}$'}</MathText>
            </div>
            <div className="bg-violet-50 rounded-lg p-3 text-xs text-violet-700">
              Attention : une racine carrée n’est pas automatiquement irrationnelle. √9 = 3 et √16 = 4 sont des
              entiers ; √0,25 = 0,5 est décimal. Seules les racines de nombres qui ne sont pas des carrés parfaits
              le sont.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — Décimal ou pas : le critère par les restes, et exact vs approché
       pour les fractions. */
    3: [
      {
        id: 'regle-restes-division',
        type: 'regles',
        title: 'Ce sont les restes qui décident',
        summary: 'Un reste nul arrête l’écriture ; un reste qui revient la fait tourner en rond.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1.5">
              <div className="font-mono text-sm text-slate-800">3 ÷ 8 → reste 0 après 3 chiffres : 0,375</div>
              <div className="text-xs text-slate-500">l’écriture s’arrête : 3/8 est décimal.</div>
              <div className="font-mono text-sm text-slate-800 pt-1">1 ÷ 3 → le reste 1 revient : 0,333…</div>
              <div className="text-xs text-slate-500">la machine refait le même calcul, pour toujours.</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la division posée, un chiffre à la fois, en surveillant le reste.</div>
          </div>
        ),
      },
      {
        id: 'regle-fraction-finie-ou-periodique',
        type: 'regles',
        title: 'Toute fraction s’arrête ou se répète',
        summary: 'Il n’y a qu’un nombre fini de restes possibles : le troisième cas est impossible pour une fraction.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Un reste est toujours <strong>plus petit que le diviseur</strong>. En divisant par 7, il ne peut valoir
              que 0, 1, 2, 3, 4, 5 ou 6.
            </p>
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">2/7 = 0,285714 285714…</div>
              <div className="text-xs text-slate-500">au plus 6 chiffres avant qu’un reste revienne : période 285714.</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Conséquence décisive : un nombre dont l’écriture ne s’arrête ni ne se répète, comme √2, n’est
              <strong> aucune fraction</strong> — il est irrationnel.
            </div>
          </div>
        ),
      },
      {
        id: 'exact-approche',
        type: 'concepts',
        title: 'Écriture exacte, valeur approchée',
        summary: 'Quand l’écriture décimale ne s’arrête pas, la seule écriture exacte est la fraction ou le symbole.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1 text-sm">
              <div className="text-emerald-700 font-mono">3/8 = 0,375 &nbsp;— exacte</div>
              <div className="text-rose-600 font-mono">1/3 = 0,33 &nbsp;— fausse, il manque une infinité de 3</div>
              <div className="text-emerald-700 font-mono">2/7 ≈ 0,2857 &nbsp;— approchée, d’où le ≈</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Le signe <strong>=</strong> est réservé aux écritures exactes. Dès qu’on coupe des chiffres, c’est <strong>≈</strong>.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-exact-approche',
        type: 'memoriser',
        title: '⭐ = pour l’exact, ≈ pour l’approché',
        summary: 'Une fraction ou √2 sont exacts ; 0,33 et 1,414 sont approchés.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1.5 rounded-full font-mono">= exact</span>
                <span className="bg-amber-100 text-amber-800 text-sm font-bold px-3 py-1.5 rounded-full font-mono">≈ approché</span>
              </div>
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Exact ou approché : arrondi, troncature, et le réflexe « exact
       tant qu'on calcule ». */
    4: [
      {
        id: 'arrondi-troncature',
        type: 'methodes',
        title: 'Arrondir ou tronquer',
        summary: 'La troncature coupe ; l’arrondi regarde le chiffre suivant et monte s’il vaut au moins 5.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <div className="text-slate-400 text-xs">2/3 = 0,6666… au centième</div>
              <div className="font-mono text-sm text-slate-800">troncature : 0,66</div>
              <div className="font-mono text-sm text-slate-800">arrondi : 0,67 <span className="font-sans text-xs text-slate-500">(le chiffre suivant est 6 ≥ 5)</span></div>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div className="text-slate-400 text-xs">√10 = 3,1622… au dixième</div>
              <div className="font-mono text-sm text-slate-800">arrondi : 3,2 &nbsp;·&nbsp; troncature : 3,1</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Toujours préciser la précision demandée : au dixième, au centième, au millième.
            </div>
          </div>
        ),
      },
      {
        id: 'regle-aucun-decimal-nest-racine',
        type: 'regles',
        title: 'Aucune approximation décimale n’est exacte',
        summary: 'Le carré de 1,41 ; 1,414 ; 1,4142 ne vaut jamais 2 — seul √2 le fait.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-0.5 font-mono text-sm text-slate-800">
              <div>1,41² = 1,9881</div>
              <div>1,414² = 1,999396</div>
              <div>1,4142² = 1,99996164</div>
            </div>
            <p className="text-sm text-slate-600">
              Un nombre à écriture décimale finie a un carré à écriture finie : il ne peut jamais valoir exactement 2.
              La seule écriture exacte est <MathText>{'$\\sqrt{2}$'}</MathText>.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le carreleur, sa calculatrice, et le carré qui n’atteint jamais 2.</div>
          </div>
        ),
      },
      {
        id: 'mem-exact-puis-arrondir',
        type: 'memoriser',
        title: '⭐ Exact tant qu’on calcule, approché pour conclure',
        summary: 'Garder 6π pendant le calcul, n’arrondir qu’à la fin, une seule fois.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <MathText>{'$2\\pi r = 6\\pi \\approx 18{,}85$'}</MathText>
              <div className="text-xs text-rose-600">exact pendant le calcul · arrondi seulement à la fin</div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Chaque arrondi intermédiaire perd de l’information, et les erreurs s’additionnent.
            </p>
          </div>
        ),
      },
    ],

    /* M5 (ex-M6) — Encadrer et comparer : encadrement par les carrés, ordre,
       et le sens d'arrondi imposé par la situation. */
    5: [
      {
        id: 'methode-encadrer-racine',
        type: 'methodes',
        title: 'Encadrer une racine par des carrés',
        summary: 'Encadrer n entre deux carrés encadre √n entre leurs racines.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">9 = 3² ≤ 10 &lt; 4² = 16 &nbsp;⇒&nbsp; 3 ≤ √10 &lt; 4</div>
              <div className="font-mono text-sm text-slate-800">3,1² = 9,61 ≤ 10 &lt; 10,24 = 3,2² &nbsp;⇒&nbsp; 3,1 ≤ √10 &lt; 3,2</div>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div className="text-slate-400 text-xs">La diagonale d’un champ carré de 20 m</div>
              <div className="font-mono text-sm text-slate-800">28² = 784 ≤ 800 &lt; 841 = 29² ⇒ 28 ≤ √800 &lt; 29</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Sans calculatrice, et à la précision qu’on veut : l’encadrement se resserre à chaque niveau.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les carrés essayés autour de 10, puis autour de 800.</div>
          </div>
        ),
      },
      {
        id: 'methode-comparer-reels',
        type: 'methodes',
        title: 'Comparer des réels',
        summary: 'Les ramener à une même écriture décimale, puis les placer sur la même droite.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">1,41 &lt; √2 &lt; 1,415 &lt; 1,5 = 3/2</div>
              <div className="text-xs text-slate-500">√2 ≈ 1,4142… : une approximation suffisamment précise permet de trancher.</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Une valeur approchée sert à <strong>comparer</strong> et à <strong>situer</strong>, jamais à remplacer
              l’écriture exacte dans un calcul.
            </div>
          </div>
        ),
      },
      {
        id: 'regle-sens-arrondi',
        type: 'regles',
        title: 'La situation impose parfois le sens de l’arrondi',
        summary: 'Pour un câble le long d’une diagonale de 28,28 m, il faut 29 m — pas l’arrondi le plus proche.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">√800 ≈ 28,28 m → acheter 29 m</div>
              <div className="text-xs text-slate-500">28 m serait trop court : ici on arrondit obligatoirement au-dessus.</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              La règle du chiffre suivant donne la valeur la plus proche. Le contexte, lui, peut exiger un
              dépassement — ou au contraire une valeur par défaut.
            </div>
          </div>
        ),
      },
    ],
  },
};
