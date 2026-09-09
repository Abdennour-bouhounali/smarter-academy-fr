import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CoordPlane from '../../../../../common/components/CoordPlane';
import {
  REPERE_REFUGES, BORNE, REFUGES, plusProche, estParallelogramme, couple, fr,
} from '../components/reperage4e';

/**
 * Module 6 — PRACTICE LAB : trancher par les coordonnées.
 *
 * Ce module n'enseigne pas une technique de plus : il fait DÉCIDER. Une borne
 * d'appel, trois refuges, et une question à laquelle l'œil répond mal — le
 * refuge qui PARAÎT le plus proche arrive deuxième. Seul le calcul tranche.
 * Les erreurs n'y comptent pas comme preuve (stage `practice_lab`).
 *
 * POURQUOI DES CARRÉS, ET PAS DES LONGUEURS. Comparer `écart_x² + écart_y²`
 * suffit à classer : la fonction carré est croissante sur les positifs, donc
 * le plus petit carré désigne le plus petit éloignement. On évite ainsi
 * d'écrire la moindre racine — la formule de la longueur est un objet de 3e.
 * La contrainte de programme rend ici le calcul PLUS simple, pas moins.
 *
 * REJOUABLE : les trois refuges se calculent dans n'importe quel ordre, et
 * rien ne se fige après une réponse.
 */
export default function Module06DeciderParLesCoordonnees() {
  const [calcules, setCalcules] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const etude = plusProche(BORNE, REFUGES);
  const done1 = calcules.length === REFUGES.length;

  const calculer = (id) => setCalcules((c) => (c.includes(id) ? c : [...c, id]));

  // Le quadrilatère du dernier pas : celui-ci N'EST PAS un parallélogramme,
  // et c'est le calcul qui doit le dire — la figure, elle, est trompeuse.
  const Q = {
    A: { x: -4, y: -2 }, B: { x: -1, y: -3 }, C: { x: 3, y: 1 }, D: { x: 0, y: 3 },
  };
  const bilanQ = estParallelogramme(Q.A, Q.B, Q.C, Q.D);

  const steps = [
    {
      num: 1,
      title: 'Quel refuge est le plus proche ?',
      subtitle: 'Une borne d’appel en (−1 ; 1), trois refuges. Ne réponds pas à l’œil.',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-2">
            <CoordPlane
              range={{
                xMin: REPERE_REFUGES.xMin, xMax: REPERE_REFUGES.xMax,
                yMin: REPERE_REFUGES.yMin, yMax: REPERE_REFUGES.yMax,
              }}
              unit={26}
              unitY={26}
              xStep={REPERE_REFUGES.xStep}
              yStep={REPERE_REFUGES.yStep}
              points={[
                /* La borne ne porte PAS de nom sur la figure : posée juste à
                   gauche de l'axe vertical, son étiquette recouvrait les
                   graduations (audit de mise en page). Elle est identifiée
                   par le sous-titre, par sa couleur sombre et par les trois
                   segments qui en partent. */
                { id: 'borne', x: BORNE.x, y: BORNE.y, color: '#0f172a' },
                /* Sur la FIGURE, une initiale suffit : les noms complets
                   (« du Col », « des Pins ») chevauchaient les graduations de
                   l'axe — défaut relevé par l'audit de mise en page. Le nom
                   entier reste lisible dans les cartes sous le repère, où
                   rien ne peut le recouvrir. */
                ...REFUGES.map((r) => ({ id: r.id, x: r.x, y: r.y, name: r.lettre, color: '#0891b2' })),
              ]}
              segments={REFUGES.map((r) => ({
                id: `s${r.id}`, from: BORNE, to: { x: r.x, y: r.y },
                color: '#94a3b8', dashed: true,
              }))}
              caption={false}
              ariaLabel="Une borne d’appel et trois refuges dans un repère"
            />
          </div>

          {REFUGES.map((r) => {
            const m = etude.mesures.find((x) => x.point.id === r.id);
            const vu = calcules.includes(r.id);
            return (
              <div key={r.id} className="rounded-2xl border-2 border-slate-200 bg-white p-3.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-slate-700">
                    <span className="font-mono text-cyan-700">{r.lettre}</span> — {r.nom}
                  </span>
                  <span className="font-mono text-sm text-slate-500">{couple(r, 0)}</span>
                </div>
                {!vu ? (
                  <button
                    type="button"
                    onClick={() => calculer(r.id)}
                    className="mt-2 min-h-[44px] w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
                  >
                    Calculer les deux écarts
                  </button>
                ) : (
                  <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-center font-mono text-sm tabular-nums">
                    écart x = {fr(m.dx, 0)} · écart y = {fr(m.dy, 0)}
                    <div className="mt-0.5 text-slate-700">
                      {fr(m.dx, 0)}² + {fr(m.dy, 0)}² = <strong>{fr(m.carre, 0)}</strong>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {done1 && (
            <Feedback tone="ok">
              Les trois carrés valent {etude.classement.map((m) => fr(m.carre, 0)).join(', ')}. Le
              plus petit désigne le {etude.gagnant.nom} — alors que le{' '}
              {etude.classement[1].nom} semblait plus proche sur le dessin.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi les carrés suffisent',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Pour comparer deux éloignements, pourquoi peut-on se contenter de comparer écart_x² + écart_y² ?"
            options={[
              'Parce que le plus petit de ces nombres correspond toujours au plus petit éloignement',
              'Parce que les carrés sont plus faciles à calculer que les écarts',
              'Parce que les deux écarts sont toujours égaux',
              'Parce que cela donne directement la distance',
            ]}
            correct={0}
            cols={1}
            requires={['parallelogramme-milieux', 'coordonnee-decimale']}
            explain="Comparer des carrés revient à comparer les éloignements eux-mêmes : plus l’un est grand, plus l’autre l’est. Le classement est donc le même, et on n’a besoin d’aucune racine."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="decider-par-coordonnees"
              variant="new"
              lead="Ce que tu viens de faire vaut pour n’importe quelle comparaison d’éloignements."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un quadrilatère qui trompe',
      subtitle: 'A(−4 ; −2), B(−1 ; −3), C(3 ; 1), D(0 ; 3). Il a tout l’air d’un parallélogramme.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-2">
            <CoordPlane
              range={{ xMin: -5, xMax: 4, yMin: -4, yMax: 4 }}
              unit={30}
              unitY={30}
              xStep={1}
              yStep={1}
              points={[
                { id: 'A', x: Q.A.x, y: Q.A.y, name: 'A', color: '#0f172a' },
                { id: 'B', x: Q.B.x, y: Q.B.y, name: 'B', color: '#0f172a' },
                { id: 'C', x: Q.C.x, y: Q.C.y, name: 'C', color: '#0f172a' },
                { id: 'D', x: Q.D.x, y: Q.D.y, name: 'D', color: '#0f172a' },
              ]}
              segments={[
                { id: 'AB', from: Q.A, to: Q.B, color: '#7e22ce' },
                { id: 'BC', from: Q.B, to: Q.C, color: '#7e22ce' },
                { id: 'CD', from: Q.C, to: Q.D, color: '#7e22ce' },
                { id: 'DA', from: Q.D, to: Q.A, color: '#7e22ce' },
                { id: 'dAC', from: Q.A, to: Q.C, color: '#0891b2', dashed: true },
                { id: 'dBD', from: Q.B, to: Q.D, color: '#e11d48', dashed: true },
              ]}
              caption={false}
              ariaLabel="Un quadrilatère ABCD et ses deux diagonales"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border-2 border-cyan-200 bg-cyan-50 p-2.5">
              <div className="text-xs font-semibold text-cyan-600">milieu de [AC]</div>
              <div className="font-mono text-base font-black text-cyan-900">
                {couple(bilanQ.milieuAC, 2)}
              </div>
            </div>
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-2.5">
              <div className="text-xs font-semibold text-rose-600">milieu de [BD]</div>
              <div className="font-mono text-base font-black text-rose-900">
                {couple(bilanQ.milieuBD, 2)}
              </div>
            </div>
          </div>
          <NumericQuestion
            prompt="Pour que ABCD soit un parallélogramme, quelle devrait être l’ordonnée de D ?"
            expected={2}
            parse={parseDec}
            requires={['parallelogramme-milieux']}
            explain="Le milieu de [AC] est (−0,5 ; −0,5). Pour que celui de [BD] lui soit égal, il faut que l’ordonnée de D vérifie (−3 + y) ÷ 2 = −0,5, donc y = 2. Avec y = 3, la figure n’est pas un parallélogramme, malgré les apparences."
            explainFor={(n) => {
              if (n === 3) return 'C’est l’ordonnée ACTUELLE de D — précisément celle qui ne convient pas : les deux milieux diffèrent.';
              if (n === -0.5) return 'Tu as donné l’ordonnée du MILIEU de [AC], pas celle du point D.';
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              Un écart d’une demi-unité sur un seul sommet, invisible à l’œil, et la figure n’est
              plus un parallélogramme. C’est pour cela qu’on calcule.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Décider par les coordonnées"
      moduleSubtitle="Trancher sans règle ni compas"
      estimatedTime="6 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'La borne d’appel',
        tone: 'slate',
        body: (
          <>
            Un randonneur est blessé près d’une borne d’appel. Trois refuges autour.{' '}
            <strong>Vers lequel l’envoyer ?</strong> Les erreurs ne comptent pas ici.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <Compass className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            On calcule pour chaque refuge l’écart horizontal et l’écart vertical, puis la somme de
            leurs carrés. Le plus petit gagne — même s’il ne le semble pas.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
