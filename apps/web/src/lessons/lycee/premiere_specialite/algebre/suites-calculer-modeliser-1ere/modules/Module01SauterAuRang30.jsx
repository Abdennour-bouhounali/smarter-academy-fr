import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SautLab, { SAUT_DEPART, SAUT_VALEUR_CIBLE } from '../components/SautLab';
import EscalierGauss from '../components/EscalierGauss';
import {
  SAUT_CIBLE, SAUT_SEUIL_CLICS, etatSaut, ESCALIERS, escalier, parseNombre, fr,
} from '../components/sommesUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE en DEUX TEMPS.
 *
 * TEMPS 1 — « Sauter au rang 30 » (components/SautLab.jsx). L'élève ne dispose
 * QUE du bouton « +1 rang », et un compteur de clics s'affiche. Le coût du
 * pas-à-pas est rendu PHYSIQUE : après une dizaine de clics, l'exaspération EST
 * le point pédagogique. Un bouton « aller directement au rang 30 » s'ouvre
 * alors — mais il réclame le NOMBRE qui s'y trouve, c'est-à-dire la formule que
 * l'élève n'a pas encore.
 *
 * TEMPS 2 — l'ESCALIER DE PIÈCES (components/EscalierGauss.jsx). La somme
 * u(0) + … + u(n) est dessinée en colonnes. L'élève APPARIE la première avec
 * la dernière, la deuxième avec l'avant-dernière — et découvre que chaque paire
 * a la MÊME hauteur totale. La somme de Gauss naît du geste, pas d'une formule
 * annoncée.
 *
 * AHA : une récurrence est une MARCHE, une écriture directe est un SAUT ; et
 * une somme de beaucoup de termes est un petit nombre de paires identiques.
 *
 * DISTINCTION AVEC LA LEÇON AMONT. « La machine à deux boutons » comparait DEUX
 * machines pour découvrir le PAS ; ici, une seule suite, et l'objet est la
 * DISTANCE parcourue puis le TOTAL accumulé. Mécanismes différents.
 *
 * Rien ne s'appelle « u(0) + n × r » ni « somme des n premiers termes » avant
 * les modules 2 et 4 : le module se termine en DEMANDANT ce que les suivants
 * nommeront (§6bis.1).
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre est geste → observation → brique →
 * demande :
 *   étape 1  gravir, voir le compteur monter → brique `cout-du-pas-a-pas`
 *   étape 2  la question qui ouvre le module 2 (ce qu'il faudrait pour sauter)
 *   étape 3  apparier les colonnes, voir les totaux égaux
 *   étape 4  la question qui ouvre le module 4.
 *
 * MANIPULATION JAMAIS GELÉE. Les deux laboratoires restent pilotables une fois
 * l'étape validée : `disabled` ne porte que des verrous d'ANTÉRIORITÉ. Seuls
 * les `PredictionChips` se figent — une prédiction s'enregistre une fois.
 */
export default function Module01SauterAuRang30() {
  // Temps 1 : la montée.
  const [rang, setRang] = useState(SAUT_DEPART.rang);
  const [clics, setClics] = useState(SAUT_DEPART.clics);
  const [saisie, setSaisie] = useState('');
  const [sautTente, setSautTente] = useState(null);   // 'juste' | 'faux' | null
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);

  // Temps 2 : l'escalier.
  const [paires, setPaires] = useState([]);
  const [apparieOk, setApparieOk] = useState(false);
  const [q4, setQ4] = useState(false);

  const e = etatSaut(rang, clics);
  const ESC = escalier(ESCALIERS[0]);   // six colonnes : trois paires pleines

  // L'étape 1 tombe dès que le coût est VÉCU : le raccourci s'est ouvert, donc
  // l'élève a payé ses dix clics. Ce n'est pas « avoir atteint le rang 30 » —
  // l'atteindre à la main est justement ce que la leçon veut rendre inutile.
  const done1 = e.sautOuvert;
  const done2 = q2;
  const done3 = apparieOk;
  const done4 = q4;

  const avancer = (delta, react) => {
    const suivant = etatSaut(rang + delta, clics + (delta > 0 ? 1 : 0));
    setRang(suivant.rang);
    if (delta > 0) {
      const m = clics + 1;
      setClics(m);
      // L'effet de bord vit dans le gestionnaire, jamais dans un updater.
      if (!done1 && m >= SAUT_SEUIL_CLICS) react?.(true);
    }
  };

  const tenterSaut = (valeur) => {
    const n = parseNombre(valeur);
    if (n === SAUT_VALEUR_CIBLE) {
      setRang(SAUT_CIBLE);
      setSautTente('juste');
    } else {
      setSautTente('faux');
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Un seul bouton, et un compteur',
      subtitle:
        'La suite part de 5 et ajoute 3 à chaque rang. Atteins le rang 30. Tu ne disposes que de « +1 rang » — et chaque pression est comptée.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <SautLab
            rang={rang}
            clics={clics}
            onPas={(d) => avancer(d, kit.react)}
            onSaut={tenterSaut}
            saisieSaut={saisie}
            onChangeSaisieSaut={(v) => { setSaisie(v); setSautTente(null); }}
          />
          {sautTente === 'juste' && (
            <Feedback tone="ok">
              D’un seul geste, du rang {fr(e.rang)} au rang {fr(SAUT_CIBLE)}. Reste à savoir
              comment tu as trouvé ce nombre — et comment le trouver quand on ne l’a pas déjà
              gravi.
            </Feedback>
          )}
          {sautTente === 'faux' && (
            <Feedback tone="info">
              Ce n’est pas le nombre qui se trouve au rang {fr(SAUT_CIBLE)}. Le raccourci ne peut
              pas t’y emmener tant que tu ne sais pas ce qui s’y trouve : c’est exactement le
              problème.
            </Feedback>
          )}
          {done1 ? (
            <>
              <Feedback tone="ok">
                {fr(clics)} clics dépensés, et te voilà au rang <strong>{fr(e.rang)}</strong>. Il en
                reste <strong>{fr(e.restants)}</strong>. Chaque pas est pourtant le même : on ajoute
                3. Faire trente fois la même chose n’apprend rien de plus que la faire une fois — et
                au rang 300, ce ne serait même plus faisable.
              </Feedback>
              <KnowledgeBrick
                id="cout-du-pas-a-pas"
                variant="new"
                lead={<>Ce que ton compteur vient de mesurer, en une phrase. Puis reprends la montée si tu veux.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Continue : {fr(SAUT_SEUIL_CLICS - Math.min(clics, SAUT_SEUIL_CLICS))} clic
              {SAUT_SEUIL_CLICS - Math.min(clics, SAUT_SEUIL_CLICS) > 1 ? 's' : ''} avant qu’une
              autre commande ne s’ouvre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Que faudrait-il pour sauter ?',
      done: done2,
      content: () => (
        <div className="space-y-3">
          <PredictionChips
            prompt="pour connaître le nombre du rang 30 sans faire les trente pas, de quoi aurait-on besoin ?"
            options={[
              { id: 'compter', label: 'Du nombre de pas, et de ce qu’on ajoute à chaque pas' },
              { id: 'dernier', label: 'Du dernier nombre affiché, uniquement' },
              { id: 'rien', label: 'De rien : c’est impossible sans faire les pas' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done2}
          />
          <TapQuestion
            prompt="Trente pas identiques, qui ajoutent chacun 3 à partir de 5. Quelle quantité a-t-on ajoutée EN TOUT ?"
            options={[
              '30 × 3, c’est-à-dire 90 — et il faut encore repartir de 5',
              '30 + 3, c’est-à-dire 33',
              '3, puisque c’est ce qu’on ajoute',
              'On ne peut pas le dire sans faire les pas un par un',
            ]}
            correct={0}
            cols={1}
            requires={['cout-du-pas-a-pas', 'definition-recurrence']}
            explain="Trente fois « + 3 », c’est 30 × 3 = 90 ajoutés au total. Comme on partait de 5, on arrive à 5 + 90 = 95 — et c’est bien ce que la montée affichait au rang 30. Le module suivant écrit cela une fois pour toutes."
            explainWrong="Ajouter trente fois 3 n’est pas ajouter 33, et ce n’est pas ajouter 3 non plus : c’est ajouter 3 trente fois, donc 90. Le nombre de pas MULTIPLIE ce qu’on ajoute — c’est là tout le raccourci."
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <Feedback tone="ok">
              {pred === 'compter' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Voilà ce qu’il fallait'} :
              le <strong>nombre de pas</strong> et <strong>ce qu’on ajoute à chaque pas</strong>{' '}
              suffisent. Retourne au laboratoire : le raccourci accepte maintenant le nombre que tu
              viens de calculer.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et si l’on voulait le TOTAL ?',
      subtitle:
        'Autre question, autre coût : combien font tous ces nombres additionnés ? Chaque colonne est un terme. Apparie-les deux à deux en glissant l’une sur l’autre.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-slate-700">
              On ne demande plus « quel nombre au rang 5 ? » mais{' '}
              <strong>« combien font-ils tous ensemble ? »</strong>
            </p>
            <p className="mt-1 font-mono text-sm font-bold tabular-nums text-slate-900">
              {ESC.list.map(fr).join(' + ')} = ?
            </p>
          </div>
          <EscalierGauss
            list={ESC.list}
            label={`${fr(ESC.nbTermes)} colonnes — une par terme`}
            paires={paires}
            onChangePaires={setPaires}
            disabled={!done2}
            onComplet={() => {
              if (!apparieOk) { setApparieOk(true); kit.react?.(true); }
            }}
          />
          {done3 ? (
            <Feedback tone="ok">
              Trois paires, et <strong>toutes les trois font {fr(ESC.totalPaire)}</strong>. Ce que
              la colonne de gauche perd, celle de droite le gagne : en avançant d’un cran on ajoute
              3, en reculant d’un cran on retranche 3. Le total vaut donc 3 ×{' '}
              {fr(ESC.totalPaire)} = <strong>{fr(ESC.somme)}</strong>, sans additionner six
              nombres. Refais l’appariement autrement si tu veux voir ce que ça donne.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Apparie la <strong>première</strong> colonne avec la <strong>dernière</strong>, puis
              la deuxième avec l’avant-dernière — et regarde les totaux qui s’inscrivent.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Deux questions, deux raccourcis',
      done: done4,
      content: (
        <TapQuestion
          prompt="Qu’est-ce que ces deux découvertes ont en commun ?"
          options={[
            'Dans les deux cas, répéter le même geste beaucoup de fois se remplace par un seul calcul',
            'Dans les deux cas, on trouve toujours le même nombre',
            'Dans les deux cas, il faut connaître le dernier nombre de la liste',
            'Rien : atteindre un rang et tout additionner n’ont aucun rapport',
          ]}
          correct={0}
          cols={1}
          requires={['cout-du-pas-a-pas']}
          explain="Trente pas identiques se replient sur une multiplication ; six additions se replient sur trois paires égales. Dans les deux cas, la répétition régulière est ce qui rend le raccourci possible. Les modules suivants écrivent ces deux raccourcis — un pour chaque famille de suites, et un pour chaque question."
          explainWrong="Les deux calculs ne donnent pas le même nombre : 95 est le terme du rang 30, 75 est le total des six premiers termes. Et connaître le dernier nombre ne suffit pas au premier raccourci : il faut le nombre de pas et ce qu’on ajoute."
          solved={done4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Sauter au rang 30"
      moduleSubtitle="Le coût d’un pas-à-pas, mesuré en clics — puis une longue addition qui se replie"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Trente clics, ou un seul ?',
        tone: 'indigo',
        body: (
          <p>
            Une suite, un bouton, un compteur. Atteins le rang 30 comme tu peux — et compte ce que
            ça t’aura coûté. Ensuite, on te demandera de tout additionner.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Le mot juste.</strong> Deux raccourcis se dessinent : l’un pour atteindre un rang
          lointain, l’autre pour additionner beaucoup de termes. Module suivant : le premier des
          deux, écrit une fois pour toutes.
        </KnowledgeSnapshot>
      }
    />
  );
}
