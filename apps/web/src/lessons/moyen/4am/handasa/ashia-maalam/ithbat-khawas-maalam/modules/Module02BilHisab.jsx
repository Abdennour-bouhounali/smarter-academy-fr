import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictRule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TRIANGLE, PERP, QUAD, CIRCLE } from '../content/textbook';

/**
 * Module 2 — نثبت بالحساب (stage `discovery` : TOUCH → FORMALIZE). Le manuel n'a pas de معارف pour cette leçon : tout
 * ce qui est posé ici est une formalisation DÉCLARÉE de la plateforme (`knowledge_formalization`, « معارف من المنصّة »),
 * rangée d'après les طرائق p. 145 et les exercices de la leçon ; l'élève l'applique tout de suite sur des nombres neufs.
 *   1. un triangle par ses trois carrés (isocèle, équilatéral, rectangle en face du plus grand)   → tabiat-muthallath (P1)
 *   2. la perpendicularité sans produit scalaire (réciproque de Pythagore)                       → taamud            (P1)
 *   3. l'échelle des quadrilatères : parallélogramme d'abord, puis diagonales / côtés            → tabiat-rubai      (P2)
 *   4. un point d'un cercle : distance au centre = rayon (pas le diamètre)                        → intima-daira      (P3)
 * « أتوقّع القاعدة » (2026-10-06) : l'encadré qui énonce la règle est enveloppé dans une PredictRule portant l'id de l'item (prompt :
 * knowledge.jsx › predictPrompt, ancré sur le laboratoire du module 1) — l'élève écrit la règle, puis lit l'encadré ; la brique qui suit ne
 * redemande rien (règle déjà établie). Rétrofit 2026-10-15 (§4quater) : la QUESTION d'abord (elle se résout avec ce que le module 1 a
 * établi), puis — APRÈS la réponse — la prédiction, l'encadré de la règle et la brique.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02BilHisab() {
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2} moduleTitle="نثبت بالحساب — معارف من المنصّة"
      moduleSubtitle="ما طلبه الفار، مكتوبا قاعدة قاعدة" objectives={['ماذا نحسب لنثبت طبيعة مثلث؟', 'كيف نثبت تعامد مستقيمين؟', 'ماذا نحسب لنثبت طبيعة رباعي أو انتماء نقطة إلى دائرة؟']} estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف من المنصّة', title: 'مثلث، رباعي، دائرة: ماذا نحسب لنثبت؟', tone: 'indigo',
        body: <p>في الملعب لم يقبل الفار إلا مساواة محسوبة وأدلة كافية. الكتاب لا يضع لهذا الدرس صفحة معارف: هذه القواعد كتبتها المنصّة من طرائق الكتاب (ص 145) وتمارينه، وتطبّقها مباشرة على نقط جديدة.</p>,
        footer: <SourceTag source={TRIANGLE.source} />,
      }}
      steps={[
        { num: 1, title: 'طبيعة مثلث', subtitle: 'ثلاثة مربعات نقارنها', done: !!q[1],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">ما طبيعة كل مثلث؟ (مربعات أطوال أضلاعه محسوبة من الإحداثيات)</p>}
                rows={[
                  { id: 't1', label: <MathText>{'$EF^2 = 20$ ، $FG^2 = 20$ ، $EG^2 = 40$'}</MathText>, options: ['قائم في F ومتساوي الساقين', 'قائم في E', 'متقايس الأضلاع'].map(M), correct: 0,
                    correction: <MathText>{'$20 + 20 = 40$ : الضلع [EG] وحده، فالزاوية القائمة في F المقابلة له؛ و $EF = FG$ .'}</MathText> },
                  { id: 't2', label: <MathText>{'$KL^2 = 13$ ، $LM^2 = 13$ ، $KM^2 = 13$'}</MathText>, options: ['متقايس الأضلاع', 'قائم في L', 'ليس مثلثا'].map(M), correct: 0,
                    correction: <MathText>{'المربعات الثلاثة متساوية: الأطوال الثلاثة $\\sqrt{13}$ ؛ و $13 + 13 \\neq 13$ فليس قائما.'}</MathText> },
                  { id: 't3', label: <MathText>{'$RS^2 = 9$ ، $ST^2 = 16$ ، $RT^2 = 20$'}</MathText>, options: ['ليس قائما ولا متساوي الساقين', 'قائم في S', 'قائم في R'].map(M), correct: 0,
                    correction: <MathText>{'أكبر مربع 20 ، و $9 + 16 = 25 \\neq 20$ : ليس قائما؛ والمربعات مختلفة: ليس متساوي الساقين.'}</MathText> },
                ]}
                requires={['qaim-fithaghuras', 'mutasawi-saqayn']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'قارنت المربعات الثلاثة كما يفعل الفار.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={mark(1)} />
              {q[1] && (
                <>
                  <PredictRule id="tabiat-muthallath"><TextbookBox kind="method" title={TRIANGLE.title} lines={TRIANGLE.lines} source={TRIANGLE.source} compact /></PredictRule>
                  <KnowledgeBrick id="tabiat-muthallath" lead="القاعدة كاملة:" />
                </>
              )}
            </div>
          ) },
        { num: 2, title: 'تعامد مستقيمين', subtitle: 'دون جداء سلمي', done: !!q[2],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'لإثبات أن $(PQ) \\perp (QR)$ ، نتحقق أن:'}</MathText>}
                options={['$QP^2 + QR^2 = PR^2$', '$PQ^2 + PR^2 = QR^2$', '$PQ = QR$', '$PR^2 + QR^2 = PQ^2$'].map(M)}
                correct={0} cols={2} requires={['tabiat-muthallath', 'qaim-fithaghuras']}
                explain={<MathText>{'المستقيمان (PQ) و (QR) يتقاطعان في Q : تعامدهما يعني أن المثلث PQR قائم في Q ، والضلع المقابل لـ Q هو [PR] ، فهو الذي يكون وحده. تساوي الطولين يجعل المثلث متساوي الساقين فقط.'}</MathText>}
                onAnswered={mark(2)} />
              {q[2] && (
                <>
                  <PredictRule id="taamud"><TextbookBox kind="definition" title={PERP.title} lines={PERP.lines} source={PERP.source} compact /></PredictRule>
                  <KnowledgeBrick id="taamud" />
                </>
              )}
            </div>
          ) },
        { num: 3, title: 'طبيعة رباعي', subtitle: 'متوازي أضلاع أولا', done: !!q[3],
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">ماذا يكفي أن نستنتج من كل دليل عن الرباعي ABCD؟</p>}
                rows={[
                  { id: 'q1', label: <MathText>{'$\\overrightarrow{AB} = \\overrightarrow{DC}$ فقط'}</MathText>, options: ['متوازي أضلاع', 'مستطيل', 'مربّع'].map(M), correct: 0,
                    correction: <MathText>{'تساوي شعاعين يثبت متوازي الأضلاع، ولا شيء أكثر.'}</MathText> },
                  { id: 'q2', label: <MathText>{'$\\overrightarrow{AB} = \\overrightarrow{DC}$ و $AC = BD$'}</MathText>, options: ['مستطيل', 'معيّن', 'مربّع'].map(M), correct: 0,
                    correction: <MathText>{'متوازي أضلاع قطراه متقايسان: مستطيل (ليقال مربّع يلزم ضلعان متتاليان متقايسان).'}</MathText> },
                  { id: 'q3', label: <MathText>{'للقطرين [AC] و [BD] نفس المنتصف، و $AB = BC$'}</MathText>, options: ['معيّن', 'مستطيل', 'مربّع'].map(M), correct: 0,
                    correction: <MathText>{'قطران متناصفان: متوازي أضلاع؛ وضلعان متتاليان متقايسان: معيّن.'}</MathText> },
                  { id: 'q4', label: <MathText>{'$AC = BD$ فقط'}</MathText>, options: ['لا يكفي لنقول إنه متوازي أضلاع', 'مستطيل', 'مربّع'].map(M), correct: 0,
                    correction: <MathText>{'قطران متقايسان وحدهما لا يكفيان: شبه منحرف متساوي الساقين مثلا قطراه متقايسان.'}</MathText> },
                ]}
                requires={['adilla-kafiya', 'tasawi-mutawazi', 'khawass-rubaiyat']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'دليل لكل خطوة: متوازي أضلاع، ثم القطران أو الضلعان.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={mark(3)} />
              {q[3] && (
                <>
                  <PredictRule id="tabiat-rubai"><TextbookBox kind="method" title={QUAD.title} lines={[...QUAD.lines, QUAD.warning]} source={QUAD.source} compact /></PredictRule>
                  <KnowledgeBrick id="tabiat-rubai" />
                </>
              )}
            </div>
          ) },
        { num: 4, title: 'نقطة على دائرة', subtitle: 'البعد عن المركز', done: !!q[4],
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<MathText>{'دائرة مركزها $\\Omega(1\\,;\\,2)$ ونصف قطرها $5$ . أيّ نقطة تنتمي إليها؟'}</MathText>}
                options={['$(4\\,;\\,6)$', '$(5\\,;\\,6)$', '$(1\\,;\\,12)$', '$(3\\,;\\,5)$'].map(M)}
                correct={0} cols={2} requires={['masafa-maalam', 'daira-nisf-qutr']}
                explain={<MathText>{'$(4 - 1)^2 + (6 - 2)^2 = 9 + 16 = 25 = 5^2$ . أما $(5\\,;\\,6)$ : $16 + 16 = 32$ ؛ و $(1\\,;\\,12)$ على بعد $10$ (القطر لا نصف القطر)؛ و $(3\\,;\\,5)$ : $4 + 9 = 13$ (مجموع الفرقين $2 + 3 = 5$ ليس المسافة).'}</MathText>}
                onAnswered={mark(4)} />
              {q[4] && (
                <>
                  <PredictRule id="intima-daira"><TextbookBox kind="definition" title={CIRCLE.title} lines={[...CIRCLE.lines, CIRCLE.trap]} source={CIRCLE.source} compact /></PredictRule>
                  <KnowledgeBrick id="intima-daira" />
                </>
              )}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />} />
  );
}
