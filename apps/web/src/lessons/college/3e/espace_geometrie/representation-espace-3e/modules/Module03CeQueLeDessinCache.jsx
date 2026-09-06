import React, { useState } from 'react';
import { EyeOff, RefreshCw } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidTurner from '../components/SolidTurner';
import { SOLIDS, rotateSolid, visibleEdges, edgeName } from '../components/espaceUtils';

/**
 * Module 3 — DÉCOUVERTE, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              tourner le solide en surveillant UNE arête précise.
 * Mathematical objective ce qui est caché dépend du point de vue, pas de
 *                       l'objet : la même arête est tantôt visible, tantôt non.
 * Student action        tourner jusqu'à faire changer l'état de l'arête suivie.
 * Controlled variable   l'orientation seule.
 * Mathematical state    l'orientation ; `visibleEdges` décide de la visibilité.
 * Visual consequence    l'arête rouge passe de pointillé à plein sous les yeux.
 * Expected observation  « c'est la même arête, et elle change d'état ».
 * Misconception ciblée   croire qu'une arête est « une arête cachée » par
 *                       nature. Le statut est relatif au point de vue.
 * Feedback              on annonce l'état courant de l'arête suivie.
 */
const SUIVIE = [0, 4];   // l'arête [AE] du cube

export default function Module03CeQueLeDessinCache() {
  const [yaw, setYaw] = useState(30);
  const [pitch, setPitch] = useState(20);
  const [etats, setEtats] = useState(new Set());

  const turned = rotateSolid(SOLIDS.cube, { yaw, pitch });
  const { hidden } = visibleEdges(turned);
  const cachee = hidden.some(([i, j]) => (i === SUIVIE[0] && j === SUIVIE[1])
    || (i === SUIVIE[1] && j === SUIVIE[0]));

  const observer = (nYaw, nPitch) => {
    const t = rotateSolid(SOLIDS.cube, { yaw: nYaw, pitch: nPitch });
    const h = visibleEdges(t).hidden.some(([i, j]) => (i === SUIVIE[0] && j === SUIVIE[1])
      || (i === SUIVIE[1] && j === SUIVIE[0]));
    setEtats((s) => (s.has(h ? 'cachee' : 'visible') ? s : new Set([...s, h ? 'cachee' : 'visible'])));
  };
  const done1 = etats.size >= 2;

  const [q2, setQ2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Suis une seule arête',
      subtitle: `L’arête ${edgeName(SOLIDS.cube, SUIVIE)} est en rouge. Fais-la changer d’état.`,
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Ne regarde que l’arête rouge. Tourne le cube — vers la gauche, par exemple — jusqu’à
            ce qu’elle passe de <strong>plein</strong> à <strong>pointillé</strong>, ou l’inverse.
          </p>
          <SolidTurner
            solid={SOLIDS.cube}
            yaw={yaw}
            pitch={pitch}
            onYawChange={(v) => { setYaw(v); observer(v, pitch); if (etats.size >= 1) kit.react(true); }}
            onPitchChange={(v) => { setPitch(v); observer(yaw, v); if (etats.size >= 1) kit.react(true); }}
            selectedEdge={SUIVIE}
            showNames
            disabled={done1}
            ariaLabel="Cube à tourner, avec une arête suivie en rouge"
          />
          <div className={`rounded-xl border-2 p-3 text-center ${
            cachee ? 'border-slate-300 bg-slate-50' : 'border-emerald-300 bg-emerald-50'
          }`} aria-live="polite">
            <p className="text-sm">
              L’arête {edgeName(SOLIDS.cube, SUIVIE)} est actuellement{' '}
              <strong>{cachee ? 'CACHÉE (en pointillé)' : 'VISIBLE (en trait plein)'}</strong>
            </p>
          </div>
          {done1 ? (
            <Feedback tone="ok">
              Tu l’as vue dans les deux états. C’est pourtant <strong>toujours la même arête</strong> :
              elle n’est pas « une arête cachée » par nature. Être visible ou non dépend
              entièrement de l’endroit d’où on regarde.
            </Feedback>
          ) : (
            <Feedback tone="info">
              États observés : {etats.size} sur 2. Continue de tourner : il existe des angles où
              cette arête passe devant, et d’autres où elle passe derrière.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Prédire',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 text-center">
                Vue de face — on ne voit qu’une seule face
              </p>
              <SolidTurner solid={SOLIDS.cube} yaw={0} pitch={0} showNames
                ariaLabel="Cube vu strictement de face" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 text-center">
                Vue de trois quarts — on en voit trois
              </p>
              <SolidTurner solid={SOLIDS.cube} yaw={30} pitch={20} showNames
                ariaLabel="Cube vu de trois quarts" />
            </div>
          </div>
          <TapQuestion
            prompt="Vu strictement de face, le cube cache 8 arêtes ; vu de trois quarts, seulement 3. Pourquoi ?"
            options={[
              'De face on ne voit qu’une face (4 arêtes) ; de trois quarts on en voit trois, donc plus d’arêtes se retrouvent devant',
              'Parce que le cube devient plus petit quand on le tourne',
              'Parce que certaines arêtes disparaissent quand on tourne',
              'Parce que la vue de face est un carré',
            ]}
            correct={0}
            cols={1}
            explain="Une arête n’est visible que si au moins une des faces qui la portent est tournée vers nous. De face, une seule face est visible : ses 4 arêtes le sont, les 8 autres non. De trois quarts, trois faces sont visibles, et il ne reste que 3 arêtes derrière. Le cube, lui, a toujours ses 12 arêtes."
            explainWrong="Aucune arête ne disparaît jamais : les compteurs sous les dessins affichent 12 dans les deux cas. Ce qui change, c’est le nombre de faces tournées vers nous."
            requires={['arete-cachee', 'dessin-projection']}
            requires={['arete-cachee', 'dessin-projection']}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        {q2 && (
          <KnowledgeBrick
            id="cache-depend-du-point-de-vue"
            variant="new"
            compact
            lead="« Caché » n’est pas une propriété de l’arête : tu viens de le voir."
          />
        )}
            {q2 && (
              <KnowledgeBrick
                id="cache-depend-du-point-de-vue"
                variant="new"
                compact
                lead="« Caché » n’est pas une propriété de l’arête : tu viens de le voir."
              />
            )}        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Ce que le dessin cache"
      moduleSubtitle="Visible ou caché : cela dépend d’où l’on regarde"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Une arête sous surveillance',
        tone: 'emerald',
        body: (
          <p>
            Une seule arête, marquée en rouge. Tourne le cube et regarde-la changer d’état —{' '}
            <strong>sans que l’objet, lui, ait changé</strong>.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: EyeOff, t: 'Pointillé', d: 'L’arête passe derrière le solide.', c: 'text-slate-600' },
            { icon: RefreshCw, t: 'Tourner', d: 'Et elle repasse devant.', c: 'text-emerald-600' },
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
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Le point de vue décide de ce qu’on voit. Tournons l’objet
          pour en avoir le cœur net.
        </KnowledgeSnapshot>
      )}
    />
  );
}
