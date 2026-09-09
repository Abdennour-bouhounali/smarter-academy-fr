import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TraceLab from '../components/TraceLab';
import { avancer, tourner, executer, estFermee } from '../components/trace';

/**
 * Module 1 — LABORATOIRE D'OUVERTURE (INTERACTION_PEDAGOGY §6bis).
 *
 * L'étape 1 REND la manipulation dès le premier écran : l'élève voit le
 * programme et la feuille blanche, et le bouton « Exécuter » est la première
 * chose qui se touche. La prédiction vit DANS le labo, sans verdict (§6ter.3,
 * règle « M1 lab first, no prediction gate ») : c'est l'exécution qui répond.
 *
 * ARC : situation réelle (un stylo qui obéit) → curiosité (« que va-t-il
 * dessiner ? ») → prédiction sans verdict → manipulation (exécuter, puis
 * CHANGER un nombre) → observation (le dessin change) → découverte
 * (l'instruction porte un nombre ; le programme décrit des gestes) → question
 * mathématique (et si le nombre n'était pas écrit dans le programme ? — M2).
 *
 * Expected observation : « ce n'est pas moi qui dessine, c'est le programme —
 * et si je change un seul nombre, tout le dessin change. »
 * Misconception targeted : croire qu'un programme décrit une IMAGE (« fais un
 * carré ») plutôt que la suite de GESTES qui la produit.
 *
 * CE QUE CE MODULE NE FAIT PAS, et laisse aux suivants : la variable et
 * l'entrée (M2), la formule (M3), la boucle (M4), le lien 360 ÷ n (M5), le
 * débogage (M6). Ici le nombre est écrit EN DUR dans l'instruction — c'est
 * précisément le manque que le module 2 viendra combler.
 */

/* Le programme d'ouverture : trois côtés d'un carré, volontairement INACHEVÉ.
   Un carré complet ne laisserait rien à découvrir ; ces trois côtés créent la
   question « combien en manque-t-il ? » que l'étape 3 pose. */
const OUVERTURE = [
  avancer(70), tourner(90),
  avancer(70), tourner(90),
  avancer(70),
];

/* L'expérience de l'étape 2 : le MÊME programme, un seul nombre changé. */
const programmeAngle = (angle) => [
  avancer(70), tourner(angle),
  avancer(70), tourner(angle),
  avancer(70),
];

export default function Module01LeStyloQuiObeit() {
  const [prediction, setPrediction] = useState(null);
  const [execute, setExecute] = useState(false);
  const [angle, setAngle] = useState(90);
  const [angleChange, setAngleChange] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const majAngle = (_, v) => {
    setAngle(v);
    if (v !== 90) setAngleChange(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Cinq instructions, une feuille blanche',
      subtitle: 'Lis le programme, devine ce qu’il va tracer, puis lance-le.',
      done: execute,
      content: (kit) => (
        <div className="space-y-3">
          <TraceLab
            programme={OUVERTURE}
            hauteur={250}
            titreProgramme="Le programme de KIWI"
            onFin={() => { if (!execute) { setExecute(true); kit.react(true); } }}
            bilan={(r) => (
              <Feedback tone="ok">
                Trois traits de 70, deux virages d’un quart de tour. KIWI n’a pas « dessiné un
                carré » : il a fait <strong>{r.etapes.length} gestes</strong>, dans l’ordre — et
                c’est cette suite de gestes qui a laissé cette forme sur la feuille.
              </Feedback>
            )}
          />
          <PredictionChips
            prompt="quelle forme vas-tu voir apparaître ?"
            options={[
              { id: 'carre', label: 'Un carré complet' },
              { id: 'trois', label: 'Trois côtés sur quatre' },
              { id: 'triangle', label: 'Un triangle' },
              { id: 'ligne', label: 'Une ligne droite' },
            ]}
            value={prediction}
            onChange={setPrediction}
          />
          {execute && (
            <Feedback tone="info">
              {prediction === 'trois'
                ? 'Ta prédiction était juste : trois côtés, et le quatrième manque.'
                : prediction
                  ? 'Ta prédiction disait autre chose — et c’est l’exécution qui a tranché, pas une correction. Trois côtés ont été tracés : il en manque un pour fermer.'
                  : 'Trois côtés ont été tracés : il en manque un pour fermer la figure.'}{' '}
              Relance-le autant de fois que tu veux : le même programme redonne <strong>toujours</strong>{' '}
              le même dessin.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Change un seul nombre',
      subtitle: 'Le programme garde ses cinq instructions. Seul l’angle du virage bouge.',
      done: angleChange,
      content: (
        <div className="space-y-3">
          <TraceLab
            programme={programmeAngle(angle)}
            env={{ angle }}
            entrees={[{ nom: 'angle', label: 'angle du virage', min: 30, max: 150, pas: 5, unite: '°' }]}
            onEnv={majAngle}
            autoExecuter
            hauteur={250}
            titreProgramme="Le même programme, un nombre changé"
            bilan={() => null}
          />
          {angleChange ? (
            <>
              <Feedback tone="ok">
                Les instructions n’ont pas bougé : <strong className="font-mono">AVANCER</strong> et{' '}
                <strong className="font-mono">TOURNER</strong>, toujours dans le même ordre. Seul le
                nombre porté par TOURNER a changé — et la figure entière a changé avec lui.
              </Feedback>
              <KnowledgeBrick
                id="instruction-parametree"
                variant="new"
                lead={<>Tu viens de le voir : ce nombre n’est pas une décoration de l’instruction, c’en est le cœur.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Fais glisser le curseur <strong className="font-mono">angle</strong>. Observe : le
              nombre d’instructions ne change jamais, mais le dessin, si.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Lire un programme avant de l’exécuter',
      subtitle: 'Maintenant que tu sais comment KIWI obéit, tu peux prévoir.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3.5">
            <p className="text-sm text-slate-700 mb-2">
              KIWI part vers la droite et exécute ce programme :
            </p>
            <p className="font-mono text-sm font-bold text-indigo-900 leading-relaxed">
              AVANCER de 50 · TOURNER de 90° · AVANCER de 50 · TOURNER de 90° · AVANCER de 50 ·
              TOURNER de 90° · AVANCER de 50
            </p>
          </div>
          {/* La méthode est POSÉE AVANT qu'on demande de l'appliquer : l'étape 1
              l'a fait vivre (prédire, puis exécuter), la brique la nomme, et la
              question qui suit ne demande rien qui n'ait été établi
              (KNOWLEDGE_DEPENDENCY.md — une brique placée après la question
              n'établit rien pour elle). */}
          <KnowledgeBrick
            id="prevoir-executer"
            variant="new"
            lead={<>À l’étape 1, tu as annoncé la figure avant de lancer le programme. Ce geste-là porte un nom, et c’est le métier même du programmeur.</>}
          >
            <TapQuestion
              prompt="À toi : sans l’exécuter, quelle figure ce programme donne-t-il ?"
              options={[
                'Un carré fermé de côté 50',
                'Trois côtés d’un carré, le quatrième manquant',
                'Une ligne droite de 200',
                'Un triangle de côté 50',
              ]}
              correct={0}
              cols={1}
              requires={['instruction-parametree', 'prevoir-executer']}
              explain="Quatre AVANCER et trois virages : le dernier trait ramène le stylo à son point de départ, et la figure se referme. C’est bien un carré de côté 50."
              explainWrong="Compte les AVANCER : il y en a quatre, et non trois. Un carré a besoin de quatre côtés et de trois virages seulement — le quatrième virage serait inutile, puisque la figure est déjà fermée."
              solved={q3}
              onAnswered={() => setQ3(true)}
            />
          </KnowledgeBrick>
        </div>
      ),
    },
    {
      num: 4,
      title: 'Et si on voulait un carré plus grand ?',
      subtitle: 'La question qui ouvre le module suivant.',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            Le programme du carré de 50 fonctionne. On voudrait maintenant le même carré, mais de
            côté <strong>80</strong>. Puis de côté <strong>120</strong>. Puis de côté{' '}
            <strong>35</strong>.
          </div>
          <TapQuestion
            prompt="Avec ce que tu sais faire pour l’instant, que faut-il faire pour obtenir le carré de 80 ?"
            options={[
              'Réécrire les quatre AVANCER en remplaçant 50 par 80',
              'Changer un seul nombre, quelque part, et tout suivra',
              'Ajouter des instructions à la fin du programme',
              'Rien : le programme s’adapte tout seul',
            ]}
            correct={0}
            cols={1}
            requires={['instruction-parametree']}
            explain="Pour l’instant, oui : le 50 est écrit quatre fois dans le programme, et il faut le corriger quatre fois. Une seule oubliée, et la figure ne se ferme plus."
            explainWrong="Pas encore. Le nombre 50 est écrit EN DUR dans chacune des quatre instructions AVANCER : il n’existe aujourd’hui aucun endroit unique où le changer. C’est exactement le problème que le prochain module va résoudre."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Quatre corrections pour un carré. Et pour un dessin de trente traits ? Il manque
              quelque chose à ce programme : <strong>un endroit unique où poser la taille</strong>,
              que toutes les instructions iraient consulter. C’est ce que tu vas construire au
              module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le stylo qui obéit"
      moduleSubtitle="Un programme ne décrit pas un dessin : il décrit des gestes"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'KIWI ne sait pas ce qu’est un carré',
        tone: 'indigo',
        body: (
          <p>
            KIWI est un stylo. Il ne comprend que deux ordres : <strong>avancer</strong> d’un
            nombre de pas, et <strong>tourner</strong> d’un nombre de degrés. Il ne sait rien des
            carrés ni des triangles. Pourtant, avec ces deux ordres seulement, on va lui faire
            tracer des figures que tu reconnaîtras.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
