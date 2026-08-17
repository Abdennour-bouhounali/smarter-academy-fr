import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Plus, Minus } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UnitGrid from '../components/UnitGrid';

/**
 * Atelier de coloriage d'une unité.
 * On clique la case qui TERMINE la sélection : colorier 37 centièmes reste
 * faisable au doigt, sans 37 clics.
 */
function ShadeWorkshop({ parts, target, tone, onSolved, solved, helper }) {
  const [shaded, setShaded] = useState(0);
  const [checked, setChecked] = useState(false);
  const isRight = shaded === target;

  const bump = (delta) => {
    setChecked(false);
    setShaded((s) => Math.min(parts, Math.max(0, s + delta)));
  };

  return (
    <div className="space-y-3">
      <UnitGrid
        parts={parts}
        shaded={shaded}
        tone={tone}
        onToggle={(i) => {
          if (solved) return;
          setChecked(false);
          setShaded((prev) => (prev === i + 1 ? i : i + 1));
        }}
        showCount
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => bump(-1)}
            disabled={solved || shaded === 0}
            aria-label="Enlever une part"
            className="w-10 h-10 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center hover:border-slate-400 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>
          <span className="font-mono font-extrabold text-xl tabular-nums w-10 text-center" aria-live="polite">
            {shaded}
          </span>
          <button
            type="button"
            onClick={() => bump(1)}
            disabled={solved || shaded === parts}
            aria-label="Ajouter une part"
            className="w-10 h-10 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center hover:border-slate-400 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {!solved && (
          <ValidateButton
            onClick={() => {
              setChecked(true);
              if (isRight) onSolved?.();
            }}
            disabled={shaded === 0}
          >
            Vérifier
          </ValidateButton>
        )}
      </div>

      {checked && !isRight && (
        <Feedback tone="hint">
          Tu as colorié <strong>{shaded}</strong> part{shaded > 1 ? 's' : ''} sur {parts}. {helper}
        </Feedback>
      )}

      {solved && (
        <Feedback tone="ok">
          <MathText>{`$\\frac{${target}}{${parts}}$`}</MathText> de l'unité sont coloriés.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Questions de formalisation ─────────────────────────────────── */
const Q_DIXIEMES = {
  q: "Si on partage une unité en 10 parts égales, combien de ces parts faut-il pour reconstituer l'unité entière ?",
  options: ['1', '10', '100', '1 000'],
  correct: 1,
  explain: "Il faut les 10 parts : 1 unité = 10 dixièmes. Chaque part vaut donc un dixième de l'unité.",
};

const Q_CENTIEMES = {
  q: "Et si on partage la même unité en 100 parts égales, combien de centièmes valent 1 dixième ?",
  options: ['1 centième', '10 centièmes', '100 centièmes', '1 000 centièmes'],
  correct: 1,
  explain:
    "Une ligne de la grille contient 10 petits carrés : c'est exactement 1 dixième. Donc 1 dixième = 10 centièmes, et 1 unité = 100 centièmes.",
};

const Q_DECOMP = {
  q: 'Dans les 37 centièmes que tu viens de colorier, combien de dixièmes COMPLETS as-tu formés ?',
  options: ['3 dixièmes et 7 centièmes', '37 dixièmes', '7 dixièmes et 3 centièmes', '3 centièmes et 7 dixièmes'],
  correct: 0,
  explain:
    'Les 3 premières lignes complètes forment 3 dixièmes (3 × 10 = 30 centièmes), et il reste 7 petits carrés : 7 centièmes. Donc 37 centièmes = 3 dixièmes + 7 centièmes.',
};

export default function Module02DecouperUnite() {
  const navLinks = getNavLinks(2);

  const [parts, setParts] = useState(1);
  const [qDixPick, setQDixPick] = useState(null);
  const [qDixRevealed, setQDixRevealed] = useState(false);
  const [shade3, setShade3] = useState(false);

  const [parts100, setParts100] = useState(false);
  const [qCentPick, setQCentPick] = useState(null);
  const [qCentRevealed, setQCentRevealed] = useState(false);
  const [shade37, setShade37] = useState(false);
  const [qDecPick, setQDecPick] = useState(null);
  const [qDecRevealed, setQDecRevealed] = useState(false);

  const s1 = parts === 10 && qDixRevealed && qDixPick === Q_DIXIEMES.correct;
  const s2 = shade3;
  const s3 = parts100 && qCentRevealed && qCentPick === Q_CENTIEMES.correct;
  const s4 = shade37 && qDecRevealed && qDecPick === Q_DECOMP.correct;
  const allDone = s1 && s2 && s3 && s4;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Découper l'unité"
      moduleSubtitle="Partage une unité en 10, puis en 100 : voilà d'où viennent les dixièmes et les centièmes."
      moduleNumber={2}
      estimatedTime="12 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="✂️ Atelier" title="Une unité, et une paire de ciseaux.">
          <p>
            Pour décrire ce qui se trouve entre deux entiers, il faut découper l'unité elle-même. Tu vas le faire
            à la main, et observer ce que valent les morceaux.
          </p>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard num={1} title="Partage l'unité en 10" done={s1}>
          <div className="space-y-4">
            <UnitGrid parts={parts} shaded={0} tone="emerald" label="1 unité" showCount={false} size="lg" />

            {parts === 1 && (
              <ValidateButton onClick={() => setParts(10)} tone="emerald">
                <Scissors className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                Partager en 10 parts égales
              </ValidateButton>
            )}

            <AnimatePresence>
              {parts === 10 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <Feedback tone="info">
                    L'unité est maintenant partagée en <strong>10 parts égales</strong>. Chaque part s'appelle un{' '}
                    <strong>dixième</strong> et s'écrit <MathText>{'$\\frac{1}{10}$'}</MathText>.
                  </Feedback>

                  <p className="text-sm font-semibold text-slate-700">{Q_DIXIEMES.q}</p>
                  <ChoiceGrid
                    options={Q_DIXIEMES.options}
                    selected={qDixPick}
                    onSelect={setQDixPick}
                    revealed={qDixRevealed}
                    correctIndex={Q_DIXIEMES.correct}
                    cols={4}
                  />
                  {!qDixRevealed && (
                    <ValidateButton onClick={() => setQDixRevealed(true)} disabled={qDixPick === null}>
                      Valider
                    </ValidateButton>
                  )}
                  {qDixRevealed && (
                    <Feedback tone={qDixPick === Q_DIXIEMES.correct ? 'ok' : 'ko'}>
                      {Q_DIXIEMES.explain}
                      {qDixPick !== Q_DIXIEMES.correct && (
                        <>
                          {' '}
                          <button
                            type="button"
                            onClick={() => {
                              setQDixRevealed(false);
                              setQDixPick(null);
                            }}
                            className="underline font-semibold"
                          >
                            Réessayer
                          </button>
                        </>
                      )}
                    </Feedback>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </StepCard>

        {/* Étape 2 */}
        <StepCard num={2} title="Colorie 3 dixièmes" subtitle="Clique la part qui termine ta sélection." done={s2} locked={!s1}>
          <ShadeWorkshop
            parts={10}
            target={3}
            tone="sky"
            solved={shade3}
            onSolved={() => setShade3(true)}
            helper="Il en faut exactement 3 : trois parts sur les dix."
          />
          {s2 && (
            <Feedback tone="info">
              3 parts sur 10, c'est <strong>3 dixièmes</strong>, que l'on écrit{' '}
              <MathText>{'$\\frac{3}{10}$'}</MathText>. Le dénominateur 10 rappelle en combien de parts l'unité a
              été partagée ; le numérateur 3 compte les parts prises.
            </Feedback>
          )}
        </StepCard>

        {/* Étape 3 */}
        <StepCard num={3} title="Découpe encore : en 100" done={s3} locked={!s2}>
          <div className="space-y-4">
            {!parts100 ? (
              <>
                <p className="text-sm text-slate-600">
                  Et si on coupait chacun des 10 dixièmes en 10 morceaux ? Combien de parts obtiendrait-on ?
                </p>
                <ValidateButton onClick={() => setParts100(true)} tone="emerald">
                  <Scissors className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  Partager chaque dixième en 10
                </ValidateButton>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <UnitGrid parts={100} shaded={0} tone="violet" label="1 unité partagée en 100" showCount={false} />

                <Feedback tone="info">
                  10 dixièmes × 10 = <strong>100 parts</strong>. Chaque petite case est un <strong>centième</strong>,
                  soit <MathText>{'$\\frac{1}{100}$'}</MathText>. Remarque bien :{' '}
                  <strong>une ligne entière de la grille = 1 dixième</strong>.
                </Feedback>

                <p className="text-sm font-semibold text-slate-700">{Q_CENTIEMES.q}</p>
                <ChoiceGrid
                  options={Q_CENTIEMES.options}
                  selected={qCentPick}
                  onSelect={setQCentPick}
                  revealed={qCentRevealed}
                  correctIndex={Q_CENTIEMES.correct}
                  cols={2}
                />
                {!qCentRevealed && (
                  <ValidateButton onClick={() => setQCentRevealed(true)} disabled={qCentPick === null}>
                    Valider
                  </ValidateButton>
                )}
                {qCentRevealed && (
                  <Feedback tone={qCentPick === Q_CENTIEMES.correct ? 'ok' : 'ko'}>
                    {Q_CENTIEMES.explain}
                    {qCentPick !== Q_CENTIEMES.correct && (
                      <>
                        {' '}
                        <button
                          type="button"
                          onClick={() => {
                            setQCentRevealed(false);
                            setQCentPick(null);
                          }}
                          className="underline font-semibold"
                        >
                          Réessayer
                        </button>
                      </>
                    )}
                  </Feedback>
                )}
              </motion.div>
            )}
          </div>
        </StepCard>

        {/* Étape 4 */}
        <StepCard num={4} title="Colorie 37 centièmes" subtitle="Puis observe combien de lignes complètes tu as formées." done={s4} locked={!s3}>
          <div className="space-y-4">
            <ShadeWorkshop
              parts={100}
              target={37}
              tone="violet"
              solved={shade37}
              onSolved={() => setShade37(true)}
              helper="Vise 37 petites cases : 3 lignes complètes, puis 7 cases de plus."
            />

            {shade37 && (
              <>
                <p className="text-sm font-semibold text-slate-700">{Q_DECOMP.q}</p>
                <ChoiceGrid
                  options={Q_DECOMP.options}
                  selected={qDecPick}
                  onSelect={setQDecPick}
                  revealed={qDecRevealed}
                  correctIndex={Q_DECOMP.correct}
                  cols={2}
                />
                {!qDecRevealed && (
                  <ValidateButton onClick={() => setQDecRevealed(true)} disabled={qDecPick === null}>
                    Valider
                  </ValidateButton>
                )}
                {qDecRevealed && (
                  <Feedback tone={qDecPick === Q_DECOMP.correct ? 'ok' : 'ko'}>
                    {Q_DECOMP.explain}
                    {qDecPick !== Q_DECOMP.correct && (
                      <>
                        {' '}
                        <button
                          type="button"
                          onClick={() => {
                            setQDecRevealed(false);
                            setQDecPick(null);
                          }}
                          className="underline font-semibold"
                        >
                          Réessayer
                        </button>
                      </>
                    )}
                  </Feedback>
                )}
              </>
            )}

            {s4 && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                  À retenir
                </div>
                <div className="text-lg sm:text-xl font-space font-extrabold">
                  1 unité = 10 dixièmes = 100 centièmes
                </div>
                <p className="text-sm text-slate-300">
                  Plus on découpe finement, plus on peut décrire précisément une quantité — sans jamais changer
                  la taille de l'unité de départ.
                </p>
              </div>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
