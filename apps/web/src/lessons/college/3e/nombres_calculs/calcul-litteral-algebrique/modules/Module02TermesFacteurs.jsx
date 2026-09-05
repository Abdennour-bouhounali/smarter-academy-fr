import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TermCards from '../components/TermCards';
import TileBar from '../components/TileBar';
import { term, mergeTerms, isReduced, formatTerms } from '../components/litteralUtils';

/**
 * Module 2 — DISCOVERY : « Termes et facteurs ».
 *
 * Activity: toucher les termes d'une expression, puis les facteurs d'un
 *   terme, puis empiler deux cartes semblables.
 * Mathematical objective: distinguer par le geste ce qu'on ADDITIONNE (les
 *   termes) de ce qu'on MULTIPLIE (les facteurs), et faire de « termes
 *   semblables » une propriété de FORME de tuile.
 * Student action: taper des cartes et des sous-parties sur `TermCards`.
 * Controlled variable: la sélection de cartes / de facteurs, et la paire
 *   qu'on tente d'empiler.
 * Mathematical state: l'expression en Term[] ; la fusion passe par
 *   `mergeTerms`, qui retourne null pour des termes non semblables — le
 *   refus n'est pas une liste de bonnes réponses, c'est le modèle.
 * Visual consequence: la carte s'entoure ; la `TileBar` montre les formes ;
 *   une fusion refusée laisse les cartes en place.
 * Expected observation: 3x² + 5x − 2x + 7 a quatre termes ; seuls 5x et −2x
 *   s'empilent ; le facteur x est commun à 5x et −2x.
 * Misconception targeted: « 3x + 2 = 5x » (#1) et « 3x + 2x = 5x² » (#2).
 * Feedback: le refus est formulé en tuiles (« une tuile x et une tuile 1
 *   n'ont pas la même forme »), jamais « faux ».
 * Formalization: « terme », « facteur », « termes semblables » sont nommés
 *   à la fin des étapes 1, 2 et 3 respectivement.
 * Scaffolding: après 3 refus, « Montre-moi » regroupe la bonne paire.
 * Transfer: étape 4, quatre paires à trier — dont deux pièges classiques.
 */
const EXPR = [term(3, 2), term(5, 1), term(-2, 1), term(7, 0)]; // 3x² + 5x − 2x + 7

export default function Module02TermesFacteurs() {
  const [selectedTerms, setSelectedTerms] = useState([]);
  const [factorKeys, setFactorKeys] = useState(() => new Set());
  const [factorsDone, setFactorsDone] = useState(false);
  const [expr, setExpr] = useState(EXPR);
  const [pending, setPending] = useState(null);
  const [refusal, setRefusal] = useState(null);
  const [refuseCount, setRefuseCount] = useState(0);
  const [mergeRevealed, setMergeRevealed] = useState(false);
  const [batchDone, setBatchDone] = useState(false);

  const termsDone = selectedTerms.length === 4;
  const mergeDone = isReduced(expr);

  // Étape 2 : les facteurs de 5x sont 5 et x (indices 0 et 1 du terme 1).
  const wantedFactorKeys = ['1:0', '1:1'];
  const factorsPicked = wantedFactorKeys.every((k) => factorKeys.has(k));

  const doMerge = (i, j) => {
    const next = mergeTerms(expr, i, j);
    setPending(null);
    if (next) { setExpr(next); setRefusal(null); }
  };

  const doRefuse = (i, j) => {
    setRefusal([expr[i], expr[j]]);
    setRefuseCount((c) => c + 1);
    setPending(null);
  };

  const tileWord = (t) => (t.deg === 2 ? 'une tuile x²' : t.deg === 1 ? 'une tuile x' : 'une tuile 1');

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Termes et facteurs"
      moduleSubtitle="Ce qu’on additionne, ce qu’on multiplie — et ce qui s’empile."
      estimatedTime="8 min"
      brief={{
        tag: '🧱 Mission 02',
        title: 'Les dalles de Maya deviennent des tuiles.',
        tone: 'sky',
        body: (
          <p>
            Une expression, ce sont des morceaux additionnés. Chaque morceau est lui-même un produit.
            Touche-les pour les séparer — les mots viendront après.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Touche chaque terme',
          subtitle: 'Un terme, c’est ce qui est ADDITIONNÉ.',
          done: termsDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Voici l’expression <MathText>{'$3x^{2} + 5x - 2x + 7$'}</MathText>. Elle est faite de
                morceaux séparés par des + et des −. Touche-les tous, un par un.
              </p>
              <TermCards
                terms={EXPR}
                mode="select-terms"
                selected={selectedTerms}
                onSelect={(i) => {
                  const next = selectedTerms.includes(i)
                    ? selectedTerms.filter((k) => k !== i)
                    : [...selectedTerms, i];
                  setSelectedTerms(next);
                  if (next.length === 4) kit.react(true);
                }}
                hint="Touche une carte pour la sélectionner"
                title="Les morceaux de l’expression"
              />
              {!termsDone && (
                <Feedback tone="info">
                  {selectedTerms.length} carte{selectedTerms.length > 1 ? 's' : ''} touchée
                  {selectedTerms.length > 1 ? 's' : ''} sur 4. Attention au signe : le morceau
                  « <strong className="font-mono">−2x</strong> » emporte son moins avec lui.
                </Feedback>
              )}
              {termsDone && (
                <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 space-y-1.5">
                  <p className="text-sm font-semibold text-sky-900">Le mot :</p>
                  <p className="text-sm text-sky-900 leading-relaxed">
                    Ces quatre morceaux sont les <strong>termes</strong> de l’expression : ce qui est
                    additionné. Le signe fait partie du terme —{' '}
                    <MathText>{'$-2x$'}</MathText> est un terme, pas <MathText>{'$2x$'}</MathText>.
                  </p>
                </div>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Et à l’intérieur d’un terme ?',
          subtitle: 'Un facteur, c’est ce qui est MULTIPLIÉ.',
          done: factorsDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Sous chaque carte, ses morceaux multipliés. Touche les deux qui composent{' '}
                <MathText>{'$5x$'}</MathText>, puis valide.
              </p>
              <TermCards
                terms={EXPR}
                mode="select-factors"
                selected={[1]}
                factorSelected={factorKeys}
                onFactorTap={(i, f, k) => {
                  const key = `${i}:${k}`;
                  setFactorKeys((s) => {
                    const next = new Set(s);
                    if (next.has(key)) next.delete(key); else next.add(key);
                    return next;
                  });
                }}
                disabled={factorsDone}
                hint="Touche les petites cases sous une carte"
                title="Chaque terme est un produit"
              />
              {!factorsDone && (
                <>
                  <Feedback tone="info">
                    {factorsPicked
                      ? 'Tu as touché 5 et x — les deux facteurs de 5x. Valide pour continuer.'
                      : `Les facteurs de 5x sont deux : le nombre et la lettre. ${factorKeys.size} case(s) touchée(s).`}
                  </Feedback>
                  <button
                    type="button"
                    disabled={!factorsPicked}
                    onClick={() => { setFactorsDone(true); kit.react(true); }}
                    className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      factorsPicked
                        ? 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    Valider les facteurs de 5x
                  </button>
                </>
              )}
              {factorsDone && (
                <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 space-y-1.5">
                  <p className="text-sm font-semibold text-sky-900">Le mot :</p>
                  <p className="text-sm text-sky-900 leading-relaxed">
                    <MathText>{'$5$'}</MathText> et <MathText>{'$x$'}</MathText> sont les{' '}
                    <strong>facteurs</strong> de <MathText>{'$5x$'}</MathText> : ce qui est multiplié.
                    On additionne des <strong>termes</strong>, on multiplie des <strong>facteurs</strong>.
                  </p>
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Empile ce qui a la même forme',
          subtitle: 'Deux cartes à la fois.',
          done: mergeDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Touche une carte, puis une seconde pour tenter de les empiler. Regarde les tuiles
                dessous : elles disent tout de suite si ça peut marcher.
              </p>
              <TermCards
                terms={expr}
                mode="merge"
                pending={pending}
                onSelect={(i) => { setPending(pending === i ? null : i); setRefusal(null); }}
                onMerge={(i, j) => { doMerge(i, j); kit.react(true); }}
                onRefuse={(i, j) => { doRefuse(i, j); kit.react(false); }}
                disabled={mergeDone}
                title="Empile les cartes semblables"
              />
              <TileBar terms={expr} />
              {refusal && !mergeDone && (
                <Feedback tone="ko">
                  Empilement refusé : <strong className="font-mono">{formatTerms([refusal[0]])}</strong>{' '}
                  est {tileWord(refusal[0])} et{' '}
                  <strong className="font-mono">{formatTerms([refusal[1]])}</strong> est{' '}
                  {tileWord(refusal[1])}. Des tuiles de formes différentes ne s’empilent pas — il faudrait
                  inventer une nouvelle forme, ce qui changerait la quantité.
                </Feedback>
              )}
              {!mergeDone && !refusal && (
                <Feedback tone="info">
                  Il reste {expr.length} cartes. Cherche les deux qui portent la <strong>même forme</strong>{' '}
                  de tuile.
                </Feedback>
              )}
              {!mergeDone && refuseCount >= 3 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = mergeTerms(expr, 1, 2);
                    if (next) setExpr(next);
                    setMergeRevealed(true);
                    setRefusal(null);
                    kit.react(false);
                  }}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}
              {mergeDone && (
                <>
                  <Feedback tone="ok">
                    <MathText>{'$5x$'}</MathText> et <MathText>{'$-2x$'}</MathText> portent la même forme
                    de tuile : ils s’empilent en <MathText>{'$3x$'}</MathText>. L’expression s’écrit
                    maintenant <MathText>{`$${formatTerms(expr, { latex: true })}$`}</MathText>.
                    {mergeRevealed && ' (La paire t’a été montrée — refais le geste à l’étape suivante.)'}
                  </Feedback>
                  <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 space-y-1.5">
                    <p className="text-sm font-semibold text-sky-900">Le mot :</p>
                    <p className="text-sm text-sky-900 leading-relaxed">
                      Deux termes qui portent la même forme de tuile — donc la même partie littérale —
                      sont des <strong>termes semblables</strong>. Eux seuls se regroupent, et on ajoute
                      alors leurs coefficients : <MathText>{'$5x - 2x = 3x$'}</MathText>. Le x ne change
                      pas de forme au passage.
                    </p>
                  </div>
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Semblables ou pas ?',
          done: batchDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chaque paire : peut-on l’empiler en une seule carte ?
                </p>
              }
              rows={[
                {
                  id: 'p1',
                  label: <MathText>{'$7x \\;\\text{ et }\\; 2x$'}</MathText>,
                  options: ['oui', 'non'],
                  correct: 0,
                  correction: 'même tuile x → 7x + 2x = 9x',
                },
                {
                  id: 'p2',
                  label: <MathText>{'$4x^{2}$'}</MathText>,
                  options: ['oui', 'non'],
                  correct: 1,
                  correction: 'tuile x² et tuile x : formes différentes',
                },
                {
                  id: 'p3',
                  label: <MathText>{'$3x$'}</MathText>,
                  options: ['oui', 'non'],
                  correct: 1,
                  correction: 'tuile x et tuile 1 : 3x + 2 ne se réduit pas',
                },
                {
                  id: 'p4',
                  label: <MathText>{'$-5$'}</MathText>,
                  options: ['oui', 'non'],
                  correct: 0,
                  correction: 'deux tuiles 1 → −5 + 8 = 3',
                },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? (
                    <>
                      Tout juste. La règle tient en une phrase : deux termes se regroupent{' '}
                      <strong>si et seulement si</strong> ils portent la même forme de tuile.
                    </>
                  ) : (
                    <>
                      {nCorrect} / {total}. Les deux pièges classiques sont là :{' '}
                      <MathText>{'$4x^{2} + 2x$'}</MathText> ne fait pas{' '}
                      <MathText>{'$6x^{2}$'}</MathText> (formes différentes), et{' '}
                      <MathText>{'$3x + 2$'}</MathText> ne fait pas <MathText>{'$5x$'}</MathText> — on
                      le vérifiera au module suivant en mettant x = 2.
                    </>
                  )}
                </Feedback>
              )}
              solved={batchDone}
              onAnswered={() => setBatchDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          On additionne des <strong>termes</strong>, on multiplie des <strong>facteurs</strong> — et
          seules les tuiles de même forme s’empilent. C’est tout ce qu’il faut pour réduire.
        </Feedback>
      }
    />
  );
}
