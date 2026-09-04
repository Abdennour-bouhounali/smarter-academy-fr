import React, { useState } from 'react';
import { Move3d, Tags } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TriangleLab from '../components/TriangleLab';
import { FIGURES, triangleKind, triangleTraits, VERTEX_NAMES } from '../components/triangleUtils';

/**
 * Module 2 — DÉCOUVERTE, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              déformer un triangle et regarder son NOM changer.
 * Mathematical objective un triangle particulier est défini par une PROPRIÉTÉ
 *                       (des côtés égaux, un angle droit), pas par son allure.
 * Student action        déplacer un sommet.
 * Controlled variable   la position d'un seul sommet.
 * Mathematical state    les trois sommets ; le nom, les marques et les mesures
 *                       en sont tous DÉRIVÉS (triangleKind, triangleTraits).
 * Visual consequence    les barrettes d'égalité et la marque d'angle droit
 *                       apparaissent et disparaissent d'elles-mêmes.
 * Expected observation  « pour rester isocèle, il faut que ces deux côtés
 *                       restent égaux » — la condition devient tangible.
 * Misconception         « c'est isocèle parce que ça y ressemble » et « un
 *                       triangle est SOIT isocèle SOIT rectangle ». L'étape 3
 *                       construit un rectangle isocèle : les deux à la fois.
 * Feedback              l'écart entre les deux côtés est chiffré.
 * Scaffolding           aimantation activée : la cible est atteignable sans
 *                       adresse particulière.
 * Transfer              le vocabulaire sert aux modules 5 et 6.
 */
export default function Module02ChangeDeNom() {
  const [p1, setP1] = useState(FIGURES.quelconque);
  const k1 = triangleKind(p1);
  const done1 = k1.id === 'isocele' || k1.id === 'equilateral';

  const [p2, setP2] = useState(FIGURES.isocele);
  const k2 = triangleKind(p2);
  const done2 = k2.id === 'quelconque';

  const [p3, setP3] = useState([{ x: 70, y: 200 }, { x: 240, y: 200 }, { x: 120, y: 90 }]);
  const k3 = triangleKind(p3);
  const done3 = k3.id === 'rectangle' || k3.id === 'rectangle-isocele';

  const [q4, setQ4] = useState(false);

  const t1 = triangleTraits(p1);
  const gap1 = Math.min(
    Math.abs(t1.sides[0] - t1.sides[1]),
    Math.abs(t1.sides[1] - t1.sides[2]),
    Math.abs(t1.sides[0] - t1.sides[2])
  );

  const steps = [
    {
      num: 1,
      title: 'Rends-le isocèle',
      subtitle: 'Déplace un sommet jusqu’à ce que deux côtés soient égaux.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Ce triangle n’a aucune particularité. Bouge un sommet : le nom affiché sous la figure
            se recalcule tout seul. <strong>Personne ne l’écrit — il est déduit des longueurs.</strong>
          </p>
          <TriangleLab
            points={p1}
            onPointsChange={(pts) => {
              setP1(pts);
              const k = triangleKind(pts);
              if (k.id === 'isocele' || k.id === 'equilateral') kit.react(true);
            }}
            snapEqualSides
            showLengths
            disabled={done1}
            ariaLabel="Triangle à rendre isocèle en déplaçant un sommet"
          />
          {done1 ? (
            <Feedback tone="ok">
              {k1.label}. Les deux barrettes sur les côtés égaux sont apparues toutes seules :
              elles marquent une égalité <strong>constatée</strong>, pas décidée.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Écart le plus faible entre deux côtés : {Math.round(gap1)} px. Rapproche-les — la
              figure s’aimante quand tu es tout près.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Casse la propriété',
      subtitle: 'Ce triangle est isocèle. Fais-lui perdre son titre.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Question à se poser en bougeant : <em>qu’est-ce qui doit rester vrai pour qu’il reste
            isocèle ?</em>
          </p>
          <TriangleLab
            points={p2}
            onPointsChange={(pts) => {
              setP2(pts);
              if (triangleKind(pts).id === 'quelconque') kit.react(true);
            }}
            showLengths
            disabled={done2}
            ariaLabel="Triangle isocèle à déformer"
          />
          {done2 ? (
            <Feedback tone="ok">
              Les barrettes ont disparu en même temps que l’égalité des longueurs. Un triangle est
              isocèle <strong>tant que</strong> deux de ses côtés sont égaux : c’est une condition,
              pas une étiquette définitive.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Toujours {k2.label}. Éloigne franchement le sommet pour rendre les deux côtés
              nettement différents.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Les deux à la fois',
      subtitle: 'Obtiens un triangle rectangle — et regarde s’il peut être aussi isocèle.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <TriangleLab
            points={p3}
            onPointsChange={(pts) => {
              setP3(pts);
              const k = triangleKind(pts);
              if (k.id === 'rectangle' || k.id === 'rectangle-isocele') kit.react(true);
            }}
            snapRightAngle
            snapEqualSides
            showAngles
            disabled={done3}
            ariaLabel="Triangle à rendre rectangle en déplaçant un sommet"
          />
          {done3 ? (
            <Feedback tone="ok">
              {k3.label}. La petite marque carrée n’apparaît que lorsque l’angle vaut vraiment 90°.
              {k3.id === 'rectangle-isocele'
                ? ' Et tu as obtenu les deux propriétés en même temps : rectangle ET isocèle.'
                : ' Essaie maintenant d’avoir aussi deux côtés égaux : les deux propriétés peuvent coexister.'}
            </Feedback>
          ) : (
            <Feedback tone="info">
              Angles actuels : {triangleTraits(p3).angles.map((a) => `${Math.round(a)}°`).join(', ')}.
              Approche l’un d’eux de 90°.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Ce qui définit un triangle particulier',
      done: q4,
      content: (
        <TapQuestion
          prompt="Qu’est-ce qui fait qu’un triangle est isocèle ?"
          options={[
            'Deux de ses côtés ont la même longueur.',
            'Il a l’air symétrique quand on le regarde.',
            'Il possède un angle droit.',
            'Ses trois angles sont différents.',
          ]}
          correct={0}
          cols={1}
          explain="Isocèle = deux côtés de même longueur. C’est une condition vérifiable par la mesure, et c’est elle qui entraîne toutes les autres propriétés (notamment l’égalité des angles à la base)."
          explainWrong="L’allure ne définit rien : tu viens de voir un triangle perdre son nom sans changer beaucoup d’aspect. Seule l’égalité des longueurs compte."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le triangle qui change de nom"
      moduleSubtitle="Le nom est une conséquence, pas une étiquette"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Un laboratoire de triangles',
        tone: 'sky',
        body: (
          <p>
            Déforme, observe, recommence. Le nom affiché sous la figure est <strong>calculé</strong> à
            partir des longueurs et des angles : il ne peut pas mentir.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Move3d, t: 'Déforme', d: 'Un sommet suffit pour tout changer.', c: 'text-sky-600' },
            { icon: Tags, t: 'Observe le nom', d: 'Il se recalcule à chaque déplacement.', c: 'text-violet-600' },
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
          <strong>Retenons.</strong> Un triangle <strong>isocèle</strong> a deux côtés de même
          longueur ; un <strong>équilatéral</strong> les trois ; un <strong>rectangle</strong> a un
          angle droit. Ces propriétés ne s’excluent pas : un triangle peut être rectangle et isocèle.
        </Feedback>
      }
    />
  );
}
