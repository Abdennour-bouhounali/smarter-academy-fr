import React, { useState } from 'react';
import { AlertTriangle, BarChart3 } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AxeLab from '../components/AxeLab';
import { SONDAGE_TRUQUE, exagerationAxe, moyenne, mediane, fr } from '../components/stats4e';
import { parseDec } from '@smarter-academy/core';

/**
 * Module 7 — PRACTICE LAB : le diagramme qu'on met en cause.
 *
 * Ce module n'introduit qu'une seule idée neuve — l'axe tronqué — et fait
 * ensuite CHOISIR : trois petites situations où l'énoncé ne dit jamais quel
 * résumé employer. Les erreurs n'y comptent pas comme preuve (stage
 * `practice_lab`) : c'est l'endroit où l'on a le droit de se tromper.
 *
 * Activity              glisser le départ de l'axe d'un sondage 48/52 et lire
 *                       le facteur d'exagération.
 * Mathematical objective l'œil compare les hauteurs DESSINÉES ; quand l'axe ne
 *                       part pas de zéro, ce rapport n'est plus celui des
 *                       valeurs. C'est ce que la 5e ne pouvait pas faire :
 *                       elle savait lire un diagramme, pas le contester.
 * Student action        glisser le départ, de 0 à 47.
 * Controlled variable   le départ de l'axe. Les deux valeurs ne bougent JAMAIS.
 * Mathematical state    `depart` ; hauteurs et facteur viennent de
 *                       `exagerationAxe`.
 * Expected observation  « les deux nombres sont les mêmes et le dessin n'a
 *                       plus rien à voir ».
 * Misconception targeted lire un diagramme sans regarder l'axe.
 *
 * SÛRETÉ. Le curseur s'arrête à `basse − 1` : au-delà, `exagerationAxe` LÈVE,
 * parce qu'un axe qui coupe la barre basse ne représente plus rien. La borne
 * du composant et la garde du noyau disent la même chose, et un test le
 * vérifie sur tout le domaine.
 */
const DEPART_SPECTACULAIRE = 45;

/* Les trois petites situations de la fin — trois questions différentes sur
   trois séries différentes, et l'énoncé ne dit jamais quel résumé employer. */
const SALAIRES = { nom: 'Petite entreprise', valeurs: [1500, 1550, 1600, 1650, 1700, 9000] };

export default function Module07LeGraphiqueQuiMent() {
  const [depart, setDepart] = useState(0);
  const [pred, setPred] = useState(null);
  const [vus, setVus] = useState([0]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const poser = (d) => {
    setDepart(d);
    setVus((v) => (v.includes(d) ? v : [...v, d]));
  };

  const honnete = exagerationAxe({ basse: SONDAGE_TRUQUE.basse, haute: SONDAGE_TRUQUE.haute, depart: 0 });
  const truque = exagerationAxe({ basse: SONDAGE_TRUQUE.basse, haute: SONDAGE_TRUQUE.haute, depart: DEPART_SPECTACULAIRE });

  const done1 = vus.some((d) => d >= 44) && vus.includes(0);

  const steps = [
    {
      num: 1,
      title: 'Fais glisser le départ de l’axe',
      subtitle: 'Un sondage : 48 % contre 52 %. Les deux nombres ne bougeront jamais.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Deux propositions ont été soumises au vote : {SONDAGE_TRUQUE.basse} % pour l’une,{' '}
            {SONDAGE_TRUQUE.haute} % pour l’autre. Le graphique ci-dessous est correct… tant que
            l’axe part de zéro. <strong>Fais-le monter.</strong>
          </p>
          <PredictionChips
            prompt="Avant de glisser : si l’axe démarre à 45 au lieu de 0, à quoi ressemblera le dessin ?"
            options={[
              { id: 'pareil', label: 'Presque pareil' },
              { id: 'peu', label: 'Un peu différent' },
              { id: 'beaucoup', label: 'Complètement différent' },
            ]}
            value={pred}
            onChange={setPred}
          />
          <AxeLab sondage={SONDAGE_TRUQUE} depart={depart} onDepart={poser} />
          {done1 && (
            <Feedback tone="ok">
              Les deux nombres sous les barres n’ont pas changé d’un dixième. Seul le point de
              départ de l’axe a bougé — et le dessin n’a plus rien à voir.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Mets le départ à 45 et lis le troisième cadre',
      done: q2,
      content: (
        <div className="space-y-3">
          <AxeLab sondage={SONDAGE_TRUQUE} depart={depart} onDepart={poser} />
          <NumericQuestion
            prompt={`Avec un départ à ${DEPART_SPECTACULAIRE}, l’écart paraît grossi de combien de fois ? Donne un résultat au centième.`}
            expected={Math.round(truque.facteur * 100) / 100}
            parse={parseDec}
            requires={['indicateur-stat', 'diagramme-barres']}
            explain={`Le rapport réel vaut ${fr(honnete.rapportReel)}, mais le rapport des hauteurs dessinées vaut ${fr(truque.rapportVu)} : l’écart paraît ${fr(truque.facteur)} fois plus grand. Règle le curseur sur ${DEPART_SPECTACULAIRE} et lis le troisième cadre.`}
            explainFor={(n) => {
              if (n === 1) return 'Le facteur ne vaut 1 que si l’axe part de ZÉRO. Là, il démarre à 45 : remets le curseur à 45 et lis le troisième cadre.';
              if (n === Math.round(truque.rapportVu * 100) / 100) return `${fr(truque.rapportVu)} est le rapport des hauteurs VUES. Le facteur d’exagération est ce rapport divisé par le rapport réel (${fr(honnete.rapportReel)}).`;
              return null;
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="axe-tronque"
              variant="new"
              lead="Le trucage que tu viens de mesurer porte un nom, et il a un réflexe qui le désamorce."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le réflexe, sur un autre graphique',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un journal titre « explosion du chômage ». Sur son graphique, la barre de cette année est deux fois plus haute que celle de l’an dernier. Que faut-il vérifier EN PREMIER ?"
            options={[
              'Où démarre l’axe vertical',
              'La couleur des barres',
              'Le nombre de barres',
              'Le nom donné à chaque barre',
            ]}
            correct={0}
            cols={1}
            requires={['axe-tronque', 'diagramme-barres']}
            explain="Une barre deux fois plus haute ne veut dire « deux fois plus » que si l’axe part de zéro. C’est la première chose à regarder, avant même de lire les valeurs."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Et sur des nombres, quel résumé choisir ?',
      subtitle: 'Six salaires mensuels dans une petite entreprise. Personne ne te dira quoi calculer.',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">{SALAIRES.nom} — salaires mensuels, en euros</p>
            <p className="mt-1 whitespace-nowrap font-mono text-sm tabular-nums text-slate-800">
              {SALAIRES.valeurs.join(' · ')}
            </p>
            <p className="mt-1.5 text-xs tabular-nums text-slate-500">
              moyenne {fr(SALAIRES.valeurs.reduce((a, b) => a + b, 0) / SALAIRES.valeurs.length, 0)} € ·
              médiane {fr((SALAIRES.valeurs[2] + SALAIRES.valeurs[3]) / 2, 0)} € ·
              étendue {fr(SALAIRES.valeurs[5] - SALAIRES.valeurs[0], 0)} €
            </p>
          </div>
          <TapQuestion
            prompt="La direction affiche « salaire moyen : 2 833 € ». Un employé conteste. Qui a raison, et pourquoi ?"
            options={[
              'L’employé : un seul très haut salaire tire la moyenne, la médiane décrit mieux le groupe',
              'La direction : la moyenne est le calcul officiel',
              'Personne : les deux nombres disent la même chose',
              'L’employé : la moyenne a été mal calculée',
            ]}
            correct={0}
            cols={1}
            requires={['choisir-indicateur', 'mediane-partage']}
            explain="La moyenne est juste — c’est bien 2 833 € — mais elle ne décrit personne : cinq employés sur six gagnent moins de 1 700 €. La médiane, à 1 625 €, dit ce que gagne la moitié de l’entreprise. C’est la question posée (« que gagne-t-on ici ? ») qui désigne la médiane."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              Un dessin peut mentir par son axe, et un nombre juste peut tromper par le choix qu’on
              en fait. Dans les deux cas, le remède est le même : demander de quoi on parle
              exactement.
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
      moduleTitle="Le graphique qui ment"
      moduleSubtitle="Les mêmes nombres, deux dessins opposés"
      estimatedTime="8 min"
      brief={{
        tag: '🎬 Mission 07',
        title: 'Un sondage à 48 contre 52',
        tone: 'slate',
        body: (
          <>
            Quatre points d’écart, presque rien. Et pourtant, sur certains graphiques, l’une des
            deux barres paraît écraser l’autre.{' '}
            <strong>Sans qu’aucun chiffre n’ait été truqué.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="text-sm text-amber-900">
            Un seul curseur, et il ne touche à aucune donnée.{' '}
            <BarChart3 className="inline h-4 w-4" aria-hidden="true" /> Il déplace seulement
            l’endroit où l’axe commence — et cela suffit.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={7} />}
    />
  );
}
