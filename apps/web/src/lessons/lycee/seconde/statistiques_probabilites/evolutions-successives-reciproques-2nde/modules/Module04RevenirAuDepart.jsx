import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { formatPercent, reciprocalRate } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ReciprocalFinder from '../components/ReciprocalFinder';

/**
 * Module 4 — MANIPULATION : l'évolution réciproque.
 *
 * L'élève cherche lui-même, au curseur, le taux qui ramène au prix de départ.
 * Il commence presque toujours par l'opposé (−25 % après +25 %) et voit
 * l'écart rouge subsister. En continuant, il tombe sur −20 % — et la règle
 * k' = 1/k est alors la RAISON d'un fait déjà établi.
 *
 * Deux cas sont proposés (une hausse à annuler, puis une baisse à annuler)
 * pour que la règle ne se réduise pas à « le réciproque est plus petit » :
 * annuler une baisse demande une hausse PLUS GRANDE en valeur absolue.
 */
const CASES = [
  { id: 'up', label: 'Annuler une hausse de +25 %', first: 0.25, hint: '−20 %' },
  { id: 'down', label: 'Annuler une baisse de −20 %', first: -0.2, hint: '+25 %' },
];

export default function Module04RevenirAuDepart() {
  const [caseId, setCaseId] = useState('up');
  const [second, setSecond] = useState({ up: -0.25, down: 0.2 });
  const [solved, setSolved] = useState(() => new Set());
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const current = CASES.find((c) => c.id === caseId);
  const done1 = solved.size >= 2;

  const changeSecond = (v, react) => {
    setSecond((s) => ({ ...s, [caseId]: v }));
    const target = reciprocalRate(current.first);
    if (Math.abs(v - target) < 0.005 && !solved.has(caseId)) {
      const next = new Set(solved); next.add(caseId); setSolved(next);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Trouve le taux qui ramène au départ',
      subtitle: 'Fais glisser la seconde évolution jusqu’à refermer l’écart rouge. Résous les DEUX cas.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="quel taux annule exactement une hausse de 25 % ?"
            options={[
              { id: '25', label: '−25 %' },
              { id: '20', label: '−20 %' },
              { id: 'autre', label: 'Un autre nombre' },
            ]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Cas à résoudre">
            {CASES.map((c) => (
              <button key={c.id} type="button" aria-pressed={caseId === c.id}
                onClick={() => setCaseId(c.id)}
                className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  caseId === c.id ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-400'
                }`}>
                {solved.has(c.id) ? '✓ ' : ''}{c.label}
              </button>
            ))}
          </div>
          <ReciprocalFinder
            firstRate={current.first}
            secondRate={second[caseId]}
            onSecondChange={(v) => changeSecond(v, kit.react)}
            initial={100}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred === '20' ? 'Ta prédiction tenait' : pred ? 'L’opposé ne suffisait pas' : 'Voilà'} : pour annuler
              {' '}<strong>+25 %</strong> il faut <strong>−20 %</strong>, et pour annuler <strong>−20 %</strong> il faut
              {' '}<strong>+25 %</strong>. Dans les deux cas le second coefficient est l’<strong>inverse</strong> du
              premier : 1 ÷ 1,25 = 0,80 et 1 ÷ 0,80 = 1,25. Les deux taux ne sont jamais opposés, mais les deux
              coefficients sont toujours inverses l’un de l’autre.
              {' '}<span className="text-slate-500">Continue à glisser : l’écart ne se referme qu’en un seul point.</span>
            </Feedback>
          ) : null}
          {/* Les deux écarts viennent d'être refermés à la main, dans les deux
              sens : le taux trouvé n'est pas l'opposé, et les coefficients
              sont inverses. On peut le nommer avant l'étape 2. */}
          {done1 && (
            <KnowledgeBrick
              id="evolution-reciproque"
              variant="new"
              lead={<>Tu as refermé l’écart en <strong>−20 %</strong> dans un cas et en <strong>+25 %</strong> dans l’autre. Les taux ne sont pas opposés — mais 1,25 × 0,80 = 1.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">
              Cas résolus : {solved.size} sur 2. {solved.has(caseId) ? 'Passe à l’autre cas.' : 'Referme l’écart rouge.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le coefficient réciproque',
      done: q2,
      content: (
        <div className="space-y-3">
        <TapQuestion
          prompt="Une quantité est multipliée par 1,6. Quel coefficient la ramène à sa valeur initiale ?"
          requires={['evolution-reciproque', 'coefficient-proportionnalite']}
          above={(revealed) => (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
              <MathText>{'$$k \\times k\' = 1 \\quad\\Longleftrightarrow\\quad k\' = \\frac{1}{k}$$'}</MathText>
              {revealed && <p className="text-xs text-emerald-700 mt-1">1 ÷ 1,6 = 0,625, soit une baisse de 37,5 %</p>}
            </div>
          )}
          options={['0,625', '0,4', '−1,6', '1,6']}
          cols={4}
          explain="k’ = 1 ÷ 1,6 = 0,625 : une baisse de 37,5 %. Ce n’est pas 0,4 (qui viendrait de 1 − 0,6), ni un nombre négatif : un coefficient est toujours positif."
          explainWrong="Il faut que 1,6 × k’ = 1, donc k’ = 1 ÷ 1,6 = 0,625. Le taux réciproque est 0,625 − 1 = −0,375, soit −37,5 %."
          solved={q2} onAnswered={() => setQ2(true)}
        />
        {/* Le coefficient réciproque vient d'être calculé (1 ÷ 1,6 = 0,625) et
            relu en taux (−37,5 %). L'aller-retour k → t s'écrit d'un trait :
            l'étape 3 le demandera sur une baisse de 50 %. */}
        {q2 && (
          <KnowledgeBrick
            id="formule-taux-reciproque"
            variant="new"
            lead={<>Tu es passé de 1,6 à 0,625, puis de 0,625 à −37,5 %. Ces deux pas s’enchaînent en une seule écriture.</>}
          />
        )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Annuler une forte baisse',
      done: q3,
      content: (
        <div className="space-y-3">
        <NumericQuestion
          prompt="Un prix a baissé de 50 %. De quel pourcentage doit-il augmenter pour revenir à sa valeur initiale ?"
          requires={['formule-taux-reciproque', 'evolution-reciproque', 'pourcentage']}
          expected={100} suffix="%"
          explain="k = 0,50, donc k’ = 1 ÷ 0,50 = 2 : il faut DOUBLER, soit +100 %. Reprendre 50 % ne rendrait que la moitié de ce qui a été perdu."
          explainFor={(n) => (n === 50
            ? 'Une hausse de 50 % après une baisse de 50 % donne 0,5 × 1,5 = 0,75 : il manque encore 25 %. Il faut k’ = 1 ÷ 0,5 = 2, soit +100 %.'
            : n === 150
              ? '150 % serait le coefficient ×2,5. Ici k’ = 1 ÷ 0,50 = 2, ce qui correspond à une hausse de 100 %.'
              : 'k’ = 1 ÷ 0,50 = 2, soit t’ = 2 − 1 = 1 = +100 %.')}
          solved={q3} onAnswered={() => setQ3(true)}
        />
        {/* +100 % pour annuler −50 % : le cas le plus spectaculaire de la
            règle. Il devient le repère à emporter. */}
        {q3 && (
          <KnowledgeBrick
            id="mem-inverse-pas-oppose"
            variant="new"
            lead={<>Trois fois de suite, l’opposé n’a pas suffi. Voilà ce qui marche à tous les coups.</>}
          />
        )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Revenir au départ" moduleSubtitle="L’évolution réciproque : k’ = 1/k" estimatedTime="11 min"
      brief={{
        tag: 'Manipulation', title: 'Quel taux annule +25 % ?', tone: 'emerald',
        body: <p>Une évolution a eu lieu. Quelle évolution la défait exactement ? Cherche-la toi-même en refermant l’écart au prix de départ.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Le même outil sert dans l’autre sens.</strong> Diviser par un coefficient, c’est multiplier par son
          inverse — donc on peut aussi retrouver un prix de DÉPART qu’on ne connaît pas. C’est le module suivant.
        </KnowledgeSnapshot>
      )}
    />
  );
}
