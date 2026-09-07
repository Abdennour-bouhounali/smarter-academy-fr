import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { mean, median, formatNumber } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SeriesLab from '../components/SeriesLab';
import { TRAJETS_A } from '../data';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : la série manipulable
 * (components/SeriesLab.jsx).
 *
 * Step 1  LE GESTE D'ABORD (règle : le module s'ouvre sur la manipulation,
 *         jamais sur une question) : tirer une pastille vers l'extrême droite,
 *         puis la ramener. La moyenne suit, la médiane reste — c'est LE
 *         phénomène de la leçon, éprouvé avant tout commentaire.
 * Step 2  revenir à la série brute et choisir « le » nombre qui la résume.
 * Step 3  les deux repères nommés, et pourquoi ils ne coïncident pas.
 * Step 4  la question qui ouvre la suite, sans y répondre.
 *
 * Rien n'est défini formellement ici : « moyenne » et « médiane » sont
 * nommées comme les deux repères qu'on voit bouger, leurs définitions et
 * leurs méthodes de calcul appartiennent au module 2.
 */
export default function Module01LesTempsDeTrajet() {
  const [values, setValues] = useState(TRAJETS_A);
  const [pred, setPred] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q4, setQ4] = useState(false);

  // Step 3 : il faut avoir emmené une valeur au-delà de 55 min (hors du
  // nuage) ET l'avoir ramenée — le va-et-vient montre que la moyenne suit
  // dans les deux sens, la médiane presque pas.
  const [pushedFar, setPushedFar] = useState(false);
  const [broughtBack, setBroughtBack] = useState(false);
  const done1 = q1;
  const done2 = true;               // observation : validée dès l'affichage des repères
  const done3 = pushedFar && broughtBack;
  const done4 = q4;

  const change3 = (next, react) => {
    setValues(next);
    const mx = Math.max(...next);
    if (mx >= 55 && !pushedFar) setPushedFar(true);
    if (pushedFar && mx <= 45 && !broughtBack) { setBroughtBack(true); react?.(true); }
  };

  const m = mean(values);
  const med = median(values);

  const steps = [
    {
      num: 1,
      title: 'Déménage un élève',
      subtitle: 'Chaque pastille est un élève de 2de A. Attrape-en une, emmène-la au-delà de 55 min, puis ramène-la. Regarde lequel des deux repères bouge.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="si un seul élève déménage très loin, que deviennent les deux repères ?"
            options={[
              { id: 'both', label: 'Les deux se déplacent autant' },
              { id: 'mean', label: 'Surtout le repère orange' },
              { id: 'median', label: 'Surtout le repère vert' },
              { id: 'none', label: 'Aucun des deux' },
            ]}
            value={pred} onChange={setPred} disabled={done3}
          />
          <SeriesLab values={values} onChange={(n) => change3(n, kit.react)} min={0} max={60} unit="min"
            label="2de A — déplace une pastille" show={{ mean: true, median: true }} />
          {done3 ? (
            <Feedback tone="ok">
              {pred === 'mean' ? 'Ta prédiction tenait' : pred ? 'Regarde encore' : 'Voilà'} : le repère
              <strong> orange se déplace nettement</strong>, le <strong>vert reste presque immobile</strong>.
              Le premier utilise la VALEUR de chaque durée — donc un trajet énorme pèse énormément.
              Le second ne compte que le NOMBRE d’élèves de chaque côté : un élève reste un élève,
              qu’il habite à 40 ou à 400 minutes.
              {' '}<span className="text-slate-500">Continue à déplacer les pastilles : moyenne {formatNumber(m, 2)} min, médiane {formatNumber(med, 1)} min.</span>
            </Feedback>
          ) : null}
          {/* Le va-et-vient vient de montrer que les vingt durées forment UN
              objet dont deux repères ne disent pas la même chose : c'est
              l'instant où « série » et « position / étalement » ont un sens,
              avant que l'étape 2 n'exige de la résumer. */}
          {done3 && (
            <KnowledgeBrick
              id="serie-statistique"
              variant="new"
              lead={<>Tu viens de déplacer <strong>un</strong> élève et de voir <strong>un seul</strong> des deux repères le suivre. Ces vingt durées forment un objet qui a un nom.</>}
            />
          )}
          {!done3 && (
            <Feedback tone="info">
              {!pushedFar ? 'Emmène une pastille au-delà de 55 min.' : 'Maintenant ramène-la sous 45 min.'}
              {' '}Actuellement : orange {formatNumber(m, 2)} min, vert {formatNumber(med, 1)} min.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Vingt élèves, vingt durées',
      subtitle: 'Reviens à la série telle qu’elle est, sans aucun repère affiché.',
      done: done1,
      content: (
        <div className="space-y-3">
          <SeriesLab values={TRAJETS_A} min={0} max={60} unit="min" label="2de A — temps de trajet" />
          <TapQuestion
            prompt="Si tu devais résumer cette classe par UN seul nombre, lequel serait le plus honnête ?"
            options={[
              'Environ 18–19 min : la plupart des élèves sont regroupés par là',
              '5 min : le trajet le plus court',
              '40 min : le trajet le plus long',
              '35 min : l’écart entre le plus court et le plus long',
            ]}
            correct={0} cols={1}
            requires={['serie-statistique', 'moyenne', 'mediane-stat', 'etendue', 'dispersion']}
            explain="Le gros du nuage se situe entre 10 et 25 min. Un extrême (5 ou 40) ne décrit qu’un élève ; l’étendue (35) mesure l’étalement, pas la position."
            explainWrong="Un seul élève, si atypique soit-il, ne résume pas la classe. Regarde où les pastilles s’accumulent."
            solved={done1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Deux repères, deux réponses',
      subtitle: 'On affiche maintenant deux façons de dire « le milieu ». Elles ne tombent pas au même endroit.',
      done: done2,
      content: (
        <div className="space-y-3">
          <SeriesLab values={TRAJETS_A} min={0} max={60} unit="min"
            label="2de A — avec les deux repères" show={{ mean: true, median: true }} />
          <Feedback tone="info">
            Le repère vert (18 min) coupe la classe en deux <strong>moitiés d’effectif</strong> : dix élèves
            en dessous, dix au-dessus. Le repère orange (19,15 min) est le résultat d’un <strong>partage
            équitable</strong> du temps total. Ils diffèrent parce que quelques trajets très longs
            « tirent » le second vers la droite.
          </Feedback>
          {/* Le mot « moitiés d'effectif » vient d'être employé sur la figure :
              on pose ici le vocabulaire qui compte les individus, dont l'étape
              4 et tout le reste de la leçon se serviront. */}
          <KnowledgeBrick
            id="vocab-effectif-frequence"
            variant="new"
            compact
            lead={<>Le repère vert a partagé la classe en deux paquets de <strong>dix élèves</strong>. Compter des élèves, c'est compter un effectif.</>}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Un nombre suffit-il ?',
      done: done4,
      content: (
        <TapQuestion
          prompt="Deux classes ont exactement la même moyenne de trajet : 19 min. Peut-on en conclure qu’on y voyage de la même façon ?"
          options={[
            'Non : la même moyenne peut cacher des séries très différentes — l’une resserrée, l’autre très étalée',
            'Oui : la moyenne résume toute la série',
            'Oui, à condition qu’elles aient le même effectif',
            'Non, mais seulement si les effectifs diffèrent',
          ]}
          correct={0} cols={1}
          requires={['serie-statistique', 'vocab-effectif-frequence', 'moyenne', 'indicateur-stat', 'dispersion', 'effectif']}
          explain="Une classe où tout le monde met entre 17 et 21 min et une classe où l’on met entre 5 et 40 min peuvent avoir la même moyenne. Un indicateur de POSITION ne dit rien de l’ÉTALEMENT."
          explainWrong="Rien n’empêche deux séries de même moyenne d’avoir des allures opposées : c’est précisément ce que la suite de la leçon va mesurer."
          solved={done4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Les temps de trajet" moduleSubtitle="Un seul nombre peut-il résumer une classe ?" estimatedTime="12 min"
      brief={{
        tag: 'Déclencheur', title: 'Déplace un élève', tone: 'indigo',
        body: <p>Les vingt élèves de 2de A ont noté leur temps de trajet. Chaque pastille est un élève : attrape-en une et fais-la glisser. Deux repères sont affichés — un seul va la suivre.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Les mots justes.</strong> Le repère orange est la <strong>moyenne</strong>, le vert la
          {' '}<strong>médiane</strong>. Module suivant : comment on les calcule, et laquelle choisir selon la question posée.
        </KnowledgeSnapshot>
      )}
    />
  );
}
