import React, { useState } from 'react';
import { BookMarked, Calculator } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RatioLab from '../components/RatioLab';
import { ratiosFor, sidesFor, roundTenth } from '../components/trigoUtils';

/**
 * Module 4 — MANIPULATION : donner leurs noms aux trois rapports.
 *
 * Activity              associer chaque rapport à son nom, puis vérifier que
 *                       la calculatrice donne le même nombre que la mesure.
 * Mathematical objective sinus, cosinus et tangente ne sont pas des touches
 *                       magiques : ce sont les trois rapports que l'élève
 *                       vient de mesurer.
 * Student action        apparier, puis comparer mesure et calculatrice.
 * Visual consequence    les deux nombres coïncident.
 * Misconception ciblée   apprendre un acronyme sans savoir ce qu'il désigne.
 *                       Ici le nom arrive APRÈS trois modules de mesure.
 * Formalization         c'est ce module qui pose les définitions.
 */
export default function Module04TroisRapportsTroisNoms() {
  const [batch, setBatch] = useState(false);
  const [q2, setQ2] = useState(false);

  const ALPHA = 40;
  const HYP = 130;
  const s = sidesFor(ALPHA, HYP);
  const mesure = Math.round(s.opp) / Math.round(s.hyp);

  const steps = [
    {
      num: 1,
      title: 'Trois rapports, trois noms',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <div className="space-y-2">
              <RatioLab alpha={ALPHA} hyp={HYP} disabled
                ariaLabel="Triangle rectangle avec ses trois rapports affichés" />
              <p className="text-sm text-slate-700">
                Voici les trois quotients que tu manipules depuis le début. Chacun porte un nom.
              </p>
            </div>
          }
          rows={[
            {
              id: 'sin',
              label: 'opposé ÷ hypoténuse s’appelle…',
              options: ['le sinus', 'le cosinus', 'la tangente'],
              correct: 0,
              correction: 'sin α = opposé / hypoténuse. Comme l’hypoténuse est le plus grand côté, ce quotient est toujours inférieur à 1.',
            },
            {
              id: 'cos',
              label: 'adjacent ÷ hypoténuse s’appelle…',
              options: ['le cosinus', 'le sinus', 'la tangente'],
              correct: 0,
              correction: 'cos α = adjacent / hypoténuse. Lui aussi est toujours inférieur à 1, pour la même raison.',
            },
            {
              id: 'tan',
              label: 'opposé ÷ adjacent s’appelle…',
              options: ['la tangente', 'le sinus', 'le cosinus'],
              correct: 0,
              correction: 'tan α = opposé / adjacent. C’est le seul des trois qui ne fait pas intervenir l’hypoténuse, et il peut dépasser 1.',
            },
            {
              id: 'borne',
              label: 'Un élève trouve sin α = 1,4. Que peut-on dire ?',
              options: [
                'C’est impossible : un sinus ne dépasse jamais 1',
                'C’est possible pour un grand angle',
                'C’est possible dans un grand triangle',
              ],
              correct: 0,
              correction: 'Le sinus est opposé ÷ hypoténuse, et l’hypoténuse est le plus grand côté : le quotient est donc toujours inférieur à 1. Un résultat supérieur signale une erreur de rapport.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Les trois noms sont posés — et tu sais déjà que sinus et cosinus ne peuvent pas dépasser 1.'
                : `${nCorrect} sur ${total}. Retiens la place de l’hypoténuse : au dénominateur pour le sinus et le cosinus, absente de la tangente.`}
            </Feedback>
          )}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
    {
      num: 2,
      title: 'La calculatrice donne le même nombre',
      subtitle: 'Ce n’est pas une touche magique : c’est ton quotient.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Dans le triangle ci-dessus, l’angle vaut <strong>{ALPHA}°</strong>, le côté opposé
              mesure <strong>{Math.round(s.opp)}</strong> et l’hypoténuse{' '}
              <strong>{Math.round(s.hyp)}</strong>.
            </p>
          </div>
          <NumericQuestion
            prompt={`Calcule le quotient ${Math.round(s.opp)} ÷ ${Math.round(s.hyp)}, arrondi au centième. Compare-le ensuite à sin ${ALPHA}° sur ta calculatrice.`}
            expected={(n) => Math.abs(n - mesure) < 0.011}
            parse={(x) => Number(String(x).replace(',', '.'))}
            display={String(Math.round(mesure * 100) / 100).replace('.', ',')}
            width="w-24"
            explain={`${Math.round(s.opp)} ÷ ${Math.round(s.hyp)} ≈ ${String(Math.round(mesure * 100) / 100).replace('.', ',')}. Et sin ${ALPHA}° ≈ ${String(Math.round(ratiosFor(ALPHA).sin * 100) / 100).replace('.', ',')} : c’est le même nombre. La touche « sin » de ta calculatrice ne fait rien d’autre que donner ce quotient, mesuré une fois pour toutes.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Trois rapports, trois noms"
      moduleSubtitle="Sinus, cosinus, tangente — enfin nommés"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Donner un nom à ce qu’on a mesuré',
        tone: 'violet',
        body: (
          <p>
            Tu as établi que ces trois quotients ne dépendent que de l’angle. Ils méritent donc un
            nom — et une touche sur la calculatrice.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-4 space-y-2">
          <div className="flex gap-2 items-center">
            <BookMarked className="w-5 h-5 text-violet-700" aria-hidden="true" />
            <p className="font-bold text-violet-900">Les trois définitions</p>
          </div>
          <ul className="text-sm text-violet-900 space-y-1.5 list-disc pl-5">
            <li><MathText>{'$\\sin \\alpha = \\dfrac{\\text{opposé}}{\\text{hypoténuse}}$'}</MathText></li>
            <li><MathText>{'$\\cos \\alpha = \\dfrac{\\text{adjacent}}{\\text{hypoténuse}}$'}</MathText></li>
            <li><MathText>{'$\\tan \\alpha = \\dfrac{\\text{opposé}}{\\text{adjacent}}$'}</MathText></li>
          </ul>
          <p className="text-xs text-violet-800">
            Sinus et cosinus ont l’hypoténuse au dénominateur : ils valent donc toujours moins de 1.
          </p>
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <div className="flex gap-2 items-start">
            <Calculator className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <strong>Ce que fait la calculatrice.</strong> Les touches sin, cos et tan donnent
              directement ces quotients pour l’angle demandé. Vérifie qu’elle est bien en mode
              degrés (DEG) : en mode radians, tous les résultats seraient faux.
            </span>
          </div>
        </Feedback>
      }
    />
  );
}
