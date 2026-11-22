import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';

/**
 * Module 3 — أوظّف تعلّماتي (AUTOMATIZE → TRANSFER). Le manuel fourni n'a aucun exercice : six exercices
 * DÉCLARÉS de la plateforme, d'autres nombres que la leçon — un tableau (a négatif), a fractionnaire, un
 * graphique décrit par deux points, la جملة, un taxi-application (transfert), vrai / faux sur la propriété.
 * Une étape = un ou deux exercices ; elle est faite quand chaque partie a reçu une réponse (juste ou fausse).
 * Chaque `requires` est LITTÉRAL (l'audit des dépendances le lit). LP : P1 (1-أ, 2-أ, 6), P2 (1-ب, 2-ب, 3, 4, 5).
 */
export default function Module03Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ns) => ns.every((n) => partsOf(n).every((ex) => done[ex.id]));
  const [e1a, e1b] = partsOf(1);
  const [e2a, e2b] = partsOf(2);
  const [e3] = partsOf(3);
  const [e4] = partsOf(4);
  const [e5a, e5b] = partsOf(5);
  const [e6] = partsOf(6);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="ستّة تمارين: جدول، معامل كسري، مستقيم، جملة، رحلة"
      estimatedTime="9 دقائق"
      objectives={[
        'أحسب المعامل a من جدول أو كسر أو مستقيم',
        'أكتب جملة معادلتين وأحلّها',
        'أعيّن دالة من وضعية واقعية',
      ]}
      brief={{ tag: 'أوظّف تعلّماتي — تمارين من المنصّة', title: 'عددان وصورتاهما في كل مرة', tone: 'amber',
        body: <p><MathText>{'في كل تمرين عددان وصورتاهما، في جدول أو على مستقيم أو في وضعية. احسب $a$ بقسمة فرق الصورتين على فرق العددين، ثم $b$ ، وتحقّق بالعدد الآخر. الخطأ هنا يُصحَّح ولا يُحتسب.'}</MathText></p> }}
      steps={[
        { num: 1, title: 'جدول — معامل سالب', done: all(1),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hisab-muamil-a" variant="rappel" compact />
              <TextbookExercise exercise={e1a} requires={['hisab-muamil-a']} onAnswered={mark(e1a.id)} />
              <TextbookExercise exercise={e1b} requires={['hisab-b']} onAnswered={mark(e1b.id)} />
            </div>
          ) },
        { num: 2, title: 'معامل كسري', done: all(2),
          content: (
            <div className="space-y-3">
              <TextbookExercise exercise={e2a} requires={['hisab-muamil-a', 'hisab-farq-nisbi']} onAnswered={mark(e2a.id)} />
              <TextbookExercise exercise={e2b} requires={['hisab-b', 'hisab-farq-nisbi']} onAnswered={mark(e2b.id)} />
            </div>
          ) },
        { num: 3, title: 'مستقيم يمرّ بنقطتين، ثم جملة', done: all(3, 4),
          content: (
            <div className="space-y-3">
              <TextbookExercise exercise={e3} requires={['hisab-muamil-a', 'hisab-b']} onAnswered={mark(e3.id)} />
              <KnowledgeBrick id="tariqat-jumla-ab" variant="rappel" compact />
              <TextbookExercise exercise={e4} requires={['tariqat-jumla-ab', 'hall-jumla']} onAnswered={mark(e4.id)} />
            </div>
          ) },
        { num: 4, title: 'رحلة بسيارة أجرة', done: all(5),
          content: (
            <div className="space-y-3">
              <TextbookExercise exercise={e5a} requires={['hisab-muamil-a', 'hisab-b']} onAnswered={mark(e5a.id)} />
              <TextbookExercise exercise={e5b} requires={['surat-adad-taalufiya', 'hisab-b']} onAnswered={mark(e5b.id)} />
            </div>
          ) },
        { num: 5, title: 'صحيح أم خاطئ؟', done: all(6),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="burhan-taghayyurat" variant="rappel" compact />
              <TextbookExercise exercise={e6} requires={['tanasub-taghayyurat', 'burhan-taghayyurat']} onAnswered={mark(e6.id)} />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
