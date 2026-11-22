import { useState } from 'react';
import { GuidedProblem } from '../../../../../../common/problems';
import { TapQuestion } from '../../../../../../common/kit';
import MathText from '../../../../../../common/components/MathText';
import { TextbookBox, PairQuestion } from '../../../../../../common/textbook';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEM } from '../content/problems';
import { HOOK } from '../content/textbook';
import KioskVignette from '../components/KioskVignette';

/**
 * Module 5 — مسألة 2 (مقهى الساحة : deux factures, الجمع avec deux multiplicateurs, l'erreur de signe du serveur).
 * Exercice complet de type امتحان, résolu pas à pas (GuidedProblem) ; formatif, aucune preuve de maîtrise. Donnée : content/problems.js.
 *
 * L'ÉNIGME DU KIOSQUE (les anciennes cartes, 2x + y = 70 ; 3x − 2y = 42 → (26 ; 18)) — verdict L2.1 : elle répète le décor ET la méthode de la مسألة
 * du module 4, elle vient donc APRÈS elle, ici, sans être supprimée. GuidedProblem n'accepte pas d'étape AVANT ses parties (composant partagé, hors
 * du périmètre de la leçon) : en attendant une prop additive `prelude` de l'intégrateur, l'énigme est la fin du module (`footer`).
 */
function KioskRiddle() {
  const [translated, setTranslated] = useState(false);
  return (
    <div className="space-y-3" data-kiosk-riddle>
      <div className="flex justify-center"><KioskVignette /></div>
      <TextbookBox kind="situation" title={HOOK.headline} lines={[HOOK.text, HOOK.unknowns]} source={HOOK.source} compact />
      <TapQuestion
        prompt="أيّ جملة تترجم البطاقتين القديمتين؟"
        options={[
          <MathText key="a">{'$\\begin{cases} 2x + y = 70 \\\\ 3x - 2y = 42 \\end{cases}$'}</MathText>,
          <MathText key="b">{'$\\begin{cases} x + 2y = 70 \\\\ 3x - 2y = 42 \\end{cases}$'}</MathText>,
          <MathText key="c">{'$\\begin{cases} 2x + y = 70 \\\\ 2y - 3x = 42 \\end{cases}$'}</MathText>,
        ]}
        correct={0}
        cols={1}
        requires={['takhallus-majhul']}
        explain={<MathText>{'قطعتا كرنتيكة $2x$ وقارورة $y$ : $2x + y = 70$ ؛ ثمن 3 قطع $3x$ يزيد بـ 42 عن ثمن قارورتين $2y$ : $3x - 2y = 42$ .'}</MathText>}
        onAnswered={() => setTranslated(true)}
      />
      {translated && (
        <PairQuestion
          prompt={<MathText>{`حلّ جملة الكشك $${HOOK.systemTex}$ :`}</MathText>}
          expected={HOOK.answer}
          requires={['takhallus-majhul', 'hall-thunaiya']}
          explain={HOOK.closing}
        />
      )}
    </div>
  );
}

export default function Module05Masala2() {
  return (
    <GuidedProblem
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      problem={PROBLEM['masala-2']}
      estimatedTime="8 دقائق"
      footer={<KioskRiddle />}
    />
  );
}
