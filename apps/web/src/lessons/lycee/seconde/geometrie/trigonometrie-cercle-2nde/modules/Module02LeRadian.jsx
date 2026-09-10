import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CircleLab from '../components/CircleLab';
import { toRadians, fr } from '../components/trigoUtils';

/**
 * Module 2 — le radian, et la conversion.
 *
 * L'unité ne s'annonce pas : elle se constate. L'élève amène le point sur des
 * positions dont il connaît DÉJÀ la mesure en degrés (90°, 180°) et lit la
 * longueur d'arc correspondante ; la proportionnalité fait le reste.
 */
export default function Module02LeRadian() {
  const [t1, setT1] = useState(0);
  const [seen90, setSeen90] = useState(false);
  const [seen180, setSeen180] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = seen90 && seen180;

  const move = (v, react) => {
    setT1(v);
    let hit = false;
    if (Math.abs(v - Math.PI / 2) < 0.1 && !seen90) { setSeen90(true); hit = seen180; }
    if (Math.abs(v - Math.PI) < 0.1 && !seen180) { setSeen180(true); hit = seen90; }
    if (hit) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Deux positions que tu connais déjà',
      subtitle: 'Amène le point au quart de tour (90°), puis au demi-tour (180°). Lis à chaque fois la longueur d’arc.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <CircleLab t={t1} onChange={(v) => move(v, kit.react)} showCos={false} showSin={false} showDegrees label="Arc et degrés" />
          {done1 ? (
            <>
              <Feedback tone="ok">
                90° coûte <strong>1,57</strong> de fil, soit <MathText>{'$\\dfrac{\\pi}{2}$'}</MathText> ;
                180° en coûte <strong>3,14</strong>, soit <MathText>{'$\\pi$'}</MathText>. Deux façons de
                dire la même position : l’une compte des degrés, l’autre compte de la <strong>longueur</strong>.
              </Feedback>
              <KnowledgeBrick
                id="radian"
                variant="new"
                lead={<>Cette seconde façon de mesurer — par la longueur de l’arc sur un cercle de rayon 1 — a un nom et une unité.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              {!seen90 ? 'Vise le quart de tour (90°). ' : ''}{!seen180 ? 'Puis le demi-tour (180°).' : ''}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le pivot de toutes les conversions',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<span>Quelle égalité permet de convertir entre degrés et radians ?</span>}
            options={[
              <MathText key="a">{'$\\pi \\text{ rad} = 180°$'}</MathText>,
              <MathText key="b">{'$\\pi \\text{ rad} = 360°$'}</MathText>,
              <MathText key="c">{'$1 \\text{ rad} = 1°$'}</MathText>,
              <MathText key="d">{'$2\\pi \\text{ rad} = 180°$'}</MathText>,
            ]}
            optionLabel={(i) => ['π rad = 180°', 'π rad = 360°', '1 rad = 1°', '2π rad = 180°'][i]}
            correct={0} cols={2}
            requires={['radian', 'enroulement']}
            explain="Le demi-tour, c’est 180° d’un côté et une longueur d’arc π de l’autre : π rad = 180°. Le tour complet donne 2π rad = 360°, qui en est le double."
            explainWrong="Le TOUR complet vaut 2π rad = 360°. Le demi-tour, donc π rad, vaut 180°."
            solved={q2} onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="formule-conversion"
              variant="new"
              lead={<>De cette seule égalité découlent les deux conversions, par simple proportionnalité.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Convertir dans les deux sens',
      done: q3,
      content: (
        <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-600">Chaque angle, dans l’autre unité :</p>}
          rows={[
            { id: 'r1', label: '60°', options: ['π/3', 'π/6', 'π/2'], correct: 0, correction: '60 × π/180 = π/3.' },
            { id: 'r2', label: '45°', options: ['π/4', 'π/3', 'π/8'], correct: 0, correction: '45 × π/180 = π/4.' },
            { id: 'r3', label: 'π/6 rad', options: ['30°', '60°', '15°'], correct: 0, correction: 'π/6 × 180/π = 30°.' },
            { id: 'r4', label: '2π/3 rad', options: ['120°', '60°', '240°'], correct: 0, correction: '2π/3 × 180/π = 120°.' },
          ]}
          requires={['formule-conversion', 'radian', 'proportionnalite']}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Une seule règle de trois à chaque fois :
              on multiplie par <MathText>{'$\\dfrac{\\pi}{180}$'}</MathText> pour aller vers les radians,
              par <MathText>{'$\\dfrac{180}{\\pi}$'}</MathText> pour revenir aux degrés.
            </Feedback>
          )}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Un radian, ça ressemble à quoi ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="mem-pi-180"
            variant="new"
            lead={<>La seule égalité à retenir — tout le reste s’en déduit.</>}
          />
          <NumericQuestion
            prompt="Un angle de 1 radian vaut environ combien de degrés ? (arrondi à l’unité)"
            expected={57} suffix="°"
            requires={['formule-conversion', 'mem-pi-180']}
            explain="1 × 180/π ≈ 57,3, soit 57° à l’unité près. Un radian est donc un angle un peu plus petit que 60° — l’arc mesure alors exactement un rayon."
            explainFor={(n) => (n === 180 ? '180° correspond à π radians, pas à 1 radian.'
              : n === 60 ? 'Proche, mais 60° vaut π/3 ≈ 1,047 rad. Un radian vaut 180/π ≈ 57°.'
              : 'Multiplie par 180/π : 1 × 180 ÷ 3,14159 ≈ 57.')}
            solved={q4} onAnswered={() => setQ4(true)}
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
      moduleTitle="Le radian"
      moduleSubtitle="Mesurer un angle par la longueur parcourue"
      estimatedTime="14 min"
      brief={{
        tag: '📏 Mission 02',
        title: 'Le degré est un choix arbitraire. Le radian, non.',
        tone: 'indigo',
        body: <p>Pourquoi 360 ? Personne ne peut le justifier autrement que par l’histoire. La longueur d’arc, elle, sort du cercle lui-même.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          Tu sais nommer et convertir la mesure. Reste la vraie récompense : ce que ce point,
          une fois placé, donne à LIRE sur les deux axes.
        </KnowledgeSnapshot>
      )}
    />
  );
}
