import { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import SpaceFigure from '../../../../../../common/components/SpaceFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ARCHIMEDES, ARCH_LINES, LAB } from '../content/textbook';
import { FIG_ARCHIMEDES } from '../content/figures';

/**
 * Module 1 — l'entrée du درس : l'introduction d'Archimède (p. 163, doublon DÉCLARÉ de la page d'unité ; le livre n'a pas
 * d'activité pour ce درس), ouverte sur L'ORANGE DE BOUFARIK (orange-peel).
 *
 * REAL / DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   متقدم (ouvert par défaut : Archimède, la ressource du manuel qui ouvre ce درس) : R au dixième de 1 à 6, le verre sans
 *          graduation, la marque au douzième, puis — ouvert par l'élève après la règle — l'exemple de معارف 2 (R = 1,4) ;
 *   مبتدئ : R entier (défaut 3), le verre gradué au sixième.
 *   Dans les deux : PRÉDIRE les disques, éplucher (la peau déborde ou laisse un disque vide si la prédiction est fausse),
 *   écrire 𝒜 (πR², 2πR, 4/3·πR³ refusés) ; MARQUER le jus, presser (refus au-dessus / au-dessous des 2/3), écrire 𝒱.
 * UNDERSTAND  le texte d'Archimède et sa figure (le cylindre de hauteur 2R : volume 2πR³, aire latérale 4πR²), puis les
 *           questions sous les essais de l'élève (`onTrial`, `[data-activity-evidence]`) : 4 disques ; 2/3 du cylindre.
 * AUCUNE étape n'attend `onFinished`. LP : P1 (l'aire), P2 (le volume).
 * Rétrofit 2026-10-15 (§4quater) : le labo en tête (ni carte, ni titre/`lead` de workspace) ; les étapes interrogent ce que l'élève
 * a FAIT (pourquoi 4 disques quel que soit R, le vide de 1/3 au-dessus du jus), sans reposer ce que le labo demande ; les briques
 * APRÈS la réponse ; le texte d'Archimède et le cylindre viennent en dernier, après la découverte, pour la NOMMER.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a || 1; };
const twelfth = (m) => { const g = gcd(m, 12); return `$\\frac{${m / g}}{${12 / g}}$`; };

export default function Module01Arkhimidis() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const onTrial = (ev) => { if (ev && !ev.tk && (ev.stage === 'peel' || ev.stage === 'pour')) setTrials((s) => [...s, ev].slice(-12)); };
  const peels = trials.filter((t) => t.stage === 'peel');
  const pours = trials.filter((t) => t.stage === 'pour');

  const evidence = (list, kind) => (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence={kind} data-tried={list.length ? 'true' : 'false'}>
      {list.length === 0 ? (
        <p className="text-slate-500">{kind === 'peel' ? 'لم تقشّر البرتقالة بعد (في المناولة أعلاه).' : 'لم تعصر البرتقالة بعد (في المناولة أعلاه، بعد القشرة).'}</p>
      ) : (
        <>
          <p className="mb-1 font-bold text-slate-700">{kind === 'peel' ? 'تجاربك مع القشرة:' : 'تجاربك مع العصير:'}</p>
          <ul className="flex flex-wrap gap-1.5" data-evidence={kind}>
            {list.map((t) => (
              <li key={`${t.R}-${t.n}`} className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${t.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'}`} data-evidence-trial={t.kind}>
                <MathText>{kind === 'peel'
                  ? `$R = ${t.R.replace(',', '{,}')}\\,\\mathrm{cm}$ : توقّعت ${t.k} ${t.k === 1 ? 'قرصا' : t.k === 2 ? 'قرصين' : 'أقراص'} ${t.ok ? '✓' : '✗'}`
                  : `$R = ${t.R.replace(',', '{,}')}\\,\\mathrm{cm}$ : العلامة ${twelfth(t.m)} ${t.ok ? '✓' : '✗'}`}</MathText>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  return (
    <ContentModule
      objectives={["كم قرصا كبيرا تغطي قشرة البرتقالة؟", "إلى أيّ ارتفاع في الكأس يصل عصيرها؟", "هل يتغيّر الجواب إذا غيّرنا نصف القطر؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="أرخميدس والبرتقالة — كرة داخل أسطوانة"
      moduleSubtitle="قشرة برتقالة وعصيرها: ماذا اكتشف أرخميدس؟"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="orange-peel"
                level="beginner"
                {...LAB.beginner.numbers}
                theme="boufarik-orange"
                title="برتقالة نصف قطرها 3 cm: كم قرصا تغطي قشرتها، وأين يتوقّف عصيرها؟"
                lead={<MathText>{'نصف القطر عدد طبيعي من $1$ إلى $5$ ؛ الكأس مدرّجة إلى أسداس ارتفاعها.'}</MathText>}
                onTrial={onTrial}
              />
            ),
            advanced: () => (
              <Manipulation
                type="orange-peel"
                level="advanced"
                {...LAB.advanced.numbers}
                theme="boufarik-orange"
                title="أرخميدس: نصف القطر من 1 إلى 6 cm، ثم مثال الكتاب R = 1,4 cm"
                lead={<MathText>{'كرة نصف قطرها $R$ داخل أسطوانة ارتفاعها $2R$ (أرخميدس): القشرة ثم العصير، ثم التدوير في مثال الكتاب.'}</MathText>}
                onTrial={onTrial}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'القشرة: لماذا أربعة أقراص دائما؟', subtitle: 'مساحة الكرة', done: q1,
          content: (
            <div className="space-y-3">
              {evidence(peels, 'peel')}
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">من تجاربك مع قشرة البرتقالة:</p>}
                rows={[
                  // le nombre de disques change avec R ; la peau ne change pas
                  { id: 'R', label: <MathText>{'غيّرت $R$ فبقيت القشرة تغطي أربعة أقراص. السبب:'}</MathText>, options: ['القرص نفسه $\\pi R^2$ هو الذي يكبر أو يصغر مع $R$ ، فيبقى العدد 4', 'الكرة الكبيرة تحتاج إلى أقراص أكثر', 'مساحة القشرة لا تتغيّر أبدا'].map(M), correct: 0, correction: <MathText>{'العدد 4 لا يتغيّر: القرص نفسه $\\pi R^2$ هو الذي يكبر أو يصغر مع $R$ .'}</MathText> },
                  // le volume du cylindre ; la base seule
                  { id: 'eq', label: 'مساحة القشرة (مساحة الكرة) تساوي', options: ['حجم الأسطوانة $2\\pi R^3$', 'مساحة قاعدة الأسطوانة $\\pi R^2$', 'المساحة الجانبية للأسطوانة $4\\pi R^2$'].map(M), correct: 2, correction: <MathText>{ARCH_LINES.areaEqual}</MathText> },
                ]}
                requires={['misaha-janibiya']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: أربعة أقراص كبرى، كما وجد أرخميدس.' : 'راجع التصحيح تحت كل سطر، وأعد تجربة القشرة.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="arkhimidis-misaha" lead="ما وجدته بالقشرة، وما وجده أرخميدس:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'العصير: ماذا يبقى فارغا؟', subtitle: 'حجم الجلّة', done: q2,
          content: (
            <div className="space-y-3">
              {evidence(pours, 'pour')}
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">من تجاربك مع العصير في الكأس التي نصف قطرها R وارتفاعها 2R:</p>}
                rows={[
                  // le même rapport quel que soit R : le verre est fait sur mesure
                  { id: 'why', label: <MathText>{'غيّرت $R$ فبقيت العلامة عند الجزء نفسه من الكأس. السبب:'}</MathText>, options: ['الكأس تكبر أو تصغر مع البرتقالة بالنسبة نفسها', 'العصير يملأ نصف الكأس دائما', 'العلامة لا علاقة لها بحجم البرتقالة'], correct: 0, correction: <MathText>{'الكأس على مقاس البرتقالة دائما (نصف القطر $R$ والارتفاع $2R$ )، فالجزء الذي تملؤه الجلّة منها ثابت.'}</MathText> },
                  // le tiers vide : la moitié du jus
                  { id: 'empty', label: 'الجزء الفارغ فوق العصير، بالنسبة إلى حجم الجلّة، يساوي', options: ['نصف حجم الجلّة', 'ثلث حجم الجلّة', 'حجم الجلّة كله'], correct: 0, correction: <MathText>{'الثلث الفارغ $\\frac{1}{3} \\times 2\\pi R^3 = \\frac{2}{3}\\pi R^3$ ، ونصف حجم الجلّة $\\frac{1}{2} \\times \\frac{4}{3}\\pi R^3 = \\frac{2}{3}\\pi R^3$ : الفراغ نصف الجلّة.'}</MathText> },
                ]}
                requires={['hajm-ustuwana']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: ثلثا الأسطوانة — اكتشاف أرخميدس الثاني.' : 'راجع التصحيح تحت كل سطر، وأعد تجربة العصير.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="arkhimidis-hajm" lead="ما وجدته بالعصير، بكلمات أرخميدس:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'أرخميدس: الأسطوانة التي تحيط بالكرة', subtitle: 'كرة داخل أسطوانة', done: q3,
          content: (
            <div className="space-y-3">
              <SpaceFigure {...FIG_ARCHIMEDES} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">الأسطوانة التي توجد داخلها الكرة (نصف قطر الكرة R):</p>}
                rows={[
                  // 2R : le diamètre ; R/2 : la moitié du rayon
                  { id: 'r', label: 'نصف قطر قاعدتها', options: ['$R$', '$2R$', '$\\frac{R}{2}$'].map(M), correct: 0, correction: <MathText>{ARCH_LINES.radius}</MathText> },
                  { id: 'h', label: 'ارتفاعها', options: ['$R$', '$2R$', '$4R$'].map(M), correct: 1, correction: <MathText>{ARCH_LINES.height}</MathText> },
                  // πR³ : la hauteur R ; 4πR² : l'aire latérale (MISC-WAHDA)
                  { id: 'v', label: 'حجمها', options: ['$\\pi R^2 \\times R = \\pi R^3$', '$2\\pi R \\times 2R = 4\\pi R^2$', '$\\pi R^2 \\times 2R = 2\\pi R^3$'].map(M), correct: 2, correction: <MathText>{ARCH_LINES.volume}</MathText> },
                  // 2πR³ : le volume ; 2πR² : la hauteur R
                  { id: 'l', label: 'مساحتها الجانبية', options: ['$2\\pi R \\times 2R = 4\\pi R^2$', '$\\pi R^2 \\times 2R = 2\\pi R^3$', '$2\\pi R \\times R = 2\\pi R^2$'].map(M), correct: 0, correction: <MathText>{ARCH_LINES.lateral}</MathText> },
                ]}
                requires={['hajm-ustuwana', 'misaha-janibiya']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الأسطوانة على مقاس الكرة تماما — حجمها ومساحتها الجانبية معروفان.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="situation" text={`${ARCHIMEDES.text} ${ARCHIMEDES.setup}`} source={ARCHIMEDES.source} compact />}
              {q3 && <p className="text-xs text-slate-500" data-correction>{ARCHIMEDES.reading}</p>}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
