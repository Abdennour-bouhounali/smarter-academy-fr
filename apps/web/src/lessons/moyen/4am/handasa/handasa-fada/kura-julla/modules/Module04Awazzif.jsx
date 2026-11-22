import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أوظّف تعلّماتي. Le scan de l'unité n'a AUCUNE page d'exercices (il s'arrête p. 169) : cinq exercices DÉCLARÉS de la
 * plateforme (`interaction_generation`), un par compétence. AUTOMATIZE : le قطر et le rayon (aw-2), دوائر كبرى / صغرى sur un
 * globe (aw-3), la كرة engendrée par un disque qui tourne (aw-5) ; TRANSFER : situer trois points du planétarium par OM² (aw-1),
 * représenter un point de la جلّة (aw-4). Une étape par exercice, faite à la réponse.
 */
export default function Module04Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const block = (id, requires) => <TextbookExercise exercise={EX[id]} requires={requires} onAnswered={mark(id)} />;

  return (
    <ContentModule
      objectives={["سأحدّد موقع نقط بالنسبة إلى كرة", "سأميّز الدوائر الكبرى من الصغرى وأحسب الأقطار", "سأمثّل نقطة من جلة"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="خمسة تمارين من المنصّة"
      estimatedTime="7 دقائق"
      brief={{ tag: 'أوظّف تعلّماتي — تمارين من المنصّة', title: 'الكرة والجلة حولك', tone: 'amber',
        body: <p>الصفحات المتوفرة من الكتاب لا تحوي تمارين لهذا الدرس: هذه تمارين من المنصّة، في كل منها نقارن البعد عن المركز بنصف القطر، أو نسمّي عنصرا من عناصر الكرة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'كرة اليد — القطر ونصف القطر', done: !!done['aw-2'],
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="aqtar" variant="rappel" compact />
              {block('aw-2', ['aqtar'])}
            </div>
          ) },
        { num: 2, title: 'مجسّم الكرة الأرضية — كبرى أم صغرى', done: !!done['aw-3'],
          content: <div className="space-y-3">{block('aw-3', ['dawair'])}</div> },
        { num: 3, title: 'ورشة الفنون — قرص يدور', done: !!done['aw-5'],
          content: <div className="space-y-3">{block('aw-5', ['tawlid'])}</div> },
        { num: 4, title: 'القبة السماوية — ثلاث نقط', done: !!done['aw-1'],
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="masafa-maalam" variant="rappel" compact />
              {block('aw-1', ['masafa-maalam'])}
            </div>
          ) },
        { num: 5, title: 'تمثيل نقطة من الجلة', done: !!done['aw-4'],
          content: <div className="space-y-3">{block('aw-4', ['tamthil-nuqta'])}</div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
