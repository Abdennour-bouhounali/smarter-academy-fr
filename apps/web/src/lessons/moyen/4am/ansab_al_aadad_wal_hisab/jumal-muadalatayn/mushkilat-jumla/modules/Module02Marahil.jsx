import { useState } from 'react';
import { ContentModule, KnowledgeBrick, PeerSheet } from '../../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../../common/knowledge';
import { TextbookBox, TextbookExercise } from '../../../../../../common/textbook';
import { Manipulation } from '../../../../../../common/manipulations';
import LabRounds from '../../../../../../common/manipulations/rounds/LabRounds';
import PlayerSwitch from '../../../../../../common/mission/PlayerSwitch';
import { useModulePlayer } from '../../../../../../common/mission/useModulePlayer';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ABU_KAMIL, ABU_KAMIL_READING } from '../content/textbook';
import { EX } from '../content/exercises';
import { M2_ROUNDS, P1 } from '../content/stories';
import { PEER_SHEET, PEER_KID } from '../content/peerSheet';

/**
 * Module 2 — les CINQ ÉTAPES appliquées, et une histoire que la jumla ne suffit pas à résoudre.
 *
 * LECTEUR DE MISSION (rollout 2026-11-12, unité 5 leçon 3 ; conseil du 2026-11-11, verdict L3.3, X2, X5, X9) : le labo `lab-story-m2` en tête
 * (content/stories.js › M2_ROUNDS : « دفتر التعاونية », la jumla a une solution (18 ; −3) et l'histoire la REFUSE ; la fraction, librement) ; puis
 *   1. le rappel de la manche (« لماذا رفضت القصة $y = -3$ ؟ ») et la brique `tahaqquq-nas` APRÈS ;
 *   2. la حصّالة du groupe, grandie (29 pièces de 20 et 5 دج, 385 دج → (16 ; 13)) : les étapes 1–2, 3, puis 4–5 ;
 *   3. أبو كامل : la ligne d'histoire VÉRIFIÉE (`_unit/abuKamil.js`) et un problème de la plateforme « على طريقة أبي كامل » (30 jours, 7 / 3
 *      دراهم → (9 ; 21)) ;
 *   4. « ورقة وئام » (`PeerSheet`) en DERNIER : une comparaison « يزيد … عن … بـ » écrite à l'envers.
 * LA PAGE (enseignant, mode classe) montre le même dossier au labo de la page. LP : P1, P2.
 */
export default function Module02Marahil() {
  const inPlayer = useModulePlayer(MODULE_CTX);
  const [won, setWon] = useState({});
  const [done, setDone] = useState({});
  const mark = (id) => () => setDone((d) => ({ ...d, [id]: true }));
  const all = (...ids) => ids.every((id) => done[id]);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="المراحل الخمس — دفتر وحصّالة"
      moduleSubtitle="نختار، نترجم، نحلّ، نتحقق في النص، نجيب"
      objectives={['هل يجيب حلّ الجملة دائمًا عن القصة؟', 'كم قطعة من كل فئة في حصّالة القسم؟', 'كيف تُحلّ مسألة على طريقة أبي كامل؟']}
      estimatedTime="13 دقيقة"
      intro={(
        <PlayerSwitch
          player={(
            <LabRounds lessonId={MODULE_CTX.lessonId} labId="lab-story-m2" rounds={M2_ROUNDS} icon="👕" freeIcon="📒"
              onRoundWon={(id) => setWon((w) => ({ ...w, [id]: true }))} />
          )}
          page={<Manipulation type="story-modeller" levels={false} {...P1} />}
        />
      )}
      steps={[
        {
          ...(inPlayer ? { needsRound: { id: 'p1', label: 'دفتر التعاونية', icon: '👕', won: Boolean(won.p1) } } : {}),
          num: 1, title: 'القصة ترفض الحلّ', subtitle: 'نتحقق في القصة نفسها', done: all('not-natural'),
          content: (
            <div className="space-y-3">
              <TextbookExercise exercise={EX['not-natural']} requires={['khutuwat-hall']} onAnswered={mark('not-natural')} />
              {done['not-natural'] && <KnowledgeBrick id="tahaqquq-nas" lead="المرحلتان 4 و 5 لا تعودان إلى الجملة، بل إلى القصة:" />}
            </div>
          ),
        },
        {
          num: 2, title: 'حصّالة القسم كبرت', subtitle: 'المراحل 1 ← 5', done: all('challenge', 'challenge-2', 'challenge-3'),
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="khutuwat-hall" variant="rappel" compact />
              <TextbookExercise exercise={EX.challenge} requires={['khutuwat-hall', 'jumla-tarjama']} onAnswered={mark('challenge')} />
              <TextbookExercise exercise={EX['challenge-2']} requires={['khutuwat-hall', 'hall-jumla']} onAnswered={mark('challenge-2')} />
              <TextbookExercise exercise={EX['challenge-3']} requires={['khutuwat-hall']} onAnswered={mark('challenge-3')} />
            </div>
          ),
        },
        {
          num: 3, title: 'على طريقة أبي كامل', subtitle: 'جملة معادلتين قبل الرموز', done: all('abu-kamil', 'abu-kamil-2'),
          content: (
            <div className="space-y-3">
              <TextbookBox kind="remark" text={ABU_KAMIL.intro} source={ABU_KAMIL.source} compact />
              <TextbookExercise exercise={EX['abu-kamil']} requires={['jumla-tarjama', 'tahaqquq-nas']} onAnswered={mark('abu-kamil')} />
              {done['abu-kamil'] && <TextbookBox kind="remark" text={ABU_KAMIL_READING.text} source={ABU_KAMIL_READING.source} compact />}
              <TextbookExercise exercise={EX['abu-kamil-2']} requires={['tahaqquq-nas', 'hall-jumla']} onAnswered={mark('abu-kamil-2')} />
            </div>
          ),
        },
        {
          num: 4, title: 'ورقة وئام', subtitle: 'ابحث عن الخطأ في ورقة زميلة وأصلحه', done: Boolean(done.peer),
          content: <PeerSheet sheet={PEER_SHEET} kid={PEER_KID} onDone={mark('peer')} />,
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={2} variant="memo" />}
    />
  );
}
