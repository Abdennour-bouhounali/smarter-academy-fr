import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Plus, Minus } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UnitGrid from '../components/UnitGrid';

/**
 * Module 2 V2 — reconstruit sur le lesson kit.
 *
 * Le geste de coloriage (ShadeWorkshop) reste une manipulation maison : ce
 * n'est pas une question à choix, c'est atteindre un objectif en cliquant.
 * Suit le contrat kit : solved/onSolved, react(), onSolved appelé
 * inconditionnellement, feedback jamais gaté sur !solved.
 */
function ShadeWorkshop({ parts, target, tone, onSolved, solved, helper, react }) {
  const [shaded, setShaded] = useState(solved ? target : 0);
  const [checked, setChecked] = useState(false);
  const isRight = shaded === target;

  // RÈGLE PROJET (2026-09-06) : le coloriage ne se fige JAMAIS après la
  // validation de l'étape — c'est justement APRÈS la découverte que l'élève
  // teste « et si j'en colorie une de plus ? ». Les seules bornes qui
  // subsistent sont MATHÉMATIQUES : on ne descend pas sous 0 part, on ne
  // dépasse pas les `parts` parts de l'unité.
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
            disabled={shaded === 0}
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
            disabled={shaded === parts}
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
              react(isRight);
              onSolved();
            }}
            disabled={shaded === 0}
          >
            Vérifier
          </ValidateButton>
        )}
      </div>

      {checked && !isRight && (
        <Feedback tone="hint">
          Tu as colorié <strong>{shaded}</strong> part{shaded > 1 ? 's' : ''} sur {parts}. La bonne réponse : le
          nombre cible était <strong>{target}</strong>. {helper}
        </Feedback>
      )}

      {/* Le retour cite la valeur VIVANTE : si l'élève continue à colorier
          après la validation, la phrase reste vraie au lieu de décrire un
          état figé. */}
      {solved && (
        <Feedback tone="ok">
          <MathText>{`$\\frac{${target}}{${parts}}$`}</MathText> de l'unité, c'était l'objectif.
          {shaded !== target && (
            <> Tu en es maintenant à <strong>{shaded}</strong> part{shaded > 1 ? 's' : ''} sur {parts} —
            continue d'essayer, l'unité ne change pas de taille.</>
          )}
        </Feedback>
      )}
    </div>
  );
}

const Q_DIXIEMES = {
  q: "Si on partage une unité en 10 parts égales, combien de ces parts faut-il pour reconstituer l'unité entière ?",
  options: ['1', '10', '100', '1 000'],
  correct: 1,
  explain: "Il faut les 10 parts : 1 unité = 10 dixièmes. Chaque part vaut donc un dixième de l'unité.",
};

const Q_CENTIEMES = {
  q: 'Et si on partage la même unité en 100 parts égales, combien de centièmes valent 1 dixième ?',
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
  const [parts10, setParts10] = useState(false); // a-t-on cliqué "partager en 10" ?
  const [qDix, setQDix] = useState(false);
  const [shade3, setShade3] = useState(false);
  const [parts100, setParts100] = useState(false);
  const [qCent, setQCent] = useState(false);
  const [shade37, setShade37] = useState(false);
  const [qDec, setQDec] = useState(false);

  const s1 = parts10 && qDix;
  const s2 = shade3;
  const s3 = parts100 && qCent;
  const s4 = shade37 && qDec;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Découper l'unité"
      moduleSubtitle="Partage une unité en 10, puis en 100 : voilà d'où viennent les dixièmes et les centièmes."
      estimatedTime="12 min"
      brief={{
        tag: '✂️ Atelier',
        title: 'Une unité, et une paire de ciseaux.',
        body: (
          <p>
            Pour décrire ce qui se trouve entre deux entiers, il faut découper l'unité elle-même. Tu vas le faire
            à la main, et observer ce que valent les morceaux.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: "Partage l'unité en 10",
          done: s1,
          content: (
            <div className="space-y-4">
              <UnitGrid parts={parts10 ? 10 : 1} shaded={0} tone="emerald" label="1 unité" showCount={false} size="lg" />

              {!parts10 && (
                <ValidateButton onClick={() => setParts10(true)} tone="emerald">
                  <Scissors className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  Partager en 10 parts égales
                </ValidateButton>
              )}

              <AnimatePresence>
                {parts10 && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* La coupe vient d'être faite : le mot « dixième »
                        désigne maintenant une part que l'élève voit. */}
                    <KnowledgeBrick
                      id="dixieme"
                      variant="new"
                      lead="Les dix parts que tu viens de créer portent un nom."
                    />

                    <TapQuestion
                      prompt={Q_DIXIEMES.q}
                      options={Q_DIXIEMES.options}
                      correct={Q_DIXIEMES.correct}
                      cols={4}
                      requires={['dixieme']}
                      explain={Q_DIXIEMES.explain}
                      solved={qDix}
                      onAnswered={() => setQDix(true)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ),
        },
        {
          num: 2,
          title: 'Colorie 3 dixièmes',
          subtitle: 'Clique la part qui termine ta sélection.',
          done: s2,
          content: (kit) => (
            <>
              <ShadeWorkshop
                parts={10}
                target={3}
                tone="sky"
                solved={shade3}
                onSolved={() => setShade3(true)}
                react={kit.react}
                helper="Il en faut exactement 3 : trois parts sur les dix."
              />
              {s2 && (
                <Feedback tone="info">
                  3 parts sur 10 : <MathText>{'$\\frac{3}{10}$'}</MathText>. Ces deux nombres portent
                  chacun un nom — tu les découvriras au module suivant.
                </Feedback>
              )}
            </>
          ),
        },
        {
          num: 3,
          title: 'Découpe encore : en 100',
          done: s3,
          content: (
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

                  {/* La seconde découpe vient d'avoir lieu : la case et la
                      ligne sont visibles, on peut les nommer. */}
                  <KnowledgeBrick
                    id="centieme"
                    variant="new"
                    lead="Chacune des 100 petites cases que tu vois maintenant porte un nom."
                  />

                  <TapQuestion
                    prompt={Q_CENTIEMES.q}
                    options={Q_CENTIEMES.options}
                    correct={Q_CENTIEMES.correct}
                    cols={2}
                    requires={['centieme', 'dixieme']}
                    explain={Q_CENTIEMES.explain}
                    solved={qCent}
                    onAnswered={() => setQCent(true)}
                  />
                </motion.div>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Colorie 37 centièmes',
          subtitle: 'Puis observe combien de lignes complètes tu as formées.',
          done: s4,
          content: (kit) => (
            <div className="space-y-4">
              <ShadeWorkshop
                parts={100}
                target={37}
                tone="violet"
                solved={shade37}
                onSolved={() => setShade37(true)}
                react={kit.react}
                helper="Vise 37 petites cases : 3 lignes complètes, puis 7 cases de plus."
              />

              {shade37 && (
                <TapQuestion
                  prompt={Q_DECOMP.q}
                  options={Q_DECOMP.options}
                  correct={Q_DECOMP.correct}
                  cols={2}
                  requires={['dixieme', 'centieme']}
                  explain={Q_DECOMP.explain}
                  solved={qDec}
                  onAnswered={() => setQDec(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Tu sais découper l'unité et nommer les parts. Au module
          suivant, tu écris ces quantités sous forme de fraction.
        </KnowledgeSnapshot>
      }
    />
  );
}
