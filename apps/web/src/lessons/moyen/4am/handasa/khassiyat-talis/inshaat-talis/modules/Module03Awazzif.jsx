import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';

/**
 * Module 3 — أوظّف تعلّماتي (p. 111 « وضع نقط على مستقيم » : ex-17, ex-18, ex-19 ; p. 113 « أتعمّق » : ex-21).
 * AUTOMATIZE : ex-17 (AM/AB = 3/7, sept parts), ex-18 (4/9, le point HORS de [AB] : le rayon opposé),
 * ex-19 (11/7 : les deux points). TRANSFER : ex-21 (construire L et P aux 2/3, la réciproque, LP, la hauteur, l'aire
 * multipliée par (2/3)²). Une construction se travaille par son RAISONNEMENT (nombre de parts, marque reliée,
 * position du point) — `batch` dont chaque distracteur est faux. Une étape par exercice, faite quand chaque partie
 * a reçu une réponse (juste ou fausse).
 */
export default function Module03Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (n) => partsOf(n).every((ex) => done[ex.id]);
  const block = (n, requires) => partsOf(n).map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={requires} onAnswered={mark(ex.id)} />);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="وضع نقط على مستقيم، ثم تمرين للتعمّق"
      objectives={['أطبّق الإنشاءات على تمارين متدرّجة', 'كم قطعة؟ أيّ علامة؟ أين تقع النقطة؟', 'أتعمّق: أربط الإنشاء بخاصية طالس وفيثاغورس']}
      estimatedTime="9 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي', title: 'تمارين للتطبيق والتعمّق', tone: 'amber',
        body: <p>الإنشاء يُنجز على الورق بالمسطرة غير المدرّجة والمدور؛ هنا نتحقّق من خطواته: كم قطعة، أي علامة، أين تقع النقطة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'ثلاثة أسباع', done: all('17'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="taqsim-qitaa" variant="rappel" compact />
              {block('17', ['taqsim-qitaa', 'tabrir-taqsim'])}
            </div>
          ) },
        { num: 2, title: 'نقطة خارج القطعة', done: all('18'),
          content: <div className="space-y-3">{block('18', ['tabrir-taqsim', 'nuqtatan'])}</div> },
        { num: 3, title: 'نقطتان', done: all('19'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="nuqtatan" variant="rappel" compact />
              {block('19', ['nuqta-nisba', 'nuqtatan'])}
            </div>
          ) },
        { num: 4, title: 'أتعمّق', done: all('21'),
          content: <div className="space-y-3">{block('21', ['tabrir-taqsim', 'talis-aksiya', 'talis-nisab', 'fithaghuris'])}</div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
