import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TwoProbes from '../components/TwoProbes';
import PredictionChips from '../components/PredictionChips';
import { SQUARE, SQUARE_RANGE, formatDec } from '../components/referenceUtils';

/**
 * Module 2 — DÉCOUVERTE : la parabole.
 * Step 1  une sonde et son miroir : f(−a) = f(a) → axe de symétrie.
 * Step 2  deux sondes : trouver a < b avec f(a) > f(b) → décroissante sur ]−∞ ; 0].
 * Step 3  le signe. Step 4  bilan (variations, sommet, comparaison de carrés).
 * « croissante / décroissante » au sens de « la courbe monte / descend » ;
 * la définition par inégalités attend « Variations et extremums ».
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Seul `vocab-monte-descend` était posé ; le portrait de la parabole et la
 *   règle de comparaison des carrés n'existaient que dans des `Feedback` et
 *   dans l'« À retenir » du pied — donc APRÈS la question de l'étape 4 qui les
 *   exigeait tous les deux. L'ordre est maintenant geste → brique → demande :
 *     étape 1  le miroir sur x²        → brique `regle-comparer-carres` ? non :
 *                                        rien encore, la symétrie se lit seule
 *     étape 2  deux sondes, f(a) > f(b) → briques `vocab-monte-descend` puis
 *                                         `regle-comparer-carres`
 *     étape 3  le signe, répondu depuis l'étape 1 → puis brique `fonction-carre`
 *              (le portrait complet, une fois les trois gestes faits)
 *     étape 4  le portrait, désormais légitime (`requires`), puis `mem-parabole`
 *
 * MANIPULATION JAMAIS GELÉE. Les deux sondes restaient `disabled` dès l'étape
 * réussie. Elles restent vivantes ; seul le verrou d'ANTÉRIORITÉ (`!done1`)
 * demeure. La prédiction de l'étape 2, elle, se fige : elle s'enregistre une
 * fois, avant la révélation.
 */
const PLANE = { f: SQUARE, range: SQUARE_RANGE, unit: 34, unitY: 30 };

export default function Module02LaParabole() {
  const [a1, setA1] = useState(1);
  const [visited, setVisited] = useState(() => new Set([1]));
  const [ab, setAb] = useState({ a: 2, b: 3 });
  const [pred2, setPred2] = useState(null);
  const [snap2, setSnap2] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const done1 = [...visited].some((v) => v < 0) && [...visited].some((v) => v > 0 && v !== 1);
  const done2 = snap2 !== null;

  const move1 = ({ a }, react) => { setA1(a); const s = new Set(visited); s.add(a); setVisited(s); if (!done1 && [...s].some((v) => v < 0) && [...s].some((v) => v > 0 && v !== 1)) react?.(true); };
  const move2 = (next, react) => { setAb(next); if (next.a < next.b && next.a * next.a > next.b * next.b) { setSnap2(next); react?.(true); } };

  const steps = [
    {
      num: 1, title: 'Le miroir', subtitle: 'Déplace la sonde a : son point et le point d’abscisse −a. Passe par un négatif et par un positif.', done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <TwoProbes {...PLANE} a={a1} b={0} showB={false} showMirror step={0.5} onChange={(v) => move1(v, kit.react)} />
          {done1 ? (
            <Feedback tone="ok">Pour tout a, <strong>f(−a) = f(a)</strong> : les deux points sont à la même hauteur, face à face. L’axe des ordonnées est un <strong>axe de symétrie</strong> de la parabole. Et aucun point ne descend sous l’axe des abscisses.</Feedback>
          ) : (
            <Feedback tone="info">a = {formatDec(a1)}, f(a) = {formatDec(a1 * a1)} et f(−a) = {formatDec(a1 * a1)}. Continue : un négatif, un positif.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Deux sondes', subtitle: 'a = 2 et b = 3 : a < b et f(a) < f(b). Trouve deux abscisses a < b pour lesquelles f(a) > f(b).', done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="où faut-il chercher a < b avec f(a) > f(b) ?" options={[{ id: 'neg', label: 'Du côté des négatifs' }, { id: 'pos', label: 'Du côté des positifs, plus loin' }, { id: 'imp', label: 'Impossible' }]} value={pred2} onChange={setPred2} disabled={done2} />
          <TwoProbes {...PLANE} a={ab.a} b={ab.b} step={0.5} onChange={(v) => move2(v, kit.react)} disabled={!done1} />
          {done2 ? (
            <Feedback tone="ok">
              {pred2 === 'neg' ? 'Ta prédiction tenait' : pred2 ? 'Ta prédiction ne tenait pas' : 'Regarde'} : a = {formatDec(snap2.a)} &lt; b = {formatDec(snap2.b)} et pourtant f(a) = {formatDec(snap2.a ** 2)} &gt; f(b) = {formatDec(snap2.b ** 2)}. À gauche de 0 la parabole <strong>descend</strong> ; à droite elle <strong>monte</strong>. Le carré du plus grand n’est pas toujours le plus grand : (−3)² &gt; (−2)².
            </Feedback>
          ) : (
            <Feedback tone="info">Sur les positifs, quand a grandit, f(a) grandit. Cherche ailleurs.</Feedback>
          )}
          {done2 && (
            <>
              <KnowledgeBrick
                id="vocab-monte-descend"
                variant="new"
                lead="« Ça monte », « ça descend » : tes deux sondes viennent de faire voir les deux comportements. Ils ont un nom."
              />
              <KnowledgeBrick
                id="regle-comparer-carres"
                variant="new"
                lead="Et puisque la courbe descend à gauche de 0, comparer deux carrés dépend du côté où se trouvent les nombres — c’est ce que tes deux sondes viennent de produire."
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'Le signe', done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion prompt="Le signe de x², pour tout nombre x ?"
            options={['x² ≥ 0 pour tout x, et x² = 0 seulement pour x = 0', 'x² > 0 pour tout x', 'x² a le signe de x', 'x² < 0 quand x < 0']}
            correct={0} cols={1} requires={['vocab-monte-descend']}
            explain="Un carré est un produit de deux nombres de même signe : jamais négatif. Il est nul seulement en 0, le sommet de la parabole, point le plus bas de la courbe."
            explainWrong="La parabole ne descend jamais sous l’axe des abscisses, et elle le touche en un seul point, O. Donc x² ≥ 0, avec égalité seulement pour x = 0."
            solved={q3} onAnswered={() => setQ3(true)} />
          {q3 && (
            <KnowledgeBrick
              id="fonction-carre"
              variant="new"
              lead="Miroir, deux sondes, signe : tes trois gestes ont donné les quatre traits du portrait. Les voici rassemblés."
            />
          )}
        </div>
      ),
    },
    {
      num: 4, title: 'Portrait de la parabole', done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion requires={['fonction-carre', 'vocab-monte-descend', 'regle-comparer-carres']} intro={<p className="text-sm text-slate-700">Ce que tu as lu sur la courbe :</p>}
            rows={[
              { id: 'r1', label: 'Sur [0 ; +∞[, la fonction carré est', options: ['croissante', 'décroissante'], correct: 0, correction: 'la courbe monte' },
              { id: 'r2', label: 'Sur ]−∞ ; 0], elle est', options: ['croissante', 'décroissante'], correct: 1, correction: 'la courbe descend' },
              { id: 'r3', label: 'Son point le plus bas', options: ['O (0 ; 0)', '(1 ; 1)', 'il n’y en a pas'], correct: 0, correction: 'le sommet' },
              { id: 'r4', label: 'Comme −5 < −2, alors', options: ['(−5)² > (−2)²', '(−5)² < (−2)²'], correct: 0, correction: '25 > 4 : décroissante sur les négatifs' },
            ]}
            feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Parabole : sommet O, axe de symétrie (Oy), descend sur ]−∞ ; 0], monte sur [0 ; +∞[. Pour comparer deux carrés, regarde de quel côté de 0 sont les nombres.</Feedback>}
            solved={q4} onAnswered={() => setQ4(true)} />
          {q4 && (
            <KnowledgeBrick
              id="mem-parabole"
              variant="new"
              lead="Quatre lignes à emporter — c’est l’image mentale de la fonction carré."
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="La parabole" moduleSubtitle="La courbe de x ↦ x², sondée" estimatedTime="9 min"
      brief={{ tag: 'Découverte', title: 'La fonction carré', tone: 'violet', body: <p>Tu as tracé sa courbe au module 1. Elle s’appelle une <strong>parabole</strong>. Deux sondes vont t’en faire lire les propriétés — avant de les nommer.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2}>Module suivant : la courbe en deux morceaux — l’hyperbole de x ↦ 1/x, et son trou en 0.</KnowledgeSnapshot>} />
  );
}
