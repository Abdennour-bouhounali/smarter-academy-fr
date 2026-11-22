import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 3 — أوظّف تعلّماتي : neuf exercices de la PLATEFORME (content/exercises.js), réécrits le 2026-11-11 (conseil L1.7, SHARED :
 * la page de l'enseignant y gagne aussi) — ils couvrent les compétences de دوري الآن 1 (p. 35) et des exercices 1 à 8 (p. 37) avec les nombres,
 * les contextes et la rédaction de la plateforme ; les titres ne numérotent plus les exercices du livre. Les exercices 6 et 8 font JUGER le travail
 * de deux élèves. Laboratoire : les erreurs sont corrigées, jamais comptées comme preuve de maîtrise. LP : P2, P3, P4.
 */
export default function Module03Awazzif() {
  const [done, setDone] = useState({});
  const mark = (k) => () => setDone((d) => ({ ...d, [k]: true }));
  return (
    <ContentModule
      ctx={MODULE_CTX}
      objectives={["كيف أنشر عبارة وأبسّطها بخطوات مرتّبة؟", "كيف أتحقّق من النشر بقيمة للحرف؟", "أين أخطأ تلميذان في النشر؟"]}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="انشر، بسّط، وتحقّق"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'نشر عبارة جبرية وتبسيطها', tone: 'amber',
        body: <p>تسعة تمارين متدرّجة. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'أوّل تدريب: جداء قوسين', subtitle: 'انشر وبسّط', done: !!done.now,
          content: <div className="space-y-3"><KnowledgeBrick id="nashr-qawsayn" variant="rappel" compact /><TextbookExercise exercise={EX['now-35-1']} requires={['nashr-qawsayn', 'tabsit']} onAnswered={mark('now')} /></div> },
        { num: 2, title: 'عدد في مجموع أو فرق', done: !!done.e1,
          content: <TextbookExercise exercise={EX['ex-1']} requires={['tawziiya-nashr']} onAnswered={mark('e1')} /> },
        { num: 3, title: 'نشر وتحقّق بقيمة', done: !!done.e2,
          content: <TextbookExercise exercise={EX['ex-2']} requires={['nashr-qawsayn', 'tabsit']} onAnswered={mark('e2')} /> },
        { num: 4, title: 'أربعة جداءات', done: !!done.e3,
          content: <TextbookExercise exercise={EX['ex-3']} requires={['nashr-qawsayn', 'tabsit']} onAnswered={mark('e3')} /> },
        { num: 5, title: 'بالكسور، وتحقّق', done: !!done.e4,
          content: <TextbookExercise exercise={EX['ex-4']} requires={['nashr-qawsayn', 'tabsit']} onAnswered={mark('e4')} /> },
        { num: 6, title: 'بالكسور', done: !!done.e5,
          content: <TextbookExercise exercise={EX['ex-5']} requires={['nashr-qawsayn', 'tabsit']} onAnswered={mark('e5')} /> },
        { num: 7, title: 'إجابتا تلميذين', done: !!done.e6,
          content: <TextbookExercise exercise={EX['ex-6']} requires={['tabsit', 'hadhf-aqwas']} onAnswered={mark('e6')} /> },
        { num: 8, title: 'أقواس مسبوقة بإشارة ناقص', done: !!done.e7,
          content: <TextbookExercise exercise={EX['ex-7']} requires={['tabsit', 'hadhf-aqwas']} onAnswered={mark('e7')} /> },
        { num: 9, title: 'طريقتان لعبارة واحدة', done: !!done.e8,
          content: <TextbookExercise exercise={EX['ex-8']} requires={['tawziiya-nashr', 'nashr-qawsayn']} onAnswered={mark('e8')} /> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
