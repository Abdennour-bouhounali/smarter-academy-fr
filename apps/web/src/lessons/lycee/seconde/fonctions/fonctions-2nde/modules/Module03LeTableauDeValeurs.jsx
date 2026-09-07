import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { boxVolume, H_TABLE, parseDec, formatDec } from '../components/fonctionsUtils';

/**
 * Module 3 — DÉCOUVERTE : l'expression et le tableau de valeurs.
 *
 * Étape 1 : trois formules candidates pour la boîte, testées sur plusieurs x
 *   contre la « machine » du module 1 (ValueTable partagé) — une seule
 *   coïncide partout : x(20 − 2x)². Expected observation : une formule se
 *   vérifie sur PLUSIEURS valeurs ; une seule coïncidence ne prouve rien.
 * Étape 2 : calculer une image à partir d'une expression sans situation.
 * Étape 3 : lire un tableau — et ce qu'un tableau ne dit PAS.
 * Étape 4 : un antécédent par le calcul = résoudre f(x) = k.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Chaque méthode est posée par une brique APRÈS le geste qui la motive et
 *   AVANT la question qui l'exige :
 *     étape 1  trois formules départagées  → (la question DÉCOUVRE, pas de brique avant)
 *     étape 2  brique `methode-calculer-image` → essai g(2), puis g(−1)
 *     étape 3  brique `tableau-valeurs`        → les quatre lignes de lecture
 *     étape 4  brique `regle-antecedent-equation` → essai « antécédent de 11 »
 *   Résoudre 2x + 3 = 11 est un acquis de 4e (`equation-premier-degre`,
 *   priorKnowledge) : ce que la brique établit, c'est le LIEN entre chercher
 *   un antécédent et résoudre une équation.
 */
const COLUMNS = [
  { id: 'machine', label: 'V (machine du module 1)', fn: (x) => boxVolume(x) },
  { id: 'c1', label: <MathText>{'$x(20-2x)^2$'}</MathText>, fn: (x) => x * (20 - 2 * x) ** 2 },
  { id: 'c2', label: <MathText>{'$x(20-x)^2$'}</MathText>, fn: (x) => x * (20 - x) ** 2 },
  { id: 'c3', label: <MathText>{'$4x(10-x)$'}</MathText>, fn: (x) => 4 * x * (10 - x) },
];

export default function Module03LeTableauDeValeurs() {
  const [tested, setTested] = useState(() => new Set());
  const [q1, setQ1] = useState(false);
  const [qa, setQa] = useState(false);
  const [qb, setQb] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const enough = tested.size >= 3;

  const steps = [
    {
      num: 1,
      title: 'Quelle formule fabrique les volumes ?',
      subtitle: 'Trois formules candidates. Teste au moins trois valeurs de x et compare à la machine.',
      done: q1,
      content: (kit) => (
        <div className="space-y-3">
          <ValueTable columns={COLUMNS} xs={[1, 2, 3, 4, 5, 6]} tested={tested} compare={false} disabled={q1}
            onTest={(x) => { const s = new Set(tested); s.add(x); setTested(s); if (s.size === 3) kit.react(true); }}
            caption="Une ligne par valeur testée : la bonne formule coïncide avec la machine sur TOUTES les lignes." />
          {enough ? (
            <TapQuestion
              prompt="Quelle formule donne le volume de la boîte pour toute découpe x ?"
              options={['V(x) = x(20 − 2x)²', 'V(x) = x(20 − x)²', 'V(x) = 4x(10 − x)']}
              correct={0} cols={1}
              requires={['fonction-dependance', 'calcul-litteral', 'carre-nombre']}
              explain={<span>Le fond est un carré de côté 20 − 2x (on retire x de chaque côté), la hauteur est x : V(x) = x × (20 − 2x)². La colonne <MathText>{'$x(20-2x)^2$'}</MathText> coïncide avec la machine sur chaque ligne testée.</span>}
              explainWrong="Regarde les lignes : une seule colonne reproduit la machine partout. x(20 − x)² retire x d’un seul côté ; 4x(10 − x) n’est pas un volume (deux facteurs de longueur seulement). V(x) = x(20 − 2x)²."
              solved={q1} onAnswered={() => setQ1(true)} />
          ) : (
            <Feedback tone="info">{tested.size === 0 ? 'Touche une valeur de x : chaque formule calcule sa colonne.' : `${tested.size} valeur${tested.size > 1 ? 's' : ''} testée${tested.size > 1 ? 's' : ''}. Encore ${3 - tested.size} : une coïncidence sur une seule ligne ne prouve rien.`}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Calculer une image',
      subtitle: 'Sans boîte cette fois : g(x) = 3x² − 5. Une expression suffit à définir une fonction.',
      done: qa && qb,
      content: (
        <div className="space-y-4">
          <KnowledgeBrick
            id="methode-calculer-image"
            variant="new"
            lead={<>La formule de la boîte est trouvée. La même façon de faire vaut pour n’importe quelle expression — en voici une, <MathText>{'$g(x) = 3x^2 - 5$'}</MathText>, sans aucune boîte derrière.</>}
          />
          <NumericQuestion prompt={<span>Calcule <MathText>{'$g(2)$'}</MathText>.</span>} expected={7} parse={parseDec} display={formatDec(7)}
            requires={['methode-calculer-image', 'vocab-notation-fx', 'carre-nombre', 'calcul-litteral']}
            explain={<span>On remplace x par 2 : 3 × 2² − 5 = 3 × 4 − 5 = <strong>7</strong>. L’image de 2 par g est 7.</span>}
            explainFor={(n) => (n === 31 ? 'Tu as élevé 3 × 2 au carré : (6)² = 36. Le carré porte sur x seul : 3 × 2² = 3 × 4 = 12, puis 12 − 5 = 7.'
              : n === 1 ? 'Tu as oublié le carré : 3 × 2² = 12, pas 6. Donc 12 − 5 = 7.'
              : 'Remplace x par 2 : 3 × 2² − 5 = 12 − 5 = 7.')}
            solved={qa} onAnswered={() => setQa(true)} />
          {qa && (
            <NumericQuestion prompt={<span>Calcule <MathText>{'$g(-1)$'}</MathText>.</span>} expected={-2} parse={parseDec} display={formatDec(-2)}
              requires={['methode-calculer-image', 'vocab-notation-fx', 'carre-nombre', 'calcul-litteral']}
              explain={<span>(−1)² = 1, puis 3 × 1 − 5 = <strong>−2</strong>. Un x négatif se remplace entre parenthèses.</span>}
              explainFor={(n) => (n === -8 ? 'Tu as calculé 3 × (−1) − 5. Le carré vient d’abord : (−1)² = 1, puis 3 × 1 − 5 = −2.'
                : n === 2 ? '3 × 1 − 5 = −2, pas 2 : le signe final vient de 3 − 5.'
                : '(−1)² = 1 (un carré n’est jamais négatif), 3 × 1 = 3, 3 − 5 = −2.')}
              solved={qb} onAnswered={() => setQb(true)} />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Lire un tableau — et ses limites',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="tableau-valeurs"
            variant="new"
            lead={<>Tu viens de t’en servir pour départager trois formules. Un tableau de valeurs est aussi, à lui seul, une façon de donner une fonction — avec ses forces et ses silences.</>}
          />
        <BatchChoiceQuestion
          intro={(
            <div className="space-y-2">
              <p className="text-sm text-slate-700">Une fonction h n’est connue que par ce tableau :</p>
              <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
                <table className="w-full text-sm font-mono tabular-nums">
                  <thead><tr className="bg-slate-50 text-slate-600"><th scope="row" className="px-3 py-2 text-left font-bold">x</th>{H_TABLE.xs.map((x) => <td key={x} className="px-3 py-2 text-center">{formatDec(x)}</td>)}</tr></thead>
                  <tbody><tr className="border-t border-slate-100"><th scope="row" className="px-3 py-2 text-left font-bold">h(x)</th>{H_TABLE.ys.map((y, i) => <td key={i} className="px-3 py-2 text-center font-bold text-slate-800">{formatDec(y)}</td>)}</tr></tbody>
                </table>
              </div>
            </div>
          )}
          rows={[
            { id: 'r1', label: 'h(2) = ?', options: ['5', '2', '10'], correct: 0, correction: 'colonne x = 2' },
            { id: 'r2', label: 'Antécédent(s) de 2 ?', options: ['−1 et 1', '1 seulement', '5'], correct: 0, correction: 'deux colonnes portent 2' },
            { id: 'r3', label: 'h(1,5) = ?', options: ['le tableau ne le dit pas', '3,5', '2,5'], correct: 0, correction: '1,5 n’est pas une colonne' },
            { id: 'r4', label: 'Antécédent de 7 ?', options: ['le tableau n’en montre aucun', '2,5', '7'], correct: 0, correction: 'aucune colonne ne porte 7' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Un tableau donne des images <strong>exactes</strong>, mais seulement pour les x qu’il contient : entre deux colonnes, il ne dit rien. Il peut montrer deux antécédents (−1 et 1 pour 2) — ou n’en montrer aucun sans que cela prouve qu’il n’en existe pas.
            </Feedback>
          )}
          requires={['tableau-valeurs', 'vocab-notation-fx', 'image-antecedent', 'ensemble-definition']}
          solved={q3} onAnswered={() => setQ3(true)}
        />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Un antécédent par le calcul',
      done: q4,
      content: (
        <div className="space-y-3">
        <KnowledgeBrick
          id="regle-antecedent-equation"
          variant="new"
          lead={<>Sur la courbe, tu lisais les antécédents à l’œil (« x ≈ 1,3 »). Avec une expression, on peut les obtenir exactement — et l’outil, tu le connais depuis la 4e.</>}
        />
        <NumericQuestion prompt={<span>f(x) = 2x + 3. Quel est l’antécédent de 11 par f ?</span>} expected={4} parse={parseDec} display={formatDec(4)}
          requires={['regle-antecedent-equation', 'image-antecedent', 'vocab-notation-fx', 'equation-premier-degre']}
          explain={<span>Chercher l’antécédent de 11, c’est résoudre f(x) = 11 : 2x + 3 = 11 ⟺ 2x = 8 ⟺ x = <strong>4</strong>. Vérification : f(4) = 11.</span>}
          explainFor={(n) => (n === 25 ? 'Tu as calculé l’IMAGE de 11 : f(11) = 25. L’antécédent va dans l’autre sens : quel x donne 11 ? 2x + 3 = 11, x = 4.'
            : n === 8 ? '11 − 3 = 8, c’est 2x. Il reste à diviser par 2 : x = 4.'
            : n === 5.5 ? 'Tu as divisé 11 par 2 avant de retirer 3. Dans l’ordre : 2x + 3 = 11 → 2x = 8 → x = 4.'
            : 'Résous 2x + 3 = 11 : 2x = 8, x = 4.')}
          solved={q4} onAnswered={() => setQ4(true)} />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Le tableau de valeurs"
      moduleSubtitle="La formule de la boîte apparaît — et une expression suffit à définir une fonction"
      estimatedTime="9 min"
      brief={{ tag: 'Découverte', title: 'La règle qui fabrique chaque volume', tone: 'sky', body: <p>La machine du module 1 calculait chaque volume avec une règle cachée. Trois formules se proposent : un tableau de valeurs va les départager.</p> }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          Expression, tableau, courbe : trois façons de connaître la même fonction. Module suivant : du tableau à la courbe, point par point — de tes mains.
        </KnowledgeSnapshot>
      }
    />
  );
}
