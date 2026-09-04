import React, { useState } from 'react';
import { Eye, RotateCw } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidTurner from '../components/SolidTurner';
import { SOLIDS, hiddenCount } from '../components/espaceUtils';

/**
 * Module 1 — DÉCLENCHEUR : trois dessins, un seul objet ?
 *
 * Activity              comparer trois dessins d'un même cube sous des angles
 *                       différents, puis en tourner un pour vérifier.
 * Mathematical objective un dessin plat est une PROJECTION : le même solide
 *                       donne des dessins très différents selon le point de vue.
 * Student action        tourner le solide jusqu'à retrouver chaque dessin.
 * Mathematical state    l'orientation ; la visibilité en est déduite.
 * Visual consequence    les arêtes pointillées changent en tournant.
 * Expected observation  « ce sont trois dessins du même objet ».
 * Misconception ciblée   croire qu'un dessin différent signifie un objet
 *                       différent — et l'inverse, croire qu'un dessin
 *                       détermine l'objet à lui seul.
 * Formalization         la convention du pointillé est nommée à la fin.
 */
const VUES_CUBE = [
  { id: 'v1', yaw: 0, pitch: 0, label: 'Dessin 1' },
  { id: 'v2', yaw: 30, pitch: 20, label: 'Dessin 2' },
  { id: 'v3', yaw: -40, pitch: 25, label: 'Dessin 3' },
];

export default function Module01TroisDessins() {
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [tourne, setTourne] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Trois dessins',
      subtitle: 'Combien d’objets différents vois-tu ?',
      done: tourne,
      content: (kit) => (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-2">
            {VUES_CUBE.map((v) => (
              <div key={v.id} className="space-y-1">
                <p className="text-xs font-semibold text-slate-600 text-center">{v.label}</p>
                <SolidTurner solid={SOLIDS.cube} yaw={v.yaw} pitch={v.pitch}
                  ariaLabel={`${v.label} : un cube vu sous un certain angle`} />
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-700">
            Ces trois dessins ne se ressemblent pas. Pourtant… tourne le solide ci-dessous et
            essaie de retrouver chacun d’eux.
          </p>
          <SolidTurner
            solid={SOLIDS.cube}
            yaw={yaw}
            pitch={pitch}
            onYawChange={(v) => { setYaw(v); setTourne(true); kit.react(true); }}
            onPitchChange={(v) => { setPitch(v); setTourne(true); kit.react(true); }}
            disabled={tourne && false}
            ariaLabel="Cube que tu peux tourner librement"
          />
          {tourne ? (
            <Feedback tone="ok">
              C’est le <strong>même cube</strong> dans les trois cas. Ce qui change, ce n’est pas
              l’objet : c’est l’endroit d’où on le regarde. Un dessin plat ne montre qu’une vue
              parmi une infinité.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Utilise les deux réglages pour faire tourner le cube et compare avec les trois
              dessins du haut.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Les traits en pointillé',
      done: q2,
      content: (
        <div className="space-y-3">
          <SolidTurner solid={SOLIDS.cube} yaw={30} pitch={20}
            ariaLabel="Cube vu de trois quarts, trois arêtes en pointillé" />
          <TapQuestion
            prompt="Que représentent les traits en pointillé sur ce dessin ?"
            options={[
              'Des arêtes qui existent bel et bien, mais qu’on ne voit pas d’ici',
              'Des arêtes qui n’existent pas',
              'Des arêtes plus courtes que les autres',
              'Des plis dans le papier',
            ]}
            correct={0}
            cols={1}
            explain="Le pointillé est la convention du dessin technique : il montre les arêtes situées derrière le solide. Elles font partie de l’objet — c’est le dessin, et non l’objet, qui les cache."
            explainWrong="Un cube a toujours 12 arêtes, où qu’on le regarde. Le pointillé sert justement à ne pas les oublier quand elles passent derrière."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que le dessin ne change pas',
      done: q3,
      content: (
        <TapQuestion
          prompt="Quand on tourne un cube, qu’est-ce qui change et qu’est-ce qui reste ?"
          options={[
            'Les arêtes cachées changent, mais le cube a toujours 12 arêtes',
            'Le nombre d’arêtes change selon l’angle',
            'Rien ne change, le dessin est toujours identique',
            'Le nombre de faces augmente quand on le penche',
          ]}
          correct={0}
          cols={1}
          explain="Tourner ne modifie pas l’objet : ses 6 faces, 12 arêtes et 8 sommets restent. Seul change ce qu’on en voit — c’est-à-dire quelles arêtes passent derrière."
          explainWrong="Regarde les trois compteurs sous le dessin : ils n’ont pas bougé pendant que tu tournais. Ce sont des propriétés de l’objet, pas du dessin."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Trois dessins, un objet"
      moduleSubtitle="Un dessin plat n’est pas le solide"
      estimatedTime="8 min"
      brief={{
        tag: 'Déclencheur',
        title: 'L’atelier de l’architecte',
        tone: 'indigo',
        body: (
          <p>
            Trois dessins très différents arrivent sur le bureau. Combien de solides
            représentent-ils ? Tourne l’objet pour trancher.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Eye, t: 'Un point de vue', d: 'Chaque dessin montre une seule vue.', c: 'text-indigo-600' },
            { icon: RotateCw, t: 'Tourner pour savoir', d: 'Le solide, lui, ne change pas.', c: 'text-violet-600' },
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
      footer={
        <Feedback tone="ok">
          <strong>Retenons.</strong> Un dessin en perspective est une <strong>projection</strong> du
          solide : il perd de l’information. Les arêtes qu’on ne voit pas se dessinent en{' '}
          <strong>pointillé</strong> — elles existent, mais elles passent derrière.
        </Feedback>
      }
    />
  );
}
