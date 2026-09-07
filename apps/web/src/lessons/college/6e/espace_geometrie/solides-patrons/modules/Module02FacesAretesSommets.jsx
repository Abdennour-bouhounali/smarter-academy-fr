import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidView from '../components/SolidView';
import { DragTray } from '../../../../../common/manip6e';
import { SOLIDES, SOLIDES_LIST, isPolyhedron, eulerCheck } from '../components/solidesUtils';

/**
 * Module 2 — DÉCOUVERTE : le vocabulaire du solide (P2, P3, P4).
 *
 * Objectif : nommer les trois éléments et apprendre à les compter SANS se
 * fier au dessin — en raisonnant sur la structure.
 *
 * Aha : les trois nombres ne sont pas indépendants. Sur un solide à faces planes,
 * F + S − A = 2 toujours (relation d'Euler). L'élève ne l'apprend pas comme
 * une formule : il la CONSTATE sur trois solides différents.
 *
 * Misconception visée : confondre arête (un segment) et sommet (un point),
 * ou compter seulement ce qui est visible.
 *
 * ── LE TRI PAR NATURE (étape 2) ───────────────────────────────────────
 * Distinguer les trois mots ne se joue pas sur leur définition mais sur la
 * NATURE de l'objet : une surface, un segment, un point. L'élève prend donc
 * de vrais objets géométriques (un carré, un trait, un point — et des objets
 * du quotidien) et les DÉPOSE dans la bonne famille (`DragTray`, pointeur et
 * clavier). Un dépôt faux est refusé par la zone elle-même : la contrainte
 * enseigne au lieu de sanctionner.
 */
/* Les objets à trier : leur nature est ce qui décide, jamais leur nom. */
const A_TRIER = [
  { id: 'o1', famille: 'faces', label: 'le dessus d’une boîte', forme: 'surface' },
  { id: 'o2', famille: 'aretes', label: 'le bord d’une table', forme: 'segment' },
  { id: 'o3', famille: 'sommets', label: 'le coin d’un dé', forme: 'point' },
  { id: 'o4', famille: 'faces', label: 'le fond d’un tiroir', forme: 'surface' },
  { id: 'o5', famille: 'aretes', label: 'l’arête d’un glaçon', forme: 'segment' },
  { id: 'o6', famille: 'sommets', label: 'la pointe d’une pyramide', forme: 'point' },
];

/** La vignette d'un objet : sa NATURE, dessinée — pas son nom. */
function FormeIcon({ forme }) {
  if (forme === 'surface') {
    return <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><rect x="4" y="4" width="18" height="18" fill="#a5b4fc" stroke="#4338ca" strokeWidth="2" rx="2" /></svg>;
  }
  if (forme === 'segment') {
    return <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><line x1="4" y1="20" x2="22" y2="6" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" /></svg>;
  }
  return <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="5" fill="#e11d48" stroke="#fff" strokeWidth="2" /></svg>;
}
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
  /* Le tri : objet → famille. Un objet mal placé ne peut pas être déposé
     (la zone le refuse), donc l'état ne contient que des tris justes. */
  const [tri, setTri] = useState({});
  const triDone = A_TRIER.every((o) => tri[o.id]);

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
                <>
                  <Feedback tone="ok">
                    Tu viens de voir trois choses de nature différente : des surfaces, des segments,
                    des points. Chacune porte un nom.
                  </Feedback>
                  {/* C'est ICI que les trois mots existent — le module 1 n'en
                      employait aucun, et les briques les posent avant toute
                      question qui les demande. */}
                  <KnowledgeBrick
                    id="face-solide"
                    variant="new"
                    lead="Les surfaces que tu as allumées en premier."
                  />
                  <KnowledgeBrick
                    id="arete"
                    variant="new"
                    lead="Les segments, là où deux de ces surfaces se rencontrent."
                  />
                  <KnowledgeBrick
                    id="sommet-solide"
                    variant="new"
                    lead="Et les points, là où ces segments se rejoignent."
                  />
                  <KnowledgeBrick id="mem-cube-fas" variant="new" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Range chaque objet dans sa famille',
          subtitle: 'Prends un objet et dépose-le. Ce qui décide, c’est sa NATURE.',
          done: triDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Une <strong>surface</strong>, un <strong>segment</strong>, un <strong>point</strong> :
                trois natures différentes. Glisse chaque objet dans la bonne famille — une zone
                refuse ce qui n’est pas de sa nature.
              </p>

              {/* Vrai glisser-déposer (pointeur) ET chemin clavier complet :
                  activer un objet le prend, activer une zone l'y dépose. */}
              <DragTray
                sourcesLabel="Les objets à ranger"
                zonesLabel="Les trois familles"
                sources={A_TRIER.filter((o) => !tri[o.id]).map((o) => ({
                  id: o.id,
                  label: o.label,
                  node: (
                    <span className="flex items-center gap-2">
                      <FormeIcon forme={o.forme} />
                      <span className="text-sm">{o.label}</span>
                    </span>
                  ),
                }))}
                zones={HIGHLIGHTS.map((h) => ({
                  id: h.id,
                  label: h.label,
                  // La zone REFUSE ce qui n'est pas de sa nature : la
                  // contrainte est mathématique, pas un score.
                  accepts: (srcId) => A_TRIER.find((o) => o.id === srcId)?.famille === h.id,
                  node: (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {A_TRIER.filter((o) => tri[o.id] === h.id).map((o) => (
                        <span key={o.id} title={o.label}>
                          <FormeIcon forme={o.forme} />
                        </span>
                      ))}
                    </div>
                  ),
                }))}
                onDrop={(srcId, zoneId) => {
                  setTri((prev) => {
                    const next = { ...prev, [srcId]: zoneId };
                    if (A_TRIER.every((o) => next[o.id])) kit.react?.(true);
                    return next;
                  });
                }}
                onRemove={(zoneId) => {
                  // Jamais figé : on peut ressortir un objet et recommencer.
                  setTri((prev) => {
                    const last = A_TRIER.filter((o) => prev[o.id] === zoneId).pop();
                    if (!last) return prev;
                    const next = { ...prev };
                    delete next[last.id];
                    return next;
                  });
                }}
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-center text-sm text-slate-600">
                Rangés : <strong className="font-mono">{Object.keys(tri).length}</strong> /{' '}
                {A_TRIER.length}
              </div>

              {triDone && (
                <Feedback tone="ok">
                  Aucun objet n’a pu entrer dans la mauvaise famille : c’est sa{' '}
                  <strong>nature</strong> qui décide. Une face a une aire, une arête a une longueur,
                  un sommet n’a ni l’une ni l’autre — c’est pour cela que les trois se comptent
                  séparément.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Compte pour trois solides',
          done: countDone,
          content: (
            <BatchChoiceQuestion
              requires={['face-solide', 'dessin-et-objet']}
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
          num: 4,
          title: 'Un lien entre les trois nombres',
          subtitle: 'Vérifie-le toi-même sur le cube.',
          done: eulerDone,
          content: (
            <div className="space-y-5">
              {/* La question de cette étape porte sur le pavé droit : le mot
                  doit exister avant d'être employé dans l'énoncé. */}
              <KnowledgeBrick
                id="pave-droit"
                variant="new"
                lead="Tu viens de compter le deuxième solide de la rangée : celui aux faces rectangulaires."
              />
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
                requires={['face-solide', 'arete', 'sommet-solide', 'pave-droit']}
                explain="Toujours 2 ! Pour tout solide à faces planes, faces + sommets − arêtes = 2. C’est une propriété générale, pas une coïncidence — elle sert à vérifier qu’on n’a rien oublié."
                explainWrong="6 + 8 − 12 = 2, exactement comme pour le cube. Cette égalité vaut pour tous les solides à faces planes, et c’est un bon moyen de contrôler ses comptes."
                solved={eulerDone}
                onAnswered={() => setEulerDone(true)}
              />

              {/* Le calcul vient d'être refait par l'élève sur deux solides :
                  la régularité constatée devient un outil de contrôle. Elle
                  n'existait auparavant que dans l'`explain`, donc trop tard. */}
              {eulerDone && (
                <KnowledgeBrick
                  id="controle-euler"
                  variant="new"
                  lead="Deux solides, deux fois le même résultat : ce n’est pas un hasard."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Tu sais nommer et compter les trois éléments d’un solide. Au
          module suivant, on ouvre la boîte et on l’étale sur la table.
        </KnowledgeSnapshot>
      }
    />
  );
}
