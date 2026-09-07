import React, { useState } from 'react';
import { ContentModule, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import StructureLab from '../components/StructureLab';
import BarModel from '../../../../../common/components/BarModel';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 4 — manipulation, reconstruit sur le lesson kit.
 *
 * Trois modèles pour rendre une relation visible : groupes, schéma en
 * barres, puis choisir la bonne représentation selon la situation.
 */

/* ─── Étape 1 : le modèle « groupes » ─────────────────────────────────
   Le GroupBuilder d'origine pilotait la quantité par des boutons + / − et se
   figeait après validation : deux règles projet enfreintes d'un coup (jamais
   de stepper pour une grandeur qu'on peut saisir ; une manipulation ne gèle
   jamais). On reprend ici le laboratoire de structure du module 1 — l'élève
   retrouve le geste qu'il connaît, appliqué à une autre situation, et il peut
   continuer à l'explorer une fois l'étagère bâtie. */
function ModeleGroupes({ react, solved, onSolved }) {
  const [groups, setGroups] = useState(2);
  const [perGroup, setPerGroup] = useState(8);
  const T_G = 4;
  const T_P = 18;
  const isDone = solved || (groups === T_G && perGroup === T_P);

  const change = (g, p) => {
    setGroups(g);
    setPerGroup(p);
    if (g === T_G && p === T_P) {
      react(true);
      onSolved?.();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Une bibliothèque possède 4 étagères. Chaque étagère contient 18 livres. Construis cette structure :
        glisse le bord droit pour les étagères, le curseur du couloir pour les livres.
      </p>
      <StructureLab
        groups={groups}
        perGroup={perGroup}
        onGroups={(g) => change(g, perGroup)}
        onPerGroup={(p) => change(groups, p)}
        maxGroups={8}
        maxPerGroup={24}
        target={72}
        unit="livre"
        packLabel="étagère"
        color="#f59e0b"
      />
      {isDone && (
        <Feedback tone="ok">
          {groups === T_G && perGroup === T_P ? (
            <>
              Le modèle « groupes » rend la multiplication visible : 4 étagères de 18 livres, c'est{' '}
              <strong className="font-mono">4 × 18 = 72</strong> livres.
            </>
          ) : (
            <>
              Tu continues d'explorer : <strong className="font-mono">{groups} × {perGroup} = {groups * perGroup}</strong>{' '}
              livres. Le modèle décrit n'importe quelle bibliothèque à étagères identiques.
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 3 : choisir la bonne représentation ──────────────────── */
const CHOIX_ROWS = [
  {
    id: 'classes',
    label: "Comparer la taille de 3 classes qui n'ont pas le même nombre d'élèves.",
    options: ['📊 Schéma en barres', '📏 Droite graduée', '📋 Tableau'],
    correct: 0,
    correction: 'Le schéma en barres montre immédiatement quelle classe est la plus grande et de combien.',
  },
  {
    id: 'position',
    label: 'Repérer une position, comme un point kilométrique sur une route.',
    options: ['📊 Schéma en barres', '📏 Droite graduée', '🧱 Objets'],
    correct: 1,
    correction: 'Une position sur un trajet se représente naturellement sur une droite graduée.',
  },
  {
    id: 'prix',
    label: "Organiser le prix de 5 fournitures différentes pour les comparer d'un coup d'œil.",
    options: ['🧱 Objets', '📋 Tableau', '📏 Droite graduée'],
    correct: 1,
    correction: 'Un tableau organise plusieurs données de même nature, prêtes à comparer.',
  },
];

export default function Module04Modeliser() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Modéliser"
      moduleSubtitle="Groupes, schéma en barres, droite graduée, tableau : rendre la relation visible."
      estimatedTime="8 min"
      brief={{
        tag: '🧩 Modélisation',
        title: 'Un modèle rend une relation visible.',
        body: <p>Il existe plusieurs façons de représenter une même situation. Chacune éclaire une relation différente.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Le modèle « groupes »',
          done: s1,
          content: (kit) => <ModeleGroupes react={kit.react} solved={s1} onSolved={() => setS1(true)} />,
        },
        {
          num: 2,
          title: 'Le modèle « schéma en barres »',
          done: s2,
          content: (
            <NumericQuestion
              prompt="Luc possède 35 €. Il dépense 12 €. Que représente le schéma ?"
              requires={['construire-avant-calculer']}
              above={
                <BarModel
                  bars={[{ label: 'Argent de Luc', segments: [{ value: 12, tone: 'rose', text: '−12 €', removed: true }, { value: 23, tone: 'sky', text: '?' }] }]}
                  maxValue={35}
                  unit=" €"
                />
              }
              suffix="€"
              expected={23}
              explain="Il reste 23 € à Luc. Le schéma en barres montre le TOUT (35 €) partagé en une partie dépensée et une partie restante : 35 − 12 = 23."
              explainFor={() => 'La partie connue (12 €) et la partie inconnue (?) forment ensemble les 35 € de départ.'}
              solved={s2}
              onAnswered={() => setS2(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Choisir la bonne représentation',
          done: s3,
          content: (
            <div className="space-y-5">
            <BatchChoiceQuestion
              requires={['construire-avant-calculer']}
              intro={
                <p className="text-sm font-semibold text-slate-700">
                  Pour chaque situation, quelle représentation choisirais-tu ?
                </p>
              }
              rows={CHOIX_ROWS}
              feedback={({ allRight }) => (
                <Feedback tone={allRight ? 'ok' : 'info'}>
                  Retiens la question clé :{' '}
                  <strong>« Quelle représentation m'aide le mieux à comprendre CETTE situation ? »</strong> — il
                  n'y a pas un seul bon modèle universel.
                </Feedback>
              )}
              solved={s3}
              onAnswered={() => setS3(true)}
            />
              {s3 && (
                <KnowledgeBrick
                  id="choisir-un-modele"
                  variant="new"
                  lead="Trois situations, trois dessins différents : à chaque fois, celui qui rendait la relation visible."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Un modèle ne dicte pas un chemin unique : plusieurs façons
          de chercher peuvent être bonnes.
        </KnowledgeSnapshot>
      }
    />
  );
}
