import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  SITUATIONS, rangDeFranchissement, totalCumule, sommeArithmetique,
  terms, nthArithmetic, nthGeometric, parseNombre, fr, eur,
} from '../components/sommesUtils';

/**
 * Module 6 — ATELIER : modéliser (P5) puis interpréter (P6).
 *
 * Étape 1  CHOISIR LE MODÈLE devant trois énoncés : un versement fixe, une
 *          baisse en pourcentage, une élimination. Le piège central du chapitre
 *          — « perdre 4 % » n'est pas « perdre 4 » — tombe ici.
 *          → brique `choisir-le-modele`.
 * Étape 2  FRANCHIR UN SEUIL : la ville passe-t-elle sous 10 000 habitants, et
 *          quand ? L'élève déroule le modèle et lit le rang.
 * Étape 3  INTERPRÉTER : le solde d'un compte et le total versé sont deux
 *          nombres différents — l'un est un terme, l'autre une somme. C'est le
 *          LP « interpréter » sous sa forme la plus tranchante.
 *          → brique `interpreter-le-modele`.
 *
 * TROIS ÉTAPES ET NON QUATRE : ce module vaut 8 minutes, la moitié d'un module
 * de découverte. Il consolide et applique ; il ne découvre pas de formule.
 *
 * TOUTES LES VALEURS VIENNENT DE `SITUATIONS`, dont les natures, les seuils et
 * les rangs de franchissement sont recalculés par `sommesUtils.test.js` — y
 * compris le fait que le seuil EST franchi, et à quel rang exactement.
 *
 * MANIPULATION JAMAIS GELÉE : le dérouleur reste pilotable après validation.
 * Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 2 sur l'étape 1.
 */
export default function Module06AtelierModeliserInterpreter() {
  const EPARGNE = SITUATIONS[0];      // 800 €, + 60 €/mois
  const VILLE = SITUATIONS[1];        // 12 000 hab., × 0,96 / an
  const DOSE = SITUATIONS[2];         // 20 mg, × 0,6 / jour

  const [q1, setQ1] = useState(false);
  const [rangVille, setRangVille] = useState(1);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const franchissement = rangDeFranchissement(VILLE.gen, VILLE.seuil);
  const done1 = q1;
  const done2 = rangVille >= franchissement.rang && q2;

  // Étape 3 : le solde et le total versé, deux nombres CALCULÉS.
  const MOIS = 12;
  const solde = EPARGNE.gen(MOIS);
  const verse = EPARGNE.raison * MOIS;
  const cumule = totalCumule(EPARGNE.gen, MOIS);

  const steps = [
    {
      num: 1,
      title: 'Trois énoncés, trois modèles',
      subtitle:
        'Chaque phrase dicte une famille et une raison. Repère ce qui se répète : un montant, ou un pourcentage.',
      done: done1,
      content: () => (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            {SITUATIONS.map((s) => (
              <div key={s.id} className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                <div className="text-[13px] font-bold text-amber-900">{s.titre}</div>
                <p className="mt-0.5 text-sm text-slate-700">{s.enonce}</p>
              </div>
            ))}
          </div>
          <TapQuestion
            prompt={`« ${VILLE.enonce} » Quelle suite modélise le nombre d’habitants, année après année ?`}
            options={[
              `Géométrique de raison ${fr(VILLE.raison)} : chaque année on multiplie par 1 − 0,04`,
              'Arithmétique de raison −4 : on perd 4 habitants par an',
              `Arithmétique de raison −480 : on perd toujours ${fr(VILLE.u0 * 0.04)} habitants`,
              'Géométrique de raison 4 : le pourcentage vaut 4',
            ]}
            correct={0}
            cols={1}
            requires={['suite-geometrique', 'coefficient-multiplicateur']}
            explain={`Une baisse de 4 % se traduit par une multiplication par 1 − 0,04 = ${fr(VILLE.raison)}. La première année fait perdre ${fr(VILLE.u0 - VILLE.gen(1))} habitants, mais la deuxième en fait perdre ${fr(Math.round((VILLE.gen(1) - VILLE.gen(2)) * 100) / 100)} : le NOMBRE perdu change, seul le facteur reste le même.`}
            explainWrong={`Perdre « 4 » ferait perdre 4 habitants par an, pas 4 %. Et perdre toujours ${fr(VILLE.u0 * 0.04)} serait une baisse en nombre : la deuxième année, la ville n’en perd déjà plus autant.`}
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Un montant fixe donne une raison additive, un pourcentage une raison multiplicative.
                Les trois situations se rangent ainsi : {EPARGNE.titre.toLowerCase()} → raison{' '}
                {fr(EPARGNE.raison)} ; {VILLE.titre.toLowerCase()} → raison {fr(VILLE.raison)} ;{' '}
                {DOSE.titre.toLowerCase()} → raison {fr(DOSE.raison)} (il RESTE 60 % chaque jour).
              </Feedback>
              <KnowledgeBrick
                id="choisir-le-modele"
                variant="new"
                lead={<>La marche à suivre, de la phrase à la raison.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quand passe-t-on sous le seuil ?',
      subtitle: `Déroule le modèle de la ville jusqu’à ce qu’elle passe sous ${fr(VILLE.seuil)} habitants.`,
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <Derouleur
            enonce={VILLE.enonce}
            gen={VILLE.gen}
            rang={rangVille}
            rangMax={10}
            unite={VILLE.unite}
            libelleRang={VILLE.libelleRang}
            seuil={VILLE.seuil}
            sens="sous"
            onChangeRang={(v) => {
              setRangVille(v);
              if (!done2 && v >= franchissement.rang && q2) kit.react?.(true);
            }}
          />
          <NumericQuestion
            prompt={
              <>
                Au bout de combien d’<strong>années</strong> la ville compte-t-elle moins de{' '}
                {fr(VILLE.seuil)} habitants ?
              </>
            }
            expected={franchissement.rang}
            parse={parseNombre}
            display={fr(franchissement.rang)}
            requires={['terme-rang-geometrique', 'choisir-le-modele']}
            explain={`u(${fr(franchissement.rang)}) = ${fr(VILLE.u0)} × ${fr(VILLE.raison)}^${fr(franchissement.rang)} ≈ ${fr(Math.round(franchissement.valeur))}, qui est bien inférieur à ${fr(VILLE.seuil)} — alors qu’à l’année ${fr(franchissement.rang - 1)} il restait encore ≈ ${fr(Math.round(VILLE.gen(franchissement.rang - 1)))} habitants. C’est donc la ${fr(franchissement.rang)}ᵉ année.`}
            explainFor={(n) =>
              n === franchissement.rang - 1
                ? `À l’année ${fr(franchissement.rang - 1)}, il reste ≈ ${fr(Math.round(VILLE.gen(franchissement.rang - 1)))} habitants : le seuil n’est pas encore franchi.`
                : n === franchissement.rang + 1
                ? `À l’année ${fr(franchissement.rang + 1)} le seuil est franchi depuis un an déjà : on cherche la PREMIÈRE année où il l’est.`
                : null
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <Feedback tone="ok">
              Le modèle répond à une question qu’on ne pouvait pas trancher à l’œil. Il suppose
              cependant que le taux reste le même chaque année — ce n’est pas la réalité, c’est une
              hypothèse.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que le nombre veut dire',
      done: q3,
      content: () => (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <p className="text-sm text-slate-700">{EPARGNE.enonce}</p>
            <p className="mt-1 font-mono text-[13px] text-slate-600">
              u(0) = {eur(EPARGNE.u0)} {EPARGNE.unite} · raison {eur(EPARGNE.raison)}{' '}
              {EPARGNE.unite} · au mois {fr(MOIS)} : u({fr(MOIS)}) = {eur(solde)} {EPARGNE.unite}
            </p>
          </div>
          <TapQuestion
            prompt={`Au bout de ${fr(MOIS)} mois, que vaut ${eur(solde)} € — et qu’est-ce qui ne vaut PAS ce nombre ?`}
            options={[
              `C’est le SOLDE du compte au mois ${fr(MOIS)}. Le total VERSÉ, lui, vaut ${eur(verse)} €`,
              `C’est le total versé en ${fr(MOIS)} mois`,
              `C’est la somme de tous les soldes mensuels, soit ${eur(cumule)} €`,
              `C’est le solde, et le total versé vaut aussi ${eur(solde)} €`,
            ]}
            correct={0}
            cols={1}
            requires={['choisir-le-modele', 'terme-rang-arithmetique', 'mem-somme-arithmetique']}
            explain={`u(${fr(MOIS)}) = ${eur(EPARGNE.u0)} + ${fr(MOIS)} × ${eur(EPARGNE.raison)} = ${eur(solde)} € : c’est ce que CONTIENT le compte, un TERME de la suite. Ce qui a été versé, c’est ${fr(MOIS)} × ${eur(EPARGNE.raison)} = ${eur(verse)} € — le reste (${eur(EPARGNE.u0)} €) y était au départ. Et la somme de tous les soldes mensuels, ${eur(cumule)} €, ne correspond à rien de concret ici : c’est un calcul juste qui répond à une question que personne ne pose.`}
            explainWrong={`Un terme et une somme sont deux objets différents. Le solde du mois ${fr(MOIS)} est un terme ; le total versé est ${fr(MOIS)} fois la raison ; la somme des soldes (${eur(cumule)} €) additionne treize états successifs du même compte, ce qui n’a pas de sens ici.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <>
              <Feedback tone="ok">
                Un modèle ne devient utile qu’au moment où l’on dit ce que ses nombres SONT. La même
                suite répond à trois questions différentes selon qu’on lit un terme, une somme, ou un
                rang de franchissement.
              </Feedback>
              <KnowledgeBrick
                id="interpreter-le-modele"
                variant="new"
                lead={<>Les trois questions qu’un modèle sait trancher — et ce qu’il faut dire en même temps que la réponse.</>}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Atelier : modéliser et interpréter"
      moduleSubtitle="Une épargne, une ville qui se vide, une dose qui s’élimine"
      estimatedTime="8 min"
      brief={{
        tag: 'Atelier',
        title: 'De la phrase au nombre, et retour',
        tone: 'indigo',
        body: (
          <p>
            Trois situations, trois modèles à choisir. Puis le travail qui compte vraiment : faire
            dire au modèle quelque chose d’utile, et savoir ce que le nombre trouvé signifie.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Tout est en place.</strong> Atteindre un rang, sommer dans les deux familles,
          modéliser et interpréter : la mission finale les met à l’épreuve ensemble.
        </KnowledgeSnapshot>
      }
    />
  );
}

/* ── Le dérouleur : une situation, un cliquet, une colonne ──────────── */
function Derouleur({ enonce, gen, rang, rangMax, unite, libelleRang, seuil, sens, onChangeRang, disabled = false }) {
  const liste = terms(gen, rang);
  const franchi = (v) => (sens === 'sous' ? v < seuil : v >= seuil);
  const btnLeger =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 '
    + 'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const btnFort =
    'min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 '
    + 'disabled:opacity-40 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="space-y-3 rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-3">
      <p className="text-sm font-semibold text-amber-900">{enonce}</p>
      <p className="text-[13px] text-slate-600">
        seuil visé : {sens === 'sous' ? 'moins de' : 'au moins'} <strong>{fr(seuil)}</strong> {unite}
      </p>

      <ol className="space-y-1" aria-live="polite">
        {liste.map((v, i) => {
          const arrondie = Math.round(v * 100) / 100;
          const ok = franchi(v);
          return (
            <li
              key={i}
              className={`flex flex-wrap items-center gap-2 rounded-lg border px-2.5 py-1.5 ${
                ok ? 'border-emerald-300 bg-emerald-50' : 'border-amber-200 bg-white'
              }`}
            >
              <span className="w-24 shrink-0 font-mono text-[13px] text-slate-500">
                {libelleRang} {fr(i)}
              </span>
              <span className="font-mono text-base font-black tabular-nums text-amber-900">
                {fr(arrondie)} {unite}
              </span>
              {ok && (
                <span className="ml-auto text-[13px] font-bold text-emerald-700">seuil franchi</span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Dérouler : ${libelleRang}`}>
        <button
          type="button"
          className={btnLeger}
          onClick={() => onChangeRang(rang - 1)}
          disabled={disabled || rang <= 0}
          aria-label="Revenir en arrière"
        >
          ← −1
        </button>
        <button
          type="button"
          className={btnFort}
          onClick={() => onChangeRang(rang + 1)}
          disabled={disabled || rang >= rangMax}
          aria-label={`Passer au ${libelleRang} suivant`}
        >
          {libelleRang} suivant →
        </button>
      </div>
    </div>
  );
}
