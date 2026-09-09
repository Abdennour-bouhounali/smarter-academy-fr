import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { expr, factorise, texProduct, texExpr, ratToNumber } from '../../../../../common/algebra4e';

/**
 * Module 5 — FORMALISATION : factoriser, le chemin inverse.
 *
 * Activity              choisir, parmi plusieurs facteurs candidats, celui
 *                       qui reconstitue le rectangle — et voir le
 *                       redéveloppement vérifier la réponse tout seul.
 * Mathematical objective factoriser n'est pas une nouvelle règle : c'est le
 *                       développement lu à l'envers, sur le MÊME rectangle.
 *                       On cherche le facteur commun à tous les termes.
 * Expected observation  « un facteur trop petit laisse encore quelque chose
 *                       à sortir ; un facteur qui ne divise pas tout ne
 *                       marche pas du tout ».
 * Misconception targeted factoriser par un diviseur qui ne divise qu'UN des
 *                       deux termes.
 *
 * La vérification est intégrée à la manipulation : le redéveloppement
 * s'affiche à côté du candidat. L'élève n'a pas à croire le système — il
 * VOIT si le retour retombe sur l'expression de départ.
 */
const CIBLE = expr(12, 18);          // 12x + 18
const CANDIDATS = [2, 3, 4, 6];

export default function Module05RemonterLeFacteur() {
  const [choisi, setChoisi] = useState(null);
  const bon = factorise(CIBLE);
  const bonFacteur = ratToNumber(bon.factor);
  const trouve = choisi === bonFacteur;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  /** Ce que donne la factorisation par un candidat — ou pourquoi elle échoue. */
  const essai = (f) => {
    const x = ratToNumber(CIBLE.x);
    const k = ratToNumber(CIBLE.k);
    if (x % f !== 0 || k % f !== 0) return { ok: false, raison: 'ne-divise-pas' };
    const inner = expr(x / f, k / f);
    // Reste-t-il un facteur commun dans la parenthèse ?
    const reste = ratToNumber(factorise(inner).factor);
    return { ok: reste === 1, inner, reste };
  };

  const steps = [
    {
      num: 1,
      title: 'Reconstitue le rectangle',
      subtitle: (
        <>Quel facteur peut-on sortir de <MathText>{'$12x + 18$'}</MathText> ? Essaie-les : le redéveloppement te dira si c’est juste.</>
      ),
      done: trouve,
      content: (kit) => {
        const res = choisi === null ? null : essai(choisi);
        return (
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
              <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                L’expression à factoriser
              </p>
              <div className="text-center text-2xl font-black text-slate-800">
                <MathText>{`$${texExpr(CIBLE)}$`}</MathText>
              </div>

              {res && res.ok !== undefined && res.raison !== 'ne-divise-pas' && (
                <div className="mt-3 space-y-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 p-3 text-center">
                  <div className="text-lg font-bold text-amber-700">
                    <MathText>{`$${texProduct({ n: choisi, d: 1 }, res.inner)}$`}</MathText>
                  </div>
                  <div className="text-xs text-slate-500">on redéveloppe pour vérifier :</div>
                  <div className="font-mono text-sm text-slate-700">
                    <MathText>{`$${choisi} \\times ${ratToNumber(res.inner.x)}x + ${choisi} \\times ${ratToNumber(res.inner.k)} = ${texExpr(CIBLE)}$`}</MathText>
                  </div>
                  <div className="text-xs font-semibold text-emerald-600">
                    ✓ on retombe bien sur l’expression de départ
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Facteurs candidats">
              {CANDIDATS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setChoisi(f);
                    if (f === bonFacteur && !trouve) kit.react(true);
                  }}
                  aria-pressed={f === choisi}
                  className={`min-h-[48px] min-w-[56px] rounded-xl border-2 text-lg font-black tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    f === choisi ? 'border-amber-600 bg-amber-500 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-amber-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {trouve ? (
              <Feedback tone="ok">
                <strong>6</strong> est le plus grand nombre qui divise à la fois 12 et 18 :{' '}
                <MathText>{'$12x + 18 = 6(2x + 3)$'}</MathText>. Le redéveloppement retombe pile sur
                l’expression de départ — c’est la vérification, et elle est gratuite. Essaie encore
                les autres facteurs pour voir ce qui cloche chez eux.
              </Feedback>
            ) : res && res.raison === 'ne-divise-pas' ? (
              <Feedback tone="warn">
                {choisi} ne divise pas les <strong>deux</strong> termes : il faudrait qu’il divise
                12 <em>et</em> 18. Un facteur commun l’est à tous les termes, pas à un seul.
              </Feedback>
            ) : res ? (
              <Feedback tone="warn">
                Ça marche, mais ce n’est pas fini : la parenthèse{' '}
                <MathText>{`$${texExpr(res.inner)}$`}</MathText> contient encore un facteur commun
                (<strong>{res.reste}</strong>). On cherche le <strong>plus grand</strong> facteur
                possible.
              </Feedback>
            ) : (
              <Feedback tone="info">
                Choisis un facteur. S’il convient, sa factorisation et sa vérification s’affichent.
              </Feedback>
            )}
          </div>
        );
      },
    },
    {
      num: 2,
      title: 'Factorise seul',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="factoriser"
            variant="new"
            lead={<>Tu viens de remonter d’une somme vers un produit, et de vérifier en redéveloppant. Ce chemin inverse a un nom.</>}
          />
          <TapQuestion
            prompt={<span>Factorise <MathText>{'$14x - 21$'}</MathText></span>}
            options={[
              <MathText key="a">{'$7(2x - 3)$'}</MathText>,
              <MathText key="b">{'$7(2x - 21)$'}</MathText>,
              <MathText key="c">{'$2(7x - 21)$'}</MathText>,
              <MathText key="d">{'$7(x - 3)$'}</MathText>,
            ]}
            correct={0}
            cols={2}
            requires={['factoriser']}
            correctionLabel="7(2x − 3)"
            explain="7 divise 14 et 21 : 14 ÷ 7 = 2 et 21 ÷ 7 = 3, donc 7(2x − 3). Vérification : 7 × 2x = 14x et 7 × 3 = 21 ✓."
            explainWrong="Le réflexe qui protège de toutes ces erreurs : REDÉVELOPPER la réponse. 7(2x − 21) donnerait 14x − 147, et 2(7x − 21) donnerait 14x − 42 : aucune des deux ne retombe sur 14x − 21."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le plus grand facteur',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={
              <span>
                Quel est le plus grand facteur qu’on puisse sortir de{' '}
                <MathText>{'$20x + 30$'}</MathText> ?
              </span>
            }
            expected={10}
            requires={['factoriser']}
            explain="10 divise 20 et 30 : 20x + 30 = 10(2x + 3). Un facteur plus petit — 2 ou 5 — marcherait aussi, mais laisserait encore quelque chose à sortir de la parenthèse."
            explainFor={(n) =>
              [2, 5].includes(n)
                ? `${n} divise bien les deux termes, mais ce n’est pas le PLUS GRAND : la parenthèse obtenue contiendrait encore un facteur commun. Cherche le plus grand diviseur commun de 20 et 30.`
                : "Cherche le plus grand nombre qui divise à la fois 20 et 30 : c’est 10."
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Remonter le facteur"
      moduleSubtitle="Le développement, lu à l’envers"
      estimatedTime="11 min"
      brief={{
        tag: 'Formalisation',
        title: 'Refaire le chemin en sens inverse',
        tone: 'indigo',
        body: (
          <p>
            Développer part du produit et arrive à la somme. Peut-on faire le trajet{' '}
            <strong>dans l’autre sens</strong> — repartir d’une somme et retrouver le rectangle
            d’origine ?
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
