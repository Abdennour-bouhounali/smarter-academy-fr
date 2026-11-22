import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import SpaceFigure from '../../../../../../common/components/SpaceFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW3, KNOW_APEX } from '../content/textbook';
import {
  FIG_KNOW3_IN, FIG_KNOW3_ZERO, FIG_KNOW3_TANGENT, FIG_KNOW3_CUBOID_FACE, FIG_KNOW3_CUBOID_EDGE, FIG_KNOW3_CYL_BASE, FIG_KNOW3_CYL_AXIS,
} from '../content/figures';

/**
 * Module 2 — معارف 3 (p. 168) « المقاطع المستوية لمجسمات مألوفة », et la معرفة د) de la plateforme (pyramide et cône : la page
 * est absente du scan — `knowledge_formalization`, étiquetée « معارف من المنصّة »).
 * FORMALIZE : أ) la sphère et le tableau des quatre cas (brique maqta-kura, trois figures) ; ب) la بلاطة (titre rétabli, une
 * ligne le dit) ; جـ) la أسطوانة ; د) la pyramide et le cône (réduction de rapport SE/SA). Une question par معرفة, sur des
 * nombres neufs (ni ceux des نشاطات, ni ceux du إختبار). LP : P1–P4.
 * Rétrofit 2026-10-15 (§4quater) : module sans labo, la carte du haut ne dit plus de fait ; dans chaque étape la QUESTION vient avant la
 * brique qui la nomme (`{qN && <KnowledgeBrick/>}`, sans `requires` sur elle) — les figures et les couches du module 1 suffisent.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      objectives={["ما المقطع الذي نحصل عليه في كل حالة؟", "كيف يكتب الكتاب ما طبعته الطابعة؟", "ما مقطع الهرم أو المخروط بمستو؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المقاطع المستوية لمجسمات مألوفة"
      moduleSubtitle="ما طبعته الطابعة طبقة بعد طبقة، بكلمات الكتاب"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف — الكتاب ص 168', title: KNOW3.title, tone: 'violet',
        body: <p>أربع فقرات تضع كلمات الكتاب على طبقات الطابعة: الكرة، البلاطة، الأسطوانة، الهرم. في كل فقرة سؤال بأعداد جديدة، ثم صياغة الكتاب.</p>,
        footer: <SourceTag source={KNOW3.source} />,
      }}
      steps={[
        {
          num: 1, title: 'أ) مقطع كرة بمستو', subtitle: 'أربع حالات', done: q1,
          content: (
            <div className="space-y-3">
              <div className="grid gap-2 grid-cols-3" data-know3-sphere>
                <SpaceFigure {...FIG_KNOW3_IN} />
                <SpaceFigure {...FIG_KNOW3_ZERO} />
                <SpaceFigure {...FIG_KNOW3_TANGENT} />
              </div>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'كرة شمسية في القبة الفلكية مركزها O ونصف قطرها $10\\,\\mathrm{m}$ ، و h بعد مستو عن O. المقطع:'}</MathText></p>}
                rows={[
                  // 4 = 10 − 6 (MISC-MAQTA-TARH)
                  { id: 'h6', label: <MathText>{'$h = 6$'}</MathText>, options: ['دائرة نصف قطرها $8$', 'دائرة نصف قطرها $4$', 'دائرة كبرى نصف قطرها $10$'].map(M), correct: 0, correction: <MathText>{'$r^2 = 10^2 - 6^2 = 64$ ، إذن $r = 8$ .'}</MathText> },
                  { id: 'h0', label: <MathText>{'$h = 0$'}</MathText>, options: ['دائرة كبرى نصف قطرها $10$', 'نقطة واحدة هي O', 'دائرة نصف قطرها $20$'].map(M), correct: 0, correction: <MathText>{KNOW3.zero}</MathText> },
                  { id: 'h10', label: <MathText>{'$h = 10$'}</MathText>, options: ['نقطة واحدة (المستوي مماس)', 'لا شيء', 'دائرة كبرى'], correct: 0, correction: <MathText>{KNOW3.tangent}</MathText> },
                  { id: 'h12', label: <MathText>{'$h = 12$'}</MathText>, options: ['لا يقطع المستوي الكرة', 'نقطة واحدة', 'دائرة نصف قطرها $\\sqrt{44}$'].map(M), correct: 0, correction: <MathText>{KNOW3.outside}</MathText> },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: نقارن h بـ R، ثم نحسب بخاصية فيثاغورس.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="maqta-kura" lead="الطبقات التي طبعتها، في جدول الكتاب:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ب) مقطع بلاطة قائمة بمستو', subtitle: 'موازٍ لوجه أو لحرف', done: q2,
          content: (
            <div className="space-y-3">
              <p className="text-xs text-slate-500" data-correction>{KNOW3.cuboidRestored}</p>
              <SpaceFigure {...FIG_KNOW3_CUBOID_FACE} />
              <SpaceFigure {...FIG_KNOW3_CUBOID_EDGE} />
              <TapQuestion
                prompt={<MathText>{'علبة هاتف على شكل بلاطة قائمة أبعادها $16\\,\\mathrm{cm}$ و $9\\,\\mathrm{cm}$ و $5\\,\\mathrm{cm}$ . نقطعها بمستو موازٍ للوجه الذي بعداه $9$ و $5$ . المقطع:'}</MathText>}
                options={[
                  'مستطيل بعداه $9\\,\\mathrm{cm}$ و $5\\,\\mathrm{cm}$',
                  // le plus long côté (MISC-MAQTA-BUUD)
                  'مستطيل بعداه $16\\,\\mathrm{cm}$ و $5\\,\\mathrm{cm}$',
                  // un carré « puisque parallèle » (MISC-MAQTA-SHAKL)
                  'مربع ضلعه $9\\,\\mathrm{cm}$',
                ].map(M)}
                correct={0}
                cols={1}
                explain={<MathText>{KNOW3.cuboidFace}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="maqta-balata" lead="مثل الطبقات المتطابقة التي طبعتها في البلاطة:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'جـ) مقطعا أسطوانة الدوران', subtitle: 'موازٍ للقاعدة أو للمحور', done: q3,
          content: (
            <div className="space-y-3">
              <div className="grid gap-2 lg:grid-cols-2">
                <SpaceFigure {...FIG_KNOW3_CYL_BASE} />
                <SpaceFigure {...FIG_KNOW3_CYL_AXIS} />
              </div>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'علبة مشروب على شكل أسطوانة دوران نصف قطر قاعدتها $3\\,\\mathrm{cm}$ وارتفاعها $11\\,\\mathrm{cm}$ . مقطعها بمستو:'}</MathText></p>}
                rows={[
                  { id: 'base', label: 'موازٍ لقاعدتها', options: ['دائرة نصف قطرها $3\\,\\mathrm{cm}$', 'مستطيل أحد بعديه $11\\,\\mathrm{cm}$', 'دائرة نصف قطرها أصغر من $3\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{KNOW3.cylinderBase}</MathText> },
                  { id: 'axis', label: 'موازٍ لمحورها (يقطعها)', options: ['مستطيل أحد بعديه $11\\,\\mathrm{cm}$', 'دائرة نصف قطرها $3\\,\\mathrm{cm}$', 'مستطيل أحد بعديه $3\\,\\mathrm{cm}$'].map(M), correct: 0, correction: <MathText>{KNOW3.cylinderAxis}</MathText> },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: اتجاه المستوي يقرّر شكل المقطع.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="maqta-ustuwana" lead="دوائر متطابقة أو مستطيلات، حسب اتجاه المستوي:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'د) مقطع هرم أو مخروط', subtitle: 'معارف من المنصّة', done: q4,
          content: (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">{KNOW_APEX.note} <SourceTag source={KNOW_APEX.source} /></p>
              <TapQuestion
                prompt={<MathText>{'مخروط آيس كريم مقلوب: مخروط دوران رأسه S ونصف قطر قاعدته $6\\,\\mathrm{cm}$ . مستو موازٍ للقاعدة يقطع المحور SO في O′ حيث $\\dfrac{SO\'}{SO} = \\dfrac{1}{3}$ . نصف قطر المقطع:'}</MathText>}
                options={[
                  '$2\\,\\mathrm{cm}$',
                  // le rayon de la base (MISC-MAQTA-HARAM)
                  '$6\\,\\mathrm{cm}$',
                  // 6 × (1 − 1/3) : le rapport pris depuis la base
                  '$4\\,\\mathrm{cm}$',
                ].map(M)}
                correct={0}
                cols={3}
                explain={<MathText>{`${KNOW_APEX.cone} هنا $r = \\dfrac{1}{3} \\times 6 = 2\\,\\mathrm{cm}$ .`}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <KnowledgeBrick id="maqta-haram" lead="المربعات التي صغرت كلما صعد المستوي نحو الرأس:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
