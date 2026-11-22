import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : sept exercices de la plateforme qui reprennent l'IDÉE d'éléments du manuel avec d'autres nombres et d'autres contextes (une balance en équilibre — act-3 ; une égalité à deux valeurs — ex-27 ; un tableau de valeurs — ex-28 ; ce qui est vrai
 * pour tout x — ex-30, now-61, deep-55 ; une valeur parmi des valeurs données — ex-31 ; une inégalité parmi des valeurs — act-3 ; un tableau des deux membres — ict). Les erreurs sont corrigées, jamais comptées. LP : P1, P2, P3.
 */
const STEPS = [
  { id: 'ex-1', title: 'ميزان متوازن', requires: ['majhulan'] },
  { id: 'ex-2', title: 'اختبار مساواة', requires: ['tawid-wa-hisab'] },
  { id: 'ex-3', title: 'جدول قيم', requires: ['musawat-qima'] },
  { id: 'ex-4', title: 'صحيحة دائمًا؟', requires: ['tasawi-ibaratayn'] },
  { id: 'ex-5', title: 'قيمة من بين قيم', requires: ['qiyam-muhaqqiqa'] },
  { id: 'ex-6', title: 'متباينة', requires: ['hadd'] },
  { id: 'ex-7', title: 'جدول الطرفين', requires: ['jadwal-ikhtibar'] },
];

export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  return (
    <ContentModule
      objectives={['أختبر مساواة بقيمة أو بقيمتين', 'أميّز المساواة الصحيحة دائمًا بمثال مضادّ', 'أعيّن القيم التي تحقّق متباينة من بين قيم معطاة']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="المساواة والمتباينة والمثال المضادّ"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'سبعة تمارين', tone: 'amber',
        body: <p>سبعة تمارين بأعداد جديدة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={STEPS.map((s, i) => ({
        num: i + 1, title: s.title, done: !!done[s.id],
        content: (
          <div className="space-y-3">
            <TextbookExercise exercise={EX[s.id]} requires={s.requires} onAnswered={mark(s.id)} />
          </div>
        ),
      }))}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
