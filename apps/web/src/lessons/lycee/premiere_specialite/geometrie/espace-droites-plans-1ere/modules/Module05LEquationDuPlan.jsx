import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DroitePlanLab, { CarteVerdict } from '../components/DroitePlanLab';
import {
  ORIENTATION_DEPART, ETAT_DEPART, NIVEAUX,
  planNomme, planDuLabo, planDeNormalEtPoint, equationCartesienne, evalPlan, appartient,
  pt, parseSigned, fr, frVec3, v3,
} from '../components/planUtils';

/**
 * Module 5 — LABORATOIRE D'ENTRAÎNEMENT : l'équation cartésienne d'un plan (P6).
 *
 * LE FAIT À FAIRE CONSTATER, ET NON À ANNONCER : les trois premiers
 * coefficients de ax + by + cz + d = 0 SONT les coordonnées d'un vecteur normal
 * au plan. L'étape 1 met côte à côte, pour les trois hauteurs du plan mobile,
 * son équation et son vecteur normal ; l'élève voit les mêmes trois nombres, et
 * c'est lui qui le dit. La brique ne vient qu'ensuite.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  le tableau des trois hauteurs, puis la question qui fait dire le
 *            fait → brique `equation-cartesienne-plan` → `mem-abc-est-le-normal`
 *   étape 2  la méthode en quatre gestes → brique `methode-equation-plan`
 *            → puis la construction d'une équation, coefficient par coefficient
 *   étape 3  vérifier qu'un point est dans un plan, et à quoi sert le d.
 *
 * AUCUNE ÉQUATION N'EST ÉCRITE À LA MAIN. `equationCartesienne` les produit
 * toutes, et un test balaie les 200+ plans engendrés par trois sommets du cube
 * pour vérifier qu'aucune écriture ne produit « + − », « 1x » ni un terme nul.
 *
 * LE LABORATOIRE RESTE PILOTABLE : `disabled` ne porte que l'antériorité.
 */

/** Les trois plans du laboratoire, un par hauteur — tous CALCULÉS. */
const PLANS_MOBILES = NIVEAUX.map((h) => ({ h, plan: planDuLabo({ h }) }));

/** Le plan à construire à l'étape 2 : normal (1 ; 1 ; 1), passant par D. */
const NORMAL_CIBLE = v3(1, 1, 1);
const POINT_CIBLE = 'D';
const PLAN_CIBLE = planDeNormalEtPoint(NORMAL_CIBLE, pt(POINT_CIBLE));

/** Le témoin de vérification : un SECOND point du même plan. */
const TEMOIN = 'E';

/** Le plan de l'étape 3 et son parallèle — le d qui déplace sans tourner. */
const P_BDE = planNomme('BDE');
const P_CFH = planNomme('CFH');

export default function Module05LEquationDuPlan() {
  const [o1, setO1] = useState(ORIENTATION_DEPART);
  const [e1, setE1] = useState(ETAT_DEPART);
  const [hauteursVues, setHauteursVues] = useState(() => new Set([ETAT_DEPART.h]));
  const [q1, setQ1] = useState(false);

  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);

  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);

  const toutesVues = hauteursVues.size === NIVEAUX.length;
  const done1 = toutesVues && q1;
  const done2 = q2a && q2b;
  const done3 = q3a && q3b;

  const monter1 = (e, react) => {
    setE1(e);
    if (hauteursVues.has(e.h)) return;
    const suivant = new Set(hauteursVues);
    suivant.add(e.h);
    setHauteursVues(suivant);
    react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Trois hauteurs, trois équations',
      subtitle:
        'Fais passer le plan par ses trois hauteurs. À chaque fois, son équation et son vecteur normal s’affichent côte à côte. Regarde les nombres.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DroitePlanLab
            orientation={o1}
            onOrientation={setO1}
            etat={e1}
            onEtat={(e) => monter1(e, kit.react)}
            montrer="points"
            montrerNormal
          />
          <div className="rounded-xl border-2 border-rose-200 bg-white overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-rose-50 border-b border-rose-200">
                  <th className="px-2 py-1.5 font-semibold text-rose-900">hauteur</th>
                  <th className="px-2 py-1.5 font-semibold text-rose-900">équation du plan</th>
                  <th className="px-2 py-1.5 font-semibold text-rose-900">vecteur normal</th>
                </tr>
              </thead>
              <tbody>
                {PLANS_MOBILES.map(({ h, plan }) => (
                  <tr key={h}
                    className={`border-t ${hauteursVues.has(h) ? '' : 'opacity-40'} ${h === e1.h ? 'bg-amber-50' : ''}`}>
                    <td className="px-2 py-1.5 font-mono">{fr(h)}</td>
                    <td className="px-2 py-1.5 font-mono font-bold">
                      {hauteursVues.has(h) ? equationCartesienne(plan) : '· · ·'}
                    </td>
                    <td className="px-2 py-1.5 font-mono font-bold text-violet-700">
                      {hauteursVues.has(h) ? frVec3(plan.n) : '· · ·'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!toutesVues && (
            <Feedback tone="info">
              Il te manque des hauteurs. Fais monter et descendre le plan bleu pour remplir les
              trois lignes du tableau.
            </Feedback>
          )}
          {toutesVues && (
            <>
              <Feedback tone="ok">
                Les trois équations diffèrent par <strong>un seul nombre</strong> — le dernier — et
                les trois vecteurs normaux sont <strong>identiques</strong>. C’est cohérent : les
                trois plans sont parallèles, donc ils ont la même direction perpendiculaire.
              </Feedback>
              <TapQuestion
                prompt="Regarde les équations complètes, en écrivant les coefficients nuls : 0x + 0y + z = 0, puis 0x + 0y + z − 1 = 0, puis 0x + 0y + z − 2 = 0. Que remarques-tu entre les trois PREMIERS coefficients et le vecteur normal ?"
                options={[
                  'Ce sont exactement les mêmes trois nombres, dans le même ordre',
                  'Ils sont opposés les uns des autres',
                  'Le vecteur normal est la somme des trois coefficients',
                  'Il n’y a pas de lien : c’est une coïncidence de ce plan-là',
                ]}
                correct={0}
                cols={1}
                requires={['vecteur-normal', 'coordonnees-vecteur-espace']}
                explain="Les trois premiers coefficients de l’équation sont, dans l’ordre, les coordonnées d’un vecteur normal au plan. Ce n’est pas une coïncidence : c’est la définition même, lue à l’envers — le module va l’écrire."
                explainWrong="Compare ligne par ligne : le vecteur normal vaut (0 ; 0 ; 1), et l’équation s’écrit 0x + 0y + 1z + d = 0. Ce sont les mêmes trois nombres. Ce que le dernier coefficient fait, lui, c’est déplacer le plan sans le tourner."
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
              {q1 && (
                <>
                  <KnowledgeBrick
                    id="equation-cartesienne-plan"
                    variant="new"
                    lead={<>Ce que tu viens de remarquer, écrit une fois pour toutes — et d’où cela vient.</>}
                  />
                  <KnowledgeBrick
                    id="mem-abc-est-le-normal"
                    variant="new"
                    lead={<>À retenir en une ligne.</>}
                  />
                </>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Construis l’équation, coefficient par coefficient',
      subtitle:
        'On cherche l’équation du plan de vecteur normal donné, passant par un point donné. Les trois premiers coefficients sont déjà connus — reste le quatrième.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-equation-plan"
            variant="new"
            lead={<>Les quatre gestes, dans l’ordre. Le quatrième est celui qu’on saute.</>}
          />
          <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            <p className="font-semibold">L’énoncé</p>
            <p className="mt-1">
              Trouver l’équation cartésienne du plan de vecteur normal{' '}
              <strong className="font-mono">{frVec3(NORMAL_CIBLE)}</strong> passant par le point{' '}
              <strong className="font-mono">{POINT_CIBLE} {frVec3(pt(POINT_CIBLE))}</strong>.
            </p>
          </div>
          <TapQuestion
            prompt="Premier geste : les trois premiers coefficients. Que vaut le début de l’équation ?"
            options={[
              'x + y + z + d = 0',
              'x + y + z = 0, et il n’y a pas de quatrième coefficient',
              '3x + 3y + 3z + d = 0',
              'On ne peut pas les écrire avant de connaître d',
            ]}
            correct={0}
            cols={1}
            requires={['equation-cartesienne-plan', 'mem-abc-est-le-normal', 'methode-equation-plan']}
            explain={`Les coordonnées du vecteur normal ${frVec3(NORMAL_CIBLE)} se recopient telles quelles en a, b et c. Chacune valant 1, on n’écrit pas le « 1 » : l’équation commence par x + y + z. Le quatrième coefficient reste à trouver — il ne se devine pas, il se calcule.`}
            explainWrong="Le vecteur normal n’a pas à être multiplié ni transformé : ses coordonnées SONT les coefficients. Et il faut bien un quatrième nombre, sans quoi le plan serait forcé de passer par l’origine."
            solved={q2a}
            onAnswered={() => setQ2a(true)}
          />
          {q2a && (
            <NumericQuestion
              prompt={
                <>
                  Second geste : remplace x, y et z par les coordonnées de{' '}
                  <span className="font-mono">{POINT_CIBLE} {frVec3(pt(POINT_CIBLE))}</span> dans
                  x + y + z + d = 0. Que vaut alors <strong>d</strong> ?
                </>
              }
              expected={PLAN_CIBLE.d}
              parse={parseSigned}
              display={fr(PLAN_CIBLE.d)}
              requires={['equation-cartesienne-plan', 'methode-equation-plan']}
              explain={`On écrit ${fr(pt(POINT_CIBLE).x)} + ${fr(pt(POINT_CIBLE).y)} + ${fr(pt(POINT_CIBLE).z)} + d = 0, ce qui donne d = ${fr(PLAN_CIBLE.d)}. L’équation est donc ${equationCartesienne(PLAN_CIBLE)}. Vérification sur un SECOND point, ${TEMOIN} ${frVec3(pt(TEMOIN))} : l’équation y donne ${fr(evalPlan(PLAN_CIBLE, pt(TEMOIN)))}. ✓`}
              explainFor={(n) => (
                n === -PLAN_CIBLE.d
                  ? `Attention au signe : la somme des coordonnées vaut ${fr(-PLAN_CIBLE.d)}, et c’est d qui doit l’annuler. Il vaut donc son opposé.`
                  : n === 0
                  ? `d = 0 signifierait que le plan passe par l’origine. Vérifie : l’origine (0 ; 0 ; 0) donnerait 0, mais le point ${POINT_CIBLE} donnerait ${fr(-PLAN_CIBLE.d)}, et non 0.`
                  : null
              )}
              solved={q2b}
              onAnswered={() => setQ2b(true)}
            />
          )}
          {done2 && (
            <>
              <Feedback tone="ok">
                L’équation est <strong className="font-mono">{equationCartesienne(PLAN_CIBLE)}</strong>,
                et c’est bien le plan <strong>{P_BDE.nom}</strong> de la boîte : les trois points{' '}
                {P_BDE.par.join(', ')} l’annulent tous les trois.
              </Feedback>
              <CarteVerdict
                titre="La vérification, sur les trois points du plan"
                tone="emerald"
                lignes={P_BDE.par.map((nom) => ({
                  label: `${nom} ${frVec3(pt(nom))} donne`,
                  valeur: fr(evalPlan(PLAN_CIBLE, pt(nom))),
                }))}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'À quoi sert le quatrième nombre',
      subtitle:
        'Deux plans, mêmes trois premiers coefficients, quatrièmes différents. Que change ce dernier nombre ?',
      done: done3,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CarteVerdict titre={P_BDE.nom} tone="indigo" lignes={[
              { label: 'équation', valeur: equationCartesienne(P_BDE) },
              { label: 'vecteur normal', valeur: frVec3(P_BDE.n) },
              { label: 'dernier coefficient', valeur: fr(P_BDE.d) },
            ]} />
            <CarteVerdict titre={P_CFH.nom} tone="indigo" lignes={[
              { label: 'équation', valeur: equationCartesienne(P_CFH) },
              { label: 'vecteur normal', valeur: frVec3(P_CFH.n) },
              { label: 'dernier coefficient', valeur: fr(P_CFH.d) },
            ]} />
          </div>
          <TapQuestion
            prompt="Ces deux plans ont le même vecteur normal et des derniers coefficients différents. Que peut-on en dire ?"
            options={[
              'Ils sont parallèles : même direction, positions différentes',
              'Ils sont sécants : leurs équations diffèrent',
              'Ils sont confondus : leurs directions sont les mêmes',
              'Ils sont perpendiculaires',
            ]}
            correct={0}
            cols={1}
            requires={['equation-cartesienne-plan', 'critere-deux-plans', 'mem-abc-est-le-normal']}
            explain={`Les trois premiers coefficients donnent la DIRECTION du plan : identiques ici, donc plans parallèles. Le quatrième dit OÙ il est posé : ${fr(P_BDE.d)} contre ${fr(P_CFH.d)}, donc ils ne sont pas confondus.`}
            explainWrong="Deux équations différentes ne suffisent pas à conclure « sécants » : ce sont les trois premiers coefficients qui décident du parallélisme, et ils sont ici les mêmes. Le quatrième ne fait que translater le plan."
            solved={q3a}
            onAnswered={() => setQ3a(true)}
          />
          {q3a && (
            <TapQuestion
              prompt={`Le point G ${frVec3(pt('G'))} appartient-il au plan ${P_BDE.nom}, d’équation ${equationCartesienne(P_BDE)} ?`}
              options={[
                `Non : l’équation y donne ${fr(evalPlan(P_BDE, pt('G')))}, et non 0`,
                `Oui : l’équation y donne ${fr(evalPlan(P_BDE, pt('G')))}, ce qui est positif`,
                'Oui : G est un sommet du cube, et le plan traverse le cube',
                `Non, mais il appartient à ${P_CFH.nom}, dont l’équation y donne ${fr(evalPlan(P_CFH, pt('G')))}`,
              ]}
              correct={0}
              cols={1}
              requires={['equation-cartesienne-plan', 'methode-equation-plan']}
              explain={`Un point appartient au plan exactement quand l’équation y donne ZÉRO. Ici elle donne ${fr(evalPlan(P_BDE, pt('G')))} : G est hors du plan. Le nombre obtenu n’est pas rien pour autant — il dit de quel côté du plan on se trouve, et sa valeur absolue servira au module 7 pour mesurer la distance.`}
              explainWrong={`Attention à la dernière option, qui est presque vraie : l’équation de ${P_CFH.nom} donne bien ${fr(evalPlan(P_CFH, pt('G')))} en G, ce qui n’est pas 0 non plus. G n’appartient à aucun des deux.`}
              solved={q3b}
              onAnswered={() => setQ3b(true)}
            />
          )}
          {done3 && (
            <Feedback tone="ok">
              Tu sais écrire un plan, et vérifier qu’un point y est. Et tu viens de rencontrer un
              nombre qui n’est pas nul et qui veut dire quelque chose — garde-le en tête, le
              module 7 s’en servira pour mesurer.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="L’équation du plan"
      moduleSubtitle="Une seule ligne pour un plan entier, et trois coefficients qui ne sont pas quelconques"
      estimatedTime="10 min"
      brief={{
        tag: 'Laboratoire',
        title: 'Que cachent les coefficients d’une équation de plan ?',
        tone: 'indigo',
        body: (
          <p>
            Fais monter le plan à travers ses trois hauteurs et remplis le tableau. La réponse est
            déjà écrite dedans — il te reste à la voir.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Ce qui vient.</strong> Tu sais écrire les deux objets. Il est temps de
          DÉMONTRER : parallélisme et orthogonalité, sans jamais invoquer le dessin.
        </KnowledgeSnapshot>
      }
    />
  );
}
