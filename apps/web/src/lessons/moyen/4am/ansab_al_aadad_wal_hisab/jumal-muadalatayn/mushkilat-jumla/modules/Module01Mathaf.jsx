import { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LAB, MISTAKE_TARJAMA, MISTAKE_HALF } from '../content/textbook';
import { M1_ROUNDS } from '../content/stories';
import StepsTable from '../components/StepsTable';

/**
 * Module 1 — « من القصة إلى الجملة » : les CINQ étapes faites à la main au labo `story-modeller`, puis le tableau des étapes.
 *
 * LA PAGE (enseignant, mode classe) : deux niveaux de la plateforme (verdict L3.10) — مبتدئ « نادي الرسم » (12 crayons, 70 / 20 دج, 440 دج),
 * متقدم « معرض الكتب » (26 livres, 130 / 90 دج, 2820 دج ; l'élève nomme lui-même les inconnues).
 * LECTEUR DE MISSION (rollout 2026-11-12, unité 5 leçon 3 ; conseil du 2026-11-11, verdict L3.4–L3.15) : le labo se joue en MANCHES
 * (content/stories.js › M1_ROUNDS : نادي الرسم à la main avec la ligne tapée, مكتبة الحيّ argent + argent avec le jeton muet « 8 أيام », le défi ⭐,
 * les histoires libres). Les étapes au crayon attendent leur manche (`needsRound`) et RAPPELLENT ses nombres dans leur énoncé (aucun aller-retour).
 * UNE PISTE : labo en tête, puis (1) pourquoi ces inconnues ; (2) pourquoi le labo refuse « 70x + 20y = 12 », la brique `jumla-tarjama` APRÈS ;
 * (3) pourquoi x = 4 seul ne répond pas ; (4) pourquoi vérifier les DEUX informations, la brique `khutuwat-hall` et le tableau APRÈS. LP : P1, P2.
 */
const R1_LINE = 'في نادي الرسم: 12 قلمًا، قلم التلوين بـ 70 دج وقلم الرصاص بـ 20 دج، ودفع النادي 440 دج.';

export default function Module01Mathaf() {
  const inPlayer = useModulePlayer(MODULE_CTX);
  const [won, setWon] = useState({});
  const [q, setQ] = useState({});
  const mark = (id) => () => setQ((s) => ({ ...s, [id]: true }));
  const round = (id, label) => (inPlayer ? { needsRound: { id, label, icon: '✏️', won: Boolean(won[id]) } } : {});

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="من القصة إلى الجملة"
      moduleSubtitle="لماذا هذان المجهولان؟ ولماذا هاتان المعادلتان؟"
      objectives={['ما المجهولان في القصة؟ وكيف نختارهما؟', 'كيف نحوّل كل معلومة في النص إلى معادلة؟', 'كيف نتأكد من الجواب في القصة نفسها؟']}
      estimatedTime="14 دقيقة"
      intro={(
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-story-m1" rounds={M1_ROUNDS} icon="✏️" freeIcon="📚"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
            <ManipulationWorkspace
              defaultLevel="beginner"
              levels={{
                beginner: () => <Manipulation type="story-modeller" level="beginner" {...LAB.beginner} />,
                advanced: () => <Manipulation type="story-modeller" {...LAB.advanced} />,
              }}
            />
          )}
        />
      )}
      steps={[
        {
          ...round('r1', 'نادي الرسم'),
          num: 1, title: '1) لماذا هذان المجهولان؟', subtitle: 'ما يسأل عنه السؤال', done: Boolean(q.s1),
          content: (
            <TapQuestion
              prompt={<span>{R1_LINE} لماذا جعلنا المجهولين «عدد أقلام التلوين» و«عدد أقلام الرصاص»، لا ثمنيهما؟</span>}
              options={[
                'لأنّ السؤال يطلب العددين، أمّا الثمنان فمعطيان في القصة',
                'لأنّ الثمنين عددان كبيران يصعب الحساب بهما',
                'لأنّ المجهول يكون دائمًا أصغر عدد في القصة',
              ]}
              correct={0}
              cols={1}
              requires={['tarjama-ibara']}
              explain="المجهولان ما يسأل عنه السؤال: «كم قلم تلوين وكم قلم رصاص؟». عدد الأقلام كلّها والمبلغ والثمنان معطاة في القصة."
              onAnswered={mark('s1')}
            />
          ),
        },
        {
          ...round('r1', 'نادي الرسم'),
          num: 2, title: '2) لماذا رفض المختبر هذه المعادلة؟', subtitle: 'كل معلومة معادلة، ووحدة واحدة في كل معادلة', done: Boolean(q.s2),
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>{R1_LINE} ترجم تلميذ المعلومة «اشترى النادي 12 قلمًا» بالمعادلة <MathText>{'$70x + 20y = 12$'}</MathText> فرفضها المختبر. لماذا؟</span>}
                options={[
                  <MathText key="a">{'$70x + 20y$ مبلغ بالدينار، و 12 عدد أقلام: لا نساوي مالًا بعدد أشياء'}</MathText>,
                  'لأنّ العدد 12 أصغر من 70',
                  <MathText key="c">{'لأنّ المعادلة يجب أن تبدأ بالحرف $x$ وحده'}</MathText>,
                ]}
                correct={0}
                cols={1}
                requires={['tarjama-ibara']}
                explain={<MathText>{`${MISTAKE_TARJAMA.why} ${MISTAKE_TARJAMA.right}`}</MathText>}
                onAnswered={mark('s2')}
              />
              {q.s2 && <KnowledgeBrick id="jumla-tarjama" lead="ما رفضه المختبر وقبله هو المرحلة 2 من حلّ مشكلة:" />}
            </div>
          ),
        },
        {
          ...round('r1', 'نادي الرسم'),
          num: 3, title: '3) لماذا لا يكفي أحد العددين؟', subtitle: 'الحل ثنائية', done: Boolean(q.s3),
          content: (
            <TapQuestion
              prompt={<span>{R1_LINE} وجد تلميذ <MathText>{'$x = 4$'}</MathText> فتوقّف وكتب: «اشترى النادي 4 أقلام». ما رأيك؟</span>}
              options={[
                'جوابه ناقص: السؤال يطلب عدد أقلام التلوين وعدد أقلام الرصاص معًا، فالحل ثنائية',
                'جوابه كامل: أوّل عدد نجده هو الجواب',
                'جوابه خاطئ لأنّ العدد 4 صغير',
              ]}
              correct={0}
              cols={1}
              requires={['hall-jumla']}
              explain={<MathText>{`${MISTAKE_HALF.why} ${MISTAKE_HALF.right}`}</MathText>}
              onAnswered={mark('s3')}
            />
          ),
        },
        {
          ...round('r2', 'مكتبة الحيّ'),
          num: 4, title: '4) لماذا نتحقّق من المعلومتين معًا؟', subtitle: 'نتحقّق في النص نفسه، ثم نجيب بجملة', done: Boolean(q.s4),
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt={<span>في مكتبة الحيّ: كرّاسان وقلم بـ 230 دج، وكرّاس وقلمان بـ 190 دج. وجدنا ثمن الكرّاس 90 دج وثمن القلم 50 دج. لو بدّلنا الثمنين (الكرّاس 50 دج والقلم 90 دج)، ماذا تقول القصة؟</span>}
                options={[
                  <MathText key="a">{'ترفضهما: $2 \\times 50 + 90 = 190$ لا 230 ، فالترتيب مهمّ ونعيد القصة بالعددين في مكانيهما'}</MathText>,
                  'تقبلهما: الثمنان هما نفساهما، فالترتيب لا يهمّ',
                  'لا نحتاج إلى القصة: يكفي أن نكون قد حللنا الجملة',
                ]}
                correct={0}
                cols={1}
                requires={['hall-jumla']}
                explain={<MathText>{'مع الثمنين المبدّلين: $2 \\times 50 + 90 = 190$ و $50 + 2 \\times 90 = 230$ : المعلومتان تخالفان القصة. مع $(90 ; 50)$ : $2 \\times 90 + 50 = 230$ و $90 + 2 \\times 50 = 190$ .'}</MathText>}
                onAnswered={mark('s4')}
              />
              {q.s4 && (
                <>
                  <KnowledgeBrick id="khutuwat-hall" lead="المراحل الخمس التي مررتَ بها في المختبر هي مراحل حلّ كل مشكلة:" />
                  <StepsTable />
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
