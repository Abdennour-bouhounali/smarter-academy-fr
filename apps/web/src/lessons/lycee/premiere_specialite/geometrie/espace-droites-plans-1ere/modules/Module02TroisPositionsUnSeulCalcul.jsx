import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DroitePlanLab, { CarteVerdict } from '../components/DroitePlanLab';
import {
  ORIENTATION_DEPART, ETAT_DEPART, verdictLabo, cheminVers,
  POSITION_DROITE_PLAN,
  droiteNom, planNomme, verdictDroitePlan, equationCartesienne, evalPlan,
  parseSigned, fr, frVec3,
} from '../components/planUtils';

/**
 * Module 2 — DÉCOUVERTE. On NOMME ce que le module 1 a fait constater : le
 * vecteur normal, et le critère complet en deux tests.
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre du source est la ligne du temps :
 *   étape 1  la flèche qui sort du plan, montrée puis manipulée
 *            → brique `vecteur-normal` (id du LEXIQUE : c'est un terme du
 *              programme de Première, et la brique doit le porter pour que
 *              l'audit le voie posé)
 *            → puis la question qui l'exige.
 *   étape 2  les deux tests, appliqués à un cas donné
 *            → brique `critere-droite-plan`, puis `mem-nul-puis-appartenance`
 *            → puis les questions qui les exigent.
 *   étape 3  le cas piège : un produit nul qui ne veut PAS dire « parallèle ».
 *
 * LE PIÈGE DE LA PERSPECTIVE. Les configurations de l'étape 3 sont prises sur
 * le cube et non sur le laboratoire mobile : leurs verdicts sont CALCULÉS par
 * `verdictDroitePlan`, jamais écrits à la main, et un test vérifie qu'une
 * orientation atteignable défait le croisement apparent pour chacune. La
 * question n'est posée qu'APRÈS que l'élève a eu le droit de tourner.
 *
 * MANIPULATION JAMAIS GELÉE : `disabled` ne porte que l'antériorité.
 */

/** Les trois cas travaillés à l'étape 2, tous CALCULÉS depuis le laboratoire. */
const ETAT_PARALLELE = cheminVers(POSITION_DROITE_PLAN.parallele).cible;
const ETAT_CONTENUE = cheminVers(POSITION_DROITE_PLAN.contenue).cible;
const V_PARALLELE = verdictLabo(ETAT_PARALLELE);
const V_CONTENUE = verdictLabo(ETAT_CONTENUE);

/** Le cas de l'étape 3, sur le cube fixe : (EG) et le plancher (ABC). */
const D_EG = droiteNom('E', 'G');
const P_ABC = planNomme('ABC');
const V_EG_ABC = verdictDroitePlan(D_EG, P_ABC);

/** Et son jumeau, qui a le MÊME produit nul et un verdict opposé : (AC). */
const D_AC = droiteNom('A', 'C');
const V_AC_ABC = verdictDroitePlan(D_AC, P_ABC);

/** Ce que l'équation du plancher RÉPOND aux deux points de départ. CALCULÉ :
 *  c'est le nombre que l'explication cite, et l'écrire à la main serait
 *  exactement le genre d'erreur que la leçon apprend à éviter. */
const REPONSE_E = evalPlan(P_ABC, D_EG.A);
const REPONSE_A = evalPlan(P_ABC, D_AC.A);

export default function Module02TroisPositionsUnSeulCalcul() {
  const [o1, setO1] = useState(ORIENTATION_DEPART);
  const [e1, setE1] = useState(ETAT_DEPART);
  const [q1, setQ1] = useState(false);

  const [o2, setO2] = useState(ORIENTATION_DEPART);
  const [e2, setE2] = useState(ETAT_PARALLELE);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);

  const [o3, setO3] = useState(ORIENTATION_DEPART);
  const [e3, setE3] = useState(ETAT_CONTENUE);
  const [tourne3, setTourne3] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = q1;
  const done2 = q2a && q2b;
  const done3 = q3 && q4;

  const tourner3 = (o, react) => {
    setO3(o);
    if (tourne3) return;
    if (o.yaw !== ORIENTATION_DEPART.yaw || o.pitch !== ORIENTATION_DEPART.pitch) {
      setTourne3(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'La flèche qui sort du plan',
      subtitle:
        'La figure montre maintenant une flèche violette qui part du plan. Fais monter le plan, fais tourner la boîte : regarde ce que cette flèche fait — et ce qu’elle ne fait pas.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
            Cette flèche est perpendiculaire au plan : elle fait un angle droit avec{' '}
            <strong>toutes</strong> les directions qu’on peut tracer dessus. C’est elle que le
            premier cadre utilisait déjà, sans la nommer.
          </div>
          <DroitePlanLab
            orientation={o1}
            onOrientation={setO1}
            etat={e1}
            onEtat={setE1}
            montrer="calcul"
            montrerNormal
          />
          <KnowledgeBrick
            id="vecteur-normal"
            variant="new"
            lead={<>La flèche violette porte un nom. Fais monter le plan en lisant : elle reste la même.</>}
          />
          <TapQuestion
            prompt="Tu as fait monter le plan. Qu’est-il arrivé à la flèche violette ?"
            options={[
              'Elle a monté avec le plan, mais elle a gardé exactement la même direction',
              'Elle a changé de direction à chaque hauteur',
              'Elle a disparu quand le plan a atteint le haut de la boîte',
              'Elle s’est allongée à mesure que le plan montait',
            ]}
            correct={0}
            cols={1}
            requires={['vecteur-normal']}
            explain={`Le cadre l’affiche : le vecteur normal vaut ${frVec3(verdictLabo(e1).plan.n)} quelle que soit la hauteur du plan. Deux plans parallèles ont la même direction perpendiculaire — c’est ce qui les rend parallèles.`}
            explainWrong="Regarde les coordonnées du vecteur normal dans le cadre de gauche pendant que tu montes le plan : elles ne bougent pas. Seule sa position sur le dessin change, parce que le plan qui le porte a monté."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux tests, dans cet ordre',
      subtitle:
        'Le premier cadre donne le produit du vecteur directeur par le vecteur normal. Le second dit si un point de la droite est dans le plan. À eux deux, ils tranchent toujours.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <DroitePlanLab
            orientation={o2}
            onOrientation={setO2}
            etat={e2}
            onEtat={setE2}
            montrer="complet"
            disabled={!done1}
          />
          <KnowledgeBrick
            id="critere-droite-plan"
            variant="new"
            lead={<>Le critère complet, en deux tests. Refais basculer la droite en le lisant, et vérifie chaque ligne sur les deux cadres.</>}
          />
          <TapQuestion
            prompt="Une droite et un plan : le produit du directeur par le normal vaut 0, et un point de la droite VÉRIFIE l’équation du plan. Que peut-on conclure ?"
            options={[
              'La droite est contenue dans le plan : elle a une infinité de points communs avec lui',
              'La droite est parallèle au plan : elle n’a aucun point commun avec lui',
              'La droite perce le plan en un point',
              'On ne peut pas conclure sans un second point',
            ]}
            correct={0}
            cols={1}
            requires={['critere-droite-plan', 'vecteur-normal', 'formule-scalaire-espace']}
            explain="Le produit nul dit qu’elle ne perce pas. Le point qui vérifie l’équation dit qu’elle touche le plan quelque part. Une droite qui ne perce pas et qui touche est couchée dedans — une infinité de points communs."
            explainWrong="Le produit nul ne suffit jamais à conclure « parallèle » : c’est exactement le piège. Il faut le second test, et ici il répond « oui, le point est dans le plan » — donc la droite y est tout entière."
            solved={q2a}
            onAnswered={() => setQ2a(true)}
          />
          {q2a && (
            <>
              <NumericQuestion
                prompt={
                  <>
                    Sur le laboratoire, place la droite de sorte qu’elle soit{' '}
                    <strong>parallèle au plan sans être dedans</strong>. Combien de points communs
                    le compteur affiche-t-il alors ?
                  </>
                }
                expected={0}
                parse={parseSigned}
                display="0"
                requires={['critere-droite-plan', 'trois-positions-droite-plan']}
                explain={`Les deux bouts de la droite à la même hauteur — le produit tombe à ${fr(V_PARALLELE.un)} — mais à une hauteur différente de celle du plan, si bien que le second test répond « non ». Aucun point commun.`}
                explainFor={(n) => (
                  n === 1
                    ? 'Un point commun, c’est le cas où elle perce : le produit n’y est pas nul. Mets les deux bouts de la droite à la même hauteur.'
                    : null
                )}
                solved={q2b}
                onAnswered={() => setQ2b(true)}
              />
              {q2b && (
                <KnowledgeBrick
                  id="mem-nul-puis-appartenance"
                  variant="new"
                  lead={<>Les deux tests, en une ligne à retenir.</>}
                />
              )}
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le même produit nul, deux verdicts opposés',
      subtitle:
        'Deux droites du cube ont exactement le même vecteur directeur. Tourne la boîte autant que tu veux avant de répondre : le dessin ne suffira pas.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Sur le cube ABCDEFGH, on regarde le <strong>plancher</strong>, le plan (ABC).
            Deux droites : <strong>(EG)</strong>, qui joint deux coins du plafond, et{' '}
            <strong>(AC)</strong>, qui joint deux coins du plancher. Elles ont le{' '}
            <strong>même</strong> vecteur directeur.
          </div>
          <DroitePlanLab
            orientation={o3}
            onOrientation={(o) => tourner3(o, kit.react)}
            etat={e3}
            onEtat={setE3}
            montrer="complet"
            montrerNormal
            disabled={!done2}
          />
          <p className="text-[13px] text-slate-600">
            La figure ci-dessus reste ton laboratoire — tourne-la pour te faire une idée de ce que
            « couchée dans le plan » veut dire. Les deux cas ci-dessous portent sur le cube lui-même.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CarteVerdict
              titre={`La droite ${D_EG.nom} et le plan ${P_ABC.nom}`}
              tone="indigo"
              lignes={[
                { label: 'vecteur directeur', valeur: frVec3(D_EG.u) },
                { label: 'vecteur normal du plan', valeur: frVec3(P_ABC.n) },
                { label: 'équation du plan', valeur: equationCartesienne(P_ABC) },
                { label: 'produit directeur · normal', valeur: fr(V_EG_ABC.un) },
                { label: `le point E ${frVec3(D_EG.A)} y est-il ?`, valeur: V_EG_ABC.aPointDansPlan ? 'oui' : 'non' },
              ]}
            />
            <CarteVerdict
              titre={`La droite ${D_AC.nom} et le plan ${P_ABC.nom}`}
              tone="emerald"
              lignes={[
                { label: 'vecteur directeur', valeur: frVec3(D_AC.u) },
                { label: 'vecteur normal du plan', valeur: frVec3(P_ABC.n) },
                { label: 'équation du plan', valeur: equationCartesienne(P_ABC) },
                { label: 'produit directeur · normal', valeur: fr(V_AC_ABC.un) },
                { label: `le point A ${frVec3(D_AC.A)} y est-il ?`, valeur: V_AC_ABC.aPointDansPlan ? 'oui' : 'non' },
              ]}
            />
          </div>
          <TapQuestion
            prompt={`Les deux produits valent ${fr(V_EG_ABC.un)}. Quelle est la position de chacune des deux droites par rapport au plancher ?`}
            options={[
              `${D_EG.nom} est parallèle au plancher sans point commun, et ${D_AC.nom} est contenue dedans`,
              'Les deux sont parallèles au plancher : le produit nul suffit à le dire',
              'Les deux sont contenues dans le plancher, puisque le produit est nul',
              `${D_EG.nom} est contenue dedans, et ${D_AC.nom} est parallèle`,
            ]}
            correct={0}
            cols={1}
            requires={['critere-droite-plan', 'mem-nul-puis-appartenance', 'vecteur-normal']}
            explain={`Même produit, mais pas même réponse au second test : le point E ${frVec3(D_EG.A)} donne ${fr(REPONSE_E)} dans l’équation ${equationCartesienne(P_ABC)}, donc il n’est pas dans le plancher — ${D_EG.nom} passe au-dessus. Le point A ${frVec3(D_AC.A)} donne ${fr(REPONSE_A)} : il est dans le plancher, donc ${D_AC.nom} y est couchée.`}
            explainWrong="C’est exactement le piège que le laboratoire t’a montré : deux situations très différentes derrière le même produit nul. Ce qui les sépare est le SECOND test, et lui seul — regarde la dernière ligne des deux cartes."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <TapQuestion
              prompt="Un élève écrit : « le produit du directeur par le normal est nul, donc la droite est parallèle au plan ». Que lui manque-t-il ?"
              options={[
                'Vérifier qu’un point de la droite n’appartient PAS au plan — sinon elle y est contenue',
                'Rien : sa conclusion est correcte',
                'Recalculer le produit avec un autre vecteur normal du plan',
                'Vérifier que le vecteur directeur n’est pas nul',
              ]}
              correct={0}
              cols={1}
              requires={['critere-droite-plan', 'mem-nul-puis-appartenance']}
              explain="Sa conclusion est vraie une fois sur deux, ce qui est pire que fausse. Il faut ajouter une ligne : « et le point A n’appartient pas au plan, car son équation n’y est pas vérifiée ». Alors seulement la conclusion tient."
              explainWrong="Changer de vecteur normal ne changerait rien : tous les vecteurs normaux d’un plan sont multiples les uns des autres, donc le produit resterait nul. C’est un fait sur un POINT qui manque, pas un autre calcul de direction."
              solved={q4}
              onAnswered={() => setQ4(true)}
            />
          )}
          {done3 && (
            <Feedback tone="ok">
              Le critère est complet. Tu sais maintenant décider la position d’une droite et d’un
              plan <strong>sans regarder le dessin</strong> — ce qui est heureux, puisque le dessin
              dépend de l’angle sous lequel tu le regardes.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Trois positions, un seul calcul"
      moduleSubtitle="La flèche qui sort du plan, et les deux tests qui tranchent"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Ce que le produit nul ne dit pas',
        tone: 'indigo',
        body: (
          <p>
            Tu as vu un nombre basculer avec la position, et tu as constaté qu’il ne suffisait pas.
            Voici le nom de ce qu’il utilisait, et le second test qui achève de trancher.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Ce qui vient.</strong> Ce critère porte sur UNE droite et UN plan. Que se
          passe-t-il quand on met deux plans face à face ? Un des trois cas disparaît.
        </KnowledgeSnapshot>
      }
    />
  );
}
