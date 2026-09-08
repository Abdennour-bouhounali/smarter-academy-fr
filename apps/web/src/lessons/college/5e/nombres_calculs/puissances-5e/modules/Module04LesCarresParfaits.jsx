import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  CARRES_PARFAITS, estCarreParfait, coteDuCarre, aireCarre, ecrirePuissance, parseEntier,
} from '../components/puissances';

/**
 * Module 4 — MANIPULATION : reconnaître les carrés parfaits de 0 à 12.
 *
 * Activity              trier des nombres en « forme un carré plein » ou non,
 *                       en essayant de les ranger en carré.
 * Mathematical objective un carré parfait est un nombre de cases qui forme
 *                       exactement un carré — sans trou ni reste.
 * Student action        choisir un nombre et voir s'il se range en carré.
 * Visual consequence    la grille se remplit ; si le nombre n'est pas un carré
 *                       parfait, la dernière rangée reste trouée.
 * Expected observation  « ces treize nombres reviennent tout le temps ».
 * Misconception targeted croire que tout nombre pair, ou tout grand nombre,
 *                       est un carré parfait.
 *
 * PÉRIMÈTRE : on RECONNAÎT les carrés parfaits ; on ne parle jamais de racine
 * carrée, qui est un objet de 3e (lesson.config.js § exclude).
 */
const CANDIDATS = [16, 20, 36, 50, 64, 81, 100, 110, 121, 144];

/** La grille d'essai — DOM en flux, aucune coordonnée : rien ne se chevauche. */
function GrilleCarre({ x }) {
  const cote = coteDuCarre(x);
  const parfait = cote !== null;
  /**
   * Quand le nombre N'EST PAS un carré parfait, on veut que l'élève VOIE un
   * carré manqué : on prend donc le côté du plus grand carré parfait inférieur,
   * PLUS UN. La grille compte alors plus de cases que le nombre n'en fournit,
   * et la dernière rangée reste visiblement trouée.
   *
   * Le piège que ce choix évite : prendre `floor(sqrt(x))` tout court donne
   * parfois un rectangle PLEIN (20 rangé en 4 × 5 ne laisse aucun trou), ce
   * qui contredirait le verdict affiché juste en dessous. Un schéma ne
   * contredit jamais la leçon (INTERACTION_PEDAGOGY §17bis).
   */
  const largeur = parfait ? cote : Math.floor(Math.sqrt(x)) + 1;
  // On dessine TOUJOURS le carré visé (largeur × largeur) et on n'en remplit
  // que `x` cases. Quand x n'est pas un carré parfait, les cases manquantes
  // sautent aux yeux — alors qu'un simple `ceil(x / largeur)` rangées aurait
  // pu donner un rectangle plein (20 en 4 × 5), sans aucun trou à voir.
  const lignes = largeur;
  const px = Math.max(9, Math.round(150 / Math.max(largeur, 1)));

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto flex justify-center">
        <div
          className="grid gap-[2px] w-max"
          style={{ gridTemplateColumns: `repeat(${largeur}, ${px}px)` }}
          role="img"
          aria-label={parfait ? `${x} cases forment un carré de côté ${cote}` : `${x} cases ne forment pas un carré plein`}
        >
          {Array.from({ length: lignes * largeur }, (_, i) => (
            <div
              key={i}
              style={{ width: px, height: px }}
              className={[
                'rounded-[2px]',
                i < x
                  ? parfait ? 'bg-sky-500' : 'bg-slate-400'
                  : 'bg-slate-100 border border-dashed border-slate-300',
              ].join(' ')}
            />
          ))}
        </div>
      </div>
      <div
        className={[
          'rounded-xl border-2 px-3 py-2 text-center text-sm',
          parfait ? 'border-sky-300 bg-sky-50 text-sky-900' : 'border-slate-200 bg-slate-50 text-slate-600',
        ].join(' ')}
        aria-live="polite"
        data-parfait={parfait ? '1' : '0'}
      >
        {parfait ? (
          <><strong className="font-mono">{cote} × {cote} = {x}</strong> — le carré est plein.</>
        ) : (
          <>
            Pour faire un carré de côté {largeur}, il faudrait {largeur * largeur} cases — il n’y en
            a que {x}. Et un carré de côté {largeur - 1} n’en demanderait que {(largeur - 1) * (largeur - 1)}.
            {' '}{x} tombe entre les deux : il ne forme pas un carré plein.
          </>
        )}
      </div>
    </div>
  );
}

export default function Module04LesCarresParfaits() {
  const [x, setX] = useState(20);
  const [trouves, setTrouves] = useState(() => new Set());
  const done1 = trouves.size >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const essayer = (v, react) => {
    setX(v);
    if (estCarreParfait(v)) {
      const next = new Set(trouves);
      next.add(v);
      setTrouves(next);
      if (next.size >= 3 && trouves.size < 3) react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Lesquels forment un carré plein ?',
      subtitle: 'Essaie de ranger chaque nombre de cases en carré. Trouves-en au moins trois qui marchent.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
            <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Choisir un nombre de cases">
              {CANDIDATS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => essayer(v, kit.react)}
                  aria-pressed={v === x}
                  data-candidat={v}
                  className={[
                    'min-h-[44px] min-w-[48px] rounded-xl border-2 font-mono font-bold tabular-nums transition-colors',
                    v === x
                      ? 'border-sky-500 bg-sky-600 text-white'
                      : trouves.has(v)
                      ? 'border-sky-300 bg-sky-50 text-sky-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-400',
                  ].join(' ')}
                >
                  {v}
                </button>
              ))}
            </div>
            <GrilleCarre x={x} />
          </div>
          {done1 ? (
            <Feedback tone="ok">
              Ceux qui marchent sont exactement les nombres qu’on obtient en multipliant un entier
              par lui-même : <strong className="font-mono">16 = 4 × 4</strong>,{' '}
              <strong className="font-mono">36 = 6 × 6</strong>,{' '}
              <strong className="font-mono">144 = 12 × 12</strong>… Les autres laissent toujours
              une rangée incomplète.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {trouves.size} carré{trouves.size > 1 ? 's' : ''} plein{trouves.size > 1 ? 's' : ''} trouvé
              {trouves.size > 1 ? 's' : ''} sur 3. Continue d’essayer les nombres proposés.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Les treize à connaître',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="carres-parfaits"
            variant="new"
            lead={<>Ces nombres reviennent sans arrêt en mathématiques. Les reconnaître d’un coup d’œil fait gagner un temps considérable.</>}
          />
          <TapQuestion
            prompt="Lequel de ces nombres n’est PAS un carré parfait ?"
            options={['90', '81', '100', '121']}
            correct={0}
            cols={4}
            requires={['carres-parfaits']}
            explain={`81 = ${ecrirePuissance(9, 2)}, 100 = ${ecrirePuissance(10, 2)} et 121 = ${ecrirePuissance(11, 2)}. En revanche 90 tombe entre 81 et 100 : aucun entier multiplié par lui-même ne donne 90.`}
            explainWrong="Un nombre rond n’est pas forcément un carré parfait. Passe la table en revue : 9 × 9 = 81, 10 × 10 = 100. Entre les deux, il n’y a rien — donc 90 n’en est pas un."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Retrouver le côté',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Un jardin carré a une aire de 144 m². Combien mesure son côté ?"
            expected={coteDuCarre(144)}
            parse={parseEntier}
            display={`${coteDuCarre(144)} m`}
            suffix="m"
            requires={['carres-parfaits', 'carre-cube']}
            explain={`On cherche le nombre qui, multiplié par lui-même, donne 144 : c’est 12, car ${ecrirePuissance(12, 2)} = ${aireCarre(12)}.`}
            explainFor={(rep) => {
              if (rep === 72) return 'Tu as divisé par 2. L’aire d’un carré n’est pas côté × 2 mais côté × côté : il faut le nombre qui, multiplié par LUI-MÊME, donne 144. C’est 12.';
              if (rep === 36) return 'Tu as peut-être divisé par 4 (le nombre de côtés). Cherche plutôt dans la table des carrés : 11 × 11 = 121, 12 × 12 = 144. Le côté vaut 12 m.';
              return 'Cherche dans la table des carrés parfaits : 12 × 12 = 144, donc le côté vaut 12 m.';
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Carré parfait ou non ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Pour chaque nombre, dis s’il est un carré parfait.</p>}
            rows={[
              { id: 'k1', label: '64', options: ['Carré parfait', 'Non'], correct: 0, correction: `64 = ${ecrirePuissance(8, 2)}.` },
              { id: 'k2', label: '30', options: ['Carré parfait', 'Non'], correct: 1, correction: '30 tombe entre 25 (5 × 5) et 36 (6 × 6).' },
              { id: 'k3', label: '49', options: ['Carré parfait', 'Non'], correct: 0, correction: `49 = ${ecrirePuissance(7, 2)}.` },
              { id: 'k4', label: '120', options: ['Carré parfait', 'Non'], correct: 1, correction: '120 tombe entre 100 (10 × 10) et 121 (11 × 11).' },
            ]}
            requires={['carres-parfaits']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  La méthode la plus sûre est l’<strong>encadrement</strong> : trouve les deux
                  carrés parfaits qui entourent le nombre. S’il n’en est pas un lui-même, il tombe
                  strictement entre les deux.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Récite la table des carrés jusqu’à dépasser le nombre :
                  1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144. S’il ne figure pas dans cette
                  liste, ce n’est pas un carré parfait.
                </Feedback>
              )
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Les carrés parfaits"
      moduleSubtitle="Treize nombres à reconnaître au premier coup d’œil"
      estimatedTime="9 min"
      brief={{
        tag: 'Manipulation',
        title: 'Quels nombres forment un carré ?',
        tone: 'indigo',
        body: (
          <p>
            On te donne un tas de carreaux et on te demande d’en faire un carré{' '}
            <strong>parfaitement plein</strong>. Certains nombres marchent, d’autres laissent
            toujours une rangée trouée. Trouve lesquels — et pourquoi ce sont ceux-là.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
