import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي (AUTOMATIZE / TRANSFER). Le manuel fourni n'a aucun exercice pour cette unité :
 * les quatre exercices sont des ajouts DÉCLARÉS de la plateforme (content/exercises.js). TRANSFERT : un
 * forfait de téléphone (nouveau contexte), puis la règle nue (images avec signes et fractions,
 * antécédent), puis le classement تآلفية / خطية / ثابتة. Une étape par exercice ; elle est faite quand
 * chaque partie a reçu une réponse (juste ou fausse). LP : P1, P2, P3, P4.
 */
export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (g) => partsOf(g).every((ex) => done[ex.id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="أربعة تمارين من المنصّة"
      estimatedTime="6 دقائق"
      objectives={[
        'أكتب عبارة دالة من وضعية جديدة',
        'أحسب صورًا بإشارات وكسور',
        'أجد عددًا صورته معلومة',
        'أصنّف دالة: خطية أم ثابتة أم تآلفية؟',
      ]}
      brief={{ tag: 'أوظّف تعلّماتي — تمارين من المنصّة', title: 'أطبّق في وضعية جديدة', tone: 'emerald',
        body: <p>اكتب الأعداد العشرية بالفاصلة (مثل 2,5) والسالبة بالإشارة (مثل -4). الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'صيغة الهاتف النقال', done: all('w1'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="taarif-taalufiya" variant="rappel" compact />
              {partsOf('w1').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['taarif-taalufiya', 'sura-taalufiya', 'sabiq-taalufiya']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 2, title: 'صور بإشارات وكسور', done: all('w2'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="sura-taalufiya" variant="rappel" compact />
              {partsOf('w2').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['sura-taalufiya']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 3, title: 'عدد صورته معلومة', done: all('w3'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="sabiq-taalufiya" variant="rappel" compact />
              {partsOf('w3').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['sabiq-taalufiya']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 4, title: 'خطية، ثابتة أم تآلفية؟', done: all('w4'),
          content: (
            <div className="space-y-3">
              {partsOf('w4').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['khattiya-taalufiya', 'thabita']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
