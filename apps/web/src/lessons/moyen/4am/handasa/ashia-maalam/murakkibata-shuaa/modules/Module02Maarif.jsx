import { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW2, KNOW3, KNOW_ORIGIN, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_KNOW1, FIG_KNOW2, FIG_KNOW3, FIG_READ } from '../content/figures';

/**
 * Module 2 — معارف (pp. 142 et 144).
 * FORMALIZE : 1) la lecture graphique (معارف 3 أ : AB « +7 puis +3 », CD « −5 puis +1 », brique qiraa-bayaniya), essayée
 * sur deux flèches de la plateforme ; 2) OM ↔ M(x ; y) (معارف 1 et la نتيجة, brique murakkibata-om ; la coquille
 * « (2,5 ; -3-) » corrigée en une ligne) ; 3) les quatre معالم (معارف 2, brique anwa-maalim), quatre vignettes.
 * LP : P1, P2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const col = (a, b) => `$\\begin{pmatrix} ${a} \\\\ ${b} \\end{pmatrix}$`;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — مركبتا شعاع في معلم"
      moduleSubtitle="ما كتبته في تطبيق التوصيل، بكلمات الكتاب"
      objectives={['كيف يسمّي الكتاب العددين اللذين كتبتهما؟', 'كيف نقرأ مركبتي شعاع على تمثيل بياني؟', 'ما أنواع المعالم؟']} estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 142 و 144', title: KNOW3.title, tone: 'violet',
        body: <p>ثلاث محطات: قراءة شعاع على الشبكة، ثم شعاع مبدؤه O، ثم أنواع المعالم.</p>,
        footer: <SourceTag source={KNOW3.source} />,
      }}
      steps={[
        {
          num: 1, title: 'القراءة في تمثيل بياني', subtitle: 'معارف 3 — أ)', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="example" text="على شبكة المنصّة: اقرأ مركبتي كل شعاع." source={PLATFORM_SOURCE} compact />
              <GeoFigure {...FIG_READ} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">مركبتا كل شعاع:</p>}
                rows={[
                  // (3 ; 4) : échangé ; (0 ; 1) : les coordonnées de F
                  { id: 'EF', label: <MathText>{'$\\overrightarrow{EF}$'}</MathText>, options: [col(4, 3), col(3, 4), col(0, 1)].map(M), correct: 0, correction: <MathText>{'من E: 4 وحدات نحو اليمين ثم 3 نحو الأعلى.'}</MathText> },
                  // (2 ; 4) : les signes oubliés ; (2 ; −1) : les coordonnées de H
                  { id: 'GH', label: <MathText>{'$\\overrightarrow{GH}$'}</MathText>, options: [col(-2, -4), col(2, 4), col(2, -1)].map(M), correct: 0, correction: <MathText>{'من G: وحدتان نحو اليسار ($-2$) ثم 4 نحو الأسفل ($-4$).'}</MathText> },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الأفقي أولا ثم العمودي، والإشارة تقول الجهة.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="definition" text={KNOW3.intro} source={KNOW3.source} compact />}
              {q1 && <GeoFigure {...FIG_KNOW3} />}
              {q1 && <KnowledgeBrick id="qiraa-bayaniya" lead="الطريقة التي اتّبعها سائقك، بكلمات الكتاب:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'مركبتا الشعاع OM', subtitle: 'معارف 1 والنتيجة', done: q2,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW1} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">في معلم مبدؤه O:</p>}
                rows={[
                  { id: 'ON', label: <MathText>{'$N(5\\,;\\,-1)$ ، مركبتا $\\overrightarrow{ON}$'}</MathText>, options: [col(5, -1), col(-1, 5), col(-5, 1)].map(M), correct: 0, correction: <MathText>{'مركبتا $\\overrightarrow{ON}$ هما إحداثيتا N بنفس الترتيب.'}</MathText> },
                  { id: 'P', label: <MathText>{'$\\overrightarrow{OP}\\begin{pmatrix} -2 \\\\ 0 \\end{pmatrix}$ ، النقطة P'}</MathText>, options: ['على محور الفواصل، على يسار O', 'على محور التراتيب، تحت O', 'هي O نفسها'], correct: 0, correction: <MathText>{'$P(-2\\,;\\,0)$ : ترتيبها 0.'}</MathText> },
                  // le vecteur AB n'a pas pour composantes les coordonnées de B (MISC-MAALAM-IHDATHIYAT-MURAKKIBAT)
                  { id: 'AB', label: <MathText>{'$A(1\\,;\\,1)$ و $B(4\\,;\\,3)$ ، مركبتا $\\overrightarrow{AB}$'}</MathText>, options: [col(3, 2), col(4, 3), col(1, 1)].map(M), correct: 0, correction: <MathText>{'المبدأ A ليس O: من A نسير 3 نحو اليمين ثم 2 نحو الأعلى، فليست المركبتان إحداثيتي B.'}</MathText> },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الإحداثيتان والمركبتان تتساويان فقط عندما يكون المبدأ O.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="murakkibata-om" lead="كما في طلب المستودع: من O، الكود هو العنوان." />}
              {q2 && <TextbookBox kind="example" text={KNOW_ORIGIN.example} source={KNOW_ORIGIN.source} compact />}
              {q2 && <p className="text-xs text-slate-500" data-correction><MathText>{KNOW_ORIGIN.correction}</MathText></p>}
            </div>
          ),
        },
        {
          num: 3, title: 'أنواع المعالم', subtitle: 'معارف 2', done: q3,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="definition" text={KNOW2.text} source={KNOW2.source} compact />
              <div className="grid gap-2 grid-cols-2" data-maalim-grid>
                {KNOW2.cases.map((c) => (
                  <div key={c.id} className="rounded-xl border border-violet-200 bg-white p-2" data-maalim={c.id}>
                    <p className="text-center text-sm font-bold text-violet-900">{c.name}</p>
                    <GeoFigure {...FIG_KNOW2[c.id]} />
                    <p className="text-center text-xs text-slate-600"><MathText>{c.conditions.join(' ، ')}</MathText></p>
                  </div>
                ))}
              </div>
              <KnowledgeBrick id="anwa-maalim" lead="الشبكة التي سار فيها سائقك معلم متعامد ومتجانس:" />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'ما نوع المعلم $(O\\,;\\,I\\,,J)$ ؟'}</MathText></p>}
                rows={[
                  { id: 'r1', label: <MathText>{'$OI = OJ = 1$ و $(OI) \\perp (OJ)$'}</MathText>, options: KNOW2.cases.map((c) => c.name), correct: 0, correction: 'وحدتان متساويتان ومحوران متعامدان: معلم متعامد ومتجانس.' },
                  { id: 'r2', label: <MathText>{'$OI = 1$ و $OJ = 2$ و $(OI) \\perp (OJ)$'}</MathText>, options: KNOW2.cases.map((c) => c.name), correct: 1, correction: 'محوران متعامدان لكن الوحدتان مختلفتان: معلم متعامد.' },
                  { id: 'r3', label: <MathText>{'$OI = OJ$ والمحوران غير متعامدين'}</MathText>, options: KNOW2.cases.map((c) => c.name), correct: 2, correction: 'وحدتان متساويتان فقط: معلم متجانس.' },
                ]}
                requires={['anwa-maalim']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: «متعامد» يخصّ المحورين، و«متجانس» يخصّ الوحدتين.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
