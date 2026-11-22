import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, RANKS, DECOMPOSITION, LAB } from '../content/textbook';

/**
 * Module 2 — معارف 1 (p. 11) et 4 (a) (p. 13), UNE SEULE PISTE (LESSON_DEVELOPMENT_GUIDE §4quater) : l'élève AGIT d'abord —
 * il construit au labo les nombres dictés en lettres (7065, 4 908 732 : `rank-exchange` tâche `dictation`, posé seul) —,
 * répond ensuite sur ce qu'il a construit, et le texte du manuel NOMME après coup (jamais une carte de définitions en
 * tête). Puis le tableau des rangs de 6 392,459 (les rangs décimaux comme NOMS de rangs) et le مفكوك d'un ENTIER
 * (formalisation déclarée ; le مفكوك décimal est la leçon suivante). LP : P1, P2, P3.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

/**
 * Le tableau des rangs du manuel (p. 13) — une île LTR : un nombre s'écrit de gauche à droite. Deux blocs (partie entière,
 * partie décimale) côte à côte dès `sm`, l'un sous l'autre sur un téléphone, pour que chaque en-tête tienne en mots entiers.
 */
function RankBlock({ title, headers, digits, tone }) {
  const cell = 'border border-violet-200 px-1 py-1 text-center leading-tight';
  return (
    <table dir="ltr" className="w-full table-fixed border-collapse text-sm">
      <thead>
        <tr><th colSpan={headers.length} className={`${cell} ${tone.head} font-bold`} dir="rtl">{title}</th></tr>
        <tr>{headers.map((h) => <th key={h} className={`${cell} ${tone.sub} font-semibold`} dir="rtl">{h}</th>)}</tr>
      </thead>
      <tbody>
        <tr className={`text-lg font-extrabold ${tone.digit}`}>{digits.map((d, i) => <td key={i} className={cell}>{d}</td>)}</tr>
      </tbody>
    </table>
  );
}

function RanksTable() {
  return (
    <div dir="ltr" className="flex flex-row items-end gap-0" data-ranks-table>
      <div className="flex-[4]"><RankBlock title="الجزء الصحيح" headers={RANKS.integerHeaders} digits={RANKS.integerDigits} tone={{ head: 'bg-violet-100', sub: 'bg-violet-50', digit: 'text-slate-900' }} /></div>
      <div className="self-end px-0.5 pb-1 text-2xl font-black text-sky-700 block" aria-hidden="true">,</div>
      <div className="flex-[3]"><RankBlock title="الجزء العشري" headers={RANKS.decimalHeaders} digits={RANKS.decimalDigits} tone={{ head: 'bg-sky-100', sub: 'bg-sky-50', digit: 'text-sky-700' }} /></div>
    </div>
  );
}

export default function Module02Maarif() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  return (
    <ContentModule
      objectives={['كيف نقرأ عددًا كبيرًا دون أن نخطئ؟', 'ما رقم كل مرتبة في جدول المراتب؟', 'كيف نكتب عددًا مجموعًا يُظهر قيمة كل رقم؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — كتابة الأعداد الطبيعية"
      moduleSubtitle="فئات · مراتب · مفكوك"
      estimatedTime="12 دقيقة"
      intro={<Manipulation type="rank-exchange" world="tokens" tasks={['dictation']} dictation={LAB.dictation} levels={false} />}
      steps={[
        {
          num: 1, title: 'كيف نقرأ عددًا كبيرًا دون أن نخطئ؟', subtitle: 'بعد الإملاء', done: q1,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>على اللوحة بنيتَ العدد المُملى فئةً بعد فئة. والآن عدد جديد: كيف نجزّئ <bdi dir="ltr">45671</bdi> لنقرأه دون خطأ؟</span>}
                options={[M('$45\\,671$ : من اليمين، ثلاثة أرقام ثلاثة أرقام'), M('$456\\,71$ : من اليسار، ثلاثة أرقام أوّلًا'), M('$4\\,5\\,6\\,7\\,1$ : رقمًا رقمًا')]}
                correct={0} cols={1} requires={['kitabat-adad-ibtidai']}
                explain={<MathText>{`$45\\,671$ : ${KNOWLEDGE.readingExamples[0].words}.`}</MathText>}
                onAnswered={() => setQ1(true)}
              />
              <KnowledgeBrick id="fiaat" lead="من أيّ جهة بدأتَ؟ وكم رقمًا في كل فئة؟" />
            </div>
          ),
        },
        {
          num: 2, title: 'ما رقم كل مرتبة؟', subtitle: 'جدول المراتب', done: q2,
          content: (
            <div className="space-y-3">
              <RanksTable />
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{`في العدد $${RANKS.number}$ :`}</MathText></p>}
                rows={[
                  { id: 'h', label: 'رقم المئات', options: ['3', '6', '4'], correct: 0, correction: 'المرتبة الثالثة من يمين الجزء الصحيح.' },
                  { id: 't', label: 'الرقم 4 هو رقم', options: ['العشرات', 'الأعشار', 'الآلاف'], correct: 1, correction: 'أوّل رقم بعد الفاصلة: الأعشار (الأجزاء من عشرة). العشرات رقمها 9.' },
                  { id: 'c', label: 'رقم الأجزاء من مائة', options: ['5', '9', '2'], correct: 0, correction: 'الرقم الثاني بعد الفاصلة.' },
                ]}
                requires={['maratib-ibtidai']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'تمامًا.' : 'العشرات قبل الفاصلة، والأعشار بعدها.'}</Feedback>}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <TextbookBox kind="property" text={RANKS.box} source={RANKS.source} compact />
                  <TextbookBox kind="example" lines={[KNOWLEDGE.digits, KNOWLEDGE.example2017, KNOWLEDGE.example5]} source={KNOWLEDGE.source} compact />
                  <KnowledgeBrick id="jadwal-maratib" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'أيّ مجموع يُظهر قيمة كل رقم؟', subtitle: 'المفكوك', done: q3,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>أيّ مجموع يساوي <bdi dir="ltr">2017</bdi> ويُظهر قيمة كل رقم؟</span>}
                options={[M('$2 \\times 1000 + 1 \\times 10 + 7$'), M('$2 + 0 + 1 + 7$'), M('$2 \\times 100 + 1 \\times 10 + 7$')]}
                correct={0} cols={1} requires={['jadwal-maratib']}
                explain={<MathText>{DECOMPOSITION.zero}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              <KnowledgeBrick id="mafkuk" lead="اكتب 6392 بنفس الطريقة." />
              <SourceTag source={DECOMPOSITION.source} />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
