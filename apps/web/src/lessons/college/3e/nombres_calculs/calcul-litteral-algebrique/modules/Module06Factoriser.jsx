import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TermCards from '../components/TermCards';
import AlgebraRect from '../components/AlgebraRect';
import {
  term, atomicFactors, factorOut, formatTerms, formatProduct,
} from '../components/litteralUtils';

/**
 * Module 6 — FORMALIZATION : « Factoriser, le chemin inverse ».
 *
 * Activity: toucher le facteur commun dans CHAQUE carte-terme, puis voir le
 *   rectangle se reconstruire à partir de ses morceaux.
 * Mathematical objective: faire de la factorisation la LECTURE INVERSE du
 *   rectangle d'aire — des morceaux vers les côtés — et non une recette.
 * Student action: taper le « 3 » dans 6x et le « 3 » dans 9 ; puis
 *   reconnaître deux identités remarquables sous forme factorisée.
 * Controlled variable: l'ensemble des sous-facteurs touchés (clés
 *   `termIdx:k`), puis les réponses aux deux reconnaissances.
 * Mathematical state: les termes en Term[] ; le facteur commun vient de
 *   `factorOut`, jamais d'une liste de bonnes réponses.
 * Visual consequence: dès que le 3 est touché dans les DEUX cartes, le
 *   rectangle 3 × (2x + 3) apparaît avec ses deux morceaux déjà comptés —
 *   les côtés sont retrouvés.
 * Expected observation: 6x + 9 = 3(2x + 3), et surtout PAS 3(2x + 9) : le
 *   second terme doit lui aussi être divisé.
 * Misconception targeted: « 6x + 9 = 3(2x + 9) » (#7, un seul terme divisé)
 *   et « a² − b² = (a − b)² ».
 * Feedback: quand un seul terme porte le facteur, le message nomme le terme
 *   oublié ; le tableau de valeurs départage 3(2x + 3) et 3(2x + 9).
 * Formalization: la carte « À retenir » de l'étape 4 rassemble les trois
 *   gestes de la leçon — développer, réduire, factoriser — écrits comme des
 *   flèches sur le rectangle.
 * Scaffolding: après 3 essais infructueux, « Je ne trouve pas — montre-moi »
 *   allume les deux facteurs et reconstruit le rectangle.
 * Transfer: étapes 2 et 3, deux factorisations sans facteur commun visible —
 *   ce sont les identités du module 5, lues à l'envers.
 */
const SUM = [term(6, 1), term(9, 0)];              // 6x + 9
const { factor: F, rest: REST } = factorOut(SUM);  // 3 et 2x + 3
const REBUILT = { a: [F], b: REST };               // 3 × (2x + 3)
const REBUILT_IDS = ['r0c0', 'r0c1'];

/** Les clés `termIdx:k` qui correspondent au facteur commun « 3 ». */
const FACTOR_KEYS = SUM.map((t, i) =>
  atomicFactors(t)
    .map((f, k) => ({ f, key: `${i}:${k}` }))
    .filter(({ f }) => f === String(Math.abs(F.coef)))
    .map(({ key }) => key),
);

export default function Module06Factoriser() {
  const [picked, setPicked] = useState(() => new Set());
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [diffDone, setDiffDone] = useState(false);
  const [squareDone, setSquareDone] = useState(false);
  const [tested, setTested] = useState(() => new Set());

  // Le facteur est trouvé quand CHAQUE terme porte un « 3 » touché.
  const perTerm = FACTOR_KEYS.map((keys) => keys.some((k) => picked.has(k)));
  const factorFound = perTerm.every(Boolean);
  const done1 = factorFound || revealed;
  const done2 = diffDone;
  const done3 = squareDone;
  const done4 = done3;

  const missingTermLabel = perTerm
    .map((ok, i) => (ok ? null : formatTerms([SUM[i]])))
    .filter(Boolean)
    .join(' et ');

  const reveal = () => {
    setPicked(new Set(FACTOR_KEYS.map((keys) => keys[0])));
    setRevealed(true);
  };

  const rebuiltVisible = done1;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Factoriser, le chemin inverse"
      moduleSubtitle="Des morceaux, retrouve les côtés du rectangle."
      estimatedTime="10 min"
      brief={{
        tag: '🟣 Mission 06',
        title: 'Maya a démonté son parterre. Il ne reste que les morceaux.',
        tone: 'purple',
        body: (
          <p>
            Au module 4, tu partais des côtés pour trouver les morceaux. Cette fois c’est l’inverse :
            <strong> 6x + 9</strong> traîne en pièces détachées, et il faut retrouver le rectangle.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le facteur commun',
          subtitle: 'Touche-le dans CHAQUE carte — pas dans une seule.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Sous chaque carte, ses facteurs. Cherche le nombre qui apparaît dans{' '}
                <strong>les deux</strong> cartes, et touche-le dans chacune.
              </p>
              <TermCards
                terms={SUM}
                mode="common-factor"
                selected={[]}
                factorSelected={picked}
                onFactorTap={(i, f, k) => {
                  const key = `${i}:${k}`;
                  const next = new Set(picked);
                  if (next.has(key)) next.delete(key);
                  else next.add(key);
                  setPicked(next);
                  const ok = FACTOR_KEYS.every((keys) => keys.some((kk) => next.has(kk)));
                  if (ok) kit.react(true);
                  else setTries((t) => t + 1);
                }}
                disabled={done1}
                hint="Touche les petites cases sous les cartes"
                title="6x + 9, en pièces détachées"
              />
              {!done1 && (
                <Feedback tone="info">
                  {picked.size === 0
                    ? '6x se décompose en 2 × 3 × x, et 9 en 3 × 3. Un nombre est présent des deux côtés.'
                    : `Le facteur n’est encore touché que dans une carte : il manque ${missingTermLabel}. Si on ne divise qu’un terme, on écrit 3(2x + 9) — et ce n’est pas la même quantité.`}
                </Feedback>
              )}
              {!done1 && tries >= 3 && (
                <button
                  type="button"
                  onClick={() => { reveal(); kit.react(false); }}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}
              {rebuiltVisible && (
                <>
                  <p className="text-sm font-semibold text-slate-700">
                    Le rectangle se reconstruit — les côtés sont retrouvés :
                  </p>
                  <AlgebraRect
                    product={REBUILT}
                    mode="rebuild"
                    splitA
                    splitB
                    counted={REBUILT_IDS}
                    frozen
                    caption="Les deux morceaux 6x et 9 forment un rectangle de hauteur 3."
                  />
                  <Feedback tone="ok">
                    Le 3 est commun aux deux morceaux : il devient la{' '}
                    <strong>hauteur</strong> du rectangle, et ce qui reste —{' '}
                    <MathText>{`$${formatTerms(REST, { latex: true })}$`}</MathText> — en devient la
                    largeur. Donc{' '}
                    <MathText>{`$${formatTerms(SUM, { latex: true })} = ${formatProduct(REBUILT, { latex: true })}$`}</MathText>.
                    {revealed && ' (Le facteur t’a été montré — refais le geste sur l’étape suivante.)'}
                  </Feedback>
                  <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-4 space-y-1.5">
                    <p className="text-sm font-semibold text-purple-900">Le mot :</p>
                    <p className="text-sm text-purple-900 leading-relaxed">
                      <strong>Factoriser</strong>, c’est écrire une somme sous forme de{' '}
                      <strong>produit</strong> — retrouver les côtés du rectangle à partir de ses
                      morceaux. C’est exactement développer, lu à l’envers ; et la vérification est
                      gratuite : redéveloppe et tu dois retomber sur la somme de départ.
                    </p>
                  </div>
                  <ValueTable
                    columns={[
                      { id: 'somme', label: <MathText>{'$6x+9$'}</MathText>, fn: (x) => 6 * x + 9 },
                      { id: 'juste', label: <MathText>{'$3(2x+3)$'}</MathText>, fn: (x) => 3 * (2 * x + 3) },
                      { id: 'piege', label: <MathText>{'$3(2x+9)$'}</MathText>, fn: (x) => 3 * (2 * x + 9) },
                    ]}
                    xs={[0, 1, 2, 5]}
                    tested={tested}
                    onTest={(v) => {
                      const next = new Set(tested);
                      next.add(v);
                      setTested(next);
                    }}
                    caption="3(2x + 9) n’a divisé qu’un terme sur deux — le tableau le dit tout de suite."
                  />
                  {tested.size === 0 && (
                    <p className="text-xs text-slate-500">
                      Touche une valeur de x pour voir le piège 3(2x + 9) s’écarter.
                    </p>
                  )}
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Quand le facteur commun n’existe pas',
          subtitle: 'x² − 25 : deux carrés, un signe moins.',
          done: done2,
          content: (
            <TapQuestion
              prompt={
                <>
                  <MathText>{'$x^{2} - 25$'}</MathText> n’a aucun facteur commun. Comment le
                  factoriser ?
                </>
              }
              options={[
                '$(x - 5)^{2}$',
                '$(x + 5)(x - 5)$',
                '$(x + 5)^{2}$',
                '$x(x - 25)$',
              ]}
              renderOption={(o) => <MathText>{o}</MathText>}
              optionLabel={(i) => ['(x − 5)²', '(x + 5)(x − 5)', '(x + 5)²', 'x(x − 25)'][i]}
              correctionLabel="(x + 5)(x − 5)"
              cols={2}
              correct={1}
              explain={
                <>
                  C’est <MathText>{'$a^{2} - b^{2}$'}</MathText> avec{' '}
                  <MathText>{'$a = x$'}</MathText> et <MathText>{'$b = 5$'}</MathText> — le morceau qui
                  glisse, au module 5. Vérification : développe{' '}
                  <MathText>{'$(x + 5)(x - 5) = x^{2} - 5x + 5x - 25 = x^{2} - 25$'}</MathText>. Les
                  deux bandes de x s’annulent, c’est ce qui rend l’identité si utile.
                </>
              }
              explainWrong={
                <>
                  <MathText>{'$(x - 5)^{2}$'}</MathText> vaut{' '}
                  <MathText>{'$x^{2} - 10x + 25$'}</MathText> — un terme en x de trop et un +25 au lieu
                  d’un −25. Pour x = 0 : <MathText>{'$(0-5)^{2} = 25$'}</MathText> alors que{' '}
                  <MathText>{'$0 - 25 = -25$'}</MathText>. Une différence de deux carrés se factorise
                  toujours en <MathText>{'$(a + b)(a - b)$'}</MathText>.
                </>
              }
              solved={done2}
              onAnswered={() => setDiffDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Reconnaître un carré',
          subtitle: 'x² + 6x + 9 : trois termes, une seule forme possible.',
          done: done3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={
                  <>
                    Quelle est la forme factorisée de <MathText>{'$x^{2} + 6x + 9$'}</MathText> ?
                  </>
                }
                options={[
                  '$(x + 3)^{2}$',
                  '$(x + 9)^{2}$',
                  '$(x + 3)(x - 3)$',
                  '$x(x + 6) + 9$',
                ]}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['(x + 3)²', '(x + 9)²', '(x + 3)(x − 3)', 'x(x + 6) + 9'][i]}
                correctionLabel="(x + 3)²"
                cols={2}
                correct={0}
                explain={
                  <>
                    <MathText>{'$x^{2}$'}</MathText> est le carré de x,{' '}
                    <MathText>{'$9$'}</MathText> le carré de 3, et le terme du milieu vaut bien{' '}
                    <MathText>{'$2 \\times x \\times 3 = 6x$'}</MathText> : c’est{' '}
                    <MathText>{'$(x + 3)^{2}$'}</MathText>, le carré découpé en quatre du module 5.
                  </>
                }
                explainWrong={
                  <>
                    <MathText>{'$(x + 9)^{2}$'}</MathText> donnerait{' '}
                    <MathText>{'$x^{2} + 18x + 81$'}</MathText> ; c’est le 9 du milieu qu’il faut lire
                    comme <MathText>{'$3^{2}$'}</MathText>, pas comme le côté. Le test du terme central
                    est décisif : <MathText>{'$2 \\times x \\times 3 = 6x$'}</MathText> ✓, alors que{' '}
                    <MathText>{'$x(x + 6) + 9$'}</MathText> n’est même pas un produit — il reste un
                    « + 9 » dehors.
                  </>
                }
                solved={done3}
                onAnswered={() => setSquareDone(true)}
              />
              {done3 && (
                <>
                  <AlgebraRect
                    product={{ a: [term(1, 1), term(3, 0)], b: [term(1, 1), term(3, 0)] }}
                    mode="rebuild"
                    splitA
                    splitB
                    counted={['r0c0', 'r0c1', 'r1c0', 'r1c1']}
                    merged
                    frozen
                    caption="Les quatre morceaux x², 3x, 3x et 9 forment un carré de côté x + 3."
                  />
                  <Feedback tone="ok">
                    Le rectangle est un <strong>carré</strong> : ses deux côtés valent{' '}
                    <MathText>{'$x + 3$'}</MathText>. Les deux bandes de{' '}
                    <MathText>{'$3x$'}</MathText> sont exactement le{' '}
                    <MathText>{'$6x$'}</MathText> du milieu.
                  </Feedback>
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'À retenir',
          subtitle: 'Les trois gestes de la leçon, sur une seule image.',
          done: done4,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-purple-200 bg-white p-4 space-y-3">
                <p className="text-sm font-bold text-purple-900">Une image, deux sens de lecture</p>
                <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 space-y-2 text-sm text-purple-900">
                  <p className="text-center font-mono font-bold">
                    produit&nbsp;&nbsp;<span aria-hidden="true">──développer──▶</span>&nbsp;&nbsp;somme
                  </p>
                  <p className="text-center font-mono font-bold">
                    somme&nbsp;&nbsp;<span aria-hidden="true">◀──factoriser──</span>&nbsp;&nbsp;produit
                  </p>
                  <p className="text-center">
                    <MathText>{'$3(2x + 3) \\;\\longleftrightarrow\\; 6x + 9$'}</MathText>
                  </p>
                </div>
                <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                  <p>
                    <strong>Développer</strong> : chaque terme d’un côté rencontre chaque terme de
                    l’autre. <MathText>{'$k(a + b) = ka + kb$'}</MathText> et{' '}
                    <MathText>{'$(a + b)(c + d) = ac + ad + bc + bd$'}</MathText>.
                  </p>
                  <p>
                    <strong>Réduire</strong> : empiler les termes semblables — ceux qui portent la même
                    forme de tuile. Ça ne change jamais la quantité.
                  </p>
                  <p>
                    <strong>Factoriser</strong> : sortir le facteur commun de{' '}
                    <strong>tous</strong> les termes, ou reconnaître une identité :
                  </p>
                  <ul className="list-none space-y-1 pl-2 font-medium">
                    <li><MathText>{'$a^{2} + 2ab + b^{2} = (a + b)^{2}$'}</MathText></li>
                    <li><MathText>{'$a^{2} - 2ab + b^{2} = (a - b)^{2}$'}</MathText></li>
                    <li><MathText>{'$a^{2} - b^{2} = (a + b)(a - b)$'}</MathText></li>
                  </ul>
                  <p>
                    <strong>Le réflexe de vérification</strong> : redévelopper le produit obtenu, ou
                    tester deux valeurs. Une seule valeur ne prouve rien ; une seule valeur qui diffère
                    réfute tout.
                  </p>
                </div>
              </div>
              <Feedback tone="info">
                Cette carte est là pour être relue — rien à toucher. L’étape est validée dès que tu as
                reconnu le carré à l’étape 3.
              </Feedback>
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Factoriser, c’est retrouver les <strong>côtés</strong> du rectangle à partir de ses morceaux.
          Même image que développer, lue dans l’autre sens — et la vérification est toujours à portée
          de main.
        </Feedback>
      }
    />
  );
}
