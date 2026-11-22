import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW3, PERP, MISTAKES } from '../content/textbook';
import { FIG_KNOW3, FIG_PERP } from '../content/figures';

/**
 * Module 2 — معارف 3 (p. 154) « خواص الدّوران », puis l'AJOUT déclaré de la plateforme (« معارف من المنصّة ») :
 * une droite et son image font l'angle du دوران — 90° ⇒ perpendiculaires, 180° ⇒ parallèles. Le manuel en a besoin p. 155
 * (« (BD) ⊥ (AC) من خواص الدوران ») sans le dire p. 154 (extraction › discrepancies › method-properties).
 * FORMALIZE : 1) la propriété (brique khawas-dawaran) et son exemple de 20° (figure REDESSINÉE : dans le manuel les points
 * et leurs images étaient collés sur deux demi-droites à 20°) ; 2) la droite et son image (brique zawiya-sura).
 * LP : P1 (les quatre conservations), P2 (perpendiculaire / parallèle).
 * RÉTROFIT 2026-10-15 (§4quater) : la question d'abord, la brique / la boîte qui NOMME ensuite ({q1 && khawas-dawaran}, {q2 && zawiya-sura},
 * {q3 && remarque}) ; `requires` des deux premières questions = thabat-dawaran (module 1), la brique suivant la réponse ; le `brief` ne
 * dit plus de fait. Module sans labo : pas de labo à ouvrir.
 * « أتوقّع القاعدة » : khawas-dawaran est un RAPPEL (variant="rappel") — la brique thabat-dawaran du module 1 a déjà fait
 * écrire puis posé ces quatre conservations, et la consigne du module les redit ; zawiya-sura se prédit (knowledge.jsx).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — خواص الدوران"
      moduleSubtitle="ما رأيته على اللوحة، بكلمات الكتاب"
      estimatedTime="8 دقائق"
      objectives={["ما الذي يحافظ عليه الدوران؟", "كيف يكون المستقيم وصورته بزاوية دوران معيّنة؟", "ماذا أقول عن زوايا 60 و120 و180 درجة؟"]}
      brief={{
        tag: 'معارف — الكتاب ص 154', title: KNOW3.title, tone: 'violet',
        body: <p>ثلاث خطوات على شكل من الكتاب: تجيب أولًا عمّا رأيته على اللوحة، ثم نضع الكلمات الدقيقة.</p>,
        footer: <SourceTag source={KNOW3.source} />,
      }}
      steps={[
        {
          num: 1, title: 'الدوران يحافظ على…', subtitle: 'معارف 3 ومثالها', done: q1,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW3} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'في المثال: الدوران الذي مركزه O وزاويته $20^\\circ$ في الاتجاه المباشر، و $AB = 2\\,\\mathrm{cm}$ و A، B، C على استقامية.'}</MathText></p>}
                rows={[
                  // 2 + 20 / 2 × … : la longueur ne dépend pas de l'angle
                  { id: 'ab', label: <MathText>{"$A'B'$"}</MathText>, options: ['$2\\,\\mathrm{cm}$', '$2{,}2\\,\\mathrm{cm}$', 'لا يمكن معرفته دون قياس'].map(M), correct: 0, correction: 'الدوران يحافظ على الأطوال: $A\'B\' = AB = 2\\,\\mathrm{cm}$ .' },
                  { id: 'align', label: 'A′ و B′ و C′', options: ['على استقامية واحدة', 'ليست على استقامية', 'على استقامية مع O'], correct: 0, correction: 'الدوران يحافظ على استقامية النقط.' },
                  { id: 'area', label: 'مساحة المثلث OA′B′ مقارنة بمساحة OAB', options: ['متساويتان', 'مساحة OA′B′ أكبر', 'مساحة OA′B′ أصغر'], correct: 0, correction: 'الدوران الذي مركزه O يحوّل المثلث OAB إلى OA′B′، ويحافظ على المساحات.' },
                ]}
                requires={['thabat-dawaran']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: الصورة تقايس الشكل، تتغيّر وضعيتها فقط.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <KnowledgeBrick id="khawas-dawaran" variant="rappel" lead="أربع خواص، كأسطر اللوحة الأربعة:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'المستقيم وصورته', subtitle: 'معارف من المنصّة', done: q2,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_PERP} />
              <TapQuestion
                prompt={<MathText>{"(d′) صورة المستقيم (d) بالدوران الذي مركزه O وزاويته $90^\\circ$ في الاتجاه المباشر. إذن:"}</MathText>}
                options={[
                  "$(d') \\perp (d)$",
                  MISTAKES.tawazi.wrong, // MISC-DAWARAN-TAWAZI
                  "(d′) يصنع مع (d) زاوية $45^\\circ$", // la moitié de l'angle
                ].map(M)}
                correct={0}
                cols={1}
                requires={['thabat-dawaran']}
                explain={<MathText>{`${PERP.cases[0]} ${MISTAKES.tawazi.right}`}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="zawiya-sura" lead="ما قرأته في «الزاوية بين المستقيمين»:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'زوايا أخرى', subtitle: 'المستقيم وصورته', done: q3,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">الزاوية بين مستقيم وصورته بالدوران الذي زاويته:</p>}
                rows={[
                  { id: 'a60', label: <MathText>{'$60^\\circ$'}</MathText>, options: ['$60^\\circ$', '$30^\\circ$', '$120^\\circ$'].map(M), correct: 0, correction: 'المستقيم وصورته يصنعان زاوية الدوران.' },
                  { id: 'a120', label: <MathText>{'$120^\\circ$'}</MathText>, options: ['$60^\\circ$', '$120^\\circ$ ، فهما متعامدان', '$0^\\circ$'].map(M), correct: 0, correction: 'زاوية منفرجة: الزاوية بين المستقيمين $180^\\circ - 120^\\circ = 60^\\circ$ .' },
                  { id: 'a180', label: <MathText>{'$180^\\circ$'}</MathText>, options: ['متوازيان (أو منطبقان)', 'متعامدان', 'يتقاطعان بزاوية $90^\\circ$'].map(M), correct: 0, correction: PERP.cases[1] },
                ]}
                requires={['zawiya-sura']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}><MathText>{allRight ? 'أحسنت: $90^\\circ$ تعطي التعامد، و $180^\\circ$ تعطي التوازي.' : 'راجع التصحيح تحت كل سطر.'}</MathText></Feedback>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="remark" text={PERP.text} source={PERP.source} compact />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
