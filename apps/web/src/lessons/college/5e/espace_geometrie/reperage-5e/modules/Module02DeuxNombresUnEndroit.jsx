import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DomaineLab from '../components/DomaineLab';
import { AMBIGU, formatCoords, lieuById } from '../components/reperageUtils';

/**
 * Module 2 — DÉCOUVERTE : le second axe lève l'ambiguïté.
 *
 * Le module 1 s'est arrêté sur un manque. Ici l'élève reçoit un SECOND
 * curseur, et constate que le halo se réduit à un point unique. C'est
 * seulement après ce constat que les mots « repère », « axes », « origine »
 * et « coordonnées » sont posés — la notation arrive comme la réponse à un
 * problème vécu, jamais comme une définition d'ouverture (CLAUDE.md §4).
 *
 * Un curseur commande exactement UN déplacement (§8, une variable à la fois) :
 * l'élève ne peut pas bouger les deux nombres d'un même geste, si bien que le
 * rôle propre de chacun reste lisible.
 *
 * Expected observation : « avec deux nombres, il ne reste qu'un seul endroit ».
 * Misconception targeted : croire que le second nombre est une décoration, ou
 * que l'ordre des deux n'a pas d'importance (traité à fond au module 4).
 */
export default function Module02DeuxNombresUnEndroit() {
  const [x, setX] = useState(AMBIGU.x);
  const [y, setY] = useState(0);
  const [trouve, setTrouve] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const lac = lieuById('lac');
  const sommet = lieuById('sommet');

  // La cible : atteindre le Lac gelé, qui partageait son abscisse avec le Sommet.
  const surLaCible = x === lac.x && y === lac.y;

  const poser = (nx, ny, react) => {
    setX(nx);
    setY(ny);
    if (nx === lac.x && ny === lac.y && !trouve) {
      setTrouve(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Un second curseur, un seul endroit',
      subtitle: 'Amène le point sur le Lac gelé — celui qui était en bas.',
      done: trouve,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3.5 text-sm text-slate-700">
            Tu disposes maintenant de <strong>deux curseurs</strong> : l’un se déplace
            horizontalement, l’autre verticalement. L’abscisse est déjà sur{' '}
            <strong>{AMBIGU.x}</strong> — celle qui désignait deux lieux à la fois. Sers-toi du
            second pour choisir <strong>lequel</strong>.
          </div>

          <DomaineLab
            axis="xy"
            x={x}
            y={y}
            onX={(nx) => poser(nx, y, kit.react)}
            onY={(ny) => poser(x, ny, kit.react)}
            ariaLabel="Carte du domaine — deux curseurs, un point unique"
          />

          {trouve ? (
            <Feedback tone="ok">
              Un seul endroit, cette fois. Le couple{' '}
              <strong className="font-mono">{formatCoords(lac)}</strong> désigne{' '}
              <strong>{lac.nom}</strong> et lui seul — alors que{' '}
              <strong className="font-mono">{formatCoords(sommet)}</strong> désigne{' '}
              <strong>{sommet.nom}</strong>. Même premier nombre, second nombre différent : c’est
              lui qui tranche.
            </Feedback>
          ) : surLaCible ? null : (
            <Feedback tone="info">
              Le second curseur commande la <strong>hauteur</strong>. Le Lac gelé est en{' '}
              <strong>bas</strong> de la carte : descends jusqu’à lui.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux droites graduées qui se croisent',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* Les trois briques posées ENSEMBLE, parce que les trois mots
              nomment une seule et même chose que l'élève vient de construire :
              deux axes, leur croisement, et le couple qu'ils produisent. */}
          <KnowledgeBrick
            id="repere"
            variant="new"
            lead={<>Les deux règles que tu viens d’utiliser forment un objet qui a un nom.</>}
          />
          <KnowledgeBrick id="axes-origine" variant="new" />

          <TapQuestion
            prompt="Sur la carte, où se trouve l’origine du repère ?"
            options={[
              'Au chalet d’accueil, là où les deux axes se croisent',
              'En bas à gauche de la carte',
              'Au Sommet',
              'Il n’y a pas d’origine',
            ]}
            correct={0}
            cols={1}
            requires={['repere', 'axes-origine']}
            explain="L’origine est le point de croisement des deux axes : c’est le chalet d’accueil, le point à partir duquel les deux graduations comptent."
            explainWrong="L’origine n’est pas un coin de la carte : c’est le point où les deux axes se coupent. Ici, les deux graduations partent du chalet d’accueil."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Écrire les deux nombres',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="coordonnees"
            variant="new"
            lead={<>Les deux nombres s’écrivent ensemble, dans un ordre fixé une fois pour toutes.</>}
          />
          <TapQuestion
            prompt={
              <>
                Le <strong>{sommet.nom}</strong> est à {sommet.x} horizontalement et {sommet.y}{' '}
                verticalement. Comment écrit-on ses coordonnées ?
              </>
            }
            options={[
              formatCoords(sommet),
              formatCoords({ x: sommet.y, y: sommet.x }),
              `${sommet.x} et ${sommet.y}`,
              `${sommet.x}${sommet.y}`,
            ]}
            correct={0}
            cols={2}
            requires={['coordonnees', 'axes-origine']}
            explain={`On écrit d’abord l’abscisse (${sommet.x}), puis l’ordonnée (${sommet.y}), entre parenthèses et séparées par un point-virgule : ${formatCoords(sommet)}.`}
            explainWrong={`L’ordre est fixé : l’abscisse d’abord, l’ordonnée ensuite. ${formatCoords({ x: sommet.y, y: sommet.x })} désignerait un tout autre point — c’est précisément le piège du module suivant.`}
            solved={q3}
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
      moduleTitle="Deux nombres, un endroit"
      moduleSubtitle="Le repère, et pourquoi il en faut deux"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'Ajouter ce qui manquait',
        tone: 'indigo',
        body: (
          <p>
            Un nombre désignait toute une colonne. Ajoute la <strong>hauteur</strong>, et le
            même problème se résout d’un coup : deux nombres, un seul endroit. C’est de là que
            vient le mot <strong>repère</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
