import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EquationBuilder from '../components/EquationBuilder';
import ProblemText from '../components/ProblemText';
import {
  lin, equation, foldCards, solveLinear, isEquivalentEquation, isSolvedForm,
  formatEquation, formatDec, evalLin,
} from '../components/problemUtils';
import { RECTANGLE, PROGRAMME, FORFAIT } from '../components/problemsData';

/**
 * Module 4 — MANIPULATION : « Le Traducteur » (SIGNATURE).
 *
 * Activity: assembler, carte par carte, l'équation qui traduit trois
 *   histoires — le périmètre du rectangle, le programme de calcul, le forfait
 *   de cinéma — puis tester soi-même sa traduction avec la sonde.
 * Mathematical objective: établir qu'une équation MODÉLISE une situation : les
 *   deux membres décrivent la même quantité de deux façons ; la solution est
 *   la valeur pour laquelle ils coïncident.
 * Student action: taper des cartes quantité et opération dans deux membres ;
 *   chaque carte allume le fragment d'énoncé d'où elle vient ; taper des puces
 *   de sonde ; valider.
 * Controlled variable: la suite de jetons de chaque membre.
 * Mathematical state: `{ left: Token[], right: Token[] }` replié par
 *   foldCards en deux Lin ; l'équation obtenue.
 * Visual consequence: l'énoncé s'allume fragment par fragment ; les deux
 *   membres se réécrivent en LaTeX ; la sonde affiche deux nombres.
 * Expected observation: une même histoire admet PLUSIEURS équations correctes
 *   (2x + 2(x + 4) = 40 et 4x + 8 = 40), et un nombre placé du mauvais côté se
 *   voit à la sonde.
 * Misconception targeted: n° 3 du catalogue — « 3x = 25 + 7 » : on écrit la
 *   résolution au lieu de l'histoire. Et « x = 8 » proposé comme traduction.
 * Feedback: la sonde AVANT validation (deux nombres coïncident-ils ?) ; à la
 *   validation, une équation fausse reste à l'écran, l'écart est localisé
 *   (« pour x = 6, gauche 18 mais droite 32 »), et la bonne est révélée après
 *   3 essais.
 * Formalization: étape 3, « une équation est une phrase : gauche et droite
 *   racontent la même quantité » — nommée APRÈS les deux constructions.
 * Scaffolding: fragments surlignés aux étapes 1 et 2, retirés à l'étape 3 ;
 *   ✕ et ↩ à tout moment ; révélation après 3 tentatives.
 * Transfer: le module 7 reprend le builder sur le forfait à 25 €, et la
 *   synthèse du boss l'affiche figé.
 */

/* ── Étape 1 : le rectangle, P = 40 ───────────────────────────────── */
const CARDS_RECT = [
  { id: 'x', label: 'x', latex: 'x', aria: 'la largeur x', kind: 'term', value: lin(1, 0), fragmentId: 'f-relation', tone: 'emerald' },
  { id: 'x4', label: 'x + 4', latex: 'x + 4', aria: 'la longueur x plus 4', kind: 'term', value: lin(1, 4), fragmentId: 'f-relation', tone: 'emerald' },
  { id: 'deux', label: '2', latex: '2', aria: 'le nombre 2', kind: 'term', value: lin(0, 2), fragmentId: null, tone: 'slate' },
  { id: 'quarante', label: '40', latex: '40', aria: 'le périmètre 40', kind: 'term', value: lin(0, 40), fragmentId: 'f-perimetre', tone: 'amber' },
  { id: 'quatre', label: '4', latex: '4', aria: 'le nombre 4', kind: 'term', value: lin(0, 4), fragmentId: 'f-relation', tone: 'slate' },
  { id: 'plus', label: '+', latex: '+', aria: 'le signe plus', kind: 'op', op: '+', fragmentId: null, tone: 'indigo' },
  { id: 'fois', label: '×', latex: '\\times', aria: 'le signe multiplié', kind: 'op', op: '×', fragmentId: null, tone: 'indigo' },
];

/* ── Étape 2 : le programme de calcul ─────────────────────────────── */
const CARDS_PROG = [
  { id: 'x', label: 'x', latex: 'x', aria: 'le nombre choisi x', kind: 'term', value: lin(1, 0), fragmentId: 'f-choisir', tone: 'emerald' },
  { id: 'trois', label: '3', latex: '3', aria: 'le nombre 3', kind: 'term', value: lin(0, 3), fragmentId: 'f-mult', tone: 'indigo' },
  { id: 'sept', label: '7', latex: '7', aria: 'le nombre 7', kind: 'term', value: lin(0, 7), fragmentId: 'f-ajout', tone: 'amber' },
  { id: 'vingtcinq', label: '25', latex: '25', aria: 'le résultat 25', kind: 'term', value: lin(0, 25), fragmentId: 'f-resultat', tone: 'rose' },
  { id: 'plus', label: '+', latex: '+', aria: 'le signe plus', kind: 'op', op: '+', fragmentId: null, tone: 'slate' },
  { id: 'fois', label: '×', latex: '\\times', aria: 'le signe multiplié', kind: 'op', op: '×', fragmentId: null, tone: 'slate' },
];

/* ── Étape 3 : le forfait, SANS surlignage (explorer seul) ────────── */
const CARDS_FORFAIT = [
  { id: 'n9', label: '9n', latex: '9n', aria: 'neuf n', kind: 'term', value: lin(9, 0), fragmentId: 'f-a', tone: 'emerald' },
  { id: 'n5', label: '5n', latex: '5n', aria: 'cinq n', kind: 'term', value: lin(5, 0), fragmentId: 'f-b-var', tone: 'indigo' },
  { id: 'vingtquatre', label: '24', latex: '24', aria: 'vingt-quatre euros', kind: 'term', value: lin(0, 24), fragmentId: 'f-b-fixe', tone: 'amber' },
  { id: 'n', label: 'n', latex: 'n', aria: 'le nombre de séances n', kind: 'term', value: lin(1, 0), fragmentId: null, tone: 'slate' },
  { id: 'neuf', label: '9', latex: '9', aria: 'le nombre 9', kind: 'term', value: lin(0, 9), fragmentId: 'f-a', tone: 'slate' },
  { id: 'plus', label: '+', latex: '+', aria: 'le signe plus', kind: 'op', op: '+', fragmentId: null, tone: 'slate' },
  { id: 'fois', label: '×', latex: '\\times', aria: 'le signe multiplié', kind: 'op', op: '×', fragmentId: null, tone: 'slate' },
];

const MAX_TRIES = 3;

/** Un atelier complet : palette, deux membres, sonde, validation, révélation. */
function BuilderTask({
  problem, cards, expected, variable = 'x', showHighlights = true,
  probeXs, hint, revealText, onDone, done, react,
}) {
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);
  const [active, setActive] = useState('left');
  const [order, setOrder] = useState([]); // pile des ajouts, pour ↩
  const [lit, setLit] = useState(() => new Set());
  const [probed, setProbed] = useState(() => new Set());
  const [probeX, setProbeX] = useState(null);
  const [tries, setTries] = useState(0);
  const [verdict, setVerdict] = useState(null); // { ok, eq }
  const [revealed, setRevealed] = useState(false);

  const committed = verdict?.ok === true || revealed;
  const setSide = (side, fn) => (side === 'left' ? setLeft(fn) : setRight(fn));

  const tap = (card) => {
    const token = card.kind === 'op'
      ? { id: card.id, kind: 'op', op: card.op, label: card.label, aria: card.aria }
      : { id: card.id, kind: 'term', value: card.value, label: card.label, aria: card.aria };
    setSide(active, (t) => [...t, token]);
    setOrder((o) => [...o, active]);
    if (card.fragmentId) setLit(new Set([card.fragmentId]));
    else setLit(new Set());
    setVerdict(null);
  };

  const remove = (side, i) => {
    setSide(side, (t) => t.filter((_, k) => k !== i));
    setOrder((o) => {
      const k = o.lastIndexOf(side);
      return k === -1 ? o : o.filter((_, j) => j !== k);
    });
    setVerdict(null);
    setProbeX(null);
  };

  const undo = () => {
    const last = order[order.length - 1];
    if (!last) return;
    setSide(last, (t) => t.slice(0, -1));
    setOrder((o) => o.slice(0, -1));
    setVerdict(null);
    setProbeX(null);
  };

  const probe = (x) => {
    setProbeX(x);
    setProbed((p) => new Set([...p, x]));
  };

  const commit = () => {
    const l = foldCards(left);
    const r = foldCards(right);
    if (!l || !r) return;
    const built = equation(l, r);
    const solved = isSolvedForm(built);
    const ok = !solved && isEquivalentEquation(built, expected);
    const n = tries + 1;
    setTries(n);
    setVerdict({ ok, eq: built, solved });
    react?.(ok);
    if (ok) {
      onDone?.();
    } else if (n >= MAX_TRIES) {
      setRevealed(true);
      onDone?.();
    }
  };

  const sol = solveLinear(expected);
  const shownEq = revealed && !verdict?.ok ? expected : verdict?.eq ?? expected;

  return (
    <div className="space-y-3">
      <ProblemText
        fragments={problem.fragments}
        highlighted={showHighlights ? lit : undefined}
        title={`Énoncé — ${problem.title}`}
      />

      <EquationBuilder
        cards={cards}
        left={left}
        right={right}
        active={active}
        onSetActive={setActive}
        onTap={tap}
        onRemove={remove}
        onUndo={undo}
        onCommit={commit}
        probeXs={probeXs}
        probed={probed}
        onProbe={probe}
        probeX={probeX}
        variable={variable}
        committed={committed}
        disabled={committed}
      />

      {!verdict && !revealed && (
        <Feedback tone="info">
          {hint}{' '}
          {showHighlights
            ? 'Chaque carte que tu touches allume le morceau de texte d’où elle vient.'
            : 'Cette fois, aucun surlignage : c’est à toi de relier chaque carte à sa phrase.'}
        </Feedback>
      )}

      {verdict && !verdict.ok && !revealed && (
        <Feedback tone="ko">
          Ton équation : <MathText>{`$${formatEquation(verdict.eq, variable)}$`}</MathText>.{' '}
          {verdict.solved ? (
            <>
              C’est une réponse, pas une traduction : <MathText>{`$${variable} = \\ldots$`}</MathText> est ce
              qu’on obtient à la FIN. L’équation doit raconter l’histoire avec ses deux quantités.
            </>
          ) : (
            <>
              Elle ne dit pas la même chose que l’énoncé : pour {variable} ={' '}
              <strong className="font-mono">{formatDec(sol.x)}</strong> — la vraie solution — ton membre de
              gauche vaut{' '}
              <strong className="font-mono">{formatDec(evalLin(verdict.eq.left, sol.x))}</strong> et ton
              membre de droite{' '}
              <strong className="font-mono">{formatDec(evalLin(verdict.eq.right, sol.x))}</strong>. Un
              nombre est du mauvais côté. Essai {tries} sur {MAX_TRIES} — retire une carte et recommence.
            </>
          )}
        </Feedback>
      )}

      {revealed && !verdict?.ok && (
        <Feedback tone="info">
          Voici une traduction correcte :{' '}
          <MathText>{`$${formatEquation(expected, variable)}$`}</MathText>. {revealText}
        </Feedback>
      )}

      {verdict?.ok && (
        <Feedback tone="ok">
          <MathText>{`$${formatEquation(verdict.eq, variable)}$`}</MathText> — accepté. Ton écriture n’est
          peut-être pas celle du corrigé (<MathText>{`$${formatEquation(expected, variable)}$`}</MathText>),
          mais elle a exactement les mêmes solutions : c’est bien la même histoire.{' '}
          {sol.kind === 'unique' && (
            <>
              Elle est vraie pour {variable} ={' '}
              <strong className="font-mono">{formatDec(sol.x)}</strong>, et pour cette valeur seulement.
            </>
          )}
        </Feedback>
      )}

      {(revealed || verdict?.ok) && (
        <p className="text-center text-xs text-slate-500">
          <MathText>{`$${formatEquation(shownEq, variable)}$`}</MathText>
        </p>
      )}
      {done && null}
    </div>
  );
}

export default function Module04Traducteur() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);
  const [probeCount, setProbeCount] = useState(0);
  const [s4, setS4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le Traducteur"
      moduleSubtitle="Assemble l’équation carte par carte, puis teste-la toi-même avec la sonde."
      estimatedTime="11 min"
      brief={{
        tag: '🔤 Mission 04',
        title: 'Une histoire d’un côté, des cartes de l’autre. À toi de faire la traduction.',
        body: (
          <p>
            Tu ne vas rien calculer ici. Tu vas ÉCRIRE ce que l’énoncé raconte, en posant des cartes dans
            deux membres — et tu pourras tester ta propre équation avant de la valider.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le rectangle : périmètre 40 cm',
          subtitle: 'Largeur x, longueur x + 4. Écris que le périmètre vaut 40.',
          done: s1,
          content: (kit) => (
            <BuilderTask
              problem={RECTANGLE}
              cards={CARDS_RECT}
              expected={equation(lin(4, 8), lin(0, 40))}
              probeXs={[5, 8, 10]}
              hint="Le périmètre, c’est le tour : deux largeurs et deux longueurs."
              revealText="2 × x + 2 × (x + 4) marche aussi : c’est la même équation écrite autrement."
              onDone={() => setS1(true)}
              done={s1}
              react={kit.react}
            />
          ),
        },
        {
          num: 2,
          title: 'Le programme de calcul',
          subtitle: '« Je choisis un nombre, je le multiplie par 3, j’ajoute 7, j’obtiens 25. »',
          done: s2,
          content: (kit) => (
            <BuilderTask
              problem={PROGRAMME}
              cards={CARDS_PROG}
              expected={PROGRAMME.equation}
              probeXs={[4, 6, 8]}
              hint="Suis le programme dans l’ordre : le × 3 d’abord, le + 7 ensuite, et le résultat de l’autre côté."
              revealText="Attention au piège classique : « 3x = 25 + 7 » décrit la RÉSOLUTION, pas l’histoire."
              onDone={() => setS2(true)}
              done={s2}
              react={kit.react}
            />
          ),
        },
        {
          num: 3,
          title: 'Le forfait, sans filet',
          subtitle: 'Cette fois, les fragments ne s’allument plus.',
          done: s3,
          content: (kit) => (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700 space-y-2">
                <p>
                  <strong>Une équation est une phrase.</strong> Le membre de gauche et le membre de droite
                  décrivent <em>la même quantité</em> de deux façons ; le signe <MathText>{'$=$'}</MathText>{' '}
                  dit « ces deux façons donnent le même nombre ».
                </p>
                <p>
                  Une même histoire admet donc <strong>plusieurs équations correctes</strong> — tant
                  qu’elles ont les mêmes solutions.
                </p>
              </div>
              <BuilderTask
                problem={FORFAIT}
                cards={CARDS_FORFAIT}
                expected={FORFAIT.equation}
                variable="n"
                showHighlights={false}
                probeXs={[4, 6, 8]}
                hint="Le prix de la carte A d’un côté, le prix de la carte B de l’autre : on cherche quand ils sont égaux."
                revealText="24 € ne dépendent pas du nombre de séances : ils s’ajoutent une seule fois."
                onDone={() => setS3(true)}
                done={s3}
                react={kit.react}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Ce que la sonde t’apprend',
          subtitle: 'Tu as vu deux nombres à chaque test. Que cherchait-on ?',
          done: probeCount >= 2 && s4,
          content: (kit) => (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-indigo-200 bg-white p-3.5 space-y-2">
                <p className="text-sm text-slate-700">
                  Reprends la sonde sur l’équation du forfait{' '}
                  <MathText>{`$${formatEquation(FORFAIT.equation, 'n')}$`}</MathText> : touche au moins deux
                  valeurs de <MathText>{'$n$'}</MathText>.
                </p>
                <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Valeurs de n à sonder">
                  {[4, 5, 6, 7].map((n) => {
                    const l = evalLin(FORFAIT.equation.left, n);
                    const r = evalLin(FORFAIT.equation.right, n);
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => { setProbeCount((c) => c + 1); kit.react(l === r); }}
                        aria-label={`Sonder n égale ${n}`}
                        className="min-h-[44px] px-3 rounded-xl border-2 border-indigo-200 bg-white font-mono text-sm font-bold text-indigo-700 hover:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        n = {n} → {formatDec(l)} / {formatDec(r)}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500" aria-live="polite">
                  {probeCount === 0
                    ? 'Touche une puce : tu verras le prix de la carte A, puis celui de la carte B.'
                    : `${probeCount} test${probeCount > 1 ? 's' : ''} — ${
                        probeCount >= 2 ? 'assez pour répondre.' : 'encore un pour répondre.'
                      }`}
                </p>
              </div>

              {probeCount >= 2 && (
                <TapQuestion
                  prompt={
                    <>
                      Pour quelle valeur de <MathText>{'$n$'}</MathText> le membre de gauche et le membre de
                      droite donnent-ils le même nombre ?
                    </>
                  }
                  options={['n = 4', 'n = 6', 'n = 7']}
                  cols={3}
                  correct={1}
                  explain={
                    <>
                      Pour <MathText>{'$n = 6$'}</MathText> : la carte A coûte{' '}
                      <MathText>{'$9 \\times 6 = 54$'}</MathText> € et la carte B{' '}
                      <MathText>{'$24 + 5 \\times 6 = 54$'}</MathText> €. C’est LA solution de l’équation :
                      la valeur pour laquelle les deux membres coïncident.
                    </>
                  }
                  explainWrong={
                    <>
                      Regarde tes propres tests : pour n = 4, gauche 36 et droite 44 ; pour n = 7, gauche 63
                      et droite 59. Les deux membres ne se croisent qu’une fois, en{' '}
                      <MathText>{'$n = 6$'}</MathText> (54 = 54).
                    </>
                  }
                  solved={s4}
                  onAnswered={() => setS4(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Trois histoires, trois équations — et jamais un seul calcul de résolution. Traduire, c’est dire la
          même quantité deux fois. Reste à organiser la résolution : c’est le module 6.
        </Feedback>
      }
    />
  );
}
