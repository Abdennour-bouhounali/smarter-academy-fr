import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE } from '../content/textbook';
import { FIGURES } from '../content/figures';

/**
 * Module 2 — معارف : chaque encadré NOMME ce que l'élève vient de trouver dans le حوش (question → encadré → brique), avec les mots de la
 * plateforme (guide §4ter-bis) : la surface et son aire, le bord et son périmètre (P1), les trois situations de deux surfaces — même aire
 * seulement, même périmètre seulement, les deux (P3). Les couples de figures sont ceux de la plateforme (content/figures.js) ; l'aire et le
 * périmètre de chacun sont recalculés dans ../content/content.test.js. La carte « لماذا السداسي؟ » (le rayon de miel) clôt le module. LP : P1, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Figs = ({ id }) => (
  <div className="flex flex-wrap items-start justify-center gap-4" data-module-figures={id}>
    {FIGURES[id].map((fig, i) => <GeoFigure key={i} {...fig} maxWidth={250} />)}
  </div>
);

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  return (
    <ContentModule
      objectives={['من يريد معرفة المحيط ومن يريد معرفة المساحة؟', 'ماذا يتساوى لسطحين وماذا يختلف؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — المساحة والمحيط"
      moduleSubtitle="عددان لسطح واحد · ثلاث حالات لسطحين"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'معارف', title: 'نسمّي ما وجدته في الحوش', tone: 'violet',
        body: <p>ما فعلتَه بالبلاطات والسياج نكتبه الآن بالأسماء. أجب أوّلًا، ثم اقرأ الخلاصة التي تحت كل سؤال.</p>,
      }}
      steps={[
        {
          num: 1, title: 'من يشتري الخشب ومن يشتري البلاطات؟', subtitle: 'مساحة أم محيط', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>أرادت سارة أن تعرف كم مترًا من الخشب تشتري لسياج حوش جدّها، وأراد جدّها أن يعرف كم بلاطة تغطّي أرض الحوش. أيّ العددين يخصّ كلًّا منهما؟</span>}
                options={[M('سارة تريد المحيط والجدّ يريد المساحة'), M('سارة تريد المساحة والجدّ يريد المحيط'), M('كلاهما يريد المحيط')]}
                correct={0} cols={1} requires={['mahit-hadd']}
                explain={<MathText>{'الخشب يمرّ على حدّ الحوش: طوله هو المحيط. والبلاطات تغطّي الأرض: عددها هو المساحة.'}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="definition" compact text={KNOWLEDGE.area.text} source={KNOWLEDGE.area.source} />}
              {q1 && <TextbookBox kind="definition" compact text={KNOWLEDGE.perimeter.text} source={KNOWLEDGE.perimeter.source} />}
            </div>
          ),
        },
        {
          num: 2, title: 'نفس عدد البلاطات: هل السياج نفسه؟', subtitle: 'الحوشان (أ) و (ب)', done: q2,
          content: (
            <div className="space-y-3">
              <Figs id="maarif-2" />
              <TapQuestion
                prompt={<span>في كلٍّ من الحوشين (أ) و (ب) عشر بلاطات. ماذا تقول عن مساحتيهما وعن محيطيهما؟</span>}
                options={[M('المساحتان متساويتان والمحيطان مختلفان'), M('المساحتان والمحيطان متساويان'), M('المساحتان مختلفتان')]}
                correct={0} cols={1} requires={['naql-baqat-masaha']}
                explain={<MathText>{'كلاهما عشر بلاطات. وسياج (أ) 14 عصا، أمّا سياج (ب) فـ 16 عصا لأنّ عرضه ست بلاطات لا خمس.'}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <TextbookBox kind="property" compact text={KNOWLEDGE.sameAreaOnly.text} source={KNOWLEDGE.sameAreaOnly.source} />}
            </div>
          ),
        },
        {
          num: 3, title: 'نفس السياج: هل نفس عدد البلاطات؟', subtitle: 'الحوشان (أ) و (ج)', done: q3,
          content: (
            <div className="space-y-3">
              <Figs id="maarif-3" />
              <TapQuestion
                prompt={<span>سياج كلٍّ من الحوشين (أ) و (ج) أربع عشرة عصا. ماذا تقول عن مساحتيهما؟</span>}
                options={[M('المحيطان متساويان والمساحتان مختلفتان'), M('المساحتان متساويتان لأنّ المحيطين متساويان'), M('الحوش (أ) أكبر مساحة لأنّه أقل عرضًا')]}
                correct={0} cols={1} requires={['mahit-hadd']}
                explain={<MathText>{'في (أ) عشر بلاطات وفي (ج) اثنتا عشرة بلاطة: بالسياج نفسه نحيط بعددين مختلفين من البلاطات، فالمحيط وحده لا يعيّن المساحة.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="property" compact text={KNOWLEDGE.samePerimeterOnly.text} source={KNOWLEDGE.samePerimeterOnly.source} />}
            </div>
          ),
        },
        {
          num: 4, title: 'وهل يمكن أن يتساوى العددان معًا؟', subtitle: 'الحوشان (أ) و (د)', done: q4,
          content: (
            <div className="space-y-3">
              <Figs id="maarif-4" />
              <TapQuestion
                prompt={<span>قارن بين الحوشين (أ) و (د): ما العبارة الصحيحة؟</span>}
                options={[M('المساحتان متساويتان والمحيطان متساويان، مع اختلاف الشكلين'), M('الشكلان مختلفان فلا بدّ أن تختلف المساحتان'), M('الشكلان مختلفان فلا بدّ أن يختلف المحيطان')]}
                correct={0} cols={1} requires={['naql-baqat-masaha']}
                explain={<MathText>{'عدّ بلاطات (د) فهي عشر مثل (أ)، وسياجه 14 عصا مثل (أ): اختلاف الشكل لا يعني اختلاف المساحة أو المحيط.'}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <TextbookBox kind="property" compact text={KNOWLEDGE.sameBoth.text} source={KNOWLEDGE.sameBoth.source} />}
              {q4 && <KnowledgeBrick id="thalath-hallat" lead="في الأمثلة الثلاثة: ماذا يمكن أن يتساوى لسطحين، وماذا يختلف؟" />}
              {q4 && <TextbookBox kind="remark" compact text={KNOWLEDGE.honeycomb.text} source={KNOWLEDGE.honeycomb.source} />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
