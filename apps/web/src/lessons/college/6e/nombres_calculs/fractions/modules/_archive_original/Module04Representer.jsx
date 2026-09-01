import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartitionShape from '../components/PartitionShape';
import FractionBuilder from '../components/FractionBuilder';
import { texFrac } from '../components/fractionUtils';

/* ─── Direction A : fraction → représentation ────────────────────── */
const A_CONSTRUIRE = [
  { num: 3, den: 5, shape: 'bar', tone: 'sky' },
  { num: 5, den: 8, shape: 'circle', tone: 'amber' },
];

function ConstruireDepuisFraction({ item, solved, onSolved }) {
  const [cells, setCells] = useState([]);
  const isRight = cells.length === item.num;

  const toggle = (i) => {
    if (solved) return;
    setCells((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort((a, b) => a - b)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <span>
          Colorie <MathText>{`$${texFrac(item.num, item.den)}$`}</MathText> de cette figure.
        </span>
      </div>
      <PartitionShape shape={item.shape} parts={item.den} cells={cells} onToggle={toggle} tone={item.tone} size="md" />
      <p className="text-center text-sm font-mono text-slate-500">
        {cells.length} / {item.den} coloriées
      </p>
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => isRight && onSolved?.()} disabled={!isRight}>
            Valider
          </ValidateButton>
        </div>
      )}
      {solved && (
        <Feedback tone="ok">
          <MathText>{`$${texFrac(item.num, item.den)}$`}</MathText> représenté correctement.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Direction B : représentation → fraction ────────────────────── */
const B_LIRE = [
  { num: 4, den: 6, shape: 'bar', tone: 'violet', denOptions: [4, 6, 10] },
  { num: 2, den: 3, shape: 'circle', tone: 'emerald', denOptions: [2, 3, 5] },
];

function LireVersFraction({ item, solved, onSolved }) {
  return (
    <div className="space-y-4">
      <PartitionShape shape={item.shape} parts={item.den} shaded={item.num} tone={item.tone} size="md" />
      <p className="text-sm text-slate-600 text-center">Quelle fraction cette figure représente-t-elle ?</p>
      <FractionBuilder
        targetNum={item.num}
        targetDen={item.den}
        denOptions={item.denOptions}
        solved={solved}
        onSolved={onSolved}
        hint="Compte les parts coloriées pour le numérateur, puis le nombre total de parts égales pour le dénominateur."
      />
    </div>
  );
}

/* ─── Bonus : la même quantité, deux écritures ───────────────────── */
function EquivalenceBonus({ solved, onSolved }) {
  const [split, setSplit] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Regarde cette moitié coloriée. Que se passe-t-il si on partage <strong>chaque moitié</strong> en 2 ?
      </p>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <PartitionShape shape="bar" parts={split ? 4 : 2} cells={split ? [0, 1] : [0]} tone="sky" size="lg" />
        <div className="text-center text-2xl">
          <MathText>{split ? '$\\frac{2}{4}$' : '$\\frac{1}{2}$'}</MathText>
        </div>
      </div>

      {!split ? (
        <div className="text-center">
          <ValidateButton onClick={() => setSplit(true)} tone="indigo">
            <Sparkles className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            Repartager chaque moitié en 2
          </ValidateButton>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <Feedback tone="info">
            La surface coloriée n'a pas changé — seul le découpage est plus fin. La quantité coloriée valait{' '}
            <MathText>{'$\\frac{1}{2}$'}</MathText>, elle vaut toujours la même chose maintenant qu'on la nomme{' '}
            <MathText>{'$\\frac{2}{4}$'}</MathText>.
          </Feedback>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Deux écritures, une seule quantité
            </div>
            <div className="text-2xl font-mono font-extrabold text-amber-300">
              <MathText>{'$\\frac{1}{2} = \\frac{2}{4}$'}</MathText>
            </div>
          </div>
          {!solved && (
            <div className="text-center">
              <ValidateButton onClick={() => onSolved?.()}>J'ai compris</ValidateButton>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function Module04Representer() {
  const navLinks = getNavLinks(4);
  const [aDone, setADone] = useState([]);
  const [bDone, setBDone] = useState([]);
  const [bonusDone, setBonusDone] = useState(false);

  const s1 = aDone.length === A_CONSTRUIRE.length;
  const s2 = bDone.length === B_LIRE.length;
  const s3 = bonusDone;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Lire et représenter"
      moduleSubtitle="De l'image à la fraction, et de la fraction à l'image."
      moduleNumber={4}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🔁 Aller-retour" title="Savoir aller dans les deux sens.">
          <p>
            Parfois on te donne une fraction et tu dois la dessiner. Parfois on te donne un dessin et tu dois
            trouver la fraction. Il faut maîtriser les deux sens.
          </p>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard num={1} title="De la fraction vers le dessin" done={s1}>
          <div className="space-y-8">
            {A_CONSTRUIRE.map((item, i) =>
              i === 0 || aDone.includes(i - 1) ? (
                <ConstruireDepuisFraction
                  key={`${item.num}-${item.den}`}
                  item={item}
                  solved={aDone.includes(i)}
                  onSolved={() => setADone((d) => (d.includes(i) ? d : [...d, i]))}
                />
              ) : null
            )}
          </div>
        </StepCard>

        {/* Étape 2 */}
        <StepCard num={2} title="Du dessin vers la fraction" done={s2} locked={!s1}>
          <div className="space-y-8">
            {B_LIRE.map((item, i) =>
              i === 0 || bDone.includes(i - 1) ? (
                <LireVersFraction
                  key={`${item.num}-${item.den}`}
                  item={item}
                  solved={bDone.includes(i)}
                  onSolved={() => setBDone((d) => (d.includes(i) ? d : [...d, i]))}
                />
              ) : null
            )}
          </div>
        </StepCard>

        {/* Étape 3 — bonus équivalence */}
        <StepCard num={3} title="Bonus : la même quantité peut avoir deux noms" done={s3} locked={!s2}>
          <EquivalenceBonus solved={bonusDone} onSolved={() => setBonusDone(true)} />
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
