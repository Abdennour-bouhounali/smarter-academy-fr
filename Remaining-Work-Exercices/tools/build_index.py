import json, collections
OUT = '/home/abdennour/websites/smarter-academy/smarter-academy-dz/docs/sources/4am/bem-practice/'
SOL = {2007:1,2008:5,2009:8,2010:12,2011:14,2012:17,2013:21,2014:25,2015:29,2016:32,2017:36,2018:40,2019:44,2020:48,2021:50,2022:53,2023:55,2024:58,2025:61,2026:63}
UNIT = {}
for u, ls in {
 1:'qasim-adad-tabii qawasim-adad-tabii khawass-qawasim qasim-mushtarak-akbar bahth-pgcd tayin-pgcd awwaliyan-fima-baynahuma ikhtizal-kasr wadiya-idmajiya-aadad',
 2:'jidhr-tarbii amaliyat-judhur tawzif-khawass-judhur natiqa-ghayr-natiqa muadalat-x-murabba wadiya-idmajiya-judhur',
 3:'nashr-tabsit mutatabiqat-shahira tahlil-ibara wadiya-idmajiya-harfi',
 4:'muadala-ula jidaa-maadum mutarajiha-ula tarrid-mushkila wadiya-idmajiya-muadalat',
 5:'mafhum-jumla hall-jabri mushkilat-jumla wadiya-idmajiya-jumal',
 6:'tanasub-muamil dala-khattiya tamthil-bayani-khatti tatbiqat-tanasub tarrid-khatti wadiya-idmajiya-khattiya',
 7:'mafhum-taalufiya tanasub-taghayyurat tamthil-bayani-taalufi tafsir-bayani-jumla tarrid-taalufi wadiya-idmajiya-taalufiya',
 8:'mada-wasit-mutawassit takrar-mujamma majdulat-ihsaiya qiraat-wadiyat-ihsaiya wadiya-idmajiya-ihsa',
 9:'talis-hisab-atwal aksiya-talis inshaat-talis wadiya-idmajiya-talis',
 10:'nisab-muthallathiya alaqat-muthallathiya hasiba-muthallathiya tarrid-muthallathiya wadiya-idmajiya-muthallathat',
 11:'insihab-shuaa shuaayn-mutasawiyayn majmu-shuaayn barahin-ashia wadiya-idmajiya-ashia',
 12:'murakkibata-shuaa hisab-murakkibatay muntasaf-masafa ithbat-khawas-maalam wadiya-idmajiya-maalam',
 13:'mafhum-dawaran khawas-dawaran zawiya-muhitiya mudalaat-muntazama wadiya-idmajiya-dawaran',
 14:'kura-julla maqati-mustawiya misaha-hajm-kura takbir-tasghir wadiya-idmajiya-fada'}.items():
    for l in ls.split(): UNIT[l]=u
OUTSIDE='hors-4AM'  # step that tests a skill of an earlier year (3AM or before): counted:false
H={1:'التمرين الأول',2:'التمرين الثاني',3:'التمرين الثالث',4:'التمرين الرابع',0:'الجزء الثاني'}
# (year, ex [0 = الجزء الثاني], points, exam page, topic, owner lesson, steps {step: lesson}, notes)
E = [
(2007,1,'03','1R','جذور: a√2 ؛ تبسيط كسر ؛ بيّن أن A²/33 − 3B = 1/3','tawzif-khawass-judhur',{'01':'tawzif-khawass-judhur','02':OUTSIDE},'02 calcul fractionnaire + ‹بيّن أن›'),
(2007,2,'03','1R','E = 10² − (x−2)² − (x+8) : نشر، تحليل، معادلة جداء','tahlil-ibara',{'01':'nashr-tabsit','02':'tahlil-ibara','03':'jidaa-maadum'},''),
(2007,3,'02,5','1R','جملة 4x+5y=105 ، 6x+4y=112 ؛ مشكلة كراريس وأقلام','mushkilat-jumla',{'01':'hall-jabri','02':'mushkilat-jumla'},''),
(2007,4,'03,5','1R','مثلث قائم AB=4,5 BC=7,5 ؛ AC ؛ عكس طالس ثم DE','aksiya-talis',{'01':OUTSIDE,'02':OUTSIDE,'03':'aksiya-talis'},'01–02 Pythagore (3AM)'),
(2007,0,'08','1R','تسعيرتا سيارات أجرة 15DA/km و 12DA/km+900DA ؛ جدول ؛ متراجحة ؛ تمثيل f ، g ؛ أفضل تسعيرة','tarrid-taalufi',{'01':'dala-khattiya','02':'mutarajiha-ula','03':'tafsir-bayani-jumla'},''),
(2008,1,'02,5','1R','PGCD(945 ; 1215) ؛ كسر غير قابل للاختزال','bahth-pgcd',{'01':'bahth-pgcd','02':'ikhtizal-kasr'},'UTILISÉ par le prototype (l3-004)'),
(2008,2,'03,5','1R','A = (2−√3)² ؛ E = x² − (7−4√3) : قيمة عند √7 ، تحليل ، معادلة جداء','tahlil-ibara',{'01':'mutatabiqat-shahira','02أ':'amaliyat-judhur','02ب':'tahlil-ibara','02ج':'jidaa-maadum'},'mêle racines et calcul littéral'),
(2008,3,'03','1R→1L','مثلث قائم AB=3 BC=5 ؛ AC ؛ طالس BM ؛ cos ABC ثم الزاوية EMB','talis-hisab-atwal',{'01':OUTSIDE,'02أ':'talis-hisab-atwal','02ب':'hasiba-muthallathiya'},''),
(2008,4,'03','1L','A(0;4) B(1;0) ؛ عبارة الدالة التآلفية التي تمثيلها (AB) ؛ تمثيل g ؛ نقطة التقاطع','tanasub-taghayyurat',{'01':'murakkibata-shuaa','02':'tanasub-taghayyurat','03أ':'tamthil-bayani-taalufi','03ب':'tafsir-bayani-jumla'},''),
(2008,0,'08','1L','أرض مستطيلة 2400m² عرضها ثلثا طولها ؛ حظيرة سيارات وشاحنات ؛ تعريفة يومية 8960DA و 30%','tarrid-mushkila',{'01':'muadalat-x-murabba','02':'tarrid-mushkila','03':'tarrid-mushkila'},'03 : le corrigé officiel n’utilise qu’une inconnue (a = 30 % de b ; 56b = 8960) → ترييض مشكلة, compté'),
(2009,1,'03','1L','A=√80 B=2√45 C=√5+1 ؛ a√5 ؛ A×B طبيعي ؛ C²/√5 بمقام ناطق','tawzif-khawass-judhur',{'01':'tawzif-khawass-judhur','02':'amaliyat-judhur','03':'tawzif-khawass-judhur'},''),
(2009,2,'03','1L','E = 2x − 10 − (x−5)² : نشر، تحليل، معادلة جداء','tahlil-ibara',{'01':'nashr-tabsit','02':'tahlil-ibara','03':'jidaa-maadum'},''),
(2009,3,'02,5','1L','دوران مركزه A وزاويته 90° ؛ نوع المثلث ABC ؛ BC','mafhum-dawaran',{'01':'mafhum-dawaran','02':'khawas-dawaran','03':OUTSIDE},'03 Pythagore'),
(2009,4,'03,5','1L','جملة x+y=14 ، x+4y=32 ؛ PGCD(500 ; 125) ؛ علب شاي 125g و 500g','mushkilat-jumla',{'01':'hall-jabri','02':'bahth-pgcd','03':'mushkilat-jumla'},'02 = unité 1 (counted:false) ; cité par le prototype comme modèle seulement'),
(2009,0,'08','1L→2R','خزان أسطواني ومسبح ؛ تدفق 12m³/h ؛ f(x)=314−12x ، g(x)=12x ؛ تمثيل ؛ f(x)=g(x)','tafsir-bayani-jumla',{'01':OUTSIDE,'02':'dala-khattiya','03':'tafsir-bayani-jumla'},'01 volumes cylindre/pavé (3AM)'),
(2010,1,'03','2R','المعدل الفصلي m = (2a+3b)/5 ؛ جد a','muadala-ula',{'—':'muadala-ula'},'une seule tâche'),
(2010,2,'03','2R','PGCD(140 ; 220) ؛ صفيحة زجاجية 2,20m × 1,4m','bahth-pgcd',{'01':'bahth-pgcd','02':'bahth-pgcd'},'UTILISÉ par le prototype (l4-004)'),
(2010,3,'03','2R','A(0;2) B(1;0) C(−1;0) ؛ نوع ABC ؛ دوران 180° ؛ نوع ABDC','ithbat-khawas-maalam',{'01':'murakkibata-shuaa','02':'muntasaf-masafa','03':'ithbat-khawas-maalam'},'rotation 180° = symétrie centrale'),
(2010,4,'03','2R','(BC)//(EF) ؛ احسب EF و FC (شكل)','talis-hisab-atwal',{'—':'talis-hisab-atwal'},'figure à redessiner'),
(2010,0,'08','2R','قاعة: مربع + مستطيل + نصف قرص ؛ قطران مجموعهما 28m ؛ cos α = 0,8 ؛ سعر البلاط 800DA','tarrid-muthallathiya',{'01':'muadala-ula','02':'tarrid-muthallathiya','03':OUTSIDE},'03 aires'),
(2011,1,'03','2R','تحقق بالنشر ؛ A = 2x²−7x+3+(2x−1)(3x+2) تحليل ؛ معادلة جداء','tahlil-ibara',{'01':'nashr-tabsit','02':'tahlil-ibara','03':'jidaa-maadum'},''),
(2011,2,'03','2R→2L','A = √125+√45−√20 على الشكل a√5 ؛ A × √5/30','tawzif-khawass-judhur',{'01':'tawzif-khawass-judhur','02':'amaliyat-judhur'},''),
(2011,3,'03','2L','مثلث قائم وارتفاعه ؛ بيّن أن AB² = BH × BC بـ cos','nisab-muthallathiya',{'—':'nisab-muthallathiya'},'preuve (selfCheck)'),
(2011,4,'03','2L','A(−1;2) B(3;2) M(1;−1) ؛ B صورة A بدوران مركزه M','ithbat-khawas-maalam',{'01':'murakkibata-shuaa','02':'ithbat-khawas-maalam'},'MA = MB par distances'),
(2011,0,'08','2L','وكالة اتصالات: ثلاث صيغ 11DA/min ، 600+5x ، 1200+3x ؛ تمثيل ؛ أقل تكلفة','tarrid-taalufi',{'01':'tarrid-taalufi','02':'tamthil-bayani-taalufi'},''),
(2012,1,'03','2L','m و n على الشكل a√7+b ؛ m×n ناطق ؛ (√7−5)/√7 بمقام ناطق','wadiya-idmajiya-judhur',{'01':'tawzif-khawass-judhur','02':'amaliyat-judhur','03':'tawzif-khawass-judhur'},'mêle les trois compétences → synthèse de l’unité 2'),
(2012,2,'03','2L','E = (4x−1)² − (3x+2)(4x−1) ؛ نشر ، تحليل ، معادلة ، متراجحة','tahlil-ibara',{'01':'nashr-tabsit','02':'tahlil-ibara','03':'jidaa-maadum','04':'mutarajiha-ula'},''),
(2012,3,'03','2L','دائرة قطرها 8cm ، BC=3cm ؛ زاوية BAC ثم BOC ؛ انسحاب ثم طالس DF','zawiya-muhitiya',{'01':'zawiya-muhitiya','02':'talis-hisab-atwal'},'01 utilise aussi le sinus'),
(2012,4,'03','2L','A(2;−1) B(−2;3) C(−4;−3) ؛ AC ونوع ABC ؛ D حيث CA = BD ؛ (AB) ⊥ (CD)','ithbat-khawas-maalam',{'01':'murakkibata-shuaa','02':'muntasaf-masafa','03':'hisab-murakkibatay','04':'ithbat-khawas-maalam'},''),
(2012,0,'08','2L→3R','جريدة: 10DA أو 8DA + اشتراك 500DA ؛ جدول ؛ f ، g ؛ f(x)=g(x) ؛ 150 و 270 جريدة','tamthil-bayani-taalufi',{'01':'mafhum-taalufiya','02':'tamthil-bayani-taalufi','04':'tafsir-bayani-jumla','05':'tarrid-taalufi'},''),
(2013,1,'03','3R','A = √3(√3−1)+√27+1 = 4+2√3 ؛ A × B عدد طبيعي','amaliyat-judhur',{'01':'amaliyat-judhur','02':'amaliyat-judhur'},''),
(2013,2,'03,5','3R','A = 3x−5 : قيمة مقربة عند √2 ، متراجحة ؛ B = (3x−5)²+9x²−25 : نشر ، تحليل ، معادلة','tahlil-ibara',{'01أ':'natiqa-ghayr-natiqa','01ب':'mutarajiha-ula','02':'tahlil-ibara'},'01أ : le livret de corrigés donne 3√2 − 5 ≈ −0,75 par défaut, la valeur juste est −0,76 (signalé par l’auteur jidhr-tarbii)'),
(2013,3,'02','3R','مثلث قائم AB=4 CB=8 ؛ طالس MH ؛ tan AMB ثم الزاوية','talis-hisab-atwal',{'01':'talis-hisab-atwal','02':'hasiba-muthallathiya'},''),
(2013,4,'03,5','3R','A(2;0) B(−4;3) C(5;3) ؛ مركبتا AB وطوله ؛ D بانسحاب ؛ تقاطع (BC) و (AD)','hisab-murakkibatay',{'01':'murakkibata-shuaa','02':'hisab-murakkibatay','03':'hisab-murakkibatay','04':'ithbat-khawas-maalam'},''),
(2013,0,'08','3R','كراء سيارة: ثلاث وكالات ؛ f ، g ، h ؛ جدول ؛ g=h ، f=h ، f=g','tarrid-taalufi',{'01':OUTSIDE,'02':'mafhum-taalufiya','03':'tamthil-bayani-taalufi','04':'tafsir-bayani-jumla'},''),
(2014,1,'03','3L','A كسر عشري ؛ B كتابة علمية ؛ C = √175 − √112 + 6√7 أبسط شكل','tawzif-khawass-judhur',{'01':OUTSIDE,'02':OUTSIDE,'03':'tawzif-khawass-judhur'},'01–02 hors 4AM'),
(2014,2,'03','3L','E = (2x+5)² − 36 ؛ تحقق بالنشر ؛ تحليل ؛ معادلة','mutatabiqat-shahira',{'01':'mutatabiqat-shahira','02':'tahlil-ibara','03':'jidaa-maadum'},''),
(2014,3,'03','3L','شبه منحرف قائم ACB = 25° ؛ AB بـ tan ؛ مساحات','tarrid-muthallathiya',{'01':'hasiba-muthallathiya','02':OUTSIDE},'figure à redessiner'),
(2014,4,'03','3L','A(−2;−3) B(4;1) C(2;4) ؛ AB ؛ ABC قائم ؛ E بانسحاب ؛ ABCE مستطيل','muntasaf-masafa',{'01':'murakkibata-shuaa','02':'muntasaf-masafa','03':'barahin-ashia'},''),
(2014,0,'08','3L','عرضا SMS: 3DA أو 1,5DA + 30DA ؛ جدول ؛ f ، g ؛ قراءة بيانية','tafsir-bayani-jumla',{'01':'dala-khattiya','02':'mafhum-taalufiya','03':'tamthil-bayani-taalufi','04':'tafsir-bayani-jumla'},''),
(2015,1,'03','3L','PGCD(696 ; 406) ؛ كسر ؛ حساب P','bahth-pgcd',{'01':'bahth-pgcd','02':'ikhtizal-kasr','03':OUTSIDE},'UTILISÉ par le prototype'),
(2015,2,'03,5','3L','F = (2x−3)² − 16 ؛ تحليل ؛ معادلة ؛ F عند x = 1+√2','mutatabiqat-shahira',{'01':'mutatabiqat-shahira','02':'tahlil-ibara','03':'jidaa-maadum','04':'amaliyat-judhur'},''),
(2015,3,'03','4R','دائرة قطرها ST=9cm ، SOR=46° ؛ STR=23° ؛ SRT قائم ؛ RS','zawiya-muhitiya',{'01':'zawiya-muhitiya','02':'zawiya-muhitiya','03':'hasiba-muthallathiya'},''),
(2015,4,'02,5','4R','رباعي قطراه متعامدان ؛ (CD)//(AB) ؛ AB','aksiya-talis',{'01':'aksiya-talis','02':OUTSIDE},'02 Pythagore ; figure'),
(2015,0,'08','4R','عمي أحمد: أرض 1000m² عرضها خُمسا طولها ؛ ABMD و BCM ؛ f ، g ؛ تمثيل','tafsir-bayani-jumla',{'☜':'muadalat-x-murabba','01':'muadala-ula','02':'tafsir-bayani-jumla'},''),
(2016,1,'03','4R','PGCD(1053 ; 832) ؛ كسر ؛ A = √1053 + 2√832 − 8√117 على الشكل a√13','bahth-pgcd',{'01':'bahth-pgcd','02':'ikhtizal-kasr','03':'tawzif-khawass-judhur'},'UTILISÉ (extrait 01–02) ; 03 non utilisé'),
(2016,2,'03','4R','تحقق 5(2x+1)(2x−1) ؛ تحليل A ؛ متراجحة وتمثيل حلولها','tahlil-ibara',{'01':'mutatabiqat-shahira','02':'tahlil-ibara','03':'mutarajiha-ula'},''),
(2016,3,'02,5','4R','دالة تآلفية تمثيلها يشمل A(2;5) B(−1;−4) ؛ f(x) = 3x−1 ؛ استقامية ؛ سابقة 29','tanasub-taghayyurat',{'01':'tanasub-taghayyurat','02':'mafhum-taalufiya','03':'mafhum-taalufiya'},''),
(2016,4,'03,5','4R→4L','EFG قائم متساوي الساقين ؛ صور بانسحاب ؛ EGDC مربع ؛ U = ED','barahin-ashia',{'01':OUTSIDE,'02':'insihab-shuaa','03':'barahin-ashia','04':'majmu-shuaayn'},''),
(2016,0,'08','4L','أرض 50m × 40m ؛ MA/MN = 2/3 ؛ BN ؛ زاوية MAD ؛ دوران 90° ؛ ضريبة 20% وكتابة علمية','wadiya-idmajiya-talis',{'I-01':'talis-hisab-atwal','I-02':'talis-hisab-atwal','I-03':'hasiba-muthallathiya','II-01':'khawas-dawaran','II-02':'tatbiqat-tanasub'},'figure à redessiner'),
(2017,1,'03','4L','A = √108 − √12 ؛ B = 3/(2√3) بمقام ناطق ؛ C = (A+1)(8B−1) طبيعي','tawzif-khawass-judhur',{'01':'tawzif-khawass-judhur','02':'tawzif-khawass-judhur','03':'amaliyat-judhur'},''),
(2017,2,'03','4L','P = (1−3x)(3x+3) − 2(3x+3) ؛ نشر ، تحليل ، معادلة','nashr-tabsit',{'01':'nashr-tabsit','02':'tahlil-ibara','03':'jidaa-maadum'},''),
(2017,3,'04','4L','A(0;4) B(−3;1) C(5;−1) ؛ منتصف [BC] ؛ دوران 180° ؛ ABDC مستطيل','muntasaf-masafa',{'01':'murakkibata-shuaa','02':'muntasaf-masafa','03':'mafhum-dawaran','04':'ithbat-khawas-maalam'},''),
(2017,4,'02','4L','MU=28 MO=21 MI=36 MA=27 ؛ (OU)//(AI) ؛ زاوية AIM','aksiya-talis',{'01':'aksiya-talis','02':'hasiba-muthallathiya'},'figure'),
(2017,0,'08','4L→5R','أرض مربعة 324m² ؛ ضلعها ؛ S1 ، S2 بدلالة x ؛ f(x)=12x ، g(x)=−6x+324 ؛ قراءة بيانية','wadiya-idmajiya-taalufiya',{'I-01':'muadalat-x-murabba','I-02':'muadala-ula','II-01':'tamthil-bayani-taalufi','II-02':'tafsir-bayani-jumla'},''),
(2018,1,'03','5R','A = 3√8 × √2 طبيعي ؛ B على الشكل a√3 ؛ A/B = 2√3/3','amaliyat-judhur',{'01':'amaliyat-judhur','02':'tawzif-khawass-judhur','03':'tawzif-khawass-judhur'},''),
(2018,2,'03','5R','تحقق (3x+1)(x−4) ؛ تحليل E ؛ متراجحة','tahlil-ibara',{'01':'nashr-tabsit','02':'tahlil-ibara','03':'mutarajiha-ula'},''),
(2018,3,'03','5R','مستطيل AD=6 DC=8 ؛ AC ؛ (EF)//(AC) ؛ زاوية BEF','aksiya-talis',{'01':OUTSIDE,'02':'aksiya-talis','03':'hasiba-muthallathiya'},''),
(2018,4,'03','5R','TIC: TC=12 TI=5 CI=13 ؛ قائم ومساحته ؛ TH','nisab-muthallathiya',{'01':OUTSIDE,'02':'nisab-muthallathiya'},'surtout 3AM (réciproque de Pythagore)'),
(2018,0,'08','5R','عبد الله ومحمد: 20000+200x و 30000+100x ؛ تمثيل ؛ جملة وتفسيرها البياني','tafsir-bayani-jumla',{'I-01':'mafhum-taalufiya','I-02':'mafhum-taalufiya','II-01':'tamthil-bayani-taalufi','II-02':'tafsir-bayani-jumla'},''),
(2019,1,'02,5','5R','A = 9/7 × (10/3 − 1) ؛ B على الشكل a√3 ؛ A/B بمقام ناطق','tawzif-khawass-judhur',{'01':OUTSIDE,'02':'tawzif-khawass-judhur','03':'tawzif-khawass-judhur'},''),
(2019,2,'03','5R→5L','E = (x+1)² − (x+1)(2x−3) ؛ نشر ، تحليل ؛ متراجحة 3x+4 ≥ 6x−2','tahlil-ibara',{'01':'nashr-tabsit','02':'tahlil-ibara','03':'mutarajiha-ula'},''),
(2019,3,'03','5L','RST قائم ، sin RTS = 0,8 ، RS = 8cm ؛ TR و ST ؛ MN','nisab-muthallathiya',{'01':'nisab-muthallathiya','02':'talis-hisab-atwal'},''),
(2019,4,'03,5','5L','A(−1;5) B(2;2) C(−1;−1) ؛ AB و BC ؛ منتصف ؛ دوران 180° ؛ نوع ABCD','muntasaf-masafa',{'01':'murakkibata-shuaa','02':'muntasaf-masafa','03':'muntasaf-masafa','04':'ithbat-khawas-maalam'},''),
(2019,0,'08','5L','مسبح بلدي: 100DA للحصة أو 80DA + 400DA ؛ عدد الحصص بـ 2800DA ؛ تمثيل','mafhum-taalufiya',{'01':'muadala-ula','02':'tafsir-bayani-jumla'},''),
(2020,1,'02','5L','A كسر غير قابل للاختزال ؛ B = 2√112 − 3√28 + √7 على الشكل a√7','tawzif-khawass-judhur',{'01':OUTSIDE,'02':'tawzif-khawass-judhur'},'corrigé officiel faux : recopie « + 3√7 » et trouve B = 5√7 ; le sujet (+√7) donne 3√7 — publié official avec le bon calcul'),
(2020,2,'03','5L','E = (3x+1)² − (x−2)² ؛ نشر ، تحليل ، معادلة','mutatabiqat-shahira',{'01':'mutatabiqat-shahira','02':'tahlil-ibara','03':'jidaa-maadum'},''),
(2020,3,'03','5L','دائرة قطرها 10cm ، BM = 6cm ؛ نوع MBA و AM ؛ زاوية MBA ؛ BF بطالس','talis-hisab-atwal',{'01':'zawiya-muhitiya','02':'hasiba-muthallathiya','03':'talis-hisab-atwal'},'figure'),
(2020,4,'03,5','5L','A(1;2) B(5;−2) C(−1;−3) ؛ مركبتا BC ؛ منتصف [AC] ؛ D حيث BM = MD ؛ نوع ABCD','hisab-murakkibatay',{'01':'murakkibata-shuaa','02':'hisab-murakkibatay','03':'muntasaf-masafa','04':'ithbat-khawas-maalam'},''),
(2020,0,'08','5L→6R','عمي محمود: أرض 60m × 42m وأشجار ؛ ثمن الشجيرة الأقصى','bahth-pgcd',{'☜':'bahth-pgcd'},'UTILISÉ par le prototype (l5-004)'),
(2021,1,'03','6R','PGCD(567 ; 448) ؛ A و B على الشكل a+b√7 ؛ x/(4+√7) = (4−√7)/x','bahth-pgcd',{'01':'bahth-pgcd','02':'tawzif-khawass-judhur','03':'muadalat-x-murabba'},'UTILISÉ (extrait 01) ; 02–03 non utilisés'),
(2021,2,'03','6R','E = (x−3)(x−10) + 3(x−3) ؛ نشر ، تحليل ، معادلة ، E عند 50','tahlil-ibara',{'01':'nashr-tabsit','02':'tahlil-ibara','03':'jidaa-maadum','04':'nashr-tabsit'},''),
(2021,3,'03','6R','BEM قائم ، BE = 4,8 ، tan M = 4/3 ؛ BM و ME ؛ (KL)//(BM)','nisab-muthallathiya',{'01':'nisab-muthallathiya','02':'aksiya-talis'},''),
(2021,4,'03','6R','K(−1;4) L(−5;1) M(1;−3) ؛ مركبتا LK ؛ منتصف [LM] ؛ KLMN متوازي أضلاع','hisab-murakkibatay',{'01':'hisab-murakkibatay','02':'muntasaf-masafa','03':'hisab-murakkibatay'},''),
(2021,0,'08','6R','طلاء غرفة 5m × 8m × 3m بفتحات ؛ أكبر ثمن لدلو الدهن','tarrid-mushkila',{'☜':'tarrid-mushkila'},'une seule tâche (inéquation)'),
(2022,1,'03','6R','A على الشكل a√5 ؛ B = (2+√2)/√2 بمقام ناطق ؛ B × (√2−1) طبيعي','wadiya-idmajiya-judhur',{'01':'tawzif-khawass-judhur','02':'tawzif-khawass-judhur','03':'amaliyat-judhur'},'mêle les compétences → synthèse de l’unité 2'),
(2022,2,'03','6R','نشر E = (2x−3)(x−2) ؛ تحليل F ؛ معادلة جداء','tahlil-ibara',{'01':'nashr-tabsit','02':'tahlil-ibara','03':'jidaa-maadum'},''),
(2022,3,'03','6R','أي الثنائيتين حل للجملة ؛ حل جملة x+y=30 ، 2x+5y=45','mafhum-jumla',{'01':'mafhum-jumla','02':'hall-jabri'},'02 : COQUILLE confirmée — le sujet imprime 2x + 5y = 45 (solution (35 ; −5)), le corrigé lit 2x + 5y = 90 (solution (20 ; 10)) ; publié en excerpt (01 seule) dans mafhum-jumla l3-001, signalé au propriétaire'),
(2022,4,'03','6L','A(3;2) B(1;−2) C(−3;0) ؛ نوع ABC ؛ D بانسحاب ؛ ABCD مربع','ithbat-khawas-maalam',{'01':'muntasaf-masafa','02':'insihab-shuaa','03':'ithbat-khawas-maalam'},''),
(2022,0,'08','6L','فلاح: 1188 و 528 صندوقًا ؛ ممر بين البطاطا والجزر','bahth-pgcd',{'01':'bahth-pgcd','02':'talis-hisab-atwal'},'UTILISÉ (extrait 01) ; 02 (Thalès) non utilisé'),
(2023,1,'03','6L','A = 756/216 غير قابل للاختزال ؛ B على الشكل a√3 ؛ B × C = 26√3','tawzif-khawass-judhur',{'01':'ikhtizal-kasr','02':'tawzif-khawass-judhur','03':'amaliyat-judhur'},'01 = unité 1 (counted:false) ; 02 imprimé « a√3 » alors que B = 2√13 (le corrigé calcule 2√13) : NON publié en official, remplacé par « على منوال BEM 2023 » (tawzif l4-003) — signalé au propriétaire'),
(2023,2,'03','6L','شكل: مربع ضلعه x−2 ومستطيل ؛ مساحتان بدلالة x ؛ E + F = 2x(x−2) ؛ محيط ≥ 20cm','nashr-tabsit',{'01':'nashr-tabsit','02':'nashr-tabsit','03':'mutarajiha-ula'},'figure'),
(2023,3,'03','6L','(JK) ⊥ (IM) ؛ IK ؛ موازٍ لـ (JM) ثم NK','talis-hisab-atwal',{'01':OUTSIDE,'02':OUTSIDE,'03':'talis-hisab-atwal'},'figure'),
(2023,4,'03','6L','f(x) = −2x + 3 ؛ x_A و y_B ؛ استقامية D ، O ، C ؛ تمثيل f','tamthil-bayani-taalufi',{'01':'mafhum-taalufiya','02':'tamthil-bayani-taalufi','03':'tamthil-bayani-taalufi'},''),
(2023,0,'08','7R','روضة أطفال: 1500000DA ؛ عشب اصطناعي وبساط ؛ جملة ؛ ربح أو خسارة المقاول','mushkilat-jumla',{'01':'mushkilat-jumla','02':'tatbiqat-tanasub'},''),
(2024,1,'03','7R','E = 49x² − 16 + (x+3)(7x−4) ؛ تحقق ؛ تحليل ؛ معادلة','mutatabiqat-shahira',{'01':'nashr-tabsit','02':'mutatabiqat-shahira','03':'jidaa-maadum'},''),
(2024,2,'03','7R','خياط: قماش 270cm × 378cm ؛ مربعات متقايسة','bahth-pgcd',{'01':'bahth-pgcd','02':'bahth-pgcd'},'UTILISÉ par le prototype (l4-005)'),
(2024,3,'03','7R','R(5;6) S(1;−2) T(−5;1) ؛ TS = 3√5 ، TR = 5√5 ؛ زاوية TRS','muntasaf-masafa',{'01':'murakkibata-shuaa','02':'muntasaf-masafa','03':'hasiba-muthallathiya'},''),
(2024,4,'03','7R','جملة x+y=90 ، x−1,5y=0 ؛ طالس: OA + OB و OA/OB','hall-jabri',{'01':'hall-jabri','02':'talis-hisab-atwal'},'figure'),
(2024,0,'08','7R→7L','مكتبة: ثلاثة عروض لاستئجار الكتب 45DA ، 15DA + 600DA ، 1350DA ؛ جدول ؛ تمثيل','tarrid-taalufi',{'01':'mafhum-taalufiya','02':'tarrid-taalufi'},''),
(2025,1,'03','7L','E = x² − 14x − 32 = (x−7)² − 81 ؛ تحليل ؛ E عند √3−2 ؛ E − x² موجبة','mutatabiqat-shahira',{'01':'mutatabiqat-shahira','02':'tahlil-ibara','03':'amaliyat-judhur','04':'mutarajiha-ula'},''),
(2025,2,'03','7L','PGCD(1352 ; 507) ؛ منتصف [AC] ؛ استقامية مع تمثيل دالة خطية','bahth-pgcd',{'01':'bahth-pgcd','02':'muntasaf-masafa','03':'dala-khattiya'},'UTILISÉ (extrait 01) ; 02–03 non utilisés'),
(2025,3,'03','7L','R(3;−1) S(2;3) T(−2;2) ؛ ST ، RT ، RS ؛ نوع RST ؛ K بانسحاب','muntasaf-masafa',{'01':'muntasaf-masafa','02':'ithbat-khawas-maalam','03':'hisab-murakkibatay'},''),
(2025,4,'03','7L','f تآلفية: H(2;5) و K(3;8) ؛ g(x) = 5x − 7 ؛ تقاطع حسابيًا','tanasub-taghayyurat',{'01':'tanasub-taghayyurat','02أ':'mafhum-taalufiya','02ب':'tafsir-bayani-jumla'},''),
(2025,0,'08','7L→8','سباق 8 ماي 1945 ؛ مسافات الفئات الثلاث (طالس ، tan CEF = 0,75) ؛ سرعة','wadiya-idmajiya-muthallathat',{'1':'tarrid-muthallathiya','2':'tatbiqat-tanasub'},'figure'),
]
rows=[]
for (y,ex,pts,pg,topic,owner,steps,notes) in E:
    lessons=sorted({l for l in steps.values() if l!=OUTSIDE}|{owner})
    rows.append(dict(id=f"{y}-{'II' if ex==0 else 'I-'+str(ex)}", year=y, session='juin', part=2 if ex==0 else 1,
      exercise=ex or None, heading=H[ex] if ex else ('المسألة' if y==2024 else 'الوضعية الإدماجية' if y==2025 else 'الجزء الثاني'),
      points=pts, examPdfPage=pg, solutionPdfPages=[SOL[y], SOL[y+1]-1], topic=topic, ownerLesson=owner, ownerUnit=UNIT[owner],
      steps=steps, lessons=lessons, mixed=len(lessons)>1 or OUTSIDE in steps.values(), integration=ex==0,
      usedBy='bahth-pgcd' if notes.startswith('UTILISÉ') else None, notes=notes))
for r in rows: assert r['ownerLesson'] in UNIT, r
for r in rows:
  for l in r['steps'].values(): assert l==OUTSIDE or l in UNIT, (r['id'],l)
by=collections.defaultdict(lambda: {'owned':[], 'steps':[]})
for r in rows:
    by[r['ownerLesson']]['owned'].append(r['id'])
    for s,l in r['steps'].items():
        if l!=OUTSIDE and l!=r['ownerLesson']: by[l]['steps'].append(f"{r['id']} ({s})")
json.dump({'source':'docs/official-BREVET-exams/ (annales 2007–2025, 8 p. ; corrigés 62 p.)','builtOn':'2026-10-06',
  'legend':{'examPdfPage':'page du PDF des sujets + colonne (R = droite, lue en premier ; L = gauche)','solutionPdfPages':'pages du PDF des corrigés couvrant la session (début → fin)',
  'steps':f"étape → leçon ; '{OUTSIDE}' = compétence d'une année antérieure (counted:false)",'ownerLesson':'la leçon qui CITE l’exercice (une seule fois)'},
  'exercises':rows,'byLesson':{l:by[l] for l in sorted(UNIT,key=lambda l:(UNIT[l],l))}},open(OUT+'annals-index.json','w'),ensure_ascii=False,indent=1)
# markdown
L=[]; w=L.append
w('# Index des annales BEM 2007 → 2025 (étape 0 du déploiement « feuille d’examen »)\n')
w('Construit le 2026-10-06 en lisant les pages rendues (`pdftoppm -r 150`) des deux fichiers de `docs/official-BREVET-exams/`')
w('(sujets : 8 pages denses, 2 colonnes, lues colonne droite puis gauche ; corrigés : 62 pages). Source machine : `annals-index.json`.\n')
w('**Couverture.** 19 sessions (2007 → 2025), une par an, aucune manquante ; chacune = 4 exercices du الجزء الأول + 1 الجزء الثاني (2024 : « المسألة » ; 2025 : « الوضعية الإدماجية »). 95 exercices.\n')
w(f'**Légende.** Page sujet : `3L` = page 3, colonne gauche. Pages corrigé : plage de la session dans le fichier « … حلول ». Étapes : `étape → leçon` ; `{OUTSIDE}` = compétence d’une année antérieure (Pythagore, calcul fractionnaire, aires, volumes 3AM…) → `counted:false`. **Leçon propriétaire** = la seule leçon qui cite l’exercice ; ses autres étapes deviennent `counted:false` (ou sont retirées : `excerpt`).\n')
w('## 1. Par année\n')
w('| Session | Exercice | ن | Page sujet | Pages corrigé | Thème | Leçon propriétaire (unité) | Étapes → leçons | Mixte | Notes |')
w('|---|---|---|---|---|---|---|---|---|---|')
for r in rows:
    st=' ؛ '.join(f"{k}→{v}" for k,v in r['steps'].items())
    w(f"| {r['year']} | {r['heading']} | {r['points']} | {r['examPdfPage']} | {r['solutionPdfPages'][0]}–{r['solutionPdfPages'][1]} | {r['topic']} | **{r['ownerLesson']}** ({r['ownerUnit']}) | {st} | {'oui' if r['mixed'] else ''} | {r['notes']} |")
w('\n## 2. Par leçon (pilote les 50 exercices)\n')
w('« Cite » = exercices dont la leçon est propriétaire (official / excerpt). « Étapes ailleurs » = étapes de la leçon dans un exercice cité par une AUTRE leçon : à utiliser seulement en `adapted` / « على منوال », jamais en second official.\n')
w('| Unité | Leçon | Cite (official/excerpt) | n | Étapes ailleurs (modèles) |')
w('|---|---|---|---|---|')
for l in sorted(UNIT,key=lambda l:(UNIT[l],l)):
    o=by[l]['owned']; s=by[l]['steps']
    w(f"| {UNIT[l]} | {l} | {', '.join(o) or '—'} | {len(o)} | {', '.join(s) or '—'} |")
zero=[l for l in UNIT if not by[l]['owned'] and not by[l]['steps']]
w('\n## 3. Constats\n')
w(f"- **Leçons sans aucun exercice d’annales ({len(zero)})** : {', '.join(sorted(zero,key=lambda l:(UNIT[l],l)))}. Toute l’unité 8 (الإحصاء) et toute l’unité 14 (الهندسة في الفضاء) sont absentes du corpus 2007–2025 ; les المضلعات المنتظمة aussi. Pour elles, seul « على منوال BEM » (style) est possible, sans énoncé officiel.")
w('- **Très concentré** : chaque session ouvre sur les racines (→ tawzif-khawass-judhur) puis le calcul littéral (→ tahlil-ibara / mutatabiqat-shahira) ; le الجزء الثاني est presque toujours une comparaison de tarifs (→ unité 7).')
w('- **Déjà utilisés par le prototype bahth-pgcd** : 2008 I-1, 2010 I-2, 2015 I-1, 2016 I-1 (01–02), 2020 II, 2021 I-1 (01), 2022 II (01), 2024 I-2, 2025 I-2 (01). Leurs étapes NON utilisées (2016 I-1 03, 2021 I-1 02–03, 2022 II 02, 2025 I-2 02–03) restent propriété de bahth-pgcd : ne pas les re-citer sans accord du propriétaire.')
w('- **À vérifier contre le corrigé** : 2022 I-3 02 (x + y = 30 ; 2x + 5y = 45 donne y = −5) — lire la page du corrigé avant d’écrire l’exercice ; tout désaccord avec l’oracle est rapporté au propriétaire.')
w('- **Ancien programme** : les sessions 2007–2019 sont antérieures au programme de 2e génération (BEM 2020 et après). Les thèmes restent tous au programme actuel de 4AM ; ce qui sort de 4AM est marqué `hors-4AM` étape par étape (Pythagore et sa réciproque, calcul fractionnaire, écriture scientifique, aires/volumes 3AM).')
w('- **Figures** : sujets avec figure à redessiner (dz-textbook-figure-redesign) : 2008 II, 2010 I-4, 2010 II, 2014 I-3, 2015 I-3, 2015 I-4, 2015 II, 2016 II, 2017 I-4, 2017 II, 2018 I-3, 2020 I-3, 2022 II, 2023 I-2, 2023 I-3, 2024 I-4, 2025 II.')
open(OUT+'annals-index.md','w').write('\n'.join(L)+'\n')
print(len(rows), 'zero:', len(zero)); print({l:len(by[l]['owned']) for l in UNIT if by[l]['owned']})
