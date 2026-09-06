import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de la leçon « Fonctions linéaires » (3e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * exact où le geste vient de lui donner un sens ; il reste ensuite disponible
 * dans la carte. Rien n'est réécrit dans les modules : la brique et la carte
 * rendent le même texte, et l'enrichir se fait à un seul endroit.
 *
 * ORDRE. Un item n'utilise QUE ce qui est déjà établi au module qui le
 * déclare, puisque la brique rend ce texte à sa position dans le flux :
 *   M1  le nom et l'écriture f(x) = ax, adossés à la proportionnalité de 6e ;
 *       l'image de 0 vaut 0 (le contre-exemple de la barquette) ;
 *   M2  le coefficient comme SEULE donnée de la fonction, et la division qui
 *       le retrouve — pas encore un mot de graphique ;
 *   M3  seulement là, la droite, le pivot et la lecture de l'inclinaison ;
 *   M4  la méthode, une fois les trois sources (point, tableau, droite) vues ;
 *   M5  le coefficient relu dans les mots de chaque situation.
 *
 * CE QUE CETTE LEÇON N'ENSEIGNE PAS : « fonction », « image », « antécédent »
 * et la notation f(x) viennent de la leçon « Fonctions » et sont déclarés en
 * `priorKnowledge`. Le module 1 les REPOSE en `variant="rappel"` — juste à
 * temps, sans les réenseigner.
 *
 * LaTeX : via MathText, antislashs DOUBLÉS dans les chaînes JS.
 */

/** Une droite f(x) = ax du repère de la carte — toujours passant par O. */
const lineGraph = (a, extra = {}) => (
  <MiniGraph
    width={210} height={150} xMin={-4} xMax={4} yMin={-5} yMax={5}
    functions={[{ fn: (x) => a * x, color: '#4f46e5' }]}
    {...extra}
  />
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le nom d'une chose déjà connue : la proportionnalité écrite f(x) = ax. */
    1: [
      {
        // RAPPEL (état C du contrat) : acquis de la leçon « Fonctions », posé
        // juste à temps parce que la caisse devient p et qu'on écrit p(7).
        // Déclaré aussi en `priorKnowledge` — on le resitue, on ne le
        // réenseigne pas.
        id: 'notation-fx',
        type: 'vocabulaire',
        title: 'La notation f(x) — rappel',
        summary: 'On donne un nom à la machine, et f(3) désigne ce qu’elle renvoie pour 3.',
        body: (
          <div className="space-y-3">
            <p>Une machine à nombres reçoit une <strong>entrée</strong> et renvoie une
            <strong> sortie</strong>. Plutôt que de la redessiner, on la nomme — ici
            <MathText>{' $p$'}</MathText>, comme « prix » — et on écrit :</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$p(3) = 12$'}</MathText>
            </div>
            <p className="text-xs text-slate-500">Cela se lit « l’image de 3 par
            <MathText>{' $p$'}</MathText> est 12 » : 3 kg coûtent 12 €. Le nombre entre
            parenthèses est celui qu’on ENTRE, celui après le signe = est celui qui SORT.</p>
          </div>
        ),
      },
      {
        id: 'fonction-lineaire',
        type: 'concepts',
        title: 'Fonction linéaire',
        summary: 'Une fonction linéaire multiplie toujours par le même nombre : elle s’écrit f(x) = ax.',
        body: (
          <div className="space-y-3">
            <p>Quand une grandeur s’obtient en <strong>multipliant</strong> l’autre par un nombre
            fixe, la fonction qui les relie est dite <strong>linéaire</strong> et s’écrit :</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$f(x) = ax$'}</MathText>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono text-sm">
              3 kg &nbsp;→&nbsp; [ × 4 ] &nbsp;→&nbsp; 12 €
            </div>
            <p className="text-xs text-slate-500">Il n’y a <strong>rien à ajouter</strong> après la
            multiplication : c’est ce qui distingue une fonction linéaire des autres.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la balance à 4 € le
            kilo — tu multipliais la masse, tu n’ajoutais jamais rien.</div>
          </div>
        ),
      },
      {
        id: 'lineaire-est-proportionnalite',
        type: 'concepts',
        title: 'Linéaire = proportionnalité',
        summary: 'Une fonction linéaire est une situation de proportionnalité écrite autrement ; a est le coefficient de proportionnalité.',
        body: (
          <div className="space-y-3">
            <p>Ce n’est pas une mathématique neuve : c’est celle des tableaux de
            proportionnalité, avec un nouveau costume.</p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>Tableau de proportionnalité</strong> : on passe d’une ligne à l’autre en
                multipliant par le coefficient de proportionnalité.
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Fonction linéaire</strong> : <MathText>{'$f(x) = ax$'}</MathText> — le même
                nombre, à la même place.
              </div>
            </div>
            <p className="text-xs text-slate-500">Doubler l’entrée double la sortie ; la tripler
            la triple. C’est le test que tu sais faire depuis la 6e.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la colonne « prix ÷ masse »
            affichait 4 partout.</div>
          </div>
        ),
      },
      {
        id: 'mem-zero-donne-zero',
        type: 'memoriser',
        title: '⭐ 0 donne toujours 0',
        summary: 'Pour une fonction linéaire, f(0) = 0. Dès qu’une part fixe s’ajoute, ce n’est plus une fonction linéaire.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">
              <MathText>{'$f(0) = a \\times 0 = 0$'}</MathText>
            </div>
            <p className="text-xs text-rose-700">C’est le test le plus rapide : si l’entrée 0 ne
            donne pas 0, la fonction n’est pas linéaire.</p>
            <p className="text-xs text-rose-700">Zéro cerise, zéro euro — <strong>mais avec 1 €
            de barquette, on paie déjà 1 € pour 0 kg</strong> : ce n’est plus linéaire.</p>
          </div>
        ),
      },
    ],

    /* M2 — Le coefficient : une seule donnée, retrouvée par une division. */
    2: [
      {
        id: 'coefficient',
        type: 'vocabulaire',
        title: 'Le coefficient a',
        summary: 'Dans f(x) = ax, le nombre a est le coefficient : c’est la SEULE donnée de la fonction.',
        body: (
          <div className="space-y-3">
            <p>Le nombre <MathText>{'$a$'}</MathText> qui multiplie <MathText>{'$x$'}</MathText>
            s’appelle le <strong>coefficient</strong> de la fonction linéaire.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <MathText>{'$f(x) = 4x$'}</MathText>
              <p className="text-xs text-slate-500">coefficient : 4 — le prix d’un kilo</p>
            </div>
            <p className="text-xs text-slate-500">Le connaître, c’est connaître la fonction
            <strong> entière</strong> : deux fonctions linéaires de même coefficient sont la même
            fonction.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois marchands ne se
            distinguaient que par ce nombre-là.</div>
          </div>
        ),
      },
      {
        id: 'coefficient-par-division',
        type: 'methodes',
        title: 'Retrouver a par une division',
        summary: 'À partir d’un couple (x ; y) avec x ≠ 0, le coefficient vaut a = y ÷ x.',
        body: (
          <div className="space-y-3">
            <p>Si l’on connaît une entrée et sa sortie, une seule division suffit :</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$a = y \\div x$'}</MathText>
            </div>
            <p className="text-sm">3 kg payés 13,50 € :
            <MathText>{' $13{,}5 \\div 3 = 4{,}5$'}</MathText>, donc 4,50 € le kilo.</p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              Un coefficient est un <strong>quotient</strong>, jamais une différence : on divise,
              on ne soustrait pas.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le quatrième marchand,
            dont tu n’avais qu’un seul ticket de caisse.</div>
          </div>
        ),
      },
      {
        id: 'test-lineaire',
        type: 'regles',
        title: 'Reconnaître une fonction linéaire',
        summary: 'Deux gestes : les rapports y ÷ x sont-ils tous égaux, et l’entrée 0 donne-t-elle 0 ?',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Calculer <MathText>{'$y \\div x$'}</MathText> pour chaque colonne.</li>
              <li>Vérifier qu’ils <strong>coïncident tous</strong> — cette valeur commune est
              <MathText>{' $a$'}</MathText>.</li>
              <li>Vérifier que 0 donne bien 0.</li>
            </ol>
            <p className="text-xs text-slate-500">Un seul rapport qui s’écarte, ou une entrée 0 qui
            ne donne pas 0, et la réponse est non.</p>
          </div>
        ),
      },
      {
        id: 'un-point-suffit',
        type: 'regles',
        title: 'Un seul point suffit',
        summary: 'Une fonction linéaire n’a qu’un paramètre : un point d’abscisse non nulle la détermine entièrement.',
        body: (
          <div className="space-y-2">
            <p>Toutes les fonctions linéaires ont l’entrée 0 en commun. Un point où
            <MathText>{' $x \\neq 0$'}</MathText> les distingue donc, et une division donne
            <MathText>{' $a$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Le couple (0 ; 0), lui, convient à toutes : il
            n’en désigne aucune.</p>
          </div>
        ),
      },
    ],

    /* M3 — Le graphique : une droite, un pivot, une inclinaison lisible. */
    3: [
      {
        id: 'droite-par-origine',
        type: 'concepts',
        title: 'Une droite passant par l’origine',
        summary: 'La représentation graphique de f(x) = ax est une droite qui passe par l’origine, quel que soit a.',
        visual: lineGraph(1.5, { points: [{ x: 0, y: 0, label: 'O', color: '#e11d48', labelPos: 'bl' }] }),
        body: (
          <div className="space-y-3">
            <p>Les points d’une fonction linéaire sont alignés, et cette droite passe toujours
            par l’<strong>origine</strong> — puisque l’image de 0 vaut 0.</p>
            <p className="text-xs text-slate-500">C’est la traduction graphique de
            <MathText>{' $f(0) = 0$'}</MathText> : le point (0 ; 0) appartient à la droite de
            <strong> toutes</strong> les fonctions linéaires.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le point rouge O n’a
            jamais bougé pendant que tu réglais le coefficient.</div>
          </div>
        ),
      },
      {
        id: 'pivot-autour-origine',
        type: 'regles',
        title: 'La droite pivote, elle ne glisse pas',
        summary: 'Changer le coefficient fait tourner la droite autour de l’origine : elle change d’inclinaison, jamais de hauteur.',
        visual: (
          <MiniGraph
            width={210} height={150} xMin={-4} xMax={4} yMin={-5} yMax={5}
            functions={[
              { fn: (x) => 0.5 * x, color: '#94a3b8', dashed: true },
              { fn: (x) => 2 * x, color: '#4f46e5' },
            ]}
            points={[{ x: 0, y: 0, label: 'O', color: '#e11d48', labelPos: 'br' }]}
          />
        ),
        body: (
          <div className="space-y-3">
            <p>Quand <MathText>{'$a$'}</MathText> augmente, la droite se redresse ; quand il
            diminue, elle se couche. Mais elle <strong>tourne autour de O</strong>, qui reste sur
            elle dans tous les cas.</p>
            <p className="text-xs text-slate-500"><MathText>{'$a > 0$'}</MathText> : elle monte.
            <MathText>{' $a < 0$'}</MathText> : elle descend. Une droite qui descend reste une
            fonction linéaire.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as essayé une
            inclinaison forte, une douce, une négative — et O n’a jamais bougé.</div>
          </div>
        ),
      },
      {
        id: 'lire-a-sur-la-droite',
        type: 'methodes',
        title: 'Lire le coefficient sur la droite',
        summary: 'On avance de 1 vers la droite et on lit la montée : c’est a. Si l’escalier avance de plusieurs unités, on divise la montée par l’avancée.',
        visual: lineGraph(2, {
          points: [
            { x: 1, y: 2, label: '+1 → +2', color: '#059669', labelPos: 'tl' },
            { x: 0, y: 0, label: 'O', color: '#e11d48', labelPos: 'bl' },
          ],
        }),
        body: (
          <div className="space-y-3">
            <p>Depuis un point de la droite, on dessine un <strong>escalier</strong> : une avancée
            horizontale, puis la montée qui ramène sur la droite.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$a = \\dfrac{\\text{montée}}{\\text{avancée}}$'}</MathText>
            </div>
            <p className="text-xs text-slate-500">Si l’escalier avance de 1, la montée <em>est</em>
            le coefficient. Sinon il faut diviser — un escalier qui avance de 2 et monte de 3 donne
            <MathText>{' $3 \\div 2 = 1{,}5$'}</MathText>.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’escalier vert qui se
            redessinait à chaque réglage.</div>
          </div>
        ),
      },
    ],

    /* M4 — La méthode, une fois les trois sources vues. */
    4: [
      {
        id: 'methode-determiner-lineaire',
        type: 'methodes',
        title: 'Déterminer une fonction linéaire',
        summary: 'Prendre un point (x ; y) de la fonction avec x ≠ 0, calculer a = y ÷ x, écrire f(x) = ax, puis vérifier sur une autre donnée.',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Repérer un couple <MathText>{'$(x \\; ; \\; y)$'}</MathText> — dans l’énoncé, une
              colonne du tableau, ou un point marqué sur la droite.</li>
              <li>Écarter le couple (0 ; 0) : il ne détermine rien.</li>
              <li>Calculer <MathText>{'$a = y \\div x$'}</MathText>.</li>
              <li>Écrire <MathText>{'$f(x) = ax$'}</MathText> et <strong>vérifier</strong> sur une
              autre donnée.</li>
            </ol>
            <p className="text-xs text-slate-500">Les trois sources — un couple, un tableau, une
            droite — mènent à la même division : elles disent la même chose de trois façons.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’enquête — un point, un
            tableau, puis une droite sans étiquette.</div>
          </div>
        ),
      },
    ],

    /* M5 — Le coefficient relu dans les mots de chaque situation. */
    5: [
      {
        id: 'coefficient-en-situation',
        type: 'methodes',
        title: 'Ce que le coefficient veut dire',
        summary: 'Prix au kilo, vitesse, taux de remise, facteur d’agrandissement : ce sont quatre noms du même a.',
        body: (
          <div className="space-y-3">
            <p>Modéliser, c’est repérer ce qui varie (<MathText>{'$x$'}</MathText>) et le nombre par
            lequel on multiplie.</p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                12 km/h à vélo → <MathText>{'$d(t) = 12t$'}</MathText> : le coefficient est la
                <strong> vitesse</strong>.
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                −20 % sur une étiquette → <MathText>{'$p(x) = 0{,}8x$'}</MathText> : le coefficient
                est ce qui <strong>reste à payer</strong>.
              </div>
            </div>
            <p className="text-xs text-slate-500">« Combien pour 3,5 h ? » demande une image ;
            « combien de temps pour 30 km ? » demande un antécédent.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le vélo, l’étiquette de
            soldes et la photo agrandie.</div>
          </div>
        ),
      },
      {
        id: 'coefficients-se-multiplient',
        type: 'regles',
        title: 'Deux évolutions se multiplient',
        summary: 'Enchaîner deux évolutions, c’est multiplier leurs coefficients — les pourcentages, eux, ne s’additionnent pas.',
        body: (
          <div className="space-y-3">
            <p>Baisser de 20 % puis remonter de 20 %, c’est multiplier par 0,8 puis par 1,2 :</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$0{,}8 \\times 1{,}2 = 0{,}96$'}</MathText>
            </div>
            <p className="text-sm">Il reste <strong>96 %</strong> du prix de départ : il manque 4 %.
            Sur 100 € : 80 €, puis 96 €.</p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              Même piège avec les longueurs : doubler chaque longueur d’un rectangle multiplie son
              aire par <MathText>{'$2 \\times 2 = 4$'}</MathText>, pas par 2.
            </div>
          </div>
        ),
      },
    ],
  },
};
