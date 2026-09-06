import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ArrowRight } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { QuantityView } from '../components/UnitGrid';
import DecimalPlaceTable from '../components/DecimalPlaceTable';
import { formatDec, roundTo } from '../components/decimalUtils';

/**
 * Module 4 V2 — reconstruit sur le lesson kit. QCM en TapQuestion ; le
 * traducteur chiffre par chiffre (DecimalBuilder) reste une manipulation
 * maison, contrat kit respecté.
 */
const ETAPES_37 = [
  { q: "Combien d'UNITÉS ENTIÈRES sont complètement coloriées ?", options: ['3', '7', '10', '37'], correct: 0, explain: 'Trois unités sont entièrement coloriées.' },
  { q: 'Et combien de DIXIÈMES sont coloriés dans l\'unité incomplète ?', options: ['3', '7', '10', '37'], correct: 1, explain: 'Dans la quatrième unité, 7 parts sur 10 sont coloriées : 7 dixièmes.' },
  { q: 'Maintenant, compte TOUT en dixièmes. Combien de dixièmes as-tu en tout ?', options: ['10', '30', '37', '73'], correct: 2, explain: 'Chaque unité entière vaut 10 dixièmes : 3 × 10 = 30 dixièmes, plus les 7 dixièmes de la dernière unité, soit 37 dixièmes au total.' },
];

const TRADUCTIONS = [
  { num: 37, den: 10, value: 3.7, slots: { U: 3, d1: 7, d2: 0 }, useHundredths: false, explain: '37 dixièmes = 3 unités entières (30 dixièmes) + 7 dixièmes → 3,7.' },
  { num: 25, den: 100, value: 0.25, slots: { U: 0, d1: 2, d2: 5 }, useHundredths: true, explain: "25 centièmes, cela ne fait même pas une unité : 0 unité, 2 dixièmes (20 centièmes) et 5 centièmes → 0,25." },
  { num: 405, den: 100, value: 4.05, slots: { U: 4, d1: 0, d2: 5 }, useHundredths: true, explain: "405 centièmes = 4 unités (400 centièmes) + 5 centièmes. Il n'y a AUCUN dixième complet : la colonne des dixièmes reçoit un 0 → 4,05." },
];

function DecimalBuilder({ item, solved, onSolved, react }) {
  const [d, setD] = useState(solved ? item.slots : { U: 0, d1: 0, d2: 0 });
  const [checked, setChecked] = useState(false);

  const built = roundTo(d.U + d.d1 / 10 + d.d2 / 100);
  const isRight = d.U === item.slots.U && d.d1 === item.slots.d1 && (!item.useHundredths || d.d2 === item.slots.d2);

  const COLS = [
    { key: 'U', label: 'Unités', tone: 'bg-indigo-50 border-indigo-300 text-indigo-800' },
    { key: 'd1', label: 'Dixièmes', tone: 'bg-sky-50 border-sky-300 text-sky-800' },
    ...(item.useHundredths ? [{ key: 'd2', label: 'Centièmes', tone: 'bg-violet-50 border-violet-300 text-violet-800' }] : []),
  ];

  const bump = (key, delta) => {
    if (solved) return;
    setChecked(false);
    setD((prev) => ({ ...prev, [key]: (prev[key] + delta + 10) % 10 }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-center gap-1.5 flex-wrap">
        {COLS.map((c, i) => (
          <React.Fragment key={c.key}>
            {i === 1 && <span className="text-3xl font-extrabold text-rose-500 pb-6" aria-hidden="true">,</span>}
            <div className={`rounded-xl border-2 p-2 ${c.tone}`}>
              <div className="text-[9px] font-mono font-bold uppercase text-center tracking-wide">{c.label}</div>
              <div className="flex flex-col items-center gap-1 mt-1">
                <button type="button" onClick={() => bump(c.key, 1)} disabled={solved} aria-label={`Augmenter les ${c.label.toLowerCase()}`} className="w-8 h-7 rounded-lg bg-white/80 border border-current/20 flex items-center justify-center hover:bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <span className="font-mono font-extrabold text-2xl tabular-nums" aria-live="polite">{d[c.key]}</span>
                <button type="button" onClick={() => bump(c.key, -1)} disabled={solved} aria-label={`Diminuer les ${c.label.toLowerCase()}`} className="w-8 h-7 rounded-lg bg-white/80 border border-current/20 flex items-center justify-center hover:bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                  <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="text-center">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Écriture construite</div>
        <div className="font-mono font-extrabold text-3xl text-slate-800 tabular-nums" aria-live="polite">{formatDec(built)}</div>
      </div>

      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); react(isRight); onSolved?.(); }}>
            Valider
          </ValidateButton>
        </div>
      )}

      {checked && !isRight && (
        <Feedback tone="ko">
          Ta réponse : <strong className="font-mono">{formatDec(built)}</strong>. Bonne réponse :{' '}
          <strong className="font-mono">{formatDec(item.value)}</strong>. Repars du dénominateur :{' '}
          {item.den === 10 ? '10 dixièmes' : '100 centièmes'} font 1 unité. Combien d'unités entières peux-tu former
          avec {item.num} {item.den === 10 ? 'dixièmes' : 'centièmes'} ? Que reste-t-il ensuite ?
        </Feedback>
      )}

      {solved && <Feedback tone="ok">{item.explain}</Feedback>}
    </div>
  );
}

const TABLE_Q = {
  q: 'Dans le nombre 4,582, que représente le chiffre 5 ?',
  options: ['5 unités', '5 dixièmes', '5 centièmes', '5 millièmes'],
  correct: 1,
  explain: "Le 5 est la première position APRÈS la virgule : c'est la colonne des dixièmes. Il représente 5 dixièmes, c'est-à-dire 0,5.",
};

export default function Module04EcritureVirgule() {
  const [etapes, setEtapes] = useState([]);
  const [revele, setRevele] = useState(false);
  const [s2, setS2] = useState(false);
  const [trads, setTrads] = useState([]);

  const s1 = etapes.length === ETAPES_37.length && revele;
  const s3 = trads.length === TRADUCTIONS.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Passer à l'écriture à virgule"
      moduleSubtitle="La grande traduction : une même quantité, trois écritures qui disent la même chose."
      estimatedTime="12 min"
      brief={{
        tag: '✏️ Traduction',
        title: 'Écrire une fraction décimale autrement : avec une virgule.',
        body: (
          <p>
            Tu sais déjà représenter une quantité et l'écrire en fraction décimale. Il existe une troisième
            écriture, plus rapide — et la virgule y joue un rôle très précis.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Observe cette quantité',
          done: s1,
          content: (
            <div className="space-y-4">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">
                <QuantityView value={3.7} den={10} tone="sky" showCount={false} />
              </div>

              {ETAPES_37.map((e, i) =>
                i === 0 || etapes.includes(i - 1) ? (
                  <TapQuestion
                    key={e.q}
                    prompt={e.q}
                    options={e.options}
                    correct={e.correct}
                    cols={4}
                    requires={['dixieme', 'fraction-decimale']}
                    explain={e.explain}
                    solved={etapes.includes(i)}
                    onAnswered={() => setEtapes((d) => (d.includes(i) ? d : [...d, i]))}
                  />
                ) : null
              )}

              {etapes.length === ETAPES_37.length && !revele && (
                <ValidateButton onClick={() => setRevele(true)} tone="indigo">
                  Découvrir la nouvelle écriture <ArrowRight className="inline w-3.5 h-3.5" aria-hidden="true" />
                </ValidateButton>
              )}

              {revele && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-6 space-y-3 text-center">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Trois écritures, une seule quantité</div>
                  <div className="text-lg sm:text-xl font-mono text-sky-300"><MathText>{'$3 + \\frac{7}{10}$'}</MathText></div>
                  <div className="text-slate-500" aria-hidden="true">=</div>
                  <div className="text-lg sm:text-xl font-mono text-emerald-300"><MathText>{'$\\frac{37}{10}$'}</MathText></div>
                  <div className="text-slate-500" aria-hidden="true">=</div>
                  <div className="font-mono font-extrabold text-4xl text-amber-300">3,7</div>
                </motion.div>
              )}
              {/* Les trois écritures viennent d'être mises côte à côte : la
                  virgule peut maintenant être expliquée, pas avant. */}
              {revele && (
                <KnowledgeBrick
                  id="ecriture-virgule"
                  variant="new"
                  lead="Cette troisième écriture, celle du bas, obéit à une règle très simple."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'La virgule est une frontière',
          subtitle: "À gauche les unités entières, à droite les parts d'unité de plus en plus petites.",
          done: s2,
          content: (
            <div className="space-y-4">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 sm:p-4">
                <DecimalPlaceTable value={4.582} intPlaces={1} decPlaces={3} showValues />
              </div>

              {/* Le tableau est sous les yeux : la règle des colonnes se
                  pose ici, avant la question qui l'exige. */}
              <KnowledgeBrick
                id="colonnes-decimales"
                variant="new"
                lead="Regarde le tableau ci-dessus : il ne s'arrête pas à la virgule."
              />

              <TapQuestion
                prompt={TABLE_Q.q}
                options={TABLE_Q.options}
                correct={TABLE_Q.correct}
                cols={2}
                requires={['colonnes-decimales', 'ecriture-virgule']}
                explain={TABLE_Q.explain}
                solved={s2}
                onAnswered={() => setS2(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le traducteur : de la fraction à la virgule',
          subtitle: 'Place chaque chiffre dans la bonne colonne.',
          done: s3,
          content: (kit) => (
            <div className="space-y-8">
              {TRADUCTIONS.map((item, i) =>
                i === 0 || trads.includes(i - 1) ? (
                  <div key={item.num} className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Traduction {i + 1} / {TRADUCTIONS.length}
                    </div>
                    <div className="text-center text-3xl text-slate-800">
                      <MathText>{`$\\frac{${item.num}}{${item.den}}$`}</MathText>
                    </div>
                    <DecimalBuilder
                      item={item}
                      solved={trads.includes(i)}
                      onSolved={() => setTrads((d) => (d.includes(i) ? d : [...d, i]))}
                      react={kit.react}
                    />
                  </div>
                ) : null
              )}

              {s3 && (
                <Feedback tone="info">
                  Tu viens de rencontrer le cas le plus piégeux : <strong className="font-mono">4,05</strong>. Le
                  zéro des dixièmes n'est pas décoratif — sans lui, on écrirait 4,5, qui est une quantité bien plus
                  grande. On y revient au module 5.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Tu sais traduire une fraction décimale en écriture à
          virgule. Au module suivant, on regarde de près ce que vaut chaque chiffre — zéros
          compris.
        </KnowledgeSnapshot>
      }
    />
  );
}
