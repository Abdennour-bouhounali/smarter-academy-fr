import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ShapeLab from '../components/ShapeLab';
import {
  classifyQuad, shapeName, sideLengths, interiorAngles,
} from '../components/figuresUtils';

/**
 * Module 3 — MANIPULATION, et l'interaction SIGNATURE de la leçon.
 *
 * ACTION          l'élève déplace un sommet du carré.
 * TRANSFORMATION  les voyants de propriété s'éteignent un à un, et le nom
 *                 affiché change tout seul : carré → rectangle → quadrilatère.
 * SENS MATH.      le nom d'une figure est la CONSÉQUENCE de ses propriétés.
 * FEEDBACK        chaque propriété est cochée séparément : l'élève voit
 *                 LAQUELLE il vient de casser.
 * GÉNÉRALISATION  carré = losange + rectangle ; retirer une propriété fait
 *                 remonter d'un cran dans la famille.
 *
 * Misconception visée : croire que « carré » et « rectangle » s'excluent.
 * L'étape 3 montre qu'un carré EST un rectangle — un rectangle particulier.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 300, yMax: 230 };
const CARRE = [{ x: 85, y: 45 }, { x: 215, y: 45 }, { x: 215, y: 175 }, { x: 85, y: 175 }];

/**
 * Les missions. Deux garde-fous, appris d'un vrai défaut :
 *
 * 1. `axisLock` — sans contrainte d'axe, allonger un rectangle à la souris
 *    est quasi impossible : le moindre décalage vertical casse les angles
 *    droits. La mission 1 fige donc y, la mission 2 libère les deux axes.
 *
 * 2. `minProgress` — le simple passage par un état transitoire ne doit PAS
 *    valider la mission. Tant que la figure n'a pas assez bougé depuis le
 *    carré de départ, on refuse la réussite, même si `classifyQuad` renvoie
 *    déjà la cible. (C'est le bug constaté : en s'écartant du carré, la
 *    figure traverse « rectangle » avant que l'élève ait rien construit.)
 */
const MISSIONS = [
  {
    id: 'm1',
    target: 'rectangle',
    axisLock: 'x',
    // A(0) et D(3) portent le côté gauche : ils coulissent ensemble, sinon
    // bouger A seul casserait les angles droits au lieu d'allonger la figure.
    linkedPairs: [[0, 3], [1, 2]],
    // Un rectangle doit être franchement allongé : au moins 25 px d'écart
    // entre un côté et son voisin, bien au-delà de la tolérance de 4 %.
    minGap: 25,
    // Consigne formulée en geste : le nom « rectangle » est ce que la
    // manipulation va faire APPARAÎTRE, il ne peut pas être la consigne.
    label: 'Allonge cette figure : garde ses quatre coins droits, mais fais que ses côtés ne soient plus tous égaux.',
    hint: 'Les sommets ne coulissent qu’horizontalement : tire A ou D vers la gauche pour allonger la figure.',
  },
  {
    id: 'm2',
    target: 'quadrilatere',
    axisLock: null,
    linkedPairs: [],
    minGap: 0,
    // Un quadrilatère quelconque s'obtient dès 8 px de décalage — mais à ce
    // stade la figure ressemble encore à un rectangle et l'élève n'a rien
    // VU se passer. On exige donc un angle franchement cassé : au moins 20°
    // d'écart avec l'angle droit, soit une déformation visible à l'œil.
    minAngleBreak: 20,
    showAngles: true,
    label: 'Casse maintenant les coins droits : plus aucun angle ne doit valoir 90°.',
    hint: 'Prends le sommet C ou D et tire-le franchement en diagonale : regarde les angles s’éloigner de 90°.',
  },
];

/**
 * La figure est-elle FRANCHEMENT la cible ? On exige, en plus du bon nom, un
 * écart minimal entre deux côtés voisins — sinon un « rectangle » d'un pixel
 * plus long qu'un carré validerait la mission sans rien démontrer.
 */
function reallyReached(pts, mission) {
  if (classifyQuad(pts) !== mission.target) return false;
  if (mission.minGap) {
    const L = sideLengths(pts);
    if (Math.abs(L[0] - L[1]) < mission.minGap) return false;
  }
  if (mission.minAngleBreak && maxAngleBreak(pts) < mission.minAngleBreak) return false;
  return true;
}

/** De combien de degrés l'angle le plus « cassé » s'écarte-t-il de 90° ? */
function maxAngleBreak(pts) {
  return Math.max(...interiorAngles(pts).map((a) => Math.abs(a - 90)));
}

/**
 * Compteur d'angles droits + jauge de « cassure ».
 *
 * ACTION          l'élève tire un sommet en diagonale.
 * TRANSFORMATION  les marques d'angle droit disparaissent une à une, et la
 *                 jauge montre de combien de degrés on s'éloigne de 90°.
 * SENS MATH.      un angle droit est une valeur EXACTE : dès qu'on s'en
 *                 écarte, la propriété est perdue — il n'y a pas de
 *                 « presque droit ».
 *
 * C'est ce retour en direct qui manquait : sans lui, l'élève validait la
 * mission sans avoir rien vu changer.
 */
function AngleBreakGauge({ pts, target }) {
  const angles = interiorAngles(pts);
  const droits = angles.filter((a) => Math.abs(a - 90) <= 2.5).length;
  const cassure = Math.max(...angles.map((a) => Math.abs(a - 90)));
  const pct = Math.min(100, Math.round((cassure / target) * 100));
  const atteint = cassure >= target;

  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs font-mono uppercase tracking-wide text-slate-500">
          Angles droits restants
        </span>
        <div className="flex gap-1.5" role="group" aria-label={`${droits} angles droits sur 4`}>
          {angles.map((a, i) => {
            const droit = Math.abs(a - 90) <= 2.5;
            return (
              <span
                key={i}
                className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center font-mono text-[11px] font-bold tabular-nums ${
                  droit
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-400 line-through'
                }`}
                title={`Angle ${'ABCD'[i]} : ${Math.round(a)}°`}
              >
                {Math.round(a)}°
              </span>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-500">Écart au plus grand angle</span>
          <span className={`font-mono font-bold tabular-nums ${atteint ? 'text-emerald-700' : 'text-slate-600'}`}>
            {Math.round(cassure)}° / {target}°
          </span>
        </div>
        <div
          className="h-2.5 rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Déformation : ${Math.round(cassure)} degrés sur ${target} attendus`}
        >
          <div
            className={`h-full transition-all duration-200 ${atteint ? 'bg-emerald-500' : 'bg-amber-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500" aria-live="polite">
          {droits === 4
            ? 'Les 4 angles valent encore 90° : la figure reste un rectangle.'
            : atteint
            ? '✓ Les angles sont franchement cassés — plus aucun n’est droit.'
            : `Encore ${Math.max(0, Math.ceil(target - cassure))}° : continue de tirer le sommet.`}
        </p>
      </div>
    </div>
  );
}

function Mission({ mission, done, onDone, react }) {
  const [pts, setPts] = useState(CARRE);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const kind = classifyQuad(pts);
  const reached = reallyReached(pts, mission);

  /* La figure reste déformable APRÈS la réussite (règle projet du
     2026-09-06) : c'est en continuant à tirer le sommet que l'élève voit
     ce qui reste vrai et ce qui se brise. Seule la COMPLÉTION cesse d'être
     re-déclenchée ; le geste, lui, ne se ferme jamais. */
  const handle = (next) => {
    setPts(next);
    if (!done && !revealed && reallyReached(next, mission)) {
      react(true);
      onDone();
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
        {mission.label}
      </div>

      <ShapeLab
        points={pts}
        onPointsChange={handle}
        box={BOX}
        showLengths
        showAngles={mission.showAngles}
        axisLock={mission.axisLock}
        linkedPairs={mission.linkedPairs}
        ariaLabel={`Quadrilatère à déformer — actuellement : ${shapeName(pts)}`}
      />

      {mission.minAngleBreak && (
        <AngleBreakGauge pts={pts} target={mission.minAngleBreak} />
      )}

      {!done && !revealed && !reached && (
        <div className="space-y-2">
          <Feedback tone="info">
            Pour l’instant, c’est un <strong>{shapeName(pts)}</strong>.
            {mission.minAngleBreak && classifyQuad(pts) === mission.target ? (
              <> La figure n’a plus de nom remarquable, mais la déformation reste trop discrète pour qu’on
                le voie : accentue-la.</>
            ) : (
              <> Continue de déplacer un sommet.</>
            )}
            {tries >= 1 && <> {mission.hint}</>}
          </Feedback>
          <button
            type="button"
            onClick={() => setTries((t) => t + 1)}
            className="min-h-[44px] inline-flex items-center px-1 text-xs font-mono text-slate-500 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            Un indice ?
          </button>
        </div>
      )}

      {(done || revealed) && (
        <Feedback tone={revealed ? 'info' : reached ? 'ok' : 'info'}>
          {revealed && <strong>Pas grave, on te le montre. </strong>}
          {mission.minAngleBreak ? (
            <>
              Les angles droits ont disparu : la figure perd <strong>toutes</strong> ses propriétés
              remarquables. Il ne reste qu’un quadrilatère quelconque — quatre côtés, et rien de plus
              à en dire.
            </>
          ) : (
            <>
              Le nom change tout seul, parce que les <strong>propriétés</strong> changent — pas parce
              qu’on rebaptise la figure.
            </>
          )}{' '}
          {/* La figure reste manipulable : le verdict cite donc ce qu'elle est
              MAINTENANT, jamais l'instant de la réussite. */}
          Continue à tirer un sommet : c’est en ce moment un{' '}
          <strong>{shapeName(pts)}</strong>.
        </Feedback>
      )}

      {tries >= 3 && !done && !revealed && (
        <button
          type="button"
          onClick={() => { setRevealed(true); onDone(); }}
          className="w-full min-h-[44px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold text-sm hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Eye className="w-4 h-4 inline mr-1.5" aria-hidden="true" />
          Je ne trouve pas — montre-moi
        </button>
      )}
    </div>
  );
}

export default function Module03LaboQuadrilateres() {
  const [done, setDone] = useState([]);
  const [famDone, setFamDone] = useState(false);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le laboratoire des quadrilatères"
      moduleSubtitle="Déforme la figure : regarde quelles propriétés survivent."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Tire sur un sommet, et lis le nom qui change.',
        body: (
          <p>
            Sous la figure, chaque propriété a son voyant. Le nom affiché est <strong>calculé</strong> à
            partir de ces voyants — jamais posé à la main.
          </p>
        ),
      }}
      steps={[
        // ÉTAPES LITTÉRALES (et non un .map) : l'audit des dépendances de
        // connaissances ne lit que le tableau `steps` littéral, si bien qu'une
        // brique posée dans un callback lui serait invisible — donc non
        // contractuelle (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
        {
          num: 1,
          // Titre neutre : le nom obtenu est ce que la manipulation révèle.
          title: 'Mission 1 — allonge la figure',
          done: done.includes(MISSIONS[0].id),
          content: (kit) => (
            <div className="space-y-5">
              <Mission
                mission={MISSIONS[0]}
                done={done.includes(MISSIONS[0].id)}
                onDone={() => mark(MISSIONS[0].id)}
                react={kit.react}
              />
              {done.includes(MISSIONS[0].id) && (
                <>
                  <KnowledgeBrick
                    id="rectangle"
                    variant="new"
                    lead="Les quatre coins sont restés droits pendant que tu allongeais : la figure obtenue a un nom."
                  />
                  <KnowledgeBrick
                    id="losange"
                    variant="new"
                    lead="En égalisant les quatre côtés au lieu de les différencier, tu aurais obtenu l’autre figure remarquable."
                  />
                  <KnowledgeBrick
                    id="carre"
                    variant="new"
                    lead="Et la figure de départ, elle, cochait les deux voyants à la fois."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Mission 2 — casse les coins droits',
          done: done.includes(MISSIONS[1].id),
          content: (kit) => (
            <Mission
              mission={MISSIONS[1]}
              done={done.includes(MISSIONS[1].id)}
              onDone={() => mark(MISSIONS[1].id)}
              react={kit.react}
            />
          ),
        },
        {
          num: 3,
          // Titre neutre : il ne doit pas suggérer la réponse avant l'ouverture.
          title: 'Deux noms pour une même figure ?',
          done: famDone,
          content: (
            <div className="space-y-5">
              <KnowledgeBrick
                id="famille-quadrilateres"
                variant="new"
                lead="En cassant une propriété, tu as fait remonter la figure d’un cran dans sa famille. L’inverse se lit aussi."
              />
              <TapQuestion
                requires={['famille-quadrilateres', 'carre', 'rectangle']}
                above={
                <ShapeLab
                  points={CARRE} box={BOX} draggable={false}
                  ariaLabel="Un carré, avec ses quatre propriétés vérifiées"
                />
              }
              prompt="Un rectangle est un quadrilatère à 4 angles droits. Un carré en a 4. Alors, un carré est-il un rectangle ?"
              options={[
                'Oui : c’est un rectangle qui a en plus ses 4 côtés égaux',
                'Non : un carré et un rectangle sont deux figures différentes',
                'Seulement si on le tourne',
              ]}
              correct={0}
              cols={1}
              explain="Le carré vérifie toutes les propriétés du rectangle, et une de plus. C’est donc un rectangle particulier — et aussi un losange particulier."
                explainWrong="Regarde les voyants : le carré coche « 4 angles droits », qui est LA propriété du rectangle. Il la vérifie, donc c’en est un — avec une propriété supplémentaire."
                solved={famDone}
                onAnswered={() => setFamDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Même méthode, trois côtés au lieu de quatre : la famille des
          triangles.
        </KnowledgeSnapshot>
      }
    />
  );
}
