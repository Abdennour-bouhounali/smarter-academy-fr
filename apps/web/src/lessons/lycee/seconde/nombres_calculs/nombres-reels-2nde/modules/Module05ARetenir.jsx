import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 5 — FORMALIZATION : « À retenir ».
 * Les familles, les écritures et le réflexe exact/approché, nommés après
 * les gestes des modules 1 à 4 ; trois vérifications courtes.
 */
export default function Module05ARetenir() {
  const [famDone, setFamDone] = useState(false);
  const [whenDone, setWhenDone] = useState(false);
  const [signDone, setSignDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="À retenir"
      moduleSubtitle="Les familles, les écritures, et le bon réflexe : exact tant qu’on calcule, approché seulement pour conclure."
      estimatedTime="8 min"
      brief={{
        tag: '📘 Mission 05',
        title: 'Tu as zoomé, posé des divisions, approché √2. Voici les mots, en une carte.',
        tone: 'indigo',
        body: <p>Lis la carte, puis trois vérifications rapides.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Les familles',
          done: famDone,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 space-y-2">
                <p><strong>ℝ</strong>, les réels : tous les points de la droite graduée. <span className="font-mono font-bold">ℕ ⊂ ℤ ⊂ 𝔻 ⊂ ℚ ⊂ ℝ</span>.</p>
                <ul className="space-y-1">
                  <li><strong>ℕ</strong> entiers naturels 0, 1, 2… · <strong>ℤ</strong> entiers relatifs …, −2, −1, 0, 1…</li>
                  <li><strong>𝔻</strong> décimaux : écriture décimale <strong>finie</strong> (0,75 ; −2,5 ; 12). Fraction dont le dénominateur réduit n’a que des 2 et des 5.</li>
                  <li><strong>ℚ</strong> rationnels : quotients d’entiers p/q. Écriture décimale finie <strong>ou périodique</strong> (1/3 = 0,333… ; 2/7 = 0,285714 285714…).</li>
                  <li><strong>Irrationnels</strong> (dans ℝ, hors ℚ) : ni finie ni périodique — √2, π, √10. Attention : √9 = 3 et √0,25 = 0,5 sont rationnels.</li>
                </ul>
              </div>
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">La PLUS PETITE famille de chaque nombre :</p>}
                rows={[
                  { id: 'r1', label: '−3', options: ['ℕ', 'ℤ', '𝔻', 'ℚ', 'irrationnel'], correct: 1 },
                  { id: 'r2', label: '0,2', options: ['ℕ', 'ℤ', '𝔻', 'ℚ', 'irrationnel'], correct: 2 },
                  { id: 'r3', label: '5/9', options: ['ℕ', 'ℤ', '𝔻', 'ℚ', 'irrationnel'], correct: 3, correction: '5/9 = 0,555… périodique.' },
                  { id: 'r4', label: '√25', options: ['ℕ', 'ℤ', '𝔻', 'ℚ', 'irrationnel'], correct: 0, correction: '√25 = 5.' },
                  { id: 'r5', label: '√7', options: ['ℕ', 'ℤ', '𝔻', 'ℚ', 'irrationnel'], correct: 4, correction: '7 n’est pas un carré parfait.' },
                ]}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Cinq sur cinq.' : `${nCorrect} / ${total}.`} Une racine carrée n’est irrationnelle que si le nombre sous la racine n’est pas un carré parfait ; une fraction n’est décimale que si sa division tombe sur un reste 0.</Feedback>
                )}
                solved={famDone}
                onAnswered={() => setFamDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Quand arrondir ?',
          done: whenDone,
          content: (
            <TapQuestion
              prompt="Pour calculer l’aire d’un disque de rayon 2 puis la multiplier par 3 (trois disques), le bon réflexe est :"
              options={[
                'Garder 4π pendant le calcul, écrire 12π, et n’arrondir qu’à la fin : ≈ 37,7',
                'Arrondir π à 3,14 tout de suite, calculer 12,56 puis 37,68',
                'Arrondir 4π à 13, puis 13 × 3 = 39',
              ]}
              cols={1}
              correct={0}
              explain="Arrondir en cours de route accumule les erreurs (39 au lieu de 37,7). L’écriture exacte 12π garde toute l’information ; on arrondit une seule fois, à la fin, à la précision demandée."
              explainWrong="Chaque arrondi intermédiaire perd un peu d’information, et les erreurs s’additionnent : 39 est déjà loin de 37,7. Le réflexe : exact tant qu’on calcule (12π), approché seulement pour conclure."
              solved={whenDone}
              onAnswered={() => setWhenDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: '= ou ≈ ?',
          done: signDone,
          content: (
            <BatchChoiceQuestion
              rows={[
                { id: 'r1', label: '1/4 … 0,25', options: ['=', '≈'], correct: 0 },
                { id: 'r2', label: 'π … 3,14', options: ['=', '≈'], correct: 1 },
                { id: 'r3', label: '√2 … 1,414', options: ['=', '≈'], correct: 1 },
                { id: 'r4', label: '2/3 … 0,67', options: ['=', '≈'], correct: 1 },
              ]}
              feedback={({ allRight }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>Le signe = est réservé aux écritures exactes. Dès qu’on a coupé des chiffres — π, √2, 2/3 — c’est ≈.</Feedback>
              )}
              solved={signDone}
              onAnswered={() => setSignDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Une droite, tous les réels ; des familles emboîtées selon l’écriture ; le signe = pour l’exact, ≈ pour l’approché. Il reste à encadrer et comparer — sans calculatrice.
        </Feedback>
      }
    />
  );
}
