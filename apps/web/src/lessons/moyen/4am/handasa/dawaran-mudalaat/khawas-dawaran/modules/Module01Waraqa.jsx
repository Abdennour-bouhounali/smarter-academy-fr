import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Feedback } from '../../../../../../common/components/LessonUI';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB } from '../content/textbook';
import LabEvidence from '../components/LabEvidence';

/**
 * Module 1 — l'ENTRÉE de la leçon (pas d'activité du manuel, DÉCLARÉ) : le laboratoire `shape-turn`, la feuille calque
 * d'un artisan du zellige de Tlemcen.
 *
 * LE WORKSPACE (un objectif, props = content/textbook.js › LAB = levels.js) :
 *   مبتدئ  (défaut) la rosace : un pétale ABC, la feuille tournée de 60° en 60° dans le sens direct, cinq copies
 *          imprimées de proche en proche ; le faux mors ↔ étire la feuille (refusé : « ليس دورانا: تغيّر الطول ») ;
 *   متقدم  la طريقة p. 155 : [AC] tourné sur [BD], AC = BD et (AC) ⊥ (BD) prouvés par cartes ; puis l'exercice 18.
 * Le module n'ouvre PAS sur la طريقة (sa place est le module 3, où le même workspace s'ouvre sur متقدم). Aucune étape
 * n'attend le laboratoire (`onFinished`) : les questions portent sur des gestes que l'élève a faits, listés au-dessus
 * d'elles ([data-activity-evidence]).
 *   1. ce qui reste, ce qui change (le tableau de bord)     → brique thabat-dawaran (P1)
 *   2. la feuille étirée n'est pas un دوران                (P1)
 *   3. 90° : la droite et son image sont perpendiculaires   (P1, préparé pour معارف)
 * PROTOTYPE DU LABO (2026-10-28, lot 3) : `shape-turn` pose ses questions PAR-DESSUS le labo (`ShapeTurn › STEPS` : r1 la rosace fermée, r2 la feuille étirée
 * puis la règle) ; les étapes 1 et 2 en gardent la TRACE (`answered('r1')`, `answered('r2')` = événement `checkpoint-done`), l'étape 1 pose ensuite les
 * lignes de la اللوحة que le labo ne demande pas (angle, aire, alignement, منحى) et la brique ; l'étape 3 (90° ⇒ ⊥) reste une question d'étape.
 * RÉTROFIT 2026-10-15 (§4quater) : plus de `brief` au-dessus du labo (la carte « وردة زليج في دقائق » + l'énoncé de ACTIVITY), plus de
 * `title`/`lead` sur le workspace : le labo ouvre la page, son contexte tient dans sa `lead` (une phrase) et sa mission.
 * Les deux niveaux vivent dans l'`intro` : le rappel de la « مسألة الدرس » (ANCIENNE carte, retirée du module le 2026-10-09 — elle ne vit plus qu'au sommaire) clôt la DERNIÈRE étape.
 * « أتوقّع القاعدة » : le feedback du tableau de bord ne dit PAS la règle (la brique thabat-dawaran la fait écrire), et
 * l'explain de l'étape 3 rapporte la lecture (90° ⇒ متعامدان) sans énoncer la règle zawiya-sura (prédite au module 2).
 */
const M = (s) => <MathText key={s}>{s}</MathText>;
const PETALS = Math.round(360 / LAB.beginner.numbers.alpha);

const Evidence = ({ id, ok, done, todo }) => (
  <p data-evidence={id} data-tried={ok ? 'true' : 'false'}
    className={`rounded-xl border-2 px-3 py-2 text-sm ${ok ? 'border-emerald-200 bg-emerald-50 font-bold text-emerald-900' : 'border-slate-200 bg-white text-slate-500'}`}>
    {ok ? done : todo}
  </p>
);

export default function Module01Waraqa() {
  const [trials, setTrials] = useState([]);
  const [q, setQ] = useState({});
  const mark = (n) => () => setQ((s) => ({ ...s, [n]: true }));
  const keep = (e) => { if (e) setTrials((list) => [...list, e].slice(-60)); };
  // les questions posées PAR-DESSUS le labo (LabCheckpoint, `ShapeTurn › STEPS`) : une étape est faite quand la suite de questions de sa étape l'est
  const answered = (id) => trials.some((e) => e.tk === 'checkpoint-done' && e.id === id);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="الورقة الشفافة — وردة زليج تلمسان"
      moduleSubtitle="ورقة تدور حول دبوس: ماذا يتغيّر في البتلة، وماذا لا يتغيّر؟"
      estimatedTime="12 دقيقة"
      objectives={["ماذا يتغيّر في البتلة حين تدور الورقة، وماذا يبقى؟", "هل تبقى الورقة الممطّطة صورة بدوران؟", "كيف يقف مستقيم من صورته حين أدير الورقة 90 درجة؟"]}
      intro={
        <ManipulationWorkspace
          levels={{
            beginner: () => (
              <Manipulation type="shape-turn" level="beginner" numbers={LAB.beginner.numbers} theme="zellige"
                lead="معلّم الزليج المتقن لحرفته في تلمسان يرسم بتلة على ورقة شفافة، ويثبّتها بدبوس في مركز الوردة."
                title="وردة الزليج: ورقة شفافة تدور حول دبوس" onTrial={keep} />
            ),
            advanced: () => (
              <Manipulation type="shape-turn" level="advanced" numbers={LAB.advanced.numbers} theme="zellige"
                title="طريقة الكتاب (ص 155): [AC] و [BD]" onTrial={keep} />
            ),
          }}
        />
      }
      steps={[
        {
          num: 1, title: 'ما الذي بقي على حاله؟', subtitle: 'اللوحة: الطول، الزاوية، المساحة، الاستقامية', done: !!q[1],
          content: (
            <div className="space-y-3">
              <Evidence id="r1" ok={answered('r1')}
                done={<span>أجبتَ في المختبر: الوردة الكاملة <bdi dir="ltr">{PETALS}</bdi> بتلات، وطول <MathText>{"$A'B'$"}</MathText> بقي في كل نسخة هو طول <MathText>{'$AB$'}</MathText> .</span>}
                todo="أغلق الوردة بطبع النسخ الخمس في المستوى «مبتدئ»، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('r1') && <LabEvidence id="turns" trials={trials} filter={(e) => e.mode === 'rosette' && (e.kind === 'stamp' || e.kind === 'turn')}
                title="ما فعلته بالورقة:" empty="في المستوى «مبتدئ»: أدر الورقة واطبع نسخة أو اثنتين، وراقب اللوحة." />}
              {answered('r1') && <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">في كل نسخة طبعتها، قارن بالبتلة ABC:</p>}
                rows={[
                  { id: 'zawiya', label: <MathText>{"قيس الزاوية $\\widehat{A'B'C'}$"}</MathText>, options: ['يساوي قيس $\\widehat{ABC}$', 'يزيد بزاوية الدوران'].map(M), correct: 0, correction: 'الزاوية في B بقيت $45^\\circ$ في كل نسخة.' },
                  { id: 'masaha', label: 'مساحة النسخة', options: ['تساوي مساحة البتلة', 'تتغيّر مع موضع النسخة'], correct: 0, correction: 'المساحة 3 في كل نسخة.' },
                  { id: 'istiqama', label: 'النقط A′ و I′ و B′', options: ['على استقامية واحدة', 'لم تعد على استقامية'], correct: 0, correction: 'I منتصف [AB] يبقى على [A′B′] في كل نسخة.' },
                  // MISC-DAWARAN-TAWAZI
                  { id: 'manha', label: 'منحى المستقيم (A′B′)', options: ['يتغيّر: يصنع مع (AB) زاوية', 'لا يتغيّر: يوازي (AB) دائما'], correct: 0, correction: 'اللوحة تقرأ الزاوية بين (AB) و (A′B′): $60^\\circ$ للنسخة الأولى.' },
                ]}
                requires={['surat-qita-dawaran']}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'أحسنت: قارنت كل سطر من اللوحة بالبتلة الأصلية.' : 'راجع التصحيح تحت كل سطر، ثم أدر الورقة من جديد وانظر إلى اللوحة.'}</Feedback>}
                onAnswered={mark(1)}
              />}
              {q[1] && <KnowledgeBrick id="thabat-dawaran" lead="ما رأيته على اللوحة:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'الورقة الممطّطة', subtitle: 'هل هي دوران؟', done: answered('r2'),
          content: (
            <div className="space-y-3">
              <Evidence id="r2" ok={answered('r2')}
                done={<span>أجبتَ في المختبر: الورقة الممطّطة غيّرت الطول، فنسختها ليست صورة بدوران، والاستقامية وحدها لا تكفي.</span>}
                todo="مطّط الورقة بالمقبض ↔ في المستوى «مبتدئ»، ثم أجب عن الأسئلة التي تظهر فوق المختبر." />
              {answered('r2') && (
                <LabEvidence id="stretch" trials={trials} filter={(e) => e.kind === 'stretch' || (e.kind === 'refuse' && e.reason === 'stretch')}
                  title="ما حدث حين مطّطت الورقة:" empty="" />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'المستقيم وصورته', subtitle: 'أدر الورقة 90°', done: !!q[3],
          content: (
            <div className="space-y-3">
              <LabEvidence id="quarter" trials={trials} filter={(e) => e.kind === 'turn'}
                title="الزوايا التي قرأتها:" empty="أدر الورقة إلى 90° ثم إلى 180°، واقرأ «الزاوية بين المستقيمين» في اللوحة." />
              <TapQuestion
                prompt={<MathText>{"أدر الورقة $90^\\circ$ في الاتجاه المباشر واقرأ اللوحة: ما وضع المستقيم (A′B′) بالنسبة إلى (AB)؟"}</MathText>}
                options={['متعامدان', 'متوازيان', 'منطبقان']}
                correct={0}
                cols={3}
                requires={['thabat-dawaran']}
                explain={<MathText>{'اللوحة تقرأ $90^\\circ$ بين $(AB)$ و $(A\'B\')$ : المستقيمان متعامدان. أدر الورقة الآن إلى $180^\\circ$ واقرأ اللوحة من جديد.'}</MathText>}
                onAnswered={mark(3)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
