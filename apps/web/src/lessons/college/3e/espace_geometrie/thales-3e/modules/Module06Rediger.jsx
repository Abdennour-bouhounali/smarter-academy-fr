import React, { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProofStrip from '../components/ProofStrip';
import { PROOF_TEMPLATES, checkProof } from '../components/thalesUtils';

/**
 * Module 6 — FORMALISATION : rédiger, dans les deux sens.
 *
 * Activity              assembler deux démonstrations : le théorème direct
 *                       (calculer) puis la réciproque (démontrer).
 * Mathematical objective savoir lequel des deux énoncés invoquer, et ne jamais
 *                       supposer ce qu'on cherche à établir.
 * Misconception ciblée   « d'après la réciproque » dans un calcul, et
 *                       « d'après le théorème de Thalès » dans une
 *                       démonstration de parallélisme. Les deux sont des
 *                       distracteurs explicites.
 * Escape hatch          après 3 essais, la rédaction est révélée et validée.
 */
function ProofExercise({ templateKey, kitReact, onDone, done }) {
  const tpl = PROOF_TEMPLATES[templateKey];
  const [chosen, setChosen] = useState([]);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const result = checkProof(chosen, templateKey);
  const complete = chosen.length === tpl.correct.length;

  const pick = (id) => {
    const next = [...chosen, id];
    setChosen(next);
    if (next.length === tpl.correct.length) {
      setTries((t) => t + 1);
      const r = checkProof(next, templateKey);
      kitReact(r.ok);
      if (r.ok) onDone();
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
        <p className="text-xs font-semibold text-slate-500 mb-1">{tpl.titre}</p>
        <p className="text-sm text-slate-800">{tpl.enonce}</p>
      </div>
      <ProofStrip
        steps={tpl.steps}
        chosen={chosen}
        onPick={pick}
        onUndo={() => setChosen((c) => c.slice(0, -1))}
        firstWrong={complete && !result.ok ? result.firstWrong : -1}
        locked={done}
        revealed={done}
      />
      {complete && !result.ok && !done && (
        <div className="space-y-2">
          <Feedback tone="ko">
            Le raisonnement dévie à la ligne {result.firstWrong + 1}.
          </Feedback>
          <button type="button" onClick={() => setChosen([])}
            className="text-sm px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 min-h-[44px]">
            Recommencer la rédaction
          </button>
        </div>
      )}
      {tries >= 3 && !done && (
        <button
          type="button"
          onClick={() => { setChosen(tpl.correct); setRevealed(true); onDone(); }}
          className="text-sm px-4 py-2 rounded-lg bg-amber-100 hover:bg-amber-200
                     text-amber-900 font-semibold min-h-[44px]"
        >
          Je ne trouve pas — montre-moi
        </button>
      )}
      {done && (
        <Feedback tone="ok">
          {revealed
            ? 'Rédaction révélée. Retiens la charpente : les données, la propriété invoquée, puis la conclusion chiffrée.'
            : 'Rédaction correcte. Chaque ligne a son rôle, et l’énoncé invoqué correspond bien à ce qu’on cherche.'}
        </Feedback>
      )}
    </div>
  );
}

export default function Module06Rediger() {
  const [d1, setD1] = useState(false);
  const [d2, setD2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Rédiger un calcul',
      subtitle: 'Le parallélisme est donné : on cherche une longueur.',
      done: d1,
      content: (kit) => (
        <ProofExercise templateKey="direct" kitReact={kit.react} onDone={() => setD1(true)} done={d1} />
      ),
    },
    {
      num: 2,
      title: 'Rédiger une démonstration',
      subtitle: 'Cette fois, c’est le parallélisme qu’il faut établir.',
      done: d2,
      content: (kit) => (
        <ProofExercise templateKey="reciproque" kitReact={kit.react} onDone={() => setD2(true)} done={d2} />
      ),
    },
    {
      num: 3,
      title: 'Lequel invoquer ?',
      done: q3,
      content: (
        <TapQuestion
          prompt="On connaît les quatre longueurs AM, AB, AN, AC et on veut savoir si (MN) et (BC) sont parallèles. Que faut-il invoquer ?"
          options={[
            'La réciproque du théorème de Thalès',
            'Le théorème de Thalès',
            'La contraposée, puisque rien n’est parallèle au départ',
            'Le théorème de Pythagore',
          ]}
          correct={0}
          cols={1}
          explain="Le théorème direct PART du parallélisme ; ici on veut y arriver. C’est donc la réciproque. Si les rapports s’avéraient différents, on conclurait par la contraposée — mais on ne le sait qu’après avoir calculé."
          explainWrong="Le théorème direct suppose le parallélisme connu. L’utiliser ici reviendrait à supposer ce qu’on cherche justement à démontrer."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Rédiger"
      moduleSubtitle="Le bon énoncé au bon moment"
      estimatedTime="9 min"
      brief={{
        tag: 'Formalisation',
        title: 'Écrire proprement',
        tone: 'blue',
        body: (
          <p>
            En géométrie, le résultat ne suffit pas : ce qui compte, c’est la chaîne de raisonnement
            — et le fait d’invoquer <strong>le bon énoncé</strong>.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 space-y-2">
          <div className="flex gap-2 items-center">
            <ScrollText className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <p className="font-bold text-blue-900">Les trois énoncés</p>
          </div>
          <ul className="text-sm text-blue-900 space-y-1.5 list-disc pl-5">
            <li>
              <strong>Théorème</strong> — (MN) ∥ (BC) donné ⇒{' '}
              <MathText>{'$\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}$'}</MathText>. Sert à
              calculer.
            </li>
            <li>
              <strong>Réciproque</strong> — points alignés dans le même ordre et rapports égaux ⇒
              (MN) ∥ (BC). Sert à démontrer un parallélisme.
            </li>
            <li>
              <strong>Contraposée</strong> — rapports différents ⇒ (MN) et (BC) ne sont pas
              parallèles.
            </li>
          </ul>
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Le réflexe.</strong> Demande-toi toujours : le parallélisme est-il une{' '}
          <em>donnée</em> (alors c’est le théorème) ou la <em>question</em> (alors c’est la
          réciproque) ?
        </Feedback>
      }
    />
  );
}
