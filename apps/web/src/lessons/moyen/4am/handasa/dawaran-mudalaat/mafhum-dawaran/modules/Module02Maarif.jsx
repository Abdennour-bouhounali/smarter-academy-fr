import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { SourceTag, TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOW1, KNOW2, MISTAKES, PLATFORM_SOURCE } from '../content/textbook';
import { FIG_KNOW1, FIG_KNOW2, FIG_KNOW2_180 } from '../content/figures';

/**
 * Module 2 — معارف 1 et 2 (p. 154).
 * FORMALIZE : 1) الدوران (تعريف، ملاحظة : centre, angle, sens — brique dawaran), l'exemple (F) → (F′) ; 2) l'اصطلاح des deux
 * sens et les deux horloges (brique ittijah) — la question de l'horloge de la Grande Poste (un sens réel) ; 3) صورة نقطة
 * (brique surat-nuqta, l'exemple 35°, O image de lui-même) — les deux erreurs que la roue a refusées (le sens, le rayon) ;
 * 4) 180° = التناظر المركزي (brique nisf-dawra). LP : P1, P2.
 * RÉTROFIT 2026-10-15 (§4quater) : dans chaque étape la question vient d'abord ; l'exemple du manuel qui donne la réponse (KNOW1.example,
 * KNOW2.example1) et la brique qui NOMME viennent après (`{qN && …}`) ; les `requires` ne nomment plus la brique qui suit (q1, q2 sans
 * requires ; q3 → dawaran ; q4 → surat-nuqta). Module sans labo : le brief dit ce qu'est le module, sans énoncer de fait.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — الدوران وصورة نقطة"
      moduleSubtitle="ما فعلته بالعجلة وبالورق الشفاف، بكلمات الكتاب"
      estimatedTime="9 دقائق"
      objectives={["كيف أعرّف الدوران، وما اسما الاتجاهين؟", "متى تكون نقطة صورة نقطة أخرى بدوران؟", "ماذا يحدث حين تكون الزاوية 180 درجة؟"]}
      brief={{
        tag: 'معارف — الكتاب ص 154', title: KNOW1.title, tone: 'violet',
        body: <p>أربع خطوات حول ما فعلته بالعجلة وبالورق الشفاف: تجيب أولًا، ثم تقرأ الكلمات التي يستعملها الكتاب.</p>,
        footer: <SourceTag source={KNOW1.source} />,
      }}
      steps={[
        {
          num: 1, title: 'الدوران: مركز وزاوية واتجاه', subtitle: 'معارف 1', done: q1,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW1} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">في مثال الكتاب، الدوران الذي يحوّل (F) إلى (F′):</p>}
                rows={[
                  { id: 'c', label: 'مركزه', options: ['النقطة O', 'النقطة M', 'منتصف [MM′]'], correct: 0, correction: 'المركز هو النقطة الثابتة التي ندوّر حولها: O.' },
                  { id: 'a', label: 'زاويته', options: ['$90^\\circ$', '$180^\\circ$', '$45^\\circ$'].map(M), correct: 0, correction: <MathText>{'الزاوية $\\widehat{MOM\'}$ قائمة (رمز الزاوية القائمة في O).'}</MathText> },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: مركز، وزاوية، ويبقى الاتجاه.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ1(true)}
              />
              {q1 && <TextbookBox kind="example" text={KNOW1.example} source={KNOW1.source} compact />}
              {q1 && <KnowledgeBrick id="dawaran" lead="الحركة التي جرّبتها، معرّفة:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'الاتجاه المباشر وغير المباشر', subtitle: 'اصطلاح', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="example" text="عقرب الدقائق في ساعة البريد المركزي بالجزائر العاصمة يدور من الرقم 12 إلى الرقم 3." source={PLATFORM_SOURCE} compact />
              <TapQuestion
                prompt="هذا الدوران حول محور الساعة هو في:"
                options={['الاتجاه غير المباشر (السالب)', 'الاتجاه المباشر (الموجب)', 'لا يمكن معرفة الاتجاه دون قيس الزاوية']}
                correct={0}
                cols={1}
                explain={<MathText>{`عقارب الساعة تدور في الاتجاه غير المباشر. ${KNOW1.convention}`}</MathText>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && <KnowledgeBrick id="ittijah" lead="الاتجاهان، بالاسمين اللذين يستعملهما الكتاب:" />}
            </div>
          ),
        },
        {
          num: 3, title: 'صورة نقطة بدوران', subtitle: 'معارف 2', done: q3,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW2} />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">صحيح أم خاطئ؟</p>}
                rows={[
                  { id: 'sense', label: <MathText>{MISTAKES.sense.wrong}</MathText>, options: ['خاطئ', 'صحيح'], correct: 0, correction: <MathText>{MISTAKES.sense.right}</MathText> },
                  { id: 'radius', label: <MathText>{MISTAKES.radius.wrong}</MathText>, options: ['خاطئ', 'صحيح'], correct: 0, correction: <MathText>{MISTAKES.radius.right}</MathText> },
                  { id: 'center', label: 'صورة المركز O بأي دوران مركزه O هي O نفسها.', options: ['صحيح', 'خاطئ'], correct: 0, correction: <MathText>{KNOW2.remark}</MathText> },
                ]}
                requires={['dawaran']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: البعد والزاوية والاتجاه — الثلاثة معا.' : 'راجع التصحيح تحت كل سطر.'}</Feedback>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <TextbookBox kind="example" text={`${KNOW2.example1} ${KNOW2.alphaNote}`} source={KNOW2.source} compact />}
              {q3 && <KnowledgeBrick id="surat-nuqta" lead="الشروط الثلاثة التي فحصتها العجلة، في سطر واحد:" />}
            </div>
          ),
        },
        {
          num: 4, title: 'دوران زاويته 180 درجة', subtitle: 'حالة خاصة', done: q4,
          content: (
            <div className="space-y-3">
              <GeoFigure {...FIG_KNOW2_180} />
              <TapQuestion
                prompt={<MathText>{'الدوران الذي مركزه O وزاويته $180^\\circ$ في الاتجاه غير المباشر هو:'}</MathText>}
                options={[
                  'التناظر بالنسبة إلى النقطة O',
                  // le sens n'y change rien ; ce n'est pas une symétrie axiale (MISC-DAWARAN-TANAZUR)
                  'التناظر بالنسبة إلى مستقيم يمر بـ O',
                  'دوران يختلف عن الدوران بزاوية $180^\\circ$ في الاتجاه المباشر',
                ].map(M)}
                correct={0}
                cols={1}
                requires={['surat-nuqta']}
                explain={<MathText>{`${KNOW2.special} نصف دورة في أحد الاتجاهين أو في الآخر تصل إلى نفس النقطة: O منتصف $[MM']$ .`}</MathText>}
                onAnswered={() => setQ4(true)}
              />
              {q4 && <KnowledgeBrick id="nisf-dawra" lead="نصف دورة، وتحويل تعرفه:" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
