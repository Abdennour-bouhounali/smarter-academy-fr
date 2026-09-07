import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FunctionProbe from '../components/FunctionProbe';
import { POOL, POOL_RANGE, antecedentsOf, formatDec } from '../components/fonctionsUtils';

/**
 * Module 6 — MANIPULATION : une fonction définie sur une réunion d'intervalles.
 *
 * Activity               le nombre de nageurs dans la piscine selon l'heure ;
 *                        la piscine est fermée de 12 h à 14 h.
 * Student action         sonder 10 h (une image), puis 13 h (aucune image) ;
 *                        écrire l'ensemble de définition ; lire un tarif par
 *                        morceaux ; compter les antécédents de 50.
 * Expected observation   « à 13 h la sonde ne rencontre rien : 13 n'a pas
 *                        d'image » ; « l'ensemble de définition est en deux
 *                        morceaux » ; « 50 nageurs : quatre fois, dans les deux morceaux ».
 * Misconception targeted « l'ensemble de définition est [8 ; 20] puisque ça
 *                        va de 8 à 20 » ; « entre les deux morceaux, l'image vaut 0 ».
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le symbole ∪ arrivait dans les options de l'étape 2 et n'était expliqué
 *   qu'après la réponse. Il est maintenant posé, avec les crochets, juste
 *   après le geste qui le rend nécessaire :
 *     étape 1  sonder 13 h, ne rien trouver → brique `reunion-intervalles`
 *              (l'ensemble de définition en deux morceaux) puis
 *              `vocab-union-intervalles` (le symbole ∪ et les crochets)
 *     étape 2  écrire D_n — désormais toutes les pièces sont disponibles
 *     étape 3  brique `methode-fonction-par-morceaux` → le tarif
 *     étape 4  compter les antécédents de 50 dans les deux morceaux
 *   Les intervalles eux-mêmes sont un acquis du chapitre « Ensembles et
 *   intervalles » (`priorKnowledge`) : ce que ce module ajoute, c'est leur
 *   RÉUNION comme ensemble de définition.
 *
 * MANIPULATION JAMAIS GELÉE. La sonde restait `disabled` une fois l'étape
 * réussie : l'élève ne pouvait plus rejouer le phénomène qu'il venait de
 * comprendre. Elle reste vivante ; les deux sondes restent vivantes,
 * y compris pour retraverser le trou de l'ensemble de définition.
 */
const PROBE = { f: POOL, range: POOL_RANGE, unit: 300 / 22, unitY: 2.4, xStep: 1, yStep: 10, axisLabels: { x: 'h', y: 'n' }, xUnit: ' h', yUnit: ' nageurs', labelEvery: 2 };
const N50 = antecedentsOf(POOL, 50, POOL_RANGE).length;

export default function Module06UneFonctionEnMorceaux() {
  const [x, setX] = useState(8);
  const [seen10, setSeen10] = useState(false);
  const [seen13, setSeen13] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [mode, setMode] = useState('x');
  const [yv, setYv] = useState(20);
  const [seen50, setSeen50] = useState(false);
  const done1 = seen10 && seen13;

  const steps = [
    {
      num: 1,
      title: 'Sonde 10 h, puis 13 h',
      subtitle: 'Combien de nageurs à 10 h ? Et à 13 h ?',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <FunctionProbe {...PROBE} mode="x" value={x}
            onChange={(v) => { setX(v); if (v === 10 && !seen10) { setSeen10(true); kit.react(true); } if (v > 12 && v < 14 && !seen13) { setSeen13(true); kit.react(true); } }} />
          {done1 ? (
            <>
              <KnowledgeBrick
                id="reunion-intervalles"
                variant="new"
                lead={<>À 10 h : 45 nageurs, n(10) = 45. À 13 h : la sonde ne rencontre <strong>rien</strong> — 13 n’a <strong>pas d’image</strong>, ce qui n’est pas « 0 nageur ». L’ensemble de définition n’est donc plus d’un seul tenant.</>}
              />
              <KnowledgeBrick
                id="vocab-union-intervalles"
                variant="new"
                compact
                lead={<>Pour écrire « ce morceau-ci ou ce morceau-là », il manque un symbole.</>}
              />
            </>
          ) : (
            <Feedback tone="info">{!seen10 ? 'Amène la sonde à 10 h.' : 'Maintenant 13 h.'}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'L’ensemble de définition en deux morceaux',
      done: q2,
      content: (
        <TapQuestion
          prompt="La piscine est ouverte de 8 h à 12 h et de 14 h à 20 h. L’ensemble de définition de n est…"
          requires={['reunion-intervalles', 'vocab-union-intervalles', 'ensemble-definition', 'intervalle', 'intervalle-crochets']}
          options={['[8 ; 12] ∪ [14 ; 20]', '[8 ; 20]', ']12 ; 14[', '[0 ; 22]']}
          correct={0} cols={2}
          explain="Deux intervalles fermés (les heures d’ouverture et de fermeture comptent), réunis par le symbole ∪ (« union »). Entre 12 et 14, aucune image : ces heures n’en font pas partie."
          explainWrong="[8 ; 20] contiendrait 13, qui n’a pas d’image — tu viens de le voir. L’ensemble de définition est la réunion des deux plages d’ouverture : [8 ; 12] ∪ [14 ; 20]."
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Le tarif, par morceaux',
      done: q3,
      content: (
        <div className="space-y-3">
        <KnowledgeBrick
          id="methode-fonction-par-morceaux"
          variant="new"
          lead={<>Une fonction peut même changer de formule d’un morceau à l’autre — c’est le cas de tous les tarifs par paliers.</>}
        />
        <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-700">Le tarif d’entrée T dépend de l’heure d’arrivée x : <strong>3 €</strong> si x ∈ [8 ; 12], <strong>5 €</strong> si x ∈ [14 ; 20].</p>}
          requires={['methode-fonction-par-morceaux', 'reunion-intervalles', 'vocab-union-intervalles', 'ensemble-definition', 'appartient', 'intervalle-crochets']}
          rows={[
            { id: 'r1', label: 'T(9)', options: ['3 €', '5 €', 'pas défini'], correct: 0, correction: '9 ∈ [8 ; 12]' },
            { id: 'r2', label: 'T(15)', options: ['3 €', '5 €', 'pas défini'], correct: 1, correction: '15 ∈ [14 ; 20]' },
            { id: 'r3', label: 'T(13)', options: ['3 €', '5 €', 'pas défini'], correct: 2, correction: '13 ∉ D_T' },
            { id: 'r4', label: 'T(12)', options: ['3 €', '5 €', 'pas défini'], correct: 0, correction: '12 ∈ [8 ; 12] (borne fermée)' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Pour calculer une image, on regarde d’abord <strong>dans quel morceau</strong> se trouve x, puis on applique la formule de ce morceau. Hors des morceaux : pas d’image.
            </Feedback>
          )}
          solved={q3} onAnswered={() => setQ3(true)}
        />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Combien de fois exactement 50 nageurs ?',
      subtitle: 'Passe la sonde en lecture « un n → ses antécédents » et amène-la à 50.',
      done: seen50,
      content: (kit) => (
        <div className="space-y-3">
          <FunctionProbe {...PROBE} mode={mode} onModeChange={setMode} value={mode === 'x' ? x : yv}
            onChange={(v) => { if (mode === 'x') setX(v); else { setYv(v); if (v === 50 && !seen50) { setSeen50(true); kit.react(true); } } }} />
          {seen50 ? (
            <Feedback tone="ok">
              50 nageurs : <strong>{N50} fois</strong> — deux fois le matin, deux fois l’après-midi. Quatre antécédents, répartis sur les deux morceaux de l’ensemble de définition. La sonde horizontale traverse le trou sans rien y trouver.
            </Feedback>
          ) : (
            <Feedback tone="info">{mode === 'x' ? 'Choisis « Un n → ses antécédents ».' : `n = ${formatDec(yv)}. Vise 50.`}</Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="Une fonction en morceaux"
      moduleSubtitle="La piscine ferme entre midi et deux : à 13 h, aucune image"
      estimatedTime="9 min"
      brief={{ tag: 'Manipulation', title: 'Les nageurs de la piscine', tone: 'purple', body: <p>La courbe donne le nombre de nageurs n selon l’heure. La piscine ouvre de 8 h à 12 h, puis de 14 h à 20 h. Sonde-la.</p> }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          Tu as tous les outils. Module suivant : trois situations à modéliser toi-même — une nouvelle feuille, un forfait, une courbe.
        </KnowledgeSnapshot>
      }
    />
  );
}
