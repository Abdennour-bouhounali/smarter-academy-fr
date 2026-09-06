import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { affine, imageOf, tableOf, formatRule } from '../components/functionUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 3 — DÉCOUVERTE : « Le tableau de valeurs ».
 *
 * Activity: fabriquer le tableau en testant des entrées une à une, puis s'en
 *   servir pour répondre plus vite que la machine.
 * Mathematical objective: le tableau de valeurs est un RÉSUMÉ de la fonction,
 *   pas la fonction elle-même : il en donne quelques couples, choisis.
 * Student action: toucher une pastille x ; la colonne se remplit.
 * Controlled variable: l'ensemble des x testés.
 * Mathematical state: { rule, tested:Set } — chaque colonne est calculée par
 *   imageOf, jamais saisie en dur.
 * Visual consequence: la colonne apparaît après un court délai (le nombre ne
 *   s'affiche qu'une fois « posé »), et la ligne du bas se remplit.
 * Expected observation: entre deux colonnes voisines, la sortie augmente
 *   toujours du même pas — le tableau laisse déjà deviner la régularité.
 * Misconception targeted: « le tableau EST la fonction » — cassée à l'étape 4,
 *   où on demande une image absente du tableau.
 * Feedback: explainFor cible l'erreur de lecture de colonne.
 * Formalization: le mot « tableau de valeurs » est posé une fois construit.
 * Scaffolding: tableau à une ligne (TRY) → deux fonctions comparées (EXPLORE).
 * Transfer: au module 4, chaque colonne devient un point du repère.
 */

const F = affine(3, -1);       // f(x) = 3x − 1
const XS = [-2, -1, 0, 1, 2, 3, 4];
const COLS = [{ id: 'f', label: 'f(x) = 3x − 1', fn: (x) => imageOf(F, x) }];

export default function Module03TableauDeValeurs() {
  const [tested, setTested] = useState(() => new Set());
  const [gapDone, setGapDone] = useState(false);
  const [outsideDone, setOutsideDone] = useState(false);
  const [roleDone, setRoleDone] = useState(false);

  const done1 = tested.size >= 4;

  const test = (x, kit) => {
    if (tested.has(x)) return;
    const next = new Set(tested);
    next.add(x);
    setTested(next);
    kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le tableau de valeurs"
      moduleSubtitle="Ranger les entrées et les sorties : la machine tient dans deux lignes."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Range la machine',
        tone: 'indigo',
        body: (
          <p>
            Relancer la machine à chaque question est lent. On va garder les résultats
            dans un tableau — et voir ce qu’il montre de plus.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Construis le tableau',
          subtitle: 'Touche au moins quatre entrées.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <ValueTable
                columns={COLS}
                xs={XS}
                tested={tested}
                onTest={(x) => test(x, kit)}
                variable="x"
                compare={false}
                caption="Tableau de valeurs de f"
              />
              {!done1 && (
                <Feedback tone="info">
                  Encore <strong>{4 - tested.size}</strong> colonne
                  {4 - tested.size > 1 ? 's' : ''} à remplir.
                </Feedback>
              )}
              {done1 && (
                <KnowledgeBrick
                  id="tableau-de-valeurs"
                  variant="new"
                  lead="Ce que tu viens de construire, colonne après colonne, a un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Ce que le tableau laisse voir',
          done: gapDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="Regarde deux colonnes voisines, de gauche à droite. Que fait la sortie quand l’entrée augmente de 1 ?"
                options={[
                  'Elle augmente toujours de 3',
                  'Elle augmente de plus en plus',
                  'Elle double',
                  'Elle augmente de 1',
                ]}
                correct={0}
                cols={1}
                requires={['tableau-de-valeurs', 'entree-sortie']}
                explain="De −1 à 0, la sortie passe de −4 à −1 : +3. De 0 à 1, de −1 à 2 : encore +3. Le pas est constant, et c’est le nombre qui multiplie x dans la règle."
                explainWrong="Compare deux colonnes voisines et fais la soustraction : tu obtiens le même écart à chaque fois."
                solved={gapDone}
                onAnswered={() => setGapDone(true)}
              />
              {gapDone && (
                <KnowledgeBrick
                  id="pas-constant"
                  variant="new"
                  compact
                  lead="Cette régularité que tu viens de repérer porte un nom, et elle resservira."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Une image hors du tableau',
          done: outsideDone,
          content: (kit) => (
            <NumericQuestion
              prompt={<>Le tableau s’arrête à 4. Que vaut <MathText>{'$f(10)$'}</MathText> ?</>}
              expected={imageOf(F, 10)}
              parse={parseDec}
              display={formatDec(imageOf(F, 10))}
              requires={['tableau-de-valeurs', 'notation-fx', 'image']}
              explain="f(10) = 3 × 10 − 1 = 29. Le tableau ne montre que quelques couples : la fonction, elle, en a une infinité. C’est la RÈGLE qui répond, pas le tableau."
              explainFor={(n) => {
                if (n === 30) return 'Tu as multiplié par 3 mais oublié le « − 1 » : 30 − 1 = 29.';
                if (n === 27) return 'Tu as peut-être prolongé le tableau de tête en sautant une colonne. Applique la règle : 3 × 10 − 1.';
                return null;
              }}
              solved={outsideDone}
              onAnswered={(ok) => { setOutsideDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 4,
          title: 'À quoi sert un tableau ?',
          done: roleDone,
          content: (
            <TapQuestion
              prompt="Laquelle de ces phrases est juste ?"
              options={[
                'Le tableau donne quelques couples choisis ; la règle les donne tous',
                'Le tableau contient toutes les valeurs de la fonction',
                'La fonction n’existe que pour les nombres du tableau',
                'Le tableau remplace la règle',
              ]}
              correct={0}
              cols={1}
              requires={['tableau-de-valeurs']}
              explain="Un tableau de valeurs est un extrait : pratique pour tracer, insuffisant pour tout savoir. La règle, elle, répond pour n’importe quel nombre."
              solved={roleDone}
              onAnswered={() => setRoleDone(true)}
            />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Un tableau de valeurs, c’est une fonction vue par le petit
          bout. Au module suivant, chacune de ses colonnes va devenir un <strong>point</strong>.
        </KnowledgeSnapshot>
      )}
    />
  );
}
