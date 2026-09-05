import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 8 — practice lab, reconstruit sur le lesson kit.
 *
 * Ce module réutilise le réflexe déjà construit dans la leçon
 * « Ordre de grandeur et estimation » (estimer avant, contrôler après). Il
 * ne le réenseigne pas : il l'intègre au processus de résolution de
 * problèmes. Corrige un bug de la version précédente : une estimation hors
 * plage n'affichait aucun retour — ici, NumericQuestion explique toujours.
 */

/* ─── Étape 1 : avant / après, sur le problème des crayons ───────── */
function AvantApres({ solved, onAnswered }) {
  const [estOk, setEstOk] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
        Rappel du problème des crayons : 8 boîtes de 24 crayons, 35 distribués. Résultat exact trouvé :{' '}
        <strong className="font-mono">157 crayons</strong>.
      </p>

      <NumericQuestion
        prompt="AVANT de calculer, à peu près combien devrait-on trouver ? (8 ≈ 8, 24 ≈ 25, 35 ≈ 35…)"
        prefix="≈"
        expected={(n) => Number.isFinite(n) && n >= 140 && n <= 190}
        display="une valeur entre 140 et 190"
        explain="8 × 25 = 200, puis 200 − 35 ≈ 165. C'est bien l'ordre de grandeur attendu."
        explainFor={() => '8 × 25 = 200, puis 200 − 35 ≈ 165.'}
        solved={estOk || solved}
        onAnswered={() => setEstOk(true)}
      />

      {(estOk || solved) && (
        <div className="border-t border-slate-100 pt-4 space-y-2">
          <Feedback tone="ok">Bonne estimation : ≈ 165 crayons.</Feedback>
          <TapQuestion
            prompt="APRÈS le calcul : 157 est-il cohérent avec cette estimation ?"
            options={['Oui, 157 est proche de 165 : le résultat est cohérent', "Non, l'écart est trop grand, il faut recompter"]}
            correct={0}
            cols={1}
            explain="157 est tout proche de 165 : le résultat exact est cohérent avec l'estimation. C'est exactement ce contrôle qui permet de repérer une erreur grossière."
            solved={solved}
            onAnswered={onAnswered}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Étape 2 : à toi de jouer ────────────────────────────────────── */
function ToiDeJouer({ solved, onAnswered }) {
  const [estOk, setEstOk] = useState(false);
  const [exactOk, setExactOk] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
        29 packs de 6 canettes sont livrés. On en distribue 89. Combien de canettes reste-t-il ?
      </p>

      <NumericQuestion
        prompt="Estime d'abord, avant tout calcul exact."
        prefix="≈"
        expected={(n) => Number.isFinite(n) && n >= 70 && n <= 110}
        display="une valeur entre 70 et 110"
        explain="29 ≈ 30 packs de 6 ≈ 180, puis 180 − 89 ≈ 90."
        explainFor={() => '29 packs de 6 ≈ 180 canettes livrées, puis retire les 89 distribuées : ≈ 90.'}
        solved={estOk || solved}
        onAnswered={() => setEstOk(true)}
      />

      {(estOk || solved) && (
        <div className="border-t border-slate-100 pt-4">
          <Feedback tone="ok">Bonne estimation.</Feedback>
          <div className="pt-2">
            <NumericQuestion
              prompt="Calcule maintenant le résultat exact."
              expected={85}
              explain="29 × 6 = 174 canettes livrées, puis 174 − 89 = 85 canettes restantes."
              explainFor={() => 'Calcule le total livré (29 × 6), puis retire les 89 distribuées.'}
              solved={exactOk || solved}
              onAnswered={() => setExactOk(true)}
            />
          </div>
        </div>
      )}

      {(exactOk || solved) && (
        <div className="border-t border-slate-100 pt-4">
          <TapQuestion
            prompt="85 est-il cohérent avec ton estimation ?"
            options={['Oui, cohérent', 'Non, incohérent']}
            correct={0}
            cols={2}
            explain="85 est cohérent avec une estimation autour de 90 : le résultat est validé."
            solved={solved}
            onAnswered={onAnswered}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Étape 3 : pourquoi ce réflexe compte ───────────────────────── */
const WHY_Q = {
  q: 'Pourquoi estimer AVANT de calculer, puis vérifier APRÈS ?',
  options: [
    'Estimer avant donne un repère pour prévoir le résultat ; vérifier après permet de détecter une erreur grossière — les deux se complètent',
    "C'est juste une étape supplémentaire sans réelle utilité",
    'Estimer avant remplace le besoin de calculer exactement',
  ],
  correct: 0,
  explain: 'Exactement. Les deux réflexes se complètent : PRÉVOIR avant, CONTRÔLER après. Cela ne remplace jamais le calcul exact, mais protège contre les erreurs grossières.',
};

export default function Module08EstimerVerifier() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="Estimer et vérifier"
      moduleSubtitle="Avant de calculer : à peu près combien ? Après : est-ce cohérent ?"
      estimatedTime="7 min"
      brief={{
        tag: '🔎 Contrôle',
        title: 'Le réflexe que tu as déjà : estimer, puis contrôler.',
        body: <p>Tu l'as déjà appris dans la leçon « Ordre de grandeur et estimation ». Ici, on l'intègre simplement à la démarche complète de résolution.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Avant / après, sur un exemple connu',
          done: s1,
          content: <AvantApres solved={s1} onAnswered={() => setS1(true)} />,
        },
        {
          num: 2,
          title: 'À toi de jouer',
          done: s2,
          content: <ToiDeJouer solved={s2} onAnswered={() => setS2(true)} />,
        },
        {
          num: 3,
          title: 'Pourquoi ce réflexe compte',
          done: s3,
          content: (
            <TapQuestion
              prompt={WHY_Q.q}
              options={WHY_Q.options}
              correct={WHY_Q.correct}
              cols={1}
              explain={WHY_Q.explain}
              solved={s3}
              onAnswered={() => setS3(true)}
            />
          ),
        },
      ]}
    />
  );
}
