import React, { useState } from 'react';
import { TrendingUp, Tag } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EvolutionLab from '../components/EvolutionLab';
import { parseDec, eur, pct, coefficientMultiplicateur, appliquerEvolution } from '../components/prop4e';

/**
 * Module 3 — MANIPULATION : une évolution est une multiplication.
 *
 * Activity              glisser un taux et voir le coefficient, le prix et la
 *                       barre bouger ensemble.
 * Mathematical objective augmenter de t, c'est multiplier par 1 + t ;
 *                       diminuer de t, c'est multiplier par 1 − t. Un SEUL
 *                       nombre porte l'évolution.
 * Student action        glisser le taux, cran par point de pourcentage.
 * Controlled variable   le taux.
 * Mathematical state    (depart, taux) ; coefficient et arrivée DÉRIVÉS.
 * Visual consequence    la barre d'arrivée dépasse ou n'atteint pas celle de
 *                       départ, et le coefficient franchit 1.
 * Expected observation  « quand le prix baisse, le coefficient descend
 *                       au-dessous de 1 ».
 * Misconception targeted enlever 20 % en soustrayant 20 (l'unité au lieu du
 *                       pourcentage) ; croire qu'une baisse se fait par une
 *                       multiplication par un nombre négatif.
 * Formalization         la brique `coefficient-multiplicateur` arrive après
 *                       que l'élève a vu le nombre franchir 1. La carte mémo
 *                       des quatre coefficients usuels arrive plus tard, à
 *                       l'étape 4 : une fois qu'on s'en est SERVI pour
 *                       calculer un prix, pas avant.
 */
const PRIX = 40;

export default function Module03LePrixQuiChange() {
  const [taux, setTaux] = useState(0.25);
  const [vus, setVus] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  // On compte les réglages CLAIREMENT DISTINCTS (≥ 10 points d'écart) : un
  // glissement continu ne doit pas valider l'étape instantanément.
  const noter = (t) => {
    setTaux(t);
    setVus((v) => (v.some((x) => Math.abs(x - t) < 0.1) ? v : [...v, t]));
  };
  const auMoinsUneHausse = vus.some((t) => t > 0.02);
  const auMoinsUneBaisse = vus.some((t) => t < -0.02);
  const done1 = auMoinsUneHausse && auMoinsUneBaisse;

  const lab = <EvolutionLab depart={PRIX} taux={taux} onTaux={noter} />;

  const steps = [
    {
      num: 1,
      title: 'Fais monter, puis fais descendre',
      subtitle: 'Un sweat à 40 €. Glisse le taux dans les deux sens et regarde le nombre encadré.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Avant de glisser : pour augmenter un prix de 20 %, par quel nombre penses-tu qu’on multiplie ?"
            options={[
              { id: 'p20', label: 'Par 20' },
              { id: 'p1-2', label: 'Par 1,2' },
              { id: 'p0-2', label: 'Par 0,2' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {!done1 && (
            <Feedback tone="info">
              {auMoinsUneHausse ? 'Tu as fait monter le prix. ' : ''}
              {auMoinsUneBaisse ? 'Tu as fait baisser le prix. ' : ''}
              Essaie aussi {auMoinsUneHausse ? 'une baisse' : 'une hausse'}.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Le nombre encadré franchit 1 exactement quand le prix cesse de monter pour
              descendre : au-dessus de 1 il augmente, au-dessous il diminue.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le nombre qui porte l’évolution',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Pour augmenter un prix de 20 %, par quel nombre multiplie-t-on ?"
            options={['1,2', '0,2', '20', '1,02']}
            correct={0}
            cols={4}
            requires={['pourcentage']}
            explain="Le prix de départ compte pour 1, et on lui ajoute 0,2 de lui-même : 1 + 0,2 = 1,2."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="coefficient-multiplicateur"
              variant="new"
              lead="Ce nombre encadré, tu viens de le voir franchir 1 dans les deux sens."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et pour une baisse ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Règle le curseur sur {pct(-0.3)} et lis le nombre encadré.
          </p>
          {lab}
          <NumericQuestion
            prompt="Par quel nombre multiplie-t-on pour diminuer un prix de 30 % ?"
            expected={0.7}
            parse={parseDec}
            requires={['coefficient-multiplicateur']}
            explain="On garde 70 % du prix : 1 − 0,3 = 0,7. Diminuer, c’est multiplier par un nombre plus petit que 1 — jamais par un nombre négatif."
            explainFor={(n) => {
              if (n === 0.3) return 'Attention : 0,3 est ce qu’on ENLÈVE. Ce qui reste, c’est 1 − 0,3 = 0,7.';
              if (n === -0.3 || n === -0.7) return 'Un coefficient n’est jamais négatif : un prix qui baisse reste positif. On garde 1 − 0,3 = 0,7 du prix.';
              if (n === 1.3) return '1,3 ferait AUGMENTER le prix de 30 %. Pour une baisse, on descend au-dessous de 1 : 0,7.';
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'À toi de calculer',
      done: q4,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={`Une place de cinéma coûte 12 €. Elle augmente de 15 %. Quel est le nouveau prix, en euros ?`}
            expected={appliquerEvolution(12, 0.15)}
            parse={parseDec}
            suffix="€"
            requires={['coefficient-multiplicateur']}
            explain={`12 × ${coefficientMultiplicateur(0.15)} = ${eur(appliquerEvolution(12, 0.15))}.`}
            explainFor={(n) => {
              if (n === 15 || n === 27) return 'Attention : 15 est un POURCENTAGE, pas un nombre d’euros. On multiplie par 1,15, on n’ajoute pas 15.';
              if (n === 1.8) return 'Tu as trouvé la HAUSSE (12 × 0,15 = 1,80 €). Le nouveau prix est 12 + 1,80, soit 12 × 1,15.';
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="mem-coefficient"
              variant="new"
              lead="Quatre coefficients reviennent tout le temps : autant les avoir en tête."
            />
          )}
          {q4 && (
            <Feedback tone="info">
              Une question reste : si ce prix baisse ensuite de 15 %, revient-on à 12 € ?
              C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le prix qui change"
      moduleSubtitle="Augmenter et diminuer, avec un seul nombre"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'Un sweat à 40 €',
        tone: 'indigo',
        body: (
          <>
            Les prix montent, les prix baissent. À chaque fois, un seul nombre suffit à dire
            de combien. <strong>Lequel, et comment le trouver ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Glisse le taux et surveille le nombre encadré en bas.{' '}
            <Tag className="inline h-4 w-4" aria-hidden="true" /> Il change en même temps que le
            prix — et il franchit 1 à un moment précis.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
