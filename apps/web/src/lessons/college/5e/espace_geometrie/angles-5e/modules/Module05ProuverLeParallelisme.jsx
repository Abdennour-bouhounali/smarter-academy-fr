import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ChantierLab, { CHANTIERS } from '../components/ChantierLab';

/**
 * Module 5 — MANIPULATION : prouver le parallélisme (la réciproque).
 *
 * C'est le module qui RÈGLE la panne du module 1. Le sens direct (M3, M4) ne
 * sert que si l'on sait DÉJÀ que les droites sont parallèles ; ici l'élève ne
 * le sait pas — c'est justement ce qu'il doit établir — et il n'a le droit de
 * mesurer que localement, dans une fenêtre.
 *
 * LE DISPOSITIF : trois paires de rails dont on ne voit qu'une bande. Deux
 * angles sont mesurables à chaque fois ; l'élève tranche, puis le rideau se
 * lève et montre ce qui se passait hors du cadre. Le chantier B a un écart de
 * 2° : invisible dans la fenêtre, décisif à l'échelle des rails. C'est lui qui
 * tue l'idée de « presque parallèle ».
 *
 * Expected observation : « deux angles égaux suffisent à conclure, sans jamais
 * voir la suite des droites ».
 * Misconception targeted : croire qu'un petit écart est négligeable, et croire
 * qu'on ne peut pas conclure sans voir la figure en entier.
 */
export default function Module05ProuverLeParallelisme() {
  const [reponses, setReponses] = useState({});
  const [revele, setRevele] = useState({});
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const tousFaits = CHANTIERS.every((c) => revele[c.id]);

  const repondre = (chantier, dit, react) => {
    setReponses((p) => ({ ...p, [chantier.id]: dit }));
    setRevele((p) => ({ ...p, [chantier.id]: true }));
    react?.(dit === chantier.paralleles);
  };

  const steps = [
    {
      num: 1,
      title: 'Trois chantiers, trois verdicts',
      subtitle: 'Tu ne vois qu’une fenêtre. Compare les deux angles, et décide — sans voir la suite.',
      done: tousFaits,
      content: (kit) => (
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3.5 text-sm text-slate-700">
            Sur un vrai chantier, impossible de reculer de trois kilomètres pour vérifier que deux
            rails sont parallèles. On ne dispose que de{' '}
            <strong>ce qu’on peut mesurer sur place</strong> : ici, deux angles alternes-internes.
          </div>
          {CHANTIERS.map((c) => (
            <ChantierLab
              key={c.id}
              chantier={c}
              revele={!!revele[c.id]}
              reponse={reponses[c.id]}
              onRepondre={(dit) => repondre(c, dit, kit.react)}
            />
          ))}
          {tousFaits && (
            <Feedback tone="ok">
              Les trois fois, <strong>les deux angles ont suffi</strong>. Là où ils étaient égaux,
              les rails ne se rejoignent jamais ; là où ils différaient de 2°, ils finissent par se
              croiser — alors même que, dans la fenêtre, cet écart était invisible.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux degrés, ce n’est pas « presque parallèle »',
      done: tousFaits,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3.5 text-sm text-slate-700">
            Dans le chantier B, l’écart n’était que de <strong>2°</strong>. Sur la fenêtre, rien ne
            se voyait. Et pourtant les rails se rencontrent — plus loin, mais ils se rencontrent.
          </div>
          <Feedback tone="ok">
            En géométrie, il n’y a pas de « presque parallèle » : soit les angles sont{' '}
            <strong>exactement</strong> égaux et les droites ne se croisent jamais, soit ils
            diffèrent, si peu que ce soit, et la rencontre est certaine.
          </Feedback>
        </div>
      ),
    },
    {
      num: 3,
      title: 'La propriété qui permet de prouver',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="reciproque-parallelisme"
            variant="new"
            lead={<>Tu viens de trancher trois fois le parallélisme sans jamais voir les droites en entier. C’est cette propriété-là qui te l’a permis.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Dans chaque situation, dis quelle propriété il faut utiliser.
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: 'On SAIT que les droites sont parallèles, on cherche la mesure d’un angle.',
                options: ['Parallèles ⟹ angles égaux', 'Angles égaux ⟹ parallèles'],
                correct: 0,
                correction: 'On part du parallélisme (l’information donnée) pour en déduire une mesure.',
              },
              {
                id: 'r2',
                label: 'On a mesuré deux angles alternes-internes égaux, on veut prouver le parallélisme.',
                options: ['Angles égaux ⟹ parallèles', 'Parallèles ⟹ angles égaux'],
                correct: 0,
                correction: 'C’est la réciproque : elle part des angles pour conclure sur les droites.',
              },
              {
                id: 'r3',
                label: 'Deux angles alternes-internes mesurent 71° et 74°. Que conclure ?',
                options: ['Les droites ne sont pas parallèles', 'Les droites sont parallèles'],
                correct: 0,
                correction: '71 ≠ 74 : l’égalité échoue, donc les droites se croiseront quelque part.',
              },
              {
                id: 'r4',
                label: 'Deux angles OPPOSÉS PAR LE SOMMET sont égaux. Que conclure sur le parallélisme ?',
                options: ['Rien du tout', 'Les droites sont parallèles'],
                correct: 0,
                correction: 'Ils sont toujours égaux, parallèles ou non : ils ne concernent qu’un seul croisement, et ne prouvent rien.',
              },
            ]}
            requires={['reciproque-parallelisme', 'paralleles-angles-egaux', 'calculer-les-angles']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Le réflexe est là : <strong>ce qu’on possède choisit la propriété</strong>. On
                  part du parallélisme pour trouver des angles, ou des angles pour prouver le
                  parallélisme.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. À chaque ligne, demande-toi :{' '}
                  <strong>qu’est-ce que je SAIS déjà</strong>, et{' '}
                  <strong>qu’est-ce que je CHERCHE</strong> ? C’est ce couple-là qui décide du sens
                  de la propriété.
                </Feedback>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Retour au tout début',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Au module 1, deux droites semblaient parallèles et ne l’étaient pas. Comment aurait-on pu s’en rendre compte SANS reculer ?"
            options={[
              'En traçant une sécante et en comparant deux angles alternes-internes',
              'En mesurant l’écart entre les droites avec une règle',
              'On ne pouvait pas : il fallait forcément reculer',
            ]}
            correct={0}
            cols={1}
            requires={['reciproque-parallelisme', 'secante']}
            explain="Une sécante, deux angles, une comparaison : les mesures auraient différé, ce qui prouve que les droites se croisent quelque part. Tout se fait sur la feuille, sans jamais voir l’infini."
            explainWrong="La règle ne suffit pas : il faudrait déjà savoir où mesurer perpendiculairement, et un écart minuscule échappe à la mesure. Les angles, eux, transforment cet écart en une différence franche."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              La panne du module 1 est réparée : une <strong>mesure locale</strong> décide bien de
              ce qui se passe <strong>infiniment loin</strong>. C’est exactement ce qu’on cherchait.
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
      moduleTitle="Prouver le parallélisme"
      moduleSubtitle="La propriété lue à l’envers"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Conclure sans voir la suite',
        tone: 'indigo',
        body: (
          <p>
            Tu ne verras qu’une <strong>fenêtre</strong> sur chaque paire de rails, et tu devras
            pourtant dire s’ils se rejoindront un jour. Deux angles suffiront — c’est le sens de la
            propriété qui te manquait encore.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
