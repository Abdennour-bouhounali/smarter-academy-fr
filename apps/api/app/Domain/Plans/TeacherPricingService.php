<?php

namespace App\Domain\Plans;

use App\Models\PlanPricingTier;
use App\Models\PlanVersion;
use DomainException;
use Illuminate\Support\Collection;

/**
 * Le PRIX d'une offre enseignant, par sièges élèves — la seule autorité.
 *
 *     nombre d'élèves choisi
 *            ↓
 *     le palier de la VERSION qui le couvre     (plan_pricing_tiers)
 *            ↓
 *     prix unitaire × nombre = total             (informatif, en dinars)
 *
 * Rien ici n'est un nombre en dur : la grille vient de la base, versionnée
 * avec l'offre. Le client peut afficher le même calcul pour le confort ;
 * il n'est jamais cru — une demande ou une activation recalcule ici, à
 * partir de la version figée qu'elle référence.
 *
 * La grille est validée AVANT d'être écrite : les paliers actifs doivent
 * être continus (ni chevauchement, ni trou), commencer à un nombre positif,
 * porter un prix positif ou nul, et un seul d'entre eux peut couvrir un
 * nombre donné.
 */
class TeacherPricingService
{
    /** @return Collection<int, PlanPricingTier> */
    public function tiersFor(PlanVersion $version, bool $activeOnly = true): Collection
    {
        $tiers = $version->relationLoaded('pricingTiers') ? $version->pricingTiers : $version->pricingTiers()->get();

        return $tiers
            ->when($activeOnly, fn (Collection $c) => $c->filter(fn (PlanPricingTier $t) => $t->is_active))
            ->sortBy([['sort_order', 'asc'], ['min_students', 'asc']])
            ->values();
    }

    public function applicableTier(PlanVersion $version, int $students): ?PlanPricingTier
    {
        return $this->tiersFor($version)->first(fn (PlanPricingTier $t) => $t->covers($students));
    }

    /**
     * Le devis : palier, prix unitaire, total. Refuse un nombre qu'aucun
     * palier ne couvre — la grille dit ce qui se vend.
     *
     * @return array{students: int, tier: array<string, mixed>, unitPriceCents: int, totalCents: int, currency: string, free: bool}
     *
     * @throws DomainException
     */
    public function quote(PlanVersion $version, int $students): array
    {
        if ($students < 1) {
            throw new DomainException('Le nombre d\'élèves doit être d\'au moins 1.');
        }

        $tier = $this->applicableTier($version, $students);
        if ($tier === null) {
            throw new DomainException("Aucun palier de cette offre ne couvre {$students} élève(s).");
        }

        $unit = $tier->price_per_student_cents;

        return [
            'students' => $students,
            'tier' => self::serializeTier($tier),
            'unitPriceCents' => $unit,
            'totalCents' => $unit * $students,
            'currency' => $tier->currency,
            'free' => $unit === 0,
        ];
    }

    /**
     * Normalise et valide une grille venue de l'administration.
     *
     * @param  array<int, array<string, mixed>>  $rows  camelCase (minStudents, maxStudents, pricePerStudentCents, currency, isActive, sortOrder)
     * @return array<int, array{min_students: int, max_students: ?int, price_per_student_cents: int, currency: string, sort_order: int, is_active: bool}>
     *
     * @throws DomainException la première liste de problèmes, jointe
     */
    public function validateTiers(array $rows): array
    {
        $normalized = $this->normalize($rows);
        $problems = $this->problems($normalized);
        if ($problems !== []) {
            throw new DomainException(implode(' ', $problems));
        }

        return $normalized;
    }

    /**
     * Les problèmes d'une grille normalisée — vide si elle est saine.
     *
     * @param  array<int, array{min_students: int, max_students: ?int, price_per_student_cents: int, currency: string, sort_order: int, is_active: bool}>  $tiers
     * @return array<int, string>
     */
    public function problems(array $tiers): array
    {
        $problems = [];

        foreach ($tiers as $i => $t) {
            $n = $i + 1;
            if ($t['min_students'] < 1) {
                $problems[] = "Palier {$n} : le minimum doit être d'au moins 1 élève.";
            }
            if ($t['max_students'] !== null && $t['max_students'] < $t['min_students']) {
                $problems[] = "Palier {$n} : le maximum ({$t['max_students']}) est inférieur au minimum ({$t['min_students']}).";
            }
            if ($t['price_per_student_cents'] < 0) {
                $problems[] = "Palier {$n} : le prix par élève ne peut pas être négatif.";
            }
            if (! preg_match('/^[A-Z]{3}$/', $t['currency'])) {
                $problems[] = "Palier {$n} : devise invalide.";
            }
        }

        // La continuité ne concerne que les paliers ACTIFS, dans l'ordre des minimums.
        $active = array_values(array_filter($tiers, fn ($t) => $t['is_active']));
        usort($active, fn ($a, $b) => $a['min_students'] <=> $b['min_students']);

        foreach ($active as $i => $t) {
            if ($i === 0) {
                continue;
            }
            $prev = $active[$i - 1];
            if ($prev['max_students'] === null) {
                $problems[] = "Le palier « {$prev['min_students']}+ » est sans borne : aucun palier ne peut le suivre.";

                continue;
            }
            if ($t['min_students'] <= $prev['max_students']) {
                $problems[] = "Les paliers « {$prev['min_students']}–{$prev['max_students']} » et « ".self::labelOf($t).' » se chevauchent.';
            } elseif ($t['min_students'] !== $prev['max_students'] + 1) {
                $from = $prev['max_students'] + 1;
                $to = $t['min_students'] - 1;
                $problems[] = 'Aucun palier ne couvre '.($from === $to ? "{$from} élève(s)" : "de {$from} à {$to} élèves").'.';
            }
        }

        return array_values(array_unique($problems));
    }

    /** @return array<string, mixed> */
    public static function serializeTier(PlanPricingTier $t): array
    {
        return [
            'id' => $t->id,
            'minStudents' => $t->min_students,
            'maxStudents' => $t->max_students,
            'pricePerStudentCents' => $t->price_per_student_cents,
            'currency' => $t->currency,
            'sortOrder' => $t->sort_order,
            'isActive' => $t->is_active,
            'label' => $t->label(),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @return array<int, array{min_students: int, max_students: ?int, price_per_student_cents: int, currency: string, sort_order: int, is_active: bool}>
     */
    private function normalize(array $rows): array
    {
        $out = [];
        foreach (array_values($rows) as $i => $row) {
            if (! is_array($row)) {
                throw new DomainException('Palier invalide.');
            }
            $min = $row['minStudents'] ?? $row['min_students'] ?? null;
            $max = $row['maxStudents'] ?? $row['max_students'] ?? null;
            $price = $row['pricePerStudentCents'] ?? $row['price_per_student_cents'] ?? 0;

            if (! is_numeric($min) || (int) $min != $min) {
                throw new DomainException('Palier '.($i + 1).' : minimum invalide.');
            }
            if ($max !== null && $max !== '' && ! is_numeric($max)) {
                throw new DomainException('Palier '.($i + 1).' : maximum invalide.');
            }
            if (! is_numeric($price)) {
                throw new DomainException('Palier '.($i + 1).' : prix invalide.');
            }

            $out[] = [
                'min_students' => (int) $min,
                'max_students' => ($max === null || $max === '') ? null : (int) $max,
                'price_per_student_cents' => (int) $price,
                'currency' => strtoupper((string) ($row['currency'] ?? 'DZD')),
                'sort_order' => (int) ($row['sortOrder'] ?? $row['sort_order'] ?? $i),
                'is_active' => filter_var($row['isActive'] ?? $row['is_active'] ?? true, FILTER_VALIDATE_BOOL),
            ];
        }

        return $out;
    }

    /** @param array{min_students: int, max_students: ?int} $t */
    private static function labelOf(array $t): string
    {
        return $t['max_students'] === null ? $t['min_students'].'+' : $t['min_students'].'–'.$t['max_students'];
    }
}
