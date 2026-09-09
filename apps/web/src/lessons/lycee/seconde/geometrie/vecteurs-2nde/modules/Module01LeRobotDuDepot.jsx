import React, { useState } from 'react';
import { Bot, Flag } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DisplacementLab from '../components/DisplacementLab';
import {
  SCENES, vec, add, equal, opposite, diagnose, DIAGNOSIS_TEXT, describeMove, formatVec,
} from '../components/vecteurUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : le robot du dépôt.
 *
 * Activity              piloter un robot livreur sur un sol carrelé.
 * Mathematical objective un déplacement se décrit indépendamment de son
 *                       point de départ (direction, sens, longueur) ; deux
 *                       déplacements enchaînés font un seul trajet direct ;
 *                       le retour est le déplacement inverse.
 * Student action        déplacer le robot (glisser, croix directionnelle,
 *                       clavier) ; prédire sans verdict avant chaque essai.
 * Controlled variable   la position d'UN robot à la fois.
 * Mathematical state    départ, position ; la recette dérivée = position − départ.
 * Visual consequence    la flèche départ → robot, la recette en mots.
 * Expected observation  « même recette, autre arrivée » ; « deux ordres = un
 *                       trajet direct » ; « le retour, c'est l'inverse ».
 * Misconception targeted viser la même case d'arrivée que le modèle
 *                       (`diagnose` nomme l'attribut fautif).
 * Formalization         le mot « vecteur » n'apparaît qu'en pied de module,
 *                       comme le nom de la recette. Aucune coordonnée.
 * Transfer              module 2 : la même flèche promenée partout.
 */
const { start, station, start2, chain } = SCENES.depot;
const RECETTE = vec(start, station);          // (3 ; 2)
const ARRIVEE_2 = add(start2, RECETTE);
const MID = add(start, chain[0]);
const END = add(MID, chain[1]);
const TOTAL = add(chain[0], chain[1]);
const ESCAPE_AFTER = 14;

export default function Module01LeRobotDuDepot() {
  // Étape 1 — jusqu'à la station.
  const [p1, setP1] = useState(start);
  const done1 = equal(p1, station);

  // Étape 2 — la même recette depuis ailleurs.
  const [pred2, setPred2] = useState(null);
  const [p2, setP2] = useState(start2);
  const [moves2, setMoves2] = useState(0);
  const r2 = vec(start2, p2);
  const done2 = equal(r2, RECETTE);
  const why2 = diagnose(RECETTE, r2);

  // Étape 3 — deux ordres à la suite.
  const [p3, setP3] = useState(start);
  const [leg, setLeg] = useState(1);
  const [moves3, setMoves3] = useState(0);
  const done3 = leg === 3;

  // Étape 4 — le retour.
  const [pred4, setPred4] = useState(null);
  const [p4, setP4] = useState(station);
  const done4 = equal(p4, start);

  const [q5, setQ5] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Amène le robot à la station',
      subtitle: 'Glisse-le, ou utilise la croix. Observe la recette qui s’écrit sous le sol.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DisplacementLab
            robots={[{ id: 'r1', start, pos: p1 }]}
            activeId="r1"
            station={station}
            onMove={(_, next) => { setP1(next); if (equal(next, station)) kit.react(true); }}
            disabled={done1}
            ariaLabel={`Sol du dépôt — robot en ${formatVec(p1)}, station en ${formatVec(station)}`}
          />
          {done1 ? (
            <Feedback tone="ok">
              Le robot est à la station. Sa recette : <strong>{describeMove(RECETTE)}</strong>. Quel que
              soit le chemin suivi, la recette ne dépend que de la case de départ et de la case
              d’arrivée. Garde-la en tête.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {equal(p1, start)
                ? 'La station est l’anneau ambre. Mets le robot en route.'
                : `Pour l’instant : ${describeMove(vec(start, p1))}. La station est ${describeMove(vec(p1, station))}.`}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Refais le même trajet, en partant d’ailleurs',
      subtitle: 'Un second robot attend en haut à droite. Donne-lui EXACTEMENT la recette du premier.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="Avec la même recette, le second robot arrivera-t-il à la station ?"
            options={[{ id: 'oui', label: 'Oui, à la station' }, { id: 'non', label: 'Non, ailleurs' }, { id: 'depend', label: 'Ça dépend du chemin' }]}
            value={pred2}
            onChange={setPred2}
            disabled={done2}
          />
          <DisplacementLab
            robots={[
              { id: 'r1', start, pos: station, icon: '🤖', color: '#94a3b8' },
              { id: 'r2', start: start2, pos: p2, icon: '🤖' },
            ]}
            activeId="r2"
            station={station}
            model={{ start, vector: RECETTE, name: 'modèle' }}
            onMove={(_, next) => {
              setP2(next);
              setMoves2((n) => n + 1);
              if (equal(vec(start2, next), RECETTE)) kit.react(true);
            }}
            disabled={done2}
            ariaLabel={`Sol du dépôt — second robot en ${formatVec(p2)}, parti de ${formatVec(start2)}`}
          />
          {!done2 && moves2 >= ESCAPE_AFTER && (
            <button type="button" onClick={() => { setP2(ARRIVEE_2); kit.react(true); }}
              className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-indigo-400">
              Je bloque — montre-moi
            </button>
          )}
          {done2 ? (
            <Feedback tone="ok">
              {pred2 === 'non' ? 'Ta prédiction : ailleurs. Exact' : pred2 === 'oui' ? 'Ta prédiction : à la station. Le sol te contredit' : pred2 === 'depend' ? 'Ta prédiction : ça dépend du chemin. Non — seule la recette compte' : 'Regarde'} :
              même recette, <strong>{describeMove(RECETTE)}</strong>, et le second robot arrive en{' '}
              {formatVec(ARRIVEE_2)}, pas à la station. Ce qui est identique, c’est le{' '}
              <strong>trajet</strong> — pas la destination.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {equal(p2, start2)
                ? 'Le modèle est la flèche ambre en pointillé. Reproduis-la depuis la case du second robot.'
                : (DIAGNOSIS_TEXT[why2] ?? 'Continue.')}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Enchaîne deux ordres',
      subtitle: `Ordre 1 : ${describeMove(chain[0])}. Ordre 2 : ${describeMove(chain[1])}. Exécute-les l’un après l’autre.`,
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <DisplacementLab
            robots={[{ id: 'r3', start: leg === 1 ? start : MID, pos: p3 }]}
            activeId="r3"
            station={leg === 1 ? MID : END}
            trail={leg >= 2 ? [{ from: start, to: MID, name: 'ordre 1' }] : []}
            model={leg === 3 ? { start, vector: TOTAL, name: 'trajet direct' } : null}
            onMove={(_, next) => {
              setP3(next);
              setMoves3((n) => n + 1);
              if (leg === 1 && equal(next, MID)) { setLeg(2); kit.react(true); }
              if (leg === 2 && equal(next, END)) { setLeg(3); kit.react(true); }
            }}
            disabled={done3}
            ariaLabel={`Sol du dépôt — robot en ${formatVec(p3)}, ordre ${Math.min(leg, 2)} en cours`}
          />
          {!done3 && moves3 >= ESCAPE_AFTER && (
            <button type="button" onClick={() => { setP3(leg === 1 ? MID : END); setLeg(leg === 1 ? 2 : 3); kit.react(true); }}
              className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-indigo-400">
              Je bloque — montre-moi
            </button>
          )}
          {done3 ? (
            <Feedback tone="ok">
              Deux ordres à la suite, un seul <strong>trajet direct</strong> (la flèche ambre) :{' '}
              {describeMove(chain[0])}, puis {describeMove(chain[1])}, revient à{' '}
              <strong>{describeMove(TOTAL)}</strong>. Retiens l’idée : on y revient au module 4.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {leg === 1
                ? `Ordre 1 : ${describeMove(chain[0])}. Vise l’anneau.`
                : `Ordre 1 exécuté. Ordre 2, depuis la case actuelle : ${describeMove(chain[1])}.`}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Reviens au point de départ',
      subtitle: 'Le robot est à la station. Ramène-le à sa case de départ, et lis la recette du retour.',
      done: done4,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="Quelle recette ramène le robot à son départ ?"
            options={[
              { id: 'inv', label: `${describeMove(opposite(RECETTE))}` },
              { id: 'swap', label: `${describeMove({ x: -RECETTE.y, y: -RECETTE.x })}` },
              { id: 'same', label: `${describeMove(RECETTE)}, encore` },
            ]}
            value={pred4}
            onChange={setPred4}
            disabled={done4}
          />
          <DisplacementLab
            robots={[{ id: 'r4', start: station, pos: p4 }]}
            activeId="r4"
            station={start}
            trail={[{ from: start, to: station, name: 'aller' }]}
            onMove={(_, next) => { setP4(next); if (equal(next, start)) kit.react(true); }}
            disabled={done4}
            ariaLabel={`Sol du dépôt — robot en ${formatVec(p4)}, départ à retrouver en ${formatVec(start)}`}
          />
          {done4 ? (
            <Feedback tone="ok">
              {pred4 === 'inv' ? 'Ta prédiction était la bonne' : pred4 ? 'Ta prédiction ne ramenait pas le robot' : 'Regarde'} :
              le retour, c’est <strong>{describeMove(opposite(RECETTE))}</strong> — même direction, même
              longueur que l’aller, mais le <strong>sens contraire</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">Le départ est l’anneau ambre. L’aller est la flèche grise.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 5,
      title: 'Ce qui définit un trajet',
      done: q5,
      content: (
        <div className="space-y-3">
          {/* Les quatre étapes précédentes viennent de montrer, en le
              pilotant, qu'un déplacement ne dépend ni du départ ni du
              chemin suivi : c'est l'instant où « vecteur » a un sens,
              avant la question qui l'exige. */}
          <KnowledgeBrick
            id="vecteur-deplacement"
            variant="new"
            lead={<>Tu viens de piloter deux robots avec la <strong>même recette</strong> depuis deux cases différentes, et de faire le trajet <strong>retour</strong>. Cette recette porte un nom.</>}
          />
          <KnowledgeBrick
            id="mem-deplacement"
            variant="new"
            compact
            lead={<>Une phrase à retenir pour toute la leçon.</>}
          />
          <TapQuestion
            prompt="Pour dire que deux robots ont fait le MÊME trajet, que faut-il vérifier ?"
            options={[
              'Qu’ils se sont déplacés dans la même direction, dans le même sens, et de la même longueur.',
              'Qu’ils sont arrivés à la même case.',
              'Qu’ils sont partis de la même case.',
              'Qu’ils ont suivi le même chemin case par case.',
            ]}
            correct={0}
            cols={1}
            requires={['vecteur-deplacement']}
            explain="Un trajet se décrit par trois choses : la direction (la droite suivie), le sens (de quel côté on la parcourt) et la longueur. Ni le départ, ni l’arrivée, ni le détour n’en font partie — c’est pour cela que la recette se réutilise partout."
            explainWrong="Tes deux robots sont justement partis d’endroits différents et arrivés à des endroits différents, avec la même recette. Et au premier essai, le chemin suivi n’a rien changé à la recette."
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le robot du dépôt"
      moduleSubtitle="Se déplacer pareil, sans partir du même endroit"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Un robot livreur sur un sol carrelé',
        tone: 'indigo',
        body: (
          <p>
            Dans ce dépôt, on ne dit jamais à un robot <em>où</em> aller : on lui donne une{' '}
            <strong>recette</strong> — tant de cases vers la droite, tant vers le haut. Commence par
            l’amener à la station.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Bot, t: 'Le robot', d: 'Glisse-le sur le sol, ou pilote-le avec la croix.', c: 'text-indigo-600' },
            { icon: Flag, t: 'La station', d: 'L’anneau ambre : la case à atteindre.', c: 'text-amber-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
