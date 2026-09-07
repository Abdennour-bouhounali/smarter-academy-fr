import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import ValueTable from '../../../../../common/components/ValueTable';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec, formatDec } from '../components/fonctionsUtils';

/**
 * Module 5 — MANIPULATION : quatre registres, une fonction.
 *
 * Étape 1 : reconnaître une expression dans une courbe (trois courbes A/B/C).
 * Étape 2 : situation → expression → antécédent (le périmètre P(x) = 2x + 10).
 * Étape 3 : quel registre répond le plus vite à quelle question.
 * Étape 4 : deux expressions, une seule fonction (ValueTable partagé).
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Les quatre registres ont tous été VÉCUS (situation au module 1, tableau au
 *   3, courbe au 4, expression au 3) : la brique `quatre-registres` les
 *   rassemble en ouverture, avant la première question qui les fait jouer
 *   l'un contre l'autre. Puis :
 *     étape 1  reconnaître une courbe (les quatre registres posés)
 *     étape 2  brique `methode-modeliser` → le périmètre du rectangle
 *     étape 3  brique `methode-choisir-registre` → le tri des questions
 *     étape 4  deux écritures, une fonction — la distributivité est un acquis
 *              de 4e (`priorKnowledge`), pas une nouveauté de cette étape.
 *   Périmètre et aire sont des grandeurs de 6e, déclarées en `priorKnowledge`
 *   et diagnostiquées au module 0 : la leçon ne les enseigne pas, elle les
 *   MODÉLISE.
 */
const MINI = { range: { xMin: -3, xMax: 3, yMin: -4, yMax: 5 }, unit: 22 };
const CURVES = [
  { id: 'A', fn: (x) => x * x - 2, label: 'A', tone: 'indigo' },
  { id: 'B', fn: (x) => -x + 1, label: 'B', tone: 'rose' },
  { id: 'C', fn: (x) => 2 * x, label: 'C', tone: 'emerald' },
];

export default function Module05QuatreRegistres() {
  const [q1, setQ1] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q3, setQ3] = useState(false);
  const [tested, setTested] = useState(() => new Set());
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Quelle courbe pour quelle expression ?',
      done: q1,
      content: (
        <div className="space-y-3">
        <KnowledgeBrick
          id="quatre-registres"
          variant="new"
          lead={<>Une situation (la boîte), un tableau, une courbe, une expression : tu les as tous manipulés. Voici leur nom commun — et ce que chacun sait faire.</>}
        />
        <BatchChoiceQuestion
          intro={(
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {CURVES.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-1 text-center">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">Courbe {c.id}</div>
                  <CoordPlane range={MINI.range} unit={MINI.unit} functions={[{ id: c.id, fn: c.fn, tone: c.tone, samples: 60 }]} caption={false} ariaLabel={`Courbe ${c.id}`} />
                </div>
              ))}
            </div>
          )}
          rows={[
            { id: 'r1', label: 'f(x) = x² − 2', options: ['A', 'B', 'C'], correct: 0, correction: 'une parabole, minimum −2 en x = 0' },
            { id: 'r2', label: 'g(x) = −x + 1', options: ['A', 'B', 'C'], correct: 1, correction: 'une droite qui descend, passe par (0 ; 1)' },
            { id: 'r3', label: 'h(x) = 2x', options: ['A', 'B', 'C'], correct: 2, correction: 'une droite par l’origine' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Trois sur trois.' : `${nCorrect} sur ${total}.`} Pour reconnaître, on calcule deux ou trois images (f(0), f(1), f(−1)) et on cherche les points sur la courbe : x² − 2 donne (0 ; −2), −x + 1 passe par (0 ; 1), 2x par l’origine.
            </Feedback>
          )}
          requires={['quatre-registres', 'courbe-representative', 'methode-calculer-image', 'methode-tester-point']}
          solved={q1} onAnswered={() => setQ1(true)}
        />
        </div>
      ),
    },
    {
      num: 2,
      title: 'De la situation à l’expression',
      subtitle: 'Un rectangle a pour largeur x cm et pour longueur 5 cm.',
      done: q2a && q2b,
      content: (
        <div className="space-y-4">
          <KnowledgeBrick
            id="methode-modeliser"
            variant="new"
            lead={<>Au module 1, tu as fait le chemin sans le nommer : une feuille, une découpe choisie, un volume qui en dépend. Ce chemin a trois temps, et il vaut pour n’importe quelle situation.</>}
          />
          <TapQuestion
            prompt="Son périmètre P dépend de x. Quelle expression ?"
            requires={['methode-modeliser', 'vocab-variable', 'vocab-notation-fx', 'perimetre', 'calcul-litteral']}
            options={['P(x) = 2x + 10', 'P(x) = x + 5', 'P(x) = 5x', 'P(x) = 2x + 5']}
            correct={0} cols={2}
            explain="Le périmètre ajoute deux largeurs et deux longueurs : x + x + 5 + 5 = 2x + 10. La variable est x, la largeur ; P est fonction de x."
            explainWrong="Un rectangle a quatre côtés : deux de largeur x, deux de longueur 5. P(x) = 2x + 2 × 5 = 2x + 10. (5x serait une aire, x + 5 un demi-périmètre.)"
            solved={q2a} onAnswered={() => setQ2a(true)} />
          {q2a && (
            <NumericQuestion prompt={<span>Pour quelle largeur x le périmètre vaut-il 24 cm ? (résous <MathText>{'$P(x) = 24$'}</MathText>)</span>} expected={7} parse={parseDec} display={formatDec(7)}
              requires={['regle-antecedent-equation', 'methode-modeliser', 'image-antecedent', 'equation-premier-degre']}
              explain={<span>2x + 10 = 24 ⟺ 2x = 14 ⟺ x = <strong>7</strong>. C’est l’antécédent de 24 par P.</span>}
              explainFor={(n) => (n === 14 ? '24 − 10 = 14, c’est 2x. Divise par 2 : x = 7.' : n === 12 ? 'Tu as divisé 24 par 2 avant de retirer les deux longueurs : 2x + 10 = 24 → 2x = 14 → x = 7.' : n === 58 ? 'Tu as calculé P(24). Ici on cherche x tel que P(x) = 24 : 2x = 14, x = 7.' : 'Résous 2x + 10 = 24 : 2x = 14, x = 7.')}
              solved={q2b} onAnswered={() => setQ2b(true)} />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quel registre répond le plus vite ?',
      done: q3,
      content: (
        <div className="space-y-3">
        <KnowledgeBrick
          id="methode-choisir-registre"
          variant="new"
          lead={<>Les quatre registres disent la même fonction, mais pas à la même vitesse. Chacun a sa question de prédilection.</>}
        />
        <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-700">Pour chaque question, quel registre utiliser en premier ?</p>}
          requires={['methode-choisir-registre', 'quatre-registres', 'tableau-valeurs', 'courbe-representative', 'image-antecedent']}
          rows={[
            { id: 'r1', label: 'Calculer f(3,7) exactement', options: ['expression', 'courbe', 'tableau'], correct: 0, correction: 'seule l’expression donne une valeur exacte pour n’importe quel x' },
            { id: 'r2', label: 'Compter les antécédents de 2', options: ['expression', 'courbe', 'tableau'], correct: 1, correction: 'on voit d’un coup où la courbe coupe y = 2' },
            { id: 'r3', label: 'Lire f(2) quand on ne connaît que six mesures', options: ['expression', 'courbe', 'tableau'], correct: 2, correction: 'sans expression, les mesures sont le tableau' },
            { id: 'r4', label: 'Voir d’un coup d’œil où f dépasse 100', options: ['expression', 'courbe', 'tableau'], correct: 1, correction: 'la courbe montre la zone au-dessus de 100' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} L’expression calcule exactement, la courbe montre globalement (antécédents, zones), le tableau donne des valeurs précises mais seulement les siennes. Les trois décrivent la même fonction.
            </Feedback>
          )}
          solved={q3} onAnswered={() => setQ3(true)}
        />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Deux expressions, une fonction ?',
      subtitle: 'Teste plusieurs valeurs de x.',
      done: q4,
      content: (kit) => (
        <div className="space-y-3">
          <ValueTable
            columns={[{ id: 'a', label: <MathText>{'$2x + 10$'}</MathText>, fn: (x) => 2 * x + 10 }, { id: 'b', label: <MathText>{'$2(x + 5)$'}</MathText>, fn: (x) => 2 * (x + 5) }]}
            xs={[0, 1, 2, 3, 5, 10]} tested={tested} disabled={q4}
            onTest={(x) => { const s = new Set(tested); s.add(x); setTested(s); if (s.size === 3) kit.react(true); }} />
          {tested.size >= 3 ? (
            <TapQuestion prompt="2x + 10 et 2(x + 5) définissent-elles la même fonction ?"
              requires={['quatre-registres', 'tableau-valeurs', 'methode-calculer-image', 'developper', 'distributivite']}
              options={['Oui : mêmes images pour tout x, car 2(x + 5) = 2x + 10 en développant', 'Non : les écritures sont différentes', 'Oui, mais seulement pour les x testés', 'Non : l’une a des parenthèses']}
              correct={0} cols={1}
              explain="Une fonction est définie par ses images, pas par l’écriture de sa règle : 2(x + 5) = 2x + 10 pour tout x (distributivité). Les lignes vertes du tableau le confirment ; le calcul littéral le prouve."
              explainWrong="Chaque ligne du tableau est verte : les deux colonnes coïncident. Et 2(x + 5) se développe en 2x + 10 : mêmes images pour TOUT x, donc la même fonction — deux écritures d’une seule règle."
              solved={q4} onAnswered={() => setQ4(true)} />
          ) : (
            <Feedback tone="info">Teste au moins trois valeurs de x avant de conclure.</Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Quatre registres, une fonction"
      moduleSubtitle="Situation, tableau, courbe, expression : la même dépendance, quatre lectures"
      estimatedTime="10 min"
      brief={{ tag: 'Manipulation', title: 'Traduire d’un registre à l’autre', tone: 'cyan', body: <p>Une fonction peut être donnée par une situation, un tableau, une courbe ou une expression. Savoir passer de l’un à l’autre, c’est choisir à chaque question l’outil le plus rapide.</p> }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          Jusqu’ici, les fonctions vivaient sur un intervalle d’un seul tenant. Module suivant : une piscine qui ferme entre midi et deux — et un ensemble de définition en deux morceaux.
        </KnowledgeSnapshot>
      }
    />
  );
}
