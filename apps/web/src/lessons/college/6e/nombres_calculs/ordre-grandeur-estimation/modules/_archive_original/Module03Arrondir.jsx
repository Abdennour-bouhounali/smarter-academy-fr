import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RoundPicker from '../components/RoundPicker';

/* ─── Étape 1 : arrondir à la dizaine ─────────────────────────────── */
const DIZAINES = [198, 302, 49, 71];

/* ─── Étape 2 : arrondir à la centaine ────────────────────────────── */
const CENTAINES = [347, 620];

/* ─── Étape 3 : le cas pile au milieu ─────────────────────────────── */
const MILIEU_Q = {
  q: 'Faut-il arrondir 750 à 700 ou à 800 ?',
  options: ['700 uniquement', '800 uniquement', 'Les deux sont acceptables : 750 est exactement au milieu'],
  correct: 2,
  explain: '750 est à égale distance de 700 et de 800. Dans ce cas précis, les deux arrondis sont raisonnables : ce qui compte, c\'est de rester cohérent dans la suite du calcul.',
};

/* ─── Étape 4 : quel pas choisir ? ────────────────────────────────── */
const PAS_Q = {
  q: 'Pour estimer rapidement 4 128 + 3 950, quel pas d\'arrondi choisirais-tu ?',
  options: ['La dizaine (10)', 'La centaine (100)', 'Le millier (1 000)'],
  correct: 2,
  explain: 'Pour des nombres à 4 chiffres, arrondir au millier donne un calcul très simple (4 000 + 4 000 = 8 000) tout en restant assez précis. Plus le nombre est grand, plus le pas d\'arrondi peut être grand.',
};

export default function Module03Arrondir() {
  const navLinks = getNavLinks(3);
  const [dizDone, setDizDone] = useState([]);
  const [centDone, setCentDone] = useState([]);
  const [milieuPick, setMilieuPick] = useState(null);
  const [milieuRevealed, setMilieuRevealed] = useState(false);
  const [pasPick, setPasPick] = useState(null);
  const [pasRevealed, setPasRevealed] = useState(false);

  const s1 = dizDone.length === DIZAINES.length;
  const s2 = centDone.length === CENTAINES.length;
  const s3 = milieuRevealed && milieuPick === MILIEU_Q.correct;
  const s4 = pasRevealed && pasPick === PAS_Q.correct;
  const allDone = s1 && s2 && s3 && s4;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Arrondir pour estimer"
      moduleSubtitle="Choisir le nombre ami le plus proche, facile à calculer de tête."
      moduleNumber={3}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="🎯 Arrondir" title="Un « nombre ami », c'est un nombre facile à calculer.">
          <p>Arrondir à la dizaine, à la centaine ou au millier : le but est toujours le même — simplifier sans trop s'éloigner du nombre de départ.</p>
        </MissionBrief>

        <StepCard num={1} title="Arrondis à la dizaine" done={s1}>
          <div className="space-y-6">
            {DIZAINES.map((v, i) =>
              i === 0 || dizDone.includes(i - 1) ? (
                <RoundPicker key={v} value={v} step={10} solved={dizDone.includes(i)} onSolved={() => setDizDone((d) => (d.includes(i) ? d : [...d, i]))} />
              ) : null
            )}
          </div>
        </StepCard>

        <StepCard num={2} title="Et pour de plus grands nombres : la centaine" done={s2} locked={!s1}>
          <div className="space-y-6">
            {CENTAINES.map((v, i) =>
              i === 0 || centDone.includes(i - 1) ? (
                <RoundPicker key={v} value={v} step={100} solved={centDone.includes(i)} onSolved={() => setCentDone((d) => (d.includes(i) ? d : [...d, i]))} />
              ) : null
            )}
          </div>
        </StepCard>

        <StepCard num={3} title="Un cas particulier : pile au milieu" done={s3} locked={!s2}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{MILIEU_Q.q}</p>
            <ChoiceGrid options={MILIEU_Q.options} selected={milieuPick} onSelect={setMilieuPick} revealed={milieuRevealed} correctIndex={MILIEU_Q.correct} cols={1} />
            {!milieuRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setMilieuRevealed(true)} disabled={milieuPick === null}>Valider</ValidateButton>
              </div>
            )}
            {milieuRevealed && (
              <Feedback tone={milieuPick === MILIEU_Q.correct ? 'ok' : 'ko'}>
                {MILIEU_Q.explain}
                {milieuPick !== MILIEU_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setMilieuRevealed(false); setMilieuPick(null); }} className="underline font-semibold">Réessayer</button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        <StepCard num={4} title="Choisir le bon pas d'arrondi" done={s4} locked={!s3}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{PAS_Q.q}</p>
            <ChoiceGrid options={PAS_Q.options} selected={pasPick} onSelect={setPasPick} revealed={pasRevealed} correctIndex={PAS_Q.correct} cols={1} />
            {!pasRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setPasRevealed(true)} disabled={pasPick === null}>Valider</ValidateButton>
              </div>
            )}
            {pasRevealed && (
              <Feedback tone={pasPick === PAS_Q.correct ? 'ok' : 'ko'}>
                {PAS_Q.explain}
                {pasPick !== PAS_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setPasRevealed(false); setPasPick(null); }} className="underline font-semibold">Réessayer</button>
                  </>
                )}
              </Feedback>
            )}
            {s4 && (
              <Feedback tone="info">
                Retiens l'idée, pas une règle rigide : <strong>plus le nombre est grand, plus on peut arrondir large</strong> — l'objectif reste toujours d'obtenir un calcul simple.
              </Feedback>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
