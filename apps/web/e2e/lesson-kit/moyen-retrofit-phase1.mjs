// QA — rétrofit de la méthode (« le manuel est la référence, pas le script », 2026-10-15) sur les 5 leçons 1AM–2AM déjà générées.
//   QA_BASE=http://localhost:5173 QA_OUT=/tmp/qa-retrofit node apps/web/e2e/lesson-kit/moyen-retrofit-phase1.mjs
// Par leçon : aucune carte [data-module-brief] au-dessus du labo, le labo est le PREMIER bloc du module, la brique de la règle est
// ABSENTE avant la réponse, le LabCoach montre une bulle d'une phrase sur le premier geste (étape attendue), aucun débordement
// horizontal, aucun « $ » brut. Bureau 1280×800 seulement (owner, 2026-10-15 : pas de mobile).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.QA_BASE || process.env.KIT_BASE || 'http://localhost:5173';
const API = process.env.QA_API || 'http://localhost:8000/api/v1';
const OUT = process.env.QA_OUT || '/tmp/qa-retrofit';
mkdirSync(OUT, { recursive: true });
const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); console.log(`${ok ? '✓' : '✗'} ${label}`); };

const LESSONS = [
  { g: '1am', id: 'mana-jam-tarh', modules: [
    { slug: 'nashat', lab: '[data-story-bars]', step: 'handle', bricksHidden: ['ikhtiyar-amaliya'] },
    { slug: 'tariqa', lab: '[data-story-bars]', bricksHidden: ['tamthil-aqwas'] },
  ] },
  { g: '1am', id: 'qisma-iqlidiya-baqi', modules: [
    { slug: 'nashat', lab: '[data-division-jumps]', step: 'handle', bricksHidden: ['qisma-iqlidiya'] },
    { slug: 'maarif', lab: '[data-division-jumps]' },
  ] },
  { g: '1am', id: 'qawaid-qabiliyat-qisma', modules: [
    { slug: 'nashat', lab: '[data-digit-cards]', step: 'colouring', bricksHidden: ['qabiliya-2-5', 'qabiliya-3'] },
    { slug: 'maarif', bricksHidden: ['qabiliya-9', 'qabiliya-baqi'] },
  ] },
  { g: '2am', id: 'qisma-iqlidiya-hasr', modules: [
    { slug: 'nashat', lab: '[data-egg-trays]', step: 'frame', bricksHidden: ['hasr-hasil'] },
    { slug: 'maarif', bricksHidden: ['qiyam-muqarraba', 'qabiliya'] },
  ] },
  { g: '1am', id: 'ikhtizal-kitaba-kasriya', modules: [
    { slug: 'nashat', lab: '[data-fraction-knife]', step: 'knife', bricksHidden: ['kitabat-mutasawiya'] },
    { slug: 'maarif', bricksHidden: ['kasr-ashri', 'ikhtizal'] },
  ] },
  { g: '1am', id: 'kusur-ashriya-kitaba', modules: [
    { slug: 'nashat', lab: '[data-decimal-comma]', step: 'grab', bricksHidden: ['fasila-hajm', 'kasr-ashri', 'kitaba-bifasila'] },
    { slug: 'maarif', bricksHidden: ['mafkuk-ashri', 'asfar-ghayr-darurya'] },
    { slug: 'tariqa-ashara', lab: '[data-decimal-comma]', step: 'grab', bricksHidden: ['azaha-fasila'] },
  ] },
  { g: '1am', id: 'muqaranat-adad-ashriya', modules: [
    { slug: 'nashat', lab: '[data-ruler-compare]', step: 'ruler', bricksHidden: ['taqarun-rutab', 'itmam-asfar', 'tartib-silsila'] },
    { slug: 'maarif', bricksHidden: ['ramz-muqarana'] },
    { slug: 'tariqa', lab: '[data-ruler-compare]', step: 'ruler', bricksHidden: ['tariqat-muqarana'] },
  ] },
  { g: '1am', domain: 'handasa', id: 'masahat-muhit-sath', modules: [
    { slug: 'nashat', lab: '[data-tile-yard]', step: 'pick', bricksHidden: ['masaha-adad', 'mahit-hadd', 'naql-baqat-masaha'] },
    { slug: 'maarif', bricksHidden: ['thalath-hallat'] },
    { slug: 'tariqa', lab: '[data-tile-yard]', step: 'pick', bricksHidden: ['tariqat-rasf', 'wahdatan-adad'] },
  ] },
  // ── PHASE 2 — 4AM unité 1 « الأعداد الطبيعية والناطقة » (2026-10-15) ──
  { g: '4am', id: 'awwaliyan-fima-baynahuma', modules: [
    { slug: '17-wa-18', lab: '[data-manipulation="coprime-explorer"]', bricksHidden: ['awwaliyan-taarif', 'nafy-awwaliyan'] },
    { slug: 'maarif', lab: '[data-manipulation="coprime-explorer"]', bricksHidden: ['laysa-awwali', 'ithbat-awwaliyan'] },
  ] },
  { g: '4am', id: 'bahth-pgcd', modules: [
    { slug: 'al-furuq', lab: '[data-manipulation="pgcd-differences"]', bricksHidden: ['pgcd-farq', 'khwarizmiyat-al-furuq'] },
    { slug: 'khassiyatan', bricksHidden: ['pgcd-baqi'] },
    { slug: 'khwarizmiyat-iqlidus', lab: '[data-manipulation="euclidean-algorithm"]', bricksHidden: ['khwarizmiyat-iqlidus', 'ikhtiyar-al-tariqa'] },
  ] },
  { g: '4am', id: 'ikhtizal-kasr', modules: [
    { slug: 'samir', lab: '[data-manipulation="fraction-reduction"]', bricksHidden: ['ikhtizal', 'kasr-ghayr-qabil'] },
    { slug: 'maarif', lab: '[data-manipulation="fraction-reduction"]', bricksHidden: ['ikhtizal-bil-pgcd', 'tahaqquq-al-ikhtizal'] },
  ] },
  { g: '4am', id: 'khawass-qawasim', modules: [
    { slug: 'thalath-halat', lab: '[data-manipulation="divisor-properties"]', bricksHidden: ['qasim-mushtarak-rappel'] },
    { slug: 'khassiyatan', bricksHidden: ['khassiya-1', 'khassiya-2'] },
  ] },
  { g: '4am', id: 'qasim-adad-tabii', modules: [
    { slug: 'al-maktaba', lab: '[data-manipulation="team-builder"]', bricksHidden: ['qasim-baqi'] },
    { slug: 'maarif', lab: '[data-manipulation="divisor-explorer-books"]', bricksHidden: ['qasim-jidaa', 'siyagh-mutakafia', 'wahid-wa-nafsuh'] },
  ] },
  { g: '4am', id: 'qasim-mushtarak-akbar', modules: [
    { slug: 'baqat', lab: '[data-manipulation="common-divisors"]', bricksHidden: ['qawasim-mushtaraka', 'pgcd-taarif'] },
    { slug: 'maarif', lab: '[data-manipulation="common-divisors"]', bricksHidden: ['pgcd-taarif', 'pgcd-ramz', 'qawasim-al-pgcd'] },
  ] },
  { g: '4am', id: 'qawasim-adad-tabii', modules: [
    { slug: 'al-adad-60', lab: '[data-manipulation="factor-pairs"]', bricksHidden: ['jidaa-aamilayn'] },
    { slug: 'tariqa-105', lab: '[data-manipulation="factor-pairs"]', bricksHidden: ['tariqa-qawasim', 'qawaid-qisma'] },
  ] },
  { g: '4am', id: 'tayin-pgcd', modules: [
    { slug: '42-wa-60', lab: '[data-manipulation="common-divisors"]', bricksHidden: ['tayin-bil-hasr'] },
    { slug: 'nataij-mubashira', bricksHidden: ['nataij-mubashira', 'pgcd-idha-qasim'] },
  ] },
  // ── PHASE 2 — 4AM unités 2–14 (2026-10-15) ; `domain` = le dossier de ميدان dans l'URL, `keepBrief` = module de synthèse qui garde sa carte ──
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'amaliyat-judhur', modules: [
    { slug: 'nashat-jidaa', lab: '[data-manipulation="square-tiling"]', bricksHidden: ['jidaa-jidhrayn', 'qismat-jidhrayn'] },
    { slug: 'maarif', bricksHidden: ['jidhr-a2b'] },
  ] },
  // `jidhr-tarbii`: a v2 lesson since 2026-11-21, its module pages deleted (e2e/lessons/jidhr-tarbii.walk.mjs walks it)
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'tahlil-ibara', modules: [
    { slug: 'nashat', lab: '[data-manipulation="turf-factoring"]', bricksHidden: ['tahlil-taarif'] },
    { slug: 'maarif', lab: '[data-manipulation="turf-factoring"]', bricksHidden: ['tahlil-mutatabiqat', 'khassiya-tawziiya', 'tahlil-taarif'] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'wadiya-idmajiya-harfi', modules: [
    { slug: 'al-wadiya', lab: '[data-manipulation="pitch-expansion"]', bricksHidden: [] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'tawzif-khawass-judhur', modules: [
    { slug: 'nashat', lab: '[data-manipulation="square-tiling"]', bricksHidden: ['kitaba-a-jidhr-b'] },
    { slug: 'tabsit', bricksHidden: ['tabsit-tawzii'] },
    { slug: 'nisba', bricksHidden: ['naqt-maqam'] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'muadalat-x-murabba', modules: [
    { slug: 'nashat', lab: '[data-manipulation="square-fold"]', bricksHidden: ['murabba-mutaakisayn'] },
    { slug: 'maarif', lab: '[data-manipulation="square-fold"]', bricksHidden: ['murabba-mutaakisayn', 'hulul-x2-a'] },
  ] },
  // `natiqa-ghayr-natiqa`: a v2 lesson since 2026-11-21, its module pages deleted (e2e/lessons/natiqa-ghayr-natiqa.walk.mjs)
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'mutatabiqat-shahira', modules: [
    { slug: 'nashat-murabba', lab: '[data-manipulation="pitch-expansion"]', bricksHidden: ['murabba-majmu', 'murabba-farq', 'hisab-mutamaan'] },
    { slug: 'nashat-jidaa', lab: '[data-manipulation="pitch-expansion"]', bricksHidden: ['jidaa-majmu-farq'] },
    { slug: 'maarif', bricksHidden: ['mutatabiqa'] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'nashr-tabsit', modules: [
    { slug: 'nashat', lab: '[data-manipulation="pitch-expansion"]', bricksHidden: ['nashr-taarif', 'nashr-qawsayn'] },
    { slug: 'maarif', lab: '[data-manipulation="pitch-expansion"]', bricksHidden: ['tawziiya-nashr', 'nashr-qawsayn', 'tabsit'] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'hall-jabri', modules: [
    { slug: 'nashat', lab: '[data-manipulation="elimination-cards"]', bricksHidden: ['takhallus-majhul', 'hall-thunaiya'] },
    { slug: 'tarayiq', bricksHidden: ['tariqat-tawid', 'tariqat-jam', 'ikhtiyar-tariqa'] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'mafhum-jumla', modules: [
    { slug: 'nashat', lab: '[data-manipulation="pair-scoreboard"]', bricksHidden: ['jumla-nashat'] },
    { slug: 'maarif', bricksHidden: ['ikhtibar-thunaiya'] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'mushkilat-jumla', modules: [
    { slug: 'mathaf', lab: '[data-story-modeller]', bricksHidden: ['jumla-tarjama', 'khutuwat-hall'] },
    { slug: 'marahil', bricksHidden: ['tahaqquq-nas'] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'wadiya-idmajiya-jumal', modules: [
    { slug: 'al-wadiya', lab: '[data-story-modeller]', bricksHidden: ['tahdid-majahil', 'tarjamat-maalumat', 'ikhtiyar-tariqa', 'tahaqquq-tafsir', 'tariqat-wadiya'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'barahin-ashia', modules: [
    { slug: 'metro', lab: '[data-vector-chain]', bricksHidden: ['rabt-shal', 'taawid-musawi', 'mutaakisan-sifr', 'shakl-la-yubarhin'] },
    { slug: 'taraiq', bricksHidden: ['khatawat-burhan', 'tariqat-abdc', 'istintajat'] },
    { slug: 'inshaat', lab: '[data-vector-chain]', bricksHidden: ['insha-majmu', 'surat-daira'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'insihab-shuaa', modules: [
    { slug: 'nashat', lab: '[data-manipulation="translation-glide"]', bricksHidden: ['insihab-shuaa'] },
    { slug: 'maarif', bricksHidden: ['manha-ittijah', 'shuaa', 'tasawi-shuaayn'] },
    { slug: 'mutawazi', bricksHidden: ['mulahazat'] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'mutarajiha-ula', modules: [
    { slug: 'rasail-yunus', lab: '[data-manipulation="solution-ray"]', bricksHidden: ['mutarajiha', 'hal-mutarajiha'] },
    { slug: 'hal-mutarajiha', lab: '[data-manipulation="solution-ray"]', bricksHidden: ['tamthil-jadwal'] },
    { slug: 'maarif', bricksHidden: ['qawaid-ittijah'] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'tarrid-mushkila', modules: [
    { slug: 'sibaq', lab: '[data-manipulation="growth-race"]', bricksHidden: ['tarrid-namdhaja'] },
    { slug: 'tarayiq', bricksHidden: ['tarrid-tariqa', 'tarrid-mutarajiha', 'tahaqquq-waqi'] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'wadiya-idmajiya-muadalat', modules: [
    { slug: 'al-wadiya', lab: '[data-manipulation="growth-race"]', bricksHidden: [] },
  ] },
  { g: '4am', domain: 'handasa', id: 'majmu-shuaayn', modules: [
    { slug: 'tahaddi-anshita', lab: '[data-manipulation="vector-sum"]', bricksHidden: ['tarkib-insihabayn'] },
    { slug: 'maarif', bricksHidden: ['alaqat-shal', 'shuaa-maadum', 'mutaakisan', 'qaidat-mutawazi'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'shuaayn-mutasawiyayn', modules: [
    { slug: 'nashat', lab: '[data-manipulation="parallelogram-pin"]', bricksHidden: ['muntasaf-mushtarak'] },
    { slug: 'maarif', bricksHidden: ['muntasaf-shuaa'] },
    { slug: 'taraiq', lab: '[data-manipulation="parallelogram-pin"]', bricksHidden: ['surat-nuqta', 'ithbat-tasawi'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'wadiya-idmajiya-ashia', modules: [
    { slug: 'al-wadiya', lab: '[data-manipulation="bridge-path"]', bricksHidden: ['thabit-mutaghayyir', 'insihab-mamar', 'aqsar-masar', 'tariqat-wadiya'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'khawas-dawaran', modules: [
    { slug: 'waraqa', lab: '[data-manipulation="shape-turn"]', bricksHidden: ['thabat-dawaran'] },
    { slug: 'maarif', bricksHidden: ['khawas-dawaran', 'zawiya-sura'] },
    { slug: 'taraiq', lab: '[data-manipulation="shape-turn"]', bricksHidden: ['istimal-khawas', 'markaz-dawaran', 'surat-zawiya'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'mafhum-dawaran', modules: [
    { slug: 'anshita', lab: '[data-manipulation="rotation-dial"]', bricksHidden: ['dawaran-tajribi'] },
    { slug: 'maarif', bricksHidden: ['dawaran', 'ittijah', 'surat-nuqta', 'nisf-dawra'] },
    { slug: 'taraiq', bricksHidden: ['tariqat-nuqta', 'tariqat-qitaa', 'suwar-ashkal'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'mudalaat-muntazama', modules: [
    { slug: 'tahaddi', lab: '[data-polygon-forge]', bricksHidden: ['ruus-bidawaran', 'muthallath-120'] },
    { slug: 'maarif', bricksHidden: ['tarif-muntazam', 'daira-muhita', 'markaziya-360', 'surat-mudalla'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'zawiya-muhitiya', modules: [
    { slug: 'nashat', lab: '[data-manipulation="inscribed-angle"]', bricksHidden: ['tasmiya', 'alaqa-nashat'] },
    { slug: 'maarif', bricksHidden: ['tarif', 'khassiya-nisf', 'khassiya-tasawi'] },
    { slug: 'tariqa', bricksHidden: ['tariqa-qaws', 'qutr-qaima'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'wadiya-idmajiya-dawaran', modules: [
    { slug: 'al-wadiya', lab: '[data-manipulation="lamp-ring"]', bricksHidden: ['tawzi-dawaran', 'masafa-amudayn', 'qanun-masafa', 'tariqat-wadiya'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'muntasaf-masafa', modules: [
    { slug: 'mawid-gps', lab: '[data-manipulation="midpoint-distance"]', bricksHidden: ['muntasaf-murakkibat'] },
    { slug: 'hala-amma', bricksHidden: ['muntasaf-murakkibat'] },
    { slug: 'maarif', bricksHidden: ['ihdathiyata-muntasaf', 'masafa'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'murakkibata-shuaa', modules: [
    { slug: 'nashat', lab: '[data-manipulation="component-steps"]', bricksHidden: ['murakkibatan'] },
    { slug: 'maarif', bricksHidden: ['qiraa-bayaniya', 'murakkibata-om'] },
    { slug: 'taraiq', lab: '[data-manipulation="component-steps"]', bricksHidden: ['tamthil-shuaa'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'wadiya-idmajiya-maalam', modules: [
    { slug: 'al-wadiya', lab: '[data-manipulation="route-compare"]', bricksHidden: ['qiraat-masarayn', 'nisf-daira-markaz', 'tul-khatt-munkasir', 'muqaranat-masarayn', 'tariqat-wadiya'] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'jidaa-maadum', modules: [
    { slug: 'nashat', lab: '[data-manipulation="vanishing-pitch"]', bricksHidden: ['khassiya-jidaa-maadum'] },
    { slug: 'maarif', lab: '[data-manipulation="vanishing-pitch"]', bricksHidden: ['taarif-muadala-jidaa', 'hulul-muadala-jidaa'] },
  ] },
  { g: '4am', domain: 'ansab_al_aadad_wal_hisab', id: 'muadala-ula', modules: [
    { slug: 'nashat', lab: '[data-manipulation="equation-balance"]', bricksHidden: ['muadala-tarafayn'] },
    { slug: 'maarif', lab: '[data-manipulation="equation-balance"]', bricksHidden: ['hal-ax-b'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'hisab-murakkibatay', modules: [
    { slug: 'nashat', lab: '[data-manipulation="component-calc"]', bricksHidden: ['farq-ihdathiyat'] },
    { slug: 'maarif', bricksHidden: ['qanun-murakkibatayn', 'tasawi-murakkibat'] },
    { slug: 'taraiq', lab: '[data-manipulation="component-calc"]', bricksHidden: ['tahaqquq-tasawi', 'nuqta-majhula'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'ithbat-khawas-maalam', modules: [
    { slug: 'malab', lab: '[data-manipulation="shape-prover"]', bricksHidden: ['dalil-hisabi', 'qaim-fithaghuras', 'mutasawi-saqayn', 'adilla-kafiya'] },
    { slug: 'bil-hisab', bricksHidden: ['tabiat-muthallath', 'taamud', 'tabiat-rubai', 'intima-daira'] },
    { slug: 'taraiq', bricksHidden: ['tariqat-burhan', 'tariqat-majhul'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'kura-julla', modules: [
    { slug: 'nashat', lab: '[data-manipulation="sphere-probe"]', bricksHidden: ['kura-julla-nashat'] },
    { slug: 'maarif', bricksHidden: ['tarif-kura', 'tarif-julla', 'aqtar', 'tawlid', 'dawair'] },
    { slug: 'taraiq', bricksHidden: ['tamthil-kura', 'tamthil-nuqta', 'masafa-maalam'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'maqati-mustawiya', modules: [
    { slug: 'anshita', lab: '[data-manipulation="section-slicer"]', bricksHidden: ['maqta-tajribi'] },
    { slug: 'maarif', bricksHidden: ['maqta-kura', 'maqta-balata', 'maqta-ustuwana', 'maqta-haram'] },
    { slug: 'taraiq', bricksHidden: ['tariqat-nisf-qutr'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'misaha-hajm-kura', modules: [
    { slug: 'arkhimidis', lab: '[data-manipulation="orange-peel"]', bricksHidden: ['arkhimidis-misaha', 'arkhimidis-hajm'] },
    { slug: 'maarif', bricksHidden: ['misahat-kura', 'hajm-julla', 'qima-muqarraba'] },
    { slug: 'taraiq', bricksHidden: ['tariqa-hisab', 'tariqa-aksiya'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'takbir-tasghir', modules: [
    { slug: 'nashat', lab: '[data-manipulation="scale-blocks"]', bricksHidden: ['takbir-tajribi'] },
    { slug: 'maarif', bricksHidden: ['takbir-tarif', 'takbir-khassiya'] },
    { slug: 'taraiq', bricksHidden: ['tariqat-k', 'tariqat-judhur', 'tariqat-maqadir'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'wadiya-idmajiya-fada', modules: [
    { slug: 'al-wadiya', lab: '[data-manipulation="bucket-fill"]', bricksHidden: ['mukhrut-mukammal', 'hajm-mabtur', 'tariqat-wadiya-fada'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'nisab-muthallathiya', modules: [
    { slug: 'nashat', lab: '[data-manipulation="ramp-ratios"]', bricksHidden: ['cos-nashat', 'nisab-zawiya'] },
    { slug: 'maarif', bricksHidden: ['nisab-zawiya', 'jayb', 'thill', 'qiyam-madbuta'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'tarrid-muthallathiya', modules: [
    { slug: 'at-tahaddi', lab: '[data-manipulation="clinometer"]', bricksHidden: ['tarid-muthallath', 'ikhtiyar-nisba', 'majhul-maqam', 'zawiyat-nazar'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'wadiya-idmajiya-muthallathat', modules: [
    { slug: 'al-wadiya', lab: '[data-manipulation="clinometer"]', bricksHidden: ['talis-khatt-nazar', 'zawiya-bi-zill', 'mulaamat-natija', 'tariqat-wadiya'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'mada-wasit-mutawassit', modules: [
    { slug: 'nashat-3', lab: '[data-stat-balance]', bricksHidden: ['mutawassit-mutawazin', 'mada-nashat'] },
    { slug: 'nashat-4', lab: '[data-stat-balance]', bricksHidden: ['wasit', 'mada', 'markaz-fia', 'fia-wasitiya'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'majdulat-ihsaiya', modules: [
    { slug: 'majdul', lab: '[data-sheet-lab]', bricksHidden: ['manwal', 'hajz-hifz', 'khaliya-majal', 'dustur', 'dasatir-arbaa', 'iadat-hisab'] },
    { slug: 'maarif', bricksHidden: ['asmaa-dawal'] },
    { slug: 'adawat', bricksHidden: ['dhakira-hasiba'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'alaqat-muthallathiya', modules: [
    { slug: 'nashat-5', lab: '[data-manipulation="angle-compass"]', bricksHidden: ['takhmin-alaqat', 'burhan-alaqat'] },
    { slug: 'maarif', bricksHidden: ['alaqatan', 'kitabat-murabba', 'mithal-60'] },
    { slug: 'taraiq', lab: '[data-manipulation="angle-compass"]', bricksHidden: ['hisab-nisba', 'shart-imkan', 'insha-zawiya'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'hasiba-muthallathiya', modules: [
    { slug: 'nashat', lab: '[data-manipulation="trig-calculator"]', bricksHidden: ['hasiba-nisba', 'hasiba-zawiya'] },
    { slug: 'maarif', bricksHidden: ['barmaja-daraja', 'hasiba-zawiya', 'tadwir-dalaqa'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'mafhum-taalufiya', modules: [
    { slug: 'nashat', lab: '[data-manipulation="affine-meter"]', bricksHidden: ['dala-ujra'] },
    { slug: 'tamyiz', bricksHidden: ['muamilan', 'khattiya-taalufiya', 'thabita'] },
    { slug: 'maarif', bricksHidden: ['taarif-taalufiya', 'sura-taalufiya', 'sabiq-taalufiya', 'khattiya-taalufiya', 'thabita'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'tafsir-bayani-jumla', modules: [
    { slug: 'nashat', lab: '[data-manipulation="line-crossing"]', bricksHidden: ['tafsir-nashat'] },
    { slug: 'maarif', bricksHidden: ['muadala-mustaqim', 'hall-taqatu', 'hall-bayani', 'qiraa-taqribiya'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'tarrid-taalufi', modules: [
    { slug: 'ishtirak', lab: '[data-plan-compare]', bricksHidden: ['namdhaja-taalufiya', 'sura-fi-wadiya'] },
    { slug: 'mufadala', lab: '[data-plan-compare]', bricksHidden: ['tasawi-taqatu', 'sigha-afdal'] },
    { slug: 'tarayiq', bricksHidden: ['khutuwat-mufadala'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'wadiya-idmajiya-taalufiya', modules: [
    { slug: 'al-wadiya', lab: '[data-plan-compare]', keepBrief: true, bricksHidden: ['jumla-bayaniya', 'taklifa-taalufiya', 'min-thunaiyatayn', 'ikhtiyar-sigha', 'thalath-sigh', 'tafsir-natija', 'tariqat-wadiya'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'tamthil-bayani-taalufi', modules: [
    { slug: 'nashat', lab: '[data-manipulation="affine-line"]', bricksHidden: ['irtifa-b', 'tartib-mabda'] },
    { slug: 'maarif', bricksHidden: ['tamthil-taalufi', 'muamil-tawjih', 'rasm-taalufi'] },
    { slug: 'qiraa', lab: '[data-manipulation="affine-line"]', bricksHidden: ['qiraa-ab', 'qiraa-sura-taalufi'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'tanasub-taghayyurat', modules: [
    { slug: 'mudarrajat', lab: '[data-manipulation="slope-stairs"]', bricksHidden: [] },
    { slug: 'tayin', lab: '[data-manipulation="slope-stairs"]', bricksHidden: ['burhan-taghayyurat', 'hisab-muamil-a'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'qiraat-wadiyat-ihsaiya', modules: [
    { slug: 'tahaddi', lab: '[data-manipulation="group-tanks"]', bricksHidden: ['mutawassit-majmuat', 'silsila-kamila'] },
    { slug: 'aqra', bricksHidden: ['qiraat-mukhattat', 'tarjama-jadwal'] },
    { slug: 'uqarin', bricksHidden: ['hadhf-qiyam'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'takrar-mujamma', modules: [
    { slug: 'nashat', lab: '[data-manipulation="cumul-gate"]', bricksHidden: ['mujamma-nashat'] },
    { slug: 'taraiq', bricksHidden: ['hisab-mujamma', 'tawatur-fiat'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'wadiya-idmajiya-ihsa', modules: [
    { slug: 'al-wadiya', lab: '[data-manipulation="stat-balance"]', bricksHidden: ['qima-makhfiya-wasit'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'tatbiqat-tanasub', modules: [
    { slug: 'nashat-nisab', lab: '[data-manipulation="percent-tag"]', bricksHidden: ['ziyada-darb', 'dala-murfaqa', 'nisba-akhdh', 'takhfid-darb'] },
    { slug: 'maqadir-murakkaba', bricksHidden: ['miqdar-qisma', 'tahwil-murakkab'] },
    { slug: 'maarif-tarayiq', bricksHidden: ['tatabu-darb', 'miqdar-jida', 'miqdar-bidalala'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'wadiya-idmajiya-khattiya', modules: [
    { slug: 'al-wadiya', lab: '[data-manipulation="origin-line"]', keepBrief: true, bricksHidden: ['masafa-fithaghuras', 'mudda-sura', 'taklifa-khattiya', 'hadd-mizaniya', 'tariqat-wadiya'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'dala-khattiya', modules: [
    { slug: 'nashat', lab: '[data-manipulation="linear-machine"]', bricksHidden: ['dala-nashat'] },
    { slug: 'maarif', bricksHidden: ['dala-nashat', 'dala-khattiya', 'hisab-sura', 'jadwal-khattiya', 'tayin-dala'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'tamthil-bayani-khatti', modules: [
    { slug: 'nashat', lab: '[data-manipulation="origin-line"]', bricksHidden: ['tamthil-nashat'] },
    { slug: 'maarif', bricksHidden: ['tamthil-mustaqim', 'munha-mustaqim', 'rasm-tamthil', 'qiraa-bayaniya'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'aksiya-talis', modules: [
    { slug: 'nashat', lab: '[data-manipulation="parallel-level"]', bricksHidden: ['aksiya-nashat'] },
    { slug: 'maarif', bricksHidden: ['khassiya-aksiya', 'shart-tartib', 'nisbatan-mukhtalifatan'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'inshaat-talis', modules: [
    { slug: 'lafita', lab: '[data-manipulation="segment-divider"]', bricksHidden: ['taqsim-qitaa', 'tabrir-taqsim', 'tariqat-kitab-taqsim'] },
    { slug: 'taraiq', lab: '[data-manipulation="segment-divider"]', bricksHidden: ['nuqta-nisba', 'nuqtatan', 'insha-tul', 'tul-ghayr-natiq'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'talis-hisab-atwal', modules: [
    { slug: 'nashat', lab: '[data-manipulation="shadow-world"]', bricksHidden: ['talis-nashat'] },
    { slug: 'maarif', bricksHidden: ['khassiyat-talis', 'adam-tawazi', 'muamil-tanasub'] },
    { slug: 'taraiq', bricksHidden: ['hisab-atwal'] },
  ] },
  { g: '4am', domain: 'handasa', id: 'wadiya-idmajiya-talis', modules: [
    { slug: 'al-wadiya', lab: '[data-manipulation="shadow-world"]', bricksHidden: ['tariqat-zill', 'maqta-mihwari-talis', 'muadala-bud', 'mulaamat-natija', 'tariqat-wadiya'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'tanasub-muamil', modules: [
    { slug: 'rihla', lab: '[data-ratio-ride]', bricksHidden: ['jadwal-tanasub'] },
    { slug: 'maarif', bricksHidden: ['muamil-tanasub', 'khawass-tanasub', 'rabi-mutanasib', 'mablagh-thabit', 'y-ax'] },
  ] },
  { g: '4am', domain: 'tanasubiya_duwal', id: 'tarrid-khatti', modules: [
    { slug: 'tamthilat', lab: '[data-origin-line]', bricksHidden: ['tanasub-bayan', 'laysat-tanasub'] },
    { slug: 'tarayiq', bricksHidden: ['tamthilat-thalath', 'tafsir-siyaq'] },
  ] },
];

const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: 'qa-prof@smarter.dz', password: 'QaPass2026!' }) });
const d = await res.json().catch(() => ({}));
const token = d.token ?? d.access_token ?? d.data?.token;
if (!token) throw new Error('login qa-prof failed');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'ar' });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
await ctx.addInitScript((tk) => { try { localStorage.setItem('token', tk); localStorage.removeItem('sa.labCoach.story-bars.learned'); } catch { /* noop */ } }, token);

const ONLY = process.env.QA_LESSON;
for (const L of LESSONS.filter((x) => !ONLY || x.id === ONLY)) {
  for (const m of L.modules) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const tag = `${L.id}/${m.slug}`;
    await page.goto(`${BASE}/courses/moyen/${L.g}/${L.domain ?? 'ansab_al_aadad_wal_hisab'}/${L.id}/${m.slug}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2500);
    if (m.lab) {
      await page.waitForSelector(m.lab, { timeout: 30000 }).catch(() => {});
      check(await page.locator(m.lab).count() > 0, `${tag}: le labo est monté`);
      if (!m.keepBrief) check(await page.locator('[data-module-brief]').count() === 0, `${tag}: aucune carte au-dessus du labo`);
      const first = await page.evaluate((sel) => {
        const lab = document.querySelector(sel); const brief = document.querySelector('[data-module-brief]');
        const q = document.querySelector('[data-step-content], [data-module-step]');
        return { brief: !!brief, labTop: lab ? lab.getBoundingClientRect().top : null, qTop: q ? q.getBoundingClientRect().top : null };
      }, m.lab);
      check(first.qTop == null || first.labTop <= first.qTop, `${tag}: le labo précède la première question`);
    }
    for (const b of m.bricksHidden ?? []) {
      check(await page.locator(`[data-knowledge-brick="${b}"], [data-brick-id="${b}"]`).count() === 0, `${tag}: la brique « ${b} » est cachée avant la réponse`);
    }
    if (m.step) {
      const bub = page.locator('[data-lab-coach]').first();
      await bub.waitFor({ timeout: 15000 }).catch(() => {});
      check(await bub.count() > 0 && (await bub.getAttribute('data-step')) === m.step, `${tag}: la bulle du guide montre « ${m.step} »`);
    }
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(ov <= 1, `${tag}: aucun débordement horizontal`);
    check(errors.length === 0, `${tag}: aucune erreur de page ${errors[0] ?? ''}`);
    await page.screenshot({ path: `${OUT}/${L.id}-${m.slug}-top.png` });
    await page.screenshot({ path: `${OUT}/${L.id}-${m.slug}-full.png`, fullPage: true });
    await page.close();
  }
}
await browser.close();
console.log(failures.length ? `\n${failures.length} échec(s)` : '\n✅ rétrofit phase 1 — tout est vert');
process.exit(failures.length ? 1 : 0);
