import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
function AvantApres({ solved, onAnswered, onEstimated }) {
  const [estOk, setEstOk] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
        Rappel du problème des crayons : 8 boîtes de 24 crayons, 35 distribués. Résultat exact trouvé :{' '}
        <strong className="font-mono">157 crayons</strong>.
      </p>

      <NumericQuestion
        prompt="AVANT de calculer, à peu près combien devrait-on trouver ? (8 ≈ 8, 24 ≈ 25, 35 ≈ 35…)"
        requires={['chaine-de-calcul']}
        prefix="≈"
        expected={(n) => Number.isFinite(n) && n >= 140 && n <= 190}
        display="une valeur entre 140 et 190"
        explain="8 × 25 = 200, puis 200 − 35 ≈ 165. C'est bien l'ordre de grandeur attendu."
        explainFor={() => '8 × 25 = 200, puis 200 − 35 ≈ 165.'}
        solved={estOk || solved}
        onAnswered={() => {
          setEstOk(true);
          onEstimated?.();
        }}
      />

      {(estOk || solved) && (
        <div className="border-t border-slate-100 pt-4 space-y-2">
          <Feedback tone="ok">Bonne estimation : ≈ 165 crayons.</Feedback>

          <TapQuestion
            prompt="APRÈS le calcul : 157 est-il cohérent avec cette estimation ?"
            requires={['estimer-puis-controler']}
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
        requires={['estimer-puis-controler']}
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
            requires={['chaine-de-calcul']}
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
            requires={['estimer-puis-controler']}
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
  const [estimated, setEstimated] = useState(false);
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
        body: (
          <p>
            Deux réflexes encadrent chaque calcul : prévoir à peu près où l'on va, puis vérifier
            qu'on y est bien arrivé.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Avant / après, sur un exemple connu',
          done: s1,
          content: (
            <div className="space-y-5">
              <AvantApres
                solved={s1}
                onEstimated={() => setEstimated(true)}
                onAnswered={() => setS1(true)}
              />
              {/* La brique vit dans le littéral `steps` — seule position que
                  l'audit lit, donc la seule qui rende la connaissance
                  contractuelle (RECIPE §5). Elle paraît dès que l'estimation
                  est donnée, avant le contrôle qui en est la seconde moitié. */}
              {(estimated || s1) && (
                <KnowledgeBrick
                  id="estimer-puis-controler"
                  variant="new"
                  lead="Tu viens d'annoncer un ordre de grandeur sans poser le calcul. Voilà à quoi il va servir."
                />
              )}
            </div>
          ),
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
              requires={['estimer-puis-controler']}
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
      footer={
        <KnowledgeSnapshot moduleNumber={8}>
          <strong>La suite.</strong> Le bon nombre est trouvé et contrôlé. Reste à le dire
          correctement — ce n'est pas la même chose.
        </KnowledgeSnapshot>
      }
    />
  );
}
