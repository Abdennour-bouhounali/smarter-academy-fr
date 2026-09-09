import React, { useState } from 'react';
import { Bike, Gauge } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DashboardLab from '../components/DashboardLab';
import { fr, relation, texteDuree, CYCLISTE } from '../components/grandeurs4e';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              régler le trajet d'un cycliste sur trois cadrans liés,
 *                       en choisissant lequel tenir fixe.
 * Mathematical objective distance, durée et vitesse ne sont pas trois nombres
 *                       libres : deux suffisent, le troisième est déterminé.
 * Student action        choisir la grandeur fixée, glisser une autre, regarder
 *                       la troisième obéir.
 * Controlled variable   la grandeur fixée, et le cadran glissé.
 * Mathematical state    deux nombres seulement ; le troisième est calculé par
 *                       `relation()`. Les cadrans ne peuvent pas se contredire.
 * Visual consequence    les trois aiguilles bougent ensemble, et le cadran
 *                       calculé s'allume en orange.
 * Expected observation  « en fixant la durée, doubler la distance double la
 *                       vitesse ; en fixant la distance, doubler la durée la
 *                       divise par deux ».
 * Misconception targeted « si je double quelque chose, la vitesse double » —
 *                       la question n'a de sens qu'avec ce qu'on garde fixe.
 * Feedback              on cite les nombres que l'élève vient de produire.
 * Formalization         le mot « vitesse moyenne » est un ACQUIS de 5e. Les
 *                       mots « quotient » et « produit » appartiennent au
 *                       module 2 ; le débit au module 3 ; le changement
 *                       d'unité au module 4 ; la formule écrite au module 5.
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur, comme une invitation, jamais comme un péage.
 */

/** L'état comparé à l'étape 3 : la MÊME distance, deux fois plus de temps. */
const DOUBLE_DUREE = relation({ distance: CYCLISTE.distance, duree: CYCLISTE.duree * 2 });
const DOUBLE_DISTANCE = relation({ distance: CYCLISTE.distance * 2, duree: CYCLISTE.duree });

export default function Module01LeTableauDeBord() {
  // ── État mathématique unique du labo : deux nombres, jamais trois ──
  // LE DÉFAUT QUI PORTE L'AHA : on règle la DURÉE, distance fixée. C'est le
  // seul réglage de départ où le même geste a deux effets OPPOSÉS selon la
  // grandeur qu'on tient fixe (÷ 2 à distance fixée, × 2 à vitesse fixée).
  // Régler la distance donnerait ×2 dans les deux cas, et le module s'ouvrirait
  // sur une comparaison sans contraste — défaut trouvé au navigateur, et
  // désormais verrouillé par `parcours.test.js`.
  const [fixee, setFixee] = useState('distance');
  const [reglee, setReglee] = useState('duree');
  const [valeurs, setValeurs] = useState({
    distance: CYCLISTE.distance,
    duree: CYCLISTE.duree,
    vitesse: CYCLISTE.vitesse,
  });

  const [pred, setPred] = useState(null);
  const [fixeesEssayees, setFixeesEssayees] = useState(['duree']);
  const [reglages, setReglages] = useState(0);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const choisirFixee = (id) => {
    setFixee(id);
    setFixeesEssayees((v) => (v.includes(id) ? v : [...v, id]));
    // La grandeur réglée ne peut jamais être celle qu'on fixe.
    if (reglee === id) setReglee(['distance', 'duree', 'vitesse'].find((g) => g !== id));
  };

  const changerValeur = (id, v) => {
    setValeurs((old) => ({ ...old, [id]: v }));
    setReglages((n) => n + 1);
  };

  const done1 = reglages >= 4;
  const done2 = fixeesEssayees.length >= 2 && reglages >= 6;

  const lab = (
    <DashboardLab
      fixee={fixee}
      onFixee={choisirFixee}
      reglee={reglee}
      onReglee={setReglee}
      valeurs={valeurs}
      onValeur={changerValeur}
      montrerDoublement={done1}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Règle le trajet',
      subtitle: 'Tiens une grandeur fixe, glisse-en une autre. La troisième n’a pas le choix.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le tableau de bord d’un vélo affiche trois cadrans. Tu en tiens un{' '}
            <strong>fixe</strong>, tu en règles un autre — et tu regardes le troisième.
          </p>
          <PredictionChips
            prompt="Avant de toucher aux cadrans : si le cycliste roule deux fois plus longtemps, sa vitesse…"
            options={[
              { id: 'double', label: 'double' },
              { id: 'moitie', label: 'est divisée par 2' },
              { id: 'depend', label: 'ça dépend de ce qui reste fixe' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {!done1 && (
            <Feedback tone="info">
              Bouge encore le curseur : {4 - reglages} réglage{4 - reglages > 1 ? 's' : ''} et
              l’étape est validée. Regarde bien le cadran orange — c’est celui que tu ne règles pas.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Deux cadrans suffisent : le troisième n’est jamais libre. Un encadré vient
              d’apparaître sous le labo — il répond à la prédiction.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Change ce que tu tiens fixe',
      subtitle: 'La même manipulation, une autre grandeur bloquée. Ce n’est plus la même histoire.',
      done: done2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Fixe maintenant une <strong>autre</strong> grandeur, et refais le même geste. Compare
            l’encadré « si je double » avant et après.
          </p>
          {lab}
          {!done2 && (
            <Feedback tone="info">
              Grandeurs déjà fixées : {fixeesEssayees.length} sur 3.{' '}
              {fixeesEssayees.length < 2 ? 'Essaie-en une autre.' : 'Continue à régler.'}
            </Feedback>
          )}
          {done2 && (
            <Feedback tone="ok">
              À durée fixée, doubler la distance fait passer la vitesse de{' '}
              {fr(CYCLISTE.vitesse)} à {fr(DOUBLE_DISTANCE.vitesse)} km/h. À distance fixée,
              doubler la durée la fait tomber à {fr(DOUBLE_DUREE.vitesse)} km/h. Même geste,
              réponse opposée.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Alors, « si je double » ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="« Le cycliste double sa durée : sa vitesse double-t-elle ? » Que répondre à cette question ?"
            options={[
              'On ne peut pas répondre tant qu’on n’a pas dit ce qui reste fixe',
              'Oui, doubler quelque chose double toujours la vitesse',
              'Non, la vitesse ne change jamais',
              'Cela dépend uniquement du vélo utilisé',
            ]}
            correct={0}
            cols={1}
            requires={['vitesse-moyenne']}
            explain={`Tu l’as fait dans les deux sens : à durée fixée, doubler la distance porte la vitesse à ${fr(DOUBLE_DISTANCE.vitesse)} km/h ; à distance fixée, doubler la durée la ramène à ${fr(DOUBLE_DUREE.vitesse)} km/h. La question est incomplète tant qu’on ne dit pas ce qu’on garde fixe.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="trois-grandeurs-liees"
              variant="new"
              lead="Ce que tes trois cadrans viennent de montrer a un nom, et vaut bien au-delà du vélo."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Deux données suffisent',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le cycliste a roulé {fr(CYCLISTE.distance)} km en {texteDuree(CYCLISTE.duree)}.
            Vérifie sur les cadrans, puis réponds.
          </p>
          {lab}
          <TapQuestion
            prompt="Combien de valeurs faut-il connaître pour que les trois cadrans soient déterminés ?"
            options={['Une seule', 'Deux', 'Les trois', 'Aucune, on les règle librement']}
            correct={1}
            cols={4}
            requires={['trois-grandeurs-liees']}
            explain="Deux. C’est pour cela que le troisième cadran n’a pas de curseur : il n’est pas réglable, il est calculé. Tenter de régler les trois reviendrait à écrire un trajet impossible."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Une question reste ouverte : ce « km/h » écrit sur le cadran, qu’est-ce qu’il veut
              dire au juste — et pourquoi n’écrit-on jamais « km × h » ? C’est le module suivant.
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
      moduleTitle="Le tableau de bord"
      moduleSubtitle="Trois cadrans, et jamais plus de deux réglages"
      estimatedTime="13 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Trois cadrans qui ne s’ignorent pas',
        tone: 'indigo',
        body: (
          <>
            Un vélo affiche sa distance, sa durée et sa vitesse. Essaie de les régler tous les
            trois comme tu veux : tu n’y arriveras pas.{' '}
            <strong>Lequel n’est pas libre, et pourquoi ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <Bike className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            Choisis ce que tu bloques, puis glisse.{' '}
            <Gauge className="inline h-4 w-4" aria-hidden="true" /> Le cadran orange est celui que
            tu ne commandes pas — et pourtant c’est lui qui raconte tout.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
