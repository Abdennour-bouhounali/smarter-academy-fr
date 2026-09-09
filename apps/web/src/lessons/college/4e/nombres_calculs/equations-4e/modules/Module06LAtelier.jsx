import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 6 — LABORATOIRE DE PRATIQUE : deux problèmes complets.
 *
 * Chaque problème suit le cycle entier — traduire, résoudre, interpréter —
 * et chaque phase est évaluée séparément : un élève peut traduire juste et
 * calculer faux, ou l'inverse, et le retour doit le distinguer.
 *
 * TRANSFERT : ni les contextes ni les valeurs des modules 1 à 5 ne sont
 * repris. Le second problème introduit délibérément un cas où l'inconnue
 * apparaît des deux côtés de l'égalité au moment de la traduction — résolu
 * par un transfert simple, sans nouvelle règle.
 */
export default function Module06LAtelier() {
  const [t1, setT1] = useState(false);
  const [r1, setR1] = useState(false);
  const [t2, setT2] = useState(false);
  const [r2, setR2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le taxi',
      subtitle: 'Traduis d’abord, résous ensuite.',
      done: t1 && r1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-3 text-sm text-slate-700">
            Une course de taxi coûte <strong>4 €</strong> de prise en charge, plus{' '}
            <strong>2 € par kilomètre</strong>. Nina a payé <strong>26 €</strong>.
            <br />
            Combien de kilomètres a-t-elle parcourus ?
          </div>

          <TapQuestion
            prompt="On pose x = le nombre de kilomètres. Quelle équation traduit la situation ?"
            options={[
              <MathText key="a">{'$4x + 2 = 26$'}</MathText>,
              <MathText key="b">{'$2x + 4 = 26$'}</MathText>,
              <MathText key="c">{'$2x = 26$'}</MathText>,
              <MathText key="d">{'$6x = 26$'}</MathText>,
            ]}
            correct={1}
            cols={2}
            optionLabel={(i) => ['4x + 2 = 26', '2x + 4 = 26', '2x = 26', '6x = 26'][i]}
            requires={['modeliser-par-une-equation']}
            explain="C’est le prix au kilomètre qui dépend de x : 2 € × x kilomètres, soit 2x. La prise en charge, elle, est payée une seule fois quelle que soit la distance : elle s’ajoute, sans x. D’où 2x + 4 = 26."
            explainWrong="Regarde ce qui DÉPEND de la distance : les 2 € du kilomètre, donc 2x. Les 4 € sont fixes — on les paie même pour 0 km, ils ne se multiplient pas par x."
            solved={t1}
            onAnswered={() => setT1(true)}
          />

          {t1 && (
            <NumericQuestion
              prompt="Résous : combien de kilomètres Nina a-t-elle parcourus ?"
              expected={11}
              suffix="km"
              requires={['resoudre-ax-plus-b']}
              explain="2x + 4 = 26 : on retire 4 (2x = 22), puis on divise par 2 (x = 11). Nina a parcouru 11 km. Vérification : 2 × 11 + 4 = 26 ✓"
              explainFor={(n) =>
                n === 22
                  ? "Tu t’es arrêté à 2x = 22 : il reste à diviser par 2, ce qui donne 11 km."
                  : n === 15
                  ? "Tu as divisé 26 par 2 avant d’enlever les 4 € fixes. Commence par retirer la prise en charge : 26 − 4 = 22, puis partage."
                  : "Deux gestes : retirer 4 des deux côtés, puis diviser par 2."
              }
              solved={r1}
              onAnswered={() => setR1(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Les deux abonnements',
      subtitle: 'Ici l’inconnue apparaît des deux côtés — mais le geste reste le même.',
      done: t2 && r2,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-3 text-sm text-slate-700">
            Une salle de sport propose deux formules :
            <br />• formule A : <strong>30 €</strong> d’inscription puis <strong>5 €</strong> la séance ;
            <br />• formule B : <strong>10 €</strong> la séance, sans inscription.
            <br />
            À partir de combien de séances les deux formules coûtent-elles pareil ?
          </div>

          <TapQuestion
            prompt="On pose x = le nombre de séances. Quelle équation traduit « les deux formules coûtent pareil » ?"
            options={[
              <MathText key="a">{'$5x + 30 = 10x$'}</MathText>,
              <MathText key="b">{'$30x + 5 = 10x$'}</MathText>,
              <MathText key="c">{'$5x + 30 + 10x = 0$'}</MathText>,
              <MathText key="d">{'$5x = 10x + 30$'}</MathText>,
            ]}
            correct={0}
            cols={2}
            optionLabel={(i) => ['5x + 30 = 10x', '30x + 5 = 10x', '5x + 30 + 10x = 0', '5x = 10x + 30'][i]}
            requires={['modeliser-par-une-equation']}
            explain="La formule A coûte 5x + 30, la formule B coûte 10x. « Coûter pareil » se traduit par un signe égal entre les deux : 5x + 30 = 10x."
            explainWrong="Chaque membre représente le prix d’UNE formule. Les 30 € s’ajoutent une fois (pas 30 par séance), et il ne faut rien additionner entre les deux formules : on les COMPARE."
            solved={t2}
            onAnswered={() => setT2(true)}
          />

          {t2 && (
            <NumericQuestion
              prompt="Résous : à partir de combien de séances les deux formules coûtent-elles pareil ?"
              expected={6}
              suffix="séances"
              requires={['resoudre-ax-plus-b', 'equilibre-conserve']}
              explain="5x + 30 = 10x. On retire 5x des DEUX côtés — un geste légal comme un autre : il vient 30 = 5x. Puis on divise par 5 : x = 6. Vérification : formule A 5 × 6 + 30 = 60 €, formule B 10 × 6 = 60 € ✓"
              explainFor={(n) =>
                n === 2
                  ? "Tu as divisé 30 par 15 (la somme des deux tarifs). Ici il faut d’abord rassembler les x d’un seul côté : retire 5x des deux membres, ce qui donne 30 = 5x."
                  : "Retire 5x des deux côtés (c’est un geste légal : on agit bien sur les deux membres). Il reste 30 = 5x, donc x = 6."
              }
              solved={r2}
              onAnswered={() => setR2(true)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="L’atelier"
      moduleSubtitle="Traduire, résoudre, interpréter"
      estimatedTime="7 min"
      brief={{
        tag: 'Entraînement',
        title: 'Le cycle complet',
        tone: 'amber',
        body: (
          <p>
            Deux problèmes, deux fois le même travail : <strong>traduire</strong> l’énoncé en
            équation, la <strong>résoudre</strong>, puis <strong>répondre</strong> à la question
            posée.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
