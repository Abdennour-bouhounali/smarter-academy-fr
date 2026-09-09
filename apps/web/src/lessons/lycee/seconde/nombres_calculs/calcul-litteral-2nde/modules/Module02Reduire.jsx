import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TermMerger from '../components/TermMerger';
import { poly, formatPoly, evaluate, monomial, add } from '../components/litteralUtils';

/**
 * Module 2 — DISCOVERY : « Réduire ».
 * Activity: empiler les termes semblables de deux expressions ; prédire
 *   3x² + 2x = 5x³ ? puis tester au tableau de valeurs.
 * Mathematical objective: réduire = additionner les coefficients des termes
 *   de MÊME forme ; la valeur ne change pas ; des formes différentes ne
 *   s'additionnent pas.
 */
const E1 = [{ id: 'a', coef: 3, degree: 2 }, { id: 'b', coef: -5, degree: 1 }, { id: 'c', coef: 2, degree: 0 }, { id: 'd', coef: -1, degree: 2 }, { id: 'e', coef: 7, degree: 1 }, { id: 'f', coef: -9, degree: 0 }];
const E2 = [{ id: 'a', coef: 4, degree: 1 }, { id: 'b', coef: -3, degree: 0 }, { id: 'c', coef: 1, degree: 1 }, { id: 'd', coef: -2, degree: 2 }, { id: 'e', coef: 0.5, degree: 0 }];
const polyOf = (terms) => terms.reduce((p, t) => add(p, monomial(t.coef, t.degree)), poly(0));
const reduced = (terms) => new Set(terms.map((t) => t.degree)).size === terms.length;

function useMerger(initial) {
  const [terms, setTerms] = useState(initial);
  const merge = (idA, idB) => {
    const a = terms.find((t) => t.id === idA); const b = terms.find((t) => t.id === idB);
    const coef = a.coef + b.coef;
    const rest = terms.filter((t) => t.id !== idA && t.id !== idB);
    setTerms(coef === 0 ? rest : [...rest.slice(0, terms.indexOf(a)), { id: `${idA}${idB}`, coef, degree: a.degree }, ...rest.slice(terms.indexOf(a))].filter(Boolean));
  };
  return { terms, merge, done: reduced(terms), original: polyOf(initial) };
}

export default function Module02Reduire() {
  const m1 = useMerger(E1); const m2 = useMerger(E2);
  const [prediction, setPrediction] = useState(null);
  const [tested, setTested] = useState(() => new Set());
  const [trapDone, setTrapDone] = useState(false);
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Réduire"
      moduleSubtitle="Des termes de trois formes : x², x, nombres. Seuls les semblables s’empilent — et la valeur ne bouge pas."
      estimatedTime="9 min"
      brief={{ tag: '🧱 Mission 02', title: 'Six termes en désordre. Combien en reste-t-il une fois rangés ?', tone: 'indigo', body: <p>Touche deux termes de même forme pour les empiler. Surveille la valeur en x = 2 : elle ne doit jamais changer.</p> }}
      steps={[
        {
          num: 1, title: 'Empile 3x² − 5x + 2 − x² + 7x − 9', done: m1.done,
          content: (kit) => (
            <div className="space-y-3">
              <TermMerger terms={m1.terms} original={m1.original} onMerge={(a, b) => { m1.merge(a, b); kit.react(true); }} />
              {m1.done && <Feedback tone="ok">Réduit : <strong className="font-mono">{formatPoly(polyOf(m1.terms))}</strong>. Trois piles, trois formes ; la valeur en x = 2 n’a jamais bougé ({formatPoly(polyOf(m1.terms))} vaut {evaluate(polyOf(m1.terms), 2)}, comme au départ). Réduire ne change que l’écriture.</Feedback>}
              {/* Les trois piles viennent de se former sous les doigts : c'est
                  l'instant où « terme », « coefficient » et « forme » se nomment,
                  avant que le module 3 (empilement 2) n'en redemande l'usage. */}
              {m1.done && (
                <KnowledgeBrick
                  id="vocab-terme-coefficient"
                  variant="new"
                  lead={<>Tu viens d’empiler des termes qui avaient la <strong>même forme</strong> (x², x, ou nombre) — jamais les autres.</>}
                />
              )}
              {m1.done && (
                <KnowledgeBrick
                  id="methode-reduire"
                  variant="new"
                  compact
                  lead={<>Empiler deux termes semblables, c’est additionner leurs coefficients : c’est la méthode que tu viens d’exécuter.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Empile 4x − 3 + x − 2x² + 0,5', subtitle: 'Un terme peut rester seul.', done: m2.done,
          content: (kit) => (
            <div className="space-y-3">
              <TermMerger terms={m2.terms} original={m2.original} onMerge={(a, b) => { m2.merge(a, b); kit.react(true); }} />
              {m2.done && <Feedback tone="ok">Réduit : <strong className="font-mono">{formatPoly(polyOf(m2.terms))}</strong>. Le −2x² est resté seul : aucun autre terme en x². Les coefficients peuvent être décimaux : −3 + 0,5 = −2,5.</Feedback>}
            </div>
          ),
        },
        {
          num: 3, title: '3x² + 2x = 5x³ ?', subtitle: 'Prédis, puis teste des valeurs.', done: tested.size >= 3 && trapDone,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="peut-on réduire 3x² + 2x en 5x³ ?" options={[{ id: 'oui', label: 'Oui : 3 + 2 = 5 et x² · x = x³' }, { id: 'non', label: 'Non' }]} value={prediction} onChange={setPrediction} disabled={tested.size >= 3} />
              <ValueTable columns={[{ id: 'a', label: '3x² + 2x', fn: (x) => 3 * x * x + 2 * x }, { id: 'b', label: '5x³', fn: (x) => 5 * x ** 3 }]} xs={[1, 2, 3, 0, -1]} tested={tested} onTest={(v) => { const s = new Set(tested); s.add(v); setTested(s); if (s.size === 3) kit.react(true); }} caption="Une ligne verte = les deux colonnes s’accordent." />
              {/* Le tableau vient de montrer un seul accord (x = 1) puis un
                  désaccord (x = 2) : c'est l'instant où la règle sur les
                  exposants se nomme, avant la question qui l'exige. */}
              {tested.size >= 3 && (
                <KnowledgeBrick
                  id="regle-exposants-pas-additionnes"
                  variant="new"
                  compact
                  lead={<>En x = 1 les deux colonnes coïncidaient — mais dès x = 2, non. x² et x n’ont pas le même <strong>exposant</strong> : ce ne sont pas des termes semblables.</>}
                />
              )}
              {tested.size >= 3 && (
                <TapQuestion prompt="Conclusion ?" options={['3x² + 2x ne se réduit pas : x² et x sont deux formes différentes (et x = 1 seul les fait coïncider)', '3x² + 2x = 5x³, la ligne x = 1 le prouve', 'Ça dépend de x']} cols={1} correct={0}
                  requires={['regle-exposants-pas-additionnes', 'vocab-terme-coefficient', 'regle-tester-ne-prouve-pas']}
                  explain="En x = 1 les deux colonnes coïncident (5 = 5) — une seule valeur commune ne prouve rien. Dès x = 2 : 16 contre 40. 3x² et 2x ne sont pas semblables : l’expression est déjà réduite. Réduire additionne les coefficients de termes de MÊME forme, jamais les exposants."
                  explainWrong="Une ligne verte isolée (x = 1) ne prouve rien : regarde x = 2, 16 ≠ 40. Deux écritures ne sont égales que si elles s’accordent pour TOUT x. x² et x sont des formes différentes : rien à empiler."
                  solved={trapDone} onAnswered={() => setTrapDone(true)} />
              )}
              {trapDone && (
                <KnowledgeBrick
                  id="mem-reduire"
                  variant="new"
                  compact
                  lead={<>Le réflexe de tout le module : on additionne les coefficients, jamais les exposants.</>}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
