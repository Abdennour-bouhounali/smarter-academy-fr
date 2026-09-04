import React, { useState } from 'react';
import { Stamp, Move } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ThalesLab from '../components/ThalesLab';
import {
  FIGURES, thalesPoint, constructN, ratiosOf,
} from '../components/thalesUtils';

/**
 * Module 3 — DÉCOUVERTE, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              faire glisser M et relever les trois rapports.
 * Mathematical objective quand (MN) ∥ (BC), les trois rapports AM/AB, AN/AC et
 *                       MN/BC sont égaux, quelle que soit la position de M.
 * Student action        déplacer M, tamponner, recommencer.
 * Controlled variable   la position de M seule (N est CONSTRUIT).
 * Mathematical state    les trois rapports, calculés par `ratiosOf`.
 * Visual consequence    les trois nombres changent ensemble et restent égaux.
 * Expected observation  « ils bougent tous les trois, mais ils restent égaux ».
 * Misconception ciblée   croire que ce sont les LONGUEURS qui se conservent.
 *                       Les trois cases affichent des rapports, pas des cm.
 * Feedback              trois cases distinctes, jamais un verdict global seul.
 *
 * C'EST L'AJOUT MAJEUR DE LA REFONTE : la version pré-kit faisait bouger la
 * figure sans jamais afficher un seul rapport.
 */
export default function Module03RapportsQuiNeBougentPas() {
  const [k, setK] = useState(0.35);
  const [stamps, setStamps] = useState([]);
  const fig = FIGURES.triangle;

  const M = thalesPoint(fig.A, fig.B, k);
  const N = constructN(fig.A, fig.B, fig.C, M);
  const r = ratiosOf(fig.A, fig.B, fig.C, M, N);
  const f = (v) => (v === null ? '—' : v.toFixed(2).replace('.', ','));

  const stamp = (react) => {
    if (stamps.some((s) => Math.abs(s.k - k) < 0.12)) return false;
    setStamps((ss) => [...ss, { k, am: f(r.am), an: f(r.an), mn: f(r.mn) }]);
    react(true);
    return true;
  };
  const done1 = stamps.length >= 3;

  const [q2, setQ2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Trois positions, trois relevés',
      subtitle: 'Fais glisser M sur (AB). Les trois rapports sont affichés en permanence.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            N n’est pas libre : il est <strong>construit</strong> pour que (MN) reste parallèle à
            (BC). Déplace M et surveille les trois cases.
          </p>
          <ThalesLab
            figure={fig}
            k={k}
            onKChange={setK}
            mode="parallel"
            stamps={stamps}
            disabled={done1}
            ariaLabel="Configuration de Thalès : fais glisser M et compare les trois rapports"
          />
          {!done1 && (
            <button
              type="button"
              onClick={() => stamp(kit.react)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700
                         text-white font-semibold min-h-[44px]"
            >
              Relever ces rapports ({stamps.length}/3)
            </button>
          )}
          {done1 ? (
            <Feedback tone="ok">
              Trois positions très différentes de M. À chaque fois, les <strong>trois</strong>{' '}
              rapports affichent le même nombre. Les longueurs, elles, ont toutes changé — ce sont
              bien les <em>rapports</em> qui se conservent.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Rapports actuels : {f(r.am)} · {f(r.an)} · {f(r.mn)}.
              {stamps.length > 0 && ' Déplace franchement M avant le relevé suivant.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Écrire l’égalité',
      done: q2,
      content: (
        <div className="space-y-3">
          <ThalesLab figure={fig} k={0.45} mode="parallel" disabled
            ariaLabel="Configuration de Thalès figée, avec ses trois rapports égaux" />
          <TapQuestion
            prompt="Quelle égalité résume ce que tu viens de constater ?"
            options={[
              '$\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}$',
              '$\\frac{AM}{AB} = \\frac{AC}{AN} = \\frac{MN}{BC}$',
              '$AM = AN = MN$',
              '$\\frac{AM}{MB} = \\frac{AN}{NC} = \\frac{MN}{BC}$',
            ]}
            renderOption={(o) => <MathText>{o}</MathText>}
            optionLabel={(i) => [
              'AM/AB = AN/AC = MN/BC',
              'AM/AB = AC/AN = MN/BC',
              'AM = AN = MN',
              'AM/MB = AN/NC = MN/BC',
            ][i]}
            correctionLabel="AM/AB = AN/AC = MN/BC"
            correct={0}
            cols={1}
            explain="Chaque rapport compare un petit segment à son grand correspondant, TOUJOURS dans le même ordre : le petit au-dessus, le grand en dessous, et les deux partant du même sommet A. La troisième fraction compare les deux segments parallèles."
            explainWrong="Attention à l’ordre : si tu écris AC/AN, tu inverses une des fractions et l’égalité devient fausse. Chaque rapport se lit « petit sur grand », en partant toujours de A."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Les rapports qui ne bougent pas"
      moduleSubtitle="Trois nombres qui changent ensemble et restent égaux"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'L’invariant de Thalès',
        tone: 'emerald',
        body: (
          <p>
            Toutes les longueurs de la figure changent quand tu déplaces M. Trois quotients, eux,
            restent obstinément égaux entre eux. <strong>C’est le cœur de la leçon.</strong>
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Move, t: 'Déplace M', d: 'N suit, en gardant (MN) parallèle à (BC).', c: 'text-emerald-600' },
            { icon: Stamp, t: 'Relève', d: 'Trois positions valent mieux qu’une.', c: 'text-violet-600' },
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
          <strong>Théorème de Thalès.</strong> Si (MN) est parallèle à (BC), alors{' '}
          <MathText>{'$\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}$'}</MathText>. Les longueurs
          changent, ces trois rapports restent égaux.
        </Feedback>
      }
    />
  );
}
