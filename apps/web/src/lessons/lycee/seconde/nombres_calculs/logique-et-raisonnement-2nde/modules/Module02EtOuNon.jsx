import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FilterLab from '../components/FilterLab';
import { prop, range } from '../components/logicUtils';

/**
 * Module 2 — DISCOVERY : « ET, OU, NON ».
 * Activity: brancher un filtre à deux propriétés et lire qui passe.
 * Mathematical objective: ET = les deux ; OU = au moins une (inclusif) ;
 *   NON = l'inverse ; et la négation d'une proposition simple.
 * Misconception targeted: « OU exclut le cas des deux », « la négation de
 *   x > 5 est x < 5 ».
 */
const P = prop('pair', 'n est pair', (n) => n % 2 === 0);
const Q = prop('gt5', 'n > 5', (n) => n > 5);
const DOMAIN = range(1, 12);

export default function Module02EtOuNon() {
  const [connector, setConnector] = useState('and');
  const [seen, setSeen] = useState(() => new Set(['and']));
  const [orDone, setOrDone] = useState(false);
  const [negDone, setNegDone] = useState(false);
  const [batchDone, setBatchDone] = useState(false);
  const pick = (id) => { setConnector(id); const s = new Set(seen); s.add(id); setSeen(s); };
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="ET, OU, NON"
      moduleSubtitle="Deux propriétés, un branchement : qui passe le filtre « pair ET plus grand que 5 » ? Et « pair OU… » ?"
      estimatedTime="10 min"
      brief={{ tag: '🔌 Mission 02', title: 'Deux propriétés P et Q, douze nombres, et un connecteur à choisir.', tone: 'indigo', body: <p>Regarde qui passe le filtre. Les deux voyants de chaque nombre restent allumés : tu vois pourquoi.</p> }}
      steps={[
        {
          num: 1, title: 'Branche les filtres', subtitle: 'Essaie ET, puis OU, puis une négation.', done: seen.size >= 3 && orDone,
          content: (kit) => (
            <div className="space-y-3">
              <FilterLab P={P} Q={Q} domain={DOMAIN} connector={connector} onConnector={(id) => { pick(id); if (seen.size === 2) kit.react(true); }} />
              {/* Les trois connecteurs viennent d'être essayés sur le même
                  filtre : c'est l'instant où ET / OU / NON prennent sens,
                  avant la question qui va tester le OU inclusif. */}
              {seen.size >= 3 && (
                <KnowledgeBrick
                  id="connecteurs"
                  variant="new"
                  lead={<>Tu viens de brancher les trois connecteurs sur le même filtre et de voir les nombres changer de côté.</>}
                />
              )}
              {seen.size >= 3 && (
                <TapQuestion prompt="Avec « P OU Q », le nombre 8 (pair ET plus grand que 5) passe-t-il ?" options={['Oui : le OU mathématique est inclusif, il suffit qu’une des deux soit vraie — les deux, c’est encore mieux', 'Non : « ou » veut dire l’un ou l’autre, pas les deux', 'Cela dépend du contexte']} cols={1} correct={0}
                  requires={['connecteurs']}
                  explain="En mathématiques, « P OU Q » est vrai dès qu’au moins une des deux l’est, y compris quand les deux le sont. Ici seuls 1, 3 et 5 restent dehors : ni pairs, ni plus grands que 5."
                  explainWrong="Regarde le filtre : 8 est vert avec « P OU Q », et ses deux voyants sont allumés. Le OU mathématique est INCLUSIF — contrairement au « ou » du langage courant (« fromage ou dessert »)."
                  solved={orDone} onAnswered={() => setOrDone(true)} />
              )}
              {/* La question qui vient d'être validée EST la règle : le filtre
                  a montré 8 passer « P OU Q » avec ses deux voyants allumés. */}
              {orDone && (
                <KnowledgeBrick
                  id="regle-ou-inclusif"
                  variant="new"
                  compact
                  lead={<>C’est exactement ce que le filtre vient de montrer avec 8.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'La négation', done: negDone,
          content: (
            <div className="space-y-3">
              {/* Le filtre du module (NON, cas limites de P et Q) a déjà mis
                  l'élève face à la négation ; la méthode se pose avant que la
                  question ne l'exige. */}
              <KnowledgeBrick
                id="methode-negation"
                variant="new"
                lead={<>Le filtre affichait aussi NON P et NON Q. Voici comment nier n’importe quelle proposition.</>}
              />
              <TapQuestion prompt="Quelle est la négation de « n > 5 » ?" options={['n ≤ 5', 'n < 5', 'n ≥ 5', 'n ≠ 5']} cols={4} correct={0}
                requires={['methode-negation']}
                explain="Nier « strictement plus grand que 5 », c’est dire « pas plus grand », donc « inférieur OU ÉGAL à 5 ». Le cas n = 5 doit être dans la négation : il n’est pas > 5. « n < 5 » oublierait 5."
                explainWrong="Attention au cas limite : 5 n’est pas > 5, donc 5 doit satisfaire la négation. « n < 5 » l’exclut à tort. La bonne négation est n ≤ 5."
                solved={negDone} onAnswered={() => setNegDone(true)} />
            </div>
          ),
        },
        {
          num: 3, title: 'Nier en série', done: batchDone,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion intro={<p className="text-sm text-slate-600">La négation de chaque proposition :</p>} rows={[
                { id: 'r1', label: 'n est pair', options: ['n est impair', 'n est négatif', 'n = 0'], correct: 0 },
                { id: 'r2', label: 'x ≤ 3', options: ['x > 3', 'x ≥ 3', 'x < 3'], correct: 0 },
                { id: 'r3', label: 'Tous les élèves sont présents', options: ['Au moins un élève est absent', 'Tous les élèves sont absents', 'Aucun élève n’est présent'], correct: 0, correction: 'nier « tous » donne « au moins un… ne pas ».' },
                { id: 'r4', label: 'n est multiple de 3 ET de 5', options: ['n n’est pas multiple de 3, OU pas multiple de 5', 'n n’est multiple ni de 3 ni de 5', 'n est multiple de 15'], correct: 0, correction: 'nier un ET donne un OU.' },
              ]}
                requires={['methode-negation', 'regle-ou-inclusif']}
                feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} Nier « tous » donne « au moins un… pas » ; nier un ET donne un OU. Et la négation couvre exactement les cas restants, cas limites compris.</Feedback>}
                solved={batchDone} onAnswered={() => setBatchDone(true)} />
              {/* La série vient de traiter un cas limite (x ≤ 3) : le réflexe
                  se fixe maintenant que l'élève l'a manipulé deux fois. */}
              {batchDone && (
                <KnowledgeBrick
                  id="mem-negation-limite"
                  variant="new"
                  lead={<>Le cas qui piège le plus souvent.</>}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
