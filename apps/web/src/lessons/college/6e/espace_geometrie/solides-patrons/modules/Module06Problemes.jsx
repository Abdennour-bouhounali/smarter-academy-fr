import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidView from '../components/SolidView';
import { SOLIDES } from '../components/solidesUtils';

/**
 * Module 6 — PRACTICE LAB : la 3D dans la vraie vie (P10).
 *
 * Objectif : se servir des comptes. Peindre une boîte, coller du ruban sur
 * les arêtes, emballer : chaque problème mobilise un compte précis, et
 * choisir LEQUEL fait partie du travail.
 *
 * Aha : « peindre » parle des faces, « ruban adhésif » des arêtes, « embouts
 * de protection » des sommets. Le vocabulaire dirige le calcul.
 *
 * Misconception visée : appliquer le mauvais compte — répondre 12 (arêtes)
 * quand la question porte sur les faces.
 */
const CUBE = SOLIDES.cube;

export default function Module06Problemes() {
  const [peintureDone, setPeintureDone] = useState(false);
  const [rubanDone, setRubanDone] = useState(false);
  const [choixDone, setChoixDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Problèmes de solides"
      moduleSubtitle="Emballer, peindre, protéger : la 3D dans la vraie vie."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Le bon compte, pour la bonne question.',
        body: (
          <p>
            Faces, arêtes ou sommets ? Chaque situation en réclame un seul — à toi de choisir lequel.
          </p>
        ),
      }}
      intro={
        <div className="space-y-4">
          <SolidView solide="cube" ariaLabel="Une caisse cubique" />
          <KnowledgeBrick
            id="choisir-le-compte"
            variant="new"
            lead="Rien de neuf ici : c’est le mot de l’énoncé qui décide lequel de tes trois comptes s’applique."
          />
        </div>
      }
      steps={[
        {
          num: 1,
          title: 'Peindre la caisse',
          done: peintureDone,
          content: (
            <NumericQuestion
              prompt={
                <>
                  On veut peindre <strong>toutes les surfaces extérieures</strong> d’une caisse cubique.
                  Combien de surfaces faut-il peindre ?
                </>
              }
              suffix="faces"
              expected={CUBE.faces}
              requires={['choisir-le-compte', 'face-solide', 'mem-cube-fas']}
              explain={`Peindre concerne les FACES : un cube en a ${CUBE.faces}, y compris le dessous.`}
              explainFor={(n) =>
                n === CUBE.aretes
                  ? `${CUBE.aretes}, ce sont les ARÊTES — les segments, pas les surfaces. On peint ${CUBE.faces} faces.`
                  : n === 5
                    ? 'N’oublie pas le dessous : même posée, la caisse a bien 6 faces.'
                    : n === 3
                      ? 'Tu n’as compté que les faces visibles sur le dessin. L’objet en a 6.'
                      : `Un cube a ${CUBE.faces} faces.`
              }
              solved={peintureDone}
              onAnswered={() => setPeintureDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Le ruban adhésif',
          done: rubanDone,
          content: (
            <NumericQuestion
              prompt={
                <>
                  On renforce la caisse en collant du ruban le long de <strong>chaque arête</strong>. Combien
                  de morceaux de ruban faut-il ?
                </>
              }
              suffix="arêtes"
              expected={CUBE.aretes}
              requires={['choisir-le-compte', 'arete', 'mem-cube-fas']}
              explain={`Les arêtes sont les segments où deux faces se rencontrent : un cube en a ${CUBE.aretes}.`}
              explainFor={(n) =>
                n === CUBE.faces
                  ? `${CUBE.faces}, ce sont les FACES. Les arêtes sont les segments : il y en a ${CUBE.aretes}.`
                  : n === CUBE.sommets
                    ? `${CUBE.sommets}, ce sont les SOMMETS — les coins. Les arêtes sont les segments : ${CUBE.aretes}.`
                    : `Un cube a ${CUBE.aretes} arêtes : 4 en haut, 4 en bas, 4 verticales.`
              }
              solved={rubanDone}
              onAnswered={() => setRubanDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Les protège-coins',
          done: choixDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  On veut poser un embout de protection sur <strong>chaque coin</strong> de la caisse. De
                  quel compte s’agit-il, et combien en faut-il ?
                </>
              }
              options={[
                `Les sommets — ${CUBE.sommets} embouts`,
                `Les arêtes — ${CUBE.aretes} embouts`,
                `Les faces — ${CUBE.faces} embouts`,
              ]}
              correct={0}
              cols={1}
              requires={['choisir-le-compte', 'sommet-solide', 'arete', 'mem-cube-fas']}
              explain={`Un « coin » est un SOMMET : le point où trois arêtes se rejoignent. Un cube en a ${CUBE.sommets}.`}
              explainWrong={`Un coin est un point, pas un segment ni une surface. Ce sont les sommets — un cube en a ${CUBE.sommets}.`}
              solved={choixDone}
              onAnswered={() => setChoixDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Ta carte est complète. La mission finale ne demandera rien de
          neuf : dix épreuves sur exactement ce que tu viens de construire.
        </KnowledgeSnapshot>
      }
    />
  );
}
