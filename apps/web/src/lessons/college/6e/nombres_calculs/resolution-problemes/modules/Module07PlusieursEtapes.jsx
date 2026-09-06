import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import CalcChain from '../../../../../common/components/CalcChain';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 7 — practice lab, reconstruit sur le lesson kit.
 *
 * Construire une chaîne de calcul : chaque résultat intermédiaire doit être
 * NOMMÉ, pas seulement trouvé. Corrige un bug de la version précédente : une
 * réponse fausse aux étapes intermédiaires n'affichait aucun retour — ici,
 * NumericQuestion explique systématiquement.
 */

/* ─── Étape 1 : construire la chaîne, guidé ──────────────────────── */
function ChaineGuidee({ solved, onSolved }) {
  const [step1Ok, setStep1Ok] = useState(false);
  const [nameOk, setNameOk] = useState(false);
  const [step2Ok, setStep2Ok] = useState(false);

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
        Une école achète 8 boîtes de crayons. Chaque boîte contient 24 crayons. L'école distribue ensuite 35
        crayons. Combien de crayons reste-t-il ?
      </p>

      <NumericQuestion
        prompt="Première chose à trouver : combien de crayons ont été achetés en tout ?"
        requires={['structures-de-problemes']}
        expected={192}
        explain="8 × 24 = 192 crayons achetés."
        explainFor={() => 'Multiplie le nombre de boîtes par le nombre de crayons par boîte.'}
        solved={step1Ok || solved}
        onAnswered={() => setStep1Ok(true)}
      />

      {(step1Ok || solved) && (
        <div className="border-t border-slate-100 pt-4">
          <TapQuestion
            prompt="Que représente ce nombre, 192 ?"
            requires={['structures-de-problemes']}
            options={['Le nombre total de crayons achetés', 'Le nombre de crayons distribués', 'Le nombre de boîtes']}
            correct={0}
            cols={1}
            explain="192 est un résultat INTERMÉDIAIRE : le nombre total de crayons achetés — pas encore la réponse finale."
            solved={nameOk || solved}
            onAnswered={() => setNameOk(true)}
          />
        </div>
      )}

      {(nameOk || solved) && (
        <div className="border-t border-slate-100 pt-4">
          <NumericQuestion
            prompt="Maintenant, utilise ce résultat : combien de crayons reste-t-il après la distribution ?"
            requires={['structures-de-problemes']}
            expected={157}
            explain="192 − 35 = 157 crayons restants."
            explainFor={() => 'Retire les 35 crayons distribués du total acheté (192).'}
            solved={step2Ok || solved}
            onAnswered={() => {
              setStep2Ok(true);
              onSolved?.();
            }}
          />
        </div>
      )}

      {(step2Ok || solved) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
          <CalcChain
            steps={[
              { label: 'Crayons achetés', expr: '8 boîtes × 24 crayons', value: '192 crayons' },
              { label: 'Crayons restants', expr: '192 − 35 distribués', value: '157 crayons' },
            ]}
          />
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 2 : deuxième problème, plus autonome ─────────────────── */
function ChaineAutonome({ solved, onSolved }) {
  const [step1Ok, setStep1Ok] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
        Une salle de cinéma a 12 rangées de 15 sièges. Lors d'une séance, 138 sièges sont occupés. Combien de
        sièges restent libres ?
      </p>
      <p className="text-xs text-slate-500">Trouve d'abord un résultat intermédiaire, puis la réponse finale — sans aide cette fois.</p>

      <NumericQuestion
        requires={['resultat-intermediaire']}
        expected={180}
        explain="12 × 15 = 180 sièges au total."
        explainFor={() => 'Multiplie le nombre de rangées par le nombre de sièges par rangée.'}
        solved={step1Ok || solved}
        onAnswered={() => setStep1Ok(true)}
      />

      {(step1Ok || solved) && (
        <div className="border-t border-slate-100 pt-4">
          <NumericQuestion
            requires={['resultat-intermediaire']}
            expected={42}
            explain="180 − 138 = 42 sièges libres."
            explainFor={() => 'Retire les 138 sièges occupés du total (180).'}
            solved={solved}
            onAnswered={() => onSolved?.()}
          />
        </div>
      )}

      {solved && (
        <CalcChain steps={[
          { label: 'Sièges au total', expr: '12 rangées × 15 sièges', value: '180 sièges' },
          { label: 'Sièges libres', expr: '180 − 138 occupés', value: '42 sièges' },
        ]} />
      )}
    </div>
  );
}

/* ─── Étape 3 : remettre les étapes dans l'ordre ─────────────────── */
const ORDER_STEPS = [
  { id: 'a', text: 'Comprendre : on cherche combien de billets restent à vendre.' },
  { id: 'b', text: 'Calculer le nombre total de places : 15 rangées × 20 places = 300.' },
  { id: 'c', text: 'Calculer les places restantes : 300 − 214 vendues = 86.' },
  { id: 'd', text: 'Répondre : il reste 86 billets à vendre.' },
];
const CORRECT_ORDER = ['a', 'b', 'c', 'd'];

function RemettreOrdre({ react, solved, onSolved }) {
  const [built, setBuilt] = useState([]);
  const [checked, setChecked] = useState(false);

  const pool = ORDER_STEPS.filter((s) => !built.includes(s.id));
  const isRight = CORRECT_ORDER.every((id, i) => built[i] === id) && built.length === CORRECT_ORDER.length;

  const add = (id) => {
    if (solved) return;
    setChecked(false);
    setBuilt((prev) => [...prev, id]);
  };
  const remove = (id) => {
    if (solved) return;
    setChecked(false);
    setBuilt((prev) => prev.filter((x) => x !== id));
  };

  const check = () => {
    setChecked(true);
    react(isRight);
    onSolved?.();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Voici les étapes (mélangées) de la résolution d'un problème sur la vente de billets. Reconstitue l'ordre
        logique en les touchant une par une.
      </p>

      {!solved && pool.length > 0 && (
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Étapes disponibles</div>
          <div className="flex flex-col gap-2">
            {pool.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => add(s.id)}
                className="text-left px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-sm text-slate-700 hover:border-blue-400 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Ton ordre</div>
        <div className="space-y-1.5 min-h-[60px] p-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
          {built.length === 0 && !solved && <p className="text-xs text-slate-400 italic px-2">Touche une étape ci-dessus pour commencer.</p>}
          {(solved ? CORRECT_ORDER : built).map((id, i) => {
            const s = ORDER_STEPS.find((x) => x.id === id);
            const isBad = checked && !solved && id !== CORRECT_ORDER[i];
            return (
              <button
                key={id}
                type="button"
                onClick={() => remove(id)}
                disabled={solved}
                className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm ${
                  solved ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : isBad ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                <span className="font-mono font-bold text-xs text-slate-400">{i + 1}.</span>
                {s.text}
              </button>
            );
          })}
        </div>
      </div>

      {checked && !isRight && !solved && (
        <Feedback tone="ko">
          Cet ordre n'est pas encore le bon : Comprendre → Calculer l'intermédiaire → Calculer le final →
          Répondre. Retire une étape et replace-la.
        </Feedback>
      )}

      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={check} disabled={built.length !== ORDER_STEPS.length}>Vérifier mon ordre</ValidateButton>
        </div>
      )}

      {solved && <Feedback tone="ok">Comprendre → Calculer l'intermédiaire → Calculer le final → Répondre : c'est toujours cet enchaînement.</Feedback>}
    </div>
  );
}

export default function Module07PlusieursEtapes() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Problèmes à plusieurs étapes"
      moduleSubtitle="Construire une chaîne de calcul, étape par étape — chaque résultat intermédiaire doit être nommé."
      estimatedTime="9 min"
      brief={{
        tag: '🔗 Chaîne',
        title: 'Une situation qui évolue en plusieurs temps.',
        body: (
          <p>
            Un résultat intermédiaire n'est pas la réponse finale — mais sans lui, impossible d'avancer. Chaque
            étape doit être comprise, pas seulement calculée.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Construis la chaîne, étape par étape',
          done: s1,
          content: (
            <div className="space-y-5">
              <ChaineGuidee solved={s1} onSolved={() => setS1(true)} />
              {/* Le 192 vient d'être trouvé, nommé, puis utilisé : c'est
                  exactement l'instant où le mot prend son sens. */}
              {s1 && (
                <KnowledgeBrick
                  id="resultat-intermediaire"
                  variant="new"
                  lead="Le 192 que tu as dû trouver — et qui n'était pas la réponse."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'À toi, plus autonome',
          done: s2,
          content: <ChaineAutonome solved={s2} onSolved={() => setS2(true)} />,
        },
        {
          num: 3,
          title: 'Remets les étapes dans l\'ordre',
          done: s3,
          content: (kit) => (
            <div className="space-y-5">
              <RemettreOrdre react={kit.react} solved={s3} onSolved={() => setS3(true)} />
              {s3 && (
                <KnowledgeBrick
                  id="chaine-de-calcul"
                  variant="new"
                  lead="L'ordre que tu viens de reconstituer, maillon par maillon."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>La suite.</strong> Une chaîne de calcul peut dérailler sans qu'on s'en aperçoive.
          On va apprendre à s'en rendre compte tout seul.
        </KnowledgeSnapshot>
      }
    />
  );
}
