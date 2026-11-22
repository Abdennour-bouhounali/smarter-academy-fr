import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';

/**
 * Module 4 — أوظّف تعلّماتي (p. 110–111) et أتعمّق (p. 113). AUTOMATIZE : ex-7 (« يبدو » n'est pas un argument),
 * ex-10, 11, 12 (prouver le parallélisme), ex-13, 15 (les deux sens). TRANSFER : ex-14 (Pythagore d'abord), ex-16
 * (يونس et إيناس : la justification), ex-23 (Thalès puis la contraposée), ex-24 (centres de gravité), ex-25 (Thalès
 * deux fois). Chaque figure « لاحظ الشكل » est REDESSINÉE (GeoFigure, par TextbookExercise › StatementFigure) dans son exercice. Une
 * étape par exercice, faite quand il a reçu une réponse (juste ou fausse).
 */
function Exercise({ id, requires, onDone }) {
  // la figure de l'exercice est dessinée par TextbookExercise lui-même (StatementFigure) : le module la dessinait une SECONDE fois (vu au
  // rollout mission 2026-11-10 — deux figures, et l'étape dépassait l'écran du lecteur)
  return <TextbookExercise exercise={EX[id]} requires={requires} onAnswered={onDone} />;
}

export default function Module04Awazzif() {
  // lecteur de mission (rollout 2026-11-10) : le rappel vient APRÈS l'exercice — ensemble ils dépassaient l'écran de 1024 × 768 ; il reste aussi
  // dans « بطاقتي » (rien n'est retiré)
  const withRecall = (brick, exercise) => <PlayerSwitch player={<>{exercise}{brick}</>} page={<>{brick}{exercise}</>} />;
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ids) => ids.every((id) => done[id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين متدرّجة: من التطبيق إلى التعمّق"
      objectives={['أطبّق ما تعلّمته على تمارين متدرّجة', 'كيف أقرّر: توازٍ أم عدم توازٍ؟', 'أتعمّق: أيّ خاصية أستعمل قبل الأخرى؟']}
      estimatedTime="13 دقيقة"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'تمارين للتطبيق والتعمّق', tone: 'amber',
        body: <p>في كل تمرين: الترتيب، ثم النسبتان، ثم الخلاصة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      // UN exercice par étape (rollout mission 2026-11-10) : dans le lecteur, une étape de trois exercices dépassait l'écran (data-fit-overflow)
      steps={[
        { num: 1, title: '«يبدو» متوازيين', done: all('ex-7'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="nisbatan-mukhtalifatan" variant="rappel" compact />
              <Exercise id="ex-7" requires={['nisbatan-mukhtalifatan']} onDone={mark('ex-7')} />
            </div>
          ) },
        { num: 2, title: 'إثبات التوازي (1)', done: all('ex-10'),
          content: (
            <div className="space-y-3">
              {withRecall(<KnowledgeBrick id="tariqa-tawazi" variant="rappel" compact />, <Exercise id="ex-10" requires={['tariqa-tawazi']} onDone={mark('ex-10')} />)}
            </div>
          ) },
        { num: 3, title: 'إثبات التوازي (2)', done: all('ex-11'),
          content: <div className="space-y-3"><Exercise id="ex-11" requires={['tariqa-tawazi']} onDone={mark('ex-11')} /></div> },
        { num: 4, title: 'إثبات التوازي (3)', done: all('ex-12'),
          content: <div className="space-y-3"><Exercise id="ex-12" requires={['tariqa-tawazi']} onDone={mark('ex-12')} /></div> },
        { num: 5, title: 'في الاتجاهين (1)', done: all('ex-13'),
          content: (
            <div className="space-y-3">
              {withRecall(<KnowledgeBrick id="tariqa-adam-tawazi" variant="rappel" compact />, <Exercise id="ex-13" requires={['tariqa-adam-tawazi']} onDone={mark('ex-13')} />)}
            </div>
          ) },
        { num: 6, title: 'في الاتجاهين (2)', done: all('ex-15'),
          content: <div className="space-y-3"><Exercise id="ex-15" requires={['tariqa-tawazi']} onDone={mark('ex-15')} /></div> },
        { num: 7, title: 'فيثاغورس أولا', done: all('ex-14'),
          content: <div className="space-y-3"><Exercise id="ex-14" requires={['fithaghuras', 'tariqa-tawazi']} onDone={mark('ex-14')} /></div> },
        { num: 8, title: 'يونس وإيناس', done: all('ex-16'),
          content: <div className="space-y-3"><Exercise id="ex-16" requires={['tariqa-tawazi', 'tasawi-kasrayn']} onDone={mark('ex-16')} /></div> },
        { num: 9, title: 'طالس ثم عكسها', done: all('ex-23'),
          content: <div className="space-y-3"><Exercise id="ex-23" requires={['talis-mubashira', 'tariqa-adam-tawazi']} onDone={mark('ex-23')} /></div> },
        { num: 10, title: 'أتعمّق: مركزا الثقل', done: all('ex-24'),
          content: <div className="space-y-3"><Exercise id="ex-24" requires={['tariqa-tawazi', 'shart-tartib']} onDone={mark('ex-24')} /></div> },
        { num: 11, title: 'أتعمّق: طالس مرّتين', done: all('ex-25'),
          content: <div className="space-y-3"><Exercise id="ex-25" requires={['talis-mubashira']} onDone={mark('ex-25')} /></div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
