<?php

namespace App\Providers;

use App\Domain\Access\EntitlementService;
use App\Domain\Access\Features\FeatureAccessService;
use App\Domain\Billing\PaymentProviderRegistry;
use App\Domain\Billing\SandboxPaymentProvider;
use App\Domain\Billing\Stripe\StripeEventTranslator;
use App\Domain\Billing\Stripe\StripePaymentProvider;
use App\Domain\Classroom\ClassroomProgressService;
use App\Domain\Classroom\StudyContextService;
use App\Domain\Plans\PlanEntitlementResolver;
use App\Models\Classroom;
use App\Models\User;
use App\Policies\ClassroomPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Http\Events\RequestHandled;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Web Push : l'envoi réel ; les tests le remplacent (BOOKS_STORE.md §6quater).
        $this->app->bind(\App\Domain\Push\PushSender::class, \App\Domain\Push\WebPushSender::class);

        /**
         * SINGLETON, et c'est la condition de sa mémorisation par requête.
         *
         * EntitlementService retient les droits déjà chargés le temps d'un
         * appel HTTP (voir sa méthode validEntitlements). Résolu à neuf à
         * chaque `app()`, ce cache serait toujours vide : une sauvegarde de
         * progression, qui vérifie la leçon puis le module, paierait deux
         * requêtes pour la même question.
         *
         * L'instance ne survit pas à la requête — un droit révoqué à l'instant
         * ferme donc l'accès au prochain appel, pas à l'expiration d'un cache.
         */
        $this->app->singleton(EntitlementService::class);

        // Même raison : ExerciseRepository mémorise l'index et les exercices
        // déjà lus le temps de la requête (le défi du jour en lisait des
        // milliers, une requête SQL de cache chacun). Voir sa classe.
        $this->app->singleton(\App\Domain\Practice\ExerciseRepository::class);

        /**
         * Deux autres mémoires PAR REQUÊTE, pour les mêmes raisons :
         *   — PlanEntitlementResolver : les limites d'offre d'un compte,
         *     relues une fois par requête, pas une fois par contrôle ;
         *   — StudyContextService : « dans quelle classe étudie cet élève ? »,
         *     posé par chaque carte de leçon et par ContentAccess.
         * Vidés à la frontière de requête ci-dessous.
         */
        $this->app->singleton(PlanEntitlementResolver::class);
        $this->app->singleton(StudyContextService::class);
        // Les leçons effectives d'une classe, lues par chaque vue enseignant.
        $this->app->singleton(ClassroomProgressService::class);
        // Les réglages « الوصول والحدود » et le palier d'un compte, relus une
        // fois par requête. La CONSOMMATION n'est jamais mémorisée.
        $this->app->singleton(FeatureAccessService::class);
        // « التحدّي اليومي » : la configuration effective, mémorisée par requête.
        $this->app->singleton(\App\Domain\DailyChallenge\DailyChallengeConfig::class);
        // « مدار » : les réglages de classe, mémorisés par requête.
        $this->app->singleton(\App\Domain\Madar\MadarConfig::class);

        /**
         * … mais RECOMMENCÉ à chaque requête.
         *
         * En production, chaque requête HTTP construit un conteneur neuf, donc
         * le cache naît vide : un droit révoqué ferme l'accès dès l'appel
         * suivant. Sous un noyau qui réutilise le processus — la suite de
         * tests, et tout serveur à état persistant du type Octane — le
         * singleton survivrait d'une requête à l'autre et continuerait de
         * servir un droit révoqué.
         *
         * Reposer sur « en général le processus meurt » serait faire dépendre
         * une décision de sécurité du mode d'exécution. On vide donc
         * explicitement à la frontière de requête : le comportement devient le
         * même partout, et il est vrai par construction plutôt que par chance.
         */
        $this->app->booted(function () {
            $this->app['events']->listen(
                RequestHandled::class,
                function () {
                    $this->app->make(EntitlementService::class)->forget();
                    $this->app->make(PlanEntitlementResolver::class)->forget();
                    $this->app->make(StudyContextService::class)->forget();
                    $this->app->make(ClassroomProgressService::class)->forget();
                    $this->app->make(FeatureAccessService::class)->forget();
                    $this->app->make(\App\Domain\DailyChallenge\DailyChallengeConfig::class)->forget();
                    $this->app->make(\App\Domain\Madar\MadarConfig::class)->forget();
                },
            );
        });

        /**
         * Les fournisseurs de paiement reconnus — une LISTE BLANCHE.
         *
         * Le nom vient de l'URL du webhook, donc d'une source publique.
         * Résoudre une classe depuis cette valeur offrirait un point
         * d'instanciation arbitraire ; seul ce qui est enregistré ici existe.
         *
         * Le registre est un singleton pour qu'un test puisse y substituer un
         * faux fournisseur et exercer toute la chaîne d'idempotence sans SDK
         * ni réseau.
         */
        $this->app->singleton(PaymentProviderRegistry::class, function ($app) {
            $registry = new PaymentProviderRegistry;

            $registry->register(new StripePaymentProvider(
                $app->make(StripeEventTranslator::class),
                config('services.stripe.webhook_secret'),
                config('services.stripe.secret'),
                (int) config('services.stripe.webhook_tolerance', 300),
            ));

            // Le bac à sable : pour éprouver le parcours au navigateur sans
            // clé d'API ni réseau. JAMAIS hors d'un environnement local — un
            // déploiement qui hériterait de la variable ne l'obtiendrait pas.
            if ($app->environment('local', 'testing')) {
                $registry->register(new SandboxPaymentProvider);
            }

            return $registry;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // `last_used_at` écrit au plus toutes les cinq minutes, pas à chaque requête.
        \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(\App\Models\PersonalAccessToken::class);

        Gate::define('admin', fn (User $user) => $user->role === 'admin');

        // Le rôle ENSEIGNANT — première couche d'autorisation des routes
        // /teacher. La propriété d'une classe est la deuxième (ClassroomPolicy),
        // l'offre la troisième (PlanEntitlementResolver, dans les services).
        Gate::define('teacher', fn (User $user) => $user->role === User::ROLE_TEACHER);
        // « فضاء الوليّ » : le compte parent (PARENT_SPACE.md).
        Gate::define('parent', fn (User $user) => $user->role === User::ROLE_PARENT);
        // « فضاء الإدارة » : le directeur d'un établissement. Le rôle est la
        // première couche ; la nomination active (SchoolAccess::schoolOf) la
        // deuxième (SCHOOL_ADMIN_SPACE.md §2).
        Gate::define('school', fn (User $user) => $user->role === User::ROLE_SCHOOL_ADMIN);
        // La LIBRAIRIE : l'administrateur ET le gestionnaire « مسيّر المكتبة »
        // (BOOKS_STORE.md §6ter). Seules les routes livres et « حسابي » la portent.
        Gate::define('books', fn (User $user) => in_array($user->role, [User::ROLE_ADMIN, User::ROLE_BOOK_MANAGER], true));
        Gate::policy(Classroom::class, ClassroomPolicy::class);

        /**
         * Rejoindre une classe : deux compteurs, comme la saisie d'un code
         * d'activation — un code de classe est court (six symboles) et se
         * tâtonne plus vite qu'un code d'activation.
         */
        RateLimiter::for('classroom-join', fn (Request $request) => [
            Limit::perMinute(10)->by('classroom-join-user:'.($request->user()?->id ?? $request->ip())),
            Limit::perHour(60)->by('classroom-join-ip:'.$request->ip()),
        ]);

        /**
         * La saisie d'un code d'activation — DEUX compteurs, et c'est la
         * raison d'être de cette limite nommée.
         *
         * Partout ailleurs dans routes/api.php, un `throttle:6,1` en ligne
         * suffit. Ici il en faut deux, et deux `throttle:` successifs sur la
         * même route partageraient la même clé de cache : le second
         * n'ajouterait rien. Un limiteur nommé qui rend un TABLEAU applique
         * bien les deux, chacun avec sa propre clé.
         *
         *   par compte, 5/min  → un élève qui se trompe retape aussitôt ;
         *                        un script qui tâtonne s'arrête au sixième.
         *   par IP, 30/heure   → ferme le contournement évident du premier :
         *                        créer des comptes pour multiplier les essais.
         *
         * L'ordre de grandeur à battre : 2^60 codes possibles. Ces limites ne
         * sont pas ce qui rend l'attaque impossible — l'entropie s'en charge —
         * elles rendent inutile de même l'essayer, et gardent la table de
         * codes à l'abri d'un flot de requêtes.
         */
        RateLimiter::for('activation-redeem', fn (Request $request) => [
            Limit::perMinute(5)->by('activation-user:'.($request->user()?->id ?? $request->ip())),
            Limit::perHour(30)->by('activation-ip:'.$request->ip()),
        ]);

        /**
         * La LIBRAIRIE (BOOKS_STORE.md) : commande et message d'un visiteur.
         *
         * Nommés, et non `throttle:8,10` en ligne : la clé d'un throttle en
         * ligne est « domaine|IP », SANS la route — elle partage donc son
         * compteur avec toutes les autres routes publiques en ligne que la
         * page appelle à chaque chargement. Constaté le 2026-10-17 : la simple
         * navigation épuisait les 8 commandes autorisées (429 au premier envoi).
         */
        RateLimiter::for('book-orders', fn (Request $request) => [
            Limit::perMinutes(10, 8)->by('book-order-ip:'.$request->ip()),
        ]);
        RateLimiter::for('book-messages', fn (Request $request) => [
            Limit::perMinutes(10, 5)->by('book-message-ip:'.$request->ip()),
        ]);
        // « رابط الوليّ » (PARENT_SPACE.md §2) : lecture publique, et un compteur À PART
        // pour le code à 4 chiffres — deux `throttle:n,1` anonymes partageraient la même clé.
        RateLimiter::for('parent-link', fn (Request $request) => [
            Limit::perMinute(60)->by('parent-link-ip:'.$request->ip()),
        ]);
        RateLimiter::for('parent-link-pin', fn (Request $request) => [
            Limit::perMinute(10)->by('parent-link-pin:'.$request->ip().':'.$request->route('token')),
        ]);
    }
}
