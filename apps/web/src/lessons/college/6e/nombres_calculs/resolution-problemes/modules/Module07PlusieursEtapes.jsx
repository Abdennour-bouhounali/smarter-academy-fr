import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import CalcChain from '../../../../../common/components/CalcChain';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseFr } from '@smarter-academy/core';

/* ─── Étape 1 : construire la chaîne, guidé ──────────────────────── */
function ChaineGuidee({ solved, onSolved }) {
  const [step1Val, setStep1Val] = useState('');
  const [step1Ok, setStep1Ok] = useState(false);
  const [namePick, setNamePick] = useState(null);
  const [nameRevealed, setNameRevealed] = useState(false);
  const [step2Val, setStep2Val] = useState('');
  const [step2Ok, setStep2Ok] = useState(false);

  const checkStep1 = () => { if (parseFr(step1Val) === 192) setStep1Ok(true); };
  const step1Named = nameRevealed && namePick === 0;
  const checkStep2 = () => { if (parseFr(step2Val) === 157) { setStep2Ok(true); onSolved?.(); } };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
        Une école achète 8 boîtes de crayons. Chaque boîte contient 24 crayons. L'école distribue ensuite 35
        crayons. Combien de crayons reste-t-il ?
      </p>

      {/* Étape intermédiaire 1 */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Première chose à trouver : combien de crayons ont été achetés en tout ?</p>
        {step1Ok ? (
          <Feedback tone="ok">8 × 24 = 192 crayons achetés.</Feedback>
        ) : (
          <div className="flex items-center gap-2 justify-center">
            <NumberField value={step1Val} onChange={setStep1Val} onEnter={checkStep1} ariaLabel="Crayons achetés" placeholder="?" width="w-28" />
            <ValidateButton onClick={checkStep1} disabled={!step1Val}>OK</ValidateButton>
          </div>
        )}
      </div>

      {/* Nommer le résultat intermédiaire */}
      {step1Ok && (
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-700">Que représente ce nombre, 192 ?</p>
          <ChoiceGrid
            options={['Le nombre total de crayons achetés', 'Le nombre de crayons distribués', 'Le nombre de boîtes']}
            selected={namePick} onSelect={setNamePick} revealed={nameRevealed} correctIndex={0} cols={1}
          />
          {!nameRevealed && (
            <div className="text-center">
              <ValidateButton onClick={() => setNameRevealed(true)} disabled={namePick === null}>Valider</ValidateButton>
            </div>
          )}
          {nameRevealed && (
            <Feedback tone={namePick === 0 ? 'ok' : 'ko'}>
              192 est un résultat INTERMÉDIAIRE : le nombre total de crayons achetés — pas encore la réponse
              finale.
              {namePick !== 0 && (
                <>
                  {' '}
                  <button type="button" onClick={() => { setNameRevealed(false); setNamePick(null); }} className="underline font-semibold">Réessayer</button>
                </>
              )}
            </Feedback>
          )}
        </div>
      )}

      {/* Étape 2 */}
      {step1Named && (
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-700">Maintenant, utilise ce résultat : combien de crayons reste-t-il après la distribution ?</p>
          {step2Ok ? (
            <Feedback tone="ok">192 − 35 = 157 crayons restants.</Feedback>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <NumberField value={step2Val} onChange={setStep2Val} onEnter={checkStep2} ariaLabel="Crayons restants" placeholder="?" width="w-28" />
              <ValidateButton onClick={checkStep2} disabled={!step2Val}>OK</ValidateButton>
            </div>
          )}
        </div>
      )}

      {solved && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
          <CalcChain
            steps={[
              { label: 'Crayons achetés', expr: '8 boîtes × 24 crayons', value: '192 crayons' },
              { label: 'Crayons restants', expr: '192 − 35 distribués', value: '157 crayons' },
            ]}
          />
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 2 : deuxième problème, plus autonome ─────────────────── */
function ChaineAutonome({ solved, onSolved }) {
  const [step1Val, setStep1Val] = useState('');
  const [step1Ok, setStep1Ok] = useState(false);
  const [step2Val, setStep2Val] = useState('');
  const [step2Ok, setStep2Ok] = useState(false);

  const checkStep1 = () => { if (parseFr(step1Val) === 180) setStep1Ok(true); };
  const checkStep2 = () => { if (parseFr(step2Val) === 42) { setStep2Ok(true); onSolved?.(); } };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
        Une salle de cinéma a 12 rangées de 15 sièges. Lors d'une séance, 138 sièges sont occupés. Combien de
        sièges restent libres ?
      </p>
      <p className="text-xs text-slate-500">Trouve d'abord un résultat intermédiaire, puis la réponse finale — sans aide cette fois.</p>

      <div className="space-y-2">
        {step1Ok ? (
          <Feedback tone="ok">12 × 15 = 180 sièges au total.</Feedback>
        ) : (
          <div className="flex items-center gap-2 justify-center">
            <NumberField value={step1Val} onChange={setStep1Val} onEnter={checkStep1} ariaLabel="Résultat intermédiaire" placeholder="? (intermédiaire)" width="w-36" />
            <ValidateButton onClick={checkStep1} disabled={!step1Val}>OK</ValidateButton>
          </div>
        )}
      </div>

      {step1Ok && (
        <div className="space-y-2 border-t border-slate-100 pt-4">
          {step2Ok ? (
            <Feedback tone="ok">180 − 138 = 42 sièges libres.</Feedback>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <NumberField value={step2Val} onChange={setStep2Val} onEnter={checkStep2} ariaLabel="Réponse finale" placeholder="? (final)" width="w-36" />
              <ValidateButton onClick={checkStep2} disabled={!step2Val}>OK</ValidateButton>
            </div>
          )}
        </div>
      )}

      {solved && (
        <CalcChain steps={[
          { label: 'Sièges au total', expr: '12 rangées × 15 sièges', value: '180 sièges' },
          { label: 'Sièges libres', expr: '180 − 138 occupés', value: '42 sièges' },
        ]} />
      )}
    </div>
  );
}

/* ─── Étape 3 : remettre les étapes dans l'ordre ─────────────────── */
const ORDER_STEPS = [
  { id: 'a', text: 'Comprendre : on cherche combien de billets restent à vendre.' },
  { id: 'b', text: 'Calculer le nombre total de places : 15 rangées × 20 places = 300.' },
  { id: 'c', text: 'Calculer les places restantes : 300 − 214 vendues = 86.' },
  { id: 'd', text: 'Répondre : il reste 86 billets à vendre.' },
];
const CORRECT_ORDER = ['a', 'b', 'c', 'd'];

function RemettreOrdre({ solved, onSolved }) {
  const [built, setBuilt] = useState([]);
  const [error, setError] = useState(null);

  const pool = ORDER_STEPS.filter((s) => !built.includes(s.id));

  const add = (id) => {
    if (solved) return;
    setError(null);
    setBuilt((prev) => [...prev, id]);
  };
  const remove = (id) => {
    if (solved) return;
    setBuilt((prev) => prev.filter((x) => x !== id));
  };

  const check = () => {
    const badIndex = built.findIndex((id, i) => id !== CORRECT_ORDER[i]);
    if (badIndex === -1 && built.length === CORRECT_ORDER.length) {
      onSolved?.();
      setError(null);
    } else {
      setError(badIndex === -1 ? built.length : badIndex);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Voici les étapes (mélangées) de la résolution d'un problème sur la vente de billets. Reconstitue l'ordre
        logique en les touchant une par une.
      </p>

      <div>
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Étapes disponibles</div>
        <div className="flex flex-col gap-2">
          {pool.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => add(s.id)}
              className="text-left px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-700 hover:border-blue-400 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {s.text}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Ton ordre</div>
        <div className="space-y-1.5 min-h-[60px] p-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
          {built.length === 0 && <p className="text-xs text-slate-400 italic px-2">Touche une étape ci-dessus pour commencer.</p>}
          {built.map((id, i) => {
            const s = ORDER_STEPS.find((x) => x.id === id);
            const isBad = error !== null && i === error;
            return (
              <button
                key={id}
                type="button"
                onClick={() => remove(id)}
                disabled={solved}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm ${
                  solved ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : isBad ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                <span className="font-mono font-bold text-xs text-slate-400">{i + 1}.</span>
                {s.text}
              </button>
            );
          })}
        </div>
      </div>

      {error !== null && (
        <Feedback tone="ko">L'étape en position {error + 1} n'est pas à sa place. Retire-la et replace-la correctement.</Feedback>
      )}

      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={check} disabled={built.length !== ORDER_STEPS.length}>Vérifier mon ordre</ValidateButton>
        </div>
      )}

      {solved && <Feedback tone="ok">Comprendre → Calculer l'intermédiaire → Calculer le final → Répondre : c'est toujours cet enchaînement.</Feedback>}
    </div>
  );
}

export default function Module07PlusieursEtapes() {
  const navLinks = getNavLinks(7);
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Problèmes à plusieurs étapes"
      moduleSubtitle="Construire une chaîne de calcul, étape par étape — chaque résultat intermédiaire doit être nommé."
      moduleNumber={7}
      estimatedTime="11 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🔗 Chaîne" title="Une situation qui évolue en plusieurs temps.">
          <p>
            Un résultat intermédiaire n'est pas la réponse finale — mais sans lui, impossible d'avancer. Chaque
            étape doit être comprise, pas seulement calculée.
          </p>
        </MissionBrief>

        <StepCard num={1} title="Construis la chaîne, étape par étape" done={s1}>
          <ChaineGuidee solved={s1} onSolved={() => setS1(true)} />
        </StepCard>

        <StepCard num={2} title="À toi, plus autonome" done={s2} locked={!s1}>
          <ChaineAutonome solved={s2} onSolved={() => setS2(true)} />
        </StepCard>

        <StepCard num={3} title="Remets les étapes dans l'ordre" done={s3} locked={!s2}>
          <RemettreOrdre solved={s3} onSolved={() => setS3(true)} />
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
