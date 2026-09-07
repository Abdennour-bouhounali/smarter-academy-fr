import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AtelierConstruction from '../components/AtelierConstruction';
import { PROGRAMME_RECTANGLE, checkOrder, INSTRUMENTS } from '../components/constructionsUtils';

/**
 * Module 5 — FORMALISATION : le programme de construction (P9, P12).
 *
 * ACTION          l'élève EXÉCUTE le programme : il pose chaque point avec
 *                 l'instrument de l'étape, puis remet un programme mélangé
 *                 dans un ordre possible.
 * TRANSFORMATION  la figure se construit sous ses doigts ; une étape ne
 *                 s'ouvre que lorsque celles dont elle dépend sont faites.
 * SENS MATH.      l'ordre n'est pas un style : on ne peut pas placer D sur
 *                 une perpendiculaire qui n'existe pas encore. La dépendance
 *                 se VIT avant de se trier.
 * FEEDBACK        la contrainte non satisfaite est nommée (« D n'est pas sur
 *                 la perpendiculaire »), jamais un « faux » sec.
 * GÉNÉRALISATION  communiquer une construction, c'est donner des étapes
 *                 ordonnées ET l'instrument de chacune.
 *
 * Aha : en exécutant, l'élève découvre qu'une étape lui est matériellement
 * impossible tant que la précédente n'est pas faite — l'ordre cesse d'être
 * une convention pour devenir une nécessité.
 *
 * ── CE QUI CHANGE ─────────────────────────────────────────────────────
 * L'ancienne version n'était QUE le tri des six étapes : l'élève lisait des
 * phrases et les rangeait. Le tri reste (étape 2 : `checkOrder` valide tout
 * ordre licite), mais il arrive APRÈS l'exécution — on trie ce qu'on a fait,
 * on ne trie plus dans le vide.
 *
 * Briques et `requires` inchangés : ordre-dependances et
 * programme-construction se posent à la fin de l'étape de tri, la question
 * finale garde ses trois `requires`.
 */

/* ── La construction du rectangle, jouable ──────────────────────────────
   A et B sont donnés (le segment [AB] de l'étape 1 du programme). L'élève
   pose D puis C. Chaque étape porte sa contrainte géométrique — c'est elle,
   et non un texte, qui décide si l'étape est faite. */
const A = { x: 70, y: 165 };
const B = { x: 210, y: 165 };
/** Hauteur visée du rectangle, en unités SVG. */
const HAUTEUR = 80;
const TOL = 9;

/** Distance d'un point à la verticale passant par A. */
const ecartVertical = (p) => Math.abs(p.x - A.x);

const ETAPES = [
  {
    id: 'd',
    texte: 'Placer D sur la perpendiculaire à (AB) passant par A',
    instrument: 'equerre',
    place: 'D',
    /* La contrainte EST la perpendicularité : D doit être au-dessus de A,
       sur la verticale. On aimante D à cette verticale — sans quoi
       l'exercice serait une épreuve d'adresse, pas de géométrie
       (même parti pris que `snapRightAngle` dans figures-planes). */
    snap: (p) => (ecartVertical(p) <= 22 ? { x: A.x, y: p.y } : p),
    check: (pts) => {
      const D = pts.D;
      if (!D) return { ok: false, message: 'Pose le point D sur la feuille.' };
      if (ecartVertical(D) > TOL) {
        return { ok: false, message: 'D n’est pas sur la perpendiculaire à (AB) passant par A : approche-le de la droite verticale en pointillé.' };
      }
      if (A.y - D.y < 30) {
        return { ok: false, message: 'D est trop près de A : remonte-le pour donner une hauteur au rectangle.' };
      }
      return { ok: true, message: 'D est bien sur la perpendiculaire à (AB) passant par A.' };
    },
    guide: () => (
      <line
        x1={A.x} y1={A.y} x2={A.x} y2={12}
        stroke="#059669" strokeWidth="1.8" strokeDasharray="5 4"
      />
    ),
  },
  {
    id: 'c',
    texte: 'Placer C sur la parallèle à (AB) passant par D, à la même longueur que [AB]',
    instrument: 'regle',
    place: 'C',
    /* C coulisse sur la parallèle passant par D : le snap l'y ramène. */
    snap: (p, pts) => (pts.D && Math.abs(p.y - pts.D.y) <= 22 ? { x: p.x, y: pts.D.y } : p),
    check: (pts) => {
      const { C, D } = pts;
      if (!D) return { ok: false, message: 'Place d’abord D.' };
      if (!C) return { ok: false, message: 'Pose le point C sur la feuille.' };
      if (Math.abs(C.y - D.y) > TOL) {
        return { ok: false, message: 'C n’est pas sur la parallèle à (AB) passant par D : ramène-le à la hauteur de D.' };
      }
      const ab = B.x - A.x;
      const dc = C.x - D.x;
      if (Math.abs(dc - ab) > TOL) {
        return {
          ok: false,
          message: dc < ab
            ? '[DC] est encore plus court que [AB] : éloigne C de D.'
            : '[DC] dépasse [AB] : rapproche C de D.',
        };
      }
      return { ok: true, message: '[DC] a la même longueur que [AB], et C est sur la parallèle.' };
    },
    guide: (pts) => (pts.D ? (
      <line
        x1={12} y1={pts.D.y} x2={308} y2={pts.D.y}
        stroke="#059669" strokeWidth="1.8" strokeDasharray="5 4"
      />
    ) : null),
  },
];

/* Le tri de l'étape 2 : le programme complet, mélangé. */
const MELANGE = ['e3', 'e1', 'e5', 'e2', 'e6', 'e4'];

export default function Module05Programme() {
  /* Étape 1 — exécuter */
  const [points, setPoints] = useState({ A, B });
  const [idx, setIdx] = useState(0);
  const [execDone, setExecDone] = useState(false);

  /* Étape 2 — trier */
  const [reste, setReste] = useState(MELANGE);
  const [choisi, setChoisi] = useState([]);
  const [erreur, setErreur] = useState(null);
  const [ordreDone, setOrdreDone] = useState(false);

  /* Étape 3 — formuler */
  const [instrumentDone, setInstrumentDone] = useState(false);

  const etape = ETAPES[idx] ?? null;
  const verdict = etape ? etape.check(points) : { ok: true, message: '' };
  // Les segments à peindre : ils apparaissent au fur et à mesure que les
  // points existent, donc la figure se construit réellement.
  const segments = [['A', 'B'], ['A', 'D'], ['D', 'C'], ['C', 'B']];

  const avancer = (react) => {
    if (!verdict.ok) { react(false); return; }
    react(true);
    if (idx + 1 < ETAPES.length) { setIdx(idx + 1); return; }
    setExecDone(true);
  };

  const etapeProg = (id) => PROGRAMME_RECTANGLE.find((s) => s.id === id);

  const ajouter = (id, react) => {
    if (ordreDone) return;
    const next = [...choisi, id];
    const r = checkOrder(PROGRAMME_RECTANGLE.filter((s) => next.includes(s.id)), next);
    if (!r.ok) { setErreur(r.message); react(false); return; }
    setErreur(null);
    setChoisi(next);
    setReste((x) => x.filter((y) => y !== id));
    if (next.length === PROGRAMME_RECTANGLE.length) { react(true); setOrdreDone(true); }
  };

  const recommencer = () => { setChoisi([]); setReste(MELANGE); setErreur(null); };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le programme de construction"
      moduleSubtitle="D’abord l’exécuter avec les instruments, ensuite l’écrire."
      estimatedTime="14 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'Construire un rectangle, étape par étape.',
        body: (
          <p>
            Tu as le segment <strong>[AB]</strong>. Suis le programme : chaque étape te dit quel
            point poser et quel <strong>instrument</strong> le garantit.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Exécute le programme',
          subtitle: execDone
            ? 'Rectangle terminé — tu peux encore déplacer les points.'
            : `Étape ${idx + 1} sur ${ETAPES.length} · ${INSTRUMENTS[etape?.instrument ?? 'regle'].nom}`,
          done: execDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm text-indigo-900 flex items-start gap-2">
                <span aria-hidden="true" className="text-lg leading-none">
                  {INSTRUMENTS[etape?.instrument ?? 'regle'].emoji}
                </span>
                <span>
                  {execDone
                    ? 'Le rectangle est construit. Tire un point : la contrainte se brise, et la figure cesse d’être un rectangle.'
                    : etape.texte}
                </span>
              </div>

              {/* La manipulation ne se fige jamais : même après `execDone`,
                  les points restent saisissables. */}
              <AtelierConstruction
                points={points}
                onPointsChange={setPoints}
                etapes={ETAPES}
                index={execDone ? ETAPES.length - 1 : idx}
                segments={segments}
                ariaLabel={
                  execDone
                    ? 'Rectangle ABCD construit'
                    : `Construction en cours : ${etape.texte}`
                }
              />

              {!execDone && (
                <>
                  <Feedback tone={verdict.ok ? 'ok' : 'info'}>{verdict.message}</Feedback>
                  <button
                    type="button"
                    onClick={() => avancer(kit.react)}
                    disabled={!verdict.ok}
                    className="w-full min-h-[48px] rounded-xl border-2 border-indigo-300 bg-white px-4 font-bold text-indigo-800 hover:border-indigo-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {idx + 1 < ETAPES.length ? 'Étape suivante' : 'Terminer la figure'}
                  </button>
                </>
              )}

              {execDone && (
                <Feedback tone="ok">
                  Chaque point s’appuyait sur le précédent : impossible de placer C avant D, ni D
                  avant d’avoir la perpendiculaire. C’est cela qu’un{' '}
                  <strong>ordre</strong> veut dire dans une construction.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Remets le programme complet dans l’ordre',
          subtitle: `${choisi.length} / ${PROGRAMME_RECTANGLE.length} étapes placées`,
          done: ordreDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Voici le programme entier, celui qu’on écrirait pour quelqu’un d’autre. Tu viens
                d’en vivre le cœur : remets-le dans un ordre <strong>possible</strong>.
              </p>

              <ol className="space-y-1.5">
                {choisi.map((id, i) => {
                  const s = etapeProg(id);
                  return (
                    <li
                      key={id}
                      className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 flex items-center gap-2"
                    >
                      <span className="font-mono font-bold">{i + 1}.</span>
                      <span className="flex-1">{s.texte}</span>
                      <span className="text-xs" aria-label={INSTRUMENTS[s.instrument].nom}>
                        {INSTRUMENTS[s.instrument].emoji}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {!ordreDone && (
                <>
                  <p className="text-xs font-mono uppercase tracking-wide text-slate-500">
                    Quelle étape vient ensuite ?
                  </p>
                  <div className="space-y-1.5">
                    {reste.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => ajouter(id, kit.react)}
                        className="w-full min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm text-left text-slate-700 hover:border-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex items-center gap-2"
                      >
                        <span className="flex-1">{etapeProg(id).texte}</span>
                        <span className="text-xs" aria-hidden="true">
                          {INSTRUMENTS[etapeProg(id).instrument].emoji}
                        </span>
                      </button>
                    ))}
                  </div>
                  {erreur && <Feedback tone="ko">{erreur}</Feedback>}
                  {choisi.length > 0 && (
                    <button
                      type="button"
                      onClick={recommencer}
                      className="min-h-[44px] inline-flex items-center px-1 text-xs font-mono text-slate-500 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    >
                      Recommencer
                    </button>
                  )}
                </>
              )}

              {ordreDone && (
                <>
                  <Feedback tone="ok">
                    Le programme est complet et cohérent. Chaque étape s’appuie sur les précédentes —
                    c’est ce qui rend la construction <strong>reproductible</strong> par quelqu’un
                    d’autre.
                  </Feedback>
                  <KnowledgeBrick
                    id="ordre-dependances"
                    variant="new"
                    lead="Les étapes refusées ne l’étaient pas par goût : il leur manquait ce sur quoi elles s’appuient — tu l’avais déjà senti en construisant."
                  />
                  <KnowledgeBrick
                    id="programme-construction"
                    variant="new"
                    lead="La suite d’étapes que tu viens de reconstituer porte un nom, et un mode d’emploi."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Que doit contenir un bon programme ?',
          done: instrumentDone,
          content: (
            <TapQuestion
              prompt="Pour qu’un camarade puisse refaire exactement ta figure, que doit contenir ton programme de construction ?"
              options={[
                'Les étapes dans l’ordre, avec les longueurs, les propriétés et l’instrument de chacune',
                'Un dessin de la figure finie',
                'La liste des instruments utilisés',
              ]}
              correct={0}
              cols={1}
              requires={['programme-construction', 'ordre-dependances', 'instrument-garantit']}
              explain="Un programme se suit sans voir la figure : il faut donc l’ordre, les mesures exactes et les propriétés à respecter. Un dessin ne dit pas COMMENT on l’a obtenu."
              explainWrong="Un dessin montre le résultat, pas la méthode ; une liste d’instruments ne dit pas quoi en faire. C’est la suite ordonnée d’actions précises qui compte."
              solved={instrumentDone}
              onAnswered={() => setInstrumentDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Tu sais construire et écrire une construction. Reste le regard du
          contrôleur : au module suivant, on cherche l’erreur.
        </KnowledgeSnapshot>
      }
    />
  );
}
