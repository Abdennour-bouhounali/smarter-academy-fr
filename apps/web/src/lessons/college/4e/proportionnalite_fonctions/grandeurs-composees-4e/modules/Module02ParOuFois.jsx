import React, { useState } from 'react';
import { Tags, Volume2 } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UnitesLab, { ETIQUETTES } from '../components/UnitesLab';
import { GRANDEURS } from '../components/grandeurs4e';

/**
 * Module 2 — DÉCOUVERTE : le vocabulaire, posé après le tri qui l'a exigé.
 *
 * Activity              ranger cinq étiquettes d'unités composées dans deux
 *                       bacs, selon la façon dont on les DIT.
 * Mathematical objective une unité composée est une phrase. « km/h » se lit
 *                       « des kilomètres par heure » (quotient) ; « kWh » se
 *                       lit « des kilowatts fois des heures » (produit).
 * Student action        choisir une étiquette, choisir un bac, lire la phrase
 *                       qui apparaît, corriger si elle ne colle pas.
 * Controlled variable   l'affectation de chaque étiquette.
 * Mathematical state    un dictionnaire étiquette → bac. Le verdict vient de
 *                       `GRANDEURS[…].kind`, jamais d'une liste écrite ici.
 * Visual consequence    la lecture s'affiche sous l'étiquette rangée.
 * Expected observation  « il suffit de la dire à voix haute ».
 * Misconception targeted trier sur le symbole (« il y a une barre ») au lieu de
 *                       trier sur le sens — d'où « ouvriers·jours », sans barre
 *                       et pourtant pas un quotient.
 * Formalization         la brique `grandeur-quotient` arrive APRÈS que les
 *                       cinq étiquettes sont rangées : le mot nomme un tri
 *                       déjà fait, il ne l'ordonne pas.
 *
 * CE QUE CE MODULE NE FAIT PAS : calculer un débit (M3), changer d'unité (M4),
 * écrire la formule (M5).
 */
export default function Module02ParOuFois() {
  const [tri, setTri] = useState({});
  const [selection, setSelection] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const ranger = (id, bac) => {
    setTri((t) => {
      const suivant = { ...t };
      if (bac == null) delete suivant[id];
      else suivant[id] = bac;
      return suivant;
    });
    setSelection(null);
  };

  const rangees = ETIQUETTES.filter((id) => tri[id]);
  const justes = rangees.filter((id) => GRANDEURS[id].kind === tri[id]);
  const done1 = rangees.length === ETIQUETTES.length;
  const toutesJustes = done1 && justes.length === ETIQUETTES.length;

  const lab = (
    <UnitesLab
      tri={tri}
      onTri={ranger}
      selection={selection}
      onSelection={setSelection}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Range les cinq étiquettes',
      subtitle: 'Dis chaque unité à voix haute avant de la poser. La phrase désigne le bac.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Cinq unités composées. Deux bacs : celles qui se disent avec{' '}
            <strong>« par »</strong>, celles qui se disent avec <strong>« fois »</strong>. Rien
            n’est bloqué — une étiquette mal rangée se retire.
          </p>
          {lab}
          {!done1 && (
            <Feedback tone="info">
              {rangees.length} étiquette{rangees.length > 1 ? 's' : ''} rangée
              {rangees.length > 1 ? 's' : ''} sur {ETIQUETTES.length}.
            </Feedback>
          )}
          {done1 && !toutesJustes && (
            <Feedback tone="info">
              Tout est rangé. {ETIQUETTES.length - justes.length} étiquette
              {ETIQUETTES.length - justes.length > 1 ? 's ont' : ' a'} une phrase qui ne colle pas
              à son bac : relis-les et déplace-les.
            </Feedback>
          )}
          {toutesJustes && (
            <Feedback tone="ok">
              Les cinq phrases collent. Remarque que <strong>ouvriers·jours</strong> n’a pas de
              barre et n’est pourtant pas une division, tandis que <strong>g/cm³</strong> en a
              une et en est bien une : c’est la lecture qui décide, pas le symbole.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que « par » veut dire',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un robinet débite 12 L/min. Que dit exactement ce nombre ?"
            options={[
              'Il sort 12 litres pour chaque minute écoulée',
              'Il faut 12 minutes pour remplir un litre',
              'Le robinet contient 12 litres',
              'Il sort 12 litres en tout',
            ]}
            correct={0}
            cols={1}
            requires={['quotient']}
            explain={`« ${GRANDEURS.debit.lecture} » : le mot « par » annonce toujours combien il y en a POUR UNE unité de l’autre grandeur. Ici, 12 litres pour une minute.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="grandeur-quotient"
              variant="new"
              lead="Tes deux bacs ont chacun un nom, et ces noms servent bien au-delà des cinq étiquettes."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le piège du symbole',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Un four de 2 kW allumé pendant 3 h consomme 6 kWh. Le symbole ne porte aucune barre.
          </p>
          <TapQuestion
            prompt="Le kWh (kilowattheure) est-il une grandeur quotient ?"
            options={[
              'Non : il se lit « des kilowatts FOIS des heures », c’est un produit',
              'Oui : toute unité composée est un quotient',
              'Oui : les heures sont sous la barre de fraction',
              'Cela dépend de l’appareil considéré',
            ]}
            correct={0}
            cols={1}
            requires={['grandeur-quotient']}
            explain={`« ${GRANDEURS.energie.lecture} » : on MULTIPLIE les kilowatts par les heures, 2 × 3 = 6. Un quotient se lit « par », un produit se lit « fois » — et le kWh ne porte pas de barre justement parce qu’il n’en est pas un.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Une question reste ouverte : si le débit et la vitesse se lisent pareil, se
              calculent-ils pareil ? C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="« Par » ou « fois » ?"
      moduleSubtitle="Une unité composée se dit avant de s’écrire"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 02',
        title: 'Cinq étiquettes, deux bacs',
        tone: 'indigo',
        body: (
          <>
            km/h, kWh, L/min, ouvriers·jours, g/cm³. Deux d’entre elles ne sont pas de la même
            famille que les autres. <strong>Comment le savoir sans rien apprendre par cœur ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <Tags className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Dis l’unité à voix haute avant de la poser.{' '}
            <Volume2 className="inline h-4 w-4" aria-hidden="true" /> Si la phrase contient
            « par », le bac est trouvé. Si elle contient « fois », c’est l’autre.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
