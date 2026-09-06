import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Sparkles } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { formatFr, spellFr, groupsOfThree } from '../components/numberUtils';

/**
 * Module 3 V2 — reconstruit sur le lesson kit. NumberBuilder (compteurs de
 * chiffres par colonne) et le groupement par 3 restent des manipulations
 * maison ; les QCM passent en TapQuestion.
 */

const EN_LETTRES = [
  {
    words: 'deux mille quatre cent trente-six',
    target: 2436,
    hint: "« deux mille » → 2 dans la colonne des milliers. « quatre cent » → 4 centaines. « trente-six » → 3 dizaines et 6 unités.",
  },
  {
    words: 'cinq mille quatre-vingt-six',
    target: 5086,
    hint: "Entre « cinq mille » et « quatre-vingt-six », aucune centaine n'est annoncée : la colonne des centaines reçoit un 0.",
  },
];

const COLUMNS = [
  { key: 'UM', label: 'Milliers', value: 1000, tone: 'bg-amber-50 border-amber-300 text-amber-800' },
  { key: 'C', label: 'Centaines', value: 100, tone: 'bg-violet-50 border-violet-300 text-violet-800' },
  { key: 'D', label: 'Dizaines', value: 10, tone: 'bg-sky-50 border-sky-300 text-sky-800' },
  { key: 'U', label: 'Unités', value: 1, tone: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
];

function NumberBuilder({ target, hint, onSolved, solved, react }) {
  const [d, setD] = useState({ UM: 0, C: 0, D: 0, U: 0 });
  const [checked, setChecked] = useState(false);

  const total = d.UM * 1000 + d.C * 100 + d.D * 10 + d.U;
  const isRight = total === target;

  const bump = (key, delta) => {
    if (solved) return;
    setChecked(false);
    setD((prev) => ({ ...prev, [key]: (prev[key] + delta + 10) % 10 }));
  };

  const check = () => {
    setChecked(true);
    react(isRight);
    onSolved?.();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {COLUMNS.map((c) => (
          <div key={c.key} className={`rounded-xl border-2 p-2 sm:p-3 ${c.tone}`}>
            <div className="text-[9px] sm:text-[10px] font-mono font-bold uppercase text-center tracking-wide">
              {c.label}
            </div>
            <div className="flex flex-col items-center gap-1 mt-1">
              <button
                type="button"
                onClick={() => bump(c.key, 1)}
                disabled={solved}
                aria-label={`Augmenter le chiffre des ${c.label.toLowerCase()}`}
                className="w-8 h-7 rounded-lg bg-white/80 border border-current/20 flex items-center justify-center hover:bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span
                className="font-mono font-extrabold text-2xl sm:text-3xl tabular-nums"
                aria-live="polite"
                aria-label={`${d[c.key]} ${c.label.toLowerCase()}`}
              >
                {d[c.key]}
              </span>
              <button
                type="button"
                onClick={() => bump(c.key, -1)}
                disabled={solved}
                aria-label={`Diminuer le chiffre des ${c.label.toLowerCase()}`}
                className="w-8 h-7 rounded-lg bg-white/80 border border-current/20 flex items-center justify-center hover:bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          Nombre construit
        </div>
        <div className="font-mono font-extrabold text-3xl text-slate-800 tabular-nums" aria-live="polite">
          {formatFr(total)}
        </div>
      </div>

      {!solved && <ValidateButton onClick={check}>Vérifier</ValidateButton>}

      {solved && isRight && (
        <Feedback tone="ok">
          <span className="font-mono font-bold">{formatFr(target)}</span> — chaque groupe de mots correspond à une
          colonne du nombre.
        </Feedback>
      )}
      {solved && !isRight && (
        <Feedback tone="ko">
          Ta réponse : <span className="font-mono font-bold">{formatFr(total)}</span>. La bonne réponse était{' '}
          <span className="font-mono font-bold">{formatFr(target)}</span>. {hint}
        </Feedback>
      )}
    </div>
  );
}

const EN_CHIFFRES = [
  {
    n: 7205,
    options: [
      'sept mille deux cent cinquante',
      'sept mille deux cent cinq',
      'sept cent vingt-cinq',
      'sept mille vingt-cinq',
    ],
    correct: 1,
    explain:
      "7 205 : 7 milliers, 2 centaines, 0 dizaine, 5 unités. On ne prononce pas le zéro, mais on passe directement des centaines aux unités : « deux cent cinq ».",
  },
  {
    n: 4005,
    options: [
      'quatre mille cinq',
      'quatre cent cinq',
      'quatre mille cinquante',
      'quatre mille cinq cents',
    ],
    correct: 0,
    explain:
      "4 005 : 4 milliers, aucune centaine, aucune dizaine, 5 unités. Les deux zéros ne se disent pas, mais ils tiennent les places : sans eux, on écrirait 45 !",
  },
];

const GRANDS = [
  {
    n: 3482,
    options: [
      'trois mille quatre cent vingt-huit',
      'trois cent quarante-huit mille deux',
      'trois mille quatre cent quatre-vingt-deux',
      'trois cent quatre-vingt-deux',
    ],
    correct: 2,
  },
  {
    n: 27305,
    options: [
      'vingt-sept mille trois cent cinq',
      'vingt-sept mille trente-cinq',
      'deux cent soixante-treize mille cinq',
      'vingt-sept mille trois cent cinquante',
    ],
    correct: 0,
  },
  {
    n: 405017,
    options: [
      'quarante-cinq mille dix-sept',
      'quatre cent cinq mille dix-sept',
      'quatre cent cinquante mille dix-sept',
      'quatre cent cinq mille cent soixante-dix',
    ],
    correct: 1,
  },
  {
    n: 2350700,
    options: [
      'deux millions trois cent cinq mille sept cents',
      'deux cent trente-cinq mille sept cents',
      'deux millions trois cent cinquante mille soixante-dix',
      'deux millions trois cent cinquante mille sept cents',
    ],
    correct: 3,
  },
];

const CLASS_NAMES = ['unités', 'mille', 'millions'];

function BigNumberReader({ item, onSolved, solved }) {
  const [grouped, setGrouped] = useState(false);
  const groups = groupsOfThree(item.n);
  const raw = String(item.n);

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-2xl p-5 text-center">
        {!grouped ? (
          <div className="font-mono font-extrabold text-3xl sm:text-4xl text-white tracking-tight tabular-nums">
            {raw}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center items-end gap-2 sm:gap-3 flex-wrap">
              {groups.map((g, i) => {
                const className = CLASS_NAMES[groups.length - 1 - i];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.12 }}
                    className="text-center"
                  >
                    <div
                      className={`font-mono font-extrabold text-3xl sm:text-4xl tabular-nums px-2 rounded-lg ${
                        className === 'millions'
                          ? 'text-rose-300 bg-rose-500/15'
                          : className === 'mille'
                          ? 'text-indigo-300 bg-indigo-500/15'
                          : 'text-emerald-300 bg-emerald-500/15'
                      }`}
                    >
                      {g}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1">
                      {className}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-[11px] font-mono text-slate-500 pt-1">
              Écriture française : {formatFr(item.n)}
            </p>
          </div>
        )}
      </div>

      {!grouped && (
        <ValidateButton onClick={() => setGrouped(true)} tone="slate">
          <Sparkles className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
          Grouper par 3 en partant de la droite
        </ValidateButton>
      )}

      {grouped && (
        <TapQuestion
          prompt="Comment se lit ce nombre ?"
          options={item.options}
          correct={item.correct}
          cols={1}
          solved={solved}
          explain={
            <>
              {formatFr(item.n)} se lit <strong>« {spellFr(item.n)} »</strong>. On lit chaque groupe de trois
              chiffres, puis on annonce sa classe :{' '}
              {groups.length === 3 ? 'millions, puis mille, puis les unités' : 'mille, puis les unités'}.
            </>
          }
          onAnswered={() => onSolved?.()}
        />
      )}
    </div>
  );
}

const FORMAT_Q = {
  options: ['2,350,700', '2350700', '2 350 700'],
  correct: 2,
};

export default function Module03LireEcrire() {
  const [lettresDone, setLettresDone] = useState([]);
  const [chiffresDone, setChiffresDone] = useState([]);
  const [grandsDone, setGrandsDone] = useState([]);
  const [formatRevealed, setFormatRevealed] = useState(false);

  const s1 = lettresDone.length === EN_LETTRES.length;
  const s2 = chiffresDone.length === EN_CHIFFRES.length;
  const s3 = grandsDone.length === GRANDS.length && formatRevealed;

  const mark = (setter, list, i) => setter(list.includes(i) ? list : [...list, i]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Lire et écrire les nombres"
      moduleSubtitle="Passer des mots aux chiffres, des chiffres aux mots — et apprivoiser les grands nombres."
      estimatedTime="12 min"
      brief={{
        tag: '🔤 Traduction',
        title: 'Un même nombre, deux langues : les chiffres et les mots.',
        body: (
          <p>
            Écrire un nombre, c'est traduire. Chaque groupe de mots correspond à une position, et chaque
            position correspond à un chiffre. Tu vas faire la traduction dans les deux sens.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Des mots vers les chiffres',
          done: s1,
          content: (kit) => (
            <div className="space-y-6">
              {EN_LETTRES.map((item, i) => (
                <div key={item.target} className="space-y-3">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl px-4 py-3 text-center">
                    <div className="text-[11px] font-mono text-blue-500 uppercase tracking-wider">
                      Nombre {i + 1} à écrire en chiffres
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-blue-900 italic">« {item.words} »</div>
                  </div>
                  <NumberBuilder
                    target={item.target}
                    hint={item.hint}
                    solved={lettresDone.includes(i)}
                    onSolved={() => mark(setLettresDone, lettresDone, i)}
                    react={kit.react}
                  />
                </div>
              ))}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Des chiffres vers les mots',
          done: s2,
          content: (
            <div className="space-y-6">
              {EN_CHIFFRES.map((item, i) => (
                <div key={item.n} className="space-y-3">
                  <div className="bg-slate-900 rounded-xl px-4 py-4 text-center">
                    <div className="font-mono font-extrabold text-3xl sm:text-4xl text-white tabular-nums">
                      {formatFr(item.n)}
                    </div>
                  </div>
                  <TapQuestion
                    prompt="Comment écrit-on ce nombre en lettres ?"
                    options={item.options}
                    correct={item.correct}
                    cols={1}
                    requires={['position-chiffre', 'zero-place']}
                    explain={item.explain}
                    solved={chiffresDone.includes(i)}
                    onAnswered={() => mark(setChiffresDone, chiffresDone, i)}
                  />
                </div>
              ))}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Lire les grands nombres',
          subtitle: 'Les chiffres se lisent par groupes de trois, en partant de la droite.',
          done: s3,
          content: (
            <div className="space-y-8">
              {GRANDS.map((item, i) => (
                <div key={item.n} className="space-y-3">
                  <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Nombre {i + 1} / {GRANDS.length} — {String(item.n).length} chiffres
                  </div>
                  <BigNumberReader
                    item={item}
                    solved={grandsDone.includes(i)}
                    onSolved={() => mark(setGrandsDone, grandsDone, i)}
                  />
                </div>
              ))}

              {grandsDone.length === GRANDS.length && (
                <div className="space-y-5 border-t border-slate-200 pt-5">
                  {/* Le groupement par 3 vient d'être fait à la main sur quatre
                      nombres : le mot « classe » se pose ici, pas plus tôt. */}
                  <KnowledgeBrick
                    id="classe-trois"
                    variant="new"
                    lead="Les paquets de trois chiffres que tu viens de former portent un nom."
                  />
                  <KnowledgeBrick
                    id="ecriture-francaise"
                    variant="new"
                    lead="Reste à savoir ce qu'on écrit entre ces paquets."
                  />
                  <TapQuestion
                    prompt="Quelle est l'écriture correcte de ce nombre en français ?"
                    options={FORMAT_Q.options}
                    correct={FORMAT_Q.correct}
                    cols={3}
                    requires={['classe-trois', 'ecriture-francaise']}
                    explain={
                      <>
                        En français, on sépare les classes par une <strong>espace</strong> :{' '}
                        <span className="font-mono font-bold">2 350 700</span>. La virgule est réservée aux
                        nombres décimaux, et tout coller rend le nombre illisible.
                      </>
                    }
                    onAnswered={() => setFormatRevealed(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Tu sais lire et écrire un grand nombre. Au module suivant, on
          regarde de plus près ce que vaut vraiment chacun de ses chiffres.
        </KnowledgeSnapshot>
      }
    />
  );
}
