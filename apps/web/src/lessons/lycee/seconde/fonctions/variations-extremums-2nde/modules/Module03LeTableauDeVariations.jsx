import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TrailLab from '../components/TrailLab';
import VariationTable from '../components/VariationTable';
import { TRAIL, TRAIL_RANGE, BOSSE, BOSSE_RANGE, variationTable, curvePieces } from '../components/variationsUtils';

/**
 * Module 3 — DÉCOUVERTE : le tableau de variations.
 * Step 1  construire les flèches du sentier sous la piste peinte (correction flèche par flèche).
 * Step 2  lire un tableau donné (g, sans courbe).  Step 3  retrouver la courbe d'un tableau.
 */
const TRUTH = variationTable(TRAIL).arrows;
const MINI = { range: { xMin: -4, xMax: 4, yMin: -5, yMax: 5 }, unit: 22 };
const CANDIDATES = [
  { id: 'A', fn: (x) => 0.25 * x ** 3 - 3 * x, tone: 'indigo' },
  { id: 'B', fn: (x) => -(0.25 * x ** 3 - 3 * x), tone: 'rose' },
  { id: 'C', fn: (x) => 0.3 * x * x - 3, tone: 'emerald' },
];

export default function Module03LeTableauDeVariations() {
  const [vals, setVals] = useState([null, null, null, null]);
  const [revealed, setRevealed] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const okAll = vals.every((v, i) => v === TRUTH[i]);

  const steps = [
    {
      num: 1, title: 'Construis le tableau du sentier', subtitle: 'Une flèche par tronçon (touche pour basculer ↗ / ↘). Les valeurs aux bornes, sommets et vallées sont déjà lues sur la courbe.', done: revealed,
      content: (kit) => (
        <div className="space-y-3">
          <TrailLab f={TRAIL} range={TRAIL_RANGE} unit={30} unitY={0.35} xStep={0.5} value={3} paintAll showTurns="all" frozen xUnit=" km" yUnit=" m" />
          <VariationTable f={TRAIL} editable={!revealed} values={vals} reveal={revealed} unit=" m"
            onChange={(i, v) => { if (revealed) return; const n = [...vals]; n[i] = v; setVals(n); if (n.every((s) => s !== null)) { setRevealed(true); kit.react(n.every((s, k) => s === TRUTH[k])); } }} />
          {revealed ? (
            <Feedback tone={okAll ? 'ok' : 'ko'}>{okAll ? 'Quatre flèches justes.' : 'Regarde les flèches corrigées.'} Ligne du haut : les bornes (0 et 10) et les points où le sens change (3, 6, 8,5). Ligne du bas : la valeur de h à chacun, et entre deux, une flèche <strong>↗</strong> (croissante) ou <strong>↘</strong> (décroissante). C’est un <strong>tableau de variations</strong> : la piste peinte, en résumé.</Feedback>
          ) : (
            <Feedback tone="info">{vals.filter((v) => v !== null).length} flèche(s) sur 4. Suis la couleur de la piste.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Lire un tableau', done: q2,
      content: (
        <BatchChoiceQuestion intro={<div className="space-y-2"><p className="text-sm text-slate-700">Une fonction g, sur [−4 ; 4], donnée par son tableau seulement :</p><VariationTable f={BOSSE} /></div>}
          rows={[
            { id: 'r1', label: 'g est croissante sur', options: ['[−4 ; −2] et [2 ; 4]', '[−2 ; 2]', '[−4 ; 4]'], correct: 0, correction: 'les flèches ↗' },
            { id: 'r2', label: 'g est décroissante sur', options: ['[−2 ; 2]', '[−4 ; −2]', '[2 ; 4]'], correct: 0, correction: 'la flèche ↘' },
            { id: 'r3', label: 'g(−2) = ?', options: ['4', '−4', '−2'], correct: 0, correction: 'la valeur posée en haut, sous −2' },
            { id: 'r4', label: 'g(0) est compris entre', options: ['−4 et 4', '−4 et 0', '0 et 4'], correct: 0, correction: '0 ∈ [−2 ; 2], où g descend de 4 à −4' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Un tableau donne les intervalles de monotonie, les valeurs aux bornes et aux retournements — et donc un encadrement de g(x) sur chaque intervalle.</Feedback>}
          solved={q2} onAnswered={() => setQ2(true)} />
      ),
    },
    {
      num: 3, title: 'Du tableau à la courbe', done: q3,
      content: (
        <TapQuestion
          above={(
            <div className="space-y-2">
              <VariationTable f={BOSSE} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {CANDIDATES.map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-1 text-center">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">Courbe {c.id}</div>
                    <CoordPlane range={MINI.range} unit={MINI.unit} functions={[{ id: c.id, fn: c.fn, tone: c.tone, samples: 80 }]} caption={false} ariaLabel={`Courbe ${c.id}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
          prompt="Quelle courbe correspond au tableau de g ?"
          options={['Courbe A', 'Courbe B', 'Courbe C', 'Aucune']} correct={0} cols={4}
          explain="↗ jusqu’à −2 (où g = 4), ↘ jusqu’à 2 (où g = −4), puis ↗ : la courbe A. B fait l’inverse (↘ ↗ ↘), C n’a qu’un retournement."
          explainWrong="Suis les flèches : montée jusqu’au point (−2 ; 4), descente jusqu’à (2 ; −4), remontée. Seule la courbe A monte-descend-monte avec ces sommets."
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Le tableau de variations" moduleSubtitle="Des flèches, des valeurs : la courbe en résumé" estimatedTime="10 min"
      brief={{ tag: 'Découverte', title: 'La piste peinte devient un tableau', tone: 'sky', body: <p>Bornes et retournements sur la ligne du haut, valeurs et flèches sur celle du bas. Construis celui du sentier, lis-en un autre, retrouve sa courbe.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3}>Le sommet du sentier, la vallée, le départ tout en bas : module suivant, maximum et minimum — sur un intervalle.</KnowledgeSnapshot>} />
  );
}
