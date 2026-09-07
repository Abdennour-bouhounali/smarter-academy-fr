import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BoxLab from '../components/BoxLab';
import PredictionChips from '../components/PredictionChips';
import { boxVolume, bestBoxOnGrid, formatDec } from '../components/fonctionsUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : la boîte.
 * (Le bloc d'activité complet est dans components/BoxLab.jsx.)
 *
 * Trois étapes révèlent trois registres — la situation, le tableau, les
 * points — et une question ferme le module sur les découpes possibles.
 * La formule attend le module 3.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Le mot « fonction » vivait jusqu'ici dans le pied de module, c'est-à-dire
 *   APRÈS toutes les questions. Il est maintenant posé par une brique à
 *   l'instant où le geste vient de lui donner un sens :
 *     étape 1  trois boîtes enregistrées  → brique `fonction-dependance`
 *     étape 2  le volume monte et redescend → brique `mem-un-x-une-valeur`
 *     étape 3  chaque boîte devient un point → brique `vocab-variable`
 *   L'élève de 3e connaît déjà le mot « fonction » (priorKnowledge) : ce que
 *   la brique établit ici, c'est la LECTURE en dépendance de grandeurs, celle
 *   dont vivra tout le reste de la leçon.
 */
const BEST = bestBoxOnGrid(0.5);
const ESCAPE_AFTER = 8;

export default function Module01LaBoite() {
  const [x, setX] = useState(2);
  const [records, setRecords] = useState([]);
  const [pred1, setPred1] = useState(null);
  const [q4, setQ4] = useState(false);

  const done1 = records.length >= 3;
  const done2 = records.some((r) => r.v > 580);
  const done3 = records.length >= 6;
  const bigCount = records.length;

  const record = (react, forced = null) => {
    const rx = forced ?? x;
    if (records.some((r) => r.x === rx)) return;
    const next = [...records, { x: rx, v: boxVolume(rx) }];
    setRecords(next);
    const wasDone1 = done1; const wasDone2 = done2; const wasDone3 = done3;
    if (!wasDone1 && next.length >= 3) react?.(true);
    else if (wasDone1 && !wasDone2 && next.some((r) => r.v > 580)) react?.(true);
    else if (wasDone2 && !wasDone3 && next.length >= 6) react?.(true);
  };

  const lab = (kit, opts) => (
    <BoxLab x={x} onChange={setX} records={records} onRecord={() => record(kit.react)} {...opts} />
  );
  const escape = (kit) => (
    <button type="button" onClick={() => { setX(BEST.x); record(kit.react, BEST.x); }}
      className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      Je bloque — montre-moi la plus grande
    </button>
  );

  const steps = [
    {
      num: 1,
      title: 'Fabrique des boîtes',
      subtitle: 'Règle la découpe x, regarde la boîte et son volume. Enregistre au moins trois boîtes différentes.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="pour quelle découpe la boîte aura-t-elle le plus grand volume ?"
            options={[{ id: 'moitie', label: 'x = 5 (la moitié)' }, { id: 'petit', label: 'Une petite découpe, vers 1' }, { id: 'trois', label: 'Vers 3' }, { id: 'dix', label: 'x = 10' }]}
            value={pred1} onChange={setPred1} disabled={done1} />
          {lab(kit, { disabled: done1 })}
          {done1 ? (
            <KnowledgeBrick
              id="fonction-dependance"
              variant="new"
              lead={<>Tu l’as peut-être remarqué en essayant d’enregistrer deux fois la même découpe : <strong>une découpe donne un volume, toujours le même</strong>. Choisir x, c’est fixer le volume — et rien d’autre n’a été choisi.</>}
            />
          ) : (
            <Feedback tone="info">{bigCount === 0 ? 'Bouge la glissière : le patron, la boîte et le volume suivent. Puis « Enregistrer ».' : `${bigCount} boîte${bigCount > 1 ? 's' : ''} enregistrée${bigCount > 1 ? 's' : ''}. Encore ${3 - bigCount}, avec d’autres découpes.`}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Trouve la plus grande boîte',
      subtitle: 'Le tableau garde tes boîtes. Enregistre-en d’autres jusqu’à dépasser 580 cm³.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          {lab(kit, { showTable: true, disabled: done2 || !done1 })}
          {!done2 && done1 && records.length >= ESCAPE_AFTER && escape(kit)}
          {done2 ? (
            <KnowledgeBrick
              id="mem-un-x-une-valeur"
              variant="new"
              compact
              lead={<>
                {pred1 === 'trois' ? 'Ta prédiction tenait' : pred1 === 'moitie' ? 'Ta prédiction : la moitié. Pourtant x = 5 ne donne que 500 cm³' : pred1 === 'petit' ? 'Ta prédiction : une petite découpe. Une boîte plate contient peu' : pred1 === 'dix' ? 'Ta prédiction : x = 10. Il ne reste plus de fond' : 'Regarde le tableau'} :
                la plus grande boîte de la grille est à <strong>x = {formatDec(BEST.x)} cm</strong>, V = {formatDec(BEST.v)} cm³. Le volume <strong>monte puis redescend</strong> quand x grandit — et pourtant chaque ligne du tableau ne porte qu’un seul volume.
              </>}
            />
          ) : (
            <Feedback tone="info">Meilleure boîte pour l’instant : {records.length ? `${formatDec(Math.max(...records.map((r) => r.v)))} cm³` : '—'}. Essaie des découpes plus petites, plus grandes, entre deux.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Les boîtes sur un repère',
      subtitle: 'Chaque boîte devient un point : x en abscisse, V en ordonnée. Enregistre jusqu’à six boîtes.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          {lab(kit, { showTable: true, showGraph: true, showCurve: done3, disabled: done3 || !done2 })}
          {done3 ? (
            <KnowledgeBrick
              id="vocab-variable"
              variant="new"
              compact
              lead={<>Six points, et une <strong>courbe</strong> passe par tous — elle contient toutes les boîtes possibles, même celles que tu n’as pas fabriquées. Un point par découpe, jamais deux points l’un au-dessus de l’autre. Ce nombre x que tu règles à la glissière porte un nom.</>}
            />
          ) : (
            <Feedback tone="info">{records.length} point{records.length > 1 ? 's' : ''} sur le repère. Le trait pointillé indique la découpe réglée. Encore {6 - records.length} à enregistrer.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Pour quelles découpes existe-t-il une boîte ?',
      done: q4,
      content: (
        <TapQuestion
          prompt="Tu as vu qu’à x = 0 et à x = 10 il n’y a pas de boîte. Les découpes possibles sont donc…"
          options={['les x strictement compris entre 0 et 10', 'tous les x de 0 à 10, bornes comprises', 'tous les x positifs', 'tous les x de 0 à 20']}
          correct={0} cols={1}
          requires={['fonction-dependance', 'vocab-variable', 'intervalle', 'intervalle-crochets']}
          explain="À x = 0 rien n’est découpé (hauteur nulle), à x = 10 tout le fond a disparu, et au-delà de 10 la découpe dépasse la feuille. La boîte existe pour 0 < x < 10 — et pour chacun de ces x, un volume et un seul."
          explainWrong="Reprends la glissière : à 0 comme à 10, le bandeau dit « pas de boîte ». Les bornes sont exclues, et au-delà de 10 il n’y a plus de feuille à plier. Reste : 0 < x < 10."
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="La boîte"
      moduleSubtitle="Une feuille, quatre coins découpés, un volume — qui dépend de quoi ?"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur', title: 'Une feuille carrée de 20 cm', tone: 'indigo',
        body: <p>On découpe un carré de côté <strong>x</strong> à chaque coin, on plie les bords : une boîte sans couvercle. Quelle découpe donne la plus grande boîte ? Fabrique-les.</p>,
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          Le volume est <em>fonction</em> de la découpe : tu l’as fabriqué, puis nommé. Module suivant : les mots pour interroger la courbe dans les deux sens.
        </KnowledgeSnapshot>
      }
    />
  );
}
