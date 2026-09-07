import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AffineSignLab from '../components/AffineSignLab';
import PredictionChips from '../components/PredictionChips';
import { roundTo, formatDec } from '../components/signeUtils';

/**
 * Module 3 — DÉCOUVERTE : le signe d'une fonction affine.
 * Step 1  b seul (a = 2 verrouillé) : amener le zéro en x = 1,5 → zéro = −b/a.
 * Step 2  a seul (b = −3 verrouillé) : rendre a négatif → le côté + bascule à gauche.
 * Step 3  le tableau de 2x − 3.  Step 4  sans curseur : −3x + 6.
 */
export default function Module03LeSigneDUneFonctionAffine() {
  const [v1, setV1] = useState({ a: 2, b: 1 });
  const [snap1, setSnap1] = useState(null);
  const [v2, setV2] = useState({ a: 2, b: -3 });
  const [pred2, setPred2] = useState(null);
  const [snap2, setSnap2] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const done1 = snap1 !== null; const done2 = snap2 !== null;
  const change1 = (n, react) => { setV1(n); if (roundTo(-n.b / n.a, 6) === 1.5) { setSnap1(n); react?.(true); } };
  const change2 = (n, react) => { setV2(n); if (n.a < 0) { setSnap2(n); react?.(true); } };

  const steps = [
    {
      num: 1, title: 'Déplace le zéro avec b', subtitle: 'a = 2 est verrouillé. Règle b pour amener le zéro en x = 1,5.', done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <AffineSignLab a={done1 ? snap1.a : v1.a} b={done1 ? snap1.b : v1.b} onChange={(n) => change1(n, kit.react)} lockA disabled={done1} />
          {done1 ? (
            <Feedback tone="ok">Zéro en 1,5 pour b = {formatDec(snap1.b)} : c’est la solution de 2x + b = 0, soit <strong>x = −b/a</strong> = 3/2. Le zéro glisse avec b ; les couleurs, elles, ne changent pas de côté : − à gauche, + à droite.</Feedback>
          ) : (
            <Feedback tone="info">Le zéro est en x = {formatDec(roundTo(-v1.b / v1.a, 6))}. Observe : chaque cran de b le déplace.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Retourne le signe avec a', subtitle: 'b = −3 est verrouillé. Rends a négatif.', done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="si a devient négatif, que fait la zone verte (+) ?" options={[{ id: 'gauche', label: 'Elle passe à gauche du zéro' }, { id: 'rien', label: 'Elle ne bouge pas' }, { id: 'disparait', label: 'Elle disparaît' }]} value={pred2} onChange={setPred2} disabled={done2} />
          <AffineSignLab a={done2 ? snap2.a : v2.a} b={done2 ? snap2.b : v2.b} onChange={(n) => change2(n, kit.react)} lockB disabled={done2 || !done1} />
          {done2 ? (
            <Feedback tone="ok">{pred2 === 'gauche' ? 'Ta prédiction tenait' : pred2 ? 'Ta prédiction ne tenait pas' : 'Regarde'} : avec a = {formatDec(snap2.a)} &lt; 0, la droite descend et la zone + passe <strong>à gauche</strong> du zéro. Règle : <strong>à droite du zéro, f(x) a le signe de a</strong> ; à gauche, le signe contraire.</Feedback>
          ) : (
            <Feedback tone="info">a = {formatDec(v2.a)} : la droite {v2.a > 0 ? 'monte' : v2.a < 0 ? 'descend' : 'est horizontale'}. Passe a en dessous de 0.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'Le tableau de 2x − 3', done: q3,
      content: (
        <TapQuestion prompt={<span>Quel est le tableau de signes de <MathText>{'$f(x) = 2x - 3$'}</MathText> ?</span>}
          options={['− sur ]−∞ ; 1,5[, 0 en 1,5, + sur ]1,5 ; +∞[', '+ sur ]−∞ ; 1,5[, 0 en 1,5, − sur ]1,5 ; +∞[', '− sur ]−∞ ; 3[, 0 en 3, + sur ]3 ; +∞[', '+ partout : 2 est positif']}
          correct={0} cols={1}
          explain="Zéro : 2x − 3 = 0 ⟺ x = 3/2 = 1,5. a = 2 > 0 : signe + à droite du zéro, − à gauche."
          explainWrong="D’abord le zéro : 2x − 3 = 0 donne x = 1,5 (pas 3 : on divise par a). Puis le signe de a = 2 > 0 à droite du zéro : + sur ]1,5 ; +∞[, − avant."
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
    {
      num: 4, title: 'Sans curseur', done: q4,
      content: (
        <BatchChoiceQuestion intro={<p className="text-sm text-slate-700"><MathText>{'$g(x) = -3x + 6$'}</MathText></p>}
          rows={[
            { id: 'r1', label: 'Zéro de g', options: ['2', '−2', '6'], correct: 0, correction: '−3x + 6 = 0 ⟺ x = 2' },
            { id: 'r2', label: 'g(x) pour x > 2', options: ['négatif', 'positif'], correct: 0, correction: 'le signe de a = −3' },
            { id: 'r3', label: 'g(0)', options: ['positif', 'négatif'], correct: 0, correction: 'à gauche du zéro : signe contraire à a' },
            { id: 'r4', label: 'g(x) = 0 a pour solution', options: ['x = 2', 'x = −3', 'aucune'], correct: 0, correction: 'le zéro' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} ax + b : un zéro en −b/a ; à droite, le signe de a ; à gauche, le signe contraire.</Feedback>}
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Le signe d’une fonction affine" moduleSubtitle="Deux curseurs : le zéro glisse avec b, le côté + bascule avec a" estimatedTime="10 min"
      brief={{ tag: 'Découverte', title: 'f(x) = ax + b, sans dessin', tone: 'sky', body: <p>Une droite ne traverse l’axe qu’une fois. Où ? De quel côté est le + ? Un bouton à la fois, l’axe reste peint.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3}>Et quand f(x) est un produit de deux facteurs affines ? Module suivant : une ligne par facteur.</KnowledgeSnapshot>} />
  );
}
