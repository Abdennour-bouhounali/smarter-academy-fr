import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DroitePlanLab, { CarteVerdict } from '../components/DroitePlanLab';
import {
  ORIENTATION_DEPART, ETAT_DEPART,
  droiteNom, planNomme, equationCartesienne, appartient,
  droiteParalleleAuPlan, droiteOrthogonaleAuPlan, plansParalleles, plansOrthogonaux,
  colineaires, orthogonaux, dot3, evalPlan,
  parseSigned, fr, frVec3,
} from '../components/planUtils';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT : démontrer (P3 parallélisme, P4
 * orthogonalité).
 *
 * LE CONTRESENS QUE LE MODULE VISE, et qui coûte le plus cher du chapitre :
 * le rôle du produit scalaire S'INVERSE entre deux droites et une droite/plan.
 *
 *   deux droites   : produit nul ⇒ ORTHOGONALES
 *   droite et plan : produit nul ⇒ PARALLÈLES     ← l'inverse
 *                    colinéaires ⇒ ORTHOGONALES   ← l'inverse aussi
 *
 * Le module les fait produire SUR LA MÊME FIGURE, à une minute d'intervalle,
 * avec les deux mêmes vecteurs — c'est la seule façon de rendre l'inversion
 * mémorable au lieu de la faire apprendre par cœur.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  le parallélisme sous ses trois formes
 *            → brique `parallelisme-espace-trois-formes` → puis les questions
 *   étape 2  l'orthogonalité, et l'inversion
 *            → brique `orthogonalite-espace-deux-formes` puis
 *              `mem-le-role-s-inverse` → puis les questions
 *   étape 3  les deux verdicts opposés sur les deux mêmes vecteurs.
 *
 * AUCUN VERDICT N'EST ÉCRIT À LA MAIN : les prédicats du modèle les calculent
 * tous, et les tests les recalculent.
 *
 * LE LABORATOIRE RESTE PILOTABLE : `disabled` ne porte que l'antériorité.
 */

/** Le plancher, et les deux droites qui portent l'inversion. */
const P_ABC = planNomme('ABC');            // n = (0 ; 0 ; 1)
const D_AE = droiteNom('A', 'E');          // u = (0 ; 0 ; 2) : COLINÉAIRE à n
const D_EG = droiteNom('E', 'G');          // u = (2 ; 2 ; 0) : produit nul avec n
const D_AC = droiteNom('A', 'C');          // même directeur que (EG), mais DEDANS

const PRODUIT_AE = dot3(D_AE.u, P_ABC.n);
const PRODUIT_EG = dot3(D_EG.u, P_ABC.n);
const PRODUIT_DROITES = dot3(D_AE.u, D_EG.u);

/** Deux plans, pour la troisième forme du parallélisme. */
const P_BDE = planNomme('BDE');
const P_CFH = planNomme('CFH');
const P_ABF = planNomme('ABF');

export default function Module06DemontrerSansLeDessin() {
  const [o1, setO1] = useState(ORIENTATION_DEPART);
  const [e1, setE1] = useState(ETAT_DEPART);
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);

  const [o2, setO2] = useState(ORIENTATION_DEPART);
  const [e2, setE2] = useState(ETAT_DEPART);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);

  const [q3, setQ3] = useState(false);

  const done1 = q1a && q1b;
  const done2 = q2a && q2b;
  const done3 = q3;

  const steps = [
    {
      num: 1,
      title: 'Parallèle : trois énoncés, trois calculs',
      subtitle:
        'Deux droites, une droite et un plan, deux plans. Le mot « parallèle » est le même — le calcul ne l’est pas.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DroitePlanLab
            orientation={o1}
            onOrientation={setO1}
            etat={e1}
            onEtat={setE1}
            montrer="calcul"
            montrerNormal
          />
          <p className="text-[13px] text-slate-600">
            Le laboratoire reste à ta disposition : mets la droite parallèle au plan pour te
            rappeler ce que cela donne. Les questions ci-dessous portent sur le cube.
          </p>
          <KnowledgeBrick
            id="parallelisme-espace-trois-formes"
            variant="new"
            lead={<>Trois énoncés, trois calculs différents. Lis la ligne du milieu deux fois.</>}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CarteVerdict titre={`${D_EG.nom} et le plan ${P_ABC.nom}`} tone="emerald" lignes={[
              { label: 'directeur de la droite', valeur: frVec3(D_EG.u) },
              { label: 'normal du plan', valeur: frVec3(P_ABC.n) },
              { label: 'produit directeur · normal', valeur: fr(PRODUIT_EG) },
              { label: `le point ${D_EG.a} ${frVec3(D_EG.A)} est-il dans le plan ?`, valeur: appartient(P_ABC, D_EG.A) ? 'oui' : 'non' },
              { label: 'ce que l’équation y donne', valeur: fr(evalPlan(P_ABC, D_EG.A)) },
              { label: 'verdict', valeur: droiteParalleleAuPlan(D_EG, P_ABC) ? 'PARALLÈLE au plan' : 'non parallèle' },
            ]} />
            <CarteVerdict titre={`Les plans ${P_BDE.nom} et ${P_CFH.nom}`} tone="emerald" lignes={[
              { label: `normal de ${P_BDE.nom}`, valeur: frVec3(P_BDE.n) },
              { label: `normal de ${P_CFH.nom}`, valeur: frVec3(P_CFH.n) },
              { label: 'normaux colinéaires ?', valeur: colineaires(P_BDE.n, P_CFH.n) ? 'oui' : 'non' },
              { label: 'équations', valeur: `${equationCartesienne(P_BDE)} / ${equationCartesienne(P_CFH)}` },
              { label: 'verdict', valeur: plansParalleles(P_BDE, P_CFH) ? 'PARALLÈLES' : 'non parallèles' },
            ]} />
          </div>
          {/* LE CONTRE-EXEMPLE, qui rend la seconde ligne de la démonstration
              indispensable : (AC) a le MÊME directeur que (EG) et le MÊME
              produit nul, et pourtant elle n'est PAS parallèle au plan — elle y
              est couchée. Le verdict est calculé, jamais affirmé. */}
          <CarteVerdict titre={`Le contre-exemple : ${D_AC.nom} et le plan ${P_ABC.nom}`} tone="amber" lignes={[
            { label: 'directeur de la droite', valeur: frVec3(D_AC.u) },
            { label: 'produit directeur · normal', valeur: fr(dot3(D_AC.u, P_ABC.n)) },
            { label: `le point ${D_AC.a} ${frVec3(D_AC.A)} est-il dans le plan ?`, valeur: appartient(P_ABC, D_AC.A) ? 'oui' : 'non' },
            { label: 'verdict', valeur: droiteParalleleAuPlan(D_AC, P_ABC) ? 'PARALLÈLE au plan' : 'PAS parallèle : elle est dedans' },
          ]} />
          <CarteVerdict titre={`Les plans ${P_ABC.nom} et ${P_ABF.nom}`} tone="indigo" lignes={[
            { label: `normal de ${P_ABC.nom}`, valeur: frVec3(P_ABC.n) },
            { label: `normal de ${P_ABF.nom}`, valeur: frVec3(P_ABF.n) },
            { label: 'produit des deux normaux', valeur: fr(dot3(P_ABC.n, P_ABF.n)) },
            { label: 'parallèles ?', valeur: plansParalleles(P_ABC, P_ABF) ? 'oui' : 'non' },
            { label: 'perpendiculaires ?', valeur: plansOrthogonaux(P_ABC, P_ABF) ? 'oui' : 'non' },
          ]} />
          <TapQuestion
            prompt={`Rédige la démonstration : pourquoi ${D_EG.nom} est-elle parallèle au plan ${P_ABC.nom} ?`}
            options={[
              `Parce que le produit du directeur ${frVec3(D_EG.u)} par le normal ${frVec3(P_ABC.n)} vaut ${fr(PRODUIT_EG)}, et que le point ${D_EG.a} n’appartient pas au plan`,
              `Parce que le directeur ${frVec3(D_EG.u)} et le normal ${frVec3(P_ABC.n)} sont colinéaires`,
              `Parce que le produit vaut ${fr(PRODUIT_EG)} : cela suffit à conclure`,
              'Parce que sur le dessin, la droite ne touche jamais le plancher',
            ]}
            correct={0}
            cols={1}
            requires={['parallelisme-espace-trois-formes', 'critere-droite-plan', 'vecteur-normal']}
            explain={`Deux lignes, pas une : le produit nul écarte le cas « elle perce », et le point hors du plan écarte le cas « elle est dedans ». La troisième option est justement la démonstration incomplète du module 2 — vraie une fois sur deux.`}
            explainWrong={`Et la dernière option n’est pas une démonstration : le dessin dépend de l’angle sous lequel tu le regardes, tu l’as vérifié au module 1. Regarde la carte du contre-exemple : ${D_AC.nom} a le MÊME directeur ${frVec3(D_AC.u)} et le MÊME produit ${fr(dot3(D_AC.u, P_ABC.n))}, et pourtant elle n’est pas parallèle au plan — elle y est couchée. C’est la seconde ligne qui les sépare.`}
            solved={q1a}
            onAnswered={() => setQ1a(true)}
          />
          {q1a && (
            <TapQuestion
              prompt={`Et pourquoi les plans ${P_BDE.nom} et ${P_CFH.nom} sont-ils parallèles ?`}
              options={[
                `Parce que leurs normaux valent tous deux ${frVec3(P_BDE.n)} : ils sont colinéaires`,
                `Parce que le produit de leurs normaux vaut ${fr(dot3(P_BDE.n, P_CFH.n))}`,
                'Parce que leurs équations ne diffèrent que par un nombre',
                'Parce qu’ils ne se coupent nulle part sur la figure',
              ]}
              correct={0}
              cols={1}
              requires={['parallelisme-espace-trois-formes', 'critere-deux-plans', 'colin-direction']}
              explain={`Pour deux PLANS, c’est la colinéarité des normaux qui donne le parallélisme — le même critère que pour deux droites, appliqué à d’autres vecteurs. Le produit de leurs normaux, lui, vaut ${fr(dot3(P_BDE.n, P_CFH.n))}, ce qui ne dit rien du parallélisme.`}
              explainWrong="« Leurs équations ne diffèrent que par un nombre » est vrai, mais ce n’est pas le critère : c’est une CONSÉQUENCE du fait que leurs normaux sont égaux. La démonstration doit citer le critère, pas son ombre."
              solved={q1b}
              onAnswered={() => setQ1b(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Orthogonal : le produit change de camp',
      subtitle:
        'Même figure, mêmes vecteurs, autre question. Cette fois, c’est la colinéarité qui donne l’angle droit.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="orthogonalite-espace-deux-formes"
            variant="new"
            lead={<>La ligne du milieu est celle qui surprend. Compare-la à celle de la brique précédente.</>}
          />
          <DroitePlanLab
            orientation={o2}
            onOrientation={setO2}
            etat={e2}
            onEtat={setE2}
            montrer="calcul"
            montrerNormal
            disabled={!done1}
          />
          <CarteVerdict titre={`${D_AE.nom} et le plan ${P_ABC.nom}`} tone="amber" lignes={[
            { label: 'directeur de la droite', valeur: frVec3(D_AE.u) },
            { label: 'normal du plan', valeur: frVec3(P_ABC.n) },
            { label: 'directeur et normal colinéaires ?', valeur: colineaires(D_AE.u, P_ABC.n) ? 'oui' : 'non' },
            { label: 'produit directeur · normal', valeur: fr(PRODUIT_AE) },
            // Le VERDICT est calculé par le prédicat du modèle, jamais écrit à
            // la main : un énoncé faux est donc impossible.
            { label: 'verdict', valeur: droiteOrthogonaleAuPlan(D_AE, P_ABC) ? 'ORTHOGONALE au plan' : 'non orthogonale' },
          ]} />
          <TapQuestion
            prompt={`La droite ${D_AE.nom} a pour directeur ${frVec3(D_AE.u)}, et le plancher pour normal ${frVec3(P_ABC.n)}. Quelle est la position de la droite par rapport au plan ?`}
            options={[
              'Elle lui est ORTHOGONALE : le directeur est colinéaire au normal',
              `Elle lui est parallèle : le produit vaut ${fr(PRODUIT_AE)}`,
              'Elle est contenue dedans',
              'On ne peut pas conclure, le produit n’étant pas nul',
            ]}
            correct={0}
            cols={1}
            requires={['orthogonalite-espace-deux-formes', 'vecteur-normal', 'colin-direction']}
            explain={`Le directeur ${frVec3(D_AE.u)} est le double du normal ${frVec3(P_ABC.n)} : ils portent la même direction. La droite pointe donc exactement là où le plan « sort », c’est-à-dire perpendiculairement à lui — et elle est alors orthogonale à TOUTES les droites du plancher à la fois.`}
            explainWrong={`Le produit vaut ${fr(PRODUIT_AE)}, qui n’est pas nul : la droite n’est donc pas parallèle au plan, elle le perce. Et elle le perce perpendiculairement, parce que sa direction est celle du normal.`}
            solved={q2a}
            onAnswered={() => setQ2a(true)}
          />
          {q2a && (
            <>
              <KnowledgeBrick
                id="mem-le-role-s-inverse"
                variant="new"
                lead={<>Les deux lignes à ne jamais confondre.</>}
              />
              <NumericQuestion
                prompt={
                  <>
                    Les deux DROITES {D_AE.nom} et {D_EG.nom} ont pour directeurs{' '}
                    <span className="font-mono">{frVec3(D_AE.u)}</span> et{' '}
                    <span className="font-mono">{frVec3(D_EG.u)}</span>. Que vaut le produit
                    scalaire de ces deux directeurs ?
                  </>
                }
                expected={PRODUIT_DROITES}
                parse={parseSigned}
                display={fr(PRODUIT_DROITES)}
                requires={['formule-scalaire-espace', 'orthogonalite-espace-deux-formes']}
                explain={`${fr(D_AE.u.x)}×${fr(D_EG.u.x)} + ${fr(D_AE.u.y)}×${fr(D_EG.u.y)} + ${fr(D_AE.u.z)}×${fr(D_EG.u.z)} = ${fr(PRODUIT_DROITES)}. Pour deux DROITES, ce produit nul signifie orthogonales — et c’est cohérent : ${D_AE.nom} est orthogonale au plancher, donc à toute droite parallèle au plancher, dont ${D_EG.nom}.`}
                explainFor={(n) => (
                  n === PRODUIT_AE
                    ? `${fr(PRODUIT_AE)} est le produit du directeur de ${D_AE.nom} par le NORMAL du plan, pas par le directeur de ${D_EG.nom}. Ce sont deux calculs différents.`
                    : null
                )}
                solved={q2b}
                onAnswered={() => setQ2b(true)}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le même produit nul, deux mots opposés',
      subtitle: 'Un dernier coup d’œil aux deux verdicts, côte à côte.',
      done: done3,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CarteVerdict titre={`Deux DROITES : ${D_AE.nom} et ${D_EG.nom}`} tone="indigo" lignes={[
              { label: 'produit des deux directeurs', valeur: fr(PRODUIT_DROITES) },
              { label: 'verdict', valeur: orthogonaux(D_AE.u, D_EG.u) ? 'ORTHOGONALES' : 'non orthogonales' },
            ]} />
            <CarteVerdict titre={`Une DROITE et un PLAN : ${D_EG.nom} et ${P_ABC.nom}`} tone="amber" lignes={[
              { label: 'produit directeur · normal', valeur: fr(PRODUIT_EG) },
              { label: 'verdict', valeur: droiteParalleleAuPlan(D_EG, P_ABC) ? 'PARALLÈLES' : 'non parallèles' },
            ]} />
          </div>
          <TapQuestion
            prompt={`Les deux produits valent ${fr(PRODUIT_DROITES)}. Pourquoi les deux verdicts sont-ils opposés ?`}
            options={[
              'Parce que le vecteur normal SORT du plan : une direction perpendiculaire à lui reste donc dans le plan',
              'Parce qu’une erreur de calcul s’est glissée dans l’un des deux',
              'Parce qu’un plan n’a pas de direction, contrairement à une droite',
              'Parce que le produit scalaire n’a pas le même sens dans l’espace et dans le plan',
            ]}
            correct={0}
            cols={1}
            requires={['orthogonalite-espace-deux-formes', 'mem-le-role-s-inverse', 'parallelisme-espace-trois-formes', 'vecteur-normal']}
            explain="Un vecteur directeur REPRÉSENTE la droite ; un vecteur normal ne représente pas le plan, il en sort. Être perpendiculaire à la droite, c’est faire un angle droit avec elle. Être perpendiculaire au normal, c’est au contraire s’aplatir DANS le plan — donc lui être parallèle."
            explainWrong={`Les deux calculs sont justes : ${frVec3(D_AE.u)} · ${frVec3(D_EG.u)} = ${fr(PRODUIT_DROITES)} et ${frVec3(D_EG.u)} · ${frVec3(P_ABC.n)} = ${fr(PRODUIT_EG)}. C’est le SENS du second vecteur qui change : directeur dans un cas, normal dans l’autre.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <Feedback tone="ok">
              Tu sais démontrer, et tu sais pourquoi le même calcul donne deux mots différents. Il
              reste une question que le module 5 a laissée ouverte : ce nombre non nul qu’une
              équation de plan rend en un point — que mesure-t-il ?
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Démontrer sans le dessin"
      moduleSubtitle="Le même produit scalaire, deux conclusions opposées"
      estimatedTime="8 min"
      brief={{
        tag: 'Laboratoire',
        title: 'Parallèle ou orthogonal ? Attention au camp',
        tone: 'amber',
        body: (
          <p>
            Pour deux droites, le produit nul donne l’angle droit. Pour une droite et un plan, il
            donne exactement le contraire. Voici pourquoi.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Ce qui vient.</strong> Une équation de plan rend un nombre en chaque point de
          l’espace. Quand il n’est pas nul, il mesure quelque chose.
        </KnowledgeSnapshot>
      }
    />
  );
}
