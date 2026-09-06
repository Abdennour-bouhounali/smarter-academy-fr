import React, { useState, useRef } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ClockFace from '../components/ClockFace';
import { parseDec, formatDec } from '../components/durationUtils';

/**
 * Module 3 — découverte : 1 h = 60 min, PAR LE GESTE.
 *
 * L'élève fait avancer la grande aiguille (par pas de +5 min, le raccourci
 * +1 h est retiré exprès) ; un compteur additionne les minutes. Quand le
 * tour est complet, la petite aiguille a avancé d'UNE heure : la relation
 * n'est pas récitée, elle est constatée sur le mécanisme.
 */
const START = { hours: 9, minutes: 0 };

const DECIMAL_Q = {
  q: 'Sur une application, on lit « durée : 1 h 30 min ». Un élève écrit « 1,30 h ». Un autre écrit « 1,5 h ». Qui a raison ?',
  options: [
    'Celui qui écrit 1,30 h : on recopie les minutes après la virgule',
    'Celui qui écrit 1,5 h : 30 min est la MOITIÉ d’une heure',
    'Les deux écritures sont correctes',
  ],
  correct: 1,
  explain:
    '30 min = la moitié de 60 min = 0,5 h — donc 1 h 30 min = 1,5 h, jamais « 1,30 h ». En 6e, le plus sûr est de garder l’écriture en h et min, sans virgule.',
};

function TourComplet({ react, solved, onSolved }) {
  const [time, setTime] = useState(START);
  const [advanced, setAdvanced] = useState(solved ? 60 : 0);
  const prevTotal = useRef(START.hours * 60 + START.minutes);
  const done = solved || advanced >= 60;

  const handleChange = (next) => {
    if (done) return;
    const nextTotal = next.hours * 60 + next.minutes;
    let delta = nextTotal - prevTotal.current;
    // Passage minuit improbable ici, mais on protège le delta.
    if (delta < -12 * 60) delta += 24 * 60;
    if (delta > 0) {
      const newAdvanced = advanced + delta;
      setAdvanced(newAdvanced);
      if (newAdvanced >= 60) {
        react(true);
        onSolved?.();
      }
    }
    prevTotal.current = nextTotal;
    setTime(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Il est 9 h 00. Fais avancer la <strong>grande</strong> aiguille d'un tour COMPLET (par glisser ou par
        +5 min) et surveille la petite aiguille…
      </p>
      <ClockFace
        hours={done && !solved ? time.hours : done ? 10 : time.hours}
        minutes={done && !solved ? time.minutes : done ? 0 : time.minutes}
        mode={done ? 'display' : 'set'}
        onChange={handleChange}
        showDigital
        bumpButtons={['+5min']}
        disabled={done}
      />
      <div className="text-center font-mono text-sm text-slate-600" aria-live="polite">
        Minutes avancées : <strong>{Math.min(advanced, 60)}</strong> / 60
      </div>
      {done && (
        <Feedback tone="ok">
          Un tour complet de la grande aiguille = <strong>60 minutes</strong>… et pendant ce tour, la petite
          aiguille a avancé d'exactement <strong>une heure</strong> (de 9 à 10). Voilà le secret :{' '}
          <strong>1 h = 60 min</strong> — et de la même façon, 1 min = 60 s et 1 jour = 24 h.
        </Feedback>
      )}
    </div>
  );
}

export default function Module03SecretDu60() {
  const [tourDone, setTourDone] = useState(false);
  const [conv1Done, setConv1Done] = useState(false);
  const [conv2Done, setConv2Done] = useState(false);
  const [decimalDone, setDecimalDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le secret du 60"
      moduleSubtitle="Un tour complet de la grande aiguille… et le mystère de la base 60 s’ouvre."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Pourquoi 60, et pas 100 ?',
        body: <p>Le mécanisme de l'horloge va te montrer la relation entre heures et minutes — sans rien réciter.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Le tour complet',
          done: tourDone,
          content: (kit) => (
            <div className="space-y-5">
              <TourComplet react={kit.react} solved={tourDone} onSolved={() => setTourDone(true)} />
              {/* Le mécanisme vient de faire la démonstration : 60 minutes
                  de grande aiguille = 1 heure de petite. LE concept de la
                  leçon est posé ici, sur ce constat — c'est une RÈGLE, pas
                  un mot de vocabulaire. */}
              {tourDone && (
                <KnowledgeBrick
                  id="base-60"
                  variant="new"
                  lead="Ce que l’engrenage vient de te montrer est la règle du jeu de toute la leçon."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'La relation au travail',
          done: conv1Done && conv2Done,
          content: (
            <div className="space-y-6">
              <NumericQuestion
                prompt="2 heures = ? minutes"
                suffix="min"
                expected={120}
                parse={parseDec}
                display={formatDec(120)}
                explain={<>2 × 60 = <strong>120 min</strong> : vers l'unité plus petite, on multiplie par 60.</>}
                explainFor={(n) =>
                  n === 200
                    ? 'Tu as multiplié par 100, comme pour des longueurs. Le temps marche par 60 : 2 × 60.'
                    : '1 h = 60 min, donc 2 h = 2 × 60 min.'
                }
                requires={['unites-temps', 'base-60']}
                solved={conv1Done}
                onAnswered={() => setConv1Done(true)}
              />
              {conv1Done && (
                <div className="border-t border-slate-100 pt-4">
                  <NumericQuestion
                    prompt="180 secondes = ? minutes"
                    suffix="min"
                    expected={3}
                    parse={parseDec}
                    display={formatDec(3)}
                    explain={<>180 ÷ 60 = <strong>3 min</strong> : vers l'unité plus grande, on divise par 60.</>}
                    explainFor={() => '1 min = 60 s : combien de paquets de 60 dans 180 ?'}
                    requires={['unites-temps', 'base-60']}
                    solved={conv2Done}
                    onAnswered={() => setConv2Done(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le grand piège décimal',
          done: decimalDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                prompt={DECIMAL_Q.q}
                options={DECIMAL_Q.options}
                correct={DECIMAL_Q.correct}
                cols={1}
                explain={DECIMAL_Q.explain}
                requires={['unites-temps', 'base-60']}
                solved={decimalDone}
                onAnswered={() => setDecimalDone(true)}
              />
              {/* Le piège de la virgule est une CONSÉQUENCE du 60 : la
                  brique arrive après que l'élève l'a tranché lui-même. */}
              {decimalDone && (
                <KnowledgeBrick
                  id="piege-decimal"
                  variant="new"
                  lead="Cette erreur d’écriture revient sans arrêt — voici comment ne plus jamais la faire."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Le secret est éventé. Reste à s'en servir : convertir des
          durées composées, et comparer des chronos écrits n'importe comment.
        </KnowledgeSnapshot>
      }
    />
  );
}
