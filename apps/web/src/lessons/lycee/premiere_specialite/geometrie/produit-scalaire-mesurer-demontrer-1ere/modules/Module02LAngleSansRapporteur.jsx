import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MesureScene, { TONS } from '../components/MesureScene';
import {
  SCENES, dot, norm, cosAngle, angleVecteursDeg, angleEnDeg,
  parseSigned, fr, frVec,
} from '../components/theodoliteUtils';

/**
 * Module 2 — DÉCOUVERTE : d'où sortent les angles du théodolite (P1).
 *
 * Étape 1  la formule, obtenue en RETOURNANT celle du module amont. L'élève
 *          suit le calcul sur u(4 ; 3) et v(0 ; 5), dont le cosinus vaut 0,6
 *          EXACTEMENT — un nombre à juger, pas à recopier chiffre à chiffre.
 * Étape 2  le cas OBTUS : cos = −0,8, angle 143,13°. C'est le contre-exemple
 *          qui empêche de croire que la formule ne mesure que les angles aigus.
 * Étape 3  la lecture du SIGNE seul, sans calculatrice, sur quatre couples.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 le calcul mené sous les yeux →
 * briques `formule-cosinus-angle`, `methode-calculer-un-angle`, `mem-cosinus-angle` ;
 * étape 2 le constat du signe négatif → brique `regle-signe-cosinus` ; étape 3
 * la demande, désormais légitime.
 *
 * PÉRIMÈTRE : aucune longueur n'est calculée par le carré scalaire ici (c'est
 * le module 3), et aucune droite n'est écrite (module 4).
 */
const { aigu, droit, obtus } = SCENES.angle;

/** Toutes les valeurs citées sont RECALCULÉES — jamais écrites à la main. */
const COS_AIGU = cosAngle(aigu.u, aigu.v);
const DEG_AIGU = angleVecteursDeg(aigu.u, aigu.v);
const COS_OBTUS = cosAngle(obtus.u, obtus.v);
const DEG_OBTUS = angleVecteursDeg(obtus.u, obtus.v);

export default function Module02LAngleSansRapporteur() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="L’angle sans rapporteur"
      moduleSubtitle="Une division, et le produit scalaire rend un angle"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'La formule que le théodolite appliquait en coulisse',
        tone: 'indigo',
        body: (
          <p>
            Tu connais déjà <strong>u · v = ‖u‖ × ‖v‖ × cos θ</strong>. Cette égalité se lit dans les
            deux sens : elle donne le produit à partir de l’angle, mais aussi{' '}
            <strong>l’angle à partir du produit</strong>. Il suffit de diviser.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Retourner la formule',
          subtitle:
            'Les deux longueurs ne sont jamais nulles : on peut donc diviser les deux membres par leur produit.',
          done: q1,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900 space-y-2">
                <p className="font-mono text-center text-[15px]">u · v = ‖u‖ × ‖v‖ × cos θ</p>
                <p className="text-center text-xs">on divise les deux membres par ‖u‖ × ‖v‖</p>
                <p className="font-mono text-center text-[17px] font-bold">
                  cos θ = (u · v) ÷ (‖u‖ × ‖v‖)
                </p>
              </div>

              <MesureScene
                fleches={[
                  { id: 'u', v: aigu.u, color: TONS.u, nom: 'u' },
                  { id: 'v', v: aigu.v, color: TONS.v, nom: 'v' },
                ]}
                points={[{ id: 'O', x: 0, y: 0, nom: 'O', color: '#0f172a' }]}
                ariaLabel={`Deux flèches partant de l’origine : u ${frVec(aigu.u)} et v ${frVec(aigu.v)}. L’angle qu’elles forment mesure ${fr(DEG_AIGU)} degrés.`}
              />

              <div className="rounded-xl border border-violet-100 bg-white p-3 space-y-1 text-sm">
                <div className="text-xs text-slate-500">Le calcul, mené entièrement :</div>
                <div className="font-mono">u · v = {fr(aigu.u.x)} × {fr(aigu.v.x)} + {fr(aigu.u.y)} × {fr(aigu.v.y)} = <strong>{fr(dot(aigu.u, aigu.v))}</strong></div>
                <div className="font-mono">‖u‖ = {fr(norm(aigu.u))} et ‖v‖ = {fr(norm(aigu.v))}, donc ‖u‖ × ‖v‖ = <strong>{fr(norm(aigu.u) * norm(aigu.v))}</strong></div>
                <div className="font-mono text-violet-800">cos θ = {fr(dot(aigu.u, aigu.v))} ÷ {fr(norm(aigu.u) * norm(aigu.v))} = <strong>{fr(COS_AIGU)}</strong></div>
              </div>

              <NumericQuestion
                prompt={
                  <>
                    Le cosinus vaut <strong>{fr(COS_AIGU)}</strong>. À la calculatrice, combien vaut
                    l’angle θ, en degrés arrondis au centième ?
                  </>
                }
                expected={Number(fr(DEG_AIGU).replace('−', '-').replace(',', '.'))}
                parse={parseSigned}
                display={fr(DEG_AIGU)}
                requires={['formule-normes-angle', 'vocab-norme', 'formule-coordonnees-scalaire']}
                explain={`L’angle dont le cosinus vaut ${fr(COS_AIGU)} mesure ${fr(DEG_AIGU)}°. C’est exactement ce que le théodolite affichait — et il n’a rien mesuré sur le dessin.`}
                explainFor={(n) =>
                  n === dot(aigu.u, aigu.v)
                    ? `${fr(dot(aigu.u, aigu.v))} est le PRODUIT SCALAIRE, pas l’angle. Il reste à diviser par ${fr(norm(aigu.u) * norm(aigu.v))}, puis à lire l’angle correspondant.`
                    : null
                }
                solved={q1}
                onAnswered={() => setQ1(true)}
              />

              {q1 && (
                <>
                  <Feedback tone="ok">
                    Trois calculs — un produit scalaire, deux normes — et une division : l’angle
                    tombe. Aucun instrument de mesure n’est intervenu.
                  </Feedback>
                  <KnowledgeBrick
                    id="formule-cosinus-angle"
                    variant="new"
                    lead={<>La formule que tu viens d’obtenir en retournant celle que tu connaissais.</>}
                  />
                  <KnowledgeBrick
                    id="methode-calculer-un-angle"
                    variant="new"
                    compact
                    lead={<>Les cinq gestes, dans l’ordre.</>}
                  />
                  <KnowledgeBrick
                    id="mem-cosinus-angle"
                    variant="new"
                    lead={<>La seule chose à retenir par cœur de ce module.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Et quand l’angle dépasse 90° ?',
          subtitle:
            'Même formule, même division — mais cette fois le produit scalaire est négatif. Regarde ce que devient le cosinus.',
          done: q2,
          content: (
            <div className="space-y-3">
              <MesureScene
                fleches={[
                  { id: 'u', v: obtus.u, color: TONS.u, nom: 'u' },
                  { id: 'v', v: obtus.v, color: TONS.v, nom: 'v' },
                ]}
                points={[{ id: 'O', x: 0, y: 0, nom: 'O', color: '#0f172a' }]}
                ariaLabel={`Deux flèches partant de l’origine : u ${frVec(obtus.u)} et v ${frVec(obtus.v)}. Elles s’écartent de ${fr(DEG_OBTUS)} degrés, bien au-delà de l’angle droit.`}
              />
              <div className="rounded-xl border border-rose-100 bg-white p-3 space-y-1 text-sm">
                <div className="font-mono">u · v = {fr(obtus.u.x)} × {fr(obtus.v.x)} + {fr(obtus.u.y)} × {fr(obtus.v.y)} = <strong>{fr(dot(obtus.u, obtus.v))}</strong></div>
                <div className="font-mono">‖u‖ × ‖v‖ = {fr(norm(obtus.u))} × {fr(norm(obtus.v))} = {fr(norm(obtus.u) * norm(obtus.v))}</div>
                <div className="font-mono text-rose-800">cos θ = {fr(dot(obtus.u, obtus.v))} ÷ {fr(norm(obtus.u) * norm(obtus.v))} = <strong>{fr(COS_OBTUS)}</strong></div>
              </div>

              <NumericQuestion
                prompt={
                  <>
                    Le cosinus vaut <strong>{fr(COS_OBTUS)}</strong>. Combien mesure l’angle θ, en
                    degrés arrondis au centième ?
                  </>
                }
                expected={Number(fr(DEG_OBTUS).replace('−', '-').replace(',', '.'))}
                parse={parseSigned}
                display={fr(DEG_OBTUS)}
                requires={['formule-cosinus-angle']}
                explain={`${fr(DEG_OBTUS)}°. La calculatrice rend directement un angle entre 0° et 180° : il n’y a rien à retrancher, rien à corriger. Le signe négatif du cosinus a déjà fait tout le travail.`}
                explainFor={(n) =>
                  n > 0 && n < 90
                    ? `Un cosinus NÉGATIF donne forcément un angle de plus de 90°. Une réponse inférieure à 90° signifie qu’on a oublié le signe en chemin : ici cos θ = ${fr(COS_OBTUS)}, pas ${fr(-COS_OBTUS)}.`
                    : null
                }
                solved={q2}
                onAnswered={() => setQ2(true)}
              />

              {q2 && (
                <>
                  <Feedback tone="ok">
                    Les deux longueurs sont positives : c’est donc le cosinus SEUL qui porte le signe
                    du produit scalaire. Un produit négatif ⟹ un cosinus négatif ⟹ un angle de plus
                    de 90°. La formule marche partout, sans cas particulier.
                  </Feedback>
                  <KnowledgeBrick
                    id="regle-signe-cosinus"
                    variant="new"
                    lead={<>Ce que le signe du produit dit de l’angle, avant même de calculer.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le signe suffit souvent',
          subtitle:
            'Sans calculatrice : pour chaque couple, dis si l’angle est aigu, droit ou obtus. Un seul produit scalaire suffit.',
          done: q3,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p>Pour chaque couple de vecteurs, quel est le type de l’angle ?</p>}
                rows={[
                  {
                    id: 'a1',
                    label: 'u(3 ; 1) et v(2 ; 4)',
                    options: ['aigu', 'droit', 'obtus'],
                    correct: 0,
                    correction: '3 × 2 + 1 × 4 = 10, positif : l’angle est aigu, il mesure moins de 90°.',
                  },
                  {
                    id: 'a2',
                    label: `u${frVec(droit.u)} et v${frVec(droit.v)}`,
                    options: ['aigu', 'droit', 'obtus'],
                    correct: 1,
                    correction: `${fr(droit.u.x)} × ${fr(droit.v.x)} + ${fr(droit.u.y)} × ${fr(droit.v.y)} = 0 : le cosinus vaut 0, l’angle est droit — exactement 90°.`,
                  },
                  {
                    id: 'a3',
                    label: 'u(−2 ; 6) et v(4 ; 1)',
                    options: ['aigu', 'droit', 'obtus'],
                    correct: 2,
                    correction: '(−2) × 4 + 6 × 1 = −8 + 6 = −2, négatif : le cosinus est négatif, l’angle dépasse 90°. Il est presque droit, mais pas tout à fait.',
                  },
                  {
                    id: 'a4',
                    label: 'u(5 ; 0) et v(−1 ; −7)',
                    options: ['aigu', 'droit', 'obtus'],
                    correct: 2,
                    correction: '5 × (−1) + 0 × (−7) = −5, négatif : l’angle est obtus. Le zéro dans les coordonnées n’y change rien — c’est la SOMME qui compte.',
                  },
                ]}
                requires={['regle-signe-cosinus', 'formule-cosinus-angle']}
                feedback={({ allRight }) =>
                  allRight ? (
                    <>
                      Le réflexe : calculer le produit scalaire, regarder son signe, et ne sortir la
                      calculatrice que si l’on a besoin du nombre de degrés. Le signe seul répond
                      déjà à beaucoup de questions.
                    </>
                  ) : (
                    <>
                      Les deux longueurs sont toujours positives : le signe du produit scalaire EST
                      celui du cosinus. Positif ⟹ moins de 90°, nul ⟹ exactement 90°, négatif ⟹
                      plus de 90°. Aucun autre cas.
                    </>
                  )
                }
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Un angle dans une vraie figure',
          subtitle:
            'Un angle est porté par deux flèches issues du SOMMET, pas par deux points au hasard.',
          done: q4,
          content: (
            <div className="space-y-3">
              <MesureScene
                triangle={SCENES.distances}
                points={[
                  { id: 'A', ...SCENES.distances.A, nom: 'A', color: '#7c3aed' },
                  { id: 'B', ...SCENES.distances.B, nom: 'B', color: '#0284c7' },
                  { id: 'C', ...SCENES.distances.C, nom: 'C', color: '#d97706' },
                ]}
                ariaLabel={`Un triangle de sommets A ${frVec(SCENES.distances.A)}, B ${frVec(SCENES.distances.B)} et C ${frVec(SCENES.distances.C)}.`}
              />
              <TapQuestion
                prompt="Pour calculer l’angle en B de ce triangle, quelles sont les deux flèches à fabriquer ?"
                options={[
                  'BA et BC — les deux flèches qui PARTENT de B',
                  'AB et BC — en suivant le contour du triangle',
                  'AB et AC — les deux flèches qui partent de A',
                  'les coordonnées de B et celles de C, directement',
                ]}
                correct={0}
                cols={1}
                requires={['methode-calculer-un-angle', 'coordonnees-vecteur']}
                explain={`L’angle en B est celui que forment les deux côtés issus de B : il faut donc BA et BC, toutes deux avec B pour départ. Ici BA${frVec({ x: SCENES.distances.A.x - SCENES.distances.B.x, y: SCENES.distances.A.y - SCENES.distances.B.y })} et BC${frVec({ x: SCENES.distances.C.x - SCENES.distances.B.x, y: SCENES.distances.C.y - SCENES.distances.B.y })}, ce qui donne un angle de ${fr(angleEnDeg(SCENES.distances.A, SCENES.distances.B, SCENES.distances.C))}°.`}
                explainWrong="Le couple AB et BC suit bien le contour, mais AB part de A : les deux flèches ne partent pas du même point, et l’angle qu’elles forment n’est pas celui du triangle. Quant aux coordonnées des points, elles ne sont pas des flèches — il faut d’abord faire arrivée moins départ."
                solved={q4}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <Feedback tone="ok">
                  Le sommet donne le point de DÉPART des deux flèches. C’est la seule difficulté de la
                  méthode — le reste n’est qu’un produit scalaire, deux normes et une division.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La seconde formule.</strong> Le théodolite affichait aussi des longueurs. Elles
          sortent du même calcul, mais d’un cas particulier : une flèche multipliée par elle-même.
        </KnowledgeSnapshot>
      }
    />
  );
}
