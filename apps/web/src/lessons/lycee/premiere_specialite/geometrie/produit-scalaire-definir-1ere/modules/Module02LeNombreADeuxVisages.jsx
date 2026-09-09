import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import OmbreLab from '../components/OmbreLab';
import ScalaireScene, { TONS } from '../components/ScalaireScene';
import {
  SCENES, produitCoordonnees, produitParAngle, angleVecteursDeg,
  parseSigned, fr, frVec, norm,
} from '../components/scalaireUtils';

/**
 * Module 2 — DÉCOUVERTE : le nombre que les deux compteurs affichaient reçoit
 * son nom, sa notation, et ses DEUX formules officielles.
 *
 * Étape 1  le nom et la notation. Le laboratoire est toujours là : l'élève
 *          refait tourner en lisant « u·v » au-dessus des deux compteurs.
 * Étape 2  la formule des coordonnées, appliquée à une scène neuve (P1).
 * Étape 3  la formule des normes et de l'angle, sur un énoncé qui ne donne
 *          AUCUNE coordonnée — c'est ce qui la rend nécessaire (P2).
 * Étape 4  choisir sa formule selon ce que l'énoncé donne.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → brique
 * `vocab-produit-scalaire` ; étape 2 calcul mené → brique
 * `formule-coordonnees-scalaire` ; étape 3 calcul mené → brique
 * `formule-normes-angle` ; étape 4 → brique `methode-choisir-la-formule`,
 * puis la demande qui l'exige.
 *
 * MANIPULATION JAMAIS GELÉE : le laboratoire de l'étape 1 reste pilotable
 * après validation — l'élève doit pouvoir refaire tourner en lisant la règle.
 */
export default function Module02LeNombreADeuxVisages() {
  const [k1, setK1] = useState(3);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const { u, v } = SCENES.nommer;
  const uv = produitCoordonnees(u, v);            // 10
  const angleUV = Math.round(angleVecteursDeg(u, v));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le nombre à deux visages"
      moduleSubtitle="Un nom, une notation, et deux formules pour le même nombre"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Ce nombre a un nom',
        tone: 'indigo',
        body: (
          <p>
            Les deux compteurs du module précédent affichaient la même chose. Ce nombre s’appelle
            le <strong>produit scalaire</strong> — et selon ce que l’énoncé te donne, tu le
            calculeras d’une façon ou de l’autre.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'u · v',
          subtitle:
            'Le nombre que tu faisais varier porte ce nom et cette notation. Refais tourner : c’est u·v que les deux compteurs affichent.',
          done: q1,
          content: (
            <div className="space-y-3">
              <OmbreLab k={k1} onChangeK={setK1} />
              <KnowledgeBrick
                id="vocab-produit-scalaire"
                variant="new"
                lead={<>Le nom et la notation du nombre que tu manipules depuis le début.</>}
              />
              <TapQuestion
                prompt="u·v est donc…"
                options={[
                  'un nombre, qui peut être positif, négatif ou nul',
                  'un vecteur, dont on peut lire les coordonnées',
                  'une longueur, donc toujours positive',
                  'un angle, mesuré en degrés',
                ]}
                correct={0}
                cols={1}
                requires={['vocab-produit-scalaire', 'deux-recettes-un-nombre']}
                explain="« Scalaire » veut dire nombre. Deux vecteurs entrent, un nombre sort — et ce nombre change de signe quand l’angle dépasse 90°, ce qu’une longueur ne ferait jamais."
                explainWrong="Le compteur du laboratoire affichait bien −12,5 à 120° : ce n’est donc ni une longueur ni un angle. Et il n’a qu’une seule valeur, pas deux coordonnées : ce n’est pas un vecteur."
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Première formule : les coordonnées',
          subtitle:
            'Quand l’énoncé donne quatre nombres entre parenthèses, le calcul est direct.',
          done: q2,
          content: (
            <div className="space-y-3">
              <ScalaireScene
                fleches={[
                  { id: 'u', v: u, color: TONS.u, nom: 'u' },
                  { id: 'v', v, color: TONS.v, nom: 'v' },
                ]}
              />
              <div className="rounded-xl border border-indigo-100 bg-white p-4 text-sm text-slate-700 space-y-2">
                <p className="font-semibold text-indigo-900">La recette du compteur bleu, écrite en toutes lettres :</p>
                <p className="font-mono text-center text-[15px]">
                  u · v = x<sub>u</sub> × x<sub>v</sub> + y<sub>u</sub> × y<sub>v</sub>
                </p>
                <p className="text-xs text-slate-500">
                  Abscisse fois abscisse, ordonnée fois ordonnée, et l’on ajoute les deux.
                </p>
              </div>
              <NumericQuestion
                prompt={<>Avec u{frVec(u)} et v{frVec(v)}, combien vaut <strong>u · v</strong> ?</>}
                expected={uv}
                parse={parseSigned}
                display={fr(uv)}
                requires={['vocab-produit-scalaire', 'coordonnees-vecteur', 'vocab-base-orthonormee']}
                explain={`${fr(u.x)} × ${fr(v.x)} + ${fr(u.y)} × ${fr(v.y)} = ${fr(u.x * v.x)} + ${fr(u.y * v.y)} = ${fr(uv)}.`}
                explainFor={(n) =>
                  n === u.x * v.y + u.y * v.x
                    ? 'Tu as croisé les coordonnées. On multiplie les abscisses ENTRE ELLES, puis les ordonnées ENTRE ELLES.'
                    : n === u.x + u.y + v.x + v.y
                    ? 'Tu as additionné les quatre nombres. Il faut d’abord DEUX multiplications, puis une seule addition.'
                    : null
                }
                solved={q2}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <Feedback tone="ok">
                    Deux multiplications, une addition. Et le résultat est bien un nombre :{' '}
                    <strong>{fr(uv)}</strong>, positif ici parce que les deux flèches penchent du
                    même côté.
                  </Feedback>
                  <KnowledgeBrick
                    id="formule-coordonnees-scalaire"
                    variant="new"
                    lead={<>La formule officielle, avec la condition qui la rend vraie.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Seconde formule : les longueurs et l’angle',
          subtitle:
            'Un énoncé de géométrie ne donne pas toujours de repère. On connaît alors deux longueurs et un angle — et cela suffit.',
          done: q3,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900 space-y-2">
                <p>
                  Reviens à l’ombre : elle vaut ‖v‖ × cos(angle), parce que c’est le côté adjacent
                  du triangle rectangle que la perpendiculaire découpe. Et le produit valait
                  ‖u‖ × ombre. En rassemblant les deux :
                </p>
                <p className="font-mono text-center text-[15px]">
                  u · v = ‖u‖ × ‖v‖ × cos(angle)
                </p>
              </div>
              <NumericQuestion
                prompt={
                  <>
                    Deux flèches de longueurs <strong>4</strong> et <strong>3</strong> font entre
                    elles un angle de <strong>60°</strong>. Combien vaut leur produit scalaire ?
                    (cos 60° = 0,5)
                  </>
                }
                expected={6}
                parse={parseSigned}
                display="6"
                requires={['vocab-produit-scalaire', 'vocab-norme', 'ombre-signee']}
                explain="4 × 3 × cos(60°) = 12 × 0,5 = 6. Aucune coordonnée n’est nécessaire : deux longueurs et un angle suffisent."
                explainFor={(n) =>
                  n === 12
                    ? 'C’est 4 × 3 : tu as oublié le cosinus. Ce produit ne vaudrait 12 que si les deux flèches pointaient dans le même sens (angle nul, cos = 1).'
                    : n === 7
                    ? 'C’est 4 + 3 : la formule est une MULTIPLICATION des deux longueurs, puis une multiplication par le cosinus.'
                    : null
                }
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <Feedback tone="ok">
                    Le cosinus est ce qui fait tout le travail : il vaut 1 à 0°, <strong>0 à
                    90°</strong>, et il devient négatif au-delà. C’est lui qui donne au produit son
                    signe — et son zéro à l’angle droit.
                  </Feedback>
                  <KnowledgeBrick
                    id="formule-normes-angle"
                    variant="new"
                    lead={<>La seconde formule, et le tableau des signes qui va avec.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Laquelle employer ?',
          done: q4,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="methode-choisir-la-formule"
                variant="new"
                compact
                lead={<>Le réflexe : lire d’abord ce que l’énoncé donne réellement.</>}
              />
              <BatchChoiceQuestion
                intro={<p>Pour chaque énoncé, quelle formule employer ?</p>}
                rows={[
                  {
                    id: 'c1',
                    label: 'u(2 ; 5) et v(−1 ; 3)',
                    options: ['les coordonnées', 'les normes et l’angle'],
                    correct: 0,
                    correction: 'Quatre nombres entre parenthèses : 2 × (−1) + 5 × 3 = −2 + 15 = 13.',
                  },
                  {
                    id: 'c2',
                    label: 'AB = 5, AC = 2, angle BAC = 30°',
                    options: ['les coordonnées', 'les normes et l’angle'],
                    correct: 1,
                    correction: 'Deux longueurs et un angle, aucun repère : 5 × 2 × cos(30°).',
                  },
                  {
                    id: 'c3',
                    label: 'A(1 ; 0), B(4 ; 2), C(0 ; 3) — calculer AB · AC',
                    options: ['les coordonnées', 'les normes et l’angle'],
                    correct: 0,
                    correction: 'Des points repérés : on calcule d’abord AB = (3 ; 2) et AC = (−1 ; 3), puis 3 × (−1) + 2 × 3 = 3.',
                  },
                ]}
                requires={['formule-coordonnees-scalaire', 'formule-normes-angle', 'methode-choisir-la-formule']}
                feedback={({ allRight }) =>
                  allRight ? (
                    <>
                      Le tri se fait sur les DONNÉES, pas sur la figure. Des points repérés se
                      ramènent toujours à des coordonnées — arrivée moins départ, puis la première
                      formule.
                    </>
                  ) : (
                    <>
                      Compte les nombres de l’énoncé. Quatre coordonnées → première formule. Deux
                      longueurs et un angle → seconde. Des points dans un repère → on en tire les
                      coordonnées, puis première formule.
                    </>
                  )
                }
                solved={q4}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Reste une question.</strong> Tu sais calculer u·v. Mais peut-on le manipuler
          comme un produit ordinaire — échanger les deux flèches, sortir un facteur, couper une
          somme ? Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
