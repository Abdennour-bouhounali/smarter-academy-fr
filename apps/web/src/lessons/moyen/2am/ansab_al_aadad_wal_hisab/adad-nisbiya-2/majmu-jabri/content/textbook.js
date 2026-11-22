/**
 * Le contenu du درس « حساب مجموع جبري » (2AM, unité 3) — données pures. Le manuel est la RÉFÉRENCE (docs/sources/2am/unit3/extraction.json :
 * act-6 p. 41 ; know-2d, know-2e p. 44 ; method-5 p. 45 ; ex-29, ex-36, ex-37 p. 48 ; self-10, self-11 p. 49 ; deep-39, 43, 44, 46, 58 pp. 50–51) ; chaque texte montré
 * à l'élève est RÉÉCRIT par la plateforme (guide §4ter-bis : mêmes notions et notations, autres mots, autres exemples, autres nombres). La `source`
 * de chaque bloc garde la traçabilité (`check:textbook`) ; `SourceTag` est muet pour l'élève.
 */
import { src, addition } from '../../_unit/unitMeta.js';

/**
 * LE LABO — « شدّ الحبل » (`tug-rope`, monde `tugfield`) : expérience de la plateforme. معارف : le même labo posé seul, une chaîne de quatre termes
 * dont deux sont précédés de « − » (lecture seule des règles, après l'action).
 */
export const LAB = {
  source: addition('platform_designed_entry'),
  alone: { tasks: [{ id: 'm1', chain: '(-11)-(+6)-(-9)-(+4)' }] },
};

/** « تذكّر » AVEC lien : la leçon `jam-tarh-nisbiya` de l'unité (PUBLIÉE). RAPPELÉE, jamais reconstruite. */
export const RECALL_JAM = {
  source: addition('prior_year_reminder'),
  title: 'تذكّر — جمع وطرح عددين',
  text: 'لجمع عددين نسبيين من الإشارة نفسها نجمع مسافتيهما ونحتفظ بالإشارة، ومن إشارتين مختلفتين نطرح الصغرى من الكبرى ونأخذ إشارة الأبعد عن الصفر ؛ ولطرح عدد نضيف معاكسه: $(+5)-(-7)=(+5)+(+7)=(+12)$ .',
  lesson: 'jam-tarh-nisbiya',
};

/** معارف 2 (p. 44) — les définitions et la convention, RÉÉCRITES avec les mots de la plateforme. */
export const KNOWLEDGE = {
  definition: {
    source: src('know-2d', 44, 'معارف'),
    text: 'المجموع الجبري سلسلة جمع وطرح لأعداد نسبية، يُكتب كلّ عدد منها بين قوسين مع إشارته. وكلّ طرح فيه يصير جمعًا لمعاكس العدد: $(-9)-(+2)+(-5)-(-4)=(-9)+(-2)+(-5)+(+4)$ .',
  },
  move: {
    source: src('know-2d', 44, 'معارف'),
    text: 'بعد تحويل كلّ طرح إلى جمع، يمكن تغيير ترتيب الحدود وتجميع الحدود الموجبة معًا والحدود السالبة معًا؛ والحدّان المتعاكسان مجموعهما معدوم فيمكن حذفهما.',
    example: 'مثال: $(+7)-(+9)+(-4)+(-2)=(+7)+(-9)+(-4)+(-2)=(+7)+(-15)=(-8)$ .',
  },
  simplified: {
    source: src('know-2e', 44, 'معارف'),
    text: 'نبسّط كتابة المجموع الجبري بحذف إشارة الجمع وأقواس كلّ عدد، فيحتفظ كلّ عدد بإشارته: $(+7)-(+9)+(-4)+(-2)$ تُكتب $7-9-4-2$ . ونقرأ عبارة مثل $-6+10-4$ حدًّا حدًّا بإشاراتها.',
    example: 'مثال: $-6+10-4=(-6)+(+10)+(-4)=0$ .',
  },
  brackets: {
    source: addition('knowledge_formalization'),
    text: 'إذا وُجدت أقواس ضمن المجموع الجبري حسبنا ما بينها أوّلًا، فيصير ناتجها حدًّا واحدًا نكمل به الحساب، ومعه الإشارة التي تسبقه.',
  },
};

/** طريقة 5 (p. 45) — la plateforme écrit sa méthode (autres nombres). */
export const METHOD = {
  chain: {
    source: src('method-5', 45, 'طرائق'),
    exercise: 'احسب $S=(+7)-(+9)+(-4)+(-2)$ .',
    solution: [
      'نحوّل الطرح إلى جمع المعاكس: $S=(+7)+(-9)+(-4)+(-2)$ .',
      'نجمع الحدود السالبة معًا: $(-9)+(-4)+(-2)=(-15)$ .',
      'ثم نجمع الناتجين: $S=(+7)+(-15)=(-8)$ .',
    ],
    rule: [
      'لحساب مجموع جبري:',
      'نحوّل كلّ طرح إلى جمع المعاكس.',
      'نجمع الحدود الموجبة معًا والسالبة معًا كلًّا على حدة، ثم نطبّق قاعدة جمع عددين على الناتجين.',
    ],
  },
  simple: {
    source: src('method-5', 45, 'طرائق'),
    exercise: 'احسب $T=6-11+4{,}5-2{,}5$ .',
    solution: [
      'كلّ عدد يحتفظ بإشارته: الحدود الموجبة $6$ و $4{,}5$ ، والسالبة $-11$ و $-2{,}5$ .',
      'مجموع الموجبة $6+4{,}5=10{,}5$ ، ومجموع السالبة $-(11+2{,}5)=-13{,}5$ .',
      '$T=10{,}5+(-13{,}5)=-3$ .',
    ],
    rule: [
      'لحساب مجموع مكتوب في شكله المبسّط:',
      'نقرأ كلّ عدد بإشارته.',
      'نجمع الموجبة معًا والسالبة معًا ثم نجمع الناتجين.',
    ],
  },
  brackets: {
    source: addition('knowledge_formalization'),
    exercise: 'احسب $U=(+18)-[(-9)-(+6)]$ .',
    solution: [
      'نحسب ما بين القوسين أوّلًا: $(-9)-(+6)=(-9)+(-6)=(-15)$ .',
      'يبقى $U=(+18)-(-15)$ .',
      'نضيف معاكس $-15$ : $U=(+18)+(+15)=(+33)$ .',
    ],
    rule: [
      'لحساب مجموع جبري فيه أقواس:',
      'نحسب ما بين الأقواس أوّلًا.',
      'ثم نكمل بالطريقة السابقة مع الحدّ الجديد.',
    ],
  },
};

/** « أستعدّ » — ست عبارات de la PLATEFORME : elles mesurent les liens « راجع » du réseau (2am.m4.r05 : جمع وطرح عددين ; 2am.m1.r02 : الأقواس). JAMAIS bloquant. */
export const PREP_ITEMS = [];
export const PREP_PLATFORM_ITEMS = [
  { skill: 'same', text: '$(-6)+(-9)=(-15)$ .', answer: true, why: 'الإشارتان متّفقتان: $6+9=15$ ونحتفظ بالإشارة $-$ .' },
  { skill: 'sub', text: '$(+4)-(-7)=(-3)$ .', answer: false, why: 'نضيف معاكس $-7$ : $(+4)+(+7)=(+11)$ .' },
  { skill: 'opp', text: '$(-2{,}5)+(+2{,}5)=0$ .', answer: true, why: 'العددان متعاكسان فمجموعهما معدوم.' },
  { skill: 'brk', text: '$20-(8-3)=9$ .', answer: false, why: 'نحسب ما بين القوسين أوّلًا: $8-3=5$ ثم $20-5=15$ .' },
  { skill: 'nest', text: '$30-[12-(5+2)]=25$ .', answer: true, why: 'الداخل أوّلًا: $5+2=7$ ثم $12-7=5$ ثم $30-5=25$ .' },
  { skill: 'conv', text: '$(-5)-(+3)$ يساوي $(-5)+(-3)$ .', answer: true, why: 'طرح $(+3)$ هو إضافة معاكسه $(-3)$ .' },
].map((it) => ({ ...it, source: addition('prerequisite_diagnostic') }));

/** Les phrases de correction partagées par les modules ET la carte (knowledgeGraph.js les cite mot pour mot). */
export const GUIDE = {
  noTurn: {
    wrong: 'نكتب $(-8)-(+3)$ هكذا $(-8)+(+3)$ ونُبقي العدد $+3$ كما هو.',
    why: 'الطفل الذي تسبقه إشارة − يستدير فيجرّ مع الفريق الآخر.',
    right: '$(-8)-(+3)=(-8)+(-3)=(-11)$ .',
  },
  signDrop: {
    wrong: 'نكتب $(+5)-(+6)$ هكذا $5+6$ لأنّنا حذفنا الأقواس.',
    why: 'نحذف إشارة الجمع والأقواس فقط: إشارة الطرح تبقى.',
    right: '$(+5)-(+6)=5-6=-1$ .',
  },
  allNeg: {
    wrong: 'نحكم بأنّ $-9+4-6+11$ سالب لأنّه يبدأ بإشارة −.',
    why: 'الإشارة الأولى تخصّ العدد $9$ وحده.',
    right: '$-9+4-6+11=15-15=0$ .',
  },
};
