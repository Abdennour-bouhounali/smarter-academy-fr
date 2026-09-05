import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 5 — FORMALISATION : « À retenir » — les trois équivalences et leurs deux usages, après les gestes. */
const CARDS = [
  { t: 'colinéaires', f: 'même direction (même rail)', s: 'quels que soient la longueur et le sens ; le vecteur nul est colinéaire à tout vecteur' },
  { t: 'multiple', f: 'v = k·u', s: 'coordonnées proportionnelles : x′ = k·x et y′ = k·y, le même k' },
  { t: 'déterminant', f: 'det(u, v) = x·y′ − y·x′', s: '|det| = aire du parallélogramme ; le signe dit le côté' },
  { t: 'le critère', f: 'det(u, v) = 0 ⇔ u et v colinéaires', s: 'un calcul remplace le dessin — même quand l’œil hésite' },
  { t: 'alignement', f: 'A, B, C alignés ⇔ det(AB, AC) = 0', s: 'AB et AC colinéaires, des deux côtés de A' },
  { t: 'parallélisme', f: '(AB) ∥ (CD) ⇔ det(AB, CD) = 0', s: 'AB et CD colinéaires — même de sens contraire' },
];

export default function Module05ARetenir() {
  const [b1, setB1] = useState(false);
  const [t2, setT2] = useState(false);
  const [b3, setB3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="À retenir"
      moduleSubtitle="Colinéaires ⇔ v = k·u ⇔ det = 0 ; alignés ; parallèles : la carte, après les gestes."
      estimatedTime="6 min"
      brief={{ tag: '📘 Mission 05', title: 'Un rail, un facteur, un nombre : trois façons de dire « même direction ».', tone: 'indigo', body: <p>Lis la carte, puis trois vérifications.</p> }}
      steps={[
        {
          num: 1, title: 'La carte', done: b1,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CARDS.map((c) => (
                    <div key={c.t} className="rounded-xl bg-white border border-indigo-200 p-3">
                      <div className="text-[11px] font-bold uppercase text-indigo-500">{c.t}</div>
                      <div className="font-extrabold font-mono">{c.f}</div>
                      <div className="text-xs">{c.s}</div>
                    </div>
                  ))}
                </div>
              </div>
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">Vrai ou faux ?</p>}
                rows={[
                  { id: 'r1', label: 'Deux vecteurs de sens contraires ne peuvent pas être colinéaires', options: ['vrai', 'faux'], correct: 1, correction: 'un demi-tour ne change pas la direction : (2 ; 1) et (−4 ; −2) sont colinéaires.' },
                  { id: 'r2', label: 'det(u, v) = x·y′ + y·x′', options: ['vrai', 'faux'], correct: 1, correction: 'c’est une DIFFÉRENCE : x·y′ − y·x′.' },
                  { id: 'r3', label: 'Si det(u, v) = 0, alors u et v sont colinéaires', options: ['vrai', 'faux'], correct: 0 },
                  { id: 'r4', label: 'A, B, C alignés ⇔ AB et AC sont égaux', options: ['vrai', 'faux'], correct: 1, correction: 'colinéaires, pas égaux : C n’est pas B.' },
                  { id: 'r5', label: '(AB) ∥ (CD) ⇔ det(AB, CD) = 0', options: ['vrai', 'faux'], correct: 0 },
                ]}
                feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Cinq sur cinq.' : `${nCorrect} / ${total}.`} La colinéarité ignore le sens et la longueur ; le déterminant est une différence de produits en croix ; alignés et parallèles sont le même test, sur AB/AC et sur AB/CD.</Feedback>}
                solved={b1} onAnswered={() => setB1(true)} />
            </div>
          ),
        },
        {
          num: 2, title: 'Trois écritures, une propriété', done: t2,
          content: (
            <TapQuestion
              prompt="u (−3 ; 6) et v (1 ; −2). Laquelle de ces phrases est FAUSSE ?"
              options={['v = −3·u', 'det(u, v) = (−3) × (−2) − 6 × 1 = 0', 'u et v sont colinéaires, de sens contraires', 'v = −⅓·u']} cols={1} correct={0}
              explain="u = −3·v, donc v = −⅓·u (et non −3·u). Le déterminant vaut 6 − 6 = 0 : colinéaires, de sens contraires puisque le facteur est négatif."
              explainWrong="Vérifie le facteur : −3 × (−3) = 9 ≠ 1. C’est u = −3·v, donc v = −⅓·u. Les trois autres phrases sont vraies : det = 6 − 6 = 0, colinéaires, sens contraires."
              solved={t2} onAnswered={() => setT2(true)} />
          ),
        },
        {
          num: 3, title: 'Calculer et conclure', done: b3,
          content: (
            <BatchChoiceQuestion
              rows={[
                { id: 'c1', label: 'det(u, v), u (5 ; 2), v (7 ; 3)', options: ['1', '29', '−1'], correct: 0, correction: '5 × 3 − 2 × 7 = 15 − 14 = 1 : presque colinéaires, mais non.' },
                { id: 'c2', label: 'det(u, v), u (−2 ; 4), v (3 ; −6)', options: ['0', '24', '−24'], correct: 0, correction: '(−2) × (−6) − 4 × 3 = 12 − 12 = 0 : v = −1,5·u.' },
                { id: 'c3', label: 'A (0 ; 1), B (2 ; 4), C (6 ; 10) : alignés ?', options: ['oui, det(AB, AC) = 0', 'non, det(AB, AC) = 2', 'non, AB ≠ AC'], correct: 0, correction: 'AB (2 ; 3), AC (6 ; 9) : 2 × 9 − 3 × 6 = 0.' },
                { id: 'c4', label: 'AB (4 ; −2), CD (−6 ; 3) : (AB) et (CD)', options: ['parallèles', 'sécantes'], correct: 0, correction: '4 × 3 − (−2) × (−6) = 12 − 12 = 0 : CD = −1,5·AB.' },
              ]}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>Le piège du déterminant, c’est le signe des produits : (−2) × (−6) = +12. Et un déterminant de 1 n’est pas « presque zéro » : il n’est pas nul, point.</Feedback>}
              solved={b3} onAnswered={() => setB3(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok">Le critère est en place. Il reste à s’en servir là où l’œil hésite : trois points presque alignés, deux droites presque parallèles, une coordonnée à trouver.</Feedback>}
    />
  );
}
