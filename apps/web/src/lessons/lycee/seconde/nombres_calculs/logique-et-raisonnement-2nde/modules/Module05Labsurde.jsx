import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PigeonLab from '../components/PigeonLab';
import ProofOrder from '../components/ProofOrder';

/**
 * Module 5 — PRACTICE LAB : « Par l'absurde ».
 * Activity: essayer d'éviter tout partage de mois avec 13 élèves ; puis
 *   ordonner une preuve par l'absurde ; puis une disjonction de cas.
 * Mathematical objective: supposer le contraire, en tirer une contradiction,
 *   conclure. Et raisonner par cas quand la parité est inconnue.
 */
const PROOF = [
  { id: 'l1', text: 'Supposons le contraire : aucun mois n’est partagé par deux élèves.', plain: 'Supposons le contraire : aucun mois partagé' },
  { id: 'l2', text: 'Alors chaque mois contient au plus un élève.', plain: 'Alors chaque mois contient au plus un élève' },
  { id: 'l3', text: 'Comme il y a 12 mois, la classe compte au plus 12 élèves.', plain: 'Comme il y a 12 mois, au plus 12 élèves' },
  { id: 'l4', text: 'Or la classe compte 13 élèves : contradiction.', plain: 'Or la classe compte 13 élèves : contradiction' },
  { id: 'l5', text: 'Donc deux élèves au moins sont nés le même mois.', plain: 'Donc deux élèves au moins partagent un mois' },
];
const ORDER = ['l4', 'l1', 'l5', 'l3', 'l2'];

export default function Module05Labsurde() {
  const [count, setCount] = useState(0);
  const [proofDone, setProofDone] = useState(false);
  const [structDone, setStructDone] = useState(false);
  const [casesDone, setCasesDone] = useState(false);
  const forced = count >= 13;
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Par l’absurde"
      moduleSubtitle="Treize élèves, douze mois : deux partagent forcément le même. Supposer le contraire, et se cogner."
      estimatedTime="8 min"
      brief={{ tag: '🚪 Mission 06', title: 'Une classe de 13 élèves. Peut-on leur donner à tous un mois de naissance différent ?', tone: 'indigo', body: <p>Essaie — place-les un par un en évitant les doublons.</p> }}
      steps={[
        {
          num: 1, title: 'Essaie d’éviter le partage', subtitle: 'Ajoute des élèves jusqu’à 13.', done: forced && structDone,
          content: (kit) => (
            <div className="space-y-3">
              <PigeonLab count={count} onCount={(v) => { setCount(v); if (v === 13) kit.react(true); }} />
              {/* Le treizième élève vient de forcer la contradiction : c'est
                  l'instant où le raisonnement par l'absurde prend sens. */}
              {forced && (
                <KnowledgeBrick
                  id="raisonnement-absurde"
                  variant="new"
                  lead={<>Tu viens d’essayer d’éviter le partage jusqu’au bout — et de te cogner au treizième élève. Ce que tu as fait porte un nom.</>}
                />
              )}
              {forced && (
                <TapQuestion prompt="Que vient-on de faire, comme raisonnement ?" options={['On a SUPPOSÉ qu’aucun mois n’était partagé, on a placé les élèves, et on s’est cogné à une contradiction : la supposition est impossible', 'On a testé un exemple', 'On a trouvé un contre-exemple']} cols={1} correct={0}
                  requires={['raisonnement-absurde', 'contre-exemple']}
                  explain="C’est le raisonnement par l’absurde : on suppose le contraire de ce qu’on veut montrer, on raisonne jusqu’à une contradiction (13 élèves dans 12 cases, avec au plus un par case), et on conclut que la supposition était fausse — donc l’énoncé est vrai."
                  explainWrong="Il ne s’agit ni d’un exemple ni d’un contre-exemple : on a supposé le CONTRAIRE de la conclusion (« aucun partage »), et cette supposition a mené à une impossibilité."
                  solved={structDone} onAnswered={() => setStructDone(true)} />
              )}
            </div>
          ),
        },
        { num: 2, title: 'Remets la preuve en ordre', subtitle: 'Cinq lignes, de la supposition à la conclusion.', done: proofDone, content: <ProofOrder lines={PROOF} order={ORDER} onDone={() => setProofDone(true)} solved={proofDone} /> },
        {
          num: 3, title: 'Par disjonction des cas', done: casesDone,
          content: (
            <div className="space-y-3">
              {/* La question qui suit exige de reconnaître une disjonction de
                  cas : le nom et le principe se posent avant. */}
              <KnowledgeBrick
                id="disjonction-cas"
                variant="new"
                lead={<>Une autre façon de prouver « pour tout n », différente de l’absurde que tu viens de pratiquer.</>}
              />
              <TapQuestion prompt={<>Comment prouver que <MathText>{'$n(n+1)$'}</MathText> est pair pour TOUT entier n ?</>}
                options={['En séparant deux cas : si n est pair, n(n + 1) l’est ; si n est impair, alors n + 1 est pair, donc le produit aussi', 'En testant n = 1, 2, 3, 4', 'Par l’absurde uniquement', 'C’est impossible à prouver']} cols={1} correct={0}
                requires={['disjonction-cas', 'raisonnement-absurde']}
                explain="C’est la disjonction des cas : on découpe la situation en cas qui couvrent TOUT (ici, n pair ou n impair — il n’y a pas d’autre possibilité), et on conclut dans chacun. Le résultat vaut alors pour tout n."
                explainWrong="Des exemples ne prouvent rien pour tous les entiers. Ici deux cas suffisent car ils couvrent tout : n est pair, ou n est impair. Dans chaque cas, un des deux facteurs est pair."
                solved={casesDone} onAnswered={() => setCasesDone(true)} />
              {/* Les quatre techniques du module (direct implicite au module 3,
                  contraposée, absurde, disjonction) viennent d'être exercées :
                  le récapitulatif clôt le module. */}
              {casesDone && (
                <KnowledgeBrick
                  id="vocab-quatre-outils"
                  variant="new"
                  lead={<>Les quatre façons de prouver que tu as maintenant toutes rencontrées.</>}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
