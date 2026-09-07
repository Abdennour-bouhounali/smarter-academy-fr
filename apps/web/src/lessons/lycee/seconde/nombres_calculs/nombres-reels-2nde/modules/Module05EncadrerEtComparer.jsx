import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import OrderingGame from '../../../../../common/components/OrderingGame';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SquareBracketer from '../components/SquareBracketer';
import { sqrtIntegerBracket } from '../components/realsUtils';

/**
 * Module 5 — PRACTICE LAB : « Encadrer et comparer ».
 *
 * Activity: encadrer √10 par des carrés (entiers, puis dixièmes) ; ranger
 *   √2 parmi ses approximations ; encadrer la diagonale d'un champ carré et
 *   décider la longueur de câble à acheter.
 * Mathematical objective: encadrer √n ⇔ encadrer n par deux carrés ;
 *   comparer des réels d'écritures différentes en les ramenant sur la
 *   droite ; arrondir dans le sens que la situation impose.
 * Scaffolding: manipulation (SquareBracketer), puis OrderingGame, puis
 *   questions sans instrument.
 */
const ITEMS = [
  { id: 'a', value: 1.4, text: '1,4' },
  { id: 'b', value: 1.41, text: '1,41' },
  { id: 'c', value: Math.SQRT2, text: '√2', label: '≈ 1,4142' },
  { id: 'd', value: 1.42, text: '1,42' },
  { id: 'e', value: 1.5, text: '3/2' },
];

export default function Module05EncadrerEtComparer() {
  const [tried0, setTried0] = useState(() => new Set());
  const [tried1, setTried1] = useState(() => new Set());
  const [orderDone, setOrderDone] = useState(false);
  const [lowDone, setLowDone] = useState(false);
  const [cableDone, setCableDone] = useState(false);
  const b0 = sqrtIntegerBracket(10);
  const found0 = tried0.has(b0.lo) && tried0.has(b0.hi);
  const found1 = tried1.has(3.1) && tried1.has(3.2);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Encadrer et comparer"
      moduleSubtitle="Encadre √10 par des carrés, range √2 parmi ses approximations, puis clôture un champ dont la diagonale n’est pas décimale."
      estimatedTime="11 min"
      brief={{
        tag: '🧭 Mission 06',
        title: 'Sans calculatrice : entre quels nombres se cache √10 ?',
        tone: 'indigo',
        body: <p>√10 est le nombre dont le carré vaut 10. Pour l’encadrer, encadre 10 par deux carrés.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Encadre √10 par deux entiers',
          done: found0,
          content: (kit) => (
            <SquareBracketer n={10} level={0} tried={tried0} onTry={(a) => { const s = new Set(tried0); s.add(a); setTried0(s); if (s.has(b0.lo) && s.has(b0.hi) && !found0) kit.react(true); }} />
          ),
        },
        {
          num: 2,
          title: 'Puis au dixième',
          subtitle: 'Même méthode entre 3 et 4 : des carrés de décimaux.',
          done: found1,
          content: (kit) => (
            <div className="space-y-3">
              <SquareBracketer n={10} level={1} tried={tried1} onTry={(a) => { const s = new Set(tried1); s.add(a); setTried1(s); if (s.has(3.1) && s.has(3.2) && !found1) kit.react(true); }} />
              {found1 && <Feedback tone="ok">3,1² = 9,61 ≤ 10 &lt; 10,24 = 3,2² : donc 3,1 ≤ √10 &lt; 3,2. On pourrait continuer au centième (3,16² = 9,9856 ; 3,17² = 10,0489) — l’encadrement se resserre, √10 ne tombe jamais dessus.</Feedback>}
              {/* Les deux encadrements de √10 (entiers, puis dixièmes) viennent
                  de montrer la méthode : encadrer n par deux carrés encadre √n. */}
              {found1 && (
                <KnowledgeBrick
                  id="methode-encadrer-racine"
                  variant="new"
                  lead={<>Tu viens d’encadrer √10 deux fois : d’abord par 3 et 4, puis par 3,1 et 3,2.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Range dans l’ordre croissant',
          done: orderDone,
          content: (
            <div className="space-y-3">
              <OrderingGame
                items={ITEMS}
                direction="asc"
                formative
                solved={orderDone}
                onSolved={() => setOrderDone(true)}
                instruction="Touche les cartes dans l’ordre croissant. √2 ≈ 1,4142… et 3/2 = 1,5."
              />
              {/* Le rangement vient de faire comparer des écritures
                  différentes (décimaux, racine, fraction) sur une même droite. */}
              {orderDone && (
                <KnowledgeBrick
                  id="methode-comparer-reels"
                  variant="new"
                  compact
                  lead={<>Tu viens de ranger 1,4 ; 1,41 ; √2 ; 1,42 et 3/2 en les ramenant à une même écriture décimale.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'La diagonale du champ',
          subtitle: 'Un champ carré de 20 m de côté. Sa diagonale mesure √800 m (20² + 20² = 800).',
          done: lowDone && cableDone,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<>Entre quels entiers consécutifs se trouve <MathText>{'$\\sqrt{800}$'}</MathText> ? Donne le plus petit.</>}
                expected={28}
                suffix="≤ √800 < …"
                requires={['methode-encadrer-racine']}
                explain="28² = 784 ≤ 800 < 841 = 29², donc 28 ≤ √800 < 29. La diagonale mesure un peu plus de 28 m (≈ 28,28 m)."
                explainFor={(v) => (v === 400
                  ? '√800 n’est pas la moitié de 800 : c’est le nombre dont le carré vaut 800. Cherche deux carrés parfaits autour de 800 : 784 = 28² et 841 = 29².'
                  : v === 29 ? '29² = 841 > 800 : 29 est la borne du haut. La borne du bas est 28 (28² = 784 ≤ 800).'
                  : 'Encadre 800 par deux carrés parfaits : 784 = 28² et 841 = 29². Donc 28 ≤ √800 < 29.')}
                solved={lowDone}
                onAnswered={() => setLowDone(true)}
              />
              {/* L'encadrement vient de donner 28 ≤ √800 < 29 : c'est l'instant
                  pour poser que la SITUATION peut imposer le sens de l'arrondi,
                  avant la question du câble qui l'exige. */}
              {lowDone && (
                <KnowledgeBrick
                  id="regle-sens-arrondi"
                  variant="new"
                  compact
                  lead={<>Tu viens de trouver 28 ≤ √800 &lt; 29. La diagonale mesure donc un peu plus de 28 m.</>}
                />
              )}
              {lowDone && (
                <TapQuestion
                  prompt="On tire un câble le long de la diagonale. Le câble se vend au mètre entier. Combien de mètres acheter ?"
                  options={['28 m', '29 m', '28,28 m', '30 m']}
                  cols={4}
                  correct={1}
                  requires={['regle-sens-arrondi', 'methode-encadrer-racine']}
                  explain="La diagonale vaut √800 ≈ 28,28 m : 28 m ne suffit pas, il faut arrondir AU-DESSUS, 29 m. Ici la situation impose le sens de l’arrondi, pas la règle du chiffre suivant."
                  explainWrong="28,28 n’est pas un nombre entier de mètres, et 28 m est trop court (√800 > 28). Il faut le premier entier au-dessus : 29 m. Arrondir « au plus proche » donnerait 28 — et un câble trop court."
                  solved={cableDone}
                  onAnswered={() => setCableDone(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          Le boss t’attend.
        </KnowledgeSnapshot>
      )}
    />
  );
}
