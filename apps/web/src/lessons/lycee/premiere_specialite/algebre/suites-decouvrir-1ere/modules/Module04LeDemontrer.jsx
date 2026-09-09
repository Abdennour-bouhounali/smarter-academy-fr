import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  A_DEMONTRER, ecartFormule, rapportFormule, parseNombre, fr,
} from '../components/suitesUtils';

/**
 * Module 4 — MANIPULATION : démontrer, et non constater (P5).
 *
 * Étape 1  l'atelier de preuve sur u(n) = 5n − 2. L'élève choisit l'outil
 *          (écart ou rapport) et le RANG auquel il l'applique, puis vérifie
 *          que le résultat ne bouge pas d'un rang à l'autre. Le geste est
 *          celui du module 3 — mais appliqué rang par rang, il fait sentir que
 *          vérifier quatre rangs ne dit rien du cinquième.
 * Étape 2  le passage à la lettre : le même calcul écrit avec n, développé et
 *          réduit. C'est du calcul littéral de 2de, appliqué ici.
 *          → briques `preuve-vs-constat` puis `methode-demontrer-arithmetique`.
 * Étape 3  la preuve par le rapport sur v(n) = 4 × 3ⁿ →
 *          brique `methode-demontrer-geometrique`, puis `mem-ecart-ou-rapport`.
 * Étape 4  choisir le bon outil : sur une suite affine, chercher le rapport ne
 *          mène nulle part — et réciproquement.
 *
 * TOUTES LES CONSTANTES SONT RECALCULÉES par `suitesUtils.test.js`, y compris
 * la dernière valeur de la ligne de calcul citée : un calcul affiché qui ne se
 * terminerait pas sur la constante annoncée est refusé avant l'élève.
 *
 * MANIPULATION JAMAIS GELÉE : l'atelier de preuve reste pilotable après
 * validation. Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 2 sur l'étape 1.
 */
export default function Module04LeDemontrer() {
  const U = A_DEMONTRER[0];      // u(n) = 5n − 2, écart constant 5
  const V = A_DEMONTRER[1];      // v(n) = 4 × 3ⁿ, rapport constant 3
  const W = A_DEMONTRER[2];      // w(n) = 12 − 4n, écart constant −4

  const [rang1, setRang1] = useState(0);
  const [vus1, setVus1] = useState([0]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = vus1.length >= 3 && q1;
  const done2 = q2;
  const done3 = q3;

  const visiter1 = (v, react) => {
    setRang1(v);
    if (vus1.includes(v)) return;
    const suivant = [...vus1, v];
    setVus1(suivant);
    if (!done1 && suivant.length >= 3 && q1) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Vérifier rang par rang',
      subtitle:
        'Choisis un rang et regarde l’écart u(n+1) − u(n) qu’il donne. Visite au moins trois rangs différents.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <AtelierPreuve
            formule={U.formule}
            f={U.f}
            rang={rang1}
            vus={vus1}
            rangMax={6}
            onChangeRang={(v) => visiter1(v, kit.react)}
          />
          <NumericQuestion
            prompt={<>Quel écart obtiens-tu, quel que soit le rang choisi ?</>}
            expected={U.constante}
            parse={parseNombre}
            display={fr(U.constante)}
            requires={['suite-arithmetique', 'methode-trouver-la-raison']}
            explain={`Au rang 0 : ${fr(U.f(1))} − ${fr(U.f(0))} = ${fr(U.constante)}. Au rang 3 : ${fr(U.f(4))} − ${fr(U.f(3))} = ${fr(U.constante)}. Toujours ${fr(U.constante)} — sur les rangs essayés.`}
            explainFor={(n) =>
              n === U.f(0)
                ? `${fr(U.f(0))} est le premier terme, pas l’écart. L’écart est la différence entre deux termes consécutifs.`
                : null
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {done1 ? (
            <Feedback tone="ok">
              Trois rangs, trois fois <strong>{fr(U.constante)}</strong>. Mais rien ne dit ce qui se
              passe au rang 100 : tu as vérifié, tu n’as pas encore <em>démontré</em>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Rangs visités : {vus1.length} sur 3 — et la question à répondre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le calcul qui vaut pour tous les rangs',
      subtitle:
        'On refait exactement le même calcul, mais avec la lettre n au lieu d’un nombre. Développe et réduis.',
      done: done2,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="preuve-vs-constat"
            variant="new"
            lead={<>Pourquoi trois rangs ne suffisent pas, dit en une phrase.</>}
          />
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
            <div className="text-[13px] font-semibold text-emerald-900">
              Le même calcul, avec la lettre
            </div>
            <p className="mt-1.5 font-mono text-sm leading-relaxed text-slate-800">
              {U.calcul.split('=').map((bout, i, tab) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-emerald-700"> = </span>}
                  <span className={i === tab.length - 1 ? 'font-black text-emerald-900' : ''}>
                    {bout.trim()}
                  </span>
                  {i < tab.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          </div>
          <TapQuestion
            prompt="Pourquoi ce calcul-là démontre-t-il, alors que trois vérifications ne démontraient pas ?"
            options={[
              'Parce que n n’y désigne aucun rang particulier : le résultat vaut donc pour tous les rangs à la fois',
              'Parce qu’il utilise des parenthèses',
              'Parce qu’il donne le même nombre que les trois vérifications',
              'Parce qu’il est plus court à écrire',
            ]}
            correct={0}
            cols={1}
            requires={['expression-litterale', 'methode-reduire', 'preuve-vs-constat']}
            explain={`Le calcul n’a jamais remplacé n par un nombre : il reste vrai quel que soit le rang. Comme il se termine sur ${fr(U.constante)}, un nombre où n n’apparaît plus, l’écart vaut ${fr(U.constante)} à TOUS les rangs. La suite est donc arithmétique, de raison ${fr(U.constante)}.`}
            explainWrong="Ce n’est ni l’écriture ni la longueur qui font une preuve. C’est le fait que la lettre n n’ait jamais été remplacée : ce qu’on a établi vaut donc pour n’importe quel rang, y compris ceux qu’on n’a pas essayés."
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <KnowledgeBrick
              id="methode-demontrer-arithmetique"
              variant="new"
              lead={<>La démarche complète, dans l’ordre où tu viens de la faire.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'L’autre preuve : par le rapport',
      subtitle:
        'Sur v(n) = 4 × 3ⁿ, l’écart n’est pas constant. Vérifie-le sur quelques rangs, puis regarde le rapport.',
      done: done3,
      content: () => (
        <div className="space-y-3">
          <AtelierPreuve
            formule={V.formule}
            f={V.f}
            rang={rang1}
            vus={vus1}
            rangMax={5}
            onChangeRang={setRang1}
            disabled={!done2}
            outilParDefaut="rapport"
          />
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
            <div className="text-[13px] font-semibold text-emerald-900">Avec la lettre</div>
            <p className="mt-1.5 font-mono text-sm text-slate-800">{V.calcul}</p>
          </div>
          <NumericQuestion
            prompt={<>Quelle est la raison de cette suite géométrique ?</>}
            expected={V.constante}
            parse={parseNombre}
            display={fr(V.constante)}
            requires={['suite-geometrique', 'methode-demontrer-arithmetique']}
            explain={`Le 4 se simplifie et 3ⁿ⁺¹ ÷ 3ⁿ = 3 : le rapport vaut ${fr(V.constante)} pour tout rang n. La suite est géométrique de raison ${fr(V.constante)}.`}
            explainFor={(n) =>
              n === V.f(0)
                ? `${fr(V.f(0))} est le premier terme v(0), pas la raison.`
                : n === ecartFormule(V.f, 0)
                ? `${fr(ecartFormule(V.f, 0))} est l’ÉCART entre les deux premiers termes — et cet écart, lui, n’est pas constant : au rang 1 il vaut déjà ${fr(ecartFormule(V.f, 1))}.`
                : null
            }
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <>
              <Feedback tone="ok">
                Deux preuves, deux outils : la soustraction pour l’une des familles, la division
                pour l’autre. Dans les deux cas, le résultat doit ne plus contenir n.
              </Feedback>
              <KnowledgeBrick
                id="methode-demontrer-geometrique"
                variant="new"
                lead={<>La démarche par le rapport, à côté de sa jumelle.</>}
              />
              <KnowledgeBrick
                id="mem-ecart-ou-rapport"
                variant="new"
                lead={<>Et les deux, réunies sur une seule carte.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Choisir le bon outil',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="font-mono text-sm font-bold text-slate-900">{W.formule}</p>
            <p className="mt-1 font-mono text-[13px] text-slate-600">
              premiers termes : {[0, 1, 2, 3].map((n) => fr(W.f(n))).join(' · ')}
            </p>
          </div>
          <TapQuestion
            prompt={`Pour démontrer la nature de cette suite, quel calcul faut-il mener ?`}
            options={[
              `w(n+1) − w(n), et l’on trouve ${fr(W.constante)} : elle est arithmétique de raison ${fr(W.constante)}`,
              `w(n+1) ÷ w(n), et l’on trouve ${fr(W.constante)}`,
              'w(n) − w(0), pour mesurer depuis le début',
              'Les deux calculs donnent la même chose ici',
            ]}
            correct={0}
            cols={1}
            requires={['mem-ecart-ou-rapport', 'methode-demontrer-arithmetique', 'methode-demontrer-geometrique']}
            explain={`${W.calcul}. L’écart vaut ${fr(W.constante)} pour tout n : la suite est arithmétique de raison ${fr(W.constante)}. Une raison négative reste une raison — et la suite descend.`}
            explainWrong={`Le rapport, lui, n’est pas constant : ${fr(W.f(1))} ÷ ${fr(W.f(0))} n’est pas égal à ${fr(W.f(2))} ÷ ${fr(W.f(1))}. Et w(n) − w(0) mesure depuis le premier terme, pas d’un terme au suivant : ce n’est pas ce que demande la définition.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              Le réflexe : une formule où le rang apparaît en <strong>facteur</strong> (5n, −4n)
              appelle l’écart ; une formule où il apparaît en <strong>exposant</strong> (3ⁿ, 2ⁿ)
              appelle le rapport.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le démontrer, pas le deviner"
      moduleSubtitle="Une ligne de calcul littéral, et la propriété vaut pour tous les rangs"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Trois vérifications ne font pas une preuve',
        tone: 'indigo',
        body: (
          <p>
            Tu sais reconnaître une famille sur quelques termes. Reste à l’établir pour de bon :
            le même calcul, mené avec la lettre n, vaut d’un coup pour tous les rangs.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Et ensuite ?</strong> Une fois la nature démontrée, une question reste : cette
          suite monte-t-elle ou descend-elle ? Le signe de l’écart va y répondre.
        </KnowledgeSnapshot>
      }
    />
  );
}

/* ── L'atelier de preuve : un rang au cliquet, deux outils ──────────── */
function AtelierPreuve({ formule, f, rang, vus, rangMax, onChangeRang, disabled = false, outilParDefaut = 'ecart' }) {
  const [outil, setOutil] = useState(outilParDefaut);
  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 '
    + 'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const onglet = (actif) =>
    'min-h-[44px] px-3.5 py-2 rounded-xl border-2 text-sm font-bold disabled:opacity-40 '
    + 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 '
    + (actif ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50');

  const valeur = outil === 'ecart' ? ecartFormule(f, rang) : rapportFormule(f, rang);
  const constants = vus.length > 1
    && vus.every((v) => {
      const x = outil === 'ecart' ? ecartFormule(f, v) : rapportFormule(f, v);
      const y = outil === 'ecart' ? ecartFormule(f, vus[0]) : rapportFormule(f, vus[0]);
      return Number.isFinite(x) && Math.abs(x - y) < 1e-9;
    });

  return (
    <div className="space-y-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
      <div className="rounded-xl border border-emerald-200 bg-white p-2.5 text-center font-mono text-base font-black text-emerald-900">
        {formule}
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir l’outil de preuve">
        <button type="button" className={onglet(outil === 'ecart')} onClick={() => setOutil('ecart')} disabled={disabled}>
          u(n+1) − u(n)
        </button>
        <button type="button" className={onglet(outil === 'rapport')} onClick={() => setOutil('rapport')} disabled={disabled}>
          u(n+1) ÷ u(n)
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir le rang">
        <span className="text-[13px] text-slate-600">au rang n :</span>
        <button type="button" className={btn} onClick={() => onChangeRang(rang - 1)} disabled={disabled || rang <= 0} aria-label="Rang précédent">
          −
        </button>
        <span className="rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold tabular-nums text-white">
          n = {fr(rang)}
        </span>
        <button type="button" className={btn} onClick={() => onChangeRang(rang + 1)} disabled={disabled || rang >= rangMax} aria-label="Rang suivant">
          +
        </button>
      </div>

      <div className="rounded-xl border-2 border-emerald-300 bg-white p-3 text-center" aria-live="polite">
        <div className="font-mono text-sm text-slate-600">
          {fr(f(rang + 1))} {outil === 'ecart' ? '−' : '÷'} {fr(f(rang))}
        </div>
        <div className="font-mono text-2xl font-black tabular-nums text-emerald-900">
          {Number.isFinite(valeur) ? fr(Math.round(valeur * 10000) / 10000) : 'impossible'}
        </div>
      </div>

      {vus.length > 1 && (
        <div className={`rounded-xl border p-2.5 ${constants ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="mb-1.5 text-[13px] font-semibold text-slate-700">Rangs déjà essayés</div>
          <ul className="flex flex-wrap gap-1.5">
            {[...vus].sort((a, b) => a - b).map((v) => {
              const x = outil === 'ecart' ? ecartFormule(f, v) : rapportFormule(f, v);
              return (
                <li key={v} className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-mono text-[13px] tabular-nums">
                  n = {fr(v)} → <strong>{Number.isFinite(x) ? fr(Math.round(x * 10000) / 10000) : '—'}</strong>
                </li>
              );
            })}
          </ul>
          <p className="mt-1.5 text-[13px] text-slate-700">
            {constants
              ? 'Le même résultat à chaque rang essayé — mais seulement à ceux-là.'
              : 'Le résultat change d’un rang à l’autre : ce n’est pas le bon outil.'}
          </p>
        </div>
      )}
    </div>
  );
}
