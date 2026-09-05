import React, { useState } from 'react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RoundingLab from '../components/RoundingLab';
import { NUMBERS } from '../components/numbers';

/**
 * Module 4 — MANIPULATION : « Exact ou approché ? ».
 *
 * Activity: approcher √2 (puis π, 2/3) à 10^-k, lire encadrement /
 *   troncature / arrondi, élever l'approximation au carré ; puis choisir
 *   l'écriture exacte d'un périmètre et arrondir √10.
 * Mathematical objective: une valeur approchée est un nombre PROCHE, pas le
 *   nombre : (1,414)² ≠ 2 ; l'arrondi se décide au chiffre suivant ; 6π est
 *   exact, 18,85 est approché.
 * Student action: pousser la précision ; changer de nombre ; répondre.
 * Controlled variable: k et le nombre.
 * Expected observation: le carré de l'arrondi s'approche de 2 sans jamais
 *   l'atteindre ; troncature et arrondi diffèrent quand le chiffre suivant
 *   est ≥ 5.
 * Misconception targeted: « √2 = 1,414 », « arrondir = couper ».
 */
const CHOICES = [NUMBERS.sqrt2, NUMBERS.pi, NUMBERS['deux-tiers']];

export default function Module04ExactOuApproche() {
  const [spec, setSpec] = useState(NUMBERS.sqrt2);
  const [k, setK] = useState(0);
  const [maxK, setMaxK] = useState(0);
  const [roundDone, setRoundDone] = useState(false);
  const [exactDone, setExactDone] = useState(false);
  const [sqrtDone, setSqrtDone] = useState(false);
  const labDone = maxK >= 3;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Exact ou approché ?"
      moduleSubtitle="1,41 ; 1,414 ; 1,4142… aucun n’a un carré égal à 2. Seul √2 le fait."
      estimatedTime="10 min"
      brief={{
        tag: '🎯 Mission 04',
        title: 'Le carreleur tape 1,414 sur sa calculatrice. Est-ce √2 ?',
        tone: 'indigo',
        body: <p>Augmente la précision, compare la troncature et l’arrondi, et élève l’arrondi au carré. Regarde ce qui n’arrive jamais.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Approche √2 de plus en plus près',
          subtitle: 'Pousse la précision jusqu’au millième au moins. Puis essaie π et 2/3.',
          done: labDone,
          content: (kit) => (
            <div className="space-y-3">
              <RoundingLab
                spec={spec} k={k}
                onK={(nk) => { setK(nk); if (spec.id === 'sqrt2') { setMaxK((m) => Math.max(m, nk)); if (nk === 3) kit.react(true); } }}
                choices={CHOICES}
                onChoose={(id) => { setSpec(NUMBERS[id]); setK(0); }}
                showSquare
              />
              {labDone ? (
                <Feedback tone="ok">
                  Chaque précision donne un encadrement plus serré et un arrondi plus proche — mais son carré ne vaut <strong>jamais 2</strong> : 1,9881 ; 1,999396 ; 1,99996164… Un nombre à écriture décimale finie a un carré à écriture finie, jamais exactement 2. La seule écriture <strong>exacte</strong> de ce nombre est <MathText>{'$\\sqrt{2}$'}</MathText>.
                </Feedback>
              ) : (
                <Feedback tone="info">Précision actuelle : 10<sup>−{k}</sup>. Monte jusqu’au millième et lis le carré de l’arrondi à chaque étape.</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Arrondi ou troncature ?',
          done: roundDone,
          content: (
            <TapQuestion
              prompt="Quel est l’arrondi de 2/3 au centième ?"
              options={['0,66', '0,67', '0,7', '0,6667']}
              cols={4}
              correct={1}
              explain="2/3 = 0,6666… Le chiffre suivant le centième est un 6 (≥ 5) : on arrondit au-dessus, 0,67. La troncature, elle, coupe sans regarder : 0,66. Et 0,7 est l’arrondi au dixième."
              explainWrong="Regarde le chiffre APRÈS le centième : 0,66|6… — c’est un 6, donc l’arrondi monte à 0,67. 0,66 est la troncature (on coupe), 0,7 est arrondi au dixième, 0,6667 au dix-millième."
              solved={roundDone}
              onAnswered={() => setRoundDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Le périmètre du rond-point',
          done: exactDone,
          content: (
            <TapQuestion
              prompt={<>Un rond-point circulaire a un rayon de 3 m. Son périmètre vaut <MathText>{'$2\\pi r$'}</MathText>. Laquelle de ces écritures est EXACTE ?</>}
              options={['$6\\pi$ m', '$18{,}84$ m', '$18{,}85$ m', '$18{,}8496$ m']}
              renderOption={(o) => <MathText>{o}</MathText>}
              correctionLabel="6π m"
              cols={4}
              correct={0}
              explain="6π est le nombre lui-même : π n’a pas d’écriture décimale finie, donc aucun décimal ne peut être exact. 18,85 est l’arrondi au centième, 18,84 la troncature, 18,8496 l’arrondi au dix-millième — tous approchés, à écrire avec ≈."
              explainWrong="Tous les nombres à virgule proposés sont des approximations de 6π : π ne s’écrit pas avec un nombre fini de chiffres. On garde 6π tant qu’on calcule, on n’arrondit qu’à la fin (6π ≈ 18,85 m)."
              solved={exactDone}
              onAnswered={() => setExactDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Arrondir une racine',
          done: sqrtDone,
          content: (
            <NumericQuestion
              prompt={<>Quel est l’arrondi de <MathText>{'$\\sqrt{10}$'}</MathText> au dixième ? (√10 = 3,1622…)</>}
              expected={3.2}
              parse={parseDec}
              display="3,2"
              explain="√10 = 3,16… : le chiffre après le dixième est 6, donc on arrondit au-dessus : 3,2. La troncature serait 3,1."
              explainFor={(v) => (v === 3.1
                ? '3,1 est la troncature. Pour arrondir, regarde le chiffre suivant : 3,1|6 → 6 ≥ 5, on monte à 3,2.'
                : v === 5 ? '√10 n’est pas la moitié de 10 : c’est le nombre dont le carré vaut 10, entre 3 (3² = 9) et 4 (4² = 16).'
                : '√10 = 3,162… ; le chiffre après le dixième est 6, on arrondit à 3,2.')}
              solved={sqrtDone}
              onAnswered={() => setSqrtDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Écriture exacte (√2, 1/3, 6π) tant qu’on calcule ; valeur approchée (≈ 1,41 ; ≈ 0,33 ; ≈ 18,85) seulement pour conclure — en précisant si c’est une troncature ou un arrondi, et à quelle précision.
        </Feedback>
      }
    />
  );
}
