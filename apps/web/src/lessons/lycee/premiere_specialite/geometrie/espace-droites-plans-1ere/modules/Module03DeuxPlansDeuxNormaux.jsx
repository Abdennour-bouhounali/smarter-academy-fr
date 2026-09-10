import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DroitePlanLab, { CarteVerdict } from '../components/DroitePlanLab';
import {
  ORIENTATION_DEPART, ETAT_DEPART,
  planNomme, verdictDeuxPlans, LABEL_DEUX_PLANS,
  equationCartesienne, frVec3, fr, dot3,
} from '../components/planUtils';

/**
 * Module 3 — DÉCOUVERTE : deux plans, et le cas qui disparaît.
 *
 * L'IDÉE QUE LE MODULE FAIT PRODUIRE : le troisième cas des DROITES — « ni
 * sécantes, ni parallèles » — n'a PAS d'équivalent pour deux plans. Deux plans
 * sont trop grands pour s'éviter sans être parallèles. Et quand ils se coupent,
 * ce n'est jamais en un point : c'est selon une DROITE entière.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  le plan mobile devient DEUX plans, l'un fixe et l'un mobile ;
 *            l'élève constate qu'ils ne se rencontrent jamais tant qu'ils
 *            gardent la même direction perpendiculaire
 *            → brique `deux-plans-deux-cas`, puis la question.
 *   étape 2  les cinq couples du cube, tous CALCULÉS
 *            → brique `critere-deux-plans`, puis les questions.
 *
 * AUCUN VERDICT N'EST ÉCRIT À LA MAIN. `verdictDeuxPlans` les calcule tous, et
 * les tests recalculent chaque équation citée. Un énoncé faux est impossible.
 *
 * LE LABORATOIRE RESTE PILOTABLE : `disabled` ne porte que l'antériorité.
 */

/** Les couples travaillés, tous CALCULÉS. */
const P_ABC = planNomme('ABC');   // le plancher : z = 0
const P_EFG = planNomme('EFG');   // le plafond  : z − 2 = 0
const P_ABF = planNomme('ABF');   // la face avant : y = 0
const P_BDE = planNomme('BDE');   // le plan diagonal : x + y + z − 2 = 0
const P_CFH = planNomme('CFH');   // son parallèle    : x + y + z − 4 = 0

const V_PLANCHER_PLAFOND = verdictDeuxPlans(P_ABC, P_EFG);
const V_PLANCHER_AVANT = verdictDeuxPlans(P_ABC, P_ABF);
const V_BDE_CFH = verdictDeuxPlans(P_BDE, P_CFH);
const V_BDE_PLANCHER = verdictDeuxPlans(P_BDE, P_ABC);

/** Le produit des normaux du plancher et de la face avant : il vaut 0, donc
 *  ils sont perpendiculaires — ET sécants. Deux faits, pas un seul. */
const PRODUIT_PLANCHER_AVANT = dot3(P_ABC.n, P_ABF.n);

const carte = (verdict, tone) => (
  <CarteVerdict
    titre={`${verdict.p1.nom} et ${verdict.p2.nom}`}
    tone={tone}
    lignes={[
      { label: `équation de ${verdict.p1.nom}`, valeur: equationCartesienne(verdict.p1) },
      { label: `équation de ${verdict.p2.nom}`, valeur: equationCartesienne(verdict.p2) },
      { label: `normal de ${verdict.p1.nom}`, valeur: frVec3(verdict.p1.n) },
      { label: `normal de ${verdict.p2.nom}`, valeur: frVec3(verdict.p2.n) },
      { label: 'normaux colinéaires ?', valeur: verdict.normauxColineaires ? 'oui' : 'non' },
    ]}
  />
);

export default function Module03DeuxPlansDeuxNormaux() {
  const [o1, setO1] = useState(ORIENTATION_DEPART);
  const [e1, setE1] = useState(ETAT_DEPART);
  const [bouge1, setBouge1] = useState(false);
  const [q1, setQ1] = useState(false);

  const [q2a, setQ2a] = useState(false);
  const [q2b, setQ2b] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = bouge1 && q1;
  const done2 = q2a && q2b;
  const done3 = q3;

  const monter1 = (e, react) => {
    setE1(e);
    if (bouge1) return;
    if (e.h !== ETAT_DEPART.h) { setBouge1(true); react?.(true); }
  };

  const steps = [
    {
      num: 1,
      title: 'Deux plans qui ne se rencontrent jamais',
      subtitle:
        'Le plancher de la boîte est un plan, lui aussi. Fais monter le plan bleu et regarde : à quelle hauteur finira-t-il par toucher le plancher ?',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
            Le fond de la boîte porte un plan : c’est <strong>{P_ABC.nom}</strong>, d’équation{' '}
            <strong className="font-mono">{equationCartesienne(P_ABC)}</strong>. Le plan bleu que tu
            fais monter est horizontal lui aussi. Monte-le, descends-le, tourne la boîte.
          </div>
          <DroitePlanLab
            orientation={o1}
            onOrientation={setO1}
            etat={e1}
            onEtat={(e) => monter1(e, kit.react)}
            montrer="points"
            montrerNormal
          />
          {bouge1 && (
            <>
              <Feedback tone="ok">
                À aucune hauteur le plan bleu ne rencontre le plancher — sauf s’il se pose{' '}
                <strong>exactement dessus</strong>, et alors ce n’est plus qu’un seul et même plan.
                Deux plans qui gardent la même direction perpendiculaire gardent le même écart
                partout.
              </Feedback>
              <KnowledgeBrick
                id="deux-plans-deux-cas"
                variant="new"
                lead={<>Deux plans : ce qui reste possible, et ce qui ne l’est plus. Refais monter le plan en le lisant.</>}
              />
              <TapQuestion
                prompt="Deux DROITES de l’espace pouvaient n’être ni sécantes ni parallèles. Est-ce encore possible pour deux PLANS ?"
                options={[
                  'Non : deux plans sont soit sécants, soit parallèles — le troisième cas disparaît',
                  'Oui, exactement comme pour deux droites',
                  'Oui, mais seulement si les deux plans sont très inclinés',
                  'On ne peut pas le savoir sans connaître leurs équations',
                ]}
                correct={0}
                cols={1}
                requires={['deux-plans-deux-cas', 'droites-espace-trois-cas']}
                explain="Deux droites peuvent se manquer parce qu’elles sont minces. Deux plans sont infinis dans deux directions : s’ils n’ont pas la même direction perpendiculaire, ils finissent forcément par se croiser — et ils le font selon une droite entière."
                explainWrong="Essaie de te représenter deux plans qui ne seraient ni parallèles ni sécants : il faudrait qu’ils s’évitent, alors qu’ils s’étendent à l’infini dans toutes leurs directions. C’est justement ce que deux droites, minces, peuvent faire."
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce sont les normaux qui décident',
      subtitle:
        'Quatre couples de plans du cube. Les équations sont données, et à côté, leurs vecteurs normaux. Un seul fait sépare les parallèles des sécants.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {carte(V_PLANCHER_PLAFOND, 'emerald')}
            {carte(V_BDE_CFH, 'emerald')}
            {carte(V_PLANCHER_AVANT, 'indigo')}
            {carte(V_BDE_PLANCHER, 'indigo')}
          </div>
          <KnowledgeBrick
            id="critere-deux-plans"
            variant="new"
            lead={<>Le critère, en une ligne. Vérifie-le sur les quatre cartes ci-dessus, une par une.</>}
          />
          <TapQuestion
            prompt={`Les plans ${P_BDE.nom} et ${P_CFH.nom} ont pour équations ${equationCartesienne(P_BDE)} et ${equationCartesienne(P_CFH)}. Que peut-on affirmer ?`}
            options={[
              `Ils sont ${LABEL_DEUX_PLANS[V_BDE_CFH.position]} : leurs normaux sont identiques et leurs derniers coefficients diffèrent`,
              'Ils sont sécants, puisque leurs équations ne sont pas les mêmes',
              'Ils sont confondus, puisque leurs trois premiers coefficients sont les mêmes',
              'Ils sont perpendiculaires',
            ]}
            correct={0}
            cols={1}
            requires={['critere-deux-plans', 'deux-plans-deux-cas', 'colin-direction']}
            explain={`Les deux normaux valent ${frVec3(P_BDE.n)} : ils sont colinéaires, donc les plans sont parallèles. Ils ne sont pas confondus, puisque les derniers coefficients diffèrent — ${fr(P_BDE.d)} contre ${fr(P_CFH.d)}. C’est ce dernier nombre qui dit où chaque plan est posé.`}
            explainWrong="Les trois premiers coefficients donnent la DIRECTION du plan, le quatrième dit où il est posé. Ici les directions coïncident et les positions non : c’est la définition de deux plans strictement parallèles."
            solved={q2a}
            onAnswered={() => setQ2a(true)}
          />
          {q2a && (
            <TapQuestion
              prompt={`Le plancher a pour normal ${frVec3(P_ABC.n)} et la face avant ${frVec3(P_ABF.n)}. Leur produit scalaire vaut ${fr(PRODUIT_PLANCHER_AVANT)}. Qu’en conclut-on ?`}
              options={[
                'Que les deux plans sont perpendiculaires — et donc sécants, puisqu’ils ne sont pas parallèles',
                'Que les deux plans sont parallèles, puisque le produit est nul',
                'Que les deux plans sont confondus',
                'Qu’on ne peut rien conclure d’un produit nul',
              ]}
              correct={0}
              cols={1}
              requires={['critere-deux-plans', 'regle-orthogonalite']}
              explain={`Un produit nul entre les normaux, c’est l’angle droit — le plancher et le mur du fond se rejoignent bien à angle droit. Et comme leurs normaux ne sont pas colinéaires, les deux plans sont sécants : leur intersection est l’arête [AB].`}
              explainWrong="Attention à ne pas confondre deux critères : pour deux PLANS, la colinéarité des normaux donne le parallélisme, et le produit nul donne la perpendicularité. Ce sont deux calculs différents sur les mêmes deux vecteurs."
              solved={q2b}
              onAnswered={() => setQ2b(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Sécants selon quoi ?',
      subtitle: 'Quand deux plans se coupent, à quoi ressemble ce qu’ils partagent ?',
      done: done3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Regarde la boîte : le plancher {P_ABC.nom} et la face avant {P_ABF.nom} se rejoignent
            le long de l’arête du bas. Cette arête n’est qu’un morceau de ce qu’ils partagent
            réellement, puisque les deux plans se prolongent bien au-delà de la boîte.
          </div>
          <TapQuestion
            prompt="Deux plans sécants ont en commun…"
            options={[
              'une droite entière, infinie dans les deux sens',
              'un seul point',
              'un segment, de la longueur de l’arête où ils se rejoignent',
              'une infinité de points sans forme particulière',
            ]}
            correct={0}
            cols={1}
            requires={['deux-plans-deux-cas', 'critere-deux-plans']}
            explain="Deux plans sécants partagent une droite. Sur la boîte on n’en voit qu’un morceau — l’arête — mais les deux plans continuent, et leur intersection avec eux. Un seul point commun est impossible pour deux plans : dès qu’ils se touchent quelque part, ils se touchent tout au long d’une droite."
            explainWrong="Le segment que tu vois sur la boîte est ce que le dessin peut montrer, pas ce que les plans partagent. Comme la droite du module 1, l’objet est infini et le dessin n’en montre qu’un morceau."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <Feedback tone="ok">
              Tu sais maintenant trancher les positions relatives de tout ce qui compte : une
              droite et un plan, deux plans. Il reste à savoir <strong>écrire</strong> ces objets —
              une droite par un paramètre, un plan par une équation — pour pouvoir calculer sans
              avoir la figure sous les yeux.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Deux plans, deux normaux"
      moduleSubtitle="Le troisième cas disparaît, et l’intersection n’est jamais un point"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Deux plans peuvent-ils s’éviter sans être parallèles ?',
        tone: 'indigo',
        body: (
          <p>
            Deux droites de l’espace le pouvaient. Fais monter un plan à travers la boîte et
            regarde s’il finit par toucher le plancher.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Ce qui vient.</strong> Jusqu’ici, les droites et les plans t’étaient donnés par
          des points de la boîte. Il faut maintenant savoir les ÉCRIRE, pour calculer sans figure.
        </KnowledgeSnapshot>
      }
    />
  );
}
