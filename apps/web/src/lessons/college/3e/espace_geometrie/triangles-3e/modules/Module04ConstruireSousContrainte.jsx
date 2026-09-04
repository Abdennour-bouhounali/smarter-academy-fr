import React, { useState } from 'react';
import { Ruler, AlertOctagon } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CompassBuilder from '../components/CompassBuilder';
import TriangleLab from '../components/TriangleLab';
import {
  triangleInequality, thirdVertex, triangleKind, triangleTraits, baseAngles,
} from '../components/triangleUtils';

/**
 * Module 4 — MANIPULATION : construire un triangle sous contrainte.
 *
 * Activity              régler des longueurs (puis un angle) pour obtenir un
 *                       triangle imposé.
 * Mathematical objective une construction se pilote par des DONNÉES, et
 *                       certaines données sont incompatibles.
 * Student action        régler chaque longueur, diagnostiquer un énoncé faux.
 * Controlled variable   une donnée à la fois.
 * Mathematical state    le triplet de côtés ; le triangle en est déduit.
 * Visual consequence    le triangle se ferme, ou les arcs restent séparés.
 * Expected observation  « les données commandent la figure, pas l'inverse ».
 * Misconception ciblée   croire qu'un énoncé de construction est toujours
 *                       réalisable. L'étape 3 en propose un impossible, et
 *                       demande de DIRE pourquoi (réparer, pas subir).
 * Feedback              chaque écart est chiffré ; l'énoncé faux est expliqué.
 * Transfer              module 7 : conjecturer puis prouver.
 */
const CIBLE = { a: 5, b: 6, c: 7 };

export default function Module04ConstruireSousContrainte() {
  const [s, setS] = useState({ a: 3, b: 6, c: 7 });
  const done1 = s.a === CIBLE.a && s.b === CIBLE.b && s.c === CIBLE.c;

  const [p2, setP2] = useState([{ x: 70, y: 200 }, { x: 250, y: 200 }, { x: 200, y: 90 }]);
  const k2 = triangleKind(p2);
  const done2 = k2.id === 'isocele' && triangleTraits(p2).apex === 2;

  const [q3, setQ3] = useState(false);

  const bump = (key, delta) => setS((v) => ({ ...v, [key]: Math.max(1, Math.min(10, v[key] + delta)) }));

  const steps = [
    {
      num: 1,
      title: 'Construire ABC avec AB = 7, AC = 6, BC = 5',
      subtitle: 'Règle les trois longueurs demandées.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <CompassBuilder sides={s} />
          <div className="grid sm:grid-cols-3 gap-2">
            {[
              ['c', 'AB', CIBLE.c],
              ['b', 'AC', CIBLE.b],
              ['a', 'BC', CIBLE.a],
            ].map(([key, label, target]) => (
              <div key={key} className={`rounded-xl border-2 p-2 ${
                s[key] === target ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
              }`}>
                <p className="text-xs font-semibold text-slate-600 text-center mb-1">
                  {label} — visé : {target}
                </p>
                <div className="flex items-center gap-1 justify-center">
                  <button type="button" aria-label={`Diminuer ${label}`} disabled={done1}
                    onClick={() => bump(key, -1)}
                    className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">−</button>
                  <span className="w-9 text-center font-mono font-bold text-lg tabular-nums">{s[key]}</span>
                  <button type="button" aria-label={`Augmenter ${label}`} disabled={done1}
                    onClick={() => {
                      const next = { ...s, [key]: Math.min(10, s[key] + 1) };
                      setS(next);
                      if (next.a === CIBLE.a && next.b === CIBLE.b && next.c === CIBLE.c) kit.react(true);
                    }}
                    className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">+</button>
                </div>
              </div>
            ))}
          </div>
          {done1 ? (
            <Feedback tone="ok">
              Construit. Le procédé est celui du papier : on trace [AB], puis un arc de 6 depuis A
              et un arc de 5 depuis B ; leur intersection donne C. Les trois longueurs suffisent à
              déterminer le triangle.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Il reste à ajuster :{' '}
              {[['AB', s.c, CIBLE.c], ['AC', s.b, CIBLE.b], ['BC', s.a, CIBLE.a]]
                .filter(([, v, t]) => v !== t)
                .map(([n, v, t]) => `${n} (${v} au lieu de ${t})`)
                .join(', ')}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Construire un isocèle en C',
      subtitle: 'Place le sommet C pour que CA = CB.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            La base [AB] est <strong>verrouillée</strong> : seul C se déplace. Pour un isocèle en C,
            ce sont les côtés <strong>[CA] et [CB]</strong> qui doivent être égaux.
          </p>
          <TriangleLab
            points={p2}
            onPointsChange={(pts) => {
              setP2(pts);
              const k = triangleKind(pts);
              if (k.id === 'isocele' && triangleTraits(pts).apex === 2) kit.react(true);
            }}
            lockedIndices={[0, 1]}
            snapEqualSides
            showLengths
            disabled={done2}
            ariaLabel="Base verrouillée : place le sommet C pour obtenir un isocèle"
          />
          {done2 ? (
            <Feedback tone="ok">
              Isocèle en C. Remarque où tu as dû placer C : exactement au-dessus du milieu de [AB].
              Tous les points à égale distance de A et de B forment une droite — la médiatrice.
            </Feedback>
          ) : (
            <Feedback tone="info">
              CA = {Math.round(triangleTraits(p2).sides[2])} et CB = {Math.round(triangleTraits(p2).sides[1])}.
              Rapproche-les l’un de l’autre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un énoncé impossible',
      subtitle: 'Le professeur s’est trompé. Trouve où.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-3">
            <p className="text-sm text-amber-900">
              « Construis le triangle RST tel que <strong>RS = 3 cm</strong>,{' '}
              <strong>ST = 4 cm</strong> et <strong>RT = 9 cm</strong>. »
            </p>
          </div>
          <CompassBuilder sides={{ a: 3, b: 4, c: 9 }} ariaLabel="Arcs de rayons 4 et 3 sur une base de 9 : ils ne se rencontrent pas" />
          <TapQuestion
            prompt="Pourquoi cette construction est-elle impossible ?"
            options={[
              'Parce que 3 + 4 = 7, et 7 est plus petit que 9 : les deux petits côtés ne peuvent pas rejoindre les extrémités du grand.',
              'Parce que les trois longueurs devraient être égales.',
              'Parce qu’on ne peut pas construire un triangle avec des centimètres.',
              'Parce que 9 n’est pas un nombre pair.',
            ]}
            correct={0}
            cols={1}
            explain="C’est l’inégalité triangulaire du module 1 : le plus grand côté (9) dépasse la somme des deux autres (3 + 4 = 7). Les arcs restent séparés, aucun point ne convient. Pour réparer l’énoncé, il faudrait un troisième côté strictement inférieur à 7."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Construire sous contrainte"
      moduleSubtitle="Les données commandent la figure"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'L’atelier de construction',
        tone: 'violet',
        body: (
          <p>
            Trois constructions, dont une <strong>impossible</strong>. Ton travail n’est pas
            seulement de construire : c’est aussi de savoir dire quand on ne peut pas.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Ruler, t: 'Construire', d: 'Trois longueurs déterminent un triangle unique.', c: 'text-violet-600' },
            { icon: AlertOctagon, t: 'Diagnostiquer', d: 'Un énoncé peut être mathématiquement faux.', c: 'text-amber-600' },
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
          <strong>Retenons.</strong> Trois longueurs vérifiant l’inégalité triangulaire déterminent
          un triangle unique (à un retournement près). Le sommet d’un isocèle se trouve sur la
          médiatrice de la base : c’est l’ensemble des points équidistants de A et de B.
        </Feedback>
      }
    />
  );
}
