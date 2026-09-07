import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SignProbe from '../components/SignProbe';
import SignTable from '../components/SignTable';
import { CUBIC, CUBIC_RANGE, G2, signTable } from '../components/signeUtils';

/**
 * Module 2 — DÉCOUVERTE : les zéros et le tableau de signes.
 * Step 1  nommer les zéros (solutions de f(x) = 0).
 * Step 2  construire le tableau : quatre cases à remplir (+ / −) sous l'axe
 *         peint ; correction case par case (formatif).
 * Step 3  lire le tableau sans la courbe.  Step 4  un tableau donné → g.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le mot « tableau de signes » n'apparaissait qu'au `Feedback` de l'étape 2,
 *   et les deux lectures des étapes 3 et 4 exigeaient une méthode que rien
 *   n'avait posée. L'ordre est maintenant geste → brique → demande :
 *     étape 1  la question sur les zéros s'ouvre sur la courbe entièrement
 *              peinte : `zero-fonction` vient du module 1, rien à poser ici
 *     étape 2  remplir les quatre cases → brique `tableau-de-signes` puis
 *              `methode-construire-tableau` (l'objet nommé après l'avoir bâti)
 *     étape 3  brique `methode-lire-tableau` AVANT la première lecture
 *     étape 4  la même méthode, sur un tableau sans courbe
 */
const PROBE = { f: CUBIC, range: CUBIC_RANGE, unit: 40, unitY: 18, xStep: 1, yStep: 1, labelEvery: 2 };
const TRUTH = signTable(CUBIC).cells.map((c) => c.sign);

export default function Module02LesZerosEtLeTableau() {
  const [q1, setQ1] = useState(false);
  const [vals, setVals] = useState([null, null, null, null]);
  const [revealed, setRevealed] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const filled = vals.every((v) => v !== null);

  const steps = [
    {
      num: 1, title: 'Les zéros', done: q1,
      content: (
        <TapQuestion above={<SignProbe {...PROBE} value={0} paintAll showZeros="all" frozen />}
          prompt="Les zéros de f sont les solutions de f(x) = 0 : les abscisses où la courbe touche l’axe. Ici, ce sont…"
          options={['−3, 1 et 4', '−4 et 5', '0', '2,4 ; −2 et 5,8']}
          correct={0} cols={2}
          requires={['zero-fonction', 'signe-position-courbe']}
          explain="Les trois points ambre : x = −3, x = 1 et x = 4. Ce sont des ABSCISSES (des valeurs de x), pas des ordonnées. −4 et 5 sont les bornes de l’intervalle d’étude, pas des zéros."
          explainWrong="Un zéro est une abscisse où f(x) = 0 — un point ambre sur l’axe. Ici : −3, 1 et 4."
          solved={q1} onAnswered={() => setQ1(true)} />
      ),
    },
    {
      num: 2, title: 'Construis le tableau de signes', subtitle: 'Remplis les quatre cases (touche pour basculer + / −). La correction apparaît à la dernière case.', done: revealed,
      content: (kit) => (
        <div className="space-y-3">
          <SignTable f={CUBIC} editable={!revealed} values={vals} reveal={revealed}
            onChange={(i, v) => { if (revealed) return; const n = [...vals]; n[i] = v; setVals(n); if (n.every((s) => s !== null)) { setRevealed(true); kit.react(n.every((s, k) => s === TRUTH[k])); } }} />
          {revealed ? (
            <>
              <Feedback tone={vals.every((s, k) => s === TRUTH[k]) ? 'ok' : 'ko'}>
                {vals.every((s, k) => s === TRUTH[k]) ? 'Quatre cases justes.' : 'Regarde les cases corrigées.'} Le tableau reprend l’axe peint : ligne du haut, les <strong>zéros</strong> (et les bornes) ; ligne du bas, un <strong>0</strong> sous chaque zéro, et un seul signe par intervalle — puisqu’il ne change pas entre deux zéros. C’est un <strong>tableau de signes</strong>.
              </Feedback>
              <KnowledgeBrick
                id="tableau-de-signes"
                variant="new"
                lead={<>Les quatre cases que tu viens de remplir forment un objet qui a un nom.</>}
              />
              <KnowledgeBrick
                id="methode-construire-tableau"
                variant="new"
                compact
                lead={<>Le trajet que tu viens de faire, en trois temps — il sera le même sans courbe.</>}
              />
            </>
          ) : (
            <Feedback tone="info">{filled ? '' : `${vals.filter((v) => v !== null).length} case(s) sur 4. `}Aide-toi de l’axe peint au-dessus, ou teste un x dans chaque intervalle.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'Lire le tableau', done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-lire-tableau"
            variant="new"
            lead={<>Tu as construit le tableau ; il sert maintenant dans l’autre sens — on y lit un signe sans regarder la courbe.</>}
          />
          <BatchChoiceQuestion intro={<div className="space-y-2"><p className="text-sm text-slate-700">Sans la courbe, avec le tableau seul :</p><SignTable f={CUBIC} /></div>}
            rows={[
              { id: 'r1', label: 'f(2)', options: ['négatif', 'positif', 'nul'], correct: 0, correction: '2 ∈ ]1 ; 4[' },
              { id: 'r2', label: 'f(4,5)', options: ['positif', 'négatif', 'nul'], correct: 0, correction: '4,5 ∈ ]4 ; 5]' },
              { id: 'r3', label: 'f(−3)', options: ['nul', 'négatif', 'positif'], correct: 0, correction: 'un zéro' },
              { id: 'r4', label: 'f(x) > 0 pour x dans', options: [']−3 ; 1[ ∪ ]4 ; 5]', ']1 ; 4[', '[−4 ; −3[ ∪ ]1 ; 4['], correct: 0, correction: 'les cases +' },
            ]}
            requires={['tableau-de-signes', 'methode-lire-tableau', 'zero-fonction', 'intervalle', 'intervalle-crochets', 'appartient']}
            feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Pour lire le signe de f(x) : repérer l’intervalle qui contient x, lire la case. Pour f(x) &gt; 0 : réunir les intervalles marqués + (bornes exclues).</Feedback>}
            solved={q3} onAnswered={() => setQ3(true)} />
        </div>
      ),
    },
    {
      num: 4, title: 'Un tableau, sans courbe', done: q4,
      content: (
        <BatchChoiceQuestion intro={<div className="space-y-2"><p className="text-sm text-slate-700">Une fonction g est donnée par son tableau de signes seulement :</p><SignTable f={G2} showFactors={false} /></div>}
          rows={[
            { id: 'r1', label: 'Les zéros de g', options: ['−1 et 2', '−1 seulement', '+ et −'], correct: 0, correction: 'les 0 de la ligne du bas' },
            { id: 'r2', label: 'g(0)', options: ['négatif', 'positif', 'nul'], correct: 0, correction: '0 ∈ ]−1 ; 2[' },
            { id: 'r3', label: 'g(x) < 0 pour', options: [']−1 ; 2[', ']−∞ ; −1[', '[−1 ; 2]'], correct: 0, correction: 'la case −, bornes exclues' },
            { id: 'r4', label: 'Sa courbe est au-dessus de l’axe…', options: ['avant −1 et après 2', 'entre −1 et 2', 'partout'], correct: 0, correction: 'les cases +' },
          ]}
          requires={['tableau-de-signes', 'methode-lire-tableau', 'zero-fonction', 'signe-position-courbe', 'intervalle-crochets']}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Un tableau de signes suffit à imaginer la courbe : au-dessus de l’axe sur les +, en dessous sur les −, sur l’axe aux zéros.</Feedback>}
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Les zéros et le tableau de signes" moduleSubtitle="L’axe peint devient un tableau" estimatedTime="10 min"
      brief={{ tag: 'Découverte', title: 'Des zéros, des signes entre', tone: 'violet', body: <p>La courbe du module 1 revient, entièrement peinte. Ses zéros en colonnes, un signe par intervalle : construis le tableau, puis lis-en un sans courbe.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2}>Sans courbe ni sonde, comment trouver les zéros et les signes ? Par le calcul — module suivant, la fonction affine.</KnowledgeSnapshot>} />
  );
}
