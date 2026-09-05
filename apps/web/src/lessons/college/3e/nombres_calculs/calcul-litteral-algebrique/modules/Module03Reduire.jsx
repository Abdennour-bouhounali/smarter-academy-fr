import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TermCards from '../components/TermCards';
import TileBar from '../components/TileBar';
import { term, mergeTerms, isReduced, formatTerms } from '../components/litteralUtils';

/**
 * Module 3 — DISCOVERY : « Réduire sans se tromper ».
 *
 * Activity: empiler les cartes semblables de deux expressions à relatifs,
 *   puis mettre à l'épreuve l'égalité « 3x + 2 = 5x » sur un tableau de
 *   valeurs.
 * Mathematical objective: établir que réduire ne change PAS la quantité
 *   (l'expression réduite vaut la même chose pour tout x), et qu'une seule
 *   valeur d'accord ne prouve rien.
 * Student action: taper deux cartes pour tenter un empilement ; puis prédire
 *   l'égalité ; puis taper des puces x = 1, x = 2… sur le tableau.
 * Controlled variable: la paire de cartes visée, puis la valeur de x testée.
 * Mathematical state: l'expression en Term[] (mergeTerms décide seul si
 *   l'empilement est possible) et l'ensemble des x testés.
 * Visual consequence: une paire semblable disparaît en une carte ; une paire
 *   non semblable laisse tout en place et la TileBar montre pourquoi ; dans
 *   le tableau, la ligne x = 1 est VERTE (piège) et la ligne x = 2 est ROSE.
 * Expected observation: 5x − 8 − 2x + 3 se réduit à 3x − 5, jamais à autre
 *   chose ; et 3x + 2 vaut 5 quand 5x vaut 5 — mais 8 contre 10 dès x = 2.
 * Misconception targeted: « 3x + 2 = 5x » (#1), « 3x + 2x = 5x² » (#2),
 *   « si ça marche pour x = 1, c'est égal » (#6), « −(x − 4) = −x − 4 » (#8).
 * Feedback: le refus d'empilement est formulé en tuiles ; le tableau colore
 *   la ligne qui tue l'égalité — la conclusion se LIT.
 * Formalization: le mot « réduire » est nommé après l'étape 1, la règle
 *   « une valeur ne suffit pas » après l'étape 3.
 * Scaffolding: après 3 refus, « Je ne trouve pas — montre-moi » regroupe une
 *   bonne paire et signale la révélation ; les cartes restent actives.
 * Transfer: étape 4, le facteur −1 devant une parenthèse — le même refus,
 *   déguisé en signe.
 */
const E1 = [term(5, 1), term(-8, 0), term(-2, 1), term(3, 0)];   // 5x − 8 − 2x + 3
const E2 = [term(4, 2), term(-1, 1), term(-3, 2)];               // 4x² − x − 3x²

const TILE_WORD = (t) => (t.deg === 2 ? 'une tuile x²' : t.deg === 1 ? 'une tuile x' : 'une tuile 1');

/** Première paire semblable trouvée dans l'expression (pour l'échappatoire). */
function firstLikePair(terms) {
  for (let i = 0; i < terms.length; i += 1) {
    for (let j = i + 1; j < terms.length; j += 1) {
      if (terms[i].deg === terms[j].deg) return [i, j];
    }
  }
  return null;
}

function useMergeBoard(initial) {
  const [expr, setExpr] = useState(initial);
  const [pending, setPending] = useState(null);
  const [refusal, setRefusal] = useState(null);
  const [refuseCount, setRefuseCount] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const select = (i) => { setPending((p) => (p === i ? null : i)); setRefusal(null); };
  const merge = (i, j) => {
    const next = mergeTerms(expr, i, j);
    setPending(null);
    if (next) { setExpr(next); setRefusal(null); }
  };
  const refuse = (i, j) => {
    setRefusal([expr[i], expr[j]]);
    setRefuseCount((c) => c + 1);
    setPending(null);
  };
  /** Un pas de révélation : empile UNE bonne paire, jusqu'à la forme réduite. */
  const revealStep = () => {
    setExpr((cur) => {
      let out = cur;
      let pair = firstLikePair(out);
      while (pair) {
        const next = mergeTerms(out, pair[0], pair[1]);
        if (!next) break;
        out = next;
        pair = firstLikePair(out);
      }
      return out;
    });
    setPending(null);
    setRefusal(null);
    setRevealed(true);
  };

  return { expr, pending, refusal, refuseCount, revealed, select, merge, refuse, revealStep };
}

function EscapeHatch({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      Je ne trouve pas — montre-moi
    </button>
  );
}

function RefusalFeedback({ refusal }) {
  return (
    <Feedback tone="ko">
      Empilement refusé : <strong className="font-mono">{formatTerms([refusal[0]])}</strong> est{' '}
      {TILE_WORD(refusal[0])} et <strong className="font-mono">{formatTerms([refusal[1]])}</strong>{' '}
      est {TILE_WORD(refusal[1])}. Deux formes différentes ne s’empilent pas — regarde les tuiles
      dessous : il n’y a aucun moyen de les mettre dans la même pile.
    </Feedback>
  );
}

export default function Module03Reduire() {
  const b1 = useMergeBoard(E1);
  const b2 = useMergeBoard(E2);
  const [predicted, setPredicted] = useState(false);
  const [tested, setTested] = useState(() => new Set());
  const [signDone, setSignDone] = useState(false);

  const done1 = isReduced(b1.expr) && b1.expr.length <= 2;
  const done2 = isReduced(b2.expr) && b2.expr.length <= 2;
  const done3 = predicted && tested.has(2);
  const done4 = signDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Réduire sans se tromper"
      moduleSubtitle="3x + 2 n’est pas 5x. Mets x = 2 et regarde ce qui se passe."
      estimatedTime="9 min"
      brief={{
        tag: '🧮 Mission 03',
        title: 'Les tuiles de Maya sont en désordre — et certaines sont en moins.',
        tone: 'cyan',
        body: (
          <p>
            Empiler ce qui a la même forme, c’est <em>réduire</em>. Cette fois les signes s’en mêlent —
            et une écriture qui a l’air juste pour une valeur ne l’est pas forcément pour toutes.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Range 5x − 8 − 2x + 3',
          subtitle: 'Deux piles à faire, pas une seule.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Quatre cartes, deux formes de tuile. Touche une carte puis une autre pour tenter de les
                empiler. Le signe voyage avec la carte.
              </p>
              <TermCards
                terms={b1.expr}
                mode="merge"
                pending={b1.pending}
                onSelect={b1.select}
                onMerge={(i, j) => { b1.merge(i, j); kit.react(true); }}
                onRefuse={(i, j) => { b1.refuse(i, j); kit.react(false); }}
                disabled={done1}
                title="Les cartes à ranger"
              />
              <TileBar terms={b1.expr} />
              {b1.refusal && !done1 && <RefusalFeedback refusal={b1.refusal} />}
              {!done1 && !b1.refusal && (
                <Feedback tone="info">
                  {b1.expr.length} cartes en jeu — il en restera <strong>2</strong> quand tout sera
                  rangé. Cherche d’abord les deux tuiles x, puis les deux tuiles 1.
                </Feedback>
              )}
              {!done1 && b1.refuseCount >= 3 && (
                <EscapeHatch onClick={() => { b1.revealStep(); kit.react(false); }} />
              )}
              {done1 && (
                <>
                  <Feedback tone="ok">
                    <MathText>{'$5x - 2x = 3x$'}</MathText> et <MathText>{'$-8 + 3 = -5$'}</MathText> :
                    l’expression s’écrit maintenant{' '}
                    <MathText>{`$${formatTerms(b1.expr, { latex: true })}$`}</MathText>. Le piège
                    classique serait <MathText>{'$3x + 5$'}</MathText> — le −8 aurait perdu son signe.
                    {b1.revealed && ' (Les piles t’ont été montrées — refais le geste à l’étape suivante.)'}
                  </Feedback>
                  <div className="rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-4 space-y-1.5">
                    <p className="text-sm font-semibold text-cyan-900">Le mot :</p>
                    <p className="text-sm text-cyan-900 leading-relaxed">
                      <strong>Réduire</strong> une expression, c’est empiler tous les termes semblables
                      jusqu’à ce qu’il n’en reste plus qu’un par forme de tuile. On n’ajoute rien, on
                      n’enlève rien : la quantité est la même pour <strong>toute</strong> valeur de x.
                    </p>
                  </div>
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Deux formes qui se ressemblent',
          subtitle: '4x² − x − 3x² : attention aux tuiles carrées.',
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Ici, deux cartes portent un <MathText>{'$x^{2}$'}</MathText> et une seule porte un{' '}
                <MathText>{'$x$'}</MathText>. Une tuile carrée et un bâton, ce n’est pas la même forme.
              </p>
              <TermCards
                terms={b2.expr}
                mode="merge"
                pending={b2.pending}
                onSelect={b2.select}
                onMerge={(i, j) => { b2.merge(i, j); kit.react(true); }}
                onRefuse={(i, j) => { b2.refuse(i, j); kit.react(false); }}
                disabled={done2}
                title="Carrés et bâtons"
              />
              <TileBar terms={b2.expr} />
              {b2.refusal && !done2 && <RefusalFeedback refusal={b2.refusal} />}
              {!done2 && !b2.refusal && (
                <Feedback tone="info">
                  Il reste {b2.expr.length} cartes ; deux d’entre elles portent la même forme. Le{' '}
                  <MathText>{'$-x$'}</MathText> restera seul jusqu’au bout : aucune autre tuile x dans
                  le jeu.
                </Feedback>
              )}
              {!done2 && b2.refuseCount >= 3 && (
                <EscapeHatch onClick={() => { b2.revealStep(); kit.react(false); }} />
              )}
              {done2 && (
                <Feedback tone="ok">
                  <MathText>{'$4x^{2} - 3x^{2} = x^{2}$'}</MathText>, et le{' '}
                  <MathText>{'$-x$'}</MathText> reste seul :{' '}
                  <MathText>{`$${formatTerms(b2.expr, { latex: true })}$`}</MathText>. On écrit{' '}
                  <MathText>{'$x^{2}$'}</MathText> et non <MathText>{'$1x^{2}$'}</MathText> : le
                  coefficient 1 ne s’écrit jamais.
                  {b2.revealed && ' (La pile t’a été montrée.)'}
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le piège de la valeur unique',
          subtitle: 'Prédis, puis teste — au moins jusqu’à x = 2.',
          done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <TapQuestion
                prompt={
                  <>
                    Peut-on écrire <MathText>{'$3x + 2 = 5x$'}</MathText> ?
                  </>
                }
                options={[
                  'Oui, on additionne 3 et 2',
                  'Non : ce ne sont pas des termes semblables',
                  'Seulement si x est positif',
                ]}
                cols={1}
                correct={1}
                explain={
                  <>
                    <MathText>{'$3x$'}</MathText> est fait de tuiles x, <MathText>{'$2$'}</MathText> de
                    tuiles 1 : elles ne s’empilent pas. Vérifions-le tout de suite avec des nombres.
                  </>
                }
                explainWrong={
                  <>
                    Additionner 3 et 2 reviendrait à empiler un bâton et un petit carré. Le tableau
                    ci-dessous va trancher : teste plusieurs valeurs de x.
                  </>
                }
                solved={predicted}
                onAnswered={() => setPredicted(true)}
              />
              {predicted && (
                <>
                  <p className="text-sm text-slate-600">
                    Commence par <strong className="font-mono">x = 1</strong>… puis ne t’arrête surtout
                    pas là.
                  </p>
                  <ValueTable
                    columns={[
                      { id: 'gauche', label: <MathText>{'$3x+2$'}</MathText>, fn: (x) => 3 * x + 2 },
                      { id: 'droite', label: <MathText>{'$5x$'}</MathText>, fn: (x) => 5 * x },
                    ]}
                    xs={[0, 1, 2, 3, 5, 10]}
                    tested={tested}
                    onTest={(v) => {
                      const next = new Set(tested);
                      next.add(v);
                      setTested(next);
                      if (v === 2) kit.react(true);
                    }}
                    caption="Une ligne rose suffit à tuer une égalité."
                  />
                  {!done3 && (
                    <Feedback tone="info">
                      {tested.size === 0
                        ? 'Aucune valeur testée : touche « x = 1 » pour voir la surprise.'
                        : tested.has(1) && !tested.has(2)
                        ? 'Pour x = 1, les deux colonnes donnent 5 : la ligne est verte ! Est-ce que ça prouve quelque chose ? Teste x = 2.'
                        : 'Il manque encore x = 2 — la valeur qui décide.'}
                    </Feedback>
                  )}
                </>
              )}
              {done3 && (
                <>
                  <Feedback tone="ok">
                    Pour <MathText>{'$x = 1$'}</MathText> : 5 des deux côtés — l’égalité a l’air vraie.
                    Pour <MathText>{'$x = 2$'}</MathText> : 8 d’un côté, 10 de l’autre. Une seule ligne
                    rose et c’est fini : <MathText>{'$3x + 2 \\neq 5x$'}</MathText>.
                  </Feedback>
                  <div className="rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-4 space-y-1.5">
                    <p className="text-sm font-semibold text-cyan-900">La règle du testeur :</p>
                    <p className="text-sm text-cyan-900 leading-relaxed">
                      Une valeur qui s’accorde ne <strong>prouve</strong> rien — deux machines
                      différentes peuvent se croiser en un point. En revanche, une seule valeur qui
                      diffère <strong>réfute</strong> l’égalité pour de bon. Le tableau ne sert donc pas
                      à confirmer : il sert à <strong>attraper les fausses écritures</strong>.
                    </p>
                  </div>
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le moins devant la parenthèse',
          done: done4,
          content: (
            <TapQuestion
              prompt={
                <>
                  Que vaut <MathText>{'$-(x - 4)$'}</MathText> une fois la parenthèse retirée ?
                </>
              }
              options={['$-x - 4$', '$-x + 4$', '$x - 4$', '$x + 4$']}
              renderOption={(o) => <MathText>{o}</MathText>}
              optionLabel={(i) => ['−x − 4', '−x + 4', 'x − 4', 'x + 4'][i]}
              correctionLabel="−x + 4"
              cols={2}
              correct={1}
              explain={
                <>
                  Le signe − devant la parenthèse est un facteur{' '}
                  <MathText>{'$-1$'}</MathText> qui touche <strong>les deux</strong> termes :{' '}
                  <MathText>{'$-1 \\times x = -x$'}</MathText> et{' '}
                  <MathText>{'$-1 \\times (-4) = +4$'}</MathText>. Test rapide avec x = 0 :{' '}
                  <MathText>{'$-(0 - 4) = 4$'}</MathText> — c’est bien +4.
                </>
              }
              explainWrong={
                <>
                  <MathText>{'$-x - 4$'}</MathText> est l’erreur la plus fréquente : le moins n’a touché
                  que le premier terme. Mets <MathText>{'$x = 0$'}</MathText> :{' '}
                  <MathText>{'$-(0 - 4) = -(-4) = 4$'}</MathText>, alors que{' '}
                  <MathText>{'$-0 - 4 = -4$'}</MathText>. Deux nombres opposés — l’écriture est fausse.
                </>
              }
              solved={done4}
              onAnswered={() => setSignDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Réduire ne change jamais la quantité : c’est un <strong>rangement</strong>, pas un calcul. Et
          quand une écriture te paraît douteuse, tu as maintenant un outil imparable — le{' '}
          <strong>tableau de valeurs</strong>, avec au moins deux lignes.
        </Feedback>
      }
    />
  );
}
