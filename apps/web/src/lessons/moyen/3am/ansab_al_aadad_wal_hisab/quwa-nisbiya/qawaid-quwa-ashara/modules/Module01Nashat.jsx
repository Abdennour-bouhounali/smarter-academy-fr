import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { useLabCheckpointSettings } from '../../../../../../common/manipulations/primitives/labCheckpointSettings';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { GUIDE } from '../content/textbook';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la مسطرة التحويل. UNE SEULE PISTE (§4quater) : le labo `unit-ladder` en
 * haut, sans carte au-dessus — il porte son contexte et SA question ; la main tend un ruban entre deux plaques d'unités et lit le nombre de colonnes.
 *   مبتدئ — u1 km→m→mm (deux rubans, prédiction 6 / 9 / 3) ; u2 km→cm (prédiction 5 / 1 / 6) ; u3 mm→µm ;
 *   متقدم — u4 km²→m² ; u5 m³→cm³ ; u6 mm²→m² ; u7 m³→dm³ (le mode choisi, aucun facteur écrit avant « ثبّت »).
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES rubans : pourquoi 3 colonnes puis 3 colonnes font 6 (P1), ce que vaut un ruban de part et d'autre du mètre (P2),
 * comment les tables d'aire et de volume changent le compte (P3). Les noms (briques) viennent APRÈS la réponse. L'نشاط 4 du manuel (écrire les facteurs) n'est pas l'entrée :
 * le décompte devient la justification de chaque brique. Le rappel de `quwat-adad-nisbi` est dans le module 2.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  const [cps, setCps] = useState([]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) remplacent celles des étapes ci-dessous ; coupées par l'enseignant, les questions d'origine reviennent
  const cpOn = useLabCheckpointSettings('unit-ladder').enabled;
  const doneCp = (id, level) => cps.some((e) => e.tk === 'checkpoint-done' && e.id === id && (!level || e.level === level));
  const onCheckpoint = (level) => (e) => setCps((l) => [...l, { ...e, level }]);
  const Trace = ({ id, ok, done, todo }) => (
    <p data-checkpoint-trace={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );
  const solved = (id) => trials.findLast((e) => e.kind === 'solved' && !e.free && e.task === id);
  const u1 = solved('u1');
  const u2 = solved('u2');
  const u4 = solved('u4');
  const u5 = solved('u5');

  /** Ce que l'élève a fait au labo, rappelé au-dessus de la question qui s'en sert. */
  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['ماذا يحدث للأعمدة حين نتابع تحويلين؟', 'كم عمودًا بين وحدتين على جهتي المتر؟', 'ماذا يتغيّر في جدولَي المساحة والحجم؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — مسطرة التحويل"
      moduleSubtitle="نمدّ شريطًا بين لوحات الوحدات ونعدّ الأعمدة"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="unit-ladder" level="beginner" onTrial={record} onCheckpoint={onCheckpoint('beginner')} />,
            advanced: () => <Manipulation type="unit-ladder" level="advanced" onTrial={record} onCheckpoint={onCheckpoint('advanced')} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا ستة أعمدة من الكيلومتر إلى المليمتر؟', subtitle: 'شريطان متتابعان', done: (cpOn ? doneCp('u1') : !!q.a),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="hops" ok={!!u1}
                done={<span>مددتَ شريطًا من كم إلى م (<Ltr>3</Ltr> أعمدة) ثم من م إلى ملم (<Ltr>3</Ltr> أعمدة): الشريط المنقّط قطع <Ltr>{u1?.k}</Ltr> أعمدة.</span>}
                todo="في المستوى المبتدئ، المهمة الأولى (كم ميليمترًا في 1 كم): ثبّت الشريطين، ثم عُد إلى هذا السؤال." />
              {cpOn ? (
                <Trace id="u1" ok={doneCp('u1')}
                  done={<MathText>{'أجبتَ في المختبر: الشريطان المتتابعان قطعا 3 أعمدة ثم 3 أعمدة، فالمنقّط قطع 6 أعمدة: $10^{3} \\times 10^{3} = 10^{6}$ ، تُجمع الأعمدة أي الأسّان.'}</MathText>}
                  todo="أنجز في المستوى المبتدئ المهمة الأولى (من كم إلى ملم)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              ) : (
                <TapQuestion
                  prompt={<span><MathText>{'$1\\ \\mathrm{km} = 10^{3}\\ \\mathrm{m}$ و $1\\ \\mathrm{m} = 10^{3}\\ \\mathrm{mm}$ ، إذن $1\\ \\mathrm{km} = 10^{3} \\times 10^{3}\\ \\mathrm{mm}$ يساوي:'}</MathText></span>}
                  options={[M('$10^{9}$'), M('$10^{6}$'), M('$100^{6}$')]}
                  correct={1} cols={3} requires={['quwa-ashara']}
                  explain={<MathText>{GUIDE.hop}</MathText>}
                  onAnswered={answered('a')}
                />
              )}
              {(cpOn ? doneCp('u1') : !!q.a) && <KnowledgeBrick id="jidaa-quwa-ashara" lead="شريطان: 3 أعمدة ثم 3 أعمدة. ماذا يحدث للأسّين في الجداء؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'كم سنتيمترًا في الكيلومتر؟', subtitle: 'شريط على جهتي المتر', done: (cpOn ? doneCp('u2') : !!q.b),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="gap" ok={!!u2}
                done={<span>من لوحة كم إلى لوحة سم عبر لوحة المتر: الشريط قطع <Ltr>{u2?.k}</Ltr> أعمدة.</span>}
                todo="أنجز في المستوى المبتدئ المهمة الثانية (كم سنتيمترًا في 1 كم)، ثم عُد إلى هذا السؤال." />
              {cpOn ? (
                <Trace id="u2" ok={doneCp('u2')}
                  done={<MathText>{'أجبتَ في المختبر: من لوحة كم إلى لوحة سم قطع الشريط 5 أعمدة: $\\frac{10^{3}}{10^{-2}} = 10^{5}$ ، فالأعمدة على جهتي لوحة المتر تُحسب كلّها.'}</MathText>}
                  todo="أنجز في المستوى المبتدئ المهمة الثانية (من كم إلى سم)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              ) : (
                <TapQuestion
                  prompt={<span>عدد السنتيمترات في <Ltr>1</Ltr> كم هو <MathText>{'$\\frac{10^{3}}{10^{-2}}$'}</MathText> ، أي:</span>}
                  options={[M('$10^{-5}$'), M('$10^{1}$'), M('$10^{5}$')]}
                  correct={2} cols={3} requires={['jidaa-quwa-ashara']}
                  explain={<MathText>{GUIDE.gap}</MathText>}
                  onAnswered={answered('b')}
                />
              )}
              {(cpOn ? doneCp('u2') : !!q.b) && <KnowledgeBrick id="hasil-quwa-ashara" lead="لوحتان على جهتي المتر: كم عمودًا بينهما؟ وما قاعدة القسمة؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'كم عمودًا من كم² إلى م² ؟', subtitle: 'جدول المساحة', done: (cpOn ? doneCp('u4') : !!q.c),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="area" ok={!!u4}
                done={<span>في جدول المساحة أخذت كل وحدة عمودين: من كم² إلى م² قطع الشريط <Ltr>{u4?.k}</Ltr> أعمدة.</span>}
                todo="في المستوى المتقدّم، المهمة الأولى (كم م² في 1 كم²): اختر جدول المساحة وثبّت الشريط، ثم عُد إلى هذا السؤال." />
              {cpOn ? (
                <Trace id="u4" ok={doneCp('u4')}
                  done={<MathText>{'أجبتَ في المختبر: في جدول المساحة تأخذ كل وحدة عمودين، فمن كم² إلى م² قطع الشريط $3 \\times 2 = 6$ أعمدة.'}</MathText>}
                  todo="أنجز في المستوى المتقدّم المهمة الأولى (كم² إلى م²)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              ) : (
                <TapQuestion
                  prompt={<span><MathText>{'$1\\ \\mathrm{km^2} = (10^{3})^{2}\\ \\mathrm{m^2}$ يساوي:'}</MathText></span>}
                  options={[M('$10^{5}$'), M('$10^{9}$'), M('$10^{6}$')]}
                  correct={2} cols={3} requires={['hasil-quwa-ashara']}
                  explain={<MathText>{GUIDE.area}</MathText>}
                  onAnswered={answered('c')}
                />
              )}
              {(cpOn ? doneCp('u4') : !!q.c) && <KnowledgeBrick id="quwat-quwa-ashara" lead="عمودان لكل وحدة: ماذا يحدث للأعمدة حين ندخل الأسّ في الجدول؟" />}
            </div>
          ),
        },
        {
          num: 4, title: 'وفي جدول الحجم؟', subtitle: 'ثلاثة أعمدة لكل وحدة', done: (cpOn ? doneCp('u5') : !!q.d),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="volume" ok={!!u5}
                done={<span>في جدول الحجم أخذت كل وحدة ثلاثة أعمدة: من م³ إلى سم³ قطع الشريط <Ltr>{u5?.k}</Ltr> أعمدة.</span>}
                todo="أنجز في المستوى المتقدّم المهمة الثانية (كم سم³ في 1 م³)، ثم عُد إلى هذا السؤال." />
              {cpOn ? (
                <Trace id="u5" ok={doneCp('u5')}
                  done={<MathText>{'أجبتَ في المختبر: في جدول الحجم تأخذ كل وحدة ثلاثة أعمدة، فمن م³ إلى سم³ قطع الشريط $2 \\times 3 = 6$ أعمدة.'}</MathText>}
                  todo="أنجز في المستوى المتقدّم المهمة الثانية (م³ إلى سم³)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              ) : (
                <TapQuestion
                  prompt={<span><MathText>{'$1\\ \\mathrm{m^3} = (10^{2})^{3}\\ \\mathrm{cm^3}$ يساوي:'}</MathText></span>}
                  options={[M('$10^{6}$'), M('$10^{5}$'), M('$10^{8}$')]}
                  correct={0} cols={3} requires={['quwat-quwa-ashara']}
                  explain={<MathText>{'$(10^{2})^{3} = 10^{2 \\times 3} = 10^{6}$ : ثلاثة أعمدة لكل وحدة من وحدات الطول الاثنتين. ($10^{5}$ يجمع $2 + 3$ ، و $10^{8} = 10^{2^3}$ يرفع الأسّ إلى القوة.)'}</MathText>}
                  onAnswered={answered('d')}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
