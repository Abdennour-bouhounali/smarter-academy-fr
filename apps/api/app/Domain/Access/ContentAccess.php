<?php

namespace App\Domain\Access;

use App\Domain\Classroom\StudyContextService;
use App\Models\Lesson;
use App\Models\PracticeExercise;
use App\Models\User;
use DomainException;
use Illuminate\Support\Collection;

/**
 * La porte d'accès au contenu — UN seul endroit.
 *
 * La spec (§24) demande que la décision d'accès soit centralisée plutôt que
 * dispersée en conditions dans des composants. C'est ici.
 *
 * L'ordre est celui du contrat :
 *
 *     état du compte  (middleware account.active, en amont de toute route)
 *          ↓
 *     droit d'accès / palier          ← EntitlementService
 *          ↓
 *     état de publication du contenu  ← ce fichier
 *
 * LES DEUX DOIVENT ÊTRE SATISFAITS, et ils ne se remplacent jamais l'un
 * l'autre. C'est l'invariant central de cette couche :
 *
 *     droit valide + leçon masquée  = REFUS
 *     leçon publiée + aucun droit   = REFUS
 *
 * En particulier, une dérogation d'administration n'est PAS un passe-droit
 * vers du contenu non publié (spec §29) : elle répond « cet élève a la
 * permission commerciale », pas « ce contenu peut être servi ». Un contenu
 * masqué l'est parce qu'il est faux ou en cours de relecture — le montrer à
 * quelqu'un qui a payé serait pire, pas mieux.
 *
 * Le palier est évalué AVANT la publication pour que le message rendu soit le
 * plus utile des deux : à un élève sans abonnement devant une leçon payante
 * et masquée, « il faut un accès premium » est actionnable là où « leçon
 * indisponible » ne l'est pas.
 *
 * Une leçon ABSENTE du registre reste accessible : la base est un miroir du
 * contenu, pas son autorité. Refuser ce qui n'est pas encore importé
 * fermerait la plateforme au premier oubli de synchronisation.
 *
 * ── QUI voit QUEL état (2026-10-07, décision propriétaire) ───────────────
 *
 *     published   tout le monde (élève, enseignant, visiteur, ambassadeur, admin)
 *     hidden      l'ADMINISTRATEUR et les enseignants AMBASSADEURS (« سفراء »)
 *     draft       l'ADMINISTRATEUR seulement
 *     archived    l'ADMINISTRATEUR seulement
 *
 * Avant cette date, l'ambassadeur voyait aussi le brouillon et l'archivé. Le
 * masqué est le contenu « prêt mais retenu » que l'ambassadeur relit ; le
 * brouillon et l'archivé restent une affaire d'administration.
 *
 * Seul l'axe PUBLICATION varie selon le compte : la classe active et le palier
 * restent évalués (le palier laisse passer enseignant et admin de lui-même,
 * voir EntitlementService). L'inventaire rend à celui qui voit plus que le
 * publié l'ÉTAT de chaque contenu non publié qu'il voit, pour que l'interface
 * l'affiche en badge. Aucune écriture ne s'ouvre : la progression reste
 * derrière le middleware `learner`.
 */
class ContentAccess
{
    /**
     * Les états de publication que CE compte peut voir — l'unique table de
     * la règle ci-dessus. Liste blanche : un état inconnu n'est vu que par
     * l'administrateur (voir canSee).
     *
     * @return string[]
     */
    public static function visibleStatuses(?User $user): array
    {
        if ($user?->isAdmin()) {
            return Lesson::PUBLICATION_STATUSES;
        }

        if ($user?->isAmbassador()) {
            return [Lesson::PUB_PUBLISHED, Lesson::PUB_HIDDEN];
        }

        return [Lesson::PUB_PUBLISHED];
    }

    /** Ce compte peut-il voir un contenu dans cet état ? */
    public static function canSee(?User $user, ?string $status): bool
    {
        // L'administrateur voit tout, y compris un état ajouté plus tard.
        if ($user?->isAdmin()) {
            return true;
        }

        return in_array($status, self::visibleStatuses($user), true);
    }

    /** Ce compte voit-il au-delà du publié ? (badges d'état, inventaire) */
    public static function seesUnpublished(?User $user): bool
    {
        return count(self::visibleStatuses($user)) > 1;
    }

    /**
     * La leçon est-elle ouverte à CET élève ?
     *
     * $user est explicite plutôt que lu depuis auth() : une décision d'accès
     * qui va chercher son sujet dans un état global est une décision qu'on ne
     * peut pas tester en table de vérité, et c'est exactement ce que la
     * matrice de la spec §40 demande de couvrir. Null = visiteur anonyme.
     *
     * @throws DomainException si le palier n'est pas satisfait, ou si la
     *                         leçon est masquée, archivée ou en brouillon.
     */
    public static function assertLessonAvailable(string $lessonCode, ?User $user = null): void
    {
        $lessons = Lesson::with('chapter.grade')->where('code', $lessonCode)->get();

        // Inconnue du registre : on laisse passer (voir le docblock).
        if ($lessons->isEmpty()) {
            return;
        }

        self::assertGradeActive($lessons);
        self::assertEntitled($lessons, $user);

        // Un code de leçon se répète d'une classe à l'autre. Si AU MOINS une
        // des leçons portant ce code est visible pour ce compte, l'accès reste
        // ouvert : masquer la version de 6e ne doit pas fermer celle de 3e.
        if (! $lessons->contains(fn (Lesson $lesson) => self::canSee($user, $lesson->publication_status))) {
            throw new DomainException('Cette leçon n\'est pas disponible pour le moment.');
        }

        // ── Le TROISIÈME axe : la classe de l'enseignant ─────────────────
        // Après la publication et le palier, jamais à leur place : masquer
        // pour une classe n'ouvre rien de non publié, et une leçon publiée
        // reste fermée à l'élève dont l'enseignant l'a masquée. La règle
        // « une porte ouverte = ouvert » vaut ici aussi (voir
        // StudyContextService::hiddenLessonCodes).
        self::assertNotHiddenByClass($lessonCode, $user);
    }

    /** Motif rendu au client quand l'enseignant a masqué la leçon. */
    public const HIDDEN_BY_TEACHER = 'hidden_by_teacher';

    /**
     * @throws DomainException si l'enseignant de l'élève a masqué la leçon.
     */
    private static function assertNotHiddenByClass(string $lessonCode, ?User $user): void
    {
        if ($user === null || ! $user->isStudent()) {
            return;
        }

        if (in_array($lessonCode, app(StudyContextService::class)->hiddenLessonCodesFor($user), true)) {
            throw new DomainException('Cette leçon n\'est pas disponible dans votre classe.');
        }
    }

    /**
     * Le MODULE est-il ouvert ?
     *
     * UN MODULE N'A PAS D'ÉTAT PROPRE (propriétaire, 2026-11-11) : il est
     * ouvert exactement quand sa leçon l'est — état de publication, palier,
     * classe active et masquage par l'enseignant compris. La colonne
     * `lesson_modules.publication_status` n'est qu'une copie de celle de la
     * leçon (ContentService::changeStatus, ContentRegistryImporter) et n'est
     * pas lue ici.
     *
     * @throws DomainException si la leçon du module est fermée à ce compte.
     */
    public static function assertModuleAvailable(string $lessonCode, int|string $moduleRef, ?User $user = null): void
    {
        self::assertLessonAvailable($lessonCode, $user);
    }

    /** Variante non levante, pour filtrer une liste. */
    public static function isModuleAvailable(string $lessonCode, int|string $moduleRef, ?User $user = null): bool
    {
        try {
            self::assertModuleAvailable($lessonCode, $moduleRef, $user);

            return true;
        } catch (DomainException) {
            return false;
        }
    }

    /**
     * L'exercice est-il ouvert à CET élève ?
     *
     * Deux dimensions, comme partout : la publication et le palier.
     *
     * Le palier de la LEÇON a déjà été tranché en amont — les deux points
     * d'entrée qui ouvrent un exercice (ouvrir une séance, ouvrir une
     * question) passent par assertLessonAvailable. Ce qui reste à vérifier
     * ici, c'est le palier PROPRE à l'exercice : un exercice explicitement
     * payant sous une leçon gratuite. Sans ce contrôle, il suffirait d'une
     * leçon gratuite pour servir gratuitement tout exercice premium qu'elle
     * contient.
     *
     * Le contrôle ne coûte rien quand il n'y a rien à contrôler : `tier` est
     * null pour tout le registre actuel, donc la branche premium n'est même
     * pas atteinte et aucune requête de droits n'est faite.
     */
    public static function isExerciseAvailable(string $lessonCode, string $exerciseCode, ?User $user = null): bool
    {
        $exercise = PracticeExercise::with('lesson:id,tier')
            ->whereHas('lesson', fn ($q) => $q->where('code', $lessonCode))
            ->where('exercise_code', $exerciseCode)
            ->first();

        // Inconnu du registre : servi. La base miroite le contenu, elle n'en
        // est pas l'autorité — même règle qu'aux deux niveaux au-dessus.
        if ($exercise === null) {
            return true;
        }

        if (! self::canSee($user, $exercise->publication_status)) {
            return false;
        }

        $tier = AccessTier::effective($exercise->tier, $exercise->lesson?->tier);

        if ($tier === AccessTier::FREE) {
            return true;
        }

        return app(EntitlementService::class)->satisfies($user, AccessTier::PREMIUM);
    }

    /**
     * Isolement des classes dormantes (docs/ALGERIA_MIGRATION_AUDIT.md §15,
     * ALGERIA_PLATFORM_MASTER_SPEC.md §3, §10).
     *
     * Le catalogue frontend (coursesData.js, filtré par activeGrades.js) et
     * le registre de leçons (registry.js) empêchent déjà la navigation vers
     * une classe française désactivée. Ce contrôle est le PENDANT côté
     * serveur : un client qui appelle directement /api/v1/lessons/{code}/*
     * avec un code de leçon français connu ne doit pas contourner
     * l'isolement simplement parce qu'il n'utilise pas la navigation.
     *
     * Même règle de composition qu'ailleurs dans ce fichier : un code peut
     * porter plusieurs leçons (une par classe). L'accès reste ouvert si
     * AU MOINS une porte une classe active — désactiver la version de
     * seconde ne doit pas fermer une future version 4AM du même code.
     *
     * L'autorité est `grades.is_active`, alimenté par l'import du catalogue
     * depuis packages/core/curriculum/activeGrades.js (une seule liste pour
     * le frontend ET l'API). Tant qu'aucune classe algérienne n'existe
     * (Phase 7 de la feuille de route), toute classe héritée du français est
     * fermée — y compris si sa publication_status vaut 'published', hérité
     * de France et sans rapport avec l'activation pour l'Algérie.
     *
     * @param  Collection<int, Lesson>  $lessons
     *
     * @throws DomainException si AUCUNE classe portée par ce code n'est active.
     */
    private static function assertGradeActive($lessons): void
    {
        if (! config('curriculum.enforce_active_grades', true)) {
            return;
        }

        if ($lessons->contains(fn (Lesson $l) => (bool) $l->chapter?->grade?->is_active)) {
            return;
        }

        throw new DomainException('Cette leçon n\'est pas disponible pour le moment.');
    }

    /**
     * Le palier exigé par un code de leçon est-il satisfait ?
     *
     * Un code peut porter plusieurs leçons (le même intitulé en 6e et en 3e).
     * On retient le palier le MOINS restrictif : si une seule des versions est
     * gratuite, l'accès reste ouvert — même règle que pour la publication
     * juste au-dessus, et pour la même raison. Rendre payante la version de 3e
     * ne doit pas fermer celle de 6e.
     *
     * @param  Collection<int, Lesson>  $lessons
     *
     * @throws DomainException si aucun palier porté par ce code n'est satisfait.
     */
    private static function assertEntitled($lessons, ?User $user): void
    {
        $tiers = $lessons->map(fn (Lesson $l) => AccessTier::normalize($l->tier))->unique();

        // Le cas de très loin le plus fréquent — tout le catalogue actuel.
        // Traité en premier et sans injection de service : le gratuit ne pose
        // aucune question à la base.
        if ($tiers->contains(AccessTier::FREE)) {
            $entitlements = app(EntitlementService::class);
            $decision = $entitlements->decide($user, AccessTier::FREE);
            if (! $decision->allowed) {
                throw new DomainException($decision->studentMessage());
            }

            return;
        }

        $decision = app(EntitlementService::class)->decide($user, AccessTier::PREMIUM);

        if (! $decision->allowed) {
            throw new DomainException($decision->studentMessage());
        }
    }

    /**
     * L'inventaire d'accès destiné à l'élève : ce qui est FERMÉ.
     *
     * Renvoyé en liste de fermetures plutôt qu'en liste d'ouvertures : le
     * catalogue vit dans le frontend (coursesData.js), la base n'en est que
     * le miroir. Envoyer « voici les 132 leçons ouvertes » ferait de la base
     * une seconde définition du catalogue, qui dériverait. Envoyer « voici
     * les 3 choses fermées » laisse une seule source de vérité au contenu, et
     * une seule autorité à la publication.
     *
     * Conséquence voulue : une leçon absente du registre reste ouverte.
     *
     * Pour un compte qui voit au-delà du publié (seesUnpublished : admin,
     * ambassadeur), seul ce qu'IL ne voit pas est fermé, et `statuses` dit
     * l'état de ce qui n'est pas publié mais qu'il voit — l'interface
     * l'affiche en badge. Pour tout autre compte, `statuses` est absent.
     *
     * @return array{lessons: string[], modules: array<string, int[]>, locked: string[], statuses?: array}
     */
    public static function closedInventory(?User $user = null): array
    {
        // Le rang sert à choisir l'état AFFICHÉ d'un code porté par plusieurs
        // leçons dont aucune n'est publiée : le plus « proche » du publié.
        $rank = [Lesson::PUB_HIDDEN => 0, Lesson::PUB_DRAFT => 1, Lesson::PUB_ARCHIVED => 2];
        $withStatuses = self::seesUnpublished($user);

        $closedLessons = [];
        $lessonStatuses = [];
        foreach (Lesson::query()->get(['code', 'publication_status'])->groupBy('code') as $code => $rows) {
            $states = $rows->pluck('publication_status');
            // Un code peut porter deux leçons (6e et 3e) : il n'est fermé que
            // si AUCUNE des deux n'est visible. Même règle qu'assertLessonAvailable.
            if ($states->contains(Lesson::PUB_PUBLISHED)) {
                continue;
            }
            $visible = $states->filter(fn ($s) => self::canSee($user, $s));
            if ($visible->isEmpty()) {
                $closedLessons[] = (string) $code;
            } elseif ($withStatuses) {
                $lessonStatuses[(string) $code] = $visible->sortBy(fn ($s) => $rank[$s] ?? 9)->first();
            }
        }

        // Un module n'a pas d'état propre (2026-11-11) : il est fermé avec sa
        // leçon, que `lessons` porte déjà. Les deux clés restent pour le client.
        $closedModules = [];
        $moduleStatuses = [];

        $premium = self::premiumLessonCodes();

        return [
            'lessons' => $closedLessons,
            'modules' => $closedModules,
            // Ce qui est PAYANT, et ce qui est payant ET fermé à cet élève.
            // Les deux listes, parce que les deux questions sont distinctes :
            // un abonné doit continuer de voir le badge « Premium » sur ce à
            // quoi il a accès (sinon le contenu vendu se déguise en gratuit,
            // et sa disparition à l'échéance devient incompréhensible), mais
            // rien ne doit lui être verrouillé.
            'premium' => $premium,
            'locked' => self::lockedLessonCodes($user, $premium),
            // Le troisième axe : ce que l'ENSEIGNANT a masqué pour cet
            // élève. Vide pour un élève indépendant — et pour un visiteur.
            'hiddenByClass' => $user !== null && $user->isStudent()
                ? app(StudyContextService::class)->hiddenLessonCodesFor($user)
                : [],
        ] + ($withStatuses
            ? ['statuses' => ['lessons' => (object) $lessonStatuses, 'modules' => (object) $moduleStatuses]]
            : []);
    }

    /**
     * Les codes de leçon PAYANTS, indépendamment de qui regarde.
     *
     * Le catalogue vit dans le bundle et peut être en retard sur la base :
     * une leçon rendue payante aujourd'hui y reste « gratuite » jusqu'au
     * prochain déploiement. Cette liste est donc la seule source à jour du
     * palier, et c'est pourquoi elle est servie même à un élève qui a accès
     * à tout.
     *
     * @return string[]
     */
    private static function premiumLessonCodes(): array
    {
        $premium = Lesson::query()
            ->where('tier', AccessTier::PREMIUM)
            ->pluck('code')
            ->unique();

        if ($premium->isEmpty()) {
            return [];
        }

        // Un code porté par AU MOINS une leçon gratuite n'est pas payant —
        // même règle que partout ailleurs dans ce fichier.
        $free = Lesson::query()
            ->whereIn('code', $premium)
            ->where('tier', '!=', AccessTier::PREMIUM)
            ->pluck('code')
            ->unique()
            ->flip();

        return $premium->reject(fn (string $code) => $free->has($code))->values()->all();
    }

    /**
     * Les leçons PUBLIÉES que cet élève n'a pas le droit d'ouvrir.
     *
     * Volontairement séparé de `lessons` (les fermetures de publication),
     * parce que les deux appellent des interfaces différentes : une leçon
     * non publiée n'existe pas pour l'élève, une leçon verrouillée existe et
     * lui dit ce qui lui manque. Les confondre afficherait « indisponible »
     * là où il fallait proposer un abonnement (spec §26).
     *
     * Renvoyé vide si l'élève a un accès premium : dans ce cas il n'y a rien
     * à verrouiller, et la réponse reste courte. Le badge, lui, reste porté
     * par `premium`.
     *
     * @param  string[]  $premiumCodes
     * @return string[]
     */
    private static function lockedLessonCodes(?User $user, array $premiumCodes): array
    {
        // Le catalogue est intégralement gratuit : rien à verrouiller, et
        // aucune question posée aux droits d'accès.
        if ($premiumCodes === []) {
            return [];
        }

        if (app(EntitlementService::class)->satisfies($user, AccessTier::PREMIUM)) {
            return [];
        }

        return $premiumCodes;
    }

    /**
     * Les identifiants d'exercice à retirer d'un inventaire, pour une leçon.
     *
     * Renvoyé en liste plutôt qu'interrogé exercice par exercice : le tirage
     * d'une séance en examine une quinzaine, et quinze requêtes là où une
     * suffit se paierait à chaque ouverture.
     *
     * @return string[]
     */
    public static function hiddenExerciseCodes(string $lessonCode): array
    {
        return PracticeExercise::whereHas('lesson', fn ($q) => $q->where('code', $lessonCode))
            ->where('publication_status', '!=', PracticeExercise::PUB_PUBLISHED)
            ->pluck('exercise_code')
            ->all();
    }
}
