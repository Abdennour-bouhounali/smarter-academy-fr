import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Simplifier from '../components/Simplifier';
import ErrorSpotter from '../components/ErrorSpotter';
import RationalBar from '../components/RationalBar';
import { gcd, isIrreducible, rat, simplify } from '../components/rationalUtils';

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

  // Étape 2 : deux chemins forcés, pour que l'unicité de la forme irréductible
  // soit CONSTATÉE au lieu d'être affirmée.
  const [vA, setVA] = useState(START);
  const [histA, setHistA] = useState([]);
  const [errA, setErrA] = useState('');
  const [vB, setVB] = useState(START);
  const [histB, setHistB] = useState([]);
  const [errB, setErrB] = useState('');

  // Étape 5 : la copie à corriger.
  const [tapped, setTapped] = useState([]);
  const [repair, setRepair] = useState(null);

  const done = isIrreducible(v);
  const routesDone = isIrreducible(vA) && isIrreducible(vB) && histA.length > 0 && histB.length > 0;
  const spotDone = tapped.includes('l2') && repair === 'both';

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
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Deux chemins, la même arrivée',
          subtitle: 'Simplifie 24/36 deux fois, avec deux jeux de diviseurs différents.',
          done: routesDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Chemin A — petits diviseurs
                  </p>
                  <Simplifier
                    start={START}
                    value={vA}
                    history={histA}
                    divisors={[2, 3]}
                    onDivide={(next, by) => { setVA(next); setHistA((h) => [...h, { ...next, by }]); setErrA(''); kit.react(true); }}
                    onRefused={(d) => { setErrA(`${d} ne divise pas à la fois ${Math.abs(vA.num)} et ${vA.den}.`); kit.react(false); }}
                    onReset={() => { setVA(START); setHistA([]); setErrA(''); }}
                    error={errA}
                    showGcdShortcut={false}
                  />
                </div>
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Chemin B — gros diviseurs
                  </p>
                  <Simplifier
                    start={START}
                    value={vB}
                    history={histB}
                    divisors={[4, 6, 12]}
                    onDivide={(next, by) => { setVB(next); setHistB((h) => [...h, { ...next, by }]); setErrB(''); kit.react(true); }}
                    onRefused={(d) => { setErrB(`${d} ne divise pas à la fois ${Math.abs(vB.num)} et ${vB.den}.`); kit.react(false); }}
                    onReset={() => { setVB(START); setHistB([]); setErrB(''); }}
                    error={errB}
                    showGcdShortcut={false}
                  />
                </div>
              </div>
              {!routesDone && (
                <Feedback tone="info">
                  Mène les <strong>deux</strong> chemins jusqu’au bout. Le chemin A n’a que ÷2 et ÷3 ;
                  le chemin B n’a que ÷4, ÷6 et ÷12. Rien ne dit qu’ils finiront au même endroit —
                  vérifie-le.
                </Feedback>
              )}
              {routesDone && (
                <Feedback tone="ok">
                  Chemin A en <strong className="font-mono">{histA.length}</strong> division
                  {histA.length > 1 ? 's' : ''}, chemin B en{' '}
                  <strong className="font-mono">{histB.length}</strong> — et la même arrivée,{' '}
                  <MathText>{`$${'\\frac{'}${vA.num}}{${vA.den}}$`}</MathText>. La forme irréductible
                  ne dépend donc <strong>pas</strong> du chemin : c’est une carte d’identité, pas un
                  résultat de manipulation.
                </Feedback>
              )}
              {routesDone && (
                <KnowledgeBrick
                  id="pgcd-irreductible"
                  variant="new"
                  lead={`Le chemin B est arrivé en ${histB.length} coup${histB.length > 1 ? 's' : ''} : il avait pris de plus gros diviseurs. Le plus gros de tous porte un nom — et fait tout d’un seul coup.`}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
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
          num: 4,
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
        {
          num: 5,
          title: 'La copie de Tom',
          subtitle: 'Une seule ligne est fausse. Trouve-la, puis répare-la.',
          done: spotDone,
          content: (kit) => (
            <div className="space-y-3">
              <ErrorSpotter
                title="Tom simplifie 36/48"
                lines={[
                  { id: 'l1', latex: '\\frac{36}{48} \\;=\\; \\frac{36 \\div 2}{48 \\div 2} \\;=\\; \\frac{18}{24}' },
                  { id: 'l2', latex: '\\frac{18}{24} \\;=\\; \\frac{18 \\div 2}{24} \\;=\\; \\frac{9}{24}' },
                  { id: 'l3', latex: '\\frac{9}{24} \\;=\\; \\frac{9 \\div 3}{24 \\div 3} \\;=\\; \\frac{3}{8}' },
                ]}
                faultyId="l2"
                tapped={tapped}
                onTap={(id, ok) => { setTapped((t) => (t.includes(id) ? t : [...t, id])); kit.react(ok); }}
                reasonFor={(id) => {
                  if (id === 'l1') return 'Ligne juste : 2 divise 36 et 48, et Tom a bien divisé les deux.';
                  if (id === 'l3') return 'Ligne juste : 3 divise 9 et 24, et les deux ont été divisés.';
                  if (id === 'l2') return 'C’est là. Tom n’a divisé QUE le haut : 18/24 vaut 0,75, mais 9/24 ne vaut que 0,375. Il a changé le nombre, pas son écriture.';
                  if (id === 'both') return 'Oui : ÷2 en haut ET en bas donne 9/12 — la longueur est conservée.';
                  if (id === 'top') return 'Non : diviser encore le haut seul enfonce l’erreur.';
                  return 'Non : diviser seulement le bas déplace le point dans l’autre sens.';
                }}
                repairs={[
                  { id: 'top', latex: '\\frac{9}{24}' },
                  { id: 'both', latex: '\\frac{9}{12}' },
                  { id: 'bot', latex: '\\frac{18}{12}' },
                ]}
                repairId="both"
                repairPicked={repair}
                onRepair={(id, ok) => { setRepair(id); kit.react(ok); }}
                repairPrompt="Que fallait-il écrire à la place de 9/24 ?"
              />
              {spotDone && (
                <Feedback tone="ok">
                  Réparée : <MathText>{'$\\frac{18}{24} = \\frac{9}{12} = \\frac{3}{4}$'}</MathText>.
                  Tom avait la bonne idée — diviser — mais l’a appliquée à un seul étage. C’est l’erreur
                  la plus fréquente du chapitre, et elle ne se voit qu’en vérifiant la valeur.
                </Feedback>
              )}
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
