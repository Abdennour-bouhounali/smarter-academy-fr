import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConstruireLab from '../components/ConstruireLab';
import { TRIANGLE, placer } from '../components/transformations';

/**
 * Module 3 — MANIPULATION : construire la figure entière.
 *
 * La règle du module 2 vaut pour UN point. Ce module en fait une MÉTHODE :
 * l'élève place lui-même l'image de chaque sommet, l'un après l'autre, et la
 * figure image n'apparaît qu'une fois les trois posés. Rien n'est dessiné à sa
 * place — c'est la construction qui produit la figure.
 *
 * Expected observation : « une figure n'a pas d'image en bloc ; on construit
 * l'image de chaque sommet, puis on relie dans le même ordre ».
 * Misconception targeted : croire qu'on peut placer la figure image « à l'œil »
 * parce qu'on en connaît la forme, ou relier les images dans le désordre.
 */
const FIG = placer(TRIANGLE, { x: 175, y: 330 });

export default function Module03ConstruireUneFigure() {
  const [centre, setCentre] = useState({ x: 420, y: 250 });
  const [poses, setPoses] = useState({});
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const restants = FIG.map((_, i) => i).filter((i) => !poses[i]);
  const courant = restants.length ? restants[0] : null;
  const fini = courant === null;

  const poser = (i, p, react) => {
    setPoses((prev) => ({ ...prev, [i]: p }));
    react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Construis l’image, sommet par sommet',
      subtitle: 'Pour chaque sommet, applique la règle que tu as trouvée : de l’autre côté de O, à la même distance.',
      done: fini,
      content: (kit) => (
        <div className="space-y-3">
          <ConstruireLab
            figure={FIG}
            centre={centre}
            onCentre={setCentre}
            poses={poses}
            onPoser={(i, p) => poser(i, p, kit.react)}
            courant={courant}
            noms={['A', 'B', 'C']}
            ariaLabel="Construire l’image d’un triangle par symétrie centrale, sommet par sommet"
          />
          {fini ? (
            <Feedback tone="ok">
              La figure image s’est refermée toute seule dès le dernier sommet posé. C’est bien{' '}
              <strong>la même méthode répétée</strong> : aucune règle nouvelle n’a été nécessaire —
              seulement celle du module précédent, appliquée trois fois.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Le trait pointillé bleu est ta règle posée sur la feuille : il passe par le sommet et
              par <strong>O</strong>. Il ne te dit pas <em>où t’arrêter</em> — pour cela, souviens-toi
              que <strong>O doit être le milieu</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi relier dans le même ordre ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Les trois images A’, B’ et C’ sont bien placées, mais on les relie dans le désordre : A’ à C’, puis C’ à B’, puis B’ à A’. Qu’obtient-on ?"
            options={[
              'Le même triangle : trois points ne se relient que d’une seule façon',
              'Un triangle différent, donc faux',
              'Rien du tout, la figure ne se referme pas',
            ]}
            correct={0}
            cols={1}
            requires={['centre-milieu']}
            explain="Avec TROIS points, tous les ordres donnent le même triangle. C’est un cas particulier : dès quatre sommets, l’ordre change tout — relier A’C’B’D’ au lieu de A’B’C’D’ donne un quadrilatère croisé."
            explainWrong="Prends trois points au hasard et relie-les dans l’ordre que tu veux : tu obtiens toujours le même triangle. Le piège de l’ordre existe bel et bien, mais il n’apparaît qu’à partir de QUATRE sommets."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="construire-image"
              variant="new"
              lead={<>Tu viens de construire une figure entière sans calque, en répétant trois fois la même opération. Voici cette méthode, écrite une fois pour toutes.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Une image sans construire',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3.5 text-sm text-slate-700">
            Le segment <strong>[EF]</strong> mesure <strong>7 cm</strong>. On construit son image{' '}
            <strong>[E’F’]</strong> par une symétrie de centre O — un point qui n’est ni sur le
            segment, ni à égale distance des deux extrémités.
          </div>
          <TapQuestion
            prompt="Combien mesure [E’F’] ?"
            options={['7 cm', '14 cm', '3,5 cm', 'Cela dépend de la position de O']}
            correct={0}
            cols={4}
            requires={['construire-image', 'centre-milieu']}
            explain="Le demi-tour fait tourner le segment sans le déformer : son image mesure la même chose, 7 cm — et cela ne dépend pas du tout de l’endroit où se trouve O."
            explainWrong="Le centre O décide de l’ENDROIT où le segment arrive, jamais de sa longueur. Repense au calque : en tournant, il ne s’étire pas. L’image mesure donc 7 cm, où que soit la punaise."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Tu viens d’utiliser quelque chose qu’on n’a pas encore vérifié : que le demi-tour{' '}
              <strong>conserve les longueurs</strong>. Le module suivant va chercher à le mettre en
              défaut.
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
      moduleTitle="Construire la figure entière"
      moduleSubtitle="La règle d’un point devient une méthode"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Sans calque, cette fois',
        tone: 'sky',
        body: (
          <p>
            Tu sais placer l’image d’<strong>un</strong> point. Une figure n’est rien d’autre qu’une
            poignée de points reliés : il suffit donc de répéter. À toi de construire — le
            laboratoire ne dessinera rien à ta place.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
