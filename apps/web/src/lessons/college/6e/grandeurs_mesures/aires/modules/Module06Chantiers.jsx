import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AnswerBuilder from '../../../../../common/components/AnswerBuilder';
import { rectangleArea, parseDec, formatDec } from '../components/areaUtils';

/**
 * Module 6 — practice lab : le chantier chez Mamie.
 *
 * Trois travaux réels qui mobilisent tout : la formule, la soustraction
 * d'aires, et le grand final qui referme le piège du Module 2 (même
 * périmètre ≠ même aire) sur un cas d'achat concret.
 */
const MUR = { L: 4, l: 2.5 }; // 10 m²
const MUR_A = rectangleArea(MUR.L, MUR.l);

const FENETRE = { L: 1.5, l: 1 }; // 1,5 m²
const APEINDRE = MUR_A - rectangleArea(FENETRE.L, FENETRE.l); // 8,5

const POTS_Q = {
  q: `Il reste ${formatDec(APEINDRE)} m² à peindre et un pot couvre 5 m². Combien de pots acheter ?`,
  options: ['1 pot', '2 pots', '9 pots'],
  correct: 1,
  explain: `1 pot ne couvre que 5 m² sur ${formatDec(APEINDRE)} : pas assez. 2 pots couvrent 10 m² : on achète 2 pots (et il en restera un peu — sur un chantier on arrondit toujours au-dessus).`,
};

const TAPIS_Q = {
  q: 'Deux tapis au même prix : le tapis A (3 m × 2 m) et le tapis B (4 m × 1 m). Leurs périmètres sont ÉGAUX (10 m chacun). Lequel couvre le plus de sol ?',
  options: [
    'Ils couvrent autant, puisque leurs périmètres sont égaux',
    'Le tapis A : 6 m² contre 4 m² pour le B',
    'Le tapis B : il est plus long',
  ],
  correct: 1,
  explain:
    'A : 3 × 2 = 6 m². B : 4 × 1 = 4 m². Même tour (10 m), mais A couvre moitié plus de sol ! C’est exactement le piège du Module 2 — et ici, il vaut de l’argent.',
};

export default function Module06Chantiers() {
  const [murDone, setMurDone] = useState(false);
  const [fenetreDone, setFenetreDone] = useState(false);
  const [potsDone, setPotsDone] = useState(false);
  const [tapisDone, setTapisDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Chantiers d’aires"
      moduleSubtitle="Peinture, fenêtre, tapis : trois problèmes de surfaces bien réels."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Mamie refait son salon — et compte sur toi.',
        body: <p>Peinture à acheter, tapis à choisir : chaque euro dépend d'une aire bien calculée.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Le mur à peindre',
          done: murDone,
          content: (
            <div className="space-y-4">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
                Le grand mur du salon mesure <strong>{MUR.L} m de long</strong> sur{' '}
                <strong>{formatDec(MUR.l)} m de haut</strong>. Quelle est son aire ?
              </div>
              <AnswerBuilder
                value={MUR_A}
                unitOptions={['m', 'm²', 'cm²']}
                correctUnit="m²"
                sentenceOptions={[
                  'Le mur a une aire de 10 m².',
                  'Le mur a un périmètre de 10 m².',
                  'Le mur mesure 10 m de long.',
                ]}
                correctSentenceIndex={0}
                hint="A = L × l = 4 × 2,5. Et l'aire s'écrit en m², pas en m."
                solved={murDone}
                onSolved={() => setMurDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Moins la fenêtre, plus les pots',
          done: fenetreDone && potsDone,
          content: (
            <div className="space-y-5">
              <NumericQuestion
                prompt={`Le mur est percé d'une fenêtre de ${formatDec(FENETRE.L)} m × ${FENETRE.l} m. Quelle surface reste-t-il à peindre ?`}
                suffix="m²"
                expected={APEINDRE}
                parse={parseDec}
                display={formatDec(APEINDRE)}
                explain={<>Mur : 10 m². Fenêtre : {formatDec(rectangleArea(FENETRE.L, FENETRE.l))} m². À peindre : 10 − 1,5 = <strong>{formatDec(APEINDRE)} m²</strong>.</>}
                explainFor={(n) =>
                  n === 10
                    ? 'C’est l’aire du mur entier — mais on ne peint pas la fenêtre ! Retranche son aire (1,5 × 1).'
                    : 'Calcule l’aire de la fenêtre (1,5 × 1), puis retranche-la des 10 m² du mur.'
                }
                requires={['aire', 'aire-rectangle', 'aire-composee']}
                solved={fenetreDone}
                onAnswered={() => setFenetreDone(true)}
              />
              {fenetreDone && (
                <div className="border-t border-slate-100 pt-4">
                  <TapQuestion
                    prompt={POTS_Q.q}
                    options={POTS_Q.options}
                    correct={POTS_Q.correct}
                    cols={3}
                    explain={POTS_Q.explain}
                    requires={['aire', 'mesurer-par-pavage']}
                    solved={potsDone}
                    onAnswered={() => setPotsDone(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le choix du tapis',
          done: tapisDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt={TAPIS_Q.q}
                options={TAPIS_Q.options}
                correct={TAPIS_Q.correct}
                cols={1}
                explain={TAPIS_Q.explain}
                requires={['aire', 'perimetre', 'aire-rectangle', 'aire-perimetre-independants', 'mem-aire-vs-perimetre']}
                solved={tapisDone}
                onAnswered={() => setTapisDone(true)}
              />
              {tapisDone && (
                <Feedback tone="ok">
                  Chantier bouclé : une formule, une soustraction d'aires, et un piège de périmètre déjoué — Mamie
                  peut commander.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Tout ce que tu vois ici est ce que la mission finale va te
          demander de mobiliser — rien de plus.
        </KnowledgeSnapshot>
      }
    />
  );
}
