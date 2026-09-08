import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DivisionScaleLab from '../components/DivisionScaleLab';
import { div, fr, parseDecimalFr, equivalentDivision } from '../components/operations';

/**
 * Module 6 — MANIPULATION : diviser par un nombre décimal.
 *
 * Activity              multiplier le dividende ET le diviseur par 10, autant
 *                       de fois qu'on veut, et surveiller le quotient.
 * Mathematical objective le quotient est invariant quand les deux termes sont
 *                       multipliés par le même nombre ; on s'en sert pour se
 *                       ramener à un diviseur entier.
 * Student action        toucher « × 10 » (et « ÷ 10 » pour revenir).
 * Visual consequence    les deux nombres du haut changent, le quotient ne
 *                       bouge pas, et le diviseur passe en vert quand il
 *                       devient entier.
 * Expected observation  « les deux nombres grandissent, et le résultat reste
 *                       le même » — puis « donc je peux toujours faire
 *                       disparaître la virgule du diviseur ».
 * Misconception targeted croire que diviser rend forcément plus petit ; ne
 *                       décaler la virgule que d'UN seul des deux nombres.
 *
 * Rejouable dans les deux sens à tout moment ; aucune étape ne fige le
 * laboratoire (frozen-manipulation bug class).
 */
const A1 = 7.2;
const B1 = 0.4;

export default function Module05DiviserParUnDecimal() {
  const [pred, setPred] = useState(null);
  const [exp1, setExp1] = useState(0);
  const [vuEntier, setVuEntier] = useState(false);
  const done1 = vuEntier;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const majExp = (e, react) => {
    setExp1(e);
    if (e >= 1 && !vuEntier) { setVuEntier(true); react?.(true); }
  };

  const eq = equivalentDivision(A1, B1);

  const steps = [
    {
      num: 1,
      title: 'Fais disparaître la virgule du diviseur',
      subtitle: 'Le bouton × 10 multiplie les DEUX nombres à la fois. Surveille le quotient pendant que tu le fais.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DivisionScaleLab
            a={A1}
            b={B1}
            exposant={exp1}
            onExposant={(e) => majExp(e, kit.react)}
            ariaLabel="Division 7,2 ÷ 0,4 — multiplie les deux nombres par 10"
          />
          <PredictionChips
            prompt="si on multiplie les deux nombres par 10, que va devenir le quotient ?"
            options={[
              { id: 'meme', label: 'Il restera le même' },
              { id: 'dix', label: 'Il sera 10 fois plus grand' },
              { id: 'cent', label: 'Il sera 100 fois plus grand' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred === 'meme' ? 'Ta prédiction était la bonne' : 'Regarde bien'} : le quotient est
              resté <strong>{fr(div(A1, B1))}</strong>, alors que les deux nombres du haut ont été
              multipliés par 10. Rien d’étonnant : deux fois plus de gâteau pour deux fois plus de
              personnes, chacun a toujours la même part. Et le diviseur, lui, est devenu{' '}
              <strong>entier</strong> : la division est redevenue une division que tu connais
              depuis la 6e.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Touche <strong className="font-mono">× 10</strong>. Ne quitte pas le quotient des
              yeux. (Tu peux revenir en arrière avec <strong className="font-mono">÷ 10</strong>.)
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi ça marche',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="quotient-invariant"
            variant="new"
            lead={<>Tu viens de multiplier les deux nombres par 10 sans que le résultat bouge. C’est la propriété qui rend toute la méthode possible.</>}
          />
          <TapQuestion
            prompt={<>Pourquoi <span className="font-mono font-bold">7,2 ÷ 0,4</span> donne-t-il le même résultat que <span className="font-mono font-bold">72 ÷ 4</span> ?</>}
            options={[
              'Parce que les DEUX nombres ont été multipliés par 10',
              'Parce qu’on a supprimé les virgules, ce qui ne compte pas',
              'Parce que 7,2 et 72 sont le même nombre',
              'Parce que la division est toujours approximative',
            ]}
            correct={0}
            cols={1}
            requires={['quotient-invariant']}
            explain="Multiplier le dividende et le diviseur par le même nombre ne change pas le partage. C’est parce qu’on l’a fait des DEUX côtés que le quotient est conservé."
            explainWrong="Une virgule ne se « supprime » jamais sans conséquence : 7,2 et 72 sont deux nombres bien différents. Ce qui sauve le résultat, c’est d’avoir multiplié le dividende ET le diviseur par 10 — les deux, en même temps."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La méthode, sur un cas plus corsé',
      subtitle: 'Ici le diviseur a DEUX chiffres après la virgule.',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="diviser-decimal"
            variant="new"
            lead={<>Le geste que tu as fait au doigt devient une méthode qui marche pour n’importe quel diviseur décimal.</>}
          />
          <NumericQuestion
            prompt={<>Combien vaut <span className="font-mono font-bold">6 ÷ 0,25</span> ?</>}
            expected={24}
            parse={parseDecimalFr}
            display="24"
            requires={['diviser-decimal', 'quotient-invariant']}
            explain="0,25 a deux chiffres après la virgule : on multiplie les deux nombres par 100. La division devient 600 ÷ 25 = 24."
            explainFor={(n) => {
              if (n === 1.5) return 'Tu as sans doute multiplié 6 par 0,25 au lieu de diviser. Diviser par 0,25, c’est demander « combien de fois 0,25 tient-il dans 6 ? » — un quart tient quatre fois dans 1, donc 24 fois dans 6.';
              if (n === 2.4 || n === 240) return 'Attention au nombre de rangs : 0,25 a DEUX chiffres après la virgule, il faut donc multiplier par 100 (pas par 10) — des deux côtés. 600 ÷ 25 = 24.';
              return 'Multiplie les deux nombres par 100 : 600 ÷ 25 = 24.';
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le résultat peut-il être plus grand ?',
      subtitle: 'Une surprise qui n’en est pas une, une fois qu’on l’a comprise.',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<>On calcule <span className="font-mono font-bold">9 ÷ 0,5</span>. Sans poser le calcul, que peut-on dire du résultat ?</>}
            options={[
              'Il est plus grand que 9, car 0,5 tient plus de 9 fois dans 9',
              'Il est plus petit que 9, car une division rend toujours plus petit',
              'Il vaut exactement 9, car diviser par un demi ne change rien',
              'Il est impossible de le savoir sans calculer',
            ]}
            correct={0}
            cols={1}
            requires={['diviser-decimal', 'quotient-invariant']}
            explain="Diviser par 0,5, c’est demander « combien de demis dans 9 ? ». Il y a deux demis dans chaque unité, donc 18 en tout. 9 ÷ 0,5 = 90 ÷ 5 = 18, bien plus grand que 9."
            explainWrong="« Diviser rend plus petit » n’est vrai que si l’on divise par un nombre plus grand que 1. Quand le diviseur est plus petit que 1, il tient BEAUCOUP de fois dans le dividende : le quotient devient plus grand. C’est l’un des pièges les plus fréquents."
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
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Diviser par un décimal"
      moduleSubtitle="Faire disparaître la virgule sans changer le résultat"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Une virgule au diviseur',
        tone: 'indigo',
        body: (
          <p>
            <strong className="font-mono">7,2 ÷ 0,4</strong> : impossible à poser tel quel — tu n’as
            jamais divisé par un nombre à virgule. Mais il existe un geste qui transforme cette
            division en une division que tu connais déjà, <strong>sans changer le résultat</strong>.
            Trouve-le.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
