import React from 'react';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de la leçon « Lecture graphique » (3e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner un sens, puis il reste disponible dans la
 * carte. Rien n'est réécrit dans un module : la brique et la carte montrent le
 * même texte.
 *
 * CE QUE CETTE LEÇON N'ENSEIGNE PAS. « fonction », « image », « antécédent » et
 * la notation f(x) viennent de `fonctions-3e` : ils sont déclarés en
 * `priorKnowledge` et diagnostiqués par le module 0. Ce que cette leçon
 * enseigne, c'est la LECTURE de ces notions sur un dessin — le geste du guide
 * vertical, celui du guide horizontal, et le fait qu'ils ne rendent pas le même
 * nombre de réponses. D'où deux items distincts (`lecture-image-graphique`,
 * `tous-les-antecedents`) plutôt qu'une redéfinition des mots eux-mêmes ; les
 * mots, eux, sont rappelés en `variant="rappel"` au point d'emploi.
 *
 * ORDRE. Un item n'utilise que ce qui est déjà établi au module qui le
 * déclare : lire une image (M1) avant de chercher tous les antécédents (M2),
 * l'échelle (M3) avant les extremums qu'elle chiffre (M4), l'intervalle de
 * variation (M4) avant l'intersection qui s'y situe (M5). Un exemple qui
 * anticiperait le module suivant serait un spoiler, pas une aide.
 *
 * Les mini-repères reprennent le profil de la montgolfière — même objet que
 * dans les modules, pour que la carte rappelle le geste et non un dessin neuf.
 */

/** Le profil du vol, en fonction affine par morceaux, pour les mini-repères. */
const flight = (x) => {
  const pts = [0, 200, 400, 600, 600, 400, 200, 0, 200, 400, 600, 400, 200];
  const i = Math.max(0, Math.min(pts.length - 2, Math.floor(x)));
  return pts[i] + (pts[i + 1] - pts[i]) * (x - i);
};

const flightGraph = (extra = {}) => (
  <MiniGraph
    width={230} height={150} xMin={0} xMax={12} yMin={0} yMax={700}
    functions={[{ fn: flight, color: '#0284c7', samples: 240 }]}
    {...extra}
  />
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Une courbe RÉPOND : le guide vertical, et ce que dit un point. */
    1: [
      {
        // ACQUIS de `fonctions-3e`, déclaré en `priorKnowledge` et diagnostiqué
        // au module 0. Il figure ici parce que la leçon le RESITUE sur un
        // dessin : la brique correspondante est un `variant="rappel"`, pas une
        // première rencontre.
        id: 'image',
        type: 'vocabulaire',
        title: 'Image (rappel)',
        summary: 'L’image d’une valeur est ce que la fonction renvoie pour cette valeur — sur un graphique, la hauteur du point de la courbe.',
        body: (
          <div className="space-y-2">
            <p>Avec les machines à nombres, l’<strong>image</strong> était le nombre qui SORT.
            Ici la machine ne se voit pas : c’est la <strong>courbe</strong> qui répond, et
            l’image se lit sur l’axe vertical.</p>
            <p className="text-xs text-slate-500">Une valeur d’entrée n’a jamais qu’<strong>une
            seule</strong> image — sur un dessin, cela se voit : le guide vertical ne peut
            rencontrer la courbe qu’en un point.</p>
          </div>
        ),
      },
      {
        id: 'lecture-image-graphique',
        type: 'methodes',
        title: 'Lire une image sur une courbe',
        summary: 'Pour lire l’image d’une valeur, on monte (ou descend) depuis l’axe horizontal jusqu’à la courbe, puis on lit à gauche.',
        visual: flightGraph({
          guides: [{ x: 3, color: '#4f46e5' }, { y: 600, color: '#4f46e5' }],
          points: [{ x: 3, y: 600, label: '600', color: '#4f46e5', labelPos: 'tr' }],
        }),
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1">
              <li>Repérer la valeur sur l’<strong>axe horizontal</strong>.</li>
              <li>Suivre le <strong>guide vertical</strong> jusqu’à rencontrer la courbe.</li>
              <li>De ce point, partir <strong>à l’horizontale</strong> et lire sur l’axe vertical.</li>
            </ol>
            <p className="text-xs text-slate-500">Aucune formule n’intervient : la courbe est la
            seule source. Et le guide vertical ne peut rencontrer la courbe qu’<strong>une seule
            fois</strong> — une valeur d’entrée n’a jamais deux images.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la sonde promenée sur les
            douze heures de vol.</div>
          </div>
        ),
      },
      {
        id: 'point-de-la-courbe',
        type: 'regles',
        title: 'Ce que dit un point de la courbe',
        summary: 'Un point de la courbe se lit toujours dans l’ordre (abscisse ; ordonnée) : l’abscisse est ce qu’on entre, l’ordonnée ce qu’on lit.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <span className="font-mono text-slate-800">(3 ; 600)</span>
              <span className="text-slate-500 text-xs"> &nbsp;se lit&nbsp; </span>
              <span className="text-slate-800">« à 3 h, 600 m »</span>
            </div>
            <p>Le premier nombre se lit sur l’axe <strong>horizontal</strong>, le second sur l’axe
            <strong> vertical</strong>. Inverser les deux, c’est raconter une autre histoire.</p>
            <p className="text-xs text-slate-500">Chaque point porte donc un couple complet : la
            grandeur qu’on choisit, et celle que la courbe renvoie.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la lecture écrite sous le
            repère, qui changeait à chaque déplacement de la sonde.</div>
          </div>
        ),
      },
    ],

    /* M2 — L'autre guide : chercher TOUS les antécédents. */
    2: [
      {
        // ACQUIS de `fonctions-3e` lui aussi : rappelé en `variant="rappel"`
        // juste avant que la lecture graphique n'en fasse quelque chose de neuf.
        id: 'antecedent',
        type: 'vocabulaire',
        title: 'Antécédent (rappel)',
        summary: 'Un antécédent d’une valeur est une entrée qui donne cette valeur en sortie — sur un graphique, l’abscisse d’un point situé à cette hauteur.',
        body: (
          <div className="space-y-2">
            <p>Avec les machines à nombres, chercher un <strong>antécédent</strong>, c’était
            remonter la machine : on connaissait la sortie, on cherchait l’entrée.</p>
            <p className="text-xs text-slate-500">On dit « <strong>un</strong> » antécédent et non
            « l’ » : rien ne garantit qu’il n’y en ait qu’un. Sur une courbe, c’est même
            l’exception plutôt que la règle.</p>
          </div>
        ),
      },
      {
        id: 'tous-les-antecedents',
        type: 'methodes',
        title: 'Chercher tous les antécédents',
        summary: 'On trace le guide horizontal à la hauteur voulue et on relève TOUS les points où il coupe la courbe : il peut y en avoir zéro, un ou plusieurs.',
        visual: flightGraph({
          guides: [{ y: 400, color: '#e11d48' }],
          points: [
            { x: 2, y: 400, color: '#e11d48' }, { x: 5, y: 400, color: '#e11d48' },
            { x: 9, y: 400, color: '#e11d48' }, { x: 11, y: 400, color: '#e11d48' },
          ],
        }),
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1">
              <li>Repérer la valeur sur l’<strong>axe vertical</strong>.</li>
              <li>Suivre le <strong>guide horizontal</strong> à travers tout le repère.</li>
              <li>Descendre de <strong>chaque</strong> croisement vers l’axe horizontal.</li>
            </ol>
            <p className="text-xs text-slate-500">Le piège est de s’arrêter au premier croisement.
            Il faut balayer toute la largeur du repère avant de conclure.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : quatre points allumés d’un
            coup quand la sonde s’est posée sur 400 m.</div>
          </div>
        ),
      },
      {
        id: 'mem-un-sens-pas-lautre',
        type: 'memoriser',
        title: '⭐ Les deux sens ne se ressemblent pas',
        summary: 'Le guide vertical donne toujours une seule réponse ; le guide horizontal peut en donner zéro, une ou plusieurs.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-2">
            <div className="text-base font-black text-rose-700">
              guide vertical → 1 réponse
            </div>
            <div className="text-base font-black text-rose-700">
              guide horizontal → 0, 1 ou plusieurs
            </div>
            <p className="text-xs text-rose-700">Une valeur qui dépasse le sommet de la courbe n’a
            <strong> aucun</strong> antécédent : le guide ne rencontre rien.</p>
          </div>
        ),
      },
    ],

    /* M3 — Ce que vaut un carreau, et ce qui se lit entre deux traits. */
    3: [
      {
        id: 'echelle-graduation',
        type: 'regles',
        title: 'L’échelle d’un axe',
        summary: 'Avant toute lecture, il faut savoir ce que vaut UN carreau : compter les carreaux ne donne pas la valeur, il faut les multiplier par le pas de l’axe.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <p className="text-sm text-slate-700">1 carreau = <strong>100 m</strong></p>
              <p className="font-mono text-slate-800">4 carreaux &nbsp;→&nbsp; 4 × 100 = 400 m</p>
            </div>
            <p>Les deux axes n’ont pas forcément le même pas : chacun se lit sur les nombres
            <strong> écrits sur cet axe-là</strong>.</p>
            <p className="text-xs text-slate-500">Répondre « 4 » quand l’axe dit 400 est l’erreur la
            plus fréquente de toute la lecture graphique.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le camarade qui annonçait
            « monté à 6 » en comptant six carreaux.</div>
          </div>
        ),
      },
      {
        id: 'lecture-entre-graduations',
        type: 'regles',
        title: 'Lire entre deux graduations',
        summary: 'Une valeur peut tomber entre deux traits : elle existe quand même et se lit approximativement, sans arrondir à la graduation la plus proche.',
        body: (
          <div className="space-y-2">
            <p>La courbe passe par toutes les positions intermédiaires. Entre une graduation à
            200 et la suivante à 400, la valeur du milieu est <strong>300</strong> — même si aucun
            trait ne la porte.</p>
            <p className="text-xs text-slate-500">Une lecture graphique est <strong>approchée</strong> :
            elle est juste à quelques unités près, et c’est le seul <strong>arrondi</strong>
            légitime. Arrondir jusqu’à la graduation la plus proche, en revanche, fait perdre
            l’information que la courbe donnait.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la sonde posée à 1 h 30,
            entre deux traits de l’axe des heures.</div>
          </div>
        ),
      },
    ],

    /* M4 — Extremums et intervalles : la hauteur, puis les moments. */
    4: [
      {
        id: 'maximum-minimum',
        type: 'concepts',
        title: 'Maximum et minimum',
        summary: 'Le maximum est la plus grande VALEUR atteinte par la courbe, le minimum la plus petite : ce sont des ordonnées, pas des abscisses.',
        visual: flightGraph({
          points: [
            { x: 3, y: 600, label: 'max', color: '#059669', labelPos: 'tr' },
            { x: 7, y: 0, label: 'min', color: '#e11d48', labelPos: 'tr' },
          ],
        }),
        body: (
          <div className="space-y-3">
            <p>Le <strong>maximum</strong> se lit au point le plus <strong>haut</strong> de la
            courbe ; le <strong>minimum</strong> au point le plus <strong>bas</strong>. Dans les
            deux cas, la réponse se lit sur l’axe <strong>vertical</strong>.</p>
            <p className="text-xs text-slate-500">L’endroit où l’extremum est atteint est une autre
            question, et sa réponse se lit sur l’autre axe. Un même extremum peut d’ailleurs être
            atteint plusieurs fois.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la sonde poussée jusqu’au
            sommet du vol, puis jusqu’au sol.</div>
          </div>
        ),
      },
      {
        id: 'intervalle-variation',
        type: 'vocabulaire',
        title: 'Intervalle de variation',
        summary: 'Un intervalle est un morceau de l’axe horizontal, donné par son début et sa fin ; sur un tel morceau, la courbe monte (croissante) ou descend (décroissante).',
        visual: flightGraph({
          bands: [{ from: 0, to: 3, color: '#10b981' }, { from: 4, to: 7, color: '#f43f5e' }],
        }),
        body: (
          <div className="space-y-3">
            <p>Un <strong>intervalle</strong> n’est pas un instant ni une hauteur : c’est une
            <strong> plage</strong> de l’axe horizontal, qu’on donne par ses deux bornes — « de 0 h
            à 3 h ».</p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                La courbe <strong>monte</strong> sur cet intervalle : la fonction y est
                <strong> croissante</strong>.
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                La courbe <strong>descend</strong> : la fonction y est
                <strong> décroissante</strong>.
              </div>
            </div>
            <p className="text-xs text-slate-500">Une même courbe peut monter, puis descendre, puis
            remonter : il y a alors <strong>plusieurs</strong> intervalles de croissance.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les bandes qui s’ombraient
            sur le repère quand tu cochais une période.</div>
          </div>
        ),
      },
      {
        id: 'mem-valeur-ou-moment',
        type: 'memoriser',
        title: '⭐ Une valeur, ou un moment ?',
        summary: 'Avant de répondre, décider sur quel axe la réponse se lit : verticalement les valeurs, horizontalement les moments et les durées.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold text-rose-800">
              <div className="rounded-lg bg-white border border-rose-200 p-2">
                axe vertical<br />
                <span className="font-normal">maximum, minimum, image</span>
              </div>
              <div className="rounded-lg bg-white border border-rose-200 p-2">
                axe horizontal<br />
                <span className="font-normal">antécédent, intervalle, durée</span>
              </div>
            </div>
            <p className="text-xs text-rose-700 text-center">Répondre sur le mauvais axe, c’est
            répondre à une autre question.</p>
          </div>
        ),
      },
    ],

    /* M5 — Deux courbes : ce que dit leur croisement. */
    5: [
      {
        id: 'point-intersection',
        type: 'concepts',
        title: 'Point d’intersection de deux courbes',
        summary: 'Un point d’intersection est un endroit où les deux courbes se coupent : à cette abscisse, les deux valeurs sont égales.',
        visual: (
          <MiniGraph
            width={230} height={150} xMin={0} xMax={12} yMin={0} yMax={700}
            functions={[
              { fn: flight, color: '#0284c7', samples: 240 },
              { fn: (x) => 600 - 100 * x, color: '#e11d48', domain: [0, 6] },
            ]}
            points={[{ x: 2, y: 400, label: '(2 ; 400)', color: '#7c3aed', labelPos: 'tr' }]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p>Là où les deux courbes se touchent, elles ont la <strong>même ordonnée</strong> pour
            la <strong>même abscisse</strong> : les deux grandeurs coïncident à cet instant-là.</p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                L’<strong>abscisse</strong> du point répond à « <em>quand</em> ? ».
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                L’<strong>ordonnée</strong> du point répond à « <em>combien</em> ? ».
              </div>
            </div>
            <p className="text-xs text-slate-500">Se couper ne veut pas dire « se rencontrer » dans
            la réalité : les courbes représentent des valeurs, pas des trajets.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux vols superposés,
            et l’écart qui s’annulait puis changeait de sens.</div>
          </div>
        ),
      },
      {
        id: 'resolution-graphique',
        type: 'methodes',
        title: 'Résoudre graphiquement',
        summary: 'Chercher où deux courbes se coupent, c’est résoudre l’égalité de leurs deux valeurs sans aucun calcul ; de part et d’autre du croisement, c’est l’une puis l’autre qui l’emporte.',
        body: (
          <div className="space-y-3">
            <p>Une question du type « <em>quand les deux sont-ils égaux ?</em> » se lit à
            l’<strong>abscisse du croisement</strong>. Une question du type « <em>quand l’un
            dépasse-t-il l’autre ?</em> » se lit sur les morceaux d’axe où une courbe est
            <strong> au-dessus</strong> de l’autre.</p>
            <p className="text-xs text-slate-500">Le croisement est la frontière entre les deux
            situations : avant, c’est l’une qui domine ; après, c’est l’autre.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la sonde placée avant, puis
            après le croisement, et les deux lectures comparées.</div>
          </div>
        ),
      },
    ],

    /* M6 — Traduire une question de terrain en lecture. */
    6: [
      {
        id: 'methode-question-en-lecture',
        type: 'methodes',
        title: 'Traduire une question en lecture',
        summary: 'Devant un problème, on identifie d’abord ce qui est donné et ce qui est cherché, puis l’axe sur lequel la réponse se lit — et seulement ensuite on pose la sonde.',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1">
              <li>Qu’est-ce qui est <strong>donné</strong> ? Une valeur d’un axe.</li>
              <li>Qu’est-ce qui est <strong>cherché</strong> ? Une valeur de l’autre axe, ou un
              morceau d’axe.</li>
              <li>Quel <strong>guide</strong> tracer : vertical ou horizontal ?</li>
            </ol>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Une <strong>durée</strong> n’est pas un instant : c’est l’<strong>écart</strong> entre
              deux instants, donc une soustraction sur l’axe horizontal.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le pilote du drone, qui
              posait ses questions en français et pas en mathématiques.</div>
          </div>
        ),
      },
    ],
  },
};
