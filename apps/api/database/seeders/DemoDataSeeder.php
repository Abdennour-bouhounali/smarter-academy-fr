<?php

namespace Database\Seeders;

use App\Domain\Classroom\ClassroomInsightService;
use App\Domain\Classroom\ClassroomInterventionService;
use App\Domain\Classroom\ClassroomLessonService;
use App\Domain\Classroom\ClassroomMembershipService;
use App\Domain\Classroom\ClassroomService;
use App\Domain\Plans\SubscriptionActivationService;
use App\Models\Classroom;
use App\Models\ClassroomIntervention;
use App\Models\ClassroomLesson;
use App\Models\ClassroomMembership;
use App\Models\ExerciseAttempt;
use App\Models\HintEvent;
use App\Models\LearningEvidence;
use App\Models\LearningPointStateTransition;
use App\Models\LessonFinalTestAttempt;
use App\Models\NotebookNote;
use App\Models\Plan;
use App\Models\PracticeSession;
use App\Models\QuestionAttempt;
use App\Models\StudentLearningPointProgress;
use App\Models\StudentLessonProgress;
use App\Models\Subscription;
use App\Models\User;
use Database\Seeders\Demo\DemoContent;
use Database\Seeders\Demo\DemoDailyChallenges;
use Database\Seeders\Demo\DemoNotes;
use Database\Seeders\Demo\DemoPersona;
use Database\Seeders\Demo\DemoStudentSimulator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

/**
 * Une plateforme qui a SERVI — trois mois d'enseignement, reconstitués.
 *
 * Ce n'est pas un jeu de lignes aléatoires : chaque compte porte un portrait
 * (DemoPersona), chaque portrait est déroulé jour par jour sur le contenu
 * RÉEL de l'unité 1 de 4AM (DemoStudentSimulator), et la maîtrise est
 * rejouée par le modèle de production. Ouvrir la plateforme après ce
 * peuplement doit donner la même impression qu'ouvrir un vrai carnet de
 * classe au milieu du trimestre.
 *
 * TROIS GARANTIES
 *
 *   Reconnaissable  tous les comptes sont en @smarter-academy-dz.test, un
 *                   domaine réservé (RFC 6761) qui ne peut appartenir à
 *                   personne. Aucune donnée réelle n'est touchée.
 *   Idempotent      relancer efface d'abord les comptes de démonstration et
 *                   TOUT ce qui en dépend, puis reconstruit à l'identique
 *                   (générateur ensemencé). Jamais de doublons.
 *   Jamais en prod  refuse de s'exécuter si APP_ENV=production, sauf
 *                   --force explicite.
 *
 * Usage :  php artisan db:seed --class=DemoDataSeeder
 */
class DemoDataSeeder extends Seeder
{
    /** Le domaine réservé qui marque un compte comme fictif. */
    public const DEMO_DOMAIN = '@smarter-academy-dz.test';

    public const ADMIN_PASSWORD = 'TestPassword123!';

    public const TEACHER_PASSWORD = 'TestTeacher123!';

    public const STUDENT_PASSWORD = 'TestStudent123!';

    private DemoContent $content;

    private DemoStudentSimulator $simulator;

    /** @var array<string, Classroom> les classes créées, par lettre de groupe */
    private array $groups = [];

    private array $totals = [];

    public function run(): void
    {
        $this->guardProduction();

        $this->command?->info('Audit du contenu réel…');
        $this->content = new DemoContent('4am');
        if ($this->content->lessons->isEmpty()) {
            throw new RuntimeException(
                'Aucune leçon 4AM publiée en base : importez le curriculum avant de peupler la démonstration.'
            );
        }
        $this->command?->info(
            'Contenu : '.$this->content->lessons->count().' leçons, '
            .count($this->content->learningPointIds).' points de savoir, '
            .collect($this->content->exercisesByLesson)->flatten(1)->flatten(1)->count().' exercices.'
        );

        $this->simulator = new DemoStudentSimulator($this->content, new DemoNotes);

        $this->purge();

        $admin = $this->admin();
        $teachers = $this->teachers($admin);
        $students = $this->students();
        $this->classes($admin, $teachers, $students);
        $this->studentAccess($admin, $students);
        $this->simulate($students);
        $this->interventions($teachers);
        $this->dailyChallenges($teachers, $students);

        $this->report();
    }

    /**
     * Une base de production porte de vrais élèves. Ce seeder n'y entre pas.
     */
    private function guardProduction(): void
    {
        if (app()->environment('production') && ! $this->forceRequested()) {
            throw new RuntimeException(
                'DemoDataSeeder refuse de s\'exécuter en production : il créerait des comptes fictifs '
                .'dans une base portant de vrais élèves. Utilisez --force en connaissance de cause.'
            );
        }
    }

    /** `--force` est une option de db:seed ; elle peut être absente selon l'appelant. */
    private function forceRequested(): bool
    {
        try {
            return (bool) $this->command?->option('force');
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Efface les comptes de démonstration ET tout ce qu'ils ont produit.
     *
     * Le périmètre est défini par l'EMAIL, jamais par un intervalle d'id :
     * un compte réel ne peut pas se retrouver dans la sélection. Les classes
     * supprimées sont celles dont l'enseignant est fictif ; les adhésions
     * fictives sont retirées des classes réelles sans toucher à celles-ci.
     */
    private function purge(): void
    {
        $ids = User::where('email', 'like', '%'.self::DEMO_DOMAIN)->pluck('id');
        if ($ids->isEmpty()) {
            $this->command?->info('Aucune donnée de démonstration antérieure.');

            return;
        }

        $this->command?->warn('Suppression de '.$ids->count().' comptes de démonstration et de leurs données…');

        DB::transaction(function () use ($ids) {
            // L'activité d'apprentissage. Les cascades de la base font le
            // reste (exercise_attempts → question_attempts → hint_events),
            // mais on est explicite : un seeder ne doit pas dépendre d'un
            // ON DELETE qu'une migration future pourrait changer.
            $sessions = PracticeSession::whereIn('user_id', $ids)->pluck('id');
            $attempts = ExerciseAttempt::whereIn('practice_session_id', $sessions)->pluck('id');
            HintEvent::whereIn('question_attempt_id', QuestionAttempt::whereIn('exercise_attempt_id', $attempts)->pluck('id'))->delete();
            QuestionAttempt::whereIn('user_id', $ids)->delete();
            ExerciseAttempt::whereIn('id', $attempts)->delete();
            PracticeSession::whereIn('id', $sessions)->delete();

            DB::table('learning_evidence_learning_point')
                ->whereIn('learning_evidence_id', LearningEvidence::whereIn('user_id', $ids)->pluck('id'))
                ->delete();
            LearningEvidence::whereIn('user_id', $ids)->delete();

            LearningPointStateTransition::whereIn('user_id', $ids)->delete();
            LessonFinalTestAttempt::whereIn('user_id', $ids)->delete();
            StudentLearningPointProgress::whereIn('user_id', $ids)->delete();
            StudentLessonProgress::whereIn('user_id', $ids)->delete();
            NotebookNote::whereIn('user_id', $ids)->delete();

            // Les classes des enseignants fictifs, et les adhésions fictives
            // partout ailleurs.
            $classes = Classroom::whereIn('teacher_id', $ids)->pluck('id');
            DemoDailyChallenges::purge($ids, $classes);
            ClassroomIntervention::whereIn('classroom_id', $classes)->delete();
            ClassroomMembership::whereIn('classroom_id', $classes)->orWhereIn('student_id', $ids)->delete();
            ClassroomLesson::whereIn('classroom_id', $classes)->delete();
            DB::table('classroom_invitations')->whereIn('classroom_id', $classes)->delete();
            Classroom::whereIn('id', $classes)->delete();

            DB::table('subscription_requests')->whereIn('user_id', $ids)->delete();
            DB::table('plan_entitlement_overrides')->whereIn('user_id', $ids)->delete();
            Subscription::whereIn('user_id', $ids)->delete();
            DB::table('entitlements')->whereIn('user_id', $ids)->delete();
            DB::table('student_reports')->whereIn('user_id', $ids)->delete();
            DB::table('admin_activity_logs')->whereIn('user_id', $ids)->delete();
            DB::table('personal_access_tokens')
                ->where('tokenable_type', User::class)->whereIn('tokenable_id', $ids)->delete();

            User::whereIn('id', $ids)->delete();
        });
    }

    private function admin(): User
    {
        $admin = $this->account('admin'.self::DEMO_DOMAIN, 'Karim', 'Bouzid', User::ROLE_ADMIN, self::ADMIN_PASSWORD, null, 100);
        $this->totals['admins'] = 1;

        return $admin;
    }

    /**
     * Les enseignants. Chacun a une offre différente — c'est ce qui rend le
     * panneau d'administration lisible : on y voit un enseignant au forfait
     * gratuit (5 sièges), un enseignant dont l'administration a activé une
     * offre à sièges, et un enseignant dont l'abonnement a expiré.
     *
     * @return array<string, User>
     */
    private function teachers(User $admin): array
    {
        $activation = app(SubscriptionActivationService::class);
        $seatsPlan = Plan::where('slug', 'teacher-seats')->first();

        $teachers = [];

        // 01 — l'enseignant principal : une offre à sièges activée par
        // l'administration il y a dix semaines, payée hors plateforme.
        $teachers['main'] = $this->account(
            'teacher01'.self::DEMO_DOMAIN, 'Mourad', 'Belkacem', User::ROLE_TEACHER, self::TEACHER_PASSWORD, null, 95
        );
        if ($seatsPlan !== null) {
            $activation->activate(
                $admin, $teachers['main'], $seatsPlan, null,
                Carbon::now()->addDays(275), 'Paiement reçu hors plateforme — virement CCP', 60
            );
        }

        // 02 — un second enseignant au même modèle, plus petit.
        $teachers['second'] = $this->account(
            'teacher02'.self::DEMO_DOMAIN, 'Samira', 'Hamdani', User::ROLE_TEACHER, self::TEACHER_PASSWORD, null, 72
        );
        if ($seatsPlan !== null) {
            $activation->activate(
                $admin, $teachers['second'], $seatsPlan, null,
                Carbon::now()->addDays(300), 'Paiement reçu hors plateforme — espèces', 30
            );
        }

        // 03 — resté sur l'offre gratuite (5 sièges) : c'est le compte qui
        // montre la limite commerciale à l'œuvre.
        $teachers['free'] = $this->account(
            'teacher03'.self::DEMO_DOMAIN, 'Nabil', 'Cherifi', User::ROLE_TEACHER, self::TEACHER_PASSWORD, null, 40
        );

        $this->totals['teachers'] = count($teachers);

        return $teachers;
    }

    /**
     * La population d'élèves — seize portraits, aucun identique.
     *
     * Les proportions suivent une vraie classe : quelques éléments moteurs,
     * une majorité au milieu, un tiers en difficulté ou irrégulier, et deux
     * arrivées récentes.
     *
     * @return array<string, array{user: User, persona: DemoPersona}>
     */
    private function students(): array
    {
        $personas = [
            // --- éléments moteurs (3/16) -------------------------------
            new DemoPersona('s01', 'Ahmed', 'Benali', 'student01', 'high-performer',
                accuracy: 0.88, persistence: 0.9, startedDaysAgo: 92, lastSeenDaysAgo: 0,
                density: 0.62, reach: 0.95, noteAppetite: 6, hintAppetite: 1),
            new DemoPersona('s02', 'Lina', 'Meziane', 'student02', 'high-performer',
                accuracy: 0.85, persistence: 0.88, startedDaysAgo: 90, lastSeenDaysAgo: 1,
                density: 0.55, reach: 0.88, noteAppetite: 5, hintAppetite: 1),
            new DemoPersona('s03', 'Yacine', 'Mansouri', 'student03', 'high-performer',
                accuracy: 0.82, persistence: 0.85, startedDaysAgo: 88, lastSeenDaysAgo: 2,
                density: 0.5, reach: 0.82, noteAppetite: 4, hintAppetite: 1),

            // --- le gros de la classe (8/16) ---------------------------
            new DemoPersona('s04', 'Rayane', 'Boudiaf', 'student04', 'average',
                accuracy: 0.68, persistence: 0.7, startedDaysAgo: 89, lastSeenDaysAgo: 1,
                density: 0.42, reach: 0.68, noteAppetite: 4, hintAppetite: 2),
            new DemoPersona('s05', 'Inès', 'Rahmani', 'student05', 'average',
                accuracy: 0.71, persistence: 0.68, startedDaysAgo: 85, lastSeenDaysAgo: 3,
                density: 0.4, reach: 0.62, noteAppetite: 3, hintAppetite: 2),
            new DemoPersona('s06', 'Amine', 'Saidi', 'student06', 'average',
                accuracy: 0.65, persistence: 0.65, startedDaysAgo: 87, lastSeenDaysAgo: 2,
                density: 0.38, reach: 0.6, noteAppetite: 3, hintAppetite: 2,
                weakPoints: ['4am_bahth-pgcd_P4']),
            new DemoPersona('s07', 'Maria', 'Benali', 'student07', 'average',
                accuracy: 0.7, persistence: 0.72, startedDaysAgo: 80, lastSeenDaysAgo: 4,
                density: 0.36, reach: 0.58, noteAppetite: 3, hintAppetite: 2),
            new DemoPersona('s08', 'Anis', 'Belkacem', 'student08', 'average',
                accuracy: 0.63, persistence: 0.6, startedDaysAgo: 84, lastSeenDaysAgo: 5,
                density: 0.34, reach: 0.55, noteAppetite: 2, hintAppetite: 2,
                weakPoints: ['4am_ikhtizal-kasr_P3']),
            new DemoPersona('s09', 'Aya', 'Bensalem', 'student09', 'average',
                accuracy: 0.72, persistence: 0.7, startedDaysAgo: 78, lastSeenDaysAgo: 2,
                density: 0.38, reach: 0.6, noteAppetite: 3, hintAppetite: 1),
            new DemoPersona('s10', 'Islam', 'Haddad', 'student10', 'average',
                accuracy: 0.66, persistence: 0.62, startedDaysAgo: 82, lastSeenDaysAgo: 6,
                density: 0.33, reach: 0.52, noteAppetite: 2, hintAppetite: 2),
            new DemoPersona('s11', 'Nour', 'Belhadj', 'student11', 'slow-persistent',
                accuracy: 0.58, persistence: 0.92, startedDaysAgo: 91, lastSeenDaysAgo: 1,
                density: 0.6, reach: 0.6, noteAppetite: 8, hintAppetite: 3,
                weakPoints: ['4am_qawasim-adad-tabii_P3']),

            // --- en difficulté / irréguliers (3/16) ---------------------
            new DemoPersona('s12', 'Sofiane', 'Torki', 'student12', 'struggling',
                accuracy: 0.38, persistence: 0.5, startedDaysAgo: 86, lastSeenDaysAgo: 3,
                density: 0.3, reach: 0.38, noteAppetite: 7, hintAppetite: 3,
                weakPoints: ['4am_qasim-adad-tabii_P1', '4am_qawasim-adad-tabii_P2', '4am_tayin-pgcd_P1']),
            new DemoPersona('s13', 'Wassim', 'Guerrouj', 'student13', 'error-heavy',
                accuracy: 0.34, persistence: 0.75, startedDaysAgo: 88, lastSeenDaysAgo: 2,
                density: 0.45, reach: 0.45, noteAppetite: 11, hintAppetite: 3,
                weakPoints: ['4am_qasim-adad-tabii_P2', '4am_qasim-mushtarak-akbar_P3', '4am_ikhtizal-kasr_P3', '4am_awwaliyan-fima-baynahuma_P1']),
            new DemoPersona('s14', 'Imene', 'Ferhat', 'student14', 'irregular',
                accuracy: 0.6, persistence: 0.45, startedDaysAgo: 90, lastSeenDaysAgo: 4,
                density: 0.55, reach: 0.5, noteAppetite: 2, hintAppetite: 2,
                gapLengths: [16, 11]),

            // --- cas de bord (3/16) ------------------------------------
            new DemoPersona('s15', 'Farid', 'Ziani', 'student15', 'inactive',
                accuracy: 0.55, persistence: 0.5, startedDaysAgo: 89, lastSeenDaysAgo: 38,
                density: 0.4, reach: 0.3, noteAppetite: 2, hintAppetite: 2),
            new DemoPersona('s16', 'Malak', 'Ouali', 'student16', 'returning',
                accuracy: 0.62, persistence: 0.6, startedDaysAgo: 87, lastSeenDaysAgo: 0,
                density: 0.5, reach: 0.48, noteAppetite: 3, hintAppetite: 2,
                gapLengths: [31]),
            new DemoPersona('s17', 'Adem', 'Slimani', 'student17', 'new',
                accuracy: 0.6, persistence: 0.6, startedDaysAgo: 9, lastSeenDaysAgo: 1,
                density: 0.5, reach: 0.12, noteAppetite: 1, hintAppetite: 2),
            new DemoPersona('s18', 'Khadidja', 'Brahimi', 'student18', 'new',
                accuracy: 0.74, persistence: 0.7, startedDaysAgo: 5, lastSeenDaysAgo: 0,
                density: 0.7, reach: 0.12, noteAppetite: 1, hintAppetite: 1),
        ];

        $out = [];
        foreach ($personas as $persona) {
            $out[$persona->key] = [
                'persona' => $persona,
                'user' => $this->account(
                    $persona->email.self::DEMO_DOMAIN,
                    $persona->firstName, $persona->lastName,
                    User::ROLE_STUDENT, self::STUDENT_PASSWORD, '4am',
                    $persona->startedDaysAgo
                ),
            ];
        }

        $this->totals['students'] = count($out);

        return $out;
    }

    /**
     * Les classes, leurs élèves et la visibilité des leçons.
     *
     * Tout passe par les SERVICES DU DOMAINE, jamais par des insertions
     * directes : c'est ainsi que les limites de sièges, la capacité et le
     * journal d'activité restent vrais. Un élève refusé par la capacité est
     * un fait de la démonstration, pas un bug à contourner.
     */
    private function classes(User $admin, array $teachers, array $students): void
    {
        $classService = app(ClassroomService::class);
        $memberships = app(ClassroomMembershipService::class);
        $lessons = app(ClassroomLessonService::class);

        $created = 0;
        $joined = 0;

        // --- Enseignant principal : deux classes de 4AM ------------------
        $groupA = $classService->create($teachers['main'], [
            'name' => 'الرابعة متوسط — الفوج أ',
            'description' => 'فوج الصباح — متوسطة الأمير عبد القادر',
            'grade' => '4am',
            'academicYear' => '2026/2027',
        ]);
        $groupB = $classService->create($teachers['main'], [
            'name' => 'الرابعة متوسط — الفوج ب',
            'description' => 'فوج المساء',
            'grade' => '4am',
            'academicYear' => '2026/2027',
        ]);
        $created += 2;

        // Le fourre-tout pédagogique : le groupe A reçoit la classe mixte —
        // c'est LUI qu'on ouvre pour juger de la lecture enseignant.
        $groupAKeys = ['s01', 's04', 's06', 's08', 's11', 's12', 's13', 's15', 's17'];
        $groupBKeys = ['s02', 's05', 's07', 's09', 's14', 's16'];

        foreach ($groupAKeys as $key) {
            $joined += $this->seat($memberships, $students[$key], $groupA, 78);
        }
        foreach ($groupBKeys as $key) {
            $joined += $this->seat($memberships, $students[$key], $groupB, 70);
        }

        // --- Seconde enseignante : une classe ---------------------------
        $groupC = $classService->create($teachers['second'], [
            'name' => 'الرابعة متوسط — فوج الدعم',
            'description' => 'حصص الدعم — يومي الثلاثاء والخميس',
            'grade' => '4am',
            'academicYear' => '2026/2027',
        ]);
        $created++;
        foreach (['s03', 's10', 's13', 's18'] as $key) {
            $joined += $this->seat($memberships, $students[$key], $groupC, 55);
        }

        // --- Enseignant au forfait gratuit : petite classe, 5 sièges -----
        $groupD = $classService->create($teachers['free'], [
            'name' => 'الرابعة متوسط — مجموعة تجريبية',
            'description' => 'مجموعة صغيرة لتجربة المنصّة',
            'grade' => '4am',
            'academicYear' => '2026/2027',
        ]);
        $created++;
        foreach (['s05', 's12'] as $key) {
            $joined += $this->seat($memberships, $students[$key], $groupD, 30);
        }

        // --- Visibilité des leçons : chaque classe en est à un point ----
        // Le groupe A est le plus avancé ; le groupe B garde les deux
        // dernières leçons masquées ; le groupe de dépannage n'a ouvert que
        // le début de l'unité.
        $ordered = $this->content->lessons->values();
        $this->hideFrom($lessons, $teachers['main'], $groupA, $ordered, 8);
        $this->hideFrom($lessons, $teachers['main'], $groupB, $ordered, 6);
        $this->hideFrom($lessons, $teachers['second'], $groupC, $ordered, 4);
        $this->hideFrom($lessons, $teachers['free'], $groupD, $ordered, 3);

        $this->groups = ['A' => $groupA, 'B' => $groupB, 'C' => $groupC, 'D' => $groupD];
        $this->totals['classes'] = $created;
        $this->totals['memberships'] = $joined;
    }

    /**
     * Les gestes de l'enseignant principal dans le groupe A — la boucle
     * DÉTECTER → INTERVENIR → MESURER, sur la preuve simulée.
     *
     *   1. une intervention d'il y a neuf jours sur le point où des élèves
     *      étaient alors en ثغرة et ont depuis progressé : « ما حدث بعده »
     *      montre un changement RÉEL (la preuve postérieure du simulateur) ;
     *   2. un renforcement en classe, d'il y a trois jours, sur la
     *      difficulté partagée que « تستحقّ نظرة » signale aujourd'hui ;
     *   3. une observation privée, sans point, sur un élève silencieux.
     *
     * Chaque intervention passe par le service (mêmes contrôles qu'en
     * production), puis est DATÉE dans le passé comme le simulateur date sa
     * preuve : sa photographie de départ est relue dans l'histoire des états
     * (learning_point_state_transitions) à la date du geste.
     */
    private function interventions(array $teachers): void
    {
        $classroom = $this->groups['A'] ?? null;
        if ($classroom === null) {
            return;
        }
        $teacher = $teachers['main'];
        $service = app(ClassroomInterventionService::class);
        $members = ClassroomMembership::where('classroom_id', $classroom->id)->active()->pluck('student_id')->all();
        $created = 0;

        // 1. Là où des élèves en ثغرة il y a neuf jours ont depuis progressé.
        $then = now()->subDays(9);
        $improvers = [];
        foreach (DB::table('student_learning_point_progress')->whereIn('user_id', $members)->whereIn('status', ['reinforce', 'mastered'])->get(['user_id', 'learning_point_id']) as $row) {
            if ($this->statusAt((int) $row->user_id, (int) $row->learning_point_id, $then) === 'gap') {
                $improvers[(int) $row->learning_point_id][] = (int) $row->user_id;
            }
        }
        uasort($improvers, fn ($a, $b) => count($b) <=> count($a));
        $pointId = array_key_first($improvers);
        if ($pointId !== null) {
            $code = DB::table('learning_points')->where('id', $pointId)->value('code');
            $iv = $service->create($teacher, $classroom, [
                'kind' => 'recommend_practice',
                'studentIds' => $improvers[$pointId],
                'learningPointCode' => $code,
                'note' => 'راجعنا القاعدة معًا في الحصّة، واقترحت عليهم تمارين المستوى الأوّل.',
                'studentMessage' => 'تمرّن على هذه النقطة قبل الفرض.',
                'sourceSignal' => 'repeated_difficulty',
            ]);
            $this->backdate($iv, $then);
            $created++;
        }

        // 2. La difficulté partagée d'aujourd'hui.
        $signals = collect(app(ClassroomInsightService::class)->attention($classroom)['signals']);
        $shared = $signals->firstWhere('type', 'class_difficulty');
        if ($shared !== null) {
            $iv = $service->create($teacher, $classroom, [
                'kind' => 'class_reinforcement',
                'studentIds' => array_column($shared['students'], 'id'),
                'learningPointCode' => $shared['learningPoint']['code'],
                'note' => 'حصّة دعم مبرمجة يوم الخميس على هذه النقطة.',
                'reviewAfter' => now()->addDays(7)->toDateString(),
                'sourceSignal' => 'class_difficulty',
            ]);
            $this->backdate($iv, now()->subDays(3));
            $created++;
        }

        // 3. Un élève silencieux : une observation, sans point.
        $silent = $signals->firstWhere('type', 'no_recent_activity');
        if ($silent !== null) {
            $service->create($teacher, $classroom, [
                'kind' => 'observation',
                'studentIds' => [$silent['students'][0]['id']],
                'note' => 'غائب عن المنصّة، لكنه يُنجز أعماله على الكرّاس الورقي. سأتحدّث مع وليّه.',
            ]);
            $created++;
        }

        $this->totals['interventions'] = $created;
    }

    /** Le statut d'un couple à une date, lu dans l'histoire des états. */
    private function statusAt(int $userId, int $pointId, Carbon $at): ?string
    {
        return LearningPointStateTransition::where('user_id', $userId)->where('learning_point_id', $pointId)
            ->where('occurred_at', '<=', $at)->orderByDesc('occurred_at')->orderByDesc('id')->value('status_after');
    }

    /** Date un geste dans le passé, et refait sa photographie de départ à cette date. */
    private function backdate(ClassroomIntervention $iv, Carbon $at): void
    {
        $students = [];
        foreach ($iv->students()->pluck('users.id') as $id) {
            $t = LearningPointStateTransition::where('user_id', $id)->where('learning_point_id', $iv->learning_point_id)
                ->where('occurred_at', '<=', $at)->orderByDesc('occurred_at')->orderByDesc('id')->first();
            $students[(string) $id] = [
                'status' => $t?->status_after ?? 'unassessed',
                'reason' => $t?->reason_after,
                'confidence' => $t?->confidence_after,
                'attempts' => null,
                'distinctItemsSuccess' => null,
                'lastEvidenceAt' => $t?->occurred_at?->toIso8601String(),
            ];
        }
        $iv->forceFill([
            'opened_at' => $at,
            'created_at' => $at,
            'baseline' => ['takenAt' => $at->toIso8601String(), 'students' => $students],
        ])->save();
    }

    /** Assoit un élève, en datant son adhésion. Renvoie 1 s'il est entré. */
    private function seat(ClassroomMembershipService $service, array $student, Classroom $classroom, int $daysAgo): int
    {
        try {
            $membership = $service->join($student['user'], $classroom, ClassroomMembership::VIA_JOIN_CODE, null, consented: true);
        } catch (\Throwable $e) {
            // Une capacité épuisée est une information, pas un échec : on la
            // dit, et la démonstration continue.
            $this->command?->warn(
                'Siège refusé pour '.$student['user']->email.' dans « '.$classroom->name.' » : '.$e->getMessage()
            );

            return 0;
        }

        // L'adhésion est antérieure : un élève n'a pas rejoint sa classe
        // aujourd'hui s'il y travaille depuis dix semaines.
        $at = Carbon::now()->subDays(min($daysAgo, $student['persona']->startedDaysAgo));
        $membership->forceFill(['joined_at' => $at, 'created_at' => $at, 'updated_at' => $at])->save();

        return 1;
    }

    /** Masque les leçons au-delà du point où la classe est arrivée. */
    private function hideFrom(ClassroomLessonService $service, User $teacher, Classroom $classroom, $ordered, int $visibleCount): void
    {
        $hidden = $ordered->slice($visibleCount)->pluck('id')->all();
        if ($hidden === []) {
            return;
        }

        try {
            $service->bulkSetStatus($teacher, $classroom, $hidden, ClassroomLesson::STATUS_HIDDEN);
        } catch (\Throwable $e) {
            // L'offre gratuite n'a pas les actions groupées : on passe leçon
            // par leçon, ce que son offre autorise.
            foreach ($hidden as $lessonId) {
                try {
                    $service->setStatus($teacher, $classroom, $lessonId, ClassroomLesson::STATUS_HIDDEN);
                } catch (\Throwable) {
                    // Une offre sans le droit de masquer : c'est un fait de
                    // la démonstration, pas une erreur.
                    return;
                }
            }
        }
    }

    /**
     * L'accès des élèves. Le contenu de l'unité 1 est entièrement gratuit :
     * ces abonnements ne débloquent rien aujourd'hui, ils peuplent le
     * panneau d'administration d'états réalistes (actif, expiré, gratuit).
     */
    private function studentAccess(User $admin, array $students): void
    {
        $plan = Plan::where('slug', 'student-premium')->first();
        if ($plan === null) {
            return;
        }

        $activation = app(SubscriptionActivationService::class);
        $count = 0;

        // Deux élèves dont la famille a payé hors plateforme.
        foreach (['s01', 's04'] as $key) {
            $activation->activate(
                $admin, $students[$key]['user'], $plan, null,
                Carbon::now()->addDays(240), 'Paiement reçu hors plateforme', null
            );
            $count++;
        }

        // Un abonnement arrivé à expiration : le compte retombe sur l'offre
        // par défaut, sans rien perdre de sa progression.
        $expired = $activation->activate(
            $admin, $students['s15']['user'], $plan, null,
            Carbon::now()->addDays(30), 'Abonnement de l\'an dernier', null
        );
        $expired->forceFill([
            'status' => Subscription::STATUS_EXPIRED,
            'started_at' => Carbon::now()->subDays(88),
            'ends_at' => Carbon::now()->subDays(12),
        ])->save();
        DB::table('entitlements')
            ->where('user_id', $students['s15']['user']->id)
            ->update(['status' => 'revoked', 'revoked_at' => Carbon::now()->subDays(12)]);
        $count++;

        $this->totals['subscriptions'] = $count;
    }

    /** Déroule les trois mois de chaque élève. */
    private function simulate(array $students): void
    {
        $this->command?->info('Simulation de trois mois d\'activité…');

        $sum = [];
        foreach ($students as $key => $entry) {
            $counters = $this->simulator->run($entry['user'], $entry['persona']);
            foreach ($counters as $name => $value) {
                $sum[$name] = ($sum[$name] ?? 0) + $value;
            }
            $this->command?->line(sprintf(
                '  %-12s %-22s %2d leçons · %3d séances · %4d réponses · %2d notes',
                $entry['persona']->scenario,
                $entry['user']->email,
                $counters['lessonsStarted'],
                $counters['sessions'],
                $counters['questionAttempts'],
                $counters['notes'],
            ));
        }

        $this->totals = [...$this->totals, ...$sum];
    }

    /**
     * Un compte. Le mot de passe est TOUJOURS posé : contrairement à
     * l'administrateur d'amorçage, un compte de démonstration doit rester
     * ouvrable avec les identifiants publiés dans le rapport.
     */
    private function account(string $email, string $first, string $last, string $role, string $password, ?string $grade, int $createdDaysAgo): User
    {
        $at = Carbon::now()->subDays($createdDaysAgo);

        $user = User::updateOrCreate(['email' => $email], [
            'first_name' => $first,
            'last_name' => $last,
            'role' => $role,
            'grade' => $grade,
            'account_status' => User::STATUS_ACTIVE,
            'password' => Hash::make($password),
            'email_verified_at' => $at,
            'terms_accepted_version' => '1.0',
            'privacy_policy_accepted_version' => '1.0',
            'legal_consent_at' => $at,
        ]);

        $user->forceFill(['created_at' => $at, 'updated_at' => $at])->save();

        return $user;
    }

    /**
     * « التحدّي اليومي » : deux semaines de défis joués par le service de
     * production, et les quatre configurations de classe (Demo/DemoDailyChallenges).
     */
    private function dailyChallenges(array $teachers, array $students): void
    {
        $this->command?->info('Défis quotidiens (14 jours)…');
        $demo = new DemoDailyChallenges($this->content);
        $demo->run($students, $this->groups, $teachers['main'], $teachers['second'], $teachers['free']);
        $this->totals += $demo->totals;
    }

    private function report(): void
    {
        $this->command?->newLine();
        $this->command?->info('=== Données de démonstration créées ===');
        foreach ($this->totals as $name => $value) {
            $this->command?->line(sprintf('  %-20s %d', $name, $value));
        }
        $this->command?->newLine();
        $this->command?->info('Comptes : admin / teacher01-03 / student01-18 '.self::DEMO_DOMAIN);
    }
}
