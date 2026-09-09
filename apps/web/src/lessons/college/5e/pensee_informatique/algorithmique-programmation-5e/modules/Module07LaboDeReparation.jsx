import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TraceLab from '../components/TraceLab';
import { avancer, tourner, lit, makeRepeat } from '../components/trace';

/**
 * Module 7 — LABORATOIRE D'ENTRAÎNEMENT (stage `practice_lab`).
 *
 * Le module 6 a établi la méthode (repérer le premier écart, corriger,
 * relancer). Ici on l'ENTRAÎNE sur deux bugs d'une autre nature que celui du
 * pentagone — et les erreurs ne comptent jamais comme preuve de maîtrise
 * (packages/core/curriculum/lessonStages.js) : c'est un labo, pas un test.
 *
 * Les deux bugs sont choisis pour couvrir les deux familles rencontrables :
 *   1. une VALEUR ÉCRITE EN DUR au milieu d'instructions qui lisent une
 *      variable — le côté ne suit plus quand l'entrée change (le bug le plus
 *      fréquent quand on transforme un ancien programme, module 2) ;
 *   2. un ANGLE qui ne vérifie pas n × angle = 360 — le contrôle du module 5,
 *      appliqué ici sans qu'on redonne la règle.
 *
 * ACTION → CHANGE → OBSERVATION → SENS :
 *   ACTION       régler l'entrée du carré boiteux, puis l'angle de l'étoile ;
 *   CHANGE       une seule des quatre longueurs refuse de suivre ;
 *   OBSERVATION  la figure ne se referme pas, et on voit LAQUELLE cloche ;
 *   SENS         un bug se situe, il ne se devine pas.
 */

/* Bug n°1 : un carré dont UNE instruction sur quatre porte 30 en dur. La boucle
   ne peut rien ici — l'erreur est dans une instruction isolée. */
const CARRE_BOITEUX = [
  avancer(lit('cote')), tourner(90),
  avancer(lit('cote')), tourner(90),
  avancer(30), tourner(90),          // ← l'intruse : 30 au lieu de cote
  avancer(lit('cote')),
];

/* Bug n°2 : huit tours, mais un angle qui ne partage pas 360. */
const ETOILE_RATEE = (angle) => [makeRepeat(8, [avancer(45), tourner(angle)])];

export default function Module07LaboDeReparation() {
  const [cote, setCote] = useState(70);
  const [essais, setEssais] = useState(() => new Set());
  const vuIntruse = essais.size >= 2;
  const [q2, setQ2] = useState(false);
  const [angle, setAngle] = useState(50);
  const repare = angle === 45;
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le carré boiteux',
      subtitle: 'Change l’entrée, et regarde les quatre côtés. L’un d’eux ne suit pas.',
      done: vuIntruse,
      content: (kit) => (
        <div className="space-y-3">
          <TraceLab
            programme={CARRE_BOITEUX}
            env={{ cote }}
            entrees={[{ nom: 'cote', label: 'côté du carré', min: 40, max: 100, pas: 5 }]}
            onEnv={(_, v) => {
              setCote(v);
              setEssais((s) => new Set(s).add(v));
              if (essais.size === 1) kit.react(true);
            }}
            autoExecuter
            montrerLongueurs
            hauteur={240}
            titreProgramme="Le programme du « carré »"
            bilan={() => null}
          />
          {vuIntruse ? (
            <Feedback tone="ok">
              Trois côtés suivent l’entrée ; le troisième reste bloqué sur <strong>30</strong>,
              quoi que tu fasses. C’est une valeur écrite <em>en dur</em> au milieu d’instructions
              qui lisent la variable — et elle ne suivra jamais.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Fais glisser <strong className="font-mono">cote</strong> sur au moins deux valeurs, en
              regardant les longueurs inscrites sur les côtés.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Nommer l’instruction fautive',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Quelle instruction empêche ce programme de tracer un vrai carré ?"
            options={[
              'Le troisième AVANCER, qui porte 30 au lieu de cote',
              'Le premier TOURNER, dont l’angle est faux',
              'Le dernier AVANCER, qui devrait porter 30',
              'Aucune : c’est la valeur de cote qui est mal choisie',
            ]}
            correct={0}
            cols={1}
            requires={['deboguer', 'variable-informatique']}
            explain="Trois côtés lisent cote, le troisième porte le nombre 30 écrit en dur : c’est le seul qui ne suit pas. Un côté trop court, et la figure ne se referme pas."
            explainWrong="Les angles sont tous à 90°, et ils sont justes : les virages du tracé sont bien des angles droits. Ce sont les LONGUEURS qui trahissent — tu viens de voir que l’une d’elles ne bouge pas quand tu changes l’entrée."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="info">
              Aucune valeur de <span className="font-mono">cote</span> ne peut réparer ce programme :
              le défaut est dans le programme, pas dans son entrée.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'L’étoile qui devait être un octogone',
      subtitle: 'Huit tours de boucle, et pourtant ce n’est pas un octogone. Répare l’angle.',
      done: repare,
      content: (kit) => (
        <div className="space-y-3">
          <TraceLab
            programme={ETOILE_RATEE(angle)}
            env={{ angle }}
            entrees={[{ nom: 'angle', label: 'angle du virage', min: 30, max: 90, pas: 1, unite: '°' }]}
            onEnv={(_, v) => { const avant = angle === 45; setAngle(v); if (!avant && v === 45) kit.react(true); }}
            autoExecuter
            hauteur={250}
            titreProgramme="RÉPÉTER 8 fois"
            bilan={() => (
              <div
                className={`rounded-xl border-2 px-3 py-2.5 text-sm ${
                  repare ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-amber-300 bg-amber-50 text-amber-900'
                }`}
              >
                8 × {angle} = <strong>{8 * angle}</strong>
                {repare
                  ? ' — un tour complet exactement : l’octogone est là.'
                  : ` — il faut 360, pas ${8 * angle}.`}
              </div>
            )}
          />
          {repare && (
            <Feedback tone="ok">
              <strong>45°</strong>, parce que 360 ÷ 8 = 45. Tu n’as pas eu besoin d’essayer toutes
              les valeurs : le contrôle donne la réponse avant l’exécution.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Réparer sans exécuter',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3.5">
            <p className="font-mono text-sm font-bold text-rose-900">
              RÉPÉTER 12 fois [ AVANCER de 25 · TOURNER de 36° ]
            </p>
          </div>
          <TapQuestion
            prompt="Ce programme devait tracer un polygone régulier à 12 côtés. Que faut-il corriger ?"
            options={[
              'L’angle : il doit valoir 360 ÷ 12 = 30°, et non 36°',
              'Le nombre de tours : il doit valoir 10, pour que 10 × 36 = 360',
              'La longueur 25, trop courte pour 12 côtés',
              'Rien : 12 tours suffisent à faire un polygone à 12 côtés',
            ]}
            correct={0}
            cols={1}
            requires={['deboguer', 'mem-360-sur-n', 'angle-exterieur']}
            explain="La figure demandée a 12 côtés : le nombre de tours est donc juste, et c’est l’angle qui doit s’y accorder — 360 ÷ 12 = 30°. (Avec 36°, on obtiendrait bien une figure fermée, mais à 10 côtés : ce n’est pas celle qu’on voulait.)"
            explainWrong="Attention : passer à 10 tours refermerait bien la figure, mais donnerait un décagone — pas le polygone à 12 côtés demandé. C’est l’énoncé qui fixe n ; l’angle s’en déduit."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Deux programmes réparés, deux causes différentes : une valeur en dur, puis un angle qui
              ne partageait pas 360. Tu as tout ce qu’il faut pour la mission finale.
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
      moduleTitle="Le labo de réparation"
      moduleSubtitle="Deux programmes cassés, deux causes différentes"
      estimatedTime="9 min"
      brief={{
        tag: 'Entraînement',
        title: 'À toi de réparer',
        tone: 'amber',
        body: (
          <p>
            Tu connais la méthode : situer le premier écart, corriger, relancer. Voici deux
            programmes cassés — et ils ne le sont pas pour la même raison.{' '}
            <strong>Ici, se tromper ne compte pas</strong> : c’est un laboratoire.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={7} />}
    />
  );
}
