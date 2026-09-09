import React, { useState } from 'react';
import { Fence, Droplets } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GrapheLab from '../components/GrapheLab';
import { SITUATIONS, remonter, frRat } from '../components/fonctions4e';

/**
 * Module 6 — PRACTICE LAB : modéliser de bout en bout, sur deux situations
 * où la sortie DIMINUE.
 *
 * Ce module n'enseigne presque rien de neuf : il fait FAIRE le parcours
 * complet — nommer les grandeurs, dire laquelle commande, écrire la formule,
 * la dessiner, et se demander jusqu'où l'entrée a le droit d'aller. Les
 * erreurs n'y comptent pas comme preuve (stage `practice_lab`) : c'est
 * l'endroit où l'on a le droit de se tromper.
 *
 * POURQUOI CES DEUX SITUATIONS-LÀ. L'enclos et la citerne descendent toutes
 * les deux, et c'est le point : la 5e laissait intacte l'idée que « dépendre »
 * signifie « augmenter ensemble ». Elles diffèrent par ce qui manque à
 * l'autre : l'enclos n'a pas de part fixe visible dans son histoire (10 est le
 * demi-périmètre), la citerne en a une énorme (300 L au départ), et sa
 * question naturelle — « quand est-elle vide ? » — se répond en REMONTANT le
 * programme, ce qui referme la leçon sur le geste du module 1.
 *
 * DOMAINE. Chaque situation porte le sien, et il est une contrainte du RÉEL,
 * pas une commodité : au-delà de 12 minutes, la citerne donnerait un volume
 * négatif, et la figure mentirait à l'élève (§28bis). `parcours.test.js`
 * balaie les deux domaines en entier.
 */

const ENCLOS = SITUATIONS.perimetreFixe;
const CITERNE = SITUATIONS.citerne;

const sansEspaces = (tex) => tex.replace(/\\,\s*/g, '');

/** La longueur d'enclos qui donne une largeur de 3 m — remontée du programme. */
const LONGUEUR_POUR_3 = Number(frRat(remonter(ENCLOS.prog, 3)));
/** La durée au bout de laquelle la citerne est vide — remontée depuis 0. */
const CITERNE_VIDE = Number(frRat(remonter(CITERNE.prog, 0)));
/** Ce qu'il reste après 4 minutes. */
const RESTE_4 = CITERNE.valeurNum(4);

export default function Module06LEnclosEtLaCiterne() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [posesEnclos, setPosesEnclos] = useState(0);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const [posesCiterne, setPosesCiterne] = useState(0);

  const done3 = posesEnclos >= ENCLOS.entrees.length;
  const done6 = posesCiterne >= CITERNE.entrees.length;

  const boutonPoser = (poses, setPoses, total, kit) =>
    poses < total ? (
      <button
        type="button"
        onClick={() => { setPoses(poses + 1); kit?.react?.(true); }}
        className="min-h-[44px] w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
      >
        Poser le point suivant
      </button>
    ) : (
      <div className="flex flex-wrap gap-2">
        <p className="flex-1 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          Les {total} points sont posés.
        </p>
        <button
          type="button"
          onClick={() => setPoses(0)}
          className="min-h-[44px] rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-slate-300"
        >
          Recommencer
        </button>
      </div>
    );

  const steps = [
    {
      num: 1,
      title: ENCLOS.nom,
      subtitle: '20 m de grillage, et un enclos rectangulaire à fermer.',
      done: q1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Avec 20 m de grillage, on fait le tour d’un rectangle. Si la longueur augmente, que
            devient la largeur ?
          </p>
          <TapQuestion
            prompt="Quelle grandeur COMMANDE l’autre, et dans quel sens ?"
            options={[
              'La longueur commande : quand elle augmente, la largeur diminue',
              'La longueur commande : quand elle augmente, la largeur augmente aussi',
              'Les deux augmentent ensemble, car le grillage est fixe',
              'Il n’y a pas de dépendance : les deux sont libres',
            ]}
            correct={0}
            cols={1}
            requires={['dependance', 'en-fonction-de']}
            explain="20 m de grillage font le tour : longueur + largeur + longueur + largeur. Donc une longueur et une largeur font 10 m à elles deux. Ce que l’une prend, l’autre le perd — et c’est bien une dépendance : la largeur est entièrement déterminée par la longueur."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Écris sa formule',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Quelle écriture donne la largeur, à partir de la longueur ?"
            options={[
              sansEspaces(ENCLOS.formuleTex()),
              '20 − x',
              '10x',
              '20x',
            ]}
            correct={0}
            cols={4}
            requires={['formule-qui-resume', 'dependance']}
            explain="La longueur et la largeur font 10 m ensemble (la moitié des 20 m de grillage). La largeur est donc ce qui reste de 10 quand on a enlevé la longueur. Contrôle : pour une longueur de 4 m, la largeur vaut 6 m, et le tour fait bien 4 + 6 + 4 + 6 = 20 m."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="dependance-qui-diminue"
              variant="new"
              lead="Une dépendance peut très bien descendre : c’est ce que cette situation montre."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Dessine-la',
      subtitle: 'La formule devient un dessin — et la ligne descend.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Pose les points de{' '}
            <MathText>{`$${sansEspaces(ENCLOS.formuleTex())}$`}</MathText>, pour les longueurs
            possibles.
          </p>
          <GrapheLab
            prog={ENCLOS.prog}
            entrees={ENCLOS.entrees}
            poses={posesEnclos}
            couleur="#e11d48"
            entreeNom={ENCLOS.entreeNom}
            sortieNom={ENCLOS.sortieNom}
            uniteEntree={ENCLOS.uniteEntree}
            uniteSortie={ENCLOS.uniteSortie}
          />
          {boutonPoser(posesEnclos, setPosesEnclos, ENCLOS.entrees.length, kit)}
          {done3 && (
            <Feedback tone="ok">
              La ligne descend, et pourtant chaque longueur donne une largeur et une seule. On
              s’arrête à {Math.max(...ENCLOS.entrees)} m : au-delà, la largeur deviendrait nulle ou
              négative, et l’enclos n’existerait plus.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Remonte-la',
      subtitle: 'On veut une largeur précise. Quelle longueur faut-il choisir ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Pour obtenir une largeur de 3 m, quelle longueur faut-il ? (en mètres)"
            expected={LONGUEUR_POUR_3}
            suffix="m"
            requires={['remonter-la-chaine', 'dependance-qui-diminue']}
            explain={`On remonte la chaîne depuis 3 : la longueur et la largeur font 10 m à elles deux, donc la longueur vaut ${LONGUEUR_POUR_3} m. Contrôle : ${LONGUEUR_POUR_3} + 3 + ${LONGUEUR_POUR_3} + 3 = 20 m de grillage.`}
            explainFor={(n) => {
              if (n === 17) return 'Tu as remonté depuis 20 au lieu de 10. Le grillage fait deux longueurs ET deux largeurs : c’est la MOITIÉ, 10 m, qui se partage.';
              if (n === 13) return 'Tu as ajouté au lieu de retrancher. La largeur est ce qui RESTE de 10 quand la longueur a pris sa part.';
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
    {
      num: 5,
      title: CITERNE.nom,
      subtitle: `${CITERNE.valeurNum(0)} litres au départ, et l’arrosage qui commence.`,
      done: q5,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            La citerne contient {CITERNE.valeurNum(0)} L. L’arrosage en consomme 25 L par minute.
            Elle se résume par <MathText>{`$${sansEspaces(CITERNE.formuleTex())}$`}</MathText>.
          </p>
          <NumericQuestion
            prompt={`Combien reste-t-il d’eau après 4 minutes ? (en litres)`}
            expected={RESTE_4}
            suffix="L"
            requires={['formule-qui-resume', 'dependance-qui-diminue']}
            explain={`On remplace la lettre par 4 : 25 × 4 = 100 L consommés, et il reste ${CITERNE.valeurNum(0)} − 100 = ${RESTE_4} L.`}
            explainFor={(n) => {
              if (n === 100) return 'Tu as calculé l’eau CONSOMMÉE, pas celle qui reste. La question porte sur ce qu’il y a encore dans la citerne.';
              if (n === 1200) return 'Tu as multiplié les 300 L par 4. C’est la consommation qui est proportionnelle à la durée, pas le contenu de la citerne.';
              return null;
            }}
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
        </div>
      ),
    },
    {
      num: 6,
      title: 'Quand la citerne est-elle vide ?',
      subtitle: 'La question qui se répond en remontant le programme.',
      done: done6,
      content: (kit) => (
        <div className="space-y-3">
          <GrapheLab
            prog={CITERNE.prog}
            entrees={CITERNE.entrees}
            poses={posesCiterne}
            couleur="#0284c7"
            entreeNom={CITERNE.entreeNom}
            sortieNom={CITERNE.sortieNom}
            uniteEntree={CITERNE.uniteEntree}
            uniteSortie={CITERNE.uniteSortie}
          />
          {boutonPoser(posesCiterne, setPosesCiterne, CITERNE.entrees.length, kit)}
          {done6 && (
            <>
              <Feedback tone="ok">
                Le dernier point touche l’axe horizontal : à {CITERNE_VIDE} minutes, il ne reste
                rien. On l’aurait trouvé sans dessin, en <strong>remontant</strong> le programme
                depuis 0 — exactement le geste du module 1.
              </Feedback>
              <KnowledgeBrick
                id="modeliser-une-situation"
                variant="new"
                lead="Tu viens de faire, deux fois, le parcours complet. Voici son plan."
              />
            </>
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
      moduleTitle="L’enclos et la citerne"
      moduleSubtitle="Deux situations réelles, de l’énoncé jusqu’au dessin"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'Deux histoires qui descendent',
        tone: 'slate',
        body: (
          <>
            Un enclos de grillage, une citerne qui se vide. Dans les deux cas, la sortie{' '}
            <strong>diminue</strong> quand l’entrée augmente — et ce sont pourtant de vraies
            dépendances. <strong>Les erreurs ne comptent pas ici.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <Fence className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            <Droplets className="inline h-4 w-4" aria-hidden="true" /> Pour chaque situation :
            qui commande, quelle formule, quel dessin — et jusqu’où l’entrée a-t-elle le droit
            d’aller ?
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
