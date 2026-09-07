import React from 'react';
import NumberLineLab from './components/NumberLineLab';
import { fmt } from './components/relatifs';

/**
 * Connaissances de la leçon « Nombres relatifs » (5e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés. Deux présentations
 * consomment ces données : le tiroir « Ma carte » et l'« À retenir » de fin de
 * module ; la synthèse du test final affiche la carte complète. Aucun module
 * n'écrit son propre résumé (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. L'opposé n'apparaît qu'au module 2, la comparaison
 * au module 3, l'addition au module 4, la soustraction au module 5.
 *
 * Forme d'un item : { id, type, title, summary, visual?, body }.
 * `module` et `isNew` sont ajoutés par le réducteur, jamais écrits ici.
 */

/** Petite droite illustrative, non interactive — réutilisée par les items. */
const Line = ({ min = -6, max = 6, marks = [], jump = null }) => (
  <NumberLineLab min={min} max={max} value={null} marks={marks} jump={jump} width={520} />
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — L'ascenseur : les nombres continuent sous zéro. Le signe dit le
       CÔTÉ de zéro. Ni droite graduée horizontale, ni opposé, ni calcul. */
    1: [
      {
        id: 'nombre-relatif',
        type: 'concepts',
        title: 'Nombre relatif',
        summary: 'Un nombre relatif repère une position par rapport à un zéro : au-dessus, au-dessous, ou dessus.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Dans l’immeuble, le <strong>rez-de-chaussée est le zéro</strong>. À partir de lui, on
              peut aller de deux côtés :
            </p>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-500 shrink-0" />
                <strong className="text-indigo-700">{fmt(3)}</strong> — trois étages <strong>au-dessus</strong> du sol : un nombre <strong>positif</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-500 shrink-0" />
                <strong className="text-rose-600">{fmt(-3)}</strong> — trois étages <strong>au-dessous</strong> du sol : un nombre <strong>négatif</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 shrink-0" />
                <strong>0</strong> — le sol lui-même : ni positif, ni négatif
              </li>
            </ul>
            <div className="bg-white rounded-xl border border-indigo-100 p-3 text-sm text-slate-700">
              Le signe <strong>−</strong> ne demande pas de calculer quoi que ce soit : il dit
              simplement <strong>de quel côté du zéro</strong> se trouve le nombre.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la cabine qui descend sous le rez-de-chaussée.</div>
          </div>
        ),
      },
    ],

    /* M2 — La droite graduée : lire, placer, l'opposé, la distance à zéro. */
    2: [
      {
        id: 'droite-relatifs',
        type: 'methodes',
        title: 'Lire et placer sur la droite graduée',
        summary: 'La droite graduée est l’ascenseur couché : zéro au milieu, positifs à droite, négatifs à gauche.',
        visual: <Line min={-6} max={6} marks={[{ at: -4, label: fmt(-4), color: '#e11d48' }, { at: 3, label: fmt(3), color: '#4f46e5' }]} />,
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Chaque nombre relatif occupe <strong>une seule position</strong> sur la droite. Pour le
              placer, on part de <strong>zéro</strong> et on compte les graduations :
            </p>
            <ul className="space-y-1">
              <li>• vers la <strong>droite</strong> si le nombre est positif ;</li>
              <li>• vers la <strong>gauche</strong> s’il est négatif.</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'oppose',
        type: 'vocabulaire',
        title: 'L’opposé d’un nombre',
        summary: 'Deux nombres opposés sont à la même distance de zéro, mais de part et d’autre.',
        visual: (
          <Line
            min={-6} max={6}
            marks={[{ at: -4, label: fmt(-4), color: '#e11d48' }, { at: 4, label: fmt(4), color: '#4f46e5' }, { at: 0, label: '0', color: '#0f172a' }]}
          />
        ),
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              L’opposé de <strong className="text-indigo-700">{fmt(4)}</strong> est{' '}
              <strong className="text-rose-600">{fmt(-4)}</strong>, et l’opposé de{' '}
              <strong className="text-rose-600">{fmt(-4)}</strong> est{' '}
              <strong className="text-indigo-700">{fmt(4)}</strong> : on change de côté sans changer
              de distance au zéro.
            </p>
            <p className="text-slate-500">
              Zéro est le seul nombre qui est son propre opposé — il est déjà sur le zéro.
            </p>
          </div>
        ),
      },
      {
        id: 'distance-a-zero',
        type: 'concepts',
        title: 'La distance à zéro',
        summary: 'La distance à zéro d’un nombre, c’est le nombre de graduations qui le séparent du zéro. Elle n’est jamais négative.',
        visual: <Line min={-6} max={6} marks={[{ at: -5, label: fmt(-5), color: '#e11d48' }]} jump={{ from: -5, to: 0, label: '5 graduations' }} />,
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              {fmt(-5)} et {fmt(5)} ont la <strong>même distance à zéro : 5</strong>. C’est ce qu’on
              appelle leur <strong>valeur absolue</strong>.
            </p>
            <p className="text-slate-500">
              Une distance se compte toujours en graduations, jamais avec un signe.
            </p>
          </div>
        ),
      },
    ],

    /* M3 — L'ordre. Le piège −2 > −7 est traité ici, avec la droite comme juge. */
    3: [
      {
        id: 'ordre-relatifs',
        type: 'regles',
        title: 'Comparer deux nombres relatifs',
        summary: 'Le plus grand est celui qui est le plus à DROITE sur la droite graduée.',
        visual: <Line min={-9} max={3} marks={[{ at: -7, label: fmt(-7), color: '#e11d48' }, { at: -2, label: fmt(-2), color: '#059669' }]} />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 space-y-2">
              <p className="text-sm text-slate-700">
                <strong className="text-emerald-700">{fmt(-2)} &gt; {fmt(-7)}</strong> — parce que{' '}
                {fmt(-2)} est plus à droite.
              </p>
              <p className="text-sm text-slate-600">
                Pourtant {fmt(-7)} est <em>plus loin</em> du zéro que {fmt(-2)}. C’est le piège :
                chez les négatifs, <strong>plus grande distance à zéro veut dire plus petit nombre</strong>.
              </p>
            </div>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Tout nombre positif est plus grand que tout nombre négatif.</li>
              <li>• Zéro est plus grand que tous les négatifs, plus petit que tous les positifs.</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'mem-ordre',
        type: 'memoriser',
        title: '⭐ L’ordre suit la droite',
        summary: 'Le plus à droite est le plus grand. Toujours.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                Le plus à droite est le plus grand
              </div>
              <div className="text-sm text-slate-600 font-semibold">
                {fmt(-7)} &lt; {fmt(-2)} &lt; 0 &lt; {fmt(3)}
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              En cas de doute : place les deux nombres sur la droite, et regarde.
            </p>
          </div>
        ),
      },
    ],

    /* M4 — Additionner = se déplacer. */
    4: [
      {
        id: 'addition-deplacement',
        type: 'regles',
        title: 'Additionner, c’est se déplacer',
        summary: 'On part du premier nombre ; le second dit de combien on bouge, et dans quel sens.',
        visual: <Line min={-6} max={6} marks={[{ at: 3, label: 'départ', color: '#4f46e5' }]} jump={{ from: 3, to: -2, label: `+ ${fmt(-5)}` }} />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                <strong>3 + ({fmt(-5)}) = {fmt(-2)}</strong>
              </div>
              <div className="text-xs text-slate-500">
                On part de 3, on se déplace de 5 graduations <strong>vers la gauche</strong> — parce
                que {fmt(-5)} est négatif — et on arrive sur {fmt(-2)}.
              </div>
            </div>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Ajouter un nombre <strong>positif</strong> → on va vers la <strong>droite</strong>.</li>
              <li>• Ajouter un nombre <strong>négatif</strong> → on va vers la <strong>gauche</strong>.</li>
            </ul>
          </div>
        ),
      },
    ],

    /* M5 — Soustraire = ajouter l'opposé, constaté sur la droite. */
    5: [
      {
        id: 'soustraction-oppose',
        type: 'regles',
        title: 'Soustraire, c’est ajouter l’opposé',
        summary: 'Retirer un nombre revient à faire le déplacement inverse — donc à ajouter son opposé.',
        visual: <Line min={-6} max={6} marks={[{ at: 1, label: 'départ', color: '#4f46e5' }]} jump={{ from: 1, to: 5, label: `− ${fmt(-4)}` }} />,
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-purple-200 p-3 space-y-1.5">
              <div className="text-sm text-slate-700">
                <strong>1 − ({fmt(-4)}) = 1 + 4 = 5</strong>
              </div>
              <div className="text-xs text-slate-500">
                Retirer {fmt(-4)}, c’est faire l’inverse du déplacement « 4 vers la gauche » :
                on va donc 4 graduations <strong>vers la droite</strong>.
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Toute soustraction peut ainsi s’écrire comme une addition :{' '}
              <strong>a − b = a + (opposé de b)</strong>.
            </p>
          </div>
        ),
      },
      {
        id: 'ecart-deux-nombres',
        type: 'methodes',
        title: 'L’écart entre deux nombres',
        summary: 'L’écart, c’est le nombre de graduations qui séparent les deux nombres — toujours positif.',
        visual: <Line min={-9} max={3} marks={[{ at: -7, label: fmt(-7), color: '#e11d48' }, { at: -2, label: fmt(-2), color: '#4f46e5' }]} jump={{ from: -7, to: -2, label: '5' }} />,
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              De {fmt(-7)} à {fmt(-2)}, il y a <strong>5 graduations</strong> : l’écart vaut 5.
            </p>
            <p className="text-slate-500">
              Un écart est une distance : on le compte sur la droite, et il ne porte pas de signe.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-soustraire',
        type: 'memoriser',
        title: '⭐ Soustraire = ajouter l’opposé',
        summary: 'a − b = a + (opposé de b).',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg sm:text-xl font-black text-rose-700">
                a − b = a + (opposé de b)
              </div>
              <div className="text-sm text-slate-600 font-semibold">
                5 − ({fmt(-3)}) = 5 + 3 = 8
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Une soustraction difficile devient une addition facile.
            </p>
          </div>
        ),
      },
    ],
  },
};
