import React, { useState } from 'react';
import { Sun, Ruler } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { roundTenth } from '../components/thalesUtils';

/**
 * Module 1 — DÉCLENCHEUR : deux piquets, une lampe, deux ombres.
 *
 * Activity              changer la hauteur d'un piquet et relever le rapport
 *                       ombre / hauteur.
 * Mathematical objective quand une configuration est conservée, certains
 *                       rapports de longueurs ne changent pas.
 * Student action        régler la hauteur, tamponner le rapport.
 * Controlled variable   une seule hauteur.
 * Mathematical state    deux couples (hauteur, ombre) et leur rapport.
 * Visual consequence    les deux nombres changent, leur quotient non.
 * Expected observation  « c'est toujours le même rapport ».
 * Misconception ciblée   croire que c'est la DIFFÉRENCE qui se conserve —
 *                       l'étape 2 la teste explicitement.
 * Feedback              on montre les deux calculs côte à côte.
 * Formalization         le nom « Thalès » n'apparaît PAS dans ce module.
 * Transfer              le module 2 retrouve cette configuration en géométrie.
 */
/**
 * LE SOLEIL, PAS UN LAMPADAIRE — et ce n'est pas un détail.
 *
 * Avec une source PONCTUELLE et proche, le rapport ombre/hauteur n'est PAS
 * constant : il dépend de la hauteur du piquet (vérifié numériquement — pour
 * une lampe de 6 m à 9 m de distance, le rapport passe de 1,8 à 4,5 quand le
 * piquet monte de 1 m à 4 m). L'invariant que la leçon veut faire découvrir
 * serait donc faux.
 *
 * Avec le soleil, les rayons sont PARALLÈLES : tous les piquets font le même
 * angle avec leur ombre, et ombre ÷ hauteur est réellement constant. C'est
 * exactement la configuration de Thalès, et c'est la seule qui rende vrai ce
 * que l'élève va constater.
 */
const PENTE = 1.5;         // ombre ÷ hauteur, fixé par l'inclinaison du soleil

function ombreDe(h) {
  return h * PENTE;
}

export default function Module01LombreAuSoleil() {
  const [h, setH] = useState(2);
  const [releves, setReleves] = useState([]);
  const ombre = ombreDe(h);
  const rapport = ombre / h;

  const relever = (react) => {
    if (releves.some((r) => r.h === h)) return false;
    setReleves((rs) => [...rs, { h, ombre: roundTenth(ombre), rapport: roundTenth(rapport) }]);
    react(true);
    return true;
  };
  const done1 = releves.length >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const Scene = () => {
    const SCALE = 26;
    const GY = 175;
    const piquetX = 120;
    const boutOmbre = piquetX + ombre * SCALE;
    // Les rayons du soleil : tous PARALLÈLES, même inclinaison partout.
    const rayons = [0, 1, 2, 3].map((i) => {
      const x0 = 20 + i * 62;
      const y0 = 22;
      const dx = 60;
      const dy = dx / PENTE;
      return { x1: x0, y1: y0, x2: x0 + dx, y2: y0 + dy };
    });
    return (
      <svg viewBox="0 0 380 215" role="img"
        className="w-full max-w-[400px] mx-auto bg-white rounded-xl border-2 border-slate-200"
        aria-label={`Soleil aux rayons parallèles, piquet de ${h} m, ombre de ${String(roundTenth(ombre)).replace('.', ',')} m`}>
        <g style={{ pointerEvents: 'none' }}>
          <circle cx="30" cy="26" r="12" fill="#fbbf24" />
          <text x="50" y="20" fontSize="10" fill="#92400e" className="font-mono">
            rayons parallèles
          </text>
          {rayons.map((r, i) => (
            <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
              stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />
          ))}

          <line x1={0} y1={GY} x2={380} y2={GY} stroke="#475569" strokeWidth="2.5" />

          {/* Le rayon qui rase le sommet du piquet et donne le bout de l'ombre */}
          <line x1={piquetX} y1={GY - h * SCALE} x2={boutOmbre} y2={GY}
            stroke="#f59e0b" strokeWidth="2" />

          {/* Le piquet */}
          <line x1={piquetX} y1={GY} x2={piquetX} y2={GY - h * SCALE}
            stroke="#7c3aed" strokeWidth="4" />
          <text x={piquetX - 8} y={GY - h * SCALE - 6} textAnchor="end" fontSize="11"
            className="font-mono font-semibold" fill="#6d28d9">{h} m</text>

          {/* L'ombre */}
          <line x1={piquetX} y1={GY + 7} x2={boutOmbre} y2={GY + 7}
            stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <text x={(piquetX + boutOmbre) / 2} y={GY + 25} textAnchor="middle" fontSize="11"
            className="font-mono font-semibold" fill="#0f172a">
            {String(roundTenth(ombre)).replace('.', ',')} m
          </text>
        </g>
      </svg>
    );
  };

  const steps = [
    {
      num: 1,
      title: 'Trois piquets, trois ombres',
      subtitle: 'Change la hauteur du piquet et note le rapport ombre ÷ hauteur.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le soleil est bas : ses rayons arrivent tous <strong>parallèlement</strong>. Change la
            hauteur du piquet — son ombre change aussi. <strong>Relève le rapport</strong> pour
            trois hauteurs différentes.
          </p>
          <Scene />
          <div className="flex items-center gap-2 justify-center flex-wrap">
            <span className="text-sm font-semibold text-slate-700">Hauteur du piquet</span>
            <button type="button" aria-label="Baisser le piquet" disabled={h <= 1 || done1}
              onClick={() => setH((v) => Math.max(1, v - 1))}
              className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">−</button>
            <span className="w-14 text-center text-lg font-mono font-bold tabular-nums">{h} m</span>
            <button type="button" aria-label="Monter le piquet" disabled={h >= 4 || done1}
              onClick={() => setH((v) => Math.min(4, v + 1))}
              className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xl font-bold">+</button>
          </div>
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-700">
              ombre ÷ hauteur ={' '}
              <strong className="font-mono">
                {String(roundTenth(ombre)).replace('.', ',')} ÷ {h} ={' '}
                {String(roundTenth(rapport)).replace('.', ',')}
              </strong>
            </p>
          </div>
          {!done1 && (
            <button
              type="button"
              onClick={() => relever(kit.react)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700
                         text-white font-semibold min-h-[44px]"
            >
              Relever ce rapport ({releves.length}/3)
            </button>
          )}
          {releves.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center">
              {releves.map((r, i) => (
                <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-emerald-50
                                         border border-emerald-200 text-emerald-800 tabular-nums">
                  {String(r.ombre).replace('.', ',')} ÷ {r.h} = {String(r.rapport).replace('.', ',')}
                </span>
              ))}
            </div>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois piquets de hauteurs différentes, trois ombres différentes — et toujours{' '}
              <strong>le même rapport</strong>. La hauteur et l’ombre changent ensemble, en gardant
              le même quotient.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Rapport ou différence ?',
      done: q2,
      content: (
        <TapQuestion
          prompt="Regarde tes trois relevés : la hauteur change, l’ombre change. Qu’est-ce qui, lui, ne change pas ?"
          options={[
            'Le rapport ombre ÷ hauteur : il vaut la même chose à chaque fois',
            'La différence ombre − hauteur : elle vaut la même chose',
            'La somme ombre + hauteur',
            'Rien ne se conserve, tout change',
          ]}
          correct={0}
          cols={1}
          explain="Tes trois relevés donnent le même quotient. La différence, elle, change : elle dépend de la hauteur. C’est le RAPPORT qui est l’invariant — et c’est ce qui va permettre de calculer des longueurs inaccessibles."
          explainWrong="Reprends tes relevés : les différences entre ombre et hauteur ne sont pas les mêmes, alors que les quotients, si."
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'S’en servir',
      subtitle: 'Un piquet qu’on ne peut pas mesurer.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Au même moment, un arbre voisin projette une ombre de <strong>6 m</strong>. Le soleil
              étant le même, le rapport ombre ÷ hauteur vaut toujours <strong>1,5</strong>.
            </p>
          </div>
          <NumericQuestion
            prompt="Quelle est la hauteur de l’arbre ?"
            suffix="m"
            expected={4}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display="4"
            width="w-24"
            explain="Si ombre ÷ hauteur = 1,5, alors hauteur = ombre ÷ 1,5 = 6 ÷ 1,5 = 4 m. On a mesuré une hauteur sans jamais grimper à l’arbre — c’est tout l’intérêt de ce rapport constant."
            explainFor={(n) => (n === 9
              ? 'Tu as multiplié 6 par 1,5. Le rapport est ombre ÷ hauteur : pour retrouver la hauteur, il faut DIVISER l’ombre par ce rapport.'
              : null)}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="L’ombre au soleil"
      moduleSubtitle="Un rapport qui refuse de changer"
      estimatedTime="8 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Mesurer sans monter',
        tone: 'indigo',
        body: (
          <p>
            Le soleil, un piquet, une ombre. Change la hauteur du piquet autant que tu veux :
            une quantité va refuser de bouger, et elle permettra de mesurer un arbre sans y grimper.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Sun, t: 'Le soleil est loin', d: 'Ses rayons arrivent tous parallèlement.', c: 'text-amber-600' },
            { icon: Ruler, t: 'Deux longueurs', d: 'La hauteur et l’ombre changent ensemble.', c: 'text-indigo-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Ce que tu viens d’observer.</strong> Quand une configuration est conservée
          (ici les rayons du lampadaire), les rapports de longueurs correspondants restent égaux.
          C’est ce phénomène qui va nous occuper toute la leçon.
        </Feedback>
      }
    />
  );
}
