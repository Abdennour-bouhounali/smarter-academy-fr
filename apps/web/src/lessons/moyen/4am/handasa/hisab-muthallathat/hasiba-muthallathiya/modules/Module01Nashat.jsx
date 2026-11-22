import { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { TextbookBox } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ACTIVITY, DRONE, key } from '../content/textbook';

/**
 * Rétrofit 2026-10-15 : le labo EN TÊTE (plus de carte `brief`, ni titre/lead du workspace, ni titre/lead des labos : le contexte et la
 * mission sont ceux du labo) ; les briques et les réponses du livre restent après leur question.
 * Module 1 — نشاط 4 (p. 117) « استعمال حاسبة في حساب نسب مثلثية », ouvert sur LA CALCULATRICE DU DRONE (trig-calculator).
 *
 * REAL / DISCOVER / MANIPULATE  le lab à deux niveaux, même objectif :
 *   متقدم (ouvert par défaut : le نشاط 4) : le tableau 10°…75° (cos, sin, tan au centième), puis — ouverte par l'élève —
 *          l'étape des trois angles sin x = 0,52, cos x = 0,25, tan x = 1,33 aux trois précisions ;
 *   مبتدئ : 30°, 45°, 60° au centième (plateforme).
 * La calculatrice démarre en mode R : le premier calcul est contredit par le dessin du drone.
 * UNDERSTAND  les questions 1 et 2 du نشاط, sous les résultats de l'élève (`onTrial`, `[data-activity-evidence]`) ;
 *           le tableau complet et les trois angles du corrigé ne s'affichent qu'APRÈS la réponse.
 * FORMALIZE  les briques hasiba-nisba (angle → rapport) et hasiba-zawiya (rapport → angle).
 * AUCUNE étape n'attend `onFinished`. LP : P1 (le tableau), P2 (les angles), P3 (les arrondis).
 * La « مسألة الدرس » (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire) ferme la dernière étape (les labs vivent dans `intro`) : le même drone, un
 * triangle 36 / 48 / 60, résolue au module 4.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const near = (target, tol = 1e-9) => (x) => Number.isFinite(x) && Math.abs(x - target) <= tol;
const KINDS = [['cos', 'جيب تمام الزاوية'], ['sin', 'جيب الزاوية'], ['tan', 'ظل الزاوية']];
const ANGLES = ACTIVITY.numbers.angles;
const tex = (s) => String(s).replace(',', '{,}');

function AngleTable({ cell, caption }) {
  return (
    <div className="overflow-x-auto" dir="ltr">
      <table className="mx-auto border-collapse text-center text-sm">
        <caption className="pb-1 text-xs font-bold text-slate-600" dir="rtl">{caption}</caption>
        <thead>
          <tr>
            <th className="border border-slate-200 bg-slate-50 px-1.5 py-1" dir="rtl">الزاوية</th>
            {ANGLES.map((a) => <th key={a} className="border border-slate-200 bg-slate-50 px-1.5 py-1"><MathText>{`$${a}^{\\circ}$`}</MathText></th>)}
          </tr>
        </thead>
        <tbody>
          {KINDS.map(([kind, label], i) => (
            <tr key={kind}>
              <th className="border border-slate-200 bg-slate-50 px-1.5 py-1 text-start" dir="rtl">{label}</th>
              {ANGLES.map((a) => {
                const v = cell(a, kind, i);
                return <td key={a} className={`border border-slate-200 px-1.5 py-1 ${v ? 'font-bold text-slate-900' : 'text-slate-300'}`}>{v ? <MathText>{`$${v}$`}</MathText> : '…'}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Module01Nashat() {
  const [ev, setEv] = useState(null);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) laissent une trace `checkpoint-done` ; elles ne sont pas des essais de calcul (garde !ev.tk)
  const [cpDone, setCpDone] = useState({});
  const onTrial = (e) => {
    if (e?.tk) { if (e.tk === 'checkpoint-done') setCpDone((c) => ({ ...c, [e.id]: true })); return; }
    setEv(e);
  };
  const [q1a, setQ1a] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2a, setQ2a] = useState(false);
  const [q2, setQ2] = useState(false);

  const mine = (a, kind) => {
    const c = ev?.cells.find((x) => x.angle === a && x.kind === kind);
    return c ? tex(c.rounded) : null;
  };
  const tableEvidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-2 py-2" data-activity-evidence data-tried={ev?.cells.length ? 'true' : 'false'}>
      {ev?.cells.length ? (
        <AngleTable cell={mine} caption="جدولك (ما كتبته بالحاسبة في المستوى المتقدم):" />
      ) : (
        <p className="text-sm text-slate-500">لم تكتب بعد أي نسبة في جدول الحاسبة (المستوى المتقدم: الزوايا من 10° إلى 75°).</p>
      )}
    </div>
  );
  const anglesEvidence = (
    <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence data-tried={ev?.inverse.some((t) => Object.keys(t.found).length) ? 'true' : 'false'}>
      {ev?.inverse.some((t) => Object.keys(t.found).length) ? (
        <>
          <p className="mb-1 font-bold text-slate-700">الزوايا التي وجدتها بالحاسبة:</p>
          <ul className="space-y-0.5" data-evidence="angles">
            {ev.inverse.map((t) => (
              <li key={t.kind}>
                <MathText>{`$\\${t.kind} x = ${tex(t.value)}$`}</MathText>
                {' : '}
                {[2, 1, 0].filter((p) => t.found[p]).map((p) => <MathText key={p}>{`$x \\approx ${tex(t.found[p])}^{\\circ}$ `}</MathText>)}
                {![2, 1, 0].some((p) => t.found[p]) && <span className="text-slate-400">لم تجدها بعد</span>}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-slate-500">لم تجد بعد أي زاوية (المستوى المتقدم، بعد الجدول: « إلى الزوايا »).</p>
      )}
    </div>
  );

  return (
    <ContentModule
      objectives={['كيف نجد نسبة مثلثية لزاوية معلومة بالحاسبة؟', 'وكيف نجد الزاوية إذا عرفنا إحدى نسبها؟', 'لماذا تعطي الحاسبة أحيانًا نتائج يكذّبها الرسم؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط 4 — حاسبة الدرون"
      moduleSubtitle="الحاسبة تعطي النسبة من الزاوية، والزاوية من النسبة"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="trig-calculator"
                level="beginner"
                {...DRONE.numbers}
                theme="drone"
                onTrial={onTrial}
              />
            ),
            advanced: () => (
              <Manipulation
                type="trig-calculator"
                level="advanced"
                {...ACTIVITY.numbers}
                theme="drone"
                onTrial={onTrial}
              />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'جدول النسب', subtitle: 'السؤال 1', done: q1,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.part1} source={ACTIVITY.source} compact />
              {tableEvidence}
              <NumericQuestion
                prompt={<MathText>{'$\\cos 75^{\\circ}$ المدوّر إلى الجزء من 100:'}</MathText>}
                expected={near(0.26)}
                parse={parseDec}
                display="0,26"
                requires={['tadwir-adad']}
                explain={<MathText>{`${key('ON cos 75 =')} يعطي $0{,}2588190451$ ؛ الرقم الموالي 8 أكبر من 5: $\\cos 75^{\\circ} \\approx 0{,}26$ .`}</MathText>}
                explainFor={(n) => <MathText>{near(0.25, 1e-9)(n) ? 'هذا بتر: الشاشة $0{,}2588\\ldots$ والرقم الموالي 8، فنضيف 1: $\\cos 75^{\\circ} \\approx 0{,}26$ .' : near(0.97, 1e-9)(n) ? 'هذا $\\sin 75^{\\circ}$ : المطلوب جيب التمام، $\\cos 75^{\\circ} \\approx 0{,}26$ .' : `${key('ON cos 75 =')} يعطي $0{,}2588190451$ ، إذن $\\cos 75^{\\circ} \\approx 0{,}26$ .`}</MathText>}
                onAnswered={() => setQ1a(true)}
              />
              {q1a && (
                <TapQuestion
                  prompt="حسب الجدول: عندما يكبر قيس الزاوية الحادة من 10° إلى 75°:"
                  options={[
                    'يكبر جيب الزاوية ويصغر جيب تمامها',
                    'يكبر جيب الزاوية وجيب تمامها معا',
                    'يبقى ظل الزاوية أصغر من 1',
                  ].map(M)}
                  correct={0}
                  cols={1}
                  requires={['nisba-muthallathiya']}
                  explain={<MathText>{'$\\sin 10^{\\circ} \\approx 0{,}17$ ثم $\\sin 75^{\\circ} \\approx 0{,}97$ ، بينما $\\cos 10^{\\circ} \\approx 0{,}98$ ثم $\\cos 75^{\\circ} \\approx 0{,}26$ . والظل يتجاوز 1 بعد $45^{\\circ}$ : $\\tan 60^{\\circ} \\approx 1{,}73$ .'}</MathText>}
                  onAnswered={() => setQ1(true)}
                />
              )}
              {q1 && (
                <>
                  <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 px-2 py-2" data-activity-answer="table">
                    <AngleTable cell={(a, _k, i) => ACTIVITY.table[a][i]} caption="جدول النشاط كاملا (المدوّر إلى الجزء من 100):" />
                  </div>
                  <KnowledgeBrick id="hasiba-nisba" lead="ما فعلته أصابعك لكل خانة من الجدول:" />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'الزاوية من نسبتها', subtitle: 'السؤال 2', done: q2,
          content: (
            <div className="space-y-3">
              <TextbookBox kind="situation" text={ACTIVITY.part2} source={ACTIVITY.source} compact />
              {anglesEvidence}
              {cpDone.inv && (
                <p className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900" data-evidence="keys" data-tried="true">
                  أجبتَ في المختبر عن اللمسات: لإيجاد الزاوية من نسبتها نضغط <MathText>{key('2nd')}</MathText> ثم الدالة العكسية، لا الدالة وحدها.
                </p>
              )}
              {!cpDone.inv && <TapQuestion
                prompt={<MathText>{'لإيجاد x حيث $\\sin x = 0{,}52$ ، نضغط:'}</MathText>}
                options={[key('ON 2nd sin⁻¹ 0,52 ='), key('ON sin 0,52 ='), key('ON 2nd cos⁻¹ 0,52 =')].map(M)}
                correct={0}
                cols={1}
                requires={['hasiba-nisba']}
                explain={<MathText>{`${key('sin')} وحدها تحسب جيب زاوية قيسها $0{,}52^{\\circ}$ ( $\\approx 0{,}009$ )، و ${key('cos⁻¹')} تعطي الزاوية التي جيب تمامها $0{,}52$ . اللمسة ${key('2nd')} ثم ${key('sin⁻¹')} تعطي $x \\approx 31{,}33^{\\circ}$ .`}</MathText>}
                onAnswered={() => setQ2a(true)}
              />}
              {(q2a || cpDone.inv) && (
                <NumericQuestion
                  prompt={<MathText>{'x حيث $\\cos x = 0{,}25$ ، المدوّر إلى $\\dfrac{1}{10}$ (بالدرجة):'}</MathText>}
                  expected={near(75.5)}
                  parse={parseDec}
                  display="75,5"
                  requires={['hasiba-nisba']}
                  explain={<MathText>{`${key('ON 2nd cos⁻¹ 0,25 =')} يعطي $75{,}52248781$ ؛ رقم الأجزاء من 100 هو 2: $x \\approx 75{,}5^{\\circ}$ .`}</MathText>}
                  explainFor={(n) => <MathText>{near(75.52)(n) ? 'هذا المدوّر إلى الجزء من 100؛ المطلوب إلى الجزء من 10: $x \\approx 75{,}5^{\\circ}$ .' : near(14.5)(n) ? `هذه الزاوية التي جيبها $0{,}25$ ( ${key('sin⁻¹')} ): المطلوب ${key('cos⁻¹')} ، أي $x \\approx 75{,}5^{\\circ}$ .` : near(76)(n) ? 'هذا المدوّر إلى الوحدة؛ المطلوب إلى الجزء من 10: $x \\approx 75{,}5^{\\circ}$ .' : `${key('ON 2nd cos⁻¹ 0,25 =')} يعطي $75{,}52248781$ ، إذن $x \\approx 75{,}5^{\\circ}$ .`}</MathText>}
                  onAnswered={() => setQ2(true)}
                />
              )}
              {q2 && (
                <>
                  <div className="overflow-x-auto rounded-xl border-2 border-emerald-200 bg-emerald-50/50 px-2 py-2" data-activity-answer="angles">
                    <table className="mx-auto border-collapse text-center text-sm">
                      <caption className="pb-1 text-xs font-bold text-slate-600">جواب النشاط:</caption>
                      <thead><tr>{['', 'المدوّر إلى 1/100', 'المدوّر إلى 1/10', 'المدوّر إلى الوحدة'].map((h) => <th key={h} className="border border-slate-200 bg-slate-50 px-1.5 py-1">{h}</th>)}</tr></thead>
                      <tbody>
                        {[['sin', '0{,}52'], ['cos', '0{,}25'], ['tan', '1{,}33']].map(([kind, v]) => (
                          <tr key={kind}>
                            <th className="border border-slate-200 bg-slate-50 px-1.5 py-1"><MathText>{`$\\${kind} x = ${v}$`}</MathText></th>
                            {ACTIVITY.inverse[kind].map((a) => <td key={a} className="border border-slate-200 px-1.5 py-1 font-bold"><MathText>{`$${a}^{\\circ}$`}</MathText></td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <KnowledgeBrick id="hasiba-zawiya" lead="والعكس: من النسبة إلى الزاوية." />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
