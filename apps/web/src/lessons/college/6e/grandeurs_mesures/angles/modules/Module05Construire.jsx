import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Protractor from '../components/Protractor';
import { classLabel, formatDeg } from '../components/angleUtils';

/**
 * Module 5 — formalisation : construire un angle donné.
 *
 * La méthode se formalise (les quatre temps dans l'ordre), puis
 * s'exécute : l'élève marque la graduation voulue sur le rapporteur en
 * mode `place` — avec les deux échelles affichées, donc le réflexe du
 * Module 4 est immédiatement re-testé.
 */
const METHODE_Q = {
  q: 'Pour construire un angle de 70°, dans quel ordre faut-il procéder ?',
  options: [
    '1. Tracer une demi-droite · 2. Centre du rapporteur sur l’origine · 3. Zéro sur la demi-droite · 4. Marquer 70° puis tracer le second côté',
    '1. Marquer 70° · 2. Tracer une demi-droite · 3. Poser le rapporteur · 4. Relier',
    '1. Poser le rapporteur n’importe où · 2. Marquer 70° · 3. Tracer les deux côtés',
  ],
  correct: 0,
  explain:
    'On part TOUJOURS d’un côté déjà tracé : demi-droite, puis centre sur son origine, zéro aligné dessus, et seulement alors on marque la graduation et on trace le second côté.',
};

function BuildRound({ react, target, zeroSide, intro, solved, onSolved }) {
  const [marked, setMarked] = useState(solved ? target : null);
  const done = solved || marked !== null;
  const isRight = marked === target;

  const handlePlace = (value) => {
    if (done) return;
    setMarked(value);
    react(value === target);
    onSolved?.();
  };

  return (
    <div className="space-y-3">
      {intro && <p className="text-sm text-slate-600">{intro}</p>}
      <Protractor
        angleDeg={target}
        mode="place"
        zeroSide={zeroSide}
        onReadTick={handlePlace}
        selectedValue={marked}
        placedTick={done && isRight ? (zeroSide === 'right' ? target : 180 - target) : null}
        traceRevealed={done && isRight}
        disabled={done}
        ariaLabel={`Construire un angle de ${target} degrés`}
      />
      {done && (
        <Feedback tone={isRight ? 'ok' : 'ko'}>
          {isRight ? (
            <>
              Construit ! Le second côté passe par la graduation <strong>{formatDeg(target)}</strong>. Vérification
              finale : {formatDeg(target)} {target < 90 ? '< 90°' : '> 90°'}, l'angle obtenu est bien{' '}
              {classLabel(target)} ✓.
            </>
          ) : (
            <>
              Tu as marqué {formatDeg(marked)} : c'est l'autre graduation. Pour un angle {classLabel(target)}, la
              marque doit être sur <strong>{formatDeg(target)}</strong> — celle qui part du zéro posé sur ta
              demi-droite.
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

export default function Module05Construire() {
  const [methodeDone, setMethodeDone] = useState(false);
  const [build1Done, setBuild1Done] = useState(false);
  const [build2Done, setBuild2Done] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Construire un angle"
      moduleSubtitle="La méthode en quatre temps, du trait de base au second côté."
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'Savoir mesurer, c’est bien. Savoir construire, c’est mieux.',
        body: <p>Le même outil, le même rituel — mais cette fois c'est toi qui décides de la mesure.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'La méthode en quatre temps',
          done: methodeDone,
          content: (
            <TapQuestion
              prompt={METHODE_Q.q}
              options={METHODE_Q.options}
              correct={METHODE_Q.correct}
              cols={1}
              explain={METHODE_Q.explain}
              solved={methodeDone}
              onAnswered={() => setMethodeDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Construis 70°',
          done: build1Done,
          content: (kit) => (
            <BuildRound
              react={kit.react}
              target={70}
              zeroSide="right"
              intro="La demi-droite de base est tracée et le rapporteur est en place. Marque la graduation qui donnera un angle de 70°."
              solved={build1Done}
              onSolved={() => setBuild1Done(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Construis 140° (zéro à gauche)',
          done: build2Done,
          content: (kit) => (
            <div className="space-y-4">
              <BuildRound
                react={kit.react}
                target={140}
                zeroSide="left"
                intro="Cette fois le zéro est à gauche, et l'angle demandé est OBTUS. Classe d'abord, puis marque."
                solved={build2Done}
                onSolved={() => setBuild2Done(true)}
              />
              {build2Done && (
                <Feedback tone="info">
                  Le réflexe complet : <strong>classer → mesurer (ou marquer) → vérifier</strong>. Un angle obtus
                  doit toujours donner une mesure supérieure à 90°.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <PenTool className="w-6 h-6 mx-auto text-amber-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Demi-droite → centre sur l'origine → zéro sur le côté → marquer la graduation → tracer. Et toujours
            vérifier la classe de l'angle obtenu.
          </p>
        </motion.div>
      }
    />
  );
}
