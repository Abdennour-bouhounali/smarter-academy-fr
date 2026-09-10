import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DroitesLab from '../components/DroitesLab';
import {
  verdicts, ORIENTATION_DEPART, orientationsQuiLevent, orientationsAtteignables,
  fr, frVec3,
} from '../components/espaceUtils';

/**
 * Module 5 — ATELIER : trancher le parallélisme, et découvrir le troisième cas.
 *
 * Étape 1  UN CAS FRANC. (AB) et (HG) : les deux directeurs sont identiques.
 *          L'élève tourne, constate qu'elles ne se rejoignent jamais, et pose
 *          le critère.
 * Étape 2  LE TROISIÈME CAS. (AB) et (CG) ne sont ni parallèles ni sécantes.
 *          C'est le fait qui n'existe pas dans le plan, et il se constate en
 *          tournant AVANT qu'on ne le nomme.
 * Étape 3  LE PIÈGE DE LA PERSPECTIVE, EN FACE. (AC) et (DF) SE CROISENT sur
 *          le dessin dans la vue de départ — c'est mesuré, pas supposé. La
 *          question n'arrive qu'après que l'élève a eu la rotation en main, et
 *          l'avertissement de `DroitesLab` nomme le mensonge sur le moment.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  comparer deux directeurs → brique `regle-parallelisme-espace`
 *   étape 2  constater le troisième cas → brique `droites-espace-trois-cas`
 *   étape 3  appliquer la démarche → brique `methode-trancher-parallelisme`
 *
 * LA ROTATION EST DONNÉE AVANT CHAQUE QUESTION DE POSITION. C'est la contrainte
 * critique de la leçon : `DroitesLab` monte la boîte tournable au-dessus de
 * chaque question, jamais après, et son bouton « me montrer un angle où l'on
 * voit bien » amène à une orientation dont un test prouve qu'elle lève
 * l'ambiguïté.
 */

const V = Object.fromEntries(verdicts().map((v) => [v.cle, v]));
const PARALLELE = V.c1;      // (AB) / (HG)
const NON_COPLANAIRE = V.c2; // (AB) / (CG)
const PIEGE = V.c6;          // (AC) / (DF), qui se croise au repos

/** Les deux comptes CITÉS par l'étape 3 — dérivés, jamais écrits à la main. */
const LEVENT = orientationsQuiLevent(PIEGE).length;
const TOTAL_ORIENTATIONS = orientationsAtteignables().length;

export default function Module05LesDroitesParalleles() {
  const [o1, setO1] = useState(ORIENTATION_DEPART);
  const [q1, setQ1] = useState(false);

  const [o2, setO2] = useState(ORIENTATION_DEPART);
  const [q2, setQ2] = useState(false);

  const [o3, setO3] = useState(ORIENTATION_DEPART);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Les droites parallèles"
      moduleSubtitle="Le dessin ne tranche pas ; les vecteurs directeurs, si"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'Ce que le dessin ne peut pas dire',
        tone: 'indigo',
        body: (
          <p>
            Trois couples de droites de la boîte. Pour chacun : tourne d’abord, calcule ensuite,
            conclus enfin. Et méfie-toi de ce que tu vois — la perspective écrase l’espace sur une
            feuille, et elle y perd de l’information.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Deux arêtes qui vont dans le même sens',
          subtitle:
            'Les directeurs de ces deux droites sont écrits sous la figure. Tourne la boîte, compare-les, puis conclus.',
          done: q1,
          content: (
            <div className="space-y-3">
              <DroitesLab
                verdict={PARALLELE}
                orientation={o1}
                onOrientation={setO1}
                montrerVerdict={q1}
              />
              <TapQuestion
                prompt={`Les directeurs de ${PARALLELE.d1.nom} et ${PARALLELE.d2.nom} valent tous deux ${frVec3(PARALLELE.d1.dir)}. Que peut-on en conclure ?`}
                options={[
                  'Les deux droites sont parallèles : elles portent exactement la même direction',
                  'Les deux droites sont confondues, puisque leurs directeurs sont identiques',
                  'Elles se coupent, puisqu’elles vont dans le même sens',
                  'On ne peut rien conclure sans mesurer sur le dessin',
                ]}
                correct={0}
                cols={1}
                requires={['coordonnees-vecteur-espace', 'colin-direction', 'mem-colin-multiple']}
                explain="Deux directeurs identiques — ou multiples l’un de l’autre — donnent la même direction, donc deux droites parallèles. Elles ne sont pas confondues pour autant : elles portent des points différents de la boîte, et tu peux le voir en tournant."
                explainWrong="Elles ne peuvent pas se couper : deux droites de même direction ne se rencontrent jamais, sauf à être confondues. Et le dessin n’avait rien à trancher ici — c’est la comparaison des directeurs qui décide."
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <>
                  <Feedback tone="ok">
                    Le critère du plan se transporte tel quel : on cherche un même nombre qui
                    transformerait un directeur en l’autre, et il doit convenir aux{' '}
                    <strong>trois</strong> coordonnées.
                  </Feedback>
                  <KnowledgeBrick
                    id="regle-parallelisme-espace"
                    variant="new"
                    lead={<>Le critère, écrit pour l’espace. Tourne encore la boîte en le lisant.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Ni parallèles, ni sécantes',
          subtitle:
            'Ce couple-ci n’entre dans aucune des deux cases du plan. Tourne la boîte autant qu’il le faut avant de répondre.',
          done: q2,
          content: (
            <div className="space-y-3">
              <DroitesLab
                verdict={NON_COPLANAIRE}
                orientation={o2}
                onOrientation={setO2}
                montrerVerdict={q2}
                disabled={!q1}
              />
              <TapQuestion
                prompt={`Les directeurs valent ${frVec3(NON_COPLANAIRE.d1.dir)} et ${frVec3(NON_COPLANAIRE.d2.dir)}. Aucune rotation ne les fait se rejoindre. Que sont ces deux droites ?`}
                options={[
                  'Ni parallèles ni sécantes : aucune direction commune, et aucun point commun non plus',
                  'Parallèles, puisqu’elles ne se coupent pas',
                  'Sécantes, mais le point d’intersection est caché derrière la boîte',
                  'Confondues',
                ]}
                correct={0}
                cols={1}
                requires={['regle-parallelisme-espace', 'coordonnees-vecteur-espace']}
                explain={`Aucun nombre ne transforme ${frVec3(NON_COPLANAIRE.d1.dir)} en ${frVec3(NON_COPLANAIRE.d2.dir)} : elles n’ont pas la même direction, donc elles ne sont pas parallèles. Et pourtant elles ne se rencontrent nulle part — tu l’as vu en tournant. C’est un troisième cas, qui n’existe pas dans le plan.`}
                explainWrong="« Elles ne se coupent pas » ne suffit pas à dire « parallèles » : dans l’espace, il faut EN PLUS la même direction, et elle manque ici. Quant à un point d’intersection caché, la rotation l’aurait fait apparaître — elle ne l’a pas fait."
                solved={q2}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <Feedback tone="ok">
                    Dans le plan, deux droites étaient sécantes ou parallèles, sans autre choix.
                    Dans l’espace, il y a <strong>trois</strong> cas — et le troisième est le plus
                    fréquent sur un cube.
                  </Feedback>
                  <KnowledgeBrick
                    id="droites-espace-trois-cas"
                    variant="new"
                    lead={<>Les trois cas, dont celui que tu viens de rencontrer. Tourne la boîte en les lisant.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le dessin te ment — vérifie-le',
          subtitle:
            'Sous l’angle de départ, ces deux traits se croisent. Tourne la boîte avant de répondre : appuie sur le bouton si tu veux un angle bien choisi.',
          done: q3,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                Ce couple-ci est le cas d’école : <strong>{PIEGE.d1.nom}</strong> et{' '}
                <strong>{PIEGE.d2.nom}</strong> se croisent sur le dessin dans la vue de départ.
                Elles ne se rencontrent pourtant nulle part dans la boîte. Tourne-la — {fr(LEVENT)} des{' '}
                {fr(TOTAL_ORIENTATIONS)} angles disponibles défont ce croisement.
              </div>
              <DroitesLab
                verdict={PIEGE}
                orientation={o3}
                onOrientation={setO3}
                montrerVerdict={q3}
                disabled={!q2}
              />
              <TapQuestion
                prompt={`Après avoir tourné : ${PIEGE.d1.nom} et ${PIEGE.d2.nom} sont-elles parallèles ?`}
                options={[
                  `Non : ${frVec3(PIEGE.d1.dir)} et ${frVec3(PIEGE.d2.dir)} ne sont pas multiples l’un de l’autre — la troisième coordonnée passe de 0 à 1`,
                  'Oui : elles ne se coupent pas, donc elles sont parallèles',
                  'Oui : leurs deux premières coordonnées se ressemblent',
                  'Non : elles se coupent, comme le dessin le montrait au départ',
                ]}
                correct={0}
                cols={1}
                requires={['regle-parallelisme-espace', 'droites-espace-trois-cas', 'formule-scalaire-espace']}
                explain={`Il faudrait un même nombre k pour les trois coordonnées. La première demanderait k = 1, mais la deuxième donnerait alors 1 au lieu de −1, et la troisième 0 au lieu de 1 : impossible. Elles ne sont donc pas parallèles — et elles ne se coupent pas non plus, c’est encore le troisième cas.`}
                explainWrong="Deux droites qui ne se coupent pas ne sont pas forcément parallèles dans l’espace : c’est exactement ce que le couple précédent a montré. Et le croisement que tu voyais au départ était un effet du dessin — il disparaît dès que tu tournes."
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <Feedback tone="ok">
                    Deux réflexes désormais : <strong>tourner</strong> avant de croire ce qu’on voit,
                    et <strong>calculer</strong> pour trancher. Le dessin sert à comprendre, jamais
                    à conclure.
                  </Feedback>
                  <KnowledgeBrick
                    id="methode-trancher-parallelisme"
                    variant="new"
                    lead={<>La démarche, en quatre gestes. Refais-la sur un autre couple en la lisant.</>}
                  />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Reste l’angle droit.</strong> Tu as vu un produit scalaire tomber à zéro au
          module 4, sur deux droites qui ne se coupent pas. Module suivant : ce que cela veut dire.
        </KnowledgeSnapshot>
      }
    />
  );
}
