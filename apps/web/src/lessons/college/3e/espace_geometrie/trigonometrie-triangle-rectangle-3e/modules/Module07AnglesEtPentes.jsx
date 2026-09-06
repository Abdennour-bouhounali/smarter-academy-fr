import React, { useState } from 'react';
import { Accessibility, Mountain } from 'lucide-react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { solveAngle, solveSide, roundTenth, tanDeg } from '../components/trigoUtils';

/**
 * Module 7 — LABORATOIRE : trois situations réelles.
 *
 * Activity              la rampe d'accès aux normes, l'angle d'une échelle,
 *                       la hauteur d'un arbre par son ombre.
 * Mathematical objective reconnaître la configuration rectangle et choisir
 *                       entre calcul de longueur et calcul d'angle.
 * Misconception ciblée   confondre pourcentage de pente et angle : une pente
 *                       de 5 % n'est PAS un angle de 5°. C'est un contresens
 *                       courant, et l'étape 1 le traite explicitement.
 * Transfer              la dernière question mêle Pythagore et trigonométrie,
 *                       obligeant à choisir l'outil adapté.
 */
export default function Module07AnglesEtPentes() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const angleRampe = solveAngle({ ratio: 'tan', value: 0.05 });
  // Pied à 2 m : l'angle tombe à 70,5° — franchement DANS la plage de sécurité
// annoncée. À 1,5 m il valait 75,5°, qui s'arrondit à 76° et sortait de la
// plage, faisant passer une échelle correcte pour une échelle dangereuse.
const angleEchelle = solveAngle({ ratio: 'cos', value: 2 / 6 });
  const hauteurArbre = 14 * tanDeg(38);

  const steps = [
    {
      num: 1,
      title: 'La rampe aux normes',
      subtitle: 'Une pente de 5 %, ce n’est pas un angle de 5°.',
      done: q1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="pente-pourcentage"
            variant="new"
            lead="Une rampe accessible doit avoir une pente d’au plus 5 %. Encore faut-il savoir ce que ce pourcentage mesure."
          />
          <NumericQuestion
            prompt="À quel angle correspond une pente de 5 % ? (arrondi au dixième de degré)"
            suffix="°"
            expected={(n) => Math.abs(n - roundTenth(angleRampe)) < 0.11}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display={String(roundTenth(angleRampe)).replace('.', ',')}
            width="w-24"
            explain={`tan α = 0,05, donc α = arctan(0,05) ≈ ${String(roundTenth(angleRampe)).replace('.', ',')}°. Une pente de 5 % correspond donc à un angle de moins de 3° — bien plus faible que ce que le nombre « 5 » laisse croire.`}
            explainFor={(n) => (Math.abs(n - 5) < 0.3
              ? 'Attention au piège : 5 % est un RAPPORT (0,05), pas un angle. Il faut lui appliquer arctan pour obtenir des degrés.'
              : null)}
            requires={['pente-pourcentage', 'retrouver-angle']}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'L’échelle est-elle sûre ?',
      subtitle: 'Les consignes de sécurité donnent un angle, pas des longueurs.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Une échelle de <strong>6 m</strong> a son pied à <strong>2 m</strong> du mur. Les
              consignes recommandent un angle compris entre <strong>65°</strong> et{' '}
              <strong>75°</strong> avec le sol.
            </p>
          </div>
          <NumericQuestion
            prompt="Quel angle l’échelle forme-t-elle avec le sol, arrondi au degré ?"
            suffix="°"
            expected={(n) => Math.abs(n - Math.round(angleEchelle)) < 1.1}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display={String(Math.round(angleEchelle))}
            width="w-24"
            explain={`Adjacent (2) et hypoténuse (6) : c’est le cosinus. cos α = 2 ÷ 6 ≈ 0,33, donc α = arccos(0,33) ≈ ${Math.round(angleEchelle)}° — dans la plage recommandée, l’échelle est bien posée.`}
            explainFor={(n) => (Math.abs(n - 19.5) < 1.5
              ? 'Tu as sans doute calculé arcsin(0,33). Ici, 2 m est le côté ADJACENT à l’angle au sol, donc c’est le cosinus.'
              : null)}
            requires={['retrouver-angle', 'methode-choisir-rapport']}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La hauteur de l’arbre',
      subtitle: 'Angle et distance connus : quelle longueur cherche-t-on ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Depuis un point situé à <strong>14 m</strong> du pied d’un arbre, on vise sa cime
              sous un angle de <strong>38°</strong> par rapport à l’horizontale.
            </p>
          </div>
          <NumericQuestion
            prompt="Quelle est la hauteur de l’arbre, arrondie au dixième ?"
            suffix="m"
            expected={(n) => Math.abs(n - roundTenth(hauteurArbre)) < 0.11}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display={String(roundTenth(hauteurArbre)).replace('.', ',')}
            width="w-24"
            explain={`On connaît l’adjacent (14 m) et on cherche l’opposé (la hauteur) : c’est la TANGENTE. hauteur = 14 × tan 38° ≈ ${String(roundTenth(hauteurArbre)).replace('.', ',')} m.`}
            explainFor={(n) => {
              if (Math.abs(n - 14 * Math.sin(38 * Math.PI / 180)) < 0.3) return 'Tu as utilisé le sinus, qui suppose de connaître l’hypoténuse. Ici c’est la distance au sol (l’adjacent) qui est donnée : il faut la tangente.';
              if (Math.abs(n - 14 / Math.tan(38 * Math.PI / 180)) < 0.3) return 'Tu as divisé au lieu de multiplier. tan 38° = hauteur ÷ 14, donc hauteur = 14 × tan 38°.';
              return null;
            }}
            requires={['methode-choisir-rapport', 'sinus-cosinus-tangente']}
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
      moduleTitle="Angles et pentes"
      moduleSubtitle="La trigonométrie hors du cahier"
      estimatedTime="10 min"
      brief={{
        tag: 'Atelier',
        title: 'Des situations réelles',
        tone: 'rose',
        body: (
          <p>
            Une rampe, une échelle, un arbre. À chaque fois : quel est l’angle étudié, que
            connaît-on, et que cherche-t-on ?
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Accessibility, t: 'Une pente en %', d: 'C’est une tangente, pas un angle.', c: 'text-rose-600' },
            { icon: Mountain, t: 'Une hauteur', d: 'Depuis une distance et un angle de visée.', c: 'text-emerald-600' },
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
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>La suite.</strong> Tu sais lire une pente comme un rapport. Il ne reste qu’à
          tout mettre à l’épreuve.
        </KnowledgeSnapshot>
      )}
    />
  );
}
