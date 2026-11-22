import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX19_NOTE } from '../content/textbook';
import { partsOf } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي, groupe « المعادلات من الشكل (ax + b)(cx + d) = 0 » : sept exercices en nombres de la plateforme (rollout 2026-11-11,
 * verdict X2). Une étape par exercice ; elle est faite quand chaque question a reçu une réponse (juste ou fausse). L'exercice 6 annonce « جداء
 * عاملين من الدرجة الأولى » alors que p = 14(x + 7) : une ligne discrète le dit. `partsOf` donne à chaque partie son énoncé (pas d'aller-retour).
 * LP : P1, P2, P3.
 */
export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);

  return (
    <ContentModule
      objectives={["كيف أتعرّف على معادلة جداء معدوم وأحلّها؟", "متى أحتاج إلى التحليل قبل الحلّ؟", "ماذا أفعل عندما يكون أحد العاملين عددًا ثابتًا؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="سبعة تمارين متدرّجة"
      estimatedTime="8 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'سبعة تمارين', tone: 'amber',
        body: <p>لكل معادلة اختر حلولها، ولكل عبارة تحليلها، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'معادلات جداء معدوم', done: all('14'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hulul-muadala-jidaa" variant="rappel" compact />
              {partsOf('14').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['hulul-muadala-jidaa']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 2, title: 'عامل مشترك', done: all('15'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqat-jidaa-maadum" variant="rappel" compact />
              {partsOf('15').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-jidaa-maadum']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 3, title: 'قوس مشترك', done: all('16'),
          content: (
            <div className="space-y-3">
              {partsOf('16').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-jidaa-maadum']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 4, title: 'فرق مربّعين', done: all('17'),
          content: (
            <div className="space-y-3">
              {partsOf('17').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-jidaa-maadum', 'tahlil-huwiya']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 5, title: 'تحليل على مراحل', done: all('18'),
          content: (
            <div className="space-y-3">
              {partsOf('18').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-jidaa-maadum', 'tahlil-huwiya']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
        { num: 6, title: 'متطابقتان ثم عامل مشترك', done: all('19'),
          content: (
            <div className="space-y-3">
              {partsOf('19').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-jidaa-maadum', 'tahlil-huwiya']} onAnswered={mark(ex.id)} />)}
              <TextbookBox kind="remark" text={EX19_NOTE.text} source={EX19_NOTE.source} compact />
            </div>
          ) },
        { num: 7, title: 'استنتج تحليلًا', done: all('20'),
          content: (
            <div className="space-y-3">
              {partsOf('20').map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={['tariqat-jidaa-maadum', 'tahlil-huwiya']} onAnswered={mark(ex.id)} />)}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
