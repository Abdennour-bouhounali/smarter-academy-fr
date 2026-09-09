import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DetectiveLab from '../components/DetectiveLab';
import {
  A_DEFAUT, B_DEFAUT, C_DEPART, surLeCercleAB, caracterisationRectangle,
  medianeVersAB, arrondi, fr,
} from '../components/triangles4e';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 2 — DÉCOUVERTE : le même fait, lu à l'envers.
 *
 * Activity              poser C SUR le cercle de diamètre [AB], à plusieurs
 *                       endroits, et lire l'angle à chaque fois.
 * Mathematical objective la réciproque du module 1 : si C est sur le cercle de
 *                       diamètre [AB], alors l'angle en C est droit. Les deux
 *                       sens étant vrais, on tient une CARACTÉRISATION.
 * Student action        choisir des positions sur le cercle et relever l'angle.
 * Controlled variable   la position de C, contrainte au cercle — et c'est le
 *                       renversement exact du module 1, où c'était l'angle qui
 *                       était visé et le cercle qui suivait.
 * Mathematical state    les trois sommets ; l'angle est MESURÉ, jamais imposé.
 * Visual consequence    l'angle affiché tombe sur 90° à chaque relevé, sans
 *                       exception, y compris tout près de A ou de B.
 * Expected observation  « peu importe où je le pose sur le cercle, c'est droit ».
 * Misconception targeted croire qu'un énoncé et sa réciproque sont la même
 *                       chose. Ici, l'élève constate que les deux sens
 *                       tiennent — ce qui n'est PAS général, et le module 5 le
 *                       montrera.
 *
 * CONTINUITÉ : le triangle de départ est celui que l'élève a rendu rectangle au
 * module 1 (`useLabState`) — on part donc de SA figure, et on la fait glisser
 * le long du cercle où il l'avait amenée.
 *
 * POURQUOI LE MODULE EST COURT (9 min). Il ne fait qu'une chose, mais la fait
 * complètement : renverser le sens de lecture. Le diluer lui ferait perdre son
 * tranchant.
 */
const POSITIONS = [
  { id: 'haut', label: 'Tout en haut', theta: 90 },
  { id: 'gauche', label: 'Près de A', theta: 152 },
  { id: 'droite', label: 'Près de B', theta: 26 },
  { id: 'oblique', label: 'De biais', theta: 62 },
];

export default function Module02LeDemiTourDuDetective() {
  const memo = useLabState(LESSON_CONFIG.id, 'triangle', { C: C_DEPART });
  // On repart de la position mémorisée si elle est bien sur le cercle ; sinon
  // du sommet du cercle. Dans les deux cas, C est SUR le cercle : c'est
  // l'hypothèse du module, et elle doit être vraie dès la première image.
  const depart = (() => {
    const m = memo.value.C;
    if (m && caracterisationRectangle(A_DEFAUT, B_DEFAUT, m).droit) return m;
    return surLeCercleAB(A_DEFAUT, B_DEFAUT, Math.PI / 2);
  })();

  const [C, setC] = useState(depart);
  const [releves, setReleves] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const k = caracterisationRectangle(A_DEFAUT, B_DEFAUT, C);
  const med = medianeVersAB(A_DEFAUT, B_DEFAUT, C);

  /** Poser C sur le cercle : la contrainte est GÉOMÉTRIQUE, pas un aimant. */
  const poser = (theta) => {
    const p = surLeCercleAB(A_DEFAUT, B_DEFAUT, (theta * Math.PI) / 180);
    setC(p);
    const angle = arrondi(caracterisationRectangle(A_DEFAUT, B_DEFAUT, p).angleC, 1);
    setReleves((r) => (r.some((x) => x.theta === theta) ? r : [...r, { theta, angle }]));
  };

  /** Le glisser reste possible : on projette sur le cercle. */
  const glisser = (p) => {
    const O = { x: (A_DEFAUT.x + B_DEFAUT.x) / 2, y: (A_DEFAUT.y + B_DEFAUT.y) / 2 };
    const t = Math.atan2(O.y - p.y, p.x - O.x);
    const borne = Math.max(0.12, Math.min(Math.PI - 0.12, t));
    setC(surLeCercleAB(A_DEFAUT, B_DEFAUT, borne));
  };

  const done1 = releves.length >= 3;

  const lab = <DetectiveLab C={C} onC={glisser} montrerMediane montrerEcart={false} />;

  const steps = [
    {
      num: 1,
      title: 'Pose C sur le cercle, où tu veux',
      subtitle: 'Cette fois, c’est le cercle qui est donné. L’angle, on le découvre.',
      done: done1,
      content: (
        <div className="space-y-3">
          {lab}
          <div className="grid grid-cols-2 gap-2">
            {POSITIONS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => poser(p.theta)}
                className="min-h-[44px] rounded-xl border-2 border-violet-200 bg-white px-3 py-2
                           text-sm font-bold text-violet-800 hover:bg-violet-50"
              >
                {p.label}
              </button>
            ))}
          </div>
          {releves.length > 0 && (
            <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white p-3">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-1 text-left">position sur le cercle</th>
                    <th className="pb-1 text-right">angle mesuré en C</th>
                  </tr>
                </thead>
                <tbody>
                  {releves.map((r) => (
                    <tr key={r.theta} className="border-t border-slate-100">
                      <td className="py-1 text-slate-500">
                        {POSITIONS.find((p) => p.theta === r.theta)?.label ?? `${r.theta}°`}
                      </td>
                      <td className="py-1 text-right font-mono font-bold text-emerald-700">
                        {fr(r.angle, 1)}°
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!done1 && (
            <Feedback tone="info">
              {releves.length} position{releves.length > 1 ? 's' : ''} relevée
              {releves.length > 1 ? 's' : ''}. Essaies-en {3 - releves.length} de plus, dont une
              vraiment près d’un bord.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois positions très différentes, et la même colonne de droite : 90° partout. Même
              collé à A, l’angle reste droit.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La médiane, deuxième lecture',
      done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le trait violet joint C au milieu M. Compare sa longueur au côté [AB] : le rapport est
            affiché sous la figure. Il vaut{' '}
            <strong className="font-mono">{fr(arrondi(med.rapport, 2), 2)}</strong>.
          </p>
          {lab}
          <TapQuestion
            prompt="Pourquoi le segment [CM] vaut-il exactement la moitié de [AB] à chaque position ?"
            options={[
              'Parce que c’est un rayon du cercle, et que [AB] en est le diamètre',
              'Parce que C est toujours au-dessus du milieu de [AB]',
              'Parce que le triangle est isocèle',
              'C’est un hasard qui ne marche que sur cette figure',
            ]}
            correct={0}
            cols={1}
            requires={['hypotenuse-diametre', 'cercle-circonscrit-rectangle']}
            explain="C est sur le cercle et M en est le centre : [CM] est donc un rayon. Or [AB] passe par le centre : c’est un diamètre, qui vaut deux rayons. D’où la moitié."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Les deux sens tiennent',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="space-y-1.5 rounded-2xl border-2 border-violet-200 bg-white p-3 text-sm">
            <div className="text-slate-700">
              <strong>Module 1</strong> — tu partais de l’angle droit, tu trouvais le diamètre.
            </div>
            <div className="text-slate-700">
              <strong>Module 2</strong> — tu pars du diamètre, tu trouves l’angle droit.
            </div>
          </div>
          <TapQuestion
            prompt="Les deux sens de lecture sont vrais. Comment appelle-t-on un énoncé qui marche dans les deux sens ?"
            options={[
              'Une caractérisation : on peut écrire « si et seulement si »',
              'Une définition, puisqu’il n’y a rien à démontrer',
              'Une propriété ordinaire, comme toutes les autres',
              'Une conjecture, tant qu’on n’a pas tout vérifié',
            ]}
            correct={0}
            cols={1}
            requires={['cercle-circonscrit-rectangle']}
            explain="Une propriété va dans un seul sens. Quand la réciproque est vraie AUSSI — ce qu’il faut vérifier à part, et que tu viens de faire — les deux affirmations sont interchangeables : c’est une caractérisation."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="caracterisation-rectangle"
              variant="new"
              lead="Deux sens vérifiés séparément, un seul énoncé qui les résume."
            />
          )}
          {q3 && (
            <Feedback tone="info">
              Attention : ce n’est pas parce qu’une propriété est vraie que sa réciproque l’est.
              Ici les deux tiennent, et c’est pour cela qu’on a dû faire le demi-tour. Tu
              rencontreras des cas où la réciproque tombe.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le demi-tour du détective"
      moduleSubtitle="Partir du cercle pour retrouver l’angle droit"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 02',
        title: 'Le témoignage tient-il à l’envers ?',
        tone: 'indigo',
        body: (
          <>
            Au module 1, l’angle droit t’a mené au diamètre. <strong>Fais le chemin
            inverse</strong> : pose C n’importe où sur le cercle, et regarde ce que devient
            l’angle. Rien ne dit d’avance que ça marchera.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Un bon détective vérifie ses deux directions. « A implique B » et « B implique A » ne
            sont pas la même phrase — et l’une peut être vraie pendant que l’autre est fausse.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
