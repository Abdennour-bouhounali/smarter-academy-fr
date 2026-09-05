import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import CalcChain from '../../../../../common/components/CalcChain';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseFr } from '@smarter-academy/core';

/**
 * Ce module réutilise le réflexe déjà construit dans la leçon
 * « Ordre de grandeur et estimation » (estimer avant, contrôler après).
 * Il ne le réenseigne pas : il l'intègre simplement au processus de
 * résolution de problèmes.
 */

/* ─── Étape 1 : avant / après, sur le problème des crayons ───────── */
function AvantApres({ solved, onSolved }) {
  const [estVal, setEstVal] = useState('');
  const [estOk, setEstOk] = useState(false);
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const checkEst = () => {
    const n = parseFr(estVal);
    if (!Number.isNaN(n) && n >= 140 && n <= 190) setEstOk(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
        Rappel du problème des crayons : 8 boîtes de 24 crayons, 35 distribués. Résultat exact trouvé :{' '}
        <strong className="font-mono">157 crayons</strong>.
      </p>

      {!estOk ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            AVANT de calculer, à peu près combien devrait-on trouver ? (8 ≈ 8, 24 ≈ 25, 35 ≈ 35…)
          </p>
          <div className="flex items-center gap-2 justify-center">
            <NumberField value={estVal} onChange={setEstVal} onEnter={checkEst} ariaLabel="Estimation" placeholder="≈ ?" width="w-28" />
            <ValidateButton onClick={checkEst} disabled={!estVal}>Valider</ValidateButton>
          </div>
          <p className="text-xs text-center text-slate-400">Indice : 8 × 25 = 200, puis 200 − 35 ≈ 165.</p>
        </div>
      ) : (
        <>
          <Feedback tone="ok">Bonne estimation : ≈ 165 crayons.</Feedback>
          <p className="text-sm font-semibold text-slate-700">APRÈS le calcul : 157 est-il cohérent avec cette estimation ?</p>
          <ChoiceGrid
            options={['Oui, 157 est proche de 165 : le résultat est cohérent', "Non, l'écart est trop grand, il faut recompter"]}
            selected={pick} onSelect={setPick} revealed={revealed} correctIndex={0} cols={1}
          />
          {!revealed && (
            <div className="text-center">
              <ValidateButton onClick={() => { setRevealed(true); if (pick === 0) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
            </div>
          )}
          {revealed && <Feedback tone={pick === 0 ? 'ok' : 'ko'}>157 est tout proche de 165 : le résultat exact est cohérent avec l'estimation. C'est exactement ce contrôle qui permet de repérer une erreur grossière.</Feedback>}
        </>
      )}
    </div>
  );
}

/* ─── Étape 2 : à toi de jouer ────────────────────────────────────── */
function ToiDeJouer({ solved, onSolved }) {
  const [estVal, setEstVal] = useState('');
  const [estOk, setEstOk] = useState(false);
  const [exactVal, setExactVal] = useState('');
  const [exactOk, setExactOk] = useState(false);
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const checkEst = () => {
    const n = parseFr(estVal);
    if (!Number.isNaN(n) && n >= 70 && n <= 110) setEstOk(true);
  };
  const checkExact = () => { if (parseFr(exactVal) === 85) setExactOk(true); };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
        29 packs de 6 canettes sont livrés. On en distribue 89. Combien de canettes reste-t-il ?
      </p>

      {!estOk && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Estime d'abord, avant tout calcul exact.</p>
          <div className="flex items-center gap-2 justify-center">
            <NumberField value={estVal} onChange={setEstVal} onEnter={checkEst} ariaLabel="Estimation" placeholder="≈ ?" width="w-28" />
            <ValidateButton onClick={checkEst} disabled={!estVal}>Valider</ValidateButton>
          </div>
        </div>
      )}

      {estOk && !exactOk && (
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <Feedback tone="ok">Bonne estimation.</Feedback>
          <p className="text-sm font-semibold text-slate-700">Calcule maintenant le résultat exact.</p>
          <div className="flex items-center gap-2 justify-center">
            <NumberField value={exactVal} onChange={setExactVal} onEnter={checkExact} ariaLabel="Résultat exact" placeholder="?" width="w-28" />
            <ValidateButton onClick={checkExact} disabled={!exactVal}>OK</ValidateButton>
          </div>
        </div>
      )}

      {exactOk && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <CalcChain steps={[{ label: 'Total livré', expr: '29 × 6', value: '174 canettes' }, { label: 'Canettes restantes', expr: '174 − 89', value: '85 canettes' }]} />
          <p className="text-sm font-semibold text-slate-700">85 est-il cohérent avec ton estimation ?</p>
          <ChoiceGrid options={['Oui, cohérent', 'Non, incohérent']} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={0} cols={2} />
          {!revealed && (
            <div className="text-center">
              <ValidateButton onClick={() => { setRevealed(true); if (pick === 0) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
            </div>
          )}
          {revealed && <Feedback tone={pick === 0 ? 'ok' : 'ko'}>85 est cohérent avec une estimation autour de 90 : le résultat est validé.</Feedback>}
        </div>
      )}
    </div>
  );
}

/* ─── Étape 3 : pourquoi ce réflexe compte ───────────────────────── */
const WHY_Q = {
  q: "Pourquoi estimer AVANT de calculer, puis vérifier APRÈS ?",
  options: [
    "Estimer avant donne un repère pour prévoir le résultat ; vérifier après permet de détecter une erreur grossière — les deux se complètent",
    "C'est juste une étape supplémentaire sans réelle utilité",
    "Estimer avant remplace le besoin de calculer exactement",
  ],
  correct: 0,
  explain: "Exactement. Les deux réflexes se complètent : PRÉVOIR avant, CONTRÔLER après. Cela ne remplace jamais le calcul exact, mais protège contre les erreurs grossières.",
};

export default function Module08EstimerVerifier() {
  const navLinks = getNavLinks(8);
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [whyPick, setWhyPick] = useState(null);
  const [whyRevealed, setWhyRevealed] = useState(false);

  const s3 = whyRevealed && whyPick === WHY_Q.correct;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Estimer et vérifier"
      moduleSubtitle="Avant de calculer : à peu près combien ? Après : est-ce cohérent ?"
      moduleNumber={8}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="🔎 Contrôle" title="Le réflexe que tu as déjà : estimer, puis contrôler.">
          <p>Tu l'as déjà appris dans la leçon « Ordre de grandeur et estimation ». Ici, on l'intègre simplement à la démarche complète de résolution.</p>
        </MissionBrief>

        <StepCard num={1} title="Avant / après, sur un exemple connu" done={s1}>
          <AvantApres solved={s1} onSolved={() => setS1(true)} />
        </StepCard>

        <StepCard num={2} title="À toi de jouer" done={s2} locked={!s1}>
          <ToiDeJouer solved={s2} onSolved={() => setS2(true)} />
        </StepCard>

        <StepCard num={3} title="Pourquoi ce réflexe compte" done={s3} locked={!s2}>
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
