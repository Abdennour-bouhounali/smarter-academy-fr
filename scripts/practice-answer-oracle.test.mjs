// L'ORACLE des réponses du banc d'exercices (4AM depuis l'audit d'intégrité du 2026-09-24 ; toutes les années du cycle moyen depuis le 2026-10-14).
//
// Les tests de l'évaluateur prouvent seulement qu'il accepte la clé
// CONFIGURÉE. Ce test prouve autre chose : que la clé configurée est la
// réponse MATHÉMATIQUEMENT juste. Chaque réponse attendue ci-dessous est
// RECALCULÉE ici, avec une arithmétique écrite dans ce fichier (pgcd par
// Euclide, liste de diviseurs par balayage, fractions réduites), jamais lue
// dans le contenu. Puis :
//   1. l'oracle doit être accepté par l'évaluateur réel (réponse juste acceptée) ;
//   2. la clé du contenu doit valoir l'oracle (clé juste) ;
//   3. pour les QCM, seul le choix de l'oracle est accepté.
//
// Une question du banc qui n'a pas d'entrée ici fait échouer le test : un
// nouvel exercice doit arriver avec sa vérification indépendante.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateAnswer, isSuccessOutcome } from '../packages/core/practice/answerEvaluator.js';
// Unité 3 « الحساب الحرفي » : un module d'oracle par leçon (écrits en parallèle, fusionnés ici).
import { ORACLE as ORACLE_NASHR } from './practice-oracle/nashr-tabsit.mjs';
import { ORACLE as ORACLE_MUTATABIQAT } from './practice-oracle/mutatabiqat-shahira.mjs';
import { ORACLE as ORACLE_TAHLIL } from './practice-oracle/tahlil-ibara.mjs';
import { ORACLE as ORACLE_WADIYA_HARFI } from './practice-oracle/wadiya-idmajiya-harfi.mjs';
// Unité 4 « معادلات ومتراجحات » : même principe, un module par leçon.
import { ORACLE as ORACLE_MUADALA } from './practice-oracle/muadala-ula.mjs';
import { ORACLE as ORACLE_JIDAA } from './practice-oracle/jidaa-maadum.mjs';
import { ORACLE as ORACLE_MUTARAJIHA } from './practice-oracle/mutarajiha-ula.mjs';
import { ORACLE as ORACLE_TARRID } from './practice-oracle/tarrid-mushkila.mjs';
import { ORACLE as ORACLE_WADIYA_MUADALAT } from './practice-oracle/wadiya-idmajiya-muadalat.mjs';
// Unité 5 « جمل معادلتين » : même principe ; les ثنائيات sont des `point` (P(x, y)).
import { ORACLE as ORACLE_MAFHUM_JUMLA } from './practice-oracle/mafhum-jumla.mjs';
import { ORACLE as ORACLE_HALL_JABRI } from './practice-oracle/hall-jabri.mjs';
import { ORACLE as ORACLE_MUSHKILAT_JUMLA } from './practice-oracle/mushkilat-jumla.mjs';
import { ORACLE as ORACLE_WADIYA_JUMAL } from './practice-oracle/wadiya-idmajiya-jumal.mjs';
// Unité 6 « الدالة الخطية والتناسبية » (2026-10-02).
import { ORACLE as ORACLE_TANASUB } from './practice-oracle/tanasub-muamil.mjs';
import { ORACLE as ORACLE_DALA } from './practice-oracle/dala-khattiya.mjs';
import { ORACLE as ORACLE_TAMTHIL } from './practice-oracle/tamthil-bayani-khatti.mjs';
import { ORACLE as ORACLE_TATBIQAT } from './practice-oracle/tatbiqat-tanasub.mjs';
import { ORACLE as ORACLE_TARRID_KHATTI } from './practice-oracle/tarrid-khatti.mjs';
import { ORACLE as ORACLE_WADIYA_KHATTIYA } from './practice-oracle/wadiya-idmajiya-khattiya.mjs';
// Unité 7 « الدالة التآلفية » (2026-10-02).
import { ORACLE as ORACLE_MAFHUM_TAALUFIYA } from './practice-oracle/mafhum-taalufiya.mjs';
import { ORACLE as ORACLE_TAMTHIL_TAALUFI } from './practice-oracle/tamthil-bayani-taalufi.mjs';
import { ORACLE as ORACLE_TAGHAYYURAT } from './practice-oracle/tanasub-taghayyurat.mjs';
import { ORACLE as ORACLE_TAFSIR_JUMLA } from './practice-oracle/tafsir-bayani-jumla.mjs';
import { ORACLE as ORACLE_TARRID_TAALUFI } from './practice-oracle/tarrid-taalufi.mjs';
import { ORACLE as ORACLE_WADIYA_TAALUFIYA } from './practice-oracle/wadiya-idmajiya-taalufiya.mjs';
// Unité 8 « الإحصاء » (2026-10-02).
import { ORACLE as ORACLE_TAKRAR_MUJAMMA } from './practice-oracle/takrar-mujamma.mjs';
import { ORACLE as ORACLE_MADA_WASIT } from './practice-oracle/mada-wasit-mutawassit.mjs';
import { ORACLE as ORACLE_MAJDULAT } from './practice-oracle/majdulat-ihsaiya.mjs';
import { ORACLE as ORACLE_QIRAAT_WADIYAT } from './practice-oracle/qiraat-wadiyat-ihsaiya.mjs';
import { ORACLE as ORACLE_WADIYA_IHSA } from './practice-oracle/wadiya-idmajiya-ihsa.mjs';
// Unité 9 « خاصية طالس »
import { ORACLE as ORACLE_TALIS_HISAB } from './practice-oracle/talis-hisab-atwal.mjs';
import { ORACLE as ORACLE_AKSIYA_TALIS } from './practice-oracle/aksiya-talis.mjs';
import { ORACLE as ORACLE_INSHAAT_TALIS } from './practice-oracle/inshaat-talis.mjs';
import { ORACLE as ORACLE_WADIYA_TALIS } from './practice-oracle/wadiya-idmajiya-talis.mjs';
import { ORACLE as ORACLE_NISAB_MUTH } from './practice-oracle/nisab-muthallathiya.mjs';
import { ORACLE as ORACLE_HASIBA_MUTH } from './practice-oracle/hasiba-muthallathiya.mjs';
import { ORACLE as ORACLE_ALAQAT_MUTH } from './practice-oracle/alaqat-muthallathiya.mjs';
import { ORACLE as ORACLE_TARRID_MUTH } from './practice-oracle/tarrid-muthallathiya.mjs';
import { ORACLE as ORACLE_WADIYA_MUTH } from './practice-oracle/wadiya-idmajiya-muthallathat.mjs';
import { ORACLE as ORACLE_INSIHAB_SHUAA } from './practice-oracle/insihab-shuaa.mjs';
import { ORACLE as ORACLE_SHUAAYN_MUT } from './practice-oracle/shuaayn-mutasawiyayn.mjs';
import { ORACLE as ORACLE_MAJMU_SHUAAYN } from './practice-oracle/majmu-shuaayn.mjs';
import { ORACLE as ORACLE_BARAHIN_ASHIA } from './practice-oracle/barahin-ashia.mjs';
import { ORACLE as ORACLE_WADIYA_ASHIA } from './practice-oracle/wadiya-idmajiya-ashia.mjs';
import { ORACLE as ORACLE_MURAKKIBATA } from './practice-oracle/murakkibata-shuaa.mjs';
import { ORACLE as ORACLE_HISAB_MURAKKIBATAY } from './practice-oracle/hisab-murakkibatay.mjs';
import { ORACLE as ORACLE_MUNTASAF_MASAFA } from './practice-oracle/muntasaf-masafa.mjs';
import { ORACLE as ORACLE_ITHBAT_KHAWAS } from './practice-oracle/ithbat-khawas-maalam.mjs';
import { ORACLE as ORACLE_WADIYA_MAALAM } from './practice-oracle/wadiya-idmajiya-maalam.mjs';
import { ORACLE as ORACLE_MAFHUM_DAWARAN } from './practice-oracle/mafhum-dawaran.mjs';
import { ORACLE as ORACLE_KHAWAS_DAWARAN } from './practice-oracle/khawas-dawaran.mjs';
import { ORACLE as ORACLE_ZAWIYA_MUHITIYA } from './practice-oracle/zawiya-muhitiya.mjs';
import { ORACLE as ORACLE_MUDALAAT_MUNTAZAMA } from './practice-oracle/mudalaat-muntazama.mjs';
import { ORACLE as ORACLE_WADIYA_DAWARAN } from './practice-oracle/wadiya-idmajiya-dawaran.mjs';
import { ORACLE as ORACLE_KURA_JULLA } from './practice-oracle/kura-julla.mjs';
import { ORACLE as ORACLE_MISAHA_HAJM } from './practice-oracle/misaha-hajm-kura.mjs';
import { ORACLE as ORACLE_MAQATI } from './practice-oracle/maqati-mustawiya.mjs';
import { ORACLE as ORACLE_TAKBIR } from './practice-oracle/takbir-tasghir.mjs';
import { ORACLE as ORACLE_WADIYA_FADA } from './practice-oracle/wadiya-idmajiya-fada.mjs';
// Prototype BEM (2026-10-06) : banc bahth-pgcd réécrit.
import { ORACLE as ORACLE_BAHTH } from './practice-oracle/bahth-pgcd.mjs';
// Déploiement BEM, unité 2 (2026-10-06) : un oracle par leçon (les anciennes entrées en ligne de l'unité 2 sont retirées).
import { ORACLE as ORACLE_BEM_JIDHR } from './practice-oracle/jidhr-tarbii.mjs';
import { ORACLE as ORACLE_BEM_AMALIYAT } from './practice-oracle/amaliyat-judhur.mjs';
import { ORACLE as ORACLE_BEM_TAWZIF } from './practice-oracle/tawzif-khawass-judhur.mjs';
import { ORACLE as ORACLE_BEM_NATIQA } from './practice-oracle/natiqa-ghayr-natiqa.mjs';
import { ORACLE as ORACLE_BEM_X_MURABBA } from './practice-oracle/muadalat-x-murabba.mjs';
import { ORACLE as ORACLE_BEM_WADIYA_JUDHUR } from './practice-oracle/wadiya-idmajiya-judhur.mjs';
// Unité 1, au format BEM, une leçon à la fois (2026-10-06).
import { ORACLE as ORACLE_BEM_QASIM } from './practice-oracle/qasim-adad-tabii.mjs';
import { ORACLE as ORACLE_BEM_QAWASIM_ADAD_TABII } from './practice-oracle/qawasim-adad-tabii.mjs';
import { ORACLE as ORACLE_BEM_KHAWASS_QAWASIM } from './practice-oracle/khawass-qawasim.mjs';
import { ORACLE as ORACLE_BEM_QASIM_MUSHTARAK_AKBAR } from './practice-oracle/qasim-mushtarak-akbar.mjs';
import { ORACLE as ORACLE_BEM_TAYIN_PGCD } from './practice-oracle/tayin-pgcd.mjs';
import { ORACLE as ORACLE_BEM_AWWALIYAN_FIMA_BAYNAHUMA } from './practice-oracle/awwaliyan-fima-baynahuma.mjs';
import { ORACLE as ORACLE_BEM_IKHTIZAL_KASR } from './practice-oracle/ikhtizal-kasr.mjs';
import { ORACLE as ORACLE_BEM_WADIYA_IDMAJIYA_AADAD } from './practice-oracle/wadiya-idmajiya-aadad.mjs';
import { ORACLE as ORACLE_BEM_TAKRAR_MUJAMMA } from './practice-oracle/takrar-mujamma.mjs';
import { ORACLE as ORACLE_BEM_MADA_WASIT_MUTAWASSIT } from './practice-oracle/mada-wasit-mutawassit.mjs';
import { ORACLE as ORACLE_BEM_MAJDULAT_IHSAIYA } from './practice-oracle/majdulat-ihsaiya.mjs';
import { ORACLE as ORACLE_BEM_QIRAAT_WADIYAT_IHSAIYA } from './practice-oracle/qiraat-wadiyat-ihsaiya.mjs';
import { ORACLE as ORACLE_BEM_WADIYA_IDMAJIYA_IHSA } from './practice-oracle/wadiya-idmajiya-ihsa.mjs';
import { ORACLE as ORACLE_BEM_TALIS_HISAB_ATWAL } from './practice-oracle/talis-hisab-atwal.mjs';
import { ORACLE as ORACLE_BEM_AKSIYA_TALIS } from './practice-oracle/aksiya-talis.mjs';
import { ORACLE as ORACLE_BEM_INSHAAT_TALIS } from './practice-oracle/inshaat-talis.mjs';
import { ORACLE as ORACLE_BEM_WADIYA_IDMAJIYA_TALIS } from './practice-oracle/wadiya-idmajiya-talis.mjs';
import { ORACLE as ORACLE_BEM_NISAB_MUTHALLATHIYA } from './practice-oracle/nisab-muthallathiya.mjs';
import { ORACLE as ORACLE_BEM_HASIBA_MUTHALLATHIYA } from './practice-oracle/hasiba-muthallathiya.mjs';
import { ORACLE as ORACLE_BEM_ALAQAT_MUTHALLATHIYA } from './practice-oracle/alaqat-muthallathiya.mjs';
import { ORACLE as ORACLE_BEM_TARRID_MUTHALLATHIYA } from './practice-oracle/tarrid-muthallathiya.mjs';
import { ORACLE as ORACLE_BEM_WADIYA_IDMAJIYA_MUTHALLATHAT } from './practice-oracle/wadiya-idmajiya-muthallathat.mjs';
// Cycle moyen, phase 3 (2026-10-14) : le premier banc 1AM–3AM (feuilles « على منوال اختبار الفصل »).
import { ORACLE as ORACLE_1AM_MANA_JAM_TARH } from './practice-oracle/mana-jam-tarh.mjs';
import { ORACLE as ORACLE_1AM_QISMA_IQLIDIYA_BAQI } from './practice-oracle/qisma-iqlidiya-baqi.mjs';
// Le premier banc 2AM (2026-10-14) : القسمة الإقليدية وحصر حاصل القسمة.
import { ORACLE as ORACLE_2AM_QISMA_IQLIDIYA_HASR } from './practice-oracle/qisma-iqlidiya-hasr.mjs';
import { ORACLE as ORACLE_2AM_KASR_HASIL_QISMA } from './practice-oracle/kasr-hasil-qisma.mjs';
import { ORACLE as ORACLE_2AM_JAM_TARH_KUSUR, audit as auditJamKusur } from './practice-oracle/jam-tarh-kusur.mjs';
import { ORACLE as ORACLE_2AM_JIDA_KASRAYN, audit as auditJidaKasrayn } from './practice-oracle/jida-kasrayn.mjs';
import { ORACLE as ORACLE_2AM_MUQARANA_KASRAYN, audit as auditMuqaranaKasrayn } from './practice-oracle/muqarana-kasrayn.mjs';
import { ORACLE as ORACLE_2AM_MUQARANA_NISBIYA } from './practice-oracle/muqarana-nisbiya.mjs';
import { ORACLE as ORACLE_2AM_TALIM_MUDARRAJ, audit as auditTalimMudarraj } from './practice-oracle/talim-mustaqim-mudarraj-2.mjs';
import { ORACLE as ORACLE_2AM_TALIM_NUQTA, audit as auditTalimNuqta } from './practice-oracle/talim-nuqta-mustawi.mjs';
import { ORACLE as ORACLE_2AM_JAM_TARH_NISBIYA, audit as auditJamTarhNisbiya } from './practice-oracle/jam-tarh-nisbiya.mjs';
import { ORACLE as ORACLE_2AM_MAJMU_JABRI, audit as auditMajmuJabri } from './practice-oracle/majmu-jabri.mjs';
import { ORACLE as ORACLE_2AM_MASAFA_NUQTATAYN, audit as auditMasafaNuqtatayn } from './practice-oracle/masafa-nuqtatayn.mjs';
import { ORACLE as ORACLE_2AM_RABI_MUTANASIB } from './practice-oracle/rabi-mutanasib.mjs';
import { ORACLE as ORACLE_2AM_SILSILA, audit as auditSilsila } from './practice-oracle/silsila-bidun-aqwas.mjs';
import { ORACLE as ORACLE_2AM_SILSILA_AQWAS, audit as auditSilsilaAqwas } from './practice-oracle/silsila-bi-aqwas.mjs';
import { ORACLE as ORACLE_2AM_WASF_SILSILA, audit as auditWasfSilsila } from './practice-oracle/wasf-silsila-hisab.mjs';
import { ORACLE as ORACLE_2AM_TAWZI, audit as auditTawzi } from './practice-oracle/tawzi-darb-jam-tarh.mjs';
import { ORACLE as ORACLE_2AM_IBARA_INTAJ, audit as auditIbaraIntaj } from './practice-oracle/ibara-harfiya-intaj.mjs';
import { ORACLE as ORACLE_2AM_HALL_MUSHKIL, audit as auditHallMushkil } from './practice-oracle/hall-mushkil-muadala.mjs';
import { ORACLE as ORACLE_2AM_IKHTIBAR, audit as auditIkhtibar } from './practice-oracle/ikhtibar-musawat-mutabayina.mjs';
import { ORACLE as ORACLE_2AM_WADIYA_MUADALA, audit as auditWadiyaMuadala } from './practice-oracle/wadiya-idmajiya-mafhum-muadala.mjs';
import { ORACLE as ORACLE_2AM_WADIYA_KUSUR_AMALIYAT, audit as auditWadiyaKusurAmaliyat } from './practice-oracle/wadiya-idmajiya-kusur-amaliyat.mjs';
import { ORACLE as ORACLE_2AM_WADIYA_ADAD_NISBIYA, audit as auditWadiyaAdadNisbiya } from './practice-oracle/wadiya-idmajiya-adad-nisbiya-2.mjs';
import { ORACLE as ORACLE_2AM_WADIYA_AMALIYAT, audit as auditWadiyaAmaliyat } from './practice-oracle/wadiya-idmajiya-amaliyat-tabiiya-ushriya.mjs';
import { ORACLE as ORACLE_1AM_IKHTIZAL_KITABA_KASRIYA } from './practice-oracle/ikhtizal-kitaba-kasriya.mjs';
import { ORACLE as ORACLE_1AM_QAWAID_QABILIYAT_QISMA } from './practice-oracle/qawaid-qabiliyat-qisma.mjs';
import { ORACLE as ORACLE_1AM_KITABAT_ADAD_TABII } from './practice-oracle/kitabat-adad-tabii.mjs';
import { ORACLE as ORACLE_1AM_HASIL_QISMA_KASR } from './practice-oracle/hasil-qisma-kasr.mjs';
import { ORACLE as ORACLE_1AM_KUSUR_ASHRIYA_KITABA } from './practice-oracle/kusur-ashriya-kitaba.mjs';
import { ORACLE as ORACLE_1AM_MUQARANAT_ADAD_ASHRIYA } from './practice-oracle/muqaranat-adad-ashriya.mjs';
import { ORACLE as ORACLE_1AM_ADAD_ASHRI_MUSTAQIM, audit as auditAdadAshriMustaqim } from './practice-oracle/adad-ashri-mustaqim-mudarraj.mjs';
import { ORACLE as ORACLE_1AM_ADAD_NISBIYA_SIYAQAT, audit as auditAdadNisbiyaSiyaqat } from './practice-oracle/adad-nisbiya-siyaqat.mjs';
import { ORACLE as ORACLE_1AM_BAHTH_ADAD_NAQISA, audit as auditBahthAdadNaqisa } from './practice-oracle/bahth-adad-naqisa.mjs';
import { ORACLE as ORACLE_1AM_TALIM_MUSTAQIM, audit as auditTalimMustaqim } from './practice-oracle/talim-mustaqim-mudarraj.mjs';
import { ORACLE as ORACLE_1AM_TALIM_FI_MUSTAWI, audit as auditTalimFiMustawi } from './practice-oracle/talim-fi-mustawi.mjs';
import { ORACLE as ORACLE_1AM_TATBIQ_QAIDA, audit as auditTatbiqQaida } from './practice-oracle/tatbiq-qaida-harfiya.mjs';
import { ORACLE as ORACLE_1AM_MASAHAT_MUHIT_SATH } from './practice-oracle/masahat-muhit-sath.mjs';
import { ORACLE as ORACLE_3AM_TABSIT_HADHF_AQWAS } from './practice-oracle/tabsit-hadhf-aqwas.mjs';
import { ORACLE as ORACLE_3AM_KHASSIYAT_FITAGHURAS } from './practice-oracle/khassiyat-fitaghuras.mjs';
import { ORACLE as ORACLE_3AM_QUWAT_ADAD_NISBI } from './practice-oracle/quwat-adad-nisbi.mjs';
import { ORACLE as ORACLE_3AM_MUSAWIYAT_AMALIYAT } from './practice-oracle/musawiyat-amaliyat.mjs';
import { ORACLE as ORACLE_3AM_MUADALAT_DARAJAT_ULA } from './practice-oracle/muadalat-darajat-ula.mjs';
import { ORACLE as ORACLE_3AM_NASHR_JABRI } from './practice-oracle/nashr-jabri-3am.mjs';
import { ORACLE as ORACLE_3AM_NISBA_MIAWIYA_3AM } from './practice-oracle/nisba-miawiya-3am.mjs';
import { ORACLE as ORACLE_3AM_TANASUB_TAMTHIL_BAYANI } from './practice-oracle/tanasub-tamthil-bayani.mjs';
import { ORACLE as ORACLE_3AM_MAQLUB_QISMAT_KASRAYN, audit as auditMaqlub } from './practice-oracle/maqlub-qismat-kasrayn.mjs';
import { ORACLE as ORACLE_3AM_JIDAA_ADADAYN } from './practice-oracle/jidaa-adadayn-nisbiyayn.mjs';
import { ORACLE as ORACLE_3AM_JIDAA_IDA } from './practice-oracle/jidaa-ida-nisbiya.mjs';
import { ORACLE as ORACLE_3AM_TASAWI_MUQARANAT_KASRAYN, audit as auditTasawi } from './practice-oracle/tasawi-muqaranat-kasrayn.mjs';
import { ORACLE as ORACLE_3AM_JAM_TARH_KASRAYN, audit as auditJamTarh } from './practice-oracle/jam-tarh-kasrayn.mjs';
import { ORACLE as ORACLE_3AM_QISMAT_NISBIYAYN, audit as auditQismat } from './practice-oracle/qismat-nisbiyayn.mjs';
import { ORACLE as ORACLE_3AM_ADAD_NATIQ, audit as auditAdadNatiq } from './practice-oracle/adad-natiq.mjs';
import { ORACLE as ORACLE_3AM_WADIYA_NISBIYA, audit as auditWadiyaNisbiya } from './practice-oracle/wadiya-idmajiya-aadad-nisbiya.mjs';
import { ORACLE as ORACLE_3AM_AMALIYAT_NATIQA, audit as auditAmaliyatNatiqa } from './practice-oracle/amaliyat-natiqa.mjs';
import { ORACLE as ORACLE_3AM_WADIYA_KUSUR, audit as auditWadiyaKusur } from './practice-oracle/wadiya-idmajiya-kusur-natiqa.mjs';

import { ORACLE as ORACLE_3AM_QIMAT, audit as auditQimat } from './practice-oracle/qimat-ibara-harfiya.mjs';
import { ORACLE as ORACLE_3AM_MUQARANAT, audit as auditMuqaranat } from './practice-oracle/muqaranat-natiqayn.mjs';
import { ORACLE as ORACLE_3AM_WADIYA_HARFIYA, audit as auditWadiyaHarfiya } from './practice-oracle/wadiya-idmajiya-ibarat-harfiya-3.mjs';
import { ORACLE as ORACLE_3AM_QUWA_ASHARA, audit as auditQuwaAshara } from './practice-oracle/quwa-adad-ashara.mjs';
import { ORACLE as ORACLE_3AM_QAWAID_ASHARA, audit as auditQawaidAshara } from './practice-oracle/qawaid-quwa-ashara.mjs';
import { ORACLE as ORACLE_3AM_KITABA_ILMIYA, audit as auditKitabaIlmiya } from './practice-oracle/kitaba-ilmiya-rutba.mjs';
import { ORACLE as ORACLE_3AM_WADIYA_QUWA, audit as auditWadiyaQuwa } from './practice-oracle/wadiya-idmajiya-quwa-nisbiya.mjs';
import { ORACLE as ORACLE_3AM_WADIYA_MUSAWIYAT, audit as auditWadiyaMusawiyat } from './practice-oracle/wadiya-idmajiya-musawiyat-mutabayinat.mjs';
import { ORACLE as ORACLE_3AM_MUTABAYINAT } from './practice-oracle/mutabayinat-amaliyat.mjs';
import { ORACLE as ORACLE_3AM_HASR, audit as auditHasr } from './practice-oracle/hasr-adad-ushri.mjs';
// Toutes les années du cycle moyen (content/practice/<1am…4am>/<leçon>/level-N) : jusqu'au 2026-10-14 seul 4am
// existait et la racine y était codée en dur — un banc 1AM–3AM aurait échappé à l'oracle sans rien dire.
const practiceRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'content/practice');
const gradeRoots = readdirSync(practiceRoot).filter((g) => /^[1-4]am$/.test(g)).map((g) => join(practiceRoot, g));

/* ── Arithmétique indépendante ─────────────────────────────────────────── */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

/* ── L'oracle : item → réponse de l'élève qui DOIT être acceptée ────────── */
const C = (id) => ({ choiceId: id });

const ORACLE = {
  // awwaliyan-fima-baynahuma
  // ikhtizal-kasr
  // khawass-qawasim
  // Tous les pgcd(n + 19, n + 1) atteints — c'est ce que « يمكن أن تكون » demande.
  // qasim-adad-tabii
  // qasim-mushtarak-akbar
  // qawasim-adad-tabii
  // tayin-pgcd

  /* ── سلسلة التفوق رقم 01 (docs/sources/4am/unit1/worksheet-tafawwuq-01.json) ── */
  // تمرين 1
  // تمرين 2
  // تمرين 5 — 25 < a < 40 : un seul
  // تمرين 6 — deux solutions
  // تمرين 7 — PGCD(3a ; 6b) ≠ 1 pour tout couple premier entre eux (vérifié plus bas)
  // تمرين 8
  // تمرين 9
  // تمرين 10 — 240x = 320y
  // تمرين 11
  // تمرين 12 — E = 2175/1044 + 5/6 = a + b/c
  // تمرين 13
  // تمرين 14 (السؤال الأوّل فقط)
  // تمرين 15
  // الوضعيات 1–10 → أدمج تعلّماتي
  // poteaux / arbres : un coin = un poteau ⇒ la distance divise chaque côté ; clôture fermée ⇒ n = périmètre ÷ distance
  // Unité 2 « الحساب على الجذور » : oracles au format BEM dans scripts/practice-oracle/<leçon>.mjs (2026-10-06).
  ...ORACLE_NASHR,
  ...ORACLE_MUTATABIQAT,
  ...ORACLE_TAHLIL,
  ...ORACLE_WADIYA_HARFI,
  ...ORACLE_MUADALA,
  ...ORACLE_JIDAA,
  ...ORACLE_MUTARAJIHA,
  ...ORACLE_TARRID,
  ...ORACLE_WADIYA_MUADALAT,
  ...ORACLE_MAFHUM_JUMLA,
  ...ORACLE_HALL_JABRI,
  ...ORACLE_MUSHKILAT_JUMLA,
  ...ORACLE_WADIYA_JUMAL,
  ...ORACLE_TANASUB,
  ...ORACLE_DALA,
  ...ORACLE_TAMTHIL,
  ...ORACLE_TATBIQAT,
  ...ORACLE_TARRID_KHATTI,
  ...ORACLE_WADIYA_KHATTIYA,
  ...ORACLE_MAFHUM_TAALUFIYA,
  ...ORACLE_TAMTHIL_TAALUFI,
  ...ORACLE_TAGHAYYURAT,
  ...ORACLE_TAFSIR_JUMLA,
  ...ORACLE_TARRID_TAALUFI,
  ...ORACLE_WADIYA_TAALUFIYA,
  ...ORACLE_TAKRAR_MUJAMMA,
  ...ORACLE_MADA_WASIT,
  ...ORACLE_MAJDULAT,
  ...ORACLE_QIRAAT_WADIYAT,
  ...ORACLE_WADIYA_IHSA,
  ...ORACLE_TALIS_HISAB,
  ...ORACLE_AKSIYA_TALIS,
  ...ORACLE_INSHAAT_TALIS,
  ...ORACLE_WADIYA_TALIS,
  ...ORACLE_NISAB_MUTH,
  ...ORACLE_HASIBA_MUTH,
  ...ORACLE_ALAQAT_MUTH,
  ...ORACLE_TARRID_MUTH,
  ...ORACLE_WADIYA_MUTH,
  ...ORACLE_INSIHAB_SHUAA,
  ...ORACLE_SHUAAYN_MUT,
  ...ORACLE_MAJMU_SHUAAYN,
  ...ORACLE_BARAHIN_ASHIA,
  ...ORACLE_WADIYA_ASHIA,
  ...ORACLE_MURAKKIBATA,
  ...ORACLE_HISAB_MURAKKIBATAY,
  ...ORACLE_MUNTASAF_MASAFA,
  ...ORACLE_ITHBAT_KHAWAS,
  ...ORACLE_WADIYA_MAALAM,
  ...ORACLE_MAFHUM_DAWARAN,
  ...ORACLE_KHAWAS_DAWARAN,
  ...ORACLE_ZAWIYA_MUHITIYA,
  ...ORACLE_MUDALAAT_MUNTAZAMA,
  ...ORACLE_WADIYA_DAWARAN,
  ...ORACLE_KURA_JULLA,
  ...ORACLE_MISAHA_HAJM,
  ...ORACLE_MAQATI,
  ...ORACLE_TAKBIR,
  ...ORACLE_WADIYA_FADA,
  ...ORACLE_BAHTH,
  ...ORACLE_BEM_JIDHR,
  ...ORACLE_BEM_AMALIYAT,
  ...ORACLE_BEM_TAWZIF,
  ...ORACLE_BEM_NATIQA,
  ...ORACLE_BEM_X_MURABBA,
  ...ORACLE_BEM_WADIYA_JUDHUR,
  ...ORACLE_BEM_QASIM,
  ...ORACLE_BEM_QAWASIM_ADAD_TABII,
  ...ORACLE_BEM_KHAWASS_QAWASIM,
  ...ORACLE_BEM_QASIM_MUSHTARAK_AKBAR,
  ...ORACLE_BEM_TAYIN_PGCD,
  ...ORACLE_BEM_AWWALIYAN_FIMA_BAYNAHUMA,
  ...ORACLE_BEM_IKHTIZAL_KASR,
  ...ORACLE_BEM_WADIYA_IDMAJIYA_AADAD,
  ...ORACLE_BEM_TAKRAR_MUJAMMA,
  ...ORACLE_BEM_MADA_WASIT_MUTAWASSIT,
  ...ORACLE_BEM_MAJDULAT_IHSAIYA,
  ...ORACLE_BEM_QIRAAT_WADIYAT_IHSAIYA,
  ...ORACLE_BEM_WADIYA_IDMAJIYA_IHSA,
  ...ORACLE_BEM_TALIS_HISAB_ATWAL,
  ...ORACLE_BEM_AKSIYA_TALIS,
  ...ORACLE_BEM_INSHAAT_TALIS,
  ...ORACLE_BEM_WADIYA_IDMAJIYA_TALIS,
  ...ORACLE_BEM_NISAB_MUTHALLATHIYA,
  ...ORACLE_BEM_HASIBA_MUTHALLATHIYA,
  ...ORACLE_BEM_ALAQAT_MUTHALLATHIYA,
  ...ORACLE_BEM_TARRID_MUTHALLATHIYA,
  ...ORACLE_BEM_WADIYA_IDMAJIYA_MUTHALLATHAT,
  ...ORACLE_1AM_MANA_JAM_TARH,
  ...ORACLE_1AM_QISMA_IQLIDIYA_BAQI,
  ...ORACLE_2AM_QISMA_IQLIDIYA_HASR,
  ...ORACLE_2AM_KASR_HASIL_QISMA,
  ...ORACLE_2AM_JAM_TARH_KUSUR,
  ...ORACLE_2AM_JIDA_KASRAYN,
  ...ORACLE_2AM_MUQARANA_KASRAYN,
  ...ORACLE_2AM_MUQARANA_NISBIYA,
  ...ORACLE_2AM_TALIM_MUDARRAJ,
  ...ORACLE_2AM_TALIM_NUQTA,
  ...ORACLE_2AM_JAM_TARH_NISBIYA,
  ...ORACLE_2AM_MAJMU_JABRI,
  ...ORACLE_2AM_MASAFA_NUQTATAYN,
  ...ORACLE_2AM_RABI_MUTANASIB,
  ...ORACLE_2AM_SILSILA,
  ...ORACLE_2AM_SILSILA_AQWAS,
  ...ORACLE_2AM_WASF_SILSILA,
  ...ORACLE_2AM_TAWZI,
  ...ORACLE_2AM_IBARA_INTAJ,
  ...ORACLE_2AM_HALL_MUSHKIL,
  ...ORACLE_2AM_IKHTIBAR,
  ...ORACLE_2AM_WADIYA_MUADALA,
  ...ORACLE_2AM_WADIYA_KUSUR_AMALIYAT,
  ...ORACLE_2AM_WADIYA_ADAD_NISBIYA,
  ...ORACLE_2AM_WADIYA_AMALIYAT,
  ...ORACLE_1AM_IKHTIZAL_KITABA_KASRIYA,
  ...ORACLE_1AM_QAWAID_QABILIYAT_QISMA,
  ...ORACLE_1AM_KITABAT_ADAD_TABII,
  ...ORACLE_1AM_HASIL_QISMA_KASR,
  ...ORACLE_1AM_KUSUR_ASHRIYA_KITABA,
  ...ORACLE_1AM_MUQARANAT_ADAD_ASHRIYA,
  ...ORACLE_1AM_ADAD_ASHRI_MUSTAQIM,
  ...ORACLE_1AM_ADAD_NISBIYA_SIYAQAT,
  ...ORACLE_1AM_BAHTH_ADAD_NAQISA,
  ...ORACLE_1AM_TALIM_MUSTAQIM,
  ...ORACLE_1AM_TALIM_FI_MUSTAWI,
  ...ORACLE_1AM_TATBIQ_QAIDA,
  ...ORACLE_1AM_MASAHAT_MUHIT_SATH,
  ...ORACLE_3AM_TABSIT_HADHF_AQWAS,
  ...ORACLE_3AM_KHASSIYAT_FITAGHURAS,
  ...ORACLE_3AM_QUWAT_ADAD_NISBI,
  ...ORACLE_3AM_MUSAWIYAT_AMALIYAT,
  ...ORACLE_3AM_MUADALAT_DARAJAT_ULA,
  ...ORACLE_3AM_NASHR_JABRI,
  ...ORACLE_3AM_NISBA_MIAWIYA_3AM,
  ...ORACLE_3AM_TANASUB_TAMTHIL_BAYANI,
  ...ORACLE_3AM_MAQLUB_QISMAT_KASRAYN,
  ...ORACLE_3AM_JIDAA_ADADAYN,
  ...ORACLE_3AM_JIDAA_IDA,
  ...ORACLE_3AM_TASAWI_MUQARANAT_KASRAYN,
  ...ORACLE_3AM_JAM_TARH_KASRAYN,
  ...ORACLE_3AM_QISMAT_NISBIYAYN,
  ...ORACLE_3AM_ADAD_NATIQ,
  ...ORACLE_3AM_WADIYA_NISBIYA,
  ...ORACLE_3AM_QIMAT,
  ...ORACLE_3AM_MUQARANAT,
  ...ORACLE_3AM_WADIYA_HARFIYA,
  ...ORACLE_3AM_AMALIYAT_NATIQA,
  ...ORACLE_3AM_WADIYA_KUSUR,
  ...ORACLE_3AM_QUWA_ASHARA,
  ...ORACLE_3AM_QAWAID_ASHARA,
  ...ORACLE_3AM_KITABA_ILMIYA,
  ...ORACLE_3AM_WADIYA_QUWA,
  ...ORACLE_3AM_WADIYA_MUSAWIYAT,
  ...ORACLE_3AM_MUTABAYINAT,
  ...ORACLE_3AM_HASR,
};

/**
 * Le cas signalé : « 6 مضاعف للعدد 120 » confondu avec « 6 قاسم للعدد 120 ». Depuis la feuille
 * BEM (2026-10-06), le piège est une question fermée : l3-001 q3 « هل 6 مضاعف للعدد 120؟ » —
 * « 6 مضاعف لـ 120 » ⇔ 120 | 6, faux, alors que 6 | 120 est vrai : seul « لا » (B) est accepté.
 */
const divides = (d, n) => n % d === 0;
const REPORTED = { key: 'ex-4am-qasim-adad-tabii-l3-001:q3', isMultiple: divides(120, 6), isDivisor: divides(6, 120) };

/* ── Lecture du banc ───────────────────────────────────────────────────── */
function* questions() {
  for (const root of gradeRoots) for (const lesson of readdirSync(root)) {
    const ldir = join(root, lesson);
    if (!statSync(ldir).isDirectory()) continue;
    for (const lvl of readdirSync(ldir)) {
      for (const f of readdirSync(join(ldir, lvl))) {
        const ex = JSON.parse(readFileSync(join(ldir, lvl, f), 'utf8'));
        for (const q of ex.questions) yield { key: `${ex.id}:${q.id}`, q };
      }
    }
  }
}
const bank = [...questions()];

describe('oracle indépendant du banc 4AM — la clé est-elle la réponse juste ?', () => {
  it('سلسلة التفوق، تمرين 7 : 3a et 6b ne sont JAMAIS premiers entre eux quand a et b le sont', () => {
    for (let a = 1; a <= 80; a++) for (let b = 1; b <= 80; b++) {
      if (gcd(a, b) === 1) expect(gcd(3 * a, 6 * b)).not.toBe(1);
    }
  });

  it('سلسلة التفوق، تمرين 6 et 5 : les deux ambiguïtés de la feuille sont réelles', () => {
    // « جد العدد x » : deux valeurs vérifient les deux divisions
    expect(range(13, 488).filter((x) => 402 % x === 12 && 488 % x === 8)).toEqual([15, 30]);
    // « بين 25 و 40 » lu au sens large : trois valeurs ; au sens strict : une seule
    expect(range(25, 40).filter((a) => gcd(a, 15) === 5)).toEqual([25, 35, 40]);
  });

  it('مقلوب عدد وقسمة كسرين (3AM) : clés irréductibles réduites, QCM à une seule bonne option, distracteurs étiquetés MISC-MAQLUB-*', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-maqlub-qismat-kasrayn-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditMaqlub(own)).toEqual([]);
  });

  it('تساوي كسرين ومقارنتهما (3AM) : relecture LaTeX de chaque QCM (une seule option vraie, la marquée), clés réduites, distracteurs étiquetés MISC-TASAWI-*', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-tasawi-muqaranat-kasrayn-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditTasawi(own)).toEqual([]);
  });

  it('جمع وطرح كسرين (3AM) : relecture LaTeX de chaque QCM et de chaque « احسب » (une seule option vraie, la marquée), ppcm recalculé par force brute, clés réduites, distracteurs étiquetés MISC-JAMTARH-*', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-jam-tarh-kasrayn-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditJamTarh(own)).toEqual([]);
  });

  it('حاصل قسمة عددين نسبيين (3AM) : évaluateur exact propre (BigInt, priorités, ÷ et □ re-vérifiés par multiplication), arrondis recalculés, QCM à une seule bonne option, signatures et distracteurs = valeur exacte de l\'erreur MISC-QISMA-*', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-qismat-nisbiyayn-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditQismat(own)).toEqual([]);
  });

  it('العدد الناطق (3AM) : normalisation de chaque écriture (BigInt, pgcd propre), chaînes d\'ordre et intervalles relus en LaTeX, « décimal ? » par le test 2^i·5^j, valeurs approchées par défaut recalculées, QCM à une seule bonne option, signatures et distracteurs = MISC-NATIQ-*', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-adad-natiq-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditAdadNatiq(own)).toEqual([]);
  });

  it('أدمج تعلّماتي — الأعداد النسبية (3AM, synthèse) : évaluateur exact copié du banc frère (BigInt, priorités, puissance entière), □ résolu par linéarité et re-vérifié, triangle magique et décompositions de −30 par force brute, QCM à une seule bonne option, signatures et distracteurs = valeur exacte de l\'erreur MISC-* nommée', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-wadiya-idmajiya-aadad-nisbiya-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditWadiyaNisbiya(own)).toEqual([]);
  });

  it('العمليات على الأعداد الناطقة (3AM) : évaluateur de chaînes exact (BigInt, priorités, fraction composée, puissances, lettres) ; relecture LaTeX de chaque « احسب », مقلوب, « جد العدد x », « بيّن أنّ … عدد صحيح / طبيعي », QCM (une seule option vraie, la marquée), distracteurs étiquetés MISC-AMAL-* (SUMSIGN / PRODSIGN / RECIPSIGN = opposé de la clé, PRIORITY = lecture de gauche à droite)', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-amaliyat-natiqa-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditAmaliyatNatiqa(own)).toEqual([]);
  });

  it('أدمج تعلّماتي — العمليات على الكسور والأعداد الناطقة (3AM, synthèse) : évaluateur de chaînes importé du banc frère (BigInt, priorités, fraction composée), expressions retapées dont chaque littéral figure dans la feuille (ou est déclaré dérivé), formules A = … relues en LaTeX, QCM à une seule bonne option (valeur, expression, nom, « نعم / لا »), « le plus grand / le plus petit » recalculé, chaque signature et chaque distracteur = valeur EXACTE de l\'erreur MISC-* nommée (NOFLIP, REVERSED, ACROSS, PRIORITY, SYN-KUSUR-WHOLE = f × Tout au lieu de f × Reste, WRONGFRAC, TASAWI-NUMERATORS / DENOMS…)', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-wadiya-idmajiya-kusur-natiqa-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditWadiyaKusur(own)).toEqual([]);
  });

  it('قوى العدد 10 (3AM) : rationnels exacts BigInt propres à l\'oracle (aucun import de tenPowers.js), « n tel que valeur = 10^n » et « c × 10^n = valeur » uniques, écriture décimale exacte, comptages (zéros, rang du 1, zéros avant le 1, chiffres, termes du مفكوك) faits sur la chaîne décimale, QCM jugés option par option (exactement une affirmation vraie, la marquée), nombres de l\'énoncé et des options retrouvés dans l\'affirmation retapée, chaque signature ≠ clé et chaque distracteur FAUX porteur d\'un MISC-ASHARA-*', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-quwa-adad-ashara-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditQuwaAshara(own)).toEqual([]);
  });

  it('قواعد الحساب على قوى العدد 10 (3AM) : rationnels exacts BigInt propres à l\'oracle (aucun import de tenPowers.js), parseur de produits, quotients, puissances de puissances et k × 10^p, « n tel que valeur = 10^n » (ou b^n pour les étapes hors leçon) et « c × 10^n = valeur » uniques, coefficient et valeur décimale exacts, QCM jugés option par option (exactement une affirmation vraie, la marquée), nombres de l\'énoncé et des options retrouvés dans l\'affirmation retapée, chaque signature ≠ clé et chaque distracteur FAUX porteur d\'un MISC-QAWAID-*', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-qawaid-quwa-ashara-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditQawaidAshara(own)).toEqual([]);
  });

  it('الكتابة العلمية ورتبة القدر (3AM) : rationnels exacts BigInt propres à l\'oracle (aucun import de tenPowers.js), « n tel que 10^n ≤ v < 10^(n+1) » unique, a = v / 10^n dans [1, 10[, rang d\'ordre de grandeur a\' = a arrondi à l\'unité demi vers le haut avec le report a\' = 10 → 1 × 10^(n+1), « c × 10^n = valeur » unique, QCM jugés option par option (sci / br / ord / eq / cmp : exactement une affirmation vraie, la marquée), nombres de l\'énoncé et des options retrouvés dans l\'affirmation retapée, chaque signature ≠ clé (RAQAM = nombre de chiffres, BATR = troncature, QUWA = exposant suivant, recalculés) et chaque distracteur FAUX porteur d\'un MISC-ILMIYA-*', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-kitaba-ilmiya-rutba-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditKitabaIlmiya(own)).toEqual([]);
  });

  it('أدمج تعلّماتي — القوى ذات أسس نسبية صحيحة (3AM, synthèse) : rationnels exacts BigInt propres à l\'oracle (aucun import de tenPowers.js ni de powers.js), expressions retapées et leurs littéraux relus dans la feuille, « n tel que base^n = valeur » et « 1 ≤ a < 10 » uniques, rang de grandeur demi supérieur, QCM à une seule bonne option (encadrement lu sur les puissances de l\'option), signatures MISC-WQ-* recalculées', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-wadiya-idmajiya-quwa-nisbiya-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditWadiyaQuwa(own)).toEqual([]);
  });

  it('أدمج تعلّماتي — المساويات – المتباينات – المعادلات (3AM, synthèse) : rationnels exacts BigInt et formes affines propres à l\'oracle (aucun import de packages/core), expressions retapées et leurs littéraux relus dans la feuille, équations résolues en x, arrondi au demi supérieur et encadrements [lo, hi[ recalculés, QCM à une seule bonne option jugée option par option (sat, holds, eqsol, br, law sur grille, always / undecided), signatures MISC-* recalculées', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-wadiya-idmajiya-musawiyat-mutabayinat-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditWadiyaMusawiyat(own)).toEqual([]);
  });

  it('حساب قيمة عبارة حرفية (3AM) : évaluateur exact propre (BigInt, polynômes à plusieurs lettres, π), chaque signature = valeur de la mauvaise lecture, chaque « différent » par un témoin et chaque « égal » par l\'égalité des polynômes développés, QCM à une seule bonne option, énoncés relus, MISC-QIMA-*', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-qimat-ibara-harfiya-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditQimat(own)).toEqual([]);
  });

  it('مقارنة عددين ناطقين (3AM) : arithmétique exacte propre (BigInt, polynômes, π à 40 chiffres), chaque différence, valeur et coefficient recalculé, chaque QCM = UNE affirmation vraie (cmp, eq, sign, région A > B pour x > c sur 5 valeurs de chaque côté, implication sur une grille de couples (a, b), données indécidables, tous x), chaque distracteur FAUX et étiqueté MISC-MUQ-*, nombres de la formule relus dans le texte, signatures', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-muqaranat-natiqayn-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditMuqaranat(own)).toEqual([]);
  });

  it('أدمج تعلّماتي — الحساب الحرفي (3AM, synthèse) : évaluateur exact propre (BigInt, polynômes à plusieurs lettres, π à 40 chiffres), chaque clé recalculée (valeur, coefficient d\'un développement, coefficient de π, valeur approchée), chaque QCM « laquelle des relations > < = » ou « oui / non » décidé sur les deux valeurs exactes, chaque « égales ? » par l\'égalité des polynômes développés avec un témoin qui sépare, chaque preuve selfCheck vérifiée, valeurs des lettres relues dans les énoncés, formules affichées relues en LaTeX, signatures et distracteurs = valeur de l\'erreur MISC-SYN-HARF-* nommée', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-wadiya-idmajiya-ibarat-harfiya-3-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditWadiyaHarfiya(own)).toEqual([]);
  });

  it('حصر عدد عشري موجب (3AM) : rationnels exacts BigInt propres à l\'oracle (aucun import de decimals.js), floor / ceil / round demi supérieur recalculés, quotients par division euclidienne exacte, chaque QCM jugé option par option (une seule vraie, les distracteurs FAUX et étiquetés MISC-TADWIR-*), intervalles d\'arrondi reconstruits par balayage de grille, signatures recalculées par la formule de l\'erreur, écrans de calculatrice et faits des corrigés recalculés', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-3am-hasr-adad-ushri-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditHasr(own)).toEqual([]);
  });

  it('سلسلة عمليات دون أقواس (2AM) : évaluateur exact propre (BigInt, priorités, décimaux ; aucun import de chainOps.js), chaque « احسب » relu en LaTeX et recalculé, aucun intermédiaire négatif, chaque distracteur = la valeur de sa lecture fautive (ADDFIRST, MULFIRST, NOPRIORITY, RIGHTLEFT, PARTIAL), situations rejouées par un arbre de calcul, QCM à une seule option vraie, aucun crochet ni barre de fraction, 50 feuilles dont 7 sujets lus', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-silsila-bidun-aqwas-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditSilsila(own)).toEqual([]);
  });

  it('جمع وطرح كسرين (2AM) : rationnels exacts BigInt propres à l\'oracle (aucun import de packages/core), chaque clé recalculée depuis les nombres de l\'énoncé, LaTeX de chaque énoncé / option / ligne de corrigé relu : aucune opération sur deux dénominateurs dont l\'un ne divise pas l\'autre (cas de 3AM), chaque « احسب » réévalué, clés réduites, QCM à une seule option juste, signatures MISC-JAMKASR-* (ACROSS, NOSCALE, DENSUM, NATURAL) recalculées', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-jam-tarh-kusur-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditJamKusur(own)).toEqual([]);
  });

  it('جداء كسرين (2AM) : rationnels exacts BigInt propres à l\'oracle (aucun import de packages/core), chaque clé recalculée depuis les nombres de l\'énoncé (produits, « a/b de x », « du reste », aires, volumes, montants en دج), chaque signature MISC-JIDAKASR-* (SUMACROSS, DENSUM, CROSS, BOTHMUL, FLIP, HALFWAY, OFWHOLE, OFSPENT) recalculée et fausse, chaque QCM jugé option par option (une seule juste, chaque distracteur = la valeur de son erreur), aucune somme de dénominateurs non liés (cas de 3AM), ni division par une fraction, ni pourcentage', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-jida-kasrayn-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditJidaKasrayn(own)).toEqual([]);
  });

  it('مقارنة كسرين (2AM) : rationnels exacts BigInt propres à l\'oracle (aucun import de packages/core), chaque clé recalculée par produit en croix caché depuis les opérandes retapés (relations, plus grand / plus petit, ordres, « entre », « avant 1 / 2 », réécriture a/b = □/d, x entier, restes et montants), chaque paire du banc est un CAS 2AM (même dénominateur, même numérateur, un dénominateur multiple de l\'autre, ou de part et d\'autre de 1 — jamais un multiple commun quelconque), chaque option de QCM relue en LaTeX (une seule vraie), chaque signature MISC-MUQKASR-* (NUMONLY, BIGDEN, NOSCALE, GAP, ONEWRONG, REVERSED) recalculée depuis les opérandes et fausse', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-muqarana-kasrayn-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditMuqaranaKasrayn(own)).toEqual([]);
  });

  it('سلسلة عمليات تتضمّن أقواسا (2AM) : évaluateur exact propre (BigInt, ( ) [ ] et barres de fraction ; aucun import de chainOps.js), chaque clé recalculée, LaTeX de chaque énoncé / option / ligne de corrigé relu (\\dfrac, convention [ ( ) ], aucun intermédiaire négatif, aucune multiplication implicite aux niveaux 1–3), chaque QCM jugé option par option (une seule vraie), chaque distracteur = la lecture que nomme sa misconception (IGNORED, DROPOUTER, BARSPLIT, DROPBR, MISPLACED, ALLUSELESS, ALLNEEDED), chaque crochet « inutile » vérifié par retrait sur 40 jeux de valeurs, 50 feuilles dont 11 sujets lus', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-silsila-bi-aqwas-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditSilsilaAqwas(own)).toEqual([]);
  });

  it('وصف سلسلة حسابات (2AM) : parseur propre (BigInt, ( ) , position de chaque nœud ; la RACINE nomme la chaîne), chaque nom, chaque bloc (الحدّ الأول… / المقسوم / القاسم), chaque phrase écrite ici puis comparée à chainOps.describe et à une table écrite à la main (HAND), chaque clé recalculée, chaque QCM jugé option par option (une seule option juste), chaque distracteur = la lecture que nomme sa misconception reconstruite ici (FIRSTOP, FIRSTWRITTEN, PIECES, ORDERDIFF, NOBRACKET), aucun intermédiaire négatif, 50 feuilles dont 2 sujets lus sur l\'image du PDF', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-wasf-silsila-hisab-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditWasfSilsila(own)).toEqual([]);
  });
  it('توزيع الضرب على الجمع والطرح (2AM) : rationnels exacts BigInt et formes affines a·x + b propres à l\'oracle (aucun import de packages/core), parseur ASCII (4x = 4 × x, « ? » résolu par évaluation en 0 et 1), chaque clé recalculée et recoupée en flottant, chaque QCM jugé option par option avec des options CONSTRUITES ici (exp, lexp, fac1, yn, prop, name : une seule option juste), chaque distracteur = la lecture que nomme sa misconception reconstruite (FIRSTONLY, SIGNCHANGE, ADDK, FACTORMULT, FACTORWRONG, NOTATION), chaque $…$ relu (lisible, aucun intermédiaire négatif, chaînes du corrigé égales), 50 feuilles dont les sujets réellement lus, une partie de sujet jamais citée deux fois', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-tawzi-darb-jam-tarh-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditTawzi(own)).toEqual([]);
  });
  it('أدمج تعلّماتي — الكسور والعمليات عليها (2AM, synthèse) : évaluateur de chaînes importé du banc frère amaliyat-natiqa (BigInt, décimaux, « a/b » littéral), chaque clé recalculée depuis les nombres de l\'énoncé retapés (sommes, restes, produits, « a/b de x », « de ce qui reste », le tout depuis une fraction unitaire par multiplication, divisions euclidiennes, valeurs approchées par défaut / par excès par division longue — jamais arrondies —, aires et périmètres), chaque opérande dans la feuille ou clé d\'une question précédente, QCM jugés option par option (une seule vraie), chaque signature / option = la valeur EXACTE de l\'erreur MISC nommée (JAMKASR, JIDAKASR, MUQKASR, HASR, QARIBA, SYN-KASR2), corrigés relus en LaTeX, aucune somme de dénominateurs non emboîtés, aucune division par une fraction, aucun pourcentage', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-wadiya-idmajiya-kusur-amaliyat-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditWadiyaKusurAmaliyat(own)).toEqual([]);
  });
  it('أدمج تعلّماتي — العمليات على الأعداد الطبيعية والأعداد العشرية (2AM, synthèse) : évaluateur exact importé de silsila-bi-aqwas (BigInt, ( ) [ ] et barres de fraction), chaque clé recalculée, lectures fautives nommées (NOPRIORITY, ADDFIRST, MULFIRST, IGNORED, BARSPLIT, ROUNDUP, MAX), nom d\'une chaîne, QCM jugé option par option, 4 term_exam lus et 6 feuilles adaptées', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-wadiya-idmajiya-amaliyat-tabiiya-ushriya-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditWadiyaAmaliyat(own)).toEqual([]);
  });

  it('إنتاج عبارة حرفية واستعمالها (2AM) : rationnels exacts BigInt et polynômes à plusieurs lettres propres à l\'oracle (aucun import de packages/core), chaque valeur recalculée depuis l\'expression retapée de l\'énoncé (aucun intermédiaire négatif), chaque QCM de production / de simplification jugé option par option par égalité de polynômes (une seule option vraie), chaque distracteur = la recette de sa lecture nommée et FAUX (PERCELL, NOFIRST, POWER, ADDFOR, PRODSQUARE, SQUARE2, ADDPOWERS, MULTCOEF, ZEROSKIP, BRACKET ; signatures de valeur JUXTA / ADDFOR / SQUARE2 / PRODSQUARE recalculées), « نعم / لا » par comparaison exacte, LaTeX de chaque énoncé / option / indice / corrigé relu (chaînes d\'égalités vraies, lettres n x y a b c), provenance : 6 term_exam lus dont 2 du 3e trimestre, 36 modelled, 6 adaptés vérifiés dans l\'extraction', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-ibara-harfiya-intaj-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditIbaraIntaj(own)).toEqual([]);
  });
  it('الأعداد العشرية ونصف المستقيم المدرّج (1AM) : décimaux exacts BigInt (évaluateur de muqaranat-adad-ashriya, aucun import de packages/core), chaque abscisse w + t/p, chaque nombre de graduations, chaque extrapolation de suite et chaque encadrement recalculés depuis l\'énoncé retapé, une seule option juste par QCM, chaque signature différente de la clé', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-1am-adad-ashri-mustaqim-mudarraj-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditAdadAshriMustaqim(own)).toEqual([]);
  });
  it('الأعداد النسبية وسياقات استعمالها (1AM) : décimaux exacts BigInt propres à l\'oracle (aucun import de packages/core), chaque valeur relative d\'une situation (au-dessus +d, au-dessous −d), chaque distance, chaque opposé, chaque durée entre deux dates, chaque comptage de négatifs et chaque « plus petit » / « plus loin du zéro » recalculés depuis l\'énoncé retapé, chaque vrai-faux jugé, une seule option juste par QCM, chaque signature MISC-REL-* différente de la clé', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-1am-adad-nisbiya-siyaqat-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditAdadNisbiyaSiyaqat(own)).toEqual([]);
  });
  it('البحث عن أعداد ناقصة (1AM) : rationnels exacts BigInt propres à l\'oracle (aucun import de packages/core), chaque nombre manquant (somme : b − a ; différence : b + a ou a − b ; produit : b ÷ a, une fraction quand la division ne s\'arrête pas) recalculé depuis l\'énoncé retapé, chaque programme à plusieurs cartes remonté dans l\'ordre inverse, chaque égalité d\'un QCM rendue par l\'oracle, chaque substitution et chaque vrai-faux jugés, une seule option juste par QCM, chaque signature MISC-NAQISA-* différente de la clé et recalculée (SAMEOP, TRAPADD, REVSUB, MULAGAIN, DIVREV, ORDER)', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-1am-bahth-adad-naqisa-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditBahthAdadNaqisa(own)).toEqual([]);
  });
  it('التعليم على مستقيم مدرّج (1AM) : décimaux exacts BigInt propres à l\'oracle (aucun import de packages/core ni du labo), chaque abscisse recalculée par « unités + petites graduations » signée par le côté ou lue sur la figure (position vérifiée dans le fichier), chaque encadrement par la borne gauche ⌊x⌋, chaque symétrique par changement de signe, chaque origine cachée par les deux graduations écrites, chaque position en cm par x × unité, chaque unité maximale par le min des deux côtés, chaque QCM et vrai-faux jugé, une seule option juste, chaque signature MISC-TALIM1-* différente de la clé', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-1am-talim-mustaqim-mudarraj-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditTalimMustaqim(own)).toEqual([]);
  });
  it('التعليم في المستوي (1AM) : coordonnées en dixièmes exactes (BigInt) propres à l\'oracle (aucun import de packages/core ni du labo), chaque couple lu à l\'ordre (abscisse d\'abord), chaque lecture recalculée sur la figure (points relus dans le fichier), chaque symétrique par axe ou origine, chaque distance |coordonnée| (÷ valeur du centimètre exacte), chaque point décalé b + d, chaque quatrième sommet A + C − B (côtés parallèles aux axes vérifiés), chaque intersection (abscisse de la verticale, ordonnée de l\'horizontale, dans les deux segments), chaque QCM jugé option par option (une seule juste), chaque signature MISC-MUSTAWI-* (SWAP, SIGNX, SIGNY, SIGNBOTH, AXISSWAP, SWAPSAME, SYMMIX, SYMBOTH, NEGDIST, DISTSWAP, SCALEIGN, HIDDENOFFSET, SAMEMIX, NATSQUARE) recalculée depuis son erreur et jamais égale à la bonne réponse', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-1am-talim-fi-mustawi-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditTalimFiMustawi(own)).toEqual([]);
  });
  it('تطبيق قاعدة حرفية (1AM) : rationnels exacts BigInt et évaluateur à jetons (shunting-yard) propres à l\'oracle (aucun import de packages/core ni du labo), chaque valeur d\'une règle recalculée depuis la règle et les valeurs retapées (une lettre remplacée dans CHAQUE position, priorités : parenthèses, × ÷, + −), chaque lecture fautive recalculée (GLUED 2x → 23, ONCE, NOBR, LTR, PLUS 3x → 3+x, SWAP, NOCOMMA, NOSIGN), chaque écriture d\'un QCM jugée sur six jeux de valeurs, chaque contre-exemple (la seule option où les côtés diffèrent), chaque décision (la plus petite quantité, un montant suffisant, une déclaration réfutée par un témoin), une seule option juste par QCM, chaque signature MISC-TATBIQ-* différente de la clé et recalculée, الكفاءة de chaque question et étapes hors leçon (counted: false) relues', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-1am-tatbiq-qaida-harfiya-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditTatbiqQaida(own)).toEqual([]);
  });
  it('التعليم على مستقيم مدرّج (2AM) : décimaux exacts BigInt propres à l\'oracle (aucun import de packages/core), chaque abscisse recalculée par « nombre de graduations × valeur d\'une graduation » signé par le côté, chaque changement d\'origine par soustraction, chaque opposé par changement de signe, chaque « graduation convenable » vérifiée (toutes les abscisses sur une graduation ET à au plus 6 graduations de l\'origine, une seule option juste), chaque signature MISC-TALIM2-* (UNITIGNORED, SIGNSIDE, ADDSTEP, OPPSAME, RECIP, DIGITSWAP, TOOSMALL, TOOBIG, NEGDIST, ORIGINFIXED, ADDORIGIN) recalculée et fausse, chaque QCM jugé option par option', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-talim-mustaqim-mudarraj-2-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditTalimMudarraj(own)).toEqual([]);
  });
  it('تعليم نقطة في المستوي (2AM) : décimaux exacts BigInt propres à l\'oracle (aucun import de packages/core), chaque point lu sur la figure relu dans le fichier et comparé aux points retapés, chaque région par les signes, chaque nature de point (axe / origine / hors axes), chaque symétrique par rapport à UN axe (une seule coordonnée change de signe) et par rapport à l\'origine / à un point (2c − p, étapes counted: false), chaque 4e sommet de rectangle de côtés parallèles aux axes (X + Z − Y, parallélisme vérifié), chaque sommet de triangle rectangle à abscisse positive et de carré, chaque longueur COMPTÉE sur une ligne de grille (× valeur de l\'unité), chaque aire, coût, distance à un axe, changement d\'origine (p − o), nombre de graduations, unité de repère (toutes les coordonnées sur une graduation ET au plus 6 graduations), nature d\'un repère (perpendiculaire ET même unité), ordre des abscisses / ordonnées et nature d\'un quadrilatère recalculés, chaque QCM jugé option par option (une seule vraie), chaque signature / distracteur MISC-NUQTA2-* (SWAP, SIGNAXIS, SIGNLEFT, BOTHSIGNS, SYMMIX, ONAXIS, UNITIGNORED, ORIGINFIXED2, ADDORIGIN, NEGDIST, LENSUM, LENOFF, LENMAX, SCALEMISS, AREASUM, AREAPERIM, COSTADD, NOSCALE, FRAMESMALL, FRAMEBIG, WRONGSIDE, ORDERABS, ORDERDEC) recalculé depuis son erreur nommée et FAUX, coordonnées imprimées = coordonnées retapées (jamais la réponse d\'une lecture), الكفاءة de chaque question et une seule étape non comptée par feuille recalculées, provenance : 10 term_exam lus, 33 modelled, 7 adaptés', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-talim-nuqta-mustawi-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditTalimNuqta(own)).toEqual([]);
  });
  it('جمع وطرح عددين نسبيين (2AM) : centièmes BigInt propres à l\'oracle (aucun import de packages/core), chaque somme / différence de DEUX relatifs recalculée par la règle de la leçon (même signe : distances additionnées, signe commun ; signes différents : distances soustraites, signe du plus éloigné ; opposés : 0 ; a − b = a + (−b)) puis recoupée avec l\'addition directe, chaque « par combien a changé » = finale − initiale, chaque terme manquant résolu puis vérifié par substitution, pyramides recalculées étage par étage, couples (somme, différence) à un seul couple juste, QCM jugés option par option (une seule vraie), chaque signature / distracteur MISC-JAMNISB-* (SIGNLOST, SUBDIST, ADDDIST, SIGNFIRST, SUBNOFLIP, FLIPBOTH, ADDINSTEAD, REVERSED) recalculé depuis son erreur nommée et FAUX, الكفاءة de chaque question recalculée, étapes des leçons antérieures counted: false, texte relu (chiffres en îlots $…$, aucune fraction, aucun terme interdit), provenance : 7 term_exam lus et 50 feuilles', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-jam-tarh-nisbiya-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditJamTarhNisbiya(own)).toEqual([]);
  });
  it('حساب مجموع جبري (2AM) : centièmes BigInt et analyseur à pile propres à l\'oracle (aucun import de packages/core/arithmetic/relative.js ; ( ) et [ ] emboîtés, signe initial de la forme simplifiée), chaque chaîne recalculée de deux façons (évaluation de l\'arbre ET règle de la leçon : retrait → ajout de l\'opposé, positifs groupés, négatifs groupés, deux totaux additionnés ; un groupe est calculé AVANT d\'être soustrait, jamais en changeant les signes de l\'intérieur), QCM de valeur / d\'écriture en somme / de forme simplifiée / de signe / de cible / de carré magique / de rang jugés option par option (une seule vraie, jamais la première), chaque signature et chaque distracteur MISC-JABRI-* (NOTURN, TURNALL, SIMPLIFYSIGN, FIRSTSIGN, BRACKETDROP, ALLNEG) ou MISC-JAMNISB-* (ADDDIST, FLIPBOTH) recalculé depuis son erreur nommée et FAUX, الكفاءة de chaque étape comptée recalculée, étapes des leçons antérieures counted: false, corrigé relu (groupes d\'abord, chaque étape présente, jamais « نغيّر إشارات »), texte relu (chiffres en îlots $…$, aucune fraction, aucun terme interdit), provenance : term_exam lus (une partie de feuille par leçon) et 8 feuilles adaptées', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-majmu-jabri-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditMajmuJabri(own)).toEqual([]);
  });
  it('المسافة بين نقطتين على مستقيم مدرّج (2AM) : centièmes BigInt propres à l\'oracle (aucun import de packages/core), chaque distance = plus grande abscisse − plus petite (jamais négative, AB = BA), chaque paire de points à la distance d de M (M ± d), chaque milieu = plus petite abscisse + moitié de la distance (refusé s\'il exige 3 décimales, aucune formule (a+b)/2 dans le texte), chaque trajet (somme des tronçons), nombre de graduations (quotient exact), déduction de AB (somme ou différence selon la position de C), déplacement commun (distance inchangée), comparaisons de distances (extremum unique), étapes des leçons antérieures counted: false (ordre, différence de relatifs, opposé, coût), QCM jugés option par option (une seule vraie, jamais toujours la première), chaque signature / distracteur MISC-MASAFA2-* (SUBDIST, ADDSAME, NEGDIST, ONEANSWER, SIGNSWAP, HALFDIST, SUMNOHALF, ORDERSWAP) recalculé depuis son erreur nommée et FAUX, الكفاءة de chaque question, nombres imprimés = nombres retapés, texte relu (aucun renvoi au manuel, aucun terme interdit, unités et nombres signés dans $…$), provenance : 7 term_exam lus, 37 modelled, 6 adaptés', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-masafa-nuqtatayn-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditMasafaNuqtatayn(own)).toEqual([]);
  });
  it('حلّ مشكل باستعمال معادلة (2AM) : rationnels exacts BigInt propres à l\'oracle (aucun import de packages/core), chaque équation retapée de l\'énoncé résolue par annulation de la chaîne d\'opérations (dernière opération d\'abord, aucune étape négative) puis vérifiée par substitution, chaque QCM de valeur / d\'équation d\'histoire / d\'étape jugé option par option (une seule vraie), chaque distracteur et chaque signature = la recette de sa lecture nommée et FAUX (MULTDIV, FLIP, SUBFORM, ADDFORM, DIVDIVIDEND, RANK, UNDOFIRST, SWAP, ROLE), « نعم / لا » par comparaison exacte, LaTeX de chaque énoncé / option / corrigé relu (chiffres et unités dans des îlots $…$, aucun renvoi au manuel), provenance : 8 term_exam lus (2am-s2-72 / -50 ×2 / -73 / -75, 1am-s2-79, 2am-s3-25 ×2, une partie par feuille), 36 modelled, 6 adaptés vérifiés dans l\'extraction', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-hall-mushkil-muadala-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditHallMushkil(own)).toEqual([]);
  });
  it('اختبار صحة مساواة أو متباينة (2AM) : rationnels exacts BigInt propres à l\'oracle (aucun import de packages/core), chaque relation retapée de l\'énoncé évaluée membre à membre avec les valeurs données (signées, deux inconnues) et comparée par son opérateur, chaque « احسب قيمة » recalculé, chaque QCM de valeur / d\'ensemble de valeurs / de cas de situation jugé option par option (une seule vraie), égalité de deux expressions décidée par identité polynomiale sur 12 points avec contre-exemple unique ré-évalué, distributivité (une seule option identique), chaque distracteur et chaque signature = la recette de sa lecture nommée et FAUX (ONESIDE, SWAP, BOUNDARY, STRICT, ONEVALUE, MANYEX, JUXTA, SIGNSUB), LaTeX relu (chiffres et unités dans des îlots $…$, aucun renvoi au manuel, ni « معادلة » ni « حلّ »), provenance : 12 term_exam lus (une partie par feuille), 32 modelled, 6 adaptés vérifiés dans l\'extraction', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-ikhtibar-musawat-mutabayina-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditIkhtibar(own)).toEqual([]);
  });
  it('أدمج تعلّماتي — مفهوم معادلة (2AM, synthèse) : rationnels exacts BigInt et parseur ASCII propres à l\'oracle (aucun import de packages/core), chaque valeur / chaque équation (a·x = b, x ÷ a = b, a ÷ x = b, k·x ± c = d) recalculée depuis l\'énoncé retapé (annulation de la dernière opération, vérification par substitution), chaque relation TESTÉE à des valeurs données (jamais résolue : x des deux côtés reste hors périmètre), chaque QCM d\'expression jugé par identité de polynômes (une seule option vraie), chaque signature / distracteur = la recette de son erreur nommée et FAUX (SYN-MUAD2-FIXED, -ADDCOEF, -ROLE, -SIGN, IBARA2, MAJHUL, IKHTIBAR), la formule la moins chère recalculée (la lecture « prix de l\'unité seul » renverse le choix), LaTeX relu (îlots $…$, aucun renvoi au manuel, aucun négatif), provenance : 3 term_exam lus (2am-s2-52, 2am-s2-53, 2am-s2-56 ex 5), 45 modelled, 2 adaptés vérifiés dans l\'extraction', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-wadiya-idmajiya-mafhum-muadala-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditWadiyaMuadala(own)).toEqual([]);
  });

  it('أدمج تعلّماتي — الأعداد النسبية (2AM, synthèse) : centièmes BigInt et évaluateur par réduction des groupes propres à l\'oracle (aucun import de packages/core), chaque somme algébrique recalculée de deux façons (réduction des ( ) et [ ] puis chaîne plate, et somme des positifs + somme des négatifs), distances (la plus grande moins la plus petite), milieux (refusés à 3 décimales), changements (nouveau − ancien), lectures d\'abscisses (graduations × valeur), opposés, quatrième sommet d\'un rectangle, symétriques par rapport à un axe, points sur les axes, QCM jugés option par option (une seule vraie, jamais toujours la première : comparaisons, rangements, « نعم / لا », axes), chaque signature et chaque distracteur MISC-* (JAMNISB, JABRI, MASAFA2, MUQARANA-NISBIYA, TALIM2, NUQTA2) recalculé depuis son erreur nommée et FAUX, aire et prix (étapes antérieures counted: false), الكفاءة P1 de chaque étape, nombres imprimés = nombres retapés, texte relu (aucun renvoi au manuel, aucun terme interdit, lettres, unités et nombres signés dans $…$), provenance : 2 term_exam lus (2am-s2-62 et 2am-s2-71, exercice 5) et 48 modelled', () => {
    const own = bank.filter((b) => b.key.startsWith('ex-2am-wadiya-idmajiya-adad-nisbiya-2-'));
    expect(own.length).toBeGreaterThan(0);
    expect(auditWadiyaAdadNisbiya(own)).toEqual([]);
  });

  it('le cas signalé (6 | 120) : « 6 مضاعف للعدد 120 » est faux, seul « لا » est accepté', () => {
    const q = bank.find((b) => b.key === REPORTED.key).q;
    expect(REPORTED.isDivisor).toBe(true);
    expect(REPORTED.isMultiple).toBe(false);
    for (const id of ['A', 'B']) {
      expect(isSuccessOutcome(evaluateAnswer(C(id), q).outcome)).toBe(id === 'B');
    }
  });

  for (const { key, q } of bank) {
    if (q.answerType === 'selfCheck') continue; // « بيّن أن » : pas de clé, l'élève se note sur le corrigé type
    if (q.answerType === 'choice' || q.answerType === 'multiChoice') {
      if (!(key in ORACLE)) continue; // QCM conceptuels : vérifiés par l'audit, couverts par l'aller-retour du validateur
    }
    it(`${key} — la réponse mathématiquement juste est acceptée`, () => {
      expect(key in ORACLE, `aucune vérification indépendante pour ${key}`).toBe(true);
      const verdict = evaluateAnswer(ORACLE[key], q);
      expect(isSuccessOutcome(verdict.outcome), `${key} refuse ${JSON.stringify(ORACLE[key])} (${verdict.outcome})`).toBe(true);
      // Et la clé du contenu EST cette réponse (même valeur / même ensemble).
      if (q.answerType === 'rational') expect(evaluateAnswer({ value: String(q.expectedAnswer) }, { ...q, expectedAnswer: ORACLE[key].value }).isCorrect).toBe(true);
      if (q.answerType === 'integerSet') expect([...q.expectedAnswer].sort((a, b) => a - b).join(',')).toBe(ORACLE[key].value.split(', ').join(','));
      if (q.answerType === 'point') expect(evaluateAnswer({ x: String(q.expectedAnswer.x), y: String(q.expectedAnswer.y) }, { ...q, expectedAnswer: ORACLE[key] }).isCorrect).toBe(true);
      if (q.answerType === 'choice') {
        for (const c of q.choices) expect(isSuccessOutcome(evaluateAnswer(C(c.id), q).outcome)).toBe(c.id === ORACLE[key].choiceId);
      }
    });
  }
});
