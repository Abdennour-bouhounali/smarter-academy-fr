import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise, SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EXERCISES } from '../content/exercises';
import { PLATFORM_SOURCE } from '../content/textbook';

/**
 * Module 4 — أوظّف تعلّماتي. Le scan n'a AUCUN exercice (pp. 170 et suivantes manquent) : cinq exercices de la plateforme,
 * déclarés (`interaction_generation`), dans des contextes algériens — la balle de l'équipe nationale (k depuis deux rayons),
 * le jeu de construction (k, k², k³), la pyramide coupée (k³ = 1/27), le plan d'appartement (k² = 10 000), le porte-clés
 * imprimé en 3D (k³ = 125 000 et les litres). Une étape par exercice, faite à la réponse. LP : P1, P2.
 */
const ex = (id) => EXERCISES.find((e) => e.id === id);

export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));

  return (
    <ContentModule
      objectives={["سأحدّد النسبة $k$ في كل وضعية", "سأقرّر هل المطلوب طولا أم مساحة أم حجما"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="خمسة تمارين من المنصّة"
      estimatedTime="7 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — تمارين من المنصّة', title: 'خمسة تمارين من المنصّة', tone: 'amber',
        body: <p>الكتاب المتوفّر لا يضمّ تمارين لهذا الدرس: هذه تمارين المنصّة. في كل تمرين: من أي مجسّم إلى أي مجسّم؟ وماذا يطلب السؤال بالضبط؟ الخطأ هنا يُصحَّح ولا يُحتسب.</p>,
        footer: <SourceTag source={PLATFORM_SOURCE} /> }}
      steps={[
        { num: 1, title: 'كرة الفريق الوطني', done: !!done['aw-1'],
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqat-k" variant="rappel" compact />
              <TextbookExercise exercise={ex('aw-1')} requires={['tariqat-k']} onAnswered={mark('aw-1')} />
            </div>
          ) },
        { num: 2, title: 'مكعّب في لعبة البناء', done: !!done['aw-2'],
          content: <TextbookExercise exercise={ex('aw-2')} requires={['takbir-khassiya']} onAnswered={mark('aw-2')} /> },
        { num: 3, title: 'هرم يقطعه مستو', done: !!done['aw-3'],
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="maqta-tasghir" variant="rappel" compact />
              <TextbookExercise exercise={ex('aw-3')} requires={['maqta-tasghir', 'tariqat-maqadir']} onAnswered={mark('aw-3')} />
            </div>
          ) },
        { num: 4, title: 'مخطّط شقة', done: !!done['aw-4'],
          content: <TextbookExercise exercise={ex('aw-4')} requires={['tariqat-maqadir']} onAnswered={mark('aw-4')} /> },
        { num: 5, title: 'ميدالية مطبوعة', done: !!done['aw-5'],
          content: <TextbookExercise exercise={ex('aw-5')} requires={['tariqat-maqadir']} onAnswered={mark('aw-5')} /> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
