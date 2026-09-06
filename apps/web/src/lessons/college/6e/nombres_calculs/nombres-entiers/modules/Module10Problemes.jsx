import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Building2, Search } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NumberLine from '../../../../../common/components/NumberLine';
import PlaceValueTable from '../components/PlaceValueTable';
import { Feedback, ValidateButton, NumberField } from '../../../../../common/components/LessonUI';
import { formatFr, texFr, parseFr } from '../components/numberUtils';

/**
 * Module 10 V2 — reconstruit sur le lesson kit. Les QCM des problèmes
 * passent en TapQuestion, les saisies en NumericQuestion (avec feedback
 * ciblé sur les pièges) ; le nombre mystère reste un puzzle maison avec
 * plafond de 3 essais (jamais bloquant).
 */

const P1 = [
  {
    type: 'mcq',
    q: 'Quelle bibliothèque possède le plus de livres ?',
    options: ['La bibliothèque Centre (12 450 livres)', 'La bibliothèque Parc (9 875 livres)'],
    correct: 0,
    cols: 2,
    explain:
      "12 450 a 5 chiffres, 9 875 en a 4 : la bibliothèque Centre possède plus de livres. C'est visible sans poser le moindre calcul.",
  },
  {
    type: 'mcq',
    q: 'Comment peux-tu le savoir sans faire de calcul long ?',
    options: [
      'En comparant le nombre de chiffres : 5 chiffres contre 4',
      'En comparant les chiffres des unités : 0 et 5',
      "En additionnant les chiffres de chaque nombre",
      'En regardant lequel est écrit en premier',
    ],
    correct: 0,
    explain:
      "Un nombre à 5 chiffres dépasse 10 000, un nombre à 4 chiffres reste sous 10 000. La comparaison est réglée avant même de regarder les chiffres un par un.",
  },
  {
    type: 'input',
    q: 'Combien y a-t-il de milliers dans 12 450 ?',
    prefix: 'Nombre de milliers :',
    answer: 12,
    explain: '12 450 contient 12 milliers entiers (12 000), plus 450 en plus.',
    wrongHint: (n) =>
      n === 2
        ? "2 est le chiffre des milliers, celui qui occupe la colonne. Mais combien de milliers entiers tiennent dans 12 450 ? Pense à 12 000."
        : "cherche combien de fois 1 000 tient dans 12 450 : 12 000 y tient, 13 000 non.",
  },
  {
    type: 'mcq',
    q: 'Entre quels milliers se trouve 9 875 ?',
    options: ['8 000 et 9 000', '9 000 et 10 000', '9 800 et 9 900', '9 000 et 9 875'],
    correct: 1,
    cols: 2,
    explain:
      "9 875 contient 9 milliers entiers et n'atteint pas le dixième : 9 000 < 9 875 < 10 000. C'est pour cela qu'il reste un nombre à 4 chiffres.",
  },
];

const COMMUNES = [
  { nom: 'Belleroche', pop: 47080, ecrit: 'chiffres' },
  { nom: 'Saint-Amaury', pop: 47800, ecrit: 'chiffres' },
  { nom: 'Villeneuve', pop: 8500, ecrit: 'lettres', mots: 'huit mille cinq cents' },
];

const P2 = [
  {
    type: 'input',
    q: "La population de Villeneuve est donnée en lettres : « huit mille cinq cents ». Écris-la en chiffres.",
    answer: 8500,
    explain: 'huit mille cinq cents = 8 500.',
    wrongHint: () =>
      '« huit mille » → 8 dans la colonne des milliers ; « cinq cents » → 5 centaines ; aucune dizaine, aucune unité.',
  },
  {
    type: 'mcq',
    q: 'Classe les trois communes de la moins peuplée à la plus peuplée.',
    options: [
      'Villeneuve < Belleroche < Saint-Amaury',
      'Villeneuve < Saint-Amaury < Belleroche',
      'Belleroche < Villeneuve < Saint-Amaury',
      'Saint-Amaury < Belleroche < Villeneuve',
    ],
    correct: 0,
    explain:
      "Villeneuve (8 500) a 4 chiffres : c'est la plus petite. Entre 47 080 et 47 800, les dizaines de milliers et les milliers sont égaux (4 et 7) : tout se joue aux centaines, 0 contre 8. Donc 47 080 < 47 800.",
  },
  {
    type: 'mcq',
    q: 'Un journal titre : « Belleroche approche des 50 000 habitants ». Ce titre est-il justifié ?',
    options: [
      'Oui : 47 080 est compris entre 40 000 et 50 000, assez près de 50 000',
      'Non : 47 080 est plus proche de 40 000 que de 50 000',
      "Non : 47 080 dépasse déjà 50 000",
      'Impossible à dire sans connaître les autres communes',
    ],
    correct: 0,
    explain:
      "40 000 < 47 080 < 50 000, et 47 080 est nettement au-delà de la moitié de cet intervalle (45 000) : le titre est acceptable. Encadrer permet de juger une affirmation sans calcul.",
  },
];

function ProblemQuestion({ item, index, total, solved, onSolved }) {
  return (
    <div className="space-y-3 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
      <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
        Question {index} / {total}
      </div>
      {item.type === 'mcq' ? (
        <TapQuestion
          prompt={item.q}
          options={item.options}
          correct={item.correct}
          cols={item.cols || 1}
          requires={['comparer-methode', 'valeur-position', 'chiffre-vs-nombre', 'encadrer']}
          explain={item.explain}
          solved={solved}
          onAnswered={() => onSolved?.()}
        />
      ) : (
        <NumericQuestion
          prompt={item.q}
          prefix={item.prefix}
          expected={item.answer}
          parse={parseFr}
          requires={['valeur-position', 'chiffre-vs-nombre', 'recomposer']}
          explain={item.explain}
          explainFor={item.wrongHint}
          solved={solved}
          onAnswered={() => onSolved?.()}
        />
      )}
    </div>
  );
}

/* ── Problème 3 — le nombre mystère (puzzle à plafond d'essais) ───── */
const MYSTERE = 6307;

const INDICES = [
  { texte: "C'est un nombre entier de 4 chiffres.", test: (n) => String(n).length === 4 },
  { texte: 'Son chiffre des milliers est 6.', test: (n) => Math.floor(n / 1000) % 10 === 6 },
  { texte: 'Il est compris entre 6 300 et 6 400.', test: (n) => n > 6300 && n < 6400 },
  { texte: 'Son chiffre des dizaines est 0.', test: (n) => Math.floor(n / 10) % 10 === 0 },
  { texte: 'Son chiffre des unités est 7.', test: (n) => n % 10 === 7 },
];

const MYSTERE_MAX_ATTEMPTS = 3;

function NombreMystere({ solved, onSolved, react }) {
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);

  const check = () => {
    const n = parseFr(val);
    if (Number.isNaN(n)) {
      setFb({ tone: 'hint', msg: 'Écris un nombre entier, en chiffres.' });
      return;
    }
    const failed = INDICES.findIndex((i) => !i.test(n));
    react(failed === -1);
    if (failed === -1) {
      setFb(null);
      onSolved?.();
      return;
    }
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (nextAttempts >= MYSTERE_MAX_ATTEMPTS) {
      // Jamais bloquer indéfiniment sur un puzzle de déduction : après
      // quelques essais, on révèle la réponse et on laisse continuer.
      setGaveUp(true);
      setFb(null);
      onSolved?.();
      return;
    }
    setFb({
      tone: 'ko',
      msg: (
        <>
          <strong className="font-mono">{formatFr(n)}</strong> ne respecte pas l'indice {failed + 1} :{' '}
          <em>{INDICES[failed].texte}</em> Reprends les indices dans l'ordre, ils remplissent le tableau
          colonne par colonne. ({MYSTERE_MAX_ATTEMPTS - nextAttempts} essai
          {MYSTERE_MAX_ATTEMPTS - nextAttempts > 1 ? 's' : ''} avant de voir la réponse.)
        </>
      ),
    });
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {INDICES.map((ind, i) => (
          <li key={ind.texte} className="flex items-start gap-2.5 text-sm text-slate-700">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span>{ind.texte}</span>
          </li>
        ))}
      </ul>

      {solved ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <Feedback tone={gaveUp ? 'hint' : 'ok'}>
            {gaveUp ? (
              <>
                Pas grave, on te le donne : le nombre mystère est{' '}
                <strong className="font-mono">{formatFr(MYSTERE)}</strong>.{' '}
              </>
            ) : (
              <>
                Le nombre mystère est <strong className="font-mono">{formatFr(MYSTERE)}</strong>.{' '}
              </>
            )}
            Chaque indice remplissait une colonne du tableau de numération : relis-les un par un en regardant
            le tableau ci-dessous, colonne par colonne.
          </Feedback>
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-3">
            <PlaceValueTable value={MYSTERE} showValues dimZeros />
          </div>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-700">Le nombre mystère est :</span>
            <NumberField
              value={val}
              onChange={(v) => {
                setVal(v);
                setFb(null);
              }}
              onEnter={check}
              ariaLabel="Nombre mystère"
              width="w-36"
              size="sm"
            />
            <ValidateButton onClick={check} disabled={!val} tone="slate">
              Vérifier
            </ValidateButton>
          </div>
          {fb && <Feedback tone={fb.tone}>{fb.msg}</Feedback>}
        </>
      )}
    </div>
  );
}

const MYSTERE_SUITE = {
  q: 'Entre quelles centaines se trouve le nombre mystère ?',
  options: ['6 000 et 7 000', '6 300 et 6 400', '6 300 et 6 307', '6 307 et 6 400'],
  correct: 1,
  cols: 2,
  explain:
    "Les centaines rondes qui encadrent 6 307 sont 6 300 et 6 400 : on écrit 6 300 < 6 307 < 6 400. 6 000 et 7 000 sont des milliers, pas des centaines.",
};

export default function Module10Problemes() {
  const [p1, setP1] = useState([]);
  const [p2, setP2] = useState([]);
  const [mystereDone, setMystereDone] = useState(false);
  const [suiteDone, setSuiteDone] = useState(false);

  const s1 = p1.length === P1.length;
  const s2 = p2.length === P2.length;
  const s3 = mystereDone && suiteDone;

  const mark = (setter, i) => setter((d) => (d.includes(i) ? d : [...d, i]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(10)}
      moduleNumber={10}
      moduleTitle="Problèmes : choisir et interpréter"
      moduleSubtitle="Trois problèmes où l'essentiel n'est pas de calculer, mais de comprendre ce que disent les nombres."
      estimatedTime="12 min"
      brief={{
        tag: '🧠 Résolution',
        title: "Comprendre un nombre, c'est déjà résoudre le problème.",
        body: (
          <p>
            Aucun de ces problèmes ne demande une opération compliquée. Ce qu'on te demande, c'est de{' '}
            <strong className="text-white">lire, comparer, encadrer et interpréter</strong>.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Problème 1 — Les deux bibliothèques',
          subtitle: 'Niveau : découverte',
          done: s1,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { nom: 'Bibliothèque Centre', n: 12450 },
                  { nom: 'Bibliothèque Parc', n: 9875 },
                ].map((b) => (
                  <div key={b.nom} className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-center">
                    <BookOpen className="w-5 h-5 mx-auto text-slate-400 mb-1" aria-hidden="true" />
                    <div className="text-[10px] font-mono text-slate-500 uppercase">{b.nom}</div>
                    <div className="font-mono font-extrabold text-xl sm:text-2xl text-slate-800 tabular-nums">
                      {formatFr(b.n)}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">livres</div>
                  </div>
                ))}
              </div>

              {P1.map((item, i) =>
                i === 0 || p1.includes(i - 1) ? (
                  <ProblemQuestion
                    key={item.q}
                    item={item}
                    index={i + 1}
                    total={P1.length}
                    solved={p1.includes(i)}
                    onSolved={() => mark(setP1, i)}
                  />
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Problème 2 — Les trois communes',
          subtitle: 'Niveau : intermédiaire',
          done: s2,
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {COMMUNES.map((c) => (
                  <div key={c.nom} className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center">
                    <Building2 className="w-4 h-4 mx-auto text-slate-400 mb-1" aria-hidden="true" />
                    <div className="text-[10px] font-mono text-slate-500 uppercase">{c.nom}</div>
                    <div className="font-mono font-bold text-base text-slate-800 tabular-nums">
                      {c.ecrit === 'lettres' ? (
                        <span className="text-sm italic font-sans text-slate-600">« {c.mots} »</span>
                      ) : (
                        formatFr(c.pop)
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">habitants</div>
                  </div>
                ))}
              </div>

              {P2.map((item, i) =>
                i === 0 || p2.includes(i - 1) ? (
                  <ProblemQuestion
                    key={item.q}
                    item={item}
                    index={i + 1}
                    total={P2.length}
                    solved={p2.includes(i)}
                    onSolved={() => mark(setP2, i)}
                  />
                ) : null
              )}

              {s2 && (
                <div className="space-y-2">
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
                    <NumberLine
                      min={40000}
                      max={50000}
                      step={1000}
                      labelEvery={5}
                      markers={[
                        { value: 47080, label: 'B', color: '#7c3aed' },
                        { value: 47800, label: 'S', color: '#059669' },
                      ]}
                      ariaLabel="Position des deux communes entre 40 000 et 50 000"
                    />
                  </div>
                  <div className="flex justify-center gap-4 text-[11px] font-mono text-slate-500">
                    <span className="text-violet-600 font-bold">B = Belleroche (47 080)</span>
                    <span className="text-emerald-600 font-bold">S = Saint-Amaury (47 800)</span>
                  </div>
                  <p className="text-xs text-slate-500 text-center font-mono">
                    <MathText>{`$${texFr(40000)} < ${texFr(47080)} < ${texFr(47800)} < ${texFr(50000)}$`}</MathText>
                  </p>
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Problème 3 — Le nombre mystère',
          subtitle: 'Niveau : expert',
          done: s3,
          content: (kit) => (
            <div className="space-y-5">
              <div className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <Search className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />
                <span>
                  Un nombre a été effacé du registre. Il ne reste que cinq indices. Aucun calcul n'est
                  nécessaire : chaque indice te donne une information sur une position.
                </span>
              </div>

              <NombreMystere solved={mystereDone} onSolved={() => setMystereDone(true)} react={kit.react} />

              {mystereDone && (
                <div className="border-t border-slate-100 pt-4">
                  <TapQuestion
                    prompt={MYSTERE_SUITE.q}
                    options={MYSTERE_SUITE.options}
                    correct={MYSTERE_SUITE.correct}
                    cols={MYSTERE_SUITE.cols}
                    requires={['encadrer', 'position-chiffre']}
                    explain={MYSTERE_SUITE.explain}
                    solved={suiteDone}
                    onAnswered={() => setSuiteDone(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={10}>
          <strong>La suite.</strong> Aucune connaissance nouvelle ici : tu as choisi toi-même
          quoi sortir de ta carte. Le Grand Défi t'attend.
        </KnowledgeSnapshot>
      }
    />
  );
}
