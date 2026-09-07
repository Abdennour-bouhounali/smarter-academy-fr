import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MeasureLab, { divisionsFor } from '../components/MeasureLab';
import SamePointLab, { TRUE_VALUES } from '../components/SamePointLab';
import { formatDec, decEquals, roundTo } from '../components/decimalUtils';

/**
 * Module 1 — LABORATOIRE : « La règle qu'on découpe ».
 *
 * Activity: glisser le repère de mesure entre 3 m et 4 m, découvrir qu'il n'y
 *   a que deux réponses possibles, puis donner un coup de ciseaux qui ouvre
 *   l'espace — et un second qui l'ouvre encore.
 * Mathematical objective: entre deux entiers il y a de la place, et cette
 *   place devient nommable en découpant l'unité en dix, puis en cent.
 * Student action: on attrape le repère lui-même et on le déplace ; on donne
 *   le coup de ciseaux. Aucun `+` / `−`, aucune animation subie : l'ancienne
 *   version jouait six scènes animées suivies de huit QCM, l'élève regardait.
 * Mathematical state: `value` (la mesure) et `cuts` (le nombre de coupes) à
 *   l'étape 1 ; `placed` (une position par écriture) à l'étape 2.
 * Expected observation (étape 1) : sans coupe, le repère ne peut se poser que
 *   sur 3 ou sur 4 — deux réponses également fausses pour une planche qui
 *   dépasse clairement 3 m. Une coupe, et 3,7 devient atteignable ; deux, et
 *   3,75 aussi.
 * Controlled surprise (étape 2) : 4,5 et 4,50 tombent au MÊME point de la
 *   ligne, alors que 4,5 et 4,05 sont séparés par presque une demi-unité.
 *   Un zéro ajouté au bout ne change rien ; un zéro glissé juste derrière la
 *   virgule change tout.
 * Misconception targeted: « après 3 vient 4, il n'y a rien entre » (étape 1)
 *   et « plus il y a de chiffres après la virgule, plus le nombre est grand »
 *   (étape 2) — les deux erreurs les plus tenaces de la 6e sur les décimaux.
 * Formalization: seule `entre-deux-entiers` est posée, à l'étape 3. Les mots
 *   « dixième », « centième », « fraction décimale », « valeur de position »
 *   et « écritures équivalentes » restent aux modules 2, 3, 5 et 6
 *   (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: rien ne se fige — on recoupe, on recolle, on redéplace après
 *   la validation de chaque étape.
 * Transfer: le module 2 reprend le geste de coupe sur une bande d'unité pour
 *   nommer la part obtenue ; le module 8 reprend la droite graduée qui se
 *   laisse zoomer.
 */

/* ── Étape 1 — la planche qui dépasse 3 m sans atteindre 4 m. ────────── */
const VRAIE_LONGUEUR = 3.75;

function AtelierMesure({ onDone, done }) {
  const [value, setValue] = useState(3);
  const [cuts, setCuts] = useState(0);
  const [seen, setSeen] = useState([0]);

  const cut = (c) => {
    setCuts(c);
    setSeen((s) => (s.includes(c) ? s : [...s, c]));
    // La mesure se recale sur la nouvelle graduation : le repère ne peut pas
    // rester sur une position que le découpage ne sait plus nommer.
    const stepNow = [1, 0.1, 0.01][Math.min(c, 2)];
    setValue((v) => roundTo(Math.round(v / stepNow) * stepNow, 4));
  };

  const exact = decEquals(value, VRAIE_LONGUEUR);
  React.useEffect(() => {
    if (!done && exact && cuts === 2) onDone();
  }, [done, exact, cuts, onDone]);

  return (
    <div className="space-y-3">
      <MeasureLab
        value={value}
        onValue={setValue}
        cuts={cuts}
        onCut={cut}
        min={3}
        max={4}
        unit="m"
        objectLabel="La planche"
      />

      <div className="rounded-xl border-2 border-slate-900 bg-slate-900 text-white px-4 py-3 text-sm">
        Le menuisier a besoin de la longueur <strong className="text-amber-300">exacte</strong>.
        Amène le repère au bout de la planche bleue.
      </div>

      {/* Le retour décrit ce que la coupe rend POSSIBLE : il ne donne jamais
          la réponse, et il ne nomme jamais la part obtenue. */}
      <Feedback tone={exact && cuts === 2 ? 'ok' : 'info'}>
        {cuts === 0 && (
          <>
            La règle n'est pas coupée : le repère ne peut se poser que sur{' '}
            <strong className="font-mono">3</strong> ou sur <strong className="font-mono">4</strong>.
            L'un est trop court, l'autre trop long — et il n'y a rien d'autre à dire.
          </>
        )}
        {cuts === 1 && !exact && (
          <>
            Avec {divisionsFor(1)} parts, tu peux dire{' '}
            <strong className="font-mono">{formatDec(value)}</strong>. C'est déjà bien plus précis
            qu'« entre 3 et 4 » — mais le bout de la planche tombe encore entre deux traits.
          </>
        )}
        {cuts === 2 && !exact && (
          <>
            {divisionsFor(2)} parts : le repère se pose maintenant sur{' '}
            <strong className="font-mono">{formatDec(value)}</strong>. Continue de le glisser
            jusqu'au bout exact de la planche.
          </>
        )}
        {exact && cuts === 2 && (
          <>
            <strong className="font-mono">{formatDec(VRAIE_LONGUEUR)} m</strong>. Cette longueur
            existait depuis le début — c'est la règle qui n'était pas assez fine pour la nommer.
          </>
        )}
        {exact && cuts < 2 && (
          <>Tu es sur un trait de graduation. Coupe encore pour voir s'il y a plus précis.</>
        )}
      </Feedback>

      <p className="text-xs text-slate-500">
        Découpages essayés : <strong className="font-mono">{seen.length}</strong> / 3
      </p>
    </div>
  );
}

/* ── Étape 2 — trois écritures, une seule ligne. ─────────────────────── */
const DEPART_PLACED = { '4,5': 4, '4,50': 4, '4,05': 4 };

function AtelierEcritures({ onDone, done }) {
  const [placed, setPlaced] = useState(DEPART_PLACED);

  const place = (label, v) => {
    const next = { ...placed, [label]: v };
    setPlaced(next);
    const allRight = Object.keys(TRUE_VALUES).every((l) => decEquals(next[l], TRUE_VALUES[l]));
    if (!done && allRight) onDone();
  };

  const together = decEquals(placed['4,5'], placed['4,50']);
  const gap = roundTo(Math.abs(placed['4,5'] - placed['4,05']), 3);

  return (
    <div className="space-y-3">
      <SamePointLab placed={placed} onPlace={place} min={4} max={5} step={0.01} />

      <button
        type="button"
        onClick={() => setPlaced(DEPART_PLACED)}
        className="min-h-[44px] px-4 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Tout ramener à 4
      </button>

      <Feedback tone={together ? 'ok' : 'info'}>
        {together ? (
          <>
            <strong className="font-mono">4,5</strong> et <strong className="font-mono">4,50</strong>{' '}
            se sont posées au même endroit : une seule pastille pour deux étiquettes.
            {gap > 0.3 && (
              <>
                {' '}Et <strong className="font-mono">4,05</strong> est à{' '}
                <strong className="font-mono">{formatDec(gap)}</strong> de là — pourtant elle ne
                diffère que par un zéro déplacé.
              </>
            )}
          </>
        ) : (
          <>
            Glisse chaque étiquette à l'endroit dont elle parle. Regarde si deux d'entre elles
            finissent par se rejoindre.
          </>
        )}
      </Feedback>
    </div>
  );
}

export default function Module01Mission() {
  const [s1, setS1] = useState(false);
  const [pred, setPred] = useState(null);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Atelier : la règle qu’on découpe"
      moduleSubtitle="Une planche qui dépasse 3 m sans atteindre 4 m. Trouve sa longueur exacte."
      estimatedTime="8 min"
      brief={{
        tag: '📐 Mission 01',
        title: 'La planche fait plus de 3 m et moins de 4 m.',
        tone: 'slate',
        body: (
          <>
            <p>
              Le menuisier a besoin de la longueur <strong className="text-white">exacte</strong>.
              Sa règle n'a que deux traits : 3 et 4.
            </p>
            <p className="text-xs">
              Attrape le repère, glisse-le. Si tu n'y arrives pas, prends les ciseaux.
            </p>
          </>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Mesure la planche',
          subtitle: 'Le repère se déplace sous ton doigt : rien à valider.',
          done: s1,
          content: (kit) => (
            <div className="space-y-4">
              <AtelierMesure
                done={s1}
                onDone={() => { setS1(true); kit.react?.(true); }}
              />
              {s1 && (
                <Feedback tone="ok">
                  Il a fallu <strong>couper</strong> l'espace entre 3 et 4 pour pouvoir dire cette
                  longueur. Les entiers ne manquaient pas de place : c'est nous qui n'avions pas de
                  nom pour ce qui se trouve entre eux.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Trois étiquettes sur une même ligne',
          subtitle: 'Pose chacune là où tu crois qu’elle parle.',
          done: s2,
          content: (kit) => (
            <div className="space-y-4">
              <PredictionChips
                prompt="parmi 4,5 · 4,50 · 4,05, tu penses que…"
                options={[
                  { id: 'toutes', label: 'les trois sont différentes' },
                  { id: 'deux', label: 'deux sont au même endroit' },
                  { id: 'egales', label: 'les trois sont au même endroit' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={s2}
              />
              <AtelierEcritures
                done={s2}
                onDone={() => { setS2(true); kit.react?.(true); }}
              />
              {s2 && (
                <Feedback tone="ok">
                  {pred === 'deux' ? 'Ta prédiction tenait : ' : pred ? 'Ta prédiction annonçait autre chose : ' : ''}
                  <strong className="font-mono">4,5</strong> et <strong className="font-mono">4,50</strong>{' '}
                  sont deux façons d'écrire la même position, mais{' '}
                  <strong className="font-mono">4,05</strong> en désigne une tout autre. Compter les
                  chiffres après la virgule ne dit donc rien de la taille du nombre.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Ce que tu viens de découvrir',
          done: s3,
          content: (
            <div className="space-y-4">
              {/* Question déclencheur : elle se répond avec le seul geste de
                  l'étape 1 (la règle non coupée n'offre que 3 et 4), sans
                  aucun acquis de la leçon — d'où `requires={[]}`. */}
              <TapQuestion
                prompt="Pourquoi la règle non coupée ne permettait-elle pas de donner la longueur de la planche ?"
                options={[
                  'Parce que la planche était trop longue pour la règle',
                  "Parce qu'elle ne proposait que 3 et 4, et rien entre les deux",
                  'Parce que la planche mesurait exactement 4 m',
                  'Parce que le repère était cassé',
                ]}
                correct={1}
                cols={1}
                requires={[]}
                explain={
                  <>
                    La planche dépassait 3 sans atteindre 4 : sa longueur se trouvait{' '}
                    <strong>entre</strong> les deux traits. Tant que l'espace entre 3 et 4 n'était pas
                    coupé, aucun nombre ne pouvait la désigner — et pourtant elle existait.
                  </>
                }
                explainWrong={
                  <>
                    Souviens-toi de la règle avant le coup de ciseaux : le repère ne pouvait se poser
                    que sur 3 ou sur 4. Le bout de la planche, lui, tombait entre les deux.
                  </>
                }
                onAnswered={() => setS3(true)}
              />
              {s3 && (
                <KnowledgeBrick
                  id="entre-deux-entiers"
                  variant="new"
                  lead="Voilà ce que ton coup de ciseaux vient d'ouvrir, en une phrase."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu as coupé l'espace entre deux entiers sans nommer les parts
          obtenues. Au module suivant, tu prends les ciseaux sur l'unité elle-même — et chaque part
          reçoit son nom.
        </KnowledgeSnapshot>
      }
    />
  );
}
