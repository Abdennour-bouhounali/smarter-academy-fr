import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي (AUTOMATIZE → TRANSFER). Trois situations de la PLATEFORME
 * (content/exercises.js, `interaction_generation`) dans la vie d'un élève algérien : le temps d'écran de
 * deux amis (P2 : moyenne, médiane, étendue), les billets du derby (P3 : moyenne de deux tribunes), la
 * campagne de nettoyage de la plage (P2 : la valeur extrême et l'indicateur qui décrit un jour ordinaire).
 * Chaque étape est faite quand l'exercice a reçu une réponse (juste ou fausse).
 */
export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));

  return (
    <ContentModule
      objectives={["كيف أقارن سلسلتين بمؤشّرين قبل أن أقرّر؟", "كيف تؤثّر قيمة متطرّفة في ما أستنتجه؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="الهاتف، الدربي، الشاطئ"
      estimatedTime="7 دقائق"
      brief={{ tag: 'تمارين من المنصّة', title: 'أحسب المؤشرات، أقارن، ثم أقرّر', tone: 'amber',
        body: <p>في كل تمرين: اقرأ المعطيات، احسب مؤشر موقع ومؤشر تشتت، ثم قرّر وبرّر. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'مدّة استعمال الهاتف', done: !!done.ecran,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="mawqi-tashattut" variant="rappel" compact />
              <TextbookExercise exercise={EX.ecran} requires={['mawqi-tashattut', 'hadhf-qiyam']} onAnswered={mark('ecran')} />
            </div>
          ) },
        { num: 2, title: 'تذاكر الدربي', subtitle: 'جناحان', done: !!done.derby,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="mutawassit-majmuat" variant="rappel" compact />
              <TextbookExercise exercise={EX.derby} requires={['mutawassit-majmuat']} onAnswered={mark('derby')} />
            </div>
          ) },
        { num: 3, title: 'حملة تنظيف الشاطئ', subtitle: 'قيمة متطرفة', done: !!done.shati,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqat-qarar" variant="rappel" compact />
              <TextbookExercise exercise={EX.shati} requires={['hadhf-qiyam', 'tariqat-qarar']} onAnswered={mark('shati')} />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
