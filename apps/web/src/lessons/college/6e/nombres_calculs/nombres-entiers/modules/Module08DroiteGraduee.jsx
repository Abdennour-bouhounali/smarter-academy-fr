import React, { useState } from 'react';
import { Move } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NumberLine from '../../../../../common/components/NumberLine';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { formatFr } from '../components/numberUtils';

/**
 * Module 8 V2 — reconstruit sur le lesson kit. Le placement au curseur reste
 * une manipulation maison ; lire une position devient une NumericQuestion
 * (avec la droite graduée en visuel), trouver le pas et l'écart deviennent
 * des TapQuestion.
 */

const LECTURES = [
  {
    min: 0,
    max: 50,
    step: 10,
    labelEvery: 1,
    target: 30,
    explain: "Les graduations vont de 10 en 10 : 0, 10, 20, 30… Le point est sur la 3e graduation après 0.",
  },
  {
    min: 0,
    max: 100000,
    step: 10000,
    labelEvery: 2,
    target: 70000,
    explain:
      'Ici chaque graduation vaut 10 000. Le point est sur la 7e graduation après 0 : 7 × 10 000 = 70 000.',
  },
];

const PAS = [
  {
    min: 0,
    max: 1000,
    step: 100,
    labelEvery: 10,
    options: ['1', '10', '100', '1 000'],
    correct: 2,
    explain:
      "Entre 0 et 1 000, il y a 10 intervalles égaux. Chaque intervalle vaut donc 1 000 ÷ 10 = 100. C'est le pas de la graduation.",
  },
  {
    min: 2000,
    max: 2500,
    step: 50,
    labelEvery: 10,
    options: ['5', '50', '100', '500'],
    correct: 1,
    explain: 'Entre 2 000 et 2 500, il y a 10 intervalles : chacun vaut 500 ÷ 10 = 50.',
  },
];

const PLACEMENTS = [
  {
    min: 300,
    max: 400,
    step: 10,
    labelEvery: 5,
    target: 370,
    explain:
      "370 = 300 + 70. À partir de 300, il faut avancer de 70, soit 7 graduations de 10 : c'est nettement après la moitié de l'intervalle.",
  },
  {
    min: 4500,
    max: 4600,
    step: 10,
    labelEvery: 5,
    target: 4580,
    explain:
      "4 580 = 4 500 + 80. Il faut avancer de 8 graduations de 10 à partir de 4 500 : le point est tout près de 4 600.",
  },
];

function PlacerNombre({ item, solved, onSolved, react }) {
  const [pos, setPos] = useState(Math.round((item.min + item.max) / 2 / item.step) * item.step);
  const [checked, setChecked] = useState(false);

  const ecart = Math.abs(pos - item.target);
  const isRight = ecart === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 text-sm text-slate-700 bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3">
        <Move className="w-4 h-4 mt-0.5 shrink-0 text-cyan-600" aria-hidden="true" />
        <span>
          Fais glisser le curseur pour placer <strong className="font-mono">{formatFr(item.target)}</strong>. Au
          clavier : flèches gauche/droite. La valeur du curseur reste cachée — à toi d'estimer !
        </span>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
        <NumberLine
          min={item.min}
          max={item.max}
          step={item.step}
          labelEvery={item.labelEvery}
          height={190}
          mode="place"
          value={pos}
          // RÈGLE PROJET (2026-09-06) : la droite ne se fige JAMAIS après la
          // validation. L'élève garde le curseur pour aller voir où tombent
          // les voisins de la cible — le repère fantôme reste affiché à côté.
          onChange={(v) => {
            setPos(v);
            setChecked(false);
          }}
          snap={item.step}
          revealValue={solved || checked}
          ghost={solved || (checked && !isRight) ? { value: item.target, label: formatFr(item.target) } : null}
          ariaLabel={`Place ${formatFr(item.target)} entre ${formatFr(item.min)} et ${formatFr(item.max)}`}
        />
      </div>

      {!solved && (
        <ValidateButton
          onClick={() => {
            setChecked(true);
            react(isRight);
            onSolved?.();
          }}
          tone="indigo"
        >
          Valider ma position
        </ValidateButton>
      )}

      {(checked || solved) && !isRight && (
        <Feedback tone="ko">
          Tu as placé le curseur sur <strong className="font-mono">{formatFr(pos)}</strong>, soit un écart de{' '}
          <strong className="font-mono">{formatFr(ecart)}</strong> avec la cible (repère vert). {item.explain}
        </Feedback>
      )}

      {(checked || solved) && isRight && (
        <Feedback tone="ok">
          Position exacte ! {item.explain}
        </Feedback>
      )}
    </div>
  );
}

const ECART = {
  min: 0,
  max: 5000,
  step: 500,
  labelEvery: 2,
  a: 1500,
  b: 4000,
  options: ['5 graduations, soit 2 500', '5 graduations, soit 500', '2 graduations, soit 1 000', '3 graduations, soit 1 500'],
  correct: 0,
  explain:
    'Le pas vaut 500. Entre 1 500 et 4 000, il y a 5 graduations : 5 × 500 = 2 500. Sur une demi-droite graduée, une distance se lit en comptant les graduations.',
};

export default function Module08DroiteGraduee() {
  const [lecturesDone, setLecturesDone] = useState([]);
  const [pasDone, setPasDone] = useState([]);
  const [placementsDone, setPlacementsDone] = useState([]);
  const [ecartRevealed, setEcartRevealed] = useState(false);

  const s1 = lecturesDone.length === LECTURES.length;
  const s2 = pasDone.length === PAS.length;
  const s3 = placementsDone.length === PLACEMENTS.length;
  const s4 = ecartRevealed;

  const mark = (setter, i) => setter((d) => (d.includes(i) ? d : [...d, i]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="La demi-droite graduée"
      moduleSubtitle="Chaque nombre a UNE place sur la droite. Plus on va à droite, plus le nombre est grand."
      estimatedTime="12 min"
      brief={{
        tag: '📏 Repérage',
        title: 'Un nombre, une position. Une position, un nombre.',
        body: (
          <p>
            Sur une demi-droite graduée, on part de 0 et on avance toujours du même pas. Savoir lire ce pas,
            c'est savoir lire n'importe quelle position.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: "Lire la position d'un point",
          done: s1,
          content: (
            <div className="space-y-8">
              {LECTURES.map((item, i) =>
                i === 0 || lecturesDone.includes(i - 1) ? (
                  <NumericQuestion
                    key={item.target}
                    prompt="Quel nombre est repéré par le point rouge ?"
                    above={(revealed) => (
                      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
                        <NumberLine
                          min={item.min}
                          max={item.max}
                          step={item.step}
                          labelEvery={item.labelEvery}
                          markers={[{ value: item.target, label: revealed ? formatFr(item.target) : '?', color: '#dc2626' }]}
                          ariaLabel={`Demi-droite graduée de ${formatFr(item.min)} à ${formatFr(item.max)} avec un point à identifier`}
                        />
                      </div>
                    )}
                    expected={item.target}
                    requires={['position-chiffre', 'ranger-ordre']}
                    explain={item.explain}
                    solved={lecturesDone.includes(i)}
                    onAnswered={() => mark(setLecturesDone, i)}
                  />
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Trouver le pas de la graduation',
          subtitle: 'Combien vaut un seul trait ? Toute la lecture en dépend.',
          done: s2,
          content: (
            <div className="space-y-8">
              {/* Les deux questions qui suivent emploient le mot « pas » :
                  il est donc posé ici, avec le geste de comptage des traits,
                  et non dans le sous-titre lu avant l'ouverture de l'étape. */}
              <KnowledgeBrick
                id="pas-graduation"
                variant="new"
                lead="Sur la droite que tu viens de lire, tous les traits étaient également espacés."
              />
              {PAS.map((item, i) =>
                i === 0 || pasDone.includes(i - 1) ? (
                  <TapQuestion
                    key={`${item.min}-${item.max}`}
                    prompt="Combien vaut une graduation (le « pas ») ?"
                    above={
                      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
                        <NumberLine
                          min={item.min}
                          max={item.max}
                          step={item.step}
                          labelEvery={item.labelEvery}
                          height={140}
                          ariaLabel={`Demi-droite graduée de ${formatFr(item.min)} à ${formatFr(item.max)}`}
                        />
                      </div>
                    }
                    options={item.options}
                    correct={item.correct}
                    cols={2}
                    requires={['pas-graduation']}
                    explain={item.explain}
                    solved={pasDone.includes(i)}
                    onAnswered={() => mark(setPasDone, i)}
                  />
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Place le nombre au bon endroit',
          subtitle: "Ici, il ne s'agit plus de lire : il faut estimer une grandeur.",
          done: s3,
          content: (kit) => (
            <div className="space-y-8">
              {PLACEMENTS.map((item, i) =>
                i === 0 || placementsDone.includes(i - 1) ? (
                  <PlacerNombre
                    key={item.target}
                    item={item}
                    solved={placementsDone.includes(i)}
                    onSolved={() => mark(setPlacementsDone, i)}
                    react={kit.react}
                  />
                ) : null
              )}
              {/* Le curseur a été placé deux fois à l'estime : la méthode
                  peut maintenant être écrite, elle décrit un geste connu. */}
              {s3 && (
                <KnowledgeBrick
                  id="placer-sur-droite"
                  variant="new"
                  lead="Voilà ce que tu viens de faire deux fois, sans voir la valeur du curseur."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Quel écart sépare les deux points ?',
          done: s4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="Combien de graduations séparent A et B, et quel écart cela représente-t-il ?"
                above={
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
                    <NumberLine
                      min={ECART.min}
                      max={ECART.max}
                      step={ECART.step}
                      labelEvery={ECART.labelEvery}
                      markers={[
                        { value: ECART.a, label: 'A', color: '#dc2626' },
                        { value: ECART.b, label: 'B', color: '#2563eb' },
                      ]}
                      ariaLabel="Deux points A et B sur une demi-droite graduée"
                    />
                  </div>
                }
                options={ECART.options}
                correct={ECART.correct}
                cols={2}
                requires={['pas-graduation', 'placer-sur-droite']}
                explain={ECART.explain}
                onAnswered={() => setEcartRevealed(true)}
              />
              {s4 && (
                <KnowledgeBrick
                  id="droite-ordonne"
                  variant="new"
                  lead="Tu viens de mesurer un écart en comptant les traits — regarde aussi de quel côté chaque point se trouve."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={8}>
          <strong>La suite.</strong> Tu sais lire et placer un nombre sur la droite. Au module
          suivant, on quitte les exercices : les grands nombres racontent le monde réel.
        </KnowledgeSnapshot>
      }
    />
  );
}
