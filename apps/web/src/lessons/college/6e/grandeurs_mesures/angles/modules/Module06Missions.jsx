import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Protractor from '../components/Protractor';
import AngleFigure from '../components/AngleFigure';
import { classLabel, formatDeg, parseDec, formatDec } from '../components/angleUtils';

/**
 * Module 6 — practice lab : le club de mini-golf.
 *
 * Lire un rebond dans une orientation inhabituelle, partager un gâteau
 * (les angles autour d'un point font 360°), et refermer le piège du
 * Module 1 sur une fanfaronnade d'adversaire.
 */
const REBOND = 110;

const CLASSE_Q = {
  q: `Le rebond mesuré vaut ${formatDeg(REBOND)}. C’est un angle…`,
  options: ['aigu', 'droit', 'obtus'],
  correct: 2,
  explain: `${formatDeg(REBOND)} > 90° : c’est un angle obtus. Classer après avoir mesuré, c’est la vérification qui attrape les erreurs de graduation.`,
};

const FANFARON_Q = {
  q: 'Ton adversaire affirme : « mon angle de tir est plus fort, regarde comme ses côtés sont longs sur le plan ! » A-t-il raison ?',
  options: [
    'Oui : des côtés plus longs, c’est un angle plus grand',
    'Non : la longueur des côtés ne change pas l’ouverture — donc pas la mesure',
  ],
  correct: 1,
  explain:
    'Un angle mesure une ouverture. Dessiner ses côtés plus longs ne l’ouvre pas d’un degré : les deux angles peuvent parfaitement mesurer la même chose. (Le piège du tout premier module !)',
};

function RebondRound({ react, solved, onSolved }) {
  const [picked, setPicked] = useState(solved ? REBOND : null);
  const done = solved || picked !== null;
  const isRight = picked === REBOND;

  const handleRead = (value) => {
    if (done) return;
    setPicked(value);
    react(value === REBOND);
    onSolved?.();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        La balle rebondit sur la bande. Le rapporteur est en place (zéro à gauche cette fois) : lis l'angle de
        rebond.
      </p>
      <Protractor
        angleDeg={REBOND}
        mode="read"
        zeroSide="left"
        onReadTick={handleRead}
        selectedValue={picked}
        disabled={done}
        ariaLabel="Angle de rebond à mesurer"
      />
      {done && (
        <Feedback tone={isRight ? 'ok' : 'ko'}>
          {isRight ? (
            <>Rebond mesuré : <strong>{formatDeg(REBOND)}</strong>, un angle {classLabel(REBOND)}.</>
          ) : (
            <>
              Tu as lu {formatDeg(picked)} — c'est l'autre graduation. Le zéro étant posé à gauche, la mesure est{' '}
              <strong>{formatDeg(REBOND)}</strong> (et l'angle est visiblement plus ouvert qu'une équerre).
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

export default function Module06Missions() {
  const [rebondDone, setRebondDone] = useState(false);
  const [classeDone, setClasseDone] = useState(false);
  const [gateauDone, setGateauDone] = useState(false);
  const [fanfaronDone, setFanfaronDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Missions d’angles"
      moduleSubtitle="Mini-golf : lire un rebond, partager un gâteau, viser le dernier trou."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Tournoi de mini-golf : trois situations, trois angles.',
        body: <p>Mesurer dans une position inhabituelle, calculer un partage, et ne pas se laisser impressionner.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Mission 1 · Le rebond sur la bande',
          done: rebondDone && classeDone,
          content: (kit) => (
            <div className="space-y-5">
              <RebondRound react={kit.react} solved={rebondDone} onSolved={() => setRebondDone(true)} />
              {rebondDone && (
                <div className="border-t border-slate-100 pt-4">
                  <TapQuestion
                    prompt={CLASSE_Q.q}
                    options={CLASSE_Q.options}
                    correct={CLASSE_Q.correct}
                    cols={3}
                    explain={CLASSE_Q.explain}
                    solved={classeDone}
                    onAnswered={() => setClasseDone(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Mission 2 · Le gâteau du vainqueur',
          done: gateauDone,
          content: (
            <div className="space-y-3">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
                Le gâteau du tournoi est partagé en parts égales. Chaque part forme un angle de{' '}
                <strong>45°</strong> au centre. Sachant qu'un tour complet vaut <strong>360°</strong>, combien y
                a-t-il de parts ?
              </div>
              <NumericQuestion
                prompt="Nombre de parts :"
                suffix="parts"
                expected={8}
                parse={parseDec}
                display={formatDec(8)}
                explain={<>360 ÷ 45 = <strong>8 parts</strong>. Les angles autour d'un même point font toujours un tour complet : 360°.</>}
                explainFor={(n) =>
                  n === 45
                    ? '45, c’est la mesure d’UNE part. La question demande COMBIEN de parts : divise le tour complet (360°) par 45°.'
                    : 'Combien de fois 45° tiennent-ils dans un tour complet de 360° ?'
                }
                solved={gateauDone}
                onAnswered={() => setGateauDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Mission 3 · Le fanfaron du club',
          done: fanfaronDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                above={
                  <div className="grid grid-cols-2 gap-4" aria-hidden="true">
                    <div className="space-y-1">
                      <AngleFigure deg={55} rayLengths={[45, 45]} arcLabel="55°" tone="emerald" size={170} />
                      <p className="text-center text-xs text-slate-500">Ton tir</p>
                    </div>
                    <div className="space-y-1">
                      <AngleFigure deg={55} rayLengths={[100, 100]} arcLabel="55°" tone="violet" size={170} />
                      <p className="text-center text-xs text-slate-500">Le sien</p>
                    </div>
                  </div>
                }
                prompt={FANFARON_Q.q}
                options={FANFARON_Q.options}
                correct={FANFARON_Q.correct}
                cols={1}
                explain={FANFARON_Q.explain}
                solved={fanfaronDone}
                onAnswered={() => setFanfaronDone(true)}
              />
              {fanfaronDone && (
                <Feedback tone="ok">
                  Tournoi remporté : tu sais mesurer dans n'importe quelle position, calculer un partage
                  d'angles, et repérer le piège des côtés longs.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Target className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Autour d'un point, les angles font 360°. Et quelle que soit la longueur des côtés, seule l'ouverture
            compte.
          </p>
        </motion.div>
      }
    />
  );
}
