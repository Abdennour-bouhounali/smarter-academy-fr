import { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { Feedback } from '../../../../../../common/components/LessonUI';
import MathText from '../../../../../../common/components/MathText';
import { Manipulation, ManipulationWorkspace } from '../../../../../../common/manipulations';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TILING } from '../content/textbook';
import { M1_ROUNDS, R1, R2 } from '../content/tilings';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';

/**
 * Module 1 — l'entrée dans la طريقة « نبحث عن أكبر مربع a² يقسم n » (p. 25).
 *
 * Le manuel n'a PAS d'activité pour cette leçon : c'est une page de طرائق.
 * Le laboratoire est donc une expérience de la PLATEFORME, déclarée
 * (`platform_adaptation`, lesson.config.js) — sa mathématique est la طريقة,
 * ses deux aires sont celles de l'exercice 18.
 *
 *   مبتدئ  — un carré d'aire 32 : k = 2 donne des dalles de 8, k = 4 des
 *            dalles de 2 ; la dalle de 8 se pave encore, celle de 2 non.
 *   متقدم  — le carré d'aire 288 (défaut) : six pavages justes, et k = 6
 *            donne une dalle de 8 qui « a l'air » petite sans l'être.
 *
 * Pourquoi 32 et non 18 : pour 18 le seul pavage non trivial est k = 3 ;
 * la découverte « le plus grand k donne la plus petite dalle » exige deux
 * pavages justes (logic/squareTiling.js `discoveryReady`), donc une aire
 * qui a deux carrés diviseurs > 1.
 *
 * UNE PISTE (rétrofit 2026-10-15) : le labo en tête, SANS carte `brief` ni titre/lead de workspace ; la question 1 demande POURQUOI
 * l'écriture k√8 ne suffit pas, sur le carré que l'élève a réellement fini (32 : k = 2, 288 : k = 6 — la dalle 8 est la même) ;
 * la brique « kitaba-a-jidhr-b » vient APRÈS la réponse ; l'étape 2 (تمرين 1, question 1 du manuel) est l'application.
 *
 * AUCUNE étape n'attend `onFinished` : ce n'est pas une activité du manuel
 * (MANIPULATION_CONTRACT §7bis). `onFinished` sert seulement à lister, au-
 * dessus de la question, ce que l'élève a trouvé lui-même.
 *
 * Étapes : (1) pourquoi 6√8 ne suffit pas pour √288 — depuis ses pavages ;
 * (2) la brique « kitaba-a-jidhr-b », puis la question 1) du تمرين 1 du
 * manuel : √8, √18, √50. LP : P1.
 *
 * LECTEUR DE MISSION (rollout 2026-11-10, unité 2 leçon 5 ; conseil du 2026-11-10, option C) : le labo se joue en MANCHES (content/tilings.js ›
 * M1_ROUNDS : 75 à la main avec la suite complète → 32, le pont depuis la leçon 4 (2√8 ou 4√2 ?) → 80 (requise) → défi ⭐ 72 → atelier libre)
 * au lieu de مبتدئ / متقدم. L'étape 1 attend la manche 2 (32 : sa question porte sur 2√8) ; ce que la ligne de trace dit vient des manches
 * GAGNÉES (étoiles gardées, LabRounds › onRoundWon au montage) : un rechargement ne bloque ni ne vide jamais l'étape. Hors lecteur : inchangé.
 */
const largestSquare = (n) => { let a = 1; for (let k = 1; k * k <= n; k += 1) if (n % (k * k) === 0) a = k; return a; };
const simplestTex = (n) => { const a = largestSquare(n); const b = n / (a * a); return `\\sqrt{${n}} = \\sqrt{${a}^2 \\times ${b}} = ${a}\\sqrt{${b}}`; };

export default function Module01Nashat() {
  const [found, setFound] = useState({});
  const [last, setLast] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  // lecteur : les manches gagnées (étoiles gardées, annoncées par LabRounds au montage) ouvrent l'étape 1 et remplissent sa trace
  const [won, setWon] = useState({});
  const { beginner, advanced } = TILING.numbers;
  // La question porte sur le carré que l'élève a réellement fini (32 : k = 2 ; 288 : k = 6) — la dalle 8 est la même. Lecteur : 32 (manche 2).
  // L'étape choisit SA version par le lecteur lui-même (`PlayerSwitch`, revue ECC 2026-11-10), jamais d'après les manches déjà gagnées.
  const nPage = last ?? (found[advanced] ? advanced : beginner);
  const evidencePlayer = [{ n: R1, ok: !!won.r1, todo: 'الجولة 1' }, { n: R2, ok: !!won.r2, todo: 'الجولة 2' }];
  const evidencePage = [{ n: beginner, ok: !!found[beginner], todo: 'المستوى المبتدئ' }, { n: advanced, ok: !!found[advanced], todo: 'المستوى المتقدّم' }];
  const stepOne = (evidence, n1, k1) => (
    <div className="space-y-3">
      {/* CE QUE L'ÉLÈVE A TROUVÉ, et rien d'autre : la réponse de chaque
          niveau (ou manche) n'apparaît qu'après SA découverte dans le laboratoire. */}
      <ul className="space-y-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm" data-activity-evidence>
        {evidence.map(({ n, ok, todo }) => (
          <li key={n} className={ok ? 'font-bold text-slate-800' : 'text-slate-500'} data-evidence={n} data-tried={ok ? 'true' : 'false'}>
            {ok
              ? <MathText>{`المربّع ${n}: وجدتَ أصغر بلاطة — $${simplestTex(n)}$`}</MathText>
              : `المربّع ${n}: لم تصل بعد إلى أصغر بلاطة (${todo}).`}
          </li>
        ))}
      </ul>
      <TapQuestion
        prompt={<span>مع <MathText>{`$k = ${k1}$`}</MathText> مساحة كل بلاطة 8، فنكتب <MathText>{`$\\sqrt{${n1}} = ${k1}\\sqrt{8}$`}</MathText>. لماذا لا نتوقّف عند هذه الكتابة؟</span>}
        options={[
          <MathText key="a">{`لا تساوي $\\sqrt{${n1}}$`}</MathText>,
          <MathText key="b">{'صحيحة، لكنّ البلاطة 8 نفسها تُبلَّط من جديد: $8 = 2^2 \\times 2$'}</MathText>,
          <MathText key="c">{`خاطئة لأن ${k1} ليس قاسمًا للعدد ${n1}`}</MathText>,
          <MathText key="d">{'خاطئة لأن مساحة البلاطة 8 ليست عددًا طبيعيًا'}</MathText>,
        ]}
        correct={1}
        cols={1}
        requires={['jidhr-a2b']}
        explain={<MathText>{`$\\sqrt{${n1}} = ${k1}\\sqrt{8}$ صحيحة، لكن $\\sqrt{8} = 2\\sqrt{2}$، إذن $${simplestTex(n1)}$ ، والبلاطة 2 لا تُبلَّط أكثر (أكبر مربّع يقسم ${n1} هو $${largestSquare(n1) ** 2} = ${largestSquare(n1)}^2$).`}</MathText>}
        onAnswered={() => setQ1(true)}
      />
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="مربّع مبلّط — أبسط كتابة لجذر"
      moduleSubtitle="أكبر مربّع يقسم العدد"
      estimatedTime="12 دقيقة"
      objectives={['أيّ تبليط لمربّع مساحته 288 يعطي أبسط كتابة لضلعه؟', 'ماذا يحدث لمساحة البلاطة حين يزداد عدد البلاطات على الضلع؟', 'كيف أكتب جذرًا على أبسط شكل؟']}
      intro={
        // Le labo EN TÊTE, sans carte ni titre de workspace (§4quater) : il porte son contexte et sa question.
        // Lecteur : les MANCHES (content/tilings.js) ; la page garde ses deux niveaux.
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="m1-simplest" rounds={M1_ROUNDS} icon="🧱" freeIcon="🏫"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={(
        <ManipulationWorkspace
          defaultLevel="beginner"
          levels={{
            beginner: () => (
              <Manipulation
                type="square-tiling"
                level="beginner"
                n={beginner}
                mode="simplest"
                lead="ابدأ ببلاطتين على الضلع، ثم جرّب أعدادًا أخرى: أيّ بلاطة لا يمكن تبليطها من جديد؟"
                onFinished={() => { setFound((f) => ({ ...f, [beginner]: true })); setLast(beginner); }}
              />
            ),
            advanced: () => (
              <Manipulation
                type="square-tiling"
                n={advanced}
                mode="simplest"
                lead="بلّط المربّع بكل الطرق التي تقبلها المساحة 288، وقارن البلاطات."
                onFinished={() => { setFound((f) => ({ ...f, [advanced]: true })); setLast(advanced); }}
              />
            ),
          }}
        />
          )}
        />
      }
      steps={[
        {
          needsRound: { id: 'r2', label: 'الجولة 2', icon: '🧱', won: Boolean(won.r2) },
          num: 1, title: 'لماذا لا تكفي هذه الكتابة؟', subtitle: 'أجب عمّا فعلته بالبلاطات', done: q1,
          content: (
            <div className="space-y-3">
              <PlayerSwitch player={stepOne(evidencePlayer, R2, 2)} page={stepOne(evidencePage, nPage, nPage === advanced ? 6 : 2)} />
              {/* Le nom de la طريقة APRÈS la réponse : il dit ce que la main vient de faire. */}
              {q1 && <KnowledgeBrick id="kitaba-a-jidhr-b" lead="ما فعلته بالبلاطات نكتبه طريقة:" />}
            </div>
          ),
        },
        {
          num: 2, title: <MathText>{'هل تنجح الطريقة نفسها مع $\\sqrt{8}$ و $\\sqrt{18}$ و $\\sqrt{98}$ ؟'}</MathText>, done: q2,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700"><MathText>{'اكتب كلًّا من الأعداد $\\sqrt{8}$ ، $\\sqrt{18}$ و $\\sqrt{98}$ على الشكل $a\\sqrt{b}$ حيث $a$ و $b$ عددان طبيعيان و $b$ أصغر ما يمكن.'}</MathText></p>}
                rows={[
                  { id: 'r8', label: <MathText>{'$\\sqrt{8} = $'}</MathText>, options: [<MathText key="a">{'$4\\sqrt{2}$'}</MathText>, <MathText key="b">{'$2\\sqrt{2}$'}</MathText>, <MathText key="c">{'$2\\sqrt{4}$'}</MathText>], correct: 1, correction: <MathText>{'$\\sqrt{8} = \\sqrt{2^2 \\times 2} = 2\\sqrt{2}$'}</MathText> },
                  { id: 'r18', label: <MathText>{'$\\sqrt{18} = $'}</MathText>, options: [<MathText key="a">{'$3\\sqrt{2}$'}</MathText>, <MathText key="b">{'$9\\sqrt{2}$'}</MathText>, <MathText key="c">{'$2\\sqrt{3}$'}</MathText>], correct: 0, correction: <MathText>{'$\\sqrt{18} = \\sqrt{3^2 \\times 2} = 3\\sqrt{2}$'}</MathText> },
                  { id: 'r98', label: <MathText>{'$\\sqrt{98} = $'}</MathText>, options: [<MathText key="a">{'$49\\sqrt{2}$'}</MathText>, <MathText key="b">{'$2\\sqrt{7}$'}</MathText>, <MathText key="c">{'$7\\sqrt{2}$'}</MathText>], correct: 2, correction: <MathText>{'$\\sqrt{98} = \\sqrt{7^2 \\times 2} = 7\\sqrt{2}$'}</MathText> },
                ]}
                requires={['kitaba-a-jidhr-b']}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    <MathText>{allRight
                      ? 'تمامًا: الأعداد الثلاثة تُكتب بدلالة $\\sqrt{2}$ — المحور التالي يستعمل ذلك لتبسيط A.'
                      : 'انتبه: $a$ هو جذر المربّع، لا المربّع نفسه ($\\sqrt{9} = 3$)، و $b$ هو ما يبقى بعد القسمة على أكبر مربّع.'}</MathText>
                  </Feedback>
                )}
                onAnswered={() => setQ2(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} variant="memo" />}
    />
  );
}
