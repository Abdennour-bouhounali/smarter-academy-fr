import React, { useState } from 'react';
import { ShoppingCart, Bus } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EstimateInput from '../components/EstimateInput';
import { formatFr } from '../components/estimationUtils';
import { parseFr } from '@smarter-academy/core';

const DEMARCHE = ['Je comprends', "J'estime", 'Je calcule', 'Je compare et décide'];

function DemarcheBanner({ current }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DEMARCHE.map((d, i) => (
        <span key={d} className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-full transition-colors ${
          i < current ? 'bg-emerald-100 text-emerald-700' : i === current ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
        }`}>
          {i < current ? '✓ ' : `${i + 1}. `}{d}
        </span>
      ))}
    </div>
  );
}

/* ─── Question MCQ générique ──────────────────────────────────────── */
function McqStep({ tag, q, options, correct, explain, solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-800">
        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-white font-mono text-[10px] font-bold mr-2 align-middle">{tag}</span>
        {q}
      </p>
      <ChoiceGrid options={options} selected={pick} onSelect={setPick} revealed={revealed || solved} correctIndex={correct} cols={1} />
      {!revealed && !solved && (
        <div className="text-center">
          <ValidateButton onClick={() => { setRevealed(true); if (pick === correct) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
        </div>
      )}
      {revealed && (
        <Feedback tone={pick === correct ? 'ok' : 'ko'}>
          {explain}
          {pick !== correct && (
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

/* ─── Étape « je calcule » : saisie exacte ────────────────────────── */
function ExactStep({ tag, q, answer, unit, hint, solved, onSolved }) {
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);
  const check = () => {
    if (parseFr(val) === answer) { onSolved?.(); setFb(null); }
    else setFb(hint);
  };
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-800">
        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-white font-mono text-[10px] font-bold mr-2 align-middle">{tag}</span>
        {q}
      </p>
      {solved ? (
        <Feedback tone="ok"><strong className="font-mono">{formatFr(answer)}</strong> {unit}</Feedback>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <NumberField value={val} onChange={(v) => { setVal(v); setFb(null); }} onEnter={check} ariaLabel={q} width="w-32" size="sm" />
            {unit && <span className="text-sm font-mono text-slate-500">{unit}</span>}
            <ValidateButton onClick={check} disabled={!val}>OK</ValidateButton>
          </div>
          {fb && <Feedback tone="hint">{fb}</Feedback>}
        </>
      )}
    </div>
  );
}

/* ─── Problème 1 — les cahiers ────────────────────────────────────── */
function ProblemeCahiers({ onAllDone }) {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);
  const [s4pick, setS4pick] = useState(null);
  const [s4rev, setS4rev] = useState(false);
  const s4 = s4rev && s4pick === 0;

  React.useEffect(() => { if (s4) onAllDone(); }, [s4, onAllDone]);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 bg-white border-2 border-slate-200 rounded-2xl p-4">
        <ShoppingCart className="w-5 h-5 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
        <p className="text-sm text-slate-700">Une école achète <strong>198 cahiers</strong> à <strong>2 €</strong> l'unité.</p>
      </div>
      <DemarcheBanner current={s1 ? (s2 ? (s3 ? 3 : 2) : 1) : 0} />

      <McqStep tag="ÉTAPE 1" q="Quel calcul permet de trouver le coût total ?" options={['198 × 2', '198 + 2', '198 ÷ 2']} correct={0}
        explain="Le coût total, c'est le nombre de cahiers multiplié par le prix unitaire : 198 × 2." solved={s1} onSolved={() => setS1(true)} />

      {s1 && (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-800 mb-2">
            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-white font-mono text-[10px] font-bold mr-2 align-middle">ÉTAPE 2</span>
            Sans calculer exactement, estime le coût total.
          </p>
          <EstimateInput acceptMin={350} acceptMax={450} exact={396} exactLabel="Coût exact" solved={s2} onSolved={() => setS2(true)} hint="198 ≈ 200, et 200 × 2 = 400." />
        </div>
      )}

      {s2 && (
        <div className="border-t border-slate-100 pt-4">
          <ExactStep tag="ÉTAPE 3" q="Calcule maintenant le coût exact." answer={396} unit="€" hint="198 × 2 = 396." solved={s3} onSolved={() => setS3(true)} />
        </div>
      )}

      {s3 && (
        <div className="border-t border-slate-100 pt-4">
          <McqStep tag="ÉTAPE 4" q="396 € est-il cohérent avec ton estimation (≈ 400 €) ?" options={['Oui, très cohérent', 'Non, il faut recommencer']} correct={0}
            explain="396 € est tout proche de l'estimation 400 € : le résultat est validé." solved={s4} onSolved={() => { setS4pick(0); setS4rev(true); }} />
        </div>
      )}
    </div>
  );
}

/* ─── Problème 2 — le bus ─────────────────────────────────────────── */
function ProblemeBus({ locked, onAllDone }) {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);
  const [s4, setS4] = useState(false);

  React.useEffect(() => { if (s4) onAllDone(); }, [s4, onAllDone]);

  if (locked) return <p className="text-xs font-mono text-slate-400">Termine le problème précédent.</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 bg-white border-2 border-slate-200 rounded-2xl p-4">
        <Bus className="w-5 h-5 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
        <p className="text-sm text-slate-700">Un bus transporte <strong>48 personnes</strong> par voyage. Il fait <strong>21 voyages</strong> dans la journée.</p>
      </div>
      <DemarcheBanner current={s1 ? (s2 ? (s3 ? 3 : 2) : 1) : 0} />

      <McqStep tag="ÉTAPE 1" q="Quel calcul donne le nombre total de personnes transportées ?" options={['48 × 21', '48 + 21', '48 − 21']} correct={0}
        explain="On répète 48 personnes pour chacun des 21 voyages : 48 × 21." solved={s1} onSolved={() => setS1(true)} />

      {s1 && (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-800 mb-2">
            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-white font-mono text-[10px] font-bold mr-2 align-middle">ÉTAPE 2</span>
            Estime le nombre total de personnes.
          </p>
          <EstimateInput acceptMin={900} acceptMax={1100} exact={1008} exactLabel="Nombre exact" solved={s2} onSolved={() => setS2(true)} hint="48 ≈ 50 et 21 ≈ 20 : 50 × 20 = 1 000." />
        </div>
      )}

      {s2 && (
        <div className="border-t border-slate-100 pt-4">
          <ExactStep tag="ÉTAPE 3" q="Calcule le nombre exact de personnes transportées." answer={1008} unit="personnes" hint="48 × 21 = 1 008." solved={s3} onSolved={() => setS3(true)} />
        </div>
      )}

      {s3 && (
        <div className="border-t border-slate-100 pt-4">
          <McqStep tag="ÉTAPE 4" q="1 008 personnes, est-ce cohérent avec ton estimation (≈ 1 000) ?" options={['Oui, très cohérent', 'Non, il faut recommencer']} correct={0}
            explain="1 008 est tout proche de 1 000 : le résultat est cohérent." solved={s4} onSolved={() => setS4(true)} />
        </div>
      )}
    </div>
  );
}

export default function Module08Problemes() {
  const navLinks = getNavLinks(8);
  const [p1Done, setP1Done] = useState(false);
  const [p2Done, setP2Done] = useState(false);
  const allDone = p1Done && p2Done;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Estimation dans des problèmes"
      moduleSubtitle="Comprendre, estimer, calculer, comparer — dans des situations réelles."
      moduleNumber={8}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="🧠 Problèmes" title="La même démarche, à chaque fois.">
          <p>Comprendre ce qu'on cherche, estimer, calculer, puis comparer : c'est ce réflexe qui évite les erreurs.</p>
        </MissionBrief>

        <StepCard num={1} title="Problème 1 — Les cahiers de l'école" done={p1Done}>
          <ProblemeCahiers onAllDone={() => setP1Done(true)} />
        </StepCard>

        <StepCard num={2} title="Problème 2 — Le bus scolaire" done={p2Done} locked={!p1Done}>
          <ProblemeBus locked={!p1Done} onAllDone={() => setP2Done(true)} />
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
