<?php

namespace App\Models;

/**
 * Le vocabulaire de publication, partagé par les trois niveaux de contenu
 * (leçon, module, exercice). Un seul endroit définit les états et ce qui est
 * visible par l'élève — sinon « caché » finirait par vouloir dire trois
 * choses différentes selon la table.
 */
trait Publishable
{
    public const PUB_DRAFT = 'draft';

    public const PUB_PUBLISHED = 'published';

    public const PUB_HIDDEN = 'hidden';

    public const PUB_ARCHIVED = 'archived';

    /** Tous les états acceptés par l'API d'administration. */
    public const PUBLICATION_STATUSES = [
        self::PUB_DRAFT,
        self::PUB_PUBLISHED,
        self::PUB_HIDDEN,
        self::PUB_ARCHIVED,
    ];

    /**
     * Le SEUL état qui ouvre l'accès à l'élève. Écrit en liste blanche
     * (« publié » ouvre) et non en liste noire (« archivé ferme ») : un
     * futur état inconnu sera fermé par défaut, jamais ouvert par oubli.
     */
    public function isVisibleToStudents(): bool
    {
        return $this->publication_status === self::PUB_PUBLISHED;
    }

    public function scopeVisibleToStudents($query)
    {
        return $query->where('publication_status', self::PUB_PUBLISHED);
    }
}
