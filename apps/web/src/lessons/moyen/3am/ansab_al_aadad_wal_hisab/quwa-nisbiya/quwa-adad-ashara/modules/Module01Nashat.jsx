import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import * as T from '@smarter-academy/core/arithmetic/tenPowers.js';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { GUIDE } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la عدسة القوى. UNE SEULE PISTE
 * (§4quater) : le labo `ten-zoom` en haut, sans carte au-dessus — il porte son contexte et SA question ; la main tient n, le nombre de crans.
 *   مبتدئ — 1 000 ; 1 000 000 (prédiction) ; 0,001 ; retour à la table, tally visible ;
 *   متقدم — مليار متر ; ميكرومتر ; 0,0000001 م (prédiction) ; 10 كم, sans tally.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES crans : pourquoi 6 crans donnent six facteurs 10 (P1), pourquoi six zéros (P3), ce que porte la plaque
 * sans cran (P2), ce que valent trois crans de réduction (P2). Les noms (briques) viennent APRÈS la réponse. L'نشاط 1 du manuel (la cellule qui se divise)
 * est posé en application au module 4 (le carré, le cube).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;
const dec = (n) => T.pow10Text(n);

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const record = (e) => setTrials((list) => [...list, e]);
  const [cps, setCps] = useState([]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) remplacent celles des étapes ci-dessous ; coupées par l'enseignant, les questions d'origine reviennent
  const cpOn = useLabCheckpointSettings('ten-zoom').enabled;
  const doneCp = (id, level) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id && (!level || e.level === level));
  const onCheckpoint = (level) => (e) => setCps((l) => [...l, { ...e, level }]);
  const Trace = ({ id, ok, done, todo }) => (
    <p data-checkpoint-trace={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );
  const solved = (...ids) => trials.findLast((e) => e.kind === 'solved' && !e.free && ids.includes(e.task));
  const s6 = solved('z2');
  const s0 = solved('z4');
  const sNeg = solved('z3');

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['كم نقرة تكبير تصنع ضلعًا طوله مليون متر؟', 'ماذا يحدث بلا أيّ نقرة؟', 'أين الرقم 1 بعد نقرات التصغير؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — عدسة القوى"
      moduleSubtitle="نكبّر الإطار عشر مرّات ونصغّره عشر مرّات"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="ten-zoom" level="beginner" onTrial={record} onCheckpoint={onCheckpoint('beginner')} />,
            advanced: () => <Manipulation type="ten-zoom" level="advanced" onTrial={record} onCheckpoint={onCheckpoint('advanced')} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ما الكتابة التي تعبّر عن الضلع بعد 6 نقرات؟', subtitle: 'ستة تكبيرات', done: (cpOn ? doneCp('z2') : !!q1),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="six" ok={!!s6}
                done={<span>وصلتَ إلى <Ltr>{dec(6)}</Ltr> م بـ <Ltr>{s6?.n}</Ltr> نقرات تكبير.</span>}
                todo="في المستوى المبتدئ، المهمة الثانية (1 000 000 م): أدر الحلقة وثبّت الإطار، ثم عُد إلى هذا السؤال." />
              {cpOn ? (
                <Trace id="z2" ok={doneCp('z2')}
                  done={<MathText>{'أجبتَ في المختبر: بست نقرات تكبير صار ضلع الإطار $1\\,000\\,000$ م، لأنّ كل نقرة تضرب الضلع في 10 : ستة عوامل كلّها 10 .'}</MathText>}
                  todo="أنجز في المستوى المبتدئ المهمة الثانية (ضلع مليون متر)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              ) : (
                <TapQuestion
                  prompt={<span>في كل نقرة يُضرب ضلع الإطار في <Ltr>10</Ltr> . أيّ كتابة تعبّر عن الضلع بعد 6 نقرات؟</span>}
                  options={[
                    M('$10 \\times 10 \\times 10 \\times 10 \\times 10 \\times 10$ (ستة عوامل كلّها 10)'),
                    M('$10 \\times 6 = 60$'),
                    M('$10 + 10 + 10 + 10 + 10 + 10$'),
                  ]}
                  correct={0} cols={1} requires={['darb-ashara']}
                  explain={<MathText>{GUIDE.six}</MathText>}
                  onAnswered={() => setQ1(true)}
                />
              )}
              {(cpOn ? doneCp('z2') : !!q1) && <KnowledgeBrick id="ashara-taarif" lead="ستة عوامل كلّها 10: كيف نكتبها باختصار؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا ستة أصفار؟', subtitle: 'عدد النقرات وأصفار الضلع', done: (cpOn ? doneCp('z2') : !!q2),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="zeros" ok={!!s6}
                done={<span>قرأتَ على اللوحة <Ltr>{dec(6)}</Ltr> م : الرقم 1 ثم أصفار، وعدد النقرات <Ltr>{s6?.n}</Ltr> .</span>}
                todo="أنجز المهمة الثانية في المختبر أعلاه (1 000 000 م)، ثم عُد إلى هذا السؤال." />
              {cpOn ? (
                <Trace id="z2" ok={doneCp('z2')}
                  done={<MathText>{'أجبتَ في المختبر: عدد الأصفار بعد الرقم 1 في $1\\,000\\,000$ هو 6 ، وعدد النقرات 6 أيضًا.'}</MathText>}
                  todo="أنجز في المستوى المبتدئ المهمة الثانية (ضلع مليون متر)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              ) : (
                <TapQuestion
                  prompt={<span>ضلع الإطار <Ltr>1 000 000</Ltr> م : ستة أصفار بعد الرقم 1 . لماذا؟</span>}
                  options={[
                    M('لأنّ كل ضرب في 10 يضيف صفرًا واحدًا'),
                    M('لأنّ العدد فيه سبعة أرقام'),
                    M('لأنّ $6 \\times 10 = 60$'),
                  ]}
                  correct={0} cols={1} requires={['ashara-taarif']}
                  explain={<MathText>{GUIDE.zeros}</MathText>}
                  onAnswered={() => setQ2(true)}
                />
              )}
              {(cpOn ? doneCp('z2') : !!q2) && <KnowledgeBrick id="ashara-asfar" lead="ثلاث نقرات ثم ست نقرات: ماذا يحدث لعدد الأصفار؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا يحمل الضلع بلا أيّ نقرة؟', subtitle: 'الإطار على الطاولة', done: (cpOn ? doneCp('z4') : !!q3),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="empty" ok={!!s0}
                done={<span>عدتَ إلى إطار المتر بلا أيّ نقرة: الضلع <Ltr>1</Ltr> م.</span>}
                todo="أنجز في المستوى المبتدئ المهمة الرابعة (العودة إلى إطار المتر)، ثم عُد إلى هذا السؤال." />
              {cpOn ? (
                <Trace id="z4" ok={doneCp('z4')}
                  done={<MathText>{'أجبتَ في المختبر: عاد الضلع إلى 1 م بعد 3 نقرات تكبير، وبلا أيّ نقرة يبقى ضلع الإطار 1 م.'}</MathText>}
                  todo="أنجز في المستوى المبتدئ المهمة الرابعة (العودة إلى 1 م)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              ) : (
                <TapQuestion
                  prompt={<span>بلا أيّ نقرة ضلع الإطار <Ltr>1</Ltr> م. ماذا يساوي <MathText>{'$10^0$'}</MathText> ؟</span>}
                  options={[M('$1$'), M('$0$'), M('$10$')]}
                  correct={0} cols={3} requires={['ashara-asfar']}
                  explain={<MathText>{GUIDE.zero}</MathText>}
                  onAnswered={() => setQ3(true)}
                />
              )}
              {(cpOn ? doneCp('z4') : !!q3) && <KnowledgeBrick id="ashara-sifr" lead="لا عامل واحد: ماذا يساوي $10^0$ ؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'ماذا يساوي الضلع بعد 3 نقرات تصغير؟', subtitle: 'أس سالب', done: (cpOn ? doneCp('z3') : !!q4),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="neg" ok={!!sNeg}
                done={<span>بـ <Ltr>3</Ltr> نقرات تصغير صار الضلع <Ltr>{dec(-3)}</Ltr> م.</span>}
                todo="أنجز في المستوى المبتدئ المهمة الثالثة (0,001 م)، ثم عُد إلى هذا السؤال." />
              {cpOn ? (
                <Trace id="z3" ok={doneCp('z3')}
                  done={<MathText>{'أجبتَ في المختبر: بعد 3 نقرات تصغير صار الضلع $0{,}001$ م، والرقم 1 في الرتبة الثالثة بعد الفاصلة.'}</MathText>}
                  todo="أنجز في المستوى المبتدئ المهمة الثالثة (3 نقرات تصغير)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              ) : (
                <TapQuestion
                  prompt={<span>كل نقرة تصغير تقسم الضلع على <Ltr>10</Ltr> . ماذا يساوي الضلع بعد 3 نقرات تصغير؟</span>}
                  options={[
                    M('$\\frac{1}{10 \\times 10 \\times 10} = \\frac{1}{1000} = 0{,}001$'),
                    M('$-1000$'),
                    M('$0{,}0001$'),
                  ]}
                  correct={0} cols={1} requires={['ashara-sifr']}
                  explain={<MathText>{GUIDE.negExp}</MathText>}
                  onAnswered={() => setQ4(true)}
                />
              )}
              {(cpOn ? doneCp('z3') : !!q4) && <KnowledgeBrick id="ashara-salib" lead="ثلاث نقرات تصغير: ما علاقة $10^{-3}$ بـ $10^3$ ؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
