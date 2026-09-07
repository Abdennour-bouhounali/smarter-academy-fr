import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NumberLineLab from '../components/NumberLineLab';
import { fmt, ranger, distanceAZero } from '../components/relatifs';

/**
 * Module 3 — DÉCOUVERTE : l'ordre des relatifs.
 *
 * Le cœur du module est UNE confusion, et une seule : chez les négatifs, le
 * nombre le plus loin de zéro est le plus PETIT. L'élève la rencontre par une
 * prédiction (étape 1), la voit trancher par la droite graduée, puis range une
 * série (étape 2) avant de généraliser (étapes 3-4).
 *
 * Ce que ce module ne fait PAS : calculer (M4, M5).
 */
const A = -2;
const B = -7;
const SERIE = [3, -7, 0, -2, 5];

export default function Module03QuiEstLePlusGrand() {
  const [pred1, setPred1] = useState(null);
  const [vu1, setVu1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const rangee = ranger(SERIE);

  const steps = [
    {
      num: 1,
      title: `Entre ${fmt(A)} et ${fmt(B)}, lequel est le plus grand ?`,
      subtitle: 'Donne ton avis, puis fais apparaître les deux nombres sur la droite.',
      done: vu1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt={`Ton intuition : lequel de ${fmt(A)} et ${fmt(B)} est le plus grand ?`}
            options={[
              { id: 'a', label: `${fmt(A)}` },
              { id: 'b', label: `${fmt(B)}` },
              { id: 'egal', label: 'Ils sont aussi grands' },
            ]}
            value={pred1}
            onChange={setPred1}
            disabled={vu1}
          />
          <NumberLineLab
            min={-9} max={3}
            value={null}
            marks={[
              { at: B, label: fmt(B), color: '#e11d48' },
              { at: A, label: fmt(A), color: '#059669' },
            ]}
            ariaLabel={`Droite graduée — ${fmt(B)} et ${fmt(A)} placés`}
          />
          {!vu1 && (
            <button
              type="button"
              onClick={() => { setVu1(true); kit.react(true); }}
              className="min-h-[44px] px-4 rounded-xl border-2 border-sky-300 bg-white text-sm font-semibold text-sky-700 hover:border-sky-500"
            >
              Qui est le plus à droite ?
            </button>
          )}
          {vu1 && (
            <Feedback tone="ok">
              {pred1 === 'a' ? 'Ta prédiction tenait' : pred1 === 'b' ? 'Surprise' : 'Regarde la droite'} :{' '}
              <strong>{fmt(A)} est plus grand que {fmt(B)}</strong>, parce qu’il est plus à droite.
              Pourtant {fmt(B)} est <em>plus loin</em> du zéro ({distanceAZero(B)} graduations contre{' '}
              {distanceAZero(A)}). Chez les négatifs, <strong>plus on s’éloigne de zéro, plus le
              nombre est petit</strong> — c’est le piège de tout le chapitre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Range toute la série',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* La droite vient de trancher un cas ; la règle peut être énoncée
              avant qu'on demande de l'appliquer à cinq nombres. */}
          <KnowledgeBrick
            id="ordre-relatifs"
            variant="new"
            lead={<>Tu viens de voir la droite trancher entre {fmt(A)} et {fmt(B)}. Elle tranche toujours de la même façon.</>}
          />
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Pour chaque paire, choisis le <strong>plus grand</strong> des deux nombres.</p>}
            rows={[
              { id: 'r1', label: `${fmt(-3)} ou ${fmt(-8)}`, options: [fmt(-3), fmt(-8)], correct: 0, correction: `${fmt(-3)} est plus à droite que ${fmt(-8)}.` },
              { id: 'r2', label: `${fmt(-1)} ou ${fmt(2)}`, options: [fmt(-1), fmt(2)], correct: 1, correction: 'Tout positif est plus grand que tout négatif.' },
              { id: 'r3', label: `${fmt(0)} ou ${fmt(-4)}`, options: [fmt(0), fmt(-4)], correct: 0, correction: 'Zéro est plus grand que tous les nombres négatifs.' },
              { id: 'r4', label: `${fmt(-6)} ou ${fmt(-5)}`, options: [fmt(-6), fmt(-5)], correct: 1, correction: `${fmt(-5)} est plus proche de zéro, donc plus à droite, donc plus grand.` },
            ]}
            requires={['ordre-relatifs', 'droite-relatifs']}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La série complète, dans l’ordre croissant',
      done: q3,
      content: (
        <TapQuestion
          prompt={`Range dans l’ordre croissant : ${SERIE.map(fmt).join(' ; ')}`}
          above={
            <NumberLineLab
              min={-9} max={6}
              value={null}
              marks={SERIE.map((n) => ({ at: n, label: fmt(n), color: n < 0 ? '#e11d48' : n > 0 ? '#4f46e5' : '#0f172a' }))}
              ariaLabel="Droite graduée — les cinq nombres de la série"
            />
          }
          options={[
            rangee.map(fmt).join(' < '),
            [...rangee].reverse().map(fmt).join(' < '),
            `${fmt(0)} < ${fmt(-2)} < ${fmt(-7)} < ${fmt(3)} < ${fmt(5)}`,
            `${fmt(-2)} < ${fmt(-7)} < ${fmt(0)} < ${fmt(3)} < ${fmt(5)}`,
          ]}
          correct={0}
          cols={1}
          requires={['ordre-relatifs', 'droite-relatifs']}
          explain={`L’ordre croissant se lit de gauche à droite sur la droite graduée : ${rangee.map(fmt).join(' < ')}.`}
          explainWrong={`Deux pièges ici : ranger du plus grand au plus petit, et croire que ${fmt(-7)} passe après ${fmt(-2)} parce que 7 > 2. Sur la droite, ${fmt(-7)} est bien le plus à gauche — donc le plus petit.`}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'La règle, en une phrase',
      done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="mem-ordre"
            variant="new"
            compact
            lead={<>Une phrase à garder pour toute la suite du chapitre.</>}
          />
          <TapQuestion
            prompt="Parmi ces affirmations sur les nombres négatifs, laquelle est vraie ?"
            options={[
              'Plus un nombre négatif est loin de zéro, plus il est petit',
              'Plus un nombre négatif est loin de zéro, plus il est grand',
              'Deux nombres négatifs sont toujours égaux',
              'Un nombre négatif peut être plus grand qu’un nombre positif',
            ]}
            correct={0}
            cols={1}
            requires={['ordre-relatifs', 'distance-a-zero']}
            explain={`C’est exactement ce que montre la droite : s’éloigner de zéro vers la gauche, c’est aller vers des nombres de plus en plus petits. ${fmt(-8)} < ${fmt(-3)} < ${fmt(-1)} < 0.`}
            explainWrong="Attention à ne pas transporter chez les négatifs ce qui est vrai chez les positifs. Un négatif n’est jamais plus grand qu’un positif : il est à gauche du zéro, le positif à droite."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Qui est le plus grand ?"
      moduleSubtitle="Quand −2 bat −7"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'Une intuition à corriger',
        tone: 'indigo',
        body: (
          <p>
            7 est plus grand que 2, c’est entendu. Mais {fmt(-7)} et {fmt(-2)} ? La réponse va
            peut-être te surprendre — et la droite graduée sera l’arbitre.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
