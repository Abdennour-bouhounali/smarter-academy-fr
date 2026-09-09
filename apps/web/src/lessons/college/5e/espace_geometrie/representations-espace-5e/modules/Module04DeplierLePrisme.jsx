import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PatronPrismeLab from '../components/PatronPrismeLab';
import { BOITE_CHOCOLATS, verifierPatronPrisme, raisonPatron } from '../components/espace5e';

/**
 * Module 4 — MANIPULATION : construire le patron d'un prisme droit.
 *
 * L'élève POSE les pièces, et le composant juge par CONDITION MATHÉMATIQUE
 * (`verifierPatronPrisme`), jamais par comparaison à une liste de patrons
 * appris. Conséquence : tout patron correct qu'il inventerait est accepté, et
 * un patron faux est refusé pour une raison exacte, qui nomme l'erreur.
 *
 * L'erreur visée est structurelle (M3) : poser les deux bases DU MÊME CÔTÉ de
 * la bande. Le placement est délibérément possible — il faut qu'il le soit
 * pour que le refus ait un sens — et il est diagnostiqué quand il survient,
 * jamais par un « Incorrect. » sec (§23).
 *
 * PÉRIMÈTRE : on ne déplie pas le cube ni le pavé (c'est la 6e), et on ne
 * calcule aucun volume (objet de 4e).
 */
export default function Module04DeplierLePrisme() {
  const [pieces, setPieces] = useState([]);
  const [reussi, setReussi] = useState(false);
  const [q2, setQ2] = useState(false);

  const verdict = verifierPatronPrisme(pieces, BOITE_CHOCOLATS);
  // L'erreur structurelle, telle qu'elle se produit RÉELLEMENT sous les
  // doigts de l'élève : c'est elle qu'on commente, pas une erreur supposée.
  const memeCote = verdict.raison === 'bases-du-meme-cote';

  const basculer = (slot, react) => {
    const deja = pieces.find((p) => p.slot === slot.slot);
    const next = deja
      ? pieces.filter((p) => p.slot !== slot.slot)
      : [...pieces, { id: slot.slot, role: slot.role, cote: slot.cote, slot: slot.slot }];
    setPieces(next);
    if (verifierPatronPrisme(next, BOITE_CHOCOLATS).ok && !reussi) {
      setReussi(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Construis le carton de la boîte de chocolats',
      subtitle: 'Pose les pièces : il faut de quoi fermer les deux extrémités, et faire le tour.',
      done: reussi,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            La boîte de chocolats est un <strong>prisme droit à base triangulaire</strong>. Tape
            sur les emplacements pour poser les pièces du carton : les <strong>triangles</strong>{' '}
            (▲) ferment les extrémités, les <strong>rectangles</strong> (▭) font le tour.
          </div>

          <PatronPrismeLab
            prisme={BOITE_CHOCOLATS}
            pieces={pieces}
            onToggle={(slot) => basculer(slot, kit.react)}
            ariaLabel="Patron de la boîte de chocolats — pose les pièces"
          />

          {reussi ? (
            <Feedback tone="ok">
              Le carton est complet : <strong>deux triangles</strong>, un à chaque extrémité, et{' '}
              <strong>trois rectangles</strong> — un par côté du triangle. Plié, il redonne
              exactement la boîte.
            </Feedback>
          ) : memeCote ? (
            /* Diagnostic du geste réellement fait. */
            <Feedback tone="ko">
              {raisonPatron('bases-du-meme-cote')} Déplace l’un des deux triangles de l’autre côté
              de la bande.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {raisonPatron(verdict.raison) || 'Commence par poser les rectangles de la bande.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi les deux bases ne vont pas du même côté',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="patron-prisme"
            variant="new"
            lead={<>Voici ce que tu viens de construire, décrit une fois pour toutes.</>}
          />
          <KnowledgeBrick id="deux-bases" variant="new" />
          <TapQuestion
            prompt="Que se passerait-il si les deux triangles étaient posés du même côté de la bande ?"
            options={[
              'Ils se rabattraient au même endroit : une extrémité doublée, l’autre ouverte',
              'Le carton serait simplement plus long',
              'Rien : le pliage marcherait quand même',
              'Le prisme aurait quatre bases',
            ]}
            correct={0}
            cols={1}
            requires={['patron-prisme', 'deux-bases', 'patron-solide']}
            explain="Au pliage, chaque triangle se rabat sur l’extrémité voisine. Deux triangles du même côté viennent donc au même endroit : une extrémité est fermée deux fois, l’autre reste ouverte."
            explainWrong="Le pliage ne marcherait pas : les deux triangles se rabattraient au même endroit. Un prisme a deux extrémités, il faut donc une base de chaque côté de la bande."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Déplier le prisme"
      moduleSubtitle="Deux bases, une bande — et un piège de placement"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Du solide au carton à plat',
        tone: 'indigo',
        body: (
          <p>
            Pour <strong>fabriquer</strong> un emballage, ni la photo ni le dessin ne suffisent :
            il faut le <strong>patron</strong>, le carton à découper. Construis celui de la boîte
            de chocolats.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
