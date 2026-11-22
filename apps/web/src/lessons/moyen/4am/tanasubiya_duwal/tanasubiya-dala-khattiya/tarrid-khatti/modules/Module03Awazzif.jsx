import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX34_NOTE } from '../content/textbook';
import { EX } from '../content/exercises';
import { CyclistGraph, TariffGraph } from '../components/Graphs';

/**
 * Module 3 — أتعمّق (p. 75) : exercices 28, 29, 31, 34, 35, 36. Quatre étapes :
 *   1. le cycliste (28) — lire un graphique par étapes ; seule la première étape est proportionnelle ;
 *   2. les deux tarifs (31) — un tarif linéaire contre un forfait (PAS linéaire) ; la figure des deux
 *      droites n'apparaît qu'après la réponse (le manuel demande à l'élève de la tracer) ;
 *   3. deux pourcentages enchaînés (29, 35) — une fonction linéaire dont le coefficient est un produit ;
 *   4. interpréter (34, 36) — une remise par tranche complète, un pourcentage de groupes inégaux.
 * Chaque étape est faite quand chaque exercice a reçu une réponse (juste ou fausse). LP : P1, P2, P3.
 */
const P28 = ['ex-28-a', 'ex-28-b', 'ex-28-c', 'ex-28-d'];

export default function Module03Awazzif() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ids) => ids.every((id) => done[id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      objectives={["هل الوضعية تناسبية؟ ما معاملها وما معناه؟", "كيف نترجم وضعية إلى نموذج رياضي ونجيب بجملة؟"]}
      moduleNumber={3}
      moduleTitle="أوظّف تعلّماتي"
      moduleSubtitle="تمارين أتعمّق 28، 29، 31، 34، 35، 36"
      estimatedTime="13 دقيقة"
      brief={{ tag: 'أتعمّق — الكتاب ص 75', title: 'ترييض وضعيات الكتاب', tone: 'amber',
        body: <p>في كل تمرين: هل الوضعية تناسبية؟ ما المعامل وما معناه؟ ثم أجب بجملة وبالوحدة. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        { num: 1, title: 'تمرين 28 — درّاج في أربع مراحل', done: all(...P28),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tanasub-bayan" variant="rappel" compact />
              <CyclistGraph />
              <TextbookExercise exercise={EX['ex-28-a']} requires={['qiraa-bayaniya']} onAnswered={mark('ex-28-a')} />
              <TextbookExercise exercise={EX['ex-28-b']} requires={['qiraa-bayaniya']} onAnswered={mark('ex-28-b')} />
              <TextbookExercise exercise={EX['ex-28-c']} requires={['qiraa-bayaniya']} onAnswered={mark('ex-28-c')} />
              <TextbookExercise exercise={EX['ex-28-d']} requires={['tanasub-bayan', 'sura-mutawassita']} onAnswered={mark('ex-28-d')} />
            </div>
          ) },
        { num: 2, title: 'تمرين 31 — تسعيرتان لسيارة أجرة', done: all('ex-31'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="laysat-tanasub" variant="rappel" compact />
              <TextbookExercise exercise={EX['ex-31']} requires={['tamthilat-thalath', 'laysat-tanasub', 'tafsir-siyaq']} onAnswered={mark('ex-31')} />
              {done['ex-31'] && <TariffGraph />}
            </div>
          ) },
        { num: 3, title: 'تمرينا 29 و 35 — نسبتان متتابعتان', done: all('ex-29', 'ex-35'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tariqat-jadwal" variant="rappel" compact />
              <TextbookExercise exercise={EX['ex-29']} requires={['nisba-mia', 'tariqat-jadwal']} onAnswered={mark('ex-29')} />
              <TextbookExercise exercise={EX['ex-35']} requires={['nisba-mia', 'tafsir-siyaq']} onAnswered={mark('ex-35')} />
            </div>
          ) },
        { num: 4, title: 'تمرينا 34 و 36 — نفسّر في سياق الوضعية', done: all('ex-34', 'ex-36-a', 'ex-36-b'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="tafsir-siyaq" variant="rappel" compact />
              <TextbookBox kind="remark" text={EX34_NOTE.text} source={EX34_NOTE.source} compact />
              <TextbookExercise exercise={EX['ex-34']} requires={['tafsir-siyaq']} onAnswered={mark('ex-34')} />
              <TextbookExercise exercise={EX['ex-36-a']} requires={['nisba-mia']} onAnswered={mark('ex-36-a')} />
              <TextbookExercise exercise={EX['ex-36-b']} requires={['nisba-mia', 'tafsir-siyaq']} onAnswered={mark('ex-36-b')} />
            </div>
          ) },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
