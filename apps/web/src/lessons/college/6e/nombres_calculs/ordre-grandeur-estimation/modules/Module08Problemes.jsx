import React, { useState } from 'react';
import { ShoppingCart, Bus } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EstimateInput from '../components/EstimateInput';

/**
 * Module 8 — practice lab, reconstruit sur le lesson kit.
 *
 * La démarche complète, deux fois : je comprends (choisir l'opération) →
 * j'estime (plage tolérante) → je calcule (valeur exacte) → je compare et
 * je décide. La complétion est dérivée des états des questions dans le
 * composant module — pas d'effet, pas de callback re-dérivé.
 */
const DEMARCHE = ['Je comprends', "J'estime", 'Je calcule', 'Je compare et décide'];

function DemarcheBanner({ current }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DEMARCHE.map((d, i) => (
        <span
          key={d}
          className={`text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-full transition-colors ${
            i < current ? 'bg-emerald-100 text-emerald-700' : i === current ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
          }`}
        >
          {i < current ? '✓ ' : `${i + 1}. `}
          {d}
        </span>
      ))}
    </div>
  );
}

function EtapeTag({ n }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-white font-mono text-[10px] font-bold mr-2 align-middle">
      ÉTAPE {n}
    </span>
  );
}

/**
 * Un problème en 4 temps. `flags` = [s1, s2, s3, s4] (répondu, pas « juste »),
 * `setFlag(i)` pose le drapeau i. Chaque temps n'apparaît qu'après le
 * précédent, mais une réponse fausse ne bloque jamais (politique du kit).
 */
function Probleme({ icone: Icone, enonce, etapes, flags, setFlag }) {
  const [s1, s2, s3, s4] = flags;
  const current = s1 ? (s2 ? (s3 ? 3 : 2) : 1) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 bg-white border-2 border-slate-200 rounded-2xl p-4">
        <Icone className="w-5 h-5 mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
        <p className="text-sm text-slate-700">{enonce}</p>
      </div>
      <DemarcheBanner current={s4 ? 4 : current} />

      <TapQuestion
        prompt={<><EtapeTag n={1} />{etapes.operation.q}</>}
        requires={['demarche-estimation']}
        options={etapes.operation.options}
        correct={etapes.operation.correct}
        cols={3}
        explain={etapes.operation.explain}
        solved={s1}
        onAnswered={() => setFlag(0)}
      />

      {s1 && (
        <div className="border-t border-slate-100 pt-4">
          <EstimateInput
            prompt={<><EtapeTag n={2} />Sans calculer exactement, estime le résultat.</>}
            acceptMin={etapes.estimation.min}
            acceptMax={etapes.estimation.max}
            exact={etapes.exact.answer}
            exactLabel={etapes.exact.label}
            hint={etapes.estimation.hint}
            solved={s2}
            onAnswered={() => setFlag(1)}
          />
        </div>
      )}

      {s2 && (
        <div className="border-t border-slate-100 pt-4">
          <NumericQuestion
            requires={['demarche-estimation']}
            prompt={<><EtapeTag n={3} />{etapes.exact.q}</>}
            suffix={etapes.exact.unit}
            expected={etapes.exact.answer}
            explain={etapes.exact.explain}
            solved={s3}
            onAnswered={() => setFlag(2)}
          />
        </div>
      )}

      {s3 && (
        <div className="border-t border-slate-100 pt-4">
          <TapQuestion
            prompt={<><EtapeTag n={4} />{etapes.verdict.q}</>}
            requires={['plausible-suspect-impossible']}
            options={etapes.verdict.options}
            correct={etapes.verdict.correct}
            cols={1}
            explain={etapes.verdict.explain}
            solved={s4}
            onAnswered={() => setFlag(3)}
          />
        </div>
      )}
    </div>
  );
}

const CAHIERS = {
  enonce: (
    <>
      Une école achète <strong>198 cahiers</strong> à <strong>2 €</strong> l'unité.
    </>
  ),
  operation: {
    q: 'Quel calcul permet de trouver le coût total ?',
    options: ['198 × 2', '198 + 2', '198 ÷ 2'],
    correct: 0,
    explain: 'Le coût total, c\'est le nombre de cahiers multiplié par le prix unitaire : 198 × 2.',
  },
  estimation: { min: 350, max: 450, hint: '198 ≈ 200, et 200 × 2 = 400.' },
  exact: { q: 'Calcule maintenant le coût exact.', answer: 396, unit: '€', label: 'Coût exact', explain: '198 × 2 = 396 €.' },
  verdict: {
    q: '396 € est-il cohérent avec ton estimation (≈ 400 €) ?',
    options: ['Oui, très cohérent', 'Non, il faut recommencer'],
    correct: 0,
    explain: "396 € est tout proche de l'estimation 400 € : le résultat est validé.",
  },
};

const BUS = {
  enonce: (
    <>
      Un bus transporte <strong>48 personnes</strong> par voyage. Il fait <strong>21 voyages</strong> dans la
      journée.
    </>
  ),
  operation: {
    q: 'Quel calcul donne le nombre total de personnes transportées ?',
    options: ['48 × 21', '48 + 21', '48 − 21'],
    correct: 0,
    explain: 'On répète 48 personnes pour chacun des 21 voyages : 48 × 21.',
  },
  estimation: { min: 900, max: 1100, hint: '48 ≈ 50 et 21 ≈ 20 : 50 × 20 = 1 000.' },
  exact: { q: 'Calcule le nombre exact de personnes transportées.', answer: 1008, unit: 'personnes', label: 'Nombre exact', explain: '48 × 21 = 1 008 personnes.' },
  verdict: {
    q: '1 008 personnes, est-ce cohérent avec ton estimation (≈ 1 000) ?',
    options: ['Oui, très cohérent', 'Non, il faut recommencer'],
    correct: 0,
    explain: '1 008 est tout proche de 1 000 : le résultat est cohérent.',
  },
};

export default function Module08Problemes() {
  const [p1Flags, setP1Flags] = useState([false, false, false, false]);
  const [p2Flags, setP2Flags] = useState([false, false, false, false]);

  const setFlag = (setter) => (i) =>
    setter((f) => (f[i] ? f : f.map((v, j) => (j === i ? true : v))));

  const p1Done = p1Flags.every(Boolean);
  const p2Done = p2Flags.every(Boolean);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="Estimation dans des problèmes"
      moduleSubtitle="Comprendre, estimer, calculer, comparer — dans des situations réelles."
      estimatedTime="9 min"
      brief={{
        tag: '🧠 Problèmes',
        title: 'La même démarche, à chaque fois.',
        body: <p>Comprendre ce qu'on cherche, estimer, calculer, puis comparer : c'est ce réflexe qui évite les erreurs.</p>,
      }}
      steps={[
        {
          num: 1,
          title: "Problème 1 — Les cahiers de l'école",
          done: p1Done,
          content: (
            <div className="space-y-5">
              {/* Le bandeau montrait les quatre temps sans jamais dire
                  pourquoi ils sont dans cet ordre. La brique le dit, avant
                  que l'élève ne les enchaîne. */}
              <KnowledgeBrick
                id="demarche-estimation"
                variant="new"
                lead="Tous tes réflexes vont servir d'un coup. Voici l'ordre dans lequel les employer."
              />
              <Probleme icone={ShoppingCart} enonce={CAHIERS.enonce} etapes={CAHIERS} flags={p1Flags} setFlag={setFlag(setP1Flags)} />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Problème 2 — Le bus scolaire',
          done: p2Done,
          content: <Probleme icone={Bus} enonce={BUS.enonce} etapes={BUS} flags={p2Flags} setFlag={setFlag(setP2Flags)} />,
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={8}>
          <strong>La suite.</strong> Dernière question, et pas la plus simple : jusqu'où faut-il
          être précis ?
        </KnowledgeSnapshot>
      }
    />
  );
}
