<?php

namespace App\Console\Commands;

use App\Domain\Progress\Engine\EvidenceEvent;
use App\Domain\Progress\EvidenceClassifier;
use App\Domain\Progress\Outcome;
use App\Domain\Progress\PriorFacts;
use App\Models\LearningEvidence;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Complète les colonnes Mastery V2 des preuves ANTÉRIEURES à la V2 —
 * item_key, outcome, difficulty, attempt_number, demonstration_kind,
 * evaluated_by — de façon déterministe, dans l'ordre d'arrivée, et sans
 * jamais réécrire une colonne déjà renseignée (LearningEvidence::allowBackfill).
 *
 * Rien n'est inventé : une preuve dont la leçon a disparu ou dont le code de
 * question ne se lit pas est SIGNALÉE, et la commande s'arrête sans écrire
 * (sauf --force, qui écrit les lignes résolubles et laisse les autres nulles).
 *
 *   php artisan smarter:evidence:backfill --dry-run
 *   php artisan smarter:evidence:backfill
 */
class EvidenceBackfill extends Command
{
    protected $signature = 'smarter:evidence:backfill
        {--dry-run : Compter et signaler, sans écrire}
        {--force : Écrire les lignes résolubles même si d\'autres ne le sont pas}
        {--chunk=500 : Taille des lots de lecture}';

    protected $description = 'Complète item_key / outcome / difficulty / attempt_number / demonstration_kind / evaluated_by sur les preuves existantes.';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $report = ['found' => 0, 'changed' => 0, 'complete' => 0, 'unresolved' => [], 'ambiguous' => [], 'errors' => []];
        $plan = []; // id → colonnes à remplir

        /** @var array<string, array{rows: int, nonInert: int, success: bool}> $itemFacts (clé "user|item") */
        $itemFacts = [];
        /** @var array<string, array{nonInert: int, success: bool}> $templateFacts */
        $templateFacts = [];

        $query = LearningEvidence::query()
            ->join('lessons', 'lessons.id', '=', 'learning_evidence.lesson_id')
            ->orderBy('learning_evidence.submitted_at')->orderBy('learning_evidence.id')
            ->select('learning_evidence.*', 'lessons.code as lesson_code');

        foreach ($query->lazy((int) $this->option('chunk')) as $row) {
            $report['found']++;
            $fill = [];

            $type = $row->assessment_type ?? EvidenceEvent::SOURCE_ASSESSMENT;
            $itemKey = $row->item_key;
            if ($itemKey === null) {
                if ($row->lesson_code === null) {
                    $report['unresolved'][] = ['id' => $row->id, 'reason' => 'leçon introuvable'];

                    continue;
                }
                $identity = EvidenceClassifier::identityFromQuestionCode($type, $row->lesson_code, (string) $row->question_code);
                if ($identity['sourceKind'] === EvidenceClassifier::SOURCE_PRACTICE && $identity['exerciseCode'] === null) {
                    // Une preuve de pratique sans exercice dans son code : on
                    // peut bâtir une clé, mais elle ne rejoindra pas le registre.
                    $report['ambiguous'][] = ['id' => $row->id, 'questionCode' => $row->question_code, 'reason' => 'code de question de pratique sans exercice'];
                }
                $itemKey = $identity['itemKey'];
                $fill['item_key'] = $itemKey;
            }

            $outcome = Outcome::fromLegacy($row->outcome, (bool) $row->is_correct);
            if ($row->outcome === null) {
                $fill['outcome'] = $outcome->value;
            }

            if ($row->difficulty === null) {
                $fill['difficulty'] = $row->level !== null
                    ? (int) $row->level
                    : (int) config('mastery.engines.2.default_difficulty', 3);
            }

            $templateKey = $row->template_key;
            $userItem = "{$row->user_id}|{$itemKey}";
            $item = $itemFacts[$userItem] ?? ['rows' => 0, 'nonInert' => 0, 'success' => false];
            $template = $templateKey !== null
                ? ($templateFacts["{$row->user_id}|{$templateKey}"] ?? ['nonInert' => 0, 'success' => false])
                : ['nonInert' => $item['nonInert'], 'success' => $item['success']];
            $classification = EvidenceClassifier::classifyFrom(new PriorFacts(
                $item['rows'], $item['nonInert'], $item['success'], $template['nonInert'], $template['success'],
            ));
            if ($row->attempt_number === null) {
                $fill['attempt_number'] = $classification['attemptNumber'];
            }
            if ($row->demonstration_kind === null) {
                $fill['demonstration_kind'] = $classification['demonstrationKind'];
            }
            if ($row->evaluated_by === null) {
                $fill['evaluated_by'] = EvidenceEvent::EVALUATED_BY_CLIENT_LEGACY;
            }

            // Les faits avancent pour la preuve suivante.
            $item['rows']++;
            if (! $outcome->isInert()) {
                $item['nonInert']++;
                $item['success'] = $item['success'] || $outcome->isSuccess();
                if ($templateKey !== null) {
                    $template['nonInert']++;
                    $template['success'] = $template['success'] || $outcome->isSuccess();
                    $templateFacts["{$row->user_id}|{$templateKey}"] = $template;
                }
            }
            $itemFacts[$userItem] = $item;

            if ($fill === []) {
                $report['complete']++;
            } else {
                $plan[$row->id] = $fill;
                $report['changed']++;
            }
        }

        $this->table(['trouvées', 'à compléter', 'déjà complètes', 'irrésolubles', 'ambiguës'], [[
            $report['found'], $report['changed'], $report['complete'], count($report['unresolved']), count($report['ambiguous']),
        ]]);
        foreach ($report['unresolved'] as $u) {
            $this->warn("  irrésoluble #{$u['id']} : {$u['reason']}");
        }
        foreach ($report['ambiguous'] as $a) {
            $this->warn("  ambiguë #{$a['id']} ({$a['questionCode']}) : {$a['reason']}");
        }

        if ($dryRun) {
            $this->info('Dry run — rien n\'a été écrit.');

            return self::SUCCESS;
        }

        if ($report['unresolved'] !== [] && ! $this->option('force')) {
            $this->error('Des preuves ne peuvent pas être complétées sans invention. Corrigez-les, ou relancez avec --force pour compléter les autres.');

            return self::FAILURE;
        }

        LearningEvidence::allowBackfill(function () use ($plan) {
            foreach (array_chunk($plan, 200, true) as $chunk) {
                DB::transaction(function () use ($chunk) {
                    foreach ($chunk as $id => $fill) {
                        $evidence = LearningEvidence::find($id);
                        if ($evidence !== null) {
                            $evidence->fill($fill)->save();
                        }
                    }
                });
            }
        });

        $this->info("{$report['changed']} preuve(s) complétée(s).");

        return self::SUCCESS;
    }
}
