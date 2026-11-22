import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import MathText from '../../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf, EX } from '../content/exercises';
import GraphFigure from '../components/GraphFigure';

/**
 * Module 3 — أوظّف تعلّماتي (p. 72–73) et أتعمّق (p. 75) : exercices 2, 10 → 15, 30, 33. Une étape par
 * exercice ; elle est faite quand chaque partie a reçu une réponse (juste ou fausse). Les figures des
 * exercices 11, 12 et 33 sont dessinées (components/GraphFigure), à partir de la figure du livre
 * (extraction › figure / reading). تمرين 13 : la notation de h corrigée (une ligne discrète) ;
 * تمرين 14 : gardé tel quel — aucune point n'est sur (D), le piège du signe est dit explicitement.
 * LP : P1 (2, 13, 14, 15, 30), P2 (10, 11, 12, 15, 33), P3 (14).
 */
export default function Module03Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ns) => ns.every((n) => partsOf(n).every((ex) => done[ex.id]));
  const list = (n, requires) => partsOf(n).map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={requires} onAnswered={mark(ex.id)} />);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      objectives={["كيف أرسم تمثيل دالة خطية وأقرأ عليه؟", "كيف أتحقّق من انتماء نقطة إلى مستقيم؟", "كيف أعيّن الدالة من نقطة معلومة؟"]}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 2، 10 ← 15، 30 و 33"
      estimatedTime="12 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 72–75', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>نرسم بنقطة ثانية، نقرأ على الشكل، ونتحقّق من انتماء نقطة بحساب صورة فاصلتها. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 2 — مستقيم يشمل A', done: all('2'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tamthil-mustaqim" variant="rappel" compact />
              {list('2', ['tamthil-mustaqim', 'tayin-muamil'])}
            </div>
          ) },
        { num: 2, title: 'تمرين 10 — أتمم الجدول', done: all('10'),
          content: <div className="space-y-3">{list('10', ['tamthil-mustaqim', 'tayin-muamil'])}</div> },
        { num: 3, title: 'تمرين 11 — أعداد كبيرة', done: all('11'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="qiraa-bayaniya" variant="rappel" compact />
              <GraphFigure testId="ex-11" win={{ xMin: 0, xMax: 500, yMin: 0, yMax: 100 }} xStep={100} yStep={20}
                lines={[{ a: 0.2, label: '(D)' }]} points={[{ x: 400, y: 80 }]} reads={[{ x: 400, y: 80 }]}
                caption="الشكل: المستقيم (D) يشمل المبدأ والنقطة (400 ; 80)." />
              {list('11', ['qiraa-bayaniya'])}
            </div>
          ) },
        { num: 4, title: 'تمرين 12 — سعر الفواكه', done: all('12'),
          content: (
            <div className="space-y-3">
              <GraphFigure testId="ex-12" win={{ xMin: 0, xMax: 3, yMin: 0, yMax: 250 }} xStep={0.5} yStep={25} every={{ x: 2, y: 2 }}
                lines={[{ a: 80 }]} xLabel="الكتلة (kg)" yLabel="السعر (DA)"
                caption="الشكل: مستقيم يشمل المبدأ؛ الكتلة من 0 إلى 3 والسعر من 0 إلى 250." />
              {list('12', ['qiraa-bayaniya'])}
            </div>
          ) },
        { num: 5, title: 'تمرين 13 — ثلاث دوال', done: all('13'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="rasm-tamthil" variant="rappel" compact />
              <p className="text-xs text-slate-500" data-correction="ex-13"><MathText>{EX['ex-13'].correctionNote}</MathText></p>
              {list('13', ['rasm-tamthil', 'munha-mustaqim'])}
            </div>
          ) },
        { num: 6, title: 'تمرين 14 — انتبه إلى الإشارة', done: all('14'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="munha-mustaqim" variant="rappel" compact />
              {list('14', ['tamthil-mustaqim', 'munha-mustaqim'])}
            </div>
          ) },
        { num: 7, title: 'تمرين 15 — دالة من صورة عدد', done: all('15'),
          content: <div className="space-y-3">{list('15', ['rasm-tamthil', 'qiraa-bayaniya', 'tayin-muamil'])}</div> },
        { num: 8, title: 'أتعمّق — تمرينا 30 و 33', done: all('30', '33'),
          content: (
            <div className="space-y-3">
              {list('30', ['rasm-tamthil', 'tayin-muamil'])}
              <GraphFigure testId="ex-33" win={{ xMin: -3, xMax: 3, yMin: -6, yMax: 6 }} every={{ x: 1, y: 2 }}
                lines={[{ a: -2.5, label: 'y = −2,5x', color: '#E11D48' }]}
                hlines={[{ y: 4, label: 'y = 4', color: '#7C3AED' }, { y: 3, label: 'y = 3', color: '#0EA5E9' }]}
                caption="الشكل: المستقيم الذي معادلته y = −2,5x والمستقيمان الأفقيان y = 4 و y = 3." />
              {list('33', ['qiraa-bayaniya'])}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
