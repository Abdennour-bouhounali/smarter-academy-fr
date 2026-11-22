import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي (p. 123 « العلاقات المثلثية » : ex-16 … ex-19 ; « إنشاءات هندسية » : ex-20 … ex-22 ;
 * p. 125 « أتعمّق » : ex-30). AUTOMATIZE : ex-16 et ex-17 (une relation, sans calculatrice), ex-18 (« إن أمكن » :
 * 3/2 et √5/2 sont IMPOSSIBLES — décision de lecture de l'extraction). TRANSFER : ex-19 et ex-30 (les angles
 * remarquables 30°, 45°, 60° tirés du triangle équilatéral et du carré), ex-20 … ex-22 (constructions : quel nombre
 * devient l'hypoténuse, où est l'angle, ce que dit la calculatrice). Une étape est faite quand chaque partie a reçu
 * une réponse (juste ou fausse).
 */
export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ns) => ns.every((n) => partsOf(n).every((ex) => done[ex.id]));
  const block = (n, requires) => partsOf(n).map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={requires} onAnswered={mark(ex.id)} />);

  return (
    <ContentModule
      objectives={['أحسب نسبة مثلثية من نسبة أخرى دون حاسبة', 'أتحقّق من إمكان الحساب قبل أن أبدأ', 'أنشئ زاوية علمت إحدى نسبها']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 16 إلى 22 و 30"
      estimatedTime="10 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 123 و 125', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>القيم المضبوطة تُحسب بالعلاقتين دون حاسبة؛ والإنشاء يُنجز على الورق بالكوس والمسطرة والمدور — هنا نتحقّق من خطواته. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرينا 16 و 17 — نسبة من نسبة', done: all('16', '17'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hisab-nisba" variant="rappel" compact />
              {block('16', ['hisab-nisba', 'murabba-jadhr'])}
              {block('17', ['hisab-nisba', 'alaqatan'])}
            </div>
          ) },
        { num: 2, title: 'تمرين 18 — إن أمكن', done: all('18'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="shart-imkan" variant="rappel" compact />
              {block('18', ['shart-imkan', 'hisab-nisba', 'tabsit-jadhr'])}
            </div>
          ) },
        { num: 3, title: 'تمرينا 19 و 30 — زوايا 30° و 45° و 60°', done: all('19', '30'),
          content: <div className="space-y-3">{block('19', ['alaqatan', 'fithaghuris'])}{block('30', ['alaqatan', 'fithaghuris'])}</div> },
        { num: 4, title: 'تمارين 20 و 21 و 22 — إنشاءات', done: all('20', '21', '22'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="insha-zawiya" variant="rappel" compact />
              {block('20', ['insha-zawiya'])}
              {block('21', ['insha-zawiya'])}
              {block('22', ['insha-zawiya'])}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
