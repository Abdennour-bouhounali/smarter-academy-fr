import React, { useState } from 'react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Protractor from '../components/Protractor';
import { formatDeg, classLabel, parseDec, formatDec } from '../components/angleUtils';

/**
 * Module 3 — manipulation : les deux gestes du rapporteur.
 *
 * D'abord le RITUEL de placement (l'outil arrive volontairement décalé :
 * l'élève tape les deux consignes dans l'ordre pour le poser), puis la
 * lecture au tap. Le picker « X ou Y ? » du Protractor apparaît dès ici —
 * mais avec le zéro à droite, l'échelle extérieure est la bonne : le vrai
 * piège est traité au Module 4.
 */
// Mesures choisies sur les graduations tappables du rapporteur (pas de
// 10°) : l'élève doit pouvoir désigner EXACTEMENT la bonne graduation.
const READ1 = 60;
const READ2 = 120;

function PlacementRitual({ react, solved, onSolved }) {
  const [step, setStep] = useState(solved ? 2 : 0);
  const done = solved || step >= 2;

  const advance = () => {
    if (done) return;
    const next = step + 1;
    setStep(next);
    if (next >= 2) {
      react(true);
      onSolved?.();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Le rapporteur est posé n'importe comment. Remets-le en place en suivant les deux gestes,{' '}
        <strong>dans cet ordre</strong>.
      </p>
      <Protractor angleDeg={READ1} mode="read" misplaced={step < 1} disabled />
      <div className="grid sm:grid-cols-2 gap-2">
        <button
          type="button"
          disabled={step !== 0}
          onClick={advance}
          className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
            step > 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'
          }`}
        >
          1. Centre sur le sommet {step > 0 && '✓'}
        </button>
        <button
          type="button"
          disabled={step !== 1}
          onClick={advance}
          className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
            step > 1 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : step === 1 ? 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400' : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}
        >
          2. Zéro sur un côté {step > 1 && '✓'}
        </button>
      </div>
      {done && (
        <Feedback tone="ok">
          Les <strong>deux gestes du rapporteur</strong>, toujours dans cet ordre : le <strong>centre</strong> sur
          le sommet, puis le <strong>zéro</strong> aligné sur un côté. Sans ça, toute lecture est fausse — même
          avec un rapporteur parfait.
        </Feedback>
      )}
    </div>
  );
}

function ReadRound({ react, angle, index, solved, onSolved }) {
  const [picked, setPicked] = useState(solved ? angle : null);
  const done = solved || picked !== null;
  const isRight = picked === angle;
  const [lastRead, setLastRead] = useState(null);

  /* La lecture reste OUVERTE après la réponse (règle projet du
     2026-09-06 : un labo ne se fige jamais). `picked` garde la PREMIÈRE
     lecture — c'est elle que juge le verdict — pendant que `lastRead` suit
     les lectures suivantes : l'élève peut retourner voir l'autre
     graduation, ce qui est justement le geste que le module enseigne. */
  const handleRead = (value) => {
    setLastRead(value);
    if (done) return;
    setPicked(value);
    react(value === angle);
    onSolved?.();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-mono text-slate-500 uppercase tracking-wide">
        {done
          ? `Mesure ${index} · tu peux continuer à taper les graduations`
          : `Mesure ${index} · Tape la graduation où sort le second côté`}
      </p>
      <Protractor
        angleDeg={angle}
        mode="read"
        onReadTick={handleRead}
        selectedValue={lastRead ?? picked}
      />
      {done && (
        <Feedback tone={isRight ? 'ok' : 'ko'}>
          {isRight ? (
            <>Bien lu : l'angle mesure <strong>{formatDeg(angle)}</strong> — un angle {classLabel(angle)}.</>
          ) : (
            <>
              Tu as lu {formatDeg(picked)}, mais le second côté sort sur la graduation{' '}
              <strong>{formatDeg(angle)}</strong>. Astuce : l'angle est {classLabel(angle)}, donc sa mesure est{' '}
              {angle < 90 ? 'forcément plus PETITE' : 'forcément plus GRANDE'} que 90°.
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

export default function Module03Rapporteur() {
  const [ritualDone, setRitualDone] = useState(false);
  const [read1Done, setRead1Done] = useState(false);
  const [read2Done, setRead2Done] = useState(false);
  const [ecrireDone, setEcrireDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Mesurer avec le rapporteur"
      moduleSubtitle="Deux gestes, toujours dans le même ordre — puis on lit."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Comparer, c’est bien. Mesurer, c’est mieux.',
        body: <p>Le rapporteur donne un nombre exact — à condition d'être posé correctement. Deux gestes, jamais un de moins.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Le rituel de placement',
          done: ritualDone,
          content: (kit) => (
            <div className="space-y-5">
              {/* L'instrument est manipulé dès la première seconde : la
                  brique qui le nomme accompagne le geste, elle ne le
                  précède pas d'un cours. */}
              <PlacementRitual react={kit.react} solved={ritualDone} onSolved={() => setRitualDone(true)} />
              {ritualDone && (
                <>
                  <KnowledgeBrick
                    id="rapporteur"
                    variant="new"
                    lead="L’outil que tu viens de poser a un nom, et une unité de mesure bien à lui."
                  />
                  <KnowledgeBrick
                    id="rituel-placement"
                    variant="new"
                    lead="Les deux gestes que tu as faits dans l’ordre forment un rituel : il ne change jamais."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Lis les mesures',
          done: read1Done && read2Done,
          content: (kit) => (
            <div className="space-y-8">
              <ReadRound react={kit.react} angle={READ1} index={1} solved={read1Done} onSolved={() => setRead1Done(true)} />
              {read1Done && (
                <div className="border-t border-slate-100 pt-6">
                  <ReadRound react={kit.react} angle={READ2} index={2} solved={read2Done} onSolved={() => setRead2Done(true)} />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Écris la mesure',
          done: ecrireDone,
          content: (
            <NumericQuestion
              prompt="Un angle droit mesure exactement combien de degrés ?"
              suffix="°"
              expected={90}
              parse={parseDec}
              display={formatDec(90)}
              explain={<>Un angle droit mesure <strong>90°</strong> — c'est le repère qui sépare les angles aigus des obtus.</>}
              explainFor={() => 'C’est l’angle du coin d’une feuille, celui de l’équerre.'}
              requires={['angle-droit', 'classes-angles', 'rapporteur']}
              solved={ecrireDone}
              onAnswered={() => setEcrireDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Tu sais poser l'instrument et lire. Mais chaque graduation
          porte DEUX nombres — le module suivant démonte ce piège pour de bon.
        </KnowledgeSnapshot>
      }
    />
  );
}
