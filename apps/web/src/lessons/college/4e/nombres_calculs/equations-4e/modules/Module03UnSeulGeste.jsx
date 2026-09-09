import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { equation, expr, isSolvedForm } from '../../../../../common/algebra4e';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BalanceWorkbench, { gestesLegaux } from '../components/BalanceWorkbench';

/**
 * Module 3 — MANIPULATION : les deux équations qui se résolvent d'un geste.
 *
 * Activity              résoudre x + b = c, puis ax = c, sur la balance.
 * Mathematical objective isoler l'inconnue, c'est appliquer aux deux membres
 *                       l'opération qui DÉFAIT celle qui la gêne : une
 *                       addition se défait par une soustraction, une
 *                       multiplication par une division. Le module sépare
 *                       délibérément les deux cas — c'est ce qui permettra,
 *                       au module 4, de comprendre pourquoi leur ORDRE
 *                       compte.
 * Expected observation  « la division marche exactement comme la
 *                       soustraction : des deux côtés, et l'équilibre tient ».
 * Misconception targeted diviser un seul membre ; et croire qu'on peut
 *                       « enlever le 4 » de 4x comme on enlève un terme.
 *
 * §16bis : les gestes proposés sont fixes pendant toute l'étape — ils ne
 * réapparaissent pas ailleurs sous le doigt de l'élève.
 */
const EQ_A = equation(expr(1, -7), expr(0, 5));   // x − 7 = 5, solution 12
const EQ_B = equation(expr(6, 0), expr(0, 18));   // 6x = 18, solution 3

export default function Module03UnSeulGeste() {
  const [histA, setHistA] = useState([EQ_A]);
  const eqA = histA[histA.length - 1];
  const doneA = isSolvedForm(eqA);

  const [histB, setHistB] = useState([EQ_B]);
  const eqB = histB[histB.length - 1];
  const doneB = isSolvedForm(eqB);

  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Un poids en trop',
      subtitle: 'Ici l’inconnue est accompagnée d’un nombre. Fais-le disparaître.',
      done: doneA,
      content: (kit) => (
        <div className="space-y-3">
          <BalanceWorkbench
            historique={histA}
            probe={12}
            gestes={gestesLegaux(eqA, { ajouts: [5, 7], retraits: [5] })}
            onGeste={(next) => {
              setHistA([...histA, next]);
              if (isSolvedForm(next) && !doneA) kit.react(true);
            }}
            onAnnuler={() => setHistA(histA.slice(0, -1))}
            onRecommencer={() => setHistA([EQ_A])}
          />
          {doneA ? (
            <Feedback tone="ok">
              Le <strong>−7</strong> se défait en <strong>ajoutant 7</strong> des deux côtés : à
              gauche il ne reste que x, à droite 5 + 7 = 12. Une soustraction se défait par une
              addition. Vérification : 12 − 7 = 5 ✓
            </Feedback>
          ) : (
            <Feedback tone="info">
              Quelle opération annule un « −7 » ? Applique-la des deux côtés.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un paquet multiplié',
      subtitle: 'Cette fois l’inconnue est multipliée. Le geste sera d’une autre nature.',
      done: doneB,
      content: (kit) => (
        <div className="space-y-3">
          <BalanceWorkbench
            historique={histB}
            probe={3}
            gestes={gestesLegaux(eqB, { retraits: [6], divisions: [2, 6] })}
            onGeste={(next) => {
              setHistB([...histB, next]);
              if (isSolvedForm(next) && !doneB) kit.react(true);
            }}
            onAnnuler={() => setHistB(histB.slice(0, -1))}
            onRecommencer={() => setHistB([EQ_B])}
          />
          {doneB ? (
            <Feedback tone="ok">
              Le <strong>6</strong> ne s’enlève pas : il <strong>multiplie</strong> x, on le défait
              donc en <strong>divisant par 6</strong> les deux côtés. 18 ÷ 6 = 3.
              <br />
              Remarque : « − 6 » ne servait à rien ici, parce que 6x n’est pas « 6 plus x ».
              Vérification : 6 × 3 = 18 ✓
            </Feedback>
          ) : histB.length > 1 ? (
            <Feedback tone="warn">
              Ce geste ne libère pas l’inconnue : dans <MathText>{'$6x$'}</MathText>, le 6{' '}
              <strong>multiplie</strong> x — il ne s’y ajoute pas. Annule, et cherche l’opération
              qui défait une multiplication.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Attention : ici le 6 ne s’ajoute pas à x, il le multiplie.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Choisis le bon geste',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="defaire-une-operation"
            variant="new"
            lead={<>Les deux balances demandaient un geste différent, et pour la même raison à chaque fois : défaire ce qui gêne l’inconnue.</>}
          />
          <TapQuestion
            prompt={<span>Pour résoudre <MathText>{'$7x = 42$'}</MathText>, quel geste faut-il faire ?</span>}
            options={[
              'Retirer 7 des deux membres',
              'Diviser les deux membres par 7',
              'Retirer 7 du membre de gauche',
              'Ajouter 7 des deux membres',
            ]}
            correct={1}
            cols={1}
            requires={['defaire-une-operation']}
            explain="Le 7 multiplie x : on le défait par une division, appliquée aux DEUX membres. 42 ÷ 7 = 6, donc x = 6. Vérification : 7 × 6 = 42 ✓"
            explainWrong="Retirer 7 ne libère pas l’inconnue : 7x − 7 ne vaut pas x. Ce sont deux opérations différentes — une multiplication se défait par une division, jamais par une soustraction."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'À toi',
      done: q4,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<span>Résous <MathText>{'$x + 14 = 9$'}</MathText>. Que vaut x ?</span>}
            expected={-5}
            parse={(s) => {
              // parseFr refuse les négatifs et parseDec refuse le vrai moins
              // U+2212 : la solution étant négative, il faut accepter les deux.
              const t = String(s).replace(/−/g, '-').replace(/[\s  ]/g, '').replace(',', '.');
              const n = Number(t);
              return Number.isFinite(n) ? n : NaN;
            }}
            display="−5"
            requires={['defaire-une-operation', 'equilibre-conserve']}
            explain="On retire 14 des deux côtés : x = 9 − 14 = −5. Une solution peut très bien être négative — la balance ne l’interdit pas, c’est simplement une masse « en dessous de zéro » sur l’axe des nombres. Vérification : −5 + 14 = 9 ✓"
            explainFor={(n) =>
              n === 5
                ? "Le bon nombre, le mauvais signe : c’est 9 − 14, pas 14 − 9. Retirer 14 d’un membre qui vaut 9 fait passer sous zéro."
                : n === 23
                ? "Tu as ajouté 14 au lieu de le retirer. Pour faire disparaître un « + 14 », il faut RETIRER 14."
                : "On retire 14 des deux côtés : à gauche il reste x, à droite 9 − 14 = −5."
            }
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
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Un seul geste"
      moduleSubtitle="Défaire ce qui gêne l’inconnue"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Deux façons d’être gêné',
        tone: 'indigo',
        body: (
          <p>
            L’inconnue peut être accompagnée d’un nombre qui <strong>s’ajoute</strong> à elle, ou
            d’un nombre qui la <strong>multiplie</strong>. Ce ne sont pas les mêmes gênes — et donc
            pas les mêmes gestes.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
