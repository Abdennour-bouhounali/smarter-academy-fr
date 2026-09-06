import React, { useState } from 'react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 6 — formalisation, reconstruit sur le lesson kit.
 *
 * Six problèmes à une étape, un par structure. Aucune opération n'est
 * nommée dans l'énoncé : la structure n'est révélée qu'APRÈS, en
 * correction, pour que l'élève la découvre après coup — jamais avant de
 * chercher.
 */
const PROBLEMES = [
  {
    structure: 'COMBINER',
    text: 'Un panier contient 14 pommes et 9 poires. Combien de fruits contient-il en tout ?',
    unit: 'fruits', answer: 23,
    explain: "14 + 9 = 23. Deux quantités de même nature sont réunies en une seule : c'est la structure COMBINER.",
  },
  {
    structure: 'RETIRER',
    text: 'Un parking compte 60 places. 37 sont occupées. Combien de places restent libres ?',
    unit: 'places', answer: 23,
    explain: "60 − 37 = 23. Une partie est enlevée du total : c'est la structure RETIRER.",
  },
  {
    structure: 'COMPARER',
    text: 'Un immeuble mesure 45 m de haut, un autre 28 m. Quelle est la différence de hauteur entre les deux ?',
    unit: 'm', answer: 17,
    explain: "45 − 28 = 17. Aucun objet ne disparaît ici : on mesure un écart entre deux quantités. C'est la structure COMPARER — même opération que RETIRER, sens différent.",
  },
  {
    structure: 'GROUPER',
    text: 'Un fleuriste prépare 9 bouquets identiques de 6 roses chacun. Combien de roses utilise-t-il en tout ?',
    unit: 'roses', answer: 54,
    explain: "9 × 6 = 54. Des groupes égaux sont répétés : c'est la structure GROUPER.",
  },
  {
    structure: 'PARTAGER',
    text: '84 bonbons sont partagés équitablement entre 7 enfants. Combien de bonbons chaque enfant reçoit-il ?',
    unit: 'bonbons', answer: 12,
    explain: "84 ÷ 7 = 12. Une quantité totale est distribuée équitablement : c'est la structure PARTAGER.",
  },
  {
    structure: 'GROUPER (sens inverse)',
    text: '72 œufs doivent être rangés dans des boîtes de 6 œufs. Combien de boîtes faut-il ?',
    unit: 'boîtes', answer: 12,
    explain: "72 ÷ 6 = 12. Ici on cherche le NOMBRE DE GROUPES, pas la taille d'un groupe — encore une division, mais un sens différent de PARTAGER.",
  },
];

export default function Module06UneEtape() {
  const [done, setDone] = useState([]);
  const allDone = done.length === PROBLEMES.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Problèmes à une étape"
      moduleSubtitle="Combiner, retirer, comparer, grouper, partager — sans étiquette donnée à l'avance."
      estimatedTime="8 min"
      brief={{
        tag: '🎯 Une étape',
        title: 'Six situations, six structures différentes.',
        body: (
          <p>
            Aucun énoncé ne te dira quelle opération utiliser. Comprends d'abord ce qui se passe, puis calcule.
            La structure sera nommée seulement après, dans le corrigé.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Résous les six problèmes',
          done: allDone,
          content: (
            <div className="space-y-6">
              {PROBLEMES.map((item, i) =>
                i === 0 || done.includes(i - 1) ? (
                  <div key={item.text} className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Problème {i + 1} / {PROBLEMES.length}
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed bg-white border-2 border-slate-200 rounded-xl p-3">{item.text}</p>
                    <NumericQuestion
                      requires={['situation-avant-mots', 'choisir-un-modele']}
                      suffix={item.unit}
                      expected={item.answer}
                      explain={item.explain}
                      explainFor={() => 'Relis la situation : que se passe-t-il vraiment avec les quantités ?'}
                      solved={done.includes(i)}
                      onAnswered={() => setDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}

              {allDone && (
                <>
                  <KnowledgeBrick
                    id="structures-de-problemes"
                    variant="new"
                    lead="Les six situations que tu viens de traiter : deux soustractions pour deux raisons différentes, deux divisions pour deux questions différentes."
                  />
                  <KnowledgeBrick id="mem-comprendre-avant" variant="new" />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Un problème n'a pas toujours une seule étape : il faut
          parfois trouver un nombre pour pouvoir en trouver un autre.
        </KnowledgeSnapshot>
      }
    />
  );
}
