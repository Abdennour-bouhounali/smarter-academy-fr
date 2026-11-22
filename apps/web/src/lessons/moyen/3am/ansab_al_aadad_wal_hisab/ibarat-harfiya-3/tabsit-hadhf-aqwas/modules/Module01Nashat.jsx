import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — l'ENTRÉE de la leçon, choisie par la plateforme (LESSON_DEVELOPMENT_GUIDE §4ter) : la table du club de mathématiques. UNE SEULE
 * PISTE (§4quater) : le labo `like-terms` (monde `collect`) en haut, sans carte au-dessus — il porte son contexte et SA question ; la main
 * porte des PILES de pièces (les termes) dans la صينية de leur forme.
 *   مبتدئ — 2x + 3 + 4x + 1 + x puis 5x + 6 − 2x − 4 (des pièces opposées se détruisent) ;
 *   متقدم — des x² entrent, plus de lecture : l'élève écrit le coefficient de chaque plateau, « تحقّق » juge.
 * Les ÉTAPES interrogent ce que l'élève a FAIT, avec SES refus et SES compteurs : pourquoi la table refuse une pile dans la mauvaise صينية
 * (P1), pourquoi cinq pièces et deux pièces opposées laissent trois pièces (P1), pourquoi les deux compteurs de valeur restent égaux quand
 * la main change x (P1). Les noms (briques) viennent APRÈS la réponse. Le نشاط 1 du manuel est posé en application au module 4.
 * Déploiement du prototype (2026-10-28) : les questions sur ce que l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche
 * (`LikeTerms › chainOf`, la règle clôt la dernière) ; les étapes en gardent la TRACE (`checkpoint-done`) puis posent les noms.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const Ltr = ({ children }) => <bdi dir="ltr">{children}</bdi>;

export default function Module01Nashat() {
  const [trials, setTrials] = useState([]);
  const [q3, setQ3] = useState(false);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);
  const moved = trials.filter((e) => e.kind === 'x');

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['لماذا رفضت الطاولة حزمة في صينية؟', 'ماذا يحدث لحزمة ومعاكستها؟', 'ماذا بقي ثابتًا حين غيّرتَ x؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="نشاط — طاولة النادي"
      moduleSubtitle="حزم وصواني"
      estimatedTime="14 دقيقة"
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => <Manipulation type="like-terms" level="beginner" onTrial={record} />,
            advanced: () => <Manipulation type="like-terms" level="advanced" onTrial={record} />,
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'لماذا رفضت الطاولة الحزمة؟', subtitle: 'الصينية الخاطئة', done: answered('collect-1'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="refused" ok={answered('collect-1')}
                done={<MathText>{'أجبتَ في المختبر: اجتمعت في صينية $x$ القطع التي لها الشكل نفسه فقط: $2x+4x+x=7x$ .'}</MathText>}
                todo="رتّب حزم العبارة الأولى في صوانيها، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('collect-1') && <KnowledgeBrick id="hudud-mutashabiha" lead="الحزم التي اجتمعت في صينية واحدة: ما الذي جمعها؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'ماذا حدث للقطع المتعاكسة؟', subtitle: 'تلاشي الأزواج', done: answered('collect-2'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="cancel" ok={answered('collect-2')}
                done={<MathText>{'أجبتَ في المختبر: في صينية $x$ تلاشت قطعتان مع معاكستيهما فبقي $5-2=3$ ، و $5x+6-2x-4=3x+2$ .'}</MathText>}
                todo="رتّب العبارة الثانية (فيها قطع معاكسة)، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('collect-2') && <KnowledgeBrick id="jam-muamilat" lead="في الصينية الواحدة: كيف عرفتَ عدد القطع الباقية؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'ماذا بقي ثابتًا حين غيّرتَ x؟', subtitle: 'العدّادان', done: q3,
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="x" ok={moved.length > 0}
                done={<span>غيّرتَ <Ltr>x</Ltr> فتحرّك العدّادان معًا وبقيا متساويين.</span>}
                todo="غيّر قيمة x بالزرّين (+ و −) في لوحة القيمة، وانظر إلى العدّادين، ثم عُد إلى هذا السؤال." />
              <TapQuestion
                prompt={<MathText>{String.raw`غيّرتَ $x$ والعدّادان بقيا متساويين. ماذا يعني ذلك؟`}</MathText>}
                options={[
                  M('لعبارة الورقة وللعبارة بعد الترتيب القيمة نفسها مهما كان $x$'),
                  M('العدّادان متساويان لأنّنا لم نغيّر شيئًا في الطاولة'),
                  M('لا علاقة بين العبارتين، والتساوي صدفة'),
                ]}
                correct={0} cols={1} requires={['jam-muamilat']}
                explain={<MathText>{'الترتيب لا يضيف قطعة ولا يزيلها إلا بتلاشي الأزواج المتعاكسة التي مجموعها صفر: قيمة الطاولة هي قيمة العبارة عند كل $x$.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
              {q3 && <KnowledgeBrick id="qima-thabita" lead="قبل الترتيب وبعده، وعند كل x: ماذا لم يتغيّر؟" />}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
