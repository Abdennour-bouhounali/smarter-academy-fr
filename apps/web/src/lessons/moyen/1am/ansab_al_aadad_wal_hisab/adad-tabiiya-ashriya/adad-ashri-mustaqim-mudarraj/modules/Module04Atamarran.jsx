import { useState } from 'react';
import { ContentModule } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookExercise } from '../../../../../../common/textbook';
import NumberLine from '../../../../../../common/components/NumberLine';
import { formatDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX } from '../content/exercises';

/**
 * Module 4 — أتمرّن : le نشاط 4 du manuel est posé ICI en APPLICATION de ce que l'élève a fait sur le ruban (guide §4ter : le manuel est la
 * référence, pas l'entrée), avec les exercices 15 (suites à pas constant) et 16 (lire les flèches de quatre demi-droites graduées : de 0 à 4,
 * sans origine, au centième, de 9,1 à 9,2) RÉÉCRITS par la plateforme. Les flèches sont dessinées par `NumberLine` (mode statique, valeurs
 * cachées) au-dessus de l'exercice. Corrigés, jamais comptés. LP : P1–P3.
 */
const COLORS = ['#e11d48', '#2563eb', '#059669'];
const dot = (s) => Number(String(s).replace(',', '.'));

/** La demi-droite graduée de l'exercice : les valeurs des flèches ne sont écrites nulle part (seulement leurs lettres). */
function Arrows({ figure }) {
  return (
    <NumberLine
      mode="static" min={figure.min} max={figure.max} step={figure.step} labelEvery={figure.labelEvery}
      format={(v) => formatDec(v, { maxDecimals: 3 })}
      markers={figure.arrows.map((a, i) => ({ value: dot(a.value), label: a.label, color: COLORS[i % COLORS.length] }))}
      ariaLabel="نصف مستقيم مدرّج عليه ثلاث نقط A و B و C ؛ اقرأ فاصلة كلّ منها"
    />
  );
}

export default function Module04Atamarran() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const step = (num, id, title, req) => ({
    num, title, done: !!done[id],
    content: (
      <div className="space-y-3">
        {EX[id].halfLine && <Arrows figure={EX[id].halfLine} />}
        <TextbookExercise exercise={EX[id]} requires={req} onAnswered={mark(id)} />
      </div>
    ),
  });
  return (
    <ContentModule
      objectives={['أقرأ وأعلّم نقطًا بالوحدات والتدريجات', 'أتمّ متتاليات بخطوة ثابتة', 'أقرأ فاصلات الأسهم على أربعة أنصاف مستقيمات']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أتمرّن"
      moduleSubtitle="قراءة وتعليم، متتاليات، وأسهم على أنصاف مستقيمات"
      estimatedTime="13 دقيقة"
      brief={{ tag: 'أتمرّن', title: 'تمارين للتطبيق', tone: 'amber',
        body: <p>أسئلة عن الوحدات والتدريجات، ثم متتاليات أعداد بخطوة ثابتة، ثم أربعة أنصاف مستقيمات عليها أسهم تقرأ فاصلاتها. أجب، ثم اقرأ التصحيح: الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        step(1, 'act-4', 'الوحدات والتدريجات', ['faasila-nuqta']),
        step(2, 'ex-15', 'متتاليات بخطوة ثابتة', ['faasila-nuqta']),
        step(3, 'ex-16a', 'أسهم من 0 إلى 4', ['faasila-nuqta']),
        step(4, 'ex-16b', 'مبدأ لا يظهر', ['mabda-ghayr-zahir']),
        step(5, 'ex-16c', 'تدريجات أدقّ', ['tadrij-nisf-mustaqim']),
        step(6, 'ex-16d', 'من 9,1 إلى 9,2', ['tadrij-nisf-mustaqim']),
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
