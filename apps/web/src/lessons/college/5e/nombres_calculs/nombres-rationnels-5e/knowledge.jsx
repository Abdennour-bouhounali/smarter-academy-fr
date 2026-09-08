import React from 'react';
import UnitBar from './components/UnitBar';
import FractionLineLab from './components/FractionLineLab';

/**
 * Connaissances de la leçon « Nombres rationnels » (5e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés. Deux présentations
 * consomment ces données : le tiroir « Ma carte » et l'« À retenir » de fin de
 * module ; la synthèse du test final affiche la carte complète. Aucun module
 * n'écrit son propre résumé (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle que la carte doit donner à voir, et c'est
 * elle qui décide de l'ordre des modules :
 *
 *     la fraction est un NOMBRE (M1)
 *          ↓
 *     fractions égales   (M2)  ←── on multiplie les DEUX termes
 *          ↓        ↘
 *     simplifier (M3)   graduation commune (M4)
 *                  ↘        ↓
 *                   comparer (M4)
 *                            ↓
 *                   additionner / soustraire (M5)
 *                            ↓
 *                   fraction d'une quantité (M6)
 *
 * Rien n'est arbitraire dans cet ordre : on ne peut pas comparer 2/3 et 7/12
 * sans savoir réécrire 2/3 en douzièmes, donc les fractions égales (M2)
 * précèdent nécessairement la comparaison (M4), qui précède l'addition (M5) —
 * laquelle n'est qu'une comparaison suivie d'un comptage de parts.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare.
 */

/** Petite droite illustrative, non interactive — réutilisée par les items. */
const Ligne = ({ den, num, maxUnits = 1, cible = null }) => (
  <FractionLineLab
    den={den} num={num} maxUnits={maxUnits} cible={cible}
    onDen={null} onNum={() => {}} width={480}
  />
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — La fraction est un NOMBRE : une position. Ni égalité de fractions
       (M2), ni simplification (M3), ni calcul. */
    1: [
      {
        id: 'fraction-nombre',
        type: 'concepts',
        title: 'Une fraction est un nombre',
        summary: 'Une fraction occupe UNE position sur la droite graduée, exactement comme un nombre entier.',
        visual: <Ligne den={4} num={3} />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Sur une règle, entre <strong>0</strong> et <strong>1</strong>, il n’y a pas « rien » :
              il y a une infinité de nombres. Pour en désigner un, il suffit de{' '}
              <strong>fabriquer la graduation</strong> qui convient.
            </p>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>• le <strong>dénominateur</strong> dit en combien de parts on coupe l’unité ;</li>
              <li>• le <strong>numérateur</strong> dit combien de ces parts on parcourt depuis zéro.</li>
            </ul>
            <div className="bg-white rounded-xl border border-indigo-100 p-3 text-sm text-slate-700">
              <strong className="font-mono">3/4</strong> n’est donc pas « 3 et 4 » : c’est{' '}
              <strong>un seul nombre</strong>, situé entre 0 et 1, plus près de 1 que de 0.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la règle où il fallait ajouter les marques.</div>
          </div>
        ),
      },
    ],

    /* M2 — Fractions égales : le geste ×k sur les DEUX termes. */
    2: [
      {
        id: 'fractions-egales',
        type: 'regles',
        title: 'Des fractions égales',
        summary: 'Multiplier le numérateur ET le dénominateur par un même nombre ne change pas le nombre désigné.',
        visual: (
          <div className="space-y-2">
            <UnitBar num={3} den={4} label="3/4" couleur="indigo" />
            <UnitBar num={6} den={8} label="6/8" couleur="emerald" />
          </div>
        ),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-violet-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono">
                3/4 = 6/8 = 9/12 = 12/16
              </div>
              <div className="text-xs text-slate-500">
                En coupant chaque part en deux, on obtient <strong>deux fois plus de parts</strong>,
                mais elles sont <strong>deux fois plus fines</strong>. La longueur parcourue depuis
                zéro est exactement la même — le nombre n’a pas changé, seule son écriture a changé.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Un même nombre a donc une <strong>infinité d’écritures</strong> possibles. C’est
              précisément ce qui rendra les comparaisons et les additions possibles.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-deux-termes',
        type: 'memoriser',
        title: '⭐ Les DEUX termes, toujours',
        summary: 'On multiplie (ou on divise) le numérateur et le dénominateur par le même nombre.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                Le même geste en haut ET en bas
              </div>
              <div className="text-sm text-slate-600 font-semibold font-mono">
                3/4 &nbsp;— ×2 en haut et en bas —&nbsp; 6/8
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Ne toucher qu’un seul des deux termes change le nombre.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — Simplifier : le geste inverse. */
    3: [
      {
        id: 'simplifier',
        type: 'methodes',
        title: 'Simplifier une fraction',
        summary: 'On divise le numérateur et le dénominateur par un même nombre, tant que c’est possible.',
        visual: (
          <div className="space-y-2">
            <UnitBar num={12} den={18} label="12/18" couleur="amber" />
            <UnitBar num={2} den={3} label="2/3" couleur="emerald" />
          </div>
        ),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-sky-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono">
                12/18 &nbsp;— ÷6 en haut et en bas —&nbsp; 2/3
              </div>
              <div className="text-xs text-slate-500">
                On regroupe les parts par 6 : douze parts fines deviennent deux grosses parts, et
                dix-huit deviennent trois. La longueur, elle, n’a pas bougé.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Pour simplifier, on cherche un nombre qui <strong>divise les deux termes</strong> —
              c’est-à-dire un <strong>diviseur commun</strong>. On s’arrête quand il n’y en a plus
              d’autre que 1 : la fraction est alors <strong>simplifiée au maximum</strong>.
            </p>
            <p className="text-sm text-slate-500">
              C’est la même fraction qu’avant, écrite avec les plus petits nombres possibles.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — La graduation commune, puis la comparaison. */
    4: [
      {
        id: 'graduation-commune',
        type: 'methodes',
        title: 'Mettre deux fractions sur la même graduation',
        summary: 'Quand un dénominateur est un multiple de l’autre, on réécrit la plus grosse part sur la graduation la plus fine.',
        visual: (
          <div className="space-y-2">
            <UnitBar num={2} den={3} label="2/3" couleur="indigo" />
            <UnitBar num={8} den={12} label="8/12" couleur="indigo" />
            <UnitBar num={7} den={12} label="7/12" couleur="amber" />
          </div>
        ),
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Pour comparer <strong className="font-mono">2/3</strong> et{' '}
              <strong className="font-mono">7/12</strong>, on remarque que{' '}
              <strong>12 est un multiple de 3</strong> (12 = 3 × 4). On réécrit donc{' '}
              <strong className="font-mono">2/3 = 8/12</strong>, et les deux nombres sont enfin
              comptés dans la <strong>même unité</strong> : des douzièmes.
            </p>
            <p className="text-slate-500">
              C’est le même réflexe que pour comparer des longueurs : on ne compare pas des mètres
              à des centimètres sans les convertir d’abord.
            </p>
          </div>
        ),
      },
      {
        id: 'comparer-fractions',
        type: 'regles',
        title: 'Comparer deux fractions',
        summary: 'Sur une même graduation, la plus grande est celle qui a le plus grand numérateur.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono">
                8/12 &gt; 7/12 &nbsp;&nbsp;donc&nbsp;&nbsp; 2/3 &gt; 7/12
              </div>
              <div className="text-xs text-slate-500">
                Huit douzièmes, c’est plus que sept douzièmes : les parts ont la même taille, il
                suffit donc de les compter.
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                <strong>Le piège :</strong> <span className="font-mono">1/8 &lt; 1/3</span>.
              </div>
              <div className="text-xs text-slate-600">
                Pourtant 8 est plus grand que 3 ! Mais couper un gâteau en huit donne des parts{' '}
                <strong>plus petites</strong> qu’en le coupant en trois. À numérateur égal,{' '}
                <strong>plus le dénominateur est grand, plus le nombre est petit</strong>.
              </div>
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Additionner et soustraire, sur la graduation commune. */
    5: [
      {
        id: 'additionner-fractions',
        type: 'regles',
        title: 'Additionner deux fractions',
        summary: 'On amène les deux fractions sur la même graduation, puis on additionne les numérateurs — et seulement eux.',
        visual: (
          <div className="space-y-2">
            <UnitBar num={2} den={8} label="1/4" couleur="indigo" />
            <UnitBar num={3} den={8} label="3/8" couleur="emerald" />
            <UnitBar num={5} den={8} label="5/8" couleur="amber" />
          </div>
        ),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-purple-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700 font-mono">
                1/4 + 3/8 = 2/8 + 3/8 = 5/8
              </div>
              <div className="text-xs text-slate-500">
                On ne peut réunir que des parts de <strong>même taille</strong>. On réécrit donc
                1/4 en huitièmes (2/8), et il ne reste plus qu’à compter : 2 huitièmes plus
                3 huitièmes font 5 huitièmes.
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">Ce qu’il ne faut jamais faire :</strong>{' '}
              <span className="font-mono text-slate-700">1/4 + 3/8 = 4/12</span>. Additionner les
              dénominateurs reviendrait à changer la taille des parts en cours de route — le
              résultat serait plus petit que 1/4, alors qu’on a ajouté quelque chose.
            </div>
            <p className="text-sm text-slate-700">
              La <strong>soustraction</strong> fonctionne exactement pareil : même graduation, puis
              on retire les numérateurs. <span className="font-mono">3/4 − 3/8 = 6/8 − 3/8 = 3/8</span>.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-meme-graduation',
        type: 'memoriser',
        title: '⭐ Même graduation avant d’additionner',
        summary: 'Les dénominateurs servent à rendre les parts comparables ; seuls les numérateurs s’additionnent.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                On additionne les parts, jamais les tailles
              </div>
              <div className="text-sm text-slate-600 font-semibold font-mono">
                2/8 + 3/8 = 5/8 &nbsp;&nbsp;·&nbsp;&nbsp; jamais 5/16
              </div>
            </div>
          </div>
        ),
      },
    ],

    /* M6 — La fraction d'une quantité : la fraction agit sur un nombre. */
    6: [
      {
        id: 'fraction-quantite',
        type: 'methodes',
        title: 'Prendre une fraction d’une quantité',
        summary: 'On divise par le dénominateur pour obtenir une part, puis on multiplie par le numérateur.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-rose-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                <strong>Les 3/4 de 20 €</strong>
              </div>
              <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                <li>on partage en 4 : 20 ÷ 4 = <strong>5 €</strong> pour une part ;</li>
                <li>on en prend 3 : 3 × 5 = <strong>15 €</strong>.</li>
              </ol>
            </div>
            <p className="text-sm text-slate-700">
              Une fraction n’est donc pas seulement un nombre à placer : c’est aussi une{' '}
              <strong>action sur une quantité</strong> — partager, puis prendre.
            </p>
            <p className="text-sm text-slate-500">
              Contrôle utile : les 3/4 d’une quantité doivent être un peu moins que la quantité
              entière. 15 € est bien un peu moins que 20 €.
            </p>
          </div>
        ),
      },
    ],
  },
};
