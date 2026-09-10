import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BarreLab from '../components/BarreLab';
import {
  COS, SIN, familleSolutions, solutionsDansFenetre, labelPi, ecritureK, TAU,
} from '../components/trigEqUtils';

/**
 * Module 3 — DÉCOUVERTE : sin x = k sur ℝ, et l'AUTRE symétrie (LP2).
 *
 * Étape 1  DEUX laboratoires côte à côte, à la MÊME hauteur k : celui du
 *          cosinus et celui du sinus. L'élève règle les deux et compare la
 *          position des deux points sur chaque cercle. Ils ne sont pas au même
 *          endroit — et c'est tout le module.
 * Étape 2  la brique `methode-sin-sur-r` donne l'écriture, puis la question
 *          l'exige sur un cas neuf.
 * Étape 3  le piège frontal : « sin x = k donne ±a + 2kπ ». La brique
 *          `regle-deux-familles-differentes` et son contrôle (la SOMME des
 *          deux solutions d'un tour) referment, puis `mem-…`.
 *
 * TOUT EST DÉRIVÉ : les deux familles, les sommes de contrôle, chaque
 * étiquette — le test vérifie que la somme vaut 2π pour le cosinus et π pour
 * le sinus, et que les deux ensembles de solutions sont DISJOINTS.
 *
 * MANIPULATION JAMAIS GELÉE : les deux laboratoires restent réglables.
 */

/** Les deux familles pour k = 1/2 — la comparaison du module. */
const K = 0.5;
const FAM_COS = familleSolutions(COS, K);
const FAM_SIN = familleSolutions(SIN, K);
/** Les deux solutions d'un tour, pour chaque fonction — DÉRIVÉES, jamais saisies. */
const TOUR_COS = solutionsDansFenetre(COS, K, 0, TAU - 1e-9);
const TOUR_SIN = solutionsDansFenetre(SIN, K, 0, TAU - 1e-9);

export default function Module03LeSinusEtSonAutreSymetrie() {
  const [kC, setKC] = useState(0);
  const [kS, setKS] = useState(0);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const surCible = Math.abs(kC - K) < 1e-12 && Math.abs(kS - K) < 1e-12;
  const done1 = q1;
  const done2 = q2;
  const done3 = q3;

  const steps = [
    {
      num: 1,
      title: 'La même hauteur, deux courbes',
      subtitle:
        'Amène les DEUX barres sur la même hauteur k = 1/2. Puis regarde les deux cercles : les deux points rouges ne sont pas placés pareil.',
      done: done1,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-indigo-800">
              Le cosinus — la barre coupe le cercle par une droite VERTICALE
            </div>
            <BarreLab fn={COS} k={kC} onChangeK={setKC} label="La barre sur la courbe du cosinus" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-emerald-800">
              Le sinus — la barre coupe le cercle par une droite HORIZONTALE
            </div>
            <BarreLab fn={SIN} k={kS} onChangeK={setKS} label="La barre sur la courbe du sinus" />
          </div>
          {surCible ? (
            <Feedback tone="info">
              Les deux barres sont à <strong>{ecritureK(K)}</strong>. Sur le cercle du cosinus,
              les deux points sont l’un <strong>au-dessus</strong> et l’autre{' '}
              <strong>en dessous</strong> de l’axe horizontal. Sur celui du sinus, ils sont
              l’un <strong>à droite</strong> et l’autre <strong>à gauche</strong> de l’axe
              vertical. Ce ne sont pas les mêmes réels : {labelPi(TOUR_COS[0])} et{' '}
              {labelPi(TOUR_COS[1])} d’un côté, {labelPi(TOUR_SIN[0])} et{' '}
              {labelPi(TOUR_SIN[1])} de l’autre.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Fais glisser les deux barres jusqu’à {ecritureK(K)}. Cosinus :
              k = {ecritureK(kC)} · sinus : k = {ecritureK(kS)}.
            </Feedback>
          )}
          <TapQuestion
            prompt="Sur le cercle, comment sont placés les deux points de chaque cas ?"
            options={[
              'Pour le cosinus : de part et d’autre de l’axe horizontal. Pour le sinus : de part et d’autre de l’axe vertical',
              'Dans les deux cas, de part et d’autre de l’axe horizontal',
              'Dans les deux cas, de part et d’autre de l’axe vertical',
              'Pour le cosinus : de part et d’autre de l’axe vertical. Pour le sinus : de part et d’autre de l’axe horizontal',
            ]}
            correct={0}
            cols={1}
            requires={['regle-deux-symetries', 'methode-resoudre-cos', 'methode-resoudre-sin']}
            explain="C’est ce que la Seconde t’a déjà appris, et la figure le confirme : imposer l’ABSCISSE (cosinus) laisse deux points symétriques par rapport à l’axe horizontal ; imposer l’ORDONNÉE (sinus) en laisse deux symétriques par rapport à l’axe vertical."
            explainWrong="Regarde le cercle de gauche : la barre du cosinus y est VERTICALE, et elle rencontre le cercle en deux points l’un au-dessus, l’autre en dessous. Celle du sinus est HORIZONTALE, et ses deux points sont l’un à droite, l’autre à gauche."
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'L’écriture change avec la symétrie',
      done: done2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4 text-sm text-slate-700 space-y-2">
            <p>
              Pour le cosinus, la deuxième solution est l’<strong>opposée</strong> de la
              première. Pour le sinus, elle est ce qu’il faut pour arriver à π :
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center space-y-2">
              <MathText>{`$$\\cos x = \\dfrac{1}{2} \\iff ${FAM_COS.tex}$$`}</MathText>
              <MathText>{`$$\\sin x = \\dfrac{1}{2} \\iff ${FAM_SIN.tex}$$`}</MathText>
            </div>
          </div>
          <KnowledgeBrick
            id="methode-sin-sur-r"
            variant="new"
            lead={<>La démarche est la même ; c’est la deuxième branche qui change.</>}
          />
          <TapQuestion
            prompt="On résout sin x = √3/2 sur ℝ. On sait que sin(π/3) = √3/2. Quelle est la bonne écriture ?"
            options={[
              'x = π/3 + 2kπ ou x = 2π/3 + 2kπ',
              'x = π/3 + 2kπ ou x = −π/3 + 2kπ',
              'x = π/3 + 2kπ seulement',
              'x = π/3 + kπ ou x = 2π/3 + kπ',
            ]}
            correct={0}
            cols={1}
            requires={['methode-sin-sur-r', 'solutions-sur-r', 'valeurs-remarquables']}
            explain="Pour le sinus, la deuxième branche vaut π − a. Ici a = π/3, donc π − π/3 = 2π/3. Et l’on ajoute « + 2kπ » aux DEUX branches. Écrire −π/3 serait appliquer la règle du COSINUS : sin(−π/3) vaut −√3/2, pas √3/2."
            explainWrong="Teste la réponse que tu as choisie. sin(−π/3) = −√3/2 : c’est l’opposé de ce qu’on cherche, donc « ±a » ne convient pas pour le sinus. Et un pas de kπ donnerait sin(π/3 + π) = −√3/2 : faux aussi. Il faut π − a, et + 2kπ."
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le contrôle qui ne trompe jamais',
      done: done3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="regle-deux-familles-differentes"
            variant="new"
            lead={<>Confondre les deux écritures est l’erreur la plus fréquente. Voici comment s’en garder.</>}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            Sur les deux figures que tu viens de régler, additionne les deux solutions d’un
            même tour :
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                cosinus : {labelPi(TOUR_COS[0])} + {labelPi(TOUR_COS[1])} = <strong>{labelPi(TOUR_COS[0] + TOUR_COS[1])}</strong>
              </li>
              <li>
                sinus : {labelPi(TOUR_SIN[0])} + {labelPi(TOUR_SIN[1])} = <strong>{labelPi(TOUR_SIN[0] + TOUR_SIN[1])}</strong>
              </li>
            </ul>
          </div>
          <KnowledgeBrick
            id="mem-cos-moins-a-sin-pi-moins-a"
            variant="new"
            lead={<>Deux lignes à garder en tête.</>}
          />
          <TapQuestion
            prompt="Un élève résout sin x = 0,4 et trouve une première solution a ≈ 0,41. Il annonce que la deuxième est −0,41. Comment lui montrer que c’est faux, sans calculatrice ?"
            options={[
              'En additionnant les deux : leur somme devrait valoir π pour le sinus, or elle vaut 0',
              'En additionnant les deux : leur somme devrait valoir 2π, or elle vaut 0',
              'Rien à dire : c’est juste',
              'En vérifiant que 0,41 est bien positif',
            ]}
            correct={0}
            cols={1}
            requires={['regle-deux-familles-differentes', 'mem-cos-moins-a-sin-pi-moins-a', 'methode-sin-sur-r']}
            explain="Pour le sinus, les deux solutions d’un tour sont a et π − a : leur somme vaut donc π, toujours. Ici 0,41 + (−0,41) = 0, ce qui est impossible. La somme 2π, elle, est le contrôle du COSINUS. Et sur le cercle, on le voit aussi : −0,41 est SOUS l’axe, donc son sinus est négatif."
            explainWrong="Le contrôle dépend de la fonction. Pour le sinus, a et π − a s’additionnent en π. Pour le cosinus, a et −a s’additionnent en 0 modulo un tour, c’est-à-dire que a et 2π − a s’additionnent en 2π. Ici l’élève a appliqué la règle du cosinus à une équation en sinus."
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
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le sinus et son autre symétrie"
      moduleSubtitle="Même barre, autre courbe, autre deuxième branche"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'π − a, et non −a',
        tone: 'indigo',
        body: (
          <p>
            Tout ce que tu viens d’apprendre sur cos x = k vaut aussi pour sin x = k — sauf UN
            détail, et il change tous les nombres. Deux laboratoires côte à côte vont te le
            montrer.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Et si on remplaçait le signe = ?</strong> Une barre qui coupe donne des
          points. Une barre qu’on regarde « au-dessus » ou « en dessous » donne tout autre
          chose. C’est le module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
