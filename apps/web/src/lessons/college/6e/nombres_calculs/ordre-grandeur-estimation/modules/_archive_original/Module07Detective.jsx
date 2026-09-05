import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { formatFr, classifyPlausibility } from '../components/estimationUtils';

// Classes complètes et littérales : Tailwind ne détecte pas les noms de
// classes reconstruits par interpolation (`bg-${tone}-50`) au moment du
// build, il faut donc les écrire en toutes lettres, comme ailleurs dans
// l'application (voir LessonIndex.jsx).
const CATS = [
  { key: 'plausible', label: 'Plausible', Icon: CheckCircle2, rightCls: 'bg-emerald-50 border-emerald-400 text-emerald-800' },
  { key: 'suspect', label: 'Suspect', Icon: AlertTriangle, rightCls: 'bg-amber-50 border-amber-400 text-amber-800' },
  { key: 'impossible', label: 'Impossible', Icon: XCircle, rightCls: 'bg-rose-50 border-rose-400 text-rose-800' },
];

const CASES = [
  { calc: '198 + 403', proposed: 1601, estimate: 600 },
  { calc: '347 + 251', proposed: 590, estimate: 600 },
  { calc: '802 − 399', proposed: 1000, estimate: 400 },
  { calc: '49 × 21', proposed: 800, estimate: 1000 },
  { calc: '198 + 403', proposed: 601, estimate: 600 },
  { calc: '58 × 11', proposed: 65, estimate: 600 },
];

function DetectiveCard({ item, solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const correct = classifyPlausibility(item.estimate, item.proposed);
  const isRight = pick === correct;

  return (
    <div className={`border-2 rounded-2xl p-4 space-y-3 ${solved ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
        <span className="font-mono font-bold text-lg text-slate-800">{item.calc} = {formatFr(item.proposed)}</span>
      </div>
      <p className="text-xs font-mono text-slate-400">Ton estimation : ≈ {formatFr(item.estimate)}</p>

      <div className="flex gap-2 flex-wrap">
        {CATS.map(({ key, label, Icon, rightCls }) => {
          const isSel = pick === key;
          const isRightBtn = revealed && key === correct;
          const isWrongBtn = revealed && isSel && key !== correct;
          const toneCls =
            isRightBtn
              ? rightCls
              : isWrongBtn
              ? 'bg-rose-50 border-rose-400 text-rose-700'
              : isSel
              ? 'bg-blue-50 border-blue-500 text-blue-900'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400';
          return (
            <button
              key={key}
              type="button"
              disabled={revealed || solved}
              onClick={() => { setPick(key); setRevealed(false); }}
              aria-pressed={isSel}
              className={`px-3 py-2.5 rounded-xl border-2 font-mono text-xs font-bold min-h-[44px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${toneCls}`}
            >
              <Icon className="inline w-3.5 h-3.5 mr-1" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => { setRevealed(true); if (isRight) onSolved?.(); }}
            disabled={pick === null}
          >
            Valider
          </ValidateButton>
        </div>
      )}

      {revealed && (
        <Feedback tone={isRight ? 'ok' : 'ko'}>
          {correct === 'plausible' && `Le résultat est proche de l'estimation (${formatFr(item.estimate)}) : c'est plausible.`}
          {correct === 'suspect' && `Le résultat s'écarte assez nettement de l'estimation (${formatFr(item.estimate)}) : à vérifier.`}
          {correct === 'impossible' && `Le résultat est bien trop loin de l'estimation (${formatFr(item.estimate)}) : c'est impossible, il y a une erreur.`}
          {!isRight && (
            <>
              {' '}
              <button type="button" onClick={() => { setRevealed(false); setPick(null); }} className="underline font-semibold">Réessayer</button>
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

const PROOF_Q = {
  q: '198 + 403 = 601 a été jugé « plausible ». Cela prouve-t-il que 601 est exact ?',
  options: [
    'Oui, plausible veut dire exact',
    "Non : plausible veut dire cohérent avec l'estimation, pas forcément exact — il faudrait recalculer pour en être sûr",
  ],
  correct: 1,
  explain: "L'estimation sert à CONTRÔLER, pas à PROUVER. Un résultat plausible peut quand même être faux de quelques unités — ici, 601 est en fait le résultat exact, mais l'estimation seule ne pouvait pas le garantir.",
};

export default function Module07Detective() {
  const navLinks = getNavLinks(7);
  const [done, setDone] = useState([]);
  const [proofPick, setProofPick] = useState(null);
  const [proofRevealed, setProofRevealed] = useState(false);

  const s1 = done.length === CASES.length;
  const s2 = proofRevealed && proofPick === PROOF_Q.correct;
  const allDone = s1 && s2;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Détective des erreurs"
      moduleSubtitle="Calcul + réponse donnée : plausible, suspect ou impossible ?"
      moduleNumber={7}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="🕵️ Enquête" title="Six résultats à juger, sans tout recalculer.">
          <p>Utilise ton estimation pour classer chaque réponse. Les cas deviennent progressivement plus subtils.</p>
        </MissionBrief>

        <StepCard num={1} title="Mène l'enquête" done={s1}>
          <div className="space-y-4">
            {CASES.map((item, i) =>
              i === 0 || done.includes(i - 1) ? (
                <DetectiveCard key={`${item.calc}-${item.proposed}`} item={item} solved={done.includes(i)} onSolved={() => setDone((d) => (d.includes(i) ? d : [...d, i]))} />
              ) : null
            )}
          </div>
        </StepCard>

        <StepCard num={2} title="Plausible ne veut pas dire prouvé" done={s2} locked={!s1}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{PROOF_Q.q}</p>
            <ChoiceGrid options={PROOF_Q.options} selected={proofPick} onSelect={setProofPick} revealed={proofRevealed} correctIndex={PROOF_Q.correct} cols={1} />
            {!proofRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setProofRevealed(true)} disabled={proofPick === null}>Valider</ValidateButton>
              </div>
            )}
            {proofRevealed && (
              <Feedback tone={proofPick === PROOF_Q.correct ? 'ok' : 'ko'}>
                {PROOF_Q.explain}
                {proofPick !== PROOF_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setProofRevealed(false); setProofPick(null); }} className="underline font-semibold">Réessayer</button>
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
