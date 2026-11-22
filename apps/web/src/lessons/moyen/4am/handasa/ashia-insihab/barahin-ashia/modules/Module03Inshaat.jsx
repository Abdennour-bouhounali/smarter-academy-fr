import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, NOW138, CONSTRUCT } from '../content/textbook';
import LabEvidence from '../components/LabEvidence';

/**
 * Module 3 — إنشاءات (stage `manipulation`) : دوري الآن p. 138 FAIT au laboratoire `vector-chain` en mode `construct`,
 * posé SEUL sur ces nombres (`levels={false}` : c'est l'exercice du manuel, pas une exploration à deux niveaux —
 * précédent : inshaat-talis M2). Le manuel ne donne ni figure ni position de A, B, C, E : la plateforme les place sur une
 * مرصوفة (content/textbook.js › NOW138.completion, dit dans le module).
 *   1. le centre de (Γ₁) : E₁ tel que EE₁ = AB + AC (pas E₁E)       → brique insha-majmu (P3)
 *   2. le rayon de (Γ₂) : 2, comme (Γ)                              → brique surat-daira (P3)
 *   3. l'ordre des représentants ne change pas l'arrivée              (P3)
 * PROTOTYPE 2026-10-28 : les étapes 1 et 2 gardent la TRACE des questions posées PAR-DESSUS le labo (`vector-chain › CHAINS`, rubriques b0 puis b1 — la
 * règle sur l'image de la circonférence ferme la dernière) puis posent les briques, qui demandent elle-mêmes la règle. L'étape 3 reste une question d'étape.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Inshaat() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  // les questions posées PAR-DESSUS le labo (LabCheckpoint, rubriques b0 et b1) : leur trace (`checkpoint-done`) fait avancer les étapes 1 et 2
  const [cpDone, setCpDone] = useState({});
  const keep = (e) => {
    if (!e) return;
    if (e.tk) { if (e.tk === 'checkpoint-done') setCpDone((d) => ({ ...d, [e.id]: true })); return; }
    setTrials((list) => [...list, { ...e, level: 'construct' }].slice(-30));
  };

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3} objectives={['أين نصل إذا رسمنا عدّة أشعة واحدًا بعد الآخر؟', 'ماذا يحدث لنصف قطر الدائرة عند الانسحاب؟', 'هل يهمّ ترتيب الأشعة في المجموع؟']} moduleTitle="إنشاءات — صور دائرة بانسحاب"
      moduleSubtitle="دوري الآن (ص 138) على المرصوفة" estimatedTime="8 دقائق"
      intro={
        <Manipulation type="vector-chain" levels={false} {...LAB.construct} theme="metro"
          title="دوري الآن: الدوائر (Γ) و (Γ₁) و (Γ₂)" lead={<MathText>{`${NOW138.text} ${NOW138.completion}`}</MathText>} onTrial={keep} />
      }
      steps={[
        { num: 1, title: 'مركز الدائرة الأولى', subtitle: 'الممثّلات متتابعة', done: !!cpDone.b0,
          content: (
            <div className="space-y-3">
              <LabEvidence id="construct-g1" trials={trials} level="construct" title="ما أنشأته في المختبر:"
                empty="في المختبر: اسحب $\\overrightarrow{AB}$ إلى المحطة E ، ثم $\\overrightarrow{AC}$ إلى نهاية الممثّل، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {cpDone.b0 && (
                <>
                  <KnowledgeBrick id="insha-majmu" lead="ما فعله القطار على المرصوفة:" />
                  <p className="text-xs text-slate-600" data-misconception-note="insha"><MathText>{`خطأ شائع: ${CONSTRUCT.startWrong} ${CONSTRUCT.startWhy}`}</MathText></p>
                </>
              )}
            </div>
          ) },
        { num: 2, title: 'نصف قطر الصورة', subtitle: 'ماذا يحدث لطول نصف القطر؟', done: !!cpDone.b1,
          content: (
            <div className="space-y-3">
              <LabEvidence id="construct-g2" trials={trials} level="construct" title="ما أنشأته في المختبر:"
                empty="أنشئ مركز الدائرة الثانية (Γ₂) كما فعلت مع الأولى، وأجب عن أسئلتها فوق المختبر." />
              {cpDone.b1 && <KnowledgeBrick id="surat-daira" />}
            </div>
          ) },
        { num: 3, title: 'هل يهمّ الترتيب؟', subtitle: 'الدائرة الثانية', done: !!q[3],
          content: (
            <div className="space-y-3">
              <LabEvidence id="construct-g2" trials={trials} level="construct" title="ما أنشأته في المختبر:"
                empty="في المختبر، الدائرة 2: ضع الممثّلين بترتيب، ثم جرّب الترتيب الآخر بعد «تراجع»." />
              <TapQuestion
                prompt={<MathText>{'لإنشاء مركز $(\\Gamma_2)$ رسمنا من E ممثّل $\\overrightarrow{BE}$ ثم من نهايته ممثّل $\\overrightarrow{CA}$ . لو رسمنا $\\overrightarrow{CA}$ أولا ثم $\\overrightarrow{BE}$ :'}</MathText>}
                options={['نصل إلى المركز نفسه $E_2$', 'نصل إلى نقطة أخرى', 'لا يمكن: الترتيب مفروض'].map(M)}
                correct={0} cols={1} requires={['insha-majmu', 'qaidat-mutawazi']}
                explain={<MathText>{'$\\overrightarrow{BE} + \\overrightarrow{CA} = \\overrightarrow{CA} + \\overrightarrow{BE}$ : الطريقان ضلعا متوازي أضلاع لهما القطر نفسه، فيصلان إلى $E_2$ (قاعدة متوازي الأضلاع).'}</MathText>}
                onAnswered={mark(3)} />
              {q[3] && <TextbookBox kind="method" title={CONSTRUCT.title} lines={CONSTRUCT.lines} source={CONSTRUCT.source} compact />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />} />
  );
}
