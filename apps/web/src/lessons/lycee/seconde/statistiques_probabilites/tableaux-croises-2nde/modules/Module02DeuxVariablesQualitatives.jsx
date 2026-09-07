import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { CrossTableView, crossTable } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ELEVES, CLASSES, ACTIVITES, NIVEAUX } from '../data';

/**
 * Module 2 — DÉCOUVERTE : la nature des variables croisées.
 *
 * Deux points, dans cet ordre :
 *  · un tableau croisé se construit sur des variables QUALITATIVES (des
 *    modalités, pas des nombres) ;
 *  · parmi elles, certaines sont ORDINALES — leurs modalités ont un ordre
 *    naturel, et cet ordre doit être respecté dans le tableau, sinon la
 *    lecture d'une progression devient impossible.
 *
 * Le contraste est fait sur les MÊMES individus : activité (nominale) contre
 * niveau (ordinal), ce qui isole exactement la propriété étudiée.
 */
const T_NIVEAU = crossTable(ELEVES, 'niveau', 'classe', NIVEAUX, CLASSES);
const T_NIVEAU_MELE = crossTable(ELEVES, 'niveau', 'classe', ['confirmé', 'débutant', 'intermédiaire'], CLASSES);

export default function Module02DeuxVariablesQualitatives() {
  const [ordered, setOrdered] = useState(false);
  const [seen, setSeen] = useState(() => new Set([false]));
  const [q1, setQ1] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = q1;
  const done2 = seen.size >= 2;
  const done3 = q3;

  const toggle = (v, react) => {
    setOrdered(v);
    const next = new Set(seen); next.add(v); setSeen(next);
    if (!done2 && next.size >= 2) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Qualitatif, pas quantitatif',
      done: done1,
      content: (
        <TapQuestion
          prompt="Pourquoi peut-on croiser « classe » et « activité » dans un tableau, mais pas « taille en cm » et « âge en années » de la même façon ?"
          options={[
            'Parce que classe et activité ont un petit nombre de modalités : chaque individu tombe dans une case. Une taille en cm aurait presque autant de modalités que d’élèves',
            'Parce que les nombres ne peuvent jamais être croisés',
            'Parce que la taille n’est pas une caractéristique des élèves',
            'Parce qu’il faut toujours exactement deux modalités',
          ]}
          correct={0} cols={1}
          explain="Un tableau croisé suppose un nombre RAISONNABLE de modalités de chaque côté. « Classe » en a 3, « activité » 4 : douze cases. Une variable quantitative continue comme la taille devrait d’abord être regroupée en classes pour être croisée."
          explainWrong="Rien n’interdit de croiser des grandeurs numériques — à condition de les regrouper d’abord en classes. Le problème est le NOMBRE de modalités, pas leur nature de nombre."
          solved={done1} onAnswered={() => setQ1(true)}
        />
      ),
    },
    {
      num: 2,
      title: 'Nominale ou ordinale ?',
      subtitle: 'Le niveau a un ordre naturel. Bascule entre les deux présentations et regarde ce qu’on gagne.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ordre des modalités">
            {[{ v: false, l: 'Ordre quelconque' }, { v: true, l: 'Ordre naturel (débutant → confirmé)' }].map((o) => (
              <button key={String(o.v)} type="button" aria-pressed={ordered === o.v}
                onClick={() => toggle(o.v, kit.react)}
                className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  ordered === o.v ? 'bg-violet-600 border-violet-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-violet-400'
                }`}>
                {o.l}
              </button>
            ))}
          </div>
          <CrossTableView table={ordered ? T_NIVEAU : T_NIVEAU_MELE}
            rowsTitle="Niveau" colsTitle="Classe"
            caption="Niveau des élèves du club, par classe" />
          {done2 ? (
            <Feedback tone="ok">
              Les effectifs sont les <strong>mêmes</strong> dans les deux présentations : seul l’ordre des lignes
              change. Mais dans l’ordre naturel, on peut lire une <strong>progression</strong> — « de plus en plus
              confirmés » — que l’ordre quelconque rend illisible. Une variable dont les modalités ont un ordre
              s’appelle <strong>ordinale</strong> ; une variable comme l’activité, dont aucune modalité ne vient
              « avant » une autre, est <strong>nominale</strong>.
              {' '}<span className="text-slate-500">Rebascule autant que tu veux.</span>
            </Feedback>
          ) : (
            <Feedback tone="info">Essaie les deux ordres et compare la lisibilité.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Classer les variables',
      done: done3,
      content: (
        <BatchChoiceQuestion
          intro={<p className="text-sm font-semibold text-slate-700">Chaque variable est-elle <strong>nominale</strong> (sans ordre) ou <strong>ordinale</strong> (avec ordre) ?</p>}
          rows={[
            { id: 'v1', label: 'Activité (judo, danse, escalade…)', options: ['Nominale', 'Ordinale'], correct: 0, correction: 'Aucune activité ne vient « avant » une autre.' },
            { id: 'v2', label: 'Niveau (débutant, intermédiaire, confirmé)', options: ['Nominale', 'Ordinale'], correct: 1, correction: 'Les trois modalités se rangent naturellement.' },
            { id: 'v3', label: 'Couleur des yeux', options: ['Nominale', 'Ordinale'], correct: 0, correction: 'Aucun ordre naturel entre bleu, vert et marron.' },
            { id: 'v4', label: 'Mention au bac (passable, AB, B, TB)', options: ['Nominale', 'Ordinale'], correct: 1, correction: 'Les mentions sont hiérarchisées.' },
            { id: 'v5', label: 'Ville de naissance', options: ['Nominale', 'Ordinale'], correct: 0, correction: 'Les villes ne se classent pas dans un ordre intrinsèque.' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les cinq.' : `${nCorrect} sur ${total}.`} Le test : <strong>« puis-je dire qu’une
              modalité vient avant une autre, sans arbitraire ? »</strong> Si oui, la variable est ordinale et
              son ordre doit être respecté dans le tableau.
            </Feedback>
          )}
          solved={done3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Deux variables qualitatives" moduleSubtitle="Des modalités, et parfois un ordre" estimatedTime="12 min"
      brief={{
        tag: 'Découverte', title: 'Nominale ou ordinale', tone: 'violet',
        body: <p>Un tableau croise deux variables qualitatives, c’est-à-dire dont les valeurs sont des modalités. Certaines ont un ordre naturel — et le respecter change la lisibilité du tableau.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Il reste les bords.</strong> Les totaux de lignes et de colonnes ne sont pas de simples
          additions de contrôle : ils répondent à leurs propres questions. Module suivant.
        </KnowledgeSnapshot>
      )}
    />
  );
}
