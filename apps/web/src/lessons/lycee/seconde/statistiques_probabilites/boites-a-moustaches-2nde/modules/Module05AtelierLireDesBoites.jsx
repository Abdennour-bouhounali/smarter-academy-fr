import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { BoxPlot } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 5 — LABORATOIRE D'ENTRAÎNEMENT. Deux contextes réels : des temps de
 * réponse serveur (où la longue moustache droite est le vrai sujet) et des
 * notes de deux classes. Les erreurs n'y comptent jamais comme preuve de
 * maîtrise (stage practice_lab).
 *
 * Les séries sont reconstruites à partir de leurs cinq nombres : une série
 * de 9 valeurs dont les quartiles tombent exactement sur les valeurs voulues
 * (rangs 3, 5 et 7 pour n = 9), ce qui garantit que la boîte dessinée est
 * bien celle annoncée dans l'énoncé.
 */
const fromFive = ([min, q1, med, q3, max]) => [min, min, q1, med, med, med, q3, max, max];

const SERVEUR_A = fromFive([120, 180, 200, 240, 900]);
const SERVEUR_B = fromFive([150, 190, 210, 230, 320]);
const CLASSE_X = fromFive([4, 9, 12, 15, 20]);
const CLASSE_Y = fromFive([8, 11, 12, 13, 16]);

export default function Module05AtelierLireDesBoites() {
  const [a1, setA1] = useState(false);
  const [a2, setA2] = useState(false);
  const [b1, setB1] = useState(false);

  const Situation = ({ emoji, title, children }) => (
    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-4 space-y-3">
      <p className="text-sm font-black text-rose-900">{emoji} {title}</p>
      {children}
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Deux serveurs',
      done: a1 && a2,
      content: (
        <Situation emoji="🖥️" title="Temps de réponse (ms) de deux serveurs">
          <BoxPlot series={[
            { id: 'a', label: 'Serveur A', values: SERVEUR_A, color: '#0284c7' },
            { id: 'b', label: 'Serveur B', values: SERVEUR_B, color: '#c026d3' },
          ]} domain={{ min: 100, max: 920 }} unit="ms" />
          <TapQuestion
            prompt="Le serveur A a la médiane la plus basse (200 ms contre 210 ms). Faut-il le préférer ?"
            options={[
              'Pas si vite : sa moustache droite va jusqu’à 900 ms — un quart des requêtes s’étale jusque-là',
              'Oui : une médiane plus basse suffit à trancher',
              'Non : le serveur B a une médiane plus basse',
              'Impossible de comparer sans les moyennes',
            ]}
            correct={0} cols={1}
            requires={['mediane-ne-dit-pas-tout', 'mediane-stat', 'dispersion']}
            explain="Les médianes sont quasi identiques (200 et 210 ms) : elles ne départagent rien. Ce qui distingue les serveurs, c’est la queue : A atteint 900 ms là où B plafonne à 320 ms. Pour un service en ligne, ce sont justement ces requêtes lentes qui font la mauvaise expérience."
            explainWrong="Un écart de 10 ms sur la médiane est négligeable devant une moustache qui s’étend jusqu’à 900 ms. Comparer deux boîtes ne se réduit jamais à comparer deux médianes."
            solved={a1} onAnswered={() => setA1(true)}
          />
          {/* Le premier situation vient de montrer la méthode que l'atelier
              met en pratique : regarder d'abord si les médianes se
              distinguent vraiment, puis la dispersion et les moustaches. */}
          {a1 && (
            <KnowledgeBrick
              id="interpreter-contexte"
              variant="new"
              lead={<>Tu viens de le faire : médianes quasi égales, donc regarder la dispersion et les moustaches — souvent le vrai sujet.</>}
            />
          )}
          {a1 && (
            <NumericQuestion
              prompt="Pour le serveur A : Q1 = 180 ms et Q3 = 240 ms. Quel est son écart interquartile ?"
              expected={60} suffix="ms"
              requires={['interpreter-contexte', 'quartile', 'etendue']}
              explain="240 − 180 = 60 ms. Remarque : cet écart interquartile est faible alors que l’étendue vaut 900 − 120 = 780 ms — tout le problème du serveur A est dans sa moustache droite, pas dans son cœur."
              explainFor={(n) => (n === 780
                ? '780 ms est l’ÉTENDUE (900 − 120). L’écart interquartile est la largeur du rectangle : 240 − 180 = 60 ms.'
                : 'Écart interquartile = Q3 − Q1 = 240 − 180 = 60 ms.')}
              solved={a2} onAnswered={() => setA2(true)}
            />
          )}
        </Situation>
      ),
    },
    {
      num: 2,
      title: 'Deux classes, même médiane',
      done: b1,
      content: (
        <Situation emoji="📝" title="Notes sur 20 dans deux classes">
          <BoxPlot series={[
            { id: 'x', label: 'Classe X', values: CLASSE_X, color: '#0284c7' },
            { id: 'y', label: 'Classe Y', values: CLASSE_Y, color: '#c026d3' },
          ]} domain={{ min: 0, max: 20 }} unit="/20" />
          <TapQuestion
            prompt="Les deux classes ont la même médiane (12). Que peut-on dire de plus ?"
            options={[
              'La classe Y est bien plus homogène : sa boîte et ses moustaches sont plus courtes',
              'Les deux classes ont exactement le même profil',
              'La classe X est meilleure, sa note maximale est plus élevée',
              'La classe Y a de meilleurs résultats en général',
            ]}
            correct={0} cols={1}
            requires={['interpreter-contexte', 'mediane-ne-dit-pas-tout', 'quartile', 'dispersion']}
            explain="Médiane identique, dispersions opposées : X s’étale de 4 à 20 (écart interquartile 6), Y de 8 à 16 (écart interquartile 2). En X coexistent des élèves en difficulté et d’excellents ; en Y presque tout le monde tourne autour de 12. La médiane seule ne l’aurait jamais montré."
            explainWrong="Une note maximale plus haute concerne un seul élève et ne rend pas la classe « meilleure » : la médiane est la même. Ce qui les distingue est l’ÉTALEMENT des résultats."
            solved={b1} onAnswered={() => setB1(true)}
          />
        </Situation>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Atelier : lire des boîtes" moduleSubtitle="Deux contextes, deux pièges" estimatedTime="7 min"
      brief={{
        tag: 'Atelier', title: 'Ne pas s’arrêter à la médiane', tone: 'rose',
        body: <p>Face à des boîtes, regarder d’abord si les médianes se distinguent vraiment — puis, presque toujours, la dispersion et les moustaches. Les erreurs ne comptent pas ici.</p>,
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
