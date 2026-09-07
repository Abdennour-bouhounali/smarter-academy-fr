import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UnitGrid, { QuantityView } from '../components/UnitGrid';

/**
 * Module 3 V2 — reconstruit sur le lesson kit.
 *
 * Étape 1 : lire un dessin et construire la fraction (numérateur/dénominateur
 * choisis à la main) — manipulation maison, contrat kit respecté (onSolved
 * inconditionnel au premier "Valider", feedback jamais gaté sur !solved).
 * Étapes 2 et 3 : QCM formatifs en TapQuestion.
 */
function FractionBuilder({ target, den: targetDen, onSolved, solved, hint, react }) {
  const [num, setNum] = useState(solved ? target : 0);
  const [den, setDen] = useState(solved ? targetDen : null);
  const [checked, setChecked] = useState(false);

  const isRight = num === target && den === targetDen;

  // RÈGLE PROJET (2026-09-06) : le constructeur ne se fige JAMAIS après la
  // validation de l'étape. Les bornes gardées sont MATHÉMATIQUES : le nombre
  // du haut ne descend pas sous 0, et il ne dépasse pas le nombre du bas —
  // au-delà, on ne prend plus des parts de l'unité, on en prend plusieurs.
  const maxNum = den ?? 1000;
  const bump = (delta) => {
    setChecked(false);
    setNum((n) => Math.min(maxNum, Math.max(0, n + delta)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6 flex-wrap">
        <div className="text-center space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Nombre du haut
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => bump(-1)}
              disabled={num === 0}
              aria-label="Diminuer le nombre du haut"
              className="w-9 h-9 rounded-lg bg-white border-2 border-slate-200 flex items-center justify-center hover:border-slate-400 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="font-mono font-extrabold text-2xl tabular-nums w-14 text-center" aria-live="polite">
              {num}
            </span>
            <button
              type="button"
              onClick={() => bump(1)}
              disabled={num >= maxNum}
              aria-label="Augmenter le nombre du haut"
              className="w-9 h-9 rounded-lg bg-white border-2 border-slate-200 flex items-center justify-center hover:border-slate-400 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="text-center">
          <div className="h-1 w-24 bg-slate-800 rounded-full my-2" aria-hidden="true" />
        </div>

        <div className="text-center space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Nombre du bas
          </div>
          <div className="flex gap-1.5">
            {[10, 100, 1000].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setChecked(false);
                  setDen(d);
                  // Changer le découpage ne doit pas laisser un nombre du haut
                  // impossible derrière lui.
                  setNum((n) => Math.min(n, d));
                }}
                aria-pressed={den === d}
                className={`px-3 py-2 rounded-lg border-2 font-mono text-sm font-bold min-h-[40px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  den === d
                    ? 'bg-blue-600 border-blue-700 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                }`}
              >
                {d === 1000 ? '1 000' : d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-2xl text-slate-800 min-h-[48px] flex items-center justify-center">
        {(num > 0 || den !== null) && <MathText>{`$\\frac{${num}}{${den || '?'}}$`}</MathText>}
      </div>

      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              react(isRight);
              onSolved?.();
            }}
            disabled={den === null}
          >
            Valider ma fraction
          </ValidateButton>
        </div>
      )}

      {checked && !isRight && (
        <Feedback tone="ko">
          Ta réponse : <strong className="font-mono">{num}/{den ?? '?'}</strong>. Bonne réponse :{' '}
          <strong className="font-mono">{target}/{targetDen}</strong>. {' '}
          {den !== targetDen
            ? "Regarde en combien de parts égales l'unité est partagée : c'est ce nombre qui va en bas."
            : hint || "Compte à nouveau les parts coloriées : c'est le nombre du haut."}
        </Feedback>
      )}

      {solved && (
        <Feedback tone="ok">
          <MathText>{`$\\frac{${target}}{${targetDen}}$`}</MathText> : {target} part
          {target > 1 ? 's' : ''} sur les {targetDen === 1000 ? '1 000' : targetDen}.
        </Feedback>
      )}
    </div>
  );
}

const LECTURES = [
  { parts: 10, shaded: 3, tone: 'sky', name: '3 dixièmes' },
  { parts: 10, shaded: 7, tone: 'sky', name: '7 dixièmes' },
  { parts: 100, shaded: 25, tone: 'violet', name: '25 centièmes' },
];

const PLUS_DE_UN = {
  q: 'On te donne 405/100. Que représente cette quantité ?',
  options: ['Un peu plus de 4 unités entières', 'Un peu moins de 1 unité', 'Exactement 405 unités', 'Un peu plus de 40 unités'],
  correct: 0,
  explain:
    '100 centièmes forment 1 unité. Dans 405 centièmes, il y a 4 paquets de 100 (soit 4 unités entières) et il reste 5 centièmes. La quantité vaut donc 4 unités et 5 centièmes.',
};

const DECOMP = {
  q: 'Complète la décomposition de 37/100 en dixièmes et centièmes.',
  options: ['3/10 + 7/100', '37/10 + 7/100', '3/100 + 7/10', '30/10 + 7/100'],
  correct: 0,
  explain:
    'Les 3 lignes complètes valent 3 dixièmes et les 7 cases restantes valent 7 centièmes : 37/100 = 3/10 + 7/100.',
};

function renderFractionOption(o) {
  const [a, b] = o.split(' + ');
  const f = (x) => {
    const [n, d] = x.split('/');
    return `\\frac{${n}}{${d}}`;
  };
  return <MathText>{`$${f(a)} + ${f(b)}$`}</MathText>;
}

export default function Module03FractionsDecimales() {
  const [lectures, setLectures] = useState([]);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  const s1 = lectures.length === LECTURES.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Les fractions décimales"
      moduleSubtitle="Écrire une quantité avec un découpage en 10, 100 ou 1 000 parts."
      estimatedTime="12 min"
      brief={{
        tag: '➗ Écriture',
        title: 'Une fraction décimale raconte le découpage.',
        body: (
          <p>
            Tu vas lire trois dessins et écrire, pour chacun, la fraction qui lui correspond : le
            nombre du <strong className="text-white">bas</strong> pour le découpage, celui du{' '}
            <strong className="text-white">haut</strong> pour les parts prises.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Lis le dessin, écris la fraction',
          done: s1,
          content: (kit) => (
            <div className="space-y-8">
              {LECTURES.map((item, i) =>
                i === 0 || lectures.includes(i - 1) ? (
                  <div key={`${item.parts}-${item.shaded}`} className="space-y-3">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Dessin {i + 1} / {LECTURES.length}
                    </div>
                    <UnitGrid
                      parts={item.parts}
                      shaded={item.shaded}
                      tone={item.tone}
                      showCount={false}
                      label="Quelle fraction de l'unité est coloriée ?"
                    />
                    <FractionBuilder
                      target={item.shaded}
                      den={item.parts}
                      solved={lectures.includes(i)}
                      onSolved={() => setLectures((d) => (d.includes(i) ? d : [...d, i]))}
                      react={kit.react}
                    />
                  </div>
                ) : null
              )}
              {/* Trois fractions viennent d'être construites à la main : les
                  deux mots savants et le nom de la famille se posent ici. */}
              {s1 && (
                <KnowledgeBrick
                  id="fraction-decimale"
                  variant="new"
                  lead="Les trois écritures que tu viens de construire appartiennent à la même famille."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: "Et si la fraction dépasse l'unité ?",
          subtitle: "Une même écriture peut représenter plus d'une unité entière.",
          done: s2,
          content: (
            <div className="space-y-4">
              <div className="text-center text-3xl text-slate-800 py-2">
                <MathText>{'$\\frac{405}{100}$'}</MathText>
              </div>
              <TapQuestion
                prompt={PLUS_DE_UN.q}
                options={PLUS_DE_UN.options}
                correct={PLUS_DE_UN.correct}
                cols={1}
                requires={['fraction-decimale', 'centieme']}
                explain={PLUS_DE_UN.explain}
                solved={s2}
                onAnswered={() => setS2(true)}
              />
              {s2 && (
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">
                  <QuantityView value={4.05} den={100} tone="violet" />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Décomposer une fraction décimale',
          done: s3,
          content: (
            <div className="space-y-4">
              <UnitGrid parts={100} shaded={37} tone="violet" showCount={false} label="37 centièmes" />
              <TapQuestion
                prompt={DECOMP.q}
                options={DECOMP.options}
                correct={DECOMP.correct}
                cols={2}
                requires={['fraction-decimale', 'dixieme', 'centieme']}
                renderOption={renderFractionOption}
                explain={DECOMP.explain}
                solved={s3}
                onAnswered={() => setS3(true)}
              />
              {s3 && (
                <Feedback tone="info">
                  Retiens bien ce découpage : <strong>3 dixièmes + 7 centièmes</strong>. Au module suivant, tu vas
                  voir qu'il s'écrit aussi <strong className="font-mono">0,37</strong> — et tu comprendras pourquoi.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Tu sais écrire une quantité en fraction. Au module suivant,
          tu découvres la troisième écriture — celle avec une virgule.
        </KnowledgeSnapshot>
      }
    />
  );
}
