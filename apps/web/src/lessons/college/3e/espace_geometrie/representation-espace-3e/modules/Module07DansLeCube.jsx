import React, { useState } from 'react';
import { Box, GitBranch } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidTurner from '../components/SolidTurner';
import {
  SOLIDS, PAIRES_CUBE, positionOf, POSITION_LABEL, edgeName,
} from '../components/espaceUtils';

/**
 * Module 7 — LABORATOIRE : raisonner dans l'espace.
 *
 * Activity              déterminer la position relative de couples d'arêtes
 *                       d'un cube, en tournant pour vérifier.
 * Mathematical objective dans l'espace, deux droites peuvent n'être NI
 *                       parallèles NI sécantes — cas qui n'existe pas dans le
 *                       plan.
 * Student action        classer chaque couple, puis tourner pour contrôler.
 * Mathematical state    le cube ; chaque réponse est CALCULÉE par
 *                       `relativePosition`, jamais écrite à la main.
 * Misconception ciblée   croire que deux droites qui ne se coupent pas sont
 *                       forcément parallèles — vrai dans le plan, faux dans
 *                       l'espace.
 * Feedback              on nomme le cas et on renvoie au dessin.
 * Transfer              c'est le raisonnement des sections et des plans.
 */
export default function Module07DansLeCube() {
  const [selected, setSelected] = useState(PAIRES_CUBE[2]);
  const [yaw, setYaw] = useState(30);
  const [pitch, setPitch] = useState(20);
  const [explore, setExplore] = useState(false);

  const [batch, setBatch] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Deux arêtes qui ne se rencontrent jamais',
      subtitle: 'Et qui ne sont pourtant pas parallèles.',
      done: explore,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Les arêtes {edgeName(SOLIDS.cube, selected.a)} et {edgeName(SOLIDS.cube, selected.b)}{' '}
            sont en rouge. Tourne le cube : tu ne trouveras aucun angle où elles se croisent, et
            pourtant elles ne sont pas parallèles.
          </p>
          <SolidTurner
            solid={SOLIDS.cube}
            yaw={yaw}
            pitch={pitch}
            onYawChange={(v) => { setYaw(v); setExplore(true); kit.react(true); }}
            onPitchChange={(v) => { setPitch(v); setExplore(true); kit.react(true); }}
            selectedEdge={selected.a}
            showNames
            ariaLabel="Cube avec deux arêtes mises en évidence"
          />
          <SolidTurner
            solid={SOLIDS.cube}
            yaw={yaw}
            pitch={pitch}
            selectedEdge={selected.b}
            showNames
            ariaLabel="Le même cube, avec la seconde arête mise en évidence"
          />
          {explore ? (
            <Feedback tone="ok">
              {edgeName(SOLIDS.cube, selected.a)} et {edgeName(SOLIDS.cube, selected.b)} sont{' '}
              <strong>{POSITION_LABEL[positionOf(selected)]}</strong>. Dans le plan, deux droites
              qui ne se coupent pas sont forcément parallèles. Dans l’espace, il existe un
              troisième cas — et le voici.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Tourne le cube et cherche un point de vue où ces deux arêtes se croiseraient. Tu n’en
              trouveras pas : elles ne sont pas dans un même plan.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Classer cinq couples',
      subtitle: 'Parallèles, sécantes, ou ni l’un ni l’autre ?',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <div className="space-y-2">
              <SolidTurner solid={SOLIDS.cube} yaw={30} pitch={20} showNames
                ariaLabel="Cube ABCDEFGH vu de trois quarts, sommets nommés" />
              <p className="text-xs text-slate-600 text-center">
                ABCD est la face avant, EFGH la face arrière (E derrière A).
              </p>
            </div>
          }
          rows={PAIRES_CUBE.map((p) => {
            const pos = positionOf(p);
            const options = ['Parallèles', 'Sécantes', 'Ni parallèles ni sécantes'];
            const idx = pos === 'paralleles' ? 0 : pos === 'secantes' ? 1 : 2;
            return {
              id: p.id,
              label: `Les droites ${p.question}`,
              options,
              correct: idx,
              correction: `Elles sont ${POSITION_LABEL[pos]}.${
                pos === 'non-coplanaires'
                  ? ' Elles n’appartiennent à aucun plan commun : c’est le cas propre à l’espace.'
                  : pos === 'paralleles'
                    ? ' Elles ont la même direction et restent à écart constant.'
                    : ' Elles se rencontrent en un sommet du cube.'
              }`,
            };
          })}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Tu distingues les trois cas — y compris celui qui n’existe pas dans le plan.'
                : `${nCorrect} sur ${total}. Demande-toi d’abord : ces deux droites sont-elles dans un même plan ? Si non, elles ne sont ni parallèles ni sécantes.`}
            </Feedback>
          )}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Ce que l’espace ajoute',
      done: q3,
      content: (
        <TapQuestion
          prompt="Dans le plan, deux droites qui ne se coupent pas sont parallèles. Est-ce encore vrai dans l’espace ?"
          options={[
            'Non : elles peuvent aussi être non coplanaires, comme deux arêtes du cube',
            'Oui, c’est toujours vrai',
            'Oui, sauf si elles sont confondues',
            'Cela dépend de la taille du solide',
          ]}
          correct={0}
          cols={1}
          explain="C’est la grande nouveauté de la géométrie dans l’espace. Deux droites peuvent ne jamais se rencontrer sans être parallèles : il leur suffit de ne pas appartenir à un même plan. Un cube en offre de nombreux exemples."
          explainWrong="Tu viens d’en manipuler un contre-exemple : deux arêtes du cube qui ne se croisent jamais et n’ont pourtant pas la même direction."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Dans le cube"
      moduleSubtitle="Le troisième cas, celui qui n’existe pas dans le plan"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'Raisonner dans l’espace',
        tone: 'rose',
        body: (
          <p>
            Deux droites du plan sont soit sécantes, soit parallèles. Dans l’espace, il existe un{' '}
            <strong>troisième cas</strong> — et le cube en est plein.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Box, t: 'Le cube', d: 'Un laboratoire de positions relatives.', c: 'text-rose-600' },
            { icon: GitBranch, t: 'Trois cas', d: 'Parallèles, sécantes, non coplanaires.', c: 'text-violet-600' },
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
          <strong>Retenons.</strong> Dans l’espace, deux droites sont soit <strong>sécantes</strong>,
          soit <strong>parallèles</strong>, soit <strong>non coplanaires</strong> — c’est-à-dire
          qu’elles ne se rencontrent jamais sans pour autant avoir la même direction.
        </Feedback>
      }
    />
  );
}
