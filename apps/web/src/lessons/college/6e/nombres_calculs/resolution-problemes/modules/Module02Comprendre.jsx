import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import BarModel from '../../../../../common/components/BarModel';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 2 — découverte, reconstruit sur le lesson kit.
 *
 * Deux histoires, une même soustraction : Ana « perd » des billes (retrait),
 * Léo et Zoé sont comparés (aucun objet ne bouge). Étape 1 reste une
 * manipulation maison (pas d'état faux, tap jusqu'à la cible).
 */

/* ─── Étape 1 : retirer des objets ────────────────────────────────── */
function RetirerBilles({ react, solved, onSolved }) {
  const [removed, setRemoved] = useState([]);
  const total = 18;
  const target = 7;
  const remaining = total - removed.length;
  const isDone = solved || removed.length === target;

  const toggle = (i) => {
    if (solved) return;
    setRemoved((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : prev.length < target ? [...prev, i] : prev));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Ana a 18 billes. Elle en donne 7 à son frère. Touche 7 billes pour les lui donner.
      </p>
      <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl justify-center">
        {Array.from({ length: total }, (_, i) => {
          const isRemoved = solved || removed.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              disabled={solved}
              aria-pressed={isRemoved}
              aria-label={`Bille ${i + 1}${isRemoved ? ', donnée' : ''}`}
              className={`w-8 h-8 rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isRemoved ? 'bg-slate-100 border-slate-200 opacity-30' : 'bg-amber-400 border-amber-500 hover:scale-105'
              }`}
            />
          );
        })}
      </div>
      <p className="text-center text-sm font-mono text-slate-600">
        Données : <strong>{solved ? target : removed.length}</strong> — Restantes : <strong>{solved ? remaining : total - removed.length}</strong>
      </p>
      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              if (removed.length === target) {
                react(true);
                onSolved?.();
              }
            }}
            disabled={removed.length !== target}
          >
            Valider
          </ValidateButton>
        </div>
      )}
      {isDone && (
        <Feedback tone="ok">
          Il reste <strong>{remaining}</strong> billes à Ana. On a modélisé un RETRAIT : 18 − 7 = 11. L'opération
          est apparue en manipulant, pas en repérant le mot « donne ».
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 3 : réflexion ─────────────────────────────────────────── */
const REFLEX_Q = {
  q: 'Les deux problèmes précédents utilisent tous les deux une soustraction. Que peux-tu en conclure ?',
  options: [
    'Une même opération peut raconter des situations très différentes : retirer, ou comparer',
    'Ce sont en fait deux opérations différentes, on s\'est trompé',
    'Le mot « reste » indique toujours un retrait',
  ],
  correct: 0,
  explain: "Exactement. Ana « perd » des billes (retrait), Léo et Zoé sont simplement comparés (aucun objet ne bouge). Même calcul, deux histoires différentes. C'est pour cela qu'il faut comprendre la situation avant de choisir un calcul.",
};

export default function Module02Comprendre() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Comprendre la situation"
      moduleSubtitle="Qu'est-ce qui se passe ? L'opération doit émerger du modèle, pas du hasard."
      estimatedTime="7 min"
      brief={{
        tag: '🔍 Comprendre',
        title: "Avant de calculer : qu'est-ce qui se passe vraiment ?",
        body: <p>Deux histoires très différentes, un même calcul final. Regarde bien ce qui se passe dans chacune.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Situation 1 — Un retrait',
          done: s1,
          content: (kit) => <RetirerBilles react={kit.react} solved={s1} onSolved={() => setS1(true)} />,
        },
        {
          num: 2,
          title: 'Situation 2 — Une comparaison',
          done: s2,
          content: (
            <NumericQuestion
              prompt="Léo a 15 cartes. Zoé en a 9. Combien de cartes Léo a-t-il de plus que Zoé ?"
              above={
                <BarModel
                  bars={[
                    { label: 'Léo', segments: [{ value: 9, tone: 'sky', text: '9' }, { value: 6, tone: 'amber', text: '?' }] },
                    { label: 'Zoé', segments: [{ value: 9, tone: 'sky', text: '9' }] },
                  ]}
                  maxValue={15}
                />
              }
              expected={6}
              explain="Léo a 6 cartes de plus. Ici aussi c'est une soustraction (15 − 9), mais elle raconte une COMPARAISON, pas un retrait : personne ne « donne » rien."
              explainFor={() => "Compare les deux barres : de combien la barre de Léo dépasse-t-elle celle de Zoé ?"}
              solved={s2}
              onAnswered={() => setS2(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Ce que ces deux situations t\'apprennent',
          done: s3,
          content: (
            <TapQuestion
              prompt={REFLEX_Q.q}
              options={REFLEX_Q.options}
              correct={REFLEX_Q.correct}
              cols={1}
              explain={REFLEX_Q.explain}
              solved={s3}
              onAnswered={() => setS3(true)}
            />
          ),
        },
      ]}
    />
  );
}
