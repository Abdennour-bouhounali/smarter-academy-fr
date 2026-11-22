import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import ArcTape from '../../../../../../common/components/ArcTape';
import { Manipulation } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD, NOW_29, TAPES } from '../content/textbook';

/**
 * Module 3 — طريقة (p. 29) « حل مشكلة بالاستعانة بتمثيل مناسب ».
 *   1. les réponses de هدى et de إيناس, jugées APRÈS que l'élève a tiré lui-même les tailles de يونس et محمد dans le
 *      même instrument qu'au module 1, posé seul (`story-bars`, histoire `method29`, `levels={false}`) ;
 *   2. le dialogue, puis la méthode (brique `tamthil-aqwas`, gardée par « أتوقّع القاعدة » : l'élève écrit ses étapes) ;
 *   3. le tableau du manuel : deux problèmes, deux schémas (□ en haut ⇒ −, △ en bas ⇒ +) ;
 *   4. دوري الآن : les distances d'est en ouest, chacune sur sa bande.
 * Déploiement du prototype (2026-10-28) : « qui est le tout ? » est posée PAR-DESSUS le labo pour يونس et محمد (`StoryBars › chainsOf`) ;
 * l'étape 2 en garde la TRACE (`checkpoint-done` de `item-0`), puis le dialogue et la méthode.
 * LP : P3.
 */
const ltr = (s) => <bdi dir="ltr">{s}</bdi>;

export default function Module03Tariqa() {
  const [q1, setQ1] = useState(false);
  const [trials, setTrials] = useState([]);
  const q2 = trials.some((e) => e.tk === 'checkpoint-done' && e.id === 'item-0');
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);
  const [q4a, setQ4a] = useState(false);
  const [q4b, setQ4b] = useState(false);
  const [p1, p2] = METHOD.table;

  return (
    <ContentModule
      objectives={['من على حق: هدى أم إيناس؟', 'كيف نتفادى الالتباس بين «يزيد» و«ينقص»؟', 'كيف نمثّل مشكلة بقطع مستقيمات قبل أن نحسب؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — حلّ مشكلة بتمثيل مناسب"
      moduleSubtitle="نرسم القطع قبل أن نحسب"
      estimatedTime="12 دقيقة"
      intro={(
        <Manipulation type="story-bars" story="method29" levels={false} onTrial={(e) => setTrials((list) => [...list, e])} />
      )}
      steps={[
        {
          num: 1, title: 'هدى أم إيناس: من على حق؟', subtitle: 'اسحب القامتين بنفسك أوّلًا', done: q1,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">{METHOD.intro}</p>
              <p className="text-sm font-bold text-slate-600">{METHOD.title}</p>
              <table className="w-full max-w-md table-fixed border-collapse text-center text-sm" data-method-answers>
                <thead><tr className="bg-slate-100"><th className="border p-1" />{['هدى', 'إيناس'].map((h) => <th key={h} className="border p-1">إجابة {h}</th>)}</tr></thead>
                <tbody>
                  <tr><th className="border p-1">قامة يونس</th><td className="border p-1">{ltr(`${METHOD.answers.hoda.younes} cm`)}</td><td className="border p-1">{ltr(`${METHOD.answers.ines.younes} cm`)}</td></tr>
                  <tr><th className="border p-1">قامة محمد</th><td className="border p-1">{ltr(`${METHOD.answers.hoda.mohamed} cm`)}</td><td className="border p-1">{ltr(`${METHOD.answers.ines.mohamed} cm`)}</td></tr>
                </tbody>
              </table>
              <TapQuestion
                prompt={<span>أيّ التلميذتين على حق؟</span>}
                options={['هدى', 'إيناس']}
                correct={1}
                cols={2}
                requires={['ikhtiyar-amaliya']}
                explain={<span>{METHOD.dialogue[0].text} <MathText>{'قامة يونس هي الكلّ: $124 + 3 = 127$ ؛ قامة أكرم هي الكلّ بالنسبة إلى محمد: $124 - 5 = 119$.'}</MathText></span>}
                onAnswered={() => setQ1(true)}
              />
            </div>
          ),
        },
        {
          num: 2, title: 'أين نضع المجهول في المخطط؟', subtitle: 'أجب عن أسئلة المختبر', done: q2,
          content: (
            <div className="space-y-3">
              <p data-evidence="item-0" data-tried={q2 ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${q2 ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {q2
                  ? <span>أجبتَ في المختبر: يونس هو الأطول، فقامته هي الكلّ ونضع □ تحت الخطّ — <MathText>{'$\\square = 124 + 3 = 127$'}</MathText> .</span>
                  : 'اسحب قامة يونس في المختبر واختر الحساب، ثم أجب عن الأسئلة التي تظهر فوقه.'}
              </p>
              {q2 && (
                <>
                  <ul className="space-y-1 rounded-xl border-2 border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm" data-method-dialogue>
                    {METHOD.dialogue.map((d, i) => <li key={i}><strong>{d.who}:</strong> {d.text}</li>)}
                  </ul>
                  <KnowledgeBrick id="tamthil-aqwas" lead="الشكل التوضيحي الذي رسمته إيناس: قطع مستقيمات وأقواس." />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'مشكلتان من جدول الكتاب', subtitle: 'المجهول فوق الخطّ أم تحته؟', done: q3a && q3b,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" text={p1.problem} source={METHOD.source} compact />
              <p className="text-sm text-slate-700">{p1.representation}</p>
              <ArcTape {...TAPES.method1} />
              <NumericQuestion
                prompt={<span>طول يونس بالسنتيمتر:</span>}
                expected={120.8} display="120,8" parse={parseDec}
                requires={['tamthil-aqwas']}
                explain={<span><MathText>{p1.computation[0]}</MathText> ؛ <MathText>{p1.computation[1]}</MathText> ؛ إذن <MathText>{p1.computation[2]}</MathText> ، أي <MathText>{'$120{,}8\\,\\mathrm{cm}$'}</MathText>.</span>}
                onAnswered={() => setQ3a(true)}
              />
              <TextbookBox kind="exercise" text={p2.problem} source={METHOD.source} compact />
              <TapQuestion
                prompt={<span>أيّ مخطط يمثّل هذه المشكلة؟ (△ وزن أمين)</span>}
                options={[<ArcTape key="a" {...TAPES.method2} maxWidth={260} />, <ArcTape key="b" {...TAPES.method2Wrong} maxWidth={260} />]}
                correct={0}
                cols={2}
                requires={['tamthil-aqwas']}
                explain={<span>«يقلّ وزن يوغرطة عن وزن أمين»: أمين هو الأثقل، فوزنه هو الكلّ (تحت الخطّ). <MathText>{p2.computation[0]}</MathText> ، <MathText>{p2.computation[1]}</MathText> : <MathText>{p2.computation[2]}</MathText>.</span>}
                onAnswered={() => setQ3b(true)}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'دوري الآن: من قسنطينة إلى الجزائر العاصمة', subtitle: 'المسافات من الشرق إلى الغرب', done: q4a && q4b,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="exercise" title="دوري الآن" text={NOW_29.text} source={NOW_29.source} compact />
              <table className="w-full max-w-md table-fixed border-collapse text-center [overflow-wrap:anywhere] text-sm" data-now-table>
                <thead><tr className="bg-slate-100">{NOW_29.table.head.map((h, i) => <th key={i} className="border p-1">{h}</th>)}</tr></thead>
                <tbody>{NOW_29.table.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => (i === 0 ? <th key={i} className="border p-1">{c}</th> : <td key={i} className="border p-1">{ltr(c)}</td>))}</tr>)}</tbody>
              </table>
              <p className="text-sm text-slate-700"><MathText>{NOW_29.order}</MathText></p>
              <ArcTape {...TAPES.routeSetif} />
              <NumericQuestion
                prompt={<span>المسافة بين سطيف وبرج بوعريريج (بالكيلومتر):</span>}
                expected={NOW_29.answers.setifBba} parse={parseDec}
                requires={['tamthil-aqwas']}
                explain={<MathText>{'من قسنطينة إلى برج بوعريريج ($195\\,\\mathrm{km}$) هو الكلّ، ومن قسنطينة إلى سطيف ($128\\,\\mathrm{km}$) جزء: $195 - 128 = 67$.'}</MathText>}
                onAnswered={() => setQ4a(true)}
              />
              <ArcTape {...TAPES.routeBouira} />
              <NumericQuestion
                prompt={<span>المسافة بين برج بوعريريج والبويرة (بالكيلومتر):</span>}
                expected={NOW_29.answers.bbaBouira} parse={parseDec}
                requires={['tamthil-aqwas']}
                explain={<MathText>{'من قسنطينة إلى الجزائر ($392\\,\\mathrm{km}$) هو الكلّ، وجزآه المعلومان $195\\,\\mathrm{km}$ و $124\\,\\mathrm{km}$: $392 - 195 - 124 = 73$.'}</MathText>}
                onAnswered={() => setQ4b(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
