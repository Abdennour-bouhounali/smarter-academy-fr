import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CircleLab from '../components/CircleLab';
import { TAU, principal, fr } from '../components/trigoUtils';

/**
 * Module 1 — LA manipulation signature (INTERACTION_PEDAGOGY §6bis).
 *
 * Activité               enrouler un fil de longueur t sur un cercle de rayon 1
 * Geste de l'élève       tirer le point le long du cercle
 * Observation attendue   un demi-tour coûte π ≈ 3,14 de fil, un tour 2π ≈ 6,28 ;
 *                        au-delà, on repasse sur les mêmes points
 * Obstacle visé          « t est un angle en degrés déguisé » — non : c'est une
 *                        LONGUEUR, et c'est elle qu'on lit sur l'arc violet.
 *
 * La manipulation n'est JAMAIS gelée : l'élève peut continuer à tourner après
 * avoir validé, y compris pour vérifier la question suivante.
 */
export default function Module01EnroulerLeFil() {
  const [t1, setT1] = useState(0);
  const [seenHalf, setSeenHalf] = useState(false);
  const [seenFull, setSeenFull] = useState(false);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [t3, setT3] = useState(0);
  const [seenBeyond, setSeenBeyond] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = seenHalf && seenFull;

  const move1 = (v, react) => {
    setT1(v);
    let hit = false;
    if (Math.abs(v - Math.PI) < 0.12 && !seenHalf) { setSeenHalf(true); hit = seenFull; }
    if ((v < 0.12 || v > TAU - 0.12) && seenHalf && !seenFull) { setSeenFull(true); hit = true; }
    if (hit) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Un fil sur un cercle',
      subtitle: 'Le cercle a pour rayon 1. Tire le point : l’arc violet est la longueur de fil déjà enroulée. Arrête-toi au demi-tour, puis reviens au départ.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="combien de fil faut-il pour faire un demi-tour ?"
            options={[{ id: '3', label: 'Environ 3,14' }, { id: '180', label: '180' }, { id: '1', label: '1, comme le rayon' }]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <CircleLab t={t1} onChange={(v) => move1(v, kit.react)} showCos={false} showSin={false} label="Enroulement du fil" />
          {done1 ? (
            <>
              <Feedback tone="ok">
                {pred === '3' ? 'Ta prédiction tenait' : 'Regarde le compteur'} : le demi-tour coûte
                <strong> π ≈ 3,14</strong> de fil, et le tour complet <strong>2π ≈ 6,28</strong>. Ce nombre
                n’est pas un angle : c’est une <strong>longueur</strong>, celle de l’arc que tu viens de peindre.
                Le rayon vaut 1, donc le périmètre vaut 2π — rien d’autre n’est en jeu.
              </Feedback>
              <KnowledgeBrick
                id="cercle-trigonometrique"
                variant="new"
                lead={<>Ce cercle-là, avec son rayon 1, son départ en (1 ; 0) et son sens de parcours, porte un nom.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              {!seenHalf ? 'Amène le point à l’opposé du départ (demi-tour). ' : ''}
              {seenHalf && !seenFull ? 'Continue jusqu’à revenir au point de départ.' : ''}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un réel, un point',
      done: q2,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="enroulement"
            variant="new"
            lead={<>Tu viens de faire correspondre une longueur de fil à une position sur le cercle. C’est exactement ce qu’on appelle enrouler la droite des réels.</>}
          />
          <TapQuestion
            prompt={<span>Sur le cercle de rayon 1, quelle longueur de fil sépare le point de départ du point diamétralement opposé ?</span>}
            options={['π', '2π', '1', '180']}
            correct={0} cols={2}
            requires={['cercle-trigonometrique', 'enroulement']}
            explain="Un tour complet mesure 2π (le périmètre). Le demi-tour en mesure donc la moitié : π ≈ 3,14."
            explainWrong="180 est une mesure en DEGRÉS, pas une longueur. Sur ce cercle on compte en longueur d’arc : le demi-tour vaut π."
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et au-delà d’un tour ?',
      subtitle: 'Continue à enrouler au-delà du départ : que se passe-t-il ?',
      done: seenBeyond,
      content: (kit) => (
        <div className="space-y-3">
          <CircleLab
            t={t3}
            onChange={(v) => { setT3(v); if (!seenBeyond && v > 0.3 && v < TAU - 0.3) { setSeenBeyond(true); kit.react?.(true); } }}
            showCos={false} showSin={false}
            label="Second tour"
          />
          {seenBeyond ? (
            <Feedback tone="ok">
              Le fil continue, mais le point <strong>repasse par les mêmes endroits</strong> : t et t + 2π
              arrivent au même point. Un point du cercle correspond donc à une infinité de réels — mais
              chaque réel ne donne qu’UN point. C’est ce sens-là qui compte pour l’instant.
            </Feedback>
          ) : (
            <Feedback tone="info">Fais tourner le point d’au moins un quart de tour.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le compte du fil',
      done: q4,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="mem-rayon-un"
            variant="new"
            lead={<>Trois choix, toujours les mêmes, qui rendent tout le reste possible.</>}
          />
          <TapQuestion
            prompt={<span>Un quart de tour sur ce cercle correspond à quelle longueur de fil ?</span>}
            options={[
              <MathText key="a">{'$\\dfrac{\\pi}{2}$'}</MathText>,
              <MathText key="b">{'$\\dfrac{\\pi}{4}$'}</MathText>,
              <MathText key="c">{'$90$'}</MathText>,
              <MathText key="d">{'$\\dfrac{1}{4}$'}</MathText>,
            ]}
            correctionLabel="π/2"
            correct={0} cols={2}
            requires={['enroulement', 'mem-rayon-un']}
            explain="Le tour complet vaut 2π, donc le quart vaut 2π ÷ 4 = π/2 ≈ 1,57."
            explainWrong="π/4 serait un HUITIÈME de tour (2π ÷ 8). Et 90 est une mesure en degrés, pas une longueur d’arc."
            solved={q4} onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Enrouler le fil"
      moduleSubtitle="Un fil de longueur t posé sur un cercle de rayon 1"
      estimatedTime="14 min"
      brief={{
        tag: '🧵 Mission 01',
        title: 'Le collège mesurait les angles en degrés. Et si on les mesurait avec du fil ?',
        tone: 'indigo',
        body: <p>Un cercle de rayon 1, un fil qu’on enroule depuis (1 ; 0). La longueur enroulée va devenir la mesure de l’angle — et elle va donner bien plus que ça.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          Tu sais placer un point à partir d’une longueur de fil. Reste à donner un nom à cette
          mesure, et à la relier aux degrés que tu connais : c’est le module suivant.
        </KnowledgeSnapshot>
      )}
    />
  );
}
