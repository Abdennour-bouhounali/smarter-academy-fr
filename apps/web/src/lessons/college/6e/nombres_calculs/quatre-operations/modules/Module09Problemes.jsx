import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 9 V2 — reconstruit sur le lesson kit. Les QCM à un choix
 * ('operation'/'choice') passent en TapQuestion, les calculs libres
 * ('calc') en NumericQuestion. Le tri « données utiles » ('check' — un
 * sous-ensemble de taille variable parmi N items) n'a pas d'équivalent
 * direct dans BatchChoiceQuestion (dont chaque ligne choisit UNE option
 * parmi un petit jeu fixe, pas un sous-ensemble libre) : conformément à la
 * politique §6 « Set-selection de taille inconnue → garder un bouton de
 * validation unique », il reste un composant maison `UsefulDataCheck` qui
 * respecte le contrat formatif du kit (onAnswered inconditionnel au clic de
 * confirmation, correction toujours affichée pour CHAQUE item, aucune
 * boucle Réessayer).
 */

/* ─── Les 3 problèmes (contenu pédagogique préservé) ────────────── */
const PROBLEMS = [
  {
    id: 'p1',
    title: 'La classe de 6°A',
    difficulty: 1,
    color: 'emerald',
    situation: `La classe de 6°A compte 28 élèves. Pour une sortie scolaire, on dispose de 3 minibus pouvant transporter chacun 12 élèves.`,
    question: 'Y a-t-il assez de places pour tous les élèves ?',
    steps: [
      {
        label: 'Identifie les données utiles',
        type: 'check',
        options: ['28 élèves', '3 minibus', '12 places par minibus', 'une sortie scolaire'],
        correctIndices: [0, 1, 2],
        feedback: "3 données mathématiques : le nombre d'élèves, le nombre de minibus et les places par minibus.",
      },
      {
        label: 'Quelle opération te permet de calculer le nombre total de places ?',
        type: 'operation',
        options: ['+', '−', '×', '÷'],
        correctIndex: 2,
        explanation: '3 minibus × 12 places = total de places disponibles.',
      },
      {
        label: 'Calcule le nombre total de places',
        type: 'calc',
        expression: '3 × 12',
        expected: 36,
        hint: '3 × 12 = 3 × 10 + 3 × 2',
      },
      {
        label: 'Réponds à la question',
        type: 'choice',
        question: 'Y a-t-il assez de places (36) pour 28 élèves ?',
        options: ['Oui, il y a assez de places.', 'Non, il manque des places.'],
        correctIndex: 0,
        explanation: '36 > 28 → il y a assez de places (et même 8 places en plus).',
      },
    ],
  },
  {
    id: 'p2',
    title: 'Le goûter du club',
    difficulty: 2,
    color: 'blue',
    situation: `Pour le goûter du club, on achète 6 paquets de biscuits à 2,50 € chacun et 4 bouteilles d'eau à 0,75 € chacune. On paye avec un billet de 20 €.`,
    question: 'Combien rend-on en monnaie ?',
    steps: [
      {
        label: 'Quelle opération pour le coût des biscuits ?',
        type: 'operation',
        options: ['+', '−', '×', '÷'],
        correctIndex: 2,
        explanation: '6 paquets × 2,50 € = coût total des biscuits.',
      },
      {
        label: 'Coût des biscuits : 6 × 2,50',
        type: 'calc',
        expression: '6 × 2,50',
        expected: 15,
        displayExpected: '15,00',
        hint: '6 × 2 = 12, 6 × 0,5 = 3 → total 15.',
      },
      {
        label: 'Coût des bouteilles : 4 × 0,75',
        type: 'calc',
        expression: '4 × 0,75',
        expected: 3,
        displayExpected: '3,00',
        hint: '4 × 0,75 = 4 × (1 − 0,25) = 4 − 1 = 3.',
      },
      {
        label: 'Coût total : 15 + 3',
        type: 'calc',
        expression: '15 + 3',
        expected: 18,
        displayExpected: '18,00',
        hint: 'Addition simple.',
      },
      {
        label: 'Monnaie rendue : 20 − 18',
        type: 'calc',
        expression: '20 − 18',
        expected: 2,
        displayExpected: '2,00',
        hint: 'Soustraction : 20 − 18 = 2.',
      },
    ],
  },
  {
    id: 'p3',
    title: 'La bibliothèque',
    difficulty: 3,
    color: 'violet',
    situation: `La bibliothèque du collège possède 384 livres. On veut les ranger sur des étagères de 24 livres chacune. Il reste 7 livres sans place.`,
    question: "Combien y a-t-il d'étagères, et le bibliothécaire devra-t-il en ajouter une ?",
    steps: [
      {
        label: 'Quelle opération pour répondre ?',
        type: 'operation',
        options: ['+', '−', '×', '÷'],
        correctIndex: 3,
        explanation: 'On partage 384 livres en groupes de 24 → division.',
      },
      {
        label: 'Calcule : 384 ÷ 24',
        type: 'calc',
        expression: '384 ÷ 24',
        expected: 16,
        hint: '24 × 16 = 24 × 10 + 24 × 6 = 240 + 144 = 384.',
      },
      {
        label: 'Interprète le résultat',
        type: 'choice',
        question: "Le quotient est 16, le reste est 0. Mais l'énoncé dit qu'il reste 7 livres. Que conclure ?",
        options: [
          '16 étagères suffisent pour tous les livres.',
          'Il faut 17 étagères (16 pleines + 1 pour les 7 livres restants).',
          'Il faut 15 étagères.',
        ],
        correctIndex: 1,
        explanation: "384 ÷ 24 = 16 avec reste 0 : les 384 livres catalogués remplissent exactement 16 étagères. Mais l'énoncé précise qu'il reste encore 7 livres non catalogués dans ce calcul : ces 7 livres ont besoin d'une étagère supplémentaire. Il faut donc 16 + 1 = 17 étagères en tout.",
      },
    ],
  },
];

const colorMap = {
  emerald: { badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  blue: { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50' },
  violet: { badge: 'bg-violet-100 text-violet-700', border: 'border-violet-200', bg: 'bg-violet-50' },
};

/* ─── 'check' : tri de données utiles (sous-ensemble de taille libre) ──
 * Pas de Réessayer : un seul clic de confirmation révèle, pour CHAQUE
 * item, s'il était utile ou non (vert/rouge), puis le rappel pédagogique.
 * onAnswered() est appelé inconditionnellement à la confirmation. */
function UsefulDataCheck({ step, solved, onAnswered }) {
  const [checked, setChecked] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const done = confirmed || solved;

  const toggle = (i) => {
    if (done) return;
    setChecked((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  const confirm = () => {
    setConfirmed(true);
    onAnswered?.();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Sélectionne toutes les données utiles (plusieurs réponses possibles) :</p>
      <div className="space-y-2">
        {step.options.map((o, i) => {
          const isUseful = step.correctIndices.includes(i);
          const wasPicked = checked.includes(i);
          let cls = 'border-slate-200 text-slate-600 hover:border-slate-400';
          if (done) {
            cls = isUseful
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
              : wasPicked
              ? 'bg-rose-50 border-rose-400 text-rose-800'
              : 'border-slate-200 text-slate-400';
          } else if (wasPicked) {
            cls = 'bg-indigo-50 border-indigo-400 text-indigo-800';
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              disabled={done}
              aria-pressed={wasPicked}
              className={`w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm transition-all min-h-[44px] flex items-center justify-between gap-2 ${cls}`}
            >
              <span>{o}</span>
              {done && (isUseful ? <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" /> : wasPicked ? <XCircle className="w-4 h-4 shrink-0" aria-hidden="true" /> : null)}
            </button>
          );
        })}
      </div>

      {!done && (
        <ValidateButton onClick={confirm} disabled={checked.length === 0}>
          Valider →
        </ValidateButton>
      )}

      {done && (
        <Feedback tone="ok">{step.feedback}</Feedback>
      )}
    </div>
  );
}

/* ─── 'operation' / 'choice' : QCM à un choix → TapQuestion ─────── */
function SingleChoiceStep({ step, solved, onAnswered }) {
  return (
    <div className="space-y-2">
      {step.question && <p className="text-sm text-slate-700">{step.question}</p>}
      <TapQuestion
        requires={['quatre-situations', 'demarche-probleme']}
        options={step.options}
        correct={step.correctIndex}
        cols={step.type === 'operation' ? 4 : 1}
        explain={step.explanation}
        solved={solved}
        onAnswered={() => onAnswered?.()}
      />
    </div>
  );
}

/* ─── 'calc' : saisie numérique libre → NumericQuestion ──────────── */
function CalcStep({ step, solved, onAnswered }) {
  return (
    <NumericQuestion
      requires={['choisir-outil']}
      prefix={`${step.expression} =`}
      expected={step.expected}
      display={step.displayExpected ?? String(step.expected)}
      explainFor={() => step.hint}
      explain={step.hint}
      width="w-28"
      solved={solved}
      onAnswered={() => onAnswered?.()}
    />
  );
}

/* ─── Une étape de problème (dispatch par type) ──────────────────── */
function ProblemStep({ step, solved, onAnswered }) {
  return (
    <div className={`border rounded-2xl p-4 space-y-3 ${solved ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}>
      <div className="text-xs font-mono font-bold text-indigo-600 uppercase">{step.label}</div>
      {step.type === 'check' && <UsefulDataCheck step={step} solved={solved} onAnswered={onAnswered} />}
      {(step.type === 'operation' || step.type === 'choice') && (
        <SingleChoiceStep step={step} solved={solved} onAnswered={onAnswered} />
      )}
      {step.type === 'calc' && <CalcStep step={step} solved={solved} onAnswered={onAnswered} />}
    </div>
  );
}

/* ─── Un problème complet : ses étapes se dévoilent en séquence ─── */
function ProblemBlock({ prob, stepsDone, onStepAnswered }) {
  const c = colorMap[prob.color];
  const allStepsDone = stepsDone.length >= prob.steps.length;

  return (
    <div className={`border-2 rounded-2xl p-5 space-y-4 ${allStepsDone ? `${c.border} ${c.bg}` : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start gap-3">
        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full shrink-0 ${c.badge}`}>
          Niveau {'★'.repeat(prob.difficulty)}
        </span>
        <div>
          <div className="font-space font-bold text-slate-800">{prob.title}</div>
        </div>
        {allStepsDone && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto shrink-0" aria-hidden="true" />}
      </div>

      <div className={`border rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed ${c.border} ${c.bg}`}>
        <div className="font-bold text-slate-500 text-xs font-mono mb-1">SITUATION</div>
        {prob.situation}
      </div>
      <div className="text-sm font-bold text-slate-800">❓ {prob.question}</div>

      <div className="space-y-3">
        {prob.steps.map((step, si) =>
          si === 0 || stepsDone.includes(si - 1) ? (
            <ProblemStep
              key={si}
              step={step}
              solved={stepsDone.includes(si)}
              onAnswered={() => onStepAnswered(si)}
            />
          ) : null
        )}
      </div>
    </div>
  );
}

/* ─── Module principal ────────────────────────────────────────── */
export default function Module09Problemes() {
  const [doneSteps, setDoneSteps] = useState({ p1: [], p2: [], p3: [] });

  const markStep = (probId, si) => {
    setDoneSteps((prev) => {
      const cur = prev[probId];
      if (cur.includes(si)) return prev;
      return { ...prev, [probId]: [...cur, si] };
    });
  };

  const isProblemDone = (prob) => doneSteps[prob.id].length >= prob.steps.length;
  const s1 = isProblemDone(PROBLEMS[0]);
  const s2 = isProblemDone(PROBLEMS[1]);
  const s3 = isProblemDone(PROBLEMS[2]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(9)}
      moduleNumber={9}
      moduleTitle="Résoudre des problèmes"
      moduleSubtitle="Comprendre → Identifier → Choisir → Calculer → Vérifier → Répondre"
      estimatedTime="6 min"
      intro={
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-2">
          <div className="font-bold text-indigo-800">🧩 Trois problèmes, de plus en plus longs</div>
          <p className="text-sm text-indigo-700">
            Personne ne te dira quelle opération employer : c'est la situation qui décide. Prends
            le temps de la relire avant de toucher au moindre nombre.
          </p>
        </div>
      }
      steps={[
        {
          num: 1,
          title: PROBLEMS[0].title,
          subtitle: `Niveau ${'★'.repeat(PROBLEMS[0].difficulty)}`,
          done: s1,
          content: (
            <div className="space-y-5">
              <ProblemBlock
                prob={PROBLEMS[0]}
                stepsDone={doneSteps.p1}
                onStepAnswered={(si) => markStep('p1', si)}
              />
              {/* La démarche est nommée une fois qu'elle a été parcourue en
                  entier — trier, choisir, calculer, répondre. */}
              {s1 && (
                <KnowledgeBrick
                  id="demarche-probleme"
                  variant="new"
                  lead="Les quatre gestes que tu viens d'enchaîner sur les minibus, dans cet ordre."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: PROBLEMS[1].title,
          subtitle: `Niveau ${'★'.repeat(PROBLEMS[1].difficulty)}`,
          done: s2,
          content: (
            <ProblemBlock
              prob={PROBLEMS[1]}
              stepsDone={doneSteps.p2}
              onStepAnswered={(si) => markStep('p2', si)}
            />
          ),
        },
        {
          num: 3,
          title: PROBLEMS[2].title,
          subtitle: `Niveau ${'★'.repeat(PROBLEMS[2].difficulty)}`,
          done: s3,
          content: (
            <ProblemBlock
              prob={PROBLEMS[2]}
              stepsDone={doneSteps.p3}
              onStepAnswered={(si) => markStep('p3', si)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={9}>
          <strong>La suite.</strong> Ta carte est complète. Le défi final ne te demandera rien
          d'autre que ce qui s'y trouve — mais sans te dire quoi utiliser.
        </KnowledgeSnapshot>
      }
    />
  );
}
