import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { formatPercent } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FluctuationBoard from '../components/FluctuationBoard';

/**
 * Module 2 — DÉCOUVERTE : la fluctuation d'échantillonnage, et sa
 * diminution avec n.
 *
 * Le module 1 montrait UNE série à la fois ; ici vingt séries de même
 * taille apparaissent d'un coup sur un axe fixe. L'élève doit avoir lancé
 * les lots n = 10 ET n = 1 000 pour valider : c'est la comparaison des deux
 * étendues qui porte le sens, pas l'observation d'un seul nuage.
 *
 * L'axe reste 0 → 1 quel que soit n (voir FluctuationBoard) : si l'échelle
 * s'adaptait, le resserrement — c'est-à-dire le phénomène — disparaîtrait.
 */
const P = 1 / 2;

export default function Module02DeuxSeriesJamaisPareilles() {
  const [spreads, setSpreads] = useState({});   // { [n]: étendue }
  const [q2, setQ2] = useState(false);

  const done1 = spreads[10] !== undefined && spreads[1000] !== undefined;
  const done2 = q2;

  // L'effet sonore est déclenché DEPUIS le gestionnaire, jamais depuis
  // l'updater de setState : React rejoue les updaters pendant le rendu, et
  // un react() appelé là déclenche « setState while rendering ».
  const handleBatch = (n, freqs, react) => {
    const spread = Math.max(...freqs) - Math.min(...freqs);
    const next = { ...spreads, [n]: spread };
    setSpreads(next);
    if (!done1 && next[10] !== undefined && next[1000] !== undefined) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Vingt séries, exactement le même réglage',
      subtitle: 'Lance les lots de 10, puis ceux de 1 000. Compare la largeur des deux nuages.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <FluctuationBoard p={P} pLabel="1/2" onBatch={(n, freqs) => handleBatch(n, freqs, kit.react)} />
          {done1 ? (
            <Feedback tone="ok">
              Même pièce, même nombre de séries, seule la taille change : l’étendue passe de{' '}
              <strong>{formatPercent(spreads[10], 1)}</strong> (séries de 10) à{' '}
              <strong>{formatPercent(spreads[1000], 1)}</strong> (séries de 1 000). Les vingt séries restent
              centrées sur 50 % dans les deux cas — ce n’est pas le centre qui bouge, c’est la{' '}
              <strong>dispersion</strong> qui s’effondre. Ce phénomène porte un nom : la{' '}
              <strong>fluctuation d’échantillonnage</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Lots lancés : {Object.keys(spreads).length ? Object.keys(spreads).map((k) => Number(k).toLocaleString('fr-FR')).join(', ') : 'aucun'}.
              Il faut au moins les séries de 10 et celles de 1 000 pour comparer.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux élèves, deux résultats',
      done: done2,
      content: (
        <TapQuestion
          prompt="Deux élèves lancent chacun une pièce 100 fois. L’un obtient 46 % de Pile, l’autre 55 %. Que peut-on en conclure ?"
          options={[
            'Rien d’anormal : deux séries de même taille fluctuent',
            'L’une des deux pièces est truquée',
            'L’un des deux élèves a mal compté',
            'La probabilité de Pile n’est pas 1/2',
          ]}
          correct={0} cols={1}
          explain="Sur 100 lancers, un écart de quelques points au modèle est parfaitement ordinaire — tu viens de le produire vingt fois d’affilée. Conclure au truquage à partir d’une seule série de 100 lancers, c’est prendre la fluctuation pour un signal."
          explainWrong="Rien dans ces deux résultats n’est surprenant : le nuage des séries de 100 s’étale justement de part et d’autre de 50 %. Il faudrait des séries bien plus longues pour soupçonner quoi que ce soit."
          solved={done2} onAnswered={() => setQ2(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Deux séries jamais pareilles" moduleSubtitle="La fluctuation d’échantillonnage" estimatedTime="12 min"
      brief={{
        tag: 'Découverte', title: 'Le même réglage ne donne pas le même résultat', tone: 'violet',
        body: <p>Relancer la même expérience ne redonne pas le même nombre — sinon ce ne serait pas du hasard. Mais cette variabilité obéit à une règle, et tu vas la voir.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Retenu.</strong> Des séries de même taille donnent des fréquences différentes : c’est la{' '}
          <strong>fluctuation d’échantillonnage</strong>. Elle diminue quand n augmente, sans jamais disparaître.
          Module suivant : ce que la loi des grands nombres promet — et les deux choses qu’elle ne promet pas.
        </KnowledgeSnapshot>
      )}
    />
  );
}
