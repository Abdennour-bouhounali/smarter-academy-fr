import React from 'react';
import RealLine from '../../../../common/components/RealLine';

/**
 * Connaissances de la leçon « Ensembles et intervalles » — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte des connaissances ; la
 * carte que voit l'élève est la réduction cumulative des modules validés
 * (components/knowledgeState.js). Deux présentations consomment ces données :
 * le tiroir « Ma carte » (components/KnowledgeMap.jsx) et l'« À retenir » de
 * fin de module (components/KnowledgeSnapshot.jsx) ; la synthèse du test
 * final affiche la carte complète. Aucun module n'écrit son propre résumé.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. Le mot « intervalle » et les crochets ne sont
 * nommés qu'au module 3 (le module 1 parle de plage et de bornes) ; ∩ et ∪
 * sur des intervalles n'arrivent qu'au module 5.
 *
 * Forme d'un item — celle qu'attend KnowledgeMap.jsx :
 *   { id, type: <catégorie de CATEGORIES>, title, summary, visual?, body }
 * `module` et `isNew` sont ajoutés par le réducteur, jamais écrits ici.
 */

/** Petite droite graduée figée, réutilisée par les items (plain SVG, imprimable). */
const line = (props) => (
  <div className="rounded-xl border border-slate-200 bg-white p-1.5">
    <RealLine step={1} {...props} />
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le panneau du manège : une plage contient TOUS les nombres entre
       ses bornes ; le sort de chaque borne se décide séparément. Le mot
       « intervalle » n'est pas encore donné : il arrive au module 3. */
    1: [
      {
        id: 'borne-incluse-exclue',
        type: 'concepts',
        title: 'Borne incluse, borne exclue',
        summary: 'Chaque borne d’une plage se décide à part : elle appartient à l’ensemble, ou non.',
        visual: line({
          min: 1, max: 2.2, step: 0.1, labelEvery: 2,
          intervals: [{ id: 'M', from: 1.2, to: 1.9, openTo: true, tone: 'indigo', label: '1,2 inclus · 1,9 exclu' }],
          points: [
            { id: 'a', value: 1.2, label: '1,2', tone: 'emerald' },
            { id: 'b', value: 1.9, label: '1,9', tone: 'rose', open: true },
          ],
          ariaLabel: 'Plage de 1,2 inclus à 1,9 exclu',
        }),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Une plage de nombres est délimitée par deux <strong>bornes</strong>. Pour chacune, une décision
              indépendante : la borne fait partie de l’ensemble, ou elle en est exclue.
            </p>
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1.5">
              <div className="text-slate-400 text-xs">Les mots qui décident</div>
              <div className="text-sm text-slate-700">« <strong>à partir de</strong> 1,20 » → 1,20 est <strong>inclus</strong>.</div>
              <div className="text-sm text-slate-700">« <strong>moins de</strong> 1,90 » → 1,90 est <strong>exclu</strong>.</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Les mêmes bornes peuvent décrire deux ensembles différents : ce qui change, ce n’est pas la plage,
              c’est le sort de chaque borne.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le panneau du manège — 1,899 m passe, 1,90 m non.</div>
          </div>
        ),
      },
      {
        id: 'plage-infinite',
        type: 'concepts',
        title: 'Une plage contient une infinité de nombres',
        summary: 'Entre deux bornes, il y a tous les nombres — pas seulement ceux qu’on sait mesurer.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Entre deux nombres, il y en a toujours un troisième : 1,895, puis 1,8999, puis 1,89999…
            </p>
            <div className="bg-white rounded-xl border border-blue-100 p-3">
              <div className="text-slate-400 text-xs mb-1">Conséquence</div>
              <div className="text-sm text-slate-700">
                Une plage de nombres ne se compte pas. Entre 1,20 et 1,90 il n’y a ni 70 ni 700 tailles possibles,
                mais une <strong>infinité</strong>.
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'mem-borne',
        type: 'memoriser',
        title: '⭐ Le crochet décide de la borne',
        summary: 'Crochet tourné vers le nombre : borne incluse. Tourné vers l’extérieur : borne exclue.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg font-black text-rose-700">Le crochet regarde le nombre ?</div>
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full font-mono">[1,2 → inclus</span>
                <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full font-mono">1,9[ → exclu</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Seules les bornes se discutent : tout ce qui est strictement entre elles appartient, toujours.
            </p>
          </div>
        ),
      },
    ],

    /* M2 — Le langage des ensembles : ∈, ∉, ⊂, ∩, ∪, ∅ sur des ensembles de
       nombres rangés à la main. Aucun intervalle ici. */
    2: [
      {
        id: 'ensemble',
        type: 'concepts',
        title: 'Ensemble',
        summary: 'Une collection d’objets bien définie : pour tout objet, on sait dire s’il en fait partie.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Un <strong>ensemble</strong> est une collection d’éléments. Ce qui le définit, c’est qu’on puisse
              toujours trancher : cet élément en fait partie, ou il n’en fait pas partie.
            </p>
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="text-slate-400 text-xs">Exemples</div>
              <div className="font-mono text-sm text-slate-700">A = {'{'}1 ; 2 ; 3 ; 4 ; 6 ; 12{'}'} — les diviseurs de 12</div>
              <div className="text-sm text-slate-700">ℕ, ℤ, ℝ — des ensembles de nombres.</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les boîtes emboîtées et les deux cercles à remplir.</div>
          </div>
        ),
      },
      {
        id: 'vocab-appartenance',
        type: 'vocabulaire',
        title: 'Appartenance : ∈ et ∉',
        summary: '7 ∈ ℕ se lit « 7 appartient à ℕ » ; −3 ∉ ℕ, « n’appartient pas ».',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 space-y-1.5">
              <div className="font-mono font-bold text-slate-800">7 ∈ ℕ</div>
              <div className="text-xs text-slate-500">« 7 appartient à ℕ » — l’élément est dans l’ensemble.</div>
              <div className="font-mono font-bold text-slate-800 pt-1">−3 ∉ ℕ</div>
              <div className="text-xs text-slate-500">« −3 n’appartient pas à ℕ » — mais −3 ∈ ℤ.</div>
            </div>
            <p className="text-sm text-slate-600">
              Le symbole ∈ relie un <strong>élément</strong> à un <strong>ensemble</strong>. À gauche un nombre, à droite un ensemble.
            </p>
          </div>
        ),
      },
      {
        id: 'vocab-inclusion',
        type: 'vocabulaire',
        title: 'Inclusion : ⊂',
        summary: 'ℕ ⊂ ℤ ⊂ ℝ : tous les éléments du premier ensemble sont dans le second.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3">
              <div className="font-mono font-bold text-slate-800">ℕ ⊂ ℤ ⊂ ℝ</div>
              <div className="text-xs text-slate-500 mt-1">« ℕ est inclus dans ℤ » — la petite boîte est dans la grande.</div>
            </div>
            <ul className="space-y-1 text-sm text-slate-700">
              <li><strong>ℕ</strong> — les entiers naturels : 0, 1, 2, 3… (0 en fait partie)</li>
              <li><strong>ℤ</strong> — les entiers relatifs : …, −2, −1, 0, 1, 2…</li>
              <li><strong>ℝ</strong> — les réels : tous les points de la droite graduée</li>
            </ul>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              ⊂ relie deux <strong>ensembles</strong>, ∈ relie un élément à un ensemble. ℤ ⊂ ℕ est faux : −3 ∈ ℤ mais −3 ∉ ℕ.
            </div>
          </div>
        ),
      },
      {
        id: 'vocab-intersection-reunion',
        type: 'vocabulaire',
        title: 'Intersection ∩ et réunion ∪',
        summary: '∩ : dans les deux à la fois. ∪ : dans l’un ou l’autre (ou les deux).',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 space-y-1.5">
              <div className="text-slate-400 text-xs">A = diviseurs de 12, B = diviseurs de 18</div>
              <div className="font-mono text-sm text-slate-800">A ∩ B = {'{'}1 ; 2 ; 3 ; 6{'}'}</div>
              <div className="text-xs text-slate-500">l’<strong>intersection</strong> : ce qui est dans A <strong>et</strong> dans B</div>
              <div className="font-mono text-sm text-slate-800 pt-1">A ∪ B = {'{'}1 ; 2 ; 3 ; 4 ; 6 ; 9 ; 12 ; 18{'}'}</div>
              <div className="text-xs text-slate-500">la <strong>réunion</strong> : ce qui est dans A <strong>ou</strong> dans B</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Le « ou » des mathématiques est inclusif : 6 est dans A, dans B, et donc dans A ∪ B.
            </div>
          </div>
        ),
      },
      {
        id: 'ensemble-vide',
        type: 'concepts',
        title: 'Ensemble vide ∅',
        summary: 'L’ensemble qui ne contient aucun élément.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-4 text-center">
              <div className="font-mono text-2xl font-black text-slate-800">∅</div>
            </div>
            <p className="text-sm text-slate-600">
              Il n’existe aucun entier strictement compris entre 2 et 3 : cet ensemble est <strong>vide</strong>, on le note ∅.
            </p>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              ∅ est un ensemble comme un autre — simplement, il n’a aucun élément.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — Quatre crochets : le mot « intervalle », ses quatre types bornés,
       les demi-droites et l'infini toujours ouvert. */
    3: [
      {
        id: 'intervalle',
        type: 'concepts',
        title: 'Intervalle',
        summary: 'L’ensemble de TOUS les nombres réels compris entre deux bornes.',
        visual: line({
          min: -5, max: 5,
          intervals: [{ id: 'I', from: -2, to: 3, tone: 'indigo', label: '[−2 ; 3]' }],
          ariaLabel: 'Intervalle fermé de −2 à 3',
        }),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Un <strong>intervalle</strong> est l’ensemble de tous les réels compris entre deux bornes.
              Il s’écrit avec ses deux bornes séparées par un point-virgule, et deux crochets.
            </p>
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="font-mono font-bold text-slate-800">[−2 ; 3]</div>
              <div className="text-xs text-slate-500">tous les réels de −2 à 3, bornes comprises — pas seulement les entiers</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la plage du manège avait déjà cette forme — elle a maintenant un nom.</div>
          </div>
        ),
      },
      {
        id: 'types-intervalles',
        type: 'regles',
        title: 'Les quatre types d’intervalles bornés',
        summary: 'Fermé, ouvert, et les deux semi-ouverts : le type se lit sur les deux crochets.',
        body: (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-white border border-orange-200 p-2">
                <div className="font-mono font-bold text-slate-800">[a ; b]</div>
                <div className="text-xs text-slate-500">fermé — a et b inclus</div>
              </div>
              <div className="rounded-xl bg-white border border-orange-200 p-2">
                <div className="font-mono font-bold text-slate-800">]a ; b[</div>
                <div className="text-xs text-slate-500">ouvert — a et b exclus</div>
              </div>
              <div className="rounded-xl bg-white border border-orange-200 p-2">
                <div className="font-mono font-bold text-slate-800">[a ; b[</div>
                <div className="text-xs text-slate-500">semi-ouvert</div>
              </div>
              <div className="rounded-xl bg-white border border-orange-200 p-2">
                <div className="font-mono font-bold text-slate-800">]a ; b]</div>
                <div className="text-xs text-slate-500">semi-ouvert</div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Deux crochets vers l’intérieur : fermé. Deux vers l’extérieur : ouvert. Un de chaque : semi-ouvert.
            </div>
          </div>
        ),
      },
      {
        id: 'demi-droite-infini',
        type: 'regles',
        title: 'Demi-droites et infini',
        summary: 'Une borne infinie n’est jamais incluse : le crochet reste ouvert du côté de ±∞.',
        visual: line({
          min: -5, max: 8,
          intervals: [{ id: 'H', from: 3, to: Infinity, tone: 'emerald', label: '[3 ; +∞[' }],
          ariaLabel: 'Demi-droite des nombres supérieurs ou égaux à 3',
        }),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Quand une plage ne s’arrête pas d’un côté, elle s’écrit avec ±∞ : c’est une <strong>demi-droite</strong>.
            </p>
            <div className="bg-white rounded-xl border border-orange-100 p-3 font-mono text-sm text-slate-800 space-y-0.5">
              <div>[a ; +∞[ · ]a ; +∞[</div>
              <div>]−∞ ; b] · ]−∞ ; b[</div>
              <div className="pt-1">ℝ = ]−∞ ; +∞[</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              <strong>+∞ n’est pas un nombre</strong>, c’est une direction : aucun nombre ne l’atteint, donc la borne ne
              peut pas être incluse. On écrit [3 ; +∞[, jamais [3 ; +∞].
            </div>
          </div>
        ),
      },
      {
        id: 'methode-appartenance-intervalle',
        type: 'methodes',
        title: 'Décider si un nombre appartient à un intervalle',
        summary: 'Strictement entre les bornes : toujours dedans. Sur une borne : le crochet tranche.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>Le nombre est-il <strong>strictement entre</strong> les deux bornes ? Alors il appartient, sans discussion.</li>
              <li>Est-il <strong>égal à une borne</strong> ? Alors on lit le crochet de cette borne : fermé → il appartient, ouvert → non.</li>
              <li>Est-il en dehors ? Il n’appartient pas, même de très peu.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>2,999 ∈ [−2 ; 3[ <span className="font-sans text-xs text-slate-500">— strictement entre</span></div>
              <div>−2 ∈ [−2 ; 3[ <span className="font-sans text-xs text-slate-500">— crochet fermé</span></div>
              <div>3 ∉ [−2 ; 3[ <span className="font-sans text-xs text-slate-500">— crochet ouvert</span></div>
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Inégalité ↔ intervalle : la traduction dans les deux sens, et le
       piège du sens (x ≤ 3 regarde vers −∞). */
    4: [
      {
        id: 'regle-signe-crochet',
        type: 'regles',
        title: 'Signe strict ↔ crochet ouvert',
        summary: 'Un signe < donne un crochet ouvert ; un signe ≤ donne un crochet fermé.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono font-bold text-slate-800">−1 &lt; x ≤ 4</span>
                <span className="text-slate-400">⟺</span>
                <span className="font-mono font-bold text-slate-800">x ∈ ]−1 ; 4]</span>
              </div>
              <div className="text-xs text-slate-500">
                « −1 &lt; x » est strict : −1 exclu, crochet ouvert. « x ≤ 4 » est large : 4 inclus, crochet fermé.
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Une double inégalité et un intervalle décrivent <strong>le même ensemble</strong>, dans deux langues.
              Chaque signe devient un crochet, et réciproquement.
            </p>
          </div>
        ),
      },
      {
        id: 'regle-sens-inegalite',
        type: 'regles',
        title: 'Le sens de l’inégalité dit vers quel infini regarder',
        summary: '« x ≤ 3 » colorie vers −∞ ; « x > −2 » colorie vers +∞.',
        visual: line({
          min: -4, max: 6,
          intervals: [{ id: 'H', from: -Infinity, to: 3, tone: 'emerald', label: ']−∞ ; 3]' }],
          ariaLabel: 'Demi-droite des nombres inférieurs ou égaux à 3',
        }),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              « x ≤ 3 » désigne les nombres <strong>plus petits</strong> que 3 : ils sont à sa gauche, jusqu’à −∞.
            </p>
            <div className="bg-white rounded-xl border border-orange-100 p-3 font-mono text-sm text-slate-800 space-y-0.5">
              <div>x ≤ 3 ⟺ x ∈ ]−∞ ; 3]</div>
              <div>x &gt; −2 ⟺ x ∈ ]−2 ; +∞[</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Piège classique : écrire [3 ; +∞[ pour « x ≤ 3 ». Lis d’abord le sens, décide ensuite du crochet.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-traduire',
        type: 'methodes',
        title: 'Traduire une inégalité en intervalle',
        summary: 'Repérer les bornes, lire le sens, puis convertir chaque signe en crochet.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>Repérer <strong>les bornes</strong> — une seule (demi-droite) ou deux (intervalle borné).</li>
              <li>Lire <strong>le sens</strong> : « plus petit » regarde vers −∞, « plus grand » vers +∞.</li>
              <li>Convertir <strong>chaque signe</strong> : &lt; ou &gt; → crochet ouvert ; ≤ ou ≥ → crochet fermé.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>2,5 ≤ L &lt; 4 <span className="font-sans text-xs text-slate-500">→</span> L ∈ [2,5 ; 4[</div>
              <div>−1 ≤ x ≤ 1 <span className="font-sans text-xs text-slate-500">→</span> x ∈ [−1 ; 1]</div>
              <div>0 &lt; x &lt; 1 <span className="font-sans text-xs text-slate-500">→</span> x ∈ ]0 ; 1[</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Les bornes ne sont pas forcément entières : 2,5 est une borne comme une autre.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-signe-crochet',
        type: 'memoriser',
        title: '⭐ Strict ↔ ouvert, large ↔ fermé',
        summary: '< et > donnent ] et [ ; ≤ et ≥ donnent [ et ].',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="bg-rose-100 text-rose-800 text-sm font-bold px-3 py-1.5 rounded-full font-mono">&lt; &nbsp;→&nbsp; crochet ouvert</span>
                <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-3 py-1.5 rounded-full font-mono">≤ &nbsp;→&nbsp; crochet fermé</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">Et le sens de l’inégalité choisit le côté : −∞ à gauche, +∞ à droite.</p>
          </div>
        ),
      },
    ],

    /* M5 — Croiser deux intervalles : ∩ et ∪ du module 2, appliqués aux
       intervalles ; la borne de l'intersection hérite du crochet strict. */
    5: [
      {
        id: 'intersection-intervalles',
        type: 'methodes',
        title: 'Intersection de deux intervalles',
        summary: 'La zone recouverte par les deux bandes ; chaque borne garde le crochet de l’intervalle qui s’arrête là.',
        visual: line({
          min: -3, max: 9,
          intervals: [
            { id: 'I', from: -1, to: 4, tone: 'sky', label: 'I = [−1 ; 4]' },
            { id: 'J', from: 2, to: 7, openFrom: true, openTo: true, tone: 'amber', label: 'J = ]2 ; 7[' },
          ],
          ariaLabel: 'Deux intervalles superposés I = [−1 ; 4] et J = ]2 ; 7[',
        }),
        body: (
          <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>Dessiner les deux intervalles sur <strong>la même droite</strong>.</li>
              <li>Ne garder que la zone recouverte <strong>deux fois</strong>.</li>
              <li>Pour chaque borne, reprendre le crochet de l’intervalle <strong>qui s’arrête là</strong>.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div className="font-mono font-bold text-slate-800">[−1 ; 4] ∩ ]2 ; 7[ = ]2 ; 4]</div>
              <div className="text-xs text-slate-500">
                En 2, J est ouvert → 2 exclu. En 4, I est fermé → 4 inclus.
              </div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux bandes superposées, et la couleur plus dense au milieu.</div>
          </div>
        ),
      },
      {
        id: 'reunion-intervalles',
        type: 'methodes',
        title: 'Réunion de deux intervalles',
        summary: 'Tout ce qui est recouvert au moins une fois ; les bornes extérieures gardent leur crochet.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              La <strong>réunion</strong> prend tout ce qui est colorié, d’une couleur ou de l’autre.
            </p>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div className="font-mono font-bold text-slate-800">[−1 ; 4] ∪ ]2 ; 7[ = [−1 ; 7[</div>
              <div className="text-xs text-slate-500">
                La borne de gauche vient de I (fermée), celle de droite de J (ouverte).
              </div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Attention : la réunion n’est un intervalle que si les deux plages se touchent. Sinon elle a un trou —
              [−5 ; −2] ∪ [0 ; 3] n’est pas un intervalle.
            </div>
          </div>
        ),
      },
      {
        id: 'regle-intersection-vide',
        type: 'regles',
        title: 'Deux plages disjointes ont une intersection vide',
        summary: 'Si les bandes ne se touchent pas, aucun nombre n’est dans les deux : l’intersection est ∅.',
        visual: line({
          min: -6, max: 4,
          intervals: [
            { id: 'A', from: -5, to: -2, tone: 'sky', label: 'A' },
            { id: 'B', from: 0, to: 3, tone: 'amber', label: 'B' },
          ],
          ariaLabel: 'Deux intervalles disjoints A = [−5 ; −2] et B = [0 ; 3]',
        }),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3">
              <div className="font-mono font-bold text-slate-800">[−5 ; −2] ∩ [0 ; 3] = ∅</div>
              <div className="text-xs text-slate-500 mt-1">Entre −2 et 0, rien n’est colorié deux fois.</div>
            </div>
            <p className="text-sm text-slate-600">
              L’ensemble vide rencontré avec les diviseurs revient ici : une intersection peut parfaitement ne
              contenir aucun nombre.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-inter-union',
        type: 'memoriser',
        title: '⭐ ∩ = dans les deux · ∪ = dans l’un ou l’autre',
        summary: 'Sur la droite : ∩ recouvert deux fois, ∪ recouvert au moins une fois.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="font-mono text-lg font-black text-rose-700">I ∩ J &nbsp;·&nbsp; I ∪ J</div>
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">∩ : recouvert 2 fois</span>
                <span className="bg-violet-100 text-violet-800 text-xs font-bold px-3 py-1 rounded-full">∪ : recouvert ≥ 1 fois</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">Et chaque borne garde le crochet de l’intervalle qui la donne.</p>
          </div>
        ),
      },
    ],

    /* M6 — Situations : traduire une phrase en intervalle, contraintes
       implicites, et compter les entiers d'un intervalle. */
    6: [
      {
        id: 'methode-phrase-intervalle',
        type: 'methodes',
        title: 'Traduire une situation en intervalle',
        summary: 'Les mots de l’énoncé donnent les bornes ET les crochets.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3"><span className="text-slate-600">« à partir de a »</span><span className="font-mono text-slate-800">[a</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-600">« plus de a »</span><span className="font-mono text-slate-800">]a</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-600">« moins de b »</span><span className="font-mono text-slate-800">b[</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-600">« au plus b », « jusqu’à b inclus »</span><span className="font-mono text-slate-800">b]</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-600">« entre a et b, bornes incluses »</span><span className="font-mono text-slate-800">[a ; b]</span></div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Une double contrainte (« faire les deux attractions ») se résout par une <strong>intersection</strong>.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le manège et le toboggan, ]1,4 ; 1,9[ pour faire les deux.</div>
          </div>
        ),
      },
      {
        id: 'regle-contrainte-implicite',
        type: 'regles',
        title: 'La situation ajoute ses propres contraintes',
        summary: 'Une quantité, une longueur ou une durée ne peut pas être négative : x ≥ 0 s’ajoute au calcul.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Résoudre 15 + 2x ≤ 25 donne x ≤ 5. Mais une quantité de gigaoctets ne peut pas être négative.
            </p>
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1">
              <div className="font-mono font-bold text-slate-800">x ∈ [0 ; 5]</div>
              <div className="text-xs text-slate-500">et non ]−∞ ; 5] : le contexte impose x ≥ 0.</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Une borne est une frontière nette : 8,5 ∉ [2 ; 8], même « de peu ».
            </div>
          </div>
        ),
      },
      {
        id: 'methode-compter-entiers',
        type: 'methodes',
        title: 'Compter les entiers d’un intervalle',
        summary: 'Les lister sur la droite en vérifiant chaque borne — un intervalle contient une infinité de réels, mais un nombre fini d’entiers.',
        visual: line({
          min: -4, max: 4, step: 0.5, labelEvery: 2,
          intervals: [{ id: 'I', from: -2.5, to: 3, openTo: true, tone: 'indigo', label: '[−2,5 ; 3[' }],
          ariaLabel: 'Intervalle [−2,5 ; 3[',
        }),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">[−2,5 ; 3[ → −2 ; −1 ; 0 ; 1 ; 2</div>
              <div className="text-xs text-slate-500">cinq entiers : −2,5 n’est pas entier, et 3 est exclu par le crochet.</div>
            </div>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">[2 ; 8] → 2 ; 3 ; 4 ; 5 ; 6 ; 7 ; 8</div>
              <div className="text-xs text-slate-500">sept entiers : 8 − 2 + 1, les deux bornes étant incluses.</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Compter les entiers ne compte pas l’intervalle : [2 ; 8] contient aussi 2,5 et 7,99, donc une infinité de réels.
            </div>
          </div>
        ),
      },
    ],
  },
};
