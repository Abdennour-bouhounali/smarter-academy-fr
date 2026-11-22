<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Un document du مختبر الرياضيات : le travail d'un élève dans UN instrument
 * (سبّورة, et demain d'autres). `tool` nomme l'instrument, `data` porte son
 * état sérialisé — opaque pour le serveur, versionné par `schema_version`.
 *
 * `summary` est le résumé que l'INSTRUMENT fait de ce même état : assez
 * petit pour voyager dans une liste, assez riche pour qu'une carte de
 * « أعمالي » dessine un aperçu et que la recherche morde dessus. Le serveur
 * ne l'interprète pas davantage que `data` ; il en borne seulement la taille.
 */
class MathLabDocument extends Model
{
    protected $fillable = [
        'user_id',
        'tool',
        'title',
        'schema_version',
        'data',
        'data_bytes',
        'summary',
        'is_favorite',
    ];

    protected $casts = [
        'schema_version' => 'integer',
        'data' => 'array',
        'data_bytes' => 'integer',
        // Le RÉSUMÉ que l'instrument fait de son document : ce que « أعمالي »
        // dessine et cherche, sans jamais ouvrir `data`. Nul sur un document
        // antérieur au résumé — la carte a un aperçu de repli.
        'summary' => 'array',
        'is_favorite' => 'boolean',
    ];

    /** Les colonnes d'une LISTE : tout sauf `data`, qui peut peser lourd. */
    public const SUMMARY_COLUMNS = ['id', 'user_id', 'tool', 'title', 'schema_version', 'data_bytes', 'summary', 'is_favorite', 'created_at', 'updated_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
