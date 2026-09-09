import React, { useState } from 'react';
import { Ruler } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MilieuxLab from '../components/MilieuxLab';
import { TRIANGLES_MILIEUX, droiteDesMilieux, arrondi, fr } from '../components/triangles4e';

/**
 * Module 3 — MANIPULATION : deux nombres qui refusent de bouger.
 *
 * Activity              déformer le triangle en glissant le sommet A ; les
 *                       milieux I et J le suivent.
 * Mathematical objective (IJ) est parallèle à (BC), et IJ = BC ÷ 2.
 * Student action        relever l'angle et le rapport sur trois formes très
 *                       différentes.
 * Controlled variable   la position de A, et elle seule.
 * Mathematical state    les trois sommets. I et J sont DÉRIVÉS (calculés comme
 *                       milieux), jamais des poignées indépendantes : une
 *                       poignée qu'on pourrait décoller de son milieu
 *                       enseignerait que « milieu » est une décoration.
 * Visual consequence    le segment vert se redessine ; deux nombres restent
 *                       obstinément à 0,0° et 0,50.
 * Expected observation  « je déforme tout, ces deux-là ne changent pas ».
 * Misconception targeted confondre le milieu d'un côté et le pied d'une
 *                       hauteur — les marques de milieu sont dessinées, la
 *                       hauteur ne l'est pas.
 * Formalization         la propriété est écrite APRÈS les trois relevés, et
 *                       seulement là.
 *
 * POURQUOI ON DÉPLACE A ET NON B OU C. [BC] est le côté de RÉFÉRENCE, celui
 * auquel on compare : le laisser fixe permet à l'élève de voir que c'est le
 * segment vert qui s'ajuste, pas la référence qui se déplace sous lui. C'est
 * la même raison qui fait garder A et B fixes dans le labo signature.
 *
 * La leçon n'a PAS besoin ici du théorème de Pythagore : aucune longueur n'est
 * calculée, toutes sont mesurées. La leçon sœur `pythagore-4e` reste intacte.
 */
const DEPART = TRIANGLES_MILIEUX[0];

export default function Module03DeuxMilieuxUneDroite() {
  const [A, setA] = useState(DEPART.A);
  const [pred, setPred] = useState(null);
  const [releves, setReleves] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const B = DEPART.B;
  const C = DEPART.C;
  const m = droiteDesMilieux(A, B, C);

  const relever = () => {
    const cle = `${Math.round(A.x / 25)}-${Math.round(A.y / 25)}`;
    if (releves.some((r) => r.cle === cle)) return;
    setReleves((r) => [...r, {
      cle,
      angle: arrondi(m.angleAvecBC, 1),
      rapport: arrondi(m.rapport, 2),
      ij: arrondi(m.longIJ / 10, 1),
      bc: arrondi(m.longBC / 10, 1),
    }]);
  };

  const done1 = releves.length >= 3;

  // Le nombre que la question 3 demande : mesuré sur le triangle courant, pas
  // écrit à la main. Si la figure change, la réponse attendue change avec elle.
  const bcAffiche = arrondi(m.longBC / 10, 1);
  const ijAttendu = arrondi(bcAffiche / 2, 2);

  const lab = <MilieuxLab mode="direct" A={A} B={B} C={C} onA={setA} />;

  const steps = [
    {
      num: 1,
      title: 'Déforme, et relève trois formes',
      subtitle: 'Fais glisser le sommet A. Les points I et J restent les milieux, quoi que tu fasses.',
      done: done1,
      content: (
        <div className="space-y-3">
          {lab}
          <PredictionChips
            prompt="Tu vas déformer le triangle. Que va faire le segment vert par rapport au côté violet ?"
            options={[
              { id: 'garde', label: 'Il gardera la même direction' },
              { id: 'tourne', label: 'Il tournera avec le sommet' },
              { id: 'sais-pas', label: 'Impossible à dire' },
            ]}
            value={pred}
            onChange={setPred}
          />
          <button
            type="button"
            onClick={relever}
            className="min-h-[44px] w-full rounded-xl bg-sky-600 px-3 py-2 text-sm font-bold text-white hover:bg-sky-700"
          >
            Relever cette forme
          </button>
          {releves.length > 0 && (
            <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white p-3">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-1 text-left">forme</th>
                    <th className="pb-1 text-right">angle (IJ)–(BC)</th>
                    <th className="pb-1 text-right">IJ ÷ BC</th>
                  </tr>
                </thead>
                <tbody>
                  {releves.map((r, i) => (
                    <tr key={r.cle} className="border-t border-slate-100">
                      <td className="py-1 text-slate-500">n° {i + 1}</td>
                      <td className="py-1 text-right font-mono text-emerald-700">{fr(r.angle, 1)}°</td>
                      <td className="py-1 text-right font-mono font-bold text-slate-900">{fr(r.rapport, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!done1 && releves.length > 0 && (
            <Feedback tone="info">
              {releves.length} forme{releves.length > 1 ? 's' : ''} relevée
              {releves.length > 1 ? 's' : ''}. Déplace A NETTEMENT, puis relève-en{' '}
              {3 - releves.length} de plus.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois formes sans rapport les unes avec les autres, et deux colonnes qui ne bougent
              pas d’un chiffre : 0,0° et 0,50.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que dit la colonne de gauche',
      done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            L’angle entre (IJ) et (BC) est resté à 0° sur toutes tes formes. Que signifie un angle
            nul entre deux droites ?
          </p>
          <TapQuestion
            prompt="Un angle de 0° entre (IJ) et (BC) veut dire que…"
            options={[
              'les deux droites sont parallèles',
              'les deux droites sont perpendiculaires',
              'les deux droites sont confondues',
              'les deux droites ont la même longueur',
            ]}
            correct={0}
            cols={2}
            requires={['droites-paralleles']}
            explain="Deux droites qui font un angle nul ont la même direction : elles sont parallèles. Elles ne sont pas confondues pour autant — le segment vert est bien au-dessus du violet."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que dit la colonne de droite',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sur la figure ci-dessous, le côté [BC] mesure{' '}
            <strong className="font-mono">{fr(bcAffiche, 1)}</strong> unités.
          </p>
          {lab}
          <NumericQuestion
            prompt="D’après le rapport que tu as relevé trois fois, combien mesure [IJ] ?"
            expected={ijAttendu}
            parse={parseDec}
            suffix="unités"
            requires={['milieu-segment', 'droites-paralleles']}
            explain={`Le rapport IJ ÷ BC vaut 0,50 : IJ est la moitié de BC, donc ${fr(bcAffiche, 1)} ÷ 2 = ${fr(ijAttendu, 2)} unités.`}
            explainFor={(n) => {
              if (typeof n === 'number' && Math.abs(n - bcAffiche) < 0.05) {
                return 'Tu as recopié BC. Le rapport relevé vaut 0,50, pas 1 : [IJ] est deux fois plus court.';
              }
              if (typeof n === 'number' && Math.abs(n - bcAffiche * 2) < 0.1) {
                return 'Tu as doublé au lieu de partager. Un rapport de 0,50 veut dire « moitié ».';
              }
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="droite-des-milieux"
              variant="new"
              lead="Les deux constats que tu viens de faire ne font qu’une seule propriété."
            />
          )}
          {q3 && (
            <Feedback tone="info">
              Ici, ce sont les deux MILIEUX qui sont donnés, et on en déduit le parallélisme. Le
              module suivant part de l’autre bout.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Deux milieux, une droite"
      moduleSubtitle="Deux nombres qui refusent de bouger"
      estimatedTime="12 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'La piste des milieux',
        tone: 'indigo',
        body: (
          <>
            On marque le milieu de deux côtés, et on les joint. Le triangle, lui, tu peux le
            déformer autant que tu veux. <strong>Qu’est-ce qui va résister ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Les petits traits sur les côtés marquent les milieux : I et J ne peuvent pas se
            décoller de leur position, ce sont des points CALCULÉS. Le côté violet [BC] est la
            référence, il ne bouge pas.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
