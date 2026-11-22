import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import ArcTape from '../../../../../../common/components/ArcTape';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';
import { TAPES } from '../content/textbook';

/**
 * Module 4 — أتمرّن (p. 30) : exercices 1 (les mots), 16 (représenter puis trouver le nombre manquant — les deux pièges
 * où le signe « − » appelle une addition), 17 (la remorque : « يزيد » mais −), et أتعمّق 8 (p. 32, le pourtour du
 * jardin). Laboratoire : les erreurs sont corrigées, jamais comptées. LP : P1, P2, P3.
 */
export default function Module04Awazzif() {
  const [d1, setD1] = useState(false);
  const [d2, setD2] = useState(false);
  const [d3, setD3] = useState(false);
  const [d4, setD4] = useState(false);
  return (
    <ContentModule
      objectives={['أسمّي المجموع والفرق', 'أمثّل مساواة بمخطط قبل أن أحسب', 'أحلّ مشكلات فيها «يزيد»']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="تمارين الكتاب 1 ، 16 و 17 ، وتمرين من أتعمّق"
      estimatedTime="10 دقائق"
      brief={{
        tag: 'أتمرّن — الكتاب ص 30 و 32', title: 'أربعة تمارين من الكتاب', tone: 'amber',
        body: <p>نفس التمارين، بنفس الأعداد. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p>,
      }}
      steps={[
        { num: 1, title: 'تمرين 1 — العبارة المناسبة', done: d1,
          content: <TextbookExercise exercise={EX['ex-1']} requires={['majmu-hadda', 'farq-hadda']} onAnswered={() => setD1(true)} /> },
        { num: 2, title: 'تمرين 16 — أين العدد الناقص؟', done: d2,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tamthil-aqwas" variant="rappel" compact />
              <TextbookExercise exercise={EX['ex-16']} requires={['tamthil-aqwas']} onAnswered={() => setD2(true)} />
            </div>
          ) },
        { num: 3, title: 'تمرين 17 — الشاحنة والعربة', done: d3,
          content: (
            <div className="space-y-3">
              <ArcTape {...TAPES.ex17} />
              <TextbookExercise exercise={EX['ex-17']} requires={['ikhtiyar-amaliya']} onAnswered={() => setD3(true)} />
            </div>
          ) },
        { num: 4, title: 'أتعمّق 8 — مدخل الحديقة', done: d4,
          content: <TextbookExercise exercise={EX['deep-8']} requires={['ikhtiyar-amaliya']} onAnswered={() => setD4(true)} /> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
