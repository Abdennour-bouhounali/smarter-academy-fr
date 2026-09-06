import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROGRAMME_RECTANGLE, checkOrder, INSTRUMENTS } from '../components/constructionsUtils';

/**
 * Module 5 — FORMALISATION : le programme de construction (P9, P12).
 *
 * ACTION          l'élève remet les étapes dans un ordre possible.
 * TRANSFORMATION  une étape mal placée est refusée en NOMMANT sa dépendance.
 * SENS MATH.      l'ordre n'est pas un style : on ne peut pas tracer une
 *                 perpendiculaire à une droite qui n'existe pas encore.
 * FEEDBACK        « X arrive trop tôt : il faut d'abord Y ».
 * GÉNÉRALISATION  communiquer une construction, c'est donner des étapes
 *                 ordonnées ET l'instrument de chacune.
 *
 * `checkOrder` valide TOUT ordre respectant les dépendances — pas seulement
 * l'ordre canonique de l'auteur.
 */
const MELANGE = ['e3', 'e1', 'e5', 'e2', 'e6', 'e4'];

export default function Module05Programme() {
  const [reste, setReste] = useState(MELANGE);
  const [choisi, setChoisi] = useState([]);
  const [erreur, setErreur] = useState(null);
  const [ordreDone, setOrdreDone] = useState(false);
  const [instrumentDone, setInstrumentDone] = useState(false);

  const etape = (id) => PROGRAMME_RECTANGLE.find((s) => s.id === id);

  const ajouter = (id, react) => {
    if (ordreDone) return;
    const next = [...choisi, id];
    // On teste l'ordre partiel : une dépendance non encore posée = trop tôt.
    const r = checkOrder(PROGRAMME_RECTANGLE.filter((s) => next.includes(s.id)), next);
    if (!r.ok) {
      setErreur(r.message);
      react(false);
      return;
    }
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
      moduleSubtitle="Des étapes dans l’ordre : suivre, puis écrire."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'Construire un rectangle, étape par étape.',
        body: (
          <p>
            Les étapes sont mélangées. Remets-les dans un ordre <strong>possible</strong> — certaines
            dépendent d’autres.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Remets le programme dans l’ordre',
          subtitle: `${choisi.length} / ${PROGRAMME_RECTANGLE.length} étapes placées`,
          done: ordreDone,
          content: (kit) => (
            <div className="space-y-3">
              {/* Les étapes déjà placées */}
              <ol className="space-y-1.5">
                {choisi.map((id, i) => {
                  const s = etape(id);
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
                        <span className="flex-1">{etape(id).texte}</span>
                        <span className="text-xs" aria-hidden="true">
                          {INSTRUMENTS[etape(id).instrument].emoji}
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
                  {/* L'élève vient de buter sur des étapes « trop tôt » : la
                      règle de l'ordre se pose sur ce constat, puis la
                      méthode d'écriture — avant la question de l'étape 2. */}
                  <KnowledgeBrick
                    id="ordre-dependances"
                    variant="new"
                    lead="Les étapes refusées ne l’étaient pas par goût : il leur manquait ce sur quoi elles s’appuient."
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
          num: 2,
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
