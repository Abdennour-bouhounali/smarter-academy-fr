import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { SourceTag } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACT_4, LAB, MISTAKE_FIXED } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon (rétrofit 2026-10-15, LESSON_DEVELOPMENT_GUIDE §4ter–§4quater).
 * Le laboratoire `plan-compare` en mode `model` OUVRE le module, sans carte ni titre de workspace : l'élève PORTE le
 * montant « payé une fois » et celui « payé à chaque unité » dans la facture ; « تحقّق » refuse le montant d'abonnement
 * payé à chaque match (MISC-TARRID-JUZ-THABIT) ; accepté, le lab écrit f(x) = ax + b, puis x glisse.
 *   مبتدئ (défaut) — l'ENTRÉE choisie : la salle de jeux, 500DA + 150DA l'heure (plateforme, petits nombres) ;
 *   متقدم — نشاط 4 du manuel (2000DA + 200DA par match), avec ses deux cibles (7 matchs, 4800DA).
 * Les étapes parlent de la facture que l'élève vient de construire (le POURQUOI), puis le manuel revient comme
 * APPLICATION : 7 matchs, 4800DA, un autre budget. Le niveau n'importe pas à l'étape 1 (le modèle est le même).
 *
 * AUCUNE étape n'attend `onFinished` : `onModel` et `onTrial` listent, au-dessus des questions, ce que l'élève a fait
 * lui-même (`[data-activity-evidence]`, MANIPULATION_DNA §9), aux deux niveaux, sans jamais bloquer.
 *
 * Étapes : (1) pourquoi l'abonnement n'est pas multiplié par x, puis la brique « namdhaja-taalufiya » APRÈS la réponse ;
 * (2) la fonction du manuel ; (3) 7 matchs ; (4) 4800DA ; (5) la brique « sura-fi-wadiya » APRÈS les deux questions
 * du manuel, un autre budget, puis le rappel de « مسألة الدرس » (module 5). LP : P1.
 */
export default function Module01Ishtirak() {
  const [models, setModels] = useState({});
  const [trials, setTrials] = useState({});
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const [cps, setCps] = useState([]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : « pourquoi x ne multiplie pas l'abonnement » y est posée ; coupées par l'enseignant, la question d'origine revient
  const cpOn = useLabCheckpointSettings('plan-compare').enabled;
  const answered = (id) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const onCheckpoint = (e) => setCps((l) => [...l, e]);
  const built = cpOn ? answered('build') : q1;
  const onModel = (level) => ({ tex }) => setModels((m) => ({ ...m, [level]: tex }));
  const onTrial = (level) => (tr) => {
    if (tr.kind !== 'x') return;
    setTrials((all) => ({ ...all, [level]: [...(all[level] ?? []).filter((u) => u.x !== tr.x), { x: tr.x, cost: tr.costs[0] }].slice(-8) }));
  };
  const model = models.beginner ?? models.advanced;
  const list = trials.beginner?.length ? trials.beginner : (trials.advanced ?? []);

  const evidence = (
    <ul className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence>
      <li className={model ? 'font-bold text-slate-800' : 'text-slate-500'} data-evidence="model" data-tried={model ? 'true' : 'false'}>
        {model ? <MathText>{`نموذجك: $${model}$`}</MathText> : 'لم تتحقّق بعد من الفاتورة في المختبر أعلاه.'}
      </li>
      <li className={list.length ? 'text-slate-800' : 'text-slate-500'} data-evidence="trials" data-tried={list.length ? 'true' : 'false'}>
        {list.length
          ? <span>محاولاتك: <span dir="ltr" className="font-mono">{list.map((tr) => `x = ${tr.x} → ${tr.cost} DA`).join(' ؛ ')}</span></span>
          : 'لم تحرّك بعد x في المختبر.'}
      </li>
    </ul>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 4 — اشتراك المناصر"
      moduleSubtitle="جزء يُدفع مرّة واحدة، وجزء يُدفع عند كل مقابلة"
      estimatedTime="12 دقيقة"
      objectives={[
        'كيف نبني فاتورة المناصر من جزء يُدفع مرّة واحدة وجزء يُدفع عند كل مقابلة؟',
        'كم يدفع من تابع 7 مقابلات؟',
        'كم مقابلة تابع من دفع 4800DA؟',
      ]}
      intro={
        // LE LABO OUVRE LE MODULE (§4quater) : ni carte du manuel, ni titre / `lead` de workspace. Le niveau par défaut est
        // مبتدئ (la salle de jeux : l'entrée de la plateforme) ; le manuel (نشاط 4) est le niveau متقدم.
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => <Manipulation type="plan-compare" level="beginner" {...LAB.m1.beginner}
              onModel={onModel('beginner')} onTrial={onTrial('beginner')} onCheckpoint={onCheckpoint} />,
            advanced: () => <Manipulation type="plan-compare" {...LAB.m1.advanced}
              onModel={onModel('advanced')} onTrial={onTrial('advanced')} onCheckpoint={onCheckpoint} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا لا يُضرب الاشتراك في x؟', subtitle: 'عن الفاتورة التي بنيتها', done: built,
          content: (
            <div className="space-y-3">
              {evidence}
              {cpOn ? (
                <p data-checkpoint-trace="build" data-tried={built ? 'true' : 'false'}
                  className={`rounded-xl border-2 px-3 py-2 text-sm ${built ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                  {built
                    ? <MathText>{'أجبتَ في المخبر: المبلغ الثابت يُدفع مرّة واحدة فلا يُضرب في $x$ ، أمّا ثمن الوحدة فيُدفع $x$ مرّة.'}</MathText>
                    : 'ضع كل مبلغ في خانته وتحقّق في المخبر، وأجب عن الأسئلة التي تظهر فوقه.'}
                </p>
              ) : (
                <TapQuestion
                  prompt={<span>في فاتورتك كتب المختبر <MathText>{'$x$'}</MathText> عند أحد المبلغين فقط. لماذا لا يظهر <MathText>{'$x$'}</MathText> عند مبلغ الاشتراك (أو البطاقة)؟</span>}
                  options={[
                    'لأنه يُدفع مرّة واحدة مهما كبر x، أمّا الآخر فيتكرّر x مرّة',
                    'لأنه أصغر المبلغين',
                    'لأنه يتكرّر x مرّة، أمّا الآخر فيُدفع مرّة واحدة',
                    'لأن x لا يُضرب إلا في عدد من رقم واحد',
                  ]}
                  correct={0}
                  cols={1}
                  explain={<MathText>{'الاشتراك يُدفع مرّة واحدة في الموسم فلا يتغيّر عندما يكبر $x$ ، أمّا المبلغ عن كل مقابلة فيُدفع $x$ مرّة: نضربه في $x$ ثم نضيف الاشتراك.'}</MathText>}
                  onAnswered={() => setQ1(true)}
                />
              )}
              {built && <KnowledgeBrick id="namdhaja-taalufiya" lead="ما فعلته في المختبر بالفاتورة، بكلمات الدرس:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'المبلغ بدلالة عدد المقابلات', subtitle: 'نشاط الكتاب: اشتراك 2000DA و 200DA للمقابلة', done: q2,
          content: (
            <div className="space-y-3">
              <p className="rounded-xl bg-white px-3 py-2 text-sm text-slate-800"><MathText>{ACT_4.text}</MathText> <SourceTag source={ACT_4.source} /></p>
              <TapQuestion
                prompt={<span>نسمّي <MathText>{'$x$'}</MathText> عدد المقابلات. أيّ دالة تعطي المبلغ الإجمالي الذي يدفعه المناصر؟</span>}
                options={[
                  <MathText key="a">{'$f(x) = 200x + 2000$'}</MathText>,
                  <MathText key="b">{'$f(x) = 2000x + 200$'}</MathText>,
                  <MathText key="c">{'$f(x) = 2200x$'}</MathText>,
                  <MathText key="d">{'$f(x) = 200x$'}</MathText>,
                ]}
                correct={0}
                cols={2}
                requires={['namdhaja-taalufiya']}
                explain={<MathText>{MISTAKE_FIXED.right}</MathText>}
                explainWrong={<MathText>{MISTAKE_FIXED.why}</MathText>}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'تابع المناصر 7 مقابلات', subtitle: 'السؤال الأول من الكتاب', done: q3,
          content: (
            <NumericQuestion
              prompt={<MathText>{`${ACT_4.questions[0]} (بالدينار)`}</MathText>}
              expected={ACT_4.numbers.seven}
              requires={['namdhaja-taalufiya', 'sura-taalufiya']}
              explain={<MathText>{'$f(7) = 200 \\times 7 + 2000 = 1400 + 2000 = 3400$ : يدفع المناصر 3400DA.'}</MathText>}
              onAnswered={() => setQ3(true)}
            />
          ),
        },
        {
          num: 4, title: 'دفع المناصر 4800DA', subtitle: 'السؤال الثاني من الكتاب', done: q4,
          content: (
            <NumericQuestion
              prompt={<MathText>{ACT_4.questions[1]}</MathText>}
              expected={ACT_4.numbers.matches4800}
              requires={['namdhaja-taalufiya', 'sura-taalufiya', 'hall-muadala']}
              explain={<MathText>{'$200x + 2000 = 4800$ أي $200x = 2800$ ومنه $x = 14$ : تابع 14 مقابلة. تحقّق: $200 \\times 14 + 2000 = 4800$ .'}</MathText>}
              onAnswered={() => setQ4(true)}
            />
          ),
        },
        {
          num: 5, title: 'ما السؤال الذي نطرحه على الدالة؟', subtitle: 'في لغة الوضعية', done: q5,
          content: (
            <div className="space-y-3">
              {q3 && q4 && <KnowledgeBrick id="sura-fi-wadiya" lead="ماذا يقابل سؤالَي الوضعية عند الدالة؟" />}
              <NumericQuestion
                prompt={<span>بالدالة نفسها <MathText>{'$f(x) = 200x + 2000$'}</MathText> : كم مقابلة تابع مناصر دفع 3000DA ؟</span>}
                expected={5}
                requires={['sura-fi-wadiya']}
                explain={<MathText>{'$200x + 2000 = 3000$ أي $200x = 1000$ ومنه $x = 5$ مقابلات.'}</MathText>}
                onAnswered={() => setQ5(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
