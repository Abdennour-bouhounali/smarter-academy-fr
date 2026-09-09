import React, { useState } from 'react';
import { Search, Layers } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GesteLab from '../components/GesteLab';
import {
  DRAPEAU, TRIANGLE_M3, QUAD_M4, GLISSEMENTS, CENTRE_DEMI_TOUR,
  translater, demiTour,
} from '../components/translation4e';

/**
 * Module 6 — ATELIER : reconnaître le geste sur un dessin.
 *
 * Les cinq modules précédents demandaient de CONSTRUIRE. Celui-ci demande de
 * LIRE, ce qui est le geste de l'exercice réel : on donne une figure et sa
 * copie, et il faut nommer la transformation. Le laboratoire ne se manipule
 * donc pas — une poignée détournerait l'attention de la seule chose à
 * regarder : les trajets.
 *
 * TROIS CAS, TROIS NATURES DIFFÉRENTES, et aucun n'est un piège gratuit :
 *   1. une translation — les trajets sont parallèles ;
 *   2. un demi-tour de 5e — ils se croisent tous en un point ;
 *   3. un agrandissement — la copie n'a pas la même taille, et ce n'est donc
 *      NI l'un NI l'autre. Ce troisième cas existe pour que « ce n'est pas une
 *      translation » ne se réduise pas à « c'est donc un demi-tour ».
 *
 * LA CORRECTION VIENT DE LA MESURE. Après la réponse, `GesteLab` affiche ce
 * que le calcul dit des points DESSINÉS — le glissement retrouvé, ou le
 * centre, ou l'échec des deux. Aucun verdict n'est une chaîne écrite à la
 * main dans l'exercice.
 */

/** Les trois cas, exportés pour que `parcours.test.js` VÉRIFIE que chaque
 *  figure et sa copie tiennent dans le cadre et portent bien le geste
 *  annoncé — sans quoi l'atelier montrerait autre chose que ce qu'il dit. */

/** Cas 3 : un agrandissement. Il est construit ici et non dans le noyau —
 *  l'agrandissement-réduction est un objet de 3e, et le noyau de 4e n'a
 *  aucune raison de savoir le faire. Ici, ce n'est qu'un CONTRE-EXEMPLE
 *  dessiné, jamais une transformation qu'on enseigne. */
const agrandir = (pts, k, centre) => pts.map((p) => ({
  x: centre.x + (p.x - centre.x) * k,
  y: centre.y + (p.y - centre.y) * k,
}));

/** Le quadrilatère du cas 3, remonté de trois carreaux pour que la copie
 *  AGRANDIE tienne encore dans le cadre. Sans ce décalage, l'image sortait
 *  par le bas et l'élève n'aurait pas pu comparer les deux tailles —
 *  `parcours.test.js` le vérifie. */
const QUAD_HAUT = QUAD_M4.map((p) => ({ x: p.x, y: p.y - 120 }));

export const CAS = [
  {
    id: 'cas1',
    titre: 'Premier dessin',
    figure: DRAPEAU,
    image: translater(DRAPEAU, GLISSEMENTS.m1),
    options: [
      'Une translation : les traits sont parallèles et de même longueur',
      'Un demi-tour : les traits se croisent',
      'Ni l’un ni l’autre : la copie a changé de taille',
    ],
    correct: 0,
    explain:
      'Les cinq traits sont parallèles et de même longueur : chaque sommet a fait le même trajet. C’est une translation, et la copie n’a pas pivoté.',
  },
  {
    id: 'cas2',
    titre: 'Deuxième dessin',
    figure: TRIANGLE_M3,
    image: demiTour(TRIANGLE_M3, CENTRE_DEMI_TOUR),
    options: [
      'Une translation : la copie est ailleurs',
      'Un demi-tour : les traits se croisent tous au même point',
      'Ni l’un ni l’autre : la copie a changé de taille',
    ],
    correct: 1,
    explain:
      'Les trois traits ne sont pas parallèles : ils se coupent tous au même endroit. C’est la signature du demi-tour vu en 5e — et on le remarque à ce que la copie est « à l’envers ».',
  },
  {
    id: 'cas3',
    titre: 'Troisième dessin',
    figure: QUAD_HAUT,
    image: agrandir(QUAD_HAUT, 1.5, { x: 80, y: 80 }),
    options: [
      'Une translation : la copie est plus à droite',
      'Un demi-tour autour d’un point qu’on ne voit pas',
      'Ni l’un ni l’autre : la copie n’a pas la même taille',
    ],
    correct: 2,
    explain:
      'Les traits ne sont ni parallèles ni concourants, et surtout la copie est plus grande que la figure. Ni translation ni demi-tour ne changent la taille : ce geste n’est donc aucun des deux.',
  },
];

export default function Module06LAtelierDesTroisGestes() {
  const [faits, setFaits] = useState({});
  const [q4, setQ4] = useState(false);

  const steps = [
    ...CAS.map((cas, i) => ({
      num: i + 1,
      title: cas.titre,
      subtitle: 'Regarde les traits qui relient chaque sommet à sa copie.',
      done: !!faits[cas.id],
      content: (
        <div className="space-y-3">
          <GesteLab
            figure={cas.figure}
            image={cas.image}
            reveler={!!faits[cas.id]}
            ariaLabel={`${cas.titre} : quel geste ?`}
          />
          <TapQuestion
            prompt="Quel geste mène de la figure grise à la copie violette ?"
            options={cas.options}
            correct={cas.correct}
            cols={1}
            requires={i === 0
              ? ['translation', 'trois-caracteres']
              : ['translation', 'invariants-translation', 'symetrie-centrale']}
            explain={cas.explain}
            solved={!!faits[cas.id]}
            onAnswered={() => setFaits((f) => ({ ...f, [cas.id]: true }))}
          />
        </div>
      ),
    })),
    {
      num: 4,
      title: 'La méthode, en un geste',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Devant un dessin inconnu, par quoi commences-tu pour reconnaître le geste ?"
            options={[
              'Je relie chaque point à sa copie et je regarde les traits',
              'Je mesure les longueurs des côtés des deux figures',
              'Je compare les aires des deux figures',
              'Je cherche un axe de symétrie',
            ]}
            correct={0}
            cols={1}
            requires={['invariants-translation', 'translation']}
            explain="Les longueurs et les aires ne trancheront pas : translation et demi-tour les conservent toutes les deux. Seuls les trajets distinguent les deux gestes — et ils repèrent aussi, du même coup, le cas où la figure a changé de taille."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="reconnaitre-le-geste"
              variant="new"
              lead="Trois dessins, trois verdicts — voici la méthode qui les donne."
            />
          )}
          {q4 && (
            <Feedback tone="ok">
              Tu sais faire glisser, construire, mesurer, relier et reconnaître. Il ne reste
              qu’à le prouver.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="L’atelier des trois gestes"
      moduleSubtitle="Trois dessins, une seule question"
      estimatedTime="8 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'Qui a fait quoi ?',
        tone: 'indigo',
        body: (
          <>
            Plus rien à construire : trois figures, trois copies.{' '}
            <strong>À toi de dire quel geste a été fait à chaque fois.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <Search className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            Les traits orange (ou rouges) relient chaque sommet à sa copie.{' '}
            <Layers className="inline h-4 w-4" aria-hidden="true" /> Ce sont eux qu’il faut
            regarder — pas les longueurs des côtés.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
