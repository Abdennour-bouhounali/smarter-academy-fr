import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProductDial from '../components/ProductDial';

/**
 * Module 1 — DÉCLENCHEUR : « Zéro ou pas zéro ? ».
 *
 * Activity: régler deux molettes A et B entre −5 et 5 et chercher toutes les
 *   façons de faire tomber le produit à 0.
 * Mathematical objective: établir, par constat exhaustif, qu'un produit est
 *   nul si et seulement si l'un au moins de ses facteurs est nul.
 * Student action: taper une puce de valeur (ou −/+) sur chaque molette.
 * Controlled variable: A et B, entiers de −5 à 5.
 * Mathematical state: { a, b } ; produit et découvertes dérivés.
 * Visual consequence: la carte d'un facteur nul s'allume ; la carte produit
 *   devient indigo dès que A × B = 0 ; les trois cases « façon de faire 0 »
 *   se cochent.
 * Expected observation: trois façons seulement — A = 0, B = 0, les deux —
 *   et aucune sans un zéro parmi les facteurs.
 * Misconception targeted: « deux nombres opposés donnent 0 » (confusion
 *   somme/produit) et « un très petit produit, c'est presque 0 ».
 * Feedback: le nombre de façons restant à trouver est affiché en continu ;
 *   l'échappatoire après 3 essais montre une combinaison manquante.
 * Formalization: aucune ici — le mot « produit nul » n'est pas encore
 *   prononcé comme règle ; il arrive au module 4.
 * Scaffolding: 7 puces par molette dont le 0, stepper, curseur d'appoint.
 * Transfer: au module 4, les facteurs deviennent des expressions en x.
 */
const WAYS = [
  { id: 'a0', label: 'A = 0 seulement', test: (a, b) => a === 0 && b !== 0, tex: '$0 \\times B = 0$' },
  { id: 'b0', label: 'B = 0 seulement', test: (a, b) => b === 0 && a !== 0, tex: '$A \\times 0 = 0$' },
  { id: 'ab0', label: 'les deux à la fois', test: (a, b) => a === 0 && b === 0, tex: '$0 \\times 0 = 0$' },
];

export default function Module01ZeroOuPas() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [found, setFound] = useState([]);
  const [tries, setTries] = useState(0);
  const [pieegeDone, setPiegeDone] = useState(false);

  const product = a * b;
  const allFound = WAYS.every((w) => found.includes(w.id));
  const remaining = WAYS.filter((w) => !found.includes(w.id));

  const register = (na, nb, kitReact) => {
    const hit = WAYS.find((w) => w.test(na, nb));
    if (hit && !found.includes(hit.id)) {
      setFound((f) => [...f, hit.id]);
      kitReact?.(true);
    } else if (na * nb !== 0) {
      setTries((t) => t + 1);
    }
  };

  const showMe = (kitReact) => {
    const missing = remaining[0];
    if (!missing) return;
    if (missing.id === 'a0') { setA(0); setB(4); }
    else if (missing.id === 'b0') { setA(3); setB(0); }
    else { setA(0); setB(0); }
    setFound((f) => [...f, missing.id]);
    kitReact?.(false);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Zéro ou pas zéro ?"
      moduleSubtitle="Deux molettes, un produit. Trouve toutes les façons de le faire tomber à 0."
      estimatedTime="8 min"
      brief={{
        tag: '⚙️ Mission 01',
        title: 'Fais tomber ce produit à zéro. Puis recommence autrement.',
        body: (
          <p>
            Deux molettes, A et B, et leur produit affiché en grand. Il existe plusieurs façons d’obtenir 0 :
            à toi de les trouver toutes.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Trouve les trois façons de faire 0',
          subtitle: 'Tape les valeurs, le produit suit.',
          done: allFound,
          content: (kit) => (
            <div className="space-y-3">
              <ProductDial
                a={a}
                b={b}
                onChangeA={(v) => { setA(v); register(v, b, kit.react); }}
                onChangeB={(v) => { setB(v); register(a, v, kit.react); }}
              />

              <div className="grid grid-cols-3 gap-2">
                {WAYS.map((w, i) => {
                  const ok = found.includes(w.id);
                  return (
                    <div
                      key={w.id}
                      className={`rounded-xl border-2 px-2 py-2 text-center text-xs font-bold transition-colors ${
                        ok ? 'border-indigo-300 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {ok ? <MathText>{w.tex}</MathText> : `${i + 1}. ${w.label} ?`}
                    </div>
                  );
                })}
              </div>

              {!allFound && (
                <Feedback tone="info">
                  {product === 0 ? (
                    <>
                      Le produit vaut <strong className="font-mono">0</strong> — bien vu. Il reste{' '}
                      <strong>{remaining.length}</strong> façon{remaining.length > 1 ? 's' : ''} d’y arriver
                      autrement.
                    </>
                  ) : (
                    <>
                      Pour A = {a} et B = {b}, le produit vaut{' '}
                      <strong className="font-mono">{product}</strong>. Il te reste{' '}
                      <strong>{remaining.length}</strong> façon{remaining.length > 1 ? 's' : ''} de faire 0 à
                      trouver.
                    </>
                  )}
                </Feedback>
              )}

              {!allFound && tries >= 3 && (
                <button
                  type="button"
                  onClick={() => showMe(kit.react)}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}

              {allFound && (
                <Feedback tone="ok">
                  Trois façons, et à chaque fois un <strong>0</strong> parmi les facteurs. Aucun autre
                  réglage de A et B ne donne 0 : essaie encore, tu ne trouveras rien.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le piège qui coûte le plus cher',
          done: pieegeDone,
          content: (
            <TapQuestion
              prompt="Deux nombres dont le produit vaut 0 : que peut-on affirmer à coup sûr ?"
              options={[
                'Les deux sont nuls',
                'Au moins un des deux est nul',
                'Ils sont opposés, comme 5 et −5',
              ]}
              cols={1}
              correct={1}
              explain={
                <>
                  Sur les molettes, <MathText>{'$3 \\times 0 = 0$'}</MathText> : le premier facteur n’était
                  pas nul. Il en faut au moins un, pas forcément les deux.
                </>
              }
              explainWrong={
                <>
                  Deux nombres opposés donnent 0 par ADDITION (<MathText>{'$5 + (-5) = 0$'}</MathText>),
                  jamais par multiplication : <MathText>{'$5 \\times (-5) = -25$'}</MathText>. Et il n’est
                  pas nécessaire que les deux facteurs soient nuls — un seul suffit.
                </>
              }
              solved={pieegeDone}
              onAnswered={() => setPiegeDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Garde ce constat au chaud : bientôt, A et B ne seront plus des nombres mais des expressions en{' '}
          <MathText>{'$x$'}</MathText>. La façon de les annuler ne changera pas.
        </Feedback>
      }
    />
  );
}
