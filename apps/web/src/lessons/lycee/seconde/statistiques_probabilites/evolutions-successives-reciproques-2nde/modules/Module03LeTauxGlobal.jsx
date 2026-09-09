import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EvolutionChain from '../components/EvolutionChain';

/**
 * Module 3 — DÉCOUVERTE : du coefficient global au taux global, t = k − 1.
 *
 * Le contraste « produit des coefficients » / « somme des taux » est affiché
 * en permanence par EvolutionChain (la dernière ligne du bloc bilan donne la
 * somme des taux et dit qu'elle ne décrit pas la chaîne). Ici l'élève cherche
 * délibérément un cas où les deux coïncideraient — et découvre qu'il n'y en a
 * qu'un : quand l'un des taux est nul.
 */
export default function Module03LeTauxGlobal() {
  const [rates, setRates] = useState([0.1, 0.1]);
  const [seen, setSeen] = useState(() => new Set(['0.10,0.10']));
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const key = (r) => r.map((x) => x.toFixed(2)).join(',');
  // Il faut avoir vu le cas « un taux nul » : c'est le seul où somme = produit.
  const hasZero = [...seen].some((k) => k.split(',').some((x) => Math.abs(Number(x)) < 1e-9));
  const done1 = seen.size >= 3 && hasZero;

  const change = (r, react) => {
    setRates(r);
    const next = new Set(seen); next.add(key(r)); setSeen(next);
    const zero = [...next].some((k) => k.split(',').some((x) => Math.abs(Number(x)) < 1e-9));
    if (!done1 && next.size >= 3 && zero) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Somme des taux contre taux global',
      subtitle: 'Les deux nombres sont affichés en bas. Cherche un cas où ils sont égaux — essaie notamment 0 %.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <EvolutionChain initial={100} rates={rates} onRatesChange={(r) => change(r, kit.react)} maxSteps={3} />
          {done1 ? (
            <Feedback tone="ok">
              Ils ne coïncident que si <strong>l’un des taux est nul</strong> — c’est-à-dire s’il n’y a en réalité
              qu’une seule évolution. Dès qu’il y en a deux vraies, le taux global n’est <strong>jamais</strong> la
              somme : +10 % puis +10 % donne <strong>+21 %</strong> (1,10 × 1,10 = 1,21), le 1 % de plus étant
              « les 10 % appliqués aux 10 % déjà gagnés ».
            </Feedback>
          ) : null}
          {/* Le bloc bilan affichait les deux nombres côte à côte ; l'élève
              vient de chercher lui-même où ils coïncident. On peut nommer le
              taux global, que l'étape 2 va demander de calculer. */}
          {done1 && (
            <KnowledgeBrick
              id="taux-global"
              variant="new"
              lead={<>Le coefficient global, tu sais le calculer depuis le module 2. Ce que tu viens de lire en bas du bloc, c’est ce qu’il devient une fois traduit en pourcentage.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">
              Chaînes essayées : {seen.size} sur 3.{!hasZero ? ' Essaie une évolution à 0 %.' : ''}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Du coefficient au taux global',
      done: q2,
      content: (
        <div className="space-y-3">
        <NumericQuestion
          prompt="Une population subit +8 % puis −5 %. Quel est le taux d’évolution global, en pourcentage (arrondi au dixième) ?"
          requires={['taux-global', 'coefficient-global', 'pourcentage', 'arrondi']}
          above={(revealed) => (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-center">
              <MathText>{'$$t_{\\text{global}} = k_{\\text{global}} - 1$$'}</MathText>
              {revealed && <p className="text-xs text-sky-700 mt-1">1,08 × 0,95 = 1,026 → t = 0,026 = +2,6 %</p>}
            </div>
          )}
          expected={(n) => Math.abs(n - 2.6) < 0.06}
          display="+2,6 %"
          explain="1,08 × 0,95 = 1,026, donc t = 0,026 soit +2,6 %. La somme des taux (+3 %) ne convient pas."
          explainFor={(n) => (Math.abs(n - 3) < 0.2
            ? 'Tu as fait 8 − 5 = 3. Il faut multiplier les coefficients : 1,08 × 0,95 = 1,026, soit +2,6 %.'
            : Math.abs(n - 1.026) < 0.01
              ? '1,026 est le COEFFICIENT global. Le taux est k − 1 = 0,026, soit +2,6 %.'
              : 'k = 1,08 × 0,95 = 1,026 puis t = k − 1 = +2,6 %.')}
          solved={q2} onAnswered={() => setQ2(true)}
        />
        {/* La somme (+3 %) et le taux global (+2,6 %) viennent de s'écarter
            sur un cas chiffré : c'est le moment de dire à quelle condition
            ils coïncideraient — l'étape 3 en fait quatre fois l'épreuve. */}
        {q2 && (
          <KnowledgeBrick
            id="somme-jamais"
            variant="new"
            lead={<>+3 % annoncé par la somme, +2,6 % en réalité. Et à l’étape 1, les deux nombres ne se rejoignaient qu’en un seul cas.</>}
          />
        )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Somme ou produit ?',
      done: q3,
      content: (
        <BatchChoiceQuestion
          intro={<p className="text-sm font-semibold text-slate-700">Pour chaque chaîne, quel est le taux global ?</p>}
          requires={['somme-jamais', 'taux-global', 'coefficient-global', 'pourcentage']}
          rows={[
            { id: 'g1', label: '+10 % puis +10 %', options: ['+20 %', '+21 %', '+100 %'], correct: 1, correction: '1,1 × 1,1 = 1,21 → +21 %' },
            { id: 'g2', label: '+20 % puis −20 %', options: ['0 %', '−4 %', '−40 %'], correct: 1, correction: '1,2 × 0,8 = 0,96 → −4 %' },
            { id: 'g3', label: '−10 % puis −10 %', options: ['−20 %', '−19 %', '−1 %'], correct: 1, correction: '0,9 × 0,9 = 0,81 → −19 % (et non −20 %)' },
            { id: 'g4', label: '+100 % puis −50 %', options: ['+50 %', '0 %', '−50 %'], correct: 1, correction: '2 × 0,5 = 1 → 0 % : ici, ça revient exactement au départ' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} La dernière ligne mérite un regard :
              doubler puis reprendre la moitié ramène bien au départ, parce que 2 × 0,5 = 1.
              <strong> C’est le produit qui décide</strong>, jamais la somme des taux.
            </Feedback>
          )}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Deux baisses successives',
      done: q4,
      content: (
        <TapQuestion
          prompt="Un magasin annonce « −30 % puis −30 % supplémentaires ». Un client dit : « donc −60 % ». A-t-il raison ?"
          options={[
            'Non : 0,7 × 0,7 = 0,49, soit −51 %',
            'Oui : 30 + 30 = 60 %',
            'Non : c’est −9 %',
            'Non : c’est −70 %',
          ]}
          correct={0} cols={2}
          requires={['somme-jamais', 'taux-global', 'coefficient-global', 'pourcentage']}
          explain="0,70 × 0,70 = 0,49 : il reste 49 % du prix, donc la remise totale est de 51 %. C’est mieux que les 30 % d’une seule baisse, mais moins que les 60 % annoncés par le client — la seconde baisse ne porte que sur ce qui reste. Deux baisses successives ne peuvent d’ailleurs jamais atteindre −100 %."
          explainWrong="La seconde remise porte sur le prix déjà réduit. Il reste 70 % de 70 %, soit 49 % du prix initial : la remise est de 51 %."
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Le taux global" moduleSubtitle="t = k − 1, et pourquoi +10 % deux fois font +21 %" estimatedTime="10 min"
      brief={{
        tag: 'Découverte', title: 'Jamais la somme', tone: 'sky',
        body: <p>Le coefficient global se calcule ; le taux global s’en déduit. Reste à comprendre pourquoi il ne vaut presque jamais la somme des taux annoncés.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Une question en suspens.</strong> Si −20 % n’annule pas +20 %, quel taux l’annule ?
          Module suivant : chercher le coefficient qui ramène à 1.
        </KnowledgeSnapshot>
      )}
    />
  );
}
