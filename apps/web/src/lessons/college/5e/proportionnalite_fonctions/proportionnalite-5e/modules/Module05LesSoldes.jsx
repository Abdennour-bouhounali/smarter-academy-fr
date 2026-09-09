import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PercentLab from '../components/PercentLab';
import { percentOf, applyDiscount, discountFactor, fr, eur, parseDec } from '../components/propUtils';

/**
 * Module 5 — MANIPULATION : le pourcentage comme coefficient.
 *
 * Action → changement → observation → sens :
 *   glisser le taux → la barre se partage → « les deux parts font toujours
 *   100 % » → enlever 30 %, c'est garder 70 %, donc multiplier par 0,70.
 *
 * Expected observation : « le prix payé se calcule d'un seul coup, sans passer
 * par la soustraction ».
 * Misconception targeted : multiplier par 0,30 pour une remise de 30 %. Le
 * labo affiche EN PERMANENCE les deux calculs côte à côte (la réduction et le
 * prix payé), si bien que la confusion ne peut pas survivre à la manipulation.
 *
 * PÉRIMÈTRE : les évolutions successives et le coefficient ×(1 + t/100) d'une
 * hausse composée sont des objets de 4e/3e. Ici, une seule remise à la fois.
 */
const PRIX = 40;

export default function Module05LesSoldes() {
  const [taux1, setTaux1] = useState(0);
  const [vu1, setVu1] = useState(false);
  const done1 = vu1;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const bouger1 = (v, react) => {
    setTaux1(v);
    if (v >= 5 && !vu1) {
      setVu1(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Fais varier la remise',
      subtitle: 'La barre se partage : ce que tu économises, et ce que tu paies.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            La boutique du collège solde ses sweats à <strong>{eur(PRIX)}</strong>. L’affiche
            change tous les jours. Regarde ce que devient le prix.
          </div>
          <PercentLab prix={PRIX} taux={taux1} onTaux={(v) => bouger1(v, kit.react)} />
          {done1 ? (
            <Feedback tone="ok">
              À <strong>−{taux1} %</strong>, tu économises{' '}
              <strong className="font-mono">{eur(percentOf(taux1, PRIX))}</strong> et tu paies{' '}
              <strong className="font-mono">{eur(applyDiscount(taux1, PRIX))}</strong>. Remarque les
              deux petits calculs sous les cases : <strong>ce ne sont pas les mêmes nombres</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Glisse le taux. Que se passe-t-il quand la remise atteint 50 % ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Prendre une part de cent',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="pourcentage"
            variant="new"
            lead={<>Le nombre affiché sous « ce que j’économise » est un coefficient, lui aussi.</>}
          />
          <NumericQuestion
            prompt={
              <>
                La buvette a vendu <strong>80</strong> crêpes. <strong>25 %</strong> étaient au
                sucre. Combien de crêpes au sucre ?
              </>
            }
            expected={20}
            parse={parseDec}
            suffix="crêpes"
            requires={['pourcentage']}
            explain="25 % de 80, c’est 80 × 0,25 = 20 crêpes. (25 %, c’est aussi le quart : 80 ÷ 4 = 20.)"
            explainFor={(n) =>
              n === 25
                ? '25 est le taux, pas la quantité : il faut l’appliquer aux 80 crêpes. 80 × 0,25 = 20.'
                : 'Prendre 25 %, c’est multiplier par 25 ÷ 100 = 0,25. Ici : 80 × 0,25 = 20.'
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Enlever un pourcentage',
      subtitle: 'Le piège du chapitre — et le labo l’a déjà montré.',
      done: q3,
      content: (
        <div className="space-y-3">
          <PercentLab prix={PRIX} taux={30} onTaux={() => {}} />
          <KnowledgeBrick
            id="remise"
            variant="new"
            lead={<>Regarde les deux cases : {eur(percentOf(30, PRIX))} d’un côté, {eur(applyDiscount(30, PRIX))} de l’autre.</>}
          />
          <TapQuestion
            prompt={
              <>
                Par quel nombre faut-il multiplier un prix pour lui appliquer une remise de{' '}
                <strong>30 %</strong> ?
              </>
            }
            options={['0,70', '0,30', '30', '1,30']}
            cols={4}
            correct={0}
            requires={['remise', 'pourcentage']}
            explain="Une remise de 30 % laisse 100 % − 30 % = 70 % du prix. On multiplie donc par 0,70 : 40 × 0,70 = 28 €."
            explainWrong="Multiplier par 0,30 donne 12 € — c’est la RÉDUCTION, la somme qu’on économise, pas le prix à payer. Le prix payé, c’est ce qui reste : 0,70."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Au comptoir',
      done: q4,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={
              <>
                Un sac coûte <strong>60 €</strong>. Il est soldé à <strong>−15 %</strong>. Combien
                le paies-tu ?
              </>
            }
            expected={51}
            parse={parseDec}
            suffix="€"
            requires={['remise', 'pourcentage']}
            explain="Il reste 100 % − 15 % = 85 % du prix, donc 60 × 0,85 = 51 €. (Ou en deux temps : 15 % de 60 = 9 €, et 60 − 9 = 51 €.)"
            explainFor={(n) =>
              n === 9
                ? '9 € est la réduction, pas le prix. Tu dois encore la retirer du prix de départ : 60 − 9 = 51 €.'
                : n === 45
                  ? 'Tu as multiplié par 0,75 : c’est une remise de 25 %, pas de 15 %. Ici, il reste 85 % : 60 × 0,85 = 51 €.'
                  : 'Cherche ce qui RESTE après la remise : 100 % − 15 % = 85 %, donc 60 × 0,85.'
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Le coefficient d’une remise de <strong>{fr(15)} %</strong> est{' '}
              <strong className="font-mono">{fr(discountFactor(15))}</strong>. Il ne dépend pas du
              prix : il marche sur un sac à 60 € comme sur un sweat à 40 €.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Les soldes"
      moduleSubtitle="Le pourcentage est un coefficient"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Enlever 30 %, ce n’est pas multiplier par 0,30',
        tone: 'indigo',
        body: (
          <p>
            Une étiquette barrée, et deux nombres possibles : celui qu’on économise, celui qu’on
            paie. Ils ne se calculent pas avec le même coefficient — et c’est l’erreur la plus
            fréquente du chapitre. <strong>Fais glisser la remise</strong>, et regarde les deux.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
