import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';
import { RectSquareFigure, RectangleFigure, TiltedSquareFigure, ColouredRectFigure } from '../components/Figures';

/**
 * Module 3 — أوظّف تعلّماتي : dix exercices ÉCRITS PAR LA PLATEFORME (rollout 2026-11-11 : mêmes idées, mêmes `id` et mêmes كفاءات que les
 * exercices du manuel, contextes et nombres propres ; content/exercises.js). Cinq étapes de deux exercices : des nombres, des âges d'aujourd'hui et
 * une durée de lecture, des périmètres, un programme de calcul et l'inégalité triangulaire, deux aires (équations produit nul, une solution
 * refusée). Chaque figure précède directement SON exercice (une figure et sa question partagent un écran). Chaque étape est faite quand chaque
 * exercice a reçu une réponse. LP : P1, P2.
 */
export default function Module03Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ns) => ns.every((n) => partsOf(n).every((ex) => done[ex.id]));
  const ex = (id, requires) => partsOf(id).map((e) => <TextbookExercise key={e.id} exercise={e} requires={requires} onAnswered={mark(e.id)} />);

  return (
    <ContentModule
      objectives={["كيف أترجم نصّ المشكلة إلى معادلة أو متراجحة بنفسي؟", "كيف أتأكّد أنّ الحلّ يلائم الوضعية؟", "متى أرفض حلًّا للمعادلة؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="أعداد، أعمار، محيطات، مساحات"
      estimatedTime="15 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'ترييض مشكلات', tone: 'amber',
        body: <p>في كل تمرين: اختر المعادلة أو المتراجحة التي تترجم النص، ثم الحل، ثم تأكّد أنه يلائم الوضعية. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'أعداد مجهولة', done: all('10', '11'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tarrid-tariqa" variant="rappel" compact />
              {ex('10', ['tarrid-tariqa'])}
              {ex('11', ['tarrid-tariqa'])}
            </div>
          ) },
        { num: 2, title: 'أعمار ومدّة', done: all('12', '13'),
          content: (
            <div className="space-y-3">
              {ex('12', ['tarrid-namdhaja', 'tarrid-tariqa'])}
              {ex('13', ['tarrid-tariqa', 'taklifa-nisba'])}
            </div>
          ) },
        { num: 3, title: 'محيطات ومتراجحات', done: all('30', '33'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tarrid-mutarajiha" variant="rappel" compact />
              <RectSquareFigure />
              {ex('30', ['tarrid-mutarajiha', 'tahaqquq-waqi', 'muhit-misaha'])}
            </div>
          ) },
        { num: 4, title: 'محيط مستطيل وطوله المجهول', done: all('33'),
          content: (
            <div className="space-y-3">
              <RectangleFigure />
              {ex('33', ['tarrid-mutarajiha', 'muhit-misaha'])}
            </div>
          ) },
        { num: 5, title: 'برنامج حساب ومثلث', done: all('37', '38'),
          content: (
            <div className="space-y-3">
              {ex('37', ['tarrid-tariqa', 'tahaqquq-waqi'])}
              {ex('38', ['tarrid-mutarajiha', 'tahaqquq-waqi'])}
            </div>
          ) },
        { num: 6, title: 'مساحة مربّع داخل مربّع', done: all('39'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tahaqquq-waqi" variant="rappel" compact />
              <TiltedSquareFigure />
              {ex('39', ['tahaqquq-waqi', 'jidaa-maadum', 'muhit-misaha'])}
            </div>
          ) },
        { num: 7, title: 'مساحة مستطيل ملوّن', done: all('40'),
          content: (
            <div className="space-y-3">
              <ColouredRectFigure />
              {ex('40', ['tahaqquq-waqi', 'jidaa-maadum'])}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
