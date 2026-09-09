import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VueMystere from '../components/VueMystere';

/**
 * Module 1 — DÉCLENCHEUR : une seule vue ne suffit pas.
 *
 * Le module OUVRE sur la manipulation (§6bis, et la règle « lab d'abord, pas
 * de portillon de prédiction ») : dès l'étape 1, l'élève choisit la vue qu'il
 * veut voir, et c'est ce choix qui produit la découverte.
 *
 * LE FAIT EST VRAI, PAS SEULEMENT AFFIRMÉ. La boîte de chocolats (prisme
 * triangulaire) et la boîte de thé (cylindre) donnent réellement la même vue
 * de face — un rectangle — et la même vue de côté. Seule la vue de dessus les
 * sépare : triangle contre disque. `VueMystere` trace les deux silhouettes de
 * face à partir des MÊMES dimensions, si bien que le dessin ne peut pas
 * contredire le propos (§28bis).
 *
 * Expected observation : « deux cartons différents peuvent donner la même
 * photo ; il faut regarder ailleurs pour trancher ».
 * Misconception targeted (M2) : croire qu'une vue suffit à identifier un solide.
 */
export default function Module01TroisPhotosUnCarton() {
  const [vue, setVue] = useState('face');
  const [vuDessus, setVuDessus] = useState(false);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const choisir = (v, react) => {
    setVue(v);
    if (v === 'dessus' && !vuDessus) { setVuDessus(true); react?.(true); }
  };

  const VUES = [
    { id: 'face', label: 'de face' },
    { id: 'cote', label: 'de côté' },
    { id: 'dessus', label: 'de dessus' },
  ];

  const steps = [
    {
      num: 1,
      title: 'Deux cartons, une seule photo',
      subtitle: 'Choisis la direction depuis laquelle photographier les deux emballages.',
      done: vuDessus,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3.5 text-sm text-slate-700">
            L’atelier prépare deux emballages : une <strong>boîte de chocolats</strong> et une{' '}
            <strong>boîte de thé</strong>. On les photographie tous les deux depuis la même
            direction. Trouve une direction qui permette de les <strong>distinguer</strong>.
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {VUES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => choisir(v.id, kit.react)}
                aria-pressed={vue === v.id}
                className={`min-h-[44px] rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                  vue === v.id
                    ? 'border-indigo-500 bg-indigo-500 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300'
                }`}
              >
                Photographier {v.label}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-center text-xs font-semibold text-slate-500">🍫 Boîte de chocolats</p>
              <VueMystere solide="prisme" vues={[vue]} />
            </div>
            <div className="space-y-1">
              <p className="text-center text-xs font-semibold text-slate-500">🍵 Boîte de thé</p>
              <VueMystere solide="cylindre" vues={[vue]} />
            </div>
          </div>

          {!vuDessus && (
            <PredictionChips
              prompt="À ton avis, une seule photo suffit-elle à reconnaître un emballage ?"
              options={[
                { id: 'oui', label: 'Oui, toujours' },
                { id: 'non', label: 'Non, pas toujours' },
              ]}
              value={pred}
              onChange={setPred}
            />
          )}

          {vuDessus ? (
            <Feedback tone="ok">
              Vue <strong>de dessus</strong>, les deux se séparent enfin : un{' '}
              <strong>triangle</strong> d’un côté, un <strong>disque</strong> de l’autre. De face
              et de côté, en revanche, les deux donnaient le <strong>même rectangle</strong> —
              impossible de trancher.
            </Feedback>
          ) : vue === 'face' || vue === 'cote' ? (
            <Feedback tone="info">
              Les deux photos sont <strong>identiques</strong> : un rectangle dans les deux cas.
              Cette direction ne permet pas de les distinguer — essaie une autre.
            </Feedback>
          ) : null}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce qu’une photo perd',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="vue"
            variant="new"
            lead={<>Ce que tu viens de prendre en photo porte un nom, et son défaut est justement ce que tu as constaté.</>}
          />
          <TapQuestion
            prompt="Pourquoi la vue de face ne permettait-elle pas de reconnaître l’emballage ?"
            options={[
              'Parce qu’elle écrase le solide : elle perd la forme de la base',
              'Parce que les deux boîtes ont la même couleur',
              'Parce que la photo était trop petite',
              'Parce qu’on ne peut jamais reconnaître un solide sur un dessin',
            ]}
            correct={0}
            cols={1}
            requires={['vue']}
            explain="Une vue projette le solide sur un plan : elle perd une dimension. De face, le triangle comme le disque se réduisent au même rectangle — c’est la base qui les distingue, et elle ne se voit que de dessus."
            explainWrong="Le problème n’est ni la taille ni la couleur : une vue écrase le solide et perd une dimension. C’est cette perte qui rend deux solides différents identiques sur une même photo."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Deux boîtes, un même plan de fabrication',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="solide-usuel"
            variant="new"
            lead={<>Les deux emballages de l’atelier sont bâtis sur le même principe — et c’est lui qu’on va suivre toute la leçon.</>}
          />
          <TapQuestion
            prompt="Qu’ont en commun la boîte de chocolats (un prisme droit) et la boîte de thé (un cylindre) ?"
            options={[
              'Deux bases identiques, reliées par une surface qui en fait le tour',
              'Six faces rectangulaires chacune',
              'Une seule base et une pointe',
              'Rien : ce sont deux solides sans rapport',
            ]}
            correct={0}
            cols={1}
            requires={['solide-usuel', 'face-solide']}
            explain="Les deux ont deux bases identiques (triangles pour l’un, disques pour l’autre) reliées par une surface latérale qui en fait le tour. C’est ce plan commun qui donnera leurs patrons."
            explainWrong="Six faces rectangulaires, c’est le pavé droit. Une base et une pointe, ce serait une pyramide ou un cône — des solides que tu verras l’an prochain. Ici, les deux boîtes ont bien DEUX bases identiques."
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
      moduleTitle="Trois photos, un carton"
      moduleSubtitle="Pourquoi une seule image ne suffit jamais"
      estimatedTime="9 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Reconnaître un emballage sur une photo',
        tone: 'indigo',
        body: (
          <p>
            L’atelier photographie ses cartons pour les cataloguer. Mais{' '}
            <strong>deux emballages très différents peuvent donner exactement la même image</strong>.
            Trouve la direction qui les sépare.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
