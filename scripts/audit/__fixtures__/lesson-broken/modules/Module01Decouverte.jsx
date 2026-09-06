import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../apps/web/src/lessons/common/kit';
import { Feedback } from '../../../../../apps/web/src/lessons/common/components/LessonUI';
import MathText from '../../../../../apps/web/src/lessons/common/components/MathText';

export default function Module01Decouverte() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [c, setC] = useState(false);

  return (
    <ContentModule
      moduleNumber={1}
      steps={[
        {
          num: 1,
          title: 'Le sens direct',
          done: a,
          content: (
            <NumericQuestion
              prompt={<>Que vaut <MathText>{'$f(6)$'}</MathText> ?</>}
              expected={13}
              requires={['notation-fx']}
              explain="Le nombre 13 est l’IMAGE de 6 par f."
              solved={a}
              onAnswered={() => setA(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Les mots',
          done: b,
          content: (
            <div className="space-y-3">
              {b && <Feedback tone="ok">Deux entrées, la même sortie.</Feedback>}
              <TapQuestion
                prompt="Que dit cette ligne ?"
                options={['9 est l’image de 4', 'la parabole de f']}
                correct={0}
                requires={['image', 'bonus-parabole']}
                explain="9 est l’image de 4."
                solved={b}
                onAnswered={() => setB(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Enfin la leçon',
          done: c,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick id="image" variant="new" />
              <KnowledgeBrick id="bonus-parabole" variant="enrichment" />
              <TapQuestion
                prompt="Et l’image de 3 ?"
                options={['7', '3']}
                correct={0}
                explain="7."
                solved={c}
                onAnswered={() => setC(true)}
              />
            </div>
          ),
        },
      ]}
      footer={<Feedback tone="info">On écrit f(x) l’image de x par f.</Feedback>}
    />
  );
}
