import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { partsOf, FIGURES } from '../content/exercises';
import LinesFigure from '../components/LinesFigure';

/**
 * Module 3 — أوظّف تعلّماتي. Le manuel fourni n'a aucun exercice pour cette unité : quatre exercices de la
 * plateforme (`practice_generation`, l'étiquette le dit). Une étape par exercice ; elle est faite quand chaque
 * partie a reçu une réponse (juste ou fausse).
 *   1. x + y = 6 et x − y = 2 : écrire, lire (4 ; 2) sur la figure, vérifier (P1, P2) ;
 *   2. y = x + 1 et y = −x + 4 : un croisement HORS des nœuds — lecture approchée, puis (3/2 ; 5/2) par le calcul ;
 *   3. le nombre de solutions sans dessiner (P3) ;
 *   4. transfert : deux applis de taxi, (5 ; 350) et son interprétation.
 * LP : P1, P2, P3.
 */
export default function Module03Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ks) => ks.every((k) => partsOf(k).every((ex) => done[ex.id]));
  const list = (k, requires) => partsOf(k).map((ex) => <TextbookExercise key={ex.id} exercise={ex} requires={requires} onAnswered={mark(ex.id)} />);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="أربعة تمارين من المنصّة"
      estimatedTime="10 دقائق"
      objectives={[
        'أحلّ جملة بيانيًا ثم أتحقّق بالحساب',
        'أقرأ نقطة لا تقع على عقدة',
        'أعيّن عدد حلول جملة دون رسم',
        'أفسّر نقطة التقاطع في وضعية',
      ]}
      brief={{ tag: 'أوظّف تعلّماتي — تمارين من المنصّة', title: 'نرسم، نقرأ، ثم نتحقّق بالحساب', tone: 'amber',
        body: <p>الكتاب لا يقترح تمارين لهذا الدرس: هذه تمارين من المنصّة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 1 — حل بياني ثم تحقّق', done: all('a'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="hall-bayani" variant="rappel" compact />
              <LinesFigure testId="ex-a" win={FIGURES.A.win} lines={FIGURES.A.lines} caption={FIGURES.A.caption} />
              {list('a', ['muadala-mustaqim', 'hall-taqatu', 'hall-bayani'])}
            </div>
          ) },
        { num: 2, title: 'تمرين 2 — نقطة لا تُقرأ بدقة', done: all('b'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="qiraa-taqribiya" variant="rappel" compact />
              <LinesFigure testId="ex-b" win={FIGURES.B.win} lines={FIGURES.B.lines} caption={FIGURES.B.caption} />
              {list('b', ['qiraa-taqribiya', 'hall-taqatu', 'hall-jabri'])}
            </div>
          ) },
        { num: 3, title: 'تمرين 3 — كم حلًّا؟', done: all('c'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="halat-thalath" variant="rappel" compact />
              {list('c', ['halat-thalath', 'muadala-mustaqim'])}
            </div>
          ) },
        { num: 4, title: 'تمرين 4 — تطبيقا سيارة أجرة', done: all('d'),
          content: <div className="space-y-3">{list('d', ['muadala-mustaqim', 'hall-taqatu', 'tarjama-jumla'])}</div> },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
