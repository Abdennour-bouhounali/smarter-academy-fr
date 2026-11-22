import { BossFinal } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { SourceTag } from '../../../../../../common/textbook';
import { LESSON_CONFIG } from '../lesson.config';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SITUATION } from '../content/textbook';

/**
 * Module 8 — وضعية الاختبار النهائي (stage: evaluation) : la sortie scolaire au musée en cinq épreuves — l'expression, sa valeur, une inéquation testée, une équation à deux étapes, puis la
 * vérification d'un quotient. Les épreuves restent LITTÉRALES ici (l'audit les lit) ; `FINAL` (content/textbook.js) porte les mêmes données, recalculées en BigInt par ../content/content.test.js,
 * qui vérifie que ce fichier contient chaque option. Chaque distracteur est FAUX et porte une erreur de l'unité (fixe ajouté au coefficient, rôles échangés, car oublié, ≤ lu <, opération annulée
 * par elle-même, produit pour quotient). LP : P1.
 */
const Q = ({ children }) => <span>{typeof children === 'string' ? <MathText>{children}</MathText> : children} <SourceTag source={SITUATION.source} /></span>;
const opts = (list) => list.map((o) => <MathText key={o}>{o}</MathText>);

export default function Module08Ahill() {
  return (
    <BossFinal
      ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} moduleTitle="وضعية الاختبار النهائي" moduleSubtitle="خمس مراحل: العبارة وقيمتها والمتباينة والمعادلة والتحقّق" estimatedTime="12 دقيقة"
      lessonConfig={LESSON_CONFIG} timerSeconds={12 * 60} timerLabel="12 دقيقة"
      brief={{ tag: 'أدمج تعلّماتي', title: 'كم تكلّف الرحلة؟ وكم تلميذًا يشارك؟', tone: 'amber', body: <p><MathText>{SITUATION.text}</MathText></p> }}
      skills={{
        expr: { label: 'عبارة حرفية', module: 1 },
        value: { label: 'قيمة عبارة', module: 2 },
        test: { label: 'اختبار متباينة', module: 4 },
        solve: { label: 'حلّ معادلة', module: 5 },
        check: { label: 'التحقّق من حلّ', module: 6 },
      }}
      epreuves={[
        { id: 'E1', skill: 'expr', requires: ['ibara-harfiya-intaj-2am'], prompt: <Q>{'المرحلة 1 — عبارة تكلفة الرحلة بدلالة عدد التلاميذ $x$ هي ...'}</Q>,
          options: opts(['$12000+200x$', '$12200x$', '$200+12000x$', '$12000\\times200x$']), correct: 0, cols: 1,
          explain: <MathText>{'مبلغ ثابت $12000$ ، ثمّ $200$ عن كلّ تلميذ: $200\\times x=200x$ ، فالتكلفة $12000+200x$ . الخطأ الأوّل جمع المبلغ الثابت إلى المعامل، والثاني بدّل دور العددين، والثالث ضرب المبلغين.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'] } },
        { id: 'E2', skill: 'value', requires: ['ibara-harfiya-intaj-2am'], prompt: <Q>{'المرحلة 2 — تكلفة الرحلة من أجل $36$ تلميذًا هي ...'}</Q>,
          options: opts(['$12000+200\\times36=19200\\,\\mathrm{DA}$', '$200\\times36=7200\\,\\mathrm{DA}$', '$12200\\times36=439200\\,\\mathrm{DA}$', '$200+12000\\times36=432200\\,\\mathrm{DA}$']), correct: 0, cols: 1,
          explain: <MathText>{'نعوّض $x=36$ ونحسب بالأولوية: $200\\times36=7200$ ثمّ $12000+7200=19200$ . الخطأ الأوّل نسي الحافلة، والثاني استعمل العبارة $12200x$ ، والثالث بدّل دور العددين.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'] } },
        { id: 'E3', skill: 'test', requires: ['ikhtibar-musawat-mutabayina-2am'], prompt: <Q>{'المرحلة 3 — من بين $25$ ، $30$ ، $32$ : القيم التي تجعل المتباينة $12000+200x\\le18000$ صحيحة هي ...'}</Q>,
          options: opts(['$25$ و $30$', '$25$ فقط', '$32$ فقط', '$25$ و $30$ و $32$']), correct: 0, cols: 1,
          explain: <MathText>{'من أجل $25$ : $17000\\le18000$ صحيحة ؛ من أجل $30$ : $18000\\le18000$ صحيحة لأنّ الرمز $\\le$ يقبل التساوي ؛ من أجل $32$ : $18400\\le18000$ خاطئة.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'] } },
        { id: 'E4', skill: 'solve', requires: ['hall-mushkil-muadala-2am'], prompt: <Q>{'المرحلة 4 — بلغت التكلفة $20000\\,\\mathrm{DA}$ : عدد التلاميذ هو ...'}</Q>,
          options: opts(['$x=40$ لأنّ $200x=8000$', '$x=100$', '$x=160$', '$x=60$']), correct: 0, cols: 1,
          explain: <MathText>{'المعادلة $12000+200x=20000$ : نلغي الإضافة أوّلًا فنطرح $12000$ ، $200x=8000$ ، ثمّ $x=8000\\div200=40$ . الأخطاء: $20000\\div200$ ينسى الحافلة، و $(20000+12000)\\div200$ يلغي الطرح بإضافة، و $12000\\div200$ يقسم المبلغ الثابت.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'] } },
        { id: 'E5', skill: 'check', requires: ['hall-mushkil-muadala-2am'], prompt: <Q>{'المرحلة 5 — يقول المحاسب إنّ نصيب كلّ تلميذ $500\\,\\mathrm{DA}$ ، أي $\\frac{20000}{x}=500$ . التحقّق هو ...'}</Q>,
          options: opts(['صحيح: من أجل $x=40$ نجد $20000\\div40=500$', 'خاطئ: حلّ المعادلة $x=20000\\times500=10\\,000\\,000$', 'خاطئ: حلّ المعادلة $x=500\\div20000=0{,}025$', 'خاطئ: حلّ المعادلة $x=20000-500=19500$']), correct: 0, cols: 1,
          explain: <MathText>{'في $\\frac{20000}{x}=500$ المجهول قاسم: $x=20000\\div500=40$ ، وهي القيمة السابقة. الأخطاء ضربت العددين، أو قلبت القسمة، أو طرحتهما.'}</MathText>, assessment: { enabled: true, type: 'assessment', learningPointIds: ['2am_wadiya-idmajiya-mafhum-muadala_P1'] } },
      ]}
      badges={[{ id: 'idmaj', emoji: '🧩', label: 'أدمجت تعلّماتي', test: (m) => (m.expr ?? 0) + (m.value ?? 0) + (m.test ?? 0) + (m.solve ?? 0) + (m.check ?? 0) === 0 }]}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'أنهيت الوحدة 4', title: 'مفهوم معادلة',
        message: 'كتبت تكلفة الرحلة $12000+200x$ ، وحسبتها من أجل $36$ تلميذًا، واختبرت متباينة بقيم معطاة، وحللت معادلة من خطوتين فوجدت عدد التلاميذ، ثمّ تحقّقت من نصيب كلّ تلميذ بمعادلة قسمة. وظّفت العبارة الحرفية واختبار المساواة وحلّ المعادلة في وضعية واحدة.',
        verbs: ['أقرأ', 'أحلّل', 'أحسب', 'أتحقّق'], masterBadgeLabel: 'الوحدة 4',
      }}
    />
  );
}
