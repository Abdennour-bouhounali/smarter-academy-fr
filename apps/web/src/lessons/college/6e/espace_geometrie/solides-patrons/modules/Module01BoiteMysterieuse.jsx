import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidView from '../components/SolidView';
import { SOLIDES } from '../components/solidesUtils';

/**
 * Module 1 — TRIGGER (conflit cognitif).
 *
 * Objectif : faire sentir l'écart entre un DESSIN (plat, sur la feuille) et
 * l'OBJET (en volume). Sur un dessin de cube, on ne voit que 3 faces sur 6 :
 * les autres existent pourtant.
 *
 * Aha : le dessin ment par omission. Les arêtes en pointillé sont là pour
 * rappeler ce qu'on ne voit pas — et le compte réel ne se lit pas sur le
 * dessin, il se raisonne.
 *
 * Misconception visée : compter les faces visibles et croire qu'on a compté
 * le solide.
 */
export default function Module01BoiteMysterieuse() {
  const [visiblesDone, setVisiblesDone] = useState(false);
  const [totalDone, setTotalDone] = useState(false);
  const [pointilleDone, setPointilleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La boîte mystérieuse"
      moduleSubtitle="Un dessin plat, un objet en volume."
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Ce dessin cache la moitié de l’objet.',
        body: (
          <p>
            Une feuille est plate ; un cube ne l’est pas. Regarde bien ce que le dessin montre — et ce qu’il
            ne montre pas.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Combien de surfaces plates VOIS-tu ?',
          done: visiblesDone,
          content: (
            <TapQuestion
              above={<SolidView solide="cube" ariaLabel="Un cube dessiné en perspective" />}
              prompt="Sur ce dessin, combien de surfaces plates du cube peux-tu réellement voir ?"
              options={['3 surfaces', '6 surfaces', '4 surfaces']}
              correct={0}
              cols={3}
              requires={['figures-planes-usuelles']}
              explain="On n’en voit que 3 : le dessus, le devant et un côté. Les trois autres sont derrière."
              explainWrong="Compte celles qui sont face à toi : le dessus, le devant, un côté. Les trois autres sont cachées derrière."
              solved={visiblesDone}
              onAnswered={() => setVisiblesDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Et combien en a-t-il vraiment ?',
          done: totalDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                above={<SolidView solide="cube" highlight="faces" ariaLabel="Le même cube, avec ses bords cachés en pointillé" />}
                prompt="Un cube, en tant qu’objet, possède combien de surfaces plates au total ?"
                options={[`${SOLIDES.cube.faces} surfaces`, '3 surfaces', '4 surfaces']}
                correct={0}
                cols={3}
                requires={['figures-planes-usuelles']}
                explain="6 surfaces : les 3 visibles, et les 3 cachées derrière. Elles existent même si le dessin ne les montre pas."
                explainWrong="Le dessin n’en montre que 3, mais l’objet en a 6 — une boîte a bien un fond et un arrière."
                solved={totalDone}
                onAnswered={() => setTotalDone(true)}
              />

              {/* L'écart entre ce qu'on voit (3) et ce que l'objet a (6) vient
                  d'être constaté : c'est le moment de le poser comme idée. */}
              {totalDone && (
                <KnowledgeBrick
                  id="dessin-et-objet"
                  variant="new"
                  lead="Tu as compté 3 sur le dessin, et 6 sur l’objet : l’écart n’est pas une erreur, c’est le dessin qui est plat."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'À quoi servent les pointillés ?',
          done: pointilleDone,
          content: (
            <div className="space-y-5">
              {/* La convention du dessin technique ne se devine pas : elle
                  s'apprend. On la pose donc AVANT de la demander — l'ancienne
                  version ne la donnait que dans l'`explain`, après coup. */}
              <KnowledgeBrick
                id="arete-cachee"
                variant="new"
                lead="Sur le dessin ci-dessous, certains traits sont pleins et d’autres en pointillé."
              />
              <TapQuestion
                above={<SolidView solide="cube" highlight="aretes" ariaLabel="Cube avec ses bords cachés en pointillé" />}
                prompt="Sur ce dessin, certains traits sont en pointillé. Que signalent-ils ?"
                options={[
                  'Les bords cachés : ils existent, mais on ne les verrait pas de face',
                  'Des bords plus courts que les autres',
                  'C’est une décoration',
                ]}
                correct={0}
                cols={1}
                requires={['arete-cachee', 'dessin-et-objet']}
                explain="Le pointillé signale ce qui est derrière. L’objet possède bien ces bords : le dessin doit donc les indiquer."
                explainWrong="Tous les bords d’un cube ont la même longueur. Le pointillé n’indique pas une taille mais une position : derrière."
                solved={pointilleDone}
                onAnswered={() => setPointilleDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais qu’un solide a un derrière. Il te manque les trois mots
          justes pour dire ce que tu comptes : c’est le module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
