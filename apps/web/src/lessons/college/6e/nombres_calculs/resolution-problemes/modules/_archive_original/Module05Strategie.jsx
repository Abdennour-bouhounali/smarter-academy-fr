import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Étape 1 : deux stratégies, un même problème ────────────────── */
const BOTH_Q = {
  q: 'Une classe de 27 élèves doit être répartie en groupes de 4 pour un jeu. Léa dessine 27 ronds et les entoure par paquets de 4. Nathan calcule directement 27 ÷ 4. Les deux méthodes peuvent-elles fonctionner ?',
  options: ['Oui, les deux mènent à la bonne réponse', 'Non, une seule est correcte'],
  correct: 0,
  explain: 'Les deux fonctionnent : 6 groupes complets, 3 élèves restants. Le dessin de Léa rend la situation concrète ; le calcul de Nathan est plus rapide. Aucune des deux n\'est « la seule bonne méthode ».',
};

const COMPARE_Q = {
  q: 'Pour un très grand nombre (par exemple 4 827 élèves), quelle méthode reste la plus PRATIQUE ?',
  options: ['Le dessin, un rond par élève', 'Le calcul direct'],
  correct: 1,
  explain: 'Dessiner 4 827 ronds serait très long et source d\'erreurs. Le calcul devient plus efficace quand les nombres grandissent — mais le dessin reste précieux pour COMPRENDRE une situation nouvelle.',
};

/* ─── Étape 2 : choix ouvert de stratégie ─────────────────────────── */
const STRATEGIES = [
  { key: 'calcul', label: '🧮 Calcul direct', good: true },
  { key: 'schema', label: '🧱 Schéma / manipulation', good: true },
  { key: 'tableau', label: '📊 Tableau', good: false },
  { key: 'droite', label: '📏 Droite graduée', good: false },
];

function ChoixOuvert({ solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [checked, setChecked] = useState(false);
  const isRight = pick && STRATEGIES.find((s) => s.key === pick)?.good;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Nouvelle situation : « 18 crayons doivent être rangés dans des trousses de 3. Combien de trousses
        faut-il ? » Quelle stratégie te semble efficace ICI ? (plusieurs réponses sont valables)
      </p>
      <div className="flex gap-2 flex-wrap">
        {STRATEGIES.map((s) => {
          const isSel = pick === s.key;
          const showRight = checked && s.good;
          return (
            <button
              key={s.key}
              type="button"
              disabled={solved}
              onClick={() => { setPick(s.key); setChecked(false); }}
              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium min-h-[48px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                showRight ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : isSel ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              {showRight && <CheckCircle2 className="inline w-4 h-4 mr-1" aria-hidden="true" />}
              {s.label}
            </button>
          );
        })}
      </div>
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (isRight) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
        </div>
      )}
      {checked && !isRight && (
        <Feedback tone="hint">Pense à ce qui rend cette situation concrète : des groupes égaux de 3.</Feedback>
      )}
      {solved && (
        <Feedback tone="ok">
          Le calcul direct (18 ÷ 3 = 6) et le schéma / manipulation (former des groupes de 3) fonctionnent tous
          les deux très bien ici. Le tableau et la droite graduée sont moins adaptés à ce type de partage.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 3 : pourquoi plusieurs stratégies ────────────────────── */
const WHY_Q = {
  q: "Pourquoi est-il utile de connaître plusieurs stratégies plutôt qu'une seule méthode imposée ?",
  options: [
    'Parce que certaines situations se comprennent mieux avec un dessin, d\'autres se résolvent plus vite avec un calcul — la meilleure stratégie dépend de la situation',
    "Parce qu'il faut toujours utiliser la méthode la plus compliquée possible",
    "Ça n'a pas vraiment d'importance, toutes les méthodes se valent toujours",
  ],
  correct: 0,
  explain: "Exactement. Un bon résolveur de problèmes choisit sa stratégie selon la situation, pas par habitude. Cette flexibilité est plus importante qu'une procédure unique apprise par cœur.",
};

export default function Module05Strategie() {
  const navLinks = getNavLinks(5);
  const [bothPick, setBothPick] = useState(null);
  const [bothRevealed, setBothRevealed] = useState(false);
  const [comparePick, setComparePick] = useState(null);
  const [compareRevealed, setCompareRevealed] = useState(false);
  const [s2, setS2] = useState(false);
  const [whyPick, setWhyPick] = useState(null);
  const [whyRevealed, setWhyRevealed] = useState(false);

  const s1 = bothRevealed && bothPick === BOTH_Q.correct && compareRevealed && comparePick === COMPARE_Q.correct;
  const s3 = whyRevealed && whyPick === WHY_Q.correct;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Choisir une stratégie"
      moduleSubtitle="Plusieurs chemins peuvent être valables : comparer, pas imposer."
      moduleNumber={5}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="🧠 Stratégie" title="La question n'est pas « quelle opération ? » mais « comment chercher ? ».">
          <p>Il existe souvent plusieurs bonnes façons d'aborder un même problème.</p>
        </MissionBrief>

        <StepCard num={1} title="Deux élèves, deux méthodes" done={s1}>
          <div className="space-y-5">
            <p className="text-sm font-semibold text-slate-700">{BOTH_Q.q}</p>
            <ChoiceGrid options={BOTH_Q.options} selected={bothPick} onSelect={setBothPick} revealed={bothRevealed} correctIndex={BOTH_Q.correct} cols={1} />
            {!bothRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setBothRevealed(true)} disabled={bothPick === null}>Valider</ValidateButton>
              </div>
            )}
            {bothRevealed && (
              <Feedback tone={bothPick === BOTH_Q.correct ? 'ok' : 'ko'}>
                {BOTH_Q.explain}
                {bothPick !== BOTH_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setBothRevealed(false); setBothPick(null); }} className="underline font-semibold">Réessayer</button>
                  </>
                )}
              </Feedback>
            )}

            {bothRevealed && bothPick === BOTH_Q.correct && (
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <p className="text-sm font-semibold text-slate-700">{COMPARE_Q.q}</p>
                <ChoiceGrid options={COMPARE_Q.options} selected={comparePick} onSelect={setComparePick} revealed={compareRevealed} correctIndex={COMPARE_Q.correct} cols={1} />
                {!compareRevealed && (
                  <div className="text-center">
                    <ValidateButton onClick={() => setCompareRevealed(true)} disabled={comparePick === null}>Valider</ValidateButton>
                  </div>
                )}
                {compareRevealed && (
                  <Feedback tone={comparePick === COMPARE_Q.correct ? 'ok' : 'ko'}>
                    {COMPARE_Q.explain}
                    {comparePick !== COMPARE_Q.correct && (
                      <>
                        {' '}
                        <button type="button" onClick={() => { setCompareRevealed(false); setComparePick(null); }} className="underline font-semibold">Réessayer</button>
                      </>
                    )}
                  </Feedback>
                )}
              </div>
            )}
          </div>
        </StepCard>

        <StepCard num={2} title="À toi de choisir" done={s2} locked={!s1}>
          <ChoixOuvert solved={s2} onSolved={() => setS2(true)} />
        </StepCard>

        <StepCard num={3} title="Pourquoi plusieurs stratégies ?" done={s3} locked={!s2}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{WHY_Q.q}</p>
            <ChoiceGrid options={WHY_Q.options} selected={whyPick} onSelect={setWhyPick} revealed={whyRevealed} correctIndex={WHY_Q.correct} cols={1} />
            {!whyRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setWhyRevealed(true)} disabled={whyPick === null}>Valider</ValidateButton>
              </div>
            )}
            {whyRevealed && (
              <Feedback tone={whyPick === WHY_Q.correct ? 'ok' : 'ko'}>
                {WHY_Q.explain}
                {whyPick !== WHY_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setWhyRevealed(false); setWhyPick(null); }} className="underline font-semibold">Réessayer</button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
