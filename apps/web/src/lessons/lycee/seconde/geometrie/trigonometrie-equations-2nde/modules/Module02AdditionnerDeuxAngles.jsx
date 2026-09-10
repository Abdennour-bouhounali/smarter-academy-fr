import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CircleLab from '../components/CircleLab';
import { pointOf, fr } from '../components/trigoUtils';

/**
 * Module 2 — les formules d'addition.
 *
 * L'élève commence par RÉFUTER « cos(a+b) = cos a + cos b » avec le cercle : il
 * place a, puis b, puis a+b, et lit trois nombres qui ne s'additionnent pas.
 * La formule n'arrive qu'après cette réfutation — sinon elle n'est qu'une ligne
 * de plus à mémoriser.
 */
const A = Math.PI / 3;
const B = Math.PI / 6;

export default function Module02AdditionnerDeuxAngles() {
  const [t, setT] = useState(A);
  const [seenA, setSeenA] = useState(false);
  const [seenB, setSeenB] = useState(false);
  const [seenSum, setSeenSum] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = seenA && seenB && seenSum;
  const p = pointOf(t);

  const move = (v, react) => {
    setT(v);
    let hit = false;
    if (Math.abs(v - A) < 0.07 && !seenA) { setSeenA(true); hit = seenB && seenSum; }
    if (Math.abs(v - B) < 0.07 && !seenB) { setSeenB(true); hit = seenA && seenSum; }
    if (Math.abs(v - (A + B)) < 0.07 && !seenSum) { setSeenSum(true); hit = seenA && seenB; }
    if (hit) react?.(true);
  };

  const marks = [
    { t: B, label: 'π/6', color: '#0ea5e9' },
    { t: A, label: 'π/3', color: '#8b5cf6' },
    { t: A + B, label: 'π/2', color: '#f59e0b' },
  ];

  const steps = [
    {
      num: 1,
      title: 'Trois positions, trois cosinus',
      subtitle: 'Place le point sur π/6, puis sur π/3, puis sur leur somme π/2. Note le cosinus à chaque fois.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <CircleLab t={t} onChange={(v) => move(v, kit.react)} marks={marks} label="Trois angles" />
          {done1 ? (
            <>
              <Feedback tone="ok">
                cos(π/6) ≈ 0,87 et cos(π/3) = 0,50. Leur somme ferait <strong>1,37</strong> — impossible,
                un cosinus ne dépasse jamais 1. Et cos(π/2) vaut en réalité <strong>0</strong>.
                Donc <MathText>{'$\\cos(a+b) \\ne \\cos a + \\cos b$'}</MathText> : le cosinus ne se
                distribue pas sur une somme.
              </Feedback>
              <KnowledgeBrick
                id="regle-cos-non-lineaire"
                variant="new"
                lead={<>Tu viens de réfuter, par un seul contre-exemple, l’erreur la plus tentante du chapitre.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              {!seenB ? 'Vise π/6 (pastille bleue). ' : ''}{!seenA ? 'Puis π/3 (violette). ' : ''}{!seenSum ? 'Puis π/2 (orange).' : ''}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La vraie formule',
      done: q2,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="formules-addition"
            variant="new"
            lead={<>Puisque l’addition naïve est fausse, voici ce qui la remplace — et le signe MOINS du cosinus n’est pas une coquille.</>}
          />
          <TapQuestion
            prompt={<span>Vérifie sur l’exemple : que donne <MathText>{'$\\cos\\dfrac{\\pi}{3}\\cos\\dfrac{\\pi}{6} - \\sin\\dfrac{\\pi}{3}\\sin\\dfrac{\\pi}{6}$'}</MathText> ?</span>}
            options={[
              '0, qui est bien cos(π/2)',
              '1,37, la somme des deux cosinus',
              '0,87, le cosinus de π/6',
              '0,5, le cosinus de π/3',
            ]}
            correct={0} cols={2}
            requires={['formules-addition', 'valeurs-remarquables']}
            explain="0,5 × 0,87 − 0,87 × 0,5 = 0,435 − 0,435 = 0. Et π/3 + π/6 = π/2, dont le cosinus vaut effectivement 0 : la formule tombe juste, là où l’addition naïve donnait un nombre impossible."
            explainWrong="La formule n’additionne pas les cosinus : elle multiplie les cosinus entre eux, multiplie les sinus entre eux, et RETRANCHE le second produit du premier."
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Les deux formules, sans les confondre',
      done: q3,
      content: () => (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-600">Pour chaque expression, la bonne écriture :</p>}
            rows={[
              { id: 'r1', label: 'cos(a + b)', options: ['cos a cos b − sin a sin b', 'cos a cos b + sin a sin b', 'cos a + cos b'], correct: 0, correction: 'Produits des mêmes, et un MOINS.' },
              { id: 'r2', label: 'sin(a + b)', options: ['sin a cos b + cos a sin b', 'sin a sin b + cos a cos b', 'sin a + sin b'], correct: 0, correction: 'Produits CROISÉS, et un PLUS.' },
              { id: 'r3', label: 'cos(a + b) quand a = b = π/4', options: ['0', '1', '√2'], correct: 0, correction: 'π/4 + π/4 = π/2, dont le cosinus vaut 0.' },
              { id: 'r4', label: 'sin(a + b) quand a = b = π/6', options: ['√3/2', '1', '1/2'], correct: 0, correction: 'π/6 + π/6 = π/3, dont le sinus vaut √3/2.' },
            ]}
            requires={['formules-addition', 'valeurs-remarquables']}
            feedback={({ allRight, nCorrect, total }) => (
              <Feedback tone={allRight ? 'ok' : 'ko'}>
                {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Deux repères suffisent : le
                <strong> cosinus</strong> garde les fonctions ensemble (cos×cos, sin×sin) et retranche ;
                le <strong>sinus</strong> croise les fonctions (sin×cos, cos×sin) et additionne.
              </Feedback>
            )}
            solved={q3} onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="mem-signe-moins"
              variant="new"
              lead={<>Le seul détail qui distingue vraiment les deux formules.</>}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Additionner deux angles"
      moduleSubtitle="cos(a + b) n’est pas cos a + cos b — et le cercle le prouve"
      estimatedTime="16 min"
      brief={{
        tag: '➕ Mission 02',
        title: 'Si cos(a+b) valait cos a + cos b, il dépasserait 1. Impossible.',
        tone: 'indigo',
        body: <p>Avant d’apprendre la bonne formule, prouve toi-même que la mauvaise est fausse : il suffit d’un contre-exemple lu sur le cercle.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          Tu calcules le cosinus et le sinus d’une somme. Reste le sens inverse : partir d’une valeur
          et retrouver l’angle — c’est une équation.
        </KnowledgeSnapshot>
      )}
    />
  );
}
