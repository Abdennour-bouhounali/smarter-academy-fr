import React, { useState } from 'react';
import { Hammer, CircleSlash } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CompassBuilder from '../components/CompassBuilder';
import { triangleInequality } from '../components/triangleUtils';

/**
 * Module 1 — DÉCLENCHEUR : trois poutres qui refusent de se rejoindre.
 *
 * Activity              régler trois longueurs et regarder les arcs du compas.
 * Mathematical objective l'inégalité triangulaire, découverte comme la
 *                       condition pour que deux arcs se croisent.
 * Student action        changer la longueur du plus grand côté.
 * Controlled variable   une longueur à la fois.
 * Mathematical state    le triplet {a, b, c} ; le sommet C en est DÉDUIT.
 * Visual consequence    les arcs s'écartent, se touchent, puis se croisent.
 * Expected observation  « il y a un seuil » — et ce seuil est une somme.
 * Misconception         « avec trois longueurs quelconques on fait toujours un
 *                       triangle ». L'étape 1 la contredit immédiatement.
 * Feedback              on nomme ce qui se passe (arcs disjoints / tangents /
 *                       sécants), jamais un « faux » sec.
 * Formalization         l'énoncé arrive à l'étape 3, après la manipulation.
 * Transfer              sert au module 4 (constructions sous contrainte).
 */
export default function Module01TroisPoutres() {
  const [c, setC] = useState(8);              // le grand côté, réglable
  const a = 3;
  const b = 4;
  const verdict = triangleInequality(a, b, c);
  const done1 = verdict.ok;                   // il faut atteindre un triangle réel

  const [batch, setBatch] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Deux poutres trop courtes',
      subtitle: 'Le mur AB mesure 8. Les poutres mesurent 3 et 4. Fais-les se rejoindre.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le charpentier veut un triangle : un mur [AB], et deux poutres de 3 et 4 qui se
            rejoignent en un point C. Les arcs montrent où chaque poutre peut atteindre.
            <strong> Raccourcis le mur</strong> jusqu’à ce que les poutres se touchent.
          </p>
          <CompassBuilder sides={{ a, b, c }} />
          <div className="flex items-center gap-2 justify-center flex-wrap">
            <span className="text-sm font-semibold text-slate-700">Longueur du mur AB</span>
            <button type="button" aria-label="Raccourcir le mur" disabled={c <= 2}
              onClick={() => {
                const next = Math.max(2, c - 1);
                setC(next);
                if (triangleInequality(a, b, next).ok) kit.react(true);
              }}
              className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">−</button>
            <span className="w-10 text-center text-xl font-mono font-bold tabular-nums">{c}</span>
            <button type="button" aria-label="Allonger le mur" disabled={c >= 10}
              onClick={() => setC((v) => Math.min(10, v + 1))}
              className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">+</button>
          </div>
          {done1 ? (
            <Feedback tone="ok">
              À {c}, les deux arcs se croisent et le triangle apparaît. Regarde le seuil :
              3 + 4 = 7. Tant que le mur dépassait 7, les poutres n’étaient pas assez longues
              pour se rejoindre — <strong>même bout à bout</strong>.
            </Feedback>
          ) : verdict.degenerate ? (
            <Feedback tone="info">
              À 7 exactement, les deux poutres se touchent bout à bout : 3 + 4 = 7. Le « triangle »
              est complètement aplati, C est sur le mur. Raccourcis encore d’un cran.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Mur = {c}. Les poutres mesurent 3 + 4 = 7 en tout : il leur manque {c - 7} pour
              franchir la distance. Les arcs restent séparés.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Lesquels sont constructibles ?',
      subtitle: 'Applique ce que tu viens de voir.',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <p className="text-sm text-slate-700">
              Pour chaque triplet de longueurs, dis si le triangle existe. Compare le plus grand
              côté à la somme des deux autres.
            </p>
          }
          rows={[
            {
              id: 't1', label: '5, 6 et 10',
              options: ['Constructible', 'Impossible'],
              correct: 0,
              correction: '5 + 6 = 11, et 11 > 10 : les deux petits côtés dépassent le grand, les arcs se croisent.',
            },
            {
              id: 't2', label: '2, 3 et 9',
              options: ['Constructible', 'Impossible'],
              correct: 1,
              correction: '2 + 3 = 5, bien moins que 9 : même bout à bout, les deux côtés n’atteignent pas. Impossible.',
            },
            {
              id: 't3', label: '4, 4 et 8',
              options: ['Constructible', 'Impossible'],
              correct: 1,
              correction: '4 + 4 = 8 exactement : les deux côtés se touchent bout à bout, le triangle est aplati. Ce n’est pas un vrai triangle.',
            },
            {
              id: 't4', label: '7, 7 et 7',
              options: ['Constructible', 'Impossible'],
              correct: 0,
              correction: '7 + 7 = 14 > 7 : largement constructible. C’est le triangle équilatéral.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Tu compares bien le plus grand côté à la somme des deux autres — y compris le cas limite où ils sont égaux.'
                : `${nCorrect} sur ${total}. Le test est toujours le même : le plus grand côté doit être STRICTEMENT plus petit que la somme des deux autres.`}
            </Feedback>
          )}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Dire la règle',
      done: q3,
      content: (
        <TapQuestion
          prompt="Comment énoncer la condition que tu viens de découvrir ?"
          options={[
            'Le plus grand côté doit être plus court que la somme des deux autres.',
            'Les trois côtés doivent avoir des longueurs différentes.',
            'La somme des trois côtés doit être un nombre pair.',
            'Le plus grand côté doit être plus long que la somme des deux autres.',
          ]}
          correct={0}
          cols={1}
          explain="C’est l’inégalité triangulaire. Géométriquement : le chemin direct d’un point à un autre est toujours plus court que le détour par un troisième point."
          explainWrong="Ce que tu as vu à l’écran : quand le mur dépassait 3 + 4, les arcs ne se rejoignaient plus. C’est bien le plus GRAND côté qui doit rester plus court que la somme des deux autres."
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
      moduleTitle="Trois poutres"
      moduleSubtitle="Quand un triangle refuse d’exister"
      estimatedTime="8 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Le chantier de la charpente',
        tone: 'indigo',
        body: (
          <p>
            Trois longueurs, un triangle ? Pas toujours. Le compas du charpentier va te montrer
            exactement quand c’est impossible — et pourquoi.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Hammer, t: 'Le compas', d: 'Chaque arc montre où une poutre peut atteindre.', c: 'text-indigo-600' },
            { icon: CircleSlash, t: 'Le refus', d: 'Si les arcs ne se croisent pas, il n’y a pas de triangle.', c: 'text-rose-600' },
          ].map(({ icon: Icon, t, d, c: col }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${col}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Inégalité triangulaire.</strong> Trois longueurs forment un triangle si et
          seulement si la plus grande est strictement inférieure à la somme des deux autres.
          Si elle lui est égale, le triangle est aplati ; si elle est plus grande, il n’existe pas.
        </Feedback>
      }
    />
  );
}
