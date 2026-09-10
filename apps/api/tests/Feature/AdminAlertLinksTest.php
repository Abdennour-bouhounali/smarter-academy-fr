<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Les liens d'alerte du tableau de bord mènent quelque part.
 *
 * DashboardService est le seul endroit du backend qui fabrique des chemins de
 * l'interface React. Rien ne les vérifie : un chemin faux ne provoque aucune
 * erreur — le routeur retombe sur `*` et affiche la page d'ACCUEIL. C'est
 * exactement ce qui est arrivé aux trois alertes, écrites en anglais
 * (/admin/reports) alors que les routes sont en français
 * (/admin/signalements).
 *
 * Ce test lit App.jsx et compare. Il vit côté backend parce que c'est le
 * backend qui écrit ces chaînes.
 */
class AdminAlertLinksTest extends TestCase
{
    use RefreshDatabase;

    /** Les chemins déclarés sous <Route path="/admin"> dans App.jsx. */
    private function declaredAdminRoutes(): array
    {
        $app = file_get_contents(base_path('../../apps/web/src/App.jsx'));

        $this->assertNotFalse($app, 'App.jsx introuvable : le test ne peut rien vérifier.');

        preg_match_all('/<Route\s+path="([^"]+)"/', $app, $matches);

        $routes = ['/admin'];
        foreach ($matches[1] as $path) {
            // Les routes admin sont RELATIVES (imbriquées sous /admin) ; les
            // absolues appartiennent au reste de l'application.
            if (! str_starts_with($path, '/')) {
                $routes[] = '/admin/'.$path;
            }
        }

        return $routes;
    }

    public function test_chaque_lien_d_alerte_correspond_a_une_route_declaree(): void
    {
        $source = file_get_contents(app_path('Domain/Admin/DashboardService.php'));
        preg_match_all("/'link' => '([^']+)'/", $source, $matches);

        $this->assertNotEmpty($matches[1], 'aucun lien trouvé : le test ne vérifie plus rien');

        $declared = $this->declaredAdminRoutes();

        foreach ($matches[1] as $link) {
            // La query n'est qu'un filtre : c'est le CHEMIN qui doit exister.
            $path = explode('?', $link)[0];

            $this->assertContains(
                $path,
                $declared,
                "{$path} est produit par DashboardService mais n'a aucune <Route> : "
                .'le routeur retombera sur "*" et affichera la page d\'accueil'
            );
        }
    }

    /**
     * Les routes sont en français. Un chemin anglais est précisément l'erreur
     * qui s'est produite, et elle ne se voit pas à l'exécution.
     */
    public function test_aucun_lien_d_alerte_n_utilise_un_chemin_anglais(): void
    {
        $source = file_get_contents(app_path('Domain/Admin/DashboardService.php'));

        foreach (['/admin/reports', '/admin/content/', '/admin/students', '/admin/subscriptions'] as $english) {
            $this->assertStringNotContainsString(
                "'link' => '{$english}",
                $source,
                "{$english} n'existe pas : les routes d'administration sont en français"
            );
        }
    }
}
