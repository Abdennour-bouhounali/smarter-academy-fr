import React, { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { statut, ENONCES_IDS, STATUTS } from '../components/triangles4e';

/**
 * Module 5 — PRACTICE LAB : trier des énoncés, et découvrir que la réciproque
 * n'est pas donnée d'avance.
 *
 * Ce module n'enseigne pas une technique de plus : il fait DÉCIDER. Huit
 * énoncés sont posés sur le bureau, et l'élève doit dire ce que chacun EST —
 * une définition qui pose un mot, une propriété à sens unique, ou une
 * caractérisation qui marche dans les deux sens. Les erreurs n'y comptent pas
 * comme preuve (stage `practice_lab`).
 *
 * LE POINT DE BASCULE. Les deux propriétés de la leçon ont leur réciproque
 * vraie. Un élève qui n'aurait vu qu'elles conclurait que « la réciproque est
 * toujours vraie » — et cette croyance est PIRE que l'ignorance de départ. Le
 * tri contient donc deux propriétés dont la réciproque tombe, avec leur
 * contre-exemple chiffré :
 *   · « équilatéral ⟹ isocèle » : le triangle 5-5-8 réfute la réciproque ;
 *   · « triangle ⟹ 180° » : la réciproque ne distingue aucune forme.
 * Le noyau (`statut`) porte ces deux cas, et un test vérifie qu'ils y sont
 * TOUJOURS — supprimer le contre-exemple casserait le module.
 *
 * REJOUABLE : le tri se refait autant qu'on veut, rien n'est désactivé après
 * validation de l'étape.
 */
const CARTES = ENONCES_IDS.map(statut);

export default function Module05LeTriDuDetective() {
  const [choix, setChoix] = useState({});
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const poser = (id, s) => setChoix((c) => ({ ...c, [id]: s }));

  const triees = CARTES.filter((c) => choix[c.id]);
  const justes = CARTES.filter((c) => choix[c.id] === c.statut);
  const done1 = triees.length === CARTES.length;

  const steps = [
    {
      num: 1,
      title: 'Classe les huit énoncés',
      subtitle: 'Définition, propriété, ou caractérisation ? Les erreurs ne comptent pas ici.',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-sm text-slate-700">
            <div className="space-y-1">
              <div><strong>Définition</strong> — pose un mot. Il n’y a rien à démontrer.</div>
              <div><strong>Propriété</strong> — « si … alors … ». Un seul sens est affirmé.</div>
              <div><strong>Caractérisation</strong> — les deux sens sont vrais : « si et seulement si ».</div>
            </div>
          </div>
          {CARTES.map((c) => {
            const pose = choix[c.id];
            const juste = pose === c.statut;
            return (
              <div key={c.id} className={`rounded-2xl border-2 p-3.5 ${
                !pose ? 'border-slate-200 bg-white'
                  : juste ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'
              }`}>
                <p className="text-sm text-slate-800">{c.texte}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {STATUTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => poser(c.id, s.id)}
                      className={`min-h-[44px] rounded-xl border-2 px-2 py-2 text-xs font-bold transition-colors ${
                        pose === s.id
                          ? 'border-slate-800 bg-slate-800 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {pose && (
                  <div className="mt-2 space-y-1">
                    <p className={`text-xs font-semibold ${juste ? 'text-emerald-800' : 'text-amber-900'}`}>
                      {juste
                        ? `C’est bien une ${STATUTS.find((s) => s.id === c.statut).label.toLowerCase()}.`
                        : `Non : c’est une ${STATUTS.find((s) => s.id === c.statut).label.toLowerCase()}.`}
                    </p>
                    <p className="text-xs text-slate-600">{c.pourquoi}</p>
                    {c.reciproqueVraie !== null && (
                      <p className={`text-xs font-semibold ${
                        c.reciproqueVraie ? 'text-slate-600' : 'text-rose-700'
                      }`}>
                        Réciproque : {c.reciproqueVraie ? 'vraie (mais il a fallu le vérifier)' : 'FAUSSE'}
                      </p>
                    )}
                    {c.reciproqueVraie === null && (
                      <p className="text-xs text-slate-500">
                        Réciproque : sans objet — une définition n’affirme rien à retourner.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {done1 && (
            <Feedback tone="ok">
              {justes.length} classements justes sur {CARTES.length}. Regarde surtout les deux
              énoncés dont la réciproque est FAUSSE : ils prouvent que retourner une propriété
              n’est jamais gratuit.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le contre-exemple qui tranche',
      done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            « Si un triangle est équilatéral, alors il est isocèle » est vrai. Sa réciproque
            serait : « si un triangle est isocèle, alors il est équilatéral ».
          </p>
          <TapQuestion
            prompt="Comment prouver que cette réciproque est FAUSSE ?"
            options={[
              'En exhibant un triangle isocèle non équilatéral, par exemple 5-5-8',
              'En vérifiant la propriété sur beaucoup de triangles équilatéraux',
              'En mesurant les angles d’un triangle équilatéral',
              'C’est impossible à prouver : il faudrait tous les triangles',
            ]}
            correct={0}
            cols={1}
            requires={['inegalite-triangulaire']}
            explain="Un seul contre-exemple suffit à démolir un énoncé universel. Le triangle 5-5-8 existe bien (5 + 5 dépasse 8), il est isocèle, et il n’est pas équilatéral : la réciproque est réfutée."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La règle du détective',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Une propriété « si A alors B » est vraie. Que peut-on dire de « si B alors A » ?"
            options={[
              'Rien pour l’instant : c’est un autre énoncé, qu’il faut vérifier séparément',
              'Elle est vraie aussi, automatiquement',
              'Elle est fausse, automatiquement',
              'Elle est vraie seulement en géométrie',
            ]}
            correct={0}
            cols={1}
            requires={['caracterisation-rectangle', 'reciproque-milieux']}
            explain="Tes deux propriétés de la leçon avaient une réciproque vraie — mais tu as dû le VÉRIFIER dans les deux cas, par un module entier à chaque fois. Et le tri vient de te montrer deux énoncés où la réciproque tombe."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="propriete-et-reciproque"
              variant="new"
              lead="Voilà la règle générale, celle qui vaut au-delà de cette leçon."
            />
          )}
          {q3 && (
            <KnowledgeBrick
              id="mem-un-seul-sens"
              variant="new"
              lead="Et le réflexe à garder avant d’utiliser une propriété."
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le tri du détective"
      moduleSubtitle="Ce qui se retourne, et ce qui ne se retourne pas"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'Huit énoncés sur le bureau',
        tone: 'slate',
        body: (
          <>
            Certains posent un mot, d’autres affirment quelque chose dans un seul sens, d’autres
            encore marchent dans les deux. <strong>À toi de les classer.</strong> Les erreurs ne
            comptent pas : c’est un atelier.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <FolderOpen className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Tes deux propriétés de la leçon avaient toutes les deux leur réciproque vraie. C’est
            une coïncidence heureuse, pas une règle — et deux des énoncés ci-dessous vont te le
            prouver.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
