import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../apps/web/src/lessons/common/kit';
import { Feedback } from '../../../../../apps/web/src/lessons/common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../apps/web/src/lessons/common/knowledge';
import MathText from '../../../../../apps/web/src/lessons/common/components/MathText';

export default function Module01Decouverte() {
  const [ran, setRan] = useState(false);
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);

  return (
    <ContentModule
      moduleNumber={1}
      steps={[
        {
          num: 1,
          title: 'Le sens direct',
          done: a,
          content: (
            <div className="space-y-3">
              {ran && (
                <KnowledgeBrick id="image" variant="new" lead="Tu as donné 4, il est sorti 9.">
                  <TapQuestion
                    prompt="Et l’image de 3 ?"
                    options={['7', '3']}
                    correct={0}
                    requires={['image']}
                    explain="7."
                    solved={a}
                    onAnswered={() => setA(true)}
                  />
                </KnowledgeBrick>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Écrire ce qu’on vient de faire',
          done: b,
          content: (
            <KnowledgeBrick id="notation-fx" variant="new">
              <NumericQuestion
                prompt={<>Que vaut <MathText>{'$f(6)$'}</MathText> ?</>}
                expected={13}
                requires={['notation-fx', 'image']}
                explain="f(6) = 13."
                solved={b}
                onAnswered={() => setB(true)}
              />
            </KnowledgeBrick>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
