import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BarreLab from '../components/BarreLab';
import { parseReel } from '../components/parseBridge';
import {
  COS, familleSolutions, solutionPrincipaleCos, labelPi, ecritureK, TAU,
} from '../components/trigEqUtils';

/**
 * Module 2 — DÉCOUVERTE : cos x = k sur ℝ (LP1).
 *
 * Étape 1  MESURER l'écart. L'élève amène la barre sur une hauteur
 *          remarquable, et le laboratoire matérialise l'écart entre deux
 *          points d'une même branche. Il le SAISIT au clavier : 2π. C'est le
 *          nombre qui manquait au module 1.
 * Étape 2  la brique `solutions-sur-r` est posée sur ce constat, puis
 *          `methode-cos-sur-r` donne l'écriture, et la question l'exige.
 * Étape 3  le piège frontal : « x = π/3 » est une réponse INCOMPLÈTE. La
 *          brique `mem-plus-deux-k-pi` referme.
 *
 * CONNAISSANCES AVANT LA DEMANDE : geste → constat → brique → demande, dans
 * cet ordre, et l'ORDRE DU SOURCE EST LA LIGNE DU TEMPS.
 *
 * TOUT CE QUI S'AFFICHE EST DÉRIVÉ du modèle pur : la solution principale, les
 * deux branches, l'écriture de la famille. Aucun nombre n'est saisi à la main.
 *
 * MANIPULATION JAMAIS GELÉE : le laboratoire reste réglable après validation.
 */

/** La cible de l'étape 1 : k = 1/2, dont la solution principale est π/3. */
const K_CIBLE = 0.5;
const A_CIBLE = solutionPrincipaleCos(K_CIBLE);
const FAM_CIBLE = familleSolutions(COS, K_CIBLE);

export default function Module02UneInfiniteDeSolutions() {
  const [k1, setK1] = useState(0);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  // L'élève doit AVOIR amené la barre sur la hauteur remarquable avant de
  // mesurer : sinon il mesurerait sur une figure qu'il n'a pas construite.
  const surCible = Math.abs(k1 - K_CIBLE) < 1e-12;
  const done1 = q1;
  const done2 = q2;
  const done3 = q3;

  const steps = [
    {
      num: 1,
      title: 'De combien avance-t-on d’un point au suivant ?',
      subtitle:
        'Amène la barre sur k = 1/2 (attrape-la et glisse). Le laboratoire mesure alors l’écart entre deux points allumés d’une même branche. Lis-le.',
      done: done1,
      content: (
        <div className="space-y-3">
          <BarreLab fn={COS} k={k1} onChangeK={setK1} montreEcart />
          {surCible ? (
            <Feedback tone="info">
              La barre est sur <strong>k = {ecritureK(K_CIBLE)}</strong>. Le trait violet, au-dessus
              d’elle, relie deux points allumés d’une même branche. C’est cet écart-là qu’il
              faut nommer — et tu le connais déjà : c’est un tour complet.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Fais glisser la barre jusqu’à la hauteur <strong>{ecritureK(K_CIBLE)}</strong> —
              elle y est aimantée, tu ne peux pas la manquer. Hauteur actuelle :
              k = {ecritureK(k1)}.
            </Feedback>
          )}
          <NumericQuestion
            prompt="Quel est l’écart entre deux points allumés d’une même branche, en unités de π ? (Autrement dit : cet écart vaut … × π)"
            answer={2}
            parse={parseReel}
            requires={['periodicite', 'cercle-trigonometrique']}
            explain="L’écart vaut 2π — un tour complet. C’est exactement la périodicité que tu connais : ajouter un tour au réel ne change pas le point du cercle, donc ne change pas son abscisse. Le point suivant de la même branche est donc à 2π du précédent, toujours."
            explainWrong="Regarde les graduations sous le trait violet : il part d’un point allumé et arrive au suivant de la même branche, en franchissant exactement un tour. Un tour, en radians, c’est 2π — donc la réponse à saisir est 2."
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Écrire toutes les solutions d’un coup',
      done: done2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 text-sm text-slate-700 space-y-2">
            <p>
              Deux renseignements suffisent, et tu les as tous les deux :
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                le cercle donne les <strong>deux points d’un tour</strong> : pour
                cos x = {ecritureK(K_CIBLE)}, ce sont {labelPi(A_CIBLE)} et {labelPi(-A_CIBLE)} ;
              </li>
              <li>
                la mesure que tu viens de faire donne l’<strong>écart</strong> : {labelPi(TAU)}.
              </li>
            </ul>
          </div>
          <KnowledgeBrick
            id="solutions-sur-r"
            variant="new"
            lead={<>Ce que tu viens de compter porte un nom précis.</>}
          />
          <KnowledgeBrick
            id="methode-cos-sur-r"
            variant="new"
            lead={<>Et voici l’écriture qui les contient toutes.</>}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
            <MathText>{`$$\\cos x = \\dfrac{1}{2} \\iff ${FAM_CIBLE.tex}$$`}</MathText>
          </div>
          <TapQuestion
            prompt="On résout cos x = √2/2 sur ℝ. On sait que cos(π/4) = √2/2. Quelle est la bonne écriture de TOUTES les solutions ?"
            options={[
              'x = π/4 + 2kπ ou x = −π/4 + 2kπ, avec k entier',
              'x = π/4 seulement',
              'x = π/4 + 2kπ seulement',
              'x = π/4 + kπ ou x = −π/4 + kπ',
            ]}
            correct={0}
            cols={1}
            requires={['solutions-sur-r', 'methode-cos-sur-r', 'valeurs-remarquables']}
            explain="Il faut les DEUX branches (le cercle donne deux points : π/4 et −π/4), et le « + 2kπ » sur CHACUNE. Une seule branche laisserait de côté la moitié des solutions ; un pas de kπ en inventerait qui n’existent pas — cos(π/4 + π) vaut −√2/2, pas √2/2."
            explainWrong="Reviens à la figure du module 1 : à chaque hauteur, il y avait DEUX familles de points allumés, pas une. Et l’écart entre deux points d’une même famille vaut 2π, pas π — un demi-tour amène de l’autre côté du cercle, où l’abscisse a changé de signe."
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le piège de la réponse trop courte',
      done: done3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="mem-plus-deux-k-pi"
            variant="new"
            lead={<>Une seule chose à ne jamais oublier.</>}
          />
          <TapQuestion
            prompt="Un élève résout cos x = 1/2 sur ℝ et répond « x = π/3 ». Que peut-on lui dire ?"
            options={[
              'Sa réponse est juste mais très incomplète : π/3 est bien une solution, mais il en a oublié une infinité',
              'Sa réponse est fausse : π/3 n’est pas solution',
              'Sa réponse est complète',
              'Il aurait dû répondre −π/3 à la place',
            ]}
            correct={0}
            cols={1}
            requires={['solutions-sur-r', 'methode-cos-sur-r', 'mem-plus-deux-k-pi']}
            explain={`π/3 vérifie bien l'équation, on peut le vérifier : cos(π/3) = 0,5. Mais ${labelPi(FAM_CIBLE.base[1])}, ${labelPi(FAM_CIBLE.base[0] + TAU)}, ${labelPi(FAM_CIBLE.base[1] + TAU)}… la vérifient aussi, et il y en a une infinité. Une réponse à « résoudre sur ℝ » doit les décrire toutes.`}
            explainWrong="Vérifie d’abord : cos(π/3) = 0,5, donc π/3 EST une solution — la réponse n’est pas fausse. Mais fais glisser la barre à cette hauteur et compte les points : il y en a bien plus qu’un. Et −π/3 n’est pas « à la place » de π/3 : les deux sont solutions."
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Une infinité de solutions"
      moduleSubtitle="Deux points, un écart, et tout est dit"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'L’écriture qui les contient toutes',
        tone: 'indigo',
        body: (
          <p>
            Le module précédent t’a laissé avec une question : comment écrire une réponse qui
            contienne des points sans fin ? Il suffit de deux renseignements — <strong>où sont
            les deux points du cercle</strong>, et <strong>de combien on avance</strong> pour
            passer d’un point au suivant.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Et pour le sinus ?</strong> La démarche sera la même — mais la deuxième
          branche, elle, ne sera pas du tout au même endroit. C’est le module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
