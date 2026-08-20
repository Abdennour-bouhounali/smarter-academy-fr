import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PolygonPerimeter from '../components/PolygonPerimeter';
import { perimeter, parseDec, roundTo, formatLength } from '../components/lengthUtils';

const FIELD_SIDES = [25, 12, 25, 12]; // longueur, largeur, longueur, largeur (m)

/* ─── Étape 1 : quelle unité pour le plan ? ──────────────────────── */
const UNIT_Q = {
  q: 'Sur le plan du city-stade, on doit indiquer les dimensions 25 et 12. Quelle unité choisir ?',
  options: ['km', 'm', 'mm'],
  correct: 1,
  explain: 'Un terrain de sport se mesure naturellement en mètres : ni en km (beaucoup trop grand), ni en mm (beaucoup trop petit).',
};

// Assessment metadata (docs/architecture/AI_LESSON_CONTRACT.md) — each
// StepCard checkpoint below certifies one learning point from this
// evaluation-stage module.
const EVAL_UNIT_CHOICE = {
  id: 'longueurs-eval-unit-choice',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P1'] },
};
// Placing a plot every 5 m along a measured 25 m side re-exercises reading a
// length correctly (the ruler/zero-trap skill from module 2) without
// re-litigating the physical-ruler UI.
const EVAL_PLOTS = {
  id: 'longueurs-eval-plots',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P2', '6e_longueurs_P3'] },
};
const EVAL_CONVERT_CM = {
  id: 'longueurs-eval-convert-cm',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P4'] },
};
const EVAL_PERIMETER = {
  id: 'longueurs-eval-perimeter',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P6'] },
};
const EVAL_ESTIMATION = {
  id: 'longueurs-eval-estimation',
  assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_longueurs_P5'] },
};

/* ─── Étape 4 : le tour du terrain ───────────────────────────────── */
function TraceField({ done, onSolved }) {
  const [tapped, setTapped] = useState([]);
  const allTapped = tapped.length === FIELD_SIDES.length;
  const handleTap = (i) => {
    if (done || tapped.includes(i)) return;
    const next = [...tapped, i];
    setTapped(next);
    if (next.length === FIELD_SIDES.length) onSolved?.();
  };
  return (
    <div className="space-y-3">
      <PolygonPerimeter shape="rectangle" sideLengths={FIELD_SIDES} unit="m" tappedIndices={tapped} onTapSide={handleTap} disabled={done} />
      <div className="text-center font-mono text-sm text-slate-600">
        {tapped.length}/4 côtés parcourus
      </div>
      {(allTapped || done) && (
        <Feedback tone="ok">
          {FIELD_SIDES.join(' + ')} = <strong>{perimeter(FIELD_SIDES)} m</strong> : c’est le périmètre du city-stade.
        </Feedback>
      )}
    </div>
  );
}

const ESTIM_Q = {
  q: 'Une coureuse fait 3 tours complets du city-stade (périmètre 74 m). Sans calcul exact, quelle distance totale est la plus plausible ?',
  options: ['≈ 22 m', '≈ 220 m', '≈ 2 200 m'],
  correct: 1,
  explain: '3 tours de 74 m, c’est un peu plus de 3 × 70 = 210 m : ≈ 220 m est le bon ordre de grandeur.',
};

const RECAP = [
  { emoji: '🧭', label: 'Choisir l’unité' },
  { emoji: '📏', label: 'Mesurer sans piège' },
  { emoji: '🔁', label: 'Convertir' },
  { emoji: '🎯', label: 'Estimer' },
  { emoji: '⬛', label: 'Calculer un périmètre' },
];

export default function Module07MissionFinale() {
  const navLinks = getNavLinks(7);
  const { xp } = useProgress(MODULE_CTX.lessonId);

  const [unitPick, setUnitPick] = useState(null);
  const [unitRevealed, setUnitRevealed] = useState(false);
  const s1 = unitRevealed && unitPick === UNIT_Q.correct;

  const [plotsVal, setPlotsVal] = useState('');
  const [plotsChecked, setPlotsChecked] = useState(false);
  const plotsOk = plotsChecked && parseDec(plotsVal) === 5;

  const [cmVal, setCmVal] = useState('');
  const [cmChecked, setCmChecked] = useState(false);
  const cmOk = cmChecked && !Number.isNaN(parseDec(cmVal)) && roundTo(parseDec(cmVal), 2) === 1200;

  const [fieldDone, setFieldDone] = useState(false);
  const s4 = fieldDone;

  const [estimPick, setEstimPick] = useState(null);
  const [estimRevealed, setEstimRevealed] = useState(false);
  const s5 = estimRevealed && estimPick === ESTIM_Q.correct;

  const allDone = s1 && plotsOk && cmOk && s4 && s5;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="🏆 Mission finale : le parcours"
      moduleSubtitle="Un parcours sportif de 25 m sur 12 m : mobilise tout ce que tu as appris."
      moduleNumber={7}
      estimatedTime="16 min"
      xp={xp}
      prevLink={navLinks.prevLink}
      nextLink={navLinks.nextLink}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🏆 Mission finale" title="Le club de sport prépare un city-stade rectangulaire de 25 m sur 12 m." tone="amber">
          <p>Tu vas suivre tout le chantier, du plan jusqu’au tour de piste — avec tout ce que tu as appris sur les longueurs.</p>
        </MissionBrief>

        <StepCard num={1} title="Le plan" subtitle="Quelle unité pour dessiner le terrain ?" done={s1}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{UNIT_Q.q}</p>
            <ChoiceGrid options={UNIT_Q.options} selected={unitPick} onSelect={setUnitPick} revealed={unitRevealed} correctIndex={UNIT_Q.correct} cols={3} />
            {!unitRevealed && (
              <div className="text-center"><ValidateButton onClick={() => setUnitRevealed(true)} disabled={unitPick === null}>Valider</ValidateButton></div>
            )}
            {unitRevealed && (
              <Feedback tone={s1 ? 'ok' : 'ko'}>
                {UNIT_Q.explain}
                {!s1 && <> <button type="button" onClick={() => { setUnitRevealed(false); setUnitPick(null); }} className="underline font-semibold">Réessayer</button></>}
              </Feedback>
            )}
          </div>
        </StepCard>

        <StepCard num={2} title="Les plots" subtitle="On pose un plot tous les 5 m, le long du grand côté (25 m)." done={plotsOk} locked={!s1}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Combien d’intervalles de 5 m contient le grand côté de 25 m ?</p>
            <div className="flex items-center justify-center gap-2">
              <NumberField value={plotsVal} onChange={(v) => { setPlotsChecked(false); setPlotsVal(v); }} ariaLabel="Nombre d'intervalles de 5 m" width="w-24" />
              <span className="font-mono text-sm text-slate-500">intervalles</span>
            </div>
            {!plotsOk && (
              <div className="text-center"><ValidateButton onClick={() => setPlotsChecked(true)} disabled={plotsVal === ''}>Valider</ValidateButton></div>
            )}
            {plotsChecked && !plotsOk && (
              <Feedback tone="hint">25 m divisé en tronçons de 5 m : 25 ÷ 5 = ?{' '}
                <button type="button" onClick={() => { setPlotsChecked(false); setPlotsVal(''); }} className="underline font-semibold">Réessayer</button>
              </Feedback>
            )}
            {plotsOk && <Feedback tone="ok">25 ÷ 5 = 5 intervalles de 5 m sur le grand côté.</Feedback>}
          </div>
        </StepCard>

        <StepCard num={3} title="L’affiche du club" subtitle="Convertis la largeur (12 m) pour l’imprimeur, en cm." done={cmOk} locked={!plotsOk}>
          <div className="space-y-4">
            <div className="text-center font-mono text-lg font-bold text-slate-800">12 m = ? cm</div>
            <div className="flex items-center justify-center gap-2">
              <NumberField value={cmVal} onChange={(v) => { setCmChecked(false); setCmVal(v); }} ariaLabel="Largeur en cm" width="w-32" />
              <span className="font-mono text-sm text-slate-500">cm</span>
            </div>
            {!cmOk && (
              <div className="text-center"><ValidateButton onClick={() => setCmChecked(true)} disabled={cmVal === ''}>Valider</ValidateButton></div>
            )}
            {cmChecked && !cmOk && (
              <Feedback tone="hint">1 m = 100 cm, donc 12 m devient un nombre 100 fois plus grand.{' '}
                <button type="button" onClick={() => { setCmChecked(false); setCmVal(''); }} className="underline font-semibold">Réessayer</button>
              </Feedback>
            )}
            {cmOk && <Feedback tone="ok">12 m = <strong>{formatLength(1200, 'cm')}</strong>.</Feedback>}
          </div>
        </StepCard>

        <StepCard num={4} title="Le tour du terrain" subtitle="Calcule le périmètre du city-stade." done={s4} locked={!cmOk}>
          <TraceField done={fieldDone} onSolved={() => setFieldDone(true)} />
        </StepCard>

        <StepCard num={5} title="Le jour de la course" subtitle="Estime, sans tout recalculer." done={s5} locked={!s4}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{ESTIM_Q.q}</p>
            <ChoiceGrid options={ESTIM_Q.options} selected={estimPick} onSelect={setEstimPick} revealed={estimRevealed} correctIndex={ESTIM_Q.correct} cols={3} />
            {!estimRevealed && (
              <div className="text-center"><ValidateButton onClick={() => setEstimRevealed(true)} disabled={estimPick === null}>Valider</ValidateButton></div>
            )}
            {estimRevealed && (
              <Feedback tone={s5 ? 'ok' : 'ko'}>
                {ESTIM_Q.explain}
                {!s5 && <> <button type="button" onClick={() => { setEstimRevealed(false); setEstimPick(null); }} className="underline font-semibold">Réessayer</button></>}
              </Feedback>
            )}
          </div>
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl p-8 text-center space-y-4">
            <Trophy className="w-10 h-10 mx-auto" aria-hidden="true" />
            <div className="text-2xl font-space font-extrabold">Mission accomplie !</div>
            <p className="text-amber-50 text-sm leading-relaxed max-w-lg mx-auto">
              Du plan au tour de piste, tu as choisi une unité, mesuré sans te faire piéger par le zéro, converti,
              estimé et calculé un périmètre — sur une seule et même situation.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {RECAP.map((r) => (
                <div key={r.label} className="bg-white/15 rounded-xl py-2.5 px-1 text-xs font-bold flex flex-col items-center gap-1">
                  <span className="text-lg" aria-hidden="true">{r.emoji}</span>
                  {r.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
