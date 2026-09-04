import React, { useState } from 'react';
import { PencilRuler } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SOLIDS, projectCavaliere, visibleEdges, CAVALIERE_ANGLES, CAVALIERE_K } from '../components/espaceUtils';

/**
 * Module 6 — FORMALISATION : les règles de la perspective cavalière.
 *
 * Activity              régler l'angle de fuite et le coefficient, et observer
 *                       ce qui change dans le dessin.
 * Mathematical objective la perspective cavalière est une CONVENTION, avec des
 *                       règles précises : la face avant est en vraie grandeur,
 *                       les fuyantes sont parallèles entre elles et réduites.
 * Student action        changer les deux paramètres.
 * Visual consequence    le dessin s'incline et s'allonge, mais la face avant
 *                       ne bouge jamais.
 * Misconception ciblée   croire qu'un dessin en perspective respecte les
 *                       longueurs réelles partout, ou que les angles droits
 *                       du solide restent droits sur le dessin.
 * Formalization         les trois règles sont énoncées ici.
 */
const BOX = { w: 260, h: 220 };
const CENTER = { x: 120, y: 120 };

function CavaliereView({ angle, k }) {
  const s = SOLIDS.cube;
  const { visible, hidden } = visibleEdges(s);
  const P = s.vertices.map((p) => {
    const q = projectCavaliere(p, { angle, k });
    return { x: CENTER.x + q.x, y: CENTER.y + q.y };
  });
  const line = ([i, j], dashed) => (
    <line key={`${i}-${j}-${dashed}`} x1={P[i].x} y1={P[i].y} x2={P[j].x} y2={P[j].y}
      stroke="#0f172a" strokeWidth="2.2" strokeDasharray={dashed ? '6 4' : undefined}
      opacity={dashed ? 0.45 : 1} strokeLinecap="round" />
  );
  return (
    <svg viewBox={`0 0 ${BOX.w} ${BOX.h}`} role="img"
      className="w-full max-w-[300px] mx-auto bg-white rounded-xl border-2 border-slate-200"
      aria-label={`Cube en perspective cavalière, fuyante à ${angle} degrés, coefficient ${k}`}>
      <g style={{ pointerEvents: 'none' }}>
        {/* La face avant, en vraie grandeur — elle ne bouge jamais. */}
        <polygon points={[0, 1, 2, 3].map((i) => `${P[i].x},${P[i].y}`).join(' ')}
          fill="#dbeafe" fillOpacity="0.8" stroke="none" />
        {hidden.map((e) => line(e, true))}
        {visible.map((e) => line(e, false))}
        <text x={CENTER.x - 50} y={CENTER.y + 66} fontSize="11"
          className="font-mono" fill="#1d4ed8">face avant</text>
      </g>
    </svg>
  );
}

export default function Module06PerspectiveCavaliere() {
  const [angle, setAngle] = useState(45);
  const [k, setK] = useState(0.5);
  const [essais, setEssais] = useState(new Set(['45-0.5']));
  const done1 = essais.size >= 3;

  const [batch, setBatch] = useState(false);

  const setParams = (a, kk, react) => {
    setAngle(a);
    setK(kk);
    const key = `${a}-${kk}`;
    if (!essais.has(key)) { setEssais((s) => new Set([...s, key])); react(true); }
  };

  const steps = [
    {
      num: 1,
      title: 'Régler la fuyante',
      subtitle: 'Change l’angle et le coefficient. Que reste-t-il identique ?',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <CavaliereView angle={angle} k={k} />
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600">Angle de fuite</p>
              <div className="flex gap-1.5 flex-wrap">
                {CAVALIERE_ANGLES.map((a) => (
                  <button key={a} type="button" onClick={() => setParams(a, k, kit.react)}
                    disabled={done1}
                    className={`px-3 py-2 rounded-lg border-2 min-h-[44px] text-sm font-semibold ${
                      angle === a ? 'border-violet-400 bg-violet-50 text-violet-800'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}>{a}°</button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600">Coefficient de réduction</p>
              <div className="flex gap-1.5 flex-wrap">
                {CAVALIERE_K.map((kk) => (
                  <button key={kk} type="button" onClick={() => setParams(angle, kk, kit.react)}
                    disabled={done1}
                    className={`px-3 py-2 rounded-lg border-2 min-h-[44px] text-sm font-semibold ${
                      k === kk ? 'border-violet-400 bg-violet-50 text-violet-800'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}>{String(kk).replace('.', ',')}</button>
                ))}
              </div>
            </div>
          </div>
          {done1 ? (
            <Feedback tone="ok">
              Quoi que tu règles, la <strong>face avant</strong> reste un carré en vraie grandeur.
              Seules les fuyantes changent : leur inclinaison suit l’angle, leur longueur le
              coefficient. Les valeurs usuelles sont 45° et 0,5.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Réglages essayés : {essais.size} sur 3. Surveille la face bleue pendant que tu changes
              les paramètres.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Les règles du dessin',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <p className="text-sm text-slate-700">
              Dans un cube dessiné en perspective cavalière, vrai ou faux ?
            </p>
          }
          rows={[
            {
              id: 'r1', label: 'La face avant est dessinée en vraie grandeur',
              options: ['Vrai', 'Faux'],
              correct: 0,
              correction: 'C’est la règle de base : la face parallèle au plan du dessin garde ses longueurs et ses angles droits.',
            },
            {
              id: 'r2', label: 'Les fuyantes sont toutes parallèles entre elles',
              options: ['Vrai', 'Faux'],
              correct: 0,
              correction: 'Toutes les arêtes qui s’enfoncent sont dessinées parallèles, avec le même angle et le même raccourcissement.',
            },
            {
              id: 'r3', label: 'Les angles droits du solide restent droits sur le dessin',
              options: ['Faux', 'Vrai'],
              correct: 0,
              correction: 'Seuls ceux de la face avant le restent. Les autres sont déformés — c’est le prix à payer pour représenter du volume sur une feuille.',
            },
            {
              id: 'r4', label: 'Les fuyantes sont dessinées plus courtes qu’en réalité',
              options: ['Vrai', 'Faux'],
              correct: 0,
              correction: 'Elles sont réduites par le coefficient (souvent 0,5). Sans cette réduction, le dessin paraîtrait démesurément profond.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Les quatre règles sont acquises — y compris celle qu’on oublie : les angles droits ne sont pas conservés.'
                : `${nCorrect} sur ${total}. Souviens-toi de ce que tu viens de manipuler : seule la face avant est intacte.`}
            </Feedback>
          )}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="La perspective cavalière"
      moduleSubtitle="Une convention, avec ses règles"
      estimatedTime="9 min"
      brief={{
        tag: 'Formalisation',
        title: 'Comment on dessine le volume',
        tone: 'blue',
        body: (
          <p>
            Représenter un objet en volume sur une feuille plate suppose de{' '}
            <strong>choisir une convention</strong>. Celle du collège s’appelle la perspective
            cavalière, et elle a trois règles.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 space-y-2">
          <div className="flex gap-2 items-center">
            <PencilRuler className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <p className="font-bold text-blue-900">Les trois règles</p>
          </div>
          <ol className="text-sm text-blue-900 space-y-1 list-decimal pl-5">
            <li>La face avant est dessinée en <strong>vraie grandeur</strong>.</li>
            <li>Les fuyantes sont <strong>parallèles entre elles</strong>, à un angle choisi (souvent 45°).</li>
            <li>
              Elles sont <strong>réduites</strong> par un coefficient (souvent 0,5), et les arêtes
              cachées se dessinent en pointillé.
            </li>
          </ol>
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Ce qu’il faut accepter.</strong> Un dessin en perspective déforme : les angles
          droits du solide ne sont pas tous droits sur la feuille, et les fuyantes sont raccourcies.
          C’est une représentation, pas une photographie.
        </Feedback>
      }
    />
  );
}
