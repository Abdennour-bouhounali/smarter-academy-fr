import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي. Le scan s'arrête p. 169 : aucun exercice du manuel pour ce درس ; les cinq exercices sont des
 * ajouts DÉCLARÉS de la plateforme (content/exercises.js, « مثال تفاعلي إضافي »), en contextes algériens.
 * AUTOMATIZE : le ballon de l'équipe nationale (diamètre → aire arrondie), la coupole d'une mosquée (demi-sphère), le
 * château d'eau de la commune (volume arrondi), la bille (exact, puis au dixième, puis au centième).
 * TRANSFER : la balle de ping-pong dans son étui (Archimède dans un objet du quotidien). Une étape par exercice.
 */
export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const one = (id, requires) => <TextbookExercise exercise={EX[id]} requires={requires} onAnswered={mark(id)} />;

  return (
    <ContentModule
      objectives={["سأحسب مساحة كرة وحجم جلة من قطرها", "سأكتب القيمة المضبوطة ثم أدوّر في آخر الحساب"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="كرات وقباب وخزانات من حولنا"
      estimatedTime="8 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — تمارين من المنصّة', title: 'القانونان في وضعيات من حياتنا', tone: 'rose',
        body: <p>خمسة تمارين من حياتنا: كرة، قبّة، خزّان، كرية وعلبة. استعمل ما اكتشفته وطبّق الطريقة التي كتبتها. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'كرة المنتخب الوطني', done: !!done['ex-p1'],
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqa-hisab" variant="rappel" compact />
              {one('ex-p1', ['misahat-kura', 'tariqa-hisab'])}
            </div>
          ) },
        { num: 2, title: 'قبّة المسجد', done: !!done['ex-p2'], content: one('ex-p2', ['misahat-kura']) },
        { num: 3, title: 'خزان البلدية', done: !!done['ex-p3'], content: one('ex-p3', ['hajm-julla', 'qima-muqarraba']) },
        { num: 4, title: 'الكرية الزجاجية', done: !!done['ex-p4'],
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="qima-muqarraba" variant="rappel" compact />
              {one('ex-p4', ['hajm-julla', 'qima-muqarraba'])}
            </div>
          ) },
        { num: 5, title: 'كرة الطاولة في علبتها', done: !!done['ex-p5'], content: one('ex-p5', ['arkhimidis-hajm', 'hajm-julla']) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
