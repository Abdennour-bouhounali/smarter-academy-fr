import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي : le scan n'a pas d'exercices (pp. 170 et suivantes absentes) ; quatre exercices de la plateforme,
 * déclarés (`interaction_generation`), un par point : la pastèque (P1, rayon puis contact), le gâteau de l'Aïd (P2, l'arête),
 * le silo (P3, l'axe), la couche de l'imprimante (P4, la réduction). AUTOMATIZE puis TRANSFER (des objets du quotidien).
 * Une étape par exercice, faite quand chaque partie a reçu une réponse.
 */
function Block({ g, requires, mark }) {
  return partsOf(g).map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={requires} onAnswered={mark(ex.id)} />);
}

export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (g) => partsOf(g).every((ex) => done[ex.id]);

  return (
    <ContentModule
      objectives={["سأحدّد طبيعة المقطع حسب اتجاه المستوي", "سأحسب أبعاد المقطع"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين من المنصّة: دلّاعة، كعكة، صومعة، وطبقة هرم"
      estimatedTime="7 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — تمارين من المنصّة', title: 'مقاطع في الحياة اليومية', tone: 'amber',
        body: <p>صفحات تمارين هذه الوحدة غير موجودة في الصفحات المتوفرة من الكتاب: هذه تمارين من المنصّة. لكل مقطع: اتجاه المستوي أولا، ثم خاصية فيثاغورس أو نسبة التصغير. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'دلّاعة السوق', done: all('w1'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqat-nisf-qutr" variant="rappel" compact />
              <Block g="w1" requires={['maqta-kura', 'tariqat-nisf-qutr']} done={done} mark={mark} />
            </div>
          ) },
        { num: 2, title: 'كعكة العيد', done: all('w3'),
          content: <div className="space-y-3"><Block g="w3" requires={['maqta-balata']} done={done} mark={mark} /></div> },
        { num: 3, title: 'صومعة الحبوب', done: all('w2'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqat-ustuwana" variant="rappel" compact />
              <Block g="w2" requires={['maqta-ustuwana', 'tariqat-ustuwana']} done={done} mark={mark} />
            </div>
          ) },
        { num: 4, title: 'طبقة هرم في الطابعة', done: all('w4'),
          content: <div className="space-y-3"><Block g="w4" requires={['maqta-haram']} done={done} mark={mark} /></div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
