import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CarteVerdict } from '../components/DroitePlanLab';
import {
  planNomme, equationCartesienne, evalPlan, distancePointPlan, distanceDeuxPlans,
  projeteSurPlan, radical, NOMS, pt, parseSigned, fr, frVec3,
} from '../components/planUtils';

/**
 * Module 7 — LABORATOIRE D'ENTRAÎNEMENT : les distances (P7).
 *
 * L'IDÉE QUE LE MODULE FAIT PRODUIRE : le nombre qu'une équation de plan rend
 * en un point n'est pas un déchet de calcul. Sa valeur absolue, divisée par la
 * longueur du normal, EST la distance du point au plan. Son signe dit de quel
 * côté l'on est.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  le tableau des huit sommets : ce que l'équation leur répond, et
 *            la distance qui en sort → brique `formule-distance-point-plan`
 *            → puis les questions
 *   étape 2  la méthode en quatre gestes → brique `methode-distance-espace`
 *            → puis le calcul d'une distance et celle entre deux plans
 *            parallèles.
 *
 * TOUTES LES DISTANCES SONT EXACTES, EN RADICAUX. `quotientRadical` rationalise
 * et simplifie, et un test balaie 117 quotients en vérifiant que la forme
 * rendue vaut NUMÉRIQUEMENT le quotient de départ : une simplification fausse
 * affichée comme exacte serait indétectable à l'œil.
 *
 * PAS DE FIGURE ICI. Le plan (BDE) est oblique dans la boîte : le dessiner
 * sans pouvoir le tourner mentirait sur les distances — un sommet paraîtrait
 * plus proche qu'un autre selon l'angle. Le module travaille donc sur les
 * NOMBRES, où le dessin ne peut pas contredire le calcul. C'est la même parade
 * qu'au module 3.
 */

/** Le plan de référence : (BDE), d'équation x + y + z − 2 = 0, normal (1;1;1).
 *  Ses distances sortent en 2√3/3 et 4√3/3 — des radicaux lisibles, et
 *  différents entre eux, donc discriminants dans un QCM. */
const P = planNomme('BDE');

/** Ce que l'équation répond à chacun des huit sommets, CALCULÉ. */
const LIGNES = NOMS.map((nom) => {
  const M = pt(nom);
  return { nom, M, ...distancePointPlan(M, P) };
});

/** Les deux sommets extrêmes, et leurs distances — CALCULÉES. */
const D_A = distancePointPlan(pt('A'), P);
const D_G = distancePointPlan(pt('G'), P);

/** Le plan parallèle, et la distance entre les deux. */
const P2 = planNomme('CFH');
const D_PLANS = distanceDeuxPlans(P, P2);

/** Le projeté orthogonal de A sur le plan — le point du plan le plus proche. */
const PROJETE_A = projeteSurPlan(pt('A'), P);

export default function Module07MesurerLEcart() {
  const [q1a, setQ1a] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);

  const done1 = q1a && q1b;
  const done2 = q2a && q2b;

  const steps = [
    {
      num: 1,
      title: 'Ce que l’équation répond à chaque point',
      subtitle:
        'Le plan (BDE) traverse la boîte en biais. Voici ce que son équation donne en chacun des huit coins — et ce que cela mesure.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            Le plan <strong>{P.nom}</strong> a pour équation{' '}
            <strong className="font-mono">{equationCartesienne(P)}</strong> et pour vecteur normal{' '}
            <strong className="font-mono">{frVec3(P.n)}</strong>. On remplace x, y et z par les
            coordonnées de chaque coin, et on regarde ce qui sort.
          </div>
          <div className="rounded-xl border-2 border-rose-200 bg-white overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-rose-50 border-b border-rose-200">
                  <th className="px-2 py-1.5 font-semibold text-rose-900">coin</th>
                  <th className="px-2 py-1.5 font-semibold text-rose-900">coordonnées</th>
                  <th className="px-2 py-1.5 font-semibold text-rose-900">ce que l’équation donne</th>
                  <th className="px-2 py-1.5 font-semibold text-rose-900">distance au plan</th>
                </tr>
              </thead>
              <tbody>
                {LIGNES.map((l) => (
                  <tr key={l.nom} className={`border-t ${l.brut === 0 ? 'bg-emerald-50' : ''}`}>
                    <td className="px-2 py-1.5 font-mono font-bold">{l.nom}</td>
                    <td className="px-2 py-1.5 font-mono text-slate-600">{frVec3(l.M)}</td>
                    <td className="px-2 py-1.5 font-mono font-bold tabular-nums">{fr(l.brut)}</td>
                    <td className="px-2 py-1.5 font-mono font-bold text-rose-700">{l.texte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <KnowledgeBrick
            id="formule-distance-point-plan"
            variant="new"
            lead={<>D’où sort la colonne de droite. Relis le tableau ligne par ligne en la lisant.</>}
          />
          <TapQuestion
            prompt="Trois coins donnent 0 dans la colonne du milieu. Qu’ont-ils de particulier ?"
            options={[
              `Ils appartiennent au plan : ce sont ${P.par.join(', ')}, les trois points qui le définissent`,
              'Ils sont les plus proches du plan sans y être',
              'Ce sont les coins cachés du dessin',
              'C’est un hasard dû aux coordonnées de la boîte',
            ]}
            correct={0}
            cols={1}
            requires={['equation-cartesienne-plan', 'formule-distance-point-plan']}
            explain={`Un point appartient au plan exactement quand son équation y donne 0 — et une distance nulle dit la même chose autrement. Les trois coins ${P.par.join(', ')} sont précisément ceux qui définissent le plan.`}
            explainWrong="La colonne du milieu n’est pas une mesure de proximité brute : c’est ce que l’équation répond. Elle vaut 0 exactement sur le plan, et son signe dit ensuite de quel côté l’on se trouve."
            solved={q1a}
            onAnswered={() => setQ1a(true)}
          />
          {q1a && (
            <TapQuestion
              prompt={`Le coin A donne ${fr(D_A.brut)} et le coin G donne ${fr(D_G.brut)}. Que dit la différence de SIGNE entre ces deux nombres ?`}
              options={[
                'Que A et G sont de part et d’autre du plan : le plan passe entre eux',
                'Que A est plus proche du plan que G',
                'Qu’une erreur de calcul s’est glissée : une distance ne peut pas être négative',
                'Que A est à l’intérieur de la boîte et G à l’extérieur',
              ]}
              correct={0}
              cols={1}
              requires={['formule-distance-point-plan', 'equation-cartesienne-plan']}
              explain={`Le signe n’appartient pas à la distance — on en prend la valeur absolue — mais il dit de quel CÔTÉ du plan on se trouve. Ici les deux signes sont opposés, donc le plan sépare A de G. Les distances, elles, valent ${D_A.texte} et ${D_G.texte} : G est deux fois plus loin.`}
              explainWrong={`Il n’y a pas d’erreur : c’est bien la valeur absolue qui donne la distance, et elle vaut ${D_A.texte} pour A. Le nombre signé, lui, porte une information de plus, que la valeur absolue efface.`}
              solved={q1b}
              onAnswered={() => setQ1b(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Calcule, et n’oublie pas le dénominateur',
      subtitle:
        'La méthode en quatre gestes, puis deux calculs : un point à un plan, et deux plans parallèles entre eux.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-distance-espace"
            variant="new"
            lead={<>Les quatre gestes. Le quatrième est celui qu’on saute — et il change presque tout.</>}
          />
          <CarteVerdict titre={`La distance de G ${frVec3(pt('G'))} au plan ${P.nom}`} tone="amber" lignes={[
            { label: 'équation du plan', valeur: equationCartesienne(P) },
            { label: 'ce que l’équation donne en G', valeur: fr(D_G.brut) },
            { label: 'sa valeur absolue', valeur: fr(D_G.num) },
            { label: 'a² + b² + c²', valeur: fr(D_G.n2) },
            { label: 'la longueur du normal', valeur: radical(D_G.n2) },
          ]} />
          <NumericQuestion
            prompt={
              <>
                Un élève oublie le dénominateur et annonce que la distance de G au plan vaut{' '}
                <span className="font-mono">{fr(D_G.num)}</span>. Quel est le{' '}
                <strong>carré de la longueur du vecteur normal</strong> par lequel il aurait dû
                diviser ?
              </>
            }
            expected={D_G.n2}
            parse={parseSigned}
            display={fr(D_G.n2)}
            requires={['formule-distance-point-plan', 'methode-distance-espace', 'formule-norme-espace']}
            explain={`Le vecteur normal vaut ${frVec3(P.n)}, donc a² + b² + c² = ${fr(D_G.n2)} et sa longueur est ${radical(D_G.n2)}. La vraie distance vaut ${fr(D_G.num)}/${radical(D_G.n2)} = ${D_G.texte}, soit environ ${fr(D_G.valeur)} — et non ${fr(D_G.num)}. Ce n’est pas un arrondi : l’écart dépasse ${fr(D_G.num - D_G.valeur)}.`}
            explainFor={(n) => (
              n === D_G.num
                ? `${fr(D_G.num)} est le NUMÉRATEUR, ce que l’équation donne en G. Le dénominateur se calcule sur le vecteur normal ${frVec3(P.n)}, pas sur le point.`
                : n === 1
                ? 'Un dénominateur de 1 supposerait un vecteur normal de longueur 1, ce qui est rare. Ici il vaut (1 ; 1 ; 1), dont le carré de la longueur est la somme des trois carrés.'
                : null
            )}
            solved={q2a}
            onAnswered={() => setQ2a(true)}
          />
          {q2a && (
            <>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                Les plans <strong>{P.nom}</strong> et <strong>{P2.nom}</strong>, d’équations{' '}
                <span className="font-mono">{equationCartesienne(P)}</span> et{' '}
                <span className="font-mono">{equationCartesienne(P2)}</span>, sont parallèles : tu
                l’as démontré au module précédent. Quelle distance les sépare ?
              </div>
              <TapQuestion
                prompt={`On prend le point B ${frVec3(pt('B'))}, qui appartient à ${P.nom}, et on calcule sa distance à ${P2.nom}. Que trouve-t-on ?`}
                options={[
                  `${D_PLANS.texte}`,
                  `${D_G.texte}`,
                  `${radical(D_PLANS.n2)}`,
                  `${fr(D_PLANS.num)}`,
                ]}
                correct={0}
                cols={4}
                requires={['methode-distance-espace', 'formule-distance-point-plan', 'critere-deux-plans']}
                explain={`L’équation de ${P2.nom} donne ${fr(evalPlan(P2, pt('B')))} en B, dont la valeur absolue vaut ${fr(D_PLANS.num)}. On divise par ${radical(D_PLANS.n2)}, et l’on obtient ${D_PLANS.texte}, soit environ ${fr(D_PLANS.valeur)}. C’est la distance qui sépare les deux plans, la même en tout point.`}
                explainWrong={`${fr(D_PLANS.num)} serait la réponse si l’on oubliait de diviser, et ${radical(D_PLANS.n2)} si l’on divisait le mauvais nombre. Les deux plans étant parallèles, la distance est la même partout : n’importe quel point de l’un donne le même résultat.`}
                solved={q2b}
                onAnswered={() => setQ2b(true)}
              />
            </>
          )}
          {done2 && (
            <Feedback tone="ok">
              Le point du plan le plus proche de A est son <strong>projeté orthogonal</strong>,{' '}
              <span className="font-mono">{frVec3(PROJETE_A)}</span> : c’est le pied de la
              perpendiculaire, et la longueur de ce trajet est exactement {D_A.texte}. Toute autre
              route vers le plan est plus longue.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Mesurer l’écart"
      moduleSubtitle="Le nombre que l’équation rend en un point, et ce qu’il mesure"
      estimatedTime="7 min"
      brief={{
        tag: 'Laboratoire',
        title: 'Un nombre qui n’était pas un déchet',
        tone: 'amber',
        body: (
          <p>
            Au module précédent, l’équation d’un plan a rendu 4 en un point qui n’était pas dedans.
            Ce 4 n’était pas rien : divisé par la bonne chose, c’est une distance.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>Ce qui vient.</strong> Dix épreuves, sur tout ce que tu as construit : les
          positions relatives, les deux écritures, les démonstrations et les distances.
        </KnowledgeSnapshot>
      }
    />
  );
}
