import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import GroupBuilder from '../../../../../common/components/GroupBuilder';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — déclencheur, reconstruit sur le lesson kit.
 *
 * Étape 1 reste une manipulation maison (GroupBuilder) : pas d'état faux,
 * on construit jusqu'à atteindre la cible, puis kit.react(true) + onSolved()
 * — même idiome que Fractions Module01 étape 1.
 */

/* ─── Étape 1 : construire la structure ──────────────────────────── */
function ConstructionGroupes({ react, solved, onSolved }) {
  const [groups, setGroups] = useState(0);
  const target = 6;
  const perGroup = 24;
  const isDone = solved || groups === target;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        6 classes participent à la sortie, chacune avec 24 élèves. Ajoute les classes une par une et observe le
        total évoluer.
      </p>
      <GroupBuilder perGroup={perGroup} groups={solved ? target : groups} onChange={setGroups} max={6} tone="violet" unit=" élèves" disabled={solved} />
      {groups > 0 && groups < target && !solved && (
        <p className="text-center text-xs font-mono text-slate-400">
          {Array.from({ length: groups }, () => perGroup).join(' + ')} = {groups * perGroup}
        </p>
      )}
      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              if (groups === target) {
                react(true);
                onSolved?.();
              }
            }}
            disabled={groups !== target}
          >
            Valider les 6 classes
          </ValidateButton>
        </div>
      )}
      {isDone && (
        <Feedback tone="ok">
          <span className="font-mono">24 + 24 + 24 + 24 + 24 + 24 = 144</span> : tu viens de construire 6 groupes
          identiques de 24.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 2 : l'opération émerge du modèle ─────────────────────── */
const OP_Q = {
  q: 'Tu viens de répéter 6 fois le même groupe de 24. Quelle écriture représente exactement ce que tu as fait ?',
  options: ['6 × 24', '6 + 24', '24 ÷ 6', '6 − 24'],
  correct: 0,
  explain: "Répéter un même groupe plusieurs fois, c'est une multiplication : 6 groupes de 24, c'est 6 × 24 = 144. Tu as découvert l'opération EN CONSTRUISANT, pas en devinant un mot-clé.",
};

export default function Module01Mission() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Mission : Le problème mystère"
      moduleSubtitle="6 classes, 24 élèves chacune : découvre la structure avant de chercher une opération."
      estimatedTime="7 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Une sortie scolaire se prépare.',
        body: (
          <>
            <p>
              6 classes participent, chacune avec 24 élèves. Un bus a 50 places.{' '}
              <strong className="text-white">Combien de personnes doivent être transportées ?</strong>
            </p>
            <p className="text-xs">Ne cherche pas encore une opération : construis d'abord la situation.</p>
          </>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Construis les 6 classes',
          done: s1,
          content: (kit) => (
            <div className="space-y-5">
              <ConstructionGroupes react={kit.react} solved={s1} onSolved={() => setS1(true)} />
              {/* La méthode est nommée à l'instant où elle vient d'être
                  employée — les 6 groupes sont encore à l'écran. */}
              {s1 && (
                <KnowledgeBrick
                  id="construire-avant-calculer"
                  variant="new"
                  lead="Tu n'as cherché aucune opération : tu as posé la situation, et elle s'est montrée toute seule."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Nomme ce que tu as construit',
          done: s2,
          content: (
            <TapQuestion
              prompt={OP_Q.q}
              requires={['construire-avant-calculer']}
              options={OP_Q.options}
              correct={OP_Q.correct}
              cols={2}
              explain={OP_Q.explain}
              solved={s2}
              onAnswered={() => setS2(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Va plus loin que le calcul',
          done: s3,
          content: (
            <div className="space-y-4">
              <NumericQuestion
                prompt="Chaque bus a 50 places. Combien de bus faut-il prévoir pour les 144 personnes ?"
                suffix="bus"
                expected={3}
                requires={['construire-avant-calculer']}
                explain="144 ÷ 50 = 2 reste 44 : deux bus ne suffisent pas (2 × 50 = 100 < 144), il en faut un troisième pour les 44 personnes restantes — même s'il n'est pas rempli."
                explainFor={(n) =>
                  n === 2 || n === 2.88
                    ? "2 bus n'offrent que 2 × 50 = 100 places : c'est insuffisant pour 144 personnes. Il faut un bus de plus."
                    : 'Chaque bus accueille 50 personnes. Compare 144 aux multiples de 50 : 50, 100, 150…'
                }
                solved={s3}
                onAnswered={() => setS3(true)}
              />
              {s3 && (
                <KnowledgeBrick
                  id="interpreter-le-resultat"
                  variant="new"
                  lead="Le calcul disait 2 et il en fallait 3 : c'est la situation qui a tranché."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais construire une situation. On va voir maintenant
          pourquoi deux histoires très différentes peuvent donner le même calcul.
        </KnowledgeSnapshot>
      }
    />
  );
}
