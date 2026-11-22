import { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox } from '../../../../../../common/textbook';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { KNOWLEDGE, RECALL_ADD, GUIDE, LAB_SIGNS } from '../content/textbook';
import { getLessonPath } from '@smarter-academy/core';
import { Link } from 'react-router-dom';

/**
 * Module 2 — معارف : UNE SEULE PISTE (§4quater). Le labo `sign-machine` (« آلة الجداءات », 2026-10-27, demande du propriétaire : « une
 * manipulation sur la façon dont le signe du résultat change ») est en haut, sans carte au-dessus : la machine porte −3, la main fait
 * descendre le second facteur de 4 à −4 et chaque produit s'allume en colonne au-dessus ou au-dessous de la ligne 0 ; le côté négatif est
 * verrouillé jusqu'à la PRÉDICTION de (−3) × (−1). En متقدم la main retourne aussi le signe du premier facteur (le tableau se renverse).
 * L'étape 1 interroge ce que l'élève a VU (le pas reste +3 après 0, avec SES colonnes). Puis le POURQUOI : si (−3) × (−4) était négatif,
 * (−3) × 4 + (−3) × (−4) ne vaudrait pas (−3) × 0 = 0. Le raisonnement est le نشاط 3 du manuel, redessiné (autres nombres) : la
 * distributivité sert UNE fois, comme ARGUMENT (jamais enseignée ici comme technique), puis le tableau (−4) × n hors machine (transfert),
 * puis les décimaux. Les additions de 2AM sont RAPPELÉES (« تذكّر »), jamais reconstruites. Les encadrés viennent APRÈS la réponse. LP : P2, P3.
 * Déploiement du prototype (2026-10-28) : « de combien le produit monte ? » et « pourquoi il passe de l'autre côté de 0 » sont posées PAR-DESSUS
 * le labo (`SignMachine › CHAINS`) ; l'étape 1 en garde la TRACE (`checkpoint-done` de la prédiction).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{String(children).replace(/-/g, '−')}</bdi>;
const par = (v) => (v < 0 ? `(${v})` : `${v}`);

export default function Module02Maarif() {
  const [q, setQ] = useState({});
  const [trials, setTrials] = useState([]);
  const answered = (k) => () => setQ((s) => ({ ...s, [k]: true }));
  const record = (e) => setTrials((list) => [...list, e]);
  const asked = (...ids) => trials.some((e) => e.tk === 'checkpoint-done' && ids.includes(e.id));
  const recallPath = getLessonPath(RECALL_ADD.lesson);
  // ce que l'élève a vu à la machine : la prédiction réussie (le premier produit allumé de l'autre côté de 0)
  const seen = trials.findLast((e) => e.kind === 'predict' && e.ok && !e.free);
  const a = seen?.a ?? LAB_SIGNS.beginner.a;
  const stepUp = -a;
  return (
    <ContentModule
      objectives={['ماذا يحدث للجداء بعد الصفر عندما ينقص العامل الثاني؟', 'كيف أحسب $(-3) \\times 4$ ؟', 'لماذا يجب أن يكون جداء سالبين موجبًا؟', 'ماذا يحدث في جدول جداءات ينقص عاملها الثاني؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="معارف — لماذا جداء سالبين موجب؟"
      moduleSubtitle="الخاصية التوزيعية دليلًا، ثم جدول"
      estimatedTime="16 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="sign-machine" level="beginner" a={LAB_SIGNS.beginner.a} tasks={LAB_SIGNS.beginner.tasks} onTrial={record} />,
            advanced: () => <Manipulation type="sign-machine" level="advanced" a={LAB_SIGNS.advanced.a} tasks={LAB_SIGNS.advanced.tasks} onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ماذا فعل الجداء بعد الصفر؟', subtitle: 'أعمدة آلتك', done: asked('p1', 'a1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <p data-evidence="sign-machine" data-tried={asked('p1', 'a1') ? 'true' : 'false'}
                className={`rounded-xl border-2 px-3 py-2 text-sm ${asked('p1', 'a1') ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
                {asked('p1', 'a1')
                  ? <span>أجبتَ في الآلة: <Ltr>{`${par(a)} × 1 = ${a}`}</Ltr> ثم <Ltr>{`${par(a)} × 0 = 0`}</Ltr> ثم <Ltr>{`${par(a)} × (-1) = ${-a}`}</Ltr> — الجداء يزيد بـ <Ltr>{stepUp}</Ltr> في كل مرّة، قبل الصفر وبعده.</span>
                  : 'أنجز المهمتين الأوليين في الآلة أعلاه (حتى التوقّع بعد الصفر)، وأجب عن الأسئلة التي تظهر فوقها.'}
              </p>
            </div>
          ),
        },
        {
          num: 2, title: 'ما قيمة $(-3) \\times 4$ ؟', subtitle: 'جمع متكرر', done: !!q.a,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'احسب: $(-3) \\times 4$'}</MathText>}
                expected={-12} display="−12" requires={['jidaa-jamaa']}
                explain={<MathText>{'$(-3) + (-3) + (-3) + (-3) = -12$ : أربعة حدود كلّها $-3$ .'}</MathText>}
                onAnswered={answered('a')}
              />
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا يساوي الجداء $(-3) \\times 0$ ؟', subtitle: 'توزيع الضرب مرّة واحدة', done: !!q.b,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'أكمل: $(-3) \\times 4 + (-3) \\times (-4) = (-3) \\times \\big(4 + (-4)\\big) = (-3) \\times 0 = \\;?$'}</MathText>}
                expected={0} requires={['jidaa-jamaa']}
                explain={<MathText>{'العددان $4$ و $-4$ معاكسان فمجموعهما $0$ ، وأيّ عدد في $0$ يعطي $0$ .'}</MathText>}
                onAnswered={answered('b')}
              />
            </div>
          ),
        },
        {
          num: 4, title: 'ما قيمة $(-3) \\times (-4)$ ؟', subtitle: 'العدد الذي يُتمّ $-12$ إلى 0', done: !!q.c,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'إذن $-12 + (-3) \\times (-4) = 0$ . ما العدد الذي إذا أُضيف إلى $-12$ أعطى $0$ ؟ وهو قيمة $(-3) \\times (-4)$ .'}</MathText>}
                expected={12} requires={['jidaa-jamaa']}
                explain={<MathText>{GUIDE.negneg.why + ' ' + GUIDE.negneg.right}</MathText>}
                onAnswered={answered('c')}
              />
              {q.c && <KnowledgeBrick id="tabrir-tawzi" lead="لو كان $(-3) \\times (-4)$ سالبًا، فهل يبقى المجموع صفرًا؟" />}
              {q.c && <TextbookBox kind="property" compact text={KNOWLEDGE.justify.text} source={KNOWLEDGE.justify.source} />}
            </div>
          ),
        },
        {
          num: 5, title: 'ماذا بعد الصفر في الجدول؟', subtitle: 'جدول ينقص عاملُه الثاني', done: !!q.d,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-100 bg-white p-3 text-center" dir="ltr">
                {KNOWLEDGE.table.rows.map((r) => <p key={r}><MathText>{`$${r}$`}</MathText></p>)}
              </div>
              <TapQuestion
                prompt={<MathText>{'كلّما نقص العامل الثاني بـ 1 زاد الجداء بـ 4. أكمل: $(-4) \\times (-1)$ و $(-4) \\times (-2)$ يساويان:'}</MathText>}
                options={[M('$4$ و $8$'), M('$-4$ و $-8$'), M('$-5$ و $-6$')]}
                correct={0} cols={3} requires={['tabrir-tawzi']}
                explain={<MathText>{'نتابع: $0 \\to 4 \\to 8$ . ($-4$ و $-8$ يتابعان نقصان الجداء، و $-5$ و $-6$ جمع.)'}</MathText>}
                onAnswered={answered('d')}
              />
              {q.d && <KnowledgeBrick id="jadwal-munakhafid" lead="جدول يُنقَص عامله الثاني بواحد: ماذا يحدث للجداء؟" />}
              {q.d && <TextbookBox kind="remark" compact text={KNOWLEDGE.table.text} source={KNOWLEDGE.table.source} />}
            </div>
          ),
        },
        {
          num: 6, title: 'وإذا كان العددان عشريين؟', subtitle: 'الطريقة نفسها', done: !!q.e,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={<MathText>{'$(-2{,}5) \\times 0{,}4 = -1$ . استعمل الطريقة نفسها لتجد $(-2{,}5) \\times (-0{,}4)$ .'}</MathText>}
                expected={1} requires={['tabrir-tawzi']}
                explain={<MathText>{'$(-2{,}5) \\times 0{,}4 + (-2{,}5) \\times (-0{,}4) = (-2{,}5) \\times 0 = 0$ ، وعدد يُتمّ $-1$ إلى $0$ هو $1$ .'}</MathText>}
                onAnswered={answered('e')}
              />
              {q.e && (
                <TextbookBox kind="remark" compact title={RECALL_ADD.title} text={RECALL_ADD.text} source={RECALL_ADD.source}>
                  {recallPath && <Link to={recallPath} className="inline-flex min-h-[44px] items-center text-sm font-bold text-teal-700 underline underline-offset-4" data-recall-link>درس « جمع وطرح الأعداد النسبية » — السنة الثانية متوسط</Link>}
                </TextbookBox>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
