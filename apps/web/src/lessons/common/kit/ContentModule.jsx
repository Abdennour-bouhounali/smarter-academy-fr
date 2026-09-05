import React, { createContext, useContext } from 'react';
import ModuleLayout from '../components/ModuleLayout';
import { useProgress } from '../hooks/useProgress';
import { useModuleEffects } from '../hooks/useModuleEffects';
import {
  MissionBrief, StepCard, StepProgressBar, StreakChip, EffectsToggle,
} from '../components/LessonUI';
import { isStepLocked } from '../utils/stepUnlock';

/**
 * Lesson kit — shell d'un module de contenu (formatif).
 *
 * Concentre en un seul endroit tout ce que chaque module recopiait à la
 * main : progression des étapes (StepProgressBar), série + effets sonores
 * (StreakChip/EffectsToggle via useModuleEffects), verrouillage séquentiel
 * des StepCard avec libre navigation après complétion (isStepLocked), et
 * incompleteSteps pour le bouton « Module suivant ».
 *
 * Le module appelant ne garde que : son état propre (les flags done de ses
 * étapes + l'état de ses manipulations), et le CONTENU de chaque étape.
 *
 * `steps[].content`, `intro` et `footer` acceptent un ReactNode OU une
 * fonction `(kit) => ReactNode` recevant `{ react, alreadyCompleted,
 * effectsEnabled }` — utile quand une manipulation maison doit déclencher
 * le son/la série (`react(true)` à l'atteinte de l'objectif). Les
 * composants question du kit (TapQuestion…) récupèrent le même objet via
 * le contexte (`useKit()`), sans fil à tirer.
 */
const KitContext = createContext(null);

export function useKit() {
  const kit = useContext(KitContext);
  if (!kit) {
    throw new Error('useKit() doit être appelé sous <ContentModule> (lesson kit).');
  }
  return kit;
}

export default function ContentModule({
  ctx,            // MODULE_CTX de la leçon (spread dans ModuleLayout)
  navLinks,       // getNavLinks(moduleNumber)
  moduleNumber,
  moduleTitle,
  moduleSubtitle,
  estimatedTime,
  brief,          // { tag, title, tone?, body }
  intro,          // contenu entre le brief et les étapes (ex. cartes de mission)
  steps,          // [{ num, title, subtitle?, done, content }]
  footer,         // contenu de fin, rendu quand allDone
}) {
  const { xp, isModuleCompleted } = useProgress(ctx.lessonId);
  const alreadyCompleted = isModuleCompleted(String(moduleNumber));
  const { effectsEnabled, toggleEffects, streak, react } = useModuleEffects();

  const allDone = alreadyCompleted || steps.every((s) => s.done);
  const doneCount = steps.filter((s) => s.done).length;
  const incompleteSteps = steps.filter((s) => !s.done).map(({ num, title }) => ({ num, title }));

  const kit = { react, alreadyCompleted, effectsEnabled };
  const renderSlot = (slot) => (typeof slot === 'function' ? slot(kit) : slot);

  return (
    <KitContext.Provider value={kit}>
      <ModuleLayout
        {...ctx}
        moduleTitle={moduleTitle}
        moduleSubtitle={moduleSubtitle}
        moduleNumber={moduleNumber}
        estimatedTime={estimatedTime}
        xp={xp}
        prevLink={navLinks.prevLink}
        nextLink={allDone ? navLinks.nextLink : undefined}
        isCompleted={allDone}
        incompleteSteps={incompleteSteps}
      >
        <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
          {!allDone && <StepProgressBar doneCount={doneCount} total={steps.length} />}

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <StreakChip count={streak} />
            <EffectsToggle enabled={effectsEnabled} onToggle={toggleEffects} />
          </div>

          {brief && (
            <MissionBrief tag={brief.tag} title={brief.title} tone={brief.tone}>
              {brief.body}
            </MissionBrief>
          )}

          {renderSlot(intro)}

          {steps.map((s, i) => (
            <StepCard
              key={s.num}
              num={s.num}
              title={s.title}
              subtitle={s.subtitle}
              done={s.done}
              locked={isStepLocked(alreadyCompleted, i === 0 ? false : !steps[i - 1].done)}
            >
              {renderSlot(s.content)}
            </StepCard>
          ))}

          {allDone && renderSlot(footer)}
        </div>
      </ModuleLayout>
    </KitContext.Provider>
  );
}
