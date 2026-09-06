import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Simplifier from '../components/Simplifier';
import RationalBar from '../components/RationalBar';
import { gcd, isIrreducible, rat } from '../components/rationalUtils';

/**
 * Module 2 — DÉCOUVERTE : « Rendre irréductible ».
 *
 * Activity: diviser en même temps numérateur et dénominateur de 24/36 par un
 *   diviseur commun, jusqu'à ce qu'il n'y en ait plus.
 * Mathematical objective: irréductible ⇔ PGCD(num ; den) = 1 ; à chaque
 *   étape la VALEUR ne change pas, seule l'écriture se simplifie.
 * Student action: taper une puce diviseur ; ou le raccourci « ÷ PGCD ».
 * Controlled variable: le diviseur choisi.
 * Mathematical state: le rationnel courant + l'historique des divisions.
 * Visual consequence: la fraction rétrécit, la barre montre ses coupes
 *   disparaître par regroupement — la longueur coloriée ne bouge pas.
 * Expected observation: ÷2 ÷2 ÷3 et ÷12 donnent le MÊME 2/3 — l'irréductible
 *   est unique, quel que soit le chemin.
 * Misconception targeted: « je divise le haut et j'oublie le bas », « on peut
 *   diviser par n'importe quel nombre », « simplifier change la valeur ».
 * Feedback: une puce non-diviseur explique pourquoi (« 5 ne divise pas 24 »)
 *   et ne réinitialise rien.
 * Formalization: « irréductible » et le raccourci du PGCD vivent dans
 *   `knowledge.jsx` ; deux <KnowledgeBrick> les posent dès que la fraction est
 *   arrivée au bout — donc APRÈS le geste et AVANT les questions des étapes 2
 *   et 3 qui les exigent. L'étape 3 ne recopie plus la définition
 *   (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: après 3 refus, le bouton PGCD est mis en avant.
 * Transfer: étape 4, reconnaître une fraction déjà irréductible (15/22).
 */
const START = rat(24, 36);

export default function Module02RendreIrreductible() {
  const [v, setV] = useState(START);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [refusals, setRefusals] = useState(0);
  const [ruleDone, setRuleDone] = useState(false);
  const [pickDone, setPickDone] = useState(false);

  const done = isIrreducible(v);

  const divide = (next, by, kitReact) => {
    setV(next);
    setHistory((h) => [...h, { ...next, by }]);
    setError('');
    kitReact?.(true);
  };

  const refuse = (d, kitReact) => {
    const bad = v.num % d !== 0 ? v.num : v.den;
    setError(
      `${d} n’est pas un diviseur commun : ${d} ne divise pas ${Math.abs(bad)}. Il faut un nombre qui divise le HAUT et le BAS.`,
    );
    setRefusals((n) => n + 1);
    kitReact?.(false);
  };

  const reset = () => {
    setV(START);
    setHistory([]);
    setError('');
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Rendre irréductible"
      moduleSubtitle="Regroupe les parts jusqu’à ce qu’aucun diviseur commun ne reste."
      estimatedTime="9 min"
      brief={{
        tag: '🔻 Mission 02',
        title: 'La plus petite écriture d’un même point.',
        body: (
          <p>
            Au module précédent, tu coupais les parts plus fin. Ici tu fais l’inverse : tu les{' '}
            <strong>regroupes</strong>. Le point ne bougera pas non plus — mais les nombres, eux, vont
            devenir aussi petits que possible.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Simplifie 24/36 jusqu’au bout',
          subtitle: 'Chaque division doit porter sur le haut ET sur le bas.',
          done,
          content: (kit) => (
            <div className="space-y-3">
              <Simplifier
                start={START}
                value={v}
                history={history}
                onDivide={(next, by) => divide(next, by, kit.react)}
                onRefused={(d) => refuse(d, kit.react)}
                onReset={reset}
                error={error}
                showGcdShortcut={refusals >= 3 || history.length >= 1}
              />
              <RationalBar value={v} min={0} max={1} showDecimal={false} showLine />
              {!done && (
                <Feedback tone="info">
                  <MathText>{`$\\frac{${v.num}}{${v.den}}$`}</MathText> peut encore se regrouper :
                  il existe encore un nombre — <strong className="font-mono">{gcd(v.num, v.den)}</strong>{' '}
                  au mieux — qui divise à la fois {Math.abs(v.num)} et {v.den}. Et la barre en dessous
                  ne change pas de longueur : seuls les traits de coupe disparaissent.
                </Feedback>
              )}
              {done && (
                <>
                  <Feedback tone="ok">
                    Plus aucun nombre ne divise à la fois{' '}
                    <MathText>{`$${v.num}$`}</MathText> et <MathText>{`$${v.den}$`}</MathText> : c’est
                    fini. Tu y es arrivé en{' '}
                    <strong className="font-mono">{history.length}</strong> division
                    {history.length > 1 ? 's' : ''} — et le point n’a jamais bougé.
                  </Feedback>
                  <KnowledgeBrick
                    id="irreductible"
                    variant="new"
                    lead="Cette fraction-là, on ne peut plus la rapetisser. Elle porte un nom."
                  />
                  <KnowledgeBrick
                    id="pgcd-irreductible"
                    variant="new"
                    compact
                    lead="Et le nombre qui aurait tout fait d’un seul coup en porte un autre."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Plusieurs chemins, une seule arrivée',
          done: ruleDone,
          content: (
            <TapQuestion
              prompt="On peut faire ÷2, ÷2, ÷3 — ou bien ÷12 d’un seul coup. Que peut-on en conclure ?"
              options={[
                'Les deux chemins donnent la même fraction irréductible',
                'Le chemin ÷12 donne une fraction plus petite',
                'Le chemin ÷2 ÷2 ÷3 est le seul correct',
              ]}
              cols={1}
              correct={0}
              explain={
                <>
                  ÷2 ÷2 ÷3 revient à diviser par 2 × 2 × 3 = 12, qui est justement le PGCD. Les deux
                  chemins arrivent à <MathText>{`$${'\\frac{2}{3}'}$`}</MathText>. La forme
                  irréductible d’un rationnel est <strong>unique</strong> : c’est sa carte d’identité.
                </>
              }
              explainWrong={
                <>
                  Une simplification ne change jamais la valeur — donc aucun chemin ne peut « rendre
                  plus petit ». ÷2 ÷2 ÷3 = ÷12 : les deux mènent à{' '}
                  <MathText>{'$\\frac{2}{3}$'}</MathText>. Diviser directement par le PGCD est
                  simplement plus rapide.
                </>
              }
              requires={['irreductible', 'pgcd-irreductible']}
              solved={ruleDone}
              onAnswered={() => setRuleDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Reconnaître une fraction déjà irréductible',
          done: pickDone,
          content: (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Cette fois, personne ne simplifie à ta place : c’est à toi de repérer laquelle des
                trois n’a plus rien à donner.
              </p>
              <TapQuestion
                prompt="Laquelle de ces trois fractions est déjà irréductible ?"
                options={['$\\frac{14}{21}$', '$\\frac{15}{22}$', '$\\frac{9}{27}$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['14/21', '15/22', '9/27'][i]}
                correctionLabel="15/22"
                cols={3}
                correct={1}
                explain={
                  <>
                    15 se divise par 3 et 5 ; 22 par 2 et 11 — aucun diviseur en commun, donc PGCD = 1.
                    En revanche <MathText>{'$\\frac{14}{21}$'}</MathText> se simplifie par 7 (→ 2/3), et{' '}
                    <MathText>{'$\\frac{9}{27}$'}</MathText> par 9 (→ 1/3).
                  </>
                }
                explainWrong={
                  <>
                    Cherche un diviseur commun. 14 et 21 sont tous deux dans la table de 7 : ÷7 donne{' '}
                    <MathText>{'$\\frac{2}{3}$'}</MathText>. 9 et 27 sont dans la table de 9 : ÷9 donne{' '}
                    <MathText>{'$\\frac{1}{3}$'}</MathText>. Pour 15 et 22, on ne trouve rien — c’est
                    donc elle l’irréductible.
                  </>
                }
                requires={['irreductible', 'pgcd-irreductible']}
                solved={pickDone}
                onAnswered={() => setPickDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Simplifier ne rapetisse pas le nombre : ça rapetisse son
          écriture. Au module suivant, on se sert de la découpe pour trancher entre deux rationnels —
          lequel est le plus grand ?
        </KnowledgeSnapshot>
      )}
    />
  );
}
