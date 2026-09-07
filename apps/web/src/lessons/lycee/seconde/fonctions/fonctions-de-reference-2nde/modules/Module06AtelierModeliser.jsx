import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec, formatDec } from '../components/referenceUtils';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT : modéliser avec une référence.
 * Une aire (carré), une durée de trajet (inverse), un écart à zéro (valeur
 * absolue), puis dresser un tableau des trois et reconnaître un point.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   La méthode de reconnaissance n'existait que dans l'« À retenir » du pied :
 *   les quatre situations la demandaient sans qu'elle soit posée nulle part.
 *   L'ordre est maintenant geste → brique → demande — le geste étant ici la
 *   première reconnaissance, faite par l'élève seul :
 *     étape 1  reconnaître l'aire du carreau, puis retrouver le côté
 *              → brique `methode-modeliser-reference`
 *     étapes 2, 3 et 4  les trois autres situations, désormais légitimes
 *              (`requires`)
 *   Poser la brique AVANT l'étape 1 donnerait la réponse de la première
 *   question : elle vient juste après, quand la reconnaissance a du sens.
 *
 * MANIPULATION JAMAIS GELÉE. Le tableau de valeurs de l'étape 4 se figeait dès
 * la question résolue : l'élève ne pouvait plus tester d'autres x pour vérifier
 * ce qu'il venait de conclure. Il reste vivant.
 */
export default function Module06AtelierModeliser() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [tested, setTested] = useState(() => new Set());
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1, title: 'Le carrelage', subtitle: 'Un carreau carré de côté c (en m) a pour aire A(c).', done: q1a && q1b,
      content: (
        <div className="space-y-4">
          <TapQuestion prompt="Quelle fonction de référence décrit l’aire en fonction du côté ?" options={['La fonction carré : A(c) = c²', 'La fonction inverse : A(c) = 1/c', 'La fonction valeur absolue : A(c) = |c|', 'Aucune : A(c) = 4c']} correct={0} cols={1}
            requires={['formule-references', 'fonction-carre', 'fonction-inverse', 'fonction-valeur-absolue']}
            explain="Aire d’un carré = côté × côté = c², définie pour c > 0. Doubler le côté multiplie l’aire par 4, pas par 2."
            explainWrong="L’aire d’un carré de côté c est c × c = c². 4c serait son périmètre." solved={q1a} onAnswered={() => setQ1a(true)} />
          {q1a && (
            <NumericQuestion prompt="Quel côté (en m) donne un carreau d’aire 2,25 m² ?" expected={1.5} parse={parseDec} display={formatDec(1.5)}
              requires={['fonction-carre', 'methode-antecedents-reference']}
              explain={<span>On cherche c &gt; 0 tel que c² = 2,25 : c = <strong>1,5</strong> (1,5 × 1,5 = 2,25). L’autre antécédent, −1,5, n’est pas une longueur.</span>}
              explainFor={(n) => (n === 1.125 ? '2,25 ÷ 2 n’est pas une racine : cherche le nombre qui, multiplié par lui-même, donne 2,25 — c’est 1,5.' : n === 5.0625 ? 'Tu as élevé au carré au lieu de prendre la racine : 1,5² = 2,25.' : n === -1.5 ? '−1,5 est bien un antécédent de 2,25 par la fonction carré, mais un côté est positif : c = 1,5.' : 'c² = 2,25 avec c > 0 : c = 1,5.')}
              solved={q1b} onAnswered={() => setQ1b(true)} />
          )}
          {q1a && q1b && (
            <KnowledgeBrick
              id="methode-modeliser-reference"
              variant="new"
              lead="Tu viens de reconnaître une référence derrière une situation, puis de remonter d’une aire vers un côté. Les trois indices qui font ce tri, une fois pour toutes."
            />
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Le trajet', subtitle: 'Pour 120 km, la durée t (en h) dépend de la vitesse moyenne v (en km/h) : t(v) = 120 / v.', done: q2,
      content: (
        <BatchChoiceQuestion requires={['fonction-inverse', 'regle-pres-loin-zero', 'methode-modeliser-reference']} intro={<p className="text-sm text-slate-700"><MathText>{'$t(v) = \\dfrac{120}{v}$'}</MathText> — une fonction inverse, à un facteur près.</p>}
          rows={[
            { id: 'r1', label: 't(60)', options: ['2 h', '0,5 h', '60 h'], correct: 0, correction: '120 ÷ 60' },
            { id: 'r2', label: 't(30)', options: ['4 h', '2 h', '1 h'], correct: 0, correction: '120 ÷ 30' },
            { id: 'r3', label: 'Doubler la vitesse…', options: ['divise la durée par 2', 'divise la durée par 4', 'ne change pas la durée'], correct: 0, correction: 'inverse : 60 → 2 h, 120 → 1 h' },
            { id: 'r4', label: 'Quand v se rapproche de 0, la durée…', options: ['devient énorme', 'devient nulle', 'vaut 120'], correct: 0, correction: 'comme 1/x près de 0' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} « Durée = distance ÷ vitesse » se comporte comme 1/x : décroissante, énorme près de 0, jamais nulle. Définie pour v &gt; 0.</Feedback>}
          solved={q2} onAnswered={() => setQ2(true)} />
      ),
    },
    {
      num: 3, title: 'L’écart à zéro', subtitle: 'Sur un thermomètre, e(x) = |x| mesure l’écart entre la température x (en °C) et 0 °C.', done: q3,
      content: (
        <BatchChoiceQuestion requires={['fonction-valeur-absolue', 'vocab-extremum', 'methode-antecedents-reference', 'methode-modeliser-reference']} intro={<p className="text-sm text-slate-700">La fonction valeur absolue, telle quelle.</p>}
          rows={[
            { id: 'r1', label: 'e(−4)', options: ['4', '−4', '0'], correct: 0, correction: 'distance à 0' },
            { id: 'r2', label: 'Températures à 2,5 °C de 0', options: ['−2,5 et 2,5', '2,5 seulement', '−2,5 seulement'], correct: 0, correction: 'deux antécédents' },
            { id: 'r3', label: 'e(x) ≤ 1 pour', options: ['−1 ≤ x ≤ 1', 'x ≤ 1', 'x ≥ −1'], correct: 0, correction: 'le V sous y = 1' },
            { id: 'r4', label: 'La plus petite valeur de e', options: ['0, à 0 °C', '−1', 'il n’y en a pas'], correct: 0, correction: 'le coin du V' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Un écart, une distance, une marge d’erreur : dès qu’un signe ne compte pas, la valeur absolue est là. |x| ≤ 1 ⟺ −1 ≤ x ≤ 1.</Feedback>}
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
    {
      num: 4, title: 'Dresser le tableau, reconnaître le point', subtitle: 'Teste au moins quatre valeurs de x.', done: q4,
      content: (kit) => (
        <div className="space-y-3">
          <ValueTable columns={[{ id: 'sq', label: <MathText>{'$x^2$'}</MathText>, fn: (x) => x * x }, { id: 'inv', label: <MathText>{'$1/x$'}</MathText>, fn: (x) => 1 / x }, { id: 'abs', label: <MathText>{'$|x|$'}</MathText>, fn: (x) => Math.abs(x) }]}
            xs={[-2, -1, -0.5, 0.5, 1, 2]} tested={tested} compare={false}
            onTest={(x) => { const s = new Set(tested); s.add(x); setTested(s); if (s.size === 4) kit.react(true); }} />
          {tested.size >= 4 ? (
            <TapQuestion prompt="Le point (−2 ; −0,5) est sur la courbe de…" options={['1/x', 'x²', '|x|', 'aucune des trois']} correct={0} cols={4}
              requires={['methode-tableau-tracer', 'methode-modeliser-reference', 'fonction-inverse', 'abscisse', 'ordonnee']}
              explain="1/(−2) = −0,5 : le point est sur l’hyperbole. (−2)² = 4 et |−2| = 2, pas −0,5. Seule la fonction inverse prend des valeurs négatives."
              explainWrong="Regarde la ligne x = −2 du tableau : seule la colonne 1/x porte −0,5. Une ordonnée négative exclut d’office x² et |x|." solved={q4} onAnswered={() => setQ4(true)} />
          ) : (
            <Feedback tone="info">Encore {4 - tested.size} valeur{4 - tested.size > 1 ? 's' : ''} à tester.</Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="Atelier : modéliser" moduleSubtitle="Une aire, une durée, un écart : reconnaître la référence" estimatedTime="13 min"
      brief={{ tag: 'Atelier', title: 'Les références dans la vraie vie', tone: 'amber', body: <p>Une aire de carré, une durée de trajet, un écart de température : trois situations, trois fonctions de référence. Reconnais, calcule, réponds.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6}>Il ne reste qu’à le prouver : la mission finale. Dix épreuves, une seule validation.</KnowledgeSnapshot>} />
  );
}
