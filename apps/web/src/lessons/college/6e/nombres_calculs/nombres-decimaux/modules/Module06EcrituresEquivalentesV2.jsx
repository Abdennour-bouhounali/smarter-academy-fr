import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RepresentationPanel from '../components/RepresentationPanel';
import { formatDec } from '../components/decimalUtils';

/**
 * Module 6 V2 — reconstruit sur le lesson kit.
 * Étape 2 : TapQuestion par traduction. Étape 3 : la règle du zéro (piège
 * après la virgule vs zéro final) a déjà été DÉCOUVERTE ET FORMALISÉE au
 * module 5 ("La règle à ne jamais oublier") — on ne la reformalise pas ici
 * avec un nouveau jeu de nombres. On la RÉACTIVE en une phrase, puis on
 * teste la vraie nouveauté du module : reconnaître qu'une fraction décimale
 * et une écriture à virgule désignent la même quantité (BatchChoiceQuestion,
 * correction visible au dernier choix posé).
 */
const TRADUCTIONS = [
  { value: 0.7, options: ['7/10', '7/100', '70/10', '7/1000'], correct: 0, explain: '0,7 se lit « 7 dixièmes » : le 7 est à la première position après la virgule, donc 7/10.' },
  { value: 1.25, options: ['125/10', '125/100', '1250/100', '25/100'], correct: 1, explain: "1,25 se lit « 125 centièmes » : 1 unité vaut 100 centièmes, plus 25 centièmes, soit 125/100. La dernière position après la virgule (les centièmes) donne le dénominateur." },
  { value: 3.08, options: ['38/100', '308/100', '308/10', '3080/100'], correct: 1, explain: "3,08 = 3 unités (300 centièmes) + 0 dixième + 8 centièmes = 308 centièmes, soit 308/100. Attention : le 0 compte, on n'écrit pas 38/100 !" },
  { value: 12.305, options: ['12305/100', '12305/1000', '1235/1000', '12305/10000'], correct: 1, explain: 'La dernière position occupée est celle des millièmes : le dénominateur est donc 1 000. 12,305 = 12305/1000.' },
];

function renderFraction(o) {
  const [n, d] = o.split('/');
  return <MathText>{`$\\frac{${n}}{${d}}$`}</MathText>;
}

const REFERENCE = 27 / 10;
const CANDIDATS = [
  { text: '2,7', value: 2.7, why: "C'est la traduction directe : 27 dixièmes = 2 unités (20 dixièmes) + 7 dixièmes." },
  { text: '2,70', value: 2.7, why: 'Un zéro ajouté à la fin ne change rien : 7 dixièmes = 70 centièmes, la quantité est identique.' },
  { text: '2,07', value: 2.07, why: 'Ici le zéro est JUSTE APRÈS la virgule : il pousse le 7 aux centièmes. 2,07 est bien plus petit que 27/10.' },
  { text: '27/100', value: 0.27, why: 'Cette fraction se lit « 27 centièmes », pas « 27 dixièmes » : le dénominateur ne correspond pas.' },
  { text: '270/100', value: 2.7, why: '270 centièmes = 2 unités (200 centièmes) + 70 centièmes = 2,70, la même quantité que 27/10.' },
];

export default function Module06EcrituresEquivalentes() {
  const [explored, setExplored] = useState(false);
  const [trads, setTrads] = useState([]);
  const [zeroDone, setZeroDone] = useState(false);

  const s1 = explored;
  const s2 = trads.length === TRADUCTIONS.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Des écritures équivalentes"
      moduleSubtitle="Un même nombre, plusieurs habits — et des zéros qui ne se valent pas tous."
      estimatedTime="12 min"
      brief={{
        tag: '🔄 Machine à traduire',
        title: 'Le même nombre, vu de cinq façons différentes.',
        body: (
          <p>
            Ce ne sont pas cinq nombres, ni cinq exercices : c'est <strong className="text-white">un seul objet</strong>{' '}
            qui change de représentation. Observe-les ensemble.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'La machine à traduire : 2,4',
          done: s1,
          content: (
            <div className="space-y-4">
              <RepresentationPanel value={2.4} views={['quantite', 'virgule', 'fraction', 'decomposition', 'positions', 'droite']} mode="grid" den={10} />
              {!s1 && (
                <ValidateButton onClick={() => setExplored(true)} tone="indigo">
                  J'ai observé les cinq représentations
                </ValidateButton>
              )}
              {s1 && (
                <Feedback tone="info">
                  Retiens le chemin :{' '}
                  <MathText>{'$2 + \\frac{4}{10} = \\frac{24}{10} = 2{,}4$'}</MathText> — et sur la droite graduée,
                  c'est la 4<sup>e</sup> graduation après 2.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'À toi de traduire',
          subtitle: 'Pour chaque écriture à virgule, retrouve la fraction décimale correspondante.',
          done: s2,
          content: (
            <div className="space-y-8">
              {TRADUCTIONS.map((item, i) =>
                i === 0 || trads.includes(i - 1) ? (
                  <div key={item.value} className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Traduction {i + 1} / {TRADUCTIONS.length}
                    </div>
                    <div className="bg-slate-900 rounded-xl py-4 text-center">
                      <div className="font-mono font-extrabold text-3xl text-white tabular-nums">{formatDec(item.value)}</div>
                    </div>
                    <TapQuestion
                      prompt="Quelle est sa fraction décimale ?"
                      options={item.options}
                      correct={item.correct}
                      cols={4}
                      renderOption={renderFraction}
                      explain={item.explain}
                      solved={trads.includes(i)}
                      onAnswered={() => setTrads((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                    {trads.includes(i) && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <RepresentationPanel value={item.value} views={['virgule', 'fraction', 'decomposition']} mode="grid" />
                      </motion.div>
                    )}
                  </div>
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le même nombre, sous toutes ses formes',
          subtitle: 'Fraction décimale ou écriture à virgule : cherche la quantité, pas les chiffres.',
          done: zeroDone,
          content: (
            <div className="space-y-4">
              <Feedback tone="hint">
                Rappel du module 5 : un zéro <strong>à la fin</strong> ne change rien, un zéro{' '}
                <strong>juste après la virgule</strong> décale tout. Utilise cette règle pour trier les écritures
                ci-dessous.
              </Feedback>

              <div className="text-center py-1">
                <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                  Nombre de référence
                </div>
                <MathText>{'$\\frac{27}{10}$'}</MathText>
              </div>

              <BatchChoiceQuestion
                intro={
                  <p className="text-sm text-slate-600">
                    Pour chaque écriture, dis si elle représente la même quantité que{' '}
                    <MathText>{'$\\frac{27}{10}$'}</MathText>.
                  </p>
                }
                rows={CANDIDATS.map((c, i) => ({
                  id: `cand-${i}`,
                  label: <span className="font-mono font-extrabold text-slate-800">{c.text}</span>,
                  options: ['= 27/10', '≠ 27/10'],
                  correct: c.value === REFERENCE ? 0 : 1,
                  correction: c.why,
                }))}
                solved={zeroDone}
                onAnswered={() => setZeroDone(true)}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {!allRight && <>{nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}</>}
                    <strong className="font-mono">27/10 = 2,7 = 2,70 = 270/100</strong>, mais{' '}
                    <strong className="font-mono">27/10 ≠ 2,07</strong> et{' '}
                    <strong className="font-mono">27/10 ≠ 27/100</strong> : la quantité ne dépend ni du nombre de
                    chiffres, ni de la forme (fraction ou virgule) — seule la colonne de chaque chiffre compte.
                  </Feedback>
                )}
              />
            </div>
          ),
        },
      ]}
    />
  );
}
