<?php

namespace App\Domain\Progress\Support;

/**
 * Confidence model for lesson-assessment evidence — deliberately a SEPARATE,
 * parallel class from Diagnostic\Support\MasteryModel, not an import of it:
 * the Diagnostic module is self-contained by design (nothing outside reaches
 * in, nothing inside reaches out), and this module honors the same boundary
 * in reverse. The numeric thresholds are intentionally the same values so
 * 'mastered'/'reinforce'/'gap' means one consistent thing app-wide; if the
 * two models ever need to diverge (lesson evidence has different dynamics
 * than a one-shot diagnostic), they can, independently.
 *
 * Every method is a pure function — unit-testable without a database, and
 * these constants are the complete documented spec of how lesson mastery is
 * decided.
 */
class MasteryModel
{
    public const MASTERED_THRESHOLD = 0.70;

    public const GAP_THRESHOLD = 0.40;

    public const STARTING_CONFIDENCE = 0.5;

    public const LEARNING_RATE = 0.22;

    /**
     * Le test final ne porte pas de note de difficulté 1..4 (contrairement à
     * la banque du diagnostic) : chacune de ses preuves pèse comme un point
     * de difficulté moyenne. Le moteur de pratique, lui, EN PORTE une — son
     * niveau 1..5 — et la fait passer par ProgressEngine, exactement comme
     * ce commentaire le prescrivait depuis l'origine.
     */
    public const DEFAULT_DIFFICULTY = 2;

    /**
     * Pondérations de la valeur probante. Toutes MULTIPLICATIVES et toutes
     * égales à 1,0 à leur valeur par défaut : le test final produit donc
     * exactement les mêmes nombres qu'avant cette extension. C'est la
     * propriété que verrouille testLegacyDefaultsReproduceHistoricalFormula.
     */

    /** Une moitié de réponse juste vaut une moitié de preuve. */
    public const PARTIAL_WEIGHT = 0.5;

    /** Un point secondaire n'est qu'effleuré par la question : il pèse moins. */
    public const SECONDARY_WEIGHT = 0.5;

    /**
     * La pratique compte un peu moins que le test final : pas parce qu'elle
     * vaudrait moins, mais parce qu'elle se fait avec indices, sans limite de
     * tentatives et sans les conditions d'une évaluation.
     */
    public const PRACTICE_WEIGHT = 0.9;

    /**
     * Un indice réduit la valeur d'une réussite AUTONOME — il ne la rend
     * jamais négative. « Using a hint is not itself a failure » (cible §12) :
     * réussir après trois indices reste une progression, petite mais réelle.
     * Et ce facteur ne s'applique JAMAIS à un échec : avoir demandé de l'aide
     * ne doit pas aggraver la sanction.
     */
    public const HINT_DECAY = [1 => 0.7, 2 => 0.5, 3 => 0.4];

    /** Sources de preuve reconnues. */
    public const SOURCE_ASSESSMENT = 'assessment';

    public const SOURCE_PRACTICE = 'practice_exercise';

    /**
     * Chaque paramètre ajouté après $difficulty a une valeur par défaut qui
     * REPRODUIT le comportement d'avant l'arrivée du moteur de pratique. Un
     * appel à trois arguments — celui du test final — donne donc le nombre
     * exact qu'il donnait hier, et les onze cas de LearningEvidenceFlowTest
     * passent sans qu'une ligne du fichier de test ne change.
     *
     * @param  string  $outcome  L'une des six issues de la cible §11. Une erreur
     *                           de syntaxe ou un abandon n'arrive jamais jusqu'ici :
     *                           ProgressEngine les écarte avant, parce qu'ils ne
     *                           portent aucune information mathématique.
     */
    public static function updateConfidence(
        float $confidence,
        bool $isCorrect,
        int $difficulty = self::DEFAULT_DIFFICULTY,
        int $hintsUsed = 0,
        string $source = self::SOURCE_ASSESSMENT,
        string $role = 'primary',
        ?string $outcome = null,
    ): float {
        $difficultyWeight = max(1, min(4, $difficulty)) / 4; // 0.25 .. 1.0

        // Le socle, inchangé : le signe vient d'ici, et de nulle part ailleurs.
        $delta = $isCorrect
            ? self::LEARNING_RATE * (0.3 + 0.7 * $difficultyWeight)
            : -self::LEARNING_RATE * (0.3 + 0.7 * (1 - $difficultyWeight));

        $modifier = 1.0;
        if ($outcome === 'partially_correct') {
            $modifier *= self::PARTIAL_WEIGHT;
        }
        if ($role === 'secondary') {
            $modifier *= self::SECONDARY_WEIGHT;
        }
        if ($source === self::SOURCE_PRACTICE) {
            $modifier *= self::PRACTICE_WEIGHT;
        }
        // Garde délibérée sur $isCorrect : les indices n'amplifient jamais un
        // échec. Ils ne pondèrent que la valeur d'une réussite.
        if ($isCorrect && $hintsUsed > 0) {
            $modifier *= self::HINT_DECAY[min($hintsUsed, 3)] ?? 0.4;
        }

        // Le modificateur agit sur l'AMPLITUDE ; le signe reste celui du socle.
        return round(max(0.0, min(1.0, $confidence + $delta * $modifier)), 3);
    }

    /**
     * 'mastered' | 'reinforce' | 'gap' — same three bands (and the same
     * numbers) as the diagnostic, so a profile mixing both sources reads
     * consistently. 'unassessed' is the row default before any evidence.
     */
    public static function statusFor(float $confidence): string
    {
        if ($confidence >= self::MASTERED_THRESHOLD) {
            return 'mastered';
        }
        if ($confidence < self::GAP_THRESHOLD) {
            return 'gap';
        }

        return 'reinforce';
    }
}
