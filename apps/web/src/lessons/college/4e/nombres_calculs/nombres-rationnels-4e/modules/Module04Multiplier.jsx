import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { FractionView, FractionField } from '../../../../../common/algebra4e';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProduitGrille from '../components/ProduitGrille';
import { q, produit, diagnostiquerProduit } from '../components/rationnels4e';

/**
 * Module 4 — MANIPULATION : le produit, lu sur un quadrillage.
 *
 * Activity              choisir les deux fractions et regarder la zone commune
 *                       du rectangle.
 * Mathematical objective multiplier, c'est prendre une PART D'UNE PART. La
 *                       règle « numérateurs entre eux, dénominateurs entre
 *                       eux » se COMPTE sur la figure au lieu de se retenir.
 * Expected observation  la zone commune est toujours PLUS PETITE que chacune
 *                       des deux bandes : multiplier par un nombre inférieur à
 *                       1 fait diminuer.
 * Misconception targeted « multiplier fait grandir » (vrai sur les entiers,
 *                       faux ici), et « il faut un dénominateur commun pour
 *                       multiplier » — la confusion avec l'addition du M3.
 */
const CHOIX_A = [q(1, 2), q(2, 3), q(3, 4), q(1, 3)];
const CHOIX_B = [q(1, 2), q(1, 3), q(3, 4), q(2, 5)];

export default function Module04Multiplier() {
  const [ia, setIa] = useState(1);   // 2/3
  const [ib, setIb] = useState(2);   // 3/4
  const [essais, setEssais] = useState(0);
  const explore = essais >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const A = CHOIX_A[ia];
  const B = CHOIX_B[ib];

  const Selecteur = ({ label, choix, index, onIndex, tone }) => (
    <div className="space-y-1.5">
      <p className="text-[13px] font-semibold text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {choix.map((f, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onIndex(i)}
            aria-pressed={i === index}
            className={`min-h-[44px] rounded-xl border-2 px-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              i === index ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400'
            }`}
          >
            <FractionView value={f} size="sm" tone={i === index ? tone : 'slate'} />
          </button>
        ))}
      </div>
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Une part d’une part',
      subtitle: 'Change les deux fractions et regarde la zone verte — celle qui appartient aux deux.',
      done: explore,
      content: (kit) => (
        <div className="space-y-3">
          <ProduitGrille a={A} b={B} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Selecteur
              label="Première fraction"
              choix={CHOIX_A}
              index={ia}
              tone="indigo"
              onIndex={(i) => {
                setIa(i);
                const n = essais + 1;
                setEssais(n);
                if (n === 3) kit.react(true);
              }}
            />
            <Selecteur
              label="Seconde fraction"
              choix={CHOIX_B}
              index={ib}
              tone="violet"
              onIndex={(i) => {
                setIb(i);
                const n = essais + 1;
                setEssais(n);
                if (n === 3) kit.react(true);
              }}
            />
          </div>
          {explore ? (
            <Feedback tone="ok">
              À chaque fois, la zone verte couvre <strong>{A.n} × {B.n}</strong> cases sur{' '}
              <strong>{A.d} × {B.d}</strong>. Le produit se lit donc directement : on multiplie les
              numérateurs entre eux et les dénominateurs entre eux. Et remarque : la zone verte est
              toujours <strong>plus petite</strong> que chacune des deux bandes — multiplier par un
              nombre inférieur à 1 fait <strong>diminuer</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Essaie encore deux ou trois combinaisons. Compte les cases vertes, puis le total.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Calcule sans la grille',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="produit-fractions"
            variant="new"
            lead={<>Tu as compté les cases de la zone commune : leur nombre était toujours le produit des numérateurs, sur le produit des dénominateurs.</>}
          />
          <FractionField
            prompt={
              <span className="inline-flex flex-wrap items-center gap-1.5">
                Combien fait
                <FractionView value={q(3, 5)} size="sm" tone="indigo" />
                <span className="font-black">×</span>
                <FractionView value={q(2, 7)} size="sm" tone="violet" />
                <span>?</span>
              </span>
            }
            expected={produit(q(3, 5), q(2, 7))}
            allowNegative={false}
            requires={['produit-fractions']}
            explain="3 × 2 = 6 en haut, 5 × 7 = 35 en bas : 6/35. Aucun dénominateur commun n’est nécessaire — c’est l’opération la plus simple des quatre."
            explainFor={(rep) => {
              const code = diagnostiquerProduit(q(3, 5), q(2, 7), rep);
              if (code === 'a-additionne') {
                return "Tu as additionné : là il aurait fallu un dénominateur commun. Mais pour MULTIPLIER, on n’en a pas besoin — on multiplie simplement en haut et en bas.";
              }
              if (code === 'produit-en-croix') {
                return "Tu as multiplié en diagonale. Le produit en croix sert à TESTER une égalité, pas à calculer un produit : ici on multiplie haut par haut et bas par bas.";
              }
              return "On multiplie les numérateurs entre eux (3 × 2 = 6) et les dénominateurs entre eux (5 × 7 = 35).";
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Plus grand ou plus petit ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={
              <span className="inline-flex flex-wrap items-center gap-1.5">
                Sans calculer : le résultat de
                <span className="font-mono font-bold">12 ×</span>
                <FractionView value={q(3, 4)} size="sm" tone="violet" />
                <span>est-il plus grand ou plus petit que 12 ?</span>
              </span>
            }
            options={[
              'Plus petit : on prend seulement les trois quarts de 12',
              'Plus grand : une multiplication fait toujours grandir',
              'Égal à 12',
              'On ne peut pas le dire sans calculer',
            ]}
            correct={0}
            cols={1}
            requires={['produit-fractions']}
            explain="Multiplier par 3/4, c’est prendre les trois quarts : on obtient 9, plus petit que 12. « Multiplier fait grandir » n’est vrai que si le second facteur dépasse 1."
            explainWrong="C’est l’habitude prise sur les entiers qui trompe ici : multiplier par un nombre INFÉRIEUR À 1 fait toujours diminuer — c’est ce que montrait la zone verte, plus petite que chacune des bandes."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Multiplier"
      moduleSubtitle="Prendre une part d’une part"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Les deux tiers des trois quarts',
        tone: 'indigo',
        body: (
          <p>
            Additionner deux fractions demandait tout un travail de graduation. Pour les{' '}
            <strong>multiplier</strong>, tu vas voir que c’est bien plus simple — et que la réponse
            se <strong>compte</strong> sur un quadrillage.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
