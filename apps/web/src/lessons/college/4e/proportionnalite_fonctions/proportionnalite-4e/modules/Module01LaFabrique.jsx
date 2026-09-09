import React, { useState } from 'react';
import { Factory, Eye } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UsineLab, { LECTURES } from '../components/UsineLab';
import { ATELIERS, eur, fr } from '../components/prop4e';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              commander des affiches dans deux ateliers, et
 *                       dévoiler une à une les cinq lectures de la relation.
 * Mathematical objective une situation proportionnelle est UNE relation ;
 *                       objets, table, rapport, coefficient et alignement en
 *                       sont cinq lectures qui tiennent — ou cassent —
 *                       ENSEMBLE.
 * Student action        glisser le nombre d'affiches, noter des commandes,
 *                       dévoiler la lecture suivante, changer d'atelier.
 * Controlled variable   le nombre d'affiches, et lui seul.
 * Mathematical state    n, l'atelier choisi, et les commandes notées. Tout le
 *                       reste est CALCULÉ par la règle de l'atelier.
 * Visual consequence    les cinq lectures se réécrivent à l'instant.
 * Expected observation  « chez Bruno, le prix d'une affiche n'arrête pas de
 *                       changer, et les points ratent le coin de la feuille ».
 * Misconception targeted « ça monte quand j'augmente, donc c'est
 *                       proportionnel » — LES DEUX ateliers montent.
 * Feedback              on cite les nombres que l'élève vient de produire,
 *                       jamais un verdict seul.
 * Formalization         le mot « coefficient » est un ACQUIS de 5e, rappelé
 *                       ici ; le produit en croix, les pourcentages et le
 *                       critère graphique appartiennent aux modules 2 à 5.
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur, comme une invitation, jamais comme un péage.
 */
export default function Module01LaFabrique() {
  // ── État mathématique unique du labo ──────────────────────────────
  const [atelierId, setAtelierId] = useState('aLaCommande');
  const [n, setN] = useState(4);
  const [niveau, setNiveau] = useState(1);
  const [releves, setReleves] = useState([]);

  const [pred, setPred] = useState(null);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const atelier = ATELIERS[atelierId];

  const relever = (x) => setReleves((r) => (r.includes(x) ? r : [...r, x].sort((a, b) => a - b)));

  // Étape 1 — trois commandes notées chez Cléo, et les deux ateliers essayés.
  const [ateliersVus, setAteliersVus] = useState(['aLaCommande']);
  const choisirAtelier = (id) => {
    setAtelierId(id);
    setAteliersVus((v) => (v.includes(id) ? v : [...v, id]));
  };
  const done1 = releves.length >= 3;

  // Étape 2 — les cinq lectures dévoilées.
  const done2 = niveau >= 5;

  // Étape 3 — les deux ateliers comparés à la lecture du rapport.
  const done3 = ateliersVus.length >= 2 && niveau >= 3;

  const lab = (
    <UsineLab
      atelierId={atelierId}
      onAtelier={choisirAtelier}
      n={n}
      onN={setN}
      niveau={niveau}
      releves={releves}
      onRelever={relever}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Commande des affiches',
      subtitle: 'Fais glisser le nombre d’affiches, puis note trois commandes différentes.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Deux ateliers impriment les affiches du collège. Choisis-en un, commande, et{' '}
            <strong>note trois commandes</strong> : elles serviront pour la suite.
          </p>
          <PredictionChips
            prompt="Avant de commander : chez Cléo, 10 affiches coûteront-elles exactement le double de 5 affiches ?"
            options={[
              { id: 'double', label: 'Oui, le double' },
              { id: 'moins', label: 'Non, un peu moins' },
              { id: 'plus', label: 'Non, un peu plus' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {releves.length > 0 && releves.length < 3 && (
            <Feedback tone="info">
              {releves.length} commande{releves.length > 1 ? 's' : ''} notée{releves.length > 1 ? 's' : ''}.
              Change le nombre d’affiches et note-en {3 - releves.length} de plus.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois commandes chez <strong>{atelier.nom}</strong>. Regardons-les de plus près.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Cinq façons de lire la même commande',
      subtitle: 'Dévoile les lectures une par une : ce sont cinq visages d’une seule relation.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Tes commandes peuvent s’écrire autrement. À chaque fois, c’est <em>la même chose</em>{' '}
            qui est dite d’une nouvelle façon.
          </p>
          <div className="flex flex-wrap gap-2">
            {LECTURES.map((l, i) => (
              <button
                key={l.id}
                type="button"
                disabled={i > niveau}
                onClick={() => {
                  const suivant = Math.max(niveau, i + 1);
                  setNiveau(suivant);
                  if (suivant >= 5) kit.react?.(true);
                }}
                className={`min-h-[44px] rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  i < niveau
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                    : i === niveau
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-300'
                }`}
              >
                {i < niveau ? '✓ ' : ''}{l.titre}
              </button>
            ))}
          </div>
          {lab}
          {done2 && (
            <Feedback tone="ok">
              Cinq lectures, une seule relation. Chez {atelier.nom}, elles disent toutes la même chose.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Passe chez l’autre atelier',
      subtitle: 'Le même geste, les mêmes lectures — et pourtant quelque chose ne va plus.',
      done: done3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Bruno facture <strong>{eur(ATELIERS.avecMiseEnRoute.base)} de mise en route</strong>, puis{' '}
            {eur(ATELIERS.avecMiseEnRoute.k)} par affiche. Commande chez lui, et regarde la colonne{' '}
            « prix d’UNE affiche ».
          </p>
          {lab}
          {done3 && (
            <Feedback tone="info">
              Chez Cléo, une affiche coûte toujours {eur(ATELIERS.aLaCommande.k)}. Chez Bruno,
              le prix d’une affiche change à chaque commande : {fr(ATELIERS.avecMiseEnRoute.apply(2) / 2)} €
              pour 2 affiches, {fr(ATELIERS.avecMiseEnRoute.apply(10) / 10)} € pour 10.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Qu’est-ce qui casse, exactement ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Chez Bruno, le prix AUGMENTE bien quand on commande plus. Pourtant la situation n’est pas proportionnelle. Qu’est-ce qui le prouve ?"
            options={[
              'Le prix d’une seule affiche n’est pas toujours le même',
              'Le prix augmente trop vite',
              'Il n’y a pas assez de commandes notées',
              'Les nombres ne sont pas des entiers',
            ]}
            correct={0}
            cols={1}
            requires={['coefficient-proportionnalite']}
            explain="« Ça monte » ne suffit jamais : les deux ateliers montent. Ce qui décide, c’est que le prix d’UNE affiche — le rapport prix ÷ nombre — reste le même partout, ou non."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="cinq-lectures"
              variant="new"
              lead="Ce que tu viens de voir a un nom, et il vaut pour toute situation."
            />
          )}
        </div>
      ),
    },
    {
      num: 5,
      title: 'Et le nuage de points ?',
      done: q5,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Reviens sur Bruno, dévoile le nuage de points, et compare-le à celui de Cléo.
          </p>
          {lab}
          <TapQuestion
            prompt="Les points de Bruno sont, eux aussi, parfaitement alignés. Qu’est-ce qui les distingue de ceux de Cléo ?"
            options={[
              'Leur alignement ne part pas du coin (0 ; 0) du graphique',
              'Ils ne sont pas alignés du tout',
              'Ils descendent au lieu de monter',
              'Il y en a moins',
            ]}
            correct={0}
            cols={1}
            requires={['graphique-proportionnalite', 'cinq-lectures']}
            explain="Alignés, oui — mais leur droite ne part pas du coin (0 ; 0). Pour 0 affiche, Bruno fait quand même payer sa mise en route : son premier point est déjà au-dessus de zéro."
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <Feedback tone="info">
              Une question reste ouverte : chez Cléo, comment trouver le prix de 7 affiches sans
              passer par 1 ? C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La fabrique"
      moduleSubtitle="Deux ateliers, cinq lectures, une seule relation"
      estimatedTime="12 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Deux ateliers, deux factures',
        tone: 'indigo',
        body: (
          <>
            Le collège fait imprimer des affiches. Deux ateliers répondent, et leurs prix{' '}
            montent tous les deux quand on commande plus. Un seul est proportionnel.{' '}
            <strong>Lequel, et comment le savoir à coup sûr ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <Factory className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            Commande, note, dévoile. <Eye className="inline h-4 w-4" aria-hidden="true" /> Chaque
            lecture que tu ouvres dit la même chose autrement — jusqu’à ce que l’une d’elles cesse
            d’être d’accord avec les autres.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
