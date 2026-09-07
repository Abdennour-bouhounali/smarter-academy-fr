import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NumberLineLab from '../components/NumberLineLab';
import { fmt, oppose, distanceAZero, diagnostiquerPosition, DIAGNOSTIC_TEXT, parseRelatif } from '../components/relatifs';

/**
 * Module 2 — DÉCOUVERTE : l'ascenseur du module 1, couché.
 *
 * L'axe vertical de l'immeuble devient la droite graduée horizontale que
 * l'élève utilisera toute sa scolarité. Trois connaissances y sont posées, et
 * chacune vient APRÈS le geste qui lui donne son sens :
 *   étape 1  placer un nombre         → brique « droite-relatifs »
 *   étape 2  trouver l'autre côté     → brique « oppose »
 *   étape 3  compter jusqu'à zéro     → brique « distance-a-zero »
 *
 * Ce que ce module ne fait PAS : comparer deux relatifs (M3), calculer (M4).
 */
const A_PLACER = -4;
const OPP_DE = 5;
const DIST_DE = -6;

export default function Module02LaDroiteDesNombres() {
  const [pos1, setPos1] = useState(0);
  const done1 = pos1 === A_PLACER;

  const [pos2, setPos2] = useState(0);
  const done2 = pos2 === oppose(OPP_DE);

  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const why1 = diagnostiquerPosition(A_PLACER, pos1);

  const steps = [
    {
      num: 1,
      title: 'Couche l’ascenseur : voici la droite graduée',
      subtitle: `Place le curseur sur ${fmt(A_PLACER)}. Le zéro est le trait épais, au milieu.`,
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <NumberLineLab
            min={-8} max={8}
            value={pos1}
            onChange={(n) => { setPos1(n); if (n === A_PLACER) kit.react(true); }}
            ariaLabel={`Droite graduée — curseur sur ${fmt(pos1)}`}
          />
          {done1 ? (
            <Feedback tone="ok">
              C’est la même idée que l’ascenseur, posée à plat : le <strong>zéro</strong> au milieu,
              les <strong>positifs à droite</strong>, les <strong>négatifs à gauche</strong>. Pour
              placer {fmt(A_PLACER)}, tu es parti de zéro et tu as compté{' '}
              <strong>4 graduations vers la gauche</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {pos1 === 0
                ? 'Pars du zéro et compte les graduations vers la gauche.'
                : (DIAGNOSTIC_TEXT[why1] ?? 'Continue.')}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: `Trouve le nombre situé de l’autre côté de zéro`,
      subtitle: `${fmt(OPP_DE)} est à 5 graduations à droite du zéro. Place le nombre qui est à 5 graduations à GAUCHE.`,
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <NumberLineLab
            min={-8} max={8}
            value={pos2}
            onChange={(n) => { setPos2(n); if (n === oppose(OPP_DE)) kit.react(true); }}
            marks={[{ at: OPP_DE, label: fmt(OPP_DE), color: '#4f46e5' }]}
            ariaLabel={`Droite graduée — curseur sur ${fmt(pos2)}, repère sur ${fmt(OPP_DE)}`}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                {fmt(OPP_DE)} et {fmt(oppose(OPP_DE))} sont à la <strong>même distance du zéro</strong>,
                mais de part et d’autre. C’est la paire que tu avais déjà vue dans l’ascenseur avec
                3 et {fmt(-3)}.
              </Feedback>
              {/* Le geste vient de produire la paire symétrique : le mot peut
                  être posé, avant la question de l'étape 4 qui l'exige. */}
              <KnowledgeBrick
                id="oppose"
                variant="new"
                lead={<>Tu viens de placer, de l’autre côté du zéro, un nombre à la même distance. Cette relation entre les deux porte un nom.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Compte les graduations qui séparent {fmt(OPP_DE)} du zéro, puis reporte-les de l’autre côté.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Combien de graduations jusqu’au zéro ?',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* La droite est visible, le comptage est un geste, pas un rappel :
              on peut nommer la distance à zéro avant de la demander. */}
          <KnowledgeBrick
            id="droite-relatifs"
            variant="new"
            compact
            lead={<>Ce que tu viens de faire deux fois — partir du zéro et compter — est la méthode complète.</>}
          />
          <KnowledgeBrick
            id="distance-a-zero"
            variant="new"
            lead={<>Il reste à nommer ce que tu comptes : le nombre de graduations qui séparent un nombre du zéro.</>}
          />
          <NumericQuestion
            prompt={`Quelle est la distance à zéro de ${fmt(DIST_DE)} ?`}
            above={
              <NumberLineLab
                min={-8} max={8}
                value={null}
                marks={[{ at: DIST_DE, label: fmt(DIST_DE), color: '#e11d48' }]}
                ariaLabel={`Droite graduée — repère sur ${fmt(DIST_DE)}`}
              />
            }
            expected={distanceAZero(DIST_DE)}
            parse={parseRelatif}
            requires={['distance-a-zero', 'droite-relatifs']}
            explain={`De ${fmt(DIST_DE)} au zéro, il y a ${distanceAZero(DIST_DE)} graduations. Une distance se compte toujours en graduations : elle ne porte jamais de signe.`}
            explainFor={(n) => (n === DIST_DE
              ? <>Attention : on demande la <strong>distance</strong>, pas le nombre lui-même. Une distance n’est jamais négative.</>
              : null)}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Opposés : ce qui change, ce qui ne change pas',
      done: q4,
      content: (
        <TapQuestion
          prompt={`${fmt(-7)} et ${fmt(7)} sont opposés. Qu’ont-ils en commun ?`}
          options={[
            'Leur distance à zéro : 7 pour les deux',
            'Leur position : ils sont au même endroit',
            'Leur signe',
            'Rien du tout',
          ]}
          correct={0}
          cols={1}
          requires={['oppose', 'distance-a-zero']}
          explain={`Deux opposés partagent leur distance à zéro (${distanceAZero(-7)} ici) et ne diffèrent que par le côté. C’est pour cela qu’on passe de l’un à l’autre en changeant seulement le signe.`}
          explainWrong={`Reprends la droite : ${fmt(-7)} est à 7 graduations à gauche, ${fmt(7)} à 7 graduations à droite. Deux endroits différents, une même distance.`}
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="La droite des nombres"
      moduleSubtitle="Placer, lire, et retrouver l’autre côté"
      estimatedTime="12 min"
      brief={{
        tag: 'Découverte',
        title: 'L’ascenseur, couché',
        tone: 'indigo',
        body: (
          <p>
            On fait pivoter la cage d’ascenseur d’un quart de tour : les étages deviennent une{' '}
            <strong>droite graduée</strong>. C’est la représentation que tu utiliseras désormais
            pour tous les nombres relatifs.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
