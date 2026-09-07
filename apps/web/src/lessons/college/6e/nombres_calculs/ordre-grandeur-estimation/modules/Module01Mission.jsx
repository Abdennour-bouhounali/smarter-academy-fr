import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EstimationScale, { bandOf } from '../components/EstimationScale';
import { formatFr, calcText } from '../components/estimationUtils';

/**
 * Module 1 — LABORATOIRE : « Juger sans calculer ».
 *
 * Activity: poser soi-même un curseur sur une échelle pour dire « à peu près
 *   combien », PUIS découvrir le résultat exact et voir l'écart apparaître.
 * Mathematical objective: l'ordre de grandeur d'un résultat suffit à juger une
 *   réponse — et il s'obtient sans poser le calcul.
 * Student action: on empoigne le curseur de la règle et on le fait glisser ;
 *   la bande d'ordre de grandeur s'allume sous lui immédiatement.
 * Mathematical state: UNE estimation ; position, bande, lecture chiffrée et
 *   écart en dérivent tous (§28).
 * Expected observation (l'« aha ») : l'élève peut se tromper de 40 et rester
 *   dans la bonne bande, et se tromper de 600 et en changer. Ce n'est pas la
 *   distance en unités qui décide, c'est la BANDE.
 * Controlled surprise: 398 + 205 et 640 − 40 sont deux calculs sans rapport
 *   qui atterrissent au même endroit de l'échelle. Deux nombres très
 *   différents peuvent avoir le même ordre de grandeur.
 * Misconception targeted: « il faut calculer pour savoir si un résultat est
 *   possible » — et son revers, « une estimation à 40 près est ratée ».
 * Feedback: l'écart dessiné sur l'échelle ; le texte ne fait que le lire.
 * Formalization: la brique « ordre-de-grandeur » est posée à l'étape 2, après
 *   que l'élève a jugé 1 203 sans reposer l'addition.
 * Scaffolding: le curseur ne se fige jamais, même après la révélation — c'est
 *   en le redéplaçant qu'on éprouve ce qui change de bande (règle projet).
 * Transfer: la même échelle revient sur la somme (M4), la différence (M5) et
 *   le produit (M6).
 *
 * L'ancienne version était TROIS questions à choix successives : « que penses-tu
 * de ce résultat ? », « par quel nombre ami remplacer 398 ? », « que peux-tu
 * conclure ? ». L'élève lisait un énoncé et cliquait une réponse déjà écrite ;
 * il ne posait aucune estimation, et l'écart — le cœur de la leçon — n'était
 * jamais visible. Le curseur remplace la lecture par le jugement.
 */

const CALC = { a: 398, b: 205, op: '+', wrong: 1203, exact: 603 };
/* Le second calcul : même bande, chemin totalement différent. C'est la
   surprise contrôlée du module. */
const CALC2 = { a: 640, b: 40, op: '−', exact: 600 };

/* ─── Étape 1 : poser une estimation, puis découvrir l'exact ─────── */
function JugerLab({ onReveal, revealed }) {
  const [value, setValue] = useState(150);
  const [seen, setSeen] = useState(false);

  const band = bandOf(value);
  const exactBand = bandOf(CALC.exact);
  const same = band.index === exactBand.index;

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Sans poser l'addition, fais glisser le curseur là où tu penses que{' '}
        <strong className="font-mono">{calcText(CALC.a, CALC.b, CALC.op)}</strong> doit tomber.
      </p>

      <EstimationScale
        value={value}
        onChange={(v) => { setValue(v); setSeen(true); }}
        exact={CALC.exact}
        revealed={revealed}
        ariaLabel={`Ton estimation de ${CALC.a} plus ${CALC.b}`}
      />

      {!revealed && (
        <div className="text-center">
          <ValidateButton onClick={onReveal} disabled={!seen} tone="indigo">
            Découvrir le résultat exact →
          </ValidateButton>
        </div>
      )}

      {revealed && (
        <Feedback tone={same ? 'ok' : 'info'}>
          {same ? (
            <>
              Ton curseur et le résultat exact sont dans la <strong>même bande</strong> —{' '}
              {band.label}. Il te reste peut-être {formatFr(Math.abs(Math.round(value) - CALC.exact))} d'écart, et
              ce n'est <em>pas grave</em> : tu savais déjà de quelle taille était le résultat.
            </>
          ) : (
            <>
              Ton curseur est dans « {band.label} », le résultat exact dans « {exactBand.label} » : tu as changé
              de bande. Reprends le curseur — il reste vivant — et vois combien tu peux te tromper sans quitter
              la bonne bande.
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 2 : le verdict sur 1 203, rendu sans calcul ──────────── */
const VERDICT_Q = {
  q: 'Un élève annonce 1 203 pour ce calcul. Sur ton échelle, où tomberait 1 203 ?',
  options: [
    'Dans la même bande que le résultat exact : son résultat est plausible',
    'Dans la bande au-dessus : son résultat est impossible pour cette addition',
    'Impossible à dire sans reposer l’addition',
  ],
  correct: 1,
  explain:
    "1 203 est dans les milliers ; 603 est dans les centaines. Une bande d'écart pour une simple addition de deux nombres à trois chiffres : c'est impossible. Tu viens de rejeter un résultat SANS reposer le calcul.",
  explainWrong:
    "Regarde ton échelle : le repère vert (603) est dans « des centaines ». 1 203 dépasse 1 000 — il se poserait dans la bande suivante.",
};

/* ─── Étape 3 : la surprise — deux calculs, une bande ────────────── */
function MemeBandeLab({ done, onDone }) {
  const [value, setValue] = useState(200);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Autre calcul, aucun rapport avec le premier :{' '}
        <strong className="font-mono">{calcText(CALC2.a, CALC2.b, CALC2.op)}</strong>. Pose ton estimation.
      </p>

      <EstimationScale
        value={value}
        onChange={setValue}
        exact={CALC2.exact}
        revealed={revealed}
        ariaLabel={`Ton estimation de ${CALC2.a} moins ${CALC2.b}`}
      />

      {!revealed && (
        <div className="text-center">
          <ValidateButton onClick={() => { setRevealed(true); onDone?.(); }} tone="indigo">
            Découvrir le résultat exact →
          </ValidateButton>
        </div>
      )}

      {revealed && (
        <Feedback tone="ok">
          <strong className="font-mono">640 − 40 = 600</strong> et{' '}
          <strong className="font-mono">398 + 205 = 603</strong> : une soustraction et une addition, des
          nombres sans rapport — et pourtant les deux repères tombent presque au même endroit, dans la même
          bande. Deux calculs très différents peuvent avoir la même taille de résultat.
        </Feedback>
      )}
    </div>
  );
}

export default function Module01Mission() {
  const [pred, setPred] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [verdictDone, setVerdictDone] = useState(false);
  const [surpriseDone, setSurpriseDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Mission : Le résultat impossible"
      moduleSubtitle="398 + 205 = 1 203 ? Pose ton curseur avant de calculer, et regarde l’écart apparaître."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Un camarade vient de terminer un calcul.',
        body: (
          <>
            <div className="bg-white/10 rounded-xl p-4 text-center font-mono text-2xl font-bold text-white mt-2">
              {calcText(CALC.a, CALC.b, CALC.op)} = {formatFr(CALC.wrong)}
            </div>
            <p className="pt-2">
              Avant de vérifier quoi que ce soit :{' '}
              <strong className="text-white">où ce résultat devrait-il tomber ?</strong> Attrape le curseur.
            </p>
          </>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Pose ton estimation, puis regarde',
          subtitle: 'Le curseur se glisse ; rien à calculer.',
          done: revealed,
          content: (kit) => (
            <div className="space-y-4">
              <PredictionChips
                prompt="à ton avis, faut-il calculer pour savoir si 1 203 est possible ?"
                options={[
                  { id: 'oui', label: 'Oui, il faut calculer' },
                  { id: 'non', label: 'Non, on peut le voir' },
                  { id: 'sais-pas', label: 'Je ne sais pas' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={revealed}
              />
              <JugerLab
                revealed={revealed}
                onReveal={() => { setRevealed(true); kit.react?.(true); }}
              />
              {revealed && (
                <Feedback tone="ok">
                  {pred === 'non' ? 'Ta prédiction tenait : ' : pred ? 'Ta prédiction disait le contraire : ' : ''}
                  tu as placé un repère sans poser une seule opération, et ce repère suffit déjà à écarter des
                  réponses absurdes.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Ton verdict sur 1 203',
          done: verdictDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt={VERDICT_Q.q}
                requires={[]}
                options={VERDICT_Q.options}
                correct={VERDICT_Q.correct}
                cols={1}
                explain={VERDICT_Q.explain}
                explainWrong={VERDICT_Q.explainWrong}
                solved={verdictDone}
                onAnswered={() => setVerdictDone(true)}
              />
              {/* La notion est nommée après que l'élève s'en est servi :
                  il vient de rejeter un résultat sans le recalculer. */}
              {verdictDone && (
                <KnowledgeBrick
                  id="ordre-de-grandeur"
                  variant="new"
                  lead="Tu viens de juger un résultat sans reposer l’addition. Voici ce que tu as utilisé."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Deux calculs, une même bande',
          subtitle: 'Recommence sur un calcul qui n’a rien à voir avec le premier.',
          done: surpriseDone,
          content: (
            <MemeBandeLab done={surpriseDone} onDone={() => setSurpriseDone(true)} />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Le réflexe est là. On va maintenant le rendre fiable, en
          apprenant à choisir les nombres qui remplacent les vrais.
        </KnowledgeSnapshot>
      }
    />
  );
}
