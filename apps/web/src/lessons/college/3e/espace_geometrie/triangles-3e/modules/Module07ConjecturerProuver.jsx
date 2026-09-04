import React, { useState } from 'react';
import { FlaskConical, Stamp } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MidlineLab from '../components/MidlineLab';
import { FIGURES, midlineOf } from '../components/triangleUtils';

/**
 * Module 7 — LABORATOIRE : conjecturer, vérifier, puis prouver.
 *
 * Activity              déformer un triangle et relever le rapport IJ / BC.
 * Mathematical objective la droite des milieux : (IJ) ∥ (BC) et IJ = BC / 2.
 * Student action        déformer, puis « tamponner » la mesure obtenue.
 * Controlled variable   la forme entière du triangle.
 * Mathematical state    les milieux, le rapport, le verdict de parallélisme —
 *                       tous calculés par `midlineOf`.
 * Visual consequence    les chevrons de parallélisme ne disparaissent jamais,
 *                       et les rapports tamponnés donnent tous 0,50.
 * Expected observation  « ça marche pour tous les triangles » — la conjecture
 *                       naît de l'accumulation de preuves, pas d'un exemple.
 * Misconception ciblée   « c'est vrai parce que je l'ai vu une fois ». Trois
 *                       tampons sur des formes différentes sont exigés.
 * Formalization         l'étape 2 nomme la propriété ; l'étape 3 l'applique.
 * Transfer              un problème où la propriété fait gagner un calcul.
 */
export default function Module07ConjecturerProuver() {
  const [pts, setPts] = useState(FIGURES.quelconque);
  const [stamps, setStamps] = useState([]);
  const [tooSimilar, setTooSimilar] = useState(false);
  const m = midlineOf(pts);
  const done1 = stamps.length >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  /**
   * Un relevé ne compte que si la forme a VRAIMENT changé — sinon trois
   * tampons identiques ne prouveraient rien. On compare la signature complète
   * du triangle (ses trois longueurs), et non la seule base : un sommet peut
   * buter contre le bord du cadre et ne plus faire varier BC que de quelques
   * pixels, alors que la figure, elle, a bel et bien changé de forme.
   */
  const shapeKey = (p) => {
    const [A2, B2, C2] = p;
    const d = (u, v) => Math.hypot(u.x - v.x, u.y - v.y);
    return [d(A2, B2), d(B2, C2), d(C2, A2)];
  };

  const stamp = (react) => {
    const entry = {
      ij: Math.round(m.ij),
      bc: Math.round(m.bc),
      ratio: m.ratio.toFixed(2).replace('.', ','),
      sig: shapeKey(pts),
    };
    const isNew = !stamps.some((s) => {
      const diff = s.sig.reduce((acc, v, i) => acc + Math.abs(v - entry.sig[i]), 0);
      return diff < 25;
    });
    if (!isNew) return false;
    const next = [...stamps, entry];
    setStamps(next);
    react(true);
    return true;
  };

  const steps = [
    {
      num: 1,
      title: 'Trois relevés, trois formes',
      subtitle: 'Déforme le triangle, puis garde la mesure. Recommence trois fois.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            I est le milieu de [AB], J celui de [AC]. Déplace n’importe quel sommet et observe
            les deux longueurs, puis <strong>garde le relevé</strong>.
          </p>
          <MidlineLab
            points={pts}
            onPointsChange={setPts}
            stamps={stamps}
            disabled={done1}
            ariaLabel="Triangle avec sa droite des milieux : déforme-le librement"
          />
          {!done1 && (
            <button
              type="button"
              onClick={() => {
                if (!stamp(kit.react)) setTooSimilar(true);
                else setTooSimilar(false);
              }}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700
                         text-white font-semibold min-h-[44px]"
            >
              Garder ce relevé ({stamps.length}/3)
            </button>
          )}
          {done1 ? (
            <Feedback tone="ok">
              Trois triangles très différents, trois fois le même rapport : <strong>0,50</strong>.
              Et les chevrons verts n’ont jamais disparu — (IJ) est resté parallèle à (BC) tout du
              long. Ce n’est pas une coïncidence : c’est une propriété.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Relevé actuel : IJ = {Math.round(m.ij)}, BC = {Math.round(m.bc)}, rapport{' '}
              {m.ratio.toFixed(2).replace('.', ',')}.
              {stamps.length > 0 && ' Change franchement la forme avant de garder le suivant.'}
            {tooSimilar && ' — Cette forme est trop proche d’un relevé déjà gardé : déplace un sommet plus loin.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Énoncer la conjecture',
      done: q2,
      content: (
        <TapQuestion
          prompt="Que peux-tu affirmer sur le segment joignant les milieux de deux côtés ?"
          options={[
            'Il est parallèle au troisième côté et mesure la moitié de sa longueur.',
            'Il est perpendiculaire au troisième côté.',
            'Il mesure la même longueur que le troisième côté.',
            'Cela dépend de la forme du triangle.',
          ]}
          correct={0}
          cols={1}
          explain="C’est le théorème de la droite des milieux. Tes trois relevés donnaient tous un rapport de 0,50, et le parallélisme n’a jamais été pris en défaut — quelle que soit la forme du triangle."
          explainWrong="Regarde tes relevés : IJ était chaque fois la moitié de BC, et les chevrons indiquaient un parallélisme constant. Ni perpendiculaire, ni égal, ni variable."
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'S’en servir',
      subtitle: 'La propriété évite un calcul.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Dans un triangle MNP, R est le milieu de [MN] et S le milieu de [MP].
              On sait que <strong>NP = 17 cm</strong>.
            </p>
          </div>
          <NumericQuestion
            prompt="Combien mesure RS ?"
            suffix="cm"
            expected={8.5}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display="8,5"
            width="w-24"
            explain="R et S sont les milieux de deux côtés : [RS] est donc la droite des milieux, et RS = NP ÷ 2 = 17 ÷ 2 = 8,5 cm. Aucun autre renseignement n’est nécessaire."
            explainFor={(n) => (n === 34
              ? 'Tu as multiplié par 2 au lieu de diviser : le segment des milieux est plus COURT que le côté, il en vaut la moitié.'
              : n === 17 ? 'RS n’est pas égal à NP : il en vaut la moitié.' : null)}
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
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Conjecturer, puis prouver"
      moduleSubtitle="Une propriété vraie pour tous les triangles"
      estimatedTime="10 min"
      brief={{
        tag: 'Atelier',
        title: 'La droite des milieux',
        tone: 'rose',
        body: (
          <p>
            Un exemple ne prouve rien. Trois exemples très différents qui donnent tous le même
            résultat : voilà une <strong>conjecture</strong> qui mérite d’être retenue.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: FlaskConical, t: 'Expérimenter', d: 'Déforme, mesure, recommence.', c: 'text-rose-600' },
            { icon: Stamp, t: 'Accumuler', d: 'Trois relevés valent mieux qu’un seul.', c: 'text-emerald-600' },
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
          <strong>Théorème de la droite des milieux.</strong> Dans un triangle, le segment joignant
          les milieux de deux côtés est parallèle au troisième côté et mesure la moitié de sa
          longueur.
        </Feedback>
      }
    />
  );
}
