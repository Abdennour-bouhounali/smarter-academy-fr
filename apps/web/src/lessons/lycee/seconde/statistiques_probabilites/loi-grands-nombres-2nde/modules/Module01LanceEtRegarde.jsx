import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { formatPercent } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SimulationLab from '../components/SimulationLab';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : lancer soi-même
 * (components/SimulationLab.jsx).
 *
 * Le phénomène central tient dans un geste répété : sur 10 lancers la
 * fréquence tombe n'importe où, sur 10 000 elle colle à p. Aucune phrase ne
 * produit cette surprise ; relancer une petite série et voir 20 % puis 60 %,
 * si.
 *
 * L'élève DOIT avoir lancé une petite et une grande série avant que l'étape
 * ne se valide — c'est la condition pour que le contraste soit vécu et non
 * lu. Ce que ce module ne fait PAS : nommer la fluctuation d'échantillonnage
 * (M2), énoncer la loi et ses contresens (M3), interroger le modèle (M4).
 */
export default function Module01LanceEtRegarde() {
  const [expId, setExpId] = useState('de-six');
  const [pred, setPred] = useState(null);
  const [small, setSmall] = useState(null);   // dernière série ≤ 100
  const [big, setBig] = useState(null);       // dernière série ≥ 1000
  const [q2, setQ2] = useState(false);

  const done1 = Boolean(small && big);
  const done2 = q2;

  const handleRun = (entry, react) => {
    if (entry.n <= 100) setSmall(entry); else setBig(entry);
    const willBeDone = entry.n <= 100 ? Boolean(big) : Boolean(small);
    if (!done1 && willBeDone) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Lance une petite série, puis une grande',
      subtitle: 'Regarde où tombe la fréquence à chaque fois. Relance : elle ne retombe pas au même endroit.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="Tu lances un dé 10 fois. Combien de 6 penses-tu obtenir ?"
            options={[
              { id: 'exact', label: 'Toujours à peu près 1 ou 2' },
              { id: 'variable', label: 'Ça peut être 0 comme 4' },
            ]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <SimulationLab
            experimentId={expId}
            onExperimentChange={(id) => { setExpId(id); setSmall(null); setBig(null); }}
            onRun={(entry) => handleRun(entry, kit.react)}
          />
          {done1 ? (
            <Feedback tone="ok">
              Compare tes deux séries : sur <strong>{small.n.toLocaleString('fr-FR')}</strong> répétitions tu as
              obtenu <strong>{formatPercent(small.frequency, 1)}</strong>, sur{' '}
              <strong>{big.n.toLocaleString('fr-FR')}</strong> tu as obtenu{' '}
              <strong>{formatPercent(big.frequency, 2)}</strong>. La grande série se tient beaucoup plus près de
              la probabilité du modèle — et pourtant elle ne l’atteint presque jamais exactement.{' '}
              <span className="text-slate-500">
                Relance encore : la petite série saute, la grande bouge à peine.
              </span>
            </Feedback>
          ) : (
            <Feedback tone="info">
              Il te reste à lancer {small ? 'une grande série (1 000 ou 10 000)' : big ? 'une petite série (10 ou 100)' : 'une petite série, puis une grande'}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Qu’est-ce qui a changé ?',
      done: done2,
      content: (
        <TapQuestion
          prompt="En passant de 10 à 10 000 répétitions, qu’est-ce qui se resserre autour de la probabilité ?"
          options={[
            'La fréquence observée',
            'La probabilité du modèle',
            'Le nombre de succès',
            'Rien : tout est dû au hasard',
          ]}
          correct={0} cols={1}
          explain="La probabilité du modèle n’a jamais bougé — c’est une donnée du dé, pas un résultat. Le nombre de succès, lui, AUGMENTE avec les répétitions. Ce qui se resserre, c’est la fréquence observée : le quotient succès ÷ répétitions."
          explainWrong="La probabilité est fixée par le modèle (1/6 pour un dé équilibré) : aucune série ne la déplace. Ce sont les fréquences que tu as calculées qui se rapprochent d’elle."
          solved={done2} onAnswered={() => setQ2(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Lance, et regarde la fréquence bouger" moduleSubtitle="Peu de lancers : le chaos. Beaucoup : la régularité." estimatedTime="13 min"
      brief={{
        tag: 'Déclencheur', title: 'Dix lancers, puis dix mille', tone: 'indigo',
        body: <p>Un dé équilibré donne un 6 une fois sur six — c’est la théorie. Lance-le dix fois pour voir. Puis dix mille. Ce n’est pas la même histoire.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Ce que tu viens de voir.</strong> Une <strong>fréquence observée</strong> se calcule sur les
          lancers réellement faits ; elle change d’une série à l’autre. La <strong>probabilité</strong>, elle, ne
          bouge pas. Module suivant : pourquoi deux séries identiques ne donnent jamais le même résultat.
        </KnowledgeSnapshot>
      )}
    />
  );
}
