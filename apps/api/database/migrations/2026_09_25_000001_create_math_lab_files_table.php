<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Les FICHIERS du مختبر الرياضيات : ce qu'un élève ajoute à une سبّورة —
// une image, un SVG, un PDF. Une ligne par fichier, rattachée à UN document
// et à UN propriétaire ; les octets sont sur le disque privé
// (MathLabFileService). Les quotas (3 par document, 50 par élève, 1 Mo par
// fichier — MathLabFilePolicy) se comptent sur cette table.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('math_lab_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_id')->constrained('math_lab_documents')->cascadeOnDelete();

            // image | svg | pdf — ce que l'outil sait en faire (poser sur la
            // سبّورة, ou seulement télécharger).
            $table->string('kind', 16);
            $table->string('original_name', 255);
            // Le type RÉEL, lu dans le contenu — jamais celui du navigateur.
            $table->string('mime_type', 100);
            $table->unsignedInteger('size');
            $table->string('disk_path', 255);

            $table->timestamps();

            $table->index('user_id');
            $table->index('document_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('math_lab_files');
    }
};
