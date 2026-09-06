import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CompasTool from '../components/CompasTool';
import { dist } from '../components/constructionsUtils';

/**
 * Module 3 — MANIPULATION : le compas (P3, P5).
 *
 * ACTION          l'élève règle l'écartement du compas pour l'ajuster à un
 *                 segment donné, puis pointe ailleurs.
 * TRANSFORMATION  l'arc conserve exactement le même rayon.
 * SENS MATH.      le compas ne mesure pas, il CONSERVE. C'est ce qui permet
 *                 de reporter une longueur qu'on ne connaît pas.
 * FEEDBACK        le rayon affiché est identique des deux côtés.
 * GÉNÉRALISATION  reporter n'est pas mesurer : aucun nombre n'est lu.
 *
 * Misconception visée : croire qu'il faut d'abord mesurer pour reporter, ou
 * que le compas ne sert qu'à tracer des cercles.
 */
const REF = { a: { x: 40, y: 45 }, b: { x: 148, y: 45 } };
const LONGUEUR = Math.round(dist(REF.a, REF.b));
const CENTRE = { x: 60, y: 140 };

export default function Module03Compas() {
  const [rayon, setRayon] = useState(60);
  const [reglageDone, setReglageDone] = useState(false);
  const [reporterDone, setReporterDone] = useState(false);
  const [cercleDone, setCercleDone] = useState(false);

  const ecart = Math.abs(rayon - LONGUEUR);
  const ajuste = ecart <= 2;

  const setR = (v, react) => {
    if (reglageDone) return;
    const next = Math.max(20, Math.min(170, v));
    setRayon(next);
    if (Math.abs(next - LONGUEUR) <= 2) { react(true); setReglageDone(true); }
  };

  const btn = 'min-h-[44px] min-w-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white font-mono font-bold text-slate-700 hover:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40';

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le compas"
      moduleSubtitle="Un écartement qui se conserve."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Reporter une longueur sans jamais la lire.',
        body: (
          <p>
            Règle l’écartement du compas sur le segment bleu, puis observe : le rayon ne change plus, où que
            tu pointes.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Règle l’écartement sur le segment',
          subtitle: `Ajuste jusqu’à retrouver la longueur du segment bleu.`,
          done: reglageDone,
          content: (kit) => (
            <div className="space-y-3">
              <CompasTool
                centre={CENTRE}
                rayon={reglageDone ? LONGUEUR : rayon}
                reference={REF}
                ariaLabel={`Segment de ${LONGUEUR} unités, compas ouvert à ${Math.round(rayon)}`}
              />
              {!reglageDone && (
                <>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button type="button" className={btn} onClick={() => setR(rayon - 4, kit.react)} aria-label="Refermer le compas">
                      −
                    </button>
                    <input
                      type="range"
                      min={20}
                      max={170}
                      value={Math.round(rayon)}
                      onChange={(e) => setR(Number(e.target.value), kit.react)}
                      className="flex-1 max-w-[220px] accent-violet-600"
                      aria-label={`Écartement du compas : ${Math.round(rayon)}`}
                    />
                    <button type="button" className={btn} onClick={() => setR(rayon + 4, kit.react)} aria-label="Ouvrir le compas">
                      +
                    </button>
                  </div>
                  <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-sm">
                    Écartement : <strong className="font-mono">{Math.round(rayon)}</strong> · Segment :{' '}
                    <strong className="font-mono">{LONGUEUR}</strong>
                    <span className={`ml-2 font-mono text-xs ${ajuste ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {ajuste ? '✓ ajusté' : `écart ${Math.round(ecart)}`}
                    </span>
                  </div>
                </>
              )}
              {reglageDone && (
                <>
                  <Feedback tone="ok">
                    Le compas est réglé sur la longueur du segment. Tu n’as pas eu besoin de lire un
                    nombre : l’<strong>écartement</strong> porte la longueur.
                  </Feedback>
                  {/* L'écartement vient d'être ajusté à la main : le geste du
                      report se pose ici, avant les deux étapes qui l'exigent. */}
                  <KnowledgeBrick
                    id="reporter-au-compas"
                    variant="new"
                    lead="Ce réglage que tu viens de faire est la première moitié d’un geste complet."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Reporter la longueur ailleurs',
          done: reporterDone,
          content: (
            <TapQuestion
              above={
                <CompasTool
                  centre={{ x: 200, y: 140 }}
                  rayon={LONGUEUR}
                  reference={REF}
                  cible={{ x: 200 + LONGUEUR, y: 140 }}
                  ariaLabel="Le compas, écartement conservé, reporté à un autre endroit"
                />
              }
              prompt="Sans toucher à l’écartement, on pointe le compas ailleurs. Quelle est la longueur reportée ?"
              options={[
                `Exactement ${LONGUEUR} — la même qu’au départ`,
                'Une longueur un peu différente',
                'Impossible à savoir sans mesurer',
              ]}
              correct={0}
              cols={1}
              requires={['reporter-au-compas', 'instrument-garantit']}
              explain="C’est tout l’intérêt du compas : tant qu’on n’y touche pas, l’écartement est conservé. La longueur reportée est exactement la même."
              explainWrong="Le compas ne se déforme pas en se déplaçant. C’est ce qui en fait l’instrument du REPORT — plus fiable que la lecture d’une graduation."
              solved={reporterDone}
              onAnswered={() => setReporterDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Pourquoi le cercle, alors ?',
          done: cercleDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                above={
                  <CompasTool
                    centre={{ x: 160, y: 105 }}
                    rayon={70}
                    ariaLabel="Un cercle tracé au compas"
                  />
                }
                prompt="Pourquoi le compas trace-t-il naturellement un cercle ?"
                options={[
                  'Parce que tous les points tracés sont à la même distance du centre',
                  'Parce qu’il tourne',
                  'Parce que la mine est ronde',
                ]}
                correct={0}
                cols={1}
                requires={['reporter-au-compas']}
                explain="Le cercle EST l’ensemble des points à une même distance du centre. Le compas, qui conserve l’écartement, le dessine donc par construction."
                explainWrong="Ce n’est pas la rotation en elle-même : c’est le fait que l’écartement — donc la distance au centre — ne change jamais."
                solved={cercleDone}
                onAnswered={() => setCercleDone(true)}
              />

              {/* Le lien entre report et cercle vient d'être formulé par
                  l'élève : on le fixe sur la carte. */}
              {cercleDone && (
                <KnowledgeBrick
                  id="cercle-au-compas"
                  variant="new"
                  lead="Tracer un cercle et reporter une longueur sont donc le même geste."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Longueurs exactes, longueurs reportées : il te manque encore
          l’angle droit. C’est l’équerre, au module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
