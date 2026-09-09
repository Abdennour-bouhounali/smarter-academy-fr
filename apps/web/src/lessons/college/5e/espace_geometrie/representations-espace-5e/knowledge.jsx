import React from 'react';
import ViewsPanel from '../../../../common/components/ViewsPanel';
import { SOLIDS } from '../../../../common/utils/geometry3d';
import BandeCylindreLab from './components/BandeCylindreLab';
import PatronPrismeLab from './components/PatronPrismeLab';
import { BOITE_CHOCOLATS, BOITE_THE, perimetreBase, fmtLong } from './components/espace5e';

/**
 * Carte des connaissances — « Représentation de l'espace » (5e).
 *
 * Un item appartient au module qui l'enseigne EN PREMIER (le réducteur
 * déduplique par id, le plus petit module gagne). Les visuels sont les
 * manipulations de la leçon, FIGÉES : l'élève retrouve dans sa carte
 * exactement la figure qu'il a manipulée.
 *
 * ─── LA CHAÎNE DE DÉPENDANCE, QUI DICTE L'ORDRE ───────────────────────
 *   solide usuel · vue                        ← M1, une vue ne suffit pas
 *        ↓  d'où un dessin qui montre les trois dimensions
 *   perspective cavalière · fuyante           ← M2
 *        ↓  mais un dessin déforme, donc on projette
 *   trois vues · associer                     ← M3
 *        ↓  et pour FABRIQUER, il faut déplier
 *   patron du prisme · deux bases             ← M4
 *        ↓  jusqu'au cas courbe
 *   patron du cylindre · la bande = périmètre ← M5
 *        ↓  et l'on commande par des grandeurs
 *   dimensions                                ← M6
 *
 * PÉRIMÈTRE : aucun item ne parle de volume, de sphère, de pyramide ni de
 * cône — ce sont des objets de 4e ou des exclusions explicites du référentiel
 * 2026 (voir lesson.config.js).
 */

/** Les trois vues du prisme, figées — non interactives. */
const VuesFigees = () => <ViewsPanel solid={SOLIDS.prisme} />;

/** La bande du cylindre à sa longueur exacte, figée. */
const BandeFigee = () => (
  <BandeCylindreLab cyl={BOITE_THE} longueur={perimetreBase(BOITE_THE)} disabled />
);

/** Un patron correct du prisme, figé. */
const PatronFige = () => (
  <PatronPrismeLab
    prisme={BOITE_CHOCOLATS}
    pieces={[
      { id: 'b1', role: 'base', cote: 'haut', slot: 'haut-0' },
      { id: 'b2', role: 'base', cote: 'bas', slot: 'bas-2' },
      { id: 'f1', role: 'flanc', slot: 'flanc-0' },
      { id: 'f2', role: 'flanc', slot: 'flanc-1' },
      { id: 'f3', role: 'flanc', slot: 'flanc-2' },
    ]}
    disabled
    showVerdict={false}
  />
);

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'vue',
        type: 'vocabulaire',
        title: 'Vue d’un solide',
        summary: 'Ce qu’on voit en regardant le solide depuis une direction : une image plate, qui perd une dimension.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Une <strong>vue</strong> est l’image obtenue en regardant le solide depuis une
              direction précise : de face, de dessus, ou de côté.
            </p>
            <p className="text-sm text-slate-700">
              Elle écrase le solide sur un plan et perd donc une information. C’est pourquoi{' '}
              <strong>une seule vue ne suffit pas</strong> à reconnaître un solide : deux objets
              différents peuvent donner exactement la même.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les deux cartons qui donnaient la même photo de face.
            </div>
          </div>
        ),
      },
      {
        id: 'solide-usuel',
        type: 'concepts',
        title: 'Prisme droit et cylindre',
        summary: 'Deux solides à deux bases identiques, reliées par une surface latérale.',
        body: (
          <div className="space-y-3">
            <ul className="space-y-1 text-sm text-slate-700">
              <li>
                • le <strong>prisme droit</strong> : deux polygones identiques (les{' '}
                <em>bases</em>) reliés par des rectangles ;
              </li>
              <li>
                • le <strong>cylindre de révolution</strong> : deux disques identiques reliés par
                une surface courbe.
              </li>
            </ul>
            <p className="text-sm text-slate-600">
              Les deux suivent le même plan de fabrication : <strong>deux bases</strong>, et{' '}
              <strong>une bande</strong> qui en fait le tour.
            </p>
          </div>
        ),
      },
    ],

    2: [
      {
        id: 'perspective-cavaliere',
        type: 'concepts',
        title: 'Perspective cavalière',
        summary: 'Une convention de dessin : la face avant en vraie grandeur, la profondeur en fuyante et raccourcie.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              La <strong>perspective cavalière</strong> n’est pas une photographie : c’est une{' '}
              <strong>convention</strong> choisie pour que le dessin reste mesurable.
            </p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• la face avant est dessinée en <strong>vraie grandeur</strong> ;</li>
              <li>• les fuyantes partent toutes dans la <strong>même direction</strong> ;</li>
              <li>• elles sont <strong>raccourcies</strong> d’un même coefficient.</li>
            </ul>
            <p className="text-sm text-slate-600">
              C’est pour cela qu’un carré vu en fuyante se dessine comme un parallélogramme : ce
              n’est pas une erreur du dessin, c’est la règle.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le prisme qu’on faisait tourner, dont la face avant gardait ses mesures.
            </div>
          </div>
        ),
      },
      {
        id: 'fuyante',
        type: 'vocabulaire',
        title: 'Fuyante et arête cachée',
        summary: 'Les fuyantes portent la profondeur ; les arêtes qu’on ne verrait pas se tracent en pointillé.',
        body: (
          <div className="space-y-3">
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• une <strong>fuyante</strong> est une arête qui part vers l’arrière ;</li>
              <li>
                • une <strong>arête cachée</strong> est masquée par le solide lui-même : on la
                trace <strong>en pointillé</strong> pour la montrer sans mentir.
              </li>
            </ul>
            <p className="text-sm text-slate-600">
              Ce qui est caché dépend du point de vue : tourner le solide fait passer une même
              arête du pointillé au trait plein.
            </p>
          </div>
        ),
      },
    ],

    3: [
      {
        id: 'trois-vues',
        type: 'concepts',
        title: 'Les trois vues',
        summary: 'De face, de dessus, de côté : trois projections qui, ensemble, déterminent le solide.',
        visual: <VuesFigees />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Le dessin technique représente un solide par <strong>trois vues</strong> : de face,
              de dessus et de côté.
            </p>
            <p className="text-sm text-slate-700">
              Chacune perd une dimension, mais <strong>ensemble</strong> elles ne laissent plus
              d’ambiguïté : c’est ce qui permet de fabriquer une pièce d’après un plan.
            </p>
          </div>
        ),
      },
      {
        id: 'associer-vues',
        type: 'methodes',
        title: 'Associer un solide à ses vues',
        summary: 'Comparer une vue à la fois, et ne conclure que si les trois concordent.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-1 text-sm text-slate-700">
              <li><strong>1.</strong> Regarder la vue de face : éliminer les solides dont la silhouette diffère.</li>
              <li><strong>2.</strong> Passer à la vue de dessus : c’est elle qui distingue un prisme d’un cylindre (polygone ou disque).</li>
              <li><strong>3.</strong> Vérifier avec la vue de côté.</li>
              <li><strong>4.</strong> Ne conclure que si les <strong>trois</strong> concordent.</li>
            </ol>
          </div>
        ),
      },
    ],

    4: [
      {
        id: 'patron-prisme',
        type: 'concepts',
        title: 'Patron du prisme droit',
        summary: 'Deux bases identiques, et une bande de rectangles — un par côté de la base.',
        visual: <PatronFige />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Le <strong>patron</strong> est la figure plane qui, pliée, redonne le solide. Pour un
              prisme droit à base à <em>n</em> côtés :
            </p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• <strong>2 bases</strong> identiques ;</li>
              <li>• <strong>n rectangles</strong>, un par côté de la base ;</li>
              <li>• tous de la <strong>même hauteur</strong> : celle du prisme.</li>
            </ul>
          </div>
        ),
      },
      {
        id: 'deux-bases',
        type: 'regles',
        title: 'Les deux bases vont de part et d’autre',
        summary: 'Placées du même côté de la bande, elles se rabattraient au même endroit et le solide resterait ouvert.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Un prisme a <strong>deux extrémités</strong> : une base doit se rabattre sur chacune.
            </p>
            <p className="text-sm text-slate-700">
              Si les deux bases sont posées du <strong>même côté</strong> de la bande, elles
              viennent au même endroit au pliage : une extrémité se retrouve doublée, l’autre
              ouverte. C’est l’erreur la plus fréquente, et elle se voit au pliage.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le patron refusé, avec ses deux triangles du même côté.
            </div>
          </div>
        ),
      },
    ],

    5: [
      {
        id: 'patron-cylindre',
        type: 'concepts',
        title: 'Patron du cylindre',
        summary: 'Deux disques, et un rectangle qui s’enroule autour d’eux.',
        visual: <BandeFigee />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Déplié, un cylindre donne <strong>deux disques</strong> (les bases) et{' '}
              <strong>un rectangle</strong> : sa surface latérale, mise à plat.
            </p>
            <p className="text-sm text-slate-700">
              La <strong>hauteur</strong> du rectangle est celle du cylindre. Sa{' '}
              <strong>longueur</strong>, elle, ne se choisit pas : elle doit faire exactement le
              tour du disque.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le curseur qu’on réglait jusqu’à ce que le tube se referme.
            </div>
          </div>
        ),
      },
      {
        id: 'bande-perimetre',
        type: 'regles',
        title: 'La bande a pour longueur le périmètre de la base',
        summary: 'Le rectangle doit faire le tour du disque : sa longueur est 2 × π × rayon, jamais le diamètre.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              La bande s’enroule <strong>autour</strong> du disque. Sa longueur est donc le{' '}
              <strong>périmètre</strong> de ce disque :
            </p>
            <div className="text-center font-mono text-lg font-black text-violet-700">
              longueur = 2 × π × rayon
            </div>
            <p className="text-sm text-slate-700">
              C’est environ <strong>3 fois le diamètre</strong> — prendre le diamètre laisserait un
              large jour : la bande ne ferait même pas le tiers du tour.
            </p>
            <p className="text-sm text-slate-600">
              Exemple : pour un rayon de {fmtLong(BOITE_THE.rayon)}, la bande mesure environ{' '}
              <strong>{fmtLong(perimetreBase(BOITE_THE))}</strong>.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-bande',
        type: 'memoriser',
        title: '⭐ La bande fait le TOUR, pas la traversée',
        summary: 'Longueur de la bande = périmètre de la base (2 × π × r), et non le diamètre.',
        body: (
          <p className="text-sm text-slate-700">
            Le diamètre <em>traverse</em> le disque ; le périmètre en <em>fait le tour</em>. C’est
            le tour qu’il faut, puisque c’est autour que la bande s’enroule.
          </p>
        ),
      },
    ],

    6: [
      {
        id: 'dimensions-solide',
        type: 'methodes',
        title: 'Des dimensions au patron',
        summary: 'Rayon et hauteur, ou côtés de la base et hauteur, suffisent à tracer le patron entier.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Pour commander un carton, il suffit de quelques grandeurs — tout le reste s’en déduit.
            </p>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>
                • <strong>cylindre</strong> : rayon et hauteur → deux disques de ce rayon, et un
                rectangle de hauteur donnée et de longueur 2 × π × rayon ;
              </li>
              <li>
                • <strong>prisme droit</strong> : la base et la hauteur → deux bases, et un
                rectangle par côté, tous de cette hauteur.
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: 'mem-trois-vues',
        type: 'memoriser',
        title: '⭐ Une vue ne suffit jamais',
        summary: 'Deux solides différents peuvent partager une vue ; il en faut trois pour conclure.',
        body: (
          <p className="text-sm text-slate-700">
            C’est la raison d’être du dessin technique : trois vues, parce qu’une seule laisserait
            le fabricant deviner.
          </p>
        ),
      },
    ],
  },
};
