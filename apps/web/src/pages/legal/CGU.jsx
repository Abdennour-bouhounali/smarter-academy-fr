import LegalPage, {
  LegalSection,
  LegalParagraph,
  LegalList,
} from './LegalPage';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

/**
 * شروط الاستعمال.
 *
 * Texte fourni par le propriétaire (version arabe, droit algérien), repris
 * tel quel. Les champs laissés vides dans le modèle ont été remplis ainsi :
 * date = date de mise en ligne, e-mail = l'adresse de contact du site ; la
 * ligne « العنوان » est omise tant qu'aucune adresse légale n'est fournie.
 *
 * Version affichée : elle doit correspondre à `terms_version` dans
 * apps/api/config/legal.php. Modifier le fond de cette page impose d'y faire
 * évoluer la date — sans quoi on change ce que les élèves sont réputés avoir
 * accepté.
 */

const EMAIL = 'contact@smarter-academy.com';
const UPDATED_AT = '4 أكتوبر 2026';

function Mail() {
  return (
    <a
      href={`mailto:${EMAIL}`}
      dir="ltr"
      className="text-nav-accent hover:text-nav-accent underline underline-offset-2"
    >
      {EMAIL}
    </a>
  );
}

export default function CGUPage() {
  useDocumentMeta(
    'شروط الاستعمال',
    'شروط استعمال منصة Smarter Academy: الحساب، استخدام المنصة، المحتوى التعليمي والملكية الفكرية.'
  );

  return (
    <LegalPage
      title="شروط الاستعمال"
      intro="مرحبًا بك في منصة Smarter Academy. باستخدامك للمنصة أو إنشاء حساب فيها، فإنك توافق على شروط الاستعمال التالية. يرجى قراءتها بعناية قبل استخدام خدمات المنصة."
      updatedAt={UPDATED_AT}
    >
      <LegalSection id="plateforme" number="1" title="التعريف بالمنصة">
        <LegalParagraph>
          <strong>Smarter Academy</strong> هي منصة تعليمية تهدف إلى مساعدة الطلاب على التعلم
          والمراجعة من خلال الدروس التفاعلية، التمارين، الأنشطة التعليمية وأدوات التعلم المختلفة.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="compte" number="2" title="إنشاء الحساب">
        <LegalParagraph>
          يمكن للمستخدم إنشاء حساب للاستفادة من الخدمات التي تتطلب تسجيل الدخول.
        </LegalParagraph>
        <LegalParagraph>
          عند إنشاء الحساب، يجب تقديم معلومات صحيحة ودقيقة، والحفاظ على سرية معلومات الدخول
          الخاصة بالحساب.
        </LegalParagraph>
        <LegalParagraph>المستخدم مسؤول عن أي نشاط يتم من خلال حسابه.</LegalParagraph>
      </LegalSection>

      <LegalSection id="utilisation" number="3" title="استخدام المنصة">
        <LegalParagraph>
          يوافق المستخدم على استخدام المنصة لأغراض تعليمية ومشروعة فقط.
        </LegalParagraph>
        <LegalParagraph>يُمنع استخدام المنصة من أجل:</LegalParagraph>
        <LegalList>
          <li>محاولة الوصول غير المصرح به إلى حسابات أو أنظمة المنصة.</li>
          <li>تعطيل أو إتلاف خدمات المنصة.</li>
          <li>نسخ أو إعادة نشر محتوى المنصة دون إذن.</li>
          <li>استخدام المنصة بطريقة تضر بالمستخدمين الآخرين.</li>
          <li>القيام بأي نشاط مخالف للقوانين المعمول بها.</li>
        </LegalList>
      </LegalSection>

      <LegalSection id="contenu" number="4" title="المحتوى التعليمي">
        <LegalParagraph>
          جميع الدروس والتمارين والمحتويات التعليمية المتوفرة على المنصة مخصصة للاستخدام التعليمي.
        </LegalParagraph>
        <LegalParagraph>
          قد يتم تحديث أو تعديل المحتوى التعليمي من وقت لآخر من أجل تحسين جودته أو تصحيحه أو
          تطويره.
        </LegalParagraph>
        <LegalParagraph>
          لا تضمن المنصة أن يكون المحتوى مناسبًا بشكل كامل لكل مستخدم أو أن يؤدي استخدامه إلى
          نتيجة دراسية معينة.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="propriete" number="5" title="حقوق الملكية الفكرية">
        <LegalParagraph>
          جميع محتويات منصة <strong>Smarter Academy</strong>، بما في ذلك النصوص، الدروس، التمارين،
          التصاميم، الرسومات، الواجهات والعناصر البرمجية، محمية بموجب القوانين المتعلقة بالملكية
          الفكرية، ما لم يذكر خلاف ذلك.
        </LegalParagraph>
        <LegalParagraph>
          لا يجوز نسخ أو إعادة نشر أو بيع أو توزيع محتوى المنصة دون الحصول على إذن مسبق.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="progression" number="6" title="تقدم الطالب">
        <LegalParagraph>
          قد تقوم المنصة بحفظ معلومات مرتبطة بتقدم الطالب، مثل الدروس والتمارين والنتائج، بهدف
          توفير تجربة تعليمية أفضل ومتابعة التقدم.
        </LegalParagraph>
        <LegalParagraph>
          لا يجوز للمستخدم محاولة تعديل أو التلاعب بهذه المعلومات بطرق غير مصرح بها.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="disponibilite" number="7" title="توفر المنصة">
        <LegalParagraph>
          نسعى إلى توفير المنصة بصورة مستقرة ومستمرة، ولكن قد تحدث أحيانًا عمليات صيانة أو تحديثات
          أو أعطال تقنية تؤدي إلى توقف مؤقت لبعض الخدمات.
        </LegalParagraph>
        <LegalParagraph>لا نضمن توفر جميع الخدمات دون انقطاع في جميع الأوقات.</LegalParagraph>
      </LegalSection>

      <LegalSection id="suspension" number="8" title="تعليق أو إغلاق الحساب">
        <LegalParagraph>
          في حالة مخالفة شروط الاستعمال أو استخدام المنصة بطريقة غير قانونية أو ضارة، يمكن اتخاذ
          الإجراءات المناسبة، بما في ذلك تقييد أو تعليق أو إغلاق الحساب وفقًا للحالة والقوانين
          المعمول بها.
        </LegalParagraph>
        <LegalParagraph>
          يمكن للمستخدم أيضًا طلب إغلاق حسابه وفق الإجراءات المتاحة على المنصة.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="modifications" number="9" title="تعديل شروط الاستعمال">
        <LegalParagraph>
          قد يتم تعديل شروط الاستعمال عند تطوير المنصة أو إضافة خدمات جديدة أو بسبب تغييرات
          قانونية.
        </LegalParagraph>
        <LegalParagraph>
          سيتم نشر النسخة الجديدة على هذه الصفحة مع تحديث تاريخ آخر تعديل.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="droit" number="10" title="القانون المعمول به">
        <LegalParagraph>
          تخضع شروط استعمال منصة <strong>Smarter Academy</strong> للقوانين المعمول بها في
          الجمهورية الجزائرية، مع مراعاة الحقوق والقواعد القانونية الواجبة التطبيق.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="contact" number="11" title="التواصل">
        <LegalParagraph>
          لأي سؤال يتعلق بهذه الشروط أو باستخدام المنصة، يمكن التواصل معنا عبر:
        </LegalParagraph>
        <LegalParagraph>
          <strong>Smarter Academy</strong>
          <br />
          <strong>البريد الإلكتروني:</strong> <Mail />
        </LegalParagraph>
      </LegalSection>

      <hr className="my-10 border-slate-200" />
      <LegalParagraph>
        باستخدام منصة <strong>Smarter Academy</strong>، يقر المستخدم بأنه قرأ شروط الاستعمال
        وفهمها ويوافق على الالتزام بها.
      </LegalParagraph>
    </LegalPage>
  );
}
