import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT. Trois situations réelles, chacune
 * posant d'abord la question « de quel tout parle-t-on ? » avant tout calcul.
 * Les erreurs n'y comptent jamais comme preuve de maîtrise (stage
 * practice_lab) : les questions sont scaffoldées et corrigées sur place.
 */
export default function Module06AtelierLireLesPourcentages() {
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const [b1, setB1] = useState(false);
  const [b2, setB2] = useState(false);
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);

  const Situation = ({ emoji, title, children }) => (
    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-4 space-y-3">
      <p className="text-sm font-black text-rose-900">{emoji} {title}</p>
      {children}
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'La remise du magasin',
      done: a1 && a2,
      content: (
        <Situation emoji="🏷️" title="« −40 % sur le deuxième article »">
          <p className="text-sm text-slate-700">
            Deux articles à 60 € chacun. Le second est vendu avec 40 % de remise.
          </p>
          <TapQuestion
            prompt="La remise de 40 % porte sur quoi ?"
            options={['Sur le total des deux articles (120 €)', 'Sur le second article seulement (60 €)', 'Sur chacun des deux articles']}
            correct={1} cols={1}
            explain="« Sur le deuxième article » désigne la référence : 40 % de 60 €, soit 24 € de remise. Rapportée aux 120 € payés au départ, la remise ne représente que 20 %."
            explainWrong="La phrase précise elle-même son tout de référence : le deuxième article. La remise est donc 0,40 × 60 = 24 €."
            solved={a1} onAnswered={() => setA1(true)}
          />
          {a1 && (
            <NumericQuestion
              prompt="Combien paie-t-on les deux articles au total, en euros ?"
              expected={96} suffix="€"
              explain="60 + 60 × 0,60 = 60 + 36 = 96 €. La remise vaut 24 €, soit 20 % du prix initial des deux articles."
              explainFor={(n) => (n === 72
                ? 'Tu as appliqué la remise aux deux articles : 120 × 0,60 = 72 €. Or elle ne porte que sur le second : 60 + 36 = 96 €.'
                : n === 36
                  ? '36 € est le prix du SECOND article après remise. Il faut y ajouter le premier, plein tarif : 60 + 36 = 96 €.'
                  : 'Premier article plein tarif (60 €) + second remisé (60 × 0,60 = 36 €) = 96 €.')}
              solved={a2} onAnswered={() => setA2(true)}
            />
          )}
        </Situation>
      ),
    },
    {
      num: 2,
      title: 'Le sondage',
      done: b1 && b2,
      content: (
        <Situation emoji="🗳️" title="« 55 % des inscrits ont voté ; 60 % d’entre eux ont choisi A »">
          <p className="text-sm text-slate-700">Le lycée compte 800 inscrits au conseil de vie lycéenne.</p>
          <TapQuestion
            prompt="Les 60 % qui ont choisi A se comptent parmi…"
            options={['les 800 inscrits', 'les votants seulement', 'les abstentionnistes']}
            correct={1} cols={3}
            explain="« d’entre eux » renvoie aux votants. La part de A parmi TOUS les inscrits est 0,55 × 0,60 = 33 %."
            explainWrong="Le mot « d’entre eux » désigne le groupe précédemment cité : les votants. C’est une proportion de proportion."
            solved={b1} onAnswered={() => setB1(true)}
          />
          {b1 && (
            <NumericQuestion
              prompt="Combien d’inscrits ont voté pour A ?"
              expected={264} suffix="inscrits"
              explain="800 × 0,55 = 440 votants, puis 440 × 0,60 = 264. Soit directement 800 × 0,55 × 0,60 = 264, c’est-à-dire 33 % des inscrits."
              explainFor={(n) => (n === 480
                ? '480 = 800 × 0,60 : tu as appliqué les 60 % à tous les inscrits. Ils ne portent que sur les 440 votants : 440 × 0,60 = 264.'
                : n === 440
                  ? '440 est le nombre de votants, tous choix confondus. Parmi eux, 60 % ont choisi A : 440 × 0,60 = 264.'
                  : '800 × 0,55 × 0,60 = 264.')}
              solved={b2} onAnswered={() => setB2(true)}
            />
          )}
        </Situation>
      ),
    },
    {
      num: 3,
      title: 'Le loyer',
      done: c1 && c2,
      content: (
        <Situation emoji="🏠" title="« Le loyer augmente de 4 % ; la part du loyer dans le budget passe de 30 % à 31 % »">
          <p className="text-sm text-slate-700">Deux pourcentages dans la même phrase — mais pas de la même nature.</p>
          <TapQuestion
            prompt="Le « 4 % » et le passage de « 30 % à 31 % » décrivent…"
            options={[
              'deux évolutions',
              'deux états',
              'une évolution (4 %) et deux états (30 % et 31 %)',
              'la même chose dite deux fois',
            ]}
            correct={2} cols={1}
            explain="4 % est une évolution du loyer (rapportée au loyer précédent). 30 % et 31 % sont deux états : la part du loyer dans le budget, à deux dates. Le passage de 30 % à 31 % vaut +1 point, soit une évolution de +3,3 %."
            explainWrong="Le test : « de quoi est-ce une part ? » 30 % est une part du budget — un état. 4 % n’est la part de rien : c’est un changement du loyer."
            solved={c1} onAnswered={() => setC1(true)}
          />
          {c1 && (
            <NumericQuestion
              prompt="Le loyer était de 750 €. Combien devient-il après la hausse de 4 %, en euros ?"
              expected={780} suffix="€"
              explain="750 × 1,04 = 780 €. Le coefficient 1,04 fait l’opération en une fois."
              explainFor={(n) => (n === 30
                ? '30 € est l’augmentation. Le nouveau loyer est 750 + 30 = 780 €, soit 750 × 1,04.'
                : n === 3000
                  ? 'Tu as multiplié par 4 au lieu de 1,04. Un taux de 4 % s’écrit 0,04 en décimal : k = 1,04.'
                  : '750 × (1 + 0,04) = 780 €.')}
              solved={c2} onAnswered={() => setC2(true)}
            />
          )}
        </Situation>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="Atelier : lire les pourcentages" moduleSubtitle="Trois situations, une seule question de départ" estimatedTime="8 min"
      brief={{
        tag: 'Atelier', title: 'De quel tout parle-t-on ?', tone: 'rose',
        body: <p>Dans chaque situation, commence par identifier la référence : c’est elle qui décide du calcul. Les erreurs ne comptent pas ici — c’est un entraînement.</p>,
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
