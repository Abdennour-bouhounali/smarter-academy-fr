import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import GeoFigure from '../../../../../../common/components/GeoFigure';
import MathText from '../../../../../../common/components/MathText';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';
import { KNOW_LINES } from '../content/textbook';
import { FIG_EX20 } from '../content/figures';

/**
 * Module 4 — أوظّف تعلّماتي (p. 147, « إحداثيتا منتصف قطعة - المسافة بين نقطتين »).
 * AUTOMATIZE : ex-10 (deux milieux, dont J tel que JB = OJ), ex-11 (le centre d'un cercle de diamètre [AB]), ex-17 (un
 * rayon). TRANSFER : ex-15 (trois distances exactes, une racine à simplifier), ex-16 (appartenance au cercle : comparer
 * OM et le rayon), ex-20 (symétriques, image par translation, K milieu de [MN] de deux façons — la figure de la
 * correction est dessinée une fois les trois points calculés). Une étape par exercice, faite quand chaque partie a reçu
 * une réponse (juste ou fausse).
 */
function Exercise({ ex, requires, onDone }) {
  return <TextbookExercise exercise={ex} requires={requires} onAnswered={onDone} />;
}

export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);
  const block = (n, requires) => partsOf(n).map((ex) => <Exercise key={ex.id} ex={ex} requires={requires} onDone={mark(ex.id)} />);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين الكتاب 10 و 11 و 15 و 16 و 17 و 20"
      objectives={['أحسب إحداثيتي منتصف وقيمًا مضبوطة لمسافات', 'أتحقق من انتماء نقطة إلى دائرة', 'أوظّف المنتصف في تعيين نظيرة نقطة']} estimatedTime="10 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 147', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>اكتب كل ثنائية بالترتيب (الفاصلة ثم الترتيب)، واترك المسافة بقيمتها المضبوطة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 10 — منتصفان', done: all('10'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="ihdathiyata-muntasaf" variant="rappel" compact />
              {block('10', ['ihdathiyata-muntasaf', 'muntasaf-murakkibat'])}
            </div>
          ) },
        { num: 2, title: 'تمرين 11 — مركز دائرة', done: all('11'),
          content: <div className="space-y-3">{block('11', ['ihdathiyata-muntasaf'])}</div> },
        { num: 3, title: 'تمرين 15 — قيم مضبوطة', done: all('15'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="masafa" variant="rappel" compact />
              {block('15', ['masafa', 'judhur-tabsit'])}
            </div>
          ) },
        { num: 4, title: 'تمرين 16 — نقطة على دائرة؟', done: all('16'),
          content: (
            <div className="space-y-3">
              <p className="text-xs text-slate-600"><MathText>{KNOW_LINES.squareFirst}</MathText></p>
              {block('16', ['masafa'])}
            </div>
          ) },
        { num: 5, title: 'تمرين 17 — نصف قطر', done: all('17'),
          content: <div className="space-y-3">{block('17', ['masafa'])}</div> },
        { num: 6, title: 'تمرين 20 — نظيرتان وانسحاب', done: all('20'),
          content: (
            <div className="space-y-3">
              {block('20', ['ihdathiyata-muntasaf', 'murakkibat-hisab'])}
              {['ex-20-a', 'ex-20-b', 'ex-20-c'].every((id) => done[id]) && <GeoFigure {...FIG_EX20} />}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
