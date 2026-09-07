import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { fmt, fmtParen, diviser, multiplier, parseRelatif } from '../components/operations';

/**
 * Module 4 — MANIPULATION : la division suit la même règle.
 *
 * Le module ne DÉCRÈTE pas que la division obéit à la règle des signes : il le
 * fait DÉDUIRE. L'élève cherche le facteur manquant d'une multiplication
 * (« quel nombre × (−4) donne 20 ? »), constate que la seule réponse possible
 * est celle qu'annonce la règle des signes, puis généralise.
 *
 * Ce que ce module ne fait PAS : les priorités (M5), les fractions (objet
 * officiel « Nombres rationnels »).
 */
const A = 20;
const B = -4;

export default function Module04Diviser() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Cherche le facteur manquant',
      subtitle: 'Avant de parler de division : quel nombre complète cette multiplication ?',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-center">
            <div className="text-xl sm:text-2xl font-black tabular-nums text-slate-800">
              ? × {fmtParen(B)} = {fmt(A)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Utilise la règle des signes que tu viens d’établir.
            </p>
          </div>
          <NumericQuestion
            prompt="Quel nombre remplace le point d’interrogation ?"
            expected={diviser(A, B)}
            parse={parseRelatif}
            display={fmt(diviser(A, B))}
            requires={['regle-des-signes']}
            explain={`Il faut 5 × 4 = 20 pour la valeur, et un signe qui, multiplié par un négatif, donne un positif : donc un négatif. La réponse est ${fmt(diviser(A, B))}, et l’on vérifie : ${fmt(diviser(A, B))} × ${fmtParen(B)} = ${fmt(multiplier(diviser(A, B), B))}.`}
            explainFor={(n) => (n === 5
              ? <>Vérifie : 5 × {fmtParen(B)} donnerait {fmt(multiplier(5, B))}, pas {fmt(A)}. Le signe ne convient pas.</>
              : null)}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <Feedback tone="ok">
              Chercher le facteur manquant d’une multiplication, c’est exactement{' '}
              <strong>diviser</strong> : {fmt(A)} ÷ {fmtParen(B)} = {fmt(diviser(A, B))}. La division
              ne peut donc pas suivre une autre règle que la multiplication — elle en est la question
              inverse.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La règle, pour la division',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* Le facteur manquant vient d'être trouvé et vérifié : la règle du
              quotient peut être posée, avant les questions qui l'exigent. */}
          <KnowledgeBrick
            id="quotient-relatifs"
            variant="new"
            lead={<>Tu viens de diviser sans le savoir, en cherchant un facteur manquant. La règle est donc déjà la tienne.</>}
          />
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Pour chaque quotient, choisis le <strong>signe</strong> du résultat.</p>}
            rows={[
              { id: 'd1', label: `${fmt(-36)} ÷ ${fmtParen(-9)}`, options: ['Positif', 'Négatif'], correct: 0, correction: 'Deux négatifs → quotient positif : 4.' },
              { id: 'd2', label: `${fmt(-36)} ÷ ${fmtParen(9)}`, options: ['Positif', 'Négatif'], correct: 1, correction: `Signes contraires → quotient négatif : ${fmt(-4)}.` },
              { id: 'd3', label: `${fmt(45)} ÷ ${fmtParen(-5)}`, options: ['Positif', 'Négatif'], correct: 1, correction: `Signes contraires → quotient négatif : ${fmt(-9)}.` },
              { id: 'd4', label: `${fmt(-14)} ÷ ${fmtParen(-7)}`, options: ['Positif', 'Négatif'], correct: 0, correction: 'Deux négatifs → quotient positif : 2.' },
            ]}
            requires={['quotient-relatifs', 'regle-des-signes']}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Calcule un quotient',
      done: q3,
      content: (
        <NumericQuestion
          prompt={`Combien fait ${fmt(-56)} ÷ ${fmtParen(-8)} ?`}
          expected={diviser(-56, -8)}
          parse={parseRelatif}
          display={fmt(diviser(-56, -8))}
          requires={['quotient-relatifs']}
          explain={`56 ÷ 8 = 7 pour la valeur, et deux négatifs donnent un positif : ${fmt(diviser(-56, -8))}.`}
          explainFor={(n) => (n === -7
            ? <>La valeur est juste, mais deux nombres <strong>de même signe</strong> donnent un quotient positif.</>
            : null)}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Le cas de zéro',
      done: q4,
      content: (
        <TapQuestion
          prompt={`Que peut-on dire de ${fmt(-12)} ÷ 0 ?`}
          options={[
            'Ce calcul n’a pas de résultat',
            'Il vaut 0',
            `Il vaut ${fmt(-12)}`,
            'Il vaut un très grand nombre négatif',
          ]}
          correct={0}
          cols={1}
          requires={['quotient-relatifs']}
          explain={`Diviser par 0, ce serait chercher un nombre qui, multiplié par 0, donnerait ${fmt(-12)}. Or tout nombre multiplié par 0 donne 0 : aucun ne convient. La division par zéro n’est pas définie.`}
          explainWrong="Attention à ne pas confondre avec 0 ÷ (−12), qui vaut bien 0 : c’est le DIVISEUR qui ne peut jamais être nul."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Diviser"
      moduleSubtitle="La même règle, pour la même raison"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'La question inverse',
        tone: 'slate',
        body: (
          <p>
            Faut-il apprendre une seconde règle pour la division ? Commence par chercher un{' '}
            <strong>facteur manquant</strong> — tu auras la réponse avant qu’on te la donne.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
