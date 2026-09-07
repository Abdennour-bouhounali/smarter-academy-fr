import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
  const [lastMark, setLastMark] = useState(null);

  /* La construction reste ouverte après la réponse (règle projet du
     2026-09-06) : `marked` garde la PREMIÈRE marque — celle que juge le
     verdict — et `lastMark` suit les suivantes, pour que l'élève puisse
     poser l'autre graduation et voir de ses yeux qu'elle donne un angle
     visiblement différent. */
  const handlePlace = (value) => {
    setLastMark(value);
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
        selectedValue={lastMark ?? marked}
        placedTick={(() => {
          // La trace suit la DERNIÈRE marque posée : construire l'autre
          // graduation doit dessiner l'autre angle, sinon le geste ne montre
          // rien. La position est convertie dans le repère du rapporteur.
          const v = lastMark ?? (done && isRight ? target : null);
          if (v === null) return null;
          return zeroSide === 'right' ? v : 180 - v;
        })()}
        traceRevealed={lastMark !== null || (done && isRight)}
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
            <div className="space-y-5">
              {/* L'élève RECONSTITUE l'ordre à partir du rituel de mesure
                  déjà acquis au module 3 : rien de neuf n'est demandé. */}
              <TapQuestion
                prompt={METHODE_Q.q}
                options={METHODE_Q.options}
                correct={METHODE_Q.correct}
                cols={1}
                explain={METHODE_Q.explain}
                requires={['rapporteur', 'rituel-placement', 'demi-droite']}
                solved={methodeDone}
                onAnswered={() => setMethodeDone(true)}
              />
              {methodeDone && (
                <KnowledgeBrick
                  id="construire-angle"
                  variant="new"
                  lead="Tu viens de remettre les quatre temps dans l’ordre. Les voici fixés sur ta carte."
                />
              )}
            </div>
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
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Mesurer et construire sont acquis. Le module suivant les
          emmène sur le terrain — et referme le piège du tout premier module.
        </KnowledgeSnapshot>
      }
    />
  );
}
