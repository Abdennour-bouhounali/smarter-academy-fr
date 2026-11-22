import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation } from '../../../../../../common/manipulations';
import { MethodSteps } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { METHOD_BRACKETS } from '../content/textbook';

/**
 * Module 3 — طريقة « أحذف الأقواس » (P2, P3). UNE SEULE PISTE (guide §4quater) : le MÊME labo que le module 1, posé SEUL en haut
 * (`levels={false}`, monde `brackets`) — des caisses « +( ) » puis « −( ) » : la main sort chaque pile « telle quelle » ou « signe
 * changé », la valeur de l'expression refuse la mauvaise sortie. Puis l'élève répond sur ce qu'il a fait, lit la méthode ligne à ligne,
 * puis la brique (gardée par « أتوقّع القاعدة »), puis un transfert. Les tâches du labo sont celles de `logic/likeTerms.js › BRACKET_TASKS`
 * (7 + (2x − 3), 9 − (4x − 5), 3x + (x − 2) − (5 − 2x)) ; la méthode revue est l'expression 4x² − 5 + (7x − 2x²) − (3 − 4x).
 * Déploiement du prototype (2026-10-28) : les questions sur ce que l'élève a FAIT sont posées PAR-DESSUS le labo après chaque tâche
 * (`LikeTerms › chainOf`, la règle clôt la dernière) ; les étapes en gardent la TRACE (`checkpoint-done`) puis posent les noms.
 */
const M = (s) => <MathText key={s}>{s}</MathText>;

export default function Module03Tariqa() {
  const [trials, setTrials] = useState([]);
  const [read, setRead] = useState(false);
  const [q3, setQ3] = useState(false);
  const record = (e) => setTrials((list) => [...list, e]);
  // les questions posées PAR-DESSUS le labo (LabCheckpoint) : une étape est faite quand la suite de questions de sa tâche l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);

  const Evidence = ({ id, ok, done, todo }) => (
    <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
      className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
      {ok ? done : todo}
    </p>
  );

  return (
    <ContentModule
      objectives={['لماذا تبقى الإشارات بعد +؟', 'لماذا تتغيّر الإشارات بعد −؟', 'ما خطوات الطريقة؟']}
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="طريقة — أحذف الأقواس"
      moduleSubtitle="صناديق + وصناديق −"
      estimatedTime="14 دقيقة"
      intro={<Manipulation type="like-terms" levels={false} world="brackets" onTrial={record} />}
      steps={[
        {
          num: 1, title: 'لماذا خرجت الحزم كما هي؟', subtitle: 'الصندوق المسبوق بـ +', done: answered('plus'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="plus" ok={answered('plus')}
                done={<MathText>{'أجبتَ في المختبر: من الصندوق $+(2x-3)$ خرجت الحزم كما هي: $7+(2x-3)=2x+4$ .'}</MathText>}
                todo="أخرج الحزم من الصندوق المسبوق بالإشارة + ، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('plus') && <KnowledgeBrick id="aqwas-jam" lead="الصندوق المسبوق بـ +: ماذا فعلتَ بإشارة كل حزمة؟" />}
            </div>
          ),
        },
        {
          num: 2, title: 'لماذا رفضت الطاولة الخروج كما هي؟', subtitle: 'الصندوق المسبوق بـ −', done: answered('minus'),
          content: (
            <div className="space-y-3" data-activity-evidence>
              <Evidence id="minus" ok={answered('minus')}
                done={<MathText>{'أجبتَ في المختبر: من الصندوق $-(4x-5)$ خرجت كل حزمة معكوسة: $9-(4x-5)=-4x+14$ .'}</MathText>}
                todo="أخرج الحزم من الصندوق المسبوق بالإشارة − ، وأجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('minus') && <KnowledgeBrick id="aqwas-tarh" lead="الصندوق المسبوق بـ −: ماذا فعلتَ بإشارة كل حزمة؟" />}
            </div>
          ),
        },
        {
          num: 3, title: 'الطريقة سطرًا سطرًا', subtitle: 'ثم مثال جديد', done: q3,
          content: (
            <div className="space-y-3">
              <MethodSteps method={METHOD_BRACKETS} onAllRevealed={() => setRead(true)} />
              {read && <KnowledgeBrick id="tariqat-hadhf" lead="الأقواس ثم الحدود المتشابهة: ما الترتيب الذي اتّبعتَه؟" />}
              <TapQuestion
                prompt={<MathText>{String.raw`بسّط العبارة $B=3x-(x-4)+(2x-1)$.`}</MathText>}
                options={[M('$4x+3$'), M('$4x-5$'), M('$4x+5$')]}
                correct={0} cols={3} requires={['tariqat-hadhf']}
                explain={<MathText>{'نحذف الأقواس: $3x-x+4+2x-1$ ثم نجمع: $(3-1+2)x+(4-1)=4x+3$. وإن نسينا تغيير إشارة $-4$ نجد $4x-5$.'}</MathText>}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} variant="memo" />}
    />
  );
}
