import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Feedback } from '../../../../../common/components/LessonUI';
import { formatFr, spellFr } from '../components/numberUtils';

/**
 * Module 9 V2 — reconstruit sur le lesson kit. Les six quantités du monde
 * réel deviennent les options riches d'une TapQuestion (renderOption) ;
 * estimations et nombre manquant passent aussi en TapQuestion.
 */

const CARTES = [
  { id: 'ville', emoji: '🏙️', label: "Habitants d'une ville", value: 105300, unit: 'habitants' },
  { id: 'lune', emoji: '🌙', label: 'Distance Terre – Lune', value: 384400, unit: 'km' },
  { id: 'stade', emoji: '🏟️', label: 'Spectateurs du stade', value: 67500, unit: 'places' },
  { id: 'biblio', emoji: '📚', label: 'Livres de la bibliothèque', value: 12450, unit: 'livres' },
  { id: 'voiture', emoji: '🚗', label: "Prix d'une voiture", value: 18700, unit: '€' },
  { id: 'musee', emoji: '🏛️', label: 'Visiteurs du musée en un an', value: 305000, unit: 'visiteurs' },
];

const PLUS_GRAND_INDEX = CARTES.findIndex((c) => c.id === 'lune');

const ESTIMATIONS = [
  {
    situation: "Le nombre d'élèves d'un collège",
    emoji: '🎒',
    options: ['65', '650', '65 000'],
    correct: 1,
    explain:
      "Un collège accueille quelques centaines d'élèves : environ 650. 65 serait une seule classe, et 65 000 dépasse la population de beaucoup de villes.",
  },
  {
    situation: "Le nombre d'habitants d'une grande ville",
    emoji: '🏙️',
    options: ['5 000', '50 000', '500 000'],
    correct: 2,
    explain:
      "Une grande ville compte des centaines de milliers d'habitants : de l'ordre de 500 000. 5 000 correspondrait à un village.",
  },
  {
    situation: "Le nombre de pages d'un roman",
    emoji: '📖',
    options: ['3', '350', '35 000'],
    correct: 1,
    explain: "Un roman fait quelques centaines de pages : de l'ordre de 350.",
  },
];

const MANQUANT = {
  low: 2450,
  high: 18700,
  options: [1200, 9875, 25000, 18700],
  correct: 1,
  explain:
    "Il faut un nombre strictement compris entre 2 450 et 18 700. 1 200 est trop petit, 25 000 est trop grand, et 18 700 est déjà pris par le troisième village. Seul 9 875 convient.",
};

export default function Module09MondeReel() {
  const [carteDone, setCarteDone] = useState(false);
  const [estimDone, setEstimDone] = useState([]);
  const [manqDone, setManqDone] = useState(false);

  const s1 = carteDone;
  const s2 = estimDone.length === ESTIMATIONS.length;
  const s3 = manqDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(9)}
      moduleNumber={9}
      moduleTitle="Les nombres dans le monde réel"
      moduleSubtitle="Habitants, distances, spectateurs : à quoi sert vraiment de savoir lire un grand nombre ?"
      estimatedTime="8 min"
      brief={{
        tag: '🌍 Contexte',
        title: 'Les grands nombres racontent le monde.',
        body: (
          <p>
            Une population, une distance, un prix, un nombre de visiteurs : dans chaque cas, le nombre porte une
            information. Savoir le lire, c'est comprendre de quoi on parle.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Quel nombre représente la plus grande quantité ?',
          done: s1,
          content: (
            <TapQuestion
              options={CARTES}
              correct={PLUS_GRAND_INDEX}
              cols={2}
              renderOption={(c) => (
                <span className="flex items-center gap-3 w-full">
                  <span className="text-2xl shrink-0" aria-hidden="true">{c.emoji}</span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-mono text-slate-500 uppercase tracking-wide truncate">
                      {c.label}
                    </span>
                    <span className="block font-mono font-extrabold text-lg tabular-nums">
                      {formatFr(c.value)}{' '}
                      <span className="text-xs font-semibold text-slate-500">{c.unit}</span>
                    </span>
                    {carteDone && (
                      <span className="block text-[10px] font-mono text-slate-400">
                        {String(c.value).length} chiffres — {spellFr(c.value)}
                      </span>
                    )}
                  </span>
                </span>
              )}
              correctionLabel="la distance Terre – Lune (384 400 km)"
              explain={
                <>
                  La distance Terre – Lune, <strong className="font-mono">384 400 km</strong>, est la plus
                  grande quantité. Avec 105 300 et 305 000, elle fait partie des trois nombres à 6 chiffres.
                  Face à 305 000, les centaines de milliers sont égales (3 = 3) : tout se joue aux dizaines de
                  milliers, <strong className="font-mono">8 contre 0</strong>.
                </>
              }
              explainWrong={
                <>
                  Commence par repérer les nombres qui ont <strong>le plus de chiffres</strong> : 105 300,
                  384 400 et 305 000 en ont 6. Ensuite, compare-les position par position — tout se joue aux
                  dizaines de milliers, <strong className="font-mono">8 contre 0</strong>.
                </>
              }
              onAnswered={() => setCarteDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Estime avant de lire la valeur exacte',
          subtitle: "Dans la vie, on a souvent besoin d'un ordre de grandeur plutôt que du nombre exact.",
          done: s2,
          content: (
            <div className="space-y-5">
              {ESTIMATIONS.map((e, i) => (
                <div key={e.situation} className="border-2 border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden="true">{e.emoji}</span>
                    <span className="text-sm font-semibold text-slate-800">{e.situation}</span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" /> Quel ordre de grandeur te paraît réaliste ?
                  </p>
                  <TapQuestion
                    options={e.options}
                    correct={e.correct}
                    cols={3}
                    explain={e.explain}
                    solved={estimDone.includes(i)}
                    onAnswered={() => setEstimDone((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                </div>
              ))}
              {s2 && (
                <Feedback tone="info">
                  Estimer, c'est choisir le bon <strong>ordre de grandeur</strong> : des dizaines, des centaines,
                  des milliers ou des centaines de milliers. C'est exactement ce que t'indique le nombre de
                  chiffres.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Quel nombre manque ?',
          done: s3,
          content: (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Trois villages sont classés du moins peuplé au plus peuplé. Le tableau du milieu a été effacé.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Village A', value: formatFr(MANQUANT.low) },
                  { label: 'Village B', value: s3 ? formatFr(MANQUANT.options[MANQUANT.correct]) : '?' },
                  { label: 'Village C', value: formatFr(MANQUANT.high) },
                ].map((v) => (
                  <div
                    key={v.label}
                    className={`rounded-2xl border-2 p-3 text-center ${
                      v.value === '?' ? 'border-dashed border-amber-400 bg-amber-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-500 uppercase">{v.label}</div>
                    <div className="font-mono font-extrabold text-base sm:text-xl text-slate-800 tabular-nums">
                      {v.value}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">habitants</div>
                  </div>
                ))}
              </div>

              <TapQuestion
                prompt="Quel nombre peut convenir pour le village B ?"
                options={MANQUANT.options.map((o) => formatFr(o))}
                correct={MANQUANT.correct}
                cols={2}
                explain={MANQUANT.explain}
                onAnswered={() => setManqDone(true)}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
