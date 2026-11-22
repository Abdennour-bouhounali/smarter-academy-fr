import { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookExercise } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { EX23, EX24 } from '../content/textbook';
import { byId } from '../content/exercises';
import { MiniTable, Dustur } from '../components/Figures';

/**
 * Module 4 — أدوات أخرى (practice_lab, « أتعمّق » p. 101) : AUTOMATIZE / TRANSFER.
 *   تمرين 23 — la moyenne pondérée 100,1 avec la MÉMOIRE de la calculatrice (M+, MR) : le même calcul que
 *              =MOYENNE, à la main de la machine ;
 *   تمرين 24 — =ALEA() : une série de 50 nombres au hasard, dans une COLONNE (A1:A50) ; F9 la change, les
 *              دساتير restent (le recalcul du module 1, transféré).
 * LP : P2.
 */
export default function Module04Adawat() {
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));

  return (
    <ContentModule
      objectives={["كيف أحسب متوسطًا بذاكرة الحاسبة؟", "كيف أحصل على سلسلة عشوائية من خمسين عددًا؟"]}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="أدوات أخرى — أتعمّق"
      moduleSubtitle="الحاسبة وسلسلة عشوائية"
      estimatedTime="6 دقائق"
      brief={{ tag: 'أتعمّق — الكتاب ص 101', title: 'نفس المؤشّرات، بأدوات أخرى', tone: 'amber',
        body: <p>متوسط بذاكرة الحاسبة، ثم سلسلة من خمسين عددًا يكتبها المجدول بنفسه. الخطأ هنا يُصحَّح ولا يُحتسب.</p> }}
      steps={[
        {
          num: 1, title: 'تمرين 23 — ذاكرة الحاسبة', subtitle: 'اللمسات M+ و MR', done: !!done['ex-23-1'] && !!done['ex-23-2'],
          content: (
            <div className="space-y-3">
              <MiniTable rows={[{ label: 'القيم', cells: EX23.table.values }, { label: 'التكرار', cells: EX23.table.freqs }]} />
              <TextbookExercise exercise={byId['ex-23-1']} onAnswered={mark('ex-23-1')} />
              {done['ex-23-1'] && <KnowledgeBrick id="dhakira-hasiba" lead="الحاسبة تحفظ مجموعًا في ذاكرتها:" />}
              <TextbookExercise exercise={byId['ex-23-2']} requires={['dhakira-hasiba', 'mutawassit-silsila']} onAnswered={mark('ex-23-2')} />
              {done['ex-23-2'] && (
                <p className="text-sm text-slate-700" data-calc-keys>
                  <span className="text-xs text-slate-500">اللمسات كاملة: </span>
                  <bdi dir="ltr" className="font-mono">{EX23.keys.join(' ')}</bdi>
                </p>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'تمرين 24 — سلسلة عشوائية', subtitle: 'الدستور \u2066=ALEA()\u2069', done: !!done['ex-24-1'] && !!done['ex-24-2'],
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="iadat-hisab" variant="rappel" compact />
              <TextbookExercise exercise={byId['ex-24-1']} requires={['dustur', 'khaliya-majal']} onAnswered={mark('ex-24-1')} />
              <TextbookExercise exercise={byId['ex-24-2']} requires={['iadat-hisab', 'mada-silsila']} onAnswered={mark('ex-24-2')} />
              {done['ex-24-2'] && (
                <ul className="space-y-1 text-sm" data-alea-formulas>
                  {EX24.formulas.map((f) => <li key={f}><Dustur>{f}</Dustur></li>)}
                  <li className="text-slate-600"><MathText>{EX24.note}</MathText></li>
                </ul>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} variant="memo" />}
    />
  );
}
