import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 5 — MANIPULATION : remonter la chaîne.
 *
 * Le sens « à rebours » est celui qui résiste le plus longtemps : l'élève
 * applique spontanément la baisse au prix FINAL (« −20 % de 96 »), au lieu de
 * diviser. Les questions ciblent exactement cette erreur, et le distracteur
 * la matérialise à chaque fois.
 *
 * Pas de nouveau laboratoire ici : l'instrument du module 4 a déjà installé
 * l'inverse, et ce module travaille la LECTURE d'énoncés — c'est un module
 * de mise en œuvre, pas de découverte (INTERACTION_PEDAGOGY §6bis.2 : ne pas
 * ajouter une manipulation qui ne révèle rien de neuf).
 */
export default function Module05RetrouverLaValeurInitiale() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le prix avant les soldes',
      done: q1,
      content: (
        <div className="space-y-3">
        {/* Pas de nouveau laboratoire ici : le geste qui donne du sens a été
            fait au module 4 (l'écart refermé par le coefficient INVERSE).
            La brique en tire la conséquence — remonter, c'est diviser —
            AVANT la première question, qui l'exige. */}
        <KnowledgeBrick
          id="retrouver-valeur-initiale"
          variant="new"
          lead={<>Au module 4, tu refermais l’écart en multipliant par l’inverse du coefficient. Ici on ne connaît pas le départ : c’est exactement le même geste, écrit comme une division.</>}
        />
        <NumericQuestion
          prompt="Après une remise de 20 %, un manteau coûte 96 €. Quel était son prix avant la remise, en euros ?"
          requires={['retrouver-valeur-initiale', 'evolution-reciproque', 'pourcentage']}
          above={(revealed) => (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-center">
              <MathText>{'$$V_i \\times k = V_f \\quad\\Longrightarrow\\quad V_i = \\frac{V_f}{k}$$'}</MathText>
              {revealed && <p className="text-xs text-cyan-700 mt-1">96 ÷ 0,80 = 120 €</p>}
            </div>
          )}
          expected={120} suffix="€"
          explain="96 ÷ 0,80 = 120 €. Vérification : 120 × 0,80 = 96 ✓. On DIVISE par le coefficient pour remonter."
          explainFor={(n) => (n === 115.2
            ? 'Tu as ajouté 20 % de 96 (soit 19,20 €). Mais les 20 % portaient sur le prix INITIAL, pas sur 96 : il faut diviser, 96 ÷ 0,80 = 120 €.'
            : n === 116
              ? 'Ajouter 20 € revient à supposer que la remise valait 20 € — or elle valait 20 % du prix de départ. 96 ÷ 0,80 = 120 €.'
              : n === 76.8
                ? 'Tu as appliqué la remise une seconde fois. Pour REMONTER, on divise : 96 ÷ 0,80 = 120 €.'
                : 'Prix initial = prix final ÷ coefficient = 96 ÷ 0,80 = 120 €.')}
          solved={q1} onAnswered={() => setQ1(true)}
        />
        {/* La vérification a été faite dans l'explication (120 × 0,80 = 96) :
            on en fait un réflexe, que les étapes 2 et 3 réemploieront. */}
        {q1 && (
          <KnowledgeBrick
            id="verification-systematique"
            variant="new"
            compact
            lead={<>Tu as trouvé 120 €, et 120 × 0,80 redonne bien 96 €. Ce contrôle coûte une multiplication.</>}
          />
        )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi pas « +20 % » ?',
      done: q2,
      content: (
        <TapQuestion
          prompt="Pour retrouver le prix d’avant une remise de 20 %, pourquoi n’ajoute-t-on pas simplement 20 % au prix soldé ?"
          options={[
            'Parce que 20 % du prix soldé est plus petit que 20 % du prix initial',
            'Parce qu’il faut ajouter 25 % au lieu de 20 %… et c’est équivalent à diviser par 0,8',
            'Les deux affirmations précédentes disent la même chose et sont justes',
            'On peut ajouter 20 %, cela revient au même',
          ]}
          correct={2} cols={1}
          requires={['retrouver-valeur-initiale', 'evolution-reciproque', 'formule-taux-reciproque', 'pourcentage']}
          explain="96 × 1,20 = 115,20 € ≠ 120 €, parce que la remise s’était calculée sur 120 € et non sur 96 €. Le taux réciproque de −20 % est +25 % (1 ÷ 0,8 = 1,25), et 96 × 1,25 = 120 € ✓ — c’est bien la division par 0,8."
          explainWrong="Les 20 % de la remise se calculaient sur le prix initial (120 €), soit 24 € ; 20 % du prix soldé ne valent que 19,20 €. Le bon taux de retour est +25 %, c’est-à-dire une division par 0,80."
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Remonter deux évolutions',
      done: q3,
      content: (
        <NumericQuestion
          prompt="Une population a augmenté de 10 %, puis diminué de 20 %. Elle compte aujourd’hui 8 800 habitants. Combien en comptait-elle au départ ?"
          requires={['retrouver-valeur-initiale', 'verification-systematique', 'coefficient-global', 'pourcentage']}
          above={(revealed) => (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-center">
              <MathText>{'$$k_{\\text{global}} = 1{,}10 \\times 0{,}80 = 0{,}88$$'}</MathText>
              {revealed && <p className="text-xs text-cyan-700 mt-1">8 800 ÷ 0,88 = 10 000 habitants</p>}
            </div>
          )}
          expected={10000} suffix="habitants"
          explain="k global = 1,10 × 0,80 = 0,88, donc V initiale = 8 800 ÷ 0,88 = 10 000. Vérification : 10 000 → 11 000 → 8 800 ✓."
          explainFor={(n) => (n === 8800 * 0.88 || Math.abs(n - 7744) < 1
            ? 'Tu as multiplié par 0,88 au lieu de diviser. Pour remonter la chaîne : 8 800 ÷ 0,88 = 10 000.'
            : (Math.abs(n - 8000) < 5 || Math.abs(n - 11000) < 5)
              ? 'Tu n’as remonté qu’UNE des deux évolutions (8 800 ÷ 1,10 = 8 000, ou 8 800 ÷ 0,80 = 11 000). Il faut remonter les deux d’un coup, par le coefficient global : 1,10 × 0,80 = 0,88, puis 8 800 ÷ 0,88 = 10 000.'
              : Math.abs(n - 9680) < 5
                ? 'Tu as remonté la baisse (÷0,8) mais appliqué la hausse dans le mauvais sens. Un seul calcul suffit : 8 800 ÷ (1,10 × 0,80) = 10 000.'
                : 'On divise par le coefficient GLOBAL : 8 800 ÷ 0,88 = 10 000 habitants.')}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Retrouver la valeur initiale" moduleSubtitle="Remonter la chaîne, c’est diviser" estimatedTime="9 min"
      brief={{
        tag: 'Manipulation', title: 'V_i = V_f ÷ k', tone: 'cyan',
        body: <p>On connaît le prix affiché après les soldes, pas celui d’avant. Toute la chaîne se remonte avec une seule division — à condition de diviser par le bon nombre.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Prochaine étape.</strong> Tu sais composer, inverser et remonter. Reste le plus difficile :
          décider, en lisant une phrase, laquelle de ces trois opérations elle demande.
        </KnowledgeSnapshot>
      )}
    />
  );
}
