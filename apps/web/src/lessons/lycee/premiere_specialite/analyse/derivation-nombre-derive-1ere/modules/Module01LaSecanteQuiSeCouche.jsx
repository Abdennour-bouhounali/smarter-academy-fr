import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SecantLab from '../components/SecantLab';
import { CARRE, H_STEPS, tauxDetail, aVuLaStabilisation, fr } from '../components/derivUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : la sécante qui se couche
 * (components/SecantLab.jsx).
 *
 * Étape 1  la sécante et son triangle : montée ET avancée. On mesure le taux
 *          entre A(1 ; 1) et B(2 ; 4) — la pente vaut 3, pas 3 non plus par
 *          hasard : la montée vaut 3 et l'avancée 1, la confusion est donc
 *          impossible à trancher ici… c'est pourquoi l'étape demande h = 0,5,
 *          où montée (1,25) et pente (2,5) diffèrent.
 * Étape 2  rapprocher B de A cran par cran, et REGARDER LA COLONNE de pentes.
 * Étape 3  la question qui compte : h atteint-il 0 ?
 * Étape 4  ce que devient la sécante — posé comme une QUESTION, jamais nommé.
 *
 * Rien ne s'appelle « nombre dérivé » ni « tangente » avant le module 2 : le
 * module se termine en DEMANDANT ce que les suivants nommeront (§6bis.1).
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre est geste → observation → brique →
 * demande :
 *   étape 1  mesurer le triangle → brique `taux-variation-secante`
 *   étape 2  rapprocher et voir la colonne → brique `rapprochement-stabilisation`
 *   étapes 3 et 4  les questions, désormais légitimes.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée : `disabled` ne porte que le verrou d'ANTÉRIORITÉ de l'étape 2 sur
 * l'étape 1. Seuls les `PredictionChips` se figent — une prédiction
 * s'enregistre une fois, avant la révélation.
 */
export default function Module01LaSecanteQuiSeCouche() {
  const [h1, setH1] = useState(1);
  const [taux1, setTaux1] = useState(false);
  const [pred, setPred] = useState(null);
  const [h2, setH2] = useState(2);
  const [vus2, setVus2] = useState([2]);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const A = 1;
  const done1 = taux1;
  const done2 = aVuLaStabilisation(vus2);

  // Le cran visité s'ajoute à l'historique : c'est la SUITE des pentes qui fait
  // la découverte. `react` ne se déclenche qu'au moment où l'objectif tombe.
  const bougerH2 = (v, react) => {
    setH2(v);
    if (vus2.includes(v)) return;
    const suivant = [...vus2, v];
    setVus2(suivant);
    if (!done2 && aVuLaStabilisation(suivant)) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Deux points, une droite',
      subtitle:
        'A est fixé en x = 1. Règle l’écart h = 0,5 pour placer B, puis lis la montée et l’avancée sous la figure : quel est le coefficient directeur de la droite (AB) ?',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <SecantLab fn={CARRE} a={A} h={h1} onChangeH={setH1} />
          <NumericQuestion
            prompt={<>Pour <strong>h = 0,5</strong>, quel est le coefficient directeur de la droite (AB) ?</>}
            expected={2.5}
            parse={parseDec}
            display="2,5"
            requires={['taux-accroissement']}
            explain="La montée vaut f(1,5) − f(1) = 2,25 − 1 = 1,25 et l’avancée vaut 0,5. La pente est 1,25 ÷ 0,5 = 2,5."
            explainFor={(n) =>
              n === 1.25
                ? 'C’est la MONTÉE, pas la pente : il reste à la diviser par l’avancée h = 0,5. 1,25 ÷ 0,5 = 2,5.'
                : n === 3
                ? 'C’est la pente pour h = 1. Règle l’écart sur h = 0,5 et relis la montée : elle vaut 1,25.'
                : null
            }
            solved={done1}
            onAnswered={() => setTaux1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Deux nombres, jamais un seul : une montée de <strong>1,25</strong> sur une avancée
                de <strong>0,5</strong> fait une pente de <strong>2,5</strong>. Change h et regarde
                les deux nombres bouger ensemble.
              </Feedback>
              <KnowledgeBrick
                id="taux-variation-secante"
                variant="new"
                lead={<>Le nombre que tu viens de calculer porte un nom, et c’est déjà une pente.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Rapproche B de A',
      subtitle:
        'Appuie sur « rapprocher » jusqu’au dernier cran. Regarde la colonne des pentes déjà obtenues : que font-elles ?',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="en rapprochant B de A, que vont faire les pentes ?"
            options={[
              { id: 'grandes', label: 'Devenir de plus en plus grandes' },
              { id: 'stables', label: 'Se rapprocher d’un nombre fixe' },
              { id: 'nulles', label: 'Tomber à 0' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done2}
          />
          <SecantLab
            fn={CARRE}
            a={A}
            h={h2}
            onChangeH={(v) => bougerH2(v, kit.react)}
            visites={vus2}
            disabled={!done1}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                {pred === 'stables' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde la colonne'} :
                4 → 3 → 2,5 → 2,25 → 2,1 → 2,05 → <strong>2,01</strong>. Les pentes se tassent
                sur <strong>2</strong>. Et pourtant l’écart h vaut encore 0,01 : il n’est
                jamais nul.
              </Feedback>
              <KnowledgeBrick
                id="rapprochement-stabilisation"
                variant="new"
                lead={<>Ce que la colonne vient de montrer se dit en une phrase. Refais le geste en la lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Crans visités : {vus2.length} sur {H_STEPS.length}. Continue jusqu’aux trois plus
              petits écarts — c’est là que la colonne se stabilise.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et si h valait 0 ?',
      done: q3,
      content: (
        <TapQuestion
          prompt="Pourquoi ne peut-on pas simplement poser h = 0 pour obtenir « la » pente en A ?"
          options={[
            'Parce que la montée et l’avancée seraient toutes deux nulles : 0 ÷ 0 n’a pas de sens, et A et B seraient confondus — il n’y aurait plus de droite (AB)',
            'Parce que la pente vaudrait alors 0',
            'Parce que la courbe n’est pas définie en 0',
            'Parce que h doit toujours rester plus grand que 1',
          ]}
          correct={0}
          cols={1}
          requires={['taux-variation-secante', 'rapprochement-stabilisation']}
          explain="Avec h = 0, B vient sur A : la montée vaut 0, l’avancée vaut 0, et 0 divisé par 0 n’a pas de valeur. C’est bien pour cela que l’on REGARDE vers quoi les pentes se dirigent, sans jamais y arriver."
          explainWrong="Regarde la colonne : à h = 0,01 la pente vaut encore 2,01, donc elle n’est pas nulle. Et la courbe de x² est bien définie en 0. Le vrai obstacle est la division : avec h = 0, on écrirait 0 ÷ 0."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Que devient la sécante ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <SecantLab fn={CARRE} a={A} h={0.01} onChangeH={() => {}} disabled />
          <TapQuestion
            prompt="Au dernier cran, la sécante (AB) est presque posée sur une droite bien précise. Laquelle ?"
            options={[
              'Une droite qui passe par A et qui épouse la courbe au plus près autour de A',
              'La droite horizontale passant par A',
              'L’axe des abscisses',
              'Une droite qui ne touche pas la courbe',
            ]}
            correct={0}
            cols={1}
            requires={['taux-variation-secante', 'rapprochement-stabilisation']}
            explain="La sécante se couche sur une droite limite qui passe toujours par A. Cette droite a un nom, et sa pente est le nombre sur lequel la colonne s’est stabilisée : le module suivant les nomme tous les deux."
            explainWrong="Elle passe par A — ce n’est donc ni l’axe des abscisses, ni une droite qui ne toucherait pas la courbe. Et elle n’est pas horizontale : sa pente vaut environ 2, comme le montre la colonne."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La sécante qui se couche"
      moduleSubtitle="Deux points, un écart qui rétrécit, des pentes qui se tassent"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Jusqu’où peut-on rapprocher ?',
        tone: 'indigo',
        body: (
          <p>
            Deux points d’une courbe définissent une droite et une pente. Rapproche-les l’un de
            l’autre, cran par cran, et regarde ce que devient cette pente.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Le mot juste.</strong> Le nombre sur lequel les pentes se sont tassées et la
          droite sur laquelle la sécante s’est couchée ont chacun un nom : module suivant, le
          nombre dérivé.
        </KnowledgeSnapshot>
      }
    />
  );
}
