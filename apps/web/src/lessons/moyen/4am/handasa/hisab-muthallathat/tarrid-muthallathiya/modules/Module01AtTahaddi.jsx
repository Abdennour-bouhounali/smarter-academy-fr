import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, STADIUM, REMARKS } from '../content/textbook';
import LabEvidence from '../components/LabEvidence';

/**
 * Module 1 — le تحدّ de la page d'unité (p. 115, DOUBLON DÉCLARÉ, l'entrée de la leçon) sur le clinomètre du téléphone.
 *
 * LE WORKSPACE (`clinometer`, un objectif, props dans content/textbook.js › LAB) :
 *   مبتدئ  `height`, le projecteur du stade (plateforme) : viser le sommet depuis le bord du terrain, choisir tan et ×,
 *          mesurer depuis deux distances — la même hauteur ;
 *   متقدم  `ladder`, le تحدّ : l'échelle télescopique posée à 59° allongée jusqu'à la marque de 1,60 m (encadrée à la main
 *          entre 1,8 et 1,9), puis sin et ÷ : L ≈ 1,9 m. OUVERT PAR DÉFAUT (de nouveau depuis le rétrofit du 2026-10-15 : les étapes 1–3 portent sur lui) : c'est le تحدّ que
 *          le module porte, et son `lead` nomme ses nombres.
 * Aucune étape n'attend le laboratoire (`onFinished`) : les questions portent sur la figure du manuel (LadderFigure) et
 * les essais de l'élève (`onTrial`) sont listés au-dessus d'elles ([data-activity-evidence]).
 *   1. lire la figure : 1,60 m est OPPOSÉ à 59°, l'échelle est le وتر → brique tarid-muthallath   (LP P1)
 *   2. choisir le rapport : sin (cos demande le pied, tan oublie l'échelle) → brique ikhtiyar-nisba (LP P2)
 *   3. calculer L au dixième : 1,9 (× donne 1,4 ; 1,8 est une troncature) → brique majhul-maqam       (LP P2)
 *   4. le projecteur : pourquoi les hauteurs diffèrent un peu ; le sinus refusé → brique zawiyat-nazar (LP P1)
 * « أتوقّع القاعدة » : ikhtiyar-nisba et majhul-maqam sont des RAPPELS (la méthode `hisab-tul` du درس 1 les pose déjà :
 * nommer, choisir le rapport qui les contient, multiplier ou diviser) ; la question 4 écrit h = d × tan α et sa bonne
 * option dit la règle zawiyat-nazar : elle est enveloppée dans <PredictRule id="zawiyat-nazar"> (une seule prédiction,
 * puis question et brique). La « مسألة الدرس » (même échelle, autres nombres — module 4) clôt la dernière étape : le
 * laboratoire vit dans l'`intro`, aux deux niveaux.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const isLadder = (e) => e?.mode === 'ladder';
const isHeight = (e) => e?.mode === 'height';

export default function Module01AtTahaddi() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  const [cps, setCps] = useState({});
  // les événements `checkpoint-done` du labo (questions posées par-dessus le labo) ne sont pas des essais : ils marquent les étapes faites
  const keep = (e) => {
    if (e?.tk) { if (e.tk === 'checkpoint-done') setCps((c) => ({ ...c, [e.id]: true })); return; }
    setTrials((list) => [...list, e].slice(-30));
  };
  const Trace = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule objectives={['كيف نترجم الوضعية إلى مثلث قائم؟', 'أيّ نسبة تربط المعلوم بالمجهول؟', 'كيف نحسب ارتفاعًا لا نستطيع الوصول إليه؟']} ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1} moduleTitle="التحدّ — سلّم الجدارية"
      moduleSubtitle="من السلّم الذي حصرته إلى الحساب" estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="advanced"
          levels={{
            beginner: () => (
              <Manipulation type="clinometer" level="beginner" {...LAB.beginner} lead={STADIUM.text} onTrial={keep} />
            ),
            advanced: () => (
              <Manipulation type="clinometer" level="advanced" {...LAB.advanced} lead={<MathText>{'رسّامو جدارية الحي يسندون سلّمهم إلى جدار شاقولي، وتطبيق «مقياس الميل» في الهاتف يقرأ ميله: $59^{\\circ}$ . رأس السلّم يجب أن يصل إلى العلامة على ارتفاع $1{,}60\\,\\mathrm{m}$ .'}</MathText>} onTrial={keep} />
            ),
          }}
        />
      }
      steps={[
        { num: 1, title: 'أين الارتفاع 1,60 من الزاوية 59°؟', subtitle: 'ما المقابل؟ ما الوتر؟', done: !!cps.l1,
          content: (
            <div className="space-y-3">
              <LabEvidence id="advanced-read" trials={trials} filter={isLadder} title="محاولاتك بالسلّم (المستوى المتقدّم):"
                empty="لم تحرّك السلّم بعد: في المستوى المتقدّم اسحب رأسه (⇕) على الجدار." />
              <Trace id="l1" ok={!!cps.l1}
                done={<MathText>{`أجبتَ في المختبر: ${REMARKS.muqabilWatar} المجاور هو بعد قاعدة السلّم عن الجدار، والوتر يقابل الزاوية القائمة (عند قاعدة الجدار): إنه السلّم.`}</MathText>}
                todo="في المستوى المتقدّم، حرّك السلّم حتى تحصره بين طولين، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {cps.l1 && <KnowledgeBrick id="tarid-muthallath" lead="أول خطوة في كل وضعية:" />}
            </div>
          ) },
        { num: 2, title: 'لماذا الجيب لحساب طول السلّم؟', subtitle: 'ماذا نعرف؟ وماذا نريد؟', done: !!cps.l2,
          content: (
            <div className="space-y-3">
              <LabEvidence id="advanced" trials={trials} filter={isLadder} title="محاولاتك بالسلّم (المستوى المتقدّم):"
                empty="لم تحرّك السلّم بعد: في المستوى المتقدّم اسحب رأسه (⇕) على الجدار وراقب هل يصل إلى العلامة." />
              <Trace id="l2" ok={!!cps.l2}
                done={<MathText>{`اخترتَ في المختبر $\\sin 59^{\\circ} = \\dfrac{1{,}6}{L}$ . ${REMARKS.sinChoice}`}</MathText>}
                todo="اختر في المختبر النسبة والعملية بعد أن تحصر السلّم، وأجب عن الأسئلة التي تظهر فوقه." />
              {cps.l2 && <KnowledgeBrick id="ikhtiyar-nisba" variant="rappel" lead="النسبة التي تجمع المعلوم والمطلوب:" />}
            </div>
          ) },
        { num: 3, title: 'هل يوافق الحساب ما حصرته بيدك؟', subtitle: 'قيمة مقربة إلى الجزء من 10', done: !!cps.l2,
          content: (
            <div className="space-y-3">
              <LabEvidence id="advanced-result" trials={trials} filter={isLadder} title="محاولاتك بالسلّم (المستوى المتقدّم):"
                empty="جرّب في المستوى المتقدّم: طولان متتاليان، واحد تحت العلامة وواحد فوقها، يحصران طول السلّم." />
              <Trace id="l2-calc" ok={!!cps.l2}
                done={<MathText>{`حسبتَ في المختبر طول السلّم ووجدتَه داخل المجال الذي حصرته: ${REMARKS.ladderCalc}`}</MathText>}
                todo="احسب طول السلّم في المختبر (القسمة على الجيب) بعد اختيار النسبة والعملية." />
              {cps.l2 && (
                <>
                  <KnowledgeBrick id="majhul-maqam" variant="rappel" lead="المجهول في المقام:" />
                  <p className="text-xs text-slate-600" data-misconception-note="darb"><MathText>{`خطأ شائع: ${REMARKS.darbWrong} ${REMARKS.darbWhy}`}</MathText></p>
                </>
              )}
            </div>
          ) },
        { num: 4, title: 'لماذا اختلف قياسا الكشّاف؟', subtitle: 'ارتفاع من مسافتين', done: !!q[4],
          content: (
            <div className="space-y-3">
              <LabEvidence id="beginner" trials={trials} filter={isHeight} title="قياساتك للكشّاف (المستوى المبتدئ):"
                empty="افتح المستوى المبتدئ: ضع الهاتف على خط التماس، سدّد إلى رأس الكشّاف واضغط زرّ القياس، ثم قِس من مسافة أخرى." />
              {/* La question écrit h = d × tan α et sa bonne option dit la règle : l'élève la prédit d'abord. */}
              <PredictRule id="zawiyat-nazar">
                <TapQuestion
                  prompt={<MathText>{'قاس عمر الكشّاف من $10\\,\\mathrm{m}$ فقرأ الهاتف $67^{\\circ}$ ، ثم من $30\\,\\mathrm{m}$ فقرأ $39^{\\circ}$ . بـ $h = d \\times \\tan\\alpha$ وجد $23{,}6\\,\\mathrm{m}$ ثم $24{,}3\\,\\mathrm{m}$ . لماذا يختلف الناتجان قليلا؟'}</MathText>}
                  options={[
                    'لأن الهاتف يقرأ الزاوية مدوّرة إلى الدرجة',
                    'لأن ارتفاع الكشّاف يتغيّر حسب مكان الهاتف',
                    'لأن $h = d \\times \\tan\\alpha$ لا تصلح إلا من مسافة $10\\,\\mathrm{m}$',
                    'لأن الجيب كان يجب أن يُستعمل بدل الظل',
                  ].map(M)}
                  correct={0} cols={1} requires={['ikhtiyar-nisba', 'majhul-maqam']}
                  explain={<MathText>{`${REMARKS.wobble} ${REMARKS.nisbaRight}`}</MathText>}
                  onAnswered={mark(4)} />
              </PredictRule>
              {q[4] && (
                <>
                  <KnowledgeBrick id="zawiyat-nazar" />
                  <p className="text-xs text-slate-600" data-misconception-note="nisba"><MathText>{`خطأ شائع: ${REMARKS.nisbaWrong} ${REMARKS.nisbaWhy}`}</MathText></p>
                </>
              )}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />} />
  );
}
