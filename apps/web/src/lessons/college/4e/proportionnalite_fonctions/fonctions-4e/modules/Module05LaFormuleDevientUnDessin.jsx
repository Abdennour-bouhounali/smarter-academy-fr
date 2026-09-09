import React, { useState } from 'react';
import { LineChart, MousePointerClick } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GrapheLab from '../components/GrapheLab';
import {
  programme, tableau, trace, formuleTex, frRat, programmeTexte, planeFor, enPoints,
} from '../components/fonctions4e';

/**
 * Module 5 — MANIPULATION : le troisième visage de la même dépendance.
 *
 * Activity              poser les couples un à un dans le repère, puis les
 *                       relier ; comparer une machine qui monte et une qui
 *                       descend, sur le même quadrillage.
 * Mathematical objective la chaîne, la formule et le dessin disent la MÊME
 *                       dépendance. Le dessin ne l'illustre pas : il se lit,
 *                       et il montre d'un coup d'œil le sens de variation.
 * Student action        poser le point suivant ; basculer d'une machine à
 *                       l'autre et voir le repère se refaire.
 * Controlled variable   le nombre de points posés, et la machine choisie.
 * Mathematical state    (prog, entrées, posés). Le CADRE lui-même est calculé
 *                       par `planeFor` À PARTIR DES POINTS : aucune borne
 *                       n'est écrite en dur, donc aucun point ne peut sortir
 *                       du cadre quelle que soit la machine.
 * Visual consequence    le point apparaît ; au dernier, le trait les traverse
 *                       tous.
 * Expected observation  « ils sont tous sur une même ligne — et je peux lire
 *                       entre eux ce que je n'ai pas calculé ».
 * Misconception targeted croire qu'une dépendance MONTE forcément ; croire
 *                       que le repère est donné d'avance plutôt que choisi
 *                       d'après les nombres qu'on calcule.
 * Formalization         la brique `formule-en-dessin` arrive une fois les
 *                       deux nuages construits.
 *
 * ATTEIGNABILITÉ (mémoire « cible atteignable sur la grille ») : ici l'élève
 * ne DÉPOSE pas un point sur un nœud — il demande à la machine de le poser.
 * Il n'y a donc aucune cible à atteindre à la main, et donc aucune étape
 * impossible. Ce qui doit être vérifié, en revanche, c'est que le CADRE
 * calculé contient bien tous les points : `parcours.test.js` le fait pour
 * chaque machine du module.
 *
 * DIFFÉRENCE AVEC LE MODULE 4 : là-bas on remontait des couples vers une
 * écriture ; ici on descend d'une écriture vers un dessin. Le sens de lecture
 * est inversé, et c'est ce qui referme la boucle des trois visages.
 */

/** La machine qui MONTE, celle du premier nuage. */
const MONTE = programme(['×', 2], ['+', 1]);
/** La machine qui DESCEND : le nombre devant l'entrée est négatif. */
const DESCEND = programme(['×', -2], ['+', 10]);

const ENTREES = [0, 1, 2, 3, 4, 5];

/**
 * Les deux cadres, calculés exactement comme `GrapheLab` les calcule — le
 * module CITE le pas vertical à l'étape 4, et il doit citer celui que l'élève
 * a réellement sous les yeux. Un test verrouille cette égalité.
 */
export const PLAN_MONTE = planeFor(enPoints(tableau(MONTE, ENTREES)), { width: 300, height: 210 });
export const PLAN_DESCEND = planeFor(enPoints(tableau(DESCEND, ENTREES)), { width: 300, height: 210 });

/** La sortie demandée à l'étape 5 — dérivée, jamais écrite à la main. */
const SORTIE_HUIT = Number(frRat(trace(MONTE, 8).arrivee));

const sansEspaces = (tex) => tex.replace(/\\,\s*/g, '');

export default function Module05LaFormuleDevientUnDessin() {
  const [posesMonte, setPosesMonte] = useState(0);
  const [posesDescend, setPosesDescend] = useState(0);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const done1 = posesMonte >= ENTREES.length;
  const done2 = posesDescend >= ENTREES.length;

  const bloc = (prog, poses, setPoses, couleur, kit) => (
    <div className="space-y-2">
      <GrapheLab
        prog={prog}
        entrees={ENTREES}
        poses={poses}
        couleur={couleur}
        entreeNom="entrée"
        sortieNom="sortie"
      />
      {poses < ENTREES.length ? (
        <button
          type="button"
          onClick={() => {
            setPoses(poses + 1);
            kit?.react?.(true);
          }}
          className="min-h-[44px] w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
        >
          Poser le point suivant
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <p className="flex-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            Les {ENTREES.length} points sont posés, et le trait les traverse.
          </p>
          <button
            type="button"
            onClick={() => setPoses(0)}
            className="min-h-[44px] rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-slate-300"
          >
            Recommencer
          </button>
        </div>
      )}
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Chaque couple devient un point',
      subtitle: 'Pose-les un à un, et regarde ce qui se dessine.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            La machine {programmeTexte(MONTE)} se résume par{' '}
            <MathText>{`$${sansEspaces(formuleTex(MONTE))}$`}</MathText>. On calcule sa sortie pour
            quelques entrées, et chaque couple devient un point : l’entrée à l’horizontale, la
            sortie à la verticale.
          </p>
          {bloc(MONTE, posesMonte, setPosesMonte, '#7c3aed', kit)}
          {done1 && (
            <Feedback tone="ok">
              Ils sont tous sur une même ligne droite. On peut donc lire ENTRE les points ce qu’on
              n’a pas calculé — pour l’entrée 2,5 par exemple.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Une machine qui descend',
      subtitle: 'Même geste, autre machine. Le repère se refait tout seul.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Celle-ci s’écrit <MathText>{`$${sansEspaces(formuleTex(DESCEND))}$`}</MathText> : le
            nombre devant l’entrée est <strong>négatif</strong>. Pose ses points.
          </p>
          {bloc(DESCEND, posesDescend, setPosesDescend, '#e11d48', kit)}
          {done2 && (
            <Feedback tone="info">
              Toujours une ligne droite — mais elle <strong>descend</strong>. Plus l’entrée
              augmente, plus la sortie diminue. C’est encore une dépendance.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que le dessin apprend',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Les points de la seconde machine descendent. Qu’est-ce qui, dans son écriture, l’annonçait ?"
            options={[
              'Le nombre devant l’entrée est négatif',
              'Le nombre qu’on ajoute est positif',
              'Il y a deux étapes dans la chaîne',
              'Rien : il fallait faire le dessin pour le savoir',
            ]}
            correct={0}
            cols={1}
            requires={['formule-qui-resume', 'couple-point']}
            explain={`Quand l’entrée augmente de 1, la sortie change de ce nombre-là. Ici il vaut −2 : à chaque pas vers la droite, la sortie perd 2. Vérifie sur le tableau : ${frRat(trace(DESCEND, 1).arrivee)} pour 1, puis ${frRat(trace(DESCEND, 2).arrivee)} pour 2.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="formule-en-dessin"
              variant="new"
              lead="Tu viens de construire les deux nuages : voici la marche à suivre, dans l’ordre."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le repère n’est pas donné',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-sm text-slate-600">
            <p>
              Pour la première machine, le pas vertical valait{' '}
              <strong className="font-mono">{PLAN_MONTE.yStep}</strong> ; pour la seconde,{' '}
              <strong className="font-mono">{PLAN_DESCEND.yStep}</strong>. Le repère ne s’est pas
              adapté par magie : il a été choisi d’après les nombres calculés.
            </p>
          </div>
          <TapQuestion
            prompt="Une machine rend des sorties allant de 0 à 300. Quel pas vertical convient le mieux ?"
            options={[
              '50, pour tenir en quelques graduations lisibles',
              '1, pour ne rien perdre',
              '1000, pour être sûr que tout rentre',
              'Le pas n’a pas d’importance',
            ]}
            correct={0}
            cols={1}
            requires={['formule-en-dessin']}
            explain="Avec un pas de 1, il faudrait trois cents traits : le repère deviendrait illisible. Avec un pas de 1000, tous les points s’écraseraient sur l’axe. On choisit un pas rond qui découpe la hauteur du repère en une dizaine de graduations."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
    {
      num: 5,
      title: 'Lire entre les points',
      subtitle: 'Une entrée qu’on n’a pas placée.',
      done: q5,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            La machine qui monte s’écrit{' '}
            <MathText>{`$${sansEspaces(formuleTex(MONTE))}$`}</MathText>. Aucun point n’a été posé
            pour l’entrée 8. Que vaudrait sa sortie ?
          </p>
          <NumericQuestion
            prompt="La sortie pour l’entrée 8"
            expected={SORTIE_HUIT}
            requires={['formule-en-dessin', 'formule-qui-resume']}
            explain={`2 × 8 = 16, puis 16 + 1 = ${SORTIE_HUIT}. Sur le dessin, ce point serait sur le prolongement de la même droite : c’est ce qui permet de lire au-delà de ce qu’on a calculé.`}
            explainFor={(n) => {
              if (n === 16) return 'Tu t’es arrêté au « 2 × 8 ». La chaîne ajoute encore 1.';
              if (n === 18) return 'Tu as ajouté 1 à l’entrée avant de multiplier : (8 + 1) × 2. L’écriture 2x + 1 dit de multiplier d’abord.';
              return null;
            }}
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <Feedback tone="info">
              La chaîne, l’écriture et le dessin : trois visages, une seule dépendance. Il reste à
              s’en servir sur de <strong>vraies</strong> situations.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="La formule devient un dessin"
      moduleSubtitle="Le troisième visage de la même dépendance"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'Des nombres, puis une ligne',
        tone: 'indigo',
        body: (
          <>
            Tu sais calculer la sortie et écrire la formule. Il reste à la{' '}
            <strong>voir</strong> — et à découvrir qu’une dépendance n’est pas obligée de monter.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <LineChart className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            <MousePointerClick className="inline h-4 w-4" aria-hidden="true" /> Pose les points un
            à un. Le repère, lui, s’est déjà réglé sur les nombres que la machine produit.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
