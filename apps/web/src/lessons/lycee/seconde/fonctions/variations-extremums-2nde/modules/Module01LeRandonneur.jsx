import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TrailLab from '../components/TrailLab';
import { TRAIL, TRAIL_RANGE, formatDec } from '../components/variationsUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : le randonneur
 * (components/TrailLab.jsx pour le bloc d'activité).
 * Step 1  du départ au sommet (0 → 3 km) : la piste se peint en vert, l'altimètre monte.
 * Step 2  jusqu'au bout (→ 10 km) : vert, rose, vert, rose ; sommets et vallées marqués.
 * Step 3  le point le plus bas est au DÉPART (300 m), pas dans la vallée (380 m).
 * Step 4  « quand x augmente, h(x) diminue » entre 3 et 6.
 * Rien n'est appelé tableau de variations avant le module 3.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   « Croissante » et « décroissante » n'existaient que dans l'« À retenir » du
 *   pied de module — c'est-à-dire APRÈS les deux questions qui les emploient.
 *   L'ordre est maintenant geste → brique → demande :
 *     étape 1  monter de 0 à 3 km, la piste verdit   → brique `variations-sens`
 *     étape 2  parcourir tout le sentier             → briques
 *              `methode-lire-variations-courbe` puis `regle-plus-bas-au-bord`
 *     étape 3  « où est le plus bas ? » — la borne compte, la brique l'a dit
 *     étape 4  « quand x augmente, h(x)… » — les deux sens sont posés
 *
 * MANIPULATION JAMAIS GELÉE. Les deux TrailLab devenaient `disabled` dès
 * l'étape réussie : l'élève ne pouvait plus refaire marcher le randonneur sur
 * le phénomène qu'il venait de comprendre. Ils restent vivants ; seul le
 * verrou d'ANTÉRIORITÉ (`!done1`) demeure à l'étape 2. Les PredictionChips,
 * eux, restent figés après coup : une prédiction s'enregistre une fois.
 */
const PROBE = { f: TRAIL, range: TRAIL_RANGE, unit: 30, unitY: 0.35, xStep: 0.5, yStep: 100, xUnit: ' km', yUnit: ' m' };
const cellsBetween = (a, b) => Array.from({ length: Math.round((b - a) / 0.5) + 1 }, (_, i) => a + i * 0.5);

export default function Module01LeRandonneur() {
  const [x, setX] = useState(0);
  const [visited, setVisited] = useState([0]);
  const [pred, setPred] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const has = (v) => visited.includes(v);
  const done1 = cellsBetween(0, 3).every(has);
  const done2 = done1 && cellsBetween(3, 10).every(has);

  const move = (v, react) => {
    setX(v);
    if (visited.includes(v)) return;
    const n = [...visited, v]; setVisited(n);
    const h = (w) => n.includes(w);
    const d1 = cellsBetween(0, 3).every(h); const d2 = d1 && cellsBetween(3, 10).every(h);
    if (!done1 && d1) react?.(true); else if (done1 && !done2 && d2) react?.(true);
  };

  const steps = [
    {
      num: 1, title: 'Du départ au sommet', subtitle: 'Fais avancer le randonneur du départ (0 km) jusqu’à 3 km, cran par cran. Regarde l’altimètre et la piste sous ses pas.', done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="où sera le point le plus haut de toute la randonnée ?" options={[{ id: '3', label: 'Vers 3 km' }, { id: '8', label: 'Vers 8,5 km' }, { id: '10', label: 'À l’arrivée, 10 km' }]} value={pred} onChange={setPred} disabled={done1} />
          <TrailLab {...PROBE} value={x} visited={visited} onChange={(v) => move(v, kit.react)} />
          {done1 ? (
            <>
              <Feedback tone="ok">De 0 à 3 km, l’altimètre n’a fait que <strong>monter</strong> : 300 m → 620 m, et la piste est verte d’un bout à l’autre. À 3 km, un anneau ambre : un sommet.</Feedback>
              {/* Le geste vient de produire une montée entière : c'est ici que
                  le mot se pose, avant la moindre demande qui l'emploie. */}
              <KnowledgeBrick
                id="variations-sens"
                variant="new"
                lead="Ce que tu viens de faire — avancer et voir l’altimètre monter — porte un nom, et son contraire aussi."
              />
            </>
          ) : (
            <Feedback tone="info">Randonneur à {formatDec(x)} km. Avance jusqu’à 3 km sans sauter de cran.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Jusqu’au bout', subtitle: 'Continue de 3 km à 10 km. Chaque fois que la couleur change, note ce qui s’est passé.', done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <TrailLab {...PROBE} value={x} visited={visited} onChange={(v) => move(v, kit.react)} disabled={!done1} />
          {done2 ? (
            <Feedback tone="ok">
              {pred === '3' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde la piste'} : le plus haut est <strong>620 m, à 3 km</strong> (le sommet de 8,5 km ne fait que 560 m). Quatre tronçons : <strong>vert</strong> de 0 à 3 (ça monte), <strong>rose</strong> de 3 à 6 (ça descend), vert de 6 à 8,5, rose de 8,5 à 10. Les changements se font exactement aux sommets et aux vallées.
            </Feedback>
          ) : (
            <Feedback tone="info">Randonneur à {formatDec(x)} km. Continue jusqu’à 10 km.</Feedback>
          )}
          {done2 && (
            /* Quatre tronçons parcourus à la main : la lecture des variations
               sur une courbe peut être rangée en méthode, puis la borne. */
            <KnowledgeBrick
              id="methode-lire-variations-courbe"
              variant="new"
              lead="Tu viens de lire les variations d’une courbe en marchant dessus. Voici le même travail, sans randonneur."
            />
          )}
          {done2 && (
            <KnowledgeBrick
              id="regle-plus-bas-au-bord"
              variant="new"
              lead="Tu viens de parcourir le sentier de 0 à 10 km. Ce morceau d’axe sur lequel tu regardes porte un nom — et il change la réponse à « où est le plus bas ? »."
            />
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'Le point le plus bas', done: q3,
      content: (
        <TapQuestion prompt="Sur toute la randonnée (de 0 à 10 km), quelle est l’altitude la plus basse atteinte, et où ?"
          options={['300 m, au départ (0 km)', '380 m, dans la vallée (6 km)', '420 m, à l’arrivée (10 km)', '0 m']}
          correct={0} cols={1}
          explain="La vallée de 6 km (380 m) est un creux, mais le départ est encore plus bas : 300 m. Le plus bas peut être au bord de l’intervalle, pas forcément dans un creux — l’altimètre du module l’a affiché : « plus bas : 300 m »."
          explainWrong="Regarde le bandeau « plus bas » : 300 m, atteint au départ. Un creux n’est pas toujours le point le plus bas ; il faut aussi regarder les bords."
          requires={['regle-plus-bas-au-bord', 'methode-lire-variations-courbe', 'intervalle', 'intervalle-crochets']}
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
    {
      num: 4, title: 'Quand x augmente…', done: q4,
      content: (
        <TapQuestion prompt="Entre 3 km et 6 km, quand la distance x augmente, l’altitude h(x)…"
          options={['diminue', 'augmente', 'reste la même', 'devient négative']}
          correct={0} cols={4}
          explain="La piste est rose de 3 à 6 : chaque pas en avant fait baisser l’altimètre. « Descendre » signifie que h(x) diminue quand x augmente — h(x) reste positive (380 m au plus bas)."
          explainWrong="De 3 à 6 km le randonneur descend : à chaque cran vers la droite, l’altimètre baisse. Descendre ne veut pas dire « négatif » : les altitudes restent au-dessus de 0."
          requires={['variations-sens', 'methode-lire-variations-courbe', 'notation-fx']}
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Le randonneur" moduleSubtitle="Un profil de sentier, un altimètre, une piste qui se peint" estimatedTime="10 min"
      brief={{ tag: 'Déclencheur', title: 'Le profil du sentier', tone: 'indigo', body: <p>La courbe donne l’altitude h (en m) selon la distance parcourue x (en km). Fais marcher le randonneur : sous ses pas, la piste se colore — vert quand il monte, rose quand il descend.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1}>Les mots sont posés : h est <strong>croissante</strong> sur [0 ; 3], <strong>décroissante</strong> sur [3 ; 6]. Et la piste peinte a un nom — module 3, le tableau de variations. Avant cela : ce que ces mots veulent dire <em>exactement</em>, avec des inégalités.</KnowledgeSnapshot>} />
  );
}
