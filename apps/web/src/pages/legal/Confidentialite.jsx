import LegalPage, {
  LegalSection,
  LegalParagraph,
  LegalList,
} from './LegalPage';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

/**
 * سياسة الخصوصية وحماية البيانات الشخصية.
 *
 * Texte fourni par le propriétaire (version arabe, droit algérien), repris
 * tel quel. Les champs laissés vides dans le modèle ont été remplis ainsi :
 * date = date de mise en ligne, e-mail = l'adresse de contact du site ; la
 * ligne « العنوان » est omise tant qu'aucune adresse légale n'est fournie.
 *
 * Version affichée : elle doit correspondre à `privacy_version` dans
 * apps/api/config/legal.php. Modifier le fond de cette page sans faire
 * évoluer cette date reviendrait à changer ce que les élèves sont réputés
 * avoir accepté.
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

export default function ConfidentialitePage() {
  useDocumentMeta(
    'سياسة الخصوصية',
    'كيف تجمع منصة Smarter Academy البيانات الشخصية وتستعملها وتحميها، وكيف يمارس المستخدم حقوقه.'
  );

  return (
    <LegalPage
      title="سياسة الخصوصية وحماية البيانات الشخصية"
      intro="تحترم منصة Smarter Academy خصوصية مستخدميها وتلتزم بحماية بياناتهم الشخصية واستعمالها بطريقة واضحة وآمنة، وفقًا للتشريعات المعمول بها في الجزائر."
      updatedAt={UPDATED_AT}
    >
      <LegalSection id="donnees" number="1" title="البيانات التي نجمعها">
        <LegalParagraph>
          عند إنشاء حساب أو استخدام المنصة، قد نقوم بجمع البيانات التالية:
        </LegalParagraph>
        <LegalList>
          <li>الاسم.</li>
          <li>اللقب.</li>
          <li>البريد الإلكتروني.</li>
          <li>
            كلمة المرور، والتي يتم تخزينها في شكل مشفّر/مُجزّأ آمن، ولا يتم تخزينها كنص عادي.
          </li>
          <li>
            معلومات مرتبطة بتقدم الطالب في المنصة، مثل الدروس التي تم الاطلاع عليها والتمارين
            والنتائج والتقدم في التعلم.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection id="finalites" number="2" title="لماذا نستخدم هذه البيانات؟">
        <LegalParagraph>نستخدم البيانات الشخصية من أجل:</LegalParagraph>
        <LegalList>
          <li>إنشاء وإدارة حساب المستخدم.</li>
          <li>تمكين الطالب من الوصول إلى المنصة ومحتواها.</li>
          <li>حفظ ومتابعة تقدم الطالب في التعلم.</li>
          <li>تحسين تجربة الاستخدام والمحتوى التعليمي.</li>
          <li>ضمان أمن المنصة والحسابات.</li>
          <li>التواصل مع المستخدم عند الحاجة المتعلقة بالخدمة.</li>
        </LegalList>
        <LegalParagraph>
          لا نستخدم البيانات الشخصية لأغراض غير مرتبطة بالخدمة إلا وفقًا للقانون أو بعد الحصول
          على الموافقة اللازمة عندما تكون مطلوبة.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="protection" number="3" title="حماية البيانات">
        <LegalParagraph>
          نتخذ إجراءات تقنية وتنظيمية مناسبة لحماية البيانات الشخصية من الوصول غير المصرح به أو
          التغيير أو الفقدان أو الاستخدام غير المشروع.
        </LegalParagraph>
        <LegalParagraph>
          كما أن كلمات المرور لا يتم تخزينها في شكلها الأصلي، وإنما في شكل آمن يسمح بالتحقق منها
          دون الاحتفاظ بكلمة المرور نفسها.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="partage" number="4" title="مشاركة البيانات">
        <LegalParagraph>لا نبيع البيانات الشخصية للمستخدمين.</LegalParagraph>
        <LegalParagraph>
          وقد يتم الوصول إلى بعض البيانات أو معالجتها من طرف مقدمي الخدمات التقنيين الذين تعتمد
          عليهم المنصة، وذلك عند الضرورة لتشغيل الخدمة وتأمينها، مع اتخاذ التدابير المناسبة
          لحماية هذه البيانات.
        </LegalParagraph>
        <LegalParagraph>
          في صفحات متجر الكتب فقط (وليس في فضاء التلميذ ولا فضاء الولي)، نستعمل أداة «بكسل ميتا» (Meta
          Pixel) لقياس فعالية إعلاناتنا على فيسبوك وإنستغرام: تُسجَّل زيارة الصفحة وبدء الطلب وإرساله، دون
          إرسال اسمك أو هاتفك أو عنوانك إلى ميتا. يمكنك منع هذا التتبع بإعدادات متصفحك أو بإضافة حجب
          الإعلانات.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="conservation" number="5" title="مدة الاحتفاظ بالبيانات">
        <LegalParagraph>
          نحتفظ بالبيانات الشخصية للمدة اللازمة لتوفير خدمات المنصة وإدارة الحساب، أو للمدة التي
          يفرضها القانون عند الاقتضاء.
        </LegalParagraph>
        <LegalParagraph>
          وعند عدم وجود حاجة للاحتفاظ بالبيانات، يتم حذفها أو التعامل معها وفقًا للقواعد القانونية
          المعمول بها.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="droits" number="6" title="حقوق المستخدم">
        <LegalParagraph>
          وفقًا للتشريعات المتعلقة بحماية البيانات الشخصية، يمكن للمستخدم ممارسة حقوقه، ولا سيما:
        </LegalParagraph>
        <LegalList>
          <li>الحق في الحصول على معلومات حول معالجة بياناته.</li>
          <li>الحق في الوصول إلى بياناته الشخصية.</li>
          <li>الحق في تصحيح البيانات غير الصحيحة.</li>
          <li>الحق في الاعتراض على بعض عمليات معالجة بياناته، عندما يسمح القانون بذلك.</li>
          <li>الحقوق الأخرى التي يمنحها القانون المعمول به.</li>
        </LegalList>
        <LegalParagraph>
          يمكن ممارسة هذه الحقوق من خلال التواصل معنا عبر البريد الإلكتروني: <Mail />
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="mineurs" number="7" title="بيانات الأطفال والقُصّر">
        <LegalParagraph>
          إذا كان المستخدم قاصرًا، فيجب استخدام المنصة وفقًا للقواعد والشروط القانونية المعمول
          بها، وبمشاركة أو إشراف الولي الشرعي عندما يكون ذلك مطلوبًا.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="modifications" number="8" title="تحديث سياسة الخصوصية">
        <LegalParagraph>
          قد نقوم بتحديث هذه السياسة عند تطوير المنصة أو تغيير طريقة معالجة البيانات أو عند ظهور
          متطلبات قانونية جديدة.
        </LegalParagraph>
        <LegalParagraph>
          سيتم نشر النسخة المحدثة على هذه الصفحة مع توضيح تاريخ آخر تحديث.
        </LegalParagraph>
      </LegalSection>

      <LegalSection id="contact" number="9" title="التواصل">
        <LegalParagraph>
          لأي سؤال يتعلق بالخصوصية أو حماية البيانات الشخصية، يمكن التواصل معنا عبر:
        </LegalParagraph>
        <LegalParagraph>
          <strong>Smarter Academy</strong>
          <br />
          <strong>البريد الإلكتروني:</strong> <Mail />
        </LegalParagraph>
      </LegalSection>

      <hr className="my-10 border-slate-200" />
      <LegalParagraph>
        هذه السياسة هي نسخة أولية قابلة للتعديل والتحديث حسب الخدمات الفعلية التي توفرها المنصة
        والمتطلبات القانونية المعمول بها في الجزائر.
      </LegalParagraph>
    </LegalPage>
  );
}
