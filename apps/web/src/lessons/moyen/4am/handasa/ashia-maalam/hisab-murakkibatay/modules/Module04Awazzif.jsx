import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي (pp. 146–147). AUTOMATIZE : ex-6 (MN, MP, des fractions, des racines), ex-7 (AB et BA
 * opposés ; OM = coordonnées de M). TRANSFER : ex-8 (une extrémité inconnue — coquille « CD(2;-5) » corrigée), ex-9
 * (AB = OP puis AB = PO), ex-12 (D par AB + AC = AD — coquille ABCD → ABDC corrigée), ex-14 (D tel que AB = DC, nature).
 * Une étape par exercice, faite quand chaque partie a reçu une réponse. La ligne de correction d'une coquille est
 * posée au-dessus de l'exercice.
 */
function Exercise({ ex, requires, onDone }) {
  return (
    <div className="space-y-2">
      {ex.correction && <p className="text-xs text-slate-500" data-misprint-note><MathText>{ex.correction}</MathText></p>}
      <TextbookExercise exercise={ex} requires={requires} onAnswered={onDone} />
    </div>
  );
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
      moduleSubtitle="تمارين الكتاب 6 و 7 و 8 و 9 و 12 و 14"
      objectives={['أحسب مركبتي شعاع في حالات مختلفة', 'أعيّن مبدأ شعاع أو نهايته المجهولة', 'أوظّف تساوي شعاعين في متوازي أضلاع']} estimatedTime="8 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — الكتاب ص 146 و 147', title: 'تمارين الكتاب، بعباراته', tone: 'amber',
        body: <p>اكتب المركبتين أو الإحداثيتين بالترتيب (الأولى ثم الثانية)؛ الكسور مثل 3/2 والأعداد العشرية بالفاصلة مثل 3,5. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 6 — مركبات في أربع حالات', done: all('6'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="qanun-murakkibatayn" variant="rappel" compact />
              {block('6', ['qanun-murakkibatayn'])}
            </div>
          ) },
        { num: 2, title: 'تمرين 7 — AB و BA، OA و OB', done: all('7'),
          content: <div className="space-y-3">{block('7', ['qanun-murakkibatayn'])}</div> },
        { num: 3, title: 'تمرين 8 — مبدأ أو نهاية مجهولة', done: all('8'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="nuqta-majhula" variant="rappel" compact />
              {block('8', ['qanun-murakkibatayn', 'nuqta-majhula'])}
            </div>
          ) },
        { num: 4, title: 'تمرين 9 — شعاعان متساويان والمبدأ O', done: all('9'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tasawi-murakkibat" variant="rappel" compact />
              {block('9', ['tasawi-murakkibat', 'nuqta-majhula'])}
            </div>
          ) },
        { num: 5, title: 'تمرين 12 — قاعدة متوازي الأضلاع', done: all('12'),
          content: <div className="space-y-3">{block('12', ['qanun-murakkibatayn', 'tahaqquq-tasawi', 'nuqta-majhula'])}</div> },
        { num: 6, title: 'تمرين 14 — الرأس الرابع', done: all('14'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="nuqta-majhula" variant="rappel" compact />
              {block('14', ['nuqta-majhula', 'tahaqquq-tasawi'])}
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
