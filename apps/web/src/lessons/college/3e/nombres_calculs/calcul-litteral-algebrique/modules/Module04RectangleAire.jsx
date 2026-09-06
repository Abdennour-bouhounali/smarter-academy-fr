import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AlgebraRect from '../components/AlgebraRect';
import { term, expandProduct, reduce, formatTerms } from '../components/litteralUtils';

/**
 * Module 4 — MANIPULATION SIGNATURE : « Le rectangle d'aire ».
 *
 * Activity: séparer les côtés d'un rectangle écrits avec x, puis compter
 *   chaque morceau d'aire dans la bande somme.
 * Mathematical objective: établir que l'aire d'un rectangle vaut le produit
 *   de ses côtés ET la somme des aires de ses morceaux — c'est exactement
 *   la distributivité, simple puis double.
 * Student action: « Séparer x + 2 », puis toucher chaque morceau ; en
 *   double distributivité, séparer les DEUX côtés et regrouper les deux
 *   bandes de x.
 * Controlled variable: quels côtés sont séparés, quels morceaux sont comptés.
 * Mathematical state: le produit `{ a, b }` en Term[]. Géométrie, étiquettes
 *   et bande somme dérivées par buildRectLayout / sumStrip.
 * Visual consequence: un morceau compté se colore et rejoint la somme ; un
 *   morceau oublié reste GRIS avec un « ? ».
 * Expected observation: 3(x + 2) fait deux morceaux, (x + 3)(x + 2) en fait
 *   quatre — jamais deux.
 * Misconception targeted: « 4(2x − 3) = 8x − 3 » (#4 : le second morceau
 *   reste gris) et « (x + 3)(x + 2) = x² + 6 » (#5 : deux bandes de x
 *   dorment encore).
 * Feedback: le compteur « n / N morceaux » quantifie l'écart ; le testeur
 *   confirme produit = somme sur plusieurs valeurs.
 * Formalization: « développer », la distributivité simple et la double
 *   distributivité vivent dans `knowledge.jsx` ; des <KnowledgeBrick> les
 *   posent après le comptage complet des étapes 1 et 3 — donc après le geste,
 *   et avant la question sans dessin de l'étape 4
 *   (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: après 3 tentatives, « Je ne trouve pas — montre-moi » compte
 *   tout et signale la révélation ; un indice clignotant après le premier
 *   morceau compté.
 * Transfer: étape 4, un produit jamais dessiné, à développer de tête.
 */
const P1 = { a: [term(3, 0)], b: [term(1, 1), term(2, 0)] };            // 3(x + 2)
const P2 = { a: [term(4, 0)], b: [term(2, 1), term(-3, 0)] };           // 4(2x − 3)
const P3 = { a: [term(1, 1), term(3, 0)], b: [term(1, 1), term(2, 0)] }; // (x + 3)(x + 2)

const useRect = () => {
  const [splitA, setSplitA] = useState(false);
  const [splitB, setSplitB] = useState(false);
  const [counted, setCounted] = useState([]);
  const [merged, setMerged] = useState(false);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  return {
    splitA, splitB, counted, merged, tries, revealed,
    onSplit: (side) => { if (side === 'a') setSplitA(true); else setSplitB(true); },
    onCount: (id) => setCounted((c) => (c.includes(id) ? c : [...c, id])),
    onMerge: () => setMerged(true),
    bump: () => setTries((t) => t + 1),
    reveal: () => { setSplitA(true); setSplitB(true); setRevealed(true); },
    setCounted, setMerged,
  };
};

function EscapeHatch({ onClick, label = 'Je ne trouve pas — montre-moi' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {label}
    </button>
  );
}

export default function Module04RectangleAire() {
  const r1 = useRect();
  const r2 = useRect();
  const r3 = useRect();
  const [transferDone, setTransferDone] = useState(false);

  const done1 = r1.counted.length === 2;
  const done2 = r2.counted.length === 2;
  const done3 = r3.counted.length === 4 && r3.merged;

  const revealAll = (r, pieceIds) => {
    r.reveal();
    r.setCounted(pieceIds);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le rectangle d'aire"
      moduleSubtitle="Découpe le rectangle, compte chaque morceau — c'est ça, développer."
      estimatedTime="11 min"
      brief={{
        tag: '🟩 Mission 04',
        title: 'Le parterre de Maya a des côtés qui s’écrivent avec x.',
        body: (
          <p>
            Un rectangle a une aire : le produit de ses côtés. Mais si on le découpe, cette même aire
            devient une somme de morceaux. Tu vas faire les deux, sur la même image.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Un parterre de 3 sur x + 2',
          subtitle: 'Sépare le côté, puis compte chaque morceau.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Le parterre mesure <strong className="font-mono">3</strong> de haut et{' '}
                <strong className="font-mono">x + 2</strong> de large. Sépare le côté{' '}
                <MathText>{'$x + 2$'}</MathText> en ses deux termes, puis touche chaque morceau pour
                compter son aire.
              </p>
              <AlgebraRect
                product={P1}
                splitA={r1.splitA}
                splitB={r1.splitB}
                onSplit={r1.onSplit}
                counted={r1.revealed ? ['r0c0', 'r0c1'] : r1.counted}
                onCount={(id) => {
                  r1.onCount(id);
                  if (r1.counted.length + 1 === 2) kit.react(true);
                  else r1.bump();
                }}
                hint={r1.splitB && r1.counted.length === 1}
              />
              {!done1 && !r1.splitB && (
                <Feedback tone="info">
                  Le côté <MathText>{'$x + 2$'}</MathText> est fait de <strong>deux</strong> longueurs
                  mises bout à bout. Sépare-le : le rectangle se coupera en deux morceaux.
                </Feedback>
              )}
              {!done1 && r1.splitB && r1.counted.length < 2 && (
                <Feedback tone="info">
                  {r1.counted.length === 0
                    ? 'Deux morceaux attendent, tous les deux gris. Touche le premier.'
                    : 'Il reste 1 morceau gris — la somme est donc incomplète. Touche-le.'}
                </Feedback>
              )}
              {!done1 && r1.tries >= 3 && (
                <EscapeHatch onClick={() => { revealAll(r1, ['r0c0', 'r0c1']); kit.react(false); }} />
              )}
              {done1 && (
                <Feedback tone="ok">
                  Deux morceaux, deux produits :{' '}
                  <MathText>{'$3 \\times x = 3x$'}</MathText> et{' '}
                  <MathText>{'$3 \\times 2 = 6$'}</MathText>. L’aire s’écrit donc{' '}
                  <MathText>{'$3(x + 2) = 3x + 6$'}</MathText>.
                  {r1.revealed && ' (Les morceaux t’ont été montrés — refais le geste sur l’étape suivante.)'}
                </Feedback>
              )}
              {done1 && (
                <>
                  <KnowledgeBrick
                    id="developper"
                    variant="new"
                    lead="Une seule aire, deux façons de l’écrire : le produit des côtés, ou la somme des deux morceaux que tu viens de compter."
                  />
                  <KnowledgeBrick
                    id="distributivite-simple"
                    variant="new"
                    compact
                    lead="Le 3 est monté sur chacun des deux morceaux, pas seulement sur le premier. Cette règle, tu la connais déjà en nombres : 7 × 103 = 7 × 100 + 7 × 3."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Et si un terme est négatif ?',
          subtitle: 'Le morceau existe quand même : il se retranche.',
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Cette fois : <MathText>{'$4(2x - 3)$'}</MathText>. Le second morceau est{' '}
                <strong>hachuré</strong> — c’est une aire qu’on <em>retire</em>, pas une aire négative
                à dessiner. Compte les deux.
              </p>
              <AlgebraRect
                product={P2}
                splitA={r2.splitA}
                splitB={r2.splitB}
                onSplit={r2.onSplit}
                counted={r2.revealed ? ['r0c0', 'r0c1'] : r2.counted}
                onCount={(id) => {
                  r2.onCount(id);
                  if (r2.counted.length + 1 === 2) kit.react(true);
                  else r2.bump();
                }}
                hint={r2.splitB && r2.counted.length === 1}
              />
              {!done2 && r2.counted.length === 1 && (
                <Feedback tone="info">
                  Un seul morceau compté : la somme affiche{' '}
                  <strong className="font-mono">
                    {formatTerms([expandProduct(P2)[r2.counted[0] === 'r0c0' ? 0 : 1]])}
                  </strong>{' '}
                  et il reste un morceau gris. C’est exactement l’erreur{' '}
                  <MathText>{'$4(2x - 3) = 8x - 3$'}</MathText> : le 4 n’a touché qu’un terme.
                </Feedback>
              )}
              {!done2 && r2.counted.length === 0 && r2.splitB && (
                <Feedback tone="info">
                  Deux morceaux gris. Le hachuré compte lui aussi — il porte le signe −.
                </Feedback>
              )}
              {!done2 && r2.tries >= 3 && (
                <EscapeHatch onClick={() => { revealAll(r2, ['r0c0', 'r0c1']); kit.react(false); }} />
              )}
              {done2 && (
                <Feedback tone="ok">
                  <MathText>{'$4 \\times 2x = 8x$'}</MathText> et{' '}
                  <MathText>{'$4 \\times (-3) = -12$'}</MathText> : donc{' '}
                  <MathText>{'$4(2x - 3) = 8x - 12$'}</MathText>, et non{' '}
                  <MathText>{'$8x - 3$'}</MathText>. Le facteur touche{' '}
                  <strong>chaque</strong> terme, signe compris.
                </Feedback>
              )}
              {done2 && (
                <ValueTable
                  columns={[
                    { id: 'prod', label: <MathText>{'$4(2x-3)$'}</MathText>, fn: (x) => 4 * (2 * x - 3) },
                    { id: 'juste', label: <MathText>{'$8x-12$'}</MathText>, fn: (x) => 8 * x - 12 },
                    { id: 'piege', label: <MathText>{'$8x-3$'}</MathText>, fn: (x) => 8 * x - 3 },
                  ]}
                  xs={[0, 1, 2, 5]}
                  tested={new Set([0, 2])}
                  onTest={() => {}}
                  disabled
                  caption="Le piège 8x − 3 se trahit dès la première valeur."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Deux côtés à séparer',
          subtitle: '(x + 3)(x + 2) : quatre morceaux, pas deux.',
          done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Maya agrandit le parterre : les deux côtés s’écrivent maintenant avec x. Sépare-les tous
                les deux, compte les quatre morceaux, puis regroupe ceux qui ont la même forme.
              </p>
              <AlgebraRect
                product={P3}
                splitA={r3.splitA}
                splitB={r3.splitB}
                onSplit={r3.onSplit}
                counted={r3.revealed ? ['r0c0', 'r0c1', 'r1c0', 'r1c1'] : r3.counted}
                onCount={(id) => {
                  r3.onCount(id);
                  if (r3.counted.length + 1 === 4) kit.react(true);
                  else r3.bump();
                }}
                merged={r3.merged}
                onMerge={() => { r3.onMerge(); kit.react(true); }}
                hint={r3.splitA && r3.splitB && r3.counted.length > 0 && r3.counted.length < 4}
              />
              {!done3 && (!r3.splitA || !r3.splitB) && (
                <Feedback tone="info">
                  Tant qu’un côté n’est pas séparé, on ne voit pas où couper. Sépare{' '}
                  <MathText>{'$x + 3$'}</MathText> ET <MathText>{'$x + 2$'}</MathText>.
                </Feedback>
              )}
              {!done3 && r3.splitA && r3.splitB && r3.counted.length > 0 && r3.counted.length < 4 && (
                <Feedback tone="info">
                  {4 - r3.counted.length} morceau{4 - r3.counted.length > 1 ? 'x' : ''} encore gris.
                  {r3.counted.length === 2 && r3.counted.includes('r0c0') && r3.counted.includes('r1c1')
                    ? ' Tu as compté x² et 6 : c’est exactement l’erreur « (x + 3)(x + 2) = x² + 6 ». Les deux bandes de x dorment encore.'
                    : ''}
                </Feedback>
              )}
              {!done3 && r3.counted.length === 4 && !r3.merged && (
                <Feedback tone="info">
                  Quatre morceaux comptés. Deux d’entre eux ont la <strong>même forme</strong> (des
                  bandes de x) : regroupe-les pour finir l’écriture.
                </Feedback>
              )}
              {!done3 && r3.tries >= 3 && r3.counted.length < 4 && (
                <EscapeHatch onClick={() => { revealAll(r3, ['r0c0', 'r0c1', 'r1c0', 'r1c1']); kit.react(false); }} />
              )}
              {done3 && (
                <Feedback tone="ok">
                  Quatre morceaux :{' '}
                  <MathText>{'$x^{2}$'}</MathText>, <MathText>{'$2x$'}</MathText>,{' '}
                  <MathText>{'$3x$'}</MathText>, <MathText>{'$6$'}</MathText>. Les deux bandes de x se
                  regroupent en <MathText>{'$5x$'}</MathText>, donc{' '}
                  <MathText>{`$(x + 3)(x + 2) = ${formatTerms(reduce(expandProduct(P3)), { latex: true })}$`}</MathText>.
                </Feedback>
              )}
              {done3 && (
                <KnowledgeBrick
                  id="double-distributivite"
                  variant="new"
                  lead="Quatre cases comptées, deux bandes de x regroupées : le rectangle vient de te donner la règle des deux côtés."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Sans dessin, maintenant',
          done: transferDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  Développe <MathText>{'$(x + 5)(x + 1)$'}</MathText> — imagine les quatre cases.
                </>
              }
              options={[
                '$x^{2} + 6x + 5$',
                '$x^{2} + 5$',
                '$x^{2} + 5x + 5$',
                '$2x + 6$',
              ]}
              renderOption={(o) => <MathText>{o}</MathText>}
              optionLabel={(i) => ['x² + 6x + 5', 'x² + 5', 'x² + 5x + 5', '2x + 6'][i]}
              correctionLabel="x² + 6x + 5"
              cols={1}
              correct={0}
              explain={
                <>
                  Quatre cases :{' '}
                  <MathText>{'$x \\times x = x^{2}$'}</MathText>,{' '}
                  <MathText>{'$x \\times 1 = x$'}</MathText>,{' '}
                  <MathText>{'$5 \\times x = 5x$'}</MathText>,{' '}
                  <MathText>{'$5 \\times 1 = 5$'}</MathText>. Les deux bandes de x se regroupent :{' '}
                  <MathText>{'$x + 5x = 6x$'}</MathText>.
                </>
              }
              explainWrong={
                <>
                  <MathText>{'$x^{2} + 5$'}</MathText> ne compte que deux cases sur quatre — les deux
                  bandes de x restent grises. Il faut <strong>quatre</strong> produits :{' '}
                  <MathText>{'$x^{2} + x + 5x + 5 = x^{2} + 6x + 5$'}</MathText>.
                </>
              }
              requires={['double-distributivite', 'developper', 'termes-semblables']}
              solved={transferDone}
              onAnswered={() => setTransferDone(true)}
            />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Découper un rectangle quelconque, tu sais faire. Au module
          suivant, on découpe un <em>carré</em> — et deux morceaux qu’on oublie presque toujours
          apparaissent.
        </KnowledgeSnapshot>
      )}
    />
  );
}
