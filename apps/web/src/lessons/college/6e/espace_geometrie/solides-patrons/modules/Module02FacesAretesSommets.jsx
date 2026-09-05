import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3 } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidView from '../components/SolidView';
import { SOLIDES, SOLIDES_LIST, isPolyhedron, eulerCheck } from '../components/solidesUtils';

/**
 * Module 2 — DÉCOUVERTE : le vocabulaire du solide (P2, P3, P4).
 *
 * Objectif : nommer les trois éléments et apprendre à les compter SANS se
 * fier au dessin — en raisonnant sur la structure.
 *
 * Aha : les trois nombres ne sont pas indépendants. Sur un polyèdre,
 * F + S − A = 2 toujours (relation d'Euler). L'élève ne l'apprend pas comme
 * une formule : il la CONSTATE sur trois solides différents.
 *
 * Misconception visée : confondre arête (un segment) et sommet (un point),
 * ou compter seulement ce qui est visible.
 */
const HIGHLIGHTS = [
  { id: 'faces', label: 'Faces', desc: 'les surfaces planes', key: 'faces' },
  { id: 'aretes', label: 'Arêtes', desc: 'les segments où deux faces se rencontrent', key: 'aretes' },
  { id: 'sommets', label: 'Sommets', desc: 'les points où les arêtes se rejoignent', key: 'sommets' },
];

const A_COMPTER = ['cube', 'pave', 'prisme'];

export default function Module02FacesAretesSommets() {
  const [vue, setVue] = useState('faces');
  const [seen, setSeen] = useState(['faces']);
  const [exploreDone, setExploreDone] = useState(false);
  const [countDone, setCountDone] = useState(false);
  const [eulerDone, setEulerDone] = useState(false);

  const allSeen = HIGHLIGHTS.every((h) => seen.includes(h.id));
  const cube = SOLIDES.cube;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Faces, arêtes, sommets"
      moduleSubtitle="Trois mots précis pour décrire un solide."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Une surface, un segment, un point.',
        body: (
          <p>
            Ces trois mots ne désignent pas la même chose. Passe de l’un à l’autre pour bien les distinguer.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Explore les trois éléments',
          done: exploreDone,
          content: (kit) => (
            <div className="space-y-3">
              <SolidView
                solide="cube"
                highlight={vue}
                ariaLabel={`Cube, ${HIGHLIGHTS.find((h) => h.id === vue)?.label} mis en évidence`}
              />
              <div className="flex gap-2 justify-center flex-wrap" role="group" aria-label="Choisir l’élément à observer">
                {HIGHLIGHTS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    aria-pressed={vue === h.id}
                    onClick={() => {
                      setVue(h.id);
                      setSeen((s) => (s.includes(h.id) ? s : [...s, h.id]));
                    }}
                    className={`min-h-[44px] px-4 rounded-xl border-2 font-bold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      vue === h.id
                        ? 'bg-sky-600 border-sky-700 text-white'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400'
                    }`}
                  >
                    {h.label} <span className="font-mono text-xs opacity-80">{cube[h.key]}</span>
                  </button>
                ))}
              </div>
              <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-700">
                <strong>{HIGHLIGHTS.find((h) => h.id === vue)?.label}</strong> :{' '}
                {HIGHLIGHTS.find((h) => h.id === vue)?.desc}. Le cube en a{' '}
                <strong className="font-mono">{cube[HIGHLIGHTS.find((h) => h.id === vue)?.key]}</strong>.
              </div>
              {!exploreDone && (
                <button
                  type="button"
                  disabled={!allSeen}
                  onClick={() => { kit.react(true); setExploreDone(true); }}
                  className="w-full min-h-[44px] rounded-xl bg-sky-600 text-white font-bold text-sm disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {allSeen ? 'J’ai vu les trois' : `Explore les trois (${seen.length} / 3)`}
                </button>
              )}
              {exploreDone && (
                <Feedback tone="ok">
                  Une <strong>face</strong> est une surface, une <strong>arête</strong> un segment, un{' '}
                  <strong>sommet</strong> un point. Trois objets de nature différente — d’où trois comptes
                  différents.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Compte pour trois solides',
          done: countDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-3">
                    {A_COMPTER.map((id) => (
                      <div key={id} className="space-y-1">
                        <p className="text-xs font-mono text-center text-slate-500 capitalize">
                          {SOLIDES[id].nom}
                        </p>
                        <SolidView solide={id} size={200} ariaLabel={SOLIDES[id].nom} />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600">
                    Combien de <strong>faces</strong> chacun possède-t-il ? N’oublie pas celles de derrière.
                  </p>
                </div>
              }
              rows={A_COMPTER.map((id) => ({
                id,
                label: <span className="font-semibold capitalize">{SOLIDES[id].nom}</span>,
                options: ['4', '5', '6', '8'],
                correct: ['4', '5', '6', '8'].indexOf(String(SOLIDES[id].faces)),
                correction: <>{SOLIDES[id].faces} faces — {SOLIDES[id].natureFaces}</>,
              }))}
              solved={countDone}
              onAnswered={() => setCountDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Cube et pavé ont tous deux <strong>6</strong> faces ; le prisme triangulaire en a{' '}
                  <strong>5</strong> (2 triangles + 3 rectangles).
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 3,
          title: 'Un lien entre les trois nombres',
          subtitle: 'Vérifie-le toi-même sur le cube.',
          done: eulerDone,
          content: (
            <TapQuestion
              above={
                <div className="rounded-xl border-2 border-slate-200 bg-white p-4 space-y-2">
                  <p className="text-sm text-slate-600 text-center">Pour le cube :</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {HIGHLIGHTS.map((h) => (
                      <div key={h.id} className="rounded-xl bg-slate-50 border border-slate-200 p-2">
                        <div className="font-mono font-extrabold text-lg text-slate-800">{cube[h.key]}</div>
                        <div className="text-[11px] text-slate-500">{h.label}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-center font-mono text-sm text-slate-700">
                    {cube.faces} + {cube.sommets} − {cube.aretes} = {eulerCheck(cube)}
                  </p>
                </div>
              }
              prompt="Fais le même calcul pour le pavé droit (6 faces, 8 sommets, 12 arêtes). Que trouves-tu ?"
              options={['2 — le même résultat', '0', 'Un résultat différent']}
              correct={0}
              cols={3}
              explain="Toujours 2 ! Pour tout polyèdre, faces + sommets − arêtes = 2. C’est une propriété générale, pas une coïncidence — elle sert à vérifier qu’on n’a rien oublié."
              explainWrong="6 + 8 − 12 = 2, exactement comme pour le cube. Cette égalité vaut pour tous les polyèdres, et c’est un bon moyen de contrôler ses comptes."
              solved={eulerDone}
              onAnswered={() => setEulerDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 space-y-3"
        >
          <Grid3x3 className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            {HIGHLIGHTS.map((h) => (
              <div key={h.id} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="font-bold text-white mb-1">{h.label}</div>
                <div className="text-slate-300 text-xs">{h.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 font-mono">
            faces + sommets − arêtes = 2, pour tout polyèdre
          </p>
        </motion.div>
      }
    />
  );
}
