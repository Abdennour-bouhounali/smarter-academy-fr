import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TheodoliteLab from '../components/TheodoliteLab';
import MesureScene from '../components/MesureScene';
import {
  SCENES, TRIANGLE_DEPART, cotes, carreScalaire, longueurParScalaire,
  alKashiCarre, vec, parseSigned, fr, frVec,
} from '../components/theodoliteUtils';

/**
 * Module 3 — ATELIER : la longueur par le carré scalaire (P2).
 *
 * Étape 1  le GESTE d'abord — l'élève ramène le théodolite à un côté de
 *          longueur ENTIÈRE et lit le couple (carré, longueur). Le carré est
 *          la valeur exacte, la longueur sa racine.
 * Étape 2  la formule ‖AB‖² = AB · AB, appliquée sur le triangle du module.
 * Étape 3  comparer des CARRÉS, jamais des racines arrondies — le piège des
 *          deux côtés à 1,4 % l'un de l'autre.
 * Étape 4  Al-Kashi, quand l'énoncé ne donne pas de coordonnées mais deux
 *          longueurs et l'angle entre elles. Et le contrôle : à 90°, Al-Kashi
 *          redevient Pythagore.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 le geste puis le constat → brique
 * `formule-carre-scalaire-longueur` et `mem-carre-scalaire` ; étape 3 le
 * constat des deux carrés distincts → brique `regle-carres-entiers` ; étape 4
 * la démonstration menée → brique `regle-al-kashi`.
 *
 * MANIPULATION JAMAIS GELÉE : le théodolite de l'étape 1 reste pilotable après
 * validation. Seul demeure le verrou d'ANTÉRIORITÉ des étapes suivantes.
 *
 * PÉRIMÈTRE : aucune équation de droite ici (module 4), aucune démonstration
 * de nature (module 5).
 */
const { A, B, C } = SCENES.distances;
const AB2 = carreScalaire(vec(A, B));
const BC2 = carreScalaire(vec(B, C));
const CA2 = carreScalaire(vec(C, A));
const { ab: KAB, ac: KAC, angleA: KANG } = SCENES.alKashi;
const KBC2 = alKashiCarre(KAB, KAC, KANG);

export default function Module03LaLongueurSansRegle() {
  const [t1, setT1] = useState(TRIANGLE_DEPART);
  const [s1, setS1] = useState('B');
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  /** Le côté AB du triangle de départ : longueur 5 exactement, carré 25. */
  const cotesDepart = cotes(TRIANGLE_DEPART);
  const abDepart = cotesDepart.find((c) => c.id === 'AB');

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="La longueur sans règle"
      moduleSubtitle="Une flèche multipliée par elle-même rend le carré de sa longueur"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Le même calcul, mais avec la MÊME flèche deux fois',
        tone: 'indigo',
        body: (
          <p>
            Le produit scalaire prend deux flèches. Rien n’interdit de lui donner{' '}
            <strong>deux fois la même</strong>. L’angle vaut alors 0°, le cosinus vaut 1, et il ne
            reste que la longueur multipliée par elle-même.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le carré et la racine',
          subtitle:
            'Reprends le théodolite. Sous chaque longueur, une ligne « carré = … » : c’est ce nombre-là qui est exact. Lis le couple du côté AB.',
          done: q1,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
                Ce que la ligne « carré » affiche : le produit scalaire de la flèche du côté par
                elle-même. C’est un ENTIER quand les sommets sont sur la grille. La longueur juste
                au-dessus n’en est que la racine, arrondie à deux décimales.
              </div>
              <TheodoliteLab
                triangle={t1}
                onChange={setT1}
                sommetActif={s1}
                onSommetActif={setS1}
                montrerAngles={false}
                montrerPastille={false}
              />
              <NumericQuestion
                prompt={
                  <>
                    Avec le triangle de départ — A(−3 ; −2), B(2 ; −2), C(0 ; 3) — que vaut le{' '}
                    <strong>carré</strong> du côté AB, tel que le panneau l’affiche ?
                  </>
                }
                expected={abDepart.carre}
                parse={parseSigned}
                display={fr(abDepart.carre)}
                requires={['vocab-produit-scalaire', 'coordonnees-vecteur', 'formule-norme']}
                explain={`AB${frVec(vec(TRIANGLE_DEPART.A, TRIANGLE_DEPART.B))}, donc AB · AB = ${fr(vec(TRIANGLE_DEPART.A, TRIANGLE_DEPART.B).x)}² + ${fr(vec(TRIANGLE_DEPART.A, TRIANGLE_DEPART.B).y)}² = ${fr(abDepart.carre)}. Et la longueur affichée juste au-dessus, ${fr(abDepart.longueur)}, en est bien la racine.`}
                explainFor={(n) =>
                  n === abDepart.longueur
                    ? `${fr(abDepart.longueur)} est la LONGUEUR, pas son carré. La ligne du dessous affiche ${fr(abDepart.carre)} — et ${fr(abDepart.longueur)}² = ${fr(abDepart.carre)}.`
                    : null
                }
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <>
                  <Feedback tone="ok">
                    Le produit scalaire rend <strong>{fr(abDepart.carre)}</strong>, et la longueur en
                    est la racine. C’est toujours dans cet ordre — jamais l’inverse.
                  </Feedback>
                  <KnowledgeBrick
                    id="formule-carre-scalaire-longueur"
                    variant="new"
                    lead={<>La formule que la ligne « carré » applique. Continue de déformer la figure en la lisant.</>}
                  />
                  <KnowledgeBrick
                    id="mem-carre-scalaire"
                    variant="new"
                    lead={<>À retenir par cœur, avec sa racine finale.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Trois côtés, trois carrés',
          subtitle: 'Sur un triangle donné par ses sommets, la méthode se déroule sans figure.',
          done: q2,
          content: (
            <div className="space-y-3">
              <MesureScene
                triangle={SCENES.distances}
                points={[
                  { id: 'A', ...A, nom: 'A', color: '#7c3aed' },
                  { id: 'B', ...B, nom: 'B', color: '#0284c7' },
                  { id: 'C', ...C, nom: 'C', color: '#d97706' },
                ]}
                ariaLabel={`Un triangle de sommets A ${frVec(A)}, B ${frVec(B)} et C ${frVec(C)}.`}
              />
              <div className="rounded-xl border border-sky-100 bg-white p-3 space-y-1 text-sm">
                <div className="font-mono">AB{frVec(vec(A, B))} → AB² = {fr(AB2)}, donc AB = {fr(longueurParScalaire(A, B))}</div>
                <div className="font-mono">BC{frVec(vec(B, C))} → BC² = {fr(BC2)}, donc BC ≈ {fr(longueurParScalaire(B, C))}</div>
              </div>
              <NumericQuestion
                prompt={
                  <>
                    À toi le troisième : CA{frVec(vec(C, A))}. Combien vaut <strong>CA²</strong> ?
                  </>
                }
                expected={CA2}
                parse={parseSigned}
                display={fr(CA2)}
                requires={['formule-carre-scalaire-longueur', 'coordonnees-vecteur']}
                explain={`CA · CA = ${fr(vec(C, A).x)}² + ${fr(vec(C, A).y)}² = ${fr(vec(C, A).x ** 2)} + ${fr(vec(C, A).y ** 2)} = ${fr(CA2)}. La longueur vaut donc √${fr(CA2)} ≈ ${fr(longueurParScalaire(C, A))} — un nombre qu’aucune règle graduée ne lirait aussi précisément.`}
                explainFor={(n) =>
                  n < 0
                    ? 'Un carré scalaire ne peut jamais être négatif : les deux coordonnées sont élevées au carré, leur signe disparaît.'
                    : null
                }
                solved={q2}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <Feedback tone="ok">
                  Trois flèches, trois produits scalaires, trois carrés. Un seul est un carré parfait
                  ({fr(AB2)}) et donne une longueur entière ; les deux autres donnent des racines —
                  et c’est très bien ainsi, on les garde souvent sous cette forme.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Deux côtés qui SEMBLENT égaux',
          subtitle:
            'Voici un triangle où deux côtés mesurent 10,3 et 10,44. À l’œil, ils sont égaux. Regarde leurs carrés.',
          done: q3,
          content: (
            <div className="space-y-3">
              <MesureScene
                triangle={SCENES.demontrer.triangles[3]}
                points={[
                  { id: 'A', ...SCENES.demontrer.triangles[3].A, nom: 'A', color: '#7c3aed' },
                  { id: 'B', ...SCENES.demontrer.triangles[3].B, nom: 'B', color: '#0284c7' },
                  { id: 'C', ...SCENES.demontrer.triangles[3].C, nom: 'C', color: '#d97706' },
                ]}
                ariaLabel="Un triangle dont deux côtés semblent égaux sans l’être."
              />
              <div className="grid grid-cols-3 gap-2 text-center">
                {cotes(SCENES.demontrer.triangles[3]).map((c) => (
                  <div key={c.id} className="rounded-lg border border-slate-200 bg-white px-2 py-2">
                    <div className="text-[13px] text-slate-500">côté <strong>{c.id}</strong></div>
                    <div className="font-mono font-black tabular-nums text-slate-900">{fr(c.longueur)}</div>
                    <div className="font-mono text-xs text-slate-500 tabular-nums">carré = {c.carre}</div>
                  </div>
                ))}
              </div>
              <TapQuestion
                prompt="Ce triangle a-t-il deux côtés de même longueur ?"
                options={[
                  'Non : leurs carrés valent 106 et 109, deux entiers différents',
                  'Oui : 10,3 et 10,44, c’est la même chose à l’arrondi près',
                  'Oui : sur le dessin, on voit qu’ils sont égaux',
                  'On ne peut pas trancher sans mesurer plus précisément',
                ]}
                correct={0}
                cols={1}
                requires={['formule-carre-scalaire-longueur']}
                explain="Les longueurs affichées sont des racines arrondies : elles ne peuvent jamais servir de preuve. Les carrés, eux, sont exacts — 106 et 109 sont deux entiers distincts, la question est tranchée. L’écart réel entre les deux côtés est de 1,4 %, invisible sur une figure."
                explainWrong="« La même chose à l’arrondi près » n’est pas une égalité : 10,296 et 10,440 diffèrent bel et bien. Et une mesure plus précise ne changerait rien — le calcul exact est déjà là, dans les carrés."
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <Feedback tone="ok">
                    Règle de travail : on reste au carré aussi longtemps que possible, et l’on ne
                    prend la racine qu’au tout dernier moment, quand il faut annoncer une longueur.
                  </Feedback>
                  <KnowledgeBrick
                    id="regle-carres-entiers"
                    variant="new"
                    lead={<>Pourquoi les carrés sont la vérité, et les longueurs affichées une commodité.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Sans coordonnées : Al-Kashi',
          subtitle:
            'Un énoncé donne deux longueurs et l’angle entre elles, sans repère. Le produit scalaire répond quand même.',
          done: q4,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900 space-y-2">
                <p>
                  Dans un triangle ABC, on écrit BC = AC − AB. En multipliant cette flèche par
                  elle-même :
                </p>
                <p className="font-mono text-center text-[15px]">
                  BC² = AC² + AB² − 2 × (AB · AC)
                </p>
                <p>
                  et le dernier terme se calcule par les longueurs et l’angle en A :
                  AB · AC = AB × AC × cos(Â). On obtient :
                </p>
                <p className="font-mono text-center text-[15px] font-bold">
                  BC² = AB² + AC² − 2 × AB × AC × cos(Â)
                </p>
              </div>
              <div className="rounded-xl border border-sky-100 bg-white p-3 space-y-1 text-sm">
                <div className="text-xs text-slate-500">AB = {fr(KAB)}, AC = {fr(KAC)}, angle en A = {fr(KANG)}° (cos {fr(KANG)}° = 0,5)</div>
                <div className="font-mono">BC² = {fr(KAB * KAB)} + {fr(KAC * KAC)} − 2 × {fr(KAB)} × {fr(KAC)} × 0,5</div>
              </div>
              <NumericQuestion
                prompt={<>Termine le calcul : combien vaut <strong>BC²</strong> ?</>}
                expected={Math.round(KBC2)}
                parse={parseSigned}
                display={fr(KBC2, 0)}
                requires={['formule-carre-scalaire-longueur', 'formule-normes-angle']}
                explain={`${fr(KAB * KAB)} + ${fr(KAC * KAC)} = ${fr(KAB * KAB + KAC * KAC)}, puis 2 × ${fr(KAB)} × ${fr(KAC)} × 0,5 = ${fr(KAB * KAC)}. Donc BC² = ${fr(KAB * KAB + KAC * KAC)} − ${fr(KAB * KAC)} = ${fr(KBC2, 0)}, et BC = √${fr(KBC2, 0)} ≈ ${fr(Math.sqrt(KBC2))}.`}
                explainFor={(n) =>
                  n === KAB * KAB + KAC * KAC
                    ? `${fr(KAB * KAB + KAC * KAC)}, c’est Pythagore — valable seulement si l’angle en A était DROIT. Ici il vaut ${fr(KANG)}°, il faut donc retrancher ${fr(KAB * KAC)}.`
                    : null
                }
                solved={q4}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <>
                  <Feedback tone="ok">
                    Le contrôle qui rassure : si l’angle en A valait 90°, son cosinus vaudrait 0, le
                    dernier terme disparaîtrait, et il resterait BC² = AB² + AC². Al-Kashi{' '}
                    <strong>contient</strong> Pythagore.
                  </Feedback>
                  <KnowledgeBrick
                    id="regle-al-kashi"
                    variant="new"
                    lead={<>Le théorème que tu viens de démontrer en développant un carré scalaire.</>}
                  />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Angles et longueurs, tous deux acquis.</strong> Il reste à s’en servir : d’abord
          pour écrire une droite d’un seul trait, puis pour démontrer.
        </KnowledgeSnapshot>
      }
    />
  );
}
