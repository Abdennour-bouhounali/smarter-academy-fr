import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION } from '../content/textbook';

/**
 * Module 8 — وضعية الاختبار النهائي (stage: evaluation) : la résolution du camp d'hiver à Djelfa en cinq épreuves qui suivent les trois étapes. Les épreuves restent LITTÉRALES ici
 * (l'audit les lit) ; `FINAL` (content/textbook.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js, qui vérifie que ce fichier contient chaque option.
 * Chaque distracteur est FAUX et porte une erreur de l'unité (négatifs rangés par distance, ordre décroissant, distances soustraites, écart négatif, ancien − nouveau, somme au lieu de différence,
 * total à l'envers, tous les termes de même signe, coordonnées permutées, signe de l'ordonnée ou de l'abscisse). LP : P1.
 */
const Q = ({ children }) => <span>{typeof children === 'string' ? <MathText>{children}</MathText> : children} <SourceTag source={SITUATION.source} /></span>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Ahill() {
  return (
    <BossFinal
      ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="خمس مراحل: ترتيب الصغرى وفارق اليوم وتغيّر الصغرى ومجموع التغيّرات ونقطة اليوم" estimatedTime="12 دقيقة"
      lessonConfig={LESSON_CONFIG} timerSeconds={12 * 60} timerLabel="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي', title: 'مخيّم شتوي في الجلفة', tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p> }}
      skills={{
        order: { label: 'ترتيب أعداد نسبية', module: 3 },
        gap: { label: 'المسافة بين عددين', module: 6 },
        change: { label: 'الجديد ناقص القديم', module: 5 },
        sum: { label: 'المجموع الجبري', module: 5 },
        point: { label: 'إحداثيا نقطة', module: 4 },
      }}
      epreuves={[
        { id: 'E1', skill: 'order', requires: ['salibayn'], prompt: <Q>المرحلة 1 — رتّب الدرجات الصغرى الخمس ترتيبًا تصاعديًا.</Q>,
          options: opts(['$-5{,}5 < -3 < -2 < -0{,}5 < +1$', '$-0{,}5 < -2 < -3 < -5{,}5 < +1$', '$+1 < -0{,}5 < -2 < -3 < -5{,}5$', '$-2 < -3 < -0{,}5 < -5{,}5 < +1$']), correct: 0, cols: 1,
          explain: <MathText>{'الأصغر عددًا هو الأبعد عن الصفر بين السالبة: $-5{,}5 < -3 < -2 < -0{,}5$ ثمّ الموجبة $+1$ . الخطأ الأوّل رتّب السالبة بحسب مسافاتها إلى الصفر، والثاني رتّب تنازليًا، والثالث خلط بين الأعداد.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'] } },
        { id: 'E2', skill: 'gap', requires: ['qaidat-masafa'], prompt: <Q>المرحلة 2 — ما فارق اليوم 2، أي المسافة بين كبراه وصغراه؟</Q>,
          options: opts(['$4{,}5-(-5{,}5)=10$', '$5{,}5-4{,}5=1$', '$(-5{,}5)-(+4{,}5)=-10$', '$4{,}5-5{,}5=-1$']), correct: 0, cols: 1,
          explain: <MathText>{'الكبرى $+4{,}5$ والصغرى $-5{,}5$ على جهتين من الصفر: $(+4{,}5)-(-5{,}5)=4{,}5+5{,}5=10$ . الخطأ الأوّل طرح المسافتين إلى الصفر، والثاني طرح الكبرى من الصغرى فوجد مسافة سالبة، والثالث عكس الطرح.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'] } },
        { id: 'E3', skill: 'change', requires: ['jam-ishara-mukhtalifa'], prompt: <Q>المرحلة 3 — كيف تغيّرت الصغرى من اليوم 2 إلى اليوم 3؟</Q>,
          options: opts(['$(+1)-(-5{,}5)=+6{,}5$', '$(-5{,}5)-(+1)=-6{,}5$', '$(+1)+(-5{,}5)=-4{,}5$', '$5{,}5-1=+4{,}5$']), correct: 0, cols: 1,
          explain: <MathText>{'التغيّر هو الجديد ناقص القديم: $(+1)-(-5{,}5)=(+1)+(+5{,}5)=+6{,}5$ ، وهو موجب لأنّ الصغرى ارتفعت. الخطأ الأوّل عكس الطرح، والثاني جمع بدل الطرح، والثالث طرح المسافتين.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'] } },
        { id: 'E4', skill: 'sum', requires: ['qaidat-majmu-jabri'], prompt: <Q>{'المرحلة 4 — تغيّرات الصغرى من اليوم 1 إلى اليوم 5 هي $-2{,}5$ ثمّ $+6{,}5$ ثمّ $-1{,}5$ ثمّ $-1{,}5$ . ما مجموعها الجبري؟'}</Q>,
          options: opts(['$(-2{,}5)+(+6{,}5)+(-1{,}5)+(-1{,}5)=+1$', '$(-2{,}5)+(+6{,}5)+(-1{,}5)+(-1{,}5)=-1$', '$(-2{,}5)+(+6{,}5)+(-1{,}5)+(-1{,}5)=-12$', '$(-2{,}5)+(+6{,}5)+(-1{,}5)+(-1{,}5)=+12$']), correct: 0, cols: 1,
          explain: <MathText>{'الموجبة $+6{,}5$ والسالبة $-2{,}5-1{,}5-1{,}5=-5{,}5$ ، فالمجموع $6{,}5-5{,}5=+1$ . ونراجع: $(-2)-(-3)=+1$ ، أي الصغرى الأخيرة ناقص الأولى. الأخطاء الثلاثة: المجموع معكوس، وكلّ الحدود سالبة، وكلّ الحدود موجبة.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'] } },
        { id: 'E5', skill: 'point', requires: ['nuqta-ala-mihwar'], prompt: <Q>المرحلة 5 — ما إحداثيا نقطة اليوم 4، وأين تقع بالنسبة إلى محور الفواصل؟</Q>,
          options: opts(['$(4\\,;\\,-0{,}5)$ ، تحت محور الفواصل', '$(-0{,}5\\,;\\,4)$ ، فوق محور الفواصل', '$(4\\,;\\,0{,}5)$ ، فوق محور الفواصل', '$(-4\\,;\\,-0{,}5)$ ، تحت محور الفواصل']), correct: 0, cols: 1,
          explain: <MathText>{'النقطة (رقم اليوم ؛ الصغرى) = $(4\\,;\\,-0{,}5)$ : الفاصلة أوّلًا، وترتيبها سالب فهي تحت محور الفواصل. الخطأ الأوّل عكس ترتيب الإحداثيين، والثاني أخطأ في إشارة الترتيب، والثالث أخطأ في إشارة الفاصلة.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-adad-nisbiya-2_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🧩', label: 'أدمجت تعلّماتي', test: (m) => (m.order ?? 0) + (m.gap ?? 0) + (m.change ?? 0) + (m.sum ?? 0) + (m.point ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أنهيت الوحدة 3', title: 'الأعداد النسبية',
        message: 'رتّبت الدرجات الصغرى فكانت أبرد ليلة $-5{,}5$ ، وفارق اليوم الثاني $10$ ، وارتفعت الصغرى من اليوم 2 إلى اليوم 3 بـ $+6{,}5$ ، ومجموع تغيّراتها $+1$ ، ونقطة اليوم الرابع $(4\\,;\\,-0{,}5)$ . وظّفت التعليم والمقارنة والجمع والطرح والمجموع الجبري والمسافة في وضعية واحدة.',
        verbs: ['أقرأ', 'أحلّل', 'أحسب', 'أتحقّق'], masterBadgeLabel: 'الوحدة 3',
      }}
    />
  );
}
