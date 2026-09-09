import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TwoProbes from '../components/TwoProbes';
import { INVERSE, INVERSE_RANGE, imageOf, formatDec } from '../components/referenceUtils';

/**
 * Module 3 — DÉCOUVERTE : l'hyperbole.
 * Step 1  la sonde vers 0 (pas 0,25) : 1/x explose, 0 n'a pas d'image → ℝ*.
 * Step 2  le miroir : g(−a) = −g(a) → symétrie centrale, signe de x.
 * Step 3  deux sondes : trouver a < b avec g(a) < g(b) → seulement à cheval sur 0 :
 *         décroissante sur ]−∞ ; 0[ et sur ]0 ; +∞[, PAS sur ℝ*.
 * Step 4  bilan : près de 0, loin de 0, signe, 1/x = 0 impossible.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Aucune des trois connaissances du module n'était posée en position
 *   d'enseignement : ℝ*, la symétrie centrale, le piège de la décroissance
 *   « partout » vivaient dans des `Feedback`, et le portrait de l'étape 4 les
 *   exigeait tous. L'ordre est maintenant geste → brique → demande :
 *     étape 1  la sonde vers 0, puis sur 0
 *     étape 2  le miroir à travers l'origine
 *     étape 3  a < b avec g(a) < g(b)  → briques `regle-comparer-inverses`
 *                                        puis `fonction-inverse` (le portrait,
 *                                        une fois les trois gestes faits)
 *     étape 4  le portrait, désormais légitime (`requires`), puis `mem-hyperbole`
 *   La décroissance se dit sur ]−∞ ; 0[ ET sur ]0 ; +∞[, jamais sur leur
 *   réunion : c'est le piège que l'étape 3 fait vivre avant de le nommer.
 *
 * MANIPULATION JAMAIS GELÉE. Les trois sondes restaient `disabled` dès l'étape
 * réussie. Elles restent vivantes ; seuls les verrous d'ANTÉRIORITÉ (`!done1`,
 * `!done2`) demeurent. La prédiction de l'étape 3, elle, se fige.
 */
const PLANE = { f: INVERSE, range: INVERSE_RANGE, unit: 34 };

export default function Module03LHyperbole() {
  const [a1, setA1] = useState(2);
  const [seenSmall, setSeenSmall] = useState(false);
  const [seenZero, setSeenZero] = useState(false);
  const [a2, setA2] = useState(1);
  const [seenNeg, setSeenNeg] = useState(false);
  const [ab, setAb] = useState({ a: 1, b: 2 });
  const [pred3, setPred3] = useState(null);
  const [snap3, setSnap3] = useState(null);
  const [q4, setQ4] = useState(false);
  const done1 = seenSmall && seenZero;
  const done2 = seenNeg;
  const done3 = snap3 !== null;

  const move1 = ({ a }, react) => {
    setA1(a);
    let hit = false;
    if (a !== 0 && Math.abs(a) <= 0.25 && !seenSmall) { setSeenSmall(true); hit = seenZero; }
    if (a === 0 && !seenZero) { setSeenZero(true); hit = seenSmall; }
    if (hit) react?.(true);
  };
  const move2 = ({ a }, react) => { setA2(a); if (a < 0 && !seenNeg) { setSeenNeg(true); react?.(true); } };
  const move3 = (next, react) => {
    setAb(next);
    const ga = imageOf(INVERSE, next.a); const gb = imageOf(INVERSE, next.b);
    if (ga !== null && gb !== null && next.a < next.b && ga < gb) { setSnap3(next); react?.(true); }
  };

  const steps = [
    {
      num: 1, title: 'Vers zéro', subtitle: 'Approche la sonde de 0 par pas de 0,25 : que devient 1/a ? Puis pose-la sur 0.', done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <TwoProbes {...PLANE} a={a1} b={0} showB={false} step={0.25} onChange={(v) => move1(v, kit.react)} />
          {done1 ? (
            <Feedback tone="ok">1/0,25 = 4, 1/0,1 = 10 : plus a est proche de 0, plus 1/a est <strong>grand</strong> — le point file vers le haut. Et en 0, <strong>pas d’image</strong> : la fonction inverse est définie sur ℝ* = ]−∞ ; 0[ ∪ ]0 ; +∞[. La courbe est en deux morceaux, et ne touche jamais l’axe vertical.</Feedback>
          ) : (
            <Feedback tone="info">a = {formatDec(a1)}. {!seenSmall ? 'Descends jusqu’à 0,25. ' : ''}{!seenZero ? 'Puis sur 0 exactement.' : ''}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Le miroir, version inverse', subtitle: 'La sonde a et le point d’abscisse −a. Passe du côté des négatifs.', done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <TwoProbes {...PLANE} a={a2} b={0} showB={false} showMirror step={0.5} onChange={(v) => move2(v, kit.react)} disabled={!done1} />
          {done2 ? (
            <Feedback tone="ok"><strong>g(−a) = −g(a)</strong> : les deux points se font face <em>à travers l’origine</em> — O est un <strong>centre de symétrie</strong>. Conséquence : 1/x a le <strong>signe de x</strong>, positif à droite de 0, négatif à gauche.</Feedback>
          ) : (
            <Feedback tone="info">g({formatDec(a2)}) = {formatDec(imageOf(INVERSE, a2))} et g({formatDec(-a2)}) = {formatDec(imageOf(INVERSE, -a2))}. Va voir un a négatif.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'Décroissante… partout ?', subtitle: 'a = 1 et b = 2 : a < b et g(a) > g(b), la courbe descend. Trouve a < b avec g(a) < g(b).', done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="où trouver a < b avec g(a) < g(b) ?" options={[{ id: 'imp', label: 'Impossible : 1/x descend toujours' }, { id: 'cheval', label: 'Avec a < 0 < b' }, { id: 'neg', label: 'Avec a et b négatifs' }]} value={pred3} onChange={setPred3} disabled={done3} />
          <TwoProbes {...PLANE} a={ab.a} b={ab.b} step={0.5} onChange={(v) => move3(v, kit.react)} disabled={!done2} />
          {done3 ? (
            <>
              <Feedback tone="ok">
                {pred3 === 'cheval' ? 'Ta prédiction tenait' : pred3 ? 'Ta prédiction ne tenait pas' : 'Regarde'} : a = {formatDec(snap3.a)} &lt; b = {formatDec(snap3.b)} et g(a) = {formatDec(imageOf(INVERSE, snap3.a))} &lt; g(b) = {formatDec(imageOf(INVERSE, snap3.b))}. La courbe descend sur ]−∞ ; 0[ <em>et</em> sur ]0 ; +∞[, mais entre les deux branches on <strong>remonte</strong> : la fonction inverse n’est pas décroissante sur ℝ* tout entier. Une propriété se donne toujours <strong>sur un intervalle</strong>.
              </Feedback>
              <KnowledgeBrick
                id="regle-comparer-inverses"
                variant="new"
                lead="Deux inverses ne se comparent que sur une même branche : c’est exactement ce que ton couple à cheval sur 0 vient de montrer."
              />
              <KnowledgeBrick
                id="fonction-inverse"
                variant="new"
                lead="Le trou en 0, le miroir à travers l’origine, la descente branche par branche : tes trois gestes ont donné tout le portrait."
              />
            </>
          ) : (
            <Feedback tone="info">Sur une même branche, quand a grandit, g(a) diminue. Et si a et b ne sont pas sur la même branche ?</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4, title: 'Portrait de l’hyperbole', done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion requires={['fonction-inverse', 'regle-comparer-inverses', 'regle-pres-loin-zero']} intro={<p className="text-sm text-slate-700">Sans sonde :</p>}
            rows={[
              { id: 'r1', label: 'g(0,01) = ?', options: ['100', '0,01', '0'], correct: 0, correction: '1 ÷ 0,01' },
              { id: 'r2', label: 'g(1 000) = ?', options: ['0,001', '1 000', '0'], correct: 0, correction: 'tout petit, jamais nul' },
              { id: 'r3', label: 'Signe de g(−0,5)', options: ['négatif', 'positif', 'nul'], correct: 0, correction: 'le signe de x' },
              { id: 'r4', label: 'L’équation 1/x = 0', options: ['n’a aucune solution', 'a pour solution x = 0', 'a pour solution x = 1'], correct: 0, correction: 'la courbe ne touche jamais l’axe des abscisses' },
            ]}
            feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Hyperbole : deux branches, définie sur ℝ*, centre de symétrie O, signe de x, décroissante sur chaque branche ; énorme près de 0, minuscule loin de 0, jamais nulle.</Feedback>}
            solved={q4} onAnswered={() => setQ4(true)} />
          {q4 && (
            <KnowledgeBrick
              id="mem-hyperbole"
              variant="new"
              lead="Deux lignes à emporter — c’est l’image mentale de la fonction inverse."
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="L’hyperbole" moduleSubtitle="La courbe de x ↦ 1/x : deux branches et un trou" estimatedTime="10 min"
      brief={{ tag: 'Découverte', title: 'La fonction inverse', tone: 'rose', body: <p>Sa courbe s’appelle une <strong>hyperbole</strong>. Elle a un trou en 0, deux branches, et une propriété qui piège tout le monde une fois.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3}>Module suivant : la troisième courbe, faite de deux demi-droites — le V de x ↦ |x|.</KnowledgeSnapshot>} />
  );
}
