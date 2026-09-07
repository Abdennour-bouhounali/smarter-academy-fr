import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RateProbes from '../components/RateProbes';
import PredictionChips from '../components/PredictionChips';
import { affine, imageOf, TABLE_AFFINE, TABLE_NON_AFFINE, TANK_RANGE, formatDec } from '../components/affineUtils';

/**
 * Module 2 — DÉCOUVERTE : le taux d'accroissement.
 * Step 1  deux instants sur V(t) = 3t + 10 : (V₂ − V₁)/(t₂ − t₁) = 3 quels que soient les instants.
 * Step 2  la même mesure sur une courbe non affine : le quotient change.
 * Step 3  reconnaître une table affine (accroissements proportionnels).
 * Step 4  la formule.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le mot « taux d'accroissement » et la méthode de la table n'existaient que
 *   dans les `Feedback` de fin d'étape et dans le pied : les questions des
 *   étapes 3 et 4 les exigeaient sans qu'ils aient été posés en position
 *   d'enseignement. L'ordre est maintenant geste → brique → demande :
 *     étape 1  trois paires d'instants, le même nombre → brique `taux-accroissement`
 *     étape 2  le même geste sur une courbe qui n'est pas une droite →
 *              brique `methode-reconnaitre-affine-table`, avant la table
 *     étape 3  la table (`requires`)
 *     étape 4  brique `formule-taux`, puis la question sur f(2) et f(5)
 *   Le titre de l'étape 1 ne nomme plus le « quotient » : un titre se lit
 *   alors que l'étape est encore verrouillée, et annonçait donc le mot avant
 *   le geste qui le fabrique.
 *
 * MANIPULATION JAMAIS GELÉE. Les deux sondes restaient `disabled` une fois
 * l'étape réussie ; elles restent vivantes, avec le seul verrou d'ANTÉRIORITÉ
 * (`!done1`) sur l'étape 2.
 */
const V = affine(3, 10);
const NON = (x) => 0.4 * x * x + 2;
const NON_RANGE = { xMin: 0, xMax: 8, yMin: 0, yMax: 30 };

export default function Module02LeTauxDAccroissement() {
  const [p1, setP1] = useState({ x1: 1, x2: 3 });
  const [pairs, setPairs] = useState(() => new Set());
  const [pred1, setPred1] = useState(null);
  const [p2, setP2] = useState({ x1: 1, x2: 2 });
  const [rates, setRates] = useState(() => new Set());
  const [q3, setQ3] = useState(false); const [q4, setQ4] = useState(false);
  const done1 = pairs.size >= 3; const done2 = rates.size >= 2;
  const move1 = (n, react) => { setP1(n); if (n.x1 === n.x2) return; const k = `${Math.min(n.x1, n.x2)}|${Math.max(n.x1, n.x2)}`; if (pairs.has(k)) return; const s = new Set(pairs); s.add(k); setPairs(s); if (!done1 && s.size === 3) react?.(true); };
  const move2 = (n, react) => { setP2(n); if (n.x1 === n.x2) return; const r = Math.round(((NON(n.x2) - NON(n.x1)) / (n.x2 - n.x1)) * 1000); if (rates.has(r)) return; const s = new Set(rates); s.add(r); setRates(s); if (!done2 && s.size === 2) react?.(true); };

  const steps = [
    {
      num: 1, title: 'Deux instants, un seul nombre', subtitle: 'V(t) = 3t + 10. Choisis deux instants t₁ ≠ t₂ ; le bandeau calcule (V₂ − V₁) ÷ (t₂ − t₁). Essaie trois paires différentes.', done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="si je prends deux instants très éloignés au lieu de deux instants proches, le quotient…" options={[{ id: 'same', label: 'Ne change pas' }, { id: 'more', label: 'Devient plus grand' }, { id: 'less', label: 'Devient plus petit' }]} value={pred1} onChange={setPred1} disabled={done1} />
          <RateProbes fn={(x) => imageOf(V, x)} affineLine={V} range={TANK_RANGE} unit={30} unitY={5} xStep={1} yStep={10} x1={p1.x1} x2={p1.x2} onChange={(n) => move1(n, kit.react)} name="V" variable="t" />
          {done1 ? (
            <>
              <Feedback tone="ok">{pred1 === 'same' ? 'Ta prédiction tenait' : pred1 ? 'Ta prédiction ne tenait pas' : 'Regarde'} : trois paires, toujours <strong>3</strong> — proches ou éloignés, les instants n’y changent rien. L’escalier a la même pente partout.</Feedback>
              <KnowledgeBrick id="taux-accroissement" variant="new" lead={<>Le nombre que tu viens d’obtenir trois fois de suite porte un nom, et c’est exactement le <strong>a</strong> du module précédent.</>} />
            </>
          ) : (
            <Feedback tone="info">{pairs.size} paire{pairs.size > 1 ? 's' : ''} sur 3 (t₁ ≠ t₂).</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Et si la courbe n’est pas une droite ?', subtitle: 'Même mesure sur une autre fonction. Trouve deux paires d’instants qui donnent des quotients différents.', done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <RateProbes fn={NON} range={NON_RANGE} unit={38} unitY={9} xStep={1} yStep={5} x1={p2.x1} x2={p2.x2} onChange={(n) => move2(n, kit.react)} disabled={!done1} name="g" variable="x" />
          {done2 ? (
            <>
              <Feedback tone="ok">Ici le quotient <strong>change</strong> selon les instants : cette fonction n’est pas affine. Un taux d’accroissement constant, c’est la signature d’une fonction affine — et de sa droite.</Feedback>
              <KnowledgeBrick id="methode-reconnaitre-affine-table" variant="new" lead={<>Tu viens de comparer deux taux sur une courbe. Une table de valeurs se teste de la même manière — c’est ce que demande l’étape suivante.</>} />
            </>
          ) : (
            <Feedback tone="info">{rates.size} valeur{rates.size > 1 ? 's' : ''} de quotient obtenue{rates.size > 1 ? 's' : ''}. Éloigne les instants.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'Reconnaître une fonction affine dans une table', done: q3,
      content: (
        <BatchChoiceQuestion
          intro={(
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[{ n: 'Table 1', rows: TABLE_AFFINE }, { n: 'Table 2', rows: TABLE_NON_AFFINE }].map((tb) => (
                <div key={tb.n} className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
                  <table className="w-full text-sm font-mono tabular-nums"><caption className="text-xs font-bold text-slate-600 py-1">{tb.n}</caption>
                    <tbody>
                      <tr className="bg-slate-50"><th scope="row" className="px-2 py-1 text-left">x</th>{tb.rows.map((r) => <td key={r.x} className="px-2 py-1 text-center">{formatDec(r.x)}</td>)}</tr>
                      <tr className="border-t"><th scope="row" className="px-2 py-1 text-left">y</th>{tb.rows.map((r) => <td key={r.x} className="px-2 py-1 text-center font-bold">{formatDec(r.y)}</td>)}</tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
          rows={[
            { id: 'r1', label: 'Table 1 : de x = 0 à x = 1, y gagne', options: ['2', '3', '5'], correct: 0, correction: '5 − 3' },
            { id: 'r2', label: 'Table 1 : de x = 2 à x = 4, y gagne', options: ['4 (soit 2 par unité)', '2', '11'], correct: 0, correction: '(11 − 7) ÷ 2 = 2' },
            { id: 'r3', label: 'Table 1 est-elle affine ?', options: ['oui : taux constant 2, y = 2x + 3', 'non', 'on ne peut pas savoir'], correct: 0, correction: 'accroissements proportionnels' },
            { id: 'r4', label: 'Table 2 est-elle affine ?', options: ['non : +1 puis +3 par unité', 'oui', 'oui : y = x + 1'], correct: 0, correction: 'taux 1 puis 3' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Pour reconnaître une fonction affine dans une table : calculer (Δy) ÷ (Δx) entre plusieurs couples ; s’il est toujours le même, c’est a, et b se lit en x = 0.</Feedback>}
          requires={['taux-accroissement', 'methode-reconnaitre-affine-table']}
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
    {
      num: 4, title: 'La formule', done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick id="formule-taux" variant="new" lead={<>Ce que tu as mesuré à la main trois fois s’écrit en une ligne, avec deux valeurs quelconques.</>} />
            <TapQuestion prompt={<span>f est affine, f(2) = 7 et f(5) = 16. Son coefficient directeur a vaut…</span>}
            options={['(16 − 7) ÷ (5 − 2) = 3', '(5 − 2) ÷ (16 − 7) = 1/3', '16 − 7 = 9', '(7 − 16) ÷ (5 − 2) = −3']}
            correct={0} cols={2}
            explain={<span><MathText>{'$a = \\dfrac{f(x_2) - f(x_1)}{x_2 - x_1} = \\dfrac{16 - 7}{5 - 2} = 3$'}</MathText> : ce que f gagne par unité de x.</span>}
            explainWrong="Le taux est (différence des images) ÷ (différence des x), dans le même ordre : (16 − 7) ÷ (5 − 2) = 9 ÷ 3 = 3. Pas l’inverse, pas la seule différence des images."
            requires={['taux-accroissement', 'formule-taux']}
            solved={q4} onAnswered={() => setQ4(true)} />
        </div>
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Le taux d’accroissement" moduleSubtitle="Deux instants, un quotient — toujours le même" estimatedTime="9 min"
      brief={{ tag: 'Découverte', title: 'Ce que « +3 par minute » veut dire exactement', tone: 'violet', body: <p>Entre deux instants, de combien le volume a-t-il changé, par minute ? Mesure-le sur le réservoir, puis sur une courbe qui n’est pas une droite.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2}>Module suivant : le signe de a décide si la fonction monte ou descend — le tableau de variations d’une fonction affine.</KnowledgeSnapshot>} />
  );
}
