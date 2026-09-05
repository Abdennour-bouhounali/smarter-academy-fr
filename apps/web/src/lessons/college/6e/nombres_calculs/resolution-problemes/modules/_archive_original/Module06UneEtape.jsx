import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, StepCard, MissionBrief, NumberField, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseFr } from '@smarter-academy/core';

/**
 * Six problèmes à une étape, un par structure. Aucune opération n'est
 * nommée dans l'énoncé : la structure n'est révélée qu'APRÈS, en feedback,
 * pour que l'élève la découvre après coup — jamais avant de chercher.
 */
const PROBLEMES = [
  {
    structure: 'COMBINER',
    text: 'Un panier contient 14 pommes et 9 poires. Combien de fruits contient-il en tout ?',
    unit: 'fruits', answer: 23,
    explain: '14 + 9 = 23. Deux quantités de même nature sont réunies en une seule : c\'est la structure COMBINER.',
  },
  {
    structure: 'RETIRER',
    text: 'Un parking compte 60 places. 37 sont occupées. Combien de places restent libres ?',
    unit: 'places', answer: 23,
    explain: '60 − 37 = 23. Une partie est enlevée du total : c\'est la structure RETIRER.',
  },
  {
    structure: 'COMPARER',
    text: 'Un immeuble mesure 45 m de haut, un autre 28 m. Quelle est la différence de hauteur entre les deux ?',
    unit: 'm', answer: 17,
    explain: '45 − 28 = 17. Aucun objet ne disparaît ici : on mesure un écart entre deux quantités. C\'est la structure COMPARER — même opération que RETIRER, sens différent.',
  },
  {
    structure: 'GROUPER',
    text: 'Un fleuriste prépare 9 bouquets identiques de 6 roses chacun. Combien de roses utilise-t-il en tout ?',
    unit: 'roses', answer: 54,
    explain: '9 × 6 = 54. Des groupes égaux sont répétés : c\'est la structure GROUPER.',
  },
  {
    structure: 'PARTAGER',
    text: '84 bonbons sont partagés équitablement entre 7 enfants. Combien de bonbons chaque enfant reçoit-il ?',
    unit: 'bonbons', answer: 12,
    explain: '84 ÷ 7 = 12. Une quantité totale est distribuée équitablement : c\'est la structure PARTAGER.',
  },
  {
    structure: 'GROUPER (sens inverse)',
    text: '72 œufs doivent être rangés dans des boîtes de 6 œufs. Combien de boîtes faut-il ?',
    unit: 'boîtes', answer: 12,
    explain: '72 ÷ 6 = 12. Ici on cherche le NOMBRE DE GROUPES, pas la taille d\'un groupe — encore une division, mais un sens différent de PARTAGER.',
  },
];

function ProblemeItem({ item, index, total, solved, onSolved }) {
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);

  const check = () => {
    if (parseFr(val) === item.answer) { onSolved?.(); setFb(null); }
    else setFb('Relis la situation : que se passe-t-il vraiment avec les quantités ?');
  };

  return (
    <div className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
      <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
        Problème {index + 1} / {total}
      </div>
      <p className="text-sm text-slate-800 leading-relaxed bg-white border-2 border-slate-200 rounded-xl p-3">{item.text}</p>
      {solved ? (
        <Feedback tone="ok">
          <strong className="font-mono">{item.answer} {item.unit}</strong> — {item.explain}
        </Feedback>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <NumberField value={val} onChange={(v) => { setVal(v); setFb(null); }} onEnter={check} ariaLabel={item.text} placeholder="?" width="w-28" />
            <span className="text-sm font-mono text-slate-500">{item.unit}</span>
            <ValidateButton onClick={check} disabled={!val}>OK</ValidateButton>
          </div>
          {fb && <Feedback tone="hint">{fb}</Feedback>}
        </>
      )}
    </div>
  );
}

export default function Module06UneEtape() {
  const navLinks = getNavLinks(6);
  const [done, setDone] = useState([]);
  const allDone = done.length === PROBLEMES.length;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Problèmes à une étape"
      moduleSubtitle="Combiner, retirer, comparer, grouper, partager — sans étiquette donnée à l'avance."
      moduleNumber={6}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="🎯 Une étape" title="Six situations, six structures différentes.">
          <p>
            Aucun énoncé ne te dira quelle opération utiliser. Comprends d'abord ce qui se passe, puis calcule.
            La structure sera nommée seulement après, dans le corrigé.
          </p>
        </MissionBrief>

        <StepCard num={1} title="Résous les six problèmes" done={allDone}>
          <div className="space-y-6">
            {PROBLEMES.map((item, i) =>
              i === 0 || done.includes(i - 1) ? (
                <ProblemeItem
                  key={item.text}
                  item={item}
                  index={i}
                  total={PROBLEMES.length}
                  solved={done.includes(i)}
                  onSolved={() => setDone((d) => (d.includes(i) ? d : [...d, i]))}
                />
              ) : null
            )}

            {allDone && (
              <Feedback tone="info">
                Remarque : les problèmes 2 et 3 utilisent tous les deux une soustraction, comme les problèmes 5 et
                6 utilisent tous les deux une division. <strong>Même opération, sens différent.</strong> C'est la
                situation qui donne le sens, jamais un mot isolé.
              </Feedback>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
