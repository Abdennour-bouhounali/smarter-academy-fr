import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 1 (le ruban de longueur 12x, le rectangle de 15 carreaux) et le نشاط 2 (les chaînes de calculs de trois
 * élèves) du manuel sont posés ICI en APPLICATION de ce que l'élève a découvert à la table du club (guide §4ter : le manuel est la
 * référence, pas l'entrée), avec les exercices 5–7, 12–14, أتعمّق 36 et 43 et دوري الآن RÉÉCRITS par la plateforme (autres nombres, autres
 * contextes). Chaque clé est calculée puis recalculée dans ../content/content.test.js. Corrigés, jamais comptés. LP : P1, P2, P3, P4.
 */
export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const step = (num, id, title, req) => ({
    num, title, done: !!done[id],
    content: <TextbookExercise exercise={EX[id]} requires={req} onAnswered={mark(id)} />,
  });
  return (
    <ContentModule
      objectives={['أميّز المجموع من الجداء وأبسّط كلًّا منهما', 'أحكم على سلاسل حساب بأقواس', 'أبسّط حدودًا وأحذف أقواسًا', 'أستعمل ما تعلّمته في مثلث']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="شريط وألواح، سلاسل حساب، حدود، أقواس، مثلث، صحيح أم خاطئ"
      estimatedTime="14 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>تبسيط مجاميع وجداءات، وحذف أقواس. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-1', 'شريط ولوح: مجموع أم جداء؟', ['majmu-wa-jidaa', 'jidaa-hududayn']),
        step(2, 'act-2', 'سلاسل الحساب الثلاث', ['aqwas-jam', 'aqwas-tarh']),
        step(3, 'ex-5', 'أبسط شكل ممكن', ['jam-muamilat', 'jidaa-hududayn']),
        step(4, 'ex-6', 'خطآن لزميل', ['hudud-mutashabiha']),
        step(5, 'ex-12', 'بدون أقواس وبأبسط شكل', ['aqwas-tarh', 'tariqat-hadhf']),
        step(6, 'ex-14', 'زوايا مثلث ومحيطه', ['aqwas-tarh']),
        step(7, 'deep-43', 'صحيح أم خاطئ؟', ['tariqat-hadhf']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
